# Evaluation: last30days and AG-UI

Lane: personal ventures. Write level: 2, propose only. This document is a fit assessment against this repository, the PR-0 architecture, and the Phase 1 lane guard. It implements nothing, starts no phase, writes nothing to Notion, and adds no scheduler.

## Verdict

| Project | Recommendation | Where it belongs | What stays out |
|---|---|---|---|
| [last30days-skill](https://github.com/mvanhorn/last30days-skill) v4.4.0 | **Adopt later, and stay outside the gateway** until a later Phase 4 change is approved | A one-shot research command Sid runs himself, or, only after the acceptance criteria below, one named tool on the Phase 4 allowlist | `--store`, `research.db`, `library.db`, the watchlist, cron, discovery queue, browser cookies, local corpus, public publish, and vendor rerank of unsanitised snippets |
| [ag-ui](https://github.com/ag-ui-protocol/ag-ui) 1.0 | **Adopt later as the Phase 5 gateway-to-UI wire** | The loopback gateway as producer, the self-hosted UI as consumer, once Phase 5 needs streaming plus a human pause | Phase 2, CopilotKit app scaffolds, subagents, persisted thread state, and any reading of the protocol as an approval |

Neither project is operational in SID AI OS. This run did not install or execute either one.

## What was read

| Source | Inspected revision | What was used |
|---|---|---|
| `mvanhorn/last30days-skill` | `bb2f1ed2b9f6d07b90557c5eebd736b566533fec` (20 Nov 2026) | README, `LICENSE`, `pyproject.toml` (version 4.4.0), `.claude-plugin/plugin.json`, `SECURITY.md`, `skills/last30days/scripts/store.py`, `skills/last30days/scripts/watchlist.py` |
| `ag-ui-protocol/ag-ui` | `1de7b12898f2aadd17fb0f03cbbe96dd2c07ddc9` | README, `LICENSE`, `SECURITY.md`, `spec/1.0/`, `sdks/typescript/packages/proto/src/proto/events.proto`, `types.proto` |
| This repository | Phase 1 head `e6cbd27590b41ccb18d3ea8562a9435122ea9154`, on top of the PR-0 proposal | `docs/architecture/proposal.md`, `gateway/src/lane.ts`, `gateway/src/prompt.ts` |
| Attached Expo-desk note | Compiled 21 Nov 2026, a different context | Input only. It is not a decision for this repository |

The attached note describes a last30days desk inside an Expo SID OS app, with AG-UI as the preferred streaming wire. This repository is the Hermes plugin pack plus the proposed loopback gateway. No Expo or Next.js SID OS application was found here, and this evaluation does not depend on one. Where the note and the invariants disagree, the invariants win. The disagreements are stated in each section.

## last30days

### What it is

`last30days` is an MIT-licensed Claude Code skill (also Codex, Cursor, Gemini, OpenClaw, Hermes, Copilot) plus a local Python 3.12 engine. `pyproject.toml` declares version **4.4.0** and an empty runtime dependency list. The engine searches a window of recent public posts and pages, scores them, and asks the host model to write a sourced brief.

Keyless sources named in the README: Reddit comments, Hacker News, Polymarket, GitHub, patents, and careers pages. Optional paid or keyed sources: X (bearer token, cookies, or Xquik/xAI), YouTube via `yt-dlp` or ScrapeCreators, TikTok and Instagram via ScrapeCreators, Truth Social, Bluesky, web search via Brave or Perplexity or OpenRouter, and a local corpus. If an OpenAI, xAI, OpenRouter, or Gemini key is present, the engine sends the topic and retrieved snippets to that provider for reranking. Otherwise it scores locally.

`SECURITY.md` states that retrieved posts, comments, transcripts, and pages are untrusted. The engine fences them in prompts and tells the host model to treat them as evidence. That is a mitigation inside their skill. It is not a lane control, and it does not bind this gateway.

### What it would add, and what it would replace

It adds a personal-ventures research brief: recent public discussion of a topic Sid names, with URLs. It replaces nothing in this repository. The Hermes plugins do not perform this search. M-08 is the context-entry retrieval protocol, not a web crawler. M-05 knowledge remains Notion pages. A web brief is an external evidence packet, not a context entry.

### `--store` is a memory database

The attached note calls the store a local findings log and says to leave it off. The schema is stronger than a log, and it conflicts with I-6, AD-004, and the standing constraint against a new memory database.

`skills/last30days/scripts/store.py` opens SQLite at `~/.local/share/last30days/research.db` (or beside `--save-dir`). The schema creates:

- `topics`, including a `schedule` column
- `research_runs`, including token counts and `token_cost`
- `findings`, including author, content, summary, scores, and sighting counts
- `findings_fts`, an FTS5 full-text index over content, summary, title, and author
- `settings`, whose defaults include `daily_budget` of `5.00`
- further tables for sightings, a discovery queue, and removed-run usage

`SECURITY.md` also lists `library.db` (a search index of saved reports), `briefs/*.json`, `last-report.json`, and `corpus-cache.json`. The engine has no purge command. Watchlist, `--store`, `LAST30DAYS_STORE=1`, and `--discover` (unless `LAST30DAYS_DISCOVERY_QUEUE=off`) create `research.db`.

That is a persistent, searchable research memory with its own topic list, schedules, and full text. Vendor memory is a cache under I-6 only when the canonical copy is plain text or Notion and a human chose the cache. This store is the canonical copy of the findings. **Reject `--store`, `library.db`, the discovery queue, and the briefing JSON store.** A single Markdown brief from one manual run can sit in the chat tab as a session artefact. It is not written to Notion, and it is not written to SQLite.

### Watchlist and cron conflict with M-12

`watchlist.py` adds topics with a schedule. The default is `0 8 * * *` (daily at 08:00). `--weekly` is `0 8 * * 1` (Mondays at 08:00). The run path sets `LAST30DAYS_SCHEDULED_RUN=1`, records the run in the store, and skips when `daily_budget` (default $5.00) is exceeded or when a run has an unknown provider charge. The code comments describe the watchlist as an unattended cron host.

AD-010 leaves M-12 empty: no scheduled or autonomous agents. The attached note's weekly Monday desk is the same cron shape and is rejected with it. A budget cap does not make an unattended job an approved agent.

### Phase

Not Phase 1, 2, or 3. The lane guard has no HTTP client and no tool runtime. Phase 2 is the model gateway. Phase 3 is read-only Notion.

The earliest home is **Phase 4**, as one name on the tool allowlist, default still empty. Until a Phase 4 change names it, **it stays outside the gateway.** Sid can run the MIT skill in his own Claude or Cursor session for a personal topic. That session is not this gateway, does not receive Notion tokens, and does not become an M-12 job.

### Invariants

| Invariant | Fit |
|---|---|
| I-1 One context entry per project | A brief is not a context entry. It must not be saved into the AI-OS Context Hub or any other Notion database. |
| I-2 Typed claims | Posts are untrusted evidence. A brief is an AI-drafted, unverified assumption until Sid checks a citation. The engine's own scores are not facts. |
| I-3 Provenance | Usable only when every claim in the brief carries a URL, a source name, and the retrieval date. A brief without citations is discarded. |
| I-4 Four lanes | The engine has no lane concept. Reddit, X, YouTube, careers pages, patents, and a local `--corpus` will return whatever matches the query, including employer, family, and career material. A topic such as a person, an employer product, or a broad trade term is an I-4 failure even when the command is "personal". The attached note's later example of an employer-academy topic is off-lane and is not a candidate. |
| I-5 Human authority | A one-shot command Sid types is a proposal plus a draft. Watchlist, discovery mode, and auto-promotion of a brief into a plan are agents acting. Reject those. |
| I-6 Notion canonical, no new memory database | Plain-text output of one run can be read and then dropped. `--store` and `library.db` are a new memory database. Reject them. |

### Security and cost

- **Lane leak into a model.** Rerank sends the topic and snippets to OpenAI, xAI, OpenRouter, or Gemini when those keys exist. Snippets are public text that can name employer work, family, or career material. Phase 1 `buildOutboundPrompt` drops tool text that contains a denylist marker and ignores client-supplied page ids. It does not understand a free-text topic. A gateway tool would have to refuse the topic before the process starts, then run the returned brief back through the same marker filter before any model call. Marker filtering catches the synthetic corpus. It does not catch real employer prose that is not on the marker list. That is why the topic list has to be an explicit allowlist Sid writes, starting empty.
- **Prompt injection.** A Reddit comment or a YouTube transcript can contain instructions. The gateway must treat the brief as data. It must not promote brief text into a tool call, a Notion id, or a system prompt. `SECURITY.md` documents their fence. The gateway still re-checks.
- **Keys and cookies.** API keys live in `~/.config/last30days/.env`. Browser cookie reads are off until consent. The engine can read X `auth_token` and `ct0`, and a Truth Social session cookie, and on macOS it shells out to `security` and `openssl` to decrypt Chromium cookies. `SECURITY.md` lists further programs the engine may run: `node`, `yt-dlp`, `gh`, Bright Data, `grok`, `xurl`, `pass`, `pdftotext`. None of that belongs in the gateway process that will hold model and Notion credentials. Cookie harvest, logged-in Reddit, and the MCP browser-cookie flag stay off.
- **Local corpus.** `--corpus` reads files Sid points at. Pointed at the wrong directory, it pulls employer documents into a prompt. A gateway tool does not get a corpus path.
- **Publish.** The README's library publish path is public by default once invoked. A personal-ventures brief must not be published by this tool.
- **Cost.** Keyless sources are free at the point of use. Brave's free tier is 2,000 queries a month, then paid. ScrapeCreators is 10,000 free credits, then pay as you go. X uses project credits. Reasoning and web-search keys are extra model spend, and they send untrusted text off the machine. The watchlist's $5 daily default is irrelevant because the watchlist is rejected. A manual run still spends whatever keys are present, so a gateway invocation must force local scoring and must not inherit a shell full of those keys.
- **Licence.** MIT, copyright 2026 Matt Van Horn. This repository is proprietary. MIT code may be vendored later only with the copyright and permission notice kept. This evaluation vendors nothing.

### Acceptance criteria, if a later Phase 4 PR is approved

All of these are required. Missing one keeps the tool outside.

1. The tool name is on the Phase 4 allowlist. `runTool` still throws `tool-not-allowlisted` for every other name.
2. The only input is a topic string that exactly matches a list Sid has approved as personal-ventures. The list starts empty. Unknown topics never spawn the process.
3. The child environment sets `LAST30DAYS_STORE=0`, disables the discovery queue, passes no `--save-dir` that would create `research.db`, and unsets browser-consent and cookie flags. A test asserts that `research.db`, `library.db`, and `briefs/` are absent after a fixture run.
4. The child is not given a corpus path, a publish flag, or a reasoning-provider key. Scoring stays local.
5. The topic and the returned brief are scanned by the lane guard before any model request. A fixture snippet containing a denylist marker never appears in an outbound body, and the model transport is not called for a rejected topic.
6. The brief is labelled AI-drafted and unverified, and every item carries a source URL. It is not written to Notion and not written to SQLite.
7. No cron, launchd, watchlist, or other scheduler is installed. `watchlist.py` is not invoked.
8. Provider keys for this tool, if any are ever approved, live in the gateway environment. The UI cannot pass them.

## AG-UI

### What it is

AG-UI 1.0 is an MIT-licensed event protocol between an agent backend and a user-facing application. It is not an agent runtime, a memory system, or a security boundary. The repository is maintained in the open by CopilotKit. `SECURITY.md` is a vulnerability-reporting policy for that project. It is not a threat model for SID AI OS.

The frozen 1.0 schema is `spec/1.0/schema.json`, with wire numbers in `spec/1.0/proto-freeze.txt`. The generated `EventType` enum has **31** values, numbered 0 through 30:

- Lifecycle: `RUN_STARTED`, `RUN_FINISHED`, `RUN_ERROR`, `STEP_STARTED`, `STEP_FINISHED`
- Text: `TEXT_MESSAGE_START`, `TEXT_MESSAGE_CONTENT`, `TEXT_MESSAGE_END`, `TEXT_MESSAGE_CHUNK`
- Tools: `TOOL_CALL_START`, `TOOL_CALL_ARGS`, `TOOL_CALL_END`, `TOOL_CALL_CHUNK`, `TOOL_CALL_RESULT`
- State: `STATE_SNAPSHOT`, `STATE_DELTA`, `MESSAGES_SNAPSHOT`
- Activity: `ACTIVITY_SNAPSHOT`, `ACTIVITY_DELTA`
- Reasoning: `REASONING_START`, `REASONING_MESSAGE_START`, `REASONING_MESSAGE_CONTENT`, `REASONING_MESSAGE_END`, `REASONING_MESSAGE_CHUNK`, `REASONING_END`, `REASONING_ENCRYPTED_VALUE`
- Subagents: `SUBAGENT_STARTED`, `SUBAGENT_FINISHED`, `SUBAGENT_ERROR`
- Escape hatches: `RAW`, `CUSTOM`

Input is `RunAgentInput`: `threadId`, `runId`, `messages`, optional `tools`, `context`, `state`, `forwardedProps`, and `resume`. Output is a stream of events, SSE or HTTP with Protobuf. Official SDKs exist for TypeScript (`@ag-ui/client`), Python (`ag-ui-protocol`), and .NET (`AGUI.Client`). The README also lists community SDKs and first-party adapters for other agent frameworks.

### What it would add, and what it would replace

It adds a typed stream from the loopback gateway to the UI: run lifecycle, text deltas, tool-call display, and a structured pause. It replaces the informal `{model, messages}` response shape **only at the UI boundary, and only in Phase 5**. It does not replace the lane guard, the allowlist, the model router, or Notion.

`RunAgentInput.tools` is whatever the client sends. In this architecture the UI cannot widen the tool allowlist. The gateway ignores client-supplied tool lists the same way Phase 1 ignores client-supplied page ids.

### Phase 2 and Phase 5

**AG-UI should not be the Phase 2 wire.** Phase 2 is the model gateway: loopback HTTP, provider keys in the environment, `store: false` where the provider supports it, and a JSON body the lane guard has already passed. A small JSON response, or a single text stream, is enough to prove that path. Adopting 31 event types, Protobuf, and a client SDK before a provider call exists adds a second protocol to a phase that has not started.

**AG-UI should be the Phase 5 gateway-to-UI wire, adopted later, if the UI needs streaming and a human pause.** Phase 5 is the responsive self-hosted UI. That is the first point where run events, tool-call rows, and an interrupt card have a user. The producer is the gateway. The consumer is the UI. `create-ag-ui-app` and the CopilotKit application scaffold are not adopted. Those scaffolds bring their own app, their own OpenAI wiring, and a framework this repository has not chosen.

Until Phase 5, the gateway speaks the small JSON shape from the proposal. Switching the UI to AG-UI is a Phase 5 decision with the acceptance criteria below. It is not a blocker for Phase 2.

### How interrupts map to I-5

`RUN_FINISHED` carries an `outcome` and a repeated `Interrupt`. `types.proto` defines `Interrupt` as something the run needs from outside before it can continue, such as an approval or a missing value. The fields are an id, an open `reason` string, an optional message, an optional `toolCallId`, an optional JSON Schema for the answer, an optional expiry, metadata, and a subagent id. `RunAgentInput.resume` carries the answers that continue a thread.

The protocol does not define approve, edit, or reject. The README says the application supplies that payload. A `RUN_FINISHED` with outcome success, a `pendingToolCallIds` list, or a frontend tool call is a completed run from the protocol's point of view. The comment on `pending_tool_call_ids` says the producer reports the unanswered calls and the application decides whether the thread continues.

So an interrupt **maps to I-5 only as a pause the gateway itself emits**.

- The gateway, not the UI and not the model, decides which tool names interrupt.
- For those names the gateway emits `RUN_FINISHED` with an interrupt and does not execute the tool.
- A resume executes the tool only when the resume payload is an explicit approval from Sid for that interrupt id and that tool-call id.
- Edit means Sid changed the arguments and the gateway re-validates them against the allowlist and the lane guard.
- Reject, or a missing resume, leaves the tool unexecuted.
- `pendingToolCallIds` is a display list. It is not approval.
- `CUSTOM`, `RAW`, `STATE_DELTA`, and tool-argument deltas are untrusted bytes. They cannot add a Notion id, a tool name, a provider key, or a schedule.

I-5 remains "agents propose, Sid disposes". The event is the proposal's envelope. The approval is Sid's action, checked again on the server.

### Invariants

| Invariant | Fit |
|---|---|
| I-1 One context entry per project | The protocol has no context-entry type. `context` on the input is ambient JSON. The gateway must not treat it as a Notion page id. |
| I-2 Typed claims | Text deltas and reasoning deltas are model output. The UI labels them unverified. Activity payloads are not facts. |
| I-3 Provenance | The protocol does not carry provenance. Phase 3 citations stay in the gateway's own prompt assembly. An AG-UI text event does not become a source. |
| I-4 Four lanes | The protocol will happily stream whatever the model says. The lane guard stays in front of it. `RunAgentInput.messages`, `context`, `state`, tool arguments, and `resume` are scanned before a model call and before a tool runs. A client cannot put a denied page id in `forwardedProps` and have it retrieved. |
| I-5 Human authority | Interrupts can express a pause. They are not authority. Subagent events (`SUBAGENT_*`, `parentRunId`) describe delegated runs. AD-005 says personas are prompt labels, not execution paths. This gateway does not emit subagent events and does not run a second agent because a model asked for one. |
| I-6 Notion canonical, no new memory database | The protocol has no database. `threadId`, `STATE_SNAPSHOT`, `MESSAGES_SNAPSHOT`, and `REASONING_ENCRYPTED_VALUE` become a memory store if the gateway writes them to disk or to a vendor. Phase 5 keeps the thread in the browser tab. Encrypted reasoning blobs are not stored and not echoed back to a provider. `store: false` on the model call stays in force. |

### Security, cost, and licence

- **Client trust.** `RunAgentInput` is caller-controlled. The UI is on localhost, and it is still an untrusted client for page ids, tool names, and secrets. The gateway validates the input and then builds the provider request itself.
- **Injection through the stream.** Tool arguments and `CUSTOM` values can carry instructions or a denied marker. The Phase 1 rule still applies: tool text that contains a marker is dropped, and a marker in the outbound body aborts the call.
- **State sync.** `STATE_DELTA` is an RFC 6902 patch. Applying client patches to server state would let the UI rewrite the allowlist or the lane. The gateway does not apply UI state onto its config.
- **Subagents and raw events.** `RAW` forwards a provider event verbatim. `SUBAGENT_STARTED` can be tied to a parent tool call. Both are out of scope. Emitting them would imply a multi-agent runtime this architecture rejected.
- **Cost.** The protocol charges nothing. Model tokens are the Phase 2 cost, reported optionally on `RUN_FINISHED.usage`. CopilotKit Cloud is a separate commercial product and is not part of this recommendation. Self-hosting the UI does not require it.
- **Licence.** MIT, copyright 2025. Same vendoring rule as last30days: keep the notice if a later phase copies SDK code. This evaluation vendors nothing. The .NET SDK is irrelevant to the Node gateway. Python is irrelevant until a Python component exists. The TypeScript client is the only SDK a Phase 5 UI would need, and only if the UI is a web client.

### Acceptance criteria, for the Phase 5 decision

1. Phase 2 is already serving the small JSON gateway on loopback, with the lane guard in front of every provider call. AG-UI is additive at the UI edge.
2. The gateway is the only producer. The UI cannot open a second agent URL or supply a provider key.
3. The first adopted subset is `RUN_STARTED`, `RUN_FINISHED`, `RUN_ERROR`, and the text-message events. Tool-call events are added only for tools already on the allowlist.
4. `STATE_*`, `MESSAGES_SNAPSHOT`, `REASONING_ENCRYPTED_VALUE`, `SUBAGENT_*`, `RAW`, and `CUSTOM` are not persisted and cannot change config. A test feeds each of them a denylist marker and asserts no provider call and no tool execution.
5. A consequential tool ends in an interrupt and does not run. Resume without Sid's explicit approval for that interrupt id does not run it. `pendingToolCallIds` alone does not run it.
6. Thread state lives in the tab. No transcript file, no SQLite, no vendor thread store.
7. The lane-guard tests still pass, including the static ban on HTTP inside the guard and the ban on Notion writes.

## What this evaluation does not do

- It does not add a dependency, a gateway route, a UI, or a tool.
- It does not start Phase 2.
- It does not write to Notion or to a new database.
- It does not install cron, launchd, a watchlist, or any other scheduler.
- It does not change the Hermes plugins or the Phase 1 allowlist.
- It does not treat the attached Expo-desk note as the layout or the backlog of this repository.
