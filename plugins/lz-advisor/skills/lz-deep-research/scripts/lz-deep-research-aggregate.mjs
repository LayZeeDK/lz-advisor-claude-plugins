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
// Escalation audit sample (D-12c / VERIF-05): a STABLE, REPRODUCIBLE sample of unanimous upholds.
// ---------------------------------------------------------------------------
//
// AUDIT_SAMPLE_RATE is the fraction of unanimous (3/3 unrefuted) upholds the aggregator flags for a
// re-vote audit (branch (c) of the escalate union). It is a frozen sibling of CEILINGS so the schema
// doc can quote it byte-for-byte and a dev-time test can pin Object.isFrozen + the value (mirroring the
// SC5-5 CEILINGS frozen-object assertion). The value 0.15 sits inside the D-12c / RESEARCH A1 15-20%
// band (Claude's Discretion within the frozen band).
export const AUDIT_SAMPLE_RATE = Object.freeze({ value: 0.15 });

// A tiny pure, deterministic FNV-1a (32-bit) hash folded to a fraction in [0,1). It selects the audit
// sample by hashing the AGGREGATOR-GENERATED cluster id ('cluster' + N, never worker-authored), so the
// sample is reproducible from the run-dir contents -- never a nondeterministic PRNG (which would make
// the audit trail non-reproducible, D-12c / D-14 / Pitfall 4). The FNV-1a constants (offset basis
// 2166136261, prime 16777619) mirror the eval `hash32` in eval/lz-eval-oof-batch.mjs lines 50-59
// (ASCII-only, zero-dep). This is a DISTRIBUTION hash, not a security primitive: collision-resistance
// is irrelevant (consistent with the schema's percent-encode-not-SHA rationale).
export function stableHashFraction(clusterId) {
  let h = 2166136261 >>> 0;

  for (let i = 0; i < clusterId.length; i += 1) {
    h ^= clusterId.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }

  return (h >>> 0) / 2 ** 32;
}

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
// `file` is OPTIONAL (AGG-6): callers that pass it get a ContractError carrying the offending file
// path in .file (the CLI's `(${err.file})` annotation); callers that omit it are unaffected.
// AGG-3: the redundant exact-parent-dir equality term is removed -- it is subsumed by the
// includes('..') term below. The single-dot equality (id === '.') is KEPT (a single dot is NOT
// caught by includes('..')).
export function safeId(id, file) {
  if (typeof id !== 'string' || id.length === 0) {
    throw new ContractError('invalid id (expected non-empty string): ' + JSON.stringify(id), file);
  }

  if (/[\\/]/.test(id) || id === '.' || id.includes('..')) {
    throw new ContractError('unsafe id (path traversal rejected): ' + JSON.stringify(id), file);
  }

  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(id)) {
    throw new ContractError('unsafe id (Windows reserved device name): ' + JSON.stringify(id), file);
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
//
// `readdir` is an INJECTABLE seam (default fs.readdirSync) so the .sort() determinism guarantee can
// be tested HOST-INDEPENDENTLY (WR-01): some filesystems -- NTFS/ReFS on this host included -- return
// readdirSync entries already in lexical order, which would mask a dropped .sort() from any black-box
// test that relies on real on-disk read order. Injecting a deliberately UNSORTED listing lets TEST-2
// prove that removing this .sort() changes the output on ANY host. Production callers omit the arg
// and are byte-for-byte unaffected.
export function listJson(dir, readdir = fs.readdirSync) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  // AGG-7: wrap the bare readdir call so a permission/IO failure rethrows as a ContractError carrying
  // .file, consistent with readJson. The existsSync pre-check screens the common absent-dir case; this
  // try/catch screens permission/IO failures.
  let entries;

  try {
    entries = readdir(dir);
  } catch (err) {
    throw new ContractError('cannot read dir: ' + err.message, dir);
  }

  return entries.filter((f) => f.endsWith('.json')).sort();
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

    const CLAIMS_CEILING = CEILINGS.MAX_VERIFY_CLAIMS * CEILINGS.ANGLES;

    if (w.claims.length > CLAIMS_CEILING) {
      throw new ContractError(
        'worker claims[] exceeds ceiling (' + w.claims.length + '>' + CLAIMS_CEILING + ')',
        path.join(claimsDir, f),
      );
    }

    for (const c of w.claims) {
      // Fail closed on a missing/empty id (AGG-1): id is a required, load-bearing field. A missing id
      // otherwise coerces to the literal string "undefined" in tally()'s member-id vote-file fallback
      // (safeId(String(cl.members[0].id)) -> votes/undefined-0.json), cross-contaminating vote tallies
      // across ALL id-less claims. The member-id fallback is in active use: the wrong-passage-downgraded
      // committed fixture names its vote files by member id (c1-0.json) and reaches tally via that
      // fallback (its claim survives as `downgraded`). (The fabricated-quote-dropped fixture's
      // member-id vote files are never read -- its claim drops at the quote re-check, upstream of
      // tally.) Validate id FIRST (before text/quote) so the member is never used with a bad id.
      if (typeof c.id !== 'string' || c.id.length === 0) {
        throw new ContractError('claim missing non-empty id', path.join(claimsDir, f));
      }

      // R1-1 (mirrors the WR-02 excerpt_id precedent): reject a path-traversal claim id (e.g.
      // "../evil") at READ time with the originating worker file, not LATE in tally() with a
      // .file-less ContractError. safeId throws ContractError('unsafe id (path traversal rejected):
      // ...', file); the return value is discarded (c.id is unchanged) -- this is a validating
      // side-effect at the read boundary. The AGG-1 non-empty guard above is KEPT for its distinct
      // 'claim missing non-empty id' message (safeId's empty-id message differs); both coexist.
      safeId(c.id, path.join(claimsDir, f));

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

      // _file carries the originating claims-file path so a downstream ContractError (e.g. a
      // path-traversal excerpt_id rejected in quoteOutcome) can annotate WHICH worker authored the
      // bad value (WR-02), matching the AGG-5/6/7 ".file on every contract abort" discipline. It is
      // an internal field: the survivor record (aggregate()) is built explicitly and never spreads
      // the member, so _file does not leak into survivors.json.
      raw.push({ ...c, source: w.source, _file: path.join(claimsDir, f) });
    }
  }

  const TOTAL_RAW_CEILING = CEILINGS.MAX_FETCH * CEILINGS.MAX_VERIFY_CLAIMS;

  if (raw.length > TOTAL_RAW_CEILING) {
    throw new ContractError(
      'total pre-merge claims exceed ceiling (' + raw.length + '>' + TOTAL_RAW_CEILING + ')',
      claimsDir,
    );
  }

  const clusters = [];

  for (const c of raw) {
    const hit = clusters.find((cl) => jaccard(cl.text, c.text) >= 0.6);
    // load_bearing (D-12b) is an OPTIONAL additive field set by the extract worker on a claim it judges
    // central / high-consequence. It is OR-folded onto the cluster (a cluster is load_bearing if ANY
    // member carries it), analogous to the sources Set OR-accumulation above. It is judgment, NOT a
    // load-bearing read like id/text/quote/source, so it is fail-OPEN: absent / non-true means false
    // (only the literal boolean true counts; do NOT fail closed on a missing flag).
    const memberLoadBearing = c.load_bearing === true;

    if (hit) {
      hit.members.push(c);
      hit.sources.add(c.source);
      hit.load_bearing = hit.load_bearing || memberLoadBearing;
    } else {
      clusters.push({
        id: 'cluster' + clusters.length,
        text: c.text,
        members: [c],
        sources: new Set([c.source]),
        load_bearing: memberLoadBearing,
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

  // AGG-7: wrap the bare directory read so a permission/IO failure carries .file (matches listJson).
  let entries;

  try {
    entries = fs.readdirSync(excerptsDir);
  } catch (err) {
    throw new ContractError('cannot read dir: ' + err.message, excerptsDir);
  }

  const files = entries.filter((f) => f.endsWith('.txt')).sort();

  for (const f of files) {
    const excerptPath = path.join(excerptsDir, f);
    // AGG-6: pass the file path to safeId so a malformed excerpt filename yields a ContractError
    // carrying .file for the CLI annotation.
    const id = safeId(f.slice(0, -'.txt'.length), excerptPath);
    // AGG-5: wrap the bare excerpt read so a failing read rethrows as a ContractError carrying .file
    // (mirrors readJson's try/catch/rethrow), not a bare native Error.
    let raw;

    try {
      raw = readText(excerptPath);
    } catch (err) {
      throw new ContractError('cannot read file: ' + err.message, excerptPath);
    }

    const normalized = normalize(raw);
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

  // Fail-hard on a malformed excerpt_id (AGG-Q1 / D-01): a path-traversal attempt in worker-authored
  // data (e.g. '../../etc/passwd') makes safeId throw ContractError, ABORTING the entire run rather
  // than silently skipping this member. This is intentional -- consistent with the ContractError
  // discipline for all other required fields (id/text/quote/source). Do NOT switch to a fail-soft skip.
  // WR-02: pass member._file (the originating claims-file path, stamped in mergeClusters) as safeId's
  // file arg so the abort carries .file and the CLI's `(${err.file})` annotation names the worker that
  // authored the malicious id -- the provenance matters most precisely on this security path.
  const citedId = member.excerpt_id == null ? null : safeId(String(member.excerpt_id), member._file);
  const cited = citedId == null ? undefined : excerptsById.get(citedId);

  // QR-01 (accepted, frozen): the re-check is a normalized-SUBSTRING test (.includes on the
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
  // quote_fidelity is intentionally excluded from ranking: it is an output annotation (Assurance 1),
  // not a priority signal. Clusters with equal corroboration rank purely by normalized text (lexical
  // tiebreak) so the sort is deterministic regardless of fidelity.
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
  // R1-1 defense-in-depth (D-01 belt-and-suspenders): thread the originating worker file into both
  // safeId calls so NO safeId call anywhere can throw a .file-less ContractError. Neither is a live
  // attack path (cl.id is 'cluster' + N -- never worker-authored; the member id is now read-time
  // validated by the mergeClusters guard), but the annotation makes the .file discipline uniform.
  // _file survives recheckClusters (:419 { ...m }, :429 { ...cl, members: survivingMembers }).
  const memberFile = cl.members && cl.members[0] ? cl.members[0]._file : undefined;
  const clusterId = safeId(cl.id, memberFile);
  const memberId = cl.members && cl.members[0] ? safeId(String(cl.members[0].id), memberFile) : null;
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

    // R2-1: a structurally-null / non-object vote RECORD is malformed worker output (there is no
    // record) -- fail closed with a ContractError naming the vote file, restoring the .file
    // discipline a raw `null.verdict` TypeError would bypass. This is categorically distinct from a
    // well-formed record whose `verdict` FIELD is absent/null, which stays lenient -> 'insufficient'
    // on the next line (the :523 leniency, PRESERVED). `typeof null === 'object'` is why the explicit
    // `rec == null` term comes first. An array is `typeof 'object'` and reads `.verdict` as undefined
    // -> the lenient path (no Array.isArray rejection -- that would be scope creep beyond D-02).
    const rec = readJson(f);

    if (rec == null || typeof rec !== 'object') {
      throw new ContractError('malformed vote record (expected object): ' + JSON.stringify(rec), f);
    }

    const verdict = rec.verdict;

    if (verdict != null && verdict !== 'unrefuted' && verdict !== 'refuted') {
      throw new ContractError('invalid verdict (expected "unrefuted" or "refuted"): ' + JSON.stringify(verdict), f);
    }

    seats.push(verdict == null ? 'insufficient' : verdict);
    readableSeats += 1;
  }

  // Count (but do not read) extra seats beyond VOTES_PER_CLAIM so the ignore is observable (D-11).
  if (capsOut) {
    let extra = 0;

    // No upper bound: loop stops at the first missing seat file (contiguous-gap semantics, AGG-2).
    // Non-contiguous extra seats (e.g. seat 3 exists but 4 is absent, 5 exists) are undercounted by
    // design -- AGG-2 deferred to Phase 18. A maliciously-seeded contiguous run-dir could trigger
    // many existsSync calls, but MAX_VERIFY_CLAIMS bounds the cluster count so per-cluster blowup
    // is the only risk axis and is acceptable for the run-dir trust model.
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
//   { id, claim, sources: [...], corroboration_lower_bound, quote_fidelity, confidence, escalate }
// `escalate` is the ADDITIVE D-12 / VERIF-05 extension (appended AFTER confidence; the rest of the
// frozen field set is byte-unchanged). The summary is a counts-only, deterministic, bounded string
// (never raw source text, D-03).
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

  // Intentionally runs tally on all MAX_VERIFY_CLAIMS-capped clusters before SYNTH_CAP slices the
  // output. votes_ignored may include extra-seat counts from clusters that SYNTH_CAP later discards
  // (clusters 21-24 in the MAX_VERIFY_CLAIMS=24 / SYNTH_CAP=20 gap). Documented scope caveat: AGG-4.
  const survivorRecords = capped.map((cl) => {
    const confidence = tally(cl, runDir, caps);
    // escalate (D-12 / VERIF-05): a deterministic per-claim flag, the UNION of
    //   (a) confidence === 'Contested' (a voter split the tally already surfaced);
    //   (b) the cluster's OR-folded load_bearing === true (an extract-worker judgment);
    //   (c) an audit sample of unanimous (3/3 unrefuted -> 'High') upholds, selected by a STABLE HASH
    //       of the aggregator-generated cluster id (reproducible from the run-dir, never a PRNG).
    // The orchestrator (Plan 20-03) dispatches a Sonnet re-vote wave on every flagged claim. The flag
    // is ADDITIVE -- it appends after confidence; the frozen survivor field set is byte-unchanged.
    const escalate =
      confidence === 'Contested' ||
      cl.load_bearing === true ||
      (confidence === 'High' && stableHashFraction(cl.id) < AUDIT_SAMPLE_RATE.value);

    return {
      id: cl.id,
      claim: cl.text,
      sources: [...cl.sources].sort(),
      corroboration_lower_bound: cl.sources.size,
      quote_fidelity: cl.quote_fidelity,
      confidence,
      escalate,
    };
  });

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
/* node:coverage disable */
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
/* node:coverage enable */
