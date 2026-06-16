---
phase: 19
slug: search-extract-worker-agents
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-16
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
| **Full suite command** | `node --test eval/lz-eval-aggregate.test.mjs eval/lz-eval-dataset.test.mjs eval/lz-eval-packaging-boundary.test.mjs eval/lz-eval-search-loop.test.mjs eval/lz-eval-traps.test.mjs` then `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` |
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

| Req ID | Behavior | Test Type | Automated Command | File State |
|--------|----------|-----------|-------------------|------------|
| PIPE-03 | Search worker frontmatter is `[WebSearch, Write]`, dispatchable per angle, returns a receipt | agent-author + structural lint (+ Phase-20 dispatch UAT) | frontmatter structural assertion | ❌ W0 (new agent) |
| PIPE-04 | Excerpt stored verbatim at fetch time, <=50KB, plain UTF-8; aggregator accepts it | integration (vs frozen aggregator) | `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` + new producer-output round-trip | ⚠️ partial (add round-trip) |
| PIPE-05 | Claim + source records conform to frozen schema; canonical URL key identical across `claims[].source` and `sources/<id>.json` | unit + integration | `node --test eval/lz-eval-search-loop.test.mjs` (canonicalizeUrl + sourceFilename) | ❌ W0 |
| AGG-03 | Receipt is one line, <=~200 chars, counts-only, no raw text | unit | receipt-format assertion in the worker-output round-trip | ❌ W0 |
| EVAL-01 | Manifest gains discriminating open-book strata; >=60-100 pooled; license-clean (no NC text) | unit drift gate + offline | extend `eval/lz-eval-dataset.test.mjs` drift gate; `node --test eval/lz-eval-traps.test.mjs` | ❌ W0 (extend) |
| EVAL-02 | k>=5; Pass@1/Pass^k/per-stratum false-uphold reported | unit (engine exists) + offline run | `node --test eval/lz-eval-aggregate.test.mjs` + the eval RUN | ✅ engine; RUN is the offline read |
| EVAL-04 | Lock rule re-registered to pooled-n CP(1,N) formula BEFORE any vote; thresholds match `EVAL_THRESHOLDS` byte-for-byte | unit anti-drift + doc | `node --test eval/lz-eval-aggregate.test.mjs` (threshold-match) + lock-rule prose review | ✅ engine (extend for formula ceiling) |

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

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `eval/lz-eval-search-loop.test.mjs` — search-and-stop core, both adapters, date filter, parseAvtDate, canonicalizeUrl, sourceFilename (PIPE-05, EVAL-01/02)
- [ ] `eval/lz-eval-traps.test.mjs` — the trap mutation recipe + validity/saturation gates (EVAL-01)
- [ ] Extend `eval/lz-eval-dataset.test.mjs` drift gate to the new open-book strata rows (EVAL-01)
- [ ] Worker-output round-trip fixture: producer output -> the frozen aggregator accepts it (PIPE-04/05, AGG-03)
- [ ] Extend `eval/lz-eval-aggregate.test.mjs` for the re-registered CP(1,N) formula ceiling (EVAL-04)
- [ ] Framework install: none new — `cd eval && npm ci` restores jstat

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Search worker dispatch at scale (one worker per sub-angle in a real fan-out) | PIPE-03 | Real `[WebSearch, Write]` dispatch is observed end-to-end only inside the Phase-20 orchestrator | Confirmed at scale in Phase 20; Phase 19 verifies frontmatter + receipt contract structurally |
| Offline read outcome interpretation (`PASS` / `FAIL-RAISE` / `VOID`) | EVAL-02, EVAL-04 | Settle-OR-raise: a `VOID`/`FAIL-RAISE` is a legitimate completion that defers the tier to Phase-20 and requires a human read | Run the offline read; on `VOID`/`FAIL-RAISE` escalate to the user with the per-vote search trace; Sonnet-default ships in the interim |
| Sonnet-below-ceiling saturation pre-condition (D-06) | EVAL-01 | Difficulty calibration is an empirical judgment against the realized strata | Calibrator step must demonstrate Sonnet below ceiling on a hardened stratum before any Haiku-vs-Sonnet delta is read |

---

## Validation Sign-Off

- [ ] All tasks have an `<automated>` verify or a Wave 0 dependency
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags (explicit `.test.mjs` FILE form only)
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter (post-execution, via `/gsd:validate-phase`)

**Approval:** pending
