import { joinUrl } from './http.ts';

export interface ProviderEndpoint {
  baseUrl: string;
  model: string;
  apiKey?: string;
}

/** OpenAI chat completions. `store: false` keeps the prompt out of vendor retention. */
export function openaiChatRequest(endpoint: ProviderEndpoint, prompt: string): {
  url: URL;
  headers: Record<string, string>;
  body: { model: string; messages: { role: 'user'; content: string }[]; store: false };
} {
  return {
    url: joinUrl(endpoint.baseUrl, 'chat/completions'),
    headers: { authorization: `Bearer ${endpoint.apiKey ?? ''}` },
    body: {
      model: endpoint.model,
      messages: [{ role: 'user', content: prompt }],
      store: false,
    },
  };
}

export function readOpenAIText(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object' || !('choices' in payload)) return null;
  const choices = payload.choices;
  if (!Array.isArray(choices) || !choices[0] || typeof choices[0] !== 'object') return null;
  const message = 'message' in choices[0] ? choices[0].message : undefined;
  if (!message || typeof message !== 'object' || !('content' in message)) return null;
  return typeof message.content === 'string' ? message.content : null;
}
