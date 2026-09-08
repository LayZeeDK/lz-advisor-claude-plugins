---
phase: 18-haiku-prompt-engineering-deep-research-verify-voter-early-ga
plan: 05
status: complete
outcome: EVAL-03 raise -> owner decision = PURSUE Haiku-first via a staged pilot (not rejected, not auto-flipped-ON)
completed: 2026-06-16
requirements: [VERIF-01, VERIF-02, VERIF-03, COST-02, EVAL-03, EVAL-05]
requirements_relocated_to_phase_19: [EVAL-01, EVAL-02, EVAL-04]
---

# Plan 18-05 SUMMARY -- verify-voter agents + the settle-or-raise gating eval

## What was built

**Task 1 (DONE; commit 459b4fd):** both verify-voter agents, authored against the FROZEN Phase-17
vote schema:
- `plugins/lz-advisor/agents/research-verify-voter-sonnet.md` -- model: sonnet, color green -- the
  SHIP DEFAULT.
- `plugins/lz-advisor/agents/research-verify-voter-haiku.md` -- model: haiku, color blue -- OFF by
  default; prompt DERIVED from the EVAL-05 reference (`references/lz-haiku-prompt-engineering.md`,
  D-08), plain phrasing, no `budget_tokens`, no prefill.
- Both cast ONE isolated skeptic vote, record `attack_mode` (VERIF-01), `disconfirming_query`
  (VERIF-02), and a source-independence note (VERIF-03); emit the frozen `verdict` core; reference no
  `eval/` path (the D-11 packaging boundary holds; verified by the boundary test).

**Tasks 2 + 3 (the staged gating eval + the Haiku-first flag decision):** resolved as an EVAL-03
RAISE -> owner decision. See below.

## The eval outcome: gate VOIDed via saturation -> EVAL-03 raise -> PURSUE Haiku via a staged pilot

1. **Contradiction at pre-flight.** The pre-registered "SUBTLE open-book" hard gate (D-07) had ZERO
   matching data: D-02 makes the subtle spine WiCE (closed-book) while D-05 confines open-book
   retrieval to AVeriTeC's KS, and D-02c excludes AVeriTeC's overreach class -- subtle and open-book
   are disjoint by construction. Detail: `18-EVAL-GATE-CONTRADICTION.md`.
2. **Re-deliberation (multi-round neutral 3-family consult).** Reached a consensus replacement gate:
   programmatically synthesized one-step-overreach traps voted open-book. Detail:
   `18-GATE-RECONCILIATION-CONSULTS.md`. (Owner ratified the AVeriTeC CC-BY-NC NonCommercial posture
   for gitignored dev-only use.)
3. **Feasibility pilots (cheap, zero production risk).** Traps 10/10 valid (Opus judge). But Haiku
   caught all on clean evidence AND on noisy top-30 retrieval (Haiku 0/30 false-upholds, Sonnet 0/30,
   DELTA 0) -> SATURATION -> the synthesized-overreach gate VOIDed (non-discriminating, per the
   pre-registered saturation rule). A disconfirming-query-formulation proxy was also parity (Haiku
   1.70/2 vs Sonnet 1.70/2). Established: Haiku is NOT grossly worse on reasoning-over-supplied-evidence
   or query formulation. NOT established: the production silent-false-uphold axis -- autonomous
   multi-step search with model-decided SEARCH-STOPPING + date-cutoff -- which the pilots did not test
   (they supplied the retrieval).
4. **EVAL-03 exercised.** The gate could not positively clear Haiku, so the decision was RAISED to the
   owner. **Owner decision: PURSUE Haiku-first** -- reject only on clear evidence, and none was found.
   Sonnet-default ships; the Haiku variant stays authored behind the OFF flag pending the pilot.
5. **Decisive test relocated to a staged pilot** (unanimous 3-family plan, `18-HAIKU-PILOT.md`): build
   the autonomous-search loop ONCE -> first decisive read OFFLINE on curated KNOWN-GOLD traps
   (buried/absent/date-sensitive; Sonnet-below-ceiling calibration; known gold is the only instrument
   that sees the correlated-failure quadrant) -> then live shadow -> canary -> Tier-1, with a
   pre-registered Clopper-Pearson clear-rejection gate + unanimity-blind-spot guardrails. This threads
   Phase 19 (the search loop) + Phase 20 (audit/escalation instrumentation).

## Requirements disposition (honest -- no false closure)

- **Satisfied at Phase 18:** VERIF-01/02/03 (voters authored to the frozen schema with attack-mode /
  disconfirming-search / source-independence), COST-02 (Sonnet-default ships + Haiku behind an OFF
  flag), EVAL-03 (settle-or-raise exercised -> raised -> owner settled it as pursue-via-pilot),
  EVAL-05 (the Haiku prompt-engineering reference, Plan 18-01).
- **Relocated to Phase 19:** EVAL-01 (the pre-registered >=60-100-claim dataset), EVAL-02 (the k>=5
  run reporting Pass@1/Pass^k/false-uphold), EVAL-04 (the pre-registered lock rule) -- the DEFINITIVE
  eval is the staged pilot; its curated-gold dataset, autonomous-search run, and pre-registered gate
  finalize there. The Phase-18 machinery (aggregator, dataset loader, lock-rule prose) is built and
  reusable.

## Key files

- created (ship): `plugins/lz-advisor/agents/research-verify-voter-sonnet.md`,
  `plugins/lz-advisor/agents/research-verify-voter-haiku.md`
- disposition record: `18-EVAL-GATE-CONTRADICTION.md`, `18-GATE-RECONCILIATION-CONSULTS.md`,
  `18-HAIKU-PILOT.md`

## Deviations

- **MAJOR (expected, legitimate):** the standalone gating eval did not produce a numeric PASS/FAIL on a
  synthesized-overreach gate -- it VOIDed via saturation, and the decision was raised (EVAL-03) and
  settled by the owner as pursue-via-pilot. EVAL-03 explicitly provides for this; the definitive eval
  relocated to the staged pilot (Phase 19/20).
- **Loader bugs found (carried as Phase-19 fix-inputs):** `chenxwh/AVeriTeC` is an UNGATED `model`
  repo; `eval/lz-eval-dataset.mjs` hardcodes `--repo-type dataset` and assumes the repo is gated.
- The committed `eval/lz-eval-lock-rule.md` still describes the (now-superseded) subtle-open-book gate;
  it is superseded by the pilot's gate (to be pre-registered in Phase 19). Noted, not rewritten, since
  the pilot rebuilds the gate.

## Self-Check: PASSED

Both voter agents exist and are committed; the EVAL-03 settle-or-raise was exercised and settled; the
disposition is recorded across the finding/consult/pilot docs; no false closure (EVAL-01/02/04 honestly
relocated to Phase 19, not over-claimed). The phase goal (settle-or-raise the Haiku-first flag) is met.
