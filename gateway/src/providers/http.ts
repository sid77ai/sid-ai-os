import http from 'node:http';
import https from 'node:https';

export function joinUrl(baseUrl: string, path: string): URL {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return new URL(path.replace(/^\//, ''), base);
}

export function postJson(target: URL, headers: Record<string, string>, body: unknown): Promise<unknown> {
  const payload = JSON.stringify(body);
  const lib = target.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const req = lib.request(target, {
      method: 'POST',
      headers: {
        ...headers,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(payload),
      },
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        if ((res.statusCode ?? 0) < 200 || (res.statusCode ?? 0) >= 300) {
          reject(new Error('Provider request failed'));
          return;
        }
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        } catch {
          reject(new Error('Provider request failed'));
        }
      });
    });
    req.setTimeout(5000, () => req.destroy(new Error('Provider request failed')));
    req.on('error', () => reject(new Error('Provider request failed')));
    req.write(payload);
    req.end();
  });
}
