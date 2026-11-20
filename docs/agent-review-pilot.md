# Agent review pilot: Plannotator + Pstack

**Status:** proposed workflow; tools are **not installed or exercised by this PR**.  
**Scope:** coding-agent review discipline for the existing SID AI-OS Hermes dashboard plugin pack.  
**Owner approval required:** installation of third-party tooling, enabling hooks, connecting external systems, merging, or production deployment.

## Why this pilot

The repository already has `sid-inbox`, `sid-hivemind`, `sid-audit`, and `sid-skills` screens. Some of their content is seeded or illustrative. The pilot tests whether agent-assisted changes can be **reviewed and verified** without treating dashboard demonstrations as enforcement.

**Do not** create a duplicate approval dashboard, sync personal/employer data to GitHub, or connect Plannotator directly to Hermes before confirming its API, threat model, and deployment options.

## Phase 0: baseline (already committed to the pilot branch)

- `AGENTS.md` and `CLAUDE.md`: basic cross-agent operating policy.
- `scripts/check-plugins.mjs`: checks manifests, entry files, tab path collisions, plugin registration names, and JS syntax.
- `.github/workflows/plugin-smoke.yml`: runs the static check for PRs.

These checks do not prove the Hermes dashboard renders or that any approvals persist.

## Phase 1: inspect and install locally — explicit opt-in

1. Use a development machine or disposable container. Run `git status` and record installed versions of `node`, `claude`, and `codex` as applicable.
2. Review the source, maintainers, release, license, network behavior, and installation scripts before giving third-party code shell access.
3. Plannotator: read the upstream [installation guide](https://docs.plannotator.ai/open-source/start/installation) and [GitHub README](https://github.com/backnotprop/plannotator). The upstream currently advertises `curl -fsSL https://plannotator.ai/install.sh | bash` for macOS/Linux/WSL, but **do not run a piped network installer without inspection**. When possible, pin a version and verify published checksums/attestations. A minimal binary-only install is available using the installer's `--minimal` option; Claude Code/Codex-specific integrations are separate or auto-detected depending on installer mode.
4. Pstack: review the [standalone mirror](https://github.com/backnotprop/pstack) and its original source at `cursor/plugins/pstack`. Upstream supports `npx skills add backnotprop/pstack`. Inspect selected skill files before enabling them; start with `architect`, `arena`, `tdd`, `interrogate`, `sharpen`, and only if useful `swarm`. For `architect`, also install its dependency `arena`. Confirm slash-command names in the chosen agent.
5. Keep installation **scoped to the pilot environment** when possible. Record versions/commit SHAs and all modified agent config/hook files. Do not allow auto-update before evaluating updates.
6. **Prompt Tower remains deferred.** Repository-context packaging is already available in coding agents; only test it if an actual cross-agent context-transfer problem is measured.

## Phase 2: first end-to-end experiment

Use one small, reversible improvement to `sid-inbox` or `sid-audit` (for example, add a visible `DEMO DATA` indication to a seeded dataset and a focused regression test). Do not fabricate a live approval backend.

1. **Plan:** ask Claude Code to inspect actual code and propose the minimum diff, risks, and explicit acceptance criteria. Review it using Plannotator; reject once with a concrete annotation and verify that the agent revises the plan rather than implementing the rejected one.
2. **Implementation:** after approval, implement on a dedicated branch/worktree. Use appropriate Pstack skills. Preserve the public repository's proprietary-license and confidentiality boundaries.
3. **Test:** run `node scripts/check-plugins.mjs` and a relevant targeted test. For UI changes, test in a real Hermes dashboard and capture a screenshot or precise reproduction steps. If Hermes isn't available, mark `runtime: NOT TESTED` rather than passing it.
4. **Independent review:** use Pstack `interrogate` (or an independent reviewer) to try to falsify assumptions and find defects. Confirm findings against code or runtime; do not merge speculative reports.
5. **Evidence:** produce a draft PR with the plan decision, test output, runtime status, privacy scan, reviewer notes, and any outstanding blockers. Human approval is required before merge.
6. **Rollback:** uninstall third-party integrations using their documented uninstall procedures and revert only the pilot changes. Do not delete or overwrite other agent settings.

## Evidence template

| Field | Evidence to record |
| --- | --- |
| Task and scope | issue/PR link, files changed, goal |
| Plan | proposed plan; approval/rejection and comments |
| Agents | Claude Code/Codex versions and enabled Pstack skills |
| Tool provenance | Plannotator/Pstack versions or commit SHAs |
| Static tests | command, exit status, output |
| Runtime test | Hermes version, steps, screenshot/result or NOT TESTED |
| Adversarial review | confirmed defects and disposition |
| Security | data touched, third-party access, outbound calls, credentials scan |
| Outcome | operator verdict and follow-up |

## Success criteria

Accept the workflow only if all of the following hold:

- A rejected plan produces a visible revision **before** edits begin.
- Review feedback on an actual diff is actionable and retained in the draft PR.
- A second agent or independent pass finds/validates issues without adding unnecessary complexity.
- Static checks pass, and missing runtime verification is explicitly reported.
- No private/work data or secrets leave their intended environment.
- The review flow improves traceability without creating a parallel AI OS source of truth.

If any criterion is unmet, record the failure; do not promote the pilot to production.

## Follow-on, not part of this PR

After a successful pilot, design a Hermes-side adapter using a **documented and authenticated** integration endpoint. Model review artifacts as `review_request_id`, `project_id`, `agent_run_id`, `plan_revision`, `decision`, `reviewer`, `timestamp`, and `evidence_uri`. Do not implement it without confirming Plannotator's available APIs, Hermes permissions, data retention, authentication, and the operator's explicit design approval. The eventual live data source must supersede seeded examples, not coexist silently with them.
