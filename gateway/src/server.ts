import http from 'node:http';
import { EventEncoder } from '@ag-ui/encoder';
import { loadGatewayConfig } from './config.ts';
import { DEFAULT_DENYLIST } from './lane.ts';
import { handleRun, type GatewayDeps } from './run.ts';

export { loadGatewayConfig } from './config.ts';
export { handleRun, type GatewayDeps, type RunEvent } from './run.ts';

export function assertLoopbackHost(host: string): void {
  if (host !== '127.0.0.1') {
    throw new Error('Gateway refuses to bind a non-loopback host. Use 127.0.0.1.');
  }
}

export async function startGateway(options: {
  host: string;
  port: number;
  deps: GatewayDeps;
}): Promise<{ host: string; port: number; close: () => Promise<void> }> {
  assertLoopbackHost(options.host);
  const server = http.createServer(async (req, res) => {
    if (req.method !== 'POST' || req.url !== '/v1/runs') {
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end('{"error":"not found"}');
      return;
    }
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    let payload: unknown;
    try {
      payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end('{"error":"invalid json"}');
      return;
    }
    const events = await handleRun(payload, options.deps);
    const encoder = new EventEncoder();
    res.writeHead(200, {
      'content-type': encoder.getContentType(),
      'cache-control': 'no-store',
    });
    for (const event of events) res.write(encoder.encode(event));
    res.end();
  });

  await new Promise<void>((resolve) => {
    server.listen(options.port, options.host, () => resolve());
  });
  const address = server.address();
  const port = address && typeof address === 'object' ? address.port : options.port;
  return {
    host: options.host,
    port,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

export function emptyDeps(config: ReturnType<typeof loadGatewayConfig>): GatewayDeps {
  return {
    allowlist: { lane: 'personal-ventures', entries: [], databaseIds: [] },
    denylist: DEFAULT_DENYLIST,
    pageTransport: {
      async retrieve() {
        throw new Error('Notion reads are not enabled');
      },
    },
    providers: config.providers,
    consequentialTools: [],
    proposeTool: null,
    issuedInterrupts: new Map(),
    retrievedAt: new Date().toISOString(),
  };
}
