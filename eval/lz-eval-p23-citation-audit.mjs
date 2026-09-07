// lz-eval-p23-citation-audit.mjs
//
// NET-NEW (Plan 23-01, Task 1; NO-SPEND): the FIRST slice of the OFF-MODEL ENV-04 citation audit -- the
// format-agnostic identifier canonicalizer and its frozen normalization constants. THE AUTHORITY is
// 23-CONTEXT.md (D-02/D-12/D-13/D-19) + eval/lz-eval-p23-prereg.md. The frozen normalization RULES live
// in the pre-registration; this file IMPLEMENTS them. If the two ever disagree, the pre-registration is
// the record of what was frozen and this file is wrong.
//
// This slice is thin BY DESIGN and complete for what it covers: it is the tracer that proves the phase's
// reading path end-to-end before any other layer is built. The rest of the ENV-04 audit surface
// (extractCitationTokens, normalizeForQuoteMatch, quoteMatches, countUncitedUnits, auditReport, and the
// thin CLI) is added in Plan 23-03. There is deliberately NO CLI here.
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

// Cross-tree reuse of the SHIPPED runtime aggregator's fail-closed signal (D-10; eval -> runtime,
// one-directional, never the reverse).
import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// ---------------------------------------------------------------------------
// ARXIV_RE: the arXiv identifier rule (D-13). It matches the bare new-style identifier with an OPTIONAL
// leading `arxiv:` / `arXiv ` prefix or an `arxiv.org/{abs,pdf,html}/` URL path, captures the
// NNNN.NNNNN identifier in group 1, and tolerates a trailing `vN` version suffix and a `.pdf` extension.
// The version suffix is deliberately NOT part of the identifier: v1 and v2 of one paper are one source.
// This rule runs FIRST, before the URL rule, precisely so the URL form and the bare form converge.
// ---------------------------------------------------------------------------
export const ARXIV_RE = /(?:arxiv[:\s]*|arxiv\.org\/(?:abs|pdf|html)\/)?(\d{4}\.\d{4,5})(v\d+)?(?:\.pdf)?/i;

// ---------------------------------------------------------------------------
// DOI_RE: the DOI rule (D-13). A DOI is `10.<registrant>/<suffix>`; the suffix runs to the first
// whitespace, quote, angle bracket or closing paren/bracket, because report prose wraps DOIs in those.
// Trailing sentence punctuation is stripped by the caller below -- a DOI at the end of a sentence must
// not carry the period into the identifier.
// ---------------------------------------------------------------------------
export const DOI_RE = /\b(10\.\d{4,9}\/[^\s"<>)\]]+)/i;

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
// Rule order is frozen and load-bearing: arXiv, then DOI, then URL, then the `raw:` fallback bucket.
// arXiv precedes URL so that `https://arxiv.org/abs/2306.15595` and the bare `arXiv 2306.15595` produce
// the SAME value; if URL ran first the two forms would never converge and the whole comparison would be
// format-sensitive again.
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

  const arxiv = token.match(ARXIV_RE);

  if (arxiv) {
    return 'arxiv:' + arxiv[1];
  }

  const doi = token.match(DOI_RE);

  if (doi) {
    return 'doi:' + doi[1].toLowerCase().replace(/[.,;)\]]+$/, '');
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
