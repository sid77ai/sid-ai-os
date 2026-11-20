export interface ConsequentialTool {
  name: string;
  execute: () => string | Promise<string>;
}

export interface ResumeAttempt {
  interruptId: string;
  status: string;
  payload: unknown;
}

export type ConsequentialDecision =
  | { kind: 'interrupt'; interruptId: string; toolCallId: string }
  | { kind: 'output'; output: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * The gateway is the only issuer of interrupt ids. A resume executes a
 * consequential tool only when it names an id this process issued for that
 * tool and the payload is an explicit approval.
 */
export async function decideConsequential(input: {
  tool: string;
  tools: readonly ConsequentialTool[];
  resume: readonly ResumeAttempt[];
  issued: Map<string, { tool: string }>;
}): Promise<ConsequentialDecision> {
  const approved = input.resume.find((entry) => {
    const known = input.issued.get(entry.interruptId);
    return known?.tool === input.tool
      && entry.status === 'resolved'
      && isRecord(entry.payload)
      && entry.payload.approved === true;
  });

  if (approved) {
    input.issued.delete(approved.interruptId);
    const tool = input.tools.find((item) => item.name === input.tool);
    const output = tool ? await tool.execute() : '';
    return { kind: 'output', output };
  }

  let interruptId = '';
  for (const [id, value] of input.issued) {
    if (value.tool === input.tool) {
      interruptId = id;
      break;
    }
  }
  if (interruptId.length === 0) {
    interruptId = crypto.randomUUID();
    input.issued.set(interruptId, { tool: input.tool });
  }
  return { kind: 'interrupt', interruptId, toolCallId: `call-${interruptId}` };
}
