// lz-eval-p23-citation-audit.mjs
//
// NET-NEW (Plan 23-01, Task 1; NO-SPEND): the OFF-MODEL ENV-04 citation audit -- the format-agnostic
// identifier canonicalizer and its frozen normalization constants. THE AUTHORITY is
// 23-CONTEXT.md (D-02/D-12/D-13/D-19) + eval/lz-eval-p23-prereg.md. The frozen normalization RULES live
// in the pre-registration; this file IMPLEMENTS them. If the two ever disagree, the pre-registration is
// the record of what was frozen and this file is wrong.
//
// COMPLETED in Plan 23-03, Task 1 (NO-SPEND, NO NETWORK): extractCitationTokens,
// normalizeForQuoteMatch, quoteMatches, countUncitedUnits, auditReport and a guarded thin CLI now sit
// beside the Plan 23-01 slice, in the same idiom. The header block, the three frozen constants and
// canonicalizeCitation are UNCHANGED from the 23-01 commit -- the frozen rules predate every rate this
// module can compute, which is checkable from `git log` ordering alone.
//
// WHAT THIS MODULE MEASURES, AND WHAT IT DOES NOT (Pitfall 2, and the construct error that voided
// Phases 19 through 22): countUncitedUnits is a STRUCTURAL count and its label says so -- it measures
// citation COVERAGE. A factual-support measure was NOT computed and cannot be, by constraint: every
// published implementation of one decomposes claims with a model and then judges support with a model or
// an entailment scorer, and Phase 23 has no judge. Do not reword the uncited-unit count as factual
// support, groundedness or verification. That relabelling IS the failure mode, not a wording preference.
//
// NO NETWORK, DELIBERATELY: this module performs no outbound request of any kind. Its co-test runs with
// the global fetch replaced by a throwing stub and still exits 0, which is the strongest available
// guarantee that the offline rates are reproducible. Link resolvability lives in the SEPARATE module
// eval/lz-eval-p23-resolvability.mjs (D-12 as revised 2026-09-07: live re-fetch is used ONLY for
// resolvability and is reported separately with its check date). This module never imports that one.
//
// WHY A CANONICALIZER AT ALL (D-13 + the format-sensitive-citation-metric anti-pattern): the two systems
// under comparison cite differently. The built-in emits numbered references to bare arXiv identifiers in
// prose (0 inline URLs in the q1 report); lz emits full inline URLs. Without collapsing both surface
// forms of the same source to ONE identifier, every URL-counting-shaped metric silently favours lz --
// which would make the comparative reading a format artifact rather than a measurement. This is frozen
// BEFORE any rate is computed, which is the only ordering under which the rule cannot be tuned to a
// result.
//
// FAIL-CLOSED, AND NOTHING IS DROPPED (T-23-01 discipline): a non-string token is a ContractError. A
// token that matches no rule is NOT discarded -- it is returned under the `raw:` prefix so the caller
// can REPORT it in the unmatched bucket. A silently dropped token would deflate the denominator of any
// later coverage figure.
//
// NFC, NEVER NFKC: the input is normalized with normalize('NFC') only. UAX #15 warns against blind NFKC
// application -- NFKC folds compatibility characters (ligatures, full-width forms, superscripts) and
// would silently rewrite identifier text.
//
// NO PACKAGE (D-10): `URL` and `String.prototype.normalize` are built in. This module adds no
// dependency, performs NO network request and makes NO model call.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in
// the distributed plugin tree. It imports the SHIPPED runtime aggregator's ContractError ACROSS trees by
// relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval). It has NO out-of-family
// transport (D-18).
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md); LF line
// endings. The DATA it processes is Unicode; this SOURCE is not.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Cross-tree reuse of the SHIPPED runtime aggregator's fail-closed signal (D-10; eval -> runtime,
// one-directional, never the reverse).
import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// ---------------------------------------------------------------------------
// ARXIV_RE: the arXiv identifier rule (D-13). The token must be an `arxiv:` / `arXiv ` prefixed
// identifier or an `arxiv.org/{abs,pdf,html}/` URL path -- one of the two -- and the WHOLE token must be
// that and nothing else. Group 1 captures the NNNN.NNNNN identifier; a trailing `vN` version suffix and
// a `.pdf` extension are tolerated. The version suffix is deliberately NOT part of the identifier: v1
// and v2 of one paper are one source.
//
// ANCHORED, AND THE PREFIX IS REQUIRED (23-REVIEW.md CR-03). The rule used to make the whole prefix
// alternation OPTIONAL with no `\b` or anchor around the captured group, so any token holding an
// NNNN.NNNN substring ANYWHERE became an arXiv identifier: `10.1145/3442188.3445922` canonicalized to
// `arxiv:2188.34459`, which (a) made DOI_RE unreachable for the ACM and Springer shapes, (b) merged two
// DISTINCT DOIs onto one identifier because they happened to share the digit window the engine landed
// on, and (c) collapsed unrelated URLs such as `https://other.example/2023.12345-x` onto a real arXiv
// paper. The identity rule the doc always stated is the right one; it simply was not enforced.
//
// A BARE identifier in prose is still recognized -- by BARE_ARXIV_SCAN_RE, which finds it and emits an
// explicit `arxiv:<id>` token for this rule to accept. The scanner asserts the identity; the
// canonicalizer no longer infers it from a digit shape.
//
// THE HOST RULE ADMITS ANY arxiv.org SUBDOMAIN, and that is not incidental. The realized lz q2 report
// cites paper 2508.16785 BOTH as a bare identifier and as the ar5iv mirror URL
// `https://ar5iv.labs.arxiv.org/html/2508.16785`. The unanchored rule merged the two by accident, as a
// substring match; a `(?:www\.)?arxiv\.org` host rule would split them and move the published
// unique-source count from 12 to 13. `ar5iv.labs.arxiv.org/html/<id>` IS arXiv paper `<id>`, so the
// merge is the right answer on identity grounds, and the subdomain form states it deliberately. The
// anchor still holds: `arxiv.org.evil.example/abs/1234.5678` and `evilarxiv.org/abs/...` both fail,
// because the host must be followed immediately by `/{abs,pdf,html}/` and preceded only by
// dot-terminated labels.
// ---------------------------------------------------------------------------
// Object.freeze so the rule cannot be mutated in place by a later import (anti-drift, T-23-02c).
export const ARXIV_RE = Object.freeze(
  /^(?:arxiv[:\s]*|(?:https?:\/\/)?(?:[a-z0-9-]+\.)*arxiv\.org\/(?:abs|pdf|html)\/)(\d{4}\.\d{4,5})(v\d+)?(?:\.pdf)?$/i,
);

// ---------------------------------------------------------------------------
// DOI_RE: the DOI rule (D-13). A DOI is `10.<registrant>/<suffix>`; the suffix runs to the first
// whitespace, quote, angle bracket or closing paren/bracket, because report prose wraps DOIs in those.
// Trailing sentence punctuation is stripped by the caller below -- a DOI at the end of a sentence must
// not carry the period into the identifier.
// ---------------------------------------------------------------------------
export const DOI_RE = Object.freeze(/\b(10\.\d{4,9}\/[^\s"<>)\]]+)/i);

// ---------------------------------------------------------------------------
// KEEP_PARAMS: the query-parameter ALLOWLIST (D-13). Query filtering is allowlist-INVERSION: everything
// not named here is dropped. A denylist of known trackers cannot work -- there is no closed set of them,
// and one unlisted `utm_*` or `ref` variant makes two citations of ONE page look like two sources.
// These three are kept because they can select the resource itself (`id`, `v`, `page`) rather than
// describe how the reader arrived at it.
// ---------------------------------------------------------------------------
export const KEEP_PARAMS = Object.freeze(['id', 'v', 'page']);

// ---------------------------------------------------------------------------
// canonicalizeCitation(rawToken) -- map ONE raw citation token to a single system-agnostic identifier.
//
// Rule order is frozen and required: DOI, then arXiv, then URL, then the `raw:` fallback bucket. Both
// identifier rules precede URL so that `https://arxiv.org/abs/2306.15595` and the bare
// `arXiv 2306.15595` produce the SAME value; if URL ran first the two forms would never converge and
// the whole comparison would be format-sensitive again.
//
// DOI now runs FIRST (23-REVIEW.md CR-03). ARXIV_RE being anchored is what actually stops a DOI being
// read as an arXiv identifier; testing DOI first is the second line of defense, so a future widening of
// the arXiv rule cannot make the DOI rule unreachable again. No arXiv surface form can match DOI_RE --
// it requires a literal `10.<4-9 digits>/` prefix.
//
// The URL branch lowers the scheme (it is not part of the identity -- one page served over http and
// https is one source), lowers the host, strips a leading `www.`, drops the fragment (a same-page anchor
// is not a different source), drops trailing slashes, and filters the query through KEEP_PARAMS with
// the survivors sorted so parameter order cannot vary the identifier.
//
// Returns a prefixed string: `arxiv:<id>` | `doi:<id>` | `url:<host><path>[?<params>]` | `raw:<token>`.
// A non-string input is a ContractError -- coercing null to the string "null" would mint a fake
// identifier.
// ---------------------------------------------------------------------------
export function canonicalizeCitation(rawToken) {
  if (typeof rawToken !== 'string') {
    throw new ContractError(
      'canonicalizeCitation requires the raw citation token as a string: ' + JSON.stringify(rawToken),
      'canonicalizeCitation',
    );
  }

  // NFC only -- never NFKC (UAX #15).
  const token = rawToken.normalize('NFC').trim();

  const doi = token.match(DOI_RE);

  if (doi) {
    return 'doi:' + doi[1].toLowerCase().replace(/[.,;)\]]+$/, '');
  }

  const arxiv = token.match(ARXIV_RE);

  if (arxiv) {
    return 'arxiv:' + arxiv[1];
  }

  // The built-in emits scheme-less host/path forms (e.g. blog.eleuther.ai/yarn); supply a scheme so
  // `new URL` can parse them, then discard it -- the scheme is not part of the identity.
  const withScheme = /^https?:\/\//i.test(token) ? token : 'https://' + token;

  let url;

  try {
    url = new URL(withScheme);
  } catch {
    // Unmatched -- REPORTED under raw:, never dropped (it belongs in the unmatched bucket).
    return 'raw:' + token.toLowerCase();
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const params = [...url.searchParams.entries()]
    .filter(([key]) => KEEP_PARAMS.includes(key))
    .map(([key, value]) => key + '=' + value)
    .sort()
    .join('&');
  const pathname = url.pathname.replace(/\/+$/, '');

  return 'url:' + host + pathname + (params ? '?' + params : '');
}

// ---------------------------------------------------------------------------
// UNCITED -- the frozen knobs of the STRUCTURAL unit rule (D-13; RESEARCH Pattern 2(E)).
//
// WHAT IT MEASURES: citation COVERAGE. A "unit" is a sentence-level text unit inside the report's body
// sections. A unit is CITED when it contains a citation token, or when a citation token appears at the
// end of its containing paragraph -- the published passage-level attribution rule: "When a citation
// appears at the end of a passage, it applies to all preceding uncited sentences in that passage"
// [CITED: arXiv 2605.06635 s3.2]. Headings, tables, fenced code and the bibliography section are
// EXCLUDED from the unit population.
//
// WHAT IT DOES NOT MEASURE: factual support. See the module header.
// ---------------------------------------------------------------------------
export const UNCITED = Object.freeze({
  // Bibliography-heading rule. It tolerates a leading enumerator because both q1 reports need one:
  // the built-in writes "## Sources (all carry verified claims)", lz writes "## (e) Sources".
  BIBLIOGRAPHY_HEADING_RE:
    /^#{1,6}\s*(?:\(?[a-z0-9]{1,3}[).]\s*)?(?:complete\s+)?(?:sources|references|bibliography|works\s+cited)\b/i,
  // Sentence split: [.?!] followed by whitespace plus an opening character (RESEARCH 2(E)).
  SENTENCE_SPLIT_RE: /(?<=[.?!])\s+(?=["'*`(\[]?[A-Z])/,
  // A [n-m] marker range wider than this is prose, not a citation range.
  MAX_RANGE_SPAN: 32,
  LABEL:
    'citation COVERAGE (structural: a citation token in the unit, or at the end of its paragraph) -- NOT factual support, NOT groundedness, NOT verification',
  QUOTE_LABEL:
    'verbatim-quote match against STORED excerpts (D-12 as revised 2026-09-07) -- a SINGLE-SYSTEM diagnostic wherever only one side retained a corpus (D-18: a RETENTION failure, not a structural property)',
});

// ---------------------------------------------------------------------------
// Token scanners (module-local, NOT exported -- the exported constants are the frozen RULES; these are
// their global-flag scanning forms, built from the same sources so there is one rule of record).
//
// Rule (A) of the frozen set: handle the forms the published Markdown-report citation parser handles --
// numbered references, footnote-style references, inline Markdown links, autolinks and ranges
// [CITED: arXiv 2605.06635 s3.2] -- plus the two forms these two reports need and that list omits: a
// bare arXiv identifier in prose (the built-in's form) and a scheme-less host/path string.
// ---------------------------------------------------------------------------
const MARKER_SCAN_RE = /\[(\d{1,3})(?:\s*-\s*(\d{1,3}))?\]/g;
const FOOTNOTE_SCAN_RE = /\[\^([^\]\s]+)\]/g;
const FOOTNOTE_DEF_RE = /^\s*\[\^([^\]\s]+)\]:\s*(.+)$/;
const MD_LINK_SCAN_RE = /\[[^\]]*\]\(\s*(\S+?)\s*\)/g;
const AUTOLINK_SCAN_RE = /<((?:https?:\/\/|www\.)[^>\s]+)>/g;
const BARE_URL_SCAN_RE = /https?:\/\/[^\s"'<>)\]},]+/g;
// A scheme-less host/path string. The label before the slash must be alphabetic so version strings
// (Llama-3.1-8B/70B) and ratios cannot be mistaken for hosts.
const HOST_PATH_SCAN_RE = /\b(?:[a-z0-9-]+\.)+[a-z]{2,24}\/[^\s"'<>)\]},]+/gi;
// The bare-arXiv-in-prose form (the built-in's). Group 1 is the identifier, so scannedToken below can
// hand ARXIV_RE an explicit `arxiv:<id>` token: since CR-03 the canonicalizer's arXiv branch REQUIRES
// the prefix, and it is this scanner -- not a digit shape -- that asserts the identity.
//
// THE LEADING LOOKBEHIND CARRIES THE SAME DISCIPLINE AS THE ANCHOR ON ARXIV_RE (23-REVIEW.md CR-03).
// `\b` alone let the scanner slide INTO a longer token: `10.1007/2023.12345` and
// `https://other.example/2023.12345-x` each emitted a spurious `arxiv:2023.12345` ALONGSIDE their real
// identifier, so anchoring the canonicalizer without anchoring the scanner would have left half the
// finding open. A bare identifier counts only where it starts a token -- not where it is a substring of
// a DOI suffix or a URL path. The trailing side stays `\b` on purpose: a sentence-final
// `... arXiv 2306.15595.` must still be found, so the period may follow.
const BARE_ARXIV_SCAN_RE = /(?:arxiv[:\s]*)?(?<![\w./-])(\d{4}\.\d{4,5})(?:v\d+)?\b/gi;
const DOI_SCAN_RE = /\b10\.\d{4,9}\/[^\s"<>)\]]+/gi;

// One scanner match -> the token handed to canonicalizeCitation. Every scanner but the bare-arXiv one
// yields a token that already carries its own identity (a URL, a DOI, a host/path); the bare-arXiv
// scanner deliberately matches an identifier with NO prefix, so it states the identity explicitly here.
function scannedToken(scanner, match) {
  if (scanner === BARE_ARXIV_SCAN_RE) {
    return 'arxiv:' + match[1];
  }

  return match[1] === undefined ? match[0] : match[1];
}

// Every scanner that can stand alone as evidence that a text unit carries a citation.
const PRESENCE_SCANNERS = Object.freeze([
  MARKER_SCAN_RE,
  FOOTNOTE_SCAN_RE,
  MD_LINK_SCAN_RE,
  AUTOLINK_SCAN_RE,
  BARE_URL_SCAN_RE,
  HOST_PATH_SCAN_RE,
  BARE_ARXIV_SCAN_RE,
  DOI_SCAN_RE,
]);

function requireString(value, what, where) {
  if (typeof value !== 'string') {
    throw new ContractError(where + ' requires ' + what + ' as a string: ' + JSON.stringify(value), where);
  }
}

// Normalize line endings and collapse HORIZONTAL whitespace runs (spaces, tabs, the non-breaking
// space) to a single space. Newlines survive on purpose: the bibliography split, the paragraph split
// and the table/heading exclusions are all line-structural.
function normalizeReportText(reportText) {
  return reportText.normalize('NFC').replace(/\r\n?/g, '\n').replace(/[ \t\u00A0\u2007\u202F]+/g, ' ');
}

// Strip fenced code sections BEFORE any matching, so a URL inside a fence is not a citation
// [CITED: arXiv 2605.06635 s3.2 -- "Code block removal strips fenced code sections to prevent false
// citation matches"].
//
// EXPORTED so lz-eval-p23-verify-complete.mjs can REUSE it rather than carry a second implementation
// (23-REVIEW.md CR-04). Its ledger-heading scan had no fence handling at all, so a heading quoted
// inside a fence GOVERNED the verdict and demoted the real ledger to `duplicateLedgerHeadings`. The two
// modules must not diverge on what a fence is, which is why this is a shared export and not a copy.
export function stripFencedCode(text) {
  const kept = [];
  let fenceChar = null;

  for (const line of text.split('\n')) {
    const fence = line.match(/^\s*(`{3,}|~{3,})/);

    if (fenceChar === null) {
      if (fence) {
        fenceChar = fence[1][0];
        continue;
      }

      kept.push(line);
      continue;
    }

    if (fence && fence[1][0] === fenceChar) {
      fenceChar = null;
    }
  }

  return kept.join('\n');
}

// Split the report at its bibliography heading. `body` excludes the bibliography; `bibliography` is the
// bibliography section alone. Markers are resolved THROUGH the bibliography (rule (C)) -- counting the
// built-in's markers against lz's URLs is exactly the anti-pattern D-13 exists to prevent.
function splitBibliography(text) {
  const lines = text.split('\n');
  const at = lines.findIndex((line) => UNCITED.BIBLIOGRAPHY_HEADING_RE.test(line));

  if (at < 0) {
    return { body: text, bibliography: '' };
  }

  return { body: lines.slice(0, at).join('\n'), bibliography: lines.slice(at).join('\n') };
}

// First canonical identifier appearing in one line of text, or null. Used to resolve a bibliography
// entry (`- [1] YaRN ... - arXiv 2309.00071`, `2. Positional Interpolation (https://arxiv.org/...)`)
// to the identifier its marker stands for.
function firstIdentifierIn(line) {
  for (const scanner of [BARE_URL_SCAN_RE, HOST_PATH_SCAN_RE, BARE_ARXIV_SCAN_RE, DOI_SCAN_RE]) {
    for (const match of line.matchAll(scanner)) {
      const identifier = canonicalizeCitation(scannedToken(scanner, match));

      if (!identifier.startsWith('raw:')) {
        return identifier;
      }
    }
  }

  return null;
}

// marker number -> canonical identifier, from the bibliography section's entry lines.
function buildMarkerMap(bibliography) {
  const map = new Map();

  for (const line of bibliography.split('\n')) {
    const marker = line.match(/^\s*(?:[-*]\s*)?\[(\d{1,3})\]\s*(.+)$/) || line.match(/^\s*(\d{1,3})\.\s+(.+)$/);

    if (!marker) {
      continue;
    }

    const identifier = firstIdentifierIn(marker[2]);

    if (identifier !== null && !map.has(marker[1])) {
      map.set(marker[1], identifier);
    }
  }

  return map;
}

// footnote name -> canonical identifier, from `[^name]: ...` definition lines.
function buildFootnoteMap(text) {
  const map = new Map();

  for (const line of text.split('\n')) {
    const def = line.match(FOOTNOTE_DEF_RE);

    if (!def) {
      continue;
    }

    const identifier = firstIdentifierIn(def[2]);

    if (identifier !== null && !map.has(def[1])) {
      map.set(def[1], identifier);
    }
  }

  return map;
}

// ---------------------------------------------------------------------------
// extractCitationTokens(reportText) -- the canonical identifier set of ONE report.
//
// Returns:
//   identifiers   the canonical identifier set, LEXICOGRAPHIC, so two runs over the same report emit
//                 byte-identical output
//   unmatched     the NAMED unmatched bucket -- a token matching no canonicalization rule, and a marker
//                 or footnote with no bibliography entry, land here and are REPORTED. Nothing is
//                 silently dropped: a silent drop is how a format-sensitive metric hides.
//   markerTokens  { total, unique } surface counts of `[n]`-shaped markers. Reported so the SURFACE
//                 count stays visible NEXT TO the identifier count instead of standing in for it --
//                 69 built-in markers against 32 lz inline URLs is a format artifact, not a comparison.
//
// The unique-source count is `identifiers.length`, i.e. the CARDINALITY OF THE CANONICAL IDENTIFIER
// SET, never a count of surface markers (rule (C)).
// ---------------------------------------------------------------------------
export function extractCitationTokens(reportText) {
  requireString(reportText, 'the report text', 'extractCitationTokens');

  const text = stripFencedCode(normalizeReportText(reportText));
  const { bibliography } = splitBibliography(text);
  const markerMap = buildMarkerMap(bibliography);
  const footnoteMap = buildFootnoteMap(text);

  const identifiers = new Set();
  const unmatched = new Set();
  const markerValues = new Set();
  let markerTotal = 0;

  for (const match of text.matchAll(MARKER_SCAN_RE)) {
    markerTotal += 1;

    const from = Number(match[1]);
    const to = match[2] === undefined ? from : Number(match[2]);

    if (to < from || to - from > UNCITED.MAX_RANGE_SPAN) {
      unmatched.add('marker:' + match[0]);
      continue;
    }

    for (let n = from; n <= to; n += 1) {
      const key = String(n);

      markerValues.add(key);

      if (markerMap.has(key)) {
        identifiers.add(markerMap.get(key));
      } else {
        unmatched.add('marker:[' + key + ']');
      }
    }
  }

  for (const match of text.matchAll(FOOTNOTE_SCAN_RE)) {
    if (footnoteMap.has(match[1])) {
      identifiers.add(footnoteMap.get(match[1]));
    } else {
      unmatched.add('footnote:' + match[0]);
    }
  }

  for (const scanner of [
    MD_LINK_SCAN_RE,
    AUTOLINK_SCAN_RE,
    BARE_URL_SCAN_RE,
    HOST_PATH_SCAN_RE,
    BARE_ARXIV_SCAN_RE,
    DOI_SCAN_RE,
  ]) {
    for (const match of text.matchAll(scanner)) {
      const identifier = canonicalizeCitation(scannedToken(scanner, match));

      if (identifier.startsWith('raw:')) {
        unmatched.add(identifier);
      } else {
        identifiers.add(identifier);
      }
    }
  }

  return {
    identifiers: [...identifiers].sort(),
    unmatched: [...unmatched].sort(),
    markerTokens: { total: markerTotal, unique: markerValues.size },
  };
}

// ---------------------------------------------------------------------------
// normalizeForQuoteMatch(s) -- the frozen quote-normalization fold (rule (D)).
//
// NFC, NEVER NFKC: "Normalization Forms KC and KD must not be blindly applied to arbitrary text.
// Because they erase many formatting distinctions, they will prevent round-trip conversion to and from
// many legacy character sets, and unless supplanted by formatting markup, they may remove distinctions
// that are important to the semantics of the text." [CITED: unicode.org UAX #15].
//
// Every non-ASCII character in a fold rule is written as an ESCAPE, per the project's
// ASCII-in-committed-artifacts rule. The DATA is Unicode; this SOURCE is not.
//   \u2018 \u2019      curly single quotes -> ASCII apostrophe
//   \u201C \u201D      curly double quotes -> ASCII quote
//   \u2013 \u2014      en dash, em dash    -> hyphen
//   \u2026             ellipsis            -> three periods
//   \u00A0 \u2007 \u202F  no-break spaces -> collapsed with every other whitespace run
//
// Idempotent by construction: the folds map non-ASCII to ASCII and the collapse is a fixed point.
// ---------------------------------------------------------------------------
export function normalizeForQuoteMatch(s) {
  requireString(s, 'the text to normalize', 'normalizeForQuoteMatch');

  return s
    .normalize('NFC')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[\s\u00A0\u2007\u202F]+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// quoteMatches({ quote, excerpt }) -- does a report's verbatim quote appear in a STORED excerpt?
//
// CASE-SENSITIVE, deliberately: a case-folding rule would let a paraphrase pass more easily and buys
// nothing here. A truncation marker (`...`, `[...]`) splits the quote into segments, each of which must
// match IN ORDER.
//
// An empty or whitespace-only quote is a ContractError: an empty quote is a substring of everything and
// would report a perfect match rate (T-23-16).
// ---------------------------------------------------------------------------
export function quoteMatches({ quote, excerpt } = {}) {
  requireString(quote, 'the quote', 'quoteMatches');
  requireString(excerpt, 'the excerpt', 'quoteMatches');

  const normalizedQuote = normalizeForQuoteMatch(quote);

  if (normalizedQuote.length === 0) {
    throw new ContractError(
      'quoteMatches refuses an empty or whitespace-only quote: it is a substring of every excerpt and would report a perfect match rate',
      'quoteMatches',
    );
  }

  const segments = normalizedQuote
    .split(/\s*(?:\[\.\.\.\]|\.\.\.)\s*/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  if (segments.length === 0) {
    throw new ContractError(
      'quoteMatches refuses a quote consisting only of truncation markers: it carries no verbatim text',
      'quoteMatches',
    );
  }

  const haystack = normalizeForQuoteMatch(excerpt);
  let from = 0;

  for (const segment of segments) {
    const at = haystack.indexOf(segment, from);

    if (at < 0) {
      return false;
    }

    from = at + segment.length;
  }

  return true;
}

function hasCitationToken(text) {
  for (const scanner of PRESENCE_SCANNERS) {
    // Fresh RegExp per test: the scanners carry /g, and a shared lastIndex would make the answer
    // depend on call order.
    if (new RegExp(scanner.source, scanner.flags).test(text)) {
      return true;
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// countUncitedUnits(reportText) -- the STRUCTURAL citation-COVERAGE count (rule (E)).
//
// Excludes headings, tables, fenced code, horizontal rules and the bibliography section from the unit
// population. A unit is CITED when it carries a citation token, or when the LAST unit of its paragraph
// does (the published passage-level attribution rule).
//
// Returns { uncited, total, label }. The label states what this measures. It measures citation
// COVERAGE. It does not measure factual support.
// ---------------------------------------------------------------------------
export function countUncitedUnits(reportText) {
  requireString(reportText, 'the report text', 'countUncitedUnits');

  const { body } = splitBibliography(stripFencedCode(normalizeReportText(reportText)));
  const prose = body
    .split('\n')
    .filter((line) => !/^\s*#{1,6}\s/.test(line))
    .filter((line) => !/^\s*\|/.test(line))
    .filter((line) => !/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line))
    .join('\n');

  let uncited = 0;
  let total = 0;

  for (const paragraph of prose.split(/\n\s*\n/)) {
    const units = paragraph
      .split(UNCITED.SENTENCE_SPLIT_RE)
      .map((unit) => unit.trim())
      .filter((unit) => unit.length > 0);

    if (units.length === 0) {
      continue;
    }

    const paragraphCited = hasCitationToken(units[units.length - 1]);

    for (const unit of units) {
      total += 1;

      if (!paragraphCited && !hasCitationToken(unit)) {
        uncited += 1;
      }
    }
  }

  return { uncited, total, label: UNCITED.LABEL };
}

// ---------------------------------------------------------------------------
// auditReport({ reportText, excerpts, quotes }) -- the whole offline audit as one object.
//
// EVERY ratio carries its raw numerator and denominator as INTEGERS and there is NO pre-rounded rate
// field anywhere, so no rounding rule can move a published figure. The key set is exact and asserted in
// the co-test.
//
//   uniqueSources.count      cardinality of the canonical identifier set (rule (C))
//   unmatched.count          the reported bucket -- nothing is silently dropped
//   markerTokens             surface `[n]` counts, kept visible beside the identifier count
//   citationCoverage         numerator = UNCITED units, denominator = total units. COVERAGE, not support
//   quoteMatch               numerator = quotes matched, denominator = quotes checked (0/0 when none)
// ---------------------------------------------------------------------------
export function auditReport({ reportText, excerpts = [], quotes = [] } = {}) {
  requireString(reportText, 'the report text', 'auditReport');

  if (!Array.isArray(excerpts) || !Array.isArray(quotes)) {
    throw new ContractError('auditReport requires excerpts and quotes as arrays', 'auditReport');
  }

  const { identifiers, unmatched, markerTokens } = extractCitationTokens(reportText);
  const coverage = countUncitedUnits(reportText);

  let matched = 0;

  for (const quote of quotes) {
    if (excerpts.some((excerpt) => quoteMatches({ quote, excerpt }))) {
      matched += 1;
    }
  }

  return {
    uniqueSources: { count: identifiers.length, identifiers },
    unmatched: { count: unmatched.length, tokens: unmatched },
    markerTokens,
    citationCoverage: { label: coverage.label, numerator: coverage.uncited, denominator: coverage.total },
    quoteMatch: { label: UNCITED.QUOTE_LABEL, numerator: matched, denominator: quotes.length },
  };
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it).
//   node eval/lz-eval-p23-citation-audit.mjs <report.md> [<out.json>]
//
// Prints the identifier-set cardinality, the unmatched count and the uncited-unit count on ONE line,
// and optionally writes the whole audit object as JSON. DESCRIPTIVE: exit 2 on a ContractError,
// otherwise 0. There is deliberately no pass/fail exit-1 branch -- unlike the Slice-A gate, this audit
// checks nothing against a bar. NO network, NO model call, zero spend.
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const reportPath = process.argv[2];
  const outPath = process.argv[3];

  if (!reportPath || !fs.existsSync(reportPath)) {
    console.error('lz-eval-p23-citation-audit: missing or invalid <report.md>');
    process.exit(2);
  }

  try {
    const audit = auditReport({ reportText: fs.readFileSync(reportPath, 'utf8') });

    console.log(
      'sources=' +
        audit.uniqueSources.count +
        ' unmatched=' +
        audit.unmatched.count +
        ' markers=' +
        audit.markerTokens.total +
        '/' +
        audit.markerTokens.unique +
        ' uncited-units=' +
        audit.citationCoverage.numerator +
        '/' +
        audit.citationCoverage.denominator,
    );

    if (outPath) {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, JSON.stringify(audit, null, 2) + '\n', 'utf8');
    }

    process.exit(0);
  } catch (err) {
    console.error('lz-eval-p23-citation-audit: ' + (err && err.message ? err.message : String(err)));
    process.exit(2);
  }
}
/* node:coverage enable */
