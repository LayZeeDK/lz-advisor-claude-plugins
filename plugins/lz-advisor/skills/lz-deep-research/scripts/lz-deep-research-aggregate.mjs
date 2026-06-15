// lz-deep-research-aggregate.mjs
//
// Deterministic, off-model deep-research aggregator for the lz-advisor plugin.
// Zero external dependencies (Node stdlib only): node:fs, node:path, node:url.
//
// Hardened from the proven spike prototype (plans/_spike/aggregate-spike.mjs, spike A1 PASS).
// The proven core (NUMWORDS / norm / jaccard / quote re-check / merge / tally) is preserved;
// three extensions are added per the locked phase decisions:
//   - three-way quote outcome verified/downgraded/dropped (D-05), run UPSTREAM of vote tally (D-06)
//   - distinct-source corroboration as a LOWER bound (D-08/D-09)
//   - in-code ceiling enforcement with observable caps (D-10/D-11)
//
// All comparison runs through normalize() (number-word fold + BOM strip + CRLF/CR -> LF), so
// the substring/Jaccard tests are newline- and BOM-insensitive on Windows arm64 / Git Bash.
//
// The byte-order mark is U+FEFF. It appears in this source ONLY as the JS escape \uFEFF,
// never as a literal byte (ASCII-only source per CLAUDE.md).
//
// Pure functions + frozen CEILINGS are exported for the validation fixture (Plan 02); the thin
// CLI is guarded so that `import`-ing this module does NOT run the CLI.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Comparison primitive (PRESERVED from the spike; HARDENED with BOM + CRLF strip)
// ---------------------------------------------------------------------------

// PRESERVE verbatim from the spike: the number-word fold that lets "30%" and
// "thirty percent" normalize to the same token stream.
export const NUMWORDS = {
  zero: '0',
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
  ten: '10',
  twenty: '20',
  thirty: '30',
  forty: '40',
  fifty: '50',
  hundred: '100',
};

// The single comparison primitive. Used by BOTH jaccard and quoteOutcome, so normalization
// happens at comparison time (never only at read time): the JSON `quote` field and the `.txt`
// excerpt always flow through the SAME normalize() before any .includes() / token compare.
//
// HARDEN per D-04: strip a leading BOM and fold CRLF / lone CR to LF BEFORE lowercasing, so a
// CRLF-saved excerpt still matches an LF-captured quote (and vice versa) regardless of host.
export function normalize(s) {
  // Fail-soft type guard (WR-01): a non-string (missing quote/text, null, number) must NOT coerce
  // to a comparable token. String(undefined) -> 'undefined' / String(null) -> 'null' would yield a
  // non-empty token that can false-verify a missing quote or wrongly merge two text-less claims.
  // Returning '' instead routes a missing quote through quoteOutcome's nq === '' -> 'dropped' guard
  // and makes text-less claims non-mergeable (empty token set). Hard fail-closed validation of the
  // required text/quote/source fields lives in mergeClusters (WR-02/WR-03).
  if (typeof s !== 'string') {
    return '';
  }

  return s
    .replace(/^\uFEFF/, '') // strip leading BOM (the escape U+FEFF, never a literal byte)
    .replace(/\r\n/g, '\n') // CRLF -> LF
    .replace(/\r/g, '\n') // lone CR -> LF
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .map((w) => NUMWORDS[w] ?? w)
    .filter((w) => w && w !== 'percent')
    .join(' ')
    .trim();
}

// PRESERVE the spike's tokenizer + Jaccard. Merge threshold >= 0.6 is D-07-locked.
const toks = (s) => new Set(normalize(s).split(' ').filter(Boolean));

export function jaccard(a, b) {
  const A = toks(a);
  const B = toks(b);
  let inter = 0;

  for (const t of A) {
    if (B.has(t)) {
      inter += 1;
    }
  }

  const union = A.size + B.size - inter;

  return union === 0 ? 0 : inter / union;
}

// ---------------------------------------------------------------------------
// Ceilings (D-10): single frozen source of truth.
// ---------------------------------------------------------------------------
//
// ACTIVELY ENFORCED by this aggregator:
//   - MAX_VERIFY_CLAIMS: cap on ranked clusters carried into tally (applied AFTER ranking)
//   - VOTES_PER_CLAIM:   max vote seats read per claim (extra seats ignored, counted)
//   - SYNTH_CAP:         cap on the survivors output array
//
// CARRIED as the shared contract (enforced by the Phase-20 orchestrator at wave dispatch, NOT here):
//   - ANGLES:    number of decomposition angles / search waves
//   - MAX_FETCH: max distinct fetches per run
//
// The "~" in the prose decisions means "tunable default", not "fuzzy code": these are concrete
// integers because "enforced in code" requires a concrete number.
export const CEILINGS = Object.freeze({
  ANGLES: 5,
  MAX_FETCH: 15,
  MAX_VERIFY_CLAIMS: 24,
  VOTES_PER_CLAIM: 3,
  SYNTH_CAP: 20,
});

// ---------------------------------------------------------------------------
// Safety + IO helpers (zero-dep; explicit UTF-8; BOM-safe JSON.parse)
// ---------------------------------------------------------------------------

// A contract violation the CLI maps to a non-zero exit (D-03). Carries the offending file.
export class ContractError extends Error {
  constructor(message, file) {
    super(message);
    this.name = 'ContractError';
    this.file = file;
  }
}

// JSON.parse throws on a leading BOM; fs.readFileSync(p,'utf8') does NOT strip it. Strip first.
export function stripBom(s) {
  return typeof s === 'string' && s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

// Path safety (V12 / T-16-01): treat a file-content-derived id (excerpt_id, worker id) as a
// BASENAME only. Reject anything containing a path separator or a parent-dir reference so a
// crafted id cannot traverse outside the run dir.
export function safeId(id) {
  if (typeof id !== 'string' || id.length === 0) {
    throw new ContractError('invalid id (expected non-empty string): ' + JSON.stringify(id));
  }

  if (/[\\/]/.test(id) || id === '.' || id === '..' || id.includes('..')) {
    throw new ContractError('unsafe id (path traversal rejected): ' + JSON.stringify(id));
  }

  return id;
}

const readText = (p) => fs.readFileSync(p, 'utf8');

function readJson(p) {
  let text;

  try {
    text = stripBom(readText(p));
  } catch (err) {
    throw new ContractError('cannot read file: ' + err.message, p);
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new ContractError('malformed JSON: ' + err.message, p);
  }
}

// Sorted directory listing of *.json (Pitfall 1: readdirSync order is OS-dependent; sort for
// reproducibility / AGG-01). Returns [] when the subdir is absent.
function listJson(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort();
}

// ---------------------------------------------------------------------------
// Merge immutable per-worker claim files into corroboration clusters (D-08/D-09)
// ---------------------------------------------------------------------------
//
// PRESERVE the spike's dedup/corroboration loop. cluster.sources is a Set of DISTINCT source
// ids: cluster.sources.size is the corroboration count and a LOWER bound (two paraphrases from
// ONE source -> size 1, NOT 2). Keep the UNDER-merge bias (D-07): merge only at jaccard >= 0.6.
//
// runDir is a PARAMETER (not a module-level ROOT) so this is a pure function the test can call.
//
// Returns { clusters, rawClaimCount } (CR-01): clusters is the post-merge cluster array; rawClaimCount
// is the PRE-merge per-claim total so aggregate() can report a true `raw:` figure and a non-zero
// `merged:` count. Returning only `clusters` (as before) discarded the raw total and pinned the
// summary's merged count to 0 for every input.
export function mergeClusters(runDir) {
  const claimsDir = path.join(runDir, 'claims');
  const files = listJson(claimsDir);
  const raw = [];

  for (const f of files) {
    const w = readJson(path.join(claimsDir, f));

    if (!w || !Array.isArray(w.claims)) {
      throw new ContractError('worker file missing claims[] array', path.join(claimsDir, f));
    }

    // Fail closed on a missing source (WR-03): w.source is load-bearing for corroboration (D-08,
    // counted by DISTINCT source id). A missing source would leak `null` into the frozen
    // sources: string[] and collapse two distinct undefined-source workers to one Set entry,
    // silently UNDER-counting corroboration. Reject instead of coercing.
    if (typeof w.source !== 'string' || w.source.length === 0) {
      throw new ContractError('worker file missing non-empty source', path.join(claimsDir, f));
    }

    for (const c of w.claims) {
      // Fail closed on a missing text/quote (WR-01/WR-02): both are required, load-bearing fields of
      // the FROZEN survivor record (claim: cl.text) and the fidelity guard (normalize(quote)).
      // A missing text drops `claim` from survivors.json (JSON.stringify omits undefined props); a
      // missing quote normalizes to '' and could false-verify. Reject the corrupt input outright.
      if (typeof c.text !== 'string' || c.text.length === 0) {
        throw new ContractError('claim missing non-empty text', path.join(claimsDir, f));
      }

      if (typeof c.quote !== 'string' || c.quote.length === 0) {
        throw new ContractError('claim missing non-empty quote', path.join(claimsDir, f));
      }

      raw.push({ ...c, source: w.source });
    }
  }

  const clusters = [];

  for (const c of raw) {
    const hit = clusters.find((cl) => jaccard(cl.text, c.text) >= 0.6);

    if (hit) {
      hit.members.push(c);
      hit.sources.add(c.source);
    } else {
      clusters.push({
        id: 'cluster' + clusters.length,
        text: c.text,
        members: [c],
        sources: new Set([c.source]),
      });
    }
  }

  return { clusters, rawClaimCount: raw.length };
}

// ---------------------------------------------------------------------------
// Excerpt store: read every excerpts/*.txt ONCE, pre-normalized (guidance 3)
// ---------------------------------------------------------------------------
//
// Returns { byId, all }:
//   byId: Map<excerpt_id, normalize(text)>   (cited-excerpt lookup)
//   all:  string[] of normalized excerpt texts (the "some other excerpt" search space)
// Reads with explicit 'utf8'; normalize() strips BOM + folds CRLF, so a CRLF-saved excerpt
// still matches an LF-captured quote. excerpt_id is derived from the filename basename.
export function loadExcerpts(runDir) {
  const excerptsDir = path.join(runDir, 'excerpts');
  const byId = new Map();
  const all = [];

  if (!fs.existsSync(excerptsDir)) {
    return { byId, all };
  }

  const files = fs
    .readdirSync(excerptsDir)
    .filter((f) => f.endsWith('.txt'))
    .sort();

  for (const f of files) {
    const id = safeId(f.slice(0, -'.txt'.length));
    const normalized = normalize(readText(path.join(excerptsDir, f)));
    byId.set(id, normalized);
    all.push(normalized);
  }

  return { byId, all };
}

// ---------------------------------------------------------------------------
// Three-way quote outcome (D-05) -- runs UPSTREAM of tally (D-06 / VERIF-04)
// ---------------------------------------------------------------------------
//
// verified   : quote verbatim-present in its CITED excerpt (full quote-fidelity assurance)
// downgraded : quote absent from cited excerpt but present in SOME OTHER stored excerpt
//              (real text, wrong attribution -- KEPT, fidelity lowered, NOT dropped)
// dropped    : quote absent from ALL stored excerpts (fabricated / drifted)
//
// This guards verbatim CONSISTENCY only. Claim-vs-quote ENTAILMENT (does the quote support the
// claim?) is the voter's job (Phase 18) and is reported as a SEPARATE assurance frozen in Phase 17.
export function quoteOutcome(member, excerptsById, allExcerpts) {
  const nq = normalize(member.quote);

  // An empty normalized quote cannot be verified against anything.
  if (nq === '') {
    return 'dropped';
  }

  const citedId = member.excerpt_id == null ? null : safeId(String(member.excerpt_id));
  const cited = citedId == null ? undefined : excerptsById.get(citedId);

  // WR-04 (accepted, frozen): the re-check is a normalized-SUBSTRING test (.includes on the
  // space-joined token string), NOT a token-sequence/boundary test. A short numeric quote can
  // therefore match inside a longer token -- e.g. normalize('30') is "present" in
  // normalize('the rate is 130 overall') because "...130 overall".includes("30") is true. This is
  // the proven, frozen lexical contract inherited from the spike (quoteInExcerpt) and is an
  // accepted LOWER-BOUND fidelity property, consistent with the "corroboration is a lower bound"
  // framing (D-09): the re-check guards verbatim CONSISTENCY only and may over-verify on substrings.
  // Do NOT add token-boundary padding here without re-freezing the Phase-17 match semantics.
  if (cited != null && cited.includes(nq)) {
    return 'verified';
  }

  if (allExcerpts.some((ex) => ex.includes(nq))) {
    return 'downgraded';
  }

  return 'dropped';
}

// Apply quoteOutcome per member, drop the 'dropped' members, and decide cluster survival +
// cluster-level quote_fidelity. A cluster survives iff it has >= 1 verified-or-downgraded member;
// fidelity is 'verified' unless ALL kept members are 'downgraded' is false -- i.e. fidelity is
// 'downgraded' when no kept member is 'verified' (any verified member lifts the cluster).
export function recheckClusters(clusters, excerpts) {
  const kept = [];
  const dropped = [];

  for (const cl of clusters) {
    const survivingMembers = [];
    let hasVerified = false;

    for (const m of cl.members) {
      const outcome = quoteOutcome(m, excerpts.byId, excerpts.all);

      if (outcome === 'dropped') {
        continue;
      }

      if (outcome === 'verified') {
        hasVerified = true;
      }

      survivingMembers.push({ ...m, quote_outcome: outcome });
    }

    if (survivingMembers.length === 0) {
      dropped.push({ id: cl.id, claim: cl.text, reason: 'quote-not-in-any-excerpt' });
      continue;
    }

    kept.push({
      ...cl,
      members: survivingMembers,
      quote_fidelity: hasVerified ? 'verified' : 'downgraded',
      sources: new Set(survivingMembers.map((m) => m.source)),
    });
  }

  return { kept, dropped };
}

// ---------------------------------------------------------------------------
// Ranking + ceiling enforcement (D-10 / D-11)
// ---------------------------------------------------------------------------

// Deterministic rank: corroboration (distinct-source count) DESC, then normalized-text lexical
// ASC as a stable tiebreak so the same inputs always produce byte-identical output (AGG-01).
export function rankClusters(clusters) {
  return [...clusters].sort((a, b) => {
    const ca = a.sources.size;
    const cb = b.sources.size;

    if (cb !== ca) {
      return cb - ca;
    }

    const na = normalize(a.text);
    const nb = normalize(b.text);

    if (na < nb) {
      return -1;
    }

    if (na > nb) {
      return 1;
    }

    return 0;
  });
}

// Cap ranked clusters to MAX_VERIFY_CLAIMS AFTER ranking; record the cap observably (NO silent
// truncation, D-11). Returns { kept, caps } where caps.claims is set only when the cap fired.
export function enforceCeilings(rankedClusters) {
  const caps = {};
  let kept = rankedClusters;

  if (kept.length > CEILINGS.MAX_VERIFY_CLAIMS) {
    caps.claims = kept.length + '->' + CEILINGS.MAX_VERIFY_CLAIMS;
    kept = kept.slice(0, CEILINGS.MAX_VERIFY_CLAIMS);
  }

  return { kept, caps };
}

// ---------------------------------------------------------------------------
// Vote tally (PRESERVE the spike rubric arithmetic; cap seats at VOTES_PER_CLAIM)
// ---------------------------------------------------------------------------
//
// Read at most VOTES_PER_CLAIM seats per claim (seats beyond that are ignored deterministically
// and counted as votes_ignored). Vote file is looked up by cluster id first, then the first
// member's claim id (the spike's fallback). Missing seat -> 'insufficient'.
//
// Rubric (Option I, D-02 -- the single canonical confidence enum, evaluated in this branch order):
//   readableSeats === 0             -> Unsupported
//   unrefuted === 3                 -> High
//   unrefuted >= 1 && refuted >= 1  -> Contested   // voter split: any explicit refutation alongside support
//   unrefuted === 2                 -> Medium       // (refuted === 0 here, since the split case is caught above)
//   otherwise                       -> Low          // thin support, OR refuted-without-support (downgrade-not-delete)
// The split branch MUST precede the unrefuted === 2 Medium branch, or a 2-unrefuted/1-refuted tally
// silently returns Medium and erases the dissent (D-03). The tally never deletes a claim (D-03b):
// a unanimous refutation (0 unrefuted / N refuted) downgrades to Low, surfaced, never removed.
export function tally(cl, runDir, capsOut) {
  const votesDir = path.join(runDir, 'votes');
  const clusterId = safeId(cl.id);
  const memberId = cl.members && cl.members[0] ? safeId(String(cl.members[0].id)) : null;
  const seats = [];
  let readableSeats = 0;

  for (let s = 0; s < CEILINGS.VOTES_PER_CLAIM; s += 1) {
    const fByCluster = path.join(votesDir, clusterId + '-' + s + '.json');
    const fByMember = memberId == null ? null : path.join(votesDir, memberId + '-' + s + '.json');
    let f = null;

    if (fs.existsSync(fByCluster)) {
      f = fByCluster;
    } else if (fByMember != null && fs.existsSync(fByMember)) {
      f = fByMember;
    }

    if (f == null) {
      seats.push('insufficient');
      continue;
    }

    const verdict = readJson(f).verdict;
    seats.push(verdict == null ? 'insufficient' : verdict);
    readableSeats += 1;
  }

  // Count (but do not read) extra seats beyond VOTES_PER_CLAIM so the ignore is observable (D-11).
  if (capsOut) {
    let extra = 0;

    for (let s = CEILINGS.VOTES_PER_CLAIM; ; s += 1) {
      const fByCluster = path.join(votesDir, clusterId + '-' + s + '.json');
      const fByMember = memberId == null ? null : path.join(votesDir, memberId + '-' + s + '.json');

      if (fs.existsSync(fByCluster) || (fByMember != null && fs.existsSync(fByMember))) {
        extra += 1;
      } else {
        break;
      }
    }

    if (extra > 0) {
      capsOut.votes_ignored = (capsOut.votes_ignored || 0) + extra;
    }
  }

  const refuted = seats.filter((v) => v === 'refuted').length;
  const unrefuted = seats.filter((v) => v === 'unrefuted').length;

  if (readableSeats === 0) {
    return 'Unsupported';
  }

  if (unrefuted === 3) {
    return 'High';
  }

  if (unrefuted >= 1 && refuted >= 1) {
    return 'Contested'; // voter split: any explicit refutation alongside support
  }

  if (unrefuted === 2) {
    return 'Medium'; // refuted === 0 here (the split case is caught above)
  }

  return 'Low'; // thin support, OR refuted-without-support (downgrade-not-delete)
}

// ---------------------------------------------------------------------------
// Top-level pipeline (D-16): read -> merge -> recheck (upstream) -> rank -> cap -> tally -> emit
// ---------------------------------------------------------------------------
//
// Returns { survivors, dropped, summary, caps }. The survivor record field set is LOAD-BEARING --
// Phase 17 freezes it and Phase 18/20 consume it:
//   { id, claim, sources: [...], corroboration_lower_bound, quote_fidelity, confidence }
// The summary is a counts-only, deterministic, bounded string (never raw source text, D-03).
export function aggregate(runDir) {
  // rawCount is the PRE-merge claim total (CR-01): mergeClusters now returns it alongside the
  // post-merge clusters so the summary can report a true `raw:` figure and a non-zero `merged:`.
  const { clusters, rawClaimCount } = mergeClusters(runDir);
  const rawCount = rawClaimCount;

  const excerpts = loadExcerpts(runDir);
  const { kept: survived, dropped } = recheckClusters(clusters, excerpts);

  // Quote-recheck counts: verified clusters (>= 1 verified member) vs downgraded-only clusters.
  const verifiedCount = survived.filter((cl) => cl.quote_fidelity === 'verified').length;
  const downgradedCount = survived.filter((cl) => cl.quote_fidelity === 'downgraded').length;
  const droppedCount = dropped.length;

  const ranked = rankClusters(survived);
  const { kept: capped, caps } = enforceCeilings(ranked);

  const survivorRecords = capped.map((cl) => ({
    id: cl.id,
    claim: cl.text,
    sources: [...cl.sources].sort(),
    corroboration_lower_bound: cl.sources.size,
    quote_fidelity: cl.quote_fidelity,
    confidence: tally(cl, runDir, caps),
  }));

  // SYNTH_CAP on the survivors output (observable, D-11).
  let survivors = survivorRecords;

  if (survivors.length > CEILINGS.SYNTH_CAP) {
    caps.synth = survivors.length + '->' + CEILINGS.SYNTH_CAP;
    survivors = survivors.slice(0, CEILINGS.SYNTH_CAP);
  }

  // merged = claims folded away by dedup (CR-01). rawCount is the PRE-merge claim total; clusters
  // is the POST-merge cluster array (survived + dropped is a partition of it, so clusters.length
  // is the post-merge cluster count). Previously rawCount was clusters.length, pinning merged to 0.
  const clusterCount = clusters.length;
  const merged = rawCount === 0 ? 0 : rawCount - clusterCount;
  const byConfidence = (label) => survivors.filter((s) => s.confidence === label).length;

  const capLine =
    caps.claims || caps.synth || caps.votes_ignored
      ? 'capped:' +
        (caps.claims ? ' claims ' + caps.claims : '') +
        (caps.synth ? ' synth ' + caps.synth : '') +
        (caps.votes_ignored ? ' votes_ignored ' + caps.votes_ignored : '')
      : 'capped: none';

  const summary = [
    'raw: ' + rawCount + ' -> clusters: ' + clusterCount + ' (merged: ' + merged + ')',
    'quote-recheck: verified ' + verifiedCount + ' | downgraded ' + downgradedCount + ' | dropped ' + droppedCount,
    capLine,
    'survivors: ' +
      survivors.length +
      ' (High ' +
      byConfidence('High') +
      ', Medium ' +
      byConfidence('Medium') +
      ', Low ' +
      byConfidence('Low') +
      ', Contested ' +
      byConfidence('Contested') +
      ', Unsupported ' +
      byConfidence('Unsupported') +
      ')',
  ].join('\n');

  return { survivors, dropped, summary, caps };
}

// ---------------------------------------------------------------------------
// Thin CLI (D-01) -- guarded so importing the module does NOT run the CLI (Pattern 1)
// ---------------------------------------------------------------------------
//
// Single positional <run-dir>; writes survivors.json (2-space JSON) into it; prints the
// counts-only summary to stdout; exits 0 on success, 2 on contract violation (D-03).
// The optional LZ_DR_* env override is intentionally NOT wired (D-12): the hardcoded CEILINGS
// defaults are the enforced contract for this phase.
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const runDir = process.argv[2];

  if (!runDir || !fs.existsSync(runDir) || !fs.statSync(runDir).isDirectory()) {
    console.error('lz-deep-research-aggregate: missing or invalid <run-dir>');
    process.exit(2);
  }

  try {
    const result = aggregate(runDir);
    fs.writeFileSync(path.join(runDir, 'survivors.json'), JSON.stringify(result.survivors, null, 2));
    console.log(result.summary);
    process.exit(0);
  } catch (err) {
    const where = err && err.file ? ' (' + err.file + ')' : '';
    console.error('lz-deep-research-aggregate: ' + (err && err.message ? err.message : String(err)) + where);
    process.exit(2);
  }
}
