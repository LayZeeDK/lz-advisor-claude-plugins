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
// SCREEN 2 the injected GOLD-BLIND entailment validityProbe (the mandatory mitigation, load-bearing --
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
// assembleStage1Traps({ cacheRoot, generate, validityProbe, cacheDir, perStratumFloor=3,
//   minSurvivors=5, weakVerifier }): the deterministic SINGLE-STRATUM (evidence-absent) Stage-1
//   assembler (RE-PLAN-4 OPTION A -- buried dropped, D-RP4-1).
//
//   - generate(seedClaim, recipe) -> Promise<string>: the INJECTED async generator that produces the
//     mutated trap prose. An Opus-subagent generator is acceptable at Stage 1 (only Sonnet runs the
//     calibrator; the truly-out-of-family paid generator is reserved for Stage-2 / 19-05).
//   - validityProbe({ trap, enrichedKs, stratum, decisiveRank }) -> Promise<{ accepted, reason }>: the
//     INJECTED GOLD-BLIND entailment probe (the mandatory mitigation, load-bearing). A gold-blind model
//     judge (NO AVeriTeC label, NO mutation knowledge) reads ONLY the date-filtered surviving SUPPORTING
//     docs + the mutated OVERREACH claim and answers whether the survivors explicitly state OR directly
//     entail the one-step OVERREACH, or only the weaker ORIGINAL Supported claim. accepted:false
//     DISQUALIFIES (drop) any packet whose survivors plausibly entail/license the overreach (gold=refuted
//     is indefensible there); accepted:true RETAINS as valid gold=refuted ONLY packets whose survivors
//     support the original but do NOT entail the overreach (resist-uphold-on-absence). Since the stratum
//     is always 'evidence-absent' and decisiveRank is always -1, the rubric is uniform. Runs at lock
//     time, BEFORE any vote; gold-blind so it does not bootstrap the gold. The drop count is REPORTED in
//     attrition.probeDropped (board guardrail 4), never silently absorbed.
//   - weakVerifier({ trap, enrichedKs }) -> 'unrefuted' | 'refuted': the INJECTED deliberately-weak
//     reference verifier whose FLIP validityGate screens on (default: a weak verifier that always
//     upholds -> always flips on a refuted-gold trap -- the unit suite injects discriminating stubs).
//
// DETERMINISTIC seed selection: ALL qualifying Supported seeds by ASCENDING claim_id. For each:
// normalizeClaimDate (skip on null); enrich (dates only) + dateFilter to the strictly-pre-cutoff
// survivors; EXCLUDE the seed if fewer than minSurvivors survive; mutateOverreach to record the recipe;
// generate the mutated prose; SCREEN 1 validityGate (weak-verifier flip) THEN SCREEN 2 the GOLD-BLIND
// entailment validityProbe; writeTrap cache-only. Every surviving seed is `evidence-absent` (NO
// decisive/disconfirmer flag: decisiveRank=-1, disconfirmerRank=-1; the packet = the date-filtered
// ORIGINAL supporting docs). There is NO buried stratum and NO date-sensitive stratum offline.
//
// Returns { strata: { 'evidence-absent':[row] }, goldLabels:{uid->'refuted'},
//   attrition:{ scanned, skippedNoDate, skippedFewSurvivors, screenedOut, probeDropped, perStratumCount,
//     retainedBelowFloor:boolean, voidReason:string|null },
//   runConfig:{ minSurvivors, perStratumFloor } }. attrition.probeDropped is the number of packets the
// GOLD-BLIND entailment probe (SCREEN 2) disqualified, distinct from the aggregate screenedOut (SCREEN 1
// + SCREEN 2). The SINGLE evidence-absent floor FAILS CLOSED below perStratumFloor: when the RETAINED
// (post-probe) set is below the floor the assembler THROWS /perStratumFloor/ naming evidence-absent, and
// the throw records the realized probeDropped count + sets attrition.retainedBelowFloor=true +
// attrition.voidReason (the documented VOID condition -- the corpus cannot honestly build the PRIMARY
// arm; board guardrail 5: the floor is load-bearing, NOT a knob to relax toward a desired N).
// ---------------------------------------------------------------------------
export async function assembleStage1Traps({
  cacheRoot,
  generate,
  validityProbe,
  cacheDir,
  perStratumFloor = 3,
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

  if (typeof validityProbe !== 'function') {
    throw new ContractError('assembleStage1Traps requires an injected async validityProbe({...})', 'assembleStage1Traps');
  }

  // The weak verifier defaults to "always upholds" (always FLIPS on a refuted-gold trap -> validityGate
  // accepts). The unit suite injects discriminating stubs (a verifier that catches a trap -> rejected).
  const weak = typeof weakVerifier === 'function' ? weakVerifier : () => 'unrefuted';

  const { seeds, ksByClaim } = loadDevSeedsAndKs(cacheRoot);

  // ASCENDING claim_id, Supported only (deterministic seed selection -- anti result-shopping).
  const supported = seeds
    .filter((s) => s != null && s.label === 'Supported')
    .sort((a, b) => a.claim_id - b.claim_id);

  // ONE stratum (RE-PLAN-4): evidence-absent is the SOLE offline arm. No buried key (D-RP4-1).
  const strata = { 'evidence-absent': [] };
  const goldLabels = {};
  const attrition = {
    scanned: 0,
    skippedNoDate: 0,
    skippedFewSurvivors: 0,
    // screenedOut counts BOTH SCREEN-1 (validityGate flip) + SCREEN-2 (gold-blind probe) drops.
    screenedOut: 0,
    // probeDropped is the dedicated SCREEN-2 GOLD-BLIND entailment-probe drop count (board guardrail 4:
    // the probe's disqualifications are REPORTED, distinct from the SCREEN-1 weak-verifier rejections).
    probeDropped: 0,
    perStratumCount: { 'evidence-absent': 0 },
    // The documented VOID signal (board guardrail 5): set when the RETAINED (post-probe) evidence-absent
    // set falls below perStratumFloor. The assembler THROWS in that case (the corpus cannot honestly
    // build the PRIMARY arm), but these fields are populated on the attrition the throw carries so the
    // realized probeDropped count + the VOID reason are reported, never silently absorbed.
    retainedBelowFloor: false,
    voidReason: null,
  };

  // A deterministic recipe-seed counter (the recipe { transform, seed } must carry an integer seed).
  let recipeSeed = 0;
  const TRANSFORMS = ['scope', 'causation', 'magnitude', 'certainty'];

  for (const seed of supported) {
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

    // SCREEN 2 -- the GOLD-BLIND entailment validity probe (the mandatory mitigation, load-bearing). A
    // gold-blind judge (NO AVeriTeC label, NO mutation knowledge) reads ONLY the date-filtered surviving
    // SUPPORTING docs (enrichedKs) + the mutated OVERREACH claim (mutatedText) and answers whether the
    // survivors explicitly state OR directly ENTAIL the one-step overreach, or only the weaker ORIGINAL
    // Supported claim. accepted:false DISQUALIFIES a packet whose survivors plausibly entail/license the
    // overreach (there `unrefuted` is a legitimate read and gold=refuted is indefensible -- the defect
    // that killed buried); accepted:true RETAINS only survivors-support-original-but-not-overreach
    // (resist-uphold-on-absence). The drop is counted in BOTH screenedOut + the dedicated probeDropped
    // (board guardrail 4 -- the probe's disqualifications are reported, never silently absorbed).
    const probe = await validityProbe({ trap: mutatedText, enrichedKs, stratum, decisiveRank });

    if (probe == null || probe.accepted !== true) {
      attrition.screenedOut += 1;
      attrition.probeDropped += 1;
      continue;
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
  }

  // THE SINGLE EVIDENCE-ABSENT FLOOR (RE-PLAN-4, board guardrail 5 -- the floor is load-bearing, NOT a
  // knob): evidence-absent is the SOLE arm and MUST reach perStratumFloor. The RETAINED count is the
  // POST-PROBE survivor count (the gold-blind probe SCREEN 2 has already dropped invalid packets), so a
  // below-floor RETAINED set IS the documented VOID condition -- the corpus cannot honestly build the
  // PRIMARY arm. The assembler FAILS CLOSED (THROWS /perStratumFloor/ naming evidence-absent); the throw
  // RECORDS the realized probeDropped count (board guardrail 4) + sets attrition.retainedBelowFloor +
  // attrition.voidReason so the VOID signal is REPORTED, never silently absorbed and never relaxed
  // toward a desired N (that would be result-shopping).
  if (strata['evidence-absent'].length < perStratumFloor) {
    attrition.retainedBelowFloor = true;
    attrition.voidReason =
      'RETAINED evidence-absent < perStratumFloor (' + perStratumFloor + '): got ' +
      strata['evidence-absent'].length + ' after the gold-blind entailment probe dropped ' +
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
    // Attach the realized attrition (probeDropped + the VOID reason) to the thrown error so the
    // below-floor VOID signal is inspectable by the caller (board guardrail 4: REPORT the drops).
    err.attrition = attrition;
    throw err;
  }

  return {
    strata,
    goldLabels,
    attrition,
    runConfig: { minSurvivors, perStratumFloor },
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
