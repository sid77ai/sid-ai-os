import { openaiChatRequest, type ProviderEndpoint } from './openai.ts';

/**
 * LM Studio speaks OpenAI-compatible chat completions. The base URL and model
 * id come from config. There is no default host. The caller rejects any host
 * other than 127.0.0.1 before this request is built.
 */
export function lmstudioChatRequest(endpoint: ProviderEndpoint, prompt: string) {
  const request = openaiChatRequest(endpoint, prompt);
  return { url: request.url, headers: {} as Record<string, string>, body: request.body };
}
