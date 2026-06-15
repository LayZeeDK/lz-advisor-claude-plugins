---
phase: 16
slug: deterministic-off-model-aggregator-validation-fixture
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-15
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

| SC / Req | Behavior | Test Type | Automated Command | File Exists | Status |
|----------|----------|-----------|-------------------|-------------|--------|
| SC-1 / AGG-01 | Deterministic dedup/rank/tally/quote-recheck against a run-dir; zero deps | integration | `node "scripts/lz-deep-research-aggregate.mjs" "scripts/__fixtures__/near-duplicate-merged"` exits 0 + writes `survivors.json` | no(W0) | pending |
| SC-1 / AGG-01 | Determinism: same input -> byte-identical output | unit | `node --test` asserts `aggregate(fx)` deep-equals a second `aggregate(fx)` | no(W0) | pending |
| SC-2 / AGG-02 | CRLF/BOM/UTF-8 safe; `path.join`; `readdirSync` (no glob); zero deps | unit | `node --test` asserts a string with a leading byte-order mark (U+FEFF) and a trailing CRLF normalizes to `30`; a CRLF excerpt matches an LF quote; no non-`node:` import; no `package.json` | no(W0) | pending |
| SC-3 / VERIF-04 | Fabricated quote DROPPED upstream of voting (observable before tally) | unit | `node --test` case `fabricated-quote-dropped`: dropped count 1, claim absent from survivors, drop recorded before any vote read | no(W0) | pending |
| SC-3 / D-05 | Real-quote / wrong-passage DOWNGRADED (kept+lowered, not dropped, not upheld) | unit | `node --test` case `wrong-passage-downgraded`: survivor exists with `quote_fidelity === 'downgraded'` | no(W0) | pending |
| SC-4 / AGG-06 | Named ceilings enforced in code; over-ceiling input capped; cap observable | unit | `node --test` case `ceilings-enforced`: `/claims \d+->24/` in summary; `CEILINGS` is the single frozen source | no(W0) | pending |
| SC-5 / D-08 | Paraphrase pair from ONE source NOT double-counted (corroboration 1) | unit | `node --test` case `paraphrase-one-source`: `corroboration_lower_bound === 1` | no(W0) | pending |
| SC-5 / D-08 | Near-duplicate pair from TWO sources merged (corroboration 2) | unit | `node --test` case `near-duplicate-merged`: one cluster, `corroboration_lower_bound === 2` | no(W0) | pending |
| SC-5 / AGG-04 | The committed fixture PASSES | gate | `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/` exits 0 | no(W0) | pending |

*Status legend: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` -- the aggregator (pure functions + thin CLI). Blocks all tests.
- [ ] `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` -- the `node:test` fixture covering SC-1..SC-5.
- [ ] `plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/<case>/{claims,excerpts,votes}/` -- committed fixture run-dirs (seed from `plans/_spike/run/`, then ADD the downgrade, paraphrase-one-source, and ceiling cases). Author via the Write tool, NOT bash heredoc; include at least one deliberate-CRLF excerpt to prove CRLF-safety.
- [ ] No framework install needed (Node stdlib `node:test`); no `package.json` to add.

*All test infrastructure is net-new; there is no prior `node --test` precedent in the repo. The existing `tests/*.sh` are a different domain (bash word-budget gates for the review skills) and are NOT reused.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| (none) | -- | -- | -- |

*All phase behaviors have automated verification (`node --test` is the single instrument).*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 2s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
