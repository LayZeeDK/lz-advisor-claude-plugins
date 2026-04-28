---
phase: 6
slug: address-phase-5-6-uat-findings
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-28
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Anchored in `06-RESEARCH.md` § Validation Architecture (lines 541-591).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Bash + ripgrep (rg 14.1.0) + Node.js (v24.13.0) — four existing smoke scripts + `claude -p` non-interactive CLI for UAT + `tally.mjs` for metrics aggregation |
| **Config file** | None — each smoke script self-contained; `tally.mjs` parses JSONL by convention |
| **Quick run command** | `bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/KCB-economics.sh` (load-bearing single-smoke gate; ~$1, ~30s) |
| **Full suite command** | (smoke) `for f in KCB-economics DEF-response-structure HIA-discipline J-narrative-isolation; do bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/${f}.sh; done` (~$3-5, ~3min); (UAT) `bash .planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/run-all.sh && node .planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/tally.mjs` (~$5-10, ~30min) |
| **Estimated runtime** | ~30s (single smoke) / ~3min (full smoke) / ~33min (smoke + 6-session UAT) |

---

## Sampling Rate

- **After every task commit:** Run `bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/KCB-economics.sh` (single-smoke load-bearing gate signal — verifies executor still uses web tools when prompted with API-migration questions; cheap signal)
- **After every plan wave:** Run all four smoke scripts (KCB-economics, DEF-response-structure, HIA-discipline, J-narrative-isolation) on plugin 0.8.5 — verifies no Pattern D edit broke advisor word-budget, frame contract, or scope-derivation contracts
- **Before `/gsd-verify-work`:** Full suite must be green: 4 smoke scripts on plugin 0.8.5 + 6-session UAT replay completes + `tally.mjs` aggregation confirms web-usage gate satisfied
- **Max feedback latency:** ~30s (single-smoke commit feedback)

---

## Per-Task Verification Map

> Mapped from `06-RESEARCH.md` § Validation Architecture / Phase Requirements → Test Map. Plan/Task IDs filled by planner; CONTEXT.md decisions D-01..D-06 are the de-facto requirement set (REQUIREMENTS.md has TBD for Phase 6).

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | 01 | 1 | D-01 (Pattern D 4-class taxonomy in `references/orient-exploration.md`) | — | N/A | static (grep) | `git grep -l "Type-symbol existence" plugins/lz-advisor/references/orient-exploration.md && git grep -l "API currency" plugins/lz-advisor/references/orient-exploration.md && git grep -l "Migration / deprecation" plugins/lz-advisor/references/orient-exploration.md && git grep -l "Language semantics" plugins/lz-advisor/references/orient-exploration.md` | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | D-03 (descriptive triggers, no MUST/NEVER for tool-use steering) | — | N/A | static (negative-grep) | `! git grep -E '\b(MUST\|NEVER\|REQUIRED\|CRITICAL)\b' plugins/lz-advisor/references/orient-exploration.md` (zero matches expected) | ❌ W0 | ⬜ pending |
| TBD | 02 | 1 | D-02 (`@`-load line in 4 SKILL.md `<orient_exploration_ranking>` blocks) | — | N/A | static (grep) | `git grep -c "references/orient-exploration.md" plugins/lz-advisor/skills/*/SKILL.md` (expect 4) | ❌ W0 | ⬜ pending |
| TBD | 02 | 1 | D-02 (`references/context-packaging.md` Rule 5 cross-reference) | — | N/A | static (grep) | `git grep -F "orient-exploration.md" plugins/lz-advisor/references/context-packaging.md` | ❌ W0 | ⬜ pending |
| TBD | 02 | 1 | D-06 (plugin.json version 0.8.5) | — | N/A | static (json parse) | `node -e "process.exit(JSON.parse(require('fs').readFileSync('plugins/lz-advisor/.claude-plugin/plugin.json','utf8')).version === '0.8.5' ? 0 : 1)"` | ✅ | ⬜ pending |
| TBD | 02 | 1 | D-06 (4 SKILL.md frontmatter `version: 0.8.5`) | — | N/A | static (grep) | `git grep -c '^version: 0\.8\.5$' plugins/lz-advisor/skills/*/SKILL.md` (expect 4) | ✅ | ⬜ pending |
| TBD | 02 | 1 | D-06 (zero 0.8.4 residuals in plugin tree after bump) | — | N/A | static (negative-grep) | `! rg -uu -l '0\.8\.4' plugins/lz-advisor/` (expect zero matches) | ✅ | ⬜ pending |
| TBD | 03 | 2 | D-04 (UAT replay infrastructure: run-all.sh, run-session.sh, extended tally.mjs, prompts/) | — | N/A | static (file existence + grep for `web_uses` column extension) | `test -f .planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/run-all.sh && test -f .planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/run-session.sh && test -f .planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/tally.mjs && git grep -F "web_uses" .planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/tally.mjs && ls .planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/prompts/session-*.txt \| wc -l` (expect 6) | ❌ W0 | ⬜ pending |
| TBD | 04 | 3 | D-04 (4 smoke scripts pass on plugin 0.8.5) | — | N/A | runtime (bash) | `bash .../KCB-economics.sh && bash .../DEF-response-structure.sh && bash .../HIA-discipline.sh && bash .../J-narrative-isolation.sh` (each exits 0) | ✅ | ⬜ pending |
| TBD | 04 | 3 | D-04 / D-05 (KCB-economics K + C + B all `[OK]` — load-bearing closure signal) | — | Web-tool usage on API-migration questions | runtime (bash) | `bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/KCB-economics.sh` exit 0 | ✅ | ⬜ pending |
| TBD | 04 | 3 | D-04 (6 reshaped UAT sessions complete; per-skill D-11 thresholds satisfied — plan/review/security-review ≤1 advisor call; execute ≤2; S2 Bun-crash exemption inherits Phase 5.6 verbatim) | — | N/A | runtime (claude -p loop + tally.mjs) | `bash uat-pattern-d-replay/run-all.sh && node uat-pattern-d-replay/tally.mjs > tally.txt` then verify per-skill columns | ❌ W0 | ⬜ pending |
| TBD | 04 | 3 | D-04 (web-usage gate: `web_uses ≥ 1` in `≥ 4 of 6` sessions — recommended baseline; planner may tighten to ≥5/6 per CONTEXT.md Claude's Discretion) | — | N/A | static (parse tally output) | `awk -F'\t' 'NR>1 && $WEB_USES_COL>=1 {n++} END {exit (n>=4)?0:1}' tally.txt` (column index per extended tally.mjs schema) | ❌ W0 | ⬜ pending |
| TBD | 04 | 3 | session-notes.md narrative present with S2 Bun-crash exemption noted | — | N/A | static (grep) | `git grep -F "S2 Bun-crash" .planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/session-notes.md` | ❌ W0 | ⬜ pending |
| TBD | * | * | ASCII-only constraint (CLAUDE.md project rule) on all Phase 6-authored files | — | N/A | static (negative-grep) | `! rg -c '[^\x00-\x7F]' .planning/phases/06-address-phase-5-6-uat-findings/ plugins/lz-advisor/references/orient-exploration.md` (expect zero non-ASCII matches) | partial | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

> Files that do not exist yet at execution start; planner must include their creation in Wave 1 (or earliest task) before any verification gate runs against them.

- [ ] `plugins/lz-advisor/references/orient-exploration.md` — NEW file containing Pattern D's 4 class blocks per D-01 / D-03 phrasing (anchored in `06-RESEARCH.md` § R-01 Code Example 1)
- [ ] `plugins/lz-advisor/references/context-packaging.md` Rule 5 — gains 1-line cross-reference to `orient-exploration.md` (D-02 / Open Question 4 default: one-line pointer)
- [ ] `plugins/lz-advisor/skills/lz-advisor.{plan,execute,review,security-review}/SKILL.md` — each gains `@`-load line inside existing `<orient_exploration_ranking>` block + frontmatter `version:` bump 0.8.4 → 0.8.5
- [ ] `plugins/lz-advisor/.claude-plugin/plugin.json` — version bump 0.8.4 → 0.8.5 (D-06)
- [ ] `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/run-all.sh` — copy from Phase 5.6 with RUN_DIR updated to Phase 6 path
- [ ] `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/run-session.sh` — copy with RUN_DIR updated
- [ ] `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/tally.mjs` — copy with `base` updated + `web_uses` column extension (~5 lines per `06-RESEARCH.md` Code Example 3)
- [ ] `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/prompts/session-{1..6}-<skill>.txt` — six reshaped prompts per D-04 class assignment (S1: API-currency / Storybook 10.x docs config; S2: migration-deprecation / setCompodocJson removal; S3: API-currency; S4: migration-deprecation; S5: language-semantics; S6: API-currency / @compodoc/compodoc supply chain)
- [ ] `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/session-notes.md` — narrative shape mirroring Phase 5.6 Plan 07's `AUTONOMOUS-UAT.md`; must include S2 Bun-crash exemption note
- [ ] `.planning/phases/06-address-phase-5-6-uat-findings/06-VERIFICATION.md` — two-section gate report (Stage 1 smoke + Stage 2 UAT)

*Framework install: not required — Node v24.13.0, rg 14.1.0, Bash, claude CLI all verified present on 2026-04-28.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Pattern D class assignment unambiguity | D-04 (R-02) | Class taxonomy mapping is a semantic judgement; no automated classifier exists | Before running UAT, mentally classify each reshaped prompt against D-01's 4 classes; verify the assigned class matches and is the dominant class. If a prompt classifies into multiple classes, prefer the web-first class (per R-02 mandate) so the gap behavior surfaces. |
| Pattern A vs Pattern D conflict avoidance in reshaped prompts | D-04 / Pitfall 1 (`06-RESEARCH.md`) | Inlining documentation in a UAT prompt triggers `<context_trust_contract>` Pattern A behavior, defeating Pattern D's web-first ranking | When composing each reshaped prompt, confirm NO documentation block is pasted in. The prompt should phrase the question (with version anchor) and invite the executor to investigate; the executor must own the WebFetch action. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies declared
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify (Stage 1 smoke runs on every commit)
- [ ] Wave 0 covers all MISSING references (10 files listed above)
- [ ] No watch-mode flags (UAT runner is one-shot per session)
- [ ] Feedback latency < 60s for the per-commit gate (KCB-economics.sh ~30s)
- [ ] `nyquist_compliant: true` set in frontmatter once planner attaches every task to a row in the verification map

**Approval:** pending (planner attaches Plan/Task IDs and flips `nyquist_compliant: true` after coverage check in step 13)
