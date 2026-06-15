---
phase: 17
slug: json-schema-verification-contract-reference
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-15
validated: 2026-06-15
---

# Phase 17 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source: 17-RESEARCH.md "Validation Architecture". The ONLY executable deliverable this phase touches is
> the lockstep GA-1/D-02 aggregator correction; the reference doc itself is verified by doc-review.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` + `node:assert/strict` (Node stdlib; zero-dep) |
| **Config file** | none (no `package.json`; the only imports are `node:*` + the aggregator under test) |
| **Quick run command** | `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` |
| **Full suite command** | same (the suite is a single file) |
| **Estimated runtime** | ~2 seconds |

**HOST QUIRK (load-bearing):** On this host (Node v24 / Windows arm64 / Git Bash) the validation command MUST
target the explicit FILE form above. The directory form (`node --test <dir>`) spuriously exits 1 even when
every real test passes (memory `reference_node_test_dir_exit1_quirk`; fixture header documents it). NEVER gate
on the directory form.

---

## Sampling Rate

- **After every task commit:** Run `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs`
- **After every plan wave:** Run the same (single-file suite)
- **Before `/gsd:verify-work`:** Full suite green (>=17 tests after the four new tier cases + the stdout-label assertion) PLUS a pure-ASCII scan (`rg -n "[^\x00-\x7F]"` returns nothing on the edited `.mjs` / `.test.mjs` / `.md`)
- **Max feedback latency:** ~2 seconds

---

## Per-Task Verification Map

> Rows keyed by requirement + behavior, mapped to the concrete plan tasks created by gsd-planner.
> The tally rubric is implemented in 17-01-01; the per-tier ASSERTIONS that verify each branch are added in
> 17-01-02 (the lockstep fixture task). Both tasks share the same FILE-form `node --test` verify.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 17-01-01 | 17-01 | 1 | PIPE-07 | T-17-01 | tally maps every readable tally to exactly one of {High,Medium,Low,Contested,Unsupported}; `High`-regression branch | unit | `node --test .../lz-deep-research-aggregate.test.mjs` | yes (High asserted line 87) | green |
| 17-01-02 | 17-01 | 1 | PIPE-07 | T-17-01 | `Medium` = 2 readable `unrefuted` seats + 1 missing | unit | same | yes (test line 101) | green |
| 17-01-02 | 17-01 | 1 | PIPE-07 | T-17-01 | `Low` (thin) = 1 readable `unrefuted` seat + 2 missing | unit | same | yes (test line 108) | green |
| 17-01-02 | 17-01 | 1 | PIPE-07 / D-03b | T-17-01 | downgrade-not-delete: 3/3 `refuted` -> `Low`, claim still present (NOT deleted) | unit | same | yes (test lines 116-117) | green |
| 17-01-02 | 17-01 | 1 | PIPE-07 / D-03 | T-17-01 | `Contested` on a per-claim voter split (>=1 `unrefuted` AND >=1 `refuted`); branch precedes `Medium` | unit | same | yes (test line 128) | green |
| 17-01-02 | 17-01 | 1 | PIPE-07 | T-17-01 | `Unsupported` = 0 readable vote seats | unit | same | yes (test line 135) | green |
| 17-01-02 | 17-01 | 1 | D-02 | T-17-01 | stdout by-confidence line names all 5 labels | unit | same (assert summary substring) | yes (5-label stdout test) | green |
| 17-02-01 | 17-02 | 2 | VERIF-06 | T-17-06 | reference defines `quote_fidelity` (frozen) and `claim_support` (new) as two SEPARATE fields + worked example where `verified` coexists with `unsupported` | doc-review (manual + grep) | `<human-check>` + `rg -U "quote_fidelity[\s\S]*verified[\s\S]*claim_support[\s\S]*unsupported"` on `references/lz-deep-research-schema.md` | yes (doc 500 lines) | green (grep + doc-review) |

*Status: pending / green / red / flaky*

> **Flag convention (post-execution flip, 2026-06-15):** per GSD convention `nyquist_compliant`/`wave_0_complete`
> are `false` at plan-time and flip POST-execution. This `validate-phase` audit set them BOTH `true` because no
> gaps remain: all seven Wave 0 fixture/assertion gaps were filled by 17-01-02 and the FILE-form `node --test`
> suite is green at 19/19 (target >=17), with every one of the five tiers exercised by a passing assertion
> (cross-referenced to test line anchors in the map above and independently confirmed in 17-VERIFICATION.md).
> `audit-milestone` may now treat Phase 17 COMPLIANT (`nyquist_compliant: true` AND all tasks green).

---

## Wave 0 Requirements

- [x] `Medium`-tier fixture/assertion (2 readable `unrefuted` seats + 1 missing) -- covers PIPE-07
- [x] `Low`-tier (thin) fixture/assertion (1 readable `unrefuted` seat + 2 missing) -- covers PIPE-07
- [x] `Low`-tier (downgrade-not-delete, D-03b) fixture/assertion (3/3 `refuted`, claim present + `Low`) -- covers PIPE-07 + D-03b
- [x] `Contested`-tier fixture/assertion (>=1 `unrefuted` AND >=1 `refuted`) -- covers PIPE-07 + D-03
- [x] `Unsupported`-tier fixture/assertion (0 readable vote seats) -- covers PIPE-07
- [x] stdout by-confidence 5-label assertion (a survivors set spanning multiple tiers) -- covers D-02
- [x] Update the fixture header enum-documenting comment to `{High, Medium, Low, Contested, Unsupported}`

*The framework + the committed-fixture pattern + the temp-run-dir helper already exist; no framework install.
The gaps are net-new fixture data + assertions, not new infrastructure. All seven are owned by plan 17-01,
task 17-01-02.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Reference defines the two assurances as two separate fields (`quote_fidelity` vs `claim_support`) with a worked example | VERIF-06 | `claim_support` is voter/synthesis-owned (Phase 18/20); the aggregator does NOT emit it this phase, so there is no runtime test here -- the assurance is contract prose | Read `plugins/lz-advisor/references/lz-deep-research-schema.md`; confirm both fields exist, named distinctly, with explicit per-field owner and a worked example where `quote_fidelity: verified` coexists with `claim_support: unsupported` |
| Reference freezes source/claim/vote/excerpt + survivor shapes verbatim from the (corrected) aggregator with cited line anchors | PIPE-07 / SC-1 | Verbatim-fidelity is a copy-vs-source review, not an executable assertion | Read the reference; spot-check 3 or more frozen shapes against the cited `lz-deep-research-aggregate.mjs` functions/anchors |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s (~2s actual)
- [x] `nyquist_compliant: true` set in frontmatter (flipped 2026-06-15 by validate-phase, post-execution)

**Approval:** approved 2026-06-15 (validate-phase audit; no gaps, suite green 19/19)

---

## Validation Audit 2026-06-15

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

State A audit: VALIDATION.md existed at plan-time draft state (all rows `pending`, both flags `false`).
Phase was fully executed (17-01-SUMMARY, 17-02-SUMMARY, 17-VERIFICATION.md `passed` 11/11). Cross-referenced
all eight Per-Task Map rows against the live `lz-deep-research-aggregate.test.mjs` and an independent
FILE-form run (`tests 19, pass 19, fail 0, exit 0`). Every automated-testable requirement is COVERED and
green (per-tier confidence assertions at test lines 87/101/108/117/128/135 + the 5-label stdout assertion +
the `survivors.length === 1` downgrade-not-delete check at line 116). The VERIF-06 / SC-1 verbatim-freeze
items remain legitimately Manual-Only (copy-vs-source fidelity has no executable assertion); their automatable
grep gates pass. No gaps -> no auditor spawn, no Wave 0 work. Flipped `nyquist_compliant` and
`wave_0_complete` to `true`; statuses `pending` -> `green`.
