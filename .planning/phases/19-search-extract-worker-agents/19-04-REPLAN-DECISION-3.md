# 19-04 / 19-05 re-plan decision 3 (offline-gate construct validity: closed-book judgment; retrieval deferred) -- 2026-06-18

**Status:** Resolved by THREE independent consult rounds, all converged on the same approach:
1. A blind in-family Opus panel (4 diverse lenses + synthesis): closed-book, evidence-absent primary, no MCP build, defer retrieval to Phase-20.
2. An in-family Opus reconciliation (4 lenses + synthesis), run AFTER a `claude-code-guide` capability consult REFUTED the panel's "closed-book is the ONLY leak-safe option" premise (a leak-safe offline MCP-retrieval gate IS buildable). The reconciliation resolved the pivotal crux: Phase-20 is a LIVE operational shadow, not a clean leak-controlled retrieval eval -- yet building the offline MCP-retrieval gate is still poor ROI (corpus too thin, low fidelity, bounded downside).
3. A cross-family advisory board (in-family Opus + out-of-family Copilot GPT-5.5 + Gemini 3.1 Pro Preview), 2 rounds to EXPLICIT consensus (~28.6 AI Credits; transcripts in gitignored `eval/.cache/board/`). The out-of-family models independently CONFIRMED the in-family verdict.

Triggered by the pre-calibrator artifact review (`19-04-ARTIFACT-REVIEW.md`). This SUPERSEDES the dispatch-realization + retrieval-scope parts of RE-PLAN-2; the KS-enrichment layer (Task 1), the manifest/lock-rule pre-registration (Task 3), and the dispatch SHARED control-logic helpers STAND. This is the authoritative input for re-planning 19-04 + 19-05 via gsd-planner (no new research -- the consults produced + validated the design).

## Why re-plan AGAIN (the gap RE-PLAN-2 inherited)

RE-PLAN-2 specified enrichment + 2 strata + scoring reconciliation + no-abstention, but GLOSSED the dispatch REALIZATION and the construct it could actually measure. The artifact review + two independent reviewers + source re-verification found:
- **C1 (blocking):** the committed voter-dispatch Workflow cannot drive a valid run. The dispatched subagent receives NO evidence (`voter-dispatch.workflow.mjs:222-225`); the frozen `staticKsAdapter.fetchResults` IGNORES the query (`lz-eval-search-loop.mjs:233-237`); a Workflow is filesystem-blind + import-sealed and `agent()` returns a single TEXT string, not the `{vote,trace}` object the dispatch assumes (`:239-242`). So a real voter cannot run `searchAndStop` nor produce a trace -> every vote drops -> the pool never fills.
- **I1:** the harness gives false confidence -- every mock `agent()` returns a `{vote,trace}` OBJECT, never the real string, so 16/16 green cannot catch C1.
- **I2:** the k-votes/claim -> one pooled per-claim verdict reduction AND the false-uphold-over-k rule (any-uphold vs majority) are unimplemented in code and absent from the lock-rule; `readDelta` consumes one pooled record/claim.
- **I3:** the `classifySeed` agreement guard (`lz-eval-trap-assembler.mjs:385-393`) is a tautology / dead code (cannot fire).
- **I4:** the `>=5`-survivor floor test is weak (no exactly-5-kept boundary case).

Deeper construct finding (the consults' core): a real voter is a Claude subagent; to stay offline/leak-safe it can only judge evidence SUPPLIED to it (a leak-safe model-driven offline retrieval IS buildable via a local MCP, but the frozen adapter ignores the query, so it requires a NET-NEW ranked top-k index -- net-new, low-fidelity to live web, and the corpus is too thin to create real deep-search difficulty). Therefore the offline gate, realized feasibly, measures CLOSED-BOOK JUDGMENT over an orchestrator-supplied date-window packet -- NOT retrieval orchestration.

## The pivotal crux (resolved unanimously)

**Phase-20 is a LIVE operational SHADOW (shadow -> canary -> tier-1; ROADMAP SC-6), NOT a clean leak-controlled known-gold retrieval eval.** On the live web the published gold verdict is reachable at vote time (the leak the offline gate exists to prevent). So there is NO clean retrieval eval waiting in Phase-20: the controlled offline corpus is the ONLY venue a clean retrieval eval could ever live. This CREDITS the "build it now" premise (retrieval is not cleanly testable in Phase-20) BUT does NOT justify building it now -- see the decision.

## Corpus ground truth (measured; for pre-registration)

- The AVeriTeC dev KS is per-claim pre-retrieved as `top_100` (100 candidate sentences/claim; median ~56 distinct URLs/claim).
- After the strict per-claim publication-date cutoff, surviving strictly-pre-cutoff docs are MEDIAN 5/claim (62/122 Supported seeds have >=5; p25 = 2).
- Implication: a "buried-deep-among-distractors" construct (the assembler's rank>=20 burial gate) is NOT constructible for most claims at median-5; an offline ranked-retrieval index would have almost nothing to rank over -> re-saturation risk.
- Prior result: a CLOSED-BOOK subtle-overreach eval SATURATED (Haiku 0/30 == Sonnet 0/30). The "resist-uphold-on-absence" failure mode was NEVER tested.

## The converged design (the decision)

1. **Offline gate = CLOSED-BOOK judgment (Option A); do NOT build the dev MCP + a new ranked-retrieval index (Option B).** Bounded downside (gates only an OFF-by-default flag; Sonnet ships regardless) + a thin/low-fidelity corpus + redundancy with the live pilot make the index build poor ROI.
2. **Primary arm = `evidence-absent` (resist-uphold-on-absence):** mutate a Supported seed into an overreach (gold = refuted) whose refutation is NOT in the KS; retain the original UNMUTATED supporting docs as a plausible text temptation. The one genuinely-new failure mode vs the saturated Phase-18 subtle arm; constructible offline; cheap; confound-free.
3. **`buried` is AUTO-GATED (the board's R2 compromise):** keep `buried` ONLY IF the assembler constructs `>=3` distinct claims with a decisive refuter at the build-gate rank (`>=20`) AND the Sonnet calibrator shows it discriminates; otherwise AUTO-DROP to evidence-absent-only. At median-5 docs this will almost certainly fail-closed and drop. The existing `>=3`/stratum fail-closed already makes the drop automatic -- make it EXPLICIT and LOGGED (record WHY buried dropped). `buried` offline is acknowledged a context-attention / refuter-detection JUDGMENT test, NOT retrieval.
4. **Retrieval orchestration (query formulation / search depth / premature-stop) is NOT cleanly + leak-safely measurable in this offline setup; it DEFERS to the Phase-20 LIVE operational shadow** (accepted as operational, not gold-clean). Record this as a construct-scope BOUNDARY so retrieval is never silently assumed-covered.
5. **VOID is a first-class, pre-committed acceptable outcome:** if neither honest stratum puts Sonnet below ceiling (likely, per Phase-18), emit VOID, defer to the Phase-20 shadow; Sonnet-default ships regardless. Keep the D-06 saturation pre-condition + the Sonnet calibrator.

## The realization mechanic (the C1/I1/I2 fix -- 3-part dance, pre-registered)

1. **Node pre-pass** (dev-tree Node, NOT a Workflow): for each assembled trap claim, run the FROZEN `searchAndStop({claim, adapter: staticKsAdapter(enrichedKs, claimId, claimDate), ...})` to produce the real `{queries, depth, stop_reason}` trace + the date-filtered evidence packet. Write packets to gitignored `eval/.cache/`.
2. **Workflow judge pass:** the dispatch Workflow takes the packet via args, dispatches the parameterized voter seat (Sonnet Stage-1 / Haiku Stage-2) with the date-filtered evidence INLINED for a JUDGE-ONLY verdict (NO live web, no self-search), and the agent return is parsed as a TEXT string (remove the `{vote,trace}` object assumption). The voterPrompt is rewritten to judge-over-supplied-evidence (closed-book), no-abstention.
3. **Node persist/reduce pass:** attach the JS-produced trace orchestrator-side; persist via `persistVote`; reduce the k votes/claim -> one pooled per-claim verdict via the PRE-REGISTERED rule (`readDelta` consumes one pooled record/claim).

## Fixes folded into RE-PLAN-3

- **C1:** dispatch reworked to the 3-part realization above (the SHARED helpers `parseVoteVerdict`/`toScoredVote`/`remainingVotes`/`kFloorAtLeast` stay; the orchestration body + voterPrompt + return handling change to closed-book judge-only + TEXT parse).
- **I1:** the harness MUST exercise the REAL string `agent()` return (not a `{vote,trace}` object) + an integration smoke over the real `searchAndStop`/`staticKsAdapter`.
- **I2:** define IN CODE and PRE-REGISTER in the lock-rule the k->1 reduction AND the false-uphold-over-k rule. The rule MUST mirror the shipped pipeline's tally semantics (so the eval measures production); state the chosen rule (any-uphold vs majority) explicitly BEFORE any vote.
- **I3:** convert the tautological `classifySeed` agreement guard into a discriminating check OR remove it and rely explicitly on the BLIND validityProbe + the manifest ranks.
- **I4:** add the exactly-5-survivor inclusive-boundary KEEP test.

## Carried as DONE (not rebuilt)

- Task 1 KS-enrichment (`extractUrlDate`/`normalizeClaimDate`/`enrichKsForClaim`, byte-locked `URL_DATE_RULE`) -- STANDS; frozen primitives untouched. The assembler STANDS; the only changes are the buried-auto-drop (explicit + logged), I3, and I4.
- Task 3 pre-registration manifest + lock-rule -- STANDS; ADD: the k->1 reduction + false-uphold-over-k rule, the construct-scope boundary (closed-book judgment, NOT retrieval; Phase-20 = operational shadow), the buried-auto-drop rule, the no-MCP-build decision + rationale, and the scope-limit (below). EVAL_THRESHOLDS + URL_DATE_RULE byte-locked.
- The dispatch SHARED control-logic helpers -- STAND.

## Construct-scope boundary + Haiku-ON preconditions (the lone dissent, reconciled)

- A closed-book PASS tests JUDGMENT difficulty (resist-uphold-on-absence), NOT retrieval orchestration. State this in the run artifact AND the lock-rule.
- Turning the Haiku-first flag ON requires BOTH: (a) an offline closed-book PASS on `evidence-absent` (the strata must DISCRIMINATE -- a non-saturated calibrator), AND (b) live shadow -> canary operational evidence on retrieval within a pre-committed tolerance of Sonnet. On a closed-book PASS ALONE the flag stays OFF, with retrieval as the NAMED pre-registered precondition for any future flip (EVAL-03 raise-to-user). OFF-by-default + pre-committed rollback throughout.

## Conditional follow-on (separately pre-registered; NOT in 19-04/19-05)

A clean offline model-driven retrieval gate (dev MCP scoped to the subagent + a pinned-lib BM25/lexical index + server-side date cutoff + a WebSearch-denied voter + a no-network-egress proof + a blind probe that ranked hits genuinely bury the refuter) is a CONDITIONAL follow-on, triggered ONLY IF: (a) the evidence-absent arm discriminates, (b) the owner explicitly signs off that a clean retrieval read is wanted given Phase-20-live cannot give it, AND (c) a `>=100`-doc leak-safe trap set proves feasible (the corpus collapse to median-5 may make this infeasible). Recorded so Phase-20 is never assumed to cover retrieval.

## Pre-registration integrity + process

- Lock the reframed strata + the k->1 reduction + the false-uphold-over-k rule + the buried-auto-drop + the VOID condition in the lock-rule/manifest in a ZERO-VOTES window BEFORE any calibrator vote (anti result-shopping). EVAL_THRESHOLDS / URL_DATE_RULE anti-drift tests stay byte-locked; re-prove the full eval suite green BEFORE the Task-4 Sonnet calibrator spend. Mutated/derived text stays gitignored (CC-BY-NC).
- Process: re-plan via gsd-planner + gsd-plan-checker (RE-PLAN-3) from this record. Tasks run 1->2->3->4 (pre-registration committed before any vote).

## Provenance

- Artifact review: `19-04-ARTIFACT-REVIEW.md` (C1/I1/I2/I3/I4).
- In-family panel + reconciliation: workflow results (gitignored transcript dirs).
- Capability consult (leak-safe offline MCP retrieval feasibility): `claude-code-guide` (doc-cited).
- Cross-family board (2 rounds to consensus): `eval/.cache/board/` (r1/r2 packets + per-model transcripts). Memory: [[phase19-ks-enrichment-date-sensitive]], [[copilot-cli-invocation-from-git-bash]].
