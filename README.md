# SID AI-OS — Hermes Dashboard Plugins

Custom dashboard plugins for [Hermes Agent](https://hermes-agent.nousresearch.com) implementing the SID AI-OS concept.

## Plugins

| Plugin | Tab | Description |
|--------|-----|-------------|
| `sid-mission` | MISSION | Live cockpit — real-time telemetry, ATC strips, inbox queue |
| `sid-agents` | AGENTS | Agent roster — status, capabilities, cost tracking |
| `sid-warroom` | WAR ROOM | Council UI — decision log, debate threads |
| `sid-bridge` | BRIDGE | Telegram-style chat mockup — phone UI, thread flow |
| `sid-hivemind` | HIVE MIND | Session logs, activity feed, agent memory |

## Install

Copy plugin directories to `~/.hermes/plugins/`:

```bash
cp -r sid-* ~/.hermes/plugins/
```

Restart the Hermes dashboard:

```bash
hermes dashboard
```

Plugins appear in the sidebar under "Plugins".

## Theme

Plugins use the SID AI-OS warm cream/orange palette:
- Background: `#FAFAF8`
- Accent: `#E07340`
- Fonts: Bebas Neue (display), DM Sans (body), JetBrains Mono (mono)

## Tech

- Vanilla JS — no build step, no npm dependencies
- React.createElement via `window.__HERMES_PLUGIN_SDK__`
- Registers via `window.__HERMES_PLUGINS__.register(name, Component)`

## License

MIT
