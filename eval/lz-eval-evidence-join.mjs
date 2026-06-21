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
// BIBLIOGRAPHIC HEADER NOISE -- "Source: <url>", "Title: ...", "Authors: ...", "Published: ...", "Status: ...",
// venue/acceptance lines ("Accepted by SANER 2025", "To appear in ..."), "Submission Date: ...", "DOI: ...",
// "arXiv: ..." id lines, markdown SECTION headings ("# <doc title>", "## Abstract", "## Key Overview",
// "## Introduction", "## Conclusion", any "#"/"##"/"###" heading), bare-URL-only lines -- that is METADATA and
// STRUCTURAL noise, not factual evidence. The OOF judges "does this EVIDENCE entail the CLAIM?"; bibliographic
// metadata + section labels are non-adjudicable noise that Copilot pays per-token to read AND that buries the
// real support, splitting entailment judgments on noise. This pass STRIPS that metadata BEFORE the evidence is
// emitted (before any scored vote / freeze -> pre-registration-clean). It is FAITHFUL: it removes ONLY metadata
// lines/segments + section-heading labels + normalizes whitespace; it NEVER fabricates, paraphrases, or removes
// a substantive factual sentence.
//
// THE CLEANING RULE (pre-registration-relevant -- documented in the SUMMARY):
//   1. LINE PASS (when the raw passage still has newlines): split on lines; drop any line that IS a markdown
//      heading ("#{1,6} <label>") or a whole-line bibliographic marker ("<Marker>: <value>"); keep factual
//      lines verbatim. Then collapse the surviving lines to one ASCII-clean string.
//   2. SEGMENT PASS (always, on the collapsed string -- catches headers/headings already collapsed inline):
//        - drop a "<Marker>:" run where Marker is one of the BIBLIO_MARKERS (case-insensitive), consuming the
//          value up to the next marker / a sentence boundary / a section header / end;
//        - drop any markdown heading run "#{1,6} <label>" wherever it appears (leading OR embedded after a
//          prior collapse), consuming the heading label up to the start of the factual sentence;
//        - drop a venue/acceptance segment ("Accepted by/at ...", "To appear in ...", "Published in ...");
//        - drop a bare-URL-only segment (the whole segment is a single http(s) URL with no surrounding prose).
//   3. Keep ALL substantive factual sentences verbatim (only whitespace re-normalized).
// The markers are matched ONLY at a unit boundary (line start / leading segment / after a prior metadata
// marker / heading boundary) so a factual sentence that merely CONTAINS the word "source"/"title" mid-sentence
// is NEVER removed.
// ---------------------------------------------------------------------------

// The bibliographic marker labels (case-insensitive), matched as "<Marker>:" at a segment boundary. The set
// reflects the metadata markers actually emitted into the curated corpus's excerpt headers (verified against
// the real .lz-research corpus) PLUS the markers named in the Plan 20-05 OOF-PREP objective: Source / Source
// URL / Title / Authors / Author / Published / Submitted / Submission Date / Updated / Fetched / Fetched from /
// Status / Category / Subject Areas / Journal / Publication / Article Identifier / arXiv / arXiv identifier /
// DOI. Each value is consumed up to the next marker, a sentence boundary, a section header, or end (see
// stripBibliographicMetadata). Only METADATA labels appear here; content labels actually used as factual
// sentence prefixes in the corpus (e.g. "Key Finding:", "Clinical Efficacy:", "Mechanisms of Action:") are
// DELIBERATELY EXCLUDED so a factual line is never eaten. Multi-word labels are matched verbatim (the regex
// below escapes none of these because they are alphanumeric + single spaces only).
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
  'Fetched from',
  'Fetched',
  'Status',
  'Category',
  'Subject Areas',
  'Journal',
  'Publication',
  'Article Identifier',
  'arXiv identifier',
  'arXiv',
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

// A leading markdown heading "# <title>" (one-or-more '#' then a space then the heading text), used by the
// segment pass on a collapsed single-line string. A LEADING heading (the document title) and any embedded
// "## <section>" heading run are stripped (see the (a)/(a3) blocks below).
const LEADING_MD_HEADING = /^#{1,6}\s+\S/;

// A WHOLE-LINE markdown heading "#{1,6} <label>" (line pass): the entire line is a heading. The label after
// the '#'s is captured so a heading can be dropped wholesale. Used by stripHeadingAndMarkerLines on the RAW
// (pre-collapse) passage where a heading is unambiguously its own line.
const WHOLE_LINE_MD_HEADING = /^\s*#{1,6}\s+\S/;

// A WHOLE-LINE bibliographic marker "<Marker>: <value>" (line pass): the line STARTS with a metadata marker.
// Built case-insensitively WITHOUT the /i flag (consistent with caseInsensitivePattern). Anchored at line
// start so a factual line that merely mentions a marker word mid-line is never dropped.
const WHOLE_LINE_BIBLIO_MARKER = new RegExp('^\\s*(?:' + BIBLIO_MARKER_ALT + ')\\s*:');

// A venue / acceptance segment (the Plan 20-05 objective): "Accepted by <venue>", "Accepted at <venue>",
// "To appear in <venue>", "Published in <venue>". These are publication-status metadata, not factual evidence.
// Matched at a segment boundary (start, or after a sentence boundary) and consumed up to the next sentence
// boundary / marker / section header / end. The phrase head is fixed (case-insensitive) so a factual sentence
// is never mistaken for a venue line.
const VENUE_HEAD = '(?:' +
  caseInsensitivePattern('Accepted by') + '|' +
  caseInsensitivePattern('Accepted at') + '|' +
  caseInsensitivePattern('To appear in') + '|' +
  caseInsensitivePattern('Published in') +
  ')';

// LINE PASS (Phase 20, Plan 20-05 OOF-PREP): when the RAW excerpt still has newlines, drop whole-line markdown
// headings ("#{1,6} <label>") and whole-line bibliographic markers ("<Marker>: <value>") -- where a heading or
// a header is unambiguously its OWN line -- BEFORE the whitespace collapse. This is the faithful, deterministic
// way to strip the "## Abstract" / "## Key Overview" / "## Introduction" / "## Conclusion" section labels that
// litter the curated corpus (568 headings across the corpus): on the raw text each is a standalone line, so
// removing the line removes the label WITHOUT touching the factual sentence on the next line. A factual line is
// never a markdown-heading line and never STARTS with a metadata marker, so it survives verbatim. Returns the
// surviving factual lines joined by a single newline (the caller then ASCII-cleans + collapses).
function stripHeadingAndMarkerLines(rawText) {
  const raw = String(rawText == null ? '' : rawText);

  // Only meaningful when there are real line breaks; a single collapsed line is handled by the segment pass.
  if (!/[\r\n]/.test(raw)) {
    return raw;
  }

  const kept = [];

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      continue;
    }

    // Drop a whole-line markdown heading (a section label / doc title on its own line).
    if (WHOLE_LINE_MD_HEADING.test(line)) {
      continue;
    }

    // Drop a whole-line bibliographic marker line ("Source: ...", "Status: ...", "DOI: ...", "Submission Date:
    // ...", etc.). The line STARTS with the marker, so a factual line mentioning the word mid-line survives.
    if (WHOLE_LINE_BIBLIO_MARKER.test(line)) {
      continue;
    }

    kept.push(trimmed);
  }

  return kept.join('\n');
}

// Strip bibliographic metadata from an evidence string. Accepts either the RAW multi-line excerpt (preferred --
// the line pass then removes whole-line headings/markers faithfully) OR an already-collapsed single line (the
// segment pass below handles inline headers/headings). Returns the substantive factual text (metadata removed,
// whitespace re-normalized). FAITHFUL: removes only metadata segments + section-heading labels; never
// fabricates / paraphrases / removes a factual sentence.
function stripBibliographicMetadata(text) {
  // (0) LINE PASS first (no-op on a single collapsed line), then ASCII-clean + collapse.
  const input = asciiClean(stripHeadingAndMarkerLines(text));

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

  // (a2) A "--- <SECTION LABEL> ---" rule-separator block is a STRUCTURAL section label (the curated corpus
  //      emits e.g. "--- ABSTRACT (from arxiv.org/abs/...) ---" between the header and the factual body). It is
  //      noise like a markdown heading, so it is stripped wherever it appears: a "---" rule, optionally followed
  //      by a short section label and a closing "---" rule. FAITHFUL scoping: a "---" rule must be at a
  //      whitespace/boundary unit (so a numeric range or em-dash glued to a word inside prose, e.g. "5---10", is
  //      NOT a separator). The captured label is the title between the two rules; it is dropped with the rules.
  //      A LONE leading "---" (the header/body divider after the line pass removed the header lines) is also
  //      dropped. Iterate so multiple stacked section labels are all consumed.
  const sectionBlock = /(?:^|\s)---(?:[^-][\s\S]*?---)?(?=\s|$)/;
  let sectionGuard = 0;

  while (sectionBlock.test(working) && sectionGuard < 64) {
    working = working.replace(sectionBlock, ' ');
    sectionGuard += 1;
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

  // (b2) Strip a VENUE / ACCEPTANCE segment ("Accepted by/at <venue>", "To appear in <venue>", "Published in
  //      <venue>") wherever it appears as a segment: consume the venue head + its value up to the EARLIEST of a
  //      sentence boundary, the next bibliographic marker, a section header, or end. The phrase head is a fixed
  //      case-insensitive prefix, so a factual sentence is never mistaken for a venue line. Iterate until none
  //      remain.
  const venueRun = new RegExp(
    '\\b' + VENUE_HEAD + '\\b[\\s\\S]*?(?=' +
      '\\b(?:' + BIBLIO_MARKER_ALT + ')\\s*:' + // the next marker
      '|' + SENTENCE_BOUNDARY + // a sentence boundary starting substantive prose
      '|' + YEAR_BOUNDARY + // a venue line ending in a 4-digit year, prose follows
      '|\\s#{1,6}\\s' + // a markdown section header begins the body
      '|\\s---' + // a rule separator begins the body
      '|$)', // end of string
  );

  let venueGuard = 0;

  while (venueRun.test(working) && venueGuard < 64) {
    working = working.replace(venueRun, ' ');
    venueGuard += 1;
  }

  // (a3) Strip INLINE markdown section-heading runs that survived collapse ("... ## Abstract / Key Overview
  //      <factual sentence>"). A heading run is "#{1,6} <label>" where the label is the heading title up to the
  //      start of the factual body. The factual body begins at the EARLIEST of: the next "#{1,6}" heading, a
  //      bibliographic marker, a "---" separator, or a SENTENCE START (a Capitalized word that begins a clause
  //      ending in sentence punctuation -- detected as ". " mid-run is NOT present in a bare label, so the body
  //      is the remainder after the contiguous Title-Case heading words). To stay FAITHFUL and deterministic,
  //      consume the heading marker + the contiguous run of heading-label tokens (Capitalized words, slashes,
  //      digits, parens) and STOP at the first token that begins a normal sentence flow -- i.e. the first
  //      lowercase-led token OR a Capitalized token followed later by sentence punctuation within the clause.
  //      Conservative form: drop "#{1,6}" + the immediate Title-Case label words (each starting Uppercase or a
  //      non-alpha label char), stopping at the first lowercase-initial word (the prose almost always continues
  //      with articles/verbs, but a heading like "## Abstract" is followed by a Capitalized sentence -- handled
  //      by stopping the label at the LAST Title-Case word before a word that is followed by a lowercase word,
  //      i.e. a real sentence). Simpler + safe: strip "#{1,6}\s+" and the label up to the first sentence that
  //      contains internal lowercase prose. Implemented as: from each "#{1,6}", drop up to the start of the
  //      first run of >=3 consecutive words where a lowercase-led word appears (sentence prose), else to end.
  const inlineHeading = /#{1,6}\s+(?:[^\s][^\s]*\s+)*?(?=[A-Z][a-z']+\s+[a-z])/;
  let headingGuard = 0;

  while (inlineHeading.test(working) && headingGuard < 64) {
    working = working.replace(inlineHeading, ' ');
    headingGuard += 1;
  }

  // Any residual lone "#{1,6}" marker tokens (a heading whose label ran to end, or a heading with no following
  // prose) -- drop the bare marker token, keep any remaining label text (faithful: removes formatting only).
  // FAITHFUL SCOPING (PACKAGING-FIX2): a markdown heading marker is ONLY ever a '#' run at a UNIT BOUNDARY (the
  // start of the string, or after whitespace). A '#' that is GLUED to a preceding word char is CONTENT -- it is
  // part of a token like "C#", "F#", "A#" -- and must be PRESERVED. The prior `\s*#{1,6}\s+` matched a glued
  // "C# " (the `\s*` matched zero spaces), corrupting "C#" -> "C". Anchoring the run to "(?:^|\s)" leaves a
  // content '#' intact while still stripping a real leading/embedded heading marker. The capture restores the
  // single boundary space the run consumed so adjacent words stay separated.
  working = working.replace(/(^|\s)#{1,6}\s+/g, '$1');

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

// A generous RAW read bound: an excerpt file can be tens of KB. The line pass + bibliographic strip need the
// RAW (newline-bearing) text to remove whole-line headings/markers faithfully, so the collapse-to-single-line
// happens INSIDE the cleaner, not here. To bound memory we read at most EXCERPT_RAW_READ_CAP raw bytes (a wide
// multiple of EXCERPT_CHAR_CAP, since front-matter stripping shrinks the text); the FINAL substantive text is
// then capped at EXCERPT_CHAR_CAP by the caller AFTER cleaning.
const EXCERPT_RAW_READ_CAP = EXCERPT_CHAR_CAP * 8;

// Read one excerpt passage (excerpts/<excerpt_id>.txt) as RAW text (newlines preserved for the line pass),
// bounded to EXCERPT_RAW_READ_CAP raw chars. The excerpt_id is routed through safeId (T-19-TRAVERSE) before it
// is used as a path component -- a crafted id cannot traverse out of the run dir. A missing/unreadable excerpt
// file returns '' (the quote is still emitted; only the passage is absent). The ASCII clean + whitespace
// collapse + the EXCERPT_CHAR_CAP truncation are applied DOWNSTREAM (stripBibliographicMetadata collapses; the
// join caps the cleaned result), so the RAW newline structure survives into the line pass.
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

  return raw.length > EXCERPT_RAW_READ_CAP ? raw.slice(0, EXCERPT_RAW_READ_CAP) : raw;
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

  // Collect evidence QUOTE-PRIMARY (Phase 20, Plan 20-05 OOF-PREP + PACKAGING-FIX2). For each matched worker
  // claim:
  //   1. The VERBATIM quote (the load-bearing snippet the claim was extracted from, quote_fidelity: verified)
  //      is the FIRST, primary evidence -- ASCII-cleaned only (a worker quote is factual, not a bibliographic
  //      header; cleaning it would risk eating real content). It is the most relevant + token-lean support, so
  //      it LEADS the evidence array (quote-primary ORDERING for relevance).
  //   2. The excerpt passage is SECONDARY context: read RAW, run through the FAITHFUL bibliographic + section-
  //      heading cleaning pass, then capped at EXCERPT_CHAR_CAP. It is included whenever it carries substantive
  //      content the quote does NOT already FULLY contain.
  // FAITHFUL DEDUP (PACKAGING-FIX2): the token savings come from the METADATA STRIP (above), NOT from dropping
  // a superset excerpt's extra facts. The ONLY case in which the excerpt is dropped is total redundancy -- when
  // the verified quote ALREADY contains the WHOLE cleaned excerpt (quote-contains-excerpt). When the cleaned
  // excerpt is a SUPERSET of the quote (it restates the quote PLUS extra factual sentences -- the corpus-
  // dominant case ~53%) OR is DISTINCT from the quote, the excerpt is kept in FULL as secondary context, so its
  // extra facts (measured rates, named entities, scaling-law statements) survive for the OOF entailment read. A
  // substantive sentence is NEVER dropped; only an excerpt wholly subsumed by the quote is.
  // SAFETY / FAITHFULNESS: the quote is emitted whenever it exists, so a candidate that HAD real evidence is
  // NEVER emptied by cleaning (droppedNoEvidence cannot increase vs the pre-clean join). When the quote is
  // absent (rare), the cleaned excerpt stands alone as the evidence.
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
    // (1) The verbatim quote -- PRIMARY evidence, emitted FIRST.
    const quoteText = asciiClean(c.quote);
    const hasQuote = quoteText.length > 0;

    if (hasQuote) {
      emit(quoteText);
    }

    // (2) The excerpt passage -- SECONDARY: raw -> faithful clean -> cap at EXCERPT_CHAR_CAP.
    const excerptRaw = readExcerptText(runDir, c.excerpt_id);
    const excerptClean = stripBibliographicMetadata(excerptRaw);
    const excerptText = excerptClean.length > EXCERPT_CHAR_CAP ? excerptClean.slice(0, EXCERPT_CHAR_CAP) : excerptClean;
    const hasExcerpt = excerptText.length > 0;

    if (!hasExcerpt) {
      // Metadata-only excerpt (cleaning emptied it) -> the quote already carries the evidence; nothing to add.
      continue;
    }

    // QUOTE-vs-EXCERPT DEDUP (case/whitespace-insensitive, FAITHFUL -- PACKAGING-FIX2). The quote is the
    // PRIMARY, verified, token-lean support and ALWAYS leads (emitted above). The excerpt is kept as SECONDARY
    // context UNLESS it is TOTALLY redundant -- i.e. the verified quote ALREADY contains the WHOLE cleaned
    // excerpt (quote-contains-excerpt). This is the ONLY drop direction:
    //   - quote CONTAINS the excerpt body (or identical) -> the excerpt is fully subsumed; the lean quote
    //     already carries every word of it -> drop the redundant excerpt.
    //   - excerpt CONTAINS the quote (a SUPERSET) -> the excerpt restates the quote PLUS extra factual
    //     sentences (the corpus-dominant case). Those extra facts are LOAD-BEARING for the OOF entailment read,
    //     so the excerpt is KEPT IN FULL -- the verified quote leads (relevance), the superset follows
    //     (faithfulness). The redundant overlap of the quote words is a small, acceptable token cost; dropping
    //     the superset would LOSE the extra facts (the BLOCKER this fix repairs).
    //   - NEITHER contains the other (DISTINCT) -> the excerpt is kept in full.
    // FAITHFUL: a substantive sentence is NEVER dropped; only an excerpt WHOLLY subsumed by the quote is.
    // droppedNoEvidence cannot increase: a candidate is dropped only when it has neither a quote nor any
    // substantive excerpt text after cleaning. The token savings come from the METADATA STRIP above, NOT from
    // discarding superset facts.
    const qKey = containmentKey(quoteText);
    const eKey = containmentKey(excerptText);

    if (hasQuote && qKey.length > 0 && eKey.length > 0 && qKey.includes(eKey)) {
      // The verified quote ALREADY contains the WHOLE cleaned excerpt -> the excerpt adds nothing; drop it.
      // (The reverse -- a superset excerpt that contains the quote -- is NOT dropped: its extra facts survive.)
      continue;
    }

    emit(excerptText);
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
