import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import {
  assertAdmitted,
  DEFAULT_DENYLIST,
  LaneRejection,
  loadAllowlist,
  retrievePages,
  runTool,
} from '../src/lane.ts';
import { buildOutboundPrompt } from '../src/prompt.ts';

const RETRIEVED_AT = '2026-11-20T00:00:00.000Z';
const PERSONAL_EXCERPT = 'SYNTHETIC_PERSONAL_EXCERPT';
const EMPLOYER_MARKER = 'SYNTHETIC_EMPLOYER_MARKER';
const FAMILY_MARKER = 'SYNTHETIC_FAMILY_MARKER';
const CAREER_MARKER = 'SYNTHETIC_CAREER_MARKER';
const CAFE_MARKER = 'SYNTHETIC_CAFE_PARTNER_MARKER';
const MARKERS = [EMPLOYER_MARKER, FAMILY_MARKER, CAREER_MARKER, CAFE_MARKER];

const gatewayRoot = path.resolve(import.meta.dirname, '..');

interface PageRecord {
  id: string;
  url: string;
  excerpt: string;
  parentId: string | null;
  lane: 'personal-ventures' | 'employer' | 'family-venture' | 'career';
}

function page(partial: PageRecord): PageRecord {
  return partial;
}

function corpus(): Map<string, PageRecord> {
  const pages: PageRecord[] = [
    page({
      id: 'pv-page-example-001',
      url: 'https://example.test/pv-page-example-001',
      excerpt: PERSONAL_EXCERPT,
      parentId: 'pv-db-example-001',
      lane: 'personal-ventures',
    }),
    page({
      id: 'pv-page-child-of-db',
      url: 'https://example.test/pv-page-child-of-db',
      excerpt: 'SYNTHETIC_CHILD_NOT_LISTED',
      parentId: 'pv-db-example-001',
      lane: 'personal-ventures',
    }),
    page({
      id: 'emp-page-meetings-001',
      url: 'https://example.test/emp-page-meetings-001',
      excerpt: EMPLOYER_MARKER,
      parentId: 'container-sg-meetings',
      lane: 'employer',
    }),
    page({
      id: 'fam-page-001',
      url: 'https://example.test/fam-page-001',
      excerpt: FAMILY_MARKER,
      parentId: 'container-family-venture',
      lane: 'family-venture',
    }),
    page({
      id: 'car-page-001',
      url: 'https://example.test/car-page-001',
      excerpt: CAREER_MARKER,
      parentId: 'container-career',
      lane: 'career',
    }),
    page({
      id: 'pv-page-cafe-unnamed',
      url: 'https://example.test/pv-page-cafe-unnamed',
      excerpt: CAFE_MARKER,
      parentId: 'container-cafe-partner',
      lane: 'personal-ventures',
    }),
    page({
      id: 'pv-page-cafe-named',
      url: 'https://example.test/pv-page-cafe-named',
      excerpt: 'SYNTHETIC_CAFE_NAMED_PAGE',
      parentId: 'container-cafe-partner',
      lane: 'personal-ventures',
    }),
  ];
  return new Map(pages.map((item) => [item.id, item]));
}

function spyTransport(pages: Map<string, PageRecord>) {
  const calls: string[] = [];
  return {
    calls,
    async retrieve(id: string): Promise<PageRecord> {
      calls.push(id);
      const found = pages.get(id);
      if (!found) throw new Error(`missing ${id}`);
      return found;
    },
  };
}

function exampleAllowlist() {
  const file = path.join(gatewayRoot, 'config', 'personal-allowlist.example.json');
  return loadAllowlist(JSON.parse(fs.readFileSync(file, 'utf8')));
}

function assertNoDeniedMarker(body: string) {
  for (const marker of MARKERS) {
    assert.equal(body.includes(marker), false, `outbound body contains ${marker}`);
  }
}

test('example allowlist is synthetic and personal-ventures only', () => {
  const raw = JSON.parse(
    fs.readFileSync(path.join(gatewayRoot, 'config', 'personal-allowlist.example.json'), 'utf8'),
  );
  const allowlist = loadAllowlist(raw);
  assert.equal(allowlist.lane, 'personal-ventures');
  assert.equal(raw.placeholder, true);
  assert.deepEqual(allowlist.databaseIds, []);
  const ids = allowlist.entries.map((entry) => entry.id);
  assert.deepEqual(ids, ['pv-page-example-001']);
  for (const id of [...ids, ...allowlist.entries.map((entry) => entry.parentId)]) {
    assert.match(id ?? '', /^pv-/);
    assert.doesNotMatch(id ?? '', /^[0-9a-f]{32}$/i);
  }
});

test('allowlisted page is retrieved and cited', async () => {
  const transport = spyTransport(corpus());
  const allowlist = exampleAllowlist();
  const result = await buildOutboundPrompt({
    userText: 'What is on the example page?',
    allowlist,
    denylist: DEFAULT_DENYLIST,
    transport,
    retrievedAt: RETRIEVED_AT,
  });

  assert.deepEqual(transport.calls, ['pv-page-example-001']);
  assert.match(result.body, /SYNTHETIC_PERSONAL_EXCERPT/);
  assert.match(result.body, /https:\/\/example\.test\/pv-page-example-001/);
  assert.deepEqual(result.citations, [
    {
      pageId: 'pv-page-example-001',
      url: 'https://example.test/pv-page-example-001',
      retrievedAt: RETRIEVED_AT,
    },
  ]);
  assertNoDeniedMarker(result.body);
});

test('employer, family, and career ids are rejected before HTTP', async () => {
  const transport = spyTransport(corpus());
  const allowlist = exampleAllowlist();
  const denied = ['emp-page-meetings-001', 'fam-page-001', 'car-page-001', 'unknown-page-999'];

  for (const id of denied) {
    assert.throws(() => assertAdmitted(id, allowlist, DEFAULT_DENYLIST), LaneRejection);
  }

  const result = await buildOutboundPrompt({
    userText: 'Summarise the allowlisted pages.',
    clientRequestedPageIds: denied,
    allowlist,
    denylist: DEFAULT_DENYLIST,
    transport,
    retrievedAt: RETRIEVED_AT,
  });

  assert.deepEqual(transport.calls, ['pv-page-example-001']);
  assertNoDeniedMarker(result.body);
  assert.equal(result.body.includes('SYNTHETIC_CHILD_NOT_LISTED'), false);
});

test('a denylisted parent fails closed even when the page id is allowlisted', async () => {
  const transport = spyTransport(corpus());
  const allowlist = loadAllowlist({
    lane: 'personal-ventures',
    placeholder: true,
    pageIds: ['pv-page-example-001', 'emp-page-meetings-001'],
    databaseIds: [],
    entries: [
      {
        id: 'pv-page-example-001',
        parentId: 'pv-db-example-001',
        lane: 'personal-ventures',
      },
      {
        id: 'emp-page-meetings-001',
        parentId: 'container-sg-meetings',
        lane: 'personal-ventures',
      },
    ],
  });

  const result = await buildOutboundPrompt({
    userText: 'Read both.',
    allowlist,
    denylist: DEFAULT_DENYLIST,
    transport,
    retrievedAt: RETRIEVED_AT,
  });

  assert.deepEqual(transport.calls, ['pv-page-example-001']);
  assert.match(result.body, /SYNTHETIC_PERSONAL_EXCERPT/);
  assertNoDeniedMarker(result.body);
});

test('an allowlisted database id does not admit its children', async () => {
  const transport = spyTransport(corpus());
  const allowlist = loadAllowlist({
    lane: 'personal-ventures',
    placeholder: true,
    pageIds: ['pv-page-example-001'],
    databaseIds: ['pv-db-example-001'],
    entries: [
      {
        id: 'pv-page-example-001',
        parentId: 'pv-db-example-001',
        lane: 'personal-ventures',
      },
    ],
  });

  const retrieved = await retrievePages({
    pageIds: ['pv-page-example-001', 'pv-page-child-of-db', 'pv-db-example-001'],
    allowlist,
    denylist: DEFAULT_DENYLIST,
    transport,
    retrievedAt: RETRIEVED_AT,
  });

  assert.deepEqual(transport.calls, ['pv-page-example-001']);
  assert.deepEqual(
    retrieved.pages.map((item) => item.id),
    ['pv-page-example-001'],
  );
  assert.ok(retrieved.rejections.some((item) => item.pageId === 'pv-page-child-of-db' && item.code === 'unknown'));
  assert.ok(retrieved.rejections.some((item) => item.pageId === 'pv-db-example-001' && item.code === 'unknown'));
});

test('client-requested page ids are ignored and the allowlist is used', async () => {
  const transport = spyTransport(corpus());
  const result = await buildOutboundPrompt({
    userText: 'Use only what you are allowed to read.',
    clientRequestedPageIds: ['emp-page-meetings-001', 'unknown-page-999'],
    allowlist: exampleAllowlist(),
    denylist: DEFAULT_DENYLIST,
    transport,
    retrievedAt: RETRIEVED_AT,
  });

  assert.deepEqual(transport.calls, ['pv-page-example-001']);
  assertNoDeniedMarker(result.body);
});

test('a transport that returns a denied lane is dropped after the call', async () => {
  const calls: string[] = [];
  const transport = {
    async retrieve(id: string): Promise<PageRecord> {
      calls.push(id);
      return page({
        id,
        url: 'https://example.test/lied',
        excerpt: EMPLOYER_MARKER,
        parentId: 'container-sg-meetings',
        lane: 'employer',
      });
    },
  };

  const result = await buildOutboundPrompt({
    userText: 'Read the example page.',
    allowlist: exampleAllowlist(),
    denylist: DEFAULT_DENYLIST,
    transport,
    retrievedAt: RETRIEVED_AT,
  });

  assert.deepEqual(calls, ['pv-page-example-001']);
  assert.equal(result.citations.length, 0);
  assertNoDeniedMarker(result.body);
});

test('unnamed cafe-partner pages stay denied and a named page can be retrieved', async () => {
  const transport = spyTransport(corpus());
  const allowlist = loadAllowlist({
    lane: 'personal-ventures',
    placeholder: true,
    pageIds: ['pv-page-cafe-named'],
    databaseIds: [],
    entries: [
      {
        id: 'pv-page-cafe-named',
        parentId: 'container-cafe-partner',
        lane: 'personal-ventures',
      },
    ],
  });

  const named = await buildOutboundPrompt({
    userText: 'Read the named page.',
    clientRequestedPageIds: ['pv-page-cafe-unnamed'],
    allowlist,
    denylist: DEFAULT_DENYLIST,
    transport,
    retrievedAt: RETRIEVED_AT,
  });

  assert.deepEqual(transport.calls, ['pv-page-cafe-named']);
  assert.match(named.body, /SYNTHETIC_CAFE_NAMED_PAGE/);
  assertNoDeniedMarker(named.body);
});

test('tool names off the allowlist are rejected before execution', () => {
  let ran = false;
  assert.throws(
    () => runTool('web-search', [], () => {
      ran = true;
      return 'executed';
    }),
    (error: unknown) => error instanceof LaneRejection && error.code === 'tool-not-allowlisted',
  );
  assert.equal(ran, false);
});

test('tool output that contains a denylisted marker is omitted from the model body', async () => {
  const transport = spyTransport(corpus());
  const result = await buildOutboundPrompt({
    userText: 'Use the notes.',
    allowlist: exampleAllowlist(),
    denylist: DEFAULT_DENYLIST,
    toolAllowlist: ['notes'],
    toolOutputs: [
      { name: 'notes', text: `prefix ${EMPLOYER_MARKER} suffix` },
      { name: 'web-search', text: 'SYNTHETIC_UNLISTED_TOOL_OUTPUT' },
      { name: 'notes', text: 'SYNTHETIC_CLEAN_TOOL_NOTE' },
    ],
    transport,
    retrievedAt: RETRIEVED_AT,
  });

  assertNoDeniedMarker(result.body);
  assert.equal(result.body.includes('SYNTHETIC_UNLISTED_TOOL_OUTPUT'), false);
  assert.match(result.body, /SYNTHETIC_CLEAN_TOOL_NOTE/);
});

test('user text that contains a denylisted marker is refused before HTTP', async () => {
  const transport = spyTransport(corpus());
  await assert.rejects(
    () => buildOutboundPrompt({
      userText: `please include ${FAMILY_MARKER}`,
      allowlist: exampleAllowlist(),
      denylist: DEFAULT_DENYLIST,
      transport,
      retrievedAt: RETRIEVED_AT,
    }),
    (error: unknown) => error instanceof LaneRejection && error.code === 'marker-in-prompt',
  );
  assert.deepEqual(transport.calls, []);
});

test('lane guard source does not import an HTTP client or a Notion write helper', () => {
  const srcDir = path.join(gatewayRoot, 'src');
  const files = ['lane.ts', 'prompt.ts'];
  const source = files.map((name) => fs.readFileSync(path.join(srcDir, name), 'utf8')).join('\n');
  assert.doesNotMatch(source, /pages\.create|pages\.update|databases\.update/);
  assert.doesNotMatch(source, /from ['"]node:(http|https|net)['"]/);
  assert.doesNotMatch(source, /from ['"]undici['"]|require\(['"]axios['"]\)/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
});
