// lz-deep-research-aggregate.test.mjs
//
// Validation fixture for the deterministic off-model aggregator (Plan 16-01).
// Zero external dependencies: Node stdlib node:test + node:assert/strict only.
// NO package.json; the only imports are node:* and the aggregator under test (./).
//
// Asserts the five SC-5 load-bearing behaviors (each a DISTINCT named test that genuinely
// exercises the behavior, never a tautology) plus the CRLF/BOM/determinism/zero-dep hardening
// sub-assertions. The assertion field names/enums match the FROZEN contract recorded in
// 16-01-SUMMARY.md (survivor record: id, claim, sources, corroboration_lower_bound,
// quote_fidelity in {verified, downgraded}, confidence in
// {High, Medium, Low/Contested, Rejected, Unsupported}).
//
// HOST QUIRK (load-bearing): on this host (Node v24.13.0 / Windows arm64 / Git Bash) the phase
// gate MUST target the explicit FILE form:
//   node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs
// The directory form (`node --test <dir>`) spuriously exits 1 on this host even when every real
// test passes. The suite is one file, so the file form is the equivalent reliable gate.
//
// The byte-order mark is code point U+FEFF. In this source it appears ONLY via
// String.fromCharCode(0xFEFF) -- NEVER as a literal byte (ASCII-only source per CLAUDE.md).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { aggregate, normalize, CEILINGS } from './lz-deep-research-aggregate.mjs';

// Resolve __fixtures__ test-file-relative (NEVER process.cwd() -- T-16-05 / Pitfall 3:
// cwd drifts under GSD worktrees and headless `claude -p`).
const HERE = path.dirname(fileURLToPath(import.meta.url));
const fx = (name) => path.join(HERE, '__fixtures__', name);

// ---------------------------------------------------------------------------
// SC-5 load-bearing behaviors (one distinct named test each)
// ---------------------------------------------------------------------------

test('SC5-1 fabricated quote dropped upstream of voting (dropped count 1, claim absent from survivors)', () => {
  const r = aggregate(fx('fabricated-quote-dropped'));

  // The drop happens at quote re-check, UPSTREAM of any vote read (D-06 / VERIF-04):
  // the claim has three unrefuted vote seats (it would PASS votes) yet must never reach tally.
  assert.equal(r.dropped.length, 1);
  assert.ok(r.summary.includes('dropped 1'));
  assert.ok(
    !r.survivors.some((s) => s.claim === 'X completely cures Z'),
    'fabricated claim must be absent from survivors',
  );
});

test('SC5-2 real-quote / wrong-passage downgraded (kept, fidelity lowered, not dropped)', () => {
  const r = aggregate(fx('wrong-passage-downgraded'));

  // The quote is absent from its CITED excerpt but verbatim-present in a DIFFERENT committed
  // excerpt -> kept as a survivor with quote_fidelity 'downgraded' (D-05).
  assert.equal(r.dropped.length, 0);
  assert.ok(
    r.survivors.some((s) => s.quote_fidelity === 'downgraded'),
    'expected a survivor with quote_fidelity === downgraded',
  );
});

test('SC5-3 paraphrase pair from ONE source merges into one cluster, NOT double-counted (corroboration 1)', () => {
  const r = aggregate(fx('paraphrase-one-source'));

  // PRECONDITION GUARD (prevents a vacuous pass): the two same-source paraphrases must actually
  // MERGE at Jaccard >= 0.6 into EXACTLY ONE cluster. Without this length check, two unmerged
  // single-member clusters would each trivially show corroboration 1 and the test would pass
  // for the wrong reason. The pair ("X reduces Y by 30%" / "X reduces Y by thirty percent")
  // normalizes to the identical token set {x,reduces,y,by,30} (Jaccard 1.0).
  assert.equal(r.survivors.length, 1, 'paraphrase pair must merge into exactly one cluster');

  // Two paraphrases, ONE distinct source -> corroboration_lower_bound 1 (D-08 / D-09): the count
  // is distinct sources, never claim count.
  assert.equal(r.survivors[0].corroboration_lower_bound, 1);
});

test('SC5-4 near-duplicate pair from TWO sources merged (corroboration 2, confidence High)', () => {
  const r = aggregate(fx('near-duplicate-merged'));

  // Contrast to SC5-3: same merged text, but TWO distinct sources (s1, s2) -> corroboration 2.
  assert.equal(r.survivors.length, 1, 'near-duplicate pair must merge into exactly one cluster');
  assert.equal(r.survivors[0].corroboration_lower_bound, 2);
  assert.equal(r.survivors[0].confidence, 'High');
});

test('CR-01 summary first line reports true PRE-merge raw count and non-zero merged count', () => {
  // Regression guard for CR-01: the load-bearing stdout receipt (D-03 / D-11) must report the true
  // PRE-merge claim total and the count of claims folded away by dedup. The near-duplicate-merged
  // fixture has TWO claims (from s1, s2) that merge into ONE cluster, so the receipt must read
  // `raw: 2 -> clusters: 1 (merged: 1)`. Before the fix, rawCount = clusters.length (post-merge),
  // pinning merged to 0 and mis-reporting raw as 1 -- this test fails against the pre-fix code.
  const r = aggregate(fx('near-duplicate-merged'));

  // Regex tolerant of exact inter-token spacing, anchored to the FIRST summary line (the frozen
  // line-1 structure). Asserts raw 2, clusters 1, merged 1 -- the human-meaningful merge receipt.
  assert.match(
    r.summary,
    /^raw:\s*2\s*->\s*clusters:\s*1\s*\(merged:\s*1\)/m,
    'summary line 1 must report raw: 2 -> clusters: 1 (merged: 1) on the near-duplicate fixture',
  );
});

// Build a throwaway run-dir under the OS temp dir from one worker record (WR-01/02/03 + WR-05:
// never write the bad/runtime input into the committed __fixtures__ tree). Returns the run-dir path.
function tmpRunDirWithWorker(worker) {
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-dr-agg-'));
  const claimsDir = path.join(runDir, 'claims');
  fs.mkdirSync(claimsDir, { recursive: true });
  fs.writeFileSync(path.join(claimsDir, 'w1.json'), JSON.stringify(worker), 'utf8');

  return runDir;
}

test('WR-01/WR-02 malformed claim missing text fails closed (aggregate throws, not silent corruption)', () => {
  // A claim with no `text` would drop the FROZEN `claim` field from survivors.json (JSON.stringify
  // omits undefined props) AND normalize(undefined) used to coerce to the token "undefined". The
  // hardened mergeClusters must REJECT it (exit 2 via ContractError) rather than emit a corrupt
  // frozen artifact.
  const runDir = tmpRunDirWithWorker({
    worker: 'w1',
    source: 's1',
    claims: [{ id: 'c1', quote: 'X reduces Y by 30%', excerpt_id: 'e1' }],
  });

  assert.throws(() => aggregate(runDir), /missing non-empty text/);
});

test('WR-01 malformed claim missing quote fails closed (aggregate throws)', () => {
  // A missing `quote` normalized to the literal token "undefined" and could false-verify against any
  // excerpt containing the word "undefined". The quote is the load-bearing fidelity input, so a
  // missing quote must fail closed rather than silently pass the re-check.
  const runDir = tmpRunDirWithWorker({
    worker: 'w1',
    source: 's1',
    claims: [{ id: 'c1', text: 'X reduces Y by 30%', excerpt_id: 'e1' }],
  });

  assert.throws(() => aggregate(runDir), /missing non-empty quote/);
});

test('WR-03 worker file missing source fails closed (aggregate throws, no null in frozen sources[])', () => {
  // A missing worker `source` leaked `null` into the frozen sources: string[] and under-counted
  // corroboration (two undefined-source workers collapse to one Set entry). Source is load-bearing
  // for the corroboration mechanism (D-08), so a missing source must fail closed.
  const runDir = tmpRunDirWithWorker({
    worker: 'w1',
    claims: [{ id: 'c1', text: 'X reduces Y by 30%', quote: 'X reduces Y by 30%', excerpt_id: 'e1' }],
  });

  assert.throws(() => aggregate(runDir), /missing non-empty source/);
});

test('SC5-5 over-ceiling input capped observably + CEILINGS is the single frozen source', () => {
  const r = aggregate(fx('ceilings-enforced'));

  // 31 distinct non-mergeable clusters -> MAX_VERIFY_CLAIMS cap fires observably (no silent
  // truncation, D-11): the summary carries `claims 31->24`.
  assert.match(r.summary, /claims \d+->24/);

  // Single frozen source of truth for the named ceilings (D-10).
  assert.equal(Object.isFrozen(CEILINGS), true);
  assert.equal(CEILINGS.MAX_VERIFY_CLAIMS, 24);
});

// ---------------------------------------------------------------------------
// Hardening sub-assertions: CRLF/BOM normalization, determinism, zero-dep
// ---------------------------------------------------------------------------

test('SC-2 normalize strips BOM, folds CRLF, folds number-word, drops percent', () => {
  // A leading byte-order mark (generated at runtime, never a literal source byte) plus a trailing
  // CRLF plus the number-word "Thirty" plus "percent" all normalize away to the bare token "30".
  const input = String.fromCharCode(0xfeff) + 'Thirty percent\r\n';
  assert.equal(normalize(input), '30');
});

test('SC-2 CRLF+BOM excerpt (written at runtime) still matches an LF quote (verified) -- Layer A+B on host', () => {
  // Author the ONLY BOM/CRLF byte sequence of this phase at runtime, so no non-ASCII byte is ever
  // committed. WR-05: assemble the ENTIRE run-dir under the OS temp dir (claims + votes copied from
  // the committed crlf-bom-safe case, excerpt generated now) instead of writing the BOM excerpt into
  // the committed __fixtures__ tree -- that left an untracked artifact and made the suite dirty the
  // working tree. The temp run-dir is self-contained and leaves the committed fixtures untouched.
  const srcDir = fx('crlf-bom-safe');
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-dr-crlf-bom-'));
  const claimsDir = path.join(runDir, 'claims');
  const votesDir = path.join(runDir, 'votes');
  const excerptsDir = path.join(runDir, 'excerpts');
  fs.mkdirSync(claimsDir, { recursive: true });
  fs.mkdirSync(votesDir, { recursive: true });
  fs.mkdirSync(excerptsDir, { recursive: true });

  // Copy the committed pure-ASCII claims/ + votes/ verbatim into the temp run-dir.
  for (const f of fs.readdirSync(path.join(srcDir, 'claims'))) {
    fs.copyFileSync(path.join(srcDir, 'claims', f), path.join(claimsDir, f));
  }

  for (const f of fs.readdirSync(path.join(srcDir, 'votes'))) {
    fs.copyFileSync(path.join(srcDir, 'votes', f), path.join(votesDir, f));
  }

  // Generate the BOM+CRLF excerpt at runtime (the only non-ASCII bytes, never committed).
  const bomCrlfBody =
    String.fromCharCode(0xfeff) +
    'The study found that X reduces Y by 30% across all trials.\r\n';
  fs.writeFileSync(path.join(excerptsDir, 'e1.txt'), bomCrlfBody, 'utf8');

  const r = aggregate(runDir);

  // The LF/ASCII quote still matches the BOM+CRLF excerpt -> the claim survives as 'verified',
  // proving normalize()'s BOM strip + CRLF->LF fold (Layer A+B) on the actual host.
  assert.equal(r.dropped.length, 0);
  assert.equal(r.survivors.length, 1);
  assert.equal(r.survivors[0].quote_fidelity, 'verified');
});

test('SC-1 aggregate is deterministic (same input -> deep-equal output)', () => {
  // Reproducibility (AGG-01): two calls over the same committed run-dir produce identical output.
  const a = aggregate(fx('near-duplicate-merged'));
  const b = aggregate(fx('near-duplicate-merged'));
  assert.deepEqual(a, b);
});

test('SC-2 zero-dependency contract: aggregator imports only node:/relative, no package.json in repo', () => {
  // The aggregator source must import ONLY node: builtins or relative (./) modules -- no
  // third-party dependency (AGG-02, T-16-06). Any non-node:/non-./ import is a constraint
  // violation to reject.
  const src = fs.readFileSync(path.join(HERE, 'lz-deep-research-aggregate.mjs'), 'utf8');
  const importRe = /\bfrom\s+['"]([^'"]+)['"]/g;
  let m;

  while ((m = importRe.exec(src)) !== null) {
    const spec = m[1];
    assert.ok(
      spec.startsWith('node:') || spec.startsWith('./') || spec.startsWith('../'),
      'non-node:/non-relative import found in aggregator: ' + spec,
    );
  }

  // No package.json anywhere from the scripts dir UP TO (and including) the repo root (zero-dep,
  // no install surface). Walk up from HERE, checking each level for package.json, and STOP at the
  // repo root (the dir containing .git) so a package.json outside this repo on the host cannot
  // cause a false failure.
  let dir = HERE;

  for (;;) {
    assert.equal(
      fs.existsSync(path.join(dir, 'package.json')),
      false,
      'unexpected package.json at ' + dir + ' (zero-dependency contract)',
    );

    // Stop once we have checked the repo root.
    if (fs.existsSync(path.join(dir, '.git'))) {
      break;
    }

    const parent = path.dirname(dir);

    if (parent === dir) {
      break;
    }

    dir = parent;
  }
});
