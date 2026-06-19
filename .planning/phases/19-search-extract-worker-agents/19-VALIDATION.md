---
phase: 19
slug: search-extract-worker-agents
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-16
validated: 2026-06-19
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `19-RESEARCH.md` "## Validation Architecture". The deterministic driver functions
> are unit-sampled per commit; the offline read is the phase-gate behavioral sample; the trap-set
> discrimination is the saturation pre-condition gate.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` (Node stdlib) + `node:assert/strict` — zero new packages |
| **Config file** | none (CI runs explicit file paths; coverage via `--test-coverage-*` in `ci.yml` for the plugin tree only) |
| **Quick run command** | `node --test eval/lz-eval-search-loop.test.mjs` (per-file FILE form; NEVER the directory form — host quirk) |
| **Full suite command** | `node --test` over all 20 eval `.test.mjs` FILE paths (multiple files in one call OK; NEVER the directory form) -> 394 pass; then `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` -> 41 pass. Post-execution counts: 394 eval-tree + 41 plugin = 435, 0 fail. |
| **Estimated runtime** | ~30 seconds (deterministic unit suite). The offline READ is a separate phase-gate run, not a per-commit sample. |

---

## Sampling Rate

- **After every task commit:** Run the affected `.test.mjs` FILE form (e.g. `node --test eval/lz-eval-search-loop.test.mjs`).
- **After every plan wave:** Run the full suite (all eval `.test.mjs` by explicit path) + the plugin-tree aggregator test.
- **Before `/gsd:verify-work`:** Full suite green; then the offline read produces `PASS | FAIL-RAISE | VOID`. A `VOID`/`FAIL-RAISE` is escalated to the user (settle-OR-raise) before sign-off.
- **Max feedback latency:** ~30 seconds (unit suite).

---

## Per-Task Verification Map

> Task IDs are assigned by the planner (step 8). The requirement -> test coverage below is authoritative
> from `19-RESEARCH.md`; the planner maps each task to the row that proves it and `/gsd:validate-phase`
> fills the per-task `Status` column post-execution.

| Req ID | Behavior | Test Type | Automated Command | Status |
|--------|----------|-----------|-------------------|--------|
| PIPE-03 | Search worker frontmatter is `[WebSearch, Write]`, dispatchable per angle, returns a receipt | agent-author + structural SSOT gate (+ Phase-20 dispatch UAT) | `node --test eval/lz-eval-worker-contract.test.mjs` (Cluster 2 ownership + Cluster 3 tools-grant + Cluster 4 receipt) | ✅ green |
| PIPE-04 | Excerpt stored verbatim at fetch time, plain UTF-8; aggregator accepts it | integration (vs frozen aggregator) + structural SSOT gate | `node --test plugins/.../lz-deep-research-aggregate.test.mjs` (round-trip) + `node --test eval/lz-eval-worker-contract.test.mjs` (verbatim excerpt + tools grant) | ✅ green |
| PIPE-05 | Claim + source records conform to frozen schema; canonical URL key identical across `claims[].source` and `sources/<id>.json` | unit + integration + structural SSOT gate | `node --test eval/lz-eval-search-loop.test.mjs` (canonicalizeUrl + sourceFilename) + the round-trip (`claims[].source === source.id`, percent-encoded filename) + worker-contract (denylist SSOT) | ✅ green |
| AGG-03 | Receipt is one line, <=~200 chars, counts-only, no raw text | unit (doc-conformance) + structural SSOT gate | `node --test plugins/.../lz-deep-research-aggregate.test.mjs` (receipt-format) + `node --test eval/lz-eval-worker-contract.test.mjs` (Cluster 4: receipt extracted from the SHIPPED agent files) | ✅ green |
| EVAL-01 | Manifest gains discriminating open-book strata; license-clean (no NC text); the MCC-screen corpus is artifact-free | unit drift gate + trap recipe + guard | `node --test eval/lz-eval-dataset.test.mjs` (AVeriTeC drift gate) + `node --test eval/lz-eval-traps.test.mjs` (recipe/validity/leakage) + `node --test eval/lz-eval-baseline-guard.test.mjs` (dual-baseline) | ✅ green |
| EVAL-02 | k>=5; Pass@1/Pass^k/per-stratum false-uphold; the confound-robust MCC scalar | unit (engine) + offline SCREEN run | `node --test eval/lz-eval-aggregate.test.mjs` (MIN_K=5, passAtK/passHatK/countFalseUpholds) + `node --test eval/lz-eval-mcc.test.mjs` + `node --test eval/lz-eval-contrastive-screen.test.mjs`; the offline read is the Task-9 SCREEN-PASS (human-confirmed) | ✅ green |
| EVAL-04 | Lock rule re-registered (MCC bar pre-registered + timestamped BEFORE any pair); thresholds match `EVAL_THRESHOLDS` byte-for-byte | unit anti-drift + doc | `node --test eval/lz-eval-aggregate.test.mjs` (prose==code byte-for-byte; CP(1,N) ceiling; RE-PLAN-12 timestamp asserts ISO-8601 UTC + in-past + not placeholder) | ✅ green |

### Deterministic driver function coverage (MC/DC, D-08)

| Function | Sampling (test points) |
|----------|------------------------|
| `searchAndStop` (core) | min-not-met -> insufficient; minimums met + decisive -> verdict; exhausted -> refuted-default; trace fields populated; mechanical-minimum guard blocks early uphold |
| `staticKsAdapter` | returns only docs for the claim; respects `fetchResults` signature; empty KS -> empty |
| `dateFilter` | pre-cutoff kept; post-cutoff dropped; undated dropped (fail-closed); boundary (== claim_date) excluded |
| `parseAvtDate` | valid DD-MM-YYYY parsed; malformed throws ContractError |
| `canonicalizeUrl` | lowercases scheme+host; strips :80/:443; strips utm_*/denylist params; strips fragment + trailing slash; preserves path |
| `sourceFilename` | deterministic SHA-256 hex; same key -> same name; different key -> different name; no path separators |
| trap mutation recipe | one-step overreach applied; gold flips to refuted; validity-gate (weak-verifier flip) discriminates |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky* — all rows ✅ green post-execution (verified by FILE-form runs 2026-06-19).

---

## Gaps Filled (post-execution, /gsd:validate-phase 2026-06-19)

Two genuine coverage gaps were found and filled. Both concern the SHIPPED worker-agent
contract surface (PIPE-03/04/05 + AGG-03) — the structural behaviors were proven at execution
time only by one-shot manual `git grep` checks, with no automated regression gate.

| Gap | Requirement | Why it was uncovered | Test added | Pass count |
|-----|-------------|----------------------|------------|------------|
| Least-privilege tools grant not regression-gated | PIPE-03 / PIPE-04 / PIPE-05 (T-19-05 EoP) | The SSOT gate asserted ownership/floor/maxTurns but NEVER the frontmatter `tools` list; a maintainer re-adding `Read`/`Bash` or flipping search↔fetch would pass all tests | `eval/lz-eval-worker-contract.test.mjs` Cluster 3: parses the shipped `tools:` line and asserts search == exactly `[WebSearch, Write]`, extract == exactly `[WebFetch, Write]`, with per-tool over-privilege negatives | +2 |
| Receipt contract not asserted against the SHIPPED agent files | AGG-03 (D-14, T-19-06 Information Disclosure) | The plugin-suite receipt test asserts a HARDCODED inline string divorced from the agents; the SSOT gate had no receipt assertion. A maintainer making the documented receipt multi-line / over-cap / raw-text-bearing would pass | `eval/lz-eval-worker-contract.test.mjs` Cluster 4: extracts the receipt example from each shipped ```text fence and asserts one-line / ≤200-char / counts-only, plus a prose-contract assertion (one-line + 200-char + counts-only + no-raw-text in both agents) | +3 |

**Discrimination proof:** a throwaway mutation probe confirmed each new assertion FAILS on a broken
contract (search + `Read`; search → `WebFetch`; extract + `Bash`; receipt forced multi-line; receipt
forced raw-text/over-cap) and PASSES clean on the real files. The probe was deleted after the run.

`node --test eval/lz-eval-worker-contract.test.mjs` → **15 tests, 15 pass, 0 fail** (was 10).
Full eval-tree suite (20 FILE-form files) → **394 pass / 0 fail** (was 389). Plugin aggregator → 41 pass.

---

## Wave 0 Requirements

- [x] `eval/lz-eval-search-loop.test.mjs` — search-and-stop core, both adapters, date filter, parseAvtDate, canonicalizeUrl, sourceFilename (PIPE-05, EVAL-01/02) — 27 tests green
- [x] `eval/lz-eval-traps.test.mjs` — the trap mutation recipe + validity/saturation gates (EVAL-01) — green
- [x] Extended `eval/lz-eval-dataset.test.mjs` drift gate to the new open-book strata rows (EVAL-01) — AVeriTeC coverage/no-text/gated:false/single-source guards green
- [x] Worker-output round-trip fixture: producer output -> the frozen aggregator accepts it (PIPE-04/05, AGG-03) — `lz-deep-research-aggregate.test.mjs` round-trip + receipt-format green (41 tests)
- [x] Worker-contract SSOT gate `eval/lz-eval-worker-contract.test.mjs` — denylist/ownership/percent-encoding + (NEW) tools-grant + (NEW) receipt-from-shipped-file (PIPE-03/04/05, AGG-03) — 15 tests green
- [x] RE-PLAN-12 MCC SCREEN gates `eval/lz-eval-mcc.test.mjs` + `eval/lz-eval-baseline-guard.test.mjs` + `eval/lz-eval-contrastive-screen.test.mjs` (EVAL-01/02) — 28 tests green
- [x] Extended `eval/lz-eval-aggregate.test.mjs` for the re-registered CP(1,N) ceiling + RE-PLAN-12 pre-registration anti-drift (EVAL-04) — 42 tests green
- [x] Framework install: none new — `cd eval && npm ci` restores jstat (verified present)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Search worker dispatch at scale (one worker per sub-angle in a real fan-out) | PIPE-03 | Real `[WebSearch, Write]` dispatch is observed end-to-end only inside the Phase-20 orchestrator | Confirmed at scale in Phase 20; Phase 19 verifies frontmatter + receipt contract structurally |
| Offline read outcome interpretation (`PASS` / `FAIL-RAISE` / `VOID`) | EVAL-02, EVAL-04 | Settle-OR-raise: a `VOID`/`FAIL-RAISE` is a legitimate completion that defers the tier to Phase-20 and requires a human read | Run the offline read; on `VOID`/`FAIL-RAISE` escalate to the user with the per-vote search trace; Sonnet-default ships in the interim |
| Sonnet-below-ceiling saturation pre-condition (D-06) | EVAL-01 | Difficulty calibration is an empirical judgment against the realized strata | Calibrator step must demonstrate Sonnet below ceiling on a hardened stratum before any Haiku-vs-Sonnet delta is read |

---

## Validation Sign-Off

- [x] All tasks have an `<automated>` verify or a Wave 0 dependency
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (all Wave-0 rows green)
- [x] No watch-mode flags (explicit `.test.mjs` FILE form only)
- [x] Feedback latency < 30s (deterministic unit suite)
- [x] `nyquist_compliant: true` set in frontmatter (post-execution, via `/gsd:validate-phase`)

**Approval:** validated 2026-06-19 (/gsd:validate-phase).

**Coverage verdict:** `nyquist_compliant: true`. All 7 requirements (PIPE-03/04/05, AGG-03,
EVAL-01/02/04) carry an automated FILE-form gate over their critical behaviors. Two genuine gaps
(least-privilege tools grant; receipt-against-shipped-files) were filled with +5 discriminating
tests in `eval/lz-eval-worker-contract.test.mjs` (proven failable via a mutation probe). No genuine
gaps remain. The over-refusal CP gate + full-WORKS certification are correctly BY-DESIGN Phase-20
(live) work per RE-PLAN-12 and are NOT flagged as Phase-19 gaps (the SDT positive-trials constraint
makes offline a SCREEN, never a WORKS certificate).
