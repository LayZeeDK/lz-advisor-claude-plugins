---
plan: 08-04-advisor-fragment-grammar-structural
phase: 08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle
status: not_shipped
shipped: false
reason: conditional gate did not fire
gate_decision: PASS
gate_source: 08-MEASUREMENT.md
created: 2026-05-19
---

# Plan 08-04 -- NOT SHIPPED (conditional)

## Disposition

Plan 08-04 is a CONDITIONAL plan per D-02 (compound OR-gate + disposition rule). It ships ONLY if Plan 08-03 (or Plan 08-03.5 in the auto-extend path) emits `gate decision = FAIL`.

**Plan 08-03 gate decision:** **PASS** -- evidence in `08-MEASUREMENT.md`.

Per D-02:

> - D1 alone fires -> Plan 4 = fragment-grammar template extension to advisor.md
> - D2 alone fires -> Plan 4 = density example audit
> - Both fire -> ship both
> - **Neither fires -> P2 residual closes structurally; advisor budget contract holds on n=3 evidence**

Since neither D1 nor D2 disjunct fires (PASS), Plan 08-04 disposition rule selects "P2 residual closes structurally; no Plan 4". Plan 08-04 is intentionally not shipped.

## Audit trail

- **D1 (code-block disjunct):** PASS -- 1/3 runs have >=1 code-block item over per-item cap. Threshold for FAIL: >=2/3.
- **D2 (aggregate disjunct):** PASS -- mean aggregate = 90.7w; 0/3 per-run aggregate >110w. Threshold for FAIL: mean>100 AND >=2/3 runs >110w.
- **Compound verdict:** PASS (both disjuncts PASS).
- **Atomic 5-surface version sync:** Plan 08-04 would have bumped 0.14.0 -> 0.14.1 (or 0.15.0 on escalation). Bump NOT performed; plugin remains at 0.14.0 from Plan 08-01.
- **advisor.md not modified:** `git diff plugins/lz-advisor/agents/advisor.md` is empty for Phase 8. Fragment-grammar emit template (Plan 07-10 canon) preserved verbatim.

## Requirement closure

- **RES-ADVISOR-FRAGMENT-GRAMMAR (P2 carry-forward):** Closed structurally by Plan 08-03 PASS verdict. The compound OR-gate served its purpose: empirical n=3 evidence shows advisor budget contract holds without structural redesign.

## Phase 9 carry-forward

- **Per-section `<output_constraints>` XML extension to advisor.md (escalation path):** Available as future structural alternative if subsequent UAT surfaces evidence of binding failure. Plan 07-14 reviewer/security-reviewer canon remains the byte-mirror reference if escalation is later needed.
- **n=10 statistical gate (Wilson 95% CI):** Plan 07-15 E.1 precedent for n=10 statistical evidence-grading. Reserved for hypothetical "still INCONCLUSIVE at n=5" worst case (which did NOT occur).

---

*Plan 08-04 audit-trail SUMMARY -- non-shipped conditional plan.*
