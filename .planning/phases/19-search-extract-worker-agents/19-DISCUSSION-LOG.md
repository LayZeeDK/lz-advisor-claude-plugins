# Phase 19: Search + extract worker agents - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-06-16
**Phase:** 19-search-extract-worker-agents
**Areas discussed:** Phase-19 scope, Haiku-gate escaped-error budget, three open design points (retrieval backend, voter-vs-worker tier mapping, residual-implementation disposition)
**Mode:** `--auto --analyze` (ultracode); chain DISABLED by owner ("Don't chain. Stop after discuss.")
**Process:** executor supplies facts; advisors (Opus panel + off-family on escalation) decide by consensus; the Phase-18 docs + ROADMAP are authoritative ground truth unless a different fact surfaces.

---

## How this discussion ran

The discuss started by treating Phase-19 scope and the gate budget as open trap-quadrant gray areas and
launching a 4-lens Opus blind panel + adversary. The owner then directed the correct framing: read the
Phase-18 LEARNINGS + the other artifacts first; Phases 19/20 were ALREADY re-planned after the Phase-18
evals, so the ROADMAP is authoritative. On reading `ROADMAP.md`, the Phase-19 scope (AMENDED 2026-06-16,
SC-1..5) and the pre-registered lock rule were found to be LOCKED -- not open. The discuss was re-run as a
ratification + convergence pass under the corrected operating model.

## Area 1 -- Phase-19 scope

| Option | Description | Selected |
|--------|-------------|----------|
| A: workers + loop + offline-gold read | the full relocated EVAL-01/02/04 in Phase 19 | LOCKED (already the ROADMAP-amended scope; not a choice) |
| B: workers + loop + trap set; defer the read | smaller P19 | (moot) |
| C: workers only; whole pilot -> P20 | smallest P19 | (moot) |
| D: insert a dedicated P19.x eval phase | split build-vs-run | (moot) |

**Outcome:** NOT an open decision. `ROADMAP.md` Phase 19 (AMENDED 2026-06-16, commit `70ba302`) already
fixes the scope as A (workers + autonomous-search loop + offline known-gold read). Re-deciding it would
have re-litigated a locked phase boundary (scope_guardrail). The first panel's A/B/C/D framing was retired.

## Area 2 -- Haiku-gate escaped-error budget

| Option | Description | Selected |
|--------|-------------|----------|
| Balanced / Conservative / Permissive numeric tier | pick an offline absolute-rate ceiling | (mis-framed) |
| Reframe: budget binds operationally (Phase 20), not at the offline read | offline gate = DELTA arm only | ADOPTED |

**Outcome:** Reframe. An independent Clopper-Pearson power analysis (one-sided 95% upper bound on 0/N is
~3-6% at N=60-100; the subtle stratum ~30% of that pushes it to ~9.5-15.3%) shows the absolute-rate arm
cannot bind at the achievable offline N. The offline read can license Haiku only via the pre-registered
Haiku-MINUS-Sonnet DELTA arm; the escaped-error budget is a Phase-20 operational parameter (ROADMAP SC-6 +
the lock rule both place it there). This MATCHES the already-pre-registered lock rule -- a validation, not
a new decision.

## Area 3 -- three open design points (advisor consensus, 3/3 unanimous round 2)

| Question | Consensus resolution | Selected |
|----------|----------------------|----------|
| Q_RATIFY: do the locked decisions stand? | YES (3/3); reopener = none; F1-F4 all consistent with ground truth | ratified |
| Q_D05: live-WebSearch vs static-KS | pluggable retrieval backend, one shared search-and-stop core (D-09) | adopted |
| Q_VW: which tier does the offline read settle? | voter directly, search-worker derivatively via the shared core (D-10) | adopted |
| Q_OPEN: decide-now vs researcher-delegated | loader fix / canonicalization / receipt / excerpt = decide-now (frozen-contract anchors); trap-set construction = researcher-delegated | adopted |

**Notes:** Two narrow round-1 splits resolved on the merits toward the better-grounded position: (a) the
INCONCLUSIVE/defer-to-shadow branch was retained (HAIKU-PILOT explicitly forbids reading a saturated tie as
Haiku-safe); (b) the loader fix is decide-now and is a PER-SOURCE `--repo-type` parameterization (WiCE stays
`dataset`; `chenxwh/AVeriTeC` -> `model`), NOT a blanket flip (Advisor 1, from direct source inspection).

## Claude's Discretion (researcher-delegated)
- Trap-set construction for the offline known-gold harness (buried/absent/date-sensitive strata sizing,
  Sonnet-below-ceiling calibration, generator-outside-voter-families hygiene, weak-verifier anchor) -- under
  the standing Phase-18 delegation; re-saturation is the #1 risk.

## Deferred Ideas
- Operational shadow -> canary -> Tier-1 + guardrails + the escaped-error budget number -> Phase 20.
- Larger-N (>100) trap set -> v2. Native AVeriTeC Conflicting cross-check arm -> optional/non-blocking.
- RTK command-suitability research (match ~0.6) -- reviewed, not folded (orthogonal; backlog).
