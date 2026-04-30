---
phase: 6
slug: address-phase-5-6-uat-findings
status: complete
nyquist_compliant: true
wave_0_complete: true
plugin_version: 0.9.0
gate_verdict: PARTIAL
created: 2026-04-28
audited: 2026-04-30
---

# Phase 6 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Anchored in `06-RESEARCH.md` Validation Architecture (lines 541-591). Updated 2026-04-30 to fill Plan/Task IDs (resolved from TBD), bump version anchors 0.8.5/0.8.4 -> 0.9.0, and add Plan 05/06/07 surfaces.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Bash (Git Bash on Windows arm64) + ripgrep 14.1.0 + Node.js v24.13.0 + git grep -- each automated command is a self-contained one-liner. Four existing smoke scripts + `claude -p` non-interactive CLI for UAT + `tally.mjs` for metrics aggregation are reserved for Manual-Only verifications. |
| **Config file** | None -- each verification command self-contained; smoke scripts inherit Phase 5.4 fixtures; `tally.mjs` parses JSONL by convention. |
| **Quick run command** | Any individual `git grep -c <sentinel>` from the verification map (<1s per check). |
| **Full suite command** | Union of all verification-map automated commands run in sequence (~10s total). Runtime smoke and 6-session UAT remain Manual-Only. |
| **Estimated runtime** | ~10s (full static suite) / ~30s (single smoke, manual) / ~3min (full smoke, manual) / ~30min (smoke + 6-session UAT, manual). |

---

## Sampling Rate

- **After every task commit:** Run any per-task `git grep -c <sentinel>` from the verification map (<1s, per-row gate signal).
- **After every plan wave:** Run the union of automated commands for all rows in that wave (~5s; static-only, no Claude CLI spawns).
- **Before `/gsd-verify-work`:** Full static suite must be green; the runtime UAT and smoke gates are Manual-Only on this phase per Plan 06-04 halt outcome.
- **Max feedback latency:** <1s for any single per-task grep; ~10s for full static suite.

---

## Per-Task Verification Map

> Mapped from `06-RESEARCH.md` Validation Architecture / Phase Requirements -> Test Map. Plan/Task IDs filled by 2026-04-30 audit (`/gsd-validate-phase`); CONTEXT.md decisions D-01..D-06 are the de-facto requirement set (REQUIREMENTS.md has TBD for Phase 6). Plan 05/06/07 gap-closure surfaces (G1, G2, G3) inherit from 06-VERIFICATION.md amendments 2/3/4/5.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-T1 | 01 | 1 | D-01 (Pattern D 4-class taxonomy in `references/orient-exploration.md`) | -- | N/A | static (grep) | `git grep -l "Type-symbol existence" plugins/lz-advisor/references/orient-exploration.md && git grep -l "API currency" plugins/lz-advisor/references/orient-exploration.md && git grep -l "Migration / deprecation" plugins/lz-advisor/references/orient-exploration.md && git grep -l "Language semantics" plugins/lz-advisor/references/orient-exploration.md` | yes | green |
| 06-01-T1 | 01 | 1 | D-03 (descriptive triggers, no MUST/NEVER for tool-use steering) | -- | N/A | static (negative-grep) | `! rg -c '\b(MUST\|NEVER\|REQUIRED\|CRITICAL)\b' plugins/lz-advisor/references/orient-exploration.md` (zero matches expected) | yes | green |
| 06-02-T1 | 02 | 1 | D-02 (`@`-load line in 4 SKILL.md `<orient_exploration_ranking>` blocks) | -- | N/A | static (grep) | `git grep -c "references/orient-exploration.md" plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md plugins/lz-advisor/skills/lz-advisor.review/SKILL.md plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` (each >= 1; security-review = 3 due to Class 2-S cross-ref) | yes | green |
| 06-02-T3 | 02 | 1 | D-02 (`references/context-packaging.md` Rule 5 cross-reference) | -- | N/A | static (grep) | `git grep -F "orient-exploration.md" plugins/lz-advisor/references/context-packaging.md` | yes | green |
| 06-07-T1 | 07 | 4 | D-06 (plugin.json version 0.9.0) | -- | N/A | static (json parse) | `node -e "process.exit(JSON.parse(require('fs').readFileSync('plugins/lz-advisor/.claude-plugin/plugin.json','utf8')).version === '0.9.0' ? 0 : 1)"` | yes | green |
| 06-07-T1 | 07 | 4 | D-06 (4 SKILL.md frontmatter `version: 0.9.0`) | -- | N/A | static (grep) | `git grep -c '^version: 0\.9\.0$' plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md plugins/lz-advisor/skills/lz-advisor.review/SKILL.md plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` (each :1) | yes | green |
| 06-07-T1 | 07 | 4 | D-06 (zero pre-0.9.0 residuals in plugin tree after bump) | -- | N/A | static (negative-grep) | `! rg -uu -l '0\.8\.[0-9]' plugins/lz-advisor/` (expect zero matches) | yes | green |
| 06-03-T1..T3 | 03 | 2 | D-04 (UAT replay infrastructure: run-all.sh, run-session.sh, extended tally.mjs, prompts/) | -- | N/A | static (file existence + grep for `webUses` column extension) | `test -f .planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/run-all.sh && test -f .planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/run-session.sh && test -f .planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/tally.mjs && git grep -F "webUses" .planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/tally.mjs && [ "$(ls .planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/prompts/session-*.txt \| wc -l)" = "6" ]` | yes | green |
| 06-04-T3 | 04 | 3 | session-notes.md narrative present with S2 Bun-crash exemption noted | -- | N/A | static (grep) | `git grep -F "S2 Bun-crash" .planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/session-notes.md` | yes | green |
| 06-05-T1 | 05 | 2 (gap-closure) | G1+G2 trust-contract sentinel: vendor-doc branch present in 4 SKILL.md | -- | Provenance-classified source treatment (vendor-doc vs agent-generated) | static (grep) | `git grep -c -F "Vendor-doc authoritative source" plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md plugins/lz-advisor/skills/lz-advisor.review/SKILL.md plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` (each :1) | yes | green |
| 06-05-T1 | 05 | 2 (gap-closure) | G1+G2 trust-contract sentinel: agent-generated branch present in 4 SKILL.md | -- | Agent-generated content not authoritative for vendor-API behavior | static (grep) | `git grep -c -F "Agent-generated source material" plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md plugins/lz-advisor/skills/lz-advisor.review/SKILL.md plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` (each :1) | yes | green |
| 06-05-T1 | 05 | 2 (gap-closure) | G2 ToolSearch-availability rule sentinel in 4 SKILL.md | -- | Web tools structurally available before ranking can short-circuit | static (grep) | `git grep -c -F "ToolSearch select:WebSearch,WebFetch" plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md plugins/lz-advisor/skills/lz-advisor.review/SKILL.md plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` (each :1) | yes | green |
| 06-05-T1 | 05 | 2 (gap-closure) | Byte-identical canon: 4 trust-contract blocks all same byte size | -- | 4-skill SKILL.md byte-identical canon preserved | static (node) | `node -e "const fs=require('fs');const f=['plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md','plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md','plugins/lz-advisor/skills/lz-advisor.review/SKILL.md','plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md'];const b=f.map(p=>{const t=fs.readFileSync(p,'utf8');const m=t.match(/<context_trust_contract>[\\s\\S]*?<\\/context_trust_contract>/);return m?Buffer.byteLength(m[0]):0});process.exit(b.every(x=>x===b[0]&&x>0)?0:1)"` (verified 3286 bytes x4 at audit) | yes | green |
| 06-06-T1 | 06 | 3 (gap-closure) | G3 Class 2-S sub-pattern at H3 (not H2) in orient-exploration.md | -- | Class 2-S nested under Class 2 preserves four-classes-exhaustive property | static (grep) | `git grep -c '^### Class 2-S: Security currency' plugins/lz-advisor/references/orient-exploration.md` (=1) AND `! git grep -c '^## Class 2-S' plugins/lz-advisor/references/orient-exploration.md` (zero matches) | yes | green |
| 06-06-T1 | 06 | 3 (gap-closure) | G3 original 4 H2 classes preserved | -- | N/A | static (grep) | `git grep -c '^## Class ' plugins/lz-advisor/references/orient-exploration.md` (=4) | yes | green |
| 06-06-T2 | 06 | 3 (gap-closure) | G3 cross-reference scoped only to security-review SKILL.md | -- | Class 2-S fires only in security-review per amendment 4 | static (grep + negative-grep) | `git grep -c -F "Class 2-S" plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` (=1) AND `! git grep -l -F "Class 2-S" plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` (zero files matched) | yes | green |
| 06-06-T2 | 06 | 3 (gap-closure) | G3 npm audit -> GHSA -> WebSearch CVE ordering verbatim | -- | Class 2-S recommended ordering documented in skill prose | static (grep) | `git grep -c -F "npm audit -> GitHub Security Advisories -> WebSearch CVE" plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` (=1) | yes | green |
| 06-07-T2..T4 | 07 | 4 (gap-closure) | 3 replay session-notes.md exist | -- | N/A | static (file existence) | `test -f .planning/phases/06-address-phase-5-6-uat-findings/uat-plan-skill-fixes-rerun/session-notes.md && test -f .planning/phases/06-address-phase-5-6-uat-findings/uat-execute-skill-fixes-rerun/session-notes.md && test -f .planning/phases/06-address-phase-5-6-uat-findings/uat-security-review-skill-rerun/session-notes.md` | yes | green |
| 06-07-T5 | 07 | 4 (gap-closure) | 06-VERIFICATION.md gate_verdict frontmatter is PARTIAL | -- | Final gate verdict downgraded from PASS-with-caveat to PARTIAL per Plan 06-07 Step 4 (any FAIL replay -> PARTIAL) | static (grep) | `git grep -c '^gate_verdict: PARTIAL$' .planning/phases/06-address-phase-5-6-uat-findings/06-VERIFICATION.md` (=1) | yes | green |
| 06-07-T5 | 07 | 4 (gap-closure) | 06-VERIFICATION.md amendment 5 (gap-closure) present | -- | Closure narrative captures G1+G2 empirical residual + G3 PASS | static (grep) | `git grep -c -F "Amendment 2026-04-30 (fifth)" .planning/phases/06-address-phase-5-6-uat-findings/06-VERIFICATION.md` (=1) | yes | green |
| -- | * | * | ASCII-only constraint (CLAUDE.md project rule) on all Phase 6-authored files | -- | N/A | static (negative-grep) | `! rg -c '[^\x00-\x7F]' .planning/phases/06-address-phase-5-6-uat-findings/ plugins/lz-advisor/references/orient-exploration.md` (expect zero non-ASCII matches) | partial | partial |

*Status: pending = unverified . green = automated command exits 0 . red = automated command exits non-zero . partial = known constraint violation tracked as follow-up*

**ASCII-only partial note (2026-04-30 audit):** `rg -c '[^\x00-\x7F]'` returns matches in 7 Phase 6 planning documents (06-CONTEXT.md, 06-RESEARCH.md, 06-DISCUSSION-LOG.md, 06-VALIDATION.md, 06-01-PLAN.md, 06-02-PLAN.md, 06-03-PLAN.md) plus 2 lines in `uat-pattern-d-replay/stage-1-smoke.log`. The plugin tree (orient-exploration.md and 4 SKILL.md) is ASCII-clean; the residual non-ASCII is confined to planning docs authored before the constraint was tightened. This is treated as a known follow-up rather than a Nyquist gap; rewriting the planning docs to ASCII-only would not change any plugin behavior.

---

## Wave 0 Status: All Complete

> Files that did not exist at execution start. All artifacts now present and committed; this section is preserved as a record of the original Wave 0 dependency surface.

- [x] `plugins/lz-advisor/references/orient-exploration.md` -- NEW file containing Pattern D's 4 class blocks per D-01 / D-03 phrasing (anchored in `06-RESEARCH.md` R-01 Code Example 1). Plan 01 commit `6ad60d2`. Plan 06 commit `b7ec018` extended with Class 2-S sub-pattern at H3.
- [x] `plugins/lz-advisor/references/context-packaging.md` Rule 5 -- gained 1-line cross-reference to `orient-exploration.md` (D-02 / Open Question 4 default: one-line pointer). Plan 02 commit `3a77ad6`.
- [x] `plugins/lz-advisor/skills/lz-advisor.{plan,execute,review,security-review}/SKILL.md` -- each gained `@`-load line inside existing `<orient_exploration_ranking>` block + frontmatter `version:` bump 0.8.4 -> 0.8.5 (Plan 02 commits `098dd55` + `77bac39`) -> later 0.8.5 -> 0.8.9 -> 0.9.0 (gap-closure cycle commit `7ceeffd`). Plan 05 commit `0df782d` rewrote `<context_trust_contract>` byte-identically across all 4 (3286-byte block).
- [x] `plugins/lz-advisor/.claude-plugin/plugin.json` -- version bump 0.8.4 -> 0.8.5 (D-06; Plan 02 commit `77bac39`) -> 0.9.0 (gap-closure cycle Plan 07 commit `7ceeffd`).
- [x] `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/run-all.sh` -- copied from Phase 5.6 with RUN_DIR updated to Phase 6 path. Plan 03 commit `94cb3b6`.
- [x] `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/run-session.sh` -- copied with RUN_DIR updated. Plan 03 commit `94cb3b6`.
- [x] `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/tally.mjs` -- copied with `base` updated + `webUses` column extension (~5 lines per `06-RESEARCH.md` Code Example 3). Plan 03 commit `c2b41a4`.
- [x] `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/prompts/session-{1..6}-<skill>.txt` -- six reshaped prompts per D-04 class assignment. Plan 03 commit `b99117c`.
- [x] `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/session-notes.md` -- narrative shape mirroring Phase 5.6 Plan 07's `AUTONOMOUS-UAT.md`; includes S2 Bun-crash exemption note. Plan 04 commit `8f4c0a6`.
- [x] `.planning/phases/06-address-phase-5-6-uat-findings/06-VERIFICATION.md` -- two-section gate report (Stage 1 smoke + Stage 2 UAT) with 5 amendments tracking the gap-closure cycle. Plan 04 commit `8f4c0a6`; closing amendment 5 commit `5823485`.

*Framework install: not required -- Node v24.13.0, rg 14.1.0, Bash, claude CLI all verified present on 2026-04-28 (and again 2026-04-30 audit).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Pattern D class assignment unambiguity | D-04 (R-02) | Class taxonomy mapping is a semantic judgement; no automated classifier exists | Before running UAT, mentally classify each reshaped prompt against D-01's 4 classes; verify the assigned class matches and is the dominant class. If a prompt classifies into multiple classes, prefer the web-first class (per R-02 mandate) so the gap behavior surfaces. |
| Pattern A vs Pattern D conflict avoidance in reshaped prompts | D-04 / Pitfall 1 (`06-RESEARCH.md`) | Inlining documentation in a UAT prompt triggers `<context_trust_contract>` Pattern A behavior, defeating Pattern D's web-first ranking | When composing each reshaped prompt, confirm NO documentation block is pasted in. The prompt should phrase the question (with version anchor) and invite the executor to investigate; the executor must own the WebFetch action. |
| 4 smoke scripts pass on plugin 0.9.0 | D-04 | Smoke runs spawn Claude CLI sessions (~3 min, ~$3-5 per run); originally FAILed on 0.8.5 (drove gap-closure cycle); current 0.9.0 state captured by Plan 07 PARTIAL replay verdict in 06-VERIFICATION.md amendment 5 | Re-run via `bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/{KCB-economics,DEF-response-structure,HIA-discipline,J-narrative-isolation}.sh` against current plugin tree at 0.9.0. Expect KCB / DEF / HIA still failing per known follow-up; J still passing. |
| KCB-economics K+C+B all OK (D-04/D-05 closure signal) | D-04 / D-05 | Originally FAILed on 0.8.5; superseded by manual UAT on 0.8.9 (PASS-with-caveat: 7 web tool calls in session `6cba971a-fe19-4a09-8d3c-4a288ea14ce0.jsonl`) per 06-VERIFICATION.md amendment 1 | Manual UAT on plugin 0.8.9 produced 2 WebSearch + 5 WebFetch tool_use events, 4 `<pre_verified>` blocks, and a Compodoc-1.2.1 signal-class gotcha-aware plan -- the empirical PASS that closes the gate. Re-run on plugin 0.9.0 if desired; evidence pointer is the 0.8.9 session log. |
| 6-session UAT replay + tally web_uses gate (>= 4/6) | D-04 | Stage 2 NEVER RAN per Plan 04 halt directive; replaced by manual UAT (PASS on 0.8.9) + Plan 07 replay UAT on 0.9.0 (PARTIAL: 1/3 PASS, 2/3 FAIL) | Pointers to the 3 replay session-notes.md files: `uat-plan-skill-fixes-rerun/session-notes.md` (FAIL), `uat-execute-skill-fixes-rerun/session-notes.md` (FAIL), `uat-security-review-skill-rerun/session-notes.md` (PASS). To re-run, invoke `/lz-advisor.<skill>` against testbed `D:/projects/github/LayZeeDK/ngx-smart-components` branch `uat/manual-s4-v089-compodoc` per Plan 07 SUMMARY directives. |
| Plan 07 Class 2-S empirical fire (npm_audit_count >= 1 in security-review replay) | G3 | Depends on session log file at `c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/db5e0511-55b8-4814-b38a-d8c4cc39eb6b.jsonl` -- not in the repo working tree; cannot be a per-commit gate | `rg -c '"name":"Bash".*"command":".*npm audit' "$HOME/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/db5e0511-55b8-4814-b38a-d8c4cc39eb6b.jsonl"` should return >= 1 (was 5 at replay time per Plan 07 SUMMARY). |

---

## Validation Audit 2026-04-30

| Metric | Count |
|--------|-------|
| Gaps presented to audit | 23 |
| Resolved (green automated) | 22 |
| Resolved (partial / known follow-up) | 1 (ASCII-only on planning docs) |
| Escalated | 0 |
| New tests created | 0 (every check is a one-liner against existing CLI tooling) |
| Implementation files modified | 0 (this audit only edits 06-VALIDATION.md) |

**Audit narrative.** The pre-audit Per-Task Verification Map carried "TBD" Plan/Task IDs for every existing row, version anchors locked at 0.8.5 / 0.8.4 (long since superseded by gap-closure bumps to 0.8.9 -> 0.9.0), and zero rows for the Plan 05/06/07 surfaces (G1+G2 trust-contract rewrite, G3 Class 2-S sub-pattern, version bump + replay UATs). The audit fills all three gaps: Plan/Task IDs resolved (`06-01-T1` through `06-07-T5`), version anchors moved to 0.9.0 across the plugin manifest + 4 SKILL.md frontmatter rows, and 11 new rows added covering G1+G2 sentinels (4 surfaces x 2 sentinels + ToolSearch rule), byte-identical canon, Class 2-S H3 placement, cross-reference scoping, npm-audit ordering, replay session-notes presence, gate_verdict frontmatter downgrade, and amendment-5 presence. All 22 strict gates exit green on the live tree at audit time. The runtime smoke gates and 6-session UAT replay are reclassified as Manual-Only verifications with explicit pointers to the durable evidence (Plan 07 session logs at `c:/Users/LarsGyrupBrinkNielse/.claude/projects/...` and the 3 replay `session-notes.md` files); they remain the operative gate for human re-verification but are no longer part of the per-commit static suite.

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies declared (every Plan 01-07 surface row maps to a one-liner; Wave 0 is empty post-execution because all artifacts now exist).
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (every plan task has at least one row in the static suite).
- [x] Wave 0 covers all MISSING references (10 original entries all marked complete; nothing remained missing at audit time).
- [x] No watch-mode flags (UAT runner is one-shot per session; static suite is single-pass grep).
- [x] Feedback latency < 60s for the per-commit gate (any single `git grep -c <sentinel>` runs in <1s; full static suite ~10s).
- [x] `nyquist_compliant: true` set in frontmatter (audit 2026-04-30 flips this).
- [ ] ASCII-only across all Phase 6-authored files (planning docs carry residual non-ASCII bytes; tracked as known follow-up, not a Nyquist gap).

**Approval:** approved 2026-04-30 (audit). Gate verdict: PARTIAL (2 of 3 regression replays still red on G1+G2 empirical residual; the residual surface inherits to Phase 7 per 06-VERIFICATION.md amendment 5).
