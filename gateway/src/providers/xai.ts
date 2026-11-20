import { openaiChatRequest, type ProviderEndpoint } from './openai.ts';

/** Grok uses the OpenAI-compatible chat request, including `store: false`. */
export function xaiChatRequest(endpoint: ProviderEndpoint, prompt: string) {
  return openaiChatRequest(endpoint, prompt);
}
