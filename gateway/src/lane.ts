export type LaneName = 'personal-ventures' | 'employer' | 'family-venture' | 'career';

export type RejectionCode =
  | 'unknown'
  | 'wrong-lane'
  | 'denylisted-parent'
  | 'denylisted-container'
  | 'marker-in-prompt'
  | 'tool-not-allowlisted';

export class LaneRejection extends Error {
  readonly code: RejectionCode;
  readonly subject: string;

  constructor(code: RejectionCode, subject: string) {
    super(`Lane rejection: ${code}`);
    this.name = 'LaneRejection';
    this.code = code;
    this.subject = subject;
  }
}

export interface DeniedContainer {
  id: string;
  lane: LaneName;
  label: string;
  markers: readonly string[];
  mode: 'always' | 'explicit-page';
}

/** Synthetic container ids. Real Notion ids stay in the untracked local allowlist. */
export const DEFAULT_DENYLIST: readonly DeniedContainer[] = [
  {
    id: 'container-sg-meetings',
    lane: 'employer',
    label: 'SG Meetings',
    markers: ['SYNTHETIC_EMPLOYER_MARKER'],
    mode: 'always',
  },
  {
    id: 'container-isc-people-ops',
    lane: 'employer',
    label: 'ISC people-ops hub',
    markers: ['SYNTHETIC_EMPLOYER_MARKER'],
    mode: 'always',
  },
  {
    id: 'container-control-tower',
    lane: 'employer',
    label: 'Control Tower',
    markers: ['SYNTHETIC_EMPLOYER_MARKER'],
    mode: 'always',
  },
  {
    id: 'container-packpilot',
    lane: 'employer',
    label: 'PackPilot',
    markers: ['SYNTHETIC_EMPLOYER_MARKER'],
    mode: 'always',
  },
  {
    id: 'container-isc-coe',
    lane: 'employer',
    label: 'ISC CoE',
    markers: ['SYNTHETIC_EMPLOYER_MARKER'],
    mode: 'always',
  },
  {
    id: 'container-family-venture',
    lane: 'family-venture',
    label: 'Family venture registers',
    markers: ['SYNTHETIC_FAMILY_MARKER'],
    mode: 'always',
  },
  {
    id: 'container-career',
    lane: 'career',
    label: 'Career Ops',
    markers: ['SYNTHETIC_CAREER_MARKER'],
    mode: 'always',
  },
  {
    id: 'container-cafe-partner',
    lane: 'personal-ventures',
    label: 'Cafe Venture partner-shared',
    markers: ['SYNTHETIC_CAFE_PARTNER_MARKER'],
    mode: 'explicit-page',
  },
];

export interface AllowEntry {
  id: string;
  parentId: string | null;
  lane: 'personal-ventures';
}

export interface Allowlist {
  lane: 'personal-ventures';
  entries: AllowEntry[];
  databaseIds: readonly string[];
}

export interface PageRecord {
  id: string;
  url: string;
  excerpt: string;
  parentId: string | null;
  lane: LaneName;
}

export interface Transport {
  retrieve(id: string): Promise<PageRecord>;
}

export interface RetrievedPage extends PageRecord {
  retrievedAt: string;
}

export interface PageRejection {
  pageId: string;
  code: RejectionCode;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sameIds(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) return false;
  const a = [...left].sort();
  const b = [...right].sort();
  return a.every((id, index) => id === b[index]);
}

export function loadAllowlist(raw: unknown): Allowlist {
  if (!isRecord(raw)) throw new LaneRejection('unknown', 'allowlist');
  if (raw.lane !== 'personal-ventures') throw new LaneRejection('wrong-lane', 'allowlist');
  if (!Array.isArray(raw.entries)) throw new LaneRejection('unknown', 'allowlist.entries');

  const entries: AllowEntry[] = raw.entries.map((entry) => {
    if (!isRecord(entry) || typeof entry.id !== 'string' || entry.id.length === 0) {
      throw new LaneRejection('unknown', 'allowlist.entry');
    }
    if (entry.lane !== 'personal-ventures') throw new LaneRejection('wrong-lane', entry.id);
    const parentId = entry.parentId == null ? null : entry.parentId;
    if (parentId !== null && typeof parentId !== 'string') throw new LaneRejection('unknown', entry.id);
    return { id: entry.id, parentId, lane: 'personal-ventures' };
  });

  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.id)) throw new LaneRejection('unknown', entry.id);
    seen.add(entry.id);
  }

  const pageIds = Array.isArray(raw.pageIds) ? raw.pageIds.filter((id): id is string => typeof id === 'string') : entries.map((entry) => entry.id);
  if (!sameIds(pageIds, entries.map((entry) => entry.id))) {
    throw new LaneRejection('unknown', 'allowlist.pageIds');
  }

  const databaseIds = Array.isArray(raw.databaseIds)
    ? raw.databaseIds.filter((id): id is string => typeof id === 'string')
    : [];

  // databaseIds are not retrieval roots. Only entries are page ids that may be fetched.
  return { lane: 'personal-ventures', entries, databaseIds };
}

export function deniedMarkers(denylist: readonly DeniedContainer[]): string[] {
  return [...new Set(denylist.flatMap((item) => item.markers.filter((marker) => marker.length > 0)))];
}

export function textHasDeniedMarker(text: string, denylist: readonly DeniedContainer[]): boolean {
  return deniedMarkers(denylist).some((marker) => text.includes(marker));
}

function container(denylist: readonly DeniedContainer[], id: string | null): DeniedContainer | undefined {
  if (!id) return undefined;
  return denylist.find((item) => item.id === id);
}

export function admission(
  id: string,
  meta: { parentId: string | null; lane: LaneName } | undefined,
  allowlist: Allowlist,
  denylist: readonly DeniedContainer[],
): { ok: true } | { ok: false; code: RejectionCode } {
  if (container(denylist, id)) return { ok: false, code: 'denylisted-container' };

  const entry = allowlist.entries.find((item) => item.id === id);
  if (!entry) return { ok: false, code: 'unknown' };

  const lane = meta?.lane ?? entry.lane;
  const parentId = meta ? meta.parentId : entry.parentId;
  if (lane !== 'personal-ventures') return { ok: false, code: 'wrong-lane' };

  const parent = container(denylist, parentId);
  if (parent?.mode === 'always') return { ok: false, code: 'denylisted-parent' };
  return { ok: true };
}

export function assertAdmitted(id: string, allowlist: Allowlist, denylist: readonly DeniedContainer[]): void {
  const entry = allowlist.entries.find((item) => item.id === id);
  const decision = admission(id, entry, allowlist, denylist);
  if (!decision.ok) throw new LaneRejection(decision.code, id);
}

export async function retrievePages(input: {
  pageIds: readonly string[];
  allowlist: Allowlist;
  denylist: readonly DeniedContainer[];
  transport: Transport;
  retrievedAt: string;
}): Promise<{ pages: RetrievedPage[]; rejections: PageRejection[] }> {
  const pages: RetrievedPage[] = [];
  const rejections: PageRejection[] = [];

  for (const id of input.pageIds) {
    const entry = input.allowlist.entries.find((item) => item.id === id);
    const before = admission(id, entry, input.allowlist, input.denylist);
    if (!before.ok) {
      rejections.push({ pageId: id, code: before.code });
      continue;
    }

    const record = await input.transport.retrieve(id);
    if (record.id !== id) {
      rejections.push({ pageId: id, code: 'unknown' });
      continue;
    }

    const after = admission(record.id, record, input.allowlist, input.denylist);
    const marked = textHasDeniedMarker(record.excerpt, input.denylist) || textHasDeniedMarker(record.url, input.denylist);
    if (!after.ok || marked) {
      rejections.push({ pageId: id, code: after.ok ? 'marker-in-prompt' : after.code });
      continue;
    }

    pages.push({ ...record, retrievedAt: input.retrievedAt });
  }

  return { pages, rejections };
}

export function runTool<T>(name: string, toolAllowlist: readonly string[], execute: () => T): T {
  if (!toolAllowlist.includes(name)) throw new LaneRejection('tool-not-allowlisted', name);
  return execute();
}
