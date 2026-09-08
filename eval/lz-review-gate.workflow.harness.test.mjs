// lz-review-gate.workflow.harness.test.mjs
//
// THE test for the enhanced review-gate dynamic workflow (eval/lz-review-gate.workflow.mjs). It is
// the single source of truth's single test -- there is no separate lib and no anti-drift proxy.
//
// WHY a harness (researched 2026-06-16): workflow scripts cannot be node-tested by plain import --
// top-level return/await are only legal inside the runtime's wrapper function, and module loading is
// sealed off (static import is rejected as "import call expects one or two arguments"; dynamic
// import() as "import() is not available in workflow scripts"). There is NO official unit-testing API
// or test-double mechanism for workflow scripts (confirmed against the Claude Code docs, community
// blogs, and the ray-amjad/claude-code-workflow-creator authoring skill). The governing community
// principle is "test the artifacts, not the prose." This harness applies it: it mirrors the runtime's
// own execution model (de-export `meta`, wrap the body in an async function, inject MOCK globals) to
// run the REAL orchestration deterministically, asserts on its observable outputs, and slices the
// real control-helper block to exercise the actual functions. The harness MODELS the (undocumented)
// runtime wrapper, so it is backed by >=1 real Workflow run (the dogfood / the actual gate run) as the
// integration check.
//
// HOST QUIRK: gate on the explicit FILE form: node --test eval/lz-review-gate.workflow.harness.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WF = path.join(HERE, 'lz-review-gate.workflow.mjs');
const SRC = fs.readFileSync(WF, 'utf8');

// De-export the meta literal so the source is valid inside a function body (the runtime extracts meta
// separately). No other top-level exports exist in the workflow.
function deExport(src) {
  return src.replace(/^export\s+const\s+meta\s*=/m, 'const meta =');
}

// Mirror the runtime: the de-exported body inside an async IIFE with the injected globals as
// parameters. Top-level return/await in the body become valid here -- exactly the runtime model.
function makeRunner() {
  const body = deExport(SRC);
  // eslint-disable-next-line no-new-func
  return new Function(
    'agent', 'parallel', 'pipeline', 'log', 'phase', 'args', 'budget', 'workflow',
    `"use strict";\nreturn (async () => {\n${body}\n})();`,
  );
}

// Faithful-enough pipeline: each item through the single stage; a throwing stage drops the item to
// null (matches the documented pipeline contract).
async function fakePipeline(items, ...stages) {
  return Promise.all(items.map(async (it, i) => {
    let v = it;

    for (const st of stages) {
      try {
        v = await st(v, it, i);
      } catch {
        v = null;
        break;
      }
    }

    return v;
  }));
}

const noop = () => {};

function runWorkflow(agent, argsObj) {
  return makeRunner()(agent, null, fakePipeline, noop, noop, argsObj, null, null);
}

// Slice the real inlined control-helper block from the workflow source and execute it, so the tests
// exercise the ACTUAL functions that run in production (no copy, no lib).
function getHelpers() {
  const startIdx = SRC.indexOf('LZ-REVIEW-GATE-SHARED-START');
  const endIdx = SRC.indexOf('LZ-REVIEW-GATE-SHARED-END');
  assert.ok(startIdx > 0, 'shared-block START marker missing');
  assert.ok(endIdx > startIdx, 'shared-block END marker missing or precedes START');
  const headerOnly = deExport(SRC.slice(0, endIdx));
  const exportTail = 'return { parseReviewerSentinel, missedIsNone, isConverged, nextRequests, groupSlug, computeRemainingGroups, hasNullStage, dedupeFindingLines };';
  // eslint-disable-next-line no-new-func
  return new Function(`"use strict";\n${headerOnly}\n${exportTail}`)();
}

const H = getHelpers();

// ===========================================================================
// Orchestration: the real loop/convergence/fan-out, driven by scripted mock agents.
// ===========================================================================

test('orchestration: multi-round loop converges when the reviewer reports no missed surfaces', async () => {
  const agent = async (_prompt, opts) => {
    if (opts.label.startsWith('exec')) {
      return 'packaged finding with verbatim excerpt';
    }

    if (opts.label.startsWith('review')) {
      const round = opts.label.match(/r(\d+)/)[1];
      return round === '1'
        ? 'C-1 bug\nMISSED-SURFACES: searchAndStop core\nROUND-VERDICT: MORE-NEEDED\nNEXT-ROUND-PACKAGING-REQUESTS: searchAndStop core'
        : 'C-1 confirmed\nMISSED-SURFACES: none\nROUND-VERDICT: CONVERGED';
    }

    return 'consolidated report\nCOVERAGE: COMPLETE';
  };

  const result = await runWorkflow(agent, { groups: [{ name: 'g1' }], maxRounds: 3, progressDir: 'tmp' });
  assert.equal(result.completed.length, 1);
  assert.equal(result.completed[0].converged, true);
  assert.equal(result.completed[0].rounds, 2);
  assert.match(result.mergedReport, /consolidated report/);
});

test('orchestration: loop is bounded by MAX_ROUNDS when never converged', async () => {
  const agent = async (_prompt, opts) => {
    if (opts.label.startsWith('review')) {
      return 'MISSED-SURFACES: still stuff\nROUND-VERDICT: MORE-NEEDED\nNEXT-ROUND-PACKAGING-REQUESTS: more';
    }

    if (opts.label.startsWith('synth')) {
      return 'report\nCOVERAGE: INCOMPLETE';
    }

    return 'packaged';
  };

  const result = await runWorkflow(agent, { groups: [{ name: 'g1' }], maxRounds: 2, progressDir: 'tmp' });
  assert.equal(result.completed[0].rounds, 2);
  assert.equal(result.completed[0].converged, false);
});

test('orchestration: a null stage (quota-kill) leaves the group not-done (resume-safe)', async () => {
  const agent = async (_prompt, opts) => {
    if (opts.label.startsWith('review') && /r1\b/.test(opts.label)) {
      return null;
    }

    if (opts.label.startsWith('exec')) {
      return 'packaged';
    }

    return 'x';
  };

  const result = await runWorkflow(agent, { groups: [{ name: 'g1' }], maxRounds: 3, progressDir: 'tmp' });
  assert.equal(result.completed.length, 0);
});

test('orchestration: skip-already-done excludes groups whose slug is in doneSlugs', async () => {
  const agent = async (_prompt, opts) => {
    if (opts.label.startsWith('review')) {
      return 'MISSED-SURFACES: none\nROUND-VERDICT: CONVERGED';
    }

    if (opts.label.startsWith('synth')) {
      return 'report\nCOVERAGE: COMPLETE';
    }

    return 'packaged';
  };

  const result = await runWorkflow(agent, {
    groups: [{ name: 'g1' }, { name: 'g2' }],
    doneSlugs: ['g1'],
    maxRounds: 3,
    progressDir: 'tmp',
  });
  assert.equal(result.remaining, 1);
  assert.equal(result.completed.length, 1);
  assert.equal(result.completed[0].group, 'g2');
});

test('orchestration: empty groups returns early without spawning agents', async () => {
  let called = false;
  const agent = async () => {
    called = true;
    return 'x';
  };
  const result = await runWorkflow(agent, { groups: [] });
  assert.equal(result.groups, 0);
  assert.equal(called, false);
});

test('orchestration: I-2 reviewer is NOT spawned when the executor output is null', async () => {
  let reviewerCalled = false;
  const agent = async (_prompt, opts) => {
    if (opts.label.startsWith('exec')) {
      return null;
    }

    if (opts.label.startsWith('review')) {
      reviewerCalled = true;
      return 'x';
    }

    return 'x';
  };
  const result = await runWorkflow(agent, { groups: [{ name: 'g1' }], maxRounds: 3, progressDir: 'tmp' });
  assert.equal(reviewerCalled, false);
  assert.equal(result.completed.length, 0);
});

test('orchestration: C-2 within-group dedup preserves each group severity headers in mergedReport', async () => {
  const agent = async (_prompt, opts) => {
    if (opts.label.startsWith('review')) {
      return 'MISSED-SURFACES: none\nROUND-VERDICT: CONVERGED';
    }

    if (opts.label.startsWith('synth')) {
      return '### Critical\nfinding here\n### Important\n(none)';
    }

    return 'packaged';
  };
  const result = await runWorkflow(agent, {
    groups: [{ name: 'g1' }, { name: 'g2' }],
    maxRounds: 2,
    progressDir: 'tmp',
  });
  assert.equal(result.completed.length, 2);
  // both groups carry an identical synth report; '### Critical' must survive ONCE PER GROUP (2x),
  // not be collapsed to 1 by a cross-group dedup (C-2 regression guard).
  const criticalCount = result.mergedReport.split('\n').filter((l) => l.trim() === '### Critical').length;
  assert.equal(criticalCount, 2);
});

// ===========================================================================
// Control helpers, executed DIRECTLY from the real workflow source.
// ===========================================================================

test('parseReviewerSentinel: canonical CONVERGED + none', () => {
  const p = H.parseReviewerSentinel('findings\nMISSED-SURFACES: none\nROUND-VERDICT: CONVERGED');
  assert.equal(p.verdict, 'CONVERGED');
  assert.equal(p.missed, 'none');
});

test('parseReviewerSentinel: absent sentinel -> UNKNOWN', () => {
  assert.equal(H.parseReviewerSentinel('just prose').verdict, 'UNKNOWN');
});

test('parseReviewerSentinel: I-1 single-line requests does not swallow trailing sentinels (out-of-order)', () => {
  // requests appears BEFORE missed/verdict; the single-line capture must not absorb the later lines.
  const outOfOrder = [
    'NEXT-ROUND-PACKAGING-REQUESTS: pkg X, pkg Y',
    'MISSED-SURFACES: X, Y',
    'ROUND-VERDICT: MORE-NEEDED',
  ].join('\n');
  const p = H.parseReviewerSentinel(outOfOrder);
  assert.equal(p.requests, 'pkg X, pkg Y');
  assert.ok(!p.requests.includes('ROUND-VERDICT'), 'requests over-captured trailing sentinels (I-1 regression)');
  assert.equal(p.missed, 'X, Y');
  assert.equal(p.verdict, 'MORE-NEEDED');
});

test('isConverged: I-2 no-missed-surfaces is authoritative over the verdict', () => {
  // CONVERGED verdict + a REAL missed list -> NOT converged (missed wins).
  assert.equal(H.isConverged({ verdict: 'CONVERGED', missed: 'safeParse, denylist' }), false);
  // MORE-NEEDED verdict + missed none -> converged (missed wins).
  assert.equal(H.isConverged({ verdict: 'MORE-NEEDED', missed: 'none' }), true);
  // verdict is only the fallback when no MISSED-SURFACES line was provided.
  assert.equal(H.isConverged({ verdict: 'CONVERGED', missed: '' }), true);
  assert.equal(H.isConverged({ verdict: 'MORE-NEEDED', missed: '' }), false);
});

test('isConverged: C-1 UNKNOWN verdict never converges (even missed=none); I-3', () => {
  assert.equal(H.isConverged({ verdict: 'UNKNOWN', missed: 'surface-X' }), false);
  assert.equal(H.isConverged({ verdict: 'UNKNOWN', missed: '' }), false);
  // C-1: a truncated/parse-failed reviewer output (UNKNOWN) must NOT false-converge even if a stray
  // "none" was captured -- convergence requires a recognized verdict line.
  assert.equal(H.isConverged({ verdict: 'UNKNOWN', missed: 'none' }), false);
  assert.equal(H.isConverged(null), false);
});

test('groupSlug: S-9 pins output + distinct near-identical names (not tautological)', () => {
  assert.equal(H.groupSlug('eval/lz-eval-search-loop.mjs'), 'eval-lz-eval-search-loop-mjs');
  assert.equal(H.groupSlug('Group A'), 'group-a');
  // near-identical names that differ only by case/punctuation must produce DISTINCT slugs where the
  // distinguishing chars are alphanumeric (documents the known limit: punctuation-only diffs collide).
  assert.notEqual(H.groupSlug('group a1'), H.groupSlug('group a2'));
});

test('helpers: hasNullStage / computeRemainingGroups / nextRequests / dedupeFindingLines', () => {
  assert.equal(H.hasNullStage(['ok', null]), true);
  assert.equal(H.hasNullStage(['a', 'b']), false);
  assert.deepEqual(
    H.computeRemainingGroups([{ name: 'a' }, { name: 'b' }], ['a']).map((g) => g.name),
    ['b'],
  );
  assert.equal(H.nextRequests({ verdict: 'MORE-NEEDED', missed: 'm', requests: 'do X' }, 'fb'), 'do X');
  assert.deepEqual(H.dedupeFindingLines(['C-1', '', 'C-1', 'I-1', '']), ['C-1', '', 'I-1', '']);
});

// ===========================================================================
// Structural contract + ASCII (folded in from the former anti-drift test).
// ===========================================================================

test('workflow structural contract: meta + effort discipline + real reviewer agentType', () => {
  assert.match(SRC, /export const meta = \{/);
  assert.match(SRC, /name: 'lz-review-gate'/);
  assert.match(SRC, /effort: 'medium'/);
  assert.match(SRC, /effort: 'high'/);
  assert.ok(!/effort:\s*'xhigh'/.test(SRC), 'reviewer effort must be high, not xhigh (protects maxTurns 3)');
  assert.match(SRC, /agentType: 'lz-advisor:reviewer'/);
  assert.match(SRC, /model: 'sonnet'/);
  // synth stage runs on Opus-high (2026-06-17 cross-family consensus -- replaces the former Sonnet synth)
  assert.match(SRC, /model: 'opus', effort: 'high', phase: 'Synthesize'/);
});

test('synth stage runs on Opus-high at runtime and exposes full roundLogs for the orchestrator diff', async () => {
  let synthOpts = null;
  const agent = async (_p, opts) => {
    if (opts.label.startsWith('review')) {
      // the real reviewer emits its native ### section grammar (NOT inline tags)
      return '### Critical\n\nC-1 canonicalizeUrl strips the trailing slash on the serialized url\n\n### Important\n\n(none)\n\nMISSED-SURFACES: none\nROUND-VERDICT: CONVERGED';
    }

    if (opts.label.startsWith('synth')) {
      synthOpts = opts;
      return '### Critical\n\nC-1 canonicalizeUrl strips trailing slash\n\n### Important\n\n(none)\n\nCOVERAGE: COMPLETE';
    }

    return 'packaged';
  };

  const result = await runWorkflow(agent, { groups: [{ name: 'g1' }], maxRounds: 2, progressDir: 'tmp' });
  assert.equal(synthOpts.model, 'opus');
  assert.equal(synthOpts.effort, 'high');
  // roundLogs (raw per-round reviewer output) is exposed on each report so the orchestrator severity
  // diff can run post-run (the workflow is filesystem-blind; this return value IS the diff's input).
  // Assert ALL four fields, not just shape/.reviewed (dogfood: dropping round/verdict/missed must fail).
  const rl = result.reports[0].roundLogs;
  assert.equal(rl.length, 1);
  assert.equal(rl[0].round, 1);
  assert.equal(rl[0].verdict, 'CONVERGED');
  assert.equal(rl[0].missed, 'none');
  assert.match(rl[0].reviewed, /### Critical/);
});

test('synthPrompt carries the fidelity contract (PROMPT-SHAPE guard only -- NOT a live-behavior guarantee)', () => {
  // Booked honestly per the 2026-06-17 consensus + the harness-blindness fact: these assert the prompt
  // TEXT contains the fidelity clauses. They do NOT prove the live Opus synth obeys them -- that is
  // enforced post-run by the orchestrator severity-drop diff (eval/lz-review-gate-check.mjs).
  // Scoped to the synthPrompt FUNCTION body (dogfood): a clause surviving only in a comment must NOT pass.
  const spStart = SRC.indexOf('function synthPrompt(');
  const synthSrc = SRC.slice(spStart, SRC.indexOf('// ---', spStart));
  assert.ok(spStart > 0 && synthSrc.length > 0, 'synthPrompt body not found');
  assert.match(synthSrc, /### Cross-Cutting Patterns/);
  assert.match(synthSrc, /\(none\)/);
  assert.match(synthSrc, /SEVERITY THE REVIEWER ASSIGNED/);
  assert.match(synthSrc, /verbatim-identical/);
});

test('workflow source is strictly ASCII', () => {
  const buf = fs.readFileSync(WF);

  for (let i = 0; i < buf.length; i += 1) {
    assert.ok(buf[i] <= 0x7f, `non-ASCII byte 0x${buf[i].toString(16)} at offset ${i}`);
  }
});
