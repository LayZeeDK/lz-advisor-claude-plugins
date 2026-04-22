# UAT 5 / Compodoc pipeline session notes

## Session 1 (plan) - 2026-04-22

- **First attempt:** session `f2eed2d9-c8dd-45e3-9bb5-38cd61e2b1bc` - 82 turns, $2.29, hit HTTP 429 rate limit before producing plan file. Trace archived as `traces/session-1-attempt-1-ratelimit.jsonl`. Cause: verbose prompt (8 KB with 6 deliverables + multiple constraints) triggered over-investigation loop.
- **Second attempt (successful):** session `8e6e5e15-4f0e-4849-9104-19d63ddba87f` - 38 turns, 252 s, $0.92. Plan file written to `plans/add-compodoc-to-storybook.plan.md`. Prompt reshaped to user canonical form: `/lz-advisor.plan <directive sentence>\n---\n<full Nx guide>`. One advisor consultation. Strategic Direction block emitted on stdout with proper markers (E-runtime regression-preserved).

## Session 2 (execute) - 2026-04-22

- Session `2c9ff6fb-f5d3-4b17-931d-3bc185c9e74b` - **Bun runtime crash** at trace line 103.
- Crash signature: `panic(main thread): Illegal instruction at address 0x7FF71A10355C` / `oh no: Bun has crashed. This indicates a bug in Bun, not your code.`
- Environment: Windows 11 arm64, Bun 1.3.13 under QEMU x86_64 emulation. Not a skill defect.
- **Progress at crash:** plan steps 1-4 committed atomically (`7488d78`, `010d160`, `77f183b`, `ed06362`); step 5 edit staged but commit did not execute - CLI process died on the `git add + git commit` turn.
- **Manual completion:** step 5 (`f5992aa chore(gitignore): ignore generated documentation.json`) committed directly to preserve pipeline scope for session 3 review.
- **Pre-crash session metrics:** 103 trace lines, 1 advisor consultation, 30 total tool uses (9 Read, 9 Bash, 5 TodoWrite, 4 Edit, 1 Write, 1 Agent, 1 ToolSearch). First-try advisor success.

## Branch state at session 2 close

```
f5992aa chore(gitignore): ignore generated documentation.json       (manual tail)
ed06362 feat(storybook): enable resolveJsonModule in .storybook/tsconfig.json
77f183b feat(storybook): assign compodoc JSON to global in preview.ts
010d160 feat(storybook): enable compodoc in storybook and build-storybook targets
7488d78 chore(deps): add @compodoc/compodoc as explicit devDependency
```
