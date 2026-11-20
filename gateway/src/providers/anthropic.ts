import { joinUrl } from './http.ts';
import type { ProviderEndpoint } from './openai.ts';

/**
 * Anthropic's Messages API has no request-level retention flag. The adapter
 * sends model, max_tokens, and messages, and nothing named store.
 */
export function anthropicMessageRequest(endpoint: ProviderEndpoint, prompt: string): {
  url: URL;
  headers: Record<string, string>;
  body: { model: string; max_tokens: number; messages: { role: 'user'; content: string }[] };
} {
  return {
    url: joinUrl(endpoint.baseUrl, 'v1/messages'),
    headers: {
      'x-api-key': endpoint.apiKey ?? '',
      'anthropic-version': '2023-06-01',
    },
    body: {
      model: endpoint.model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    },
  };
}

export function readAnthropicText(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object' || !('content' in payload)) return null;
  const content = payload.content;
  if (!Array.isArray(content)) return null;
  for (const block of content) {
    if (block && typeof block === 'object' && 'text' in block && block.type === 'text' && typeof block.text === 'string') {
      return block.text;
    }
  }
  return null;
}
