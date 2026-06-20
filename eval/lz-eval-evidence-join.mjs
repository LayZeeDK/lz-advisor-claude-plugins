// lz-eval-evidence-join.mjs
//
// NET-NEW (Phase 20, Plan 20-05 evidence-join fix; NO-SPEND): the EVIDENCE-TEXT JOIN shared by BOTH live-cert
// harvest arms. A survivor cluster (survivors.json) carries only SOURCE URLs in its `sources` field -- NOT the
// stored evidence TEXT. The OOF entailment adjudication (arm A) + the Stage-2 verify-voter (arm B) judge
// "does this EVIDENCE entail the CLAIM?"; a bare URL is NOT adjudicable. The REAL evidence text lives on disk
// in each run dir:
//   - claims/<worker>.json: { worker, source, claims:[ { id, text, quote, excerpt_id, load_bearing } ... ] }
//     -- each worker claim carries a verbatim `quote` snippet + an `excerpt_id`;
//   - excerpts/<excerpt_id>.txt: the fetched passage TEXT.
// This module reconstructs a cluster's evidence as the matched worker quote(s) + the referenced excerpt
// passage(s), as [{ sentence: <text> }] -- the shape the oof packet builder + the voter consume. It NEVER
// emits a URL as evidence; a cluster with no recoverable text is FLAGGED (matched:false + a reason) so the
// caller DROPS it (arm A) or surfaces it without an evidence field (arm B keeps its existing counts).
//
// It is extracted into its OWN module (not co-located in lz-eval-armA-native.mjs) so BOTH arm A
// (lz-eval-armA-native.mjs) AND arm B (lz-eval-harvest.mjs) import it WITHOUT a cycle: arm A imports the
// run-dir reader from arm B (lz-eval-harvest.mjs), so importing the join from arm A into arm B would form a
// cycle. The join lives here, one-directional: both arms -> this module -> the runtime hardening primitives.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in the
// distributed plugin tree. It imports the SHIPPED runtime aggregator's hardening primitives (ContractError /
// safeId / listJson) ACROSS trees by relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime ->
// eval). Zero new npm deps; node stdlib + the runtime primitives + the shared eval readJson helper.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md). It performs NO
// network I/O, NO model spend, and carries NO LZ_SPEND code path (a pure on-disk join).

import fs from 'node:fs';
import path from 'node:path';

import {
  ContractError,
  safeId,
  listJson,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

import { readJson } from './lz-eval-readjson.mjs';

// The per-excerpt passage cap (documented): an excerpt file can be tens of KB (a full fetched passage). The
// OOF/voter packet needs the relevant passage, NOT a 50KB dump. Cap each excerpt to the first ~1200 chars
// (deterministic prefix; the verbatim worker `quote` -- the load-bearing snippet -- is emitted IN FULL
// separately, so the cap never loses the decisive sentence).
export const EXCERPT_CHAR_CAP = 1200;

// The lexical-overlap (token Jaccard) threshold for the OVERLAP match path (documented). The synthesized
// cluster claim is an EXACT copy of a worker claim `text` in 100% of the curated corpus (verified), so EXACT
// match is the primary path; the overlap path is a deterministic fallback for any future paraphrased
// synthesis. 0.6 is the SAME UNDER-merge Jaccard the aggregator's corroboration clustering uses (D-07
// jaccard >= 0.6) -- reused for consistency, never tuned toward a target N.
export const EVIDENCE_OVERLAP_JACCARD = 0.6;

// ASCII-safe, whitespace-collapsed normalization for a piece of evidence text. Non-ASCII bytes (6/15 excerpt
// files in the curated corpus carry them) are stripped so the emitted packet is strictly ASCII (CLAUDE.md);
// CR/LF/tabs collapse to single spaces so a multi-line passage is one clean sentence for the renderer.
function asciiClean(text) {
  return String(text == null ? '' : text)
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Normalize a claim/worker-text for MATCHING only (lowercase + whitespace-collapsed). Distinct from
// asciiClean (which prepares the surfaced evidence) -- this drives the exact/overlap comparison.
function normForMatch(text) {
  return String(text == null ? '' : text).toLowerCase().replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// FAITHFUL EVIDENCE CLEANING (Phase 20, Plan 20-05 OOF-PREP; NO-SPEND). The fetched excerpt passages carry
// BIBLIOGRAPHIC HEADER NOISE -- "Source: <url>", "Title: ...", "Authors: ...", "Published: ...", a leading
// markdown heading "# <document title>", bare-URL-only lines -- that is METADATA, not factual evidence. The
// OOF judges "does this EVIDENCE entail the CLAIM?"; bibliographic metadata is non-adjudicable noise that
// Copilot pays per-token to read. This pass STRIPS that metadata BEFORE the evidence is emitted (before any
// scored vote / freeze -> pre-registration-clean). It is FAITHFUL: it removes ONLY metadata lines/segments +
// normalizes whitespace; it NEVER fabricates, paraphrases, or removes a substantive factual sentence.
//
// THE CLEANING RULE (pre-registration-relevant -- documented in the SUMMARY):
//   1. Split the (already ASCII-cleaned, whitespace-collapsed) text back into line + leading-segment units.
//      Because asciiClean collapses newlines into single spaces, the metadata markers are matched as LEADING
//      SEGMENTS of the text and as embedded "<Marker>: ..." runs, in addition to whole-line matches.
//   2. Drop any line/leading-segment that IS bibliographic metadata:
//        - a "<Marker>:" prefix where Marker is one of Source / Title / Authors / Author / Published /
//          Submitted / Updated / DOI (case-insensitive), consuming up to the next metadata marker or end;
//        - a leading markdown heading "# <title>" (a single '#'-prefixed heading that is just the doc title);
//        - a bare-URL-only segment (the whole segment is a single http(s) URL with no surrounding prose).
//   3. Keep ALL substantive factual sentences verbatim (only whitespace re-normalized).
// The markers are matched ONLY at a unit boundary (line start / leading segment / after a prior metadata
// marker) so a factual sentence that merely CONTAINS the word "source"/"title" mid-sentence is NEVER removed.
// ---------------------------------------------------------------------------

// The bibliographic marker labels (case-insensitive), matched as "<Marker>:" at a segment boundary. The set
// reflects the markers actually emitted into the curated corpus's excerpt headers (verified against the real
// .lz-research corpus): Source / Source URL / Title / Authors / Author / Published / Submitted / Submission
// Date / Updated / Fetched / DOI / arXiv identifier. Each value is consumed up to the next marker, a sentence
// boundary, or end (see stripBibliographicMetadata). Multi-word labels are matched verbatim (the regex below
// escapes none of these because they are alphanumeric + single spaces only).
const BIBLIO_MARKERS = [
  'Source URL',
  'Source',
  'Title',
  'Authors',
  'Author',
  'Published',
  'Submission Date',
  'Submitted',
  'Updated',
  'Fetched',
  'arXiv identifier',
  'DOI',
];

// Turn a marker label into a case-INSENSITIVE pattern WITHOUT the global `/i` flag (so the rest of the
// stripping regex -- the sentence-boundary lookbehind/lookahead -- stays case-SENSITIVE; with `/i`, [a-z]
// also matches A-Z, which would let an author INITIAL like "Y." falsely trip the sentence boundary). Each
// alphabetic char becomes a two-case class [Aa]; spaces become \s+ (so "Source URL" tolerates extra spacing).
function caseInsensitivePattern(label) {
  return label
    .split('')
    .map((ch) => {
      if (/[A-Za-z]/.test(ch)) {
        return '[' + ch.toUpperCase() + ch.toLowerCase() + ']';
      }

      if (ch === ' ') {
        return '\\s+';
      }

      // Escape any regex metacharacter (none in the current label set, but defensive).
      return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('');
}

// One alternation of the marker labels for the segment-splitting regex (longest-first so "Authors" wins over
// "Author", and "Source URL" wins over "Source", when both could match a prefix). Built case-insensitively
// WITHOUT the `/i` flag so the sentence-boundary classes remain case-sensitive.
const BIBLIO_MARKER_ALT = BIBLIO_MARKERS
  .slice()
  .sort((a, b) => b.length - a.length)
  .map(caseInsensitivePattern)
  .join('|');

// A bare-URL-only segment: the entire (trimmed) segment is a single http(s) URL with no surrounding prose.
const BARE_URL_ONLY = /^https?:\/\/\S+$/i;

// A leading markdown heading line "# <title>" (one-or-more '#' then a space then the heading text). Only a
// LEADING heading (the document title) is stripped; an embedded '#' inside prose is never a heading here
// because asciiClean has already collapsed newlines, so a heading can only appear as the LEADING segment.
const LEADING_MD_HEADING = /^#{1,6}\s+\S/;

// Strip bibliographic metadata from a single ASCII-cleaned, whitespace-collapsed evidence string. Returns the
// substantive factual text (metadata removed, whitespace re-normalized). FAITHFUL: removes only metadata
// segments; never fabricates / paraphrases / removes a factual sentence.
function stripBibliographicMetadata(text) {
  const input = asciiClean(text);

  if (input.length === 0) {
    return '';
  }

  // (a) A leading markdown heading "# <doc title>": drop the heading run up to the FIRST bibliographic marker
  //     (the title block typically reads "# <Title> Source: ... Authors: ..."). If no marker follows, drop
  //     only the leading heading token run up to the first sentence-ending punctuation is NOT done (we would
  //     risk eating a factual sentence) -- instead a lone leading heading with no following marker is treated
  //     as the doc title ONLY when it is the entire segment; otherwise it is left intact. To stay faithful we
  //     drop a leading heading ONLY when a bibliographic marker follows it on the same collapsed line.
  let working = input;

  const markerBoundary = new RegExp('\\b(?:' + BIBLIO_MARKER_ALT + ')\\s*:');

  if (LEADING_MD_HEADING.test(working) && markerBoundary.test(working)) {
    // Drop from the leading '#' up to (but not including) the first bibliographic marker.
    working = working.replace(new RegExp('^#{1,6}\\s+[\\s\\S]*?(?=\\b(?:' + BIBLIO_MARKER_ALT + ')\\s*:)'), '');
  } else if (LEADING_MD_HEADING.test(working) && !markerBoundary.test(working)) {
    // A leading heading with NO bibliographic marker following: drop ONLY the bare heading marker token(s)
    // ('#'+spaces), keeping the heading TEXT (it may be a substantive sentence). Faithful: removes formatting,
    // not content.
    working = working.replace(/^#{1,6}\s+/, '');
  }

  // (a2) A "--- <SECTION> ---" / "---" rule separator marks the end of the LEADING bibliographic header block
  //      and the start of the factual body (the curated corpus emits e.g. "Source: ... Fetched: ...
  //      --- ABSTRACT (from ...) --- <prose>"). When the LEADING segment (before the first "---") contains a
  //      bibliographic marker, drop everything from the start UP TO AND INCLUDING the LEADING separator BLOCK
  //      -- the header + any "--- SECTION ---" label run -- and keep the factual body verbatim. The leading
  //      separator block is matched as one-or-more "---"-delimited runs (so "--- ABSTRACT (from x) ---" is a
  //      single block, label and all). Only the LEADING block is a boundary, and only when the preceding span
  //      is header-like, so a "---" inside the factual body is never a cut point.
  const firstDash = working.indexOf('---');

  if (firstDash >= 0 && markerBoundary.test(working.slice(0, firstDash))) {
    // Consume the leading separator block: the run of "--- ... ---" up to the start of the factual body. A
    // section label between two "---" rules (e.g. " --- ABSTRACT (from ...) --- ") is part of the block.
    const block = working.slice(firstDash).match(/^(?:\s*---[^-]*?---)+\s*|^\s*---\s*/);

    if (block != null) {
      working = working.slice(firstDash + block[0].length);
    } else {
      working = working.slice(firstDash + 3);
    }
  }

  // (b) Strip each remaining "<Marker>: <value>" run. A marker value extends from the marker UP TO the
  //     EARLIEST of: (i) the next bibliographic marker, (ii) a SENTENCE BOUNDARY that begins substantive
  //     prose, (iii) a markdown section header "## ..." / "---" separator, or (iv) the end of the string. A
  //     sentence boundary is ". " / "? " / "! " followed by a capitalized word starting a multi-word sentence
  //     -- so a factual sentence TRAILING the last metadata marker is PRESERVED (faithfulness), while a
  //     metadata value (a URL, a name list, a venue, a date ending in a year) is consumed. A date like
  //     "April 19, 2024" has no internal ". <Capital>" boundary, so it is consumed whole. Iterate until no
  //     marker remains. The sentence-boundary lookbehind requires the terminator to follow a LOWERCASE letter
  //     (a real word ending, e.g. "execution.") and the lookahead requires a capital + lowercase (a real word
  //     start) so a trailing INITIAL in an author list (e.g. "Y. Zhang", "M. Liu" -- a CAPITAL before the
  //     period) does NOT prematurely terminate an Authors value.
  const SENTENCE_BOUNDARY = '(?<=[a-z][.?!])\\s+(?=[A-Z][a-z])';
  // A date-valued marker (Submitted/Published/Submission Date/Updated/Fetched) ends in a 4-digit YEAR; the
  // factual body abuts it with NO punctuation (e.g. "Submitted: April 19, 2024 AOT-compiled Wasm ..."). So a
  // 4-digit year (optionally followed by a closing paren) followed by whitespace + a capitalized word is also
  // a value terminator. A bare year INSIDE a factual sentence is safe: this alternative is only reached while
  // consuming a marker value (the run starts at a "<Marker>:"), never inside free prose.
  const YEAR_BOUNDARY = '(?<=\\b\\d{4}\\)?)\\s+(?=[A-Z])';
  const markerRun = new RegExp(
    '\\b(?:' + BIBLIO_MARKER_ALT + ')\\s*:\\s*[\\s\\S]*?(?=' +
      '\\b(?:' + BIBLIO_MARKER_ALT + ')\\s*:' + // (i) the next marker
      '|' + SENTENCE_BOUNDARY + // (ii) a sentence boundary starting substantive prose
      '|' + YEAR_BOUNDARY + // (ii) a date value ends at its 4-digit year, prose follows
      '|\\s#{1,6}\\s' + // (iii) a markdown section header begins the body
      '|\\s---' + // (iii) a rule separator begins the body
      '|$)', // (iv) end of string
    // NO `/i` flag: the marker alternation is already case-insensitive (caseInsensitivePattern), so the
    // sentence-boundary [a-z]/[A-Z] classes stay case-SENSITIVE (an initial "Y." must NOT trip the boundary).
  );

  let guard = 0;

  while (markerRun.test(working) && guard < 64) {
    working = working.replace(markerRun, ' ');
    guard += 1;
  }

  // (c) Drop a bare-URL-only residue: if after metadata removal a token is a bare URL standing alone, remove
  //     it. Split on whitespace, drop tokens that are bare URLs ONLY when the WHOLE remaining text is URLs
  //     (a URL embedded in a factual sentence is left intact -- faithfulness). First test the whole-string
  //     bare-URL-only case, then a leading bare-URL segment.
  const collapsed = working.replace(/\s+/g, ' ').trim();

  if (BARE_URL_ONLY.test(collapsed)) {
    return '';
  }

  return collapsed;
}

// Normalized containment key for the quote-vs-excerpt dedup: case-insensitive, whitespace-collapsed, so a
// quote that is a substring of the excerpt (modulo case/whitespace) is detected regardless of surface form.
function containmentKey(text) {
  return asciiClean(text).toLowerCase().replace(/\s+/g, ' ').trim();
}

// Token set for the Jaccard overlap fallback (whitespace-split non-empty tokens over the normalized text).
function tokenSet(text) {
  return new Set(normForMatch(text).split(' ').filter(Boolean));
}

function jaccard(aSet, bSet) {
  if (aSet.size === 0 && bSet.size === 0) {
    return 0;
  }

  let inter = 0;

  for (const t of aSet) {
    if (bSet.has(t)) {
      inter += 1;
    }
  }

  const union = aSet.size + bSet.size - inter;

  return union === 0 ? 0 : inter / union;
}

// Read ONE run dir's worker claims (claims/*.json), flattened to a single array of
// { worker, source, id, text, quote, excerpt_id } records. Fail-closed via readJson (BOM-safe). A run dir
// with no claims/ dir returns [] (listJson returns [] for an absent dir) -- the caller then drops every
// cluster from that run (no recoverable evidence text).
function readRunDirWorkerClaims(runDir) {
  const claimsDir = path.join(runDir, 'claims');
  const files = listJson(claimsDir);
  const out = [];

  for (const f of files) {
    const w = readJson(path.join(claimsDir, f));

    if (w == null || typeof w !== 'object' || !Array.isArray(w.claims)) {
      throw new ContractError('readRunDirWorkerClaims: worker file missing a claims[] array: ' + f, path.join(claimsDir, f));
    }

    for (const c of w.claims) {
      if (c == null || typeof c !== 'object') {
        continue;
      }

      out.push({
        worker: w.worker,
        source: w.source,
        id: c.id,
        text: typeof c.text === 'string' ? c.text : '',
        quote: typeof c.quote === 'string' ? c.quote : '',
        excerpt_id: typeof c.excerpt_id === 'string' ? c.excerpt_id : '',
      });
    }
  }

  return out;
}

// Read one excerpt passage (excerpts/<excerpt_id>.txt), ASCII-cleaned + capped. The excerpt_id is routed
// through safeId (T-19-TRAVERSE) before it is used as a path component -- a crafted id cannot traverse out of
// the run dir. A missing/unreadable excerpt file returns '' (the quote is still emitted; only the passage is
// absent).
function readExcerptText(runDir, excerptId) {
  if (typeof excerptId !== 'string' || excerptId.length === 0) {
    return '';
  }

  const safe = safeId(excerptId, runDir);
  const excerptPath = path.join(runDir, 'excerpts', safe + '.txt');

  if (!fs.existsSync(excerptPath)) {
    return '';
  }

  let raw;

  try {
    raw = fs.readFileSync(excerptPath, 'utf8');
  } catch {
    return '';
  }

  const cleaned = asciiClean(raw);

  return cleaned.length > EXCERPT_CHAR_CAP ? cleaned.slice(0, EXCERPT_CHAR_CAP) : cleaned;
}

// Per-runDir cache of the flattened worker claims so the JOIN reads claims/*.json ONCE per run dir even when
// many clusters share a run dir. Keyed by the run-dir path. A Map (not a plain object) so an adversarial
// run-dir path string cannot collide with Object.prototype.
const workerClaimsCacheByRunDir = new Map();

function workerClaimsForRunDir(runDir) {
  if (!workerClaimsCacheByRunDir.has(runDir)) {
    workerClaimsCacheByRunDir.set(runDir, readRunDirWorkerClaims(runDir));
  }

  return workerClaimsCacheByRunDir.get(runDir);
}

// Reset the per-runDir worker-claims cache. Exported for tests that re-use a run-dir path across fixtures
// (the cache would otherwise serve stale claims for a re-written tmp dir of the same name).
export function resetEvidenceJoinCache() {
  workerClaimsCacheByRunDir.clear();
}

// ---------------------------------------------------------------------------
// joinClusterEvidence(runDir, cluster): reconstruct a survivor cluster's REAL evidence TEXT by joining
// cluster -> claims -> excerpts. For a cluster { claim, sources }:
//   1. Select the run dir's worker claims whose `source` is in cluster.sources.
//   2. Among those, MATCH the cluster claim: EXACT normalized-text match FIRST; else the highest-overlap
//      worker claim with token-Jaccard >= EVIDENCE_OVERLAP_JACCARD.
//   3. Collect the matched worker `quote` (verbatim snippet) AND its excerpts/<excerpt_id>.txt passage
//      (ASCII-cleaned + capped), de-duplicated, as [{ sentence: <text> }].
//   4. If NO worker claim matches (no recoverable evidence text), return matched:false + an empty evidence
//      array + a reason -- the caller DROPS the candidate (NEVER emits a URL or an empty packet).
// PURE function of the on-disk run dir (no network, no spend). The cluster's URL `sources` NEVER enter the
// returned evidence -- they are used ONLY to scope which worker claims are eligible. `reason` is the match
// path on success ('exact' | 'overlap') or the drop reason on failure.
// ---------------------------------------------------------------------------
export function joinClusterEvidence(runDir, cluster) {
  if (typeof runDir !== 'string' || runDir.length === 0) {
    throw new ContractError('joinClusterEvidence requires a run-dir path', 'joinClusterEvidence');
  }

  if (cluster == null || typeof cluster !== 'object') {
    throw new ContractError('joinClusterEvidence requires a cluster record', 'joinClusterEvidence');
  }

  const clusterSources = Array.isArray(cluster.sources) ? cluster.sources : [];
  const claimText = typeof cluster.claim === 'string' ? cluster.claim : '';

  // Worker claims whose source is one of the cluster's sources (the URL `sources` SCOPE the join only).
  const sourceSet = new Set(clusterSources);
  const eligible = workerClaimsForRunDir(runDir).filter((c) => sourceSet.has(c.source));

  if (eligible.length === 0) {
    return Object.freeze({ evidence: Object.freeze([]), matched: false, reason: 'no-eligible-worker-claims-for-cluster-sources' });
  }

  const wantNorm = normForMatch(claimText);

  // (a) EXACT normalized-text matches FIRST (the curated corpus case -- the cluster claim is a verbatim copy
  // of a worker claim text). There may be MORE than one (the same text from two workers) -- collect all.
  let matchedClaims = eligible.filter((c) => normForMatch(c.text) === wantNorm && wantNorm.length > 0);
  let matchPath = 'exact';

  // (b) OVERLAP fallback: the single highest-Jaccard worker claim at or above the threshold.
  if (matchedClaims.length === 0) {
    const wantSet = tokenSet(claimText);
    let best = null;
    let bestJ = 0;

    for (const c of eligible) {
      const j = jaccard(wantSet, tokenSet(c.text));

      if (j > bestJ) {
        bestJ = j;
        best = c;
      }
    }

    if (best != null && bestJ >= EVIDENCE_OVERLAP_JACCARD) {
      matchedClaims = [best];
      matchPath = 'overlap';
    }
  }

  if (matchedClaims.length === 0) {
    return Object.freeze({ evidence: Object.freeze([]), matched: false, reason: 'no-worker-claim-matched-cluster-claim' });
  }

  // Collect the matched quotes + their excerpt passages. For each matched worker claim, the VERBATIM quote
  // (the load-bearing snippet) is collected as-is (ASCII-cleaned, never metadata) and the excerpt passage is
  // run through the FAITHFUL bibliographic-metadata cleaning pass BEFORE emission (Phase 20, Plan 20-05
  // OOF-PREP). The quote/excerpt pair is then DE-DUPLICATED: if the quote text is contained in the cleaned
  // excerpt (or vice versa) under a case/whitespace-insensitive containment check, only the LONGER
  // substantive one is emitted (do not send both when one contains the other). SAFETY: if cleaning would
  // leave a matched claim with NO substantive evidence (the excerpt was only metadata), fall back to the
  // verbatim quote so a candidate that HAD real evidence is never dropped by cleaning.
  const sentences = [];
  const seen = new Set();

  const emit = (text) => {
    const clean = asciiClean(text);

    if (clean.length === 0 || seen.has(clean)) {
      return;
    }

    seen.add(clean);
    sentences.push({ sentence: clean });
  };

  for (const c of matchedClaims) {
    // The verbatim quote (load-bearing snippet) -- ASCII-cleaned only (a worker quote is factual, not a
    // bibliographic header; cleaning it would risk eating real content).
    const quoteText = asciiClean(c.quote);
    // The excerpt passage -- ASCII-cleaned + capped (readExcerptText) THEN bibliographic-metadata-stripped.
    const excerptRaw = readExcerptText(runDir, c.excerpt_id);
    const excerptText = stripBibliographicMetadata(excerptRaw);

    // QUOTE-vs-EXCERPT DEDUP (case/whitespace-insensitive containment): when one contains the other, emit
    // only the LONGER substantive one. When neither contains the other, emit both.
    const qKey = containmentKey(quoteText);
    const eKey = containmentKey(excerptText);

    const hasQuote = quoteText.length > 0;
    const hasExcerpt = excerptText.length > 0;

    if (hasQuote && hasExcerpt && qKey.length > 0 && eKey.length > 0 && (eKey.includes(qKey) || qKey.includes(eKey))) {
      // One contains the other -> keep only the LONGER substantive text (by character length).
      emit(quoteText.length >= excerptText.length ? quoteText : excerptText);
    } else {
      // SAFETY FALLBACK: if cleaning emptied the excerpt (metadata-only), the quote still carries the real
      // evidence -- emit the quote so the candidate is never left empty by cleaning. Otherwise emit both
      // distinct substantive pieces.
      if (hasExcerpt) {
        emit(excerptText);
      }

      if (hasQuote) {
        emit(quoteText);
      }

      // If the excerpt was metadata-only (hasExcerpt false) AND the quote is empty, this matched claim
      // contributed nothing; the loop continues to the next matched claim (a later claim may carry text).
    }
  }

  if (sentences.length === 0) {
    // Matched a worker claim but it carried neither a usable quote nor any substantive excerpt text after
    // faithful cleaning -> no recoverable evidence TEXT. Flag + drop (never emit an empty packet). This is the
    // SAME drop the pre-clean join produced for a quote-less + excerpt-less match -- cleaning never INCREASES
    // droppedNoEvidence because the verbatim quote (never cleaned away) is the fallback whenever it exists.
    return Object.freeze({ evidence: Object.freeze([]), matched: false, reason: 'matched-but-no-recoverable-text' });
  }

  return Object.freeze({ evidence: Object.freeze(sentences.map((s) => Object.freeze(s))), matched: true, reason: matchPath });
}
