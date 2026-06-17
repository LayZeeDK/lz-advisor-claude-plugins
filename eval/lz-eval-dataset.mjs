// lz-eval-dataset.mjs
//
// Zero-hand-authoring eval DATASET LOADER for the lz-advisor Haiku-vs-Sonnet verify-voter gate
// (Plan 18-04). It assembles the EVAL-01 dataset by SAMPLING + STRATIFYING + label-remapping
// EXISTING human-labeled corpora -- never by hand-authoring. The loader:
//   - fetches each non-vendored corpus via the globally-installed `hf` CLI into the gitignored
//     eval/.cache/ at a PINNED revision (auth/LFS/--include/--revision; D-01b), then verifies a
//     locally-computed sha256 against the committed manifest, failing CLOSED on mismatch (D-04);
//   - remaps WiCE source labels to the FROZEN verdict enum unrefuted|refuted (D-02d), tagging
//     partially_supported as the SUBTLE substratum (the false-uphold trap);
//   - pre-flights HF_TOKEN presence for gated repos and surfaces an ACTIONABLE error (NEVER a
//     bare/transient retry) when it is absent (Pitfall 2);
//   - stratifies programmatically to the EVAL-01 shape (~40% supported / ~60% bad, ~half SUBTLE).
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ tree, NEVER in
// the distributed plugin tree. It imports the SHIPPED runtime aggregator's hardening primitives
// ACROSS trees by relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval) -- so
// no eval dependency can ever leak into the marketplace package. NEVER add an eval/ import to any
// plugin-tree file. No jstat is needed here (no CI math); the loader is node stdlib + the runtime
// hardening primitives + the eval-time `hf` CLI.
//
// LICENSE COMPLIANCE (D-04): WiCE (jon-tow/wice, ODC-BY/MIT) is the ONLY commit-safe corpus -- it
// is vendored under eval/__fixtures__/wice-vendored/. AVeriTeC (CC-BY-NC) and LLM-AggreFact
// (CC-BY-ND) are FETCH-ONLY: the committed manifest carries only IDs + remapped labels + a pinned
// revision + sha256, and their text is fetched into the gitignored eval/.cache/ at eval time --
// never committed.
//
// The byte-order mark is code point U+FEFF. This source contains no literal byte-order mark; the
// imported stripBom handles a BOM at read time (ASCII-only source per CLAUDE.md).
//
// Pure functions + the frozen STRATA_FRACTIONS are exported for the validation fixture; the thin
// CLI is guarded so that `import`-ing this module does NOT run the CLI.

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Cross-tree reuse of the SHIPPED runtime aggregator's hardening primitives (D-10; eval ->
// runtime, one-directional, never the reverse). From eval/ to the plugin tree: up one level, then
// into plugins/. readJson is module-private in the runtime aggregator, so its fail-closed shape is
// copied below using the IMPORTED ContractError + stripBom (no bare JSON.parse on untrusted data).
import {
  ContractError,
  stripBom,
  safeId,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// ---------------------------------------------------------------------------
// Frozen sampling fractions (EVAL-01 / D-02d): the prose "~40% / ~60% / ~half" turned into the
// concrete contract the stratifier targets. Mirrors the aggregator's Object.freeze discipline and
// matches EVAL_THRESHOLDS.STRATA in lz-eval-aggregate.mjs byte-for-byte.
// ---------------------------------------------------------------------------
export const STRATA_FRACTIONS = Object.freeze({
  SUPPORTED_FRACTION: 0.4,
  BAD_FRACTION: 0.6,
  SUBTLE_FRACTION_OF_BAD: 0.5,
});

// WiCE pinned revision (VERIFIED main commit, RESEARCH/Pitfall 6); the manifest pins this and the
// fetch uses `--revision <sha>` so a moving `main` can never silently swap the data.
export const WICE_REVISION = '54f7976b8ce4fe0a9bfd35a4dd30af9d5b45d8a6';

// ---------------------------------------------------------------------------
// D-02d: WiCE label remap to the FROZEN verdict enum. The remap TARGET is the existing
// unrefuted|refuted enum the runtime tally reads -- NOT a new enum. partially_supported is the
// SUBTLE substratum (the false-uphold trap = a voter returning unrefuted on it). An unknown label
// fails CLOSED (ContractError) -- never a silent default that would mislabel a claim in the gate.
// ---------------------------------------------------------------------------
const WICE_LABEL_MAP = Object.freeze({
  supported: Object.freeze({ expected_verdict: 'unrefuted', stratum: 'supported' }),
  partially_supported: Object.freeze({ expected_verdict: 'refuted', stratum: 'subtle' }),
  not_supported: Object.freeze({ expected_verdict: 'refuted', stratum: 'not-supported' }),
});

export function remapLabel(wiceLabel) {
  const mapped = WICE_LABEL_MAP[wiceLabel];

  if (mapped == null) {
    throw new ContractError(
      'unknown WiCE label (expected supported|partially_supported|not_supported): ' + JSON.stringify(wiceLabel),
      'wice-label-remap',
    );
  }

  return mapped;
}

// ---------------------------------------------------------------------------
// D-04 / T-18-DATATAMPER: integrity verify. Recompute sha256 over the downloaded/committed bytes
// and compare to the manifest's pinned value. Fail CLOSED (ContractError) on mismatch, naming the
// offending file -- so a 401/HTML error body or a tampered record fails LOUDLY, never silently
// "verifies". Returns the computed digest on success.
// ---------------------------------------------------------------------------
export function verifySha256(buf, expectedSha, file) {
  if (typeof expectedSha !== 'string' || !/^[0-9a-f]{64}$/.test(expectedSha)) {
    throw new ContractError('invalid expected sha256 (expected 64 hex chars): ' + JSON.stringify(expectedSha), file);
  }

  // Guard buf so createHash().update(null/undefined) cannot throw a NATIVE TypeError -- that would
  // break the "every error is a ContractError carrying .file" discipline this verifier upholds.
  if (!Buffer.isBuffer(buf) && typeof buf !== 'string') {
    throw new ContractError('verifySha256 requires a Buffer or string buf', file);
  }

  const got = createHash('sha256').update(buf).digest('hex');

  if (got !== expectedSha) {
    throw new ContractError('checksum mismatch for ' + file + ': expected ' + expectedSha + ' got ' + got, file);
  }

  return got;
}

// ---------------------------------------------------------------------------
// Pitfall 2 / T-18-TOKENLEAK: HF_TOKEN pre-flight for gated repos. Token resolution mirrors
// huggingface_hub: env HF_TOKEN -> HF_TOKEN_PATH -> HF_HOME/token (so `hf auth login` works). An
// UNGATED repo (WiCE, ExpertQA) needs no token and returns null. A GATED repo with NO token throws
// an ACTIONABLE error naming the dataset -- it does NOT retry as transient (a 401 is not a blip).
// The token is NEVER logged or written anywhere.
// ---------------------------------------------------------------------------
export function resolveHfToken(env = process.env, readFile = fs.readFileSync) {
  if (typeof env.HF_TOKEN === 'string' && env.HF_TOKEN.length > 0) {
    return env.HF_TOKEN;
  }

  const candidates = [];

  if (typeof env.HF_TOKEN_PATH === 'string' && env.HF_TOKEN_PATH.length > 0) {
    candidates.push(env.HF_TOKEN_PATH);
  }

  if (typeof env.HF_HOME === 'string' && env.HF_HOME.length > 0) {
    candidates.push(path.join(env.HF_HOME, 'token'));
  }

  for (const p of candidates) {
    try {
      const tok = String(readFile(p, 'utf8')).trim();

      if (tok.length > 0) {
        return tok;
      }
    } catch {
      // A missing token file is not an error here -- fall through to the next candidate.
    }
  }

  return null;
}

export function preflightToken(repo, { gated, resolveToken = resolveHfToken } = {}) {
  if (!gated) {
    // Ungated (WiCE / ExpertQA): the closed-book SUBTLE gate runs with no token.
    return resolveToken() || null;
  }

  const tok = resolveToken();

  if (tok == null || tok === '') {
    throw new ContractError(
      'gated dataset ' +
        repo +
        ' requires authentication: set HF_TOKEN (or HF_TOKEN_PATH / HF_HOME/token) or run `hf auth login` ' +
        '(this dataset is gated -- accept its terms on its HuggingFace page first). Not retrying: a 401 is not transient.',
      repo,
    );
  }

  return tok;
}

// ---------------------------------------------------------------------------
// Fail-closed JSON read (copy of the runtime aggregator's module-private readJson shape, using the
// IMPORTED ContractError + stripBom -- never a bare JSON.parse on an untrusted manifest/JSONL).
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// EVAL-01: load + validate the committed derived manifest. Fail CLOSED on any malformed shape
// (ContractError) and expose a uid -> row lookup. The manifest carries ONLY IDs + remapped labels
// + pinned revision + sha256 for the fetch-only sources (no raw corpus text, D-04).
// ---------------------------------------------------------------------------
export function loadManifest(manifestPath) {
  const m = readJson(manifestPath);

  if (m == null || typeof m !== 'object') {
    throw new ContractError('manifest is not an object', manifestPath);
  }

  if (!Array.isArray(m.examples)) {
    throw new ContractError('manifest missing examples[] array', manifestPath);
  }

  if (!Array.isArray(m.sources)) {
    throw new ContractError('manifest missing sources[] array', manifestPath);
  }

  const byUid = new Map();

  for (const ex of m.examples) {
    if (ex == null || typeof ex !== 'object') {
      throw new ContractError('manifest example is not an object: ' + JSON.stringify(ex), manifestPath);
    }

    if (typeof ex.uid !== 'string' || ex.uid.length === 0) {
      throw new ContractError('manifest example missing non-empty uid', manifestPath);
    }

    if (ex.expected_verdict !== 'unrefuted' && ex.expected_verdict !== 'refuted') {
      throw new ContractError(
        'manifest example has invalid expected_verdict (frozen enum unrefuted|refuted): ' +
          JSON.stringify(ex.expected_verdict),
        manifestPath,
      );
    }

    if (byUid.has(ex.uid)) {
      throw new ContractError('duplicate manifest uid: ' + JSON.stringify(ex.uid), manifestPath);
    }

    byUid.set(ex.uid, ex);
  }

  return { ...m, byUid };
}

// ---------------------------------------------------------------------------
// EVAL-01 / D-02d: programmatic stratification of a labeled pool to the EVAL-01 shape. The pool is
// an array of { uid, source_label } (WiCE labels). Returns N examples with each row's remapped
// { expected_verdict, stratum } applied. Fails CLOSED if a stratum cannot be satisfied (so a
// degenerate, non-discriminating sample is never silently returned -- Pitfall 3).
// ---------------------------------------------------------------------------
export function stratify(pool, n, fractions = STRATA_FRACTIONS) {
  if (!Array.isArray(pool)) {
    throw new ContractError('stratify pool must be an array', 'stratify');
  }

  if (!Number.isInteger(n) || n <= 0) {
    throw new ContractError('stratify target size must be a positive integer: ' + JSON.stringify(n), 'stratify');
  }

  // Target counts: supported ~= 40% of N; bad ~= 60% of N; SUBTLE ~= half the bad; the rest of the
  // bad is not-supported. Round so the three add up to N.
  const supTarget = Math.round(n * fractions.SUPPORTED_FRACTION);
  const badTarget = n - supTarget;
  const subtleTarget = Math.round(badTarget * fractions.SUBTLE_FRACTION_OF_BAD);
  const notSupTarget = badTarget - subtleTarget;

  // Partition the pool by WiCE label (deterministic order: the caller pre-sorts; we preserve it).
  const buckets = { supported: [], partially_supported: [], not_supported: [] };

  for (const item of pool) {
    if (item == null || typeof item.source_label !== 'string') {
      throw new ContractError('stratify pool item missing source_label', 'stratify');
    }

    // Fail closed on an UNRECOGNIZED label (schema drift) -- mirrors remapLabel. The prior
    // `if (buckets[label])` SILENTLY dropped an unknown-label item, which later surfaced as a
    // misleading "insufficient pool for stratum ..." error instead of naming the real cause.
    if (!Object.prototype.hasOwnProperty.call(buckets, item.source_label)) {
      throw new ContractError(
        'unknown source_label (expected supported|partially_supported|not_supported): ' + JSON.stringify(item.source_label),
        'stratify',
      );
    }

    buckets[item.source_label].push(item);
  }

  const need = {
    supported: supTarget,
    partially_supported: subtleTarget,
    not_supported: notSupTarget,
  };

  const out = [];

  for (const label of ['supported', 'partially_supported', 'not_supported']) {
    const have = buckets[label].length;
    const want = need[label];

    if (have < want) {
      throw new ContractError(
        'insufficient pool for stratum ' + label + ': need ' + want + ' have ' + have,
        'stratify',
      );
    }

    for (let i = 0; i < want; i += 1) {
      const item = buckets[label][i];
      const mapped = remapLabel(item.source_label);
      out.push({
        uid: item.uid,
        source: 'wice',
        source_label: item.source_label,
        stratum: mapped.stratum,
        book: 'closed',
        expected_verdict: mapped.expected_verdict,
      });
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// D-01b / D-04: fetch a corpus file at a PINNED revision via the `hf` CLI into the gitignored
// eval/.cache/, then sha256-verify against the manifest. The network path runs ONLY at eval time
// (Plan 18-05), never in the unit suite. Gated repos pre-flight the token (Pitfall 2). The cache
// basename is safeId-guarded (T-18-PATHTRAV) so a content-derived slug cannot traverse.
// ---------------------------------------------------------------------------
export function cacheSlug(repo) {
  // e.g. "chenxwh/AVeriTeC" -> "chenxwh__AVeriTeC"; basename-only, traversal-rejected.
  const slug = String(repo).replace(/\//g, '__');

  return safeId(slug, repo);
}

export function fetchDataset(repo, { revision, include, gated, repoType = 'dataset', cacheDir, runner = spawnSync } = {}) {
  // Pre-flight the gated-token presence BEFORE shelling out, so a missing token surfaces the
  // actionable HF_TOKEN error rather than a raw `hf` 401 (Pitfall 2). Never retried as transient.
  // The `gated` flag flows through unchanged: chenxwh/AVeriTeC is gated:false -> token-free.
  preflightToken(repo, { gated });

  if (typeof revision !== 'string' || revision.length === 0) {
    throw new ContractError('fetchDataset requires a pinned revision (never --revision main): ' + repo, repo);
  }

  const slug = cacheSlug(repo);
  const localDir = path.join(cacheDir || path.join(fileURLToPath(new URL('.', import.meta.url)), '.cache'), slug);
  // D-12: per-source `--repo-type` (NOT a blanket flip -- Pitfall 6). WiCE stays the default
  // repoType:'dataset' (a real dataset repo); chenxwh/AVeriTeC passes repoType:'model' (an ungated
  // `model` repo). A blanket --repo-type model flip would 404 WiCE.
  const args = ['download', repo, '--repo-type', repoType, '--revision', revision, '--local-dir', localDir];

  if (typeof include === 'string' && include.length > 0) {
    args.push('--include', include);
  }

  const res = runner('hf', args, { encoding: 'utf8' });

  if (res.error) {
    throw new ContractError('hf download failed for ' + repo + ': ' + res.error.message, repo);
  }

  if (res.status !== 0) {
    // A gated 401 / "restricted" surfaces here; do NOT retry -- surface it loudly. The token
    // pre-flight above catches the missing-token case before this; this catches accepted-terms /
    // transport failures.
    throw new ContractError(
      'hf download exited ' + res.status + ' for ' + repo + ': ' + String(res.stderr || res.stdout || '').trim(),
      repo,
    );
  }

  return localDir;
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). Single positional <manifest-path>;
// prints a counts-only stratum summary of the committed manifest; exits 0 / 2. The actual fetch
// (network) runs at eval time (Plan 18-05) via the exported functions, NOT this convenience CLI.
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const manifestPath =
    process.argv[2] || path.join(fileURLToPath(new URL('.', import.meta.url)), '__fixtures__', 'lz-eval-manifest.json');

  try {
    const m = loadManifest(manifestPath);
    const supported = m.examples.filter((e) => e.expected_verdict === 'unrefuted').length;
    const bad = m.examples.length - supported;
    const subtle = m.examples.filter((e) => e.stratum === 'subtle').length;
    console.log(
      'examples: ' + m.examples.length + ' (unrefuted ' + supported + ', refuted ' + bad + ', subtle ' + subtle + ')',
    );
    process.exit(0);
  } catch (err) {
    const where = err && err.file ? ' (' + err.file + ')' : '';
    console.error('lz-eval-dataset: ' + (err && err.message ? err.message : String(err)) + where);
    process.exit(2);
  }
}
/* node:coverage enable */
