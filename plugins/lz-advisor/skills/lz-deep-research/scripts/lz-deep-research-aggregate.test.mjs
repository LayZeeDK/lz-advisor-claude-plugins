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

import { aggregate, normalize, CEILINGS, listJson } from './lz-deep-research-aggregate.mjs';

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

test('WR-04 claim missing id fails closed (aggregate throws)', () => {
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
