// lz-eval-trap-assembler.test.mjs
//
// FILE-form deterministic validation for the KS-enrichment layer + the 2-strata Stage-1 assembler
// (Plan 19-04, Task 1; EVAL-01). Dev-only eval-tree test: imports the SCRIPT under test (which imports
// the frozen spine + the built recipe machinery + the runtime ContractError across trees) plus node
// stdlib only. NO network / NO real model calls -- the generate + validityProbe + weakVerifier hooks
// are injected as deterministic stubs, and the seed/KS corpus is written to an os.tmpdir() cache (never
// into the committed tree).
//
// Asserts every Task-1 <behavior> with DISCRIMINATING checks (each proves the function actually
// flips/decides, never a tautology):
//   - extractUrlDate: strict path-only rule; archive-INNER date; fail-closed on no-date / out-of-range
//     / implausibly-future (drop only, never leak);
//   - normalizeClaimDate: makes 9-10-2020 usable while the FROZEN parseAvtDate STILL throws on
//     '9-10-2020' (the fix is at the assembly layer, not the parser); an unsalvageable date -> null;
//   - enrichKsForClaim: returns NEW objects (shared-mutation guard) with a date on every doc + flags
//     ONLY at the pre-registered ranks; a no-date doc gets date:null (-> dropped by the frozen filter);
//   - the assembler builds buried + evidence-absent ONLY (never date-sensitive);
//   - the >=5-survivor + >=3/stratum floors FAIL CLOSED (strict cutoff, same-day + undated excluded);
//   - a trap that fails validityGate OR the BLIND content-grounding probe is REJECTED before it counts;
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
// The 2-strata assembler. A tmpdir cache holds a synthetic seed/KS corpus; the hooks are injected.
// ===========================================================================

// Build a synthetic AVeriTeC-shaped cache under os.tmpdir(). The KS docs are dated via their URL so the
// frozen dateFilter + extractUrlDate operate over real (synthetic) dates. A "buried" seed has a deep
// (>= rank 20) surviving doc; an "evidence-absent" seed has only shallow survivors.
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

// Build a buried-shaped KS: >= 25 pre-cutoff survivors so the deepest survivor sits at rank >= 20.
function buriedKs() {
  const docs = [];

  for (let i = 0; i < 25; i += 1) {
    docs.push(preCutoffDoc(i));
  }

  return docs;
}

// Build an evidence-absent-shaped KS: fewer than 20 pre-cutoff survivors (so the deepest survivor is
// shallow), padded with undated docs so retrieval is still plausible but there is no deep refuter.
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

function buildBalancedCorpus() {
  // 6 buried seeds + 6 evidence-absent seeds (>= the per-stratum floor of 3, with margin). All
  // Supported, all dated 15-05-2020 (cutoff), all with a two-digit day so no normalizer skip.
  const seeds = [];
  const ksByClaim = {};

  for (let id = 0; id < 6; id += 1) {
    seeds.push({ claim: 'buried claim ' + id, label: 'Supported', claim_date: '15-05-2020' });
    ksByClaim[id] = buriedKs();
  }

  for (let id = 6; id < 12; id += 1) {
    seeds.push({ claim: 'absent claim ' + id, label: 'Supported', claim_date: '15-05-2020' });
    ksByClaim[id] = evidenceAbsentKs();
  }

  return { seeds, ksByClaim };
}

test('assembler: builds buried + evidence-absent ONLY and NEVER a date-sensitive stratum', async () => {
  const root = writeCache(buildBalancedCorpus());

  try {
    const cacheDir = path.join(root, 'out');
    const res = await assembleStage1Traps({
      cacheRoot: root,
      cacheDir,
      generate: acceptGenerate,
      validityProbe: acceptProbe,
    });

    assert.deepEqual(Object.keys(res.strata).sort(), ['buried', 'evidence-absent'], 'exactly the two offline strata');
    assert.equal('date-sensitive' in res.strata, false, 'no date-sensitive stratum is ever assembled');

    // Every assembled row is tagged buried or evidence-absent (DISCRIMINATING: never date-sensitive).
    const allRows = [...res.strata.buried, ...res.strata['evidence-absent']];

    for (const row of allRows) {
      assert.ok(row.stratum === 'buried' || row.stratum === 'evidence-absent', 'row stratum is one of the two offline strata');
      assert.notEqual(row.stratum, 'date-sensitive', 'no row is tagged date-sensitive');
    }

    // BOTH strata are populated (the buried/evidence-absent split actually fired -- not a single bucket).
    assert.ok(res.strata.buried.length >= 3, 'the buried stratum reached the floor');
    assert.ok(res.strata['evidence-absent'].length >= 3, 'the evidence-absent stratum reached the floor');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('assembler: an assembled row carries NO `text` field (recipe-not-text); the mutated prose lives in the tmpdir cache only', async () => {
  const root = writeCache(buildBalancedCorpus());

  try {
    const cacheDir = path.join(root, 'out');
    const res = await assembleStage1Traps({
      cacheRoot: root,
      cacheDir,
      generate: acceptGenerate,
      validityProbe: acceptProbe,
    });

    const allRows = [...res.strata.buried, ...res.strata['evidence-absent']];
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
  // A corpus where 6 buried + 6 evidence-absent are valid, plus ONE seed whose KS has only 4 pre-cutoff
  // survivors (the rest same-day/undated). That seed must be EXCLUDED (skippedFewSurvivors), and its uid
  // must NOT appear in any stratum -- proving min-not-met cannot silently change the trap.
  const { seeds, ksByClaim } = buildBalancedCorpus();
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
    const allUids = [...res.strata.buried, ...res.strata['evidence-absent']].map((r) => r.uid);
    assert.equal(allUids.includes(shortUid), false, 'the excluded seed never reaches any stratum');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('assembler: the >=3/stratum floor FAILS CLOSED -- a corpus that cannot fill a stratum throws', async () => {
  // Only 2 buried-shaped seeds (below the per-stratum floor of 3) -> the assembler must throw.
  const seeds = [];
  const ksByClaim = {};

  for (let id = 0; id < 2; id += 1) {
    seeds.push({ claim: 'buried claim ' + id, label: 'Supported', claim_date: '15-05-2020' });
    ksByClaim[id] = buriedKs();
  }

  // 4 evidence-absent seeds (above the floor) so ONLY the buried stratum is short.
  for (let id = 2; id < 6; id += 1) {
    seeds.push({ claim: 'absent claim ' + id, label: 'Supported', claim_date: '15-05-2020' });
    ksByClaim[id] = evidenceAbsentKs();
  }

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
      (e) => e.name === 'ContractError' && /perStratumFloor/.test(e.message),
      'a stratum below the per-stratum floor fails closed',
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('assembler: a trap that fails the validityGate (weak verifier CAUGHT it) is REJECTED before it counts', async () => {
  const root = writeCache(buildBalancedCorpus());

  try {
    // A weak verifier that CORRECTLY refutes every trap (returns 'refuted' on a refuted-gold trap) does
    // NOT flip -> validityGate rejects ALL traps -> both strata fall below the floor -> the assembler
    // throws (no trap survives). This proves the validityGate screen is load-bearing (not a no-op).
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

test('assembler: a trap that fails the BLIND content-grounding probe is REJECTED before it counts', async () => {
  const root = writeCache(buildBalancedCorpus());

  try {
    // A validity probe that rejects every trap -> none survive -> the assembler throws. DISCRIMINATING
    // vs the always-accept probe (which produces a full set in the test above) -- proving the probe
    // gates rather than rubber-stamps.
    await assert.rejects(
      () =>
        assembleStage1Traps({
          cacheRoot: root,
          cacheDir: path.join(root, 'out'),
          generate: acceptGenerate,
          validityProbe: async () => ({ accepted: false, reason: 'probe-rejected' }),
        }),
      (e) => e.name === 'ContractError' && /perStratumFloor/.test(e.message),
      'when the blind content-grounding probe rejects every trap, none survive -> fail closed',
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('assembler: attrition reports per-stratum counts + the run config the dispatch consumes', async () => {
  const root = writeCache(buildBalancedCorpus());

  try {
    const res = await assembleStage1Traps({
      cacheRoot: root,
      cacheDir: path.join(root, 'out'),
      generate: acceptGenerate,
      validityProbe: acceptProbe,
    });

    assert.equal(res.attrition.scanned, 12, 'all 12 Supported seeds were scanned');
    assert.equal(res.attrition.perStratumCount.buried, res.strata.buried.length, 'the buried count matches the stratum size');
    assert.equal(res.attrition.perStratumCount['evidence-absent'], res.strata['evidence-absent'].length, 'the evidence-absent count matches');
    assert.equal(res.runConfig.minSurvivors, 5, 'the >=5-survivor floor is the run config default');
    assert.equal(res.runConfig.perStratumFloor, 3, 'the >=3/stratum floor is the run config default');

    // goldLabels maps every assembled uid -> 'refuted'.
    const allUids = [...res.strata.buried, ...res.strata['evidence-absent']].map((r) => r.uid);

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
