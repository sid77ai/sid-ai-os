# Minimum architecture proposal

**Lane:** personal ventures only. **Write level:** 2. This document proposes. It does not authorise implementation, a new memory store, a scheduler, or a Notion write.

**Recommendation:** leave the ten Hermes plugins dormant (LAB-14) and add a separate local process: a model gateway, a read-only Notion retriever, an empty tool allowlist, and a small responsive UI. Notion stays the canonical knowledge source. The gateway is the only component allowed to retrieve, and it refuses every page that is not on a personal-ventures allowlist before any model sees text.

Three reasons:

1. The plugins are fixture views. Mission and Hive Mind call Hermes session methods, then keep rendering demo copy. Pointing them at live data would mix that copy with real sessions and would not create a lane boundary.
2. v2.0-rc1 already chose this restraint. Personas are labels (AD-005). There is no memory engine (AD-004). M-12 stays empty (AD-010). LAB-14 stays dormant until a career or content use that this proposal does not take up.
3. I-4 cannot be enforced in the browser. The filter has to run in the process that talks to Notion and to the model, and tests have to show employer bytes never enter that process's outbound prompt.

## Shape

```
Browser (personal-ventures UI)
    │  loopback only, no provider keys, no Notion token
    ▼
Local gateway
    ├─ Lane guard     deny by default; personal-ventures allowlist
    ├─ Notion reader  read methods only; allowlist checked before HTTP
    ├─ Prompt builder citations in, uncited text out
    ├─ Model router   one internal chat call
    │     ├─ OpenAI-compatible: GPT, Grok, LM Studio
    │     └─ Anthropic: translated at the edge of the router
    └─ Tool allowlist empty until a later accepted change
```

The UI sends `{ model, messages }`. It cannot send a page id, a token, or a tool name. Retrieval uses the server allowlist, not the model's choice. That is what keeps an employer page out of GPT, Claude, Grok, and LM Studio alike.

Vendor conversation memory stays off where the provider API allows it (`store: false` or the provider's equivalent). I-6: those products are caches, and this gateway should not fill them. Canonical text remains the Notion page.

No new memory database. The open chat thread lives in the browser tab for that session. Closing the tab drops it. A transcript file, if ever wanted, is a later Level-2 proposal, not a hidden store.

No scheduler, no cron, no background agent, no persona runtime. M-12 stays an empty slot. Claire, Kenji, Kumar, Q, JARVIS, Birgit, and Hans are not execution paths.

## What is reused

- The cream and orange palette already in the plugin bundles (`#FAFAF8`, `#E07340`, DM Sans, JetBrains Mono), copied into a new stylesheet as values. The bundles themselves stay unloaded.
- The decision to keep Notion as the system of record (AD-001, I-6).
- Nothing else. There is no retrieval, router, or allowlist to extend.

The Expo/Next "SID OS" app was not in the Origin namespace visible to this run, nor in `sid77ai`'s GitHub repositories. Do not depend on it. If Sid later names the repository, borrow layout patterns only, after confirming it holds no employer or family data.

## Lane guard

Configured lane for this program: `personal-ventures`. There is no runtime switch to employer, family, or career.

Server rules:

1. The allowlist is a file of Notion page and database IDs that Sid has named, committed only as an example with synthetic IDs. Real IDs stay in an untracked local file.
2. A denylist holds the employer containers the Operating Rules already isolate (SG Meetings, the ISC people-ops hub, Control Tower, PackPilot, ISC CoE). Family and career containers are denylisted too for this phase, including partner-shared Café material until Sid puts a specific page on the allowlist.
3. The Notion adapter exports retrieve and query functions only. Create, update, and delete are not imported.
4. Every id is checked against the allowlist before an HTTP call. A denylisted parent fails closed even if an allowlist edit was too broad.
5. Search snippets from any other lane are discarded unread (Operating Rules §2). They are not logged.
6. The prompt builder receives only excerpts that survived steps 4 and 5, each with page URL and retrieval time.
7. The model response is returned to the UI with those citations. It is not written to Notion.

The UI lane badge is a label. Removing it in the browser must not change what the gateway returns.

### How this will be tested

Synthetic corpus only. Do not put real employer text in the test fixtures.

| Test | Pass |
| --- | --- |
| Allowlisted page is retrieved and cited. | Excerpt present, URL present. |
| Any other id, including a denylisted employer id. | Zero HTTP calls. Excerpt absent from the outbound model body. |
| Model or client asks for a page by id. | Gateway ignores the id and uses the allowlist. |
| Tool name not on the allowlist. | Rejected before execution. |
| Tool output that contains a denylisted marker. | Dropped before the next model call. |
| Missing provider key. | Explicit error. No fixture paragraph substituted. |
| Notion write helper. | Not exported. A static test fails the build if `pages.create`, `pages.update`, or `databases.update` appear under `gateway/`. |

Phase 5 adds a browser check of the chat flow on a desktop width and a narrow width: empty state, gateway error, and an answer with a citation. That check is part of accepting Phase 5, not part of this PR.

## Phases

Each phase is a later PR. None of them starts until Sid accepts this proposal. Plugins under `sid-*/` stay untouched unless a phase says otherwise.

### Phase 1 — Lane guard, no network

Files: `gateway/package.json`, `gateway/src/lane.ts`, `gateway/src/prompt.ts`, `gateway/test/lane.test.ts`, `gateway/config/personal-allowlist.example.json` (synthetic ids), `.gitignore` entry for `.env` and the real allowlist file.

Tests: the table above, using in-memory pages. No HTTP client is imported.

Risk: an allowlist that names a database also names its children. The phase-1 API takes page ids, not "search the workspace".

Acceptance: a denylisted fixture string never appears in the built prompt; an unknown id is rejected; `npm test` (or the chosen runner) passes offline.

### Phase 2 — Model gateway

Files: `gateway/src/server.ts` (bind `127.0.0.1`), `gateway/src/providers/openai.ts`, `anthropic.ts`, `xai.ts`, `lmstudio.ts`, `gateway/test/providers.test.ts`, `.env.example` with empty keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `XAI_API_KEY`, `LMSTUDIO_BASE_URL`).

LM Studio, GPT, and Grok go through an OpenAI-compatible chat-completions request. Anthropic is translated in `anthropic.ts` only. Keys come from the environment.

Tests: a local stub server records the outbound URL and body. The body must be the Phase 1 prompt. A missing key returns an error object, not demo copy.

Risk: provider-side retention. The adapter sets the provider's no-store flag when one exists, and the test asserts the flag is present.

Acceptance: four stub providers pass; the process refuses to bind a non-loopback host; no key is committed.

### Phase 3 — Read-only Notion

Files: `gateway/src/notion/read.ts`, `gateway/test/notion-read.test.ts`.

The reader calls Notion retrieve/query for allowlisted ids only. The test uses a local HTTP stub, not the live workspace, and asserts the employer id produces no request.

Risk: a database query returns children that were not individually allowlisted. Fail closed unless the child page's parent is the allowlisted database and that database is not on the denylist.

Acceptance: write endpoints are absent; the stub log proves the denylisted id was not requested; a live read of one personal page happens only if Sid puts a token in the environment and names the page. That live read is not required to merge the PR.

### Phase 4 — Tool allowlist

Files: `gateway/src/tools/registry.ts`, `gateway/config/tools.allowlist.json` containing `[]`, `gateway/test/tools.test.ts`.

No tool ships enabled. Adding a tool is a later reviewed change to that file, and the tool's output goes back through the lane guard.

Risk: a "helpful" default tool (web search, mail) would skip the lane story. The default stays empty.

Acceptance: an unknown tool name is rejected; the registry has no timer and no queue; output is re-filtered.

### Phase 5 — Responsive UI

Files: `ui/` (small Vite + React app), `ui/src/tokens.css` (palette values copied from the plugins), `ui/src/Chat.tsx`, `ui/src/api.ts` (loopback gateway only).

The screen is a chat with a model picker (GPT, Claude, Grok, LM Studio), a lane line that reads "personal ventures", and citations. It does not embed the Hermes bundles and does not ship the fixture roster.

Tests: component tests for empty, error, and cited states, plus a manual browser pass at desktop and mobile widths against the local gateway.

Risk: reintroducing the cockpit makes the product look operational while the data is still empty. The empty state says that retrieval is limited to the allowlist.

Acceptance: the three states work in the browser; the UI bundle contains no Notion token and no provider key; the plugins still behave as in the PR-0 harness.

### Not a phase

Reviving Hermes, turning on M-12, creating a memory database, writing to Notion, opening the employer lane, or tracking employer delivery (DEC-05) inside this process. DEC-05 can be a separate program with a separate allowlist and a separate deployment. A flag on this gateway is the wrong shape, because a flag can be flipped from the same process that holds personal and, later, employer tokens.

## Risks

1. **Public fixture copy.** This repo already publishes employer-lane demo sentences. Strip them in a follow-up before more people treat the cockpit as real.
2. **Partial Hermes calls.** If someone runs the plugins against a live Hermes, Mission will add a count on top of the demo queue, and Hive Mind will show live sessions next to the demo log. That is not a migration path.
3. **Instruction-only lanes elsewhere.** MIG-01a left Claude and ChatGPT memory enforced by instruction. This gateway does not fix those surfaces.
4. **Provider retention.** A no-store flag is necessary and may be incomplete. Local LM Studio is the path that keeps the prompt on Sid's machine.
5. **No CI today.** Lane tests need a workflow in Phase 1 or they will not run again.
6. **Font CDN.** The current plugins load Google Fonts. The new UI should ship its own fonts or use system fonts so a local session does not call out for type.

## Open questions for Sid

1. Confirm this interface stays personal-ventures-only, with DEC-05 (employer delivery tracked in the OS) handled by a different program.
2. Which Notion URLs are on the first allowlist? Candidates from the lane table are BrewFinder, Atlas, Ontology research, World Monitor, and the SID AI-OS header. Café Venture is partner-shared and stays out unless you name a page.
3. LM Studio base URL and the model ids you want listed, and which of GPT, Claude, and Grok should be wired in the first live test.
4. If the Expo/Next SID OS app should contribute shell patterns, what is its repository URL?
5. Should a follow-up PR delete the employer-lane fixture sentences from this public repo?
6. Confirm LAB-14 stays dormant and the new UI does not load these plugins.
7. Is a tab-scoped chat thread enough, with no transcript file, given "no new memory database"?
