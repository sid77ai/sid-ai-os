# SID AI-OS — Hermes Agent Dashboard Plugins

**SID AI-OS** is a multi-agent operating system built on top of [Hermes Agent](https://hermes-agent.nousresearch.com). It gives AI agents a shared cockpit — a visual command center where specialized agents collaborate, debate decisions, route tasks, and log activity across your entire tool stack.

This repo contains the **dashboard plugin layer**: 5 custom Hermes dashboard plugins that implement the SID AI-OS interface. Each plugin adds a dedicated tab to the Hermes dashboard, turning it from a generic agent runner into a mission control surface.

## What It Is

SID AI-OS is not a standalone app. It's a **plugin pack** for Hermes Agent's dashboard (the `/dashboard` UI served by the Hermes gateway). Once installed, the dashboard becomes a multi-agent operations center with:

- **Mission Control** — real-time system telemetry, task queue with live status (QUEUED → RUNNING → BLOCKED → DONE), ATC-style alert strips
- **Agent Roster** — every specialist agent (JARVIS, Birgit, Kenji, Kumar, Q, Claire, Hans) with model, role, status, and last activity
- **War Room** — structured multi-agent council debates with impulse → open floor → cross-views → consolidate → return phases, decision logging, cost tracking per debate
- **Bridge** — Telegram-style chat mockup showing how agent communication flows through a messaging surface (JARVIS routes, Birgit drafts, Hans gates)
- **Hive Mind** — unified activity log across all agents and channels (Telegram, Email, Notion, GitHub, System), pending approval queue with risk levels

## Architecture

```
Hermes Agent Dashboard
├── Built-in tabs (Sessions, Skills, Cron, etc.)
└── SID AI-OS Plugin tabs
    ├── MISSION    → sid-mission    (cockpit + telemetry)
    ├── AGENTS     → sid-agents     (specialist roster)
    ├── WAR ROOM   → sid-warroom    (council debates)
    ├── BRIDGE     → sid-bridge     (chat interface)
    └── HIVE MIND  → sid-hivemind   (activity log + approvals)
```

Each plugin is a self-contained directory with:
- `dashboard/manifest.json` — plugin metadata (name, icon, tab position, entry point)
- `dashboard/dist/index.js` — the plugin bundle (vanilla JS, no build step)

## Install

Copy plugin directories to `~/.hermes/plugins/`:

```bash
cp -r sid-* ~/.hermes/plugins/
```

Restart the Hermes dashboard:

```bash
hermes dashboard
```

Plugins appear in the dashboard sidebar under "Plugins" and their tabs show up in the main navigation bar.

## Agent Roster

| Agent | Model | Role | Scope |
|-------|-------|------|-------|
| JARVIS | Sonnet | Orchestrator | Task routing, briefing, coordination |
| Birgit | Sonnet | Personal Ops | Inbox triage, email drafting, calendar |
| Kenji | Haiku | Workspace | File management, context hub |
| Kumar | Sonnet | Build | CI/CD, eval harness, deployments |
| Q | Opus | Research | Multi-source synthesis, decision briefs |
| Claire | Sonnet | ISC / Work | SIOP drafts, supply chain analysis |
| Hans | Haiku | Governance | Security gate, PII scan, cost monitoring |

## War Room Decision Flow

The War Room plugin implements a structured council protocol:

1. **IMPULSE** — A question or proposal is raised (e.g., "Ship v3 Monday?")
2. **OPEN FLOOR** — Any agent can request to join the debate
3. **CROSS-VIEWS** — Each agent submits their position (Build, Research, Governance, Ops)
4. **CONSOLIDATE** — JARVIS synthesizes positions into a verdict with action items
5. **RETURN** — Decision is logged with ID, cost, and any dissents

Every debate tracks cost (LLM tokens spent) and produces an auditable decision record.

## Theme

Plugins use the SID AI-OS warm cream/orange palette:
- Background: `#FAFAF8`
- Accent: `#E07340`
- Fonts: Bebas Neue (display), DM Sans (body), JetBrains Mono (mono)

## Tech

- Vanilla JS — no build step, no npm dependencies
- React.createElement via `window.__HERMES_PLUGIN_SDK__`
- Registers via `window.__HERMES_PLUGINS__.register(name, Component)`
- Each plugin is an IIFE that injects its own styles and fonts

## Repo

`github.com/sid77ai/sid-ai-os`

## License

MIT
