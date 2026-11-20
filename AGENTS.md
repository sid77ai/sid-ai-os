# SID AI-OS: repository instructions for coding agents

## Scope and source of truth

This repository is the SID AI-OS **Hermes dashboard plugin pack**, not the entire Hermes gateway or the canonical store for personal knowledge. Start by reading `README.md` and `PRODUCT.md`. Existing plugins live in `sid-*/dashboard/` and register through `window.__HERMES_PLUGINS__`. The distributable entry point is usually `dashboard/dist/index.js`; this project does not currently declare a build step.

Treat design mockups, seeded arrays, and simulated approval screens as demonstrations **until a real backend and its audit evidence are verified**. A UI label describing an approval or audit trail is not proof that an approval is enforced or persisted.

## Engineering workflow

1. Inspect the relevant plugin manifest, code, and neighboring patterns. State the affected files and blast radius.
2. For non-trivial changes, propose a small plan with acceptance criteria and a rollback approach. Use Plannotator for human plan review when installed; otherwise request explicit written plan approval before implementation.
3. Choose only the Pstack skills appropriate to the task. Prefer `architect` + `arena` for cross-boundary designs, `tdd` for behavior changes, `interrogate` for adversarial review, and `sharpen` for improving ambiguous briefs. Skills are aids, not substitutes for evidence.
4. Make the smallest change that satisfies the approved plan. Do not add new runtime dependencies, framework rewrites, or background agents without a measured need and approval.
5. Run `node scripts/check-plugins.mjs`, plus any relevant focused tests. When a Hermes runtime is available, manually verify the affected tab and distinguish runtime evidence from static checks.
6. Present a diff for review (Plannotator code review where available; otherwise GitHub PR review). Record tests run, limitations, and any unverified claims in the PR description.
7. Open a **draft pull request**. Never auto-merge, deploy, modify production integrations, or perform outbound actions without explicit operator approval.

## Boundaries

- This repository is **public** despite its proprietary license. Never commit personal data, employer/confidential information, tokens, credentials, private URLs, logs containing personal information, or secrets.
- Do not synchronize Notion pages, email, calendar, or production agent memory into this repository.
- Keep employer/work and personal/venture contexts segregated. No real-world approval is granted by mock UI or a generated agent message.
- No shell one-liners that execute remote installers without inspection and approval. Pin or verify third-party releases where feasible.
- Do not overwrite uncommitted local work, bypass failing tests, or reclassify a missing runtime check as passed.

## Completion evidence

Report: changed files; reviewer decision and remaining dissent; automated checks and results; Hermes manual test status (pass/fail/not run); security/privacy check; and exact open questions. Do not claim Plannotator or Pstack is installed or tested unless verified in the user's own development environment.

See `docs/agent-review-pilot.md` for the initial Plannotator + Pstack pilot.
