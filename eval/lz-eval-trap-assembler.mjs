// lz-eval-trap-assembler.mjs
//
// The NET-NEW KS-ENRICHMENT layer + the SINGLE-STRATUM (evidence-absent) Stage-1 trap-set ASSEMBLER for
// the offline known-gold Haiku-vs-Sonnet gating read (Plan 19-04, Task 1; EVAL-01). It is the
// construct-validity-corrected Stage-1 replacement (19-04-REPLAN-DECISION-4, AMENDING -3 / -2): the raw
// AVeriTeC dev KS docs are {sentence, url} with ZERO date fields and ZERO decisive/disconfirmer/verdict
// flags, so the FROZEN dateFilter drops every doc and staticKsAdapter returns an EMPTY set for every
// claim -- the offline read is degenerate without enrichment. This module attaches real publication
// dates (extracted from the doc URL via a byte-locked strict path-only rule) so the BUILT search spine
// can run; for the SOLE offline arm (evidence-absent) NO decisive/disconfirmer/verdict flag is attached
// (the packet is the date-filtered ORIGINAL supporting docs -- resist-uphold-on-absence).
//
// ASSEMBLY-LAYER DISCIPLINE (load-bearing): the FROZEN primitives parseAvtDate / safeParse /
// dateFilter / staticKsAdapter / searchAndStop (eval/lz-eval-search-loop.mjs) and the BUILT recipe
// machinery mutateOverreach / validityGate / writeTrap / loadDevSeedsAndKs (eval/lz-eval-traps.mjs;
// classifySeed + BURIED_RANK_FLOOR are NO LONGER imported here -- buried is dropped, RE-PLAN-4 D-RP4-1)
// are IMPORTED and COMPOSED, never rewritten. ALL new logic (the dates only, for evidence-absent)
// lives here as an assembly layer over those primitives. The single-digit-day fix is the NEW
// normalizeClaimDate HERE -- the frozen parseAvtDate STILL throws on a single-digit day like
// '9-10-2020' (it is byte-unchanged); the normalizer zero-pads at the assembly layer so a seed dated
// 9-10-2020 becomes usable WITHOUT touching the parser.
//
// SCORING RECONCILIATION (T-19-19): for the SINGLE evidence-absent arm this layer attaches NO
// decisive/disconfirmer/verdict flag (the enrichment is dates-only -- enrichKsForClaim is called with
// decisiveRank=-1, disconfirmerRank=-1). The scored quantity is NEVER a layer-attached flag. The SCORED
// quantity is the MODEL voter's free-text vote.verdict over the date-filtered KS text (the D-08 dispatch
// Workflow, Task 2). searchAndStop's flag-driven verdict enum {judge-result,'refuted-default',
// 'insufficient'} is the TRACE + the mechanical minimums ONLY (the flag seam stays in enrichKsForClaim
// for shape parity, but the assembler never invokes it for evidence-absent).
//
// URL_DATE_RULE (byte-locked, pre-registered): the strict path-only RegExp
//   /(19|20)\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])(\/|$)/
// matches a /YYYY/MM/DD/ path segment, range-checked through the FROZEN safeParse (reformat to
// DD-MM-YYYY first). An archive-wrapped URL (web.archive.org/web/<14-digits>/<inner-url>) yields the
// INNER publication date because the 14-digit wrapper timestamp has no slash separators -- only the
// inner /YYYY/MM/DD/ segment matches. Fail closed: no match, an out-of-range date (e.g. /2020/02/30/),
// or an implausibly-future date -> null (DROP only, never leak). A wrong date can only DROP a doc; it
// can never let a post-cutoff doc leak a published verdict (T-19-13).
//
// STRICT CUTOFF (no date-shift): undated + same-day (== claimDate) docs are DROPPED by the strict `<`
// in the frozen dateFilter. NO date-shifting / NO claimDate-1 imputation (rejected by all three
// reviewers; 19-04-REPLAN-DECISION-2 item 3).
//
// ONE STRATUM ONLY (evidence-absent): buried is DROPPED ENTIRELY from the offline gate and date-sensitive
// is DEFERRED, both to the Phase-20 live shadow (19-04-REPLAN-DECISION-4, UNANIMOUS board OPTION A).
//   - WHY BURIED IS DROPPED (D-RP4-1, construct-invalid offline): `buried` is NOT validly + leak-safely
//     constructible offline. The synthetic disconfirmer=true flag on an arbitrary deep surviving doc is
//     TEXT-UNVERIFIED -- the doc's text almost never refutes the SPECIFIC mutated overreach, so a blind
//     probe would reject most synthetic-buried. It measures "is the voter fooled by a label with no real
//     refuting evidence" -- a FAKE construct. Deep-refuter detection is retrieval-adjacent /
//     context-attention, already deferred to the Phase-20 live shadow.
//   - THE COUNT-VS-RANK PREDICATE ERROR (D-RP4-2, the principled basis for the amendment): the RE-PLAN-3
//     `isBuried = (INDEX of the deepest surviving doc in the 0..99 KS list >= BURIED_RANK_FLOOR=20)`
//     policy conflated survivor COUNT (median 5) with survivor RANK/position (0..99). The ~8.6% dated
//     survivors scatter across positions 0..99 so the DEEPEST survivor index is almost always >= 20
//     (measured 97/97/96/80/76) -> ALL 62 qualifying seeds classified `buried`, ZERO `evidence-absent`
//     -> the assembler hard-threw on the PRIMARY floor and the calibrator could not run. The prior
//     pre-registration's "rank-20 burial is impossible at median-5" claim is empirically FALSE. This is
//     the SECOND construct defect on this instrument (C1 -- the dispatch object/text return -- was first).
//   - date-sensitive remains DEFERRED to Phase-20 live (its post-cutoff-leak arm is unobservable offline:
//     staticKsAdapter applies dateFilter BEFORE any voter sees a doc, so a post-cutoff "leak" is dropped
//     identically for both seats; 19-04-REPLAN-DECISION-2 item 1).
//
// CONSTRUCT-SCOPE BOUNDARY (19-04-REPLAN-DECISION-3/-4): the offline gate measures CLOSED-BOOK JUDGMENT
// (resist-uphold-on-absence -- the SOLE arm, the one genuinely-new failure mode vs the saturated Phase-18
// subtle arm), NOT retrieval orchestration. The frozen staticKsAdapter ignores the query, so a model
// cannot drive query-formulation through this seam -- retrieval (query formulation / search depth /
// premature-stop) is NOT cleanly + leak-safely measurable offline and DEFERS to the Phase-20 LIVE
// operational shadow (alongside buried + date-sensitive). A closed-book PASS NEVER certifies retrieval.
//
// EVIDENCE-ABSENT IS THE SOLE ARM (19-04-REPLAN-DECISION-4 board OPTION A): ALL qualifying Supported
// seeds (>= minSurvivors strictly-pre-cutoff survivors, ascending claim_id) become `evidence-absent`:
// enrichKsForClaim with NO decisive/disconfirmer flag (decisiveRank=-1, disconfirmerRank=-1); the packet
// is the date-filtered ORIGINAL supporting docs (plausible supporting text, no in-corpus refuter -- a
// genuine text temptation to false-uphold). There is NO `buried` stratum and NO `isBuried` /
// deepest-survivor-index policy. The single evidence-absent floor (>= perStratumFloor) is the only
// per-stratum floor; below the floor AFTER the gold-blind probe drops invalid packets = a documented
// VOID signal (the corpus cannot honestly build the PRIMARY arm), NOT a knob to relax.
//
// FAIL-CLOSED FLOORS: a seed with fewer than minSurvivors (5) strictly-pre-cutoff dated surviving docs
// is EXCLUDED (else min-not-met silently changes the trap; the EXACTLY-5-survivor inclusive boundary
// KEEPS the seed -- the floor is `< minSurvivors`, not `<=`); the SINGLE evidence-absent stratum with
// fewer than perStratumFloor (3) RETAINED surviving claims FAILS CLOSED (so nPooled >= reliableTrials=15
// at k=5) -- the retained count is the POST-PROBE survivor count, so a below-floor retained set after the
// gold-blind probe drops is the documented VOID condition (board guardrail 5: the floor is load-bearing).
//
// VALIDITY SCREENING (two screens): every trap is screened by SCREEN 1 validityGate (the
// deliberately-weak-verifier flip -- a too-easy trap the weak verifier already catches is rejected) PLUS
// SCREEN 2 the injected GOLD-BLIND entailment probe(s) (the mandatory mitigation, load-bearing --
// FATAL if omitted; board guardrails 1+2+4+6). The probe is a GOLD-BLIND model judge (NO AVeriTeC label,
// NO mutation knowledge) that reads ONLY the date-filtered surviving SUPPORTING docs + the mutated
// OVERREACH claim and answers: "do these docs explicitly state OR directly entail the one-step OVERREACH,
// or only the weaker ORIGINAL Supported claim?". It DISQUALIFIES (drops; the drop is REPORTED in
// attrition.probeDropped, never silently absorbed) any packet where the survivors plausibly entail/license
// the overreach (there `unrefuted` is a legitimate read and gold=refuted is indefensible -- the same
// defect that killed buried). It RETAINS as valid gold=refuted ONLY packets whose survivors support the
// ORIGINAL claim but do NOT entail the overreach (the overreach is unsupported-by-the-packet, not
// contradicted -- exactly resist-uphold-on-absence). The probe runs BEFORE any verify-vote and is
// gold-blind so it does not bootstrap the gold it validates. The flags (absent for evidence-absent) are
// NOT text-derivable -- they do not leak the gold label into the doc text the model reads.
//
// RE-PLAN-5 MULTI-PROBE ALL-AGREE-RETAIN CONSENSUS (Finding 2 -- the OUT-OF-FAMILY second probe is the
// single highest-leverage de-confounder; board r1-synthesis Critical-Finding-2). The in-family gold-blind
// probe is SAME-FAMILY with the voter (Opus GENERATEs, Opus PROBEs, Sonnet VOTES) and was DEMONSTRABLY
// TOO LENIENT -- PROVEN on the committed pilot seed 75 (overreach "income DOUBLED"; survivor #3
// "$200K -> millions" EXCEEDS 2x, so the survivors plausibly ENTAIL "doubled"; the in-family probe
// RETAINED it ONLY by a strict-literal "no explicit 2x ratio" reading; a Sonnet voter reading it loosely
// would CORRECTLY vote unrefuted -> a FAKE false-uphold, the T-19-17 defect). MANDATORY: a SECOND,
// OUT-OF-FAMILY gold-blind probe pass (GPT-5.5 + Gemini via the copilot CLI, brokered at run time, Task 4).
// The assembler now consumes an injected `probes` ARRAY of gold-blind judges, each with the signature
// `await probe({ trap, enrichedKs, stratum, expectedEntailment }) -> { accepted, reason, entails }`. A
// packet is RETAINED only if EVERY probe agrees the entailment matches `expectedEntailment` ('false' for
// a refuted-gold TRAP -- the survivors must NOT entail the overreach; 'true' for an unrefuted-gold
// POSITIVE CONTROL -- the survivors MUST entail the original claim). ANY split (the first probe that
// disagrees) DISQUALIFIES the packet -- counted in attrition.probeDropped AND a NET-NEW
// attrition.probeSplitDropped (the split-drop count, distinct from a unanimous reject). BACK-COMPAT: when
// `probes` is absent but the CARRIED single `validityProbe` is injected, it is wrapped as a one-element
// consensus (consensus-over-one == that one judge), so every RE-PLAN-4 test passes UNCHANGED. A probe stub
// that returns no `entails` field (the RE-PLAN-4 accept/reject-only stub) is treated as
// entails-matching-the-expectation on accepted:true (back-compat).
//
// RE-PLAN-5 INTERLEAVED POSITIVE CONTROLS (Finding 1 -- a 0-false-uphold result is CONFOUNDED without them;
// board r1-synthesis Critical-Finding-1). With EVERY retained trap gold=refuted, "Sonnet saturates" is
// observationally identical to a DEGENERATE ALWAYS-REFUTE prior (a voter that refutes everything on thin
// evidence scores a perfect 0 for the WRONG reason and measures nothing). The assembler interleaves
// gold=unrefuted POSITIVE CONTROLS -- native UNMUTATED Supported seeds (NO mutateOverreach; the claim is
// the ORIGINAL Supported claim, gold=unrefuted by construction) whose date-filtered survivors GENUINELY
// ENTAIL the claim (ALL probes agree entails=true -- the inverse of the trap screen). The voter SHOULD
// vote unrefuted on these; if Sonnet REFUTES them too the saturation read is an always-refute artifact
// (VOID/uninterpretable, NOT PASS -- scored downstream by scorePositiveControls). Controls are returned
// under a SEPARATE `positive-control` strata key with their OWN floor (positiveControlFloor, default 3),
// carry NO overreach recipe (native), and set goldLabels[uid]='unrefuted'. The trap arm and the control
// arm have TWO INDEPENDENT floors (both load-bearing; below either = a documented VOID, never tuned).
// OUT-OF-FAMILY GENERATE is DEFERRED (board guardrail 7): generation is gold-aware and inspection already
// found real one-step overreaches; the bigger same-family risk is the PROBE, which IS moved out-of-family.
//
// RECIPE-NOT-TEXT (D-07): the mutated CC-BY-NC prose + the enriched KS are written via writeTrap to
// the gitignored eval/.cache/ ONLY; the returned row carries uid + stratum + recipe + sha256, NEVER a
// `text` field. No NC corpus text is ever committed.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ tree, NEVER in the
// distributed plugin tree. It imports the FROZEN spine + the BUILT recipe machinery WITHIN the eval
// tree, and the SHIPPED runtime aggregator's ContractError ACROSS trees by relative path --
// ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval). zero npm deps.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md). The thin CLI
// is guarded so that importing this module does NOT run it.

import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Cross-tree reuse of the SHIPPED runtime aggregator's ContractError (D-10; eval -> runtime,
// one-directional, never the reverse).
import {
  ContractError,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// The FROZEN date primitives (DO NOT EDIT): safeParse range-checks a DD-MM-YYYY string (never throws,
// returns null on garbage / out-of-range); dateFilter drops undated OR >= claimDate (strict `<`);
// parseAvtDate THROWS on a single-digit day. The enrichment layer routes through safeParse and never
// rewrites any of them.
import { safeParse, dateFilter, parseAvtDate } from './lz-eval-search-loop.mjs';

// The BUILT recipe machinery (CONSUMED, never rewritten): mutateOverreach records the gold->refuted
// recipe; writeTrap writes the mutated prose to the cache and returns the recipe-not-text row;
// loadDevSeedsAndKs loads the dev seeds + KS from the gitignored cache. classifySeed + BURIED_RANK_FLOOR
// are NO LONGER imported here (RE-PLAN-4, D-RP4-1): buried is DROPPED -- there is no stratum to classify
// and no survivor-rank policy. There is ONE stratum (evidence-absent); every qualifying seed is it.
// classifySeed + BURIED_RANK_FLOOR are UNCHANGED in lz-eval-traps.mjs (the built recipe machinery keeps
// them); they are simply unused by this module.
import {
  mutateOverreach,
  validityGate,
  writeTrap,
  loadDevSeedsAndKs,
} from './lz-eval-traps.mjs';

// ---------------------------------------------------------------------------
// URL_DATE_RULE (byte-locked, pre-registered; the manifest carries this EXACT source string and the
// aggregate anti-drift test asserts manifest-string === URL_DATE_RULE.source). The strict path-only
// rule matches a /YYYY/MM/DD/ (or /YYYY/MM/DD end-of-string) path segment with a range-bounded month
// (01-12) + day (01-31). The 14-digit archive wrapper timestamp has NO slash separators, so only the
// INNER publication date matches. The range bound is a CHEAP first cut; the AUTHORITATIVE range check
// is the frozen safeParse round-trip (it rejects e.g. /2020/02/30/, which the regex shape admits).
// ---------------------------------------------------------------------------
export const URL_DATE_RULE = /(19|20)\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])(\/|$)/;

// ---------------------------------------------------------------------------
// extractUrlDate(url): apply the byte-locked URL_DATE_RULE to the URL, range-check the captured
// Y-M-D through the FROZEN safeParse (reformat to DD-MM-YYYY first), and return the Date or null.
//   - archive-wrapped URL -> the INNER publication date (the wrapper 14-digit timestamp has no slashes)
//   - no path date / out-of-range (e.g. Feb 30) / implausibly-future -> null (fail closed, DROP only)
// FUTURE GUARD: a date strictly after "now" (real-world impossible for a published doc in this corpus)
// returns null. This is defense-in-depth; the empirical ground truth recorded 0.00% implausibly-future
// under this rule, so the guard never fires on the real corpus -- it only fails closed on a synthetic
// future-dated URL. A wrong date can ONLY drop a doc, never leak a post-cutoff one.
// ---------------------------------------------------------------------------
export function extractUrlDate(url) {
  if (typeof url !== 'string' || url.length === 0) {
    return null;
  }

  const m = URL_DATE_RULE.exec(url);

  if (m == null) {
    return null;
  }

  // m[0] is "YYYY/MM/DD/" or "YYYY/MM/DD"; m[1] is the 19|20 century prefix of the year. Recover the
  // full year/month/day from the matched segment.
  const seg = m[0].replace(/\/+$/, ''); // strip a trailing slash from the match
  const parts = seg.split('/');
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];

  // Reformat to the frozen DD-MM-YYYY shape safeParse expects, then route through the AUTHORITATIVE
  // range check (safeParse rejects a shape-valid but non-real date like Feb 30 -> null).
  const candidate = day + '-' + month + '-' + year;
  const parsed = safeParse(candidate);

  if (parsed == null) {
    return null;
  }

  // FUTURE GUARD (fail closed): a published doc cannot be dated in the future. Drop only.
  const now = new Date();

  if (parsed.getTime() > now.getTime()) {
    return null;
  }

  return parsed;
}

// ---------------------------------------------------------------------------
// normalizeClaimDate(raw): the SET-ASSEMBLY-layer single-digit-day fix (19-03-SUMMARY carry-forward).
// The frozen parseAvtDate requires two-digit DD-MM and THROWS on a single-digit day (e.g. '9-10-2020').
// ~180/500 AVeriTeC dev claim dates have a single-digit day, so without this normalizer those seeds
// are unusable. Zero-pad a single-digit day (and single-digit month) to the two-digit DD-MM-YYYY shape
// and return the normalized string; an unsalvageable date returns null so the caller SKIPS the seed.
// CRITICAL: this lives ONLY here -- parseAvtDate + safeParse stay FROZEN. The normalized output is then
// validated through safeParse (a real-date round-trip), so a normalized-but-not-real date (e.g.
// 9-13-2020 -> 09-13-2020, month 13) returns null rather than a parseAvtDate throw downstream.
// ---------------------------------------------------------------------------
export function normalizeClaimDate(raw) {
  if (raw == null) {
    return null;
  }

  const m = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(String(raw).trim());

  if (m == null) {
    return null;
  }

  const day = m[1].padStart(2, '0');
  const month = m[2].padStart(2, '0');
  const year = m[3];
  const normalized = day + '-' + month + '-' + year;

  // Validate the normalized shape is a REAL calendar date via the frozen safeParse round-trip. A
  // normalized-but-out-of-range date (e.g. month 13, day 32) returns null so the seed is skipped --
  // never a downstream parseAvtDate throw.
  if (safeParse(normalized) == null) {
    return null;
  }

  return normalized;
}

// ---------------------------------------------------------------------------
// toDocDateString(date): format a Date as the FROZEN DD-MM-YYYY doc-date string the frozen safeParse /
// dateFilter consume. enrichKsForClaim attaches doc.date as THIS STRING (not a Date object) because the
// frozen dateFilter calls safeParse(doc.date), and safeParse parses ONLY the DD-MM-YYYY string shape --
// a Date object would be String()-coerced to an ISO-ish form safeParse rejects (it would silently drop
// EVERY enriched doc). Returns null for a null date (-> doc.date:null -> dropped, fail closed).
function toDocDateString(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }

  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getUTCFullYear());

  return dd + '-' + mm + '-' + yyyy;
}

// enrichKsForClaim(ksDocs, { decisiveRank, disconfirmerRank, verdict }): return a NEW array of NEW doc
// objects (the SHARED-MUTATION guard -- never mutate the input KS). Every returned doc gets
// date: the DD-MM-YYYY string extracted from doc.url (so the frozen dateFilter + staticKsAdapter can
// run -- they safeParse doc.date as a DD-MM-YYYY string); the decisive/disconfirmer/verdict flags are
// attached ONLY at the pre-registered ranks (so searchAndStop's trace + classifySeed operate over real
// flags). A doc whose URL yields no date gets date:null and is therefore DROPPED by the frozen
// dateFilter.
//
// THE FLAGS ARE NOT TEXT-DERIVABLE (no label leak): they live on the doc object's flag fields, NOT in
// doc.sentence. The model reads doc.sentence; the flags drive only the mechanical spine. decisiveRank
// (a doc that decisively refutes the trap) and disconfirmerRank (the buried disconfirmer) default to
// -1 (no flag attached). When both arms point at the same rank (a buried decisive refuter), both flags
// are attached to that one doc.
// ---------------------------------------------------------------------------
export function enrichKsForClaim(ksDocs, { decisiveRank = -1, disconfirmerRank = -1, verdict = 'refuted' } = {}) {
  if (!Array.isArray(ksDocs)) {
    throw new ContractError('enrichKsForClaim requires a ksDocs array', 'enrichKsForClaim');
  }

  return ksDocs.map((doc, i) => {
    const src = doc == null || typeof doc !== 'object' ? {} : doc;
    // NEW object (shared-mutation guard): spread the source fields, then attach the date + flags. The
    // input doc is never mutated. doc.date is the DD-MM-YYYY STRING (not a Date) the frozen dateFilter /
    // safeParse consume; a no-date URL yields date:null (-> dropped by the frozen filter).
    const out = { ...src };
    out.date = toDocDateString(extractUrlDate(src.url));

    if (i === decisiveRank && decisiveRank >= 0) {
      out.decisive = true;
      out.verdict = verdict;
    }

    if (i === disconfirmerRank && disconfirmerRank >= 0) {
      out.disconfirmer = true;
    }

    return out;
  });
}

// ---------------------------------------------------------------------------
// runProbeConsensus(probes, { trap, enrichedKs, stratum, decisiveRank, expectedEntailment }):
// the RE-PLAN-5 ALL-AGREE-RETAIN consensus over an ARRAY of gold-blind judges (Finding 2). Each probe is
// `await probe({ trap, enrichedKs, stratum, expectedEntailment }) -> { accepted, reason, entails }`. The
// packet is RETAINED only if EVERY probe agrees: a probe AGREES when it returns accepted:true AND (its
// `entails` field, when present, matches `expectedEntailment`). The FIRST disagreeing probe (a SPLIT)
// short-circuits a drop. BACK-COMPAT: a probe stub that returns no `entails` field (the RE-PLAN-4
// accept/reject-only stub) is treated as entails-matching on accepted:true, so the carried single-probe
// stubs still drive the consensus unchanged. Returns { retained:boolean, split:boolean, splitProbeIndex,
// reason }: split=true means a probe returned accepted:true but entails did NOT match the expectation (a
// genuine inter-judge disagreement), distinct from a unanimous-style accepted:false reject (split=false).
// EVERY probe receives ONLY the date-filtered survivors (enrichedKs -- closed-book mirroring, C-RP4-1).
// ---------------------------------------------------------------------------
export async function runProbeConsensus(probes, { trap, enrichedKs, stratum, decisiveRank, expectedEntailment }) {
  for (let i = 0; i < probes.length; i += 1) {
    const probe = probes[i];
    const verdict = await probe({ trap, enrichedKs, stratum, decisiveRank, expectedEntailment });

    if (verdict == null || verdict.accepted !== true) {
      // A unanimous-style reject (the probe declines to retain) -- NOT an inter-judge split.
      return {
        retained: false,
        split: false,
        splitProbeIndex: i,
        reason: (verdict && verdict.reason) || 'probe-rejected',
      };
    }

    // When a probe reports its `entails` read, it MUST match the expectation. A mismatch is a SPLIT (the
    // probe accepted overall but disagrees on entailment -- a genuine inter-judge disagreement, e.g. the
    // OOF probe reading seed-75's survivors as entailing the overreach). A probe with NO `entails` field
    // (the RE-PLAN-4 stub) is treated as entails-matching on accepted:true (back-compat).
    if (verdict.entails !== undefined && String(verdict.entails) !== String(expectedEntailment)) {
      return {
        retained: false,
        split: true,
        splitProbeIndex: i,
        reason: (verdict && verdict.reason) || 'probe-split (entails != expectation)',
      };
    }
  }

  return { retained: true, split: false, splitProbeIndex: -1, reason: 'all-probes-agree' };
}

// ---------------------------------------------------------------------------
// assembleStage1Traps({ cacheRoot, generate, validityProbe, probes, cacheDir, perStratumFloor=3,
//   positiveControlFloor=3, minSurvivors=5, weakVerifier }): the deterministic Stage-1 assembler. RE-PLAN-5
//   carries a refuted-trap arm (evidence-absent, RE-PLAN-4 OPTION A -- buried dropped, D-RP4-1) AND adds
//   an interleaved gold=unrefuted POSITIVE-CONTROL arm (Finding 1), both screened by a MULTI-PROBE
//   ALL-AGREE-RETAIN consensus (Finding 2).
//
//   - generate(seedClaim, recipe) -> Promise<string>: the INJECTED async generator that produces the
//     mutated trap prose. An Opus-subagent generator is acceptable at Stage 1 (only Sonnet runs the
//     calibrator; out-of-family generate is DEFERRED -- board guardrail 7).
//   - probes: an ARRAY of INJECTED GOLD-BLIND entailment judges (in-family Opus + GPT-5.5 + Gemini --
//     Finding 2). Each `await probe({ trap, enrichedKs, stratum, expectedEntailment }) ->
//     { accepted, reason, entails }`. ALL-AGREE-RETAIN: a packet is RETAINED only if EVERY probe agrees
//     the entailment matches the expectation ('false' for a refuted-gold TRAP, 'true' for an
//     unrefuted-gold POSITIVE CONTROL); ANY split DISQUALIFIES (drop, counted in probeDropped +
//     probeSplitDropped). Each probe sees ONLY the date-filtered survivors (closed-book mirroring,
//     C-RP4-1).
//   - validityProbe({ trap, enrichedKs, stratum, decisiveRank }) -> Promise<{ accepted, reason }>: the
//     CARRIED single GOLD-BLIND entailment probe (RE-PLAN-4). BACK-COMPAT: when `probes` is absent, this
//     single probe is wrapped as a one-element consensus (consensus-over-one == that one judge). The drop
//     count is REPORTED in attrition.probeDropped (board guardrail 4), never silently absorbed.
//   - weakVerifier({ trap, enrichedKs }) -> 'unrefuted' | 'refuted': the INJECTED deliberately-weak
//     reference verifier whose FLIP validityGate screens on (default: always upholds -- the unit suite
//     injects discriminating stubs). Applied to the refuted-trap arm only (SCREEN 1).
//
// DETERMINISTIC seed selection: ALL qualifying Supported seeds by ASCENDING claim_id. The seeds are
// PARTITIONED -- the FIRST contiguous run becomes refuted TRAPS, the remaining qualifying seeds become
// native POSITIVE CONTROLS (a seed used as a trap is NEVER reused as a control). For each TRAP candidate:
// normalizeClaimDate (skip on null); enrich (dates only) + dateFilter to the strictly-pre-cutoff
// survivors; EXCLUDE if fewer than minSurvivors survive; mutateOverreach to record the recipe; generate
// the mutated prose; SCREEN 1 validityGate (weak-verifier flip) THEN SCREEN 2 the MULTI-PROBE consensus
// with expectedEntailment='false'; writeTrap cache-only. For each POSITIVE-CONTROL candidate: the SAME
// date enrichment + dateFilter + >=minSurvivors floor; NO mutateOverreach (the claim is the ORIGINAL
// Supported claim -- gold=unrefuted); SCREEN 2 the SAME consensus with expectedEntailment='true' (the
// survivors MUST entail the original claim); writeTrap cache-only with stratum='positive-control' + NO
// overreach recipe. Every trap is `evidence-absent` (decisiveRank=-1; the packet = the date-filtered
// ORIGINAL supporting docs). There is NO buried stratum and NO date-sensitive stratum offline.
//
// Returns { strata: { 'evidence-absent':[row], 'positive-control':[row] }, goldLabels:{uid->'refuted'|
//   'unrefuted'}, attrition:{ scanned, skippedNoDate, skippedFewSurvivors, screenedOut, probeDropped,
//   probeSplitDropped, perStratumCount, retainedBelowFloor, voidReason, controlScanned,
//   controlSkippedNoDate, controlSkippedFewSurvivors, controlProbeDropped, controlBelowFloor },
//   runConfig:{ minSurvivors, perStratumFloor, positiveControlFloor } }. attrition.probeDropped is the
// number of TRAP packets the multi-probe consensus disqualified (SCREEN 2); attrition.probeSplitDropped
// is the subset of those that were dropped by an inter-judge SPLIT (a probe accepted but disagreed on
// entailment), distinct from a unanimous-style reject. The TWO floors are INDEPENDENT: the evidence-absent
// TRAP floor (>= perStratumFloor over the post-consensus trap set) THROWS /perStratumFloor/ naming
// evidence-absent on a below-floor set (the documented VOID-on-trap-floor; board guardrail 5); the
// positive-control floor (>= positiveControlFloor over the post-consensus control set) THROWS
// /positiveControlFloor/ naming positive-control on a below-floor set (the documented
// VOID-on-control-floor -- the read cannot prove the voter can uphold). NEITHER floor is ever tuned
// toward a desired N (result-shopping).
// ---------------------------------------------------------------------------
export async function assembleStage1Traps({
  cacheRoot,
  generate,
  validityProbe,
  probes,
  inFamilyAnnotationProbe,
  subjectDifficultyProbe,
  subjectDifficultyMaxCatchRate = 0.5,
  covariateOverlapTolerance = 0.5,
  clusterIndependence = false,
  cacheDir,
  perStratumFloor = 3,
  positiveControlFloor = 3,
  nControls = 0,
  minSurvivors = 5,
  weakVerifier,
} = {}) {
  if (typeof cacheRoot !== 'string' || cacheRoot.length === 0) {
    throw new ContractError('assembleStage1Traps requires a cacheRoot (gitignored eval/.cache/ corpus)', 'assembleStage1Traps');
  }

  if (typeof cacheDir !== 'string' || cacheDir.length === 0) {
    throw new ContractError('assembleStage1Traps requires a cacheDir (gitignored eval/.cache/ output)', 'assembleStage1Traps');
  }

  if (typeof generate !== 'function') {
    throw new ContractError('assembleStage1Traps requires an injected async generate(seedClaim, recipe)', 'assembleStage1Traps');
  }

  // RE-PLAN-5: SCREEN 2 is a MULTI-PROBE ALL-AGREE-RETAIN consensus (Finding 2). The caller injects a
  // `probes` ARRAY of gold-blind judges (in-family Opus + GPT-5.5 + Gemini). BACK-COMPAT: if `probes` is
  // absent but the CARRIED single `validityProbe` is injected, wrap it as a one-element consensus
  // (consensus-over-one == that one judge) so every RE-PLAN-4 test passes UNCHANGED.
  const PROBES = Array.isArray(probes) && probes.length > 0
    ? probes
    : typeof validityProbe === 'function'
      ? [validityProbe]
      : null;

  if (PROBES == null || PROBES.some((p) => typeof p !== 'function')) {
    throw new ContractError(
      'assembleStage1Traps requires an injected `probes` array of gold-blind judges (or a single validityProbe for back-compat)',
      'assembleStage1Traps',
    );
  }

  // The weak verifier defaults to "always upholds" (always FLIPS on a refuted-gold trap -> validityGate
  // accepts). The unit suite injects discriminating stubs (a verifier that catches a trap -> rejected).
  const weak = typeof weakVerifier === 'function' ? weakVerifier : () => 'unrefuted';

  // RE-PLAN-7 #3/F3 (OUT-OF-FAMILY-ONLY retain predicate): the injected `probes` array is the OUT-OF-FAMILY
  // retain decider (GPT-5.5 + Gemini). The OPTIONAL `inFamilyAnnotationProbe` is run per packet for the run
  // artifact ANNOTATION ONLY -- it is NEVER added to runProbeConsensus's AND (it does NOT gate). F3 framing
  // correction (recorded): dropping the in-family conjunct LOOSENS the all-agree AND -> retains MORE ->
  // higher N + purer (family-independent) gold; the 'drop Opus = lower N' framing was backwards. The
  // OOF-vs-in-family agreement count is recorded in attrition (a diagnostic, never a gate).
  const inFamilyAnnotate = typeof inFamilyAnnotationProbe === 'function' ? inFamilyAnnotationProbe : null;

  const { seeds, ksByClaim } = loadDevSeedsAndKs(cacheRoot);

  // ASCENDING claim_id, Supported only (deterministic seed selection -- anti result-shopping).
  const supported = seeds
    .filter((s) => s != null && s.label === 'Supported')
    .sort((a, b) => a.claim_id - b.claim_id);

  // RE-PLAN-5 SEED PARTITION (Finding 1): the qualifying Supported seeds are split into a refuted-TRAP
  // arm and a native POSITIVE-CONTROL arm so a seed used as a trap is NEVER reused as a control. The LAST
  // `nControls` qualifying seeds (the tail, ascending claim_id) are reserved as POSITIVE-CONTROL
  // candidates; the leading run feeds the refuted-trap arm. nControls defaults to 0 (the trap-only path:
  // no controls assembled, the control floor is not enforced -- back-compat with the RE-PLAN-4 tests).
  // The partition is recorded in runConfig (deterministic, anti result-shopping); both the trap count and
  // nControls are chosen at call time (Task 4 passes them), never tuned after a vote.
  const N_CONTROLS = Number.isInteger(nControls) && nControls > 0 ? nControls : 0;
  const controlSeeds = N_CONTROLS > 0 ? supported.slice(Math.max(0, supported.length - N_CONTROLS)) : [];
  const controlSeedIds = new Set(controlSeeds.map((s) => s.claim_id));
  const trapSeeds = supported.filter((s) => !controlSeedIds.has(s.claim_id));

  // TWO arms (RE-PLAN-5): evidence-absent is the refuted-trap arm; positive-control is the interleaved
  // gold=unrefuted arm. No buried key (D-RP4-1). date-sensitive deferred (Phase-20).
  const strata = { 'evidence-absent': [], 'positive-control': [] };
  const goldLabels = {};
  const attrition = {
    scanned: 0,
    skippedNoDate: 0,
    skippedFewSurvivors: 0,
    // screenedOut counts BOTH SCREEN-1 (validityGate flip) + SCREEN-2 (multi-probe consensus) drops.
    screenedOut: 0,
    // probeDropped is the dedicated SCREEN-2 multi-probe consensus drop count over the TRAP arm (board
    // guardrail 4: the probe's disqualifications are REPORTED, distinct from the SCREEN-1 rejections).
    probeDropped: 0,
    // probeSplitDropped (RE-PLAN-5 Finding 2): the subset of probeDropped caused by an inter-judge SPLIT
    // (a probe accepted overall but disagreed on entailment), distinct from a unanimous-style reject. The
    // OOF probe disagreeing with the in-family probe (e.g. seed-75-class) lands here.
    probeSplitDropped: 0,
    perStratumCount: { 'evidence-absent': 0, 'positive-control': 0 },
    // The documented VOID signal (board guardrail 5): set when the RETAINED (post-consensus) evidence-absent
    // TRAP set falls below perStratumFloor. The assembler THROWS in that case (the corpus cannot honestly
    // build the PRIMARY arm), but these fields are populated on the attrition the throw carries so the
    // realized probeDropped count + the VOID reason are reported, never silently absorbed.
    retainedBelowFloor: false,
    voidReason: null,
    // RE-PLAN-5 positive-control attrition + the SEPARATE control floor (Finding 1): controlScanned /
    // controlSkippedNoDate / controlSkippedFewSurvivors / controlProbeDropped account the control arm;
    // controlBelowFloor is the documented VOID-on-control-floor flag (set on the THROW).
    controlScanned: 0,
    controlSkippedNoDate: 0,
    controlSkippedFewSurvivors: 0,
    controlProbeDropped: 0,
    controlBelowFloor: false,
    // RE-PLAN-7 #3/F3: the OUT-OF-FAMILY-vs-in-family agreement count (a DIAGNOSTIC, never a gate). The
    // in-family annotation probe (if injected) is run per packet but does NOT enter the retain AND.
    inFamilyAgreement: 0,
    // RE-PLAN-7 F6: the count of retained sub-claims collapsed because their source/seed cluster already
    // had a retained primary claim (one per cluster -- the per-claim CP denominator is not anti-conservative).
    clusterCollapsed: 0,
    // RE-PLAN-7 F5 floor flags: difficultyFloorMet (the held-out Claude reference did NOT ace the retained
    // traps) + covariateOverlapMet (the trap/control covariate distributions overlap within tolerance).
    // Both default true; a failed floor sets the flag false + a voidReason and surfaces a documented VOID.
    difficultyFloorMet: true,
    covariateOverlapMet: true,
  };

  // RE-PLAN-7 F6: the source/seed clusters already holding a retained primary claim (one per cluster when
  // clusterIndependence is on). The cluster key is seed.cluster when present, else the seed claim_id.
  const seenClusters = new Set();
  // RE-PLAN-7 F5: the retained seed records (trap + control) so the subjectDifficultyProbe + the
  // covariate-overlap check run over the EXACT retained set (the same survivors the voter judges).
  const retainedTrapRecords = [];
  const retainedControlRecords = [];

  // RE-PLAN-7 F6: the source/seed cluster key. AVeriTeC seeds derived from the SAME fact-check share a
  // source URL (cached_original_claim_url / original_claim_url) -- those sub-claims are positively
  // correlated, so one primary claim per source cluster is retained. Order: an explicit seed.cluster
  // (tests / future tagging), else the source URL, else the claim_id (a singleton cluster).
  const clusterKeyFor = (seed) => {
    if (seed == null) {
      return 'cid-undefined';
    }

    if (seed.cluster != null) {
      return 'cl-' + String(seed.cluster);
    }

    const src = seed.cached_original_claim_url || seed.original_claim_url || seed.fact_checking_article;

    if (typeof src === 'string' && src.length > 0) {
      return 'src-' + src;
    }

    return 'cid-' + String(seed.claim_id);
  };

  // A deterministic recipe-seed counter (the recipe { transform, seed } must carry an integer seed).
  let recipeSeed = 0;
  const TRANSFORMS = ['scope', 'causation', 'magnitude', 'certainty'];

  // ===== REFUTED-TRAP ARM (evidence-absent) =====
  for (const seed of trapSeeds) {
    attrition.scanned += 1;

    // The SET-ASSEMBLY normalizer (single-digit day). Skip a seed whose date is unsalvageable.
    const normalized = normalizeClaimDate(seed.claim_date);

    if (normalized == null) {
      attrition.skippedNoDate += 1;
      continue;
    }

    const claimDate = parseAvtDate(normalized); // the frozen parser, fed a normalized two-digit date
    const rawKs = Array.isArray(ksByClaim[seed.claim_id]) ? ksByClaim[seed.claim_id] : [];

    // ENRICH (dates only -- evidence-absent attaches NO decisive/disconfirmer flag). decisiveRank=-1 +
    // disconfirmerRank=-1 are the enrichKsForClaim defaults, so the packet is the date-filtered ORIGINAL
    // supporting docs (plausible supporting text, no in-corpus refuter -- resist-uphold-on-absence).
    const datedKs = enrichKsForClaim(rawKs, {});
    const survivors = dateFilter(datedKs, claimDate);

    // FAIL CLOSED on too-few survivors (else min-not-met silently changes the trap).
    if (survivors.length < minSurvivors) {
      attrition.skippedFewSurvivors += 1;
      continue;
    }

    // RE-PLAN-4 (D-RP4-1 / D-RP4-2): there is NO buried/evidence-absent split and NO deepest-survivor-index
    // (isBuried) policy. EVERY qualifying seed is `evidence-absent`: the SOLE offline arm. The buried
    // stratum is dropped entirely (construct-invalid offline -- the synthetic disconfirmer flag is
    // text-unverified; the count-vs-rank predicate mis-classified all 62 seeds as buried). decisiveRank /
    // disconfirmerRank are fixed at -1 (no refuter flag). The enrichedKs passed to the screens is the
    // DATE-FILTERED `survivors` -- EXACTLY the evidence the voter judges (closed-book mirroring, C-RP4-1):
    // the GOLD-BLIND probe must NOT see the undated/post-cutoff docs the voter never sees, else it could
    // screen on evidence outside the voter's window and manufacture a fake false-uphold (the buried defect).
    const stratum = 'evidence-absent';
    const decisiveRank = -1;
    const enrichedKs = survivors;

    const transform = TRANSFORMS[recipeSeed % TRANSFORMS.length];
    const recipe = mutateOverreach(seed, { transform, seed: recipeSeed });
    recipeSeed += 1;

    // Generate the mutated trap prose (injected; recipe-not-text -- the prose lives in the cache only).
    const mutatedText = await generate(seed.claim, recipe);

    if (typeof mutatedText !== 'string' || mutatedText.length === 0) {
      throw new ContractError('assembleStage1Traps: generate must return non-empty mutated prose for claim ' + seed.claim_id, 'assembleStage1Traps');
    }

    // SCREEN 1 -- validityGate (the deliberately-weak-verifier flip). A trap the weak verifier already
    // catches is too easy and is rejected.
    const weakVerdict = weak({ trap: mutatedText, enrichedKs });
    const gate = validityGate({ expected_verdict: 'refuted', weakVerifierVerdict: weakVerdict });

    if (!gate.accepted) {
      attrition.screenedOut += 1;
      continue;
    }

    // SCREEN 2 -- the MULTI-PROBE ALL-AGREE-RETAIN consensus (RE-PLAN-5 Finding 2; the mandatory
    // mitigation, load-bearing). EVERY gold-blind judge (in-family Opus + GPT-5.5 + Gemini) reads ONLY the
    // date-filtered surviving SUPPORTING docs (enrichedKs) + the mutated OVERREACH claim (mutatedText) and
    // answers whether the survivors explicitly state OR directly ENTAIL the one-step overreach. For a
    // refuted-gold TRAP the expected entailment is 'false': the packet is RETAINED only if ALL probes
    // agree entails=false (survivors-support-original-but-not-overreach -- resist-uphold-on-absence). ANY
    // split (a probe that reads the survivors as entailing the overreach -- e.g. seed-75-class) or a
    // unanimous-style reject DISQUALIFIES; the drop is counted in screenedOut + probeDropped, and a SPLIT
    // additionally in probeSplitDropped (board guardrail 4 -- the disqualifications are reported).
    const consensus = await runProbeConsensus(PROBES, {
      trap: mutatedText,
      enrichedKs,
      stratum,
      decisiveRank,
      expectedEntailment: 'false',
    });

    // RE-PLAN-7 #3/F3: the in-family annotation probe (if injected) is run per packet for the OOF-vs-in
    // -family agreement DIAGNOSTIC ONLY -- it does NOT enter the retain AND (the gold is family-independent).
    if (inFamilyAnnotate != null) {
      const ann = await inFamilyAnnotate({ trap: mutatedText, enrichedKs, stratum, decisiveRank, expectedEntailment: 'false' });

      if (ann && ann.entails !== undefined && String(ann.entails) === 'false') {
        attrition.inFamilyAgreement += 1;
      }
    }

    if (!consensus.retained) {
      attrition.screenedOut += 1;
      attrition.probeDropped += 1;

      if (consensus.split) {
        attrition.probeSplitDropped += 1;
      }

      continue;
    }

    // RE-PLAN-7 F6 cluster independence: keep ONE retained primary claim per source/seed cluster (the
    // first surviving claim by ascending claim_id). A later claim from the same cluster collapses to the
    // already-retained one (positively-correlated -- the per-claim CP denominator must not double-count).
    const cluster = clusterKeyFor(seed);

    if (clusterIndependence && seenClusters.has(cluster)) {
      attrition.clusterCollapsed += 1;
      continue;
    }

    if (clusterIndependence) {
      seenClusters.add(cluster);
    }

    // WRITE the surviving trap (recipe-not-text): mutated prose + enriched KS to the gitignored cache;
    // the returned row carries uid + stratum + recipe + sha256, NEVER a `text` field.
    const uid = 'averitec-dev-' + String(seed.claim_id).padStart(4, '0');
    const written = writeTrap(
      {
        uid,
        expected_verdict: 'refuted',
        stratum,
        mutatedText,
        recipe,
      },
      { cacheDir },
    );

    strata[stratum].push(written.row);
    goldLabels[uid] = 'refuted';
    attrition.perStratumCount[stratum] += 1;
    // RE-PLAN-7 F5: track the retained trap record (claim + the date-filtered survivors) so the
    // subjectDifficultyProbe + the covariate-overlap check run over the EXACT retained set.
    retainedTrapRecords.push({ claim: mutatedText, enrichedKs });
  }

  // ===== INTERLEAVED POSITIVE-CONTROL ARM (RE-PLAN-5 Finding 1) =====
  // Native UNMUTATED Supported seeds whose date-filtered survivors GENUINELY ENTAIL the claim (the inverse
  // of the trap screen -- ALL probes agree entails=true). NO mutateOverreach: the claim is the ORIGINAL
  // Supported claim, gold=unrefuted by construction. The voter SHOULD vote unrefuted on these; if Sonnet
  // refutes them too the saturation read is an always-refute artifact (scored downstream). Each control
  // row carries NO overreach recipe (native) and stratum='positive-control'.
  for (const seed of controlSeeds) {
    attrition.controlScanned += 1;

    const normalized = normalizeClaimDate(seed.claim_date);

    if (normalized == null) {
      attrition.controlSkippedNoDate += 1;
      continue;
    }

    const claimDate = parseAvtDate(normalized);
    const rawKs = Array.isArray(ksByClaim[seed.claim_id]) ? ksByClaim[seed.claim_id] : [];

    // ENRICH dates only (NO refuter flag) + dateFilter to the strictly-pre-cutoff survivors -- EXACTLY the
    // closed-book mirroring discipline (C-RP4-1): the probe sees ONLY what the voter judges.
    const datedKs = enrichKsForClaim(rawKs, {});
    const survivors = dateFilter(datedKs, claimDate);

    if (survivors.length < minSurvivors) {
      attrition.controlSkippedFewSurvivors += 1;
      continue;
    }

    const enrichedKs = survivors;
    const stratum = 'positive-control';

    // SCREEN 2 -- the SAME multi-probe consensus, but with expectedEntailment='true': the survivors MUST
    // ENTAIL the ORIGINAL claim for a valid positive control (ALL probes agree entails=true). A control
    // whose survivors do NOT entail the claim is DROPPED -- it is not a valid positive control (counted in
    // controlProbeDropped + probeSplitDropped on a split). NO mutateOverreach + NO SCREEN-1 weak-verifier:
    // there is no overreach to catch; the control is the unmutated supported claim.
    const consensus = await runProbeConsensus(PROBES, {
      trap: seed.claim,
      enrichedKs,
      stratum,
      decisiveRank: -1,
      expectedEntailment: 'true',
    });

    // RE-PLAN-7 #3/F3: the in-family annotation (if injected) is a non-gating diagnostic here too.
    if (inFamilyAnnotate != null) {
      const ann = await inFamilyAnnotate({ trap: seed.claim, enrichedKs, stratum, decisiveRank: -1, expectedEntailment: 'true' });

      if (ann && ann.entails !== undefined && String(ann.entails) === 'true') {
        attrition.inFamilyAgreement += 1;
      }
    }

    if (!consensus.retained) {
      attrition.controlProbeDropped += 1;

      if (consensus.split) {
        attrition.probeSplitDropped += 1;
      }

      continue;
    }

    // RE-PLAN-7 F6 cluster independence on the control arm too (one primary claim per source/seed cluster).
    const cluster = clusterKeyFor(seed);

    if (clusterIndependence && seenClusters.has(cluster)) {
      attrition.clusterCollapsed += 1;
      continue;
    }

    if (clusterIndependence) {
      seenClusters.add(cluster);
    }

    // The control prose IS the original Supported claim (native, gold=unrefuted). writeTrap records the
    // recipe-not-text row with NO overreach recipe + stratum='positive-control'. The mutatedText passed to
    // writeTrap is the native claim text (cache-only; never committed).
    const uid = 'averitec-dev-' + String(seed.claim_id).padStart(4, '0');
    const written = writeTrap(
      {
        uid,
        expected_verdict: 'unrefuted',
        stratum,
        mutatedText: 'POSITIVE-CONTROL (native, unmutated): ' + String(seed.claim),
        // recipe omitted -> writeTrap records recipe:null; the control carries NO overreach recipe.
      },
      { cacheDir },
    );

    strata[stratum].push(written.row);
    goldLabels[uid] = 'unrefuted';
    attrition.perStratumCount[stratum] += 1;
    // RE-PLAN-7 F5: track the retained control record (the native claim + its survivors) for the
    // covariate-overlap check (the trap-arm vs control-arm length/complexity distributions must overlap).
    retainedControlRecords.push({ claim: seed.claim, enrichedKs });
  }

  // RE-PLAN-7 THE F5 FLOORS (load-bearing, NEVER tuned toward a desired N) -- checked BEFORE the
  // build-floors so a too-easy/style-bypassable corpus surfaces the DIFFICULTY/COVARIATE VOID first.

  // (F5-1) The SUBJECT-SPECIFIC difficulty floor: a held-out Claude reference verifier (subjectDifficultyProbe)
  // run over the RETAINED refuted-trap set must NOT ACE it. If its catch-rate (the fraction it correctly
  // REFUTES) exceeds subjectDifficultyMaxCatchRate the set is too easy for the subject family to certify
  // capability -> a documented VOID-difficulty. Optional (only when a subjectDifficultyProbe is injected).
  if (typeof subjectDifficultyProbe === 'function' && retainedTrapRecords.length > 0) {
    let caught = 0;

    for (const rec of retainedTrapRecords) {
      const verdict = await subjectDifficultyProbe({ trap: rec.claim, enrichedKs: rec.enrichedKs, stratum: 'evidence-absent' });

      if (verdict === 'refuted') {
        caught += 1;
      }
    }

    const catchRate = caught / retainedTrapRecords.length;

    if (catchRate > subjectDifficultyMaxCatchRate) {
      attrition.difficultyFloorMet = false;
      attrition.voidReason =
        'VOID-difficulty: the held-out Claude reference verifier caught ' + caught + '/' + retainedTrapRecords.length +
        ' retained traps (catch-rate ' + catchRate.toFixed(3) + ' > subjectDifficultyMaxCatchRate ' +
        subjectDifficultyMaxCatchRate + ') -- the retained set is too easy for the subject family to certify ' +
        'capability (F5). The floor is load-bearing, never tuned toward a desired N.';

      const err = new ContractError(
        'assembleStage1Traps: VOID-difficulty -- the F5 subject-specific difficulty floor is unmet (the Claude ' +
          'reference aced the retained traps: catch-rate ' + catchRate.toFixed(3) + ' > ' + subjectDifficultyMaxCatchRate + ')',
        'assembleStage1Traps',
      );
      err.attrition = attrition;
      throw err;
    }
  }

  // (F5-2) The trap/control COVARIATE-OVERLAP check: the trap-arm vs control-arm claim-length /
  // token-complexity distributions must OVERLAP within covariateOverlapTolerance (a relative mean
  // difference), so a model cannot pass by STYLE (systematically longer/more-complex traps) rather than
  // judgment. Below tolerance -> a documented VOID-covariate. Checked only when BOTH arms have members.
  if (retainedTrapRecords.length > 0 && retainedControlRecords.length > 0) {
    const tokenLen = (rec) => String(rec.claim || '').trim().split(/\s+/).filter(Boolean).length;
    const meanOf = (xs) => (xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length);
    const trapMean = meanOf(retainedTrapRecords.map(tokenLen));
    const ctrlMean = meanOf(retainedControlRecords.map(tokenLen));
    const denom = Math.max(trapMean, ctrlMean, 1);
    const relDiff = Math.abs(trapMean - ctrlMean) / denom;

    if (relDiff > covariateOverlapTolerance) {
      attrition.covariateOverlapMet = false;
      attrition.voidReason =
        'VOID-covariate: the trap-arm vs control-arm claim-length means diverge (relDiff ' + relDiff.toFixed(3) +
        ' > covariateOverlapTolerance ' + covariateOverlapTolerance + ') -- a model could pass by STYLE not ' +
        'judgment (F5). The floor is load-bearing, never tuned.';

      const err = new ContractError(
        'assembleStage1Traps: VOID-covariate -- the F5 trap/control covariate-overlap check failed (relDiff ' +
          relDiff.toFixed(3) + ' > ' + covariateOverlapTolerance + ')',
        'assembleStage1Traps',
      );
      err.attrition = attrition;
      throw err;
    }
  }

  // THE TWO INDEPENDENT FLOORS (board guardrail 5 -- both load-bearing, NEITHER a knob). The
  // evidence-absent TRAP floor and the positive-control floor are checked separately; below either is a
  // documented VOID (the corpus cannot honestly build that arm), never relaxed toward a desired N.
  // W2/W3 (RE-PLAN-7): these build-floor DEFAULTS STAY 3/3 ("can we even build an arm"). The 36/24
  // adequacy POWER-floor (N_TRAP_FLOOR / N_CTRL_FLOOR) is enforced ONLY at certifyModel's VOID-on-power
  // gate (Task 2) + the Task-4 N-freeze, NEVER as the assembler default -- the two sites are intentionally
  // different magnitudes (build-floor 3 = buildability; power-floor 36/24 = adequacy; certifyModel is
  // the authoritative power gate).

  // (1) THE EVIDENCE-ABSENT TRAP FLOOR (CARRIED RE-PLAN-4). The RETAINED count is the POST-CONSENSUS
  // survivor count (SCREEN 2 has already dropped invalid packets), so a below-floor RETAINED set IS the
  // documented VOID-on-trap-floor. The assembler FAILS CLOSED (THROWS /perStratumFloor/ naming
  // evidence-absent); the throw RECORDS the realized probeDropped count (board guardrail 4) + sets
  // attrition.retainedBelowFloor + attrition.voidReason so the VOID signal is REPORTED.
  if (strata['evidence-absent'].length < perStratumFloor) {
    attrition.retainedBelowFloor = true;
    attrition.voidReason =
      'RETAINED evidence-absent < perStratumFloor (' + perStratumFloor + '): got ' +
      strata['evidence-absent'].length + ' after the gold-blind entailment probe(s) dropped ' +
      attrition.probeDropped + ' packet(s) (probeDropped) and SCREEN-1+SCREEN-2 dropped ' +
      attrition.screenedOut + ' total (screenedOut). Documented VOID -- the corpus cannot honestly build ' +
      'the PRIMARY evidence-absent arm (board guardrail 5: the floor is load-bearing, not a knob; ' +
      '19-04-REPLAN-DECISION-4 D-RP4-3).';

    const err = new ContractError(
      'assembleStage1Traps: the PRIMARY evidence-absent stratum has fewer than perStratumFloor (' +
        perStratumFloor + ') RETAINED distinct claims: got ' + strata['evidence-absent'].length +
        ' (after the gold-blind probe dropped probeDropped=' + attrition.probeDropped +
        '; documented VOID -- the corpus cannot honestly build the PRIMARY evidence-absent arm)',
      'assembleStage1Traps',
    );
    err.attrition = attrition;
    throw err;
  }

  // (2) THE POSITIVE-CONTROL FLOOR (RE-PLAN-5 Finding 1). Enforced ONLY when controls were requested
  // (nControls > 0). A RETAINED control set below positiveControlFloor IS the documented
  // VOID-on-control-floor -- the read cannot prove the voter CAN uphold when warranted (the power/plumbing
  // check). The assembler FAILS CLOSED (THROWS /positiveControlFloor/ naming positive-control); the throw
  // RECORDS the realized controlProbeDropped count + sets attrition.controlBelowFloor + voidReason.
  if (N_CONTROLS > 0 && strata['positive-control'].length < positiveControlFloor) {
    attrition.controlBelowFloor = true;
    attrition.voidReason =
      'RETAINED positive-control < positiveControlFloor (' + positiveControlFloor + '): got ' +
      strata['positive-control'].length + ' after the gold-blind entailment probe(s) dropped ' +
      attrition.controlProbeDropped + ' control candidate(s) (controlProbeDropped). Documented VOID -- ' +
      'the read cannot prove the voter CAN uphold when warranted (Finding 1: a 0-false-uphold result ' +
      'is confounded without the positive controls; the floor is load-bearing, not a knob).';

    const err = new ContractError(
      'assembleStage1Traps: the positive-control stratum has fewer than positiveControlFloor (' +
        positiveControlFloor + ') RETAINED distinct controls: got ' + strata['positive-control'].length +
        ' (after the gold-blind probe dropped controlProbeDropped=' + attrition.controlProbeDropped +
        '; documented VOID-on-control-floor -- the read cannot prove the voter can uphold)',
      'assembleStage1Traps',
    );
    err.attrition = attrition;
    throw err;
  }

  return {
    strata,
    goldLabels,
    attrition,
    runConfig: {
      minSurvivors,
      perStratumFloor,
      positiveControlFloor,
      nControls: N_CONTROLS,
      // RE-PLAN-7: the F5/F6 knobs recorded in the run artifact (the floors are load-bearing, never tuned).
      clusterIndependence,
      subjectDifficultyMaxCatchRate,
      covariateOverlapTolerance,
    },
  };
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). With `--rule` it prints the byte-locked
// URL_DATE_RULE source (the value the manifest pre-registration records + the anti-drift test asserts).
// The real Stage-1 assembly (Task 4, human-gated) drives assembleStage1Traps directly with an
// Opus-subagent generator + a blind validity probe; this CLI is a convenience only.
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const mode = process.argv[2];

  if (mode === '--rule') {
    console.log(URL_DATE_RULE.source);
    process.exit(0);
  }

  console.error('lz-eval-trap-assembler: usage: node lz-eval-trap-assembler.mjs --rule');
  process.exit(2);
}
/* node:coverage enable */
