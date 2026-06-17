// lz-eval-traps.test.mjs
//
// Validation fixture for the OFFLINE known-gold TRAP-CONSTRUCTION recipe (Plan 19-03, Task 1).
// Dev-only eval-tree test: imports the SCRIPT under test (which imports the SHIPPED runtime
// aggregator's hardening primitives across trees, one-directional eval -> runtime) plus node
// stdlib only. No jstat is needed here.
//
// The trap recipe mutates EXISTING AVeriTeC-dev seeds (no hand-authoring) into the three
// retrieval-difficulty strata -- buried / evidence-absent / date-sensitive -- so the offline read
// stresses RETRIEVAL ORCHESTRATION, never claim subtlety (19-RESEARCH.md lines 319-360). Mutated
// CC-BY-NC text is written ONLY to gitignored eval/.cache/; the committed manifest carries uids +
// remapped labels + the mutation recipe/seed, NEVER the NC text (D-07 / Pitfall 5).
//
// Asserts the EVAL-01 load-bearing behaviors (each a DISTINCT named test that genuinely exercises
// the behavior, never a tautology):
//   - the one-step-overreach mutation flips a Supported seed's gold to refuted (the overreach is
//     unsupported), and records the transform class + seed (recipe-not-text);
//   - the OQ-3 classifier DISCRIMINATES: a seed with a pre-cutoff in-corpus disconfirmer -> buried;
//     one without -> evidence-absent;
//   - the validity gate ACCEPTS a trap that flips a deliberately-weak reference verifier and
//     REJECTS one the weak verifier already catches (the family-neutral difficulty anchor);
//   - the OQ-1 leakageProbe DISCRIMINATES: a synthetic leaky KS (a fact-check-article URL OR a
//     post-cutoff-dated disconfirmer present) -> { clean:false }; a screened KS -> { clean:true }
//     (the probe is NOT tautological -- this is the GATE that blocks the manifest lock);
//   - the writer emits NO `text` field into any manifest row and writes mutated text only under
//     .cache/;
//   - verifySha256 fails closed on a tampered buffer.
//
// HOST QUIRK (load-bearing): on this host (Node v24.13.0 / Windows arm64 / Git Bash) the phase
// gate MUST target the explicit FILE form:
//   node --test eval/lz-eval-traps.test.mjs
// The directory form (`node --test <dir>`) spuriously exits 1 on this host even when every real
// test passes. The suite is one file, so the file form is the equivalent reliable gate.
//
// The byte-order mark is code point U+FEFF. This source contains no literal byte-order mark.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';

import {
  TRANSFORM_CLASSES,
  mutateOverreach,
  classifySeed,
  validityGate,
  leakageProbe,
  writeTrap,
  verifySha256,
} from './lz-eval-traps.mjs';

// ---------------------------------------------------------------------------
// The one-step overreach mutation recipe: it flips a Supported seed's gold to refuted and records
// the transform CLASS + the seed (recipe-not-text). The actual mutated prose is produced by a
// generator OUTSIDE the voter families (A3); the recipe records the transform class + seed.
// ---------------------------------------------------------------------------

test('mutateOverreach flips a Supported seed gold to refuted and records the transform class + seed', () => {
  const seed = {
    claim_id: 6,
    claim: 'More than 225,000 people dead because of covid-19.',
    label: 'Supported',
    claim_date: '30-10-2020',
  };

  const trap = mutateOverreach(seed, { transform: 'magnitude', seed: 7 });

  assert.equal(trap.expected_verdict, 'refuted', 'a one-step overreach on a Supported seed flips the gold to refuted');
  assert.equal(trap.recipe.transform, 'magnitude', 'the recipe records the transform class');
  assert.equal(trap.recipe.seed, 7, 'the recipe records the deterministic seed');
  assert.equal(trap.uid_seed, 6, 'the recipe records the source seed claim_id');
  // recipe-not-text: the trap row carries the recipe + uid, never the hand-written claim prose.
  assert.equal(trap.text, undefined, 'the committed trap row carries NO text field (recipe-not-text, D-07)');
});

test('mutateOverreach is DISCRIMINATING: only a Supported seed is a valid overreach source', () => {
  // A one-step overreach is defined ON a Supported seed (the overreach makes a supported claim
  // unsupported -> refuted). A non-Supported seed is not a valid overreach source and must fail
  // closed rather than silently producing a tautological "refuted" row.
  const refutedSeed = { claim_id: 2, claim: 'x', label: 'Refuted', claim_date: '01-01-2020' };

  assert.throws(
    () => mutateOverreach(refutedSeed, { transform: 'scope', seed: 1 }),
    (err) => err.name === 'ContractError' && /Supported/i.test(err.message),
    'a non-Supported seed is not a valid one-step-overreach source (fail closed)',
  );
});

test('TRANSFORM_CLASSES enumerates the one-step overreach axes and is frozen', () => {
  assert.equal(Object.isFrozen(TRANSFORM_CLASSES), true, 'TRANSFORM_CLASSES must be frozen (anti-drift)');
  for (const c of ['scope', 'causation', 'magnitude', 'certainty']) {
    assert.ok(TRANSFORM_CLASSES.includes(c), 'transform classes include ' + c);
  }
});

// ---------------------------------------------------------------------------
// OQ-3 classifier: buried (a pre-cutoff in-corpus disconfirmer present, ranked deep) vs
// evidence-absent (no in-corpus disconfirmer). The classifier discriminates mechanically.
// ---------------------------------------------------------------------------

test('classifySeed DISCRIMINATES: a pre-cutoff in-corpus disconfirmer -> buried; none -> evidence-absent', () => {
  const claimDate = '30-10-2020';

  // A KS whose deep rank carries a decisive disconfirmer dated before the claim -> buried.
  const ksBuried = [];

  for (let i = 0; i < 25; i += 1) {
    ksBuried.push({ sentence: 'topically similar distractor ' + i, url: 'https://news.example/d' + i });
  }

  ksBuried.push({
    sentence: 'the decisive pre-cutoff disconfirmer',
    url: 'https://news.example/disconfirm',
    date: '01-06-2020',
    disconfirmer: true,
  });

  const buried = classifySeed({ ks: ksBuried, claimDate });
  assert.equal(buried.stratum, 'buried', 'an in-corpus pre-cutoff disconfirmer ranked deep -> buried');
  assert.ok(buried.disconfirmer_rank >= 20, 'the disconfirmer sits deep behind distractors (rank ' + buried.disconfirmer_rank + ')');

  // A KS with only distractors + the gold, no in-corpus disconfirmer -> evidence-absent.
  const ksAbsent = [];

  for (let i = 0; i < 30; i += 1) {
    ksAbsent.push({ sentence: 'distractor ' + i, url: 'https://news.example/x' + i });
  }

  const absent = classifySeed({ ks: ksAbsent, claimDate });
  assert.equal(absent.stratum, 'evidence-absent', 'no in-corpus disconfirmer -> evidence-absent');

  assert.notEqual(buried.stratum, absent.stratum, 'the classifier genuinely DISCRIMINATES (not a constant)');
});

test('classifySeed excludes a POST-cutoff disconfirmer (it cannot make a seed buried -- leakage rule)', () => {
  const claimDate = '30-10-2020';
  const ks = [];

  for (let i = 0; i < 25; i += 1) {
    ks.push({ sentence: 'distractor ' + i, url: 'https://news.example/d' + i });
  }

  // A disconfirmer dated AFTER the claim must be excluded by the cutoff -> the seed is
  // evidence-absent (the post-cutoff doc does not count as an in-window disconfirmer).
  ks.push({ sentence: 'post-cutoff disconfirmer', url: 'https://news.example/late', date: '01-12-2020', disconfirmer: true });

  const c = classifySeed({ ks, claimDate });
  assert.equal(c.stratum, 'evidence-absent', 'a post-cutoff disconfirmer is excluded -> evidence-absent (not buried)');
});

// ---------------------------------------------------------------------------
// Validity gate (the deliberately-weak-verifier difficulty anchor): ACCEPT a trap that flips the
// weak verifier; REJECT one the weak verifier already catches (too easy to discriminate the tiers).
// ---------------------------------------------------------------------------

test('validityGate ACCEPTS a trap that flips a deliberately-weak verifier and REJECTS one it already catches', () => {
  // A "weak verifier flips" means: the weak reference verifier wrongly UPHOLDS the trap (returns
  // unrefuted on refuted-gold). That is the difficulty signal -- the trap is hard enough to fool a
  // weak verifier, so it can discriminate the tiers.
  const accepted = validityGate({ expected_verdict: 'refuted', weakVerifierVerdict: 'unrefuted' });
  assert.equal(accepted.accepted, true, 'a trap that flips the weak verifier (wrongly upheld) is accepted');

  // A trap the weak verifier already catches (correctly refutes) is too easy -> rejected.
  const rejected = validityGate({ expected_verdict: 'refuted', weakVerifierVerdict: 'refuted' });
  assert.equal(rejected.accepted, false, 'a trap the weak verifier already catches is rejected (too easy)');

  assert.notEqual(accepted.accepted, rejected.accepted, 'the validity gate genuinely DISCRIMINATES');
});

// ---------------------------------------------------------------------------
// OQ-1 leakageProbe (LOAD-BEARING): the GATING screen that blocks the manifest lock. SCREEN-THEN-
// CHECK semantics -- after EXCLUDING (removing) the seed's own fact_checking_article /
// cached_original_claim_url / original_claim_url URLs from the KS (exact match) and applying the date
// filter, it returns { clean:true } only if NO RESIDUAL doc dated >= claim_date survives. The seed's
// OWN declared leak URL appearing in the KS is HANDLED by the screen (removed) and is NOT a leak. A
// generic/unrelated fact-check site elsewhere in the dense web-crawl KS is ordinary evidence, never a
// leak of THIS claim's gold. The leak that SURVIVES the screen is a post-cutoff DATED doc. The probe
// MUST DISCRIMINATE (surviving leak -> { clean:false }; screened KS -> { clean:true }) -- not
// tautological.
// ---------------------------------------------------------------------------

test('leakageProbe HANDLES (does NOT escalate) the seed OWN declared fact-check / cached-original URL', () => {
  // The seed's KS contains BOTH its own declared fact_checking_article (the published verdict) AND
  // its cached_original_claim_url (the archived claim SOURCE, dated at the claim, NOT a verdict). The
  // screen REMOVES both by exact match -> the KS screens CLEAN. Escalating these would falsely block
  // the manifest lock for a seed whose own source/verdict URL is merely archived in the dense KS.
  const seeds = [
    {
      claim_id: 32,
      claim: 'some claim',
      claim_date: '26-10-2020',
      fact_checking_article: 'https://usatoday.example/factcheck/the-verdict',
      cached_original_claim_url: 'https://archive.example/cached-original',
      original_claim_url: 'https://archive.example/cached-original',
    },
  ];

  const ks = {
    32: [
      { sentence: 'evidence', url: 'https://news.example/a' },
      { sentence: 'the cached original claim source', url: 'https://archive.example/cached-original' },
      { sentence: 'the published fact-check', url: 'https://usatoday.example/factcheck/the-verdict' },
    ],
  };

  const res = leakageProbe(seeds, ks);
  assert.equal(res.clean, true, "a seed's own declared leak URLs are screened OUT, not escalated");
  assert.equal(res.leaks.length, 0, 'the screen removes the known vectors -> clean residue');
});

test('leakageProbe does NOT escalate an UNRELATED fact-check site in the dense web-crawl KS', () => {
  // The KS contains a fact-check site on a DIFFERENT topic (the dense AVeriTeC web crawl carries many
  // such). It is NOT the seed's own declared fact_checking_article and is undated -> ordinary
  // evidence, never a leak of THIS claim's gold. Flagging the fact-checking genre would falsely
  // escalate ~9/10 real dev seeds (verified). The screen must let this pass.
  const seeds = [
    {
      claim_id: 6,
      claim: 'covid claim',
      claim_date: '30-10-2020',
      fact_checking_article: 'https://usatoday.example/factcheck/the-actual-verdict',
      cached_original_claim_url: null,
      original_claim_url: null,
    },
  ];

  const ks = {
    6: [
      { sentence: 'normal evidence', url: 'https://news.example/a' },
      // A 2016 fact-check on a different topic -- present in the crawl, NOT this claim's verdict.
      { sentence: 'an unrelated fact-check on a different topic', url: 'https://factcheck.org/2016/some-other-claim/' },
    ],
  };

  const res = leakageProbe(seeds, ks);
  assert.equal(res.clean, true, 'an unrelated, undated fact-check site is ordinary evidence, not a leak');
  assert.equal(res.leaks.length, 0, 'the screen does not flag the fact-checking genre');
});

test('leakageProbe returns { clean:false } on a post-cutoff-dated disconfirmer surviving the screen', () => {
  const seeds = [
    {
      claim_id: 99,
      claim: 'dated claim',
      claim_date: '30-10-2020',
      fact_checking_article: null,
      cached_original_claim_url: null,
      original_claim_url: null,
    },
  ];

  // A doc dated AFTER the claim carries a possibly-post-cutoff published verdict -> a leak. (The
  // dev KS docs are normally undated; this synthetic doc proves the date arm of the probe fires.)
  const ks = {
    99: [
      { sentence: 'pre-cutoff evidence', url: 'https://news.example/a', date: '01-06-2020' },
      { sentence: 'post-cutoff verdict', url: 'https://news.example/late', date: '01-12-2020' },
    ],
  };

  const res = leakageProbe(seeds, ks);
  assert.equal(res.clean, false, 'a doc dated >= claim_date is a post-cutoff leak');
  assert.ok(res.leaks.some((l) => /post.?cutoff|date/i.test(l.reason)), 'the leak names the date vector');
});

test('leakageProbe returns { clean:true } on a screened KS (NOT tautological -- the probe can pass)', () => {
  const seeds = [
    {
      claim_id: 6,
      claim: 'covid claim',
      claim_date: '30-10-2020',
      fact_checking_article: 'https://usatoday.example/factcheck/the-verdict',
      cached_original_claim_url: null,
      original_claim_url: null,
    },
  ];

  // A KS with NO residual fact-check article, NO leftover cached-original URL, and only
  // undated/pre-cutoff docs -> clean. Proves the probe is not constant-false (it genuinely PASSES).
  const ks = {
    6: [
      { sentence: 'ordinary news evidence', url: 'https://news.example/a' },
      { sentence: 'more ordinary evidence', url: 'https://news.example/b', date: '01-06-2020' },
    ],
  };

  const res = leakageProbe(seeds, ks);
  assert.equal(res.clean, true, 'a screened KS (no residual fact-check / no post-cutoff) is clean');
  assert.equal(res.leaks.length, 0, 'a clean screen reports no leaks');
});

test('leakageProbe DISCRIMINATES: the same seed flips clean<->leaky based ONLY on the KS contents', () => {
  const seed = {
    claim_id: 6,
    claim: 'covid claim',
    claim_date: '30-10-2020',
    fact_checking_article: 'https://usatoday.example/factcheck/the-verdict',
    cached_original_claim_url: null,
    original_claim_url: null,
  };

  const cleanKs = { 6: [{ sentence: 'news', url: 'https://news.example/a', date: '01-06-2020' }] };
  // A post-cutoff DATED doc survives the screen (the genuine surviving-leak vector).
  const leakyKs = {
    6: [
      { sentence: 'news', url: 'https://news.example/a', date: '01-06-2020' },
      { sentence: 'post-cutoff verdict', url: 'https://news.example/late', date: '01-12-2020' },
    ],
  };

  const clean = leakageProbe([seed], cleanKs);
  const leaky = leakageProbe([seed], leakyKs);

  assert.equal(clean.clean, true, 'screened KS -> clean');
  assert.equal(leaky.clean, false, 'post-cutoff-dated KS -> not clean');
  assert.notEqual(clean.clean, leaky.clean, 'the probe flips on KS contents alone (DISCRIMINATING)');
});

// ---------------------------------------------------------------------------
// The writer: it writes mutated text ONLY under .cache/ (gitignored) and emits a manifest row with
// NO `text` field (uid + remapped label + stratum + recipe/seed + sha256 of the cached bytes).
// ---------------------------------------------------------------------------

test('writeTrap emits NO text field in the manifest row and writes mutated text only under the cache dir', () => {
  const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-eval-traps-cache-'));

  try {
    const result = writeTrap(
      {
        uid: 'averitec-dev-0006',
        uid_seed: 6,
        expected_verdict: 'refuted',
        stratum: 'evidence-absent',
        recipe: { transform: 'magnitude', seed: 7 },
        mutatedText: 'the mutated CC-BY-NC trap claim prose (NEVER committed)',
      },
      { cacheDir },
    );

    // The manifest row carries uid + label + stratum + recipe + sha256, NEVER the NC text.
    assert.equal(result.row.text, undefined, 'the manifest row has NO text field (D-07 / Pitfall 5)');
    assert.equal(result.row.uid, 'averitec-dev-0006', 'the row carries the uid');
    assert.equal(result.row.expected_verdict, 'refuted', 'the row carries the remapped label');
    assert.equal(result.row.stratum, 'evidence-absent', 'the row carries the stratum');
    assert.equal(result.row.recipe.transform, 'magnitude', 'the row carries the mutation recipe');
    assert.ok(/^[0-9a-f]{64}$/.test(result.row.sha256), 'the row carries a sha256 of the cached bytes');

    // The mutated text exists ONLY under the cache dir (gitignored), never in the row.
    assert.ok(fs.existsSync(result.cachePath), 'the mutated text is written to the cache path');
    assert.ok(result.cachePath.startsWith(cacheDir), 'the mutated text lives under the gitignored cache dir');
    const onDisk = fs.readFileSync(result.cachePath, 'utf8');
    assert.ok(onDisk.includes('mutated CC-BY-NC'), 'the cached file holds the mutated prose');

    // The recorded sha256 matches the cached bytes (round-trips through verifySha256).
    const got = verifySha256(Buffer.from(onDisk, 'utf8'), result.row.sha256, result.cachePath);
    assert.equal(got, result.row.sha256, 'the recorded sha256 verifies against the cached bytes');
  } finally {
    fs.rmSync(cacheDir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// verifySha256 fails closed on a tampered buffer (the corpus-integrity guard, T-19-09).
// ---------------------------------------------------------------------------

test('verifySha256 throws /checksum mismatch/ naming the file on a tampered buffer', () => {
  const buf = Buffer.from('the real cached mutated bytes', 'utf8');
  const wrongSha = 'deadbeef'.repeat(8); // 64 hex, deliberately wrong.

  assert.throws(
    () => verifySha256(buf, wrongSha, 'eval/.cache/trap-0006.txt'),
    (err) => err.name === 'ContractError' && /checksum mismatch/i.test(err.message) && err.file === 'eval/.cache/trap-0006.txt',
    'a tampered cached buffer must fail closed with the file named',
  );
});

test('verifySha256 passes (returns the digest) when the buffer matches the expected sha', () => {
  const buf = Buffer.from('the real cached mutated bytes', 'utf8');
  const expected = createHash('sha256').update(buf).digest('hex');
  const got = verifySha256(buf, expected, 'eval/.cache/trap-0006.txt');
  assert.equal(got, expected, 'a matching buffer verifies and returns its digest');
});

test('verifySha256 fails closed on a non-buffer buf (ContractError carrying .file, not a native TypeError -- F9)', () => {
  const sha = createHash('sha256').update('x', 'utf8').digest('hex');
  assert.throws(
    () => verifySha256(null, sha, 'eval/.cache/trap-0006.txt'),
    (err) => err.name === 'ContractError' && err.file === 'eval/.cache/trap-0006.txt',
    'a null buf must fail closed as a ContractError with .file (preserving the error discipline)',
  );
});
