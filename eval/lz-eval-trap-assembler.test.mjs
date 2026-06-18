// lz-eval-trap-assembler.test.mjs
//
// FILE-form deterministic validation for the KS-enrichment layer + the SINGLE-STRATUM (evidence-absent)
// Stage-1 assembler (Plan 19-04, Task 1; EVAL-01; RE-PLAN-4). Dev-only eval-tree test: imports the
// SCRIPT under test (which imports the frozen spine + the built recipe machinery + the runtime
// ContractError across trees) plus node stdlib only. NO network / NO real model calls -- the generate +
// validityProbe + weakVerifier hooks are injected as deterministic stubs, and the seed/KS corpus is
// written to an os.tmpdir() cache (never into the committed tree).
//
// Asserts every Task-1 <behavior> with DISCRIMINATING checks (each proves the function actually
// flips/decides, never a tautology):
//   - extractUrlDate: strict path-only rule; archive-INNER date; fail-closed on no-date / out-of-range
//     / implausibly-future (drop only, never leak);
//   - normalizeClaimDate: makes 9-10-2020 usable while the FROZEN parseAvtDate STILL throws on
//     '9-10-2020' (the fix is at the assembly layer, not the parser); an unsalvageable date -> null;
//   - enrichKsForClaim: returns NEW objects (shared-mutation guard) with a date on every doc + flags
//     ONLY at the pre-registered ranks; a no-date doc gets date:null (-> dropped by the frozen filter);
//   - the assembler builds ONE stratum (evidence-absent) -- NO buried key, NO date-sensitive (RE-PLAN-4);
//   - the >=5-survivor floor + the SINGLE evidence-absent >=3 floor FAIL CLOSED (strict cutoff, same-day
//     + undated excluded);
//   - a below-floor RETAINED set (after the GOLD-BLIND entailment probe drops invalid packets) surfaces
//     the documented VOID signal + the reported probeDropped count (board guardrails 4 + 5);
//   - a trap that fails validityGate OR the GOLD-BLIND entailment probe is REJECTED before it counts;
//   - an evidence-absent trap's enriched KS carries the original unmutated supporting docs + NO refuter;
//   - an assembled row carries NO `text` field (recipe-not-text); mutated prose lives in the tmpdir cache.
//
// HOST QUIRK (load-bearing): on this host (Node v24.13.0 / Windows arm64 / Git Bash) gate ONLY on the
// explicit FILE form: node --test eval/lz-eval-trap-assembler.test.mjs (the directory form spuriously
// exits 1 even when every real test passes). The eval tree requires eval/node_modules/ restored first.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  URL_DATE_RULE,
  extractUrlDate,
  normalizeClaimDate,
  enrichKsForClaim,
  assembleStage1Traps,
} from './lz-eval-trap-assembler.mjs';

import { parseAvtDate, dateFilter } from './lz-eval-search-loop.mjs';

// ===========================================================================
// extractUrlDate: the byte-locked strict path-only rule, archive-inner, fail-closed.
// ===========================================================================

test('extractUrlDate: strict path-only rule returns the in-range /YYYY/MM/DD/ date', () => {
  const d = extractUrlDate('https://x.com/2020/03/15/story');
  assert.ok(d instanceof Date, 'a valid path date returns a Date');
  assert.equal(d.getUTCFullYear(), 2020);
  assert.equal(d.getUTCMonth(), 2, 'March is month index 2');
  assert.equal(d.getUTCDate(), 15);
});

test('extractUrlDate: an archive-wrapped URL returns the INNER publication date, NOT the wrapper timestamp', () => {
  // The 14-digit wrapper timestamp (20240101000000) has NO slash separators -> the strict path rule
  // matches only the inner /2019/06/02/. DISCRIMINATING: it must be 2019-06-02, not 2024-01-01.
  const d = extractUrlDate('https://web.archive.org/web/20240101000000/https://x.com/2019/06/02/p');
  assert.ok(d instanceof Date, 'the inner date parses');
  assert.equal(d.getUTCFullYear(), 2019, 'the INNER 2019 date, not the 2024 wrapper');
  assert.equal(d.getUTCMonth(), 5, 'June is month index 5');
  assert.equal(d.getUTCDate(), 2);
});

test('extractUrlDate: fails closed on no path date / out-of-range / implausibly-future (drop only, never leak)', () => {
  assert.equal(extractUrlDate('https://x.com/story-with-no-date'), null, 'no path date -> null');
  // /2020/02/30/ matches the regex SHAPE but Feb 30 is not a real date -> safeParse rejects -> null.
  assert.equal(extractUrlDate('https://x.com/2020/02/30/feb30'), null, 'out-of-range (Feb 30) -> null');
  // /2020/13/01/ has month 13 -> the regex month bound (0[1-9]|1[0-2]) does not match -> null.
  assert.equal(extractUrlDate('https://x.com/2020/13/01/m13'), null, 'month 13 -> regex no-match -> null');
  // An implausibly-future date (year 2099) is dropped by the future guard (defense-in-depth).
  assert.equal(extractUrlDate('https://x.com/2099/01/01/future'), null, 'implausibly-future -> null (fail closed)');
  // Non-string / empty input -> null (never throws).
  assert.equal(extractUrlDate(null), null);
  assert.equal(extractUrlDate(''), null);
});

test('extractUrlDate: DISCRIMINATING -- a different in-range path date yields a different Date (not a constant)', () => {
  const a = extractUrlDate('https://x.com/2018/01/05/a');
  const b = extractUrlDate('https://x.com/2021/11/30/b');
  assert.notEqual(a.getTime(), b.getTime(), 'distinct path dates produce distinct Dates (not a hardcoded constant)');
  assert.equal(b.getUTCFullYear(), 2021);
  assert.equal(b.getUTCDate(), 30);
});

// ===========================================================================
// normalizeClaimDate: the assembly-layer single-digit-day fix; the frozen parser stays frozen.
// ===========================================================================

test('normalizeClaimDate: zero-pads a single-digit day so parseAvtDate accepts it -- while the FROZEN parseAvtDate STILL throws on the raw single-digit form', () => {
  // The raw single-digit-day date is unparseable by the frozen parser (the fix is NOT in the parser).
  assert.throws(() => parseAvtDate('9-10-2020'), (e) => e.name === 'ContractError', 'the FROZEN parseAvtDate STILL throws on a single-digit day');

  // The normalizer zero-pads at the assembly layer.
  const normalized = normalizeClaimDate('9-10-2020');
  assert.equal(normalized, '09-10-2020', 'the single-digit day is zero-padded');

  // The normalized form is now usable by the frozen parser (no throw). DD-MM-YYYY: day 09, month 10.
  const d = parseAvtDate(normalized);
  assert.equal(d.getUTCFullYear(), 2020);
  assert.equal(d.getUTCMonth(), 9, 'October is month index 9');
  assert.equal(d.getUTCDate(), 9, 'the day is 9 (DD-MM-YYYY: 09-10-2020 is October 9)');
});

test('normalizeClaimDate: an already two-digit date is returned unchanged and still parses', () => {
  assert.equal(normalizeClaimDate('31-10-2020'), '31-10-2020', 'a two-digit date is returned unchanged');
  assert.doesNotThrow(() => parseAvtDate('31-10-2020'));
});

test('normalizeClaimDate: an unsalvageable date returns null so the seed is SKIPPED', () => {
  assert.equal(normalizeClaimDate('not-a-date'), null, 'garbage -> null');
  assert.equal(normalizeClaimDate(null), null, 'null -> null');
  // A normalized-but-out-of-range date (month 13) returns null (the safeParse round-trip rejects it).
  assert.equal(normalizeClaimDate('9-13-2020'), null, 'month 13 normalizes shape but is not a real date -> null');
  // Feb 30 (shape-valid, not real) -> null.
  assert.equal(normalizeClaimDate('30-02-2020'), null, 'Feb 30 is not a real date -> null');
});

// ===========================================================================
// enrichKsForClaim: NEW objects (shared-mutation guard), date everywhere, flags only at the ranks.
// ===========================================================================

test('enrichKsForClaim: returns NEW doc objects -- mutating a returned doc does NOT mutate the input KS', () => {
  const input = [
    { sentence: 's0', url: 'https://x.com/2019/01/01/a' },
    { sentence: 's1', url: 'https://x.com/2019/02/02/b' },
  ];
  const out = enrichKsForClaim(input, {});

  assert.notEqual(out[0], input[0], 'each returned doc is a NEW object reference');
  out[0].sentence = 'MUTATED';
  out[0].date = null;
  assert.equal(input[0].sentence, 's0', 'the input doc sentence is unchanged (shared-mutation guard)');
  assert.equal('date' in input[0], false, 'the input doc never gained a date field');
});

test('enrichKsForClaim: attaches a DD-MM-YYYY date STRING to every doc; a doc whose URL yields no date gets date:null', () => {
  const input = [
    { sentence: 's0', url: 'https://x.com/2019/01/01/a' },
    { sentence: 's1', url: 'https://x.com/no-date-here' },
  ];
  const out = enrichKsForClaim(input, {});

  // The doc date is the DD-MM-YYYY STRING the frozen safeParse / dateFilter consume (NOT a Date object,
  // which safeParse would reject -- silently dropping every enriched doc).
  assert.equal(out[0].date, '01-01-2019', 'a dated URL yields the DD-MM-YYYY string');
  assert.equal(out[1].date, null, 'a no-date URL yields date:null (the frozen dateFilter then drops it)');

  // PROOF the string is consumable: the frozen dateFilter keeps the dated doc when the cutoff is later.
  const kept = dateFilter(out, parseAvtDate('15-05-2020'));
  assert.equal(kept.length, 1, 'the frozen dateFilter keeps the dated doc (date string is consumable)');
  assert.equal(kept[0].sentence, 's0');
});

test('enrichKsForClaim: flags are attached ONLY at the pre-registered ranks (DISCRIMINATING -- not on every doc)', () => {
  const input = [
    { sentence: 's0', url: 'https://x.com/2019/01/01/a' },
    { sentence: 's1', url: 'https://x.com/2019/02/02/b' },
    { sentence: 's2', url: 'https://x.com/2019/03/03/c' },
  ];
  const out = enrichKsForClaim(input, { decisiveRank: 2, disconfirmerRank: 2, verdict: 'refuted' });

  // The flags appear ONLY on rank 2, NOT on ranks 0/1 (no label leak onto every doc).
  assert.equal(out[0].decisive, undefined, 'rank 0 carries no decisive flag');
  assert.equal(out[0].disconfirmer, undefined, 'rank 0 carries no disconfirmer flag');
  assert.equal(out[2].decisive, true, 'rank 2 is flagged decisive');
  assert.equal(out[2].disconfirmer, true, 'rank 2 is flagged disconfirmer');
  assert.equal(out[2].verdict, 'refuted', 'rank 2 carries the verdict');

  // The flags are NOT in the sentence text the model reads (no label leak).
  for (const d of out) {
    assert.equal(/decisive|disconfirmer|refuted/i.test(d.sentence), false, 'the flag never leaks into doc.sentence');
  }
});

test('enrichKsForClaim: with no ranks (default -1) NO doc is flagged (evidence-absent shape)', () => {
  const input = [
    { sentence: 's0', url: 'https://x.com/2019/01/01/a' },
    { sentence: 's1', url: 'https://x.com/2019/02/02/b' },
  ];
  const out = enrichKsForClaim(input, {});

  for (const d of out) {
    assert.equal(d.decisive, undefined, 'no decisive flag without a decisiveRank');
    assert.equal(d.disconfirmer, undefined, 'no disconfirmer flag without a disconfirmerRank');
  }
});

// ===========================================================================
// The SINGLE-STRATUM (evidence-absent) assembler (RE-PLAN-4). A tmpdir cache holds a synthetic seed/KS
// corpus; the hooks are injected.
// ===========================================================================

// Build a synthetic AVeriTeC-shaped cache under os.tmpdir(). The KS docs are dated via their URL so the
// frozen dateFilter + extractUrlDate operate over real (synthetic) dates. Every qualifying seed (>= 5
// strictly-pre-cutoff survivors) becomes `evidence-absent` -- there is NO buried stratum (D-RP4-1).
function writeCache({ seeds, ksByClaim }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-eval-assembler-'));
  fs.mkdirSync(path.join(root, 'data'), { recursive: true });
  fs.mkdirSync(path.join(root, 'data_store'), { recursive: true });

  // dev.json is an array indexed by position = claim_id.
  fs.writeFileSync(path.join(root, 'data', 'dev.json'), JSON.stringify(seeds), 'utf8');

  // The KS file is JSONL: { claim_id, claim, top_100:[{sentence,url}] } per line.
  const lines = Object.keys(ksByClaim).map((id) =>
    JSON.stringify({ claim_id: Number(id), claim: 'c' + id, top_100: ksByClaim[id] }),
  );
  fs.writeFileSync(path.join(root, 'data_store', 'dev_top_k_sentences.json'), lines.join('\n') + '\n', 'utf8');

  return root;
}

// A KS doc dated strictly before the cutoff (2020) so it survives dateFilter.
function preCutoffDoc(i) {
  const mm = String((i % 12) + 1).padStart(2, '0');
  const dd = String((i % 28) + 1).padStart(2, '0');
  return { sentence: 'support sentence ' + i, url: 'https://src' + i + '.example/2019/' + mm + '/' + dd + '/p' };
}

// A KS doc dated AT the cutoff (same-day) -- excluded by the strict `<` (no date-shift).
function sameDayDoc(i) {
  return { sentence: 'same-day ' + i, url: 'https://src.example/2020/05/15/sd' + i };
}

// An UNDATED KS doc (no path date) -- dropped by the frozen dateFilter.
function undatedDoc(i) {
  return { sentence: 'undated ' + i, url: 'https://src.example/no-date/' + i };
}

// Build an evidence-absent-shaped KS: enough pre-cutoff survivors to clear the >= 5 floor, padded with
// undated docs so the packet is plausible supporting text with no in-corpus refuter (RE-PLAN-4: every
// qualifying seed is evidence-absent; there is NO buried/deep-survivor policy).
function evidenceAbsentKs() {
  const docs = [];

  for (let i = 0; i < 6; i += 1) {
    docs.push(preCutoffDoc(i));
  }

  for (let i = 0; i < 10; i += 1) {
    docs.push(undatedDoc(i));
  }

  return docs;
}

// Always-accepting hooks (deterministic; NO network / NO model call).
const acceptGenerate = async (claim) => 'MUTATED: ' + String(claim);
const acceptProbe = async () => ({ accepted: true, reason: 'stub-accept' });

function buildEvidenceAbsentCorpus(count = 6) {
  // `count` evidence-absent seeds (>= the per-stratum floor of 3, with margin). All Supported, all dated
  // 15-05-2020 (cutoff), all with a two-digit day so no normalizer skip. RE-PLAN-4: every qualifying
  // seed is evidence-absent (the SOLE arm) -- there is no buried/evidence-absent split.
  const seeds = [];
  const ksByClaim = {};

  for (let id = 0; id < count; id += 1) {
    seeds.push({ claim: 'absent claim ' + id, label: 'Supported', claim_date: '15-05-2020' });
    ksByClaim[id] = evidenceAbsentKs();
  }

  return { seeds, ksByClaim };
}

test('assembler: builds ONE stratum (evidence-absent) -- NO buried key, NO date-sensitive (RE-PLAN-4 single-stratum)', async () => {
  const root = writeCache(buildEvidenceAbsentCorpus(6));

  try {
    const cacheDir = path.join(root, 'out');
    const res = await assembleStage1Traps({
      cacheRoot: root,
      cacheDir,
      generate: acceptGenerate,
      validityProbe: acceptProbe,
    });

    // DISCRIMINATING: exactly the single evidence-absent key. A regression that re-introduces buried
    // adds a second key and fails deepEqual.
    assert.deepEqual(Object.keys(res.strata), ['evidence-absent'], 'EXACTLY the single evidence-absent stratum (no buried key)');
    assert.equal('buried' in res.strata, false, 'there is NO buried stratum (dropped -- construct-invalid offline, D-RP4-1)');
    assert.equal('date-sensitive' in res.strata, false, 'no date-sensitive stratum is ever assembled (deferred to Phase-20)');

    // Every assembled row is tagged evidence-absent (DISCRIMINATING: never buried, never date-sensitive).
    const allRows = res.strata['evidence-absent'];
    assert.ok(allRows.length >= 3, 'the evidence-absent stratum reached the floor');

    for (const row of allRows) {
      assert.equal(row.stratum, 'evidence-absent', 'every row is tagged evidence-absent (the sole arm)');
    }

    // The probe accepted every packet, so probeDropped is 0 here (the dedicated counter exists + is 0).
    assert.equal(res.attrition.probeDropped, 0, 'the gold-blind probe dropped nothing (all-accept stub)');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('assembler: an assembled row carries NO `text` field (recipe-not-text); the mutated prose lives in the tmpdir cache only', async () => {
  const root = writeCache(buildEvidenceAbsentCorpus(6));

  try {
    const cacheDir = path.join(root, 'out');
    const res = await assembleStage1Traps({
      cacheRoot: root,
      cacheDir,
      generate: acceptGenerate,
      validityProbe: acceptProbe,
    });

    const allRows = res.strata['evidence-absent'];
    assert.ok(allRows.length >= 1, 'non-vacuous (>= 1 assembled row)');

    for (const row of allRows) {
      assert.equal('text' in row, false, 'no row carries a text field (recipe-not-text, D-07)');
      assert.ok(row.recipe && typeof row.recipe === 'object', 'each row carries the mutation recipe');
      assert.equal(typeof row.sha256, 'string', 'each row carries the cache sha256');
    }

    // The mutated prose is written to the cacheDir (a .txt per uid), NOT into any committed tree.
    const cacheFiles = fs.readdirSync(cacheDir).filter((f) => f.endsWith('.txt'));
    assert.equal(cacheFiles.length, allRows.length, 'one cached prose file per assembled trap');
    const sample = fs.readFileSync(path.join(cacheDir, cacheFiles[0]), 'utf8');
    assert.match(sample, /^MUTATED: /, 'the cached file holds the generated mutated prose');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('assembler: an evidence-absent trap carries the original unmutated supporting docs as plausible text and NO pre-cutoff decisive refuter flag', async () => {
  // Drive enrichment directly for the evidence-absent shape (the assembler attaches no refuter flag for
  // it). The enriched KS keeps the original supporting sentences (a genuine text temptation) and NO doc
  // is flagged decisive/disconfirmer.
  const ks = evidenceAbsentKs();
  const enriched = enrichKsForClaim(ks, {}); // evidence-absent: no ranks

  // The original supporting sentences survive verbatim (plausible text temptation).
  assert.equal(enriched[0].sentence, ks[0].sentence, 'the original supporting sentence is retained');
  // NO doc carries a refuter flag.
  for (const d of enriched) {
    assert.equal(d.decisive, undefined, 'no decisive refuter in an evidence-absent KS');
    assert.equal(d.disconfirmer, undefined, 'no pre-cutoff disconfirmer in an evidence-absent KS');
  }
});

test('assembler: the >=5-survivor floor FAILS CLOSED -- a seed with too few strictly-pre-cutoff survivors is excluded (same-day + undated do NOT count)', async () => {
  // A corpus where 6 evidence-absent seeds are valid, plus ONE seed whose KS has only 4 pre-cutoff
  // survivors (the rest same-day/undated). That seed must be EXCLUDED (skippedFewSurvivors), and its uid
  // must NOT appear in the stratum -- proving min-not-met cannot silently change the trap.
  const { seeds, ksByClaim } = buildEvidenceAbsentCorpus(6);
  const shortId = seeds.length; // next claim_id
  seeds.push({ claim: 'short claim', label: 'Supported', claim_date: '15-05-2020' });
  const shortKs = [];

  for (let i = 0; i < 4; i += 1) {
    shortKs.push(preCutoffDoc(i)); // only 4 survivors
  }

  shortKs.push(sameDayDoc(0)); // same-day: excluded by strict <
  shortKs.push(sameDayDoc(1));
  shortKs.push(undatedDoc(0)); // undated: dropped

  ksByClaim[shortId] = shortKs;
  const root = writeCache({ seeds, ksByClaim });

  try {
    const res = await assembleStage1Traps({
      cacheRoot: root,
      cacheDir: path.join(root, 'out'),
      generate: acceptGenerate,
      validityProbe: acceptProbe,
    });

    assert.ok(res.attrition.skippedFewSurvivors >= 1, 'the short-survivor seed was excluded (fail closed)');
    const shortUid = 'averitec-dev-' + String(shortId).padStart(4, '0');
    const allUids = res.strata['evidence-absent'].map((r) => r.uid);
    assert.equal(allUids.includes(shortUid), false, 'the excluded seed never reaches the stratum');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('assembler: the SINGLE evidence-absent >=3 floor FAILS CLOSED on a degenerate corpus -- a short corpus throws /perStratumFloor/ (RE-PLAN-4)', async () => {
  // RE-PLAN-4: there is ONE stratum (evidence-absent). The THROW path fires when the SOLE arm is below
  // perStratumFloor (3) -- a degenerate corpus with no honest PRIMARY arm fails closed. Build only 2
  // evidence-absent seeds (below the floor); the assembler must THROW /perStratumFloor/ naming
  // evidence-absent (so the throw is the single-stratum floor, not a leftover buried path).
  const { seeds, ksByClaim } = buildEvidenceAbsentCorpus(2);
  const root = writeCache({ seeds, ksByClaim });

  try {
    await assert.rejects(
      () =>
        assembleStage1Traps({
          cacheRoot: root,
          cacheDir: path.join(root, 'out'),
          generate: acceptGenerate,
          validityProbe: acceptProbe,
        }),
      (e) => e.name === 'ContractError' && /perStratumFloor/.test(e.message) && /evidence-absent/.test(e.message),
      'a SHORT evidence-absent SOLE arm (degenerate corpus) fails closed naming the single stratum',
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('assembler: I4 inclusive boundary -- a seed with EXACTLY 5 strictly-pre-cutoff survivors is KEPT (the floor is `<5`, not `<=5`)', async () => {
  // The COMPLEMENT of the 4-survivor exclusion test above: a seed whose KS has EXACTLY minSurvivors (5)
  // strictly-pre-cutoff dated survivors (plus same-day/undated docs that do NOT count) is KEPT -- its
  // uid reaches the stratum. This proves the floor admits exactly 5 (an off-by-one `<` -> `<=` regression
  // would EXCLUDE this seed and fail the assertion). Both boundary directions are now exercised: 4 drops,
  // 5 keeps.
  const { seeds, ksByClaim } = buildEvidenceAbsentCorpus(6);
  const exactId = seeds.length; // next claim_id
  seeds.push({ claim: 'exactly-5 claim', label: 'Supported', claim_date: '15-05-2020' });
  const exactKs = [];

  for (let i = 0; i < 5; i += 1) {
    exactKs.push(preCutoffDoc(i)); // EXACTLY 5 strictly-pre-cutoff survivors
  }

  exactKs.push(sameDayDoc(0)); // same-day: excluded by strict < (does NOT count)
  exactKs.push(undatedDoc(0)); // undated: dropped (does NOT count)
  exactKs.push(undatedDoc(1));

  ksByClaim[exactId] = exactKs;
  const root = writeCache({ seeds, ksByClaim });

  try {
    const res = await assembleStage1Traps({
      cacheRoot: root,
      cacheDir: path.join(root, 'out'),
      generate: acceptGenerate,
      validityProbe: acceptProbe,
    });

    // The exactly-5-survivor seed was NOT excluded for too-few survivors -- it lands in evidence-absent
    // (the sole arm).
    const exactUid = 'averitec-dev-' + String(exactId).padStart(4, '0');
    const allUids = res.strata['evidence-absent'].map((r) => r.uid);
    assert.equal(allUids.includes(exactUid), true, 'the exactly-5-survivor seed is KEPT (floor admits 5)');
    const exactRow = res.strata['evidence-absent'].find((r) => r.uid === exactUid);
    assert.ok(exactRow, 'the exactly-5-survivor seed is an evidence-absent trap');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('assembler: below-floor VOID -- when the GOLD-BLIND probe drops enough packets that the RETAINED set < floor, the documented VOID signal surfaces with the reported probeDropped count (RE-PLAN-4 board guardrails 4+5)', async () => {
  // 19-04-REPLAN-DECISION-4 (board guardrails 4 + 5): the gold-blind entailment probe screens every
  // candidate evidence-absent packet. When it DISQUALIFIES enough packets that the RETAINED (post-probe)
  // set falls below the floor (>= 3), that IS the documented VOID condition -- NOT a silent pass and NOT
  // an unhandled throw masquerading as success. The realized signal here: the assembler THROWS
  // /perStratumFloor/ AND the thrown error carries the realized attrition (probeDropped > 0 +
  // retainedBelowFloor=true + a voidReason). DISCRIMINATING: a probe that ACCEPTS the same corpus builds
  // a full set (proven below in the all-accept paths), so this throw is caused by the probe drops, and
  // the reported probeDropped count surfaces the drops (the floor is load-bearing, never relaxed).
  //
  // Build 5 evidence-absent seeds; a probe that accepts only the FIRST 2 (rejecting the rest) leaves a
  // RETAINED set of 2 -- below the floor of 3 -- so the VOID throw must fire with probeDropped=3.
  const { seeds, ksByClaim } = buildEvidenceAbsentCorpus(5);
  const root = writeCache({ seeds, ksByClaim });

  try {
    let seen = 0;
    const dropMostProbe = async () => {
      seen += 1;

      if (seen <= 2) {
        return { accepted: true, reason: 'survivors support original, not the overreach (retain)' };
      }

      return { accepted: false, reason: 'survivors plausibly entail the overreach (disqualify)' };
    };

    let thrown = null;

    await assert.rejects(
      () =>
        assembleStage1Traps({
          cacheRoot: root,
          cacheDir: path.join(root, 'out'),
          generate: acceptGenerate,
          validityProbe: dropMostProbe,
        }),
      (e) => {
        thrown = e;

        return (
          e.name === 'ContractError' &&
          /perStratumFloor/.test(e.message) &&
          /evidence-absent/.test(e.message) &&
          // The realized probe-drop count is surfaced in the throw message (board guardrail 4).
          /probeDropped=3/.test(e.message)
        );
      },
      'a below-floor RETAINED set (after the gold-blind probe drops) fails closed as a documented VOID',
    );

    // The thrown error carries the realized attrition: the documented VOID signal is REPORTED, not
    // silently absorbed (board guardrail 4) and the floor is honored as load-bearing (board guardrail 5).
    assert.ok(thrown && thrown.attrition, 'the thrown VOID carries the realized attrition');
    assert.equal(thrown.attrition.probeDropped, 3, 'the gold-blind probe dropped exactly 3 packets (reported)');
    assert.equal(thrown.attrition.retainedBelowFloor, true, 'retainedBelowFloor is the documented VOID flag');
    assert.equal(typeof thrown.attrition.voidReason, 'string', 'a VOID reason is recorded');
    assert.match(thrown.attrition.voidReason, /probeDropped|gold-blind|VOID/, 'the VOID reason names the probe drop / VOID');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('assembler: the GOLD-BLIND entailment probe gates the set -- a probe that disqualifies survivors-entail-overreach packets drops them (vs an accepting probe), counted in probeDropped (RE-PLAN-4)', async () => {
  // RE-PLAN-4 (board guardrails 1+2+4+6): the stratification correctness rests on the GOLD-BLIND
  // entailment validityProbe (NOT a runtime classifySeed tautology -- buried is dropped). The probe
  // reads ONLY the survivors + the mutated overreach and DISQUALIFIES packets whose survivors
  // plausibly entail the overreach. This test proves the probe is load-bearing + DISCRIMINATING: a
  // probe that rejects SOME packets drops exactly those (counted in probeDropped), whereas the
  // all-accept stub keeps them. A non-discriminating probe could never change the assembled set.
  const { seeds, ksByClaim } = buildEvidenceAbsentCorpus(8);
  const root = writeCache({ seeds, ksByClaim });

  try {
    // Reject 2 packets (survivors entail the overreach -> gold=refuted indefensible); accept the rest.
    // C-RP4-3 (discriminating, closed-book mirroring): the GOLD-BLIND probe MUST receive ONLY the
    // date-filtered survivors -- EXACTLY what the voter judges -- never the unfiltered datedKs (which
    // includes the 10 undated docs evidenceAbsentKs seeds). dateFilter idempotence proves it: an
    // already-filtered set is unchanged by a re-filter, so a regression to datedKs (C-RP4-1) would pass
    // undated/post-cutoff docs here and trip the assertion.
    const fixtureCutoff = parseAvtDate('15-05-2020'); // buildEvidenceAbsentCorpus seeds this claim_date
    let seen = 0;
    const entailmentProbe = async ({ enrichedKs }) => {
      assert.ok(Array.isArray(enrichedKs) && enrichedKs.length > 0, 'the probe receives a non-empty enrichedKs');
      assert.equal(
        dateFilter(enrichedKs, fixtureCutoff).length,
        enrichedKs.length,
        'the gold-blind probe sees ONLY the date-filtered survivors (closed-book mirroring) -- a regression to the unfiltered datedKs would include undated/post-cutoff docs and fail here (C-RP4-1)',
      );
      seen += 1;

      if (seen === 3 || seen === 6) {
        return { accepted: false, reason: 'survivors directly entail the overreach -> disqualify' };
      }

      return { accepted: true, reason: 'survivors support original but do NOT entail the overreach -> retain' };
    };

    const res = await assembleStage1Traps({
      cacheRoot: root,
      cacheDir: path.join(root, 'out'),
      generate: acceptGenerate,
      validityProbe: entailmentProbe,
    });

    // The 2 entailing packets were dropped; the rest are retained (>= the floor of 3).
    assert.equal(res.attrition.probeDropped, 2, 'the gold-blind probe dropped exactly the 2 entailing packets');
    assert.equal(res.strata['evidence-absent'].length, 6, '8 candidates minus 2 probe-drops = 6 retained');
    // DISCRIMINATING vs the all-accept probe, which would retain all 8.
    assert.ok(res.attrition.probeDropped >= 1, 'the gold-blind entailment probe screened out >= 1 packet (load-bearing, not a rubber stamp)');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('assembler: a trap that fails the validityGate (weak verifier CAUGHT it) is REJECTED before it counts', async () => {
  const root = writeCache(buildEvidenceAbsentCorpus(6));

  try {
    // A weak verifier that CORRECTLY refutes every trap (returns 'refuted' on a refuted-gold trap) does
    // NOT flip -> validityGate rejects ALL traps -> the evidence-absent stratum falls below the floor ->
    // the assembler throws (no trap survives). This proves the validityGate screen is load-bearing.
    await assert.rejects(
      () =>
        assembleStage1Traps({
          cacheRoot: root,
          cacheDir: path.join(root, 'out'),
          generate: acceptGenerate,
          validityProbe: acceptProbe,
          weakVerifier: () => 'refuted', // catches every trap -> no flip -> rejected
        }),
      (e) => e.name === 'ContractError' && /perStratumFloor/.test(e.message),
      'when the weak verifier catches every trap, none survive validityGate -> fail closed',
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('assembler: a trap that fails the GOLD-BLIND entailment probe is REJECTED before it counts', async () => {
  const root = writeCache(buildEvidenceAbsentCorpus(6));

  try {
    // A validity probe that rejects every trap -> none survive -> the assembler throws. DISCRIMINATING
    // vs the always-accept probe (which produces a full set elsewhere) -- proving the probe gates rather
    // than rubber-stamps. The probeDropped count records every reject (board guardrail 4).
    let thrown = null;

    await assert.rejects(
      () =>
        assembleStage1Traps({
          cacheRoot: root,
          cacheDir: path.join(root, 'out'),
          generate: acceptGenerate,
          validityProbe: async () => ({ accepted: false, reason: 'survivors entail the overreach -> disqualify' }),
        }),
      (e) => {
        thrown = e;

        return e.name === 'ContractError' && /perStratumFloor/.test(e.message);
      },
      'when the gold-blind entailment probe rejects every trap, none survive -> fail closed',
    );

    // Every reject is counted in probeDropped (reported on the thrown attrition, board guardrail 4).
    assert.ok(thrown.attrition && thrown.attrition.probeDropped >= 3, 'every probe reject is counted in probeDropped');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('assembler: attrition reports the single-stratum count + probeDropped + the run config the dispatch consumes', async () => {
  const root = writeCache(buildEvidenceAbsentCorpus(6));

  try {
    const res = await assembleStage1Traps({
      cacheRoot: root,
      cacheDir: path.join(root, 'out'),
      generate: acceptGenerate,
      validityProbe: acceptProbe,
    });

    assert.equal(res.attrition.scanned, 6, 'all 6 Supported seeds were scanned');
    assert.equal('buried' in res.attrition.perStratumCount, false, 'there is NO buried per-stratum count (buried dropped)');
    assert.equal(res.attrition.perStratumCount['evidence-absent'], res.strata['evidence-absent'].length, 'the evidence-absent count matches the stratum size');
    assert.equal(res.attrition.probeDropped, 0, 'the dedicated probeDropped counter exists (0 on the all-accept stub)');
    assert.equal(res.runConfig.minSurvivors, 5, 'the >=5-survivor floor is the run config default');
    assert.equal(res.runConfig.perStratumFloor, 3, 'the >=3/stratum floor is the run config default');

    // goldLabels maps every assembled uid -> 'refuted'.
    const allUids = res.strata['evidence-absent'].map((r) => r.uid);

    for (const uid of allUids) {
      assert.equal(res.goldLabels[uid], 'refuted', 'every assembled trap is refuted-gold by construction');
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

// ===========================================================================
// Byte-lock + ASCII.
// ===========================================================================

test('URL_DATE_RULE is the exact byte-locked strict path-only source the manifest pre-registers', () => {
  // The manifest (Task 3) carries this EXACT source string; the aggregate anti-drift test asserts
  // manifest-string === URL_DATE_RULE.source. Pin it here so a drift in the rule is caught at its source.
  assert.equal(
    URL_DATE_RULE.source,
    '(19|20)\\d{2}\\/(0[1-9]|1[0-2])\\/(0[1-9]|[12]\\d|3[01])(\\/|$)',
    'URL_DATE_RULE.source is byte-locked',
  );
});

test('assembler source is strictly ASCII (committed bytes, CLAUDE.md)', () => {
  const buf = fs.readFileSync(new URL('./lz-eval-trap-assembler.mjs', import.meta.url));

  for (let i = 0; i < buf.length; i += 1) {
    assert.ok(buf[i] <= 0x7f, 'non-ASCII byte 0x' + buf[i].toString(16) + ' at offset ' + i);
  }
});
