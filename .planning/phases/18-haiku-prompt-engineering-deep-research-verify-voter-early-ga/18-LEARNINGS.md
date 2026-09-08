---
phase: 18
phase_name: "haiku-prompt-engineering-deep-research-verify-voter-early-ga"
project: "lz-advisor"
generated: "2026-06-16"
counts:
  decisions: 11
  lessons: 8
  patterns: 11
  surprises: 6
missing_artifacts:
  - "*-UAT.md"
---

# Phase 18 Learnings: haiku-prompt-engineering-deep-research-verify-voter-early-ga

Phase goal: engineer the Haiku verify-voter from a deep-research pass (EVAL-05) BEFORE any Haiku
agent; author the Sonnet baseline + research-grounded Haiku verify-voter against the frozen vote
schema; run the pre-registered gating eval standalone to SETTLE-OR-RAISE the Haiku-first flag
(EVAL-03). Outcome: achieved via the RAISE branch -- the gate VOIDed via saturation, the owner chose
to PURSUE Haiku-first via a staged autonomous-search pilot, and Sonnet-default ships. EVAL-01/02/04
relocated honestly to Phase 19.

## Decisions

### EVAL-05 reference authored BEFORE any Haiku agent (D-08 fairness premise)
The Haiku prompt-engineering reference (`plugins/lz-advisor/references/lz-haiku-prompt-engineering.md`)
was authored and committed (08876be) as a shipped pure-prose, zero-dep doc PRECEDING the Haiku agent
(459b4fd). It opens with the fairness framing: the Haiku voter prompt targets the SAME task contract
as the Sonnet baseline (identical schema, dataset, grader), so the eval measures MODEL capability, not
prompt quality.

**Rationale:** The entire Haiku-vs-Sonnet gate is only fair if the Haiku prompt is research-grounded,
not a Sonnet prompt run on `model: haiku`. Precedence is proven by commit order.
**Source:** 18-01-PLAN.md, 18-01-SUMMARY.md, 18-VERIFICATION.md

### jstat@1.9.6 as the eval-only statistics library; never hand-rolled
All CI / interval / Pass@k math routes through the pinned `jstat` (`jStat.beta.inv`,
`jStat.normal.inv`, `jStat.combination`). No hand-rolled `logGamma`/`incbeta`/`betaInv`/comb (D-07).
The pin is exact (no caret/tilde), lockfiled, with `node_modules` gitignored.

**Rationale:** Statistical correctness is the gate's trust anchor; a hand-rolled special function is a
subtle-bug surface. A vetted library with verified numeric anchors is auditable. Hand-rolling is
forbidden by contract.
**Source:** 18-02-SUMMARY.md, 18-03-SUMMARY.md, 18-VALIDATION.md

### D-11 packaging boundary: repo-level eval/ is the ONLY install surface
The distributed plugin tree (`plugins/lz-advisor/`) stays strictly zero-dep; the repo's first-ever
install surface lives under `eval/` and never ships. The boundary is enforced from BOTH sides: the
re-scoped Phase-16 SC-2 test (no package.json/node_modules under the plugin tree) plus a new
`eval/lz-eval-packaging-boundary.test.mjs` (no plugin-tree .mjs imports any eval/ script). Both CI
workflows gate the eval-tree tests on every push/PR.

**Rationale:** The plugin's zero-dependency promise to users must hold even while introducing a
statistics library for the eval; a one-directional eval->runtime import keeps dev tooling out of the
shipped artifact.
**Source:** 18-02-SUMMARY.md, 18-VERIFICATION.md

### Gate redefinition via 3-family consensus: programmatically synthesized open-book overreach (Path B)
After the original gate was found unsatisfiable, a 3-family consult (Opus + GPT-5.5 + Gemini) over 3
rounds converged on Path B: take dense-evidence AVeriTeC "Supported" claims, mutate each by EXACTLY
ONE overreach step (scope / causation / magnitude / certainty) to `expected_verdict: refuted`, and vote
OPEN-BOOK against the dated AVeriTeC revised-2.0 KS.

**Rationale:** Honors the Tier-1 intent (test the open-book silent-false-uphold mechanism) by changing
the corpus rather than amending the gate down to closed-book. Both out-of-family models rejected the
native AVeriTeC Conflicting class (Path A) as too noisy (kappa ~ 0.62); synthesized traps are clean
gold-by-construction with a controllable N.
**Source:** 18-GATE-RECONCILIATION-CONSULTS.md, 18-EVAL-GATE-CONTRADICTION.md

### Pooled-n statistics + CP(1,N) formula ceiling; retire the 0.25 scalar
The binomial `n` is POOLED claim-trials (subtle_claims x trials), not per-claim. The PASS ceiling is
registered as a FORMULA -- `clopperPearsonUpper(1, N_pooled, ALPHA)` evaluated at the realized pooled n
(~0.05 at N=60-100) -- so zero pooled excess PASSES and the first excess FAILS. The legacy
`DELTA_UPPER_MAX = 0.25` scalar is retired as mathematically incorrect for any n > 19.

**Rationale:** Tightening 0.25 -> ~0.05 is a legitimate, DERIVED, STRICTER pre-vote fix; a frozen
scalar cannot be correct across varying sample sizes. Reliability (>=15 trials/claim) stays a separate
gate.
**Source:** 18-GATE-RECONCILIATION-CONSULTS.md, 18-03-SUMMARY.md

### License posture: mutating AVeriTeC (CC-BY-NC) is dev-only, gitignored, recipe-not-text
User-ratified: mutating AVeriTeC claims is accepted PROVIDED the derivatives live only in the
gitignored `eval/.cache` (never committed/distributed) and the committed manifest carries only uids +
remapped labels + the mutation RECIPE/seed (method, not NC text). Local dev-only eval = non-commercial
internal research.

**Rationale:** Path B mutates a NonCommercial corpus into derivatives; keeping them off-disk-in-git and
recording only the method keeps the open-source plugin license-clean.
**Source:** 18-GATE-RECONCILIATION-CONSULTS.md

### WiCE vendored as the only commit-safe corpus; AVeriTeC/LLM-AggreFact fetch-only
WiCE (ODC-BY/MIT) records are vendored verbatim with a NOTICE; AVeriTeC (CC-BY-NC) and LLM-AggreFact
(CC-BY-ND) are manifest-only -- IDs + labels + revision + sha256, never the corpus text. The committed
manifest is a license-compliant derived artifact.

**Rationale:** Redistributing encumbered corpus text in an open-source repo would violate the NC/ND
terms; the closed-book SUBTLE gate is fully self-contained from the vendored WiCE rows.
**Source:** 18-04-SUMMARY.md

### Owner decision: PURSUE Haiku-first via a staged pilot (reject only on clear evidence)
When the gate could not positively clear Haiku, the EVAL-03 decision was RAISED to the owner, who chose
to pursue Haiku-first -- reject only on clear evidence, and none was found. Sonnet-default ships; the
Haiku variant stays authored behind the OFF flag pending the pilot.

**Rationale:** Parity on every cheaply-testable axis is not rejection evidence; the production
silent-false-uphold axis was never tested, so neither flip-on nor reject is licensed yet.
**Source:** 18-05-SUMMARY.md, 18-HAIKU-PILOT.md, STATE.md

### Decisive test relocated to a staged autonomous-search pilot (offline-gold first)
The definitive test moves out of a standalone Phase-18 gate into a staged pilot: build the
autonomous-search loop ONCE -> first decisive read OFFLINE on curated known-gold traps (Sonnet-below-
ceiling calibration) -> then live shadow -> canary -> Tier-1, with a pre-registered Clopper-Pearson
clear-rejection gate + unanimity-blind-spot guardrails. This threads Phase 19 (search loop) + Phase 20
(audit/escalation).

**Rationale:** Offline-gold is the only instrument that observes the correlated-failure quadrant (both
models miss the disconfirming evidence) and yields ABSOLUTE false-uphold rates the gate math needs;
Sonnet-as-auditor is structurally blind to it. Offline = calibration, operational = validation, in
that order.
**Source:** 18-HAIKU-PILOT.md

### EVAL-01 / EVAL-02 / EVAL-04 relocated to Phase 19 (no false closure)
The Phase-18 machinery (aggregator, dataset loader, 70-example manifest, pre-registered lock-rule
prose) is built, committed, and unit-passing, but the DEFINITIVE gating RUN moves to the staged pilot
because the synthesized open-book gate VOIDed. The requirements are honestly relocated, not
over-claimed.

**Rationale:** The subtle+open-book stratum the definitive run needs does not exist in the Phase-18
manifest (0 rows) by the documented structural contradiction; claiming closure would be false.
**Source:** 18-05-SUMMARY.md, 18-VERIFICATION.md

### Gating-eval harness will be a dynamic Workflow over nested voter subagents (not claude -p)
Decided during the session: the gating eval runs as a dynamic Workflow driving nested voter subagents
(`agent({model, schema})` per vote), with resumability via filesystem vote persistence under the
gitignored `eval/.cache/` + skip-already-done on re-run. The deterministic driver functions are to be
MC/DC-tested and agent-reviewed before any full run.

**Rationale:** The existing pilot harnesses prove lower overhead, built-in concurrency, and
structured-output validation; resumability lets an account switch + re-run continue mid-eval.
**Source:** 18-EVAL-GATE-CONTRADICTION.md

## Lessons

### A pre-registered gate can be unsatisfiable by construction -- audit the data BEFORE the run
The sole hard gate (SUBTLE open-book false-uphold DELTA) had ZERO matching data: D-02 makes the subtle
spine WiCE (closed-book), D-05 confines open-book retrieval to AVeriTeC's KS, and D-02c excludes
AVeriTeC's subtle-adjacent class -- subtle and open-book are disjoint by design (0 of 70 manifest
rows). `clopperPearsonUpper(0,0)` returns 1, auto-failing the gate. Caught at the Plan 18-05 pre-flight
before any model call.

**Context:** Three separately-reasonable locked decisions combined into a contradiction that no single
plan/summary flagged; 18-04-SUMMARY even silently renamed the gate to "closed-book" without noting the
mismatch. A cheap structural query (count rows where stratum=subtle AND book=open) would have caught it
at plan time.
**Source:** 18-EVAL-GATE-CONTRADICTION.md

### Supplied-evidence pilots re-saturate; the decisive axis is autonomous search-and-stop
Both cheap pilots handed the voter the retrieval, so they tested reasoning-over-supplied-evidence --
which Haiku does as well as Sonnet. The untested, cost-driving axis is the voter issuing its OWN
disconfirming searches over the raw KS, deciding WHAT to search and WHEN TO STOP, with per-claim
date-cutoff enforcement.

**Context:** A "cheaper" supplied-evidence variant just re-saturates; only the full search-loop harness
exercises the premature-stop / default-uphold failure mode the eval actually cares about.
**Source:** 18-GATE-RECONCILIATION-CONSULTS.md, 18-HAIKU-PILOT.md

### Small-n kills statistical power; pin the CP `n` semantics first
At n=17 subtle claims, CP(0,17) upper ~ 19.5%; if the gate needs an upper bound < ~5% it is
mathematically unreachable. The CP `n` semantics (per-claim trials vs pooled claim-trials) must be
pinned because it changes whether the ceiling constant is even the right value.

**Context:** All three advisors flagged the n-size problem as potentially decisive; it drove the switch
to pooled-n + a derived formula ceiling and the N=60-100 sizing target.
**Source:** 18-GATE-RECONCILIATION-CONSULTS.md

### A closed-book amendment would have gutted the eval's purpose
Amending the gate to closed-book (excerpt-only) was the LOW-effort, satisfiable-today option, but all
three advisors rejected it: closed-book tests reading comprehension / local entailment, NOT the
open-book silent false-uphold (retrieve real docs, hit distractor/syndicated/partial evidence, find no
clean refutation, uphold an overreach). A closed-book PASS cannot license the Haiku-first flip.

**Context:** The easy fix that honors the literal lock-rule wording can still be the wrong fix when it
abandons the requirement's intent; changing the corpus to rescue the strict intent is the opposite of
result-shopping.
**Source:** 18-GATE-RECONCILIATION-CONSULTS.md

### Cheap-voter UNANIMITY is not independence -- it is the blind spot
Correlated Haiku errors produce unanimous upholds, so there is no contested split and a flat ~15-20%
random audit is a weak net. Sonnet-as-auditor only measures Haiku-vs-Sonnet DISAGREEMENT, which is
identically zero on a unanimous correlated false-uphold.

**Context:** This is why offline known-gold (absolute error rates) is required before any operational
disagreement-based measurement, and why every guardrail (elevated audit of unanimous upholds, mixed-tier
Sonnet seat, mechanical search minimums) targets exactly this failure.
**Source:** 18-HAIKU-PILOT.md

### jStat.combination returns NaN for n<k, poisoning Pass@1
The reference Pass@k wrapper `1 - jStat.combination(n-c,k)/jStat.combination(n,k)` returns NaN whenever
`n-c < k` (e.g. all trials correct -> `combination(0,5)` is NaN). Fixed with an internal `comb(a,k)`
that applies the documented `C(a,k)=0 for a<k` identity before delegating to the library.

**Context:** Applying a combinatorial identity is NOT hand-rolling a special function -- every real
combination value still comes from jstat; only the degenerate identity is applied, so D-07 holds. The
test fixtures caught it at GREEN.
**Source:** 18-03-SUMMARY.md

### Loader assumptions about HF repos were wrong (Phase-19 fix-inputs)
`chenxwh/AVeriTeC` is an UNGATED `model` repo, but `eval/lz-eval-dataset.mjs` hardcodes
`--repo-type dataset` and assumes the repo is gated. Surfaced during the feasibility pilots.

**Context:** Carried forward as a Phase-19 fix-input, not patched in Phase 18 (the pilot rebuilds the
gate). A reminder to verify repo type/gating empirically rather than assuming.
**Source:** 18-05-SUMMARY.md, 18-GATE-RECONCILIATION-CONSULTS.md

### Record a saturated tie as VOID/raised, never as "parity proven"
DELTA=0 with both tiers at 0/30 trips the pre-registered saturation rule: the honest claim is "this
test could not tell the two models apart," NOT "the two models are proven equivalent." The
cost-asymmetry (a wrong Haiku flip risks unbounded silent false confidence; Sonnet-default spends
within budget) makes the distinction load-bearing.

**Context:** A fresh-context neutral re-consult (no prior framing) independently reached this wording,
validating the earlier led consensus while phrasing the outcome more conservatively.
**Source:** 18-GATE-RECONCILIATION-CONSULTS.md

## Patterns

### House-style references/ doc
Lead with "single source of truth for ..."; name downstream consumers explicitly; reference scripts via
`${CLAUDE_PLUGIN_ROOT}`; anti-drift framing. Mirrors `lz-deep-research-schema.md`.

**When to use:** Authoring any shipped `references/` doc that other components derive from.
**Source:** 18-01-SUMMARY.md

### Verified-source tagging
Every load-bearing technique carries a `[CITED: ...]` tag; un-promoted claims keep `[ASSUMED]`
verbatim and are flagged as non-load-bearing. No claim is asserted as fact without a source.

**When to use:** Any research-grounded artifact whose claims propagate downstream (the T-18-01
information-integrity mitigation).
**Source:** 18-01-SUMMARY.md

### Packaging boundary enforced from both sides
When introducing a dev-only install surface beside a zero-dep shipped artifact, assert the boundary
from BOTH directions: no deps under the shipped tree AND no shipped artifact imports the dev tree
(one-directional import only), then backstop both in CI.

**When to use:** Adding any non-shipping tooling tree (eval/, tools/) to a zero-dependency plugin.
**Source:** 18-02-SUMMARY.md

### Supply-chain checkpoint: blocking-human verify before committing the first lockfile
The first npm install of an external package is gated behind a blocking-human checkpoint that verifies
exact pin, verbatim LICENSE, no install/native scripts, zero runtime deps, and numeric anchors -- only
then is the lockfile committed.

**When to use:** Introducing the first (or any new) third-party dependency into a repo that prides
itself on zero/minimal deps.
**Source:** 18-02-SUMMARY.md

### Library-computed statistics, anchor-asserted (never re-derived)
Route all interval/combinatorics math through a pinned library; tests assert the verified library
anchors (e.g. CP(0,15)~=0.218, combination(15,3)=455) to prove the library is wired correctly rather
than re-deriving the math, and assert the ABSENCE of any hand-rolled special function.

**When to use:** Any statistical gate engine where correctness is the trust anchor.
**Source:** 18-03-SUMMARY.md, 18-VALIDATION.md

### Pre-registration discipline with a legitimate zero-votes amendment window
A pre-registered lock rule may be re-registered ONLY before the first model call (zero votes). Document
the structural-defect rationale, freeze every numeric threshold, and lock the construction rules before
the first vote. Changing the gate AFTER any vote to make a result pass is post-hoc p-hacking.

**When to use:** Any pre-registered eval that hits a definitional defect before execution.
**Source:** 18-EVAL-GATE-CONTRADICTION.md, 18-GATE-RECONCILIATION-CONSULTS.md

### Discriminating present/absent sibling fixtures + a forcing DELTA fixture
For a counter, commit a present sibling (count 1) and an absent sibling (count 0) that differ only in
the discriminated attribute, plus a non-zero-baseline fixture that forces the subtraction (Haiku 2 -
Sonnet 1 -> 1). Mutation-verify that each fixture actually discriminates.

**When to use:** Testing any counting/diffing logic where a tautological fixture would pass vacuously
(the Phase-17 CR-01 discipline).
**Source:** 18-03-SUMMARY.md

### Difficulty calibration + saturation pre-condition
Use Sonnet as the difficulty calibrator: if Sonnet also scores near-ceiling on a stratum, the stratum
is non-discriminating and a zero-excess DELTA is VOID, not a PASS -- harden it before reading any
Haiku-vs-Sonnet delta.

**When to use:** Any comparative model eval where both models acing the set would be mistaken for a
clean pass.
**Source:** 18-HAIKU-PILOT.md, 18-GATE-RECONCILIATION-CONSULTS.md

### ASCII-escaped vendored records
Vendor third-party records verbatim but escape every non-ASCII codepoint to its `\uXXXX` JSON escape so
the committed bytes are strictly ASCII yet `JSON.parse` reads back the identical record; compute the
sha256 over the ASCII bytes.

**When to use:** Committing real-world corpus/data records under a strict ASCII-only repo rule.
**Source:** 18-04-SUMMARY.md

### Offline drift gate that fails closed early
Recompute sha256 over each vendored file + assert coverage (matched count == manifest uid count, no
orphans) in the unit suite, so manifest/vendor drift fails at the cheap Wave-2 gate, not at the costly
live run. Include a discriminating tampered-byte case.

**When to use:** Any committed-manifest + vendored-data pair where divergence must be caught before an
expensive downstream step.
**Source:** 18-04-SUMMARY.md

### Neutral re-consult with a fresh-context agent + generator hygiene
Validate a "led" multi-model consensus by re-running the brief NEUTRALLY (facts only, symmetric options,
no stated preference) with a FRESH agent whose context carries no prior framing. When synthesizing eval
traps, generate them with a model OUTSIDE the voter families to avoid a shared-blind-spot artifact, and
accept a trap only if it flips a deliberately-weak reference verifier.

**When to use:** High-impact, hard-to-reverse decisions reached via multi-round AI consults, and any
model-generated eval data that a model under test will be judged on.
**Source:** 18-GATE-RECONCILIATION-CONSULTS.md

## Surprises

### The sole hard gate was unsatisfiable by construction -- found at pre-flight, zero votes
The pre-registered gate quantity (subtle AND open-book) had no satisfiable data because three locked
decisions made the two attributes disjoint by design. Discovered at the Plan 18-05 pre-flight before
any model call.

**Impact:** The whole live eval was paused; the gate definition was formally re-opened via
discuss-phase + a 3-family consult and re-registered in the legitimate zero-votes window. No bad result
was ever produced.
**Source:** 18-EVAL-GATE-CONTRADICTION.md, STATE.md

### The Path B consensus assumption was empirically FALSIFIED by saturation
The 3-family consensus assumed synthesized subtle overreaches would fool the cheap voter open-book.
They did not: Haiku 0/30 false-upholds == Sonnet 0/30, DELTA=0 even under noisy top-30 retrieval; a
query-formulation proxy was also parity (Haiku 1.70 vs Sonnet 1.70). The traps were valid (Opus judged
10/10 genuine) -- the voters simply caught them all.

**Impact:** The synthesized-overreach gate VOIDed via the pre-registered saturation rule; the decision
became an EVAL-03 raise reached cheaply with strong data, instead of an expensive full run.
**Source:** 18-GATE-RECONCILIATION-CONSULTS.md, 18-05-SUMMARY.md

### Advisors crossed over between rounds (R1 split -> R2 swap)
Round 1 split (Opus = Path A native Conflicting class; GPT-5.5 + Gemini = Path B synthesis). Round 2
crossed over: Opus moved to B (the agreement-filter selects the easy tail), while GPT-5.5 + Gemini moved
to A (the CC-BY-NC license concern). A user license ratification + Round 3 settled the hybrid.

**Impact:** Demonstrated that an out-of-family consult is not a one-shot vote; the crossover surfaced
both the license risk and the easy-tail-selection risk that a single round would have missed.
**Source:** 18-GATE-RECONCILIATION-CONSULTS.md

### Phase goal scored 6/6 VERIFIED while producing no numeric PASS/FAIL
The phase goal is a disjunction (SETTLE or RAISE); it was achieved via the RAISE branch, which EVAL-03
names as a first-class outcome. The verifier scored 6/6 must-have truths with zero gaps despite the
gating eval never yielding a numeric pass.

**Impact:** Confirms that a well-evidenced RAISE is a legitimate completion, not a failure -- as long as
the relocation of EVAL-01/02/04 is disclosed honestly rather than papered over.
**Source:** 18-VERIFICATION.md

### `node --test <dir>` still spuriously exits 1 on this host
The host quirk where `node --test <dir>` exits 1 even when all tests pass recurred; every eval-tree
gate uses the explicit `.test.mjs` FILE form instead. The full deterministic suite is 71/71 green only
when run file-by-file.

**Impact:** Every CI step and validation command in this phase names test files by explicit path; a
dir-form invocation would have produced a false red.
**Source:** 18-VALIDATION.md

### Multi-round out-of-family consults consumed ~35-58 AI Credits
The gate-reconciliation deliberation spent ~35 Copilot AI Credits across rounds (logged ~23 in one
artifact header including wasted/failed canaries, ~35 across the full R1-R3 process).

**Impact:** A reminder that metered out-of-family consults add up across rounds; they were reserved for
exactly the high-impact, hard-to-reverse gate-definition decision the trap quadrant calls for, and
human-gated before spending.
**Source:** 18-GATE-RECONCILIATION-CONSULTS.md
