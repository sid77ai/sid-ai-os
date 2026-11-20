# PR-0 — Repository and architecture audit

**Lane:** personal ventures (SID AI-OS). **Write level:** 2, proposal only. This pull request does not change plugin behaviour, does not call Notion write APIs, and does not start a gateway, scheduler, or agent.

**Conclusion:** `sid-ai-os` is a public pack of ten Hermes dashboard views. None of them is a working integration. Two views call a Hermes session API that is not installed here, and they keep showing fixture copy when that call succeeds. The v2.0-rc1 architecture already marks these plugins dormant (LAB-14). The minimum next build is a new local gateway and a small UI, not a wiring-up of this cockpit.

## Freshness

| Source | Last edited | How this audit used it |
| --- | --- | --- |
| Operating Rules v2.0-rc1 | 2026-09-19 | Attached fetch. No Reviewed date on the page. Status remains v2.0-rc1; promotion still needs three weekly cycles and human acceptance. |
| Architecture (operational view) | 2026-10-22 | Attached fetch was truncated in the middle of the module table. A read-only re-fetch of the same page on 2026-11-20 returned the same last-edited time and the full M-01..M-14 table. `verification.state` is `unverified`. |
| This git repo | `main` at `47e1464` | Read and executed locally. |

The SID AI-OS project Context header was not opened. State and Next 3 on that page are unconfirmed here.

## What the repository actually is

Tracked tree: `README.md`, `PRODUCT.md`, `LICENSE`, `.gitignore`, and ten `sid-*/dashboard/` plugins. There is no application server, no `package.json`, no test runner, no CI workflow, and no `.env` example.

`README.md` still says the pack is five plugins and that Bridge is a chat mockup. The tree has ten plugins. Five of them (`sid-audit`, `sid-briefing`, `sid-inbox`, `sid-settings`, `sid-skills`) also carry a `plugin.yaml` beside `manifest.json`. Those yaml files are not read by anything in this repo.

Each plugin is an IIFE. It expects `window.__HERMES_PLUGIN_SDK__` and registers a component on `window.__HERMES_PLUGINS__`. There is no build step. The bundles are the source.

LAB-14 on the architecture page classifies "Hermes dashboard plugins (sid-ai-os repo)" as **KEEP DORMANT**, revive trigger "Career/content use". This audit does not revive them.

## How claims were checked

`node scripts/audit/verify-plugins.mjs` (Node v22.23.4, 2026-11-20) loads every bundle in a fake DOM with a stub Hermes SDK. It does not start Hermes, Notion, or a model provider, and it does not fetch Google Fonts. The machine has no `hermes` binary. Raw output is `docs/audit/plugin-harness-results.json`. Re-run from the repo root:

```bash
node scripts/audit/verify-plugins.mjs --out docs/audit/plugin-harness-results.json
```

A feature is **WORKING** only if a real service answered in this run. None did. **PARTIAL** means a call site exists and the harness executed it against a stub. **MOCKUP** means the view renders constants and local React state only.

## Classification

| Surface | Class | Evidence |
| --- | --- | --- |
| sid-mission | PARTIAL | Calls `api.getStatus()` and `api.getSessions(20, 0)` (`sid-mission/dashboard/dist/index.js`). Hermes is not installed. Against a rejecting stub the queue reads **8 TOTAL** (the seed). Against a stub that returns one session it reads **9 TOTAL**. The session title is not rendered. `getStatus`'s payload is stored and never rendered. Alerts, approvals, KPIs, kill switches, and the hive log stay on constants, including when the stub succeeds. |
| sid-hivemind | PARTIAL | Calls `api.getSessions(50, 0)`. A rejecting stub renders "No sessions yet" and still renders the fixture hive log and approval list. A resolving stub appends the stub session under Recent Sessions and still renders the fixture log. |
| sid-agents | MOCKUP | `AGENTS` constant. The file reads `__HERMES_PLUGIN_SDK__.api` and never calls it. Harness: zero SDK calls. |
| sid-audit | MOCKUP | `TELEMETRY`, `DECISIONS`, `HOOKS_LIST` constants. Zero SDK calls. |
| sid-bridge | MOCKUP | `CHAT`, `STEPS`, `BRIDGES` constants. README already calls this a mockup. Zero SDK calls. |
| sid-briefing | MOCKUP | `BRIEFING` constant dated Thu 15 May 2026. Approve/defer only filters React state. Zero SDK calls. |
| sid-inbox | MOCKUP | `SEED_INBOX`. ROUTE scores fixture keywords and updates React state. Harness: ROUTE made zero SDK calls. |
| sid-settings | MOCKUP | `INTEGRATIONS` and `KILL_SWITCHES`. TEST waits and then prints a synthetic "Pong" plus `Math.random()` milliseconds. Toggle flips React state only. Harness confirmed both, with zero SDK calls. |
| sid-skills | MOCKUP | `SKILLS`, `PLUGINS`, competency constants. Zero SDK calls. |
| sid-warroom | MOCKUP | `COUNCIL_TOPICS`. A timer advances phases over those constants. Zero SDK calls. |
| Notion | MOCKUP | Named in settings, skills, and log copy. No Notion client, no `fetch`. |
| Gmail, Google Calendar, Telegram, Slack, Discord, Meta Ads, Claude Desktop, GitHub, web search, web fetch | MOCKUP | Named in settings, bridge, skills, or briefing copy. No client and no `fetch` / `XMLHttpRequest` / `WebSocket` in any bundle. |
| ElevenLabs | MOCKUP | One briefing demo log string. |
| GPT, Claude, Grok, LM Studio | MISSING | No provider client, no base URL, no model router. |
| Approved-tool allowlist | MISSING | Skills lists fictional MCP tools. Nothing enforces an allowlist. |
| Lane filter | MISSING | No server. The UI mixes lanes in fixture copy. |
| Schedulers, memory DB, agents | ABSENT | Also must stay absent. AD-004 and AD-010. |

**WORKING count: 0.**

Google Fonts stylesheets are declared in every bundle (`fonts.googleapis.com`). The harness recorded the URLs and did not request them. They are a browser dependency of the cockpit, not a data integration.

## Secrets

Scanned tracked files and `git log -p --all` for common key prefixes (`sk-`, `ntn_`, `ghp_`, Slack `xox`, AWS access-key IDs, PEM private keys, `password=`). **No matches.** There is no `.env` and no credentials file in the tree.

This audit environment's git remote uses an access token injected for the agent. That token is not repository content and is not repeated here.

## Lane problem already in the tree

The repo is public (`github.com/sid77ai/sid-ai-os`). Several bundles contain fixture sentences that name the employer lane: ISC, SIOP, ABB, a SharePoint upload, and a colleague's first name in a meeting line. The harness showed those strings on screen for briefing, hivemind, inbox, mission, and settings. This is authored demo copy, not a live employer extract. It still conflicts with I-4, and it is already published.

This audit does not quote those sentences. A later PR should delete them. That deletion is not done here, because this PR is documentation plus the harness.

Claire is modelled as an "ISC / Work" specialist with employer skills. Operating Rules §4 and AD-005 say persona names are prompt labels with no separate execution path. The employer lane's guardrails (no transcripts, no team-member data, no performance labels) are not represented as code.

## Map against invariants and modules

| ID | Requirement | In this repo |
| --- | --- | --- |
| I-1 | One canonical context entry per project | No reader of Context headers. Each plugin is its own invented context. |
| I-2 | Claims typed as fact, assumption, or decision | Cockpit renders fixture decisions (`D-2026-0xx`) as if they were records. |
| I-3 | Provenance for anything acted on | No retrieval record. Settings fabricates latency. |
| I-4 | Four lanes never cross | No filter. Fixture copy crosses into the employer lane. |
| I-5 | Humans decide consequential change; agents propose | Approve, route, promote, and kill-switch controls change local component state only. |
| I-6 | Canonical data is plain text; vendor memory is a cache | No canonical store. Skills show `memoryCount` figures with no store behind them. |

| Module | v2.0 implementation | This repo |
| --- | --- | --- |
| M-01 Identity | Operating Rules identity block. Vendor memories are caches. | `PRODUCT.md` describes one operator. It is not the canonical block. |
| M-02 Portfolio | Projects DB index | Absent. |
| M-03 Project context | Context header plus Reviewed date | Absent. Header was not fetched. |
| M-04 Decisions | Tier-1 table with a Source column | Fake decision rows in audit and war room. |
| M-05 Knowledge | Research pages; KB/Resources as an index | Absent. |
| M-06 Execution state | Next 3 on the header. Project Tasks frozen (AD-003). | Fake queue statuses. Do not build a task database. |
| M-07 Relationships | Empty slot | Leave empty. |
| M-08 Retrieval | Entry protocol, two modes | Absent. |
| M-09 Code | Private repos and ADRs | This public repo. No ADR in-tree. |
| M-10 Routing | Cowork/Projects/Code plus a vendor-neutral reflex contract. Laya and Jev are candidates, not modules. | A painted roster of Sonnet/Haiku/Opus. No router. |
| M-11 Write-back | Three levels; weekly pass | No writer. Local buttons are not Level 1 landings. |
| M-12 Automation | Empty slot. AD-010: no scheduled or autonomous agents. | Settings shows Scheduler default ON. That switch does nothing, and it must not be implemented. |
| M-13 Confidentiality | Lane by instruction today. Structural enforcement is T-9, after a breach. | No control. Fixtures ignore the lane. |
| M-14 OS meta | The architecture page | `README.md` describes a different system than v2.0-rc1. |

Frozen or read-only, from Operating Rules §6 and the lab register. Nothing in this repo writes to them, and nothing should:

Project Tasks, AI-OS Context Hub, SG Briefs, SG Inbox, SG Event Log, SG Object Registry, SG Skills Registry, Prompt Library and Council, SG Agent Personas, Workspace Scorecard and Standards Checks, Mem0.

The hive-log copy claims "AI-OS Context Hub updated" and filing into SG Inbox. Those databases are on the read-only and archive lists. The copy is false for this codebase, and it names the wrong direction of write even as fiction.

AD-013: no deletions, schema rewrites, or integration disconnections during the migration phase. This PR adds files only.

## Related "SID OS" app

This run did not find an Expo/Next app named SID OS.

- Origin namespace `sid-japan77` lists one repository, `vanyam-greens-intelligence`. That is family-venture material. It was not opened.
- `sid77ai` on GitHub lists 11 repositories. None is named SID OS. The nearest neighbours are this repo and `sid-ai-os-redesign` (described as an editorial HTML redesign of the same cockpit). Brewfinder is a separate Next.js product.

Do not block the gateway on that app. If Sid supplies the URL, a later phase may borrow responsive shell patterns after a lane check. Do not share a data client with the family-venture repo or with employer repositories.

## Not claimed

- Hermes was not installed and no live dashboard was opened.
- No model provider was called.
- Notion was read once, for the architecture page, because the attachment was truncated. No page was updated.
- `sid-ai-os-redesign` was not reviewed beyond its repository description.
