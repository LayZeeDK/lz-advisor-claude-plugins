---
phase: 17
slug: json-schema-verification-contract-reference
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-15
---

# Phase 17 — Validation Strategy

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

> Task IDs are assigned by the planner. Rows are keyed by requirement + behavior; the planner maps each to a
> concrete task ID and copies the automated command into the task's `<acceptance_criteria>`.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | 0/1 | PIPE-07 | — | tally maps every readable tally to exactly one of {High,Medium,Low,Contested,Unsupported}; `High` branch | unit | `node --test .../lz-deep-research-aggregate.test.mjs` | ✅ (High covered today) | ⬜ pending |
| TBD | TBD | 0/1 | PIPE-07 | — | `Medium` = 2 readable `unrefuted` seats + 1 missing | unit | same | ❌ W0 | ⬜ pending |
| TBD | TBD | 0/1 | PIPE-07 | — | `Low` (thin) = 1 readable `unrefuted` seat + 2 missing | unit | same | ❌ W0 | ⬜ pending |
| TBD | TBD | 0/1 | PIPE-07 / D-03b | — | downgrade-not-delete: 3/3 `refuted` -> `Low`, claim still present (NOT deleted) | unit | same | ❌ W0 | ⬜ pending |
| TBD | TBD | 0/1 | PIPE-07 / D-03 | — | `Contested` on a per-claim voter split (>=1 `unrefuted` AND >=1 `refuted`); branch precedes `Medium` | unit | same | ❌ W0 | ⬜ pending |
| TBD | TBD | 0/1 | PIPE-07 | — | `Unsupported` = 0 readable vote seats | unit | same | ❌ W0 | ⬜ pending |
| TBD | TBD | 0/1 | D-02 | — | stdout by-confidence line names all 5 labels | unit | same (assert summary substring) | ❌ W0 | ⬜ pending |
| TBD | TBD | — | VERIF-06 | — | reference defines `quote_fidelity` (frozen) and `claim_support` (new) as two SEPARATE fields + worked example where `verified` coexists with `unsupported` | doc-review (manual) | reviewer reads `references/lz-deep-research-schema.md` | N/A (doc) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `Medium`-tier fixture/assertion (2 readable `unrefuted` seats + 1 missing) — covers PIPE-07
- [ ] `Low`-tier (thin) fixture/assertion (1 readable `unrefuted` seat + 2 missing) — covers PIPE-07
- [ ] `Low`-tier (downgrade-not-delete, D-03b) fixture/assertion (3/3 `refuted`, claim present + `Low`) — covers PIPE-07 + D-03b
- [ ] `Contested`-tier fixture/assertion (>=1 `unrefuted` AND >=1 `refuted`) — covers PIPE-07 + D-03
- [ ] `Unsupported`-tier fixture/assertion (0 readable vote seats) — covers PIPE-07
- [ ] stdout by-confidence 5-label assertion (a survivors set spanning multiple tiers) — covers D-02
- [ ] Update the fixture header enum-documenting comment to `{High, Medium, Low, Contested, Unsupported}`

*The framework + the committed-fixture pattern + the temp-run-dir helper already exist; no framework install.
The gaps are net-new fixture data + assertions, not new infrastructure.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Reference defines the two assurances as two separate fields (`quote_fidelity` vs `claim_support`) with a worked example | VERIF-06 | `claim_support` is voter/synthesis-owned (Phase 18/20); the aggregator does NOT emit it this phase, so there is no runtime test here — the assurance is contract prose | Read `plugins/lz-advisor/references/lz-deep-research-schema.md`; confirm both fields exist, named distinctly, with explicit per-field owner and a worked example where `quote_fidelity: verified` coexists with `claim_support: unsupported` |
| Reference freezes source/claim/vote/excerpt + survivor shapes verbatim from the (corrected) aggregator with cited line anchors | PIPE-07 / SC-1 | Verbatim-fidelity is a copy-vs-source review, not an executable assertion | Read the reference; spot-check ≥3 frozen shapes against the cited `lz-deep-research-aggregate.mjs` functions/anchors |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
