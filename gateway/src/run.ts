import { EventType, PROTOCOL_VERSION } from '@ag-ui/core';
import { buildOutboundPrompt } from './prompt.ts';
import { LaneRejection, textHasDeniedMarker, type Allowlist, type DeniedContainer, type Transport } from './lane.ts';
import { decideConsequential, type ConsequentialTool, type ResumeAttempt } from './interrupt.ts';
import { anthropicMessageRequest, readAnthropicText } from './providers/anthropic.ts';
import { postJson } from './providers/http.ts';
import { lmstudioChatRequest } from './providers/lmstudio.ts';
import { openaiChatRequest, readOpenAIText, type ProviderEndpoint } from './providers/openai.ts';
import { xaiChatRequest } from './providers/xai.ts';
import type { ProviderName } from './config.ts';

export interface RunEvent {
  type: string;
  threadId?: string;
  runId?: string;
  protocolVersion?: string;
  message?: string;
  code?: string;
  messageId?: string;
  role?: string;
  delta?: string;
  outcome?: {
    type?: string;
    interrupts?: { id: string; reason: string; toolCallId: string }[];
  };
  input?: unknown;
}

export interface GatewayDeps {
  allowlist: Allowlist;
  denylist: readonly DeniedContainer[];
  pageTransport: Transport;
  providers: Partial<Record<ProviderName, ProviderEndpoint>>;
  consequentialTools: readonly ConsequentialTool[];
  proposeTool: string | null;
  issuedInterrupts: Map<string, { tool: string }>;
  retrievedAt: string;
}

const PROVIDERS = new Set<ProviderName>(['gpt', 'claude', 'grok', 'lmstudio']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function contentText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content.map((part) => {
    if (typeof part === 'string') return part;
    if (isRecord(part) && typeof part.text === 'string') return part.text;
    return '';
  }).join('');
}

function transcript(messages: unknown): string {
  if (!Array.isArray(messages)) return '';
  const lines: string[] = [];
  for (const message of messages) {
    if (!isRecord(message)) continue;
    if (message.role !== 'user' && message.role !== 'assistant') continue;
    lines.push(contentText(message.content));
  }
  return lines.join('\n');
}

function resumeOf(value: unknown): ResumeAttempt[] {
  if (!Array.isArray(value)) return [];
  const attempts: ResumeAttempt[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) continue;
    attempts.push({
      interruptId: typeof entry.interruptId === 'string' ? entry.interruptId : '',
      status: typeof entry.status === 'string' ? entry.status : '',
      payload: entry.payload,
    });
  }
  return attempts;
}

function providerName(value: unknown): ProviderName | null {
  if (!isRecord(value) || typeof value.provider !== 'string') return null;
  return PROVIDERS.has(value.provider as ProviderName) ? value.provider as ProviderName : null;
}

function started(threadId: string, runId: string): RunEvent {
  return { type: EventType.RUN_STARTED, threadId, runId, protocolVersion: PROTOCOL_VERSION };
}

function failed(threadId: string, runId: string, message: string, code: string): RunEvent[] {
  return [started(threadId, runId), { type: EventType.RUN_ERROR, message, code }];
}

function textReply(threadId: string, runId: string, text: string): RunEvent[] {
  const messageId = `msg-${runId}`;
  return [
    started(threadId, runId),
    { type: EventType.TEXT_MESSAGE_START, messageId, role: 'assistant' },
    { type: EventType.TEXT_MESSAGE_CONTENT, messageId, delta: text },
    { type: EventType.TEXT_MESSAGE_END, messageId },
    { type: EventType.RUN_FINISHED, threadId, runId, outcome: { type: 'success' } },
  ];
}

function providerProblem(name: ProviderName, endpoint: ProviderEndpoint | undefined): string | null {
  if (name === 'lmstudio') {
    if (!endpoint?.baseUrl) return 'LM Studio base URL is not configured';
    if (!endpoint.model) return 'LM Studio model id is not configured';
    try {
      if (new URL(endpoint.baseUrl).hostname !== '127.0.0.1') return 'LM Studio base URL must use 127.0.0.1';
    } catch {
      return 'LM Studio base URL is not configured';
    }
    return null;
  }
  const key = name === 'gpt' ? 'OPENAI_API_KEY' : name === 'claude' ? 'ANTHROPIC_API_KEY' : 'XAI_API_KEY';
  if (!endpoint?.apiKey) return `${key} is not set`;
  if (!endpoint.model) return `${name} model id is not configured`;
  if (!endpoint.baseUrl) return `${name} base URL is not configured`;
  return null;
}

function requestFor(name: ProviderName, endpoint: ProviderEndpoint, prompt: string) {
  if (name === 'claude') return anthropicMessageRequest(endpoint, prompt);
  if (name === 'grok') return xaiChatRequest(endpoint, prompt);
  if (name === 'lmstudio') return lmstudioChatRequest(endpoint, prompt);
  return openaiChatRequest(endpoint, prompt);
}

function replyText(name: ProviderName, payload: unknown): string | null {
  return name === 'claude' ? readAnthropicText(payload) : readOpenAIText(payload);
}

export async function handleRun(raw: unknown, deps: GatewayDeps): Promise<RunEvent[]> {
  const body = isRecord(raw) ? raw : {};
  const threadId = typeof body.threadId === 'string' ? body.threadId : '';
  const runId = typeof body.runId === 'string' ? body.runId : '';
  if (threadId.length === 0 || runId.length === 0) {
    return [{ type: EventType.RUN_ERROR, message: 'threadId and runId are required', code: 'bad-request' }];
  }

  const name = providerName(body.forwardedProps);
  if (!name) {
    return failed(threadId, runId, 'Provider must be gpt, claude, grok, or lmstudio', 'bad-provider');
  }

  // tools, context, and forwarded page ids are client input. They are not read.
  const userText = transcript(body.messages);
  if (textHasDeniedMarker(userText, deps.denylist)) {
    return failed(threadId, runId, 'Lane rejection: marker-in-prompt', 'marker-in-prompt');
  }

  const proposed = deps.consequentialTools.find((tool) => tool.name === deps.proposeTool);
  if (proposed) {
    const decision = await decideConsequential({
      tool: proposed.name,
      tools: deps.consequentialTools,
      resume: resumeOf(body.resume),
      issued: deps.issuedInterrupts,
    });
    if (decision.kind === 'interrupt') {
      return [
        started(threadId, runId),
        {
          type: EventType.RUN_FINISHED,
          threadId,
          runId,
          outcome: {
            type: 'interrupt',
            interrupts: [{ id: decision.interruptId, reason: 'approval', toolCallId: decision.toolCallId }],
          },
        },
      ];
    }
    if (textHasDeniedMarker(decision.output, deps.denylist)) {
      return failed(threadId, runId, 'Lane rejection: marker-in-prompt', 'marker-in-prompt');
    }
    return textReply(threadId, runId, decision.output);
  }

  let prompt: string;
  try {
    const built = await buildOutboundPrompt({
      userText,
      clientRequestedPageIds: [],
      allowlist: deps.allowlist,
      denylist: deps.denylist,
      transport: deps.pageTransport,
      retrievedAt: deps.retrievedAt,
    });
    prompt = built.body;
  } catch (error) {
    if (error instanceof LaneRejection) return failed(threadId, runId, error.message, error.code);
    return failed(threadId, runId, 'Lane rejection: marker-in-prompt', 'marker-in-prompt');
  }

  const endpoint = deps.providers[name];
  const problem = providerProblem(name, endpoint);
  if (problem || !endpoint) return failed(threadId, runId, problem ?? 'Provider is not configured', 'missing-key');

  const request = requestFor(name, endpoint, prompt);
  let payload: unknown;
  try {
    payload = await postJson(request.url, request.headers, request.body);
  } catch {
    return failed(threadId, runId, 'Provider request failed', 'provider-failed');
  }

  const reply = replyText(name, payload);
  if (reply == null) return failed(threadId, runId, 'Provider returned no text', 'provider-failed');
  if (textHasDeniedMarker(reply, deps.denylist)) {
    return failed(threadId, runId, 'Lane rejection: marker-in-prompt', 'marker-in-prompt');
  }
  return textReply(threadId, runId, reply);
}
