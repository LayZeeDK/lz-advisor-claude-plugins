# Phase 13 GAP-13-BUDGET-R2 -- Decision-Grounding Research

**Researched:** 2026-06-08
**Scope:** SCOPED -- three open design questions only. NOT a phase re-research. Grounds a single close-vs-defer call for GATE-02 / SC-4.
**Author:** gsd-phase-researcher (independent)

> This file is additive. `13-RESEARCH.md` (original phase research) is left intact.

---

## Bottom line up front

The empirical evidence (live `claude -p`, n=10) plus the external literature converge on a single conclusion: **the gate STRUCTURE -- a zero-tolerance hard per-item cap on a stochastic LLM generator -- is the primary thing to fix, not the agents.** The agents are already good: SHAPE is saturated (10/10), the security half went 0/3 -> 4/5, the worst overshoot collapsed 46w -> 33w. The three residuals are (1) one legitimately-long reviewer Question, (2) verbose-but-borderline security fix prose, (3) a 1-word marginal. Two of the three are concision-fixable; one (the Question) is a genuine contract gap. But chasing every run to exit 0 against a stochastic generator is, per multiple 2026 sources, a recognized anti-pattern with "0% detection power for behavioral regressions" -- the binary every-run gate will keep flaking on outliers no matter how good the agents get.

**Recommended overall: close-now with a design-aware fix** that (a) gives the gate an explicit outlier tolerance matching its own self-described "soft cap" semantics, (b) adds the reviewer Question carve-out mirroring security's, and (c) applies the FIX-R2-B concision nudge to the security fix-clause. This closes GATE-02 honestly without lowering the 28w target and without gaming the gate.

---

## The over-cap TEXT: verbose, or legitimately long?

This is the single most load-bearing input. I re-ran both fixtures `--from-trace` against the committed captures and got the exact word counts in GRADE-LOG-R2 (45; 33/33/33/30; 29). Verdict per residual:

### (A) review-4 -- the 45w reviewer Question: LEGITIMATELY LONG (contract gap, not verbosity)

Actual body (stripped of the `7. review-src/handler.ts:9: ` prefix; 45 words):

> "`processAdmin` receives the parsed `payload` typed `RawRequest`, but the parse output is arbitrary JSON, not a `RawRequest`. Is `RawRequest` the wrong type for parsed bodies, or is the parse-vs-wire-object distinction intentional? The annotation on `processAdmin`/`sendAuditLog` claims the post-parse object has `body`/`headers`, which it does not."

This is a genuine two-horned author-intent question: it (1) states the type-soundness observation, (2) poses the actual binary question the author must answer, and (3) supplies the evidence that makes the question non-rhetorical. Stripping it to 28w forces dropping either the second horn of the question or the evidence -- which makes it a worse question. This is NOT throat-clearing; there are no filler words, no "I noticed", no restated code. **It is the FIX-4 shape (bracket-less multi-clause Question) landing in the reviewer, which -- unlike the security-reviewer -- has no sanctioned escape.** The security-reviewer's own contract already concedes this class needs an escape (its FIX-4 routes elaboration to `### Per-finding validation`); the reviewer simply never got the analogous valve. This is a structural asymmetry in the contract, confirmed by the agent files: `security-reviewer.md:200-203` gives the bracket-less Question a documented split-to-PFV path; `reviewer.md` has no equivalent rule.

### (B) security-1 -- the four 30-33w findings: BORDERLINE -- mostly concision-fixable, one arguably legitimate

The four bodies (OWASP tag + location prefix excluded by the fixture):

> 33w: "`exec('du -sh ' + path)` concatenates attacker-controlled `query.mountPath` into a shell string; `\"/; rm -rf /\"` yields arbitrary OS command execution. Replace with `execFile('du', ['-sh', path])` plus an allow-list of permitted mount paths."

> 33w: "live `sk_live_...` key hardcoded in source -- any repo reader, fork, or CI obtains it; unrotatable without code change. Move to a secrets manager / env var and rotate the leaked key now."

> 33w: "second `exec('curl ' + url + ...)` concatenates the token URL and `JSON.stringify(parsed)` into a shell string (command/argument injection via crafted `du` output). Use `execFile`/`fetch` with an arg array, never a shell string."

> 30w: "token sent as query param over `http://cache.internal` -- plaintext on the wire and in proxy/access logs. Switch to `https://` and move the token to an `Authorization` header, not the URL."

Assessment: these are tight, high-quality findings -- but they DO carry the verbosity FIX-R2-B targets. Each packs a remediation that names two actions ("Replace with X plus an allow-list", "Move to secrets manager / env var and rotate", "Use execFile/fetch ... never a shell string", "Switch to https and move the token to a header"). The fix clauses also reproduce the vulnerable call expression (`exec('du -sh ' + path)`, `exec('curl ' + url + ...)`) -- exactly the inline-code reproduction FIX-3 forbids on the FINDING side but never extended to the FIX side. Trimming to "name the safe API in backticks, point at the line" lands each at ~24-27w without losing signal. So: **fixable by concision for 3 of 4; the hardcoded-key one (33w) is closest to genuinely-needs-the-words but still trims** ("hardcoded live key in source; any reader/fork/CI obtains it, unrotatable. Move to env/secrets manager; rotate now." ~22w). Verdict: **verbosity-fixable, but at the margin** -- this is precisely the kind of borderline case where a tolerance band is more robust than chasing each finding under 28w on every stochastic run.

### (C) review-3 Finding 5 -- 29w: VERBOSE (1w marginal, trivially fixable)

> 29w: "`validate` does `data.name.trim()` with no guard; non-string/missing `name` throws `TypeError` -- swallowed by `processUser` catch (line 44), so valid-vs-malformed inputs both silently return `null`. Guard `typeof data?.name === 'string'`."

This bundles a four-link causal chain (deref -> TypeError -> swallowed by catch -> both return null) into one body. It is 1 word over the *outlier* cap. The causal chain is real and useful, but the "-- swallowed by `processUser` catch (line 44), so valid-vs-malformed inputs both silently return `null`" clause is exactly the kind of compound consequence that belongs in `### Cross-Cutting Patterns` (and in this very run the agent ALSO put it there). Verdict: **trivially fixable by the FIX-R2-C terseness nudge** OR absorbed by any tolerance band >= 1w.

**Net:** of three residuals, one is a true contract gap (A), one is borderline-verbose (B), one is trivially verbose (C). No single agent-concision fix reliably clears all three on every stochastic run -- which is itself the Q1 finding.

---

## Q1 -- Gate STRUCTURE (highest value)

**Question:** Is a zero-tolerance hard per-item cap the right gate for a stochastic LLM generator, or should it use tolerance/percentile structure? Is enforcing an "outlier SOFT cap" as a HARD zero-tolerance assertion internally contradictory?

### Finding: the zero-tolerance hard per-item gate is a recognized anti-pattern for stochastic output, AND it is internally self-contradictory here.

Two independent lines of evidence:

1. **The literature is explicit.** Multiple 2026 sources state that binary every-run-must-pass gating on non-deterministic LLM output is an anti-pattern: "Binary pass/fail testing has 0% detection power for behavioral regressions in non-deterministic AI agents, whereas statistical behavioral fingerprinting achieves 86%" [CITED: sentrial.com]. The recommended pattern is a *layered* gate -- Layer 1 deterministic assertions (hard pass/fail: was the header present? is the schema valid?) and Layer 2 behavioral metrics gated with a *tolerance band* / delta-below-baseline, not exact match [CITED: sentrial.com; braintrust.dev]. Release-criteria guidance uniformly phrases the gate as "no regressions beyond a tolerance threshold" -- never "every sample perfect" [CITED: braintrust.dev]. For genuinely variable per-item metrics, the consensus is percentile-anchored or aggregated-across-runs thresholds [CITED: arxiv 2412.12148; braintrust.dev]. Meta's TestGen-LLM precedent goes the other way for a reason: it discards any test that is not green on 5/5 runs -- because it wants *zero* flakiness in the tests it KEEPS, treating flakiness as disqualifying for an asset under its control [CITED: arxiv 2402.09171]. The lz-advisor situation is the inverse: the generator is the thing under test and is *expected* to vary, so a 5/5-must-pass gate guarantees recurring red.

2. **The gate contradicts its own vocabulary.** The agent contracts define `outlier_soft_cap="28"` as distinct from `max_words="22"` (the target). "Soft cap" by definition means "exceeding it is tolerated as an outlier." But the fixtures (`PER_ENTRY_CAP=28`, `D-reviewer-budget.sh:230-234`) enforce 28 as a HARD zero-tolerance ceiling: ANY single body > 28w exits 1. A soft cap enforced with zero tolerance is not a soft cap -- it is a hard cap mislabeled. This is the internal contradiction the question suspected. The 22w target has no enforcement at all; the 28w "soft" outlier has *maximal* enforcement. The semantics are inverted.

### Recommendation (Q1): give the gate an explicit outlier tolerance, matching its own "soft cap" semantics.

Keep the layering the gate already has right (SHAPE = Layer 1 deterministic, correctly hard, and it is saturated 10/10). For the per-finding budget (Layer 2, behavioral), replace "every finding <= 28w else RED" with a tolerance structure. Concretely, the lowest-risk option that fits this fixture's shape:

- **Two-tier cap (recommended):** keep 28w as the *target* outlier cap, add a hard *ceiling* well above it (e.g. 40-45w for the reviewer, 40w for security ex-CVE) AND allow at most 1 finding per run in the 29-ceiling band. A run is RED only if (a) any finding exceeds the hard ceiling, or (b) more than 1 finding sits in the soft-outlier band. This directly encodes "soft cap = tolerated outlier" and turns (B) and (C) green while keeping a real ceiling that the 46w pre-fix baseline would still have failed.
- **Alternative -- percentile:** p95 of finding bodies <= 28w. With 5-9 findings/run this is coarse (one outlier in 6 = ~83rd percentile passes), so the two-tier band is cleaner and more legible than a percentile on small N.

This is NOT gaming the gate. The verifier's central concern (D-10, "did 13-04 modify tests/ to game the gate? NO") was about *silently lowering a cap to force green*. A tolerance band is the opposite: it is a documented, principled gate-design change grounded in the literature and in the gate's own "soft cap" vocabulary, raising the gate's *correctness* (it stops flaking on benign outliers) without weakening the binding 22w target intent.

### `## Confidence: HIGH`
The literature is unambiguous and multi-sourced; the internal contradiction (soft cap enforced hard) is verifiable directly in the fixture source. What would change it: if the project's intent is that the budget gate is deliberately a *deterministic Layer-1 contract* (every finding MUST be a one-liner, no exceptions, as a hard product promise) rather than a behavioral quality metric -- then zero-tolerance is defensible and the answer flips to "fix the agents." The phase goal wording ("the budget stays within cap on the new grammar") leans Layer-1, but the "soft cap" vocabulary in the contracts leans Layer-2. This is the one judgment the human must settle.

---

## Q2 -- Cap VALUE (~22-28 words per finding)

**Question:** Is ~22-28w empirically defensible for live review comments, or too tight for legitimately-complex findings?

### Finding: 22-28w is defensible as a TARGET for routine findings, but too tight as a HARD ceiling for the question/architectural/multi-sink tail.

The code-review convention literature strongly supports *brevity as the default* but *explicitly carves out elaboration for the "why" and for questions*:

- **Conventional Comments** makes `label` + `subject` required and `discussion` (the "context, reasoning, why, next-steps") *optional* -- i.e. the terse core is mandatory, elaboration is a sanctioned add-on, not forbidden [CITED: conventionalcomments.org]. This is structurally identical to the lz-advisor "terse finding body + optional `### Per-finding validation`" design -- which is exactly why the reviewer Question gap (Q3) is anomalous: the reviewer terse body is mandatory but its elaboration valve doesn't cover Questions.
- **Google eng-practices** says label severity and stay lean, but explicitly: "sometimes it's appropriate to give a bit more explanation around your intent" and recommends *adding a brief reason* rather than a bare statement [CITED: google.github.io/eng-practices]. It treats detail as situationally appropriate, never word-capped.
- **AI-review tooling** corroborates that *too terse* is a real failure mode: a bare "consider adding error handling here" was described as a comment that "exists but communicates almost nothing" [CITED: webmatrices.com]. CodeRabbit deliberately spends ~20% of interactions on conversational/clarifying comments precisely because terse formal comments assume the model understood everything first-pass [CITED: webmatrices.com]. No mainstream AI-review tool documents a *hard word cap* on findings; the design tension is the opposite (over-communication), managed by skimming, not by truncation [CITED: coderabbit.ai/blog].

Empirically in-house: 7 of 10 runs already land every finding <= 28w with full signal, and the median finding is 16-22w. So 28w is a *good target* -- the agents hit it most of the time. The failures are concentrated in exactly the categories the external convention says deserve elaboration: a two-horned author-intent Question (A), and multi-action security remediations (B). The cap value is right for the body of findings and wrong as an inviolable ceiling for the tail.

### Recommendation (Q2): do NOT recalibrate the 22w target or the 28w soft cap value. Keep them. The fix is structural (tolerance band + Question carve-out), not a higher number.

Raising 28 -> 35 across the board would weaken the concision win on the 90% of findings that don't need it -- the literature warns against rewarding verbosity. The correct move is to keep 28w as the target/soft cap and let the *gate structure* (Q1) and the *Question carve-out* (Q3) absorb the legitimately-long tail. The verifier's CAP VERDICT ("do NOT recalibrate the 28w cap") stands and is corroborated externally.

### `## Confidence: HIGH`
Convention literature is consistent and the in-house distribution (median 16-22w, full signal) confirms the target is achievable. What would change it: if a re-measure showed the *median* finding creeping toward 28w (signal genuinely needs more room), the target itself would need revisiting -- but current data shows the opposite (most findings clear it comfortably).

---

## Q3 -- Reviewer QUESTION carve-out

**Question:** Should the reviewer get a Question/architectural carve-out analogous to security's auto-clarity? Options: (a) add a reviewer Question carve-out; (b) route elaboration into the 60w `### Per-finding validation`; (c) force terse.

### Finding: the reviewer SHOULD get a carve-out -- internal symmetry demands it, and external convention backs it.

Three converging arguments:

1. **Internal asymmetry is unjustified.** The reviewer already HAS a near-identical mechanism described in prose -- `reviewer.md:221` "Auto-clarity: drop the terse one-line finding shape for findings that need full explanation -- architectural disagreements ... genuine question-classes that the author needs context to interpret ... write a normal paragraph." But this prose auto-clarity is *not gated into the fixture* and is *not bracket-triggered*, so it has no machine-detectable trigger the way security's `[CVE]/[GHSA]/[CWE]` carve-out does. The security-reviewer solved the same class (bracket-less multi-clause Question, its old security-3 F8 36w anti-pattern) with the FIX-4 split-to-PFV rule. The reviewer's 45w Question (A) is the *identical shape* with *no sanctioned escape*. The contracts are supposed to be structurally parallel (the security file literally says its `<output_constraints>` is the "same structural shape as agents/reviewer.md"); this is a missing parallel.

2. **External convention treats clarifying questions as a first-class, elaboration-warranting category.** Conventional Comments lists `question` as a distinct label whose `discussion` field is the sanctioned place for context [CITED: conventionalcomments.org]. CodeRabbit dedicates ~20% of its interactions to clarifying questions specifically because they need more context than a fix-it comment [CITED: webmatrices.com]. A genuine author-intent question is the *least* compressible finding type -- it must state the observation, pose the binary, and give evidence (exactly the three horns of finding A).

3. **Option (c) force-terse is ruled out by the text.** Finding A demonstrably loses a horn or its evidence at 28w. Forcing terse degrades the highest-judgment output the Opus reviewer produces. Reject.

### Recommendation (Q3): adopt option (b) as the primary mechanism, with a light (a)-flavored trigger.

Prefer routing Question elaboration into the existing 60w `### Per-finding validation` valve -- it reuses infrastructure already in the contract and already covered by the fixture, avoids inventing a second bracket-gated carve-out, and keeps the Question *body* terse (the binary question itself) while the *why/evidence* lands in PFV. This is exactly the FIX-4 pattern the security-reviewer already uses for bracket-less Questions -- so it makes the two agents symmetric. Concretely, FIX-R2-A becomes: "Reviewer Question bodies stay <= 28w; route the supporting observation + evidence into a `### Per-finding validation` entry (prefixed `Validation of Finding N:`, <= 60w) when the question needs context to be answerable. Mirror the security-reviewer FIX-4 rule."

A pure option-(a) bracket-gated carve-out is *worse* for the reviewer than for security, because the reviewer has no natural bracket equivalent to `[CVE]` -- you'd have to invent a `[Q]`-style trigger, which adds grammar surface for marginal gain. Use (b).

Note: even with the carve-out, the gate-structure fix (Q1) is still warranted -- the carve-out handles the Question class deterministically, but the borderline security-fix-prose (B) and the 1w marginal (C) are better absorbed by the tolerance band than by chasing each under 28w on every stochastic run.

### `## Confidence: HIGH (internal symmetry) / MEDIUM (external)`
The internal-symmetry argument is decisive and directly verifiable in the two agent files. External convention is supportive but general (no tool publishes an exact "questions get N words" rule). What would change it: if the next re-measure shows reviewer Questions are *rare* (e.g. the 45w Question was a 1-in-5 fluke and most runs emit `(none)` under Questions, as r2-review-3/5 did), the carve-out is still correct but lower-urgency -- the tolerance band (Q1) alone might carry SC-4 green. The carve-out is the durable fix; the band is the robustness margin.

---

## Overall recommendation: CLOSE NOW with a design-aware fix

**Close GATE-02 in-phase. Do not defer to v1.0.2.** The work is a Phase 13 tail, not a new milestone, for three reasons:

1. **The render half is done and saturated** (SHAPE 10/10, Pass^k = 1.0). The milestone's *core* user-facing value ("no shorthands in reports") is empirically proven. Only the budget-gate half of *this phase's* goal is open, and the diagnosis is complete.
2. **The remaining work is small and bounded** -- two agent-rule edits + one gate-structure edit + one re-measure, all within the existing atomic-edit + re-measure pattern the phase already used for 13-04/13-05.
3. **Deferring would leave a known-flaky gate in the tree** -- the every-run-green gate will keep going red on benign outliers indefinitely (Q1), so "defer" really means "ship a gate we know will flake," which contradicts the milestone's own "without breaking the word-budget regression gates" clause.

### Concrete fix per residual

| Residual | Root cause | Fix | Mechanism |
|----------|-----------|-----|-----------|
| (A) review-4, 45w Question | Reviewer has no Question elaboration valve (contract asymmetry vs security FIX-4) | **FIX-R2-A**: reviewer Question body <= 28w; route observation+evidence to `### Per-finding validation` (<=60w), mirroring security FIX-4 | Agent concision rule (reviewer.md) |
| (B) security-1, 4x 30-33w fix prose | FIX-3 reference-by-shape never extended to the FIX/remediation clause | **FIX-R2-B**: name the safe API in backticks + point at the line; drop the reproduced call expression and the second remediation clause from the fix span | Agent concision rule (security-reviewer.md) |
| (C) review-3, 29w deref-chain | Multi-clause causal chain in one body | **FIX-R2-C**: trim-to-the-defect nudge; route the downstream consequence to `### Cross-Cutting Patterns` | Agent concision rule (reviewer.md) |
| All three, robustness | Zero-tolerance hard cap on stochastic output (Q1) is an anti-pattern + contradicts the "soft cap" label | **FIX-R2-D (gate)**: replace "every finding <= 28w else RED" with a two-tier band -- hard ceiling ~40-45w + at most 1 soft-outlier (29-ceiling) per run | Fixture structure (both D-*-budget.sh) |

FIX-R2-A/B/C are agent concision (the verifier's prescription) and clear the verbose/borderline cases. FIX-R2-D is the gate-structure correction (this research's added prescription) that makes SC-4 robust to the inherent stochasticity so it doesn't re-flake on the next outlier. Apply A/B/C to BOTH agents' rules AND every affected worked example atomically (WR-05), keep SHAPE byte-intact, then re-measure SC-4 a third time. SC-4 closes when every run exits 0 *under the corrected gate* (which the band makes achievable without lowering the 22w target).

**One caution to flag explicitly** (per CLAUDE.md "flag caveats"): FIX-R2-D changes a *binding regression gate*. The milestone goal says "without breaking the word-budget regression gates." A tolerance band must be framed (in the plan and the fixture comments) as a *correctness improvement to the gate's design* (aligning enforcement with the contract's own "soft cap" semantics + the stochastic-output literature), NOT as "loosening the gate to force green." The distinction is real and defensible, but it MUST be documented so a future auditor doesn't read it as the D-10 "gaming the gate" failure mode. If the human's intent is genuinely that the budget gate is a hard deterministic product contract (Layer 1, every finding is a one-liner, full stop), then drop FIX-R2-D, keep A/B/C, and accept that SC-4 may need several re-measures to catch a clean 5/5 -- in which case the honest move is to raise the per-skill n and gate on a clean *run*, not a clean *sample*.

---

## Sources

### Primary (HIGH confidence)
- Internal: `13-VERIFICATION.md`, `uat/GRADE-LOG-R2.md`, `uat/PASS-K-R2.md`, and the four over-cap captures (`r2-review-4`, `r2-security-1`, `r2-review-3`) -- re-ran both `tests/D-*-budget.sh --from-trace` independently; reproduced 45 / 33,33,33,30 / 29 exactly.
- Internal: `plugins/lz-advisor/agents/reviewer.md` (no Question carve-out; prose auto-clarity at :221 not gated), `agents/security-reviewer.md` (FIX-4 + `<auto_clarity_carve_out>` at :280), `tests/D-reviewer-budget.sh:230-234` + `tests/D-security-reviewer-budget.sh:217-229` (hard PER_ENTRY_CAP enforcement; security auto-clarity branch).

### Secondary (MEDIUM-HIGH confidence)
- [Build a regression testing system your agent can't silently fail through -- sentrial.com](https://www.sentrial.com/blog/ai-agent-regression-testing-that-catches-silent-failures) -- binary every-run gating "0% detection power"; layered deterministic + tolerance-band design.
- [What is LLM evaluation? -- braintrust.dev](https://www.braintrust.dev/articles/llm-evaluation-guide) -- release criteria as "no regressions beyond a tolerance threshold"; baselines over static gates.
- [How to choose a threshold for an evaluation metric for LLMs -- arXiv 2412.12148](https://arxiv.org/pdf/2412.12148) -- percentile / statistically-grounded threshold selection for stochastic metrics.
- [Automated unit test improvement at Meta (TestGen-LLM) -- arXiv 2402.09171](https://arxiv.org/pdf/2402.09171) -- 5/5-must-pass filter, but for tests KEPT (inverse of our case).
- [Conventional Comments](https://conventionalcomments.org/) -- terse label+subject mandatory, discussion/elaboration optional; `question` a first-class label.
- [Google eng-practices: how to write code review comments](https://google.github.io/eng-practices/review/reviewer/comments.html) -- label severity, stay lean, add brief "why" when appropriate; no word cap.
- [LLM-as-judge best practices -- montecarlo.ai](https://montecarlo.ai/blog-llm-as-judge/) and [promptfoo](https://www.promptfoo.dev/docs/guides/llm-as-a-judge/) -- per-category fail-rate tolerances, not one binary cutoff.

### Tertiary (corroborating)
- [CodeRabbit: Claude Opus for AI code review / context engineering](https://www.coderabbit.ai/blog) and [webmatrices.com switching to CodeRabbit](https://webmatrices.com/post/i-switched-from-github-copilot-to-coderabbit-for-code-reviews) -- terse comments "communicate almost nothing"; ~20% conversational/clarifying interactions; no hard finding-length cap.

---

## RESEARCH COMPLETE

**Q1 (gate structure) -- HIGH.** A zero-tolerance hard per-item cap on a stochastic LLM generator is a documented anti-pattern ("0% detection power for behavioral regressions"; the field uses layered deterministic checks + tolerance bands / percentiles for behavioral metrics), and it is internally self-contradictory here: the contracts label 28w an `outlier_soft_cap` while the fixtures enforce it as a hard zero-tolerance ceiling -- a soft cap enforced hard is a hard cap mislabeled. The gate, not the agents, is the primary thing to correct: add an explicit outlier tolerance (two-tier band: hard ceiling ~40-45w + <=1 soft-outlier per run) that matches the contract's own "soft cap" vocabulary.

**Q2 (cap value) -- HIGH.** 22-28w is empirically defensible as a TARGET (in-house median 16-22w, 7/10 runs already clear every finding) and is corroborated by code-review convention (Conventional Comments: terse core mandatory, elaboration optional; Google: stay lean, add brief why when appropriate), but it is too tight as an inviolable ceiling for the question/multi-sink/multi-action tail. Do NOT recalibrate the value -- the verifier's CAP VERDICT stands; the fix is structural, not a bigger number.

**Q3 (reviewer Question carve-out) -- HIGH internal / MEDIUM external.** Yes -- the reviewer should get one, via option (b): keep the Question body terse and route observation+evidence to the existing 60w `### Per-finding validation`, mirroring the security-reviewer's FIX-4. Internal symmetry demands it (the security agent already solved this identical bracket-less-Question class; the reviewer's prose auto-clarity is ungated), and convention treats clarifying questions as a first-class elaboration-warranting category. Force-terse (c) is ruled out -- the 45w Question demonstrably loses a horn or its evidence at 28w.

**Overall: CLOSE NOW with a design-aware fix.** Apply FIX-R2-A (reviewer Question -> PFV), FIX-R2-B (security fix-clause reference-by-shape), FIX-R2-C (reviewer terseness nudge) as agent concision edits, PLUS FIX-R2-D (gate tolerance band) as a documented gate-design correction, atomically with SHAPE byte-intact, then re-measure SC-4 a third time. This is a bounded Phase 13 tail, not a v1.0.2 milestone: the render half is done and saturated, the diagnosis is complete, and deferring would knowingly ship a flaky every-run gate. Caveat to surface to the human: FIX-R2-D edits a binding regression gate -- it must be framed (and documented in-fixture) as aligning enforcement with the gate's own soft-cap semantics + the stochastic-output literature, NOT as gaming the gate; if the human's intent is that the budget is a hard deterministic Layer-1 product contract, drop FIX-R2-D and gate on a clean run rather than a clean sample.
