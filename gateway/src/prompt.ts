import {
  deniedMarkers,
  LaneRejection,
  retrievePages,
  textHasDeniedMarker,
  type Allowlist,
  type DeniedContainer,
  type Transport,
} from './lane.ts';

export interface OutboundPrompt {
  body: string;
  citations: { pageId: string; url: string; retrievedAt: string }[];
}

export async function buildOutboundPrompt(input: {
  userText: string;
  clientRequestedPageIds?: readonly string[];
  toolOutputs?: readonly { name: string; text: string }[];
  toolAllowlist?: readonly string[];
  allowlist: Allowlist;
  denylist: readonly DeniedContainer[];
  transport: Transport;
  retrievedAt: string;
}): Promise<OutboundPrompt> {
  // Page ids supplied by the client or the model are not a retrieval source.
  void input.clientRequestedPageIds;

  if (textHasDeniedMarker(input.userText, input.denylist)) {
    throw new LaneRejection('marker-in-prompt', 'user-text');
  }

  const allowedTools = new Set(input.toolAllowlist ?? []);
  const toolLines: string[] = [];
  for (const output of input.toolOutputs ?? []) {
    if (!allowedTools.has(output.name)) continue;
    if (textHasDeniedMarker(output.text, input.denylist)) continue;
    toolLines.push(output.text);
  }

  const retrieved = await retrievePages({
    pageIds: input.allowlist.entries.map((entry) => entry.id),
    allowlist: input.allowlist,
    denylist: input.denylist,
    transport: input.transport,
    retrievedAt: input.retrievedAt,
  });

  const lines = [input.userText, ''];
  for (const note of toolLines) lines.push(note, '');
  for (const page of retrieved.pages) {
    lines.push(`source ${page.id}`, `url: ${page.url}`, `retrievedAt: ${page.retrievedAt}`, page.excerpt, '');
  }

  const body = lines.join('\n');
  if (deniedMarkers(input.denylist).some((marker) => body.includes(marker))) {
    throw new LaneRejection('marker-in-prompt', 'outbound-body');
  }

  return {
    body,
    citations: retrieved.pages.map((page) => ({
      pageId: page.id,
      url: page.url,
      retrievedAt: page.retrievedAt,
    })),
  };
}
