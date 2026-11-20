import type { ProviderEndpoint } from './providers/openai.ts';

export type ProviderName = 'gpt' | 'claude' | 'grok' | 'lmstudio';

export interface GatewayConfig {
  host: '127.0.0.1';
  port: number;
  providers: Record<ProviderName, ProviderEndpoint>;
}

const CLOUD_BASE_URLS: Record<Exclude<ProviderName, 'lmstudio'>, string> = {
  gpt: 'https://api.openai.com/v1',
  claude: 'https://api.anthropic.com',
  grok: 'https://api.x.ai/v1',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function modelOf(fileProviders: Record<string, unknown>, name: string, env: NodeJS.ProcessEnv, envKey: string): string {
  const fromEnv = env[envKey];
  if (typeof fromEnv === 'string' && fromEnv.length > 0) return fromEnv;
  const entry = fileProviders[name];
  if (isRecord(entry) && typeof entry.model === 'string') return entry.model;
  return '';
}

export function loadGatewayConfig(input: { env: NodeJS.ProcessEnv; file: unknown }): GatewayConfig {
  const file = isRecord(input.file) ? input.file : {};
  const fileProviders = isRecord(file.providers) ? file.providers : {};
  const lmEntry = isRecord(fileProviders.lmstudio) ? fileProviders.lmstudio : {};
  const lmFromEnv = input.env.LMSTUDIO_BASE_URL;
  const lmBase = typeof lmFromEnv === 'string' && lmFromEnv.length > 0
    ? lmFromEnv
    : typeof lmEntry.baseUrl === 'string'
      ? lmEntry.baseUrl
      : '';

  return {
    host: '127.0.0.1',
    port: typeof file.port === 'number' ? file.port : 8787,
    providers: {
      gpt: { baseUrl: CLOUD_BASE_URLS.gpt, model: modelOf(fileProviders, 'gpt', input.env, 'GPT_MODEL'), apiKey: input.env.OPENAI_API_KEY ?? '' },
      claude: { baseUrl: CLOUD_BASE_URLS.claude, model: modelOf(fileProviders, 'claude', input.env, 'CLAUDE_MODEL'), apiKey: input.env.ANTHROPIC_API_KEY ?? '' },
      grok: { baseUrl: CLOUD_BASE_URLS.grok, model: modelOf(fileProviders, 'grok', input.env, 'GROK_MODEL'), apiKey: input.env.XAI_API_KEY ?? '' },
      lmstudio: { baseUrl: lmBase, model: modelOf(fileProviders, 'lmstudio', input.env, 'LMSTUDIO_MODEL'), apiKey: undefined },
    },
  };
}
