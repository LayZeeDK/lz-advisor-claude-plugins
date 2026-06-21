// lz-eval-evidence-join.test.mjs
//
// Validation fixture for the SHARED evidence-text JOIN (Phase 20, Plan 20-05 blocking-bug fix). The join
// reconstructs a survivor cluster's REAL stored evidence TEXT (cluster -> claims -> excerpts) as
// [{ sentence }] -- NEVER a bare URL -- and FLAGS a cluster with no recoverable text so the caller drops it.
// It is shared by BOTH live-cert harvest arms (arm A lz-eval-armA-native.mjs, arm B lz-eval-harvest.mjs).
//
// THIS IS A NO-SPEND TEST. It sets NO LZ_SPEND, dispatches NO real OOF/Copilot call, spawns NO Agent. Every
// fixture is a tmpdir run-dir corpus (zero committed bytes). Every assertion is DISCRIMINATING.
//
// HOST QUIRK (load-bearing): on this host (Node v24.x / Windows arm64 / Git Bash) the phase gate MUST target
// the explicit FILE form: node --test eval/lz-eval-evidence-join.test.mjs (the directory form spuriously
// exits 1 on this host even when every real test passes).
//
// The byte-order mark is code point U+FEFF. This source contains no literal byte-order mark.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  joinClusterEvidence,
  resetEvidenceJoinCache,
  EXCERPT_CHAR_CAP,
  EVIDENCE_OVERLAP_JACCARD,
} from './lz-eval-evidence-join.mjs';

// Write a single run-dir with survivors + claims/*.json + excerpts/*.txt. `workers` is an array of
// { source, claims:[{ id, text, quote, excerpt_id }] }; `excerpts` maps excerpt_id -> passage text.
function writeRunDir({ workers = [], excerpts = {} } = {}) {
  resetEvidenceJoinCache();
  const corpus = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-ev-join-'));
  const runDir = path.join(corpus, 'run0');
  fs.mkdirSync(path.join(runDir, 'claims'), { recursive: true });
  fs.mkdirSync(path.join(runDir, 'excerpts'), { recursive: true });
  fs.writeFileSync(path.join(runDir, 'survivors.json'), JSON.stringify([], null, 2) + '\n', 'utf8');

  workers.forEach((w, i) => {
    fs.writeFileSync(
      path.join(runDir, 'claims', 'w-extract-' + (i + 1) + '.json'),
      JSON.stringify({ worker: 'w-extract-' + (i + 1), source: w.source, claims: w.claims }, null, 2) + '\n',
      'utf8',
    );
  });

  for (const [id, text] of Object.entries(excerpts)) {
    fs.writeFileSync(path.join(runDir, 'excerpts', id + '.txt'), text, 'utf8');
  }

  return { corpus, runDir };
}

test('the documented thresholds are exported (cap 1200 chars, overlap Jaccard 0.6)', () => {
  assert.equal(EXCERPT_CHAR_CAP, 1200, 'the per-excerpt char cap is the documented 1200');
  assert.equal(EVIDENCE_OVERLAP_JACCARD, 0.6, 'the overlap Jaccard threshold is the documented 0.6');
});

test('joinClusterEvidence EXACT-matches a cluster claim to a worker text and returns the quote FIRST + DISTINCT excerpt context (never a URL)', () => {
  const { corpus, runDir } = writeRunDir({
    workers: [{
      source: 'https://example.org/doc',
      // The quote is the verified, load-bearing snippet. The excerpt carries DISTINCT additional context (a
      // second sentence the quote does NOT contain) -> the excerpt is kept as secondary context (not deduped).
      claims: [{ id: 'c1', text: 'the reaction yields a net energy release', quote: 'net energy release observed in every trial', excerpt_id: 'e1' }],
    }],
    excerpts: { e1: 'Calorimetry confirmed the exotherm under standard pressure across all replicates.' },
  });

  try {
    const joined = joinClusterEvidence(runDir, { claim: 'the reaction yields a net energy release', sources: ['https://example.org/doc'] });

    assert.equal(joined.matched, true, 'the exact text is matched');
    assert.equal(joined.reason, 'exact', 'the match path is exact');
    assert.ok(!/https?:\/\//.test(JSON.stringify(joined.evidence)), 'the evidence is TEXT, never a URL');
    // QUOTE-PRIMARY: the verbatim quote is the FIRST evidence sentence.
    assert.equal(joined.evidence[0].sentence, 'net energy release observed in every trial', 'the verbatim quote is the FIRST evidence sentence (quote-primary)');
    // The excerpt is DISTINCT context (neither contains the other) -> joined as secondary.
    assert.ok(joined.evidence.some((e) => e.sentence.includes('Calorimetry confirmed the exotherm under standard pressure across all replicates')), 'the distinct excerpt context is joined as secondary evidence');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('joinClusterEvidence uses the OVERLAP path (Jaccard >= 0.6) when the cluster claim is a paraphrase', () => {
  const { corpus, runDir } = writeRunDir({
    workers: [{
      source: 'https://example.org/doc',
      claims: [{ id: 'c1', text: 'the catalyst markedly accelerates the forward reaction rate', quote: 'catalyst accelerates forward reaction', excerpt_id: 'e1' }],
    }],
    excerpts: { e1: 'The catalyst markedly accelerates the forward reaction rate under load.' },
  });

  try {
    // A paraphrase with high token overlap but NOT byte-exact.
    const joined = joinClusterEvidence(runDir, { claim: 'the catalyst markedly accelerates the forward reaction rate notably', sources: ['https://example.org/doc'] });

    assert.equal(joined.matched, true, 'the paraphrase matches via overlap');
    assert.equal(joined.reason, 'overlap', 'the match path is overlap');
    assert.ok(joined.evidence.some((e) => e.sentence.includes('catalyst accelerates forward reaction')), 'the worker quote is recovered');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('joinClusterEvidence FLAGS matched:false when the cluster source has no eligible worker claims', () => {
  const { corpus, runDir } = writeRunDir({
    workers: [{ source: 'https://example.org/other', claims: [{ id: 'c1', text: 'unrelated text', quote: 'q', excerpt_id: 'e1' }] }],
    excerpts: { e1: 'passage' },
  });

  try {
    const joined = joinClusterEvidence(runDir, { claim: 'a claim whose source is not present', sources: ['https://example.org/missing'] });

    assert.equal(joined.matched, false, 'no eligible worker claim -> matched:false');
    assert.equal(joined.evidence.length, 0, 'no evidence emitted');
    assert.equal(joined.reason, 'no-eligible-worker-claims-for-cluster-sources', 'the reason names the missing source scope');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('joinClusterEvidence FLAGS matched:false when an eligible worker claim exists but none matches the cluster claim', () => {
  const { corpus, runDir } = writeRunDir({
    workers: [{ source: 'https://example.org/doc', claims: [{ id: 'c1', text: 'completely different subject matter entirely', quote: 'q', excerpt_id: 'e1' }] }],
    excerpts: { e1: 'passage' },
  });

  try {
    const joined = joinClusterEvidence(runDir, { claim: 'zzz qqq vvv no shared tokens at all', sources: ['https://example.org/doc'] });

    assert.equal(joined.matched, false, 'an eligible-but-non-matching worker claim -> matched:false');
    assert.equal(joined.reason, 'no-worker-claim-matched-cluster-claim', 'the reason names the no-match');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('joinClusterEvidence caps the excerpt at 1200 chars + strips non-ASCII bytes; the quote is emitted in full', () => {
  const big = 'X'.repeat(5000);
  const accented = 'mu' + String.fromCharCode(0x00b5) + ' alpha ' + String.fromCharCode(0x03b1) + ' done'; // non-ASCII micro + alpha
  const { corpus, runDir } = writeRunDir({
    workers: [{ source: 'https://example.org/doc', claims: [{ id: 'c1', text: 'the cap claim', quote: accented, excerpt_id: 'e1' }] }],
    excerpts: { e1: big },
  });

  try {
    const joined = joinClusterEvidence(runDir, { claim: 'the cap claim', sources: ['https://example.org/doc'] });

    assert.equal(joined.matched, true, 'matched');

    for (const e of joined.evidence) {
      assert.ok(e.sentence.length <= EXCERPT_CHAR_CAP, 'no sentence exceeds the cap');

      for (let i = 0; i < e.sentence.length; i += 1) {
        assert.ok(e.sentence.charCodeAt(i) <= 0x7f, 'every char is ASCII');
      }
    }

    assert.ok(joined.evidence.some((e) => e.sentence.includes('mu alpha') && e.sentence.includes('done')), 'the quote is recovered with non-ASCII bytes stripped');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('joinClusterEvidence fails closed on a missing run-dir path / non-object cluster (ContractError)', () => {
  assert.throws(() => joinClusterEvidence('', { claim: 'x', sources: [] }), (e) => e.name === 'ContractError', 'empty run dir fails closed');
  assert.throws(() => joinClusterEvidence('/tmp/whatever', null), (e) => e.name === 'ContractError', 'a null cluster fails closed');
});

test('joinClusterEvidence fails closed on a malformed worker file (missing claims[] array)', () => {
  const corpus = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-ev-join-bad-'));
  const runDir = path.join(corpus, 'run0');
  fs.mkdirSync(path.join(runDir, 'claims'), { recursive: true });
  fs.writeFileSync(path.join(runDir, 'claims', 'w-extract-1.json'), JSON.stringify({ worker: 'w', source: 's' }) + '\n', 'utf8');

  try {
    resetEvidenceJoinCache();
    assert.throws(
      () => joinClusterEvidence(runDir, { claim: 'x', sources: ['s'] }),
      (e) => e.name === 'ContractError' && /claims\[\] array/.test(e.message),
      'a worker file without a claims[] array fails closed',
    );
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

// ===========================================================================
// FAITHFUL EVIDENCE CLEANING (Phase 20, Plan 20-05 OOF-PREP; NO-SPEND): bibliographic header noise is
// stripped from the excerpt BEFORE emission, and a quote that is a substring of the excerpt is deduped to the
// LONGER substantive one. Cleaning is FAITHFUL (no factual sentence removed) and NEVER empties a candidate
// that had real evidence (a metadata-only excerpt falls back to the verbatim quote).
// ===========================================================================

test('cleaning STRIPS a "Source:/Title:/Authors:/Published:" bibliographic header from the excerpt, keeping the factual sentence', () => {
  const { corpus, runDir } = writeRunDir({
    workers: [{
      source: 'https://example.org/doc',
      // The quote is the verified snippet; the excerpt carries a DISTINCT factual sentence (not contained in the
      // quote) after its bibliographic header is stripped -> the factual sentence survives as secondary context.
      claims: [{ id: 'c1', text: 'the reactor reached criticality at noon', quote: 'reached criticality at noon', excerpt_id: 'e1' }],
    }],
    // The excerpt leads with the bibliographic header block (the noise) followed by a DISTINCT factual sentence.
    excerpts: { e1: 'Source: https://example.org/doc Title: Reactor Log Authors: A. Researcher, B. Scientist Published: FSE 2026 Coolant flow held steady at nominal load throughout the run.' },
  });

  try {
    const joined = joinClusterEvidence(runDir, { claim: 'the reactor reached criticality at noon', sources: ['https://example.org/doc'] });

    assert.equal(joined.matched, true, 'the cluster is matched');
    assert.equal(joined.evidence[0].sentence, 'reached criticality at noon', 'the verbatim quote LEADS (quote-primary)');
    const text = joined.evidence.map((e) => e.sentence).join(' || ');

    // The distinct factual sentence survives; the bibliographic markers are GONE.
    assert.ok(/Coolant flow held steady at nominal load throughout the run/.test(text), 'the substantive factual sentence is kept');
    assert.ok(!/Source:/.test(text), 'the "Source:" header is stripped');
    assert.ok(!/Title:/.test(text), 'the "Title:" header is stripped');
    assert.ok(!/Authors:/.test(text), 'the "Authors:" header is stripped');
    assert.ok(!/Published:/.test(text), 'the "Published:" header is stripped');
    assert.ok(!/A\. Researcher/.test(text), 'the author names (metadata) are stripped');
    assert.ok(!/https?:\/\//.test(text), 'the bare source URL is stripped (never a URL)');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('cleaning STRIPS a leading markdown "# <title>" heading + its bibliographic block, keeping the factual sentence', () => {
  const { corpus, runDir } = writeRunDir({
    workers: [{
      source: 'https://example.org/survey',
      // The quote is the verified snippet; the excerpt's factual sentence is DISTINCT (kept as secondary context).
      claims: [{ id: 'c1', text: 'aot wasm can outperform native', quote: 'aot wasm outperforms native', excerpt_id: 'e1' }],
    }],
    excerpts: { e1: '# Research on WebAssembly Runtimes: A Survey Source: https://arxiv.org/abs/2404.12621 Authors: Y. Zhang, M. Liu Submitted: April 19, 2024 The runtime was eleven percent faster in several benchmarks.' },
  });

  try {
    const joined = joinClusterEvidence(runDir, { claim: 'aot wasm can outperform native', sources: ['https://example.org/survey'] });

    assert.equal(joined.matched, true, 'the cluster is matched');
    assert.equal(joined.evidence[0].sentence, 'aot wasm outperforms native', 'the verbatim quote LEADS (quote-primary)');
    const text = joined.evidence.map((e) => e.sentence).join(' || ');

    assert.ok(/eleven percent faster in several benchmarks/.test(text), 'the factual sentence survives');
    assert.ok(!/^#/.test(text) && !/# Research on WebAssembly/.test(text), 'the leading markdown title heading is stripped');
    assert.ok(!/Source:/.test(text) && !/Authors:/.test(text) && !/Submitted:/.test(text), 'the bibliographic markers are stripped');
    assert.ok(!/arxiv\.org/.test(text), 'the source URL is stripped');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('QUOTE-PRIMARY DEDUP: when the excerpt CONTAINS the quote (a superset that only restates it), the lean quote stands alone (one sentence)', () => {
  const { corpus, runDir } = writeRunDir({
    workers: [{
      source: 'https://example.org/doc',
      // The verified quote IS the load-bearing fact. The excerpt is a SUPERSET that merely wraps the quote in
      // vaguer prose -> re-emitting it would restate the quote's words -> deduped (token-reduction lever).
      claims: [{ id: 'c1', text: 'output doubled', quote: 'output doubled in Q3 relative to the prior fiscal quarter', excerpt_id: 'e1' }],
    }],
    excerpts: { e1: 'Per the audited filing, output doubled in Q3 relative to the prior fiscal quarter.' },
  });

  try {
    const joined = joinClusterEvidence(runDir, { claim: 'output doubled', sources: ['https://example.org/doc'] });

    assert.equal(joined.matched, true, 'matched');
    // QUOTE-PRIMARY: the verbatim quote is the FIRST (and here only) evidence sentence.
    assert.equal(joined.evidence[0].sentence, 'output doubled in Q3 relative to the prior fiscal quarter', 'the verbatim quote LEADS (quote-primary)');
    // BIDIRECTIONAL DEDUP: the excerpt CONTAINS the quote (superset) -> dropped; the lean quote stands alone.
    assert.equal(joined.evidence.length, 1, 'the superset excerpt (which only restates the quote) is deduped -> exactly ONE evidence sentence');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('QUOTE-PRIMARY: when the excerpt adds DISTINCT context the quote omits, BOTH are emitted (quote first, excerpt second)', () => {
  const { corpus, runDir } = writeRunDir({
    workers: [{
      source: 'https://example.org/doc',
      claims: [{ id: 'c1', text: 'output doubled', quote: 'output doubled in Q3', excerpt_id: 'e1' }],
    }],
    // The excerpt is DISTINCT context (neither contains the other) -> kept as secondary evidence.
    excerpts: { e1: 'Margins also expanded across every regional segment in the same period.' },
  });

  try {
    const joined = joinClusterEvidence(runDir, { claim: 'output doubled', sources: ['https://example.org/doc'] });

    assert.equal(joined.matched, true, 'matched');
    assert.equal(joined.evidence[0].sentence, 'output doubled in Q3', 'the verbatim quote is the FIRST evidence sentence (quote-primary)');
    assert.equal(joined.evidence.length, 2, 'the DISTINCT excerpt context follows the quote (two sentences)');
    assert.ok(joined.evidence[1].sentence.includes('Margins also expanded across every regional segment'), 'the secondary sentence is the distinct excerpt context');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('QUOTE-PRIMARY DEDUP (other direction): when the quote CONTAINS the excerpt, the longer quote stands alone (one sentence)', () => {
  const { corpus, runDir } = writeRunDir({
    workers: [{
      source: 'https://example.org/doc',
      // The quote is LONGER and contains the (short) excerpt text -> the excerpt is fully redundant.
      claims: [{ id: 'c1', text: 'margins fell', quote: 'operating margins fell sharply across all three divisions', excerpt_id: 'e1' }],
    }],
    excerpts: { e1: 'margins fell sharply' },
  });

  try {
    const joined = joinClusterEvidence(runDir, { claim: 'margins fell', sources: ['https://example.org/doc'] });

    assert.equal(joined.matched, true, 'matched');
    assert.equal(joined.evidence.length, 1, 'the quote contains the excerpt -> exactly ONE evidence sentence');
    assert.ok(joined.evidence[0].sentence.includes('operating margins fell sharply across all three divisions'), 'the longer quote (primary) is kept');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('cleaning is SAFE: a metadata-ONLY excerpt falls back to the verbatim quote (evidence is NEVER empty; the candidate is NOT dropped)', () => {
  const { corpus, runDir } = writeRunDir({
    workers: [{
      source: 'https://example.org/doc',
      claims: [{ id: 'c1', text: 'the policy took effect in March', quote: 'the policy took effect in March', excerpt_id: 'e1' }],
    }],
    // The excerpt is ONLY bibliographic metadata -> cleaning empties it -> the quote is the fallback.
    excerpts: { e1: 'Source: https://example.org/doc Title: Policy Brief Authors: Office of Records Published: 2026 DOI: 10.1000/example' },
  });

  try {
    const joined = joinClusterEvidence(runDir, { claim: 'the policy took effect in March', sources: ['https://example.org/doc'] });

    assert.equal(joined.matched, true, 'the candidate is still matched (cleaning never drops a candidate that had real evidence)');
    assert.ok(joined.evidence.length >= 1, 'evidence is NEVER empty after cleaning -- the quote is the fallback');
    const text = joined.evidence.map((e) => e.sentence).join(' || ');
    assert.ok(/the policy took effect in March/.test(text), 'the verbatim quote is the recovered evidence');
    assert.ok(!/Source:|Title:|Authors:|Published:|DOI:/.test(text), 'no bibliographic metadata leaks through');
    assert.ok(!/https?:\/\//.test(text), 'no URL leaks through');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('cleaning is FAITHFUL: a factual sentence that merely CONTAINS the word "source"/"title" mid-sentence is NOT removed', () => {
  const { corpus, runDir } = writeRunDir({
    workers: [{
      source: 'https://example.org/doc',
      claims: [{ id: 'c1', text: 'the open source title was adopted widely', quote: 'q', excerpt_id: 'e1' }],
    }],
    // "source" and "title" appear MID-sentence (not as "<Marker>:" headers) -> must be kept verbatim.
    excerpts: { e1: 'The open source title was adopted widely because the source code remained accessible.' },
  });

  try {
    const joined = joinClusterEvidence(runDir, { claim: 'the open source title was adopted widely', sources: ['https://example.org/doc'] });

    assert.equal(joined.matched, true, 'matched');
    const text = joined.evidence.map((e) => e.sentence).join(' || ');
    assert.ok(/The open source title was adopted widely because the source code remained accessible/.test(text), 'a sentence that merely mentions "source"/"title" mid-sentence is kept verbatim (faithful)');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

// ===========================================================================
// QUOTE-PRIMARY EVIDENCE + EXTENDED FRONT-MATTER STRIP (Phase 20, Plan 20-05 OOF-PREP; NO-SPEND). The remaining
// front-matter that polluted the live-cert OOF packets -- "Status:" lines, venue/acceptance lines, markdown
// SECTION headings ("## Abstract", "## Key Overview", "## Introduction", "## Conclusion"), "Submission Date:",
// "DOI:", "arXiv:" id lines -- is stripped, and the verbatim quote LEADS the evidence (quote-primary), so the
// OOF entailment is judged against the claim's direct support, not bibliographic noise.
// ===========================================================================

test('OOF-PREP (MULTI-LINE corpus shape): strips "Status:" + "## Abstract / Key Overview" section headings + venue, keeping the factual sentence; the QUOTE LEADS', () => {
  const { corpus, runDir } = writeRunDir({
    workers: [{
      source: 'https://example.org/saner',
      // The verified quote is the load-bearing snippet; the excerpt's factual sentences are DISTINCT prose
      // (neither contains the other) -> kept as secondary context after the front-matter is stripped.
      claims: [{ id: 'c1', text: 'the tool reduced false positives', quote: 'cut false positives by forty percent', excerpt_id: 'e1' }],
    }],
    // The realistic corpus shape: each header / section label is its OWN line (the line pass removes them
    // faithfully BEFORE collapse). Status / venue / "## <section>" headings are the noise; the factual sentences
    // are on their own lines and must survive.
    excerpts: {
      e1: [
        'Status: Accepted by SANER 2025',
        'DOI: 10.1109/SANER.2025.00042',
        'arXiv: 2503.21240',
        '',
        '## Abstract',
        '',
        '## Key Overview',
        '',
        'The proposed tool lowered spurious warnings across the evaluated benchmark suite.',
        '',
        '## Conclusion',
        '',
        'The approach generalizes to adjacent static-analysis tasks.',
      ].join('\n'),
    },
  });

  try {
    const joined = joinClusterEvidence(runDir, { claim: 'the tool reduced false positives', sources: ['https://example.org/saner'] });

    assert.equal(joined.matched, true, 'the cluster is matched');
    // QUOTE-PRIMARY: the verbatim quote is the FIRST evidence sentence.
    assert.equal(joined.evidence[0].sentence, 'cut false positives by forty percent', 'the verbatim quote is the FIRST evidence sentence (quote-primary)');

    const text = joined.evidence.map((e) => e.sentence).join(' || ');

    // The substantive factual sentences survive.
    assert.ok(/lowered spurious warnings across the evaluated benchmark suite/.test(text), 'the substantive factual sentence is kept');
    assert.ok(/generalizes to adjacent static-analysis tasks/.test(text), 'a later substantive factual sentence is kept');

    // The front-matter is GONE.
    assert.ok(!/Status:/.test(text), 'the "Status:" line is stripped');
    assert.ok(!/Accepted by/i.test(text), 'the venue / acceptance line is stripped');
    assert.ok(!/SANER 2025/.test(text), 'the venue value is stripped');
    assert.ok(!/DOI:/.test(text), 'the "DOI:" line is stripped');
    assert.ok(!/arXiv:/i.test(text) && !/2503\.21240/.test(text), 'the "arXiv:" id line is stripped');
    assert.ok(!/##|Abstract|Key Overview|Conclusion/.test(text), 'the markdown section headings (## Abstract / ## Key Overview / ## Conclusion) are stripped');
    assert.ok(!/^#/.test(text) && !/#/.test(text), 'no markdown heading marker survives');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('OOF-PREP (COLLAPSED single-line): strips inline "Status: Accepted by SANER 2025" + "## Abstract / Key Overview" headers, keeping the factual sentence', () => {
  const { corpus, runDir } = writeRunDir({
    workers: [{
      source: 'https://example.org/saner',
      // The verified quote is distinct from the excerpt body (neither contains the other) -> excerpt kept.
      claims: [{ id: 'c1', text: 'native-like speed was observed', quote: 'near-native throughput measured', excerpt_id: 'e1' }],
    }],
    // A single collapsed line (no newlines) -> the SEGMENT pass must strip the inline Status/venue header and
    // the inline "## Abstract / Key Overview" heading run, keeping the trailing factual sentence.
    excerpts: { e1: 'Status: Accepted by SANER 2025 ## Abstract / Key Overview The runtime achieved native-like speed across the AOT benchmark.' },
  });

  try {
    const joined = joinClusterEvidence(runDir, { claim: 'native-like speed was observed', sources: ['https://example.org/saner'] });

    assert.equal(joined.matched, true, 'the cluster is matched');
    assert.equal(joined.evidence[0].sentence, 'near-native throughput measured', 'the verbatim quote LEADS (quote-primary)');

    const text = joined.evidence.map((e) => e.sentence).join(' || ');

    assert.ok(/native-like speed across the AOT benchmark/.test(text), 'the factual sentence survives the inline strip');
    assert.ok(!/Status:/.test(text), 'the inline "Status:" header is stripped');
    assert.ok(!/Accepted by|SANER 2025/i.test(text), 'the inline venue line is stripped');
    assert.ok(!/#|Abstract|Key Overview/.test(text), 'the inline "## Abstract / Key Overview" heading is stripped');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('OOF-PREP SAFE: a front-matter-ONLY excerpt (Status/DOI/arXiv/## headings only) falls back to the quote -- evidence NEVER empty (droppedNoEvidence unchanged)', () => {
  const { corpus, runDir } = writeRunDir({
    workers: [{
      source: 'https://example.org/doc',
      claims: [{ id: 'c1', text: 'the protocol took effect in 1989', quote: 'the protocol took effect in 1989', excerpt_id: 'e1' }],
    }],
    // The excerpt is ONLY new-marker front-matter + section headings -> cleaning empties it -> the quote stands.
    excerpts: {
      e1: [
        'Status: Published in Nature 2026',
        'DOI: 10.1038/example',
        'arXiv: 2512.15440',
        'Submission Date: December 17, 2025',
        '',
        '## Abstract',
        '## Introduction',
      ].join('\n'),
    },
  });

  try {
    const joined = joinClusterEvidence(runDir, { claim: 'the protocol took effect in 1989', sources: ['https://example.org/doc'] });

    assert.equal(joined.matched, true, 'the candidate is still matched (cleaning never drops a candidate that had a quote)');
    assert.equal(joined.evidence.length, 1, 'the quote alone stands (no empty, no metadata residue)');
    assert.equal(joined.evidence[0].sentence, 'the protocol took effect in 1989', 'the verbatim quote is the recovered evidence');

    const text = joined.evidence.map((e) => e.sentence).join(' || ');
    assert.ok(!/Status:|DOI:|arXiv:|Submission Date:|Published in|##|Abstract|Introduction/i.test(text), 'no front-matter leaks through');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('OOF-PREP FAITHFUL: a factual sentence that mentions "status"/"category" mid-sentence is NOT removed (markers only at a unit boundary)', () => {
  const { corpus, runDir } = writeRunDir({
    workers: [{
      source: 'https://example.org/doc',
      claims: [{ id: 'c1', text: 'the catalyst status changed the category of the reaction', quote: 'q', excerpt_id: 'e1' }],
    }],
    // "status" and "category" appear MID-sentence (not as "<Marker>:" headers) -> must be kept verbatim.
    excerpts: { e1: 'The catalyst status changed the category of the reaction under sustained load conditions.' },
  });

  try {
    const joined = joinClusterEvidence(runDir, { claim: 'the catalyst status changed the category of the reaction', sources: ['https://example.org/doc'] });

    assert.equal(joined.matched, true, 'matched');
    const text = joined.evidence.map((e) => e.sentence).join(' || ');
    assert.ok(/The catalyst status changed the category of the reaction under sustained load conditions/.test(text), 'a sentence mentioning "status"/"category" mid-sentence is kept verbatim (faithful)');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('the shared join source carries NO LZ_SPEND / network code and is strictly ASCII (no BOM)', () => {
  const buf = fs.readFileSync(new URL('./lz-eval-evidence-join.mjs', import.meta.url));
  assert.notEqual(buf[0], 0xef, 'no UTF-8 BOM byte 0');

  for (let i = 0; i < buf.length; i += 1) {
    assert.ok(buf[i] <= 0x7f, 'byte ' + i + ' is ASCII (<= 0x7f): got 0x' + buf[i].toString(16));
  }

  const src = buf.toString('utf8');
  assert.ok(!/process\.env\.LZ_SPEND/.test(src), 'the join carries no LZ_SPEND code path (pure on-disk)');
  assert.ok(!/\bfetch\s*\(/.test(src), 'the join performs no network fetch');
});
