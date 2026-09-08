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
// {High, Medium, Low, Contested, Unsupported}).
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

import {
  aggregate,
  normalize,
  CEILINGS,
  listJson,
  safeId,
  stableHashFraction,
  AUDIT_SAMPLE_RATE,
} from './lz-deep-research-aggregate.mjs';

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

  // TEST-4: the fixture has a SINGLE claim -> a single downgraded survivor, and its vote files are
  // member-id-named (c1-0/1/2.json, all unrefuted). Locking the confidence at High proves the
  // member-id vote-file FALLBACK actually fired (cluster-id lookup misses, member-id lookup hits);
  // a silent fallback failure would yield Unsupported (0 readable seats) and go uncaught otherwise.
  assert.equal(r.survivors.length, 1, 'wrong-passage-downgraded fixture must yield exactly one survivor');
  assert.equal(r.survivors[0].quote_fidelity, 'downgraded');
  assert.equal(r.survivors[0].confidence, 'High');
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

test('I-1 partial-drop: recheckClusters narrows 3-source cluster to corroboration 1 after 2 fabricated-quote drops', () => {
  // Three workers (s1/s2/s3) all have identical claim text (Jaccard 1.0) -> merge at corroboration 3.
  // w2 and w3 have fabricated quotes absent from all excerpts -> dropped at quote-recheck.
  // Post-recheck: cluster0 has only s1's member (corroboration_lower_bound 1, not 3).
  // Distinguishes the post-recheck sources Set from the merge-time corroboration count.
  const r = aggregate(fx('partial-drop-corroboration-narrowed'));

  assert.equal(r.survivors.length, 1, 'one cluster survives (the text merged; 2 members dropped)');
  assert.equal(r.dropped.length, 0, 'cluster survives (w1 member is verified); no whole-cluster drop');
  assert.equal(r.survivors[0].corroboration_lower_bound, 1, 'post-recheck sources: only s1 remains');
  assert.deepEqual(r.survivors[0].sources, ['s1'], 's2 and s3 dropped because their only member had a fabricated quote');
  assert.equal(r.survivors[0].confidence, 'High', '3 unrefuted votes on cluster0');
});

test('I-5 downgrade-then-rank: post-recheck corroboration drives rank order (not merge-time count)', () => {
  // Cluster A (cluster0 by file order): 3-source merge, 2 sources quote-dropped -> corroboration 1 post-recheck.
  // Cluster B (cluster1 by file order): 2-source merge, both verified -> corroboration 2 post-recheck.
  // rankClusters sorts by post-recheck sources.size DESC: B ranks first despite A having higher merge-time count.
  const r = aggregate(fx('partial-drop-rank-competition'));

  assert.equal(r.survivors.length, 2, 'both clusters survive (each has at least one verified member)');
  // B (cluster1) ranks first: post-recheck corroboration 2 > A's post-recheck corroboration 1
  assert.equal(r.survivors[0].id, 'cluster1', 'B (cluster1) ranks first on post-recheck corroboration');
  assert.equal(r.survivors[0].corroboration_lower_bound, 2, 'B has 2 verified sources');
  assert.equal(r.survivors[1].id, 'cluster0', 'A (cluster0) ranks second despite 3-source merge-time count');
  assert.equal(r.survivors[1].corroboration_lower_bound, 1, 'A has only 1 verified source after drop');
});

// ---------------------------------------------------------------------------
// PIPE-07 per-tier confidence coverage (Option I rubric, D-01/D-02/D-03/D-03b).
// Each tier (Medium / Low-thin / Low-refuted / Contested / Unsupported) is exercised by a
// distinct committed fixture differing ONLY in its votes/ seat verdicts. High is covered by SC5-4.
// ---------------------------------------------------------------------------

test('PIPE-07 Medium tier: 2 unrefuted + 1 missing seat -> confidence Medium', () => {
  // Two readable unrefuted seats (cluster0-0, cluster0-1) and a missing third seat
  // (insufficient) -> the unrefuted === 2, refuted === 0 branch -> Medium.
  const r = aggregate(fx('medium-two-unrefuted'));
  assert.equal(r.survivors.length, 1);
  assert.equal(r.survivors[0].confidence, 'Medium');
});

test('PIPE-07 Low tier (thin support): 1 unrefuted + 2 missing seats -> confidence Low', () => {
  // One readable unrefuted seat, two missing -> falls through to the Low branch (thin support).
  const r = aggregate(fx('low-thin-support'));
  assert.equal(r.survivors.length, 1);
  assert.equal(r.survivors[0].confidence, 'Low');
});

test('PIPE-07 Low tier (downgrade-not-delete, D-03b): 3/3 refuted -> Low AND claim survives', () => {
  // A unanimous refutation (0 unrefuted / 3 refuted) is a DOWNGRADE to Low, never a delete:
  // the tally never removes a claim (only the quote-recheck dropped path does). The survivor
  // must remain present AND carry confidence Low.
  const r = aggregate(fx('low-refuted-downgraded'));
  assert.equal(r.survivors.length, 1, 'refuted claim must NOT be deleted (downgrade-not-delete, D-03b)');
  assert.equal(r.survivors[0].confidence, 'Low');
});

test('PIPE-07 Contested tier (D-03): >=1 unrefuted AND >=1 refuted -> confidence Contested', () => {
  // Discriminating split: cluster0-0 + cluster0-2 unrefuted, cluster0-1 refuted (2 unrefuted, 1 refuted).
  // Because unrefuted === 2 here, the Contested split branch MUST fire BEFORE the unrefuted === 2 Medium
  // branch -- if the two branches were swapped this fixture would return Medium and erase the dissent
  // (Pitfall 2). A 1-unrefuted/1-refuted fixture cannot catch that swap, so this case actively guards the
  // ordering invariant, not merely that Contested is emitted on a split.
  const r = aggregate(fx('contested-split'));
  assert.equal(r.survivors.length, 1);
  assert.equal(r.survivors[0].confidence, 'Contested');
});

test('PIPE-07 Unsupported tier: 0 readable vote seats -> confidence Unsupported', () => {
  // No votes/ dir at all -> every seat is insufficient, readableSeats === 0 -> Unsupported.
  const r = aggregate(fx('unsupported-no-votes'));
  assert.equal(r.survivors.length, 1);
  assert.equal(r.survivors[0].confidence, 'Unsupported');
});

test('PIPE-07 / D-02 stdout by-confidence line names all five canonical labels, never the fused token', () => {
  // Build a survivors set spanning multiple tiers in ONE run-dir: one Contested cluster (a
  // distinct-text claim with an unrefuted + a refuted seat) and one Unsupported cluster (a
  // distinct-text claim with no vote seats). The summary's by-confidence receipt must enumerate
  // all five D-01 labels in enum order and must never contain the fused un-canonical token nor
  // the dropped terminal label (both spike artifacts D-01 removed). The forbidden tokens are
  // assembled from fragments below so this source file itself stays free of the stale strings.
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-dr-5label-'));
  const claimsDir = path.join(runDir, 'claims');
  const excerptsDir = path.join(runDir, 'excerpts');
  const votesDir = path.join(runDir, 'votes');
  fs.mkdirSync(claimsDir, { recursive: true });
  fs.mkdirSync(excerptsDir, { recursive: true });
  fs.mkdirSync(votesDir, { recursive: true });

  // TEST-5: wrap the run-dir lifetime in try/finally so the OS temp dir is always cleaned up.
  try {
    // Two non-mergeable claims (disjoint token sets so they never cluster together).
    fs.writeFileSync(
      path.join(claimsDir, 'w1.json'),
      JSON.stringify({
        worker: 'w1',
        source: 's1',
        claims: [
          { id: 'ca', text: 'X reduces Y by 30%', quote: 'X reduces Y by 30%', excerpt_id: 'ea' },
          { id: 'cb', text: 'P boosts Q tenfold', quote: 'P boosts Q tenfold', excerpt_id: 'eb' },
        ],
      }),
      'utf8',
    );
    fs.writeFileSync(path.join(excerptsDir, 'ea.txt'), 'The study found that X reduces Y by 30% overall.', 'utf8');
    fs.writeFileSync(path.join(excerptsDir, 'eb.txt'), 'The report states that P boosts Q tenfold in trials.', 'utf8');

    // Deterministic rank: corroboration is 1 for both, so the lexical tiebreak orders them; the
    // FIRST cluster gets cluster0, the second cluster1. Seed cluster0 as a Contested split.
    fs.writeFileSync(path.join(votesDir, 'cluster0-0.json'), JSON.stringify({ verdict: 'unrefuted' }), 'utf8');
    fs.writeFileSync(path.join(votesDir, 'cluster0-1.json'), JSON.stringify({ verdict: 'refuted' }), 'utf8');
    // cluster1 has no vote files -> Unsupported.

    const r = aggregate(runDir);

    // The by-confidence receipt names all five canonical labels.
    for (const label of ['High', 'Medium', 'Low', 'Contested', 'Unsupported']) {
      assert.ok(r.summary.includes(label + ' '), 'summary by-confidence line must name the label ' + label);
    }

    // The spike artifacts are gone from the receipt. Assemble the forbidden tokens from fragments
    // so the stale strings never appear literally in this test source (keeps the closing git grep
    // gate -- zero hits for the un-canonical fused token / the dropped terminal label -- clean).
    const fusedToken = 'Low' + '/' + 'Contested';
    const droppedLabel = 'Reje' + 'cted';
    assert.ok(!r.summary.includes(fusedToken), 'summary must not contain the un-fused-away spike token');
    assert.ok(!r.summary.includes(droppedLabel), 'summary must not contain the dropped terminal spike label');

    // The two tiers are actually represented (not a vacuous label-name match): one Contested, one Unsupported.
    assert.ok(
      r.survivors.some((s) => s.confidence === 'Contested'),
      'expected a Contested survivor in the spanning run-dir',
    );
    assert.ok(
      r.survivors.some((s) => s.confidence === 'Unsupported'),
      'expected an Unsupported survivor in the spanning run-dir',
    );
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
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

  try {
    assert.throws(() => aggregate(runDir), /missing non-empty text/);
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
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

  try {
    assert.throws(() => aggregate(runDir), /missing non-empty quote/);
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('WR-03 worker file missing source fails closed (aggregate throws, no null in frozen sources[])', () => {
  // A missing worker `source` leaked `null` into the frozen sources: string[] and under-counted
  // corroboration (two undefined-source workers collapse to one Set entry). Source is load-bearing
  // for the corroboration mechanism (D-08), so a missing source must fail closed.
  const runDir = tmpRunDirWithWorker({
    worker: 'w1',
    claims: [{ id: 'c1', text: 'X reduces Y by 30%', quote: 'X reduces Y by 30%', excerpt_id: 'e1' }],
  });

  try {
    assert.throws(() => aggregate(runDir), /missing non-empty source/);
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('AGG-1/WR-04 claim missing id fails closed (aggregate throws)', () => {
  // TEST-3: a missing claims[].id otherwise coerced to the literal string "undefined" in tally()'s
  // member-id vote-file fallback (votes/undefined-0.json), cross-contaminating vote tallies across
  // ALL id-less claims. The AGG-1 guard (Plan 17.1-01) now fails closed instead. This test passes
  // ONLY because that guard exists -- it is the regression lock for AGG-1.
  const runDir = tmpRunDirWithWorker({
    worker: 'w1',
    source: 's1',
    claims: [{ text: 'X reduces Y by 30%', quote: 'X reduces Y by 30%', excerpt_id: 'e1' }],
  });

  try {
    assert.throws(() => aggregate(runDir), /missing non-empty id/);
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('TEST-6 malformed JSON in a claims file fails closed (aggregate throws /malformed JSON/)', () => {
  // readJson catches JSON.parse failures and rethrows ContractError('malformed JSON: ...'). Build a
  // run-dir like tmpRunDirWithWorker but write RAW non-JSON bytes (no JSON.stringify) so the parse
  // throws. Exercises the otherwise-uncovered malformed-JSON branch.
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-dr-badjson-'));
  const claimsDir = path.join(runDir, 'claims');
  fs.mkdirSync(claimsDir, { recursive: true });

  try {
    fs.writeFileSync(path.join(claimsDir, 'w1.json'), 'not json', 'utf8');
    assert.throws(() => aggregate(runDir), /malformed JSON/);
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('TEST-7 worker file missing claims[] array fails closed (aggregate throws /missing claims\\[\\] array/)', () => {
  // A worker file with no `claims` key trips mergeClusters' !Array.isArray(w.claims) guard. Exercises
  // the otherwise-uncovered missing-claims[] branch.
  const runDir = tmpRunDirWithWorker({ worker: 'w1', source: 's1' });

  try {
    assert.throws(() => aggregate(runDir), /missing claims\[\] array/);
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('TEST-8 extra vote seat beyond VOTES_PER_CLAIM is counted observably (summary votes_ignored 1)', () => {
  // One valid surviving claim plus FOUR vote seat files for its cluster (cluster0-0..3). Seats 0-2
  // are read; the 4th (index 3) is beyond VOTES_PER_CLAIM=3 and is counted into caps.votes_ignored.
  // Exercises the EXISTING extra-seat count path only (the AGG-2 non-contiguous-gap behavior is
  // DEFERRED to Phase 18 per D-02 -- do NOT assert non-contiguous behavior here).
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-dr-votesignored-'));
  const claimsDir = path.join(runDir, 'claims');
  const excerptsDir = path.join(runDir, 'excerpts');
  const votesDir = path.join(runDir, 'votes');
  fs.mkdirSync(claimsDir, { recursive: true });
  fs.mkdirSync(excerptsDir, { recursive: true });
  fs.mkdirSync(votesDir, { recursive: true });

  try {
    fs.writeFileSync(
      path.join(claimsDir, 'w1.json'),
      JSON.stringify({
        worker: 'w1',
        source: 's1',
        claims: [{ id: 'c1', text: 'X reduces Y by 30%', quote: 'X reduces Y by 30%', excerpt_id: 'e1' }],
      }),
      'utf8',
    );
    // Matching excerpt so the claim survives the quote re-check (else it would be dropped).
    fs.writeFileSync(path.join(excerptsDir, 'e1.txt'), 'The study found that X reduces Y by 30% overall.', 'utf8');

    // Four seat files for cluster0; the 4th (index 3) is the extra ignored seat.
    for (const s of [0, 1, 2, 3]) {
      fs.writeFileSync(path.join(votesDir, 'cluster0-' + s + '.json'), JSON.stringify({ verdict: 'unrefuted' }), 'utf8');
    }

    const r = aggregate(runDir);

    assert.equal(r.survivors.length, 1, 'the single claim must survive the quote re-check');
    assert.match(r.summary, /votes_ignored 1/, 'the 4th seat beyond VOTES_PER_CLAIM must be counted as votes_ignored 1');
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('TEST-9 path-traversal via a malformed excerpt_id fails closed (aggregate throws /path traversal rejected/)', () => {
  // quoteOutcome calls safeId(String(member.excerpt_id)) on worker-authored data. A `../evil`
  // excerpt_id must be rejected with a ContractError (the fail-hard posture documented in D-01 /
  // Plan 17.1-01). The field guards (id/text/quote/source) pass, and the run reaches quoteOutcome
  // where safeId throws. A matching excerpt is present so nothing short-circuits before safeId.
  const runDir = tmpRunDirWithWorker({
    worker: 'w1',
    source: 's1',
    claims: [{ id: 'c1', text: 'X reduces Y by 30%', quote: 'X reduces Y by 30%', excerpt_id: '../evil' }],
  });
  const excerptsDir = path.join(runDir, 'excerpts');
  fs.mkdirSync(excerptsDir, { recursive: true });
  fs.writeFileSync(path.join(excerptsDir, 'evil.txt'), 'The study found that X reduces Y by 30% overall.', 'utf8');

  try {
    assert.throws(() => aggregate(runDir), /path traversal rejected/);
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('R1-1 path-traversal claim id rejected at read-time with .file naming the worker', () => {
  // Sibling of TEST-9 (which path-traverses excerpt_id). KEY DIFFERENCE: assert err.file -- the
  // read-time annotation -- not merely the throw. Pitfall-4 option (a): a path-traversal id on an
  // OTHERWISE-VALID claim with NO excerpts dir. If the read-time safeId(c.id, ...) guard in
  // mergeClusters were ABSENT, the claim would DROP at quote-recheck (its quote matches no excerpt)
  // BEFORE reaching tally -- so aggregate would NOT throw at all. Only the read-time guard rejects
  // the id here; this keeps the test a clean read-time discriminator independent of tally's
  // (now .file-carrying) late safeId calls.
  //
  // MUTATION TO KILL: remove the read-time `safeId(c.id, path.join(claimsDir, f))` from
  // mergeClusters -> with no excerpts the claim drops at quote-recheck and aggregate does NOT throw
  // -> assert.throws FAILS.
  const runDir = tmpRunDirWithWorker({
    worker: 'w1',
    source: 's1',
    claims: [{ id: '../evil', text: 'X reduces Y by 30%', quote: 'X reduces Y by 30%', excerpt_id: 'e1' }],
  });

  try {
    let caught;
    assert.throws(
      () => aggregate(runDir),
      (err) => {
        caught = err;

        return /path traversal rejected/.test(err.message);
      },
    );
    // The DISCRIMINATING assertions (kill the mutation): the abort carries the worker file, proving
    // read-time rejection in mergeClusters (NOT a .file-less or dropped-silently late behavior).
    assert.equal(caught.name, 'ContractError');
    assert.equal(typeof caught.file, 'string');
    assert.ok(caught.file.endsWith('w1.json'), 'ContractError.file must name the authoring worker');
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('TEST-2 cross-file-order stability: listJson sorts the directory listing (host-independent, fails iff .sort() removed)', () => {
  // TEST-2 (Important) -- the AGG-01 determinism guarantee is that worker files are processed in a
  // fixed lexical order regardless of the filesystem's readdir order, which mergeClusters relies on
  // to assign cluster ids by first-seen order deterministically. The PROVABLE invariant lives in
  // listJson's `.sort()`.
  //
  // WR-01 fix: the earlier version of this test ran the full aggregate() over two on-disk worker
  // files and asserted survivors[0]. That was TAUTOLOGICAL -- rankClusters re-sorts the cluster
  // array by (corroboration DESC, normalize(text) ASC), which masks listJson's read order from
  // survivors[0]; AND on this host (NTFS/ReFS) readdirSync already returns entries alphabetically,
  // so the "z before a" creation order it tried to perturb was never actually perturbed. A mutation
  // harness proved removing listJson's .sort() left that test green (it did not discriminate the
  // behavior it claimed to guard).
  //
  // This version targets listJson DIRECTLY through its injectable readdir seam, feeding a
  // deliberately UNSORTED listing. listJson MUST return it lexically sorted on EVERY host because
  // the injected reader bypasses the filesystem's own ordering entirely. Removing the `.sort()` makes
  // this assertion fail unconditionally -- a genuine, host-independent guard (verified by mutation).
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-dr-order-'));

  try {
    // existsSync(runDir) is true (real temp dir), so listJson proceeds to the injected reader; the
    // reader's return value -- NOT the real (empty) dir contents -- is what gets sorted.
    const unsortedListing = ['z-worker.json', 'a-worker.json', 'm-worker.json', 'note.txt'];
    const result = listJson(runDir, () => unsortedListing);

    // .json filter drops note.txt; .sort() orders the survivors lexically.
    assert.deepEqual(
      result,
      ['a-worker.json', 'm-worker.json', 'z-worker.json'],
      'listJson must return *.json entries in lexical order regardless of the underlying read order; ' +
        'this fails iff listJson .sort() is removed (host-independent via the injected reader)',
    );

    // Belt-and-suspenders: the result is its own sorted copy (catches a partial-sort regression too).
    assert.deepEqual(result, [...result].sort(), 'listJson output must equal its lexically sorted copy');
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('TEST-2b end-to-end determinism: aggregate output is byte-identical across runs (AGG-01)', () => {
  // Complements TEST-2: confirms the FULL pipeline is deterministic over a real run-dir. (This does
  // NOT prove the listJson sort is load-bearing -- TEST-2 owns that via the injected reader -- it
  // only locks run-to-run reproducibility of the assembled survivor records.)
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-dr-order2-'));
  const claimsDir = path.join(runDir, 'claims');
  const excerptsDir = path.join(runDir, 'excerpts');
  fs.mkdirSync(claimsDir, { recursive: true });
  fs.mkdirSync(excerptsDir, { recursive: true });

  try {
    const aClaim = 'alpha beats beta always';
    const zClaim = 'zeta tops omega daily';

    fs.writeFileSync(
      path.join(claimsDir, 'z-worker.json'),
      JSON.stringify({
        worker: 'wz',
        source: 'sz',
        claims: [{ id: 'cz', text: zClaim, quote: zClaim, excerpt_id: 'ez' }],
      }),
      'utf8',
    );
    fs.writeFileSync(
      path.join(claimsDir, 'a-worker.json'),
      JSON.stringify({
        worker: 'wa',
        source: 'sa',
        claims: [{ id: 'ca', text: aClaim, quote: aClaim, excerpt_id: 'ea' }],
      }),
      'utf8',
    );
    fs.writeFileSync(path.join(excerptsDir, 'ea.txt'), 'The trial showed alpha beats beta always.', 'utf8');
    fs.writeFileSync(path.join(excerptsDir, 'ez.txt'), 'The report says zeta tops omega daily.', 'utf8');

    const r = aggregate(runDir);
    assert.equal(r.survivors.length, 2, 'two disjoint claims must form two distinct clusters');

    const r2 = aggregate(runDir);
    assert.deepEqual(r, r2, 'aggregate must be deterministic (byte-identical) over the same run-dir');
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('SC5-5 over-ceiling input capped observably + CEILINGS is the single frozen source', () => {
  const r = aggregate(fx('ceilings-enforced'));

  // 31 distinct non-mergeable clusters -> MAX_VERIFY_CLAIMS cap fires observably (no silent
  // truncation, D-11): the summary carries `claims 31->24`.
  assert.match(r.summary, /claims \d+->24/);

  // TEST-1 (Important): the SAME fixture ALSO trips SYNTH_CAP (24 ranked survivors -> 20 emitted).
  // Without these three assertions SC5-5 was tautological against the SYNTH_CAP axis: removing the
  // SYNTH_CAP drop logic would leave 24 survivors and the test still passes. These make a SYNTH_CAP
  // regression FAIL the suite -- the synth marker would vanish and survivors.length would be 24.
  assert.match(r.summary, /synth \d+->20/);
  assert.equal(r.survivors.length, 20);
  assert.equal(CEILINGS.SYNTH_CAP, 20);

  // Single frozen source of truth for the named ceilings (D-10).
  assert.equal(Object.isFrozen(CEILINGS), true);
  assert.equal(CEILINGS.MAX_VERIFY_CLAIMS, 24);

  // I-3: pin which clusters survive the caps (rank-order assertion, not just count).
  // cluster0 has corroboration 3 (s01 + s-multi-a + s-multi-b, all merged at Jaccard 1.0) and
  // ranks first. The next survivors are lexically-ordered singletons. Removing or reversing
  // rankClusters would leave the count assertions green but fail these.
  assert.equal(r.survivors[0].id, 'cluster0', 'cluster0 (corroboration 3) ranks first');
  assert.equal(r.survivors[0].corroboration_lower_bound, 3, 'cluster0 has 3 verified sources');
  // I-4: corroboration-DESC primary sort is active (cluster0 outranks all corroboration-1 singletons).
  // A regression deleting the cb-ca branch in rankClusters would reorder survivors lexically,
  // putting a singleton ahead of cluster0 and failing this assertion.
  assert.ok(
    r.survivors.slice(1).every((s) => s.corroboration_lower_bound < 3),
    'all other survivors have lower corroboration than cluster0',
  );
});

test('S-5/S-6 synth-only cap: 22 clusters trigger SYNTH_CAP but not MAX_VERIFY_CLAIMS', () => {
  // 22 clusters: 22 > SYNTH_CAP(20) but 22 <= MAX_VERIFY_CLAIMS(24).
  // Only the synth cap fires; the claims cap does not.
  // Pins the synth-only capLine format: 'capped: synth N->20' with no 'claims' segment.
  const r = aggregate(fx('synth-only-cap'));

  assert.equal(r.survivors.length, 20, 'SYNTH_CAP trims 22 to 20');
  assert.match(r.summary, /^capped: synth \d+->20$/m, 'synth-only capLine has no claims segment');
  assert.ok(!r.summary.includes('claims '), 'MAX_VERIFY_CLAIMS cap must NOT fire for 22 clusters');
});

test('I-2 zero-claim baseline: aggregate over empty claims dir returns empty survivors and raw: 0 summary', () => {
  // listJson(claimsDir) returns [] for an absent directory; aggregate() must return a valid
  // zero-claim result. The unsupported-no-votes fixture has a claims file (one Unsupported claim)
  // and exercises a different path. This test covers the truly empty case.
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-dr-zeroclaim-'));

  try {
    const r = aggregate(runDir);

    assert.equal(r.survivors.length, 0, 'no survivors from zero claims');
    assert.equal(r.dropped.length, 0, 'nothing to drop from zero claims');
    assert.match(r.summary, /^raw: 0 -> clusters: 0 \(merged: 0\)/m, 'summary reports raw: 0');
    assert.ok(r.summary.includes('capped: none'), 'no caps on zero input');
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
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

  // TEST-5: wrap the run-dir lifetime in try/finally so the OS temp dir is always cleaned up.
  try {
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
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('SC-1 aggregate is deterministic (same input -> deep-equal output)', () => {
  // Reproducibility (AGG-01): two calls over the same committed run-dir produce identical output.
  const a = aggregate(fx('near-duplicate-merged'));
  const b = aggregate(fx('near-duplicate-merged'));
  assert.deepEqual(a, b);
});

test('SC-2 zero-dependency contract: aggregator imports only node:/relative, no install surface under the plugin tree', () => {
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

  // RE-SCOPED (Phase 18, Pitfall 1): the DISTRIBUTED plugin tree (plugins/lz-advisor/) must carry
  // NO install surface -- no package.json and no node_modules anywhere under it. The repo as a whole
  // DOES now have an install surface (the repo-level eval/ dev tooling), so the old repo-root walk is
  // gone: this asserts the zero-dep contract ONLY for the marketplace package (D-11). Resolve the
  // plugin root file-relative (NEVER process.cwd()): HERE is
  // plugins/lz-advisor/skills/lz-deep-research/scripts; the plugin root is three levels up
  // (scripts -> lz-deep-research -> skills -> lz-advisor).
  const pluginRoot = path.resolve(HERE, '..', '..', '..');
  assert.ok(
    pluginRoot.endsWith(path.join('plugins', 'lz-advisor')),
    'plugin-root resolution drifted: ' + pluginRoot,
  );

  let inspected = 0;

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);

      assert.notEqual(
        entry.name,
        'package.json',
        'unexpected package.json under the plugin tree at ' + full + ' (D-11 zero-dependency contract)',
      );
      assert.notEqual(
        entry.name,
        'node_modules',
        'unexpected node_modules under the plugin tree at ' + full + ' (D-11 zero-dependency contract)',
      );

      if (entry.isDirectory()) {
        walk(full);
      } else {
        inspected += 1;
      }
    }
  };

  walk(pluginRoot);

  // Non-vacuous: the scan must have actually walked the plugin tree (this test file itself lives
  // under it, so >=1 file is guaranteed; a zero count means the walk silently no-op'd).
  assert.ok(inspected >= 1, 'plugin-tree scan inspected no files (vacuous walk)');
});

test('R2-1 literal-null vote record fails closed with ContractError naming the file (not TypeError)', () => {
  // A literal-null vote file (well-formed JSON `null`) parses cleanly to null; the old
  // `readJson(f).verdict` then threw a raw TypeError (.name 'TypeError', .file undefined),
  // bypassing the ContractError .file discipline. The R2-1 guard fails closed with a ContractError
  // carrying the vote file. Build a surviving single claim (matching excerpt so it passes
  // quote-recheck and reaches tally), then write votes/cluster0-0.json containing literal null. The
  // cluster-id lookup (votes/cluster0-0.json) hits first (:507 region), so tally reads this seat.
  //
  // MUTATION TO KILL: revert tally to `const verdict = readJson(f).verdict;` -> `null.verdict`
  // throws a TypeError (name 'TypeError', .file undefined) -> the `err.name === 'ContractError'`
  // predicate is false -> assert.throws rejects the error -> test FAILS.
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-dr-nullvote-'));
  const claimsDir = path.join(runDir, 'claims');
  const excerptsDir = path.join(runDir, 'excerpts');
  const votesDir = path.join(runDir, 'votes');
  fs.mkdirSync(claimsDir, { recursive: true });
  fs.mkdirSync(excerptsDir, { recursive: true });
  fs.mkdirSync(votesDir, { recursive: true });

  try {
    fs.writeFileSync(
      path.join(claimsDir, 'w1.json'),
      JSON.stringify({
        worker: 'w1',
        source: 's1',
        claims: [{ id: 'c1', text: 'X reduces Y by 30%', quote: 'X reduces Y by 30%', excerpt_id: 'e1' }],
      }),
      'utf8',
    );
    fs.writeFileSync(path.join(excerptsDir, 'e1.txt'), 'The study found that X reduces Y by 30% overall.', 'utf8');
    // The seat the claim reads (cluster0-0): the JSON literal null -- parses cleanly, returns null.
    fs.writeFileSync(path.join(votesDir, 'cluster0-0.json'), 'null', 'utf8');

    let caught;
    assert.throws(
      () => aggregate(runDir),
      (err) => {
        caught = err;

        return err.name === 'ContractError'; // NOT a raw TypeError
      },
    );
    assert.equal(caught.name, 'ContractError', 'a null vote record must fail closed as ContractError');
    assert.ok(/malformed vote record/.test(caught.message), 'message names the malformed-record cause');
    assert.equal(typeof caught.file, 'string');
    assert.ok(caught.file.endsWith('cluster0-0.json'), 'ContractError.file must name the offending vote file');
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// H-1 verdict enum guard: non-null non-enum verdict strings must throw
// ---------------------------------------------------------------------------

test('H-1 wrong-case verdict "Refuted" (capital R) throws ContractError /invalid verdict/', () => {
  // A vote file with verdict "Refuted" (capital R, wrong case) must cause tally() to throw
  // ContractError matching /invalid verdict/. Before the H-1 guard, "Refuted" silently became
  // an invalid seat that matched neither 'unrefuted' nor 'refuted', treating a refutation as
  // abstention (incrementing readableSeats without counting toward any branch).
  const runDir = tmpRunDirWithWorker({
    worker: 'w1',
    source: 's1',
    claims: [{ id: 'c1', text: 'X reduces Y by 30%', quote: 'X reduces Y by 30%', excerpt_id: 'e1' }],
  });
  const excerptsDir = path.join(runDir, 'excerpts');
  const votesDir = path.join(runDir, 'votes');
  fs.mkdirSync(excerptsDir, { recursive: true });
  fs.mkdirSync(votesDir, { recursive: true });
  fs.writeFileSync(path.join(excerptsDir, 'e1.txt'), 'The study found that X reduces Y by 30% overall.', 'utf8');
  fs.writeFileSync(path.join(votesDir, 'cluster0-0.json'), JSON.stringify({ verdict: 'Refuted' }), 'utf8');

  try {
    assert.throws(() => aggregate(runDir), /invalid verdict/);
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('H-1 trailing-space verdict "refuted " throws ContractError /invalid verdict/', () => {
  // A vote file with verdict "refuted " (trailing space) must also throw. A trailing space causes
  // the seats.filter(v => v === 'refuted') to miss the match, silently treating the refutation
  // as an abstention.
  const runDir = tmpRunDirWithWorker({
    worker: 'w1',
    source: 's1',
    claims: [{ id: 'c1', text: 'X reduces Y by 30%', quote: 'X reduces Y by 30%', excerpt_id: 'e1' }],
  });
  const excerptsDir = path.join(runDir, 'excerpts');
  const votesDir = path.join(runDir, 'votes');
  fs.mkdirSync(excerptsDir, { recursive: true });
  fs.mkdirSync(votesDir, { recursive: true });
  fs.writeFileSync(path.join(excerptsDir, 'e1.txt'), 'The study found that X reduces Y by 30% overall.', 'utf8');
  fs.writeFileSync(path.join(votesDir, 'cluster0-0.json'), JSON.stringify({ verdict: 'refuted ' }), 'utf8');

  try {
    assert.throws(() => aggregate(runDir), /invalid verdict/);
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// L-1 Windows reserved device name guard in safeId()
// ---------------------------------------------------------------------------

test('L-1 safeId rejects Windows reserved device names (CON, NUL, COM1, LPT9, CON.json)', () => {
  // Windows reserved device names (CON, PRN, AUX, NUL, COM1-9, LPT1-9) are not valid file
  // basenames on Windows and must be rejected. The regex uses start-of-string + device name
  // (case-insensitive) + (period or end-of-string) to match bare names and name+extension
  // variants without false-positives on 'console', 'context', etc.
  const reservedNames = ['CON', 'NUL', 'COM1', 'LPT9', 'CON.json'];

  for (const name of reservedNames) {
    assert.throws(
      () => safeId(name, 'file.json'),
      /unsafe id \(Windows reserved/,
      'safeId must reject Windows reserved device name: ' + name,
    );
  }
});

test('L-1 safeId does NOT reject non-reserved names (context, c1, con2text, nul1)', () => {
  // The device-name guard must not match partial strings (the (\.|$) anchor prevents it).
  // 'console', 'context', 'c1', 'nul1' are not reserved names and must not throw.
  const safeNames = ['context', 'c1', 'console', 'nul1'];

  for (const name of safeNames) {
    assert.doesNotThrow(
      () => safeId(name, 'file.json'),
      'safeId must NOT reject non-reserved name: ' + name,
    );
  }
});

// ---------------------------------------------------------------------------
// L-2 per-worker claims ceiling guard before the O(n^2) merge loop
// ---------------------------------------------------------------------------

test('L-2 worker with 121 claims (> ceiling 120) throws ContractError /exceeds ceiling/', () => {
  // CEILINGS.MAX_VERIFY_CLAIMS (24) * CEILINGS.ANGLES (5) = 120 is the per-worker ceiling.
  // A worker with 121 claims must be rejected before reaching the O(n^2) merge loop.
  // Each claim needs id, text, quote, excerpt_id to pass the field guards before reaching
  // the ceiling check (the ceiling check fires BEFORE the per-claim field guards loop).
  const claims = Array.from({ length: 121 }, (_, i) => ({
    id: 'c' + i,
    text: 'claim text ' + i,
    quote: 'claim text ' + i,
    excerpt_id: 'e' + i,
  }));
  const runDir = tmpRunDirWithWorker({ worker: 'w1', source: 's1', claims });

  try {
    assert.throws(() => aggregate(runDir), /exceeds ceiling/);
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('OQ-1 aggregate raw-claims ceiling: 4 workers x 100 claims (400 total > 360) throws ContractError', () => {
  // The per-file ceiling (120) does not fire for 100 claims per file. Only the
  // aggregate ceiling (MAX_FETCH * MAX_VERIFY_CLAIMS = 360) catches the total.
  // This closes the split-worker bypass surfaced as Open Question 1 in the
  // security re-review: a compromised actor splitting large claim sets across
  // many small files evades per-file guards but not this aggregate guard.
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-dr-oq1-'));
  const claimsDir = path.join(runDir, 'claims');
  fs.mkdirSync(claimsDir, { recursive: true });

  try {
    // 4 worker files * 100 claims = 400 total, above the 360 aggregate ceiling.
    for (let w = 0; w < 4; w += 1) {
      const claims = Array.from({ length: 100 }, (_, i) => ({
        id: 'w' + w + 'c' + i,
        text: 'worker ' + w + ' claim ' + i,
        quote: 'worker ' + w + ' claim ' + i,
        excerpt_id: 'e' + i,
      }));
      fs.writeFileSync(
        path.join(claimsDir, 'w' + w + '.json'),
        JSON.stringify({ worker: 'w' + w, source: 's' + w, claims }),
        'utf8',
      );
    }

    assert.throws(() => aggregate(runDir), /exceed.*ceiling|total pre-merge/);
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('L-2 boundary: worker with exactly 120 claims (= ceiling) does NOT throw ceiling error', () => {
  // Exactly at the ceiling (120 = 24 * 5) is allowed. This guards the strict-greater-than
  // boundary so a legitimate 120-claim worker is not accidentally rejected.
  // Use a single shared excerpt so the quote-recheck can verify all claims.
  const claims = Array.from({ length: 120 }, (_, i) => ({
    id: 'c' + i,
    text: 'unique claim text number ' + i,
    quote: 'unique claim text number ' + i,
    excerpt_id: 'e0',
  }));
  const runDir = tmpRunDirWithWorker({ worker: 'w1', source: 's1', claims });
  const excerptsDir = path.join(runDir, 'excerpts');
  fs.mkdirSync(excerptsDir, { recursive: true });
  // One excerpt that contains all 120 quote texts (each is short and unique by index).
  const excerptText = claims.map((c) => c.quote).join(' ');
  fs.writeFileSync(path.join(excerptsDir, 'e0.txt'), excerptText, 'utf8');

  try {
    // Must not throw /exceeds ceiling/ -- any other behavior (ContractError for other reasons,
    // or clean success) is acceptable; we only assert the ceiling guard does NOT fire.
    let threw = false;
    let threwMessage = '';

    try {
      aggregate(runDir);
    } catch (err) {
      threw = true;
      threwMessage = err && err.message ? err.message : String(err);
    }

    if (threw) {
      assert.ok(
        !/exceeds ceiling/.test(threwMessage),
        'aggregate must not throw "exceeds ceiling" for exactly 120 claims; threw: ' + threwMessage,
      );
    }
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// PIPE-04/05 + AGG-03: the producer (Phase-19 extract worker) output round-trips
// through the FROZEN aggregator with zero dropped claims. The committed
// __fixtures__/worker-output-roundtrip/ run dir is shaped EXACTLY as the extract
// worker emits it: claims/w1.json + excerpts/e1.txt + sources/<percent-encoded-key>.json,
// where the source filename is the PERCENT-ENCODED canonical key (the panel-resolved
// LLM-executable encoding; the worker is an LLM with no hash tool). The claim `text` is a
// PARAPHRASE distinct from the verbatim `quote`, so a verified survivor proves the
// quote-vs-excerpt check fired -- not a text==quote coincidence (the prior tautological
// fixture could not tell them apart). This proves the contract against the real consumer
// (not a mock) without touching the frozen aggregator source.
// ---------------------------------------------------------------------------

test('PIPE-04/05 worker output round-trips through the frozen aggregator (zero drops, verified survivor)', () => {
  const r = aggregate(fx('worker-output-roundtrip'));

  // The verbatim quote ("X reduces Y by 30%") is present in its cited excerpt e1,
  // so NOTHING drops (PIPE-04/AGG-03): the producer output is accepted verbatim.
  assert.equal(r.dropped.length, 0, 'producer output must round-trip with zero dropped claims');

  // At least one survivor is quote-fidelity verified (the cited-excerpt match fired).
  assert.ok(
    r.survivors.some((s) => s.quote_fidelity === 'verified'),
    'expected a survivor with quote_fidelity === verified from the producer round-trip',
  );

  // Assert on the aggregate() OUTPUT (not just the on-disk files): the canonical source key
  // flows through into a survivor's sources[] (D-08 corroboration is keyed on the source field).
  assert.ok(
    r.survivors.some(
      (s) => Array.isArray(s.sources) && s.sources.includes('https://example.org/a/study'),
    ),
    'the canonical source key must appear in a survivor.sources[] (round-trips through aggregate)',
  );
  // Non-tautological: the survivor claim is the PARAPHRASED text, distinct from the verbatim quote.
  assert.ok(
    r.survivors.some((s) => s.claim === 'X reduces Y by thirty percent'),
    'the survivor claim is the paraphrased text (distinct from the verbatim quote)',
  );

  // T-19-08 (spoofing guard): the canonical source key is IDENTICAL across the claim
  // record's claims[].source and the source-record `id` inside sources/<percent-encoded-key>.json
  // (D-08). A mismatch would silently under-count corroboration.
  const runDir = fx('worker-output-roundtrip');
  const claim = JSON.parse(fs.readFileSync(path.join(runDir, 'claims', 'w1.json'), 'utf8'));
  const sourcesDir = path.join(runDir, 'sources');
  const sourceFiles = fs.readdirSync(sourcesDir).filter((f) => f.endsWith('.json'));
  assert.equal(sourceFiles.length, 1, 'exactly one source record in the round-trip fixture');
  const sourceRecord = JSON.parse(fs.readFileSync(path.join(sourcesDir, sourceFiles[0]), 'utf8'));
  assert.equal(
    claim.source,
    sourceRecord.id,
    'claims[].source must equal the source record id (D-08 canonical-key identity)',
  );
  // The filename must be the PERCENT-ENCODED canonical key + .json (the panel-resolved Phase-19
  // filename-safety rule -- an LLM-executable substitution, NOT a hash). Encode every byte whose
  // char is not an ASCII letter, digit, '.', '_', or '-'.
  const pctEncode = (key) =>
    [...Buffer.from(key, 'utf8')]
      .map((b) => {
        const c = String.fromCharCode(b);
        return /[A-Za-z0-9._-]/.test(c) ? c : '%' + b.toString(16).toUpperCase().padStart(2, '0');
      })
      .join('');
  assert.equal(
    sourceFiles[0],
    pctEncode(sourceRecord.id) + '.json',
    'the source filename must be the percent-encoded canonical key (not a SHA-256 hash)',
  );
});

test('AGG-03 / D-14 receipt FORMAT conforms (one line, <= 200 chars, counts-only, no raw quote) -- doc-conformance, not behavioral', () => {
  // FORMAT / DOC-CONFORMANCE check (NOT a behavioral round-trip): the worker is not run here, so
  // this asserts the DOCUMENTED receipt shape (D-14) -- one line, at most ~200 chars, counts-only,
  // matching `worker=... source=... excerpts=N claims=M status=...`, no raw source text -- against a
  // sample receipt in the extract worker's documented form. It catches a FORMAT drift (multi-line /
  // over-cap / raw-text), but cannot catch a wrong COUNT or a missing receipt (that needs a live
  // worker run). The `source` field uses the short-label form the worker emits for length safety.
  const receipt =
    'ok worker=w1 source=example.org excerpts=1 claims=2 status=stored';

  // One line: no embedded newline (CR or LF).
  assert.ok(!/[\r\n]/.test(receipt), 'receipt must be a single line (no CR/LF)');

  // Under the ~200-char cap.
  assert.ok(receipt.length <= 200, 'receipt must be at most ~200 chars; got ' + receipt.length);

  // Counts-only shape: the worker / source / excerpts / claims / status fields are present
  // in the documented order, with numeric counts for excerpts and claims.
  assert.match(
    receipt,
    /\bworker=\S+\s+source=\S+\s+excerpts=\d+\s+claims=\d+\s+status=\S+/,
    'receipt must match the counts-only worker=... source=... excerpts=N claims=M status=... shape',
  );

  // No raw quote text from the round-trip fixture leaks into the receipt (the main
  // session never holds raw source text -- D-14 / threat T-19-06).
  assert.ok(
    !receipt.includes('X reduces Y by 30%'),
    'receipt must not carry raw quote / source text',
  );
});

// ===========================================================================
// VERIF-05 / D-12: the additive load_bearing -> escalate carry + the deterministic
// per-claim escalate flag (the UNION of Contested OR load_bearing OR a stable-hash
// audit sample of unanimous 3/3 upholds). Mirrors the EXISTING discipline:
// discriminating pairs (never tautologies), determinism, frozen-object value-pin.
// All fixtures are built in OS-temp run-dirs (never committed) and cleaned in finally.
// ===========================================================================

// Build a run-dir from a list of worker records (sorted file names w00.json, w01.json, ...).
// Returns the run-dir path. Caller seeds excerpts/ + votes/ as needed. Cleaned via fs.rmSync
// in the caller's finally (mirrors tmpRunDirWithWorker / the existing temp-dir discipline).
function tmpRunDirWithWorkers(workers) {
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-dr-escalate-'));
  const claimsDir = path.join(runDir, 'claims');
  fs.mkdirSync(claimsDir, { recursive: true });

  workers.forEach((w, i) => {
    fs.writeFileSync(path.join(claimsDir, 'w' + String(i).padStart(2, '0') + '.json'), JSON.stringify(w), 'utf8');
  });

  return runDir;
}

test('D-12 stableHashFraction is a pure deterministic FNV-1a fraction in [0,1) (same id -> same value)', () => {
  // The audit sample MUST be reproducible from the run dir (no Math.random, D-12c / Pitfall 4):
  // a stable hash of the AGGREGATOR-generated cluster id. Assert determinism + the [0,1) range
  // directly on the exported pure helper.
  for (const id of ['cluster0', 'cluster20', 'cluster58', 'whatever']) {
    const a = stableHashFraction(id);
    const b = stableHashFraction(id);
    assert.equal(a, b, 'stableHashFraction must be deterministic for ' + id);
    assert.ok(a >= 0 && a < 1, 'stableHashFraction must be in [0,1) for ' + id + '; got ' + a);
  }

  // Discriminating: different ids generally produce different fractions (not a constant).
  assert.notEqual(stableHashFraction('cluster0'), stableHashFraction('cluster20'));
});

test('D-12 AUDIT_SAMPLE_RATE is frozen and value-pinned to 0.15 (mirror SC5-5 CEILINGS frozen-object)', () => {
  // The audit-sample rate is a frozen sibling constant the schema doc quotes byte-for-byte. Pin the
  // frozen-ness AND the exact value (0.15, within the D-12c / RESEARCH A1 15-20% band) so a drift
  // between code and the schema-doc quote fails this gate -- mirroring SC5-5's CEILINGS assertions.
  assert.equal(Object.isFrozen(AUDIT_SAMPLE_RATE), true);
  assert.equal(AUDIT_SAMPLE_RATE.value, 0.15);
});

test('D-12a Contested cluster -> survivor escalate true (branch a)', () => {
  // A voter split (>=1 unrefuted AND >=1 refuted) -> confidence Contested -> escalate true via branch
  // (a). One single claim, votes seeded for a split (cluster0-0 unrefuted, cluster0-1 refuted).
  const runDir = tmpRunDirWithWorkers([
    {
      worker: 'w1',
      source: 's1',
      claims: [{ id: 'c1', text: 'X reduces Y by 30%', quote: 'X reduces Y by 30%', excerpt_id: 'e1' }],
    },
  ]);
  const excerptsDir = path.join(runDir, 'excerpts');
  const votesDir = path.join(runDir, 'votes');
  fs.mkdirSync(excerptsDir, { recursive: true });
  fs.mkdirSync(votesDir, { recursive: true });
  fs.writeFileSync(path.join(excerptsDir, 'e1.txt'), 'The study found that X reduces Y by 30% overall.', 'utf8');
  fs.writeFileSync(path.join(votesDir, 'cluster0-0.json'), JSON.stringify({ verdict: 'unrefuted' }), 'utf8');
  fs.writeFileSync(path.join(votesDir, 'cluster0-1.json'), JSON.stringify({ verdict: 'refuted' }), 'utf8');

  try {
    const r = aggregate(runDir);
    assert.equal(r.survivors.length, 1);
    assert.equal(r.survivors[0].confidence, 'Contested');
    assert.equal(r.survivors[0].escalate, true, 'a Contested cluster must escalate (branch a)');
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('D-12b load_bearing claim -> survivor escalate true regardless of confidence (branch b, OR-fold)', () => {
  // An extract worker marks a claim load_bearing: true; the aggregator OR-folds it through
  // mergeClusters onto the cluster and emits escalate true on the survivor REGARDLESS of confidence.
  // Here confidence is Low (1 unrefuted seat, thin support) -- not Contested -- proving branch (b)
  // fires independently of branch (a). cluster0 hashes OUT of the audit sample (frac 0.3526), so
  // branch (c) is NOT the cause either: load_bearing is the sole escalation trigger.
  const runDir = tmpRunDirWithWorkers([
    {
      worker: 'w1',
      source: 's1',
      claims: [
        { id: 'c1', text: 'X reduces Y by 30%', quote: 'X reduces Y by 30%', excerpt_id: 'e1', load_bearing: true },
      ],
    },
  ]);
  const excerptsDir = path.join(runDir, 'excerpts');
  const votesDir = path.join(runDir, 'votes');
  fs.mkdirSync(excerptsDir, { recursive: true });
  fs.mkdirSync(votesDir, { recursive: true });
  fs.writeFileSync(path.join(excerptsDir, 'e1.txt'), 'The study found that X reduces Y by 30% overall.', 'utf8');
  // One unrefuted seat only -> Low (thin support), NOT Contested and NOT High (no audit-sample path).
  fs.writeFileSync(path.join(votesDir, 'cluster0-0.json'), JSON.stringify({ verdict: 'unrefuted' }), 'utf8');

  try {
    // Precondition guard (prevents a vacuous pass): cluster0 must hash OUT of the audit sample AND the
    // confidence must NOT be Contested, so escalate true can ONLY be the load_bearing carry (branch b).
    assert.ok(stableHashFraction('cluster0') >= AUDIT_SAMPLE_RATE.value, 'cluster0 must hash OUT of the audit sample');

    const r = aggregate(runDir);
    assert.equal(r.survivors.length, 1);
    assert.equal(r.survivors[0].confidence, 'Low', 'confidence is Low (thin support), not Contested');
    assert.equal(r.survivors[0].escalate, true, 'a load_bearing claim must escalate regardless of confidence (branch b)');
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('D-12b load_bearing OR-folds across cluster members (ANY member load_bearing -> cluster escalates)', () => {
  // Two claims with identical text (Jaccard 1.0) from TWO sources merge into ONE cluster. Only the
  // SECOND member carries load_bearing: true. The OR-fold (mirroring the existing sources Set
  // accumulation) must mark the merged cluster load_bearing -> escalate true. cluster0 hashes OUT and
  // the cluster is High (3/3) -- so absent the OR-fold this would be in-sample-only (which it is NOT).
  const runDir = tmpRunDirWithWorkers([
    {
      worker: 'w1',
      source: 's1',
      claims: [{ id: 'c1', text: 'X reduces Y by 30%', quote: 'X reduces Y by 30%', excerpt_id: 'e1' }],
    },
    {
      worker: 'w2',
      source: 's2',
      claims: [
        { id: 'c2', text: 'X reduces Y by 30%', quote: 'X reduces Y by 30%', excerpt_id: 'e2', load_bearing: true },
      ],
    },
  ]);
  const excerptsDir = path.join(runDir, 'excerpts');
  const votesDir = path.join(runDir, 'votes');
  fs.mkdirSync(excerptsDir, { recursive: true });
  fs.mkdirSync(votesDir, { recursive: true });
  fs.writeFileSync(path.join(excerptsDir, 'e1.txt'), 'The study found that X reduces Y by 30% overall.', 'utf8');
  fs.writeFileSync(path.join(excerptsDir, 'e2.txt'), 'A review confirmed X reduces Y by 30% in trials.', 'utf8');
  // Seed cluster0 as a NON-audit-sample, NON-Contested High (3/3 unrefuted): isolate the OR-fold.
  for (const s of [0, 1, 2]) {
    fs.writeFileSync(path.join(votesDir, 'cluster0-' + s + '.json'), JSON.stringify({ verdict: 'unrefuted' }), 'utf8');
  }

  try {
    assert.ok(stableHashFraction('cluster0') >= AUDIT_SAMPLE_RATE.value, 'cluster0 must hash OUT of the audit sample');

    const r = aggregate(runDir);
    assert.equal(r.survivors.length, 1, 'the two same-text claims must merge into one cluster');
    assert.equal(r.survivors[0].confidence, 'High');
    assert.equal(
      r.survivors[0].escalate,
      true,
      'load_bearing on ANY member must OR-fold onto the merged cluster (branch b)',
    );
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('D-12c DISCRIMINATING PAIR: a unanimous uphold whose cluster id hashes IN escalates; an OUT sibling does NOT', () => {
  // The audit-sample branch (c): a ~15% sample of unanimous (3/3 unrefuted) upholds, selected by a
  // STABLE HASH of the cluster id. A SINGLE in-sample fixture would be TAUTOLOGICAL (MEMORY
  // project_fixture_must_discriminate_ordering) -- it could pass even if escalate were always true.
  // So build a DISCRIMINATING PAIR: cluster20 (frac ~0.107, IN) MUST escalate; cluster0 (frac ~0.353,
  // OUT) MUST NOT -- both 3/3 unanimous-uphold High, NOT Contested, NOT load_bearing, so branch (c) is
  // the ONLY differentiator. The in/out membership is COMPUTED from the exported stableHashFraction
  // (not hardcoded magic), and asserted as a precondition before the behavioral assertions.
  //
  // Construction: 21 DISJOINT-vocabulary singleton unanimous-uphold clusters (file order
  // w00..w20 -> cluster0..cluster20; 21 <= MAX_VERIFY_CLAIMS 24, so the claims cap never fires).
  // Each text draws three tokens from a unique rotation of a disjoint word pool so pairwise
  // jaccard stays well below the 0.6 merge threshold (no accidental merging -- the prior
  // shared-vocabulary draft merged everything into 3 clusters). All corroboration 1 -> rank is
  // normalize(text) ASC; a per-claim rank-control PREFIX sets the order: w20 (cluster20) prefixes
  // "aaa" so it ranks #1 and survives SYNTH_CAP=20; w01 (cluster1, an unasserted OUT cluster)
  // prefixes "zzz" so it is the single SYNTH_CAP drop; cluster0 keeps a mid prefix and survives.
  // Both asserted clusters thus appear in survivors[].
  const IN_ID = 'cluster20';
  const OUT_ID = 'cluster0';
  // Precondition: the chosen ids genuinely straddle the rate (constructed to discriminate, not assumed).
  assert.ok(stableHashFraction(IN_ID) < AUDIT_SAMPLE_RATE.value, IN_ID + ' must hash INTO the audit sample');
  assert.ok(stableHashFraction(OUT_ID) >= AUDIT_SAMPLE_RATE.value, OUT_ID + ' must hash OUT of the audit sample');

  const pool = [
    'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'india', 'juliet', 'kilo',
    'lima', 'mike', 'november', 'oscar', 'papa', 'quebec', 'romeo', 'sierra', 'tango', 'uniform',
  ];
  const workers = [];

  for (let i = 0; i <= 20; i += 1) {
    let prefix;

    if (i === 20) {
      prefix = 'aaa';
    } else if (i === 1) {
      prefix = 'zzz';
    } else {
      prefix = 'm' + String(i).padStart(2, '0');
    }

    // Three tokens drawn from a coprime rotation (+7, +13 over 21) so every claim's token set is
    // distinct and pairwise jaccard stays < 0.2 (verified < 0.6 merge threshold).
    const text = prefix + ' ' + pool[i] + ' ' + pool[(i + 7) % 21] + ' ' + pool[(i + 13) % 21];

    workers.push({
      worker: 'w' + i,
      source: 's' + i,
      claims: [{ id: 'c' + i, text, quote: text, excerpt_id: 'e' + i }],
    });
  }

  const runDir = tmpRunDirWithWorkers(workers);
  const excerptsDir = path.join(runDir, 'excerpts');
  const votesDir = path.join(runDir, 'votes');
  fs.mkdirSync(excerptsDir, { recursive: true });
  fs.mkdirSync(votesDir, { recursive: true });

  try {
    // Each excerpt verbatim-contains its claim text so every claim survives the quote re-check.
    for (let i = 0; i <= 20; i += 1) {
      const text = workers[i].claims[0].text;
      fs.writeFileSync(path.join(excerptsDir, 'e' + i + '.txt'), 'Per the record, ' + text + ' was observed.', 'utf8');
    }

    // Every cluster is a 3/3 unanimous uphold (High) keyed by its cluster id.
    for (let i = 0; i <= 20; i += 1) {
      for (const s of [0, 1, 2]) {
        fs.writeFileSync(
          path.join(votesDir, 'cluster' + i + '-' + s + '.json'),
          JSON.stringify({ verdict: 'unrefuted' }),
          'utf8',
        );
      }
    }

    const r = aggregate(runDir);
    const byId = new Map(r.survivors.map((s) => [s.id, s]));

    // Both asserted clusters survived SYNTH_CAP (the construction guarantees it; assert non-vacuously).
    assert.ok(byId.has(IN_ID), IN_ID + ' must be present among survivors');
    assert.ok(byId.has(OUT_ID), OUT_ID + ' must be present among survivors');

    // Both are High unanimous upholds, NOT Contested, NOT load_bearing -- branch (c) is the ONLY cause.
    assert.equal(byId.get(IN_ID).confidence, 'High');
    assert.equal(byId.get(OUT_ID).confidence, 'High');

    // The discriminating behavioral pair: IN escalates, OUT does not.
    assert.equal(byId.get(IN_ID).escalate, true, IN_ID + ' (hashes IN) must escalate via the audit sample (branch c)');
    assert.equal(byId.get(OUT_ID).escalate, false, OUT_ID + ' (hashes OUT) must NOT escalate (not Contested/load_bearing/in-sample)');
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('D-12 escalate is byte-identical across two aggregate() calls on the same run-dir (no Math.random)', () => {
  // Determinism (D-12c / Pitfall 4): the audit-sample selection is a stable hash, so escalate flags are
  // reproducible run-to-run. Build a run-dir spanning all three branches (a Contested cluster, a
  // load_bearing cluster, and a plain unanimous uphold), then assert the FULL output is deep-equal
  // across two calls -- extending the TEST-2b / SC-1 determinism discipline to the new escalate field.
  const runDir = tmpRunDirWithWorkers([
    {
      worker: 'w1',
      source: 's1',
      claims: [{ id: 'c1', text: 'alpha beats beta always', quote: 'alpha beats beta always', excerpt_id: 'e1' }],
    },
    {
      worker: 'w2',
      source: 's2',
      claims: [
        { id: 'c2', text: 'gamma exceeds delta daily', quote: 'gamma exceeds delta daily', excerpt_id: 'e2', load_bearing: true },
      ],
    },
    {
      worker: 'w3',
      source: 's3',
      claims: [{ id: 'c3', text: 'zeta tops omega often', quote: 'zeta tops omega often', excerpt_id: 'e3' }],
    },
  ]);
  const excerptsDir = path.join(runDir, 'excerpts');
  const votesDir = path.join(runDir, 'votes');
  fs.mkdirSync(excerptsDir, { recursive: true });
  fs.mkdirSync(votesDir, { recursive: true });
  fs.writeFileSync(path.join(excerptsDir, 'e1.txt'), 'The trial showed alpha beats beta always here.', 'utf8');
  fs.writeFileSync(path.join(excerptsDir, 'e2.txt'), 'A report says gamma exceeds delta daily there.', 'utf8');
  fs.writeFileSync(path.join(excerptsDir, 'e3.txt'), 'Data found zeta tops omega often overall.', 'utf8');

  // Rank by normalize(text) ASC over corroboration 1 each: alpha(cluster0), gamma(cluster1),
  // zeta(cluster2). Seed cluster0 as a Contested split; cluster1 carries load_bearing; cluster2 plain.
  fs.writeFileSync(path.join(votesDir, 'cluster0-0.json'), JSON.stringify({ verdict: 'unrefuted' }), 'utf8');
  fs.writeFileSync(path.join(votesDir, 'cluster0-1.json'), JSON.stringify({ verdict: 'refuted' }), 'utf8');
  fs.writeFileSync(path.join(votesDir, 'cluster1-0.json'), JSON.stringify({ verdict: 'unrefuted' }), 'utf8');

  try {
    const r = aggregate(runDir);
    const r2 = aggregate(runDir);
    assert.deepEqual(r, r2, 'aggregate (incl. escalate flags) must be byte-identical over the same run-dir');

    // Non-vacuous: at least one escalate true (the load_bearing cluster) and the field is present on all.
    assert.ok(
      r.survivors.every((s) => typeof s.escalate === 'boolean'),
      'every survivor record must carry a boolean escalate flag',
    );
    assert.ok(r.survivors.some((s) => s.escalate === true), 'at least one survivor must escalate (the spanning run-dir has one)');
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('D-12 escalate appends AFTER confidence; the frozen survivor field set is byte-unchanged', () => {
  // The new field is ADDITIVE: the existing survivor record fields (id, claim, sources,
  // corroboration_lower_bound, quote_fidelity, confidence) stay byte-unchanged in order, and escalate
  // appends as the LAST key. Assert the exact key order so a re-ordering or a dropped frozen field
  // fails this gate. Reuse the committed near-duplicate-merged fixture (a plain High survivor).
  const r = aggregate(fx('near-duplicate-merged'));
  assert.equal(r.survivors.length, 1);
  assert.deepEqual(
    Object.keys(r.survivors[0]),
    ['id', 'claim', 'sources', 'corroboration_lower_bound', 'quote_fidelity', 'confidence', 'escalate'],
    'survivor record must carry the frozen fields in order with escalate appended last',
  );
});
