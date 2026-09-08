---
phase: 16
slug: deterministic-off-model-aggregator-validation-fixture
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-15
validated: 2026-06-15
---

# Phase 16 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from 16-RESEARCH.md "## Validation Architecture". The `node --test`
> fixture is the PRIMARY validation instrument; each of the 5 success criteria
> maps to one or more mechanical checks.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` + `node:assert/strict` (Node stdlib, zero-dep); host Node v24.13.0 |
| **Config file** | none -- zero-config; no `package.json` (Wave 0 authors the test file itself) |
| **Quick run command** | `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` |
| **Full suite command** | `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/` (discovers all `*.test.mjs`) |
| **Estimated runtime** | ~1 second (whole fixture runs in-process) |

---

## Sampling Rate

- **After every task commit:** Run `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs`
- **After every plan wave:** Run the full suite (same single fixture file)
- **Before `/gsd:verify-work`:** `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/` must exit 0 (all 5 SC behaviors green)
- **Max feedback latency:** ~1 second

---

## Per-Task Verification Map

> Task IDs are assigned by the planner; this map is keyed by Success Criterion /
> Requirement until plans exist. Every row is a mechanical `node --test` check
> (or a CLI integration run). All instruments are Wave 0 (net-new -- no prior
> `node --test` precedent in the repo). File Exists "no(W0)" = authored in Wave 0.

| SC / Req | Behavior | Test Type | Automated Command | Test Name | File Exists | Status |
|----------|----------|-----------|-------------------|-----------|-------------|--------|
| SC-1 / AGG-01 | Deterministic dedup/rank/tally/quote-recheck against a run-dir; zero deps | integration | `node "scripts/lz-deep-research-aggregate.mjs" "scripts/__fixtures__/near-duplicate-merged"` exits 0 + writes `survivors.json` | CLI integration (VERIFICATION behavioral spot-check) | yes | green |
| SC-1 / AGG-01 | Determinism: same input -> byte-identical output | unit | `node --test` asserts `aggregate(fx)` deep-equals a second `aggregate(fx)` | `SC-1 aggregate is deterministic` | yes | green |
| SC-2 / AGG-02 | CRLF/BOM/UTF-8 safe; `path.join`; `readdirSync` (no glob); zero deps | unit | `node --test` asserts a string with a leading byte-order mark (U+FEFF) and a trailing CRLF normalizes to `30`; a CRLF excerpt matches an LF quote; no non-`node:` import; no `package.json` | `SC-2 normalize strips BOM…` + `SC-2 CRLF+BOM excerpt…` + `SC-2 zero-dependency contract` | yes | green |
| SC-3 / VERIF-04 | Fabricated quote DROPPED upstream of voting (observable before tally) | unit | `node --test` case `fabricated-quote-dropped`: dropped count 1, claim absent from survivors, drop recorded before any vote read | `SC5-1 fabricated quote dropped upstream of voting` | yes | green |
| SC-3 / D-05 | Real-quote / wrong-passage DOWNGRADED (kept+lowered, not dropped, not upheld) | unit | `node --test` case `wrong-passage-downgraded`: survivor exists with `quote_fidelity === 'downgraded'` | `SC5-2 real-quote / wrong-passage downgraded` | yes | green |
| SC-4 / AGG-06 | Named ceilings enforced in code; over-ceiling input capped; cap observable | unit | `node --test` case `ceilings-enforced`: `/claims \d+->24/` in summary; `CEILINGS` is the single frozen source | `SC5-5 over-ceiling input capped observably` | yes | green |
| SC-5 / D-08 | Paraphrase pair from ONE source NOT double-counted (corroboration 1) | unit | `node --test` case `paraphrase-one-source`: `corroboration_lower_bound === 1` | `SC5-3 paraphrase pair from ONE source merges` | yes | green |
| SC-5 / D-08 | Near-duplicate pair from TWO sources merged (corroboration 2) | unit | `node --test` case `near-duplicate-merged`: one cluster, `corroboration_lower_bound === 2` | `SC5-4 near-duplicate pair from TWO sources merged` | yes | green |
| SC-5 / AGG-04 | The committed fixture PASSES | gate | `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` exits 0 (FILE form -- dir form false-fails on this host) | whole suite: tests 13, pass 13, fail 0, exit 0 | yes | green |

*Status legend: pending / green / red / flaky*

> **Regression coverage beyond plan:** the executed suite carries 5 additional named tests not in the
> original map -- `CR-01` (summary pre-merge raw + non-zero merged count) and `WR-01/WR-02/WR-03`
> (malformed claim missing text / quote / source fails closed) -- added during the 16-REVIEW fix cycle
> (commits 94023db, 830b4bf). Total: 13 named tests, all green. These strengthen the contract; they
> introduce no gap.

---

## Wave 0 Requirements

- [x] `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` -- the aggregator (pure functions + thin CLI). Blocks all tests. *(603 lines; commits 4e140b2, f2dbc08)*
- [x] `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` -- the `node:test` fixture covering SC-1..SC-5. *(13 named tests; commits 879eafa, d40cd11, ae500e1)*
- [x] `plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/<case>/{claims,excerpts,votes}/` -- committed fixture run-dirs. *(6 cases committed: fabricated-quote-dropped, wrong-passage-downgraded, paraphrase-one-source, near-duplicate-merged, ceilings-enforced, crlf-bom-safe; CRLF/BOM excerpt generated at runtime in os.tmpdir() so no non-ASCII byte is committed)*
- [x] No framework install needed (Node stdlib `node:test`); no `package.json` to add. *(verified: zero non-`node:` imports; no package.json in repo)*

*All test infrastructure is net-new; there is no prior `node --test` precedent in the repo. The existing `tests/*.sh` are a different domain (bash word-budget gates for the review skills) and are NOT reused.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| (none) | -- | -- | -- |

*All phase behaviors have automated verification (`node --test` is the single instrument).*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 2s *(suite runs in ~0.12s)*
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** validated 2026-06-15 (retroactive Nyquist audit -- 0 gaps; all 5 requirements automated and green)

---

## Validation Audit 2026-06-15

Retroactive audit of the completed phase (State A: VALIDATION.md existed as a pre-execution draft;
audited against the executed codebase). Phase gate run independently via the FILE form:
`node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs`
-> tests 13, pass 13, fail 0, exit 0.

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

All 8 map rows map to a real, green named test (or the CLI integration spot-check). Every Phase-16
requirement (AGG-01, AGG-02, AGG-04, AGG-06, VERIF-04) has automated verification. No MISSING or
PARTIAL requirement; no manual-only verification. Suite grew from 9 planned to 13 tests via the
16-REVIEW regression fixes (CR-01, WR-01/02/03) -- additive coverage, no gap. **Nyquist-compliant.**
