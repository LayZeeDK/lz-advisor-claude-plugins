---
status: partial
phase: 08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle
source: [08-VERIFICATION.md]
started: 2026-05-19
updated: 2026-05-19
---

## Current Test

[awaiting human testing -- both items are forward-looking Phase 9 watch items, not Phase 8 blockers]

## Tests

### 1. F-fixture assertion (a) re-verification when natural pre-emption-failure surfaces
expected: When a natural UAT scenario produces a `<verify_request class="2">` block from security-reviewer (executor pre-emption fails to resolve the question), running `F-class-2-escalation.sh --from-trace <that-trace>` should pass assertion (a) and emit `[PASS]` for the full Class-2 escalation chain.
result: [pending] -- Phase 8 engineered 3 trigger scenarios but executor pre-emption resolved each before security-reviewer needed to escalate. F-fixture canon is in place and bash -n clean; waiting on natural UAT.
natural_uat_2026_05_31: |
  CONFIRMING DATA POINT (not a closure). The Compodoc natural UAT (08-NATURAL-UAT-COMPODOC.md)
  ran /lz-advisor.security-review on a real Angular Nx workspace with GENUINE supply-chain
  findings (@compodoc/compodoc postinstall RCE surface, @babel/plugin-transform-modules-systemjs
  high-sev CVE, ajv ReDoS). Despite a real Class-2-S supply-chain question being present, the
  security-reviewer did NOT emit a <verify_request> block -- because the executor PRE-EMPTED it
  by running `npm audit` + reading package-lock.json (hasInstallScript) during Phase 1 orient,
  packaging 6 tool-grounded pv-* blocks. Trace: natural-uat-compodoc/session-6-security-review.jsonl
  (the only "verify_request" string in the trace is the SKILL.md instruction text, entry 10 --
  an attachment, NOT an emitted block).
  IMPLICATION: item 1 STAYS pending -- the natural pre-emption-FAILURE scenario still has not
  surfaced. But this UAT is the strongest evidence yet that the pre-emption discipline is robust
  on a REAL (not engineered) supply-chain question. Consistent with the 08-VERIFICATION override
  rationale. F-class-2-escalation.sh remains the durable regression vehicle for the day a genuine
  pre-emption failure occurs (e.g., a CVE published after the model's training cutoff with no npm
  audit coverage yet).

### 2. Marketplace publication at 0.14.0
expected: When/if the user decides to publish 0.14.0 to the marketplace, the atomic 5-surface version sync (already in place per Plan 08-01) should be sufficient for marketplace ingestion. Optional per D-04 (version cadence not load-bearing in pre-release).
result: [pending] -- out-of-scope for Phase 8 execution; tracked as forward-looking item.
natural_uat_2026_05_31: |
  5-surface SYNC verified (publication still deferred). The Compodoc natural UAT's close-out audit
  confirmed all 5 surfaces (plugin.json + plan/execute/review/security-review SKILL.md) carry 0.14.0
  (git grep -c returns 1 each) and the plugin was NOT mutated during the UAT (git status -- plugins/
  empty; HEAD unchanged at 56ff109). So the sync precondition for publication holds; only the
  publication decision itself remains user-gated.

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0
natural_uat_note: |
  Both items remain pending (item 1 hook not naturally triggered; item 2 publication deferred), but
  the 2026-05-31 Compodoc natural UAT added strong confirming evidence to each. See
  08-NATURAL-UAT-COMPODOC.md for the full 8-session record.

## Gaps
