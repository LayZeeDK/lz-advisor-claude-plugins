# Project Learnings Rollup (phases 16, 17, 17.1, 17.2, 17.3)

## phase-16 decisions Three-way quote outcome instead of the spike's binary keep/drop
`quoteOutcome` returns `verified` (quote in its CITED excerpt), `downgraded` (quote absent from cited but verbatim-present in SOME OTHER excerpt -- kept, fidelity lowered), or `dropped` (quote absent everywhere). It runs UPSTREAM of `tally()` in `aggregate()`.

**Rationale:** SC-5 demands BOTH "fabricated quote dropped" AND "real-quote / wrong-passage downgraded"; the prototype's binary keep/drop cannot express the second state. The aggregator guards verbatim CONSISTENCY only -- claim-vs-quote ENTAILMENT is the voter's job (Phase 18).
**Source:** 16-CONTEXT.md (D-05, D-06), 16-01-SUMMARY.md

## phase-16 decisions Corroboration counted by distinct source as a LOWER bound
`cluster.sources` is a `Set` of distinct source ids; `corroboration_lower_bound = sources.size`. A paraphrase pair tracing to ONE source counts as 1; different-source near-duplicates merge to a count of distinct sources. The number is labeled a lower bound, never an exact independence count.

**Rationale:** Raw-claim counting inflates confidence from syndicated/paraphrased copies (Pitfall 8). The lexical-only under-merge residual is documented, not solved with an embedding dependency (zero-dep constraint; AGGX-01 deferred).
**Source:** 16-CONTEXT.md (D-08, D-09), 16-01-SUMMARY.md

## phase-16 decisions Frozen survivor record field names chosen deliberately for Phase 17
The `survivors.json` record shape `{id, claim, sources, corroboration_lower_bound, quote_fidelity, confidence}` is the load-bearing contract Phase 17 freezes verbatim, with the run-dir input layout (`claims/<worker-id>.json`, `excerpts/<excerpt-id>.txt`, `votes/<id>-<seat>.json`) also frozen.

**Rationale:** Build the aggregator first so Phase 17's schema is grounded in proven behavior rather than guessed. The names are deliberately picked per RESEARCH guidance 6 / A3 because they propagate downstream.
**Source:** 16-CONTEXT.md (D-02, D-03), 16-01-SUMMARY.md, 16-VERIFICATION.md (PLAN truth 7)

## phase-16 decisions Aggregator ACTIVELY enforces three ceilings, CARRIES two
The frozen `CEILINGS` block (`Object.freeze({ANGLES:5, MAX_FETCH:15, MAX_VERIFY_CLAIMS:24, VOTES_PER_CLAIM:3, SYNTH_CAP:20})`) is the single source of truth. The aggregator actively enforces `MAX_VERIFY_CLAIMS`/`VOTES_PER_CLAIM`/`SYNTH_CAP` (cap after ranking, observable in stdout); it carries `ANGLES`/`MAX_FETCH` as shared contract for the Phase-20 orchestrator to enforce at wave dispatch.

**Rationale:** AGG-06 / SC-4 require code enforcement, not model discretion; the wave-dispatch ceilings are an orchestrator concern. A code comment documents which are active vs carried.
**Source:** 16-CONTEXT.md (D-10, D-11), 16-01-SUMMARY.md

## phase-16 decisions LZ_DR_* env override intentionally NOT wired
The optional ceiling env/flag override (Claude's Discretion / D-12) was omitted; the hardcoded `CEILINGS` defaults are the enforced contract for this phase.

**Rationale:** A config-driven override is a Phase-20 orchestrator concern; wiring it now adds surface the orchestrator does not need. Verified absent (no env read anywhere in the .mjs).
**Source:** 16-CONTEXT.md (D-12), 16-01-SUMMARY.md, 16-VERIFICATION.md (PLAN truth 6)

## phase-16 decisions Pure functions behind a guarded thin CLI
The spike core is refactored into exported pure functions (normalize, jaccard, quoteOutcome, mergeClusters, enforceCeilings, tally, aggregate) importable by the test; a thin CLI guarded by `fileURLToPath(import.meta.url) === path.resolve(process.argv[1])` parses a single positional `<run-dir>`, writes `survivors.json`, prints a counts-only summary, and exits 0/2.

**Rationale:** D-16 separation enables the node:test fixture without the prototype's inline self-seeding; the guard ensures importing the module produces no CLI side effect.
**Source:** 16-CONTEXT.md (D-16), 16-01-PLAN.md, 16-01-SUMMARY.md

## phase-16 decisions node:test stdlib fixture over a bash smoke script
The validation harness is `node:test` + `node:assert/strict` run via `node --test`, co-located with the aggregator under `scripts/` (test + `__fixtures__/<case>/{claims,excerpts,votes}/`).

**Rationale:** A JSON-heavy aggregator under bash invites the exact heredoc/quoting/CRLF hazards CLAUDE.md forbids; node:test is zero-dep and cross-platform. The existing `tests/*.sh` budget gates are a different domain, not a precedent to match.
**Source:** 16-CONTEXT.md (D-13, D-14), 16-DISCUSSION-LOG.md (GA-5)

## phase-16 decisions confidence vocabulary extended with Unsupported (later superseded by Phase 17)
Phase 16 shipped `confidence` as `High | Medium | Low/Contested | Rejected | Unsupported` (Unsupported added per RESEARCH guidance 6 for zero-readable-seats clusters).

**Rationale:** The four spike labels were preserved verbatim; Unsupported covers a cluster with no readable vote seats. NOTE: superseded by Phase 17 (GA-1) which ratified a single enum `High | Medium | Low | Contested | Unsupported` (Rejected dropped, Low/Contested un-fused) via repo-blind cross-model consensus.
**Source:** 16-01-SUMMARY.md (key-decisions + the SUPERSEDED-IN-PART note)

## phase-16 lessons The stdout merge count regressed silently because mergeClusters discarded the raw-claim total
`aggregate()` set `rawCount = clusters.length` (the post-merge output of `mergeClusters`), so `merged` computed to identically 0 for every input and the `clusters:` figure equalled `raw:`. The committed `near-duplicate-merged` fixture (2 claims, 1 cluster) printed `raw: 1 -> clusters: 1 (merged: 0)` instead of `raw: 2 -> clusters: 1 (merged: 1)`. The fixture suite did not catch it -- no test asserted the summary's first line.

**Context:** The summary is the D-03/D-11 load-bearing receipt the Phase-20 orchestrator consumes, and Phase 17 freezes it verbatim -- a broken count would freeze into the schema. Fixed (commit 94023db) by having `mergeClusters` return `{clusters, rawClaimCount}` and adding a regression test asserting line 1.
**Source:** 16-REVIEW.md (CR-01), 16-VERIFICATION.md (post-review fix table)

## phase-16 lessons normalize(undefined) coerces to the literal token "undefined", which can false-verify or wrongly merge
`normalize(s)` began with `String(s)`, so a claim missing its `quote` field produced the token `"undefined"` (non-empty, bypassing the empty-quote guard); if any excerpt contained the word "undefined" the fabricated claim was VERIFIED. Two text-less claims both normalized to `"undefined"` (Jaccard 1.0) and merged into one cluster.

**Context:** The quote re-check is the load-bearing fidelity guard; a fabricated/empty quote silently passing it defeats the phase's purpose. Fixed (94023db) with a non-string type guard returning '' so a missing quote hits the `dropped` path; fixtures never exercised missing quote/text.
**Source:** 16-REVIEW.md (WR-01)

## phase-16 lessons Missing source/text fields silently corrupted the FROZEN record shape
A missing `claims[].text` produced a survivor whose `claim` key was dropped by `JSON.stringify` (undefined own-property), violating the required-string contract. A missing `source` leaked `null` into `sources[]` (declared `string[]`) and two source-less workers collapsed to one `null` Set entry -- silently under-counting corroboration.

**Context:** Per D-08 the `source` field is load-bearing for the whole corroboration mechanism, so a missing field must fail closed. Fixed (94023db) with `ContractError` validation on non-empty text and source in `mergeClusters`; WR-01/02/03 regression tests added.
**Source:** 16-REVIEW.md (WR-02, WR-03), 16-VERIFICATION.md

## phase-16 lessons The test polluted the committed tree by writing the runtime BOM excerpt in place
The CRLF+BOM test wrote `crlf-bom-safe/excerpts/e1.txt` INTO the committed fixture tree on every run, leaving an untracked, non-idempotent artifact (`?? .../crlf-bom-safe/excerpts/`) that risked accidental staging.

**Context:** The intent (author the only non-ASCII bytes at runtime so none is committed) was sound, but the target should be an OS temp dir. Fixed (commit 830b4bf) by assembling the BOM excerpt in `os.tmpdir()`; `git status` is clean after a full test run.
**Source:** 16-REVIEW.md (WR-05), 16-VERIFICATION.md (post-review fix table)

## phase-16 lessons The RESEARCH-suggested paraphrase pair would have produced a vacuous pass
RESEARCH guidance 4 / D-15 case 3 suggested `"X reduces Y by 30%"` vs `"X cuts Y thirty percent"` as a same-source paraphrase pair, but those normalize to `{x,reduces,y,by,30}` vs `{x,cuts,y,30}` -> Jaccard 0.5 (below the 0.6 merge threshold), so they would NOT merge and the corroboration-1 assertion would trivially pass on two unmerged single-member clusters.

**Context:** Plan 16-01 caught this empirically; Plan 16-02 used the genuinely-merging pair `"X reduces Y by 30%"` / `"X reduces Y by thirty percent"` (both normalize to `{x,reduces,y,by,30}`, Jaccard 1.0) and added a `survivors.length === 1` precondition guard BEFORE the corroboration assertion.
**Source:** 16-01-SUMMARY.md (note), 16-02-SUMMARY.md (key-decisions), 16-REVIEW.md (summary)

## phase-16 lessons The Write tool inserts literal BOM bytes where JS source needs the U+FEFF escape
Authoring the aggregator, the Write tool inserted literal U+FEFF (BOM) bytes at points where the source needed the six-character JS escape, breaking the ASCII-only source rule.

**Context:** Resolved by a one-off Node fixer (run, then deleted) replacing literal BOM chars with the ASCII escape; pure-ASCII confirmed via a non-ASCII byte scan (`rg -n "[^\x00-\x7F]"`) before each commit. Recurs for any source that must reference a BOM.
**Source:** 16-01-SUMMARY.md (Issues Encountered)

## phase-16 patterns Three-way quote outcome upstream of vote tally
Run the verbatim quote re-check (verified/downgraded/dropped) BEFORE any vote is read; drop fabricated-quote members so they never reach `tally()`, even when they have passing vote seats.

**When to use:** Any evidence-verification reducer where fidelity must gate before scoring -- proven by `fabricated-quote-dropped` dropping a claim that had 3 unrefuted seats.
**Source:** 16-01-SUMMARY.md (patterns-established), 16-VERIFICATION.md (key-link)

## phase-16 patterns Observability-as-contract: every drop/downgrade/cap is a stdout count
Every merge, drop, downgrade, and ceiling cap surfaces as a count in a deterministic counts-only stdout summary; raw source text never returns through stdout.

**When to use:** Off-model reducers whose receipt an orchestrator consumes without parsing raw evidence -- mirrors the project's `web_tool_usage_must_be_observable` discipline (D-03).
**Source:** 16-01-SUMMARY.md (tech-stack patterns), 16-CONTEXT.md (specifics)

## phase-16 patterns Centralized normalize() comparison primitive
One `normalize()` (BOM strip + CRLF/CR->LF + lowercase + non-alnum->space + number-word fold + drop 'percent') is the single comparison primitive used by BOTH `jaccard` and `quoteOutcome` -- normalize at comparison time, never only at read time.

**When to use:** Whenever multiple comparison operations must agree on tokenization; a divergent ad-hoc normalize in one path silently breaks the other.
**Source:** 16-01-SUMMARY.md (tech-stack patterns), 16-01-PLAN.md (Task 1)

## phase-16 patterns Runtime-generated non-ASCII fixture via String.fromCharCode(0xFEFF)
Generate the one BOM/CRLF test input at runtime in `os.tmpdir()` via `String.fromCharCode(0xFEFF)` + CRLF newlines, so the committed-on-disk bytes stay pure ASCII while still exercising the Layer A+B normalization path on the host.

**When to use:** Proving non-ASCII handling under an ASCII-only-commit constraint (CLAUDE.md cp1252 rule) without committing a non-ASCII byte.
**Source:** 16-02-SUMMARY.md (tech-stack patterns, key-decisions)

## phase-16 patterns Precondition length guard before a per-cluster assertion
Assert `survivors.length === 1` (the pair actually merged) BEFORE asserting that cluster's `corroboration_lower_bound`, closing the vacuous-pass hole where two unmerged single-member clusters each trivially show corroboration 1.

**When to use:** Any test of a merge/dedup invariant where a non-merge would still satisfy the downstream value assertion; pair a contrast fixture (one-source vs two-source) to lock the semantics.
**Source:** 16-02-SUMMARY.md (patterns-established, key-decisions), 16-VALIDATION.md

## phase-16 surprises The whole node:test fixture runs in ~0.12 seconds
The full validation suite (13 named tests driving 6 fixture run-dirs in-process) runs in roughly 0.12s, well under the 2s feedback-latency target.

**Impact:** Allows the suite to run after every task commit and every wave with negligible cost; the single-file gate is the routine regression check.
**Source:** 16-VALIDATION.md (Validation Sign-Off)

## phase-16 surprises `node --test <dir>` spuriously exits 1 on this host even when all tests pass
On the host (Node v24.13.0 / Windows arm64 / Git Bash) the directory form `node --test <dir>` reports a phantom failing test for the directory entry and exits 1 even when every real test passes; only the explicit FILE form is a reliable gate.

**Impact:** The phase gate is pinned to the single-file form (`node --test <file>`). This is a known recurring host quirk (also hit in Phase 18 eval per memory `reference_node_test_dir_exit1_quirk`).
**Source:** 16-02-PLAN.md (Task 3), 16-02-SUMMARY.md (Phase gate), 16-VALIDATION.md

## phase-16 surprises The suite grew from 9 planned to 13 tests via the review fix cycle
The planned suite was 9 named tests (5 SC-5 + 4 hardening); the 16-REVIEW fixes (CR-01 summary count, WR-01/02/03 fail-closed) added 4 regression tests, ending at 13 -- additive coverage with no gap.

**Impact:** The retroactive Nyquist audit found 0 gaps; the review cycle strengthened the frozen contract beyond the original plan map.
**Source:** 16-VALIDATION.md (Validation Audit), 16-VERIFICATION.md

## phase-16 surprises Plan 02 committed 97 fixture files in ~7 minutes
Plan 16-02 created 98 tracked files (1 test + 97 committed fixture files across 6 cases) in roughly 7 minutes, including the 31-claim / 31-excerpt `ceilings-enforced` case.

**Impact:** Fixture authoring at this volume was fast because all files are small synthetic ASCII run-dirs written via the Write tool; the bulk lives in the ceiling case driving the 31->24 cap.
**Source:** 16-02-SUMMARY.md (Performance, key-files)

## phase-17 decisions One canonical confidence enum, identical in code and contract
The confidence field is exactly `High | Medium | Low | Contested | Unsupported` -- one vocabulary, byte-identical in the aggregator code and the reference doc. The spike-inherited `Rejected` label is dropped and the fused `Low/Contested` token is un-fused. No second `report_confidence` field, no mapping table.

**Rationale:** Two vocabularies for one concept IS the drift the user rejected. `Rejected` was an un-deliberated spike artifact preserved verbatim by Phase 16 against Phase 16's own research (16-RESEARCH.md recommended the 4-label set without it), so it earned no deference.
**Source:** 17-CONTEXT.md (D-01), 17-DISCUSSION-LOG.md

## phase-17 decisions Contested is first-class, emitted by the per-claim tally on a voter split
The deterministic tally() emits `Contested` directly on a per-claim voter split (>=1 unrefuted AND >=1 refuted); Phase-20 synthesis MAY additionally promote cross-source contradictions to the same value -- one enum value, one meaning (Option I over the synthesis-only Option II).

**Rationale:** The durable `survivors.json` is the only artifact a reader sees pre-synthesis; under the synthesis-only Option II a genuine voter split would be mislabeled `Low` there, erasing dissent. The design assigns Contested at the per-claim tally (SESSION-DESIGN.md:93) and keys escalation on "ANY contested claim" (:167), so the enum value IS the VERIF-05 escalation signal.
**Source:** 17-CONTEXT.md (D-03), 17-DISCUSSION-LOG.md

## phase-17 decisions Downgrade-not-delete: the tally never removes a claim
A unanimous refutation (3/3 refuted, 0 uphold) resolves to `Low` AND the claim stays in survivors. The only claim-removal path is the quote-recheck `dropped` outcome (fabricated/absent quote). `Low` covers both thin support and actively-refuted-without-support.

**Rationale:** Makes "downgrade-not-delete" structural; refutation surfaces the claim at lower confidence rather than silently erasing it (the refuted-as-deletion anti-pattern, PITFALLS.md Pitfall 11).
**Source:** 17-CONTEXT.md (D-03b), 17-01-PLAN.md

## phase-17 decisions Option I tally branch order: the split test precedes the Medium test
The five ordered branches are: readableSeats===0 -> Unsupported; unrefuted===3 -> High; unrefuted>=1 && refuted>=1 -> Contested; unrefuted===2 -> Medium; otherwise -> Low. The Contested split branch MUST precede the Medium branch.

**Rationale:** A 2-unrefuted/1-refuted split silently returns `Medium` and erases the dissent if the Medium branch evaluates first (Pitfall 2). Branch order is the single CRITICAL invariant of the phase.
**Source:** 17-01-PLAN.md, 17-02-SUMMARY.md

## phase-17 decisions Two structurally separate, never-conflated assurance fields
Assurance 1 is `quote_fidelity` (verified|downgraded) -- mechanical, aggregator-owned, frozen from Phase 16. Assurance 2 is `claim_support` (supported|partial|unsupported|unassessed) -- judgment, voter/synthesis-owned (Phase 18/20), new. `claim_support` is never derived from `quote_fidelity`.

**Rationale:** A claim can be quote_fidelity: verified yet claim_support: unsupported (the quote is real and correctly attributed but does not entail the claim) -- exactly the conflation VERIF-06 exists to prevent. The doc states this orthogonality with a worked example.
**Source:** 17-CONTEXT.md (D-04, D-05), 17-02-SUMMARY.md

## phase-17 decisions Freeze-from-corrected-code (D-12 anti-drift), enforced by plan ordering
Plan 17-01 corrects the aggregator GREEN first; Plan 17-02 (depends_on 17-01) then freezes the corrected shapes into the reference doc verbatim with cited function names and line anchors. The aggregator source is authoritative; future shape changes update code + reference in lockstep.

**Rationale:** Freezing before the correction would immortalize the spike vocabulary (Pitfall 1). 17-02 explicitly verifies the precondition (`git grep "Rejected\|Low/Contested"` over the .mjs returns nothing) before starting.
**Source:** 17-CONTEXT.md (D-12), 17-02-PLAN.md, 17-02-SUMMARY.md

## phase-17 decisions Formal JSON Schema ($schema + ajv) is OUT; fail-closed parsing is the enforcement
No machine-enforced formal schema and no validator library. The aggregator's fail-closed JSON.parse + ContractError + WR-01/02/03 field guards + safeId() path guard ARE the runtime enforcement; the reference doc records this as the reason a formal validator is unnecessary.

**Rationale:** Preserves the zero-dependency ethos of the aggregator; a validator dependency would add no value the existing fail-closed guards do not already provide.
**Source:** 17-CONTEXT.md (deferred), 17-02-PLAN.md, 17-SECURITY.md (T-17-05)

## phase-17 decisions Frozen core plus reserved additive-only envelope for the vote record
The aggregator-consumed core `{verdict: "unrefuted"|"refuted"}` is frozen hard (missing seat -> insufficient; seats 0-indexed, capped at VOTES_PER_CLAIM by file naming; cluster-id lookup first). Voter-authored companion fields (attack_mode, disconfirming_query, source-independence note) are forward-declared as a reserved additive-only envelope Phase 18 fills.

**Rationale:** The phase goal is that every downstream component agrees on identical shapes BEFORE any agent is authored; freezing only `{verdict}` would re-open the schema in Phase 18 (churn). Phase 18 MAY fill semantics and add fields but MUST NOT change verdict's consumed shape.
**Source:** 17-CONTEXT.md (D-09, D-10), 17-DISCUSSION-LOG.md

## phase-17 lessons A 1-unrefuted/1-refuted Contested fixture is tautological for the branch-ordering invariant
The code review (CR-01, BLOCKER) found the contested-split fixture encoded unrefuted=1/refuted=1, which classifies as Contested regardless of branch order -- a swapped Medium-first rubric would still pass the test. Only a 2-unrefuted/1-refuted tally makes the Medium branch evaluate true and thus discriminates the correct order from the buggy swapped order. The fixture was upgraded in place (cluster0-2.json added) to the discriminating 2/1 case.

**Context:** When a fixture exists to guard an ordering invariant, the fixture inputs must make the earlier-vs-later branches actually compete; pick the one input combination that fails under the bug. (Recurs for Phase 18-20 vote/voter fixtures.)
**Source:** 17-REVIEW.md (CR-01), 17-VERIFICATION.md (Truth 11)

## phase-17 lessons Co-present acceptance criteria can conflict; assemble forbidden tokens from fragments
Plan 17-01 required the test to assert `r.summary` does NOT include 'Low/Contested', while another acceptance criterion required `git grep "Low/Contested\|Rejected"` over the .test.mjs to return zero hits. A naive negative assertion with the literal string would trip the grep gate. Resolved by assembling the forbidden tokens (`Low` + `/` + `Contested`, `Reje` + `cted`) from string fragments at runtime, so the test checks the real behavior while the source file carries neither literal.

**Context:** When a behavior assertion and a source-hygiene grep gate target the same literal, build the literal at runtime rather than embedding it. The same descriptive-phrasing technique kept the reference doc's zero-hit gate clean ("terminal-delete tier", "fused low-or-contested token").
**Source:** 17-01-SUMMARY.md, 17-02-SUMMARY.md

## phase-17 lessons claims[].id is declared contract-required but is not fail-closed in code
The schema doc declares claims[].id as Required: yes, but mergeClusters fail-closes only on missing text/quote/source, not id. A missing id coerces to the string 'undefined' (safeId('undefined') passes the basename guard), so the member-fallback vote lookup silently searches for undefined-0.json. Masked at runtime only because the cluster-id lookup is tried first.

**Context:** A doc/code contract mismatch and a latent silent-misbehavior path (WR-01, WARNING). Not goal-blocking and left unaddressed as a quality follow-up; recorded so code and doc are reconciled later.
**Source:** 17-REVIEW.md (WR-01), 17-VERIFICATION.md

## phase-17 lessons GSD does not auto-invoke the post-completion audits; trigger them explicitly
Phase 17 ran the full post-completion sequence -- verify -> secure -> validate -> extract-learnings -- as explicit steps. SECURITY.md did not exist before the secure-phase run and was created by it; VALIDATION.md existed at plan-time draft state with all rows pending and both nyquist flags false.

**Context:** None of secure/validate/extract is wired into execute-phase; the verifier closes the requirements via the 3-source cross-reference, but the audits must be triggered after verification passes.
**Source:** 17-SECURITY.md, 17-VALIDATION.md

## phase-17 lessons A documentation phase still carries a real (if low) threat surface: ASCII/CRLF and doc-drift
With no network, auth, or untrusted runtime input, the honest threat surface reduced to two things: the Write tool injecting a U+FEFF BOM or CRLF on this Windows host (corrupting the pure-ASCII zero-dep invariant), and the doc documenting a shape WEAKER than the code (propagating drift downstream). Both were mitigated by a pre-commit pure-ASCII scan and verbatim-freeze discipline with cited anchors.

**Context:** Even a markdown-only phase needs the ASCII/CRLF hygiene gate and a byte-for-byte freeze check; the threat register is small but not empty.
**Source:** 17-SECURITY.md (T-17-02, T-17-06, T-17-07), 17-02-PLAN.md

## phase-17 patterns Repo-blind, multi-round cross-model consensus to re-decide a contested gray area
After the user rejected the `--auto`-selected answer, GA-1 was re-decided by three model families (Opus 4.8 / GPT-5.5 / Gemini 3.1 Pro) reasoning only on curated facts (no repo/web access, could ask the executor to verify). Round 1 split 1-2; after the executor supplied verified source facts, Round 2 converged unanimously on Option I.

**When to use:** A high-impact, hard-to-reverse decision the auto-pass got wrong, where supplying verified facts (not opinion) is what moves the models. Reserve for the trap quadrant (high-impact, low-confidence), not routine gray areas.
**Source:** 17-CONTEXT.md, 17-DISCUSSION-LOG.md

## phase-17 patterns Provenance investigation to strip deference from an inherited artifact
Before correcting the enum, the team traced `Rejected` to its origin (the throwaway spike tally()), confirmed it overrode Phase 16's own research, was never deliberated (Phase 16 discuss was --auto), and contradicted the converged design -- establishing it as an accidental artifact, not a reasoned choice, so a breaking correction was justified.

**When to use:** When deciding whether a "built/committed" value is load-bearing or just carried-forward. Trace where it came from and whether it was ever reasoned; "built" is not evidence it was chosen.
**Source:** 17-DISCUSSION-LOG.md, 17-CONTEXT.md

## phase-17 patterns Per-tier committed fixture trees differing only in votes/ seat verdicts
Each confidence tier gets one committed fixture tree (claims/w1.json + excerpts/e1.txt + votes/cluster0-<seat>.json) copying the near-duplicate template, isolating the vote-seat combination that maps to that tier. A missing seat file counts as 'insufficient'. The claim quote stays verbatim-present in the excerpt so the claim survives the upstream quote-recheck and reaches tally.

**When to use:** Exercising a deterministic decision function tier-by-tier: hold everything constant except the one input dimension under test (here, the votes/ seats).
**Source:** 17-01-PLAN.md, 17-01-SUMMARY.md

## phase-17 patterns Prose-contract reference that freezes code verbatim with cited function + line anchors
The fifth references/ file follows the sibling house style (H1 contract title, intent paragraph naming the anti-drift rule + the three downstream consumers, ## sections, fenced JSON shapes, mapping tables, a worked-example section, explicit caveat sections) and copies every field name/enum/rubric branch byte-for-byte from the source, citing exact functions and line anchors so a reader can verify the doc against the code.

**When to use:** Documenting a data contract that downstream components implement against, where the executable source already exists and must remain the single source of truth.
**Source:** 17-02-PLAN.md, 17-02-SUMMARY.md

## phase-17 patterns Lockstep code+fixture correction as a single dependency-gated wave before the freeze
The corrective code change (Plan 17-01, wave 1) and the contract freeze (Plan 17-02, wave 2, depends_on 17-01) were sequenced so the doc could only ever freeze the corrected shapes. 17-02 re-verified 17-01's GREEN precondition before starting.

**When to use:** Any documentation/freeze task that depends on a code correction landing first; gate the freeze plan on the correction plan and re-verify the precondition at the start of the dependent plan.
**Source:** 17-01-PLAN.md, 17-02-PLAN.md

## phase-17 surprises A documentation phase opened with a BLOCKER from code review
The contract-writing phase's most consequential finding was a test-coverage BLOCKER (CR-01) in the corrective code half, not a doc problem -- the safety net advertised as guarding the single CRITICAL invariant was non-functional because no committed fixture fed the discriminating 2-unrefuted/1-refuted tally.

**Impact:** Required a fixture upgrade (cluster0-2.json added) before verification could pass; resolved and independently re-verified (Truth 11). The test count stayed 19 -- the fixture content was corrected, not the count.
**Source:** 17-REVIEW.md (CR-01), 17-VERIFICATION.md

## phase-17 surprises The user overturned an --auto decision, escalating GA-1 out of autonomous mode
The phase ran `--auto --analyze --chain`, but the user challenged the auto-resolved two-field (confidence + report_confidence + mapping table) answer as code/contract drift, forcing GA-1 into an interactive human + cross-model re-decision while GA-2..GA-5 stayed auto-resolved.

**Impact:** A single gray area was carved out of the autonomous pass and re-decided by 3-model consensus; auto-advance to plan-phase was held pending user confirmation. Demonstrates the --auto trap quadrant (high-impact, low-confidence) in practice.
**Source:** 17-CONTEXT.md, 17-DISCUSSION-LOG.md

## phase-17 surprises Round-1 cross-model vote split, then unanimous reversal once facts were supplied
In Round 1 the three models split (Opus II / GPT I / Gemini II). After the executor verified and supplied four source facts (no synthesis code exists yet; no raw vote-count field on the record; Contested is not frozen as cross-source-only; survivors.json is the only pre-synthesis signal), two models changed their vote and all three converged on Option I.

**Impact:** Confirmed that the disagreement was about missing facts, not values; the verified-facts injection (not more argument) produced unanimity.
**Source:** 17-DISCUSSION-LOG.md

## phase-17 surprises Both plans landed fast with zero deviations despite the contested decision
Plan 17-01 executed in ~8 minutes and 17-02 in ~5 minutes, each with no deviations from the plan and no auto-fix rules invoked -- the heavy lifting (the GA-1 consensus) happened in discuss, so execution was mechanical.

**Impact:** The front-loaded decision work made execution near-trivial; the only execution-time nuance was the fragment-assembly technique for the forbidden-token assertions, which the plan's own co-present acceptance criteria forced rather than a deviation.
**Source:** 17-01-SUMMARY.md, 17-02-SUMMARY.md

## phase-17.1 decisions AGG-1 id guard placed FIRST among the mergeClusters field guards
The `claims[].id` fail-closed guard (`ContractError('claim missing non-empty id', path.join(claimsDir, f))`) was inserted BEFORE the existing text/quote guards in the `for (const c of w.claims)` loop, not after them.

**Rationale:** A missing `id` otherwise coerces to the literal string `"undefined"` in `tally()`'s member-id vote-file fallback (`safeId(String(cl.members[0].id))` -> `votes/undefined-0.json`), cross-contaminating vote tallies across all id-less claims. Validating id first rejects the corrupt input before the member can ever be used. The member-id fallback is in active use (the `wrong-passage-downgraded` fixture names its vote files by member id, e.g. `c1-0.json`).
**Source:** 17.1-01-PLAN.md (Task 1), 17.1-01-SUMMARY.md, 17.1-VERIFICATION.md (SC-1)

## phase-17.1 decisions AGG-2 and AGG-4 deferred to Phase 18 review (not addressed in 17.1)
The extra-seats counting-loop non-contiguous gap (AGG-2) and the `votes_ignored`-includes-non-survivors finding (AGG-4) were explicitly deferred rather than fixed in this phase.

**Rationale:** Both are observability-only findings with no correctness impact, and the findings document itself states "Plan D can slip to Phase 18 review if bandwidth is tight." Deferring keeps 17.1 focused on the four Important findings (AGG-1, TEST-1, TEST-2, SCHEMA-2) plus their tests and schema corrections. SCHEMA-4 documents the standing `votes_ignored`/SYNTH_CAP caveat without fixing the underlying AGG-4 counting behavior.
**Source:** 17.1-CONTEXT.md (D-02), 17.1-DISCUSSION-LOG.md, 17.1-VERIFICATION.md (Deferred Items)

## phase-17.1 decisions excerpt_id path-traversal: fail-hard posture retained (comment-only change)
A malformed `excerpt_id` containing path traversal continues to abort the entire run via `ContractError`; the AGG-Q1 change added only an explanatory comment in `quoteOutcome`, with no control-flow change.

**Rationale:** Fail-hard is consistent with the `ContractError` discipline for every other required field, and path-traversal rejection is a security gate rather than a data-quality threshold. Fail-soft (drop the member, continue) would diverge from every other guard in the codebase and could mask systematic worker bugs silently.
**Source:** 17.1-CONTEXT.md (D-01), 17.1-DISCUSSION-LOG.md (AGG-Q1 trade-off table), 17.1-01-SUMMARY.md

## phase-17.1 decisions TEST-2 uses an inline tmpRunDir, no committed __fixtures__ dir
The cross-file-order stability test was built with an inline run-dir under `os.tmpdir()` (write `z-worker.json` first, `a-worker.json` second) rather than a new committed `__fixtures__/cross-file-order/` directory.

**Rationale:** It avoids fixture-dir sprawl and matches the existing WR-01/02/03 inline-tmpRunDir pattern; only the SC1-SC5 behaviors warrant committed fixture dirs.
**Source:** 17.1-CONTEXT.md (D-03), 17.1-02-PLAN.md (Task 1), 17.1-DISCUSSION-LOG.md (TEST-2 trade-off table)

## phase-17.1 decisions SCHEMA-1 promoted directly to the post-AGG-1 fail-closed state (no interim caveat)
The `claims[].id` schema row was changed straight from `yes` to `yes (fail-closed)` with a WR-04 reference, skipping the interim "no ContractError guard currently exists" caveat the findings doc described.

**Rationale:** Plan 17.1-03 runs after Plan 17.1-01 landed the guard, so the interim caveat (needed only if the schema were edited before AGG-1 was coded) would have been immediately stale. Doing the final state directly keeps the schema always consistent with the code it documents per the D-12 anti-drift discipline.
**Source:** 17.1-03-PLAN.md (Task 1), 17.1-03-SUMMARY.md, 17.1-RESEARCH.md (Pitfall 2)

## phase-17.1 decisions WR-03 (WR-04 label collision) deferred with rationale, not auto-renamed
The code review flagged that `WR-04` now labels two unrelated concerns (the missing-id guard in the test/schema vs the normalized-substring caveat in the source). The recommended rename was deferred rather than applied.

**Rationale:** The recommended resolution conflicts with ROADMAP SC-4's literal "WR-04 test exists" wording and Plan 17.1-02's `git grep WR-04` must_have. The collision is documentation/traceability only (no behavioral impact), the schema already carries a disambiguating disclaimer, and a clean fix would re-touch a frozen Phase 16/17 caveat comment -- out of scope for this gap-closure phase.
**Source:** 17.1-REVIEW.md (WR-03 resolution), 17.1-VERIFICATION.md (Deferred Items)

## phase-17.1 decisions Code-review findings WR-01/WR-02/IN-01 fixed in-phase, not deferred to a gap-closure cycle
The three load-bearing code-review findings were resolved within Phase 17.1 itself rather than spun out to a separate gap-closure loop.

**Rationale:** WR-01 was an empirically-proven violation of ROADMAP SC-3 and Plan 17.1-02's must_have (not a style nit), so it had to be closed before the phase could verify. Resolving WR-01/WR-02/IN-01 in-phase kept the phase gate honest before declaring 17.1 done.
**Source:** 17.1-REVIEW.md (Resolution section)

## phase-17.1 lessons A test can survive removal of the very logic it claims to guard
The first TEST-2 (cross-file-order) asserted on `survivors[0]`, but `survivors[0]` ordering is decided by `rankClusters` (corroboration DESC, then `normalize(text)` lexical ASC), which is independent of file read order. Removing `listJson`'s `.sort()` left the suite 25/0 green -- the test was still tautological, the exact class of finding it was created to fix.

**Context:** When writing a regression guard for an invariant, prove it kills the mutation. Assert on a property the downstream pipeline does NOT re-normalize (here, pre-rank cluster ids assigned by first-seen order), or inject the seam directly. The fix exported `listJson` with an injectable `readdir` param and asserted lexical output, making it host-independent.
**Source:** 17.1-REVIEW.md (WR-01), 17.1-VERIFICATION.md (SC-3)

## phase-17.1 lessons The AGG-5/6/7 ".file annotation everywhere" batch missed the most security-relevant path
The batch existed to make every `ContractError` carry `.file` for the CLI's `(${err.file})` output, but the path-traversal abort in `quoteOutcome` called `safeId(String(member.excerpt_id))` without the file arg -- so the abort that matters most (a worker authored a malicious `excerpt_id`) printed no file annotation, and TEST-9 only asserted the throw, not the annotation.

**Context:** When applying a cross-cutting consistency fix, audit ALL call sites of the function being hardened, not just the ones named in the originating findings. The fix stamped each raw claim with `_file` in `mergeClusters` and threaded it into `quoteOutcome`'s `safeId` call.
**Source:** 17.1-REVIEW.md (WR-02)

## phase-17.1 lessons Comment justifications drift from code reality and need verifying too
The AGG-1 guard comment cited TWO fixtures (`wrong-passage-downgraded` AND `fabricated-quote-dropped`) as evidence the member-id fallback is "in active use." But `fabricated-quote-dropped`'s claim drops at the quote re-check, upstream of `tally`, so its `c1-*.json` vote files are never read -- dead fixtures. Only `wrong-passage-downgraded` actually exercises the fallback.

**Context:** Half-correct evidence in a comment can mislead a maintainer into believing a code path is covered when it is not. The fix trimmed the comment to cite only the fixture that genuinely reaches `tally`.
**Source:** 17.1-REVIEW.md (IN-01), 17.1-VERIFICATION.md (IN-01)

## phase-17.1 lessons On this host readdirSync already returns alphabetical order regardless of creation order
Writing `z-worker.json` then `a-worker.json` and calling `readdirSync` returned `["a-worker.json", "z-worker.json"]` -- the read order the TEST-2 design tried to perturb was not actually perturbed locally.

**Context:** A test that depends on the OS returning files in creation/unsorted order to exercise a sort invariant is not portable -- it silently passes on hosts that pre-sort. A genuinely host-independent guard must inject a deliberately-unsorted directory listing (the injectable `readdir` seam) rather than relying on OS readdir behavior.
**Source:** 17.1-REVIEW.md (WR-01 host aggravator)

## phase-17.1 lessons A documented comment string can trip its own closing git-grep gate
The initial AGG-3 explanatory comment included the backtick-wrapped literal `id === '..'`, which the plan's closing acceptance gate (`git grep -nF "id === '..'"` returns no hits) would have matched -- a false-positive failure even though the code branch was actually removed.

**Context:** When a gate is a literal-string absence check, prose comments that quote the forbidden literal will trip it. Reword the comment to describe the change without reproducing the exact forbidden token.
**Source:** 17.1-01-SUMMARY.md (Deviation 1)

## phase-17.1 patterns Mutation harness to prove regression guards actually bite
Before trusting a new test, remove the guarded behavior in a temp copy and re-run the full suite to confirm the new test FAILS (is KILLED). The review ran this for AGG-1 (KILLED by WR-04), SYNTH_CAP (KILLED by SC5-5), Contested ordering (KILLED), and `.sort()` (SURVIVED -> surfaced the WR-01 tautology).

**When to use:** Any time a test is added specifically to defend a load-bearing invariant against future removal. "Validating by assertion" (the test passes) is not enough; prove it discriminates the mutation.
**Source:** 17.1-REVIEW.md (mutation harness table), 17.1-VERIFICATION.md (Behavioral Spot-Checks)

## phase-17.1 patterns Injectable readdir seam for host-independent ordering tests
Export the function under test (`listJson`) with a defaulted dependency param (`readdir = fs.readdirSync`) so a test can feed a deliberately-unsorted listing and assert the sorted output -- decoupling the assertion from OS readdir behavior. Production callers stay byte-for-byte unaffected because the param is defaulted.

**When to use:** Testing a determinism/ordering invariant that the OS or downstream pipeline would otherwise mask. Beats relying on file-creation order to perturb read order.
**Source:** 17.1-REVIEW.md (WR-01 fix), 17.1-VERIFICATION.md (WR-01)

## phase-17.1 patterns Optional second `file` param on a shared validator for CLI annotation propagation
`safeId` gained an optional `(id, file)` signature, passing `file` to both its `ContractError` constructions. The new param is optional, so all existing single-arg call sites stay unaffected; only the sites that need provenance (loadExcerpts, the threaded quoteOutcome path) pass it.

**When to use:** Extending a widely-called pure validator to carry error provenance without a breaking signature change across every call site.
**Source:** 17.1-01-PLAN.md (Task 2, AGG-6), 17.1-01-SUMMARY.md

## phase-17.1 patterns Caller-side try/finally cleanup for a helper that returns a temp dir
`tmpRunDirWithWorker` returns a path the caller must still use, so cleanup cannot live inside the helper (it would destroy the dir before `aggregate(runDir)` runs). Each caller wraps its `aggregate`/`assert.throws` in `try/finally { fs.rmSync(runDir, { recursive: true, force: true }) }` instead. node:test has no `afterEach`, so inline try/finally is the established pattern.

**When to use:** Cleaning up resources produced by a factory helper in a test framework without lifecycle hooks; cleanup belongs at the consumer, not the producer.
**Source:** 17.1-02-PLAN.md (Task 2, TEST-5), 17.1-RESEARCH.md (Anti-Patterns, Pitfall 3)

## phase-17.1 patterns Schema rows copied byte-for-byte from code (D-12 anti-drift discipline)
Field names, enum values, rubric branches, and condition expressions in `lz-deep-research-schema.md` are copied verbatim from the aggregator source; the code wins on any divergence. SCHEMA-2 restored `cited != null && cited.includes(nq)` to match `aggregate.mjs`, and the SCHEMA-1 id row was made to match the new guard exactly.

**When to use:** Maintaining a frozen contract reference that downstream phases implement against. Verify each row against the live source line, not against memory or the prior doc state.
**Source:** 17.1-03-PLAN.md, 17.1-03-SUMMARY.md (Source-of-Truth Cross-Check), 17.1-CONTEXT.md (canonical_refs)

## phase-17.1 surprises The rank step masked the listJson sort, making the determinism guard inert
The reviewer expected the cross-file-order test to fail when `.sort()` was removed; instead the suite stayed fully green. Root cause: `rankClusters`' lexical tiebreak re-sorts `survivors`, so the `listJson` sort is unobservable through `survivors[0]`.

**Impact:** TEST-2 had to be rewritten mid-phase (during code-review resolution) to drive an injectable readdir seam and assert lexical output directly; TEST-2b was split out to own the run-to-run determinism check. The suite grew from 25 to 26 tests.
**Source:** 17.1-REVIEW.md (WR-01), 17.1-VERIFICATION.md (SC-3, SC-8)

## phase-17.1 surprises The "WR-04" label silently overloaded two unrelated guards across three files
`WR-04` denoted both the new missing-id guard (test + schema) and a pre-existing normalized-substring caveat (source comment + schema heading). The same missing-id fix is labeled `AGG-1` in the code but `WR-04` in the test and schema.

**Impact:** A maintainer grepping `WR-04` to trace the missing-id guard would land on the unrelated substring caveat. The schema author papered over it with a disambiguating parenthetical; a clean rename was deferred because it conflicts with the ROADMAP SC-4 / must_have wording.
**Source:** 17.1-REVIEW.md (WR-03), 17.1-03-SUMMARY.md (Deviation 1)

## phase-17.1 surprises A "no behavior regression" hardening phase still grew the test count from 19 to 26
The phase was framed as pure code-quality + documentation correctness with no new features, yet the suite went 19 -> 25 (Plan B additions) -> 26 (TEST-2b split during code-review resolution).

**Impact:** The phase gate's expected test count was a moving target; verification had to account for the +1 from the in-phase code-review fix (`26 = original 25 + TEST-2b split`).
**Source:** 17.1-01-SUMMARY.md, 17.1-02-SUMMARY.md, 17.1-VERIFICATION.md (SC-8)

## phase-17.1 surprises Plan 17.1-03 SUMMARY cites line 368/385 for the null-guard while the PLAN cited 322
The PLAN's interfaces referenced the `cited != null && cited.includes(nq)` guard at `aggregate.mjs:322`, but by the time Plan 17.1-03 executed, the SUMMARY's source cross-check found it at `aggregate.mjs:368` (and VERIFICATION at 385).

**Impact:** Line numbers shifted as the Plan 17.1-01 fixes landed ahead of the schema plan; the executor correctly verified against the live source line rather than the stale PLAN-time reference, upholding the D-12 discipline.
**Source:** 17.1-03-PLAN.md (interfaces), 17.1-03-SUMMARY.md (SCHEMA-2), 17.1-VERIFICATION.md (SC-5)

## phase-17.2 decisions Enforce claim-id path-safety at READ-time in mergeClusters, not late in tally
The R1-1 fix adds a validating `safeId(c.id, path.join(claimsDir, f))` side-effect call inside `mergeClusters` immediately after the AGG-1 non-empty guard (`:260`), with `.file`-annotated `safeId` calls in `tally` (`:515-516`) only as defense-in-depth.

**Rationale:** R1-1 names the defect as "missing at READ-TIME in mergeClusters, violating AGG-5/6/7 `.file` discipline" -- the finding prescribes the location. A late rejection in `tally` threw a `ContractError` with `.file === undefined`, so the CLI `(${err.file})` annotation could not name the authoring worker. `mergeClusters` already stamps `_file` at `:271`, so the originating path is available at the read boundary. This is the exact analog of Phase 17.1's WR-02 excerpt_id fix.
**Source:** 17.2-CONTEXT.md (D-01), 17.2-01-PLAN.md, 17.2-DISCUSSION-LOG.md (Option A)

## phase-17.2 decisions Fail closed (ContractError) on a structurally-null/non-object vote record
R2-1 replaces the bare `const verdict = readJson(f).verdict;` (`:522`) with a `const rec = readJson(f);` read, a `if (rec == null || typeof rec !== 'object')` guard throwing `ContractError('malformed vote record (expected object): ...', f)`, then `const verdict = rec.verdict;`.

**Rationale:** A literal-`null` vote file is malformed worker output (no record), categorically distinct from a well-formed record whose `verdict` FIELD is absent/null (which legitimately stays lenient). Failing closed matches the project fail-hard posture (17.1 D-01 / AGG-Q1) and restores the `ContractError` coverage that the bare `null.verdict` TypeError bypassed. The alternative (lenient coerce to `insufficient`, mirroring `:523`) was rejected and recorded so the planner would not re-litigate it.
**Source:** 17.2-CONTEXT.md (D-02), 17.2-01-PLAN.md, 17.2-DISCUSSION-LOG.md (Option A)

## phase-17.2 decisions Preserve the :523 present-but-null verdict-field leniency byte-for-byte
The line `seats.push(verdict == null ? 'insufficient' : verdict);` (now `:550`) is left unchanged; the new R2-1 guard sits BEFORE it.

**Rationale:** The structural-RECORD guard (new, fail-closed) and the absent-FIELD leniency (preserved) are two separate concerns. A well-formed record with a missing `verdict` field intentionally maps to `insufficient`; only the structurally-broken record fails closed. Keeping `:523` untouched preserves the existing PIPE-07 confidence-tier and Unsupported-tier test outcomes.
**Source:** 17.2-CONTEXT.md (D-02), 17.2-01-SUMMARY.md

## phase-17.2 decisions No Array.isArray rejection in the R2-1 guard
The guard rejects only `null` and non-objects; an array vote record (which is `typeof 'object'`) is NOT rejected.

**Rationale:** An array reads `.verdict` as `undefined`, which flows to the lenient `insufficient` path. Adding an `Array.isArray` rejection would be scope creep beyond what D-02 prescribes. The reviewer confirmed the array case stays lenient (`-> Low`) as documented.
**Source:** 17.2-01-PLAN.md, 17.2-01-SUMMARY.md, 17.2-REVIEW.md

## phase-17.2 decisions Each Important fix gets a mutation-verified regression test
Both R1-1 and R2-1 ship with a regression test proven to FAIL when its guard is removed, asserting on `err.name === 'ContractError'` and `err.file` (the annotation), not merely that a throw occurs.

**Rationale:** A throw-only assertion would miss whether `.file` is annotated -- which is the exact R1-1 defect (a path-traversal id is ALSO rejected late in `tally`, so asserting only the throw would be tautological). The mutation-verified shape follows the 17.1 review methodology and avoids the TEST-2 tautology class. This same test rigor also closes the R1-3/R2-3 test-coverage-gap Suggestions.
**Source:** 17.2-CONTEXT.md (D-04), 17.2-01-PLAN.md, 17.2-VALIDATION.md

## phase-17.2 decisions Alias-preserving relabel for the WR-04 overload (AGG-1 primary, WR-04 retained, QR-01 for the caveat)
The single `WR-04` token named two unrelated concerns -- the missing-id fail-closed guard AND the normalized-substring lower-bound caveat. The relabel promotes `AGG-1` as the primary missing-id label, RETAINS `WR-04` as a co-label on the test name and schema row, and gives the substring caveat its own fresh `QR-01` token.

**Rationale:** ROADMAP Phase 17.1 SC-4's literal "WR-04 test exists" wording and Plan 17.1-02's `git grep WR-04` must_have both depend on the `WR-04` token surviving -- the exact reason 17.1 deferred it (WR-03). A full rename away from `WR-04` (Option B) would break those anchors. Leave-as-is (Option C) would not close the Suggestion. Keeping `WR-04` as an alias on the missing-id anchors satisfies SC-4 while resolving the collision.
**Source:** 17.2-CONTEXT.md (D-03), 17.2-02-PLAN.md, 17.2-02-SUMMARY.md, 17.2-DISCUSSION-LOG.md (Option A)

## phase-17.2 lessons A path-traversal id is rejected twice -- so the read-time test fixture must DROP the claim before tally
The R1-1 regression test uses an otherwise-valid claim with id `'../evil'` and NO excerpts dir, so the claim drops at quote-recheck before reaching `tally`. With no excerpts, only the read-time guard can reject it, making `err.file.endsWith('w1.json')` the assertion that fails when the guard is removed.

**Context:** Because a path-traversal id is ALSO rejected late in `tally`, a fixture that lets the claim reach `tally` would still throw with the read-time guard removed -- making `assert.throws` tautological. The fixture must be engineered (Pitfall 4 option a) so the late path cannot fire.
**Source:** 17.2-RESEARCH.md (Pitfall 4), 17.2-01-PLAN.md, 17.2-01-SUMMARY.md

## phase-17.2 lessons Keep the AGG-1 non-empty guard distinct from safeId -- do not collapse them
The AGG-1 `'claim missing non-empty id'` throw must stay; the new `safeId` call coexists with it rather than replacing it.

**Context:** `safeId`'s empty-id message is `'invalid id (expected non-empty string)'`. Collapsing the AGG-1 guard into `safeId` would change the message and break the WR-04 test's `/missing non-empty id/` assertion. Two guards with two distinct messages must coexist at the read boundary.
**Source:** 17.2-RESEARCH.md (Pitfall 1), 17.2-01-PLAN.md, 17.2-01-SUMMARY.md

## phase-17.2 lessons The literal-null vote file must be written as the bytes `null`, not JSON.stringify(null)
The R2-1 fixture writes the literal string `'null'` into `votes/cluster0-0.json` so `readJson` parses it to JavaScript `null`.

**Context:** `JSON.stringify(null)` and the literal string `'null'` happen to coincide here, but the plan explicitly directs writing the bytes `null` -- the point is that the file content must be well-formed JSON that parses to a structurally-null value, which is what trips the bare `null.verdict` TypeError on the unguarded path. Reverting the guard makes the test fail on the `err.name === 'ContractError'` predicate (the error becomes a `TypeError`).
**Source:** 17.2-01-PLAN.md, 17.2-01-SUMMARY.md

## phase-17.2 lessons Confirm a fresh label token has zero pre-existing collisions BEFORE editing
`QR-01` was chosen for the substring caveat only after `git grep -c "QR-01" -- plugins/lz-advisor` returned zero matches.

**Context:** A relabel that resolves one collision must not introduce another. Verifying non-collision against every existing label family (AGG-* / WR-* / SC-* / TEST-* / PIPE-* / QR-* / D-*) before editing prevents trading one overload for another.
**Source:** 17.2-02-PLAN.md, 17.2-02-SUMMARY.md

## phase-17.2 lessons Same-file Wave 1 edits drift Wave 2's line-number anchors -- locate by content, not :NNN
Plan 02 cited the substring-caveat comment at `:377`, but Wave 1's R1-1 inserts pushed it to `:385`. The executor located the anchor by content match (`git grep`) as the plan's interfaces section anticipated.

**Context:** When a later wave edits the same file an earlier wave modified, hardcoded line anchors go stale. Plans that depend on prior-wave edits should anchor by content/token, and the executor should treat the line drift as expected, not a deviation.
**Source:** 17.2-02-SUMMARY.md (Deviations from Plan), 17.2-REVIEW.md (IN-01)

## phase-17.2 patterns Validating side-effect call at the read boundary
Call a throwing validator (e.g. `safeId(c.id, file)`) at the point of ingestion and discard its return value -- the throw IS the contract, the returned value is not used.

**When to use:** When untrusted input must be rejected as early as possible (before it propagates into path construction or downstream stages), and a validator already exists that throws on bad input. The discarded return makes the call's purpose unambiguous: it is a guard, not a transform.
**Source:** 17.2-01-SUMMARY.md, 17.2-RESEARCH.md (Pattern 1)

## phase-17.2 patterns Structural-RECORD guard distinct from absent-FIELD leniency
Guard the parsed record for null/non-object BEFORE reading a field, while leaving a separate, intentional leniency on the absent FIELD untouched.

**When to use:** When malformed structure (no record at all) should fail closed but a present record with a missing optional field should stay lenient. The two checks sit on adjacent lines but encode opposite policies; keep them visibly separate so neither is mistaken for the other.
**Source:** 17.2-01-SUMMARY.md, 17.2-RESEARCH.md (Pattern 3)

## phase-17.2 patterns Mutation-verified regression test that asserts the annotation, not just the throw
Prove a test non-tautological by removing its guard and confirming the test goes red; assert on `err.name` / `err.file`, and engineer the fixture so only the target guard can produce the failure.

**When to use:** Whenever a defect is about HOW an error is raised (annotated `ContractError` vs bare `TypeError`, named worker file vs `undefined`) rather than merely THAT an error is raised. Document the exact mutation and its expected red outcome in a test comment.
**Source:** 17.2-CONTEXT.md (D-04), 17.2-VALIDATION.md, 17.2-01-SUMMARY.md

## phase-17.2 patterns Alias-preserving relabel
Promote a new primary label token while RETAINING the old token as a co-label wherever an external acceptance criterion anchors it, and move the unrelated overloaded usage to its own fresh token.

**When to use:** When resolving a label/identifier overload that an external contract (a ROADMAP success criterion, a `git grep` must_have) depends on by literal string. Deleting the token would break the anchor; keeping it as an alias resolves the collision without breaking traceability.
**Source:** 17.2-02-SUMMARY.md, 17.2-RESEARCH.md (Pattern 4)

## phase-17.2 surprises A retroactive comprehensive review surfaced 13 NEW findings spanning Phases 16-17.2
After Phase 17.2 closed its 6 findings, a deep 4-pass /lz-review (Opus) of the same files produced 6 Important + 6 Suggestion + 1 Question findings (13 total) -- none blocking 17.2, but a fresh backlog concentrated on cap-MEMBERSHIP test gaps and schema-vs-code drift.

**Impact:** The suite tests cap COUNTS thoroughly but never cap MEMBERSHIP -- the `rankClusters -> enforceCeilings -> SYNTH_CAP` ordering that decides which evidence reaches synthesis has no end-to-end rank-correctness test. A single fixture revision (one multi-source cluster + id/boundary assertions) would close I-3, I-4, I-5, and S-3 together. These remain open for a follow-on phase.
**Source:** 17.2-COMPREHENSIVE-REVIEW.md

## phase-17.2 surprises recheckClusters silently narrows the sources Set, producing an invisible corroboration under-count
The comprehensive review found that `recheckClusters` rebuilds `sources` from surviving members only (`:433-442`), so a 3-source cluster with 2 fabricated quotes emits `corroboration_lower_bound: 1` with no receipt in the summary.

**Impact:** The post-recheck value is the correct semantic, but the schema cites `cluster.sources.size` without clarifying it is the POST-recheck value, and no corroboration under-count is detectable from output alone. This is a documentation/observability gap on the frozen contract Phases 18 and 20 consume.
**Source:** 17.2-COMPREHENSIVE-REVIEW.md (I-1)

## phase-17.2 surprises The Phase 17.2 code review found only Info-level nits -- the only residue was stale :NNN comments
Despite three changed files with new guards and a relabel, the standard code review returned 0 Critical / 0 Warning, with the sole findings being stale line-number annotations (IN-01) and an accepted dual AGG-1/WR-04 schema label (IN-02, the intended alias design).

**Impact:** Confirmed the fixes were behavior-preserving for production callers and the frozen contracts (CEILINGS, tally rubric, confidence enum, survivor-record shape) were untouched. The reviewer's recommendation to drop bare `:NNN` anchors in favor of structural descriptions is more robust against the line drift this very phase introduced.
**Source:** 17.2-REVIEW.md (IN-01, IN-02)

## phase-17.3 decisions Built-in node coverage, zero external dependencies
Coverage uses `node --test --experimental-test-coverage` with the threshold flags; no c8/istanbul/nyc, no `package.json`.

**Rationale:** The aggregator under test is deliberately Node-stdlib-only; a coverage dependency would break the load-bearing zero-dependency ethos for marginal value.
**Source:** 17.3-CONTEXT.md (D-01), 17.3-01-SUMMARY.md

## phase-17.3 decisions Enforced coverage floor = measured achievable, not aspirational 100
Thresholds pinned to 97/89/100 (the measured floor), with a `node:coverage` pragma only around the unreachable CLI bootstrap guard.

**Rationale:** The 8 uncovered lines are defensive fail-closed guards inside code-under-test the phase boundary forbids modifying; reaching 100 would require new tests (out of scope). A justified sub-100 floor (D-03) keeps the gate honest and meaningful rather than fictional.
**Source:** 17.3-CONTEXT.md (D-03), 17.3-01-SUMMARY.md

## phase-17.3 decisions MC/DC + operator coverage documented infeasible, not chased
The roadmap's "if feasible" MC/DC + `??`/`?.` operator coverage is recorded as infeasible-without-deps and not pursued.

**Rationale:** Built-in coverage is line/branch/function only; MC/DC has no zero-dep JS tooling; source has 0x `?.` and 1x `??` (covered by ordinary branch coverage). Adding a dependency to chase it would violate D-01.
**Source:** 17.3-CONTEXT.md (D-04)

## phase-17.3 decisions act meta-CI (test-act.yml) as a committed workflow (scope expansion)
Added a separate `.github/workflows/test-act.yml` that runs nektos/act against ci.yml, with a redundancy caveat accepted.

**Rationale:** User-directed mid-execution (chose "Option 1" after the redundancy caveat was flagged). Catches act-compatibility drift in the CI surface; value is narrow (ci.yml already runs natively) but the authoring process surfaced a real bug.
**Source:** 17.3-CONTEXT.md (D-11), 17.3-02-PLAN.md

## phase-17.3 decisions .actrc as the single source of the pinned act image
`.actrc` carries `-P ubuntu-latest=catthehacker/ubuntu:act-22.04`; the workflow restates it in `ACT_IMAGE` with a byte-for-byte no-drift assertion.

**Rationale:** Defuses act's interactive image prompt for both local dev and the runner; one canonical pin avoids drift.
**Source:** 17.3-CONTEXT.md (D-12, D-13), 17.3-02-SUMMARY.md

## phase-17.3 decisions Fork-PR guard (WR-01) deliberately NOT added
Rejected the code-review suggestion to skip the real act run for fork PRs.

**Rationale:** test-act.yml uses plain `pull_request` (read-only token, no secrets), ci.yml already runs PR test code natively, and act runs that code MORE sandboxed (inside the container) than ci.yml does. The guard provides no security benefit; the only real lever would be cost, which is moot at a 76s run.
**Source:** 17.3-REVIEW.md (WR-01), 17.3-02-SUMMARY.md

## phase-17.3 lessons Peel annotated tags before SHA-pinning actions
`actions/checkout` ships v6.0.3 as an ANNOTATED tag, so `git ls-remote --tags` returns the tag-OBJECT hash (`9f698171...`); the commit to pin is the PEELED `refs/tags/v6.0.3^{}` value (`df4cb1c...`). `actions/setup-node` ships LIGHTWEIGHT tags (no peel). The plan-checker caught an inverted pin (tag-object labeled as the commit).

**Context:** GitHub's "pin to a full commit SHA" guidance means the COMMIT. Always resolve via the `^{}` peeled line (or `git rev-list -n1 <tag>`), and know whether a given action uses annotated vs lightweight tags.
**Source:** 17.3-REVIEW.md, 17.3-01-PLAN.md (revision), 17.3-VERIFICATION.md

## phase-17.3 lessons act blocks on an interactive image-size prompt non-interactively
On a fresh runner with no `.actrc`, any image-touching act invocation (`act -n`, real runs) blocks on a "choose image size" prompt and dies (`Incorrect function.`, exit 1). `act --list` is exempt.

**Context:** Always pass an explicit `-P ubuntu-latest=<image>` or commit a repo-root `.actrc`. This was the research's #1 landmine and reproduced locally.
**Source:** 17.3-02-RESEARCH.md, 17.3-02-SUMMARY.md

## phase-17.3 lessons Download release assets under their canonical name so checksum verification can find them
The install step downloaded the act tarball as `act.tar.gz` while `checksums.txt` names it `act_Linux_x86_64.tar.gz`; `sha256sum -c` then could not locate the file, and the original `--ignore-missing` form would have failed on the runner with "no file was verified".

**Context:** A pre-existing bug in the as-authored workflow, surfaced only by running the REAL download+verify locally -- the dry-run (which traces ci.yml, not test-act.yml's own steps) and the "defer to GitHub" disposition both missed it. Download with the canonical asset name; verify the actual pipeline, not just the dry-run.
**Source:** 17.3-02-SUMMARY.md (Post-Review Refinement), local validation

## phase-17.3 lessons Pinning a tool past a CVE floor is both hygiene and a security fix
Local act 0.2.84 self-reports CVE-2026-34041/-34042; the workflow pins >=0.2.86 (0.2.89). The pinned-release-with-checksum decision (D-13) doubles as the CVE remediation.

**Context:** When a "pin for reproducibility" decision exists, check whether the pinned floor also clears a known vulnerability -- it strengthens the rationale and the threat register.
**Source:** 17.3-02-RESEARCH.md, 17.3-SECURITY.md (T-17.3-02-02)

## phase-17.3 lessons Local act proves a CI workflow green end-to-end before any push
`act push` + `act pull_request -W ci.yml -j test` on the dev host resolved `lts/krypton -> v24.14.0` in-container and ran the full job green, closing the "does setup-node resolve the LTS alias on a real runner" question without a GitHub round-trip.

**Context:** For CI-authoring phases, a local act run converts an inherently-server-side verification item into a locally-provable one (cheaply de-risking before push).
**Source:** 17.3-02-SUMMARY.md, 17.3-VERIFICATION.md

## phase-17.3 patterns act-in-GitHub-Actions meta-CI
A committed workflow that installs pinned+checksummed act on ubuntu-latest (Docker is preinstalled; no DinD) and runs `act push`/`act pull_request -W <target>.yml -j <job> -P ubuntu-latest=<image> -s GITHUB_TOKEN=${{ github.token }}`, paths-filtered to the CI surface.

**When to use:** When you want CI to verify a CI workflow itself (act-compatibility drift) -- accepting that it is partly redundant with the target workflow running natively.
**Source:** 17.3-02-PLAN.md, 17.3-02-RESEARCH.md

## phase-17.3 patterns Fail-closed built-in coverage gate (zero-dep)
`node --test --experimental-test-coverage --test-coverage-lines=N --test-coverage-branches=N --test-coverage-functions=N` exits non-zero below threshold. Prove it fail-closed by raising one threshold above the achieved figure and asserting exit 1.

**When to use:** Any Node project that wants enforced coverage without a coverage dependency.
**Source:** 17.3-01-PLAN.md, 17.3-01-SUMMARY.md

## phase-17.3 patterns Single-source pinned image + no-drift assertion
Keep a pinned identifier (here the act runner image) in one canonical file (`.actrc`) and, where a second file must restate it, add an automated assertion that the two are byte-for-byte equal.

**When to use:** Whenever a pinned value must appear in more than one place and silent divergence would be dangerous.
**Source:** 17.3-02-PLAN.md, 17.3-02-SUMMARY.md

## phase-17.3 patterns Validate the actual command, not just the dry-run
For steps with side effects (downloads, checksum verification), exercise the real pipeline locally rather than trusting a dry-run or deferring entirely to CI -- the dry-run traces a different surface and can mask defects.

**When to use:** Any workflow step whose dry-run does not execute the side-effecting logic (installs, downloads, checksum/signature verification).
**Source:** 17.3-02-SUMMARY.md, local validation

## phase-17.3 surprises The "heavy" meta-CI ran in 76 seconds
test-act (install act + pull the multi-GB catthehacker image + run ci.yml twice under act) finished in 1m16s on GitHub -- the image pull was NOT the bottleneck.

**Impact:** Image caching (docker save/load + actions/cache) was evaluated and rejected as a wash that would also burn the 10GB cache budget. The lean choice was correct.
**Source:** GitHub Actions run 27584218328, user caching discussion

## phase-17.3 surprises The checksum bug would have slipped to CI
Neither the executor's "defer to GitHub green run" disposition nor the act dry-run would have caught the download-filename/checksum mismatch; only the orchestrator running the real download+verify locally surfaced it.

**Impact:** Reinforced "validate the actual command" -- a deferred verification let a broken security-relevant step (checksum) reach the committed workflow before being caught.
**Source:** 17.3-02-SUMMARY.md (Post-Review Refinement)

## phase-17.3 surprises Tag-object, peeled-commit, and floating-tag SHAs can coincide
For `actions/checkout` v6.0.3, the peeled commit (`df4cb1c...`) currently also equals the floating `v6` tag pointer -- which initially misled the plan into labeling the real commit as "the floating tag to avoid."

**Impact:** The coincidence masked the annotated-tag-object vs commit distinction; took the plan-checker's live `git ls-remote` to untangle. A reminder that SHA equality across refs is incidental, not semantic.
**Source:** 17.3-VERIFICATION.md, 17.3-01-PLAN.md (revision)

## phase-17.3 surprises A user-directed "redundant" workflow caught a real defect
The act meta-CI was flagged as largely redundant with ci.yml -- yet authoring + locally validating it is exactly what surfaced the checksum asset-filename bug.

**Impact:** "Redundant" verification can still pay for itself by exercising a code path (the real download+checksum) that nothing else did. Worth weighing before dismissing belt-and-suspenders CI.
**Source:** 17.3-02-SUMMARY.md, 17.3-REVIEW.md

