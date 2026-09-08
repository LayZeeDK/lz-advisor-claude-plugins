# 19-04 / 19-05 re-plan decision 2 (KS-enrichment + offline-construct-validity) -- 2026-06-17

**Status:** Resolved by an iterated BLIND cross-family panel (in-family Opus via native Agent + out-of-family
GPT-5.5 + Gemini-3.1-pro-preview via Copilot, ~40 AI Credits), plus direct verification of every load-bearing
claim against the live code + cached corpus. Round 1 independent + Round 2 anonymized cross-review reached
CONSENSUS (GPT high / Gemini high / Opus medium-high; Gemini revised its own R1 toward the consensus).
Supersedes the relevant parts of `19-04-REPLAN-DECISION.md` (the staged calibrator-first split still holds;
this layers the construct-validity corrections on top). This is the authoritative input for re-planning
19-04 + 19-05.

## Why re-plan AGAIN (the gap the prior re-plan inherited)

The prior re-plan reorganized 19-04/19-05 into a staged calibrator-first structure but never validated the
static-KS retrieval against the REAL cached corpus. Verified this session (direct reads of
`eval/.cache/chenxwh__AVeriTeC/`):

1. The raw dev KS docs are `{sentence, url}` with **ZERO `date` fields and ZERO `decisive`/`verdict`/
   `disconfirmer` flags**. The FROZEN `dateFilter` drops undated docs, so `staticKsAdapter` returns an EMPTY
   set for EVERY claim -> `searchAndStop` returns `min-not-met` everywhere -> the entire offline read is
   degenerate (ALL strata), not just date-sensitive. A KS-enrichment layer (dates + flags) was never tasked.
2. The `date-sensitive` stratum's STRONGER arm (post-cutoff-doc leakage) is **not constructible offline**:
   `staticKsAdapter` applies `dateFilter` BEFORE any voter sees a doc, so a post-cutoff "leak" is dropped
   identically for both seats -- neither can false-uphold from it. Offline, limb A collapses into
   evidence-absent and limb B into buried.
3. The measurement architecture was **under-specified**: it was not pinned down whether the scored
   `vote.verdict` is the MODEL's judgment over the date-filtered KS text or `searchAndStop`'s mechanical
   flag-driven verdict. (Verified: `searchAndStop`'s verdict vocabulary is `{judge-result, refuted-default,
   insufficient}`, which is NOT the persisted-vote enum `{unrefuted, refuted}`; the voter agent writes the
   vote; `countFalseUpholds` reads the model's verdict. So the model's verdict IS the scored value -- but
   this must be made explicit + test-guarded so a sloppy dispatch cannot conflate them.)

## Empirical ground truth (verified, for pre-registration)

- AVeriTeC dev: 500 claims, 122 Supported. ~180/500 claim dates have a single-digit day (the FROZEN
  `parseAvtDate` throws on them -> the SET-ASSEMBLY normalizer `normalizeClaimDate` zero-pads them; the parser
  stays frozen).
- URL_DATE_RULE robustness (strict path-only `/(19|20)\d{2}/(0[1-9]|1[0-2])/(0[1-9]|[12]\d|3[01])(/|$)/`,
  range-checked via the frozen `safeParse`): 4045/50000 docs (8.1%) get a date; 0.17% are archive-hosted (and
  the strict regex grabs the INNER publication date, skipping the `/web/<14-digits>/` wrapper timestamp); 0.00%
  implausibly-future. Wrong dates can only DROP (fail-closed), never leak.
- Populability under the strict rule + strict-before cutoff: **62/122** Supported seeds have >=5 strictly-
  pre-cutoff dated docs (median 5, p25 2). 62 is the conservative pool -- sufficient for two strata at the
  calibrator floor (>=3 each) and feasible for the Stage-2 band (~20-35 each from a ~31/stratum split). (The
  earlier "118/122" used a looser regex; the strict rule trades coverage for robustness, which the panel
  favored.)

## The converged design (the panel's consensus)

1. **Drop `date-sensitive` from the offline gate.** Run TWO offline strata: `buried` + `evidence-absent`.
   Migrate true date-sensitivity (and the qualifying seeds) to the Phase-20 LIVE-retrieval phase, where the
   model controls retrieval and can actually face a post-cutoff doc.
2. **Scoring-reconciliation precondition (do FIRST, pre-register, test-guard).** The scored quantity is the
   MODEL's free-text verdict over the date-filtered KS text; `searchAndStop`'s flag-driven mechanical verdict
   governs ONLY the trace + the mechanical minimums and NEVER overrides the recorded vote; the `decisive`/
   `disconfirmer` flags drive ONLY `searchAndStop`'s trace and `classifySeed`'s stratum assignment. A test
   fails if the dispatch records `searchAndStop`'s verdict instead of the model's. If this cannot hold ->
   offline read is structurally VOID -> defer to live (do NOT hand-skew flags to manufacture discrimination).
3. **KS-enrichment layer** (net-new, assembly-layer, frozen primitives untouched): `extractUrlDate(url)`
   (strict path-only); `normalizeClaimDate` (already drafted; apply to all ~180 single-digit claims);
   `enrichKsForClaim(ksDocs, {...})` attaching `date` to every doc + `decisive`/`disconfirmer`/`verdict` at
   the pre-registered ranks, returning NEW objects (shared-mutation guard). Keep the strict cutoff -- NO
   date-shifting / NO `claimDate-1` imputation (rejected by all three reviewers). Drop undated + same-day docs;
   report per-stratum attrition. Guarantee >=5 surviving pre-cutoff docs/seed (else `min-not-met` silently
   changes the trap).
4. **Content-grounded, BLIND flags** (not text-derivable): a competent out-of-the-gate judge confirms each
   `buried` decisive refuter genuinely refutes the MUTATED trap (and that `evidence-absent` seeds have NO
   pre-cutoff refuter), at lock time, from the trap-construction record -- NOT from vote-time observation, NOT
   LLM-stamped-without-adjudication. The decisive refuter + distractors must be textually plausible so a
   weaker model can GENUINELY mis-judge; the flags must not leak the label into the text the model reads.
5. **`evidence-absent` must include the original unmutated SUPPORTING documents as plausible text** (a genuine
   text-based temptation to false-uphold) -- not a forced flag.
6. **Pre-register + lock + hash before any vote**: the verbatim URL_DATE_RULE regex (byte-anti-drift test vs
   the manifest), the per-row decisive/disconfirmer rank assignment, the deterministic seed selection (all
   qualifying seeds by ascending claim_id), the scoring reconciliation, the >=5-survivor rule, the
   no-date-shift rule. Commit hash + ruleset; mutated/derived text stays in the gitignored cache (CC-BY-NC).

## Calibrator note

Keep the Sonnet calibrator + the D-06 saturation pre-condition. A read resting on a SINGLE discriminating
stratum is brittle (one mislabeled trap can flip it); prefer both strata to discriminate. If neither
discriminates after honest construction -> VOID + defer to live (the expected, acceptable outcome per the
Phase-18 precedent). Sonnet-default ships regardless.

## Already built -- do NOT rebuild

The offline-read decision driver (`calibratorGate`/`readDelta`/`resolveOutcome`/`persistVote`/`votePath`),
the trap recipe machinery (`mutateOverreach`/`classifySeed`/`validityGate`/`leakageProbe`/`writeTrap`/
`loadDevSeedsAndKs`), the search-and-stop spine + adapters + `dateFilter`/`parseAvtDate`/`safeParse`, the
frozen engine, and the two voter prompts all stay. The net-new build is: the KS-enrichment layer + the trap-set
assembler (2 strata) + the D-08 voter-dispatch Workflow. The Stage-1 assembler draft authored earlier this
session (`eval/lz-eval-trap-assembler.mjs`, with 3 strata + no enrichment) is SUPERSEDED and removed; it is
re-specified here and rebuilt during execution.

## Provenance

Panel transcripts: gitignored `eval/.cache/` (`oof-out-gpt55.txt`, `oof-out-gemini.txt`, `round2-packet.md`,
`r2-gpt55.txt`, `r2-gemini.txt`; Opus R1/R2 in the agent transcripts). Memory: [[phase19-ks-enrichment-date-sensitive]].
