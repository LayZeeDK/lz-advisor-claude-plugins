// lz-eval-trap-assembler.mjs
//
// The NET-NEW KS-ENRICHMENT layer + the 2-strata Stage-1 trap-set ASSEMBLER for the offline
// known-gold Haiku-vs-Sonnet gating read (Plan 19-04, Task 1; EVAL-01). It is the construct-validity-
// corrected Stage-1 replacement (19-04-REPLAN-DECISION-2): the raw AVeriTeC dev KS docs are
// {sentence, url} with ZERO date fields and ZERO decisive/disconfirmer/verdict flags, so the FROZEN
// dateFilter drops every doc and staticKsAdapter returns an EMPTY set for every claim -- the offline
// read is degenerate without enrichment. This module attaches real publication dates (extracted from
// the doc URL via a byte-locked strict path-only rule) plus the decisive/disconfirmer/verdict flags
// (ONLY at the pre-registered ranks) so the BUILT search spine can run.
//
// ASSEMBLY-LAYER DISCIPLINE (load-bearing): the FROZEN primitives parseAvtDate / safeParse /
// dateFilter / staticKsAdapter / searchAndStop (eval/lz-eval-search-loop.mjs) and the BUILT recipe
// machinery mutateOverreach / validityGate / writeTrap / loadDevSeedsAndKs (eval/lz-eval-traps.mjs;
// classifySeed is no longer imported here -- the I3 fix removed its tautological in-assembler guard)
// are IMPORTED and COMPOSED, never rewritten. ALL new logic (the dates + the
// flags) lives here as an assembly layer over those primitives. The single-digit-day fix is the NEW
// normalizeClaimDate HERE -- the frozen parseAvtDate STILL throws on a single-digit day like
// '9-10-2020' (it is byte-unchanged); the normalizer zero-pads at the assembly layer so a seed dated
// 9-10-2020 becomes usable WITHOUT touching the parser.
//
// SCORING RECONCILIATION (T-19-19): the decisive/disconfirmer/verdict flags this layer attaches drive
// ONLY searchAndStop's mechanical trace + classifySeed's stratum assignment. They are NOT the scored
// quantity. The SCORED quantity is the MODEL voter's free-text vote.verdict over the date-filtered KS
// text (the D-08 dispatch Workflow, Task 2). searchAndStop's flag-driven verdict enum
// {judge-result,'refuted-default','insufficient'} is the TRACE + the mechanical minimums ONLY.
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
// TWO STRATA ONLY (buried + evidence-absent): date-sensitive is DROPPED from the offline gate -- its
// post-cutoff-leak arm is unobservable offline (staticKsAdapter applies dateFilter BEFORE any voter
// sees a doc, so a post-cutoff "leak" is dropped identically for both seats). Date-sensitivity is
// DEFERRED to the Phase-20 live phase (19-04-REPLAN-DECISION-2 item 1).
//
// CONSTRUCT-SCOPE BOUNDARY (19-04-REPLAN-DECISION-3): the offline gate measures CLOSED-BOOK JUDGMENT
// (resist-uphold-on-absence for evidence-absent; distractor-attention / refuter-detection for buried),
// NOT retrieval orchestration. The frozen staticKsAdapter ignores the query, so a model cannot drive
// query-formulation through this seam -- retrieval (query formulation / search depth / premature-stop)
// is NOT cleanly + leak-safely measurable offline and DEFERS to the Phase-20 LIVE operational shadow.
// `buried` offline is acknowledged a context-attention / refuter-detection JUDGMENT test, NOT retrieval.
//
// EVIDENCE-ABSENT IS THE PRIMARY ARM; BURIED IS AUTO-GATED (19-04-REPLAN-DECISION-3 item 3): at the
// median-5 strictly-pre-cutoff docs/claim the deepest survivor almost never reaches BURIED_RANK_FLOOR
// (20), so the buried stratum will not reach perStratumFloor. evidence-absent is the PRIMARY arm and
// MUST reach perStratumFloor (else a degenerate corpus -- FAIL CLOSED); buried is AUTO-GATED -- if it
// has fewer than perStratumFloor distinct claims it AUTO-DROPS to evidence-absent-only (the drop reason
// is LOGGED in attrition.buriedAutoDropped + .buriedAutoDropReason -- never silently dropped). buried is
// kept ONLY when it can be honestly built AND (Task 4) the calibrator shows it discriminates.
//
// I3 (19-04-ARTIFACT-REVIEW): the prior classifySeed agreement guard was a TAUTOLOGY -- isBuried set
// BOTH the disconfirmer-flag rank (the flag classifySeed reads) AND the stratum, so classifySeed could
// never disagree (the ContractError was dead code). It is REMOVED. Stratification correctness rests on
// (i) the BLIND content-grounding validityProbe (it confirms a buried decisive refuter genuinely refutes
// the MUTATED trap, and an evidence-absent seed carries NO pre-cutoff refuter -- it fails closed) and
// (ii) the pre-registered manifest ranks -- NOT a runtime cross-check (the Phase-17 "fixture must
// discriminate" lesson applied to a runtime guard: a tautological guard reads as assurance while
// verifying nothing, which is worse than no guard). classifySeed is no longer imported in this module;
// its dead in-assembler agreement assertion is removed. classifySeed itself is unchanged in
// lz-eval-traps.mjs (it remains the built classifier the recipe machinery + manifest ranks use).
//
// FAIL-CLOSED FLOORS: a seed with fewer than minSurvivors (5) strictly-pre-cutoff dated surviving docs
// is EXCLUDED (else min-not-met silently changes the trap; the EXACTLY-5-survivor inclusive boundary
// KEEPS the seed -- the floor is `< minSurvivors`, not `<=`); the PRIMARY evidence-absent stratum with
// fewer than perStratumFloor (3) distinct surviving claims FAILS CLOSED (so nPooled >= reliableTrials=15
// at k=5); the AUTO-GATED buried stratum AUTO-DROPS instead of failing the whole run (above).
//
// VALIDITY SCREENING: every trap is screened by validityGate (the deliberately-weak-verifier flip)
// PLUS an injected BLIND content-grounding validityProbe (a competent out-of-the-gate judge confirms a
// buried decisive refuter genuinely refutes the MUTATED trap, and that an evidence-absent seed carries
// NO pre-cutoff refuter but DOES carry the original unmutated SUPPORTING docs as plausible text)
// BEFORE the trap can count. The flags are NOT text-derivable -- they do not leak the gold label into
// the doc text the model reads.
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
// loadDevSeedsAndKs loads the dev seeds + KS from the gitignored cache. classifySeed is NO LONGER
// imported here: the I3 fix removed its tautological in-assembler agreement guard (see the header). The
// stratum is decided by the deterministic survivor-depth policy; classifySeed (the built classifier)
// stays available in lz-eval-traps.mjs for the recipe machinery + the manifest-rank pre-registration.
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
//   minSurvivors=5, weakVerifier }): the deterministic 2-strata Stage-1 assembler.
//
//   - generate(seedClaim, recipe) -> Promise<string>: the INJECTED async generator that produces the
//     mutated trap prose. An Opus-subagent generator is acceptable at Stage 1 (only Sonnet runs the
//     calibrator; the truly-out-of-family paid generator is reserved for Stage-2 / 19-05).
//   - validityProbe({ trap, enrichedKs, stratum, decisiveRank }) -> Promise<{ accepted, reason }>: the
//     INJECTED BLIND content-grounding probe (a competent out-of-the-gate judge). It confirms a buried
//     decisive refuter genuinely refutes the MUTATED trap, and that an evidence-absent seed carries NO
//     pre-cutoff refuter. NOT text-derivable; runs at lock time, not vote time.
//   - weakVerifier({ trap, enrichedKs }) -> 'unrefuted' | 'refuted': the INJECTED deliberately-weak
//     reference verifier whose FLIP validityGate screens on (default: a weak verifier that always
//     upholds -> always flips on a refuted-gold trap -- the unit suite injects discriminating stubs).
//
// DETERMINISTIC seed selection: ALL qualifying Supported seeds by ASCENDING claim_id. For each:
// normalizeClaimDate (skip on null); enrich + dateFilter to the strictly-pre-cutoff survivors;
// EXCLUDE the seed if fewer than minSurvivors survive; route buried vs evidence-absent by the
// deterministic survivor-depth policy (deepest survivor >= BURIED_RANK_FLOOR -> buried; the I3 fix
// removed the tautological classifySeed cross-check); mutateOverreach to record the recipe; generate
// the mutated prose; screen via validityGate (weak-verifier flip) PLUS validityProbe; writeTrap
// cache-only. DROP date-sensitive entirely. The PRIMARY evidence-absent stratum FAILS CLOSED below
// perStratumFloor; the AUTO-GATED buried stratum AUTO-DROPS to evidence-absent-only below the floor
// (logged in attrition.buriedAutoDropped + .buriedAutoDropReason).
//
// Returns { strata: { 'evidence-absent':[row], buried?:[row] }, goldLabels:{uid->'refuted'},
//   attrition:{ scanned, skippedNoDate, skippedFewSurvivors, screenedOut, perStratumCount,
//     buriedAutoDropped:boolean, buriedAutoDropReason:string|null },
//   runConfig:{ minSurvivors, perStratumFloor } }. When buried AUTO-DROPS the returned strata holds an
// EMPTY buried array (the stratum key is retained for shape stability) and attrition.buriedAutoDropped
// is true with a why string; the PRIMARY evidence-absent stratum is always present + at the floor.
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

  const strata = { buried: [], 'evidence-absent': [] };
  const goldLabels = {};
  const attrition = {
    scanned: 0,
    skippedNoDate: 0,
    skippedFewSurvivors: 0,
    screenedOut: 0,
    perStratumCount: { buried: 0, 'evidence-absent': 0 },
    // buried is AUTO-GATED (19-04-REPLAN-DECISION-3 item 3): at median-5 docs it almost never reaches
    // the per-stratum floor and AUTO-DROPS to evidence-absent-only. These record WHETHER it dropped and
    // WHY (never a silent drop). false + null when buried built at or above the floor.
    buriedAutoDropped: false,
    buriedAutoDropReason: null,
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

    // ENRICH first WITHOUT any decisive/disconfirmer flag so classifySeed sees only the dates; the
    // disconfirmer flag is then attached at the pre-registered rank below (a deterministic buried-rank
    // policy). The buried disconfirmer is placed at the deepest surviving rank (>= BURIED_RANK_FLOOR
    // when the survivor pool is deep enough); evidence-absent seeds get NO disconfirmer.
    const datedKs = enrichKsForClaim(rawKs, {});
    const survivors = dateFilter(datedKs, claimDate);

    // FAIL CLOSED on too-few survivors (else min-not-met silently changes the trap).
    if (survivors.length < minSurvivors) {
      attrition.skippedFewSurvivors += 1;
      continue;
    }

    // Decide the stratum DETERMINISTICALLY from the survivor depth: a seed with a deep survivor pool
    // (>= the buried floor + a disconfirmer slot) is a BURIED candidate (attach a disconfirmer at the
    // deepest surviving rank); a shallower pool is an EVIDENCE-ABSENT candidate (no disconfirmer). The
    // EXACT per-seed decisive/disconfirmer ranks are pre-registered in the manifest (Task 3); here the
    // assembler uses a deterministic policy so the ENRICHED KS carries real flags classifySeed reads.
    const transform = TRANSFORMS[recipeSeed % TRANSFORMS.length];
    const recipe = mutateOverreach(seed, { transform, seed: recipeSeed });
    recipeSeed += 1;

    // Find the deepest surviving doc INDEX in the dated KS (the buried disconfirmer slot). A doc
    // survives iff the frozen dateFilter keeps it (a parseable date strictly < claimDate). The
    // disconfirmer + decisive refuter (for a buried trap) sit on that deep survivor; an evidence-absent
    // trap places NEITHER (it keeps the original unmutated supporting docs as plausible text only).
    let deepestSurvivor = -1;

    for (let i = 0; i < datedKs.length; i += 1) {
      if (dateFilter([datedKs[i]], claimDate).length === 1) {
        deepestSurvivor = i;
      }
    }
    // Buried iff the deepest survivor sits at or beyond the buried rank floor (20) -- enough depth for a
    // genuinely-buried disconfirmer. Otherwise evidence-absent.
    const isBuried = deepestSurvivor >= 20;
    const stratum = isBuried ? 'buried' : 'evidence-absent';

    // Re-enrich WITH the pre-registered flags: a buried trap flags the deep survivor as the decisive
    // pre-cutoff disconfirmer (refuter); an evidence-absent trap attaches NO refuter flag (it carries
    // only the original unmutated supporting docs as plausible text).
    const decisiveRank = isBuried ? deepestSurvivor : -1;
    const disconfirmerRank = isBuried ? deepestSurvivor : -1;
    const enrichedKs = enrichKsForClaim(rawKs, { decisiveRank, disconfirmerRank, verdict: 'refuted' });

    // I3 (19-04-ARTIFACT-REVIEW; 19-04-REPLAN-DECISION-3): the prior classifySeed agreement guard here
    // was a TAUTOLOGY -- isBuried sets BOTH the disconfirmerRank (the flag classifySeed reads) AND the
    // stratum, so classifySeed could never disagree, and the ContractError was dead code that read as a
    // cross-check while verifying nothing. It is REMOVED. The stratification correctness rests on the
    // BLIND content-grounding validityProbe (SCREEN 2 below -- it fails closed on a mis-grounded
    // construction) and the pre-registered manifest ranks, NOT a runtime cross-check (the Phase-17
    // "fixture must discriminate" lesson). classifySeed stays imported + consumed by the recipe
    // machinery (loadDevSeedsAndKs / mutateOverreach); only the dead assertion is gone.

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

    // SCREEN 2 -- the BLIND content-grounding validity probe (a competent out-of-the-gate judge). It
    // confirms a buried decisive refuter genuinely refutes the MUTATED trap, and that an evidence-absent
    // seed carries NO pre-cutoff refuter (but DOES carry the unmutated supporting docs as plausible
    // text). Runs at lock time; NOT text-derivable.
    const probe = await validityProbe({ trap: mutatedText, enrichedKs, stratum, decisiveRank });

    if (probe == null || probe.accepted !== true) {
      attrition.screenedOut += 1;
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

  // FLOORS (19-04-REPLAN-DECISION-3 item 3): evidence-absent is the PRIMARY arm and MUST reach the
  // per-stratum floor -- a corpus that cannot honestly build >= perStratumFloor evidence-absent claims
  // is degenerate and FAILS CLOSED (the whole run aborts). The /perStratumFloor/ matcher is preserved
  // for the throw-path test (W-2, re-pointed to an evidence-absent-short corpus).
  if (strata['evidence-absent'].length < perStratumFloor) {
    throw new ContractError(
      'assembleStage1Traps: the PRIMARY evidence-absent stratum has fewer than perStratumFloor (' +
        perStratumFloor + ') surviving distinct claims: got ' + strata['evidence-absent'].length +
        ' (degenerate corpus -- no honest PRIMARY stratum)',
      'assembleStage1Traps',
    );
  }

  // buried is AUTO-GATED: if it cannot reach the per-stratum floor (the LIKELY median-5 outcome -- the
  // deepest survivor rarely reaches BURIED_RANK_FLOOR), AUTO-DROP it to evidence-absent-only instead of
  // aborting the whole run. The drop is EXPLICIT + LOGGED (never silent): the buried gold labels are
  // pruned, the buried stratum is emptied, and attrition.buriedAutoDropped / .buriedAutoDropReason
  // record WHY. The PRIMARY evidence-absent stratum (asserted at the floor above) carries the run.
  if (strata.buried.length < perStratumFloor) {
    const droppedCount = strata.buried.length;

    for (const row of strata.buried) {
      delete goldLabels[row.uid];
    }

    strata.buried = [];
    attrition.perStratumCount.buried = 0;
    attrition.buriedAutoDropped = true;
    attrition.buriedAutoDropReason =
      'buried < perStratumFloor (' + perStratumFloor + ') at median-5: only ' + droppedCount +
      ' distinct buried claim(s) built; auto-dropped to evidence-absent-only (deferred-buried-judgment, ' +
      '19-04-REPLAN-DECISION-3 item 3)';
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
