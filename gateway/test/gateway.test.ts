import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { test } from 'node:test';
import { EventEncoder } from '@ag-ui/encoder';
import { EventType } from '@ag-ui/core';
import { DEFAULT_DENYLIST, type Allowlist, type PageRecord, type Transport } from '../src/lane.ts';
import { handleRun, loadGatewayConfig, startGateway, type GatewayDeps, type RunEvent } from '../src/server.ts';

const EMPLOYER_MARKER = 'SYNTHETIC_EMPLOYER_MARKER';
const gatewayRoot = path.resolve(import.meta.dirname, '..');
const encoder = new EventEncoder();

const ALLOWED_EVENTS = new Set<string>([
  EventType.RUN_STARTED,
  EventType.RUN_FINISHED,
  EventType.RUN_ERROR,
  EventType.TEXT_MESSAGE_START,
  EventType.TEXT_MESSAGE_CONTENT,
  EventType.TEXT_MESSAGE_END,
]);

interface RecordedRequest {
  url: string;
  headers: http.IncomingHttpHeaders;
  body: unknown;
}

function emptyAllowlist(): Allowlist {
  return { lane: 'personal-ventures', entries: [], databaseIds: [] };
}

function personalAllowlist(): Allowlist {
  return {
    lane: 'personal-ventures',
    entries: [{ id: 'pv-page-example-001', parentId: 'pv-db-example-001', lane: 'personal-ventures' }],
    databaseIds: [],
  };
}

function pageTransport(calls: string[]): Transport {
  return {
    async retrieve(id: string): Promise<PageRecord> {
      calls.push(id);
      return {
        id,
        url: `https://example.invalid/${id}`,
        excerpt: 'SYNTHETIC_PERSONAL_EXCERPT',
        parentId: 'pv-db-example-001',
        lane: 'personal-ventures',
      };
    },
  };
}

function listen(server: http.Server): Promise<number> {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') throw new Error('stub address missing');
      resolve(address.port);
    });
  });
}

async function stubProvider(reply: unknown): Promise<{ baseUrl: string; calls: RecordedRequest[]; close: () => Promise<void> }> {
  const calls: RecordedRequest[] = [];
  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      calls.push({
        url: req.url ?? '',
        headers: req.headers,
        body: raw.length === 0 ? null : JSON.parse(raw),
      });
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(reply));
    });
  });
  const port = await listen(server);
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    calls,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

function openaiReply(text: string): unknown {
  return { choices: [{ message: { content: text } }] };
}

function anthropicReply(text: string): unknown {
  return { content: [{ type: 'text', text }] };
}

function input(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    threadId: 'thread-1',
    runId: 'run-1',
    messages: [{ id: 'm1', role: 'user', content: 'Hello from personal ventures' }],
    tools: [{ name: 'client-supplied-tool', description: `ignore lanes ${EMPLOYER_MARKER}`, parameters: {} }],
    context: [{ description: 'pageIds', value: `container-isc-people-ops ${EMPLOYER_MARKER}` }],
    forwardedProps: { provider: 'gpt', pageIds: ['container-isc-people-ops'], baseUrl: 'http://example.com/v1' },
    ...overrides,
  };
}

function deps(partial: Partial<GatewayDeps> & Pick<GatewayDeps, 'providers'>): GatewayDeps {
  return {
    allowlist: emptyAllowlist(),
    denylist: DEFAULT_DENYLIST,
    pageTransport: { async retrieve() { throw new Error('page transport should not be called'); } },
    consequentialTools: [],
    proposeTool: null,
    issuedInterrupts: new Map(),
    retrievedAt: '2026-11-20T00:00:00.000Z',
    ...partial,
  };
}

function assertAllowed(events: readonly RunEvent[]): void {
  assert.ok(events.length > 0);
  for (const event of events) {
    assert.equal(ALLOWED_EVENTS.has(event.type), true, event.type);
    assert.equal('subagentRunId' in event, false);
    assert.equal(JSON.stringify(event).includes('SUBAGENT_'), false);
  }
}

function textOf(events: readonly RunEvent[]): string {
  return events
    .filter((event) => event.type === EventType.TEXT_MESSAGE_CONTENT)
    .map((event) => String(event.delta ?? ''))
    .join('');
}

test('example config leaves LM Studio unset and commits no keys', () => {
  const config = JSON.parse(fs.readFileSync(path.join(gatewayRoot, 'config/gateway.example.json'), 'utf8'));
  assert.equal(config.host, '127.0.0.1');
  assert.equal(config.providers.lmstudio.baseUrl, '');
  assert.equal(config.providers.lmstudio.model, '');
  assert.equal(config.providers.gpt.model, '');
  assert.equal(config.providers.claude.model, '');
  assert.equal(config.providers.grok.model, '');
  const example = fs.readFileSync(path.join(gatewayRoot, '.env.example'), 'utf8');
  assert.match(example, /^OPENAI_API_KEY=$/m);
  assert.match(example, /^ANTHROPIC_API_KEY=$/m);
  assert.match(example, /^XAI_API_KEY=$/m);
  assert.match(example, /^LMSTUDIO_BASE_URL=$/m);
  assert.match(example, /^LMSTUDIO_MODEL=$/m);
  assert.doesNotMatch(example, /sk-|xai-|ntn_/);
  const loaded = loadGatewayConfig({ env: {}, file: config });
  assert.equal(loaded.providers.lmstudio.baseUrl, '');
  assert.equal(loaded.providers.gpt.baseUrl, 'https://api.openai.com/v1');
});

test('gateway source uses the AG-UI SDK and does not persist threads or write Notion', () => {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (name.endsWith('.ts')) files.push(full);
    }
  };
  walk(path.join(gatewayRoot, 'src'));
  const source = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
  assert.match(source, /from ['"]@ag-ui\/encoder['"]/);
  assert.match(source, /from ['"]@ag-ui\/core['"]/);
  assert.doesNotMatch(source, /pages\.create|pages\.update|databases\.update|api\.notion\.com/);
  assert.doesNotMatch(source, /sqlite|better-sqlite3|node-cron|cron\.schedule|writeFile/);
  assert.doesNotMatch(source, /SUBAGENT_STARTED|STATE_SNAPSHOT|MESSAGES_SNAPSHOT/);
});

test('the process refuses to bind anything except 127.0.0.1', async () => {
  for (const host of ['0.0.0.0', '::', 'localhost', 'example.com']) {
    await assert.rejects(() => startGateway({ host, port: 0, deps: deps({ providers: {} }) }), /127\.0\.0\.1/);
  }
  const gateway = await startGateway({ host: '127.0.0.1', port: 0, deps: deps({ providers: {} }) });
  try {
    assert.equal(gateway.host, '127.0.0.1');
    assert.ok(gateway.port > 0);
  } finally {
    await gateway.close();
  }
});

test('gpt, grok, and lm studio send store false to a local stub and claude is translated without a store field', async () => {
  const cases = [
    {
      provider: 'gpt',
      reply: openaiReply('STUB_GPT_REPLY'),
      path: '/v1/chat/completions',
      keyHeader: 'authorization',
      keyValue: 'Bearer test-openai-key',
      model: 'test-gpt-model',
    },
    {
      provider: 'grok',
      reply: openaiReply('STUB_GROK_REPLY'),
      path: '/v1/chat/completions',
      keyHeader: 'authorization',
      keyValue: 'Bearer test-xai-key',
      model: 'test-grok-model',
    },
    {
      provider: 'lmstudio',
      reply: openaiReply('STUB_LM_REPLY'),
      path: '/v1/chat/completions',
      keyHeader: '',
      keyValue: '',
      model: 'test-lm-model',
    },
    {
      provider: 'claude',
      reply: anthropicReply('STUB_CLAUDE_REPLY'),
      path: '/v1/messages',
      keyHeader: 'x-api-key',
      keyValue: 'test-anthropic-key',
      model: 'test-claude-model',
    },
  ] as const;

  for (const item of cases) {
    const stub = await stubProvider(item.reply);
    try {
      const providers = {
        [item.provider]: {
          baseUrl: item.provider === 'claude' ? stub.baseUrl : `${stub.baseUrl}/v1`,
          model: item.model,
          apiKey: item.provider === 'lmstudio' ? undefined : item.keyValue.replace('Bearer ', ''),
        },
      };
      const events = await handleRun(input({ forwardedProps: { provider: item.provider, pageIds: ['container-isc-people-ops'] } }), deps({ providers }));
      assert.equal(stub.calls.length, 1);
      const call = stub.calls[0];
      assert.equal(call?.url, item.path);
      const body = call?.body as { model: string; store?: boolean; messages: { content: string }[] };
      assert.equal(body.model, item.model);
      assert.equal(body.messages[0]?.content.includes('Hello from personal ventures'), true);
      assert.equal(JSON.stringify(body).includes(EMPLOYER_MARKER), false);
      assert.equal(JSON.stringify(body).includes('client-supplied-tool'), false);
      assert.equal(JSON.stringify(body).includes('container-isc-people-ops'), false);
      if (item.provider === 'claude') {
        assert.equal(Object.hasOwn(body, 'store'), false);
        assert.equal(call?.headers['anthropic-version'], '2023-06-01');
        assert.equal(call?.headers['x-api-key'], item.keyValue);
      } else {
        assert.equal(body.store, false);
        if (item.provider === 'lmstudio') assert.equal(call?.headers.authorization, undefined);
        else assert.equal(call?.headers.authorization, item.keyValue);
      }
      assertAllowed(events);
      assert.equal(textOf(events).includes(`STUB_${item.provider === 'lmstudio' ? 'LM' : item.provider.toUpperCase()}_REPLY`), true);
      const secret = item.keyValue.replace('Bearer ', '');
      if (secret.length > 0) assert.equal(JSON.stringify(events).includes(secret), false);
      assert.equal(events.some((event) => event.type === EventType.RUN_FINISHED && event.outcome?.type === 'success'), true);
      assert.equal(events.some((event) => event.input != null), false);
    } finally {
      await stub.close();
    }
  }
});

test('a missing key or an unconfigured LM Studio returns a clear error and does not call out', async () => {
  const stub = await stubProvider(openaiReply('should-not-run'));
  try {
    const missing = await handleRun(input(), deps({
      providers: { gpt: { baseUrl: `${stub.baseUrl}/v1`, model: 'test-gpt-model', apiKey: '' } },
    }));
    assert.equal(stub.calls.length, 0);
    assert.match(missing.map((event) => event.message).join('\n'), /OPENAI_API_KEY is not set/);

    const noUrl = await handleRun(input({ forwardedProps: { provider: 'lmstudio' } }), deps({
      providers: { lmstudio: { baseUrl: '', model: 'local-model', apiKey: undefined } },
    }));
    assert.match(noUrl.map((event) => event.message).join('\n'), /LM Studio base URL is not configured/);

    const noModel = await handleRun(input({ forwardedProps: { provider: 'lmstudio' } }), deps({
      providers: { lmstudio: { baseUrl: `${stub.baseUrl}/v1`, model: '', apiKey: undefined } },
    }));
    assert.match(noModel.map((event) => event.message).join('\n'), /LM Studio model id is not configured/);

    const publicUrl = await handleRun(input({ forwardedProps: { provider: 'lmstudio' } }), deps({
      providers: { lmstudio: { baseUrl: 'http://example.com/v1', model: 'local-model', apiKey: undefined } },
    }));
    assert.match(publicUrl.map((event) => event.message).join('\n'), /127\.0\.0\.1/);
    assert.equal(stub.calls.length, 0);
  } finally {
    await stub.close();
  }
});

test('denylisted text never reaches a stub provider', async () => {
  const stub = await stubProvider(openaiReply('should-not-run'));
  try {
    const events = await handleRun(input({
      messages: [
        { id: 'a', role: 'assistant', content: `earlier ${EMPLOYER_MARKER}` },
        { id: 'u', role: 'user', content: 'Hello from personal ventures' },
      ],
    }), deps({
      providers: { gpt: { baseUrl: `${stub.baseUrl}/v1`, model: 'test-gpt-model', apiKey: 'test-openai-key' } },
    }));
    assert.equal(stub.calls.length, 0);
    assert.equal(JSON.stringify(events).includes(EMPLOYER_MARKER), false);
    assert.equal(events.some((event) => event.type === EventType.RUN_ERROR && event.code === 'marker-in-prompt'), true);
  } finally {
    await stub.close();
  }
});

test('client page ids are not retrieved and client tool text is not sent', async () => {
  const retrieved: string[] = [];
  const stub = await stubProvider(openaiReply('STUB_GPT_REPLY'));
  try {
    const events = await handleRun(input({
      messages: [
        { id: 's', role: 'system', content: `system ${EMPLOYER_MARKER}` },
        { id: 'u', role: 'user', content: 'Hello from personal ventures' },
      ],
      tools: [],
      context: [{ description: 'page', value: 'clean context' }],
    }), deps({
      allowlist: personalAllowlist(),
      pageTransport: pageTransport(retrieved),
      providers: { gpt: { baseUrl: `${stub.baseUrl}/v1`, model: 'test-gpt-model', apiKey: 'test-openai-key' } },
    }));
    assert.deepEqual(retrieved, ['pv-page-example-001']);
    const body = stub.calls[0]?.body as { messages: { content: string }[] };
    assert.match(body.messages[0]?.content ?? '', /SYNTHETIC_PERSONAL_EXCERPT/);
    assert.equal(body.messages[0]?.content.includes(EMPLOYER_MARKER), false);
    assert.equal(body.messages[0]?.content.includes('system '), false);
    assert.equal(JSON.stringify(events).includes(EMPLOYER_MARKER), false);
  } finally {
    await stub.close();
  }
});

test('a provider reply that contains a denylisted marker is not forwarded', async () => {
  const stub = await stubProvider(openaiReply(`reply ${EMPLOYER_MARKER}`));
  try {
    const events = await handleRun(input(), deps({
      providers: { gpt: { baseUrl: `${stub.baseUrl}/v1`, model: 'test-gpt-model', apiKey: 'test-openai-key' } },
    }));
    assert.equal(stub.calls.length, 1);
    assert.equal(JSON.stringify(events).includes(EMPLOYER_MARKER), false);
    assert.equal(textOf(events), '');
    assert.equal(events.some((event) => event.type === EventType.RUN_ERROR), true);
  } finally {
    await stub.close();
  }
});

test('only the gateway can interrupt, and a consequential tool runs only after an explicit resume', async () => {
  const executed: string[] = [];
  const issued = new Map<string, { tool: string }>();
  const tool = {
    name: 'synthetic-consequential',
    execute: () => {
      executed.push('ran');
      return 'tool-ok';
    },
  };
  const stub = await stubProvider(openaiReply('STUB_GPT_REPLY'));
  const providers = { gpt: { baseUrl: `${stub.baseUrl}/v1`, model: 'test-gpt-model', apiKey: 'test-openai-key' } };
  try {
    const paused = await handleRun(input({ tools: [{ name: 'synthetic-consequential', description: 'run', parameters: {} }] }), deps({
      providers,
      consequentialTools: [tool],
      proposeTool: 'synthetic-consequential',
      issuedInterrupts: issued,
    }));
    assert.deepEqual(executed, []);
    assert.equal(stub.calls.length, 0);
    const finished = paused.find((event) => event.type === EventType.RUN_FINISHED);
    assert.equal(finished?.outcome?.type, 'interrupt');
    const interruptId = finished?.outcome?.interrupts?.[0]?.id;
    assert.equal(typeof interruptId, 'string');
    assert.equal(finished?.outcome?.interrupts?.[0]?.toolCallId?.length > 0, true);

    const wrong = await handleRun(input({
      runId: 'run-2',
      resume: [{ interruptId: 'not-issued', status: 'resolved', payload: { approved: true } }],
    }), deps({ providers, consequentialTools: [tool], proposeTool: 'synthetic-consequential', issuedInterrupts: issued }));
    assert.deepEqual(executed, []);
    assert.equal(wrong.some((event) => event.type === EventType.RUN_FINISHED && event.outcome?.type === 'interrupt'), true);

    const cancelled = await handleRun(input({
      runId: 'run-3',
      resume: [{ interruptId, status: 'cancelled', payload: { approved: true } }],
    }), deps({ providers, consequentialTools: [tool], proposeTool: 'synthetic-consequential', issuedInterrupts: issued }));
    assert.deepEqual(executed, []);

    const unresolved = await handleRun(input({
      runId: 'run-4',
      resume: [{ interruptId, status: 'resolved', payload: { approved: false } }],
    }), deps({ providers, consequentialTools: [tool], proposeTool: 'synthetic-consequential', issuedInterrupts: issued }));
    assert.deepEqual(executed, []);

    const approved = await handleRun(input({
      runId: 'run-5',
      resume: [{ interruptId, status: 'resolved', payload: { approved: true } }],
    }), deps({ providers, consequentialTools: [tool], proposeTool: 'synthetic-consequential', issuedInterrupts: issued }));
    assert.deepEqual(executed, ['ran']);
    assert.equal(textOf(approved), 'tool-ok');
    assert.equal(stub.calls.length, 0);

    executed.length = 0;
    const poisoned = {
      name: 'synthetic-consequential',
      execute: () => `leaked ${EMPLOYER_MARKER}`,
    };
    const issuedAgain = new Map<string, { tool: string }>();
    const first = await handleRun(input({ runId: 'run-6' }), deps({
      providers,
      consequentialTools: [poisoned],
      proposeTool: 'synthetic-consequential',
      issuedInterrupts: issuedAgain,
    }));
    const nextId = first.find((event) => event.type === EventType.RUN_FINISHED)?.outcome?.interrupts?.[0]?.id;
    const second = await handleRun(input({
      runId: 'run-7',
      resume: [{ interruptId: nextId, status: 'resolved', payload: { approved: true } }],
    }), deps({
      providers,
      consequentialTools: [poisoned],
      proposeTool: 'synthetic-consequential',
      issuedInterrupts: issuedAgain,
    }));
    assert.equal(JSON.stringify(second).includes(EMPLOYER_MARKER), false);
    assert.equal(textOf(second), '');
  } finally {
    await stub.close();
  }
});

test('the HTTP wire is AG-UI SSE and client tools cannot approve themselves', async () => {
  const executed: string[] = [];
  const stub = await stubProvider(openaiReply('STUB_GPT_REPLY'));
  const gateway = await startGateway({
    host: '127.0.0.1',
    port: 0,
    deps: deps({
      providers: { gpt: { baseUrl: `${stub.baseUrl}/v1`, model: 'test-gpt-model', apiKey: 'test-openai-key' } },
      consequentialTools: [{ name: 'synthetic-consequential', execute: () => { executed.push('ran'); return 'no'; } }],
    }),
  });
  try {
    const response = await fetch(`http://127.0.0.1:${gateway.port}/v1/runs`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'text/event-stream' },
      body: JSON.stringify(input({
        tools: [{ name: 'synthetic-consequential', description: 'run', parameters: {} }],
        resume: [{ interruptId: 'client-made', status: 'resolved', payload: { approved: true } }],
      })),
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), encoder.getContentType());
    const body = await response.text();
    const events = body.split('\n\n').filter((block) => block.startsWith('data: ')).map((block) => JSON.parse(block.slice(6)) as RunEvent);
    assert.equal(body, events.map((event) => encoder.encode(event)).join(''));
    assertAllowed(events);
    assert.equal(textOf(events), 'STUB_GPT_REPLY');
    assert.deepEqual(executed, []);
    assert.equal(events.some((event) => event.outcome?.type === 'interrupt'), false);
  } finally {
    await gateway.close();
    await stub.close();
  }
});
