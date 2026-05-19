#!/usr/bin/env node
// measurement-collator.mjs -- Phase 8 Plan 03 measurement aggregator.
//
// Aggregates n run logs (output captured from D-advisor-budget.sh after running
// the per-item check Node script against an advisor Strategic Direction extracted
// from a claude -p stream-json JSONL trace) into the 08-MEASUREMENT.md schema and
// evaluates the D-02 compound OR-gate.
//
// Usage:
//   node measurement-collator.mjs <scenario-1-parser.log> <scenario-2-parser.log> ... > 08-MEASUREMENT.md
//
// Each input file is expected to contain (anywhere within its body):
//   * One or more lines matching: [ITEM] idx=<N> wc=<W> frame=<0|1> codeblock=<0|1>
//   * One line matching: [AGGREGATE] total=<N> aggregate_wc=<W>
// Plus per-line scenario name / prompt header lines extracted from filename.
//
// Exit codes:
//   0 -- collator emitted MEASUREMENT.md successfully (gate decision PASS/FAIL/INCONCLUSIVE)
//   1 -- collator error (missing input file, malformed log, no [AGGREGATE] line)
//   2 -- usage error
//
// D-02 compound OR-gate logic (n=3 thresholds; auto-extend to n=5 via Plan 3.5):
//   D1 (code-block disjunct):
//     - FAIL if >=ceil(n*2/3) runs have >=1 (codeblock=1 AND over_cap) item
//     - over_cap = (frame=1 ? wc>22 : wc>15)
//     - INCONCLUSIVE if exactly ceil(n*2/3) runs FAIL AND all FAIL items in soft outlier band
//       (fragment <=17w, frame <=25w)
//   D2 (aggregate disjunct):
//     - FAIL if mean(aggregate_wc) > 100 AND >=ceil(n*2/3) runs aggregate_wc > 110
//     - INCONCLUSIVE if mean in [98, 105] AND per-run pattern non-decisive
//   Compound:
//     - PASS if both D1 and D2 PASS
//     - FAIL if either FAIL and neither INCONCLUSIVE
//     - INCONCLUSIVE if either INCONCLUSIVE
//
// Disposition rule:
//   D1=FAIL & D2=PASS -> fragment-grammar template extension
//   D1=PASS & D2=FAIL -> density example audit
//   D1=FAIL & D2=FAIL -> both atomic
//   D1=PASS & D2=PASS -> N/A (P2 closes structurally)
//   INCONCLUSIVE      -> pending Plan 3.5 (n=2 more fresh runs)

import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

const ITEM_RE = /^\[ITEM\] idx=(\d+) wc=(\d+) frame=(\d+) codeblock=(\d+)/gm;
const AGGREGATE_RE = /^\[AGGREGATE\] total=(\d+) aggregate_wc=(\d+)/m;

// Scenario metadata keyed by parser-log filename pattern. The pattern matches
// `scenario-<N>-parser.log` where N is 1, 2, or 3.
const SCENARIO_META = {
  1: {
    name: 'Compodoc',
    prompt: 'Set up Compodoc with Storybook in this Nx Angular library. Add a sample input and a sample output to our component using the input() and output() signal functions. The Docs tab should render JSDoc descriptions for the component, the input, and the output.',
  },
  2: {
    name: 'Feature implementation',
    prompt: 'Add a debounced search input component to my Angular library. It should use the signal-based control flow, accept placeholder text, and emit search events after 300ms debounce.',
  },
  3: {
    name: 'Refactor',
    prompt: 'Extract a shared validation utility from these 3 components: UserForm, AddressForm, PaymentForm. Each currently has duplicate email + phone + zipcode validators. Place the shared utility in libs/shared-validators.',
  },
};

if (process.argv.length < 3) {
  console.error('Usage: node measurement-collator.mjs <run1.log> <run2.log> [...] > 08-MEASUREMENT.md');
  process.exit(2);
}

const paths = process.argv.slice(2);

const runs = paths.map((path, i) => {
  const text = readFileSync(path, 'utf8');
  const items = [...text.matchAll(ITEM_RE)].map(m => ({
    idx: +m[1],
    wc: +m[2],
    frame: !!+m[3],
    codeblock: !!+m[4],
  }));
  const aggMatch = text.match(AGGREGATE_RE);
  const aggregateWc = aggMatch ? +aggMatch[2] : null;
  const total = aggMatch ? +aggMatch[1] : items.length;

  // Scenario number from filename pattern `scenario-<N>-parser.log`
  const base = basename(path);
  const scenarioMatch = base.match(/scenario-(\d+)-parser\.log$/);
  const scenarioNum = scenarioMatch ? +scenarioMatch[1] : i + 1;
  const meta = SCENARIO_META[scenarioNum] || {
    name: `Scenario ${scenarioNum}`,
    prompt: '(unknown -- filename did not match `scenario-<N>-parser.log`)',
  };

  return {
    runIdx: i + 1,
    scenarioNum,
    scenarioName: meta.name,
    prompt: meta.prompt,
    tracePath: `uat-replay-0.14.x/scenario-${scenarioNum}-plan.jsonl`,
    parserLogPath: path,
    items,
    total,
    aggregateWc,
  };
});

// Validate every run has aggregate (parser-log integrity check)
const missingAgg = runs.filter(r => r.aggregateWc === null);

if (missingAgg.length > 0) {
  console.error(`[ERROR] ${missingAgg.length} run(s) missing [AGGREGATE] line:`);

  for (const r of missingAgg) {
    console.error(`  - ${r.parserLogPath}`);
  }

  process.exit(1);
}

// D-02 gate evaluation
const n = runs.length;
const overCap = (it) => (it.frame ? it.wc > 22 : it.wc > 15);
const inSoftBand = (it) => (it.frame ? it.wc <= 25 : it.wc <= 17);

// D1: code-block disjunct
const d1RunsFail = runs.filter(r => r.items.some(it => it.codeblock && overCap(it))).length;
const d1Threshold = Math.ceil((n * 2) / 3);
let d1Verdict;

if (d1RunsFail >= d1Threshold) {
  // All FAIL items in soft band? -> INCONCLUSIVE
  const allFailItemsInSoftBand = runs.every(r => r.items.every(it =>
    !(it.codeblock && overCap(it)) || inSoftBand(it)
  ));

  if (allFailItemsInSoftBand && d1RunsFail === d1Threshold) {
    d1Verdict = 'INCONCLUSIVE';
  } else {
    d1Verdict = 'FAIL';
  }
} else {
  d1Verdict = 'PASS';
}

// D2: aggregate disjunct
const aggregates = runs.map(r => r.aggregateWc);
const meanAgg = aggregates.reduce((s, w) => s + w, 0) / n;
const d2RunsFail = runs.filter(r => r.aggregateWc > 110).length;
const d2Threshold = Math.ceil((n * 2) / 3);
let d2Verdict;

if (meanAgg > 100 && d2RunsFail >= d2Threshold) {
  d2Verdict = 'FAIL';
} else if (meanAgg >= 98 && meanAgg <= 105 && d2RunsFail < d2Threshold) {
  d2Verdict = 'INCONCLUSIVE';
} else {
  d2Verdict = 'PASS';
}

// Compound verdict
let compound;

if (d1Verdict === 'INCONCLUSIVE' || d2Verdict === 'INCONCLUSIVE') {
  compound = 'INCONCLUSIVE';
} else if (d1Verdict === 'FAIL' || d2Verdict === 'FAIL') {
  compound = 'FAIL';
} else {
  compound = 'PASS';
}

// Disposition
let disposition;
let plan4Ships;

if (d1Verdict === 'FAIL' && d2Verdict === 'FAIL') {
  disposition = 'fragment-grammar template extension + density example audit (both atomic)';
  plan4Ships = 'YES';
} else if (d1Verdict === 'FAIL') {
  disposition = 'fragment-grammar template extension';
  plan4Ships = 'YES';
} else if (d2Verdict === 'FAIL') {
  disposition = 'density example audit';
  plan4Ships = 'YES';
} else if (compound === 'INCONCLUSIVE') {
  disposition = 'pending Plan 3.5 (n=2 more fresh runs; auto-extend to n=5)';
  plan4Ships = 'conditional on Plan 3.5';
} else {
  disposition = 'N/A (P2 closes structurally; no Plan 4)';
  plan4Ships = 'NO';
}

// Emit MEASUREMENT.md
const out = [];
out.push('# 08-MEASUREMENT.md: P2-ADVISOR fixture-grade measurement');
out.push('');
out.push('**Plan:** 08-03 (advisor-fragment-grammar-measurement)');
out.push('**Gate:** D-02 compound OR-gate (08-CONTEXT.md)');
out.push(`**Sample size:** n=${n}`);
out.push(`**Generated:** ${new Date().toISOString()}`);
out.push('');
out.push('## Scenarios');
out.push('');
out.push('| # | Scenario | Prompt | Trace path |');
out.push('| --- | --- | --- | --- |');

for (const r of runs) {
  // Markdown-escape pipe characters in the prompt (none expected, but safe)
  const promptCell = r.prompt.replace(/\|/g, '\\|');
  out.push(`| ${r.scenarioNum} | ${r.scenarioName} | ${promptCell} | ${r.tracePath} |`);
}

out.push('');
out.push('## Per-run results');
out.push('');
out.push('| Run | Scenario | Aggregate (w) | Total items | Per-item words (csv) | Code-block flag (csv) | Assuming-frame flag (csv) | Per-item over-cap (csv) |');
out.push('| --- | --- | --- | --- | --- | --- | --- | --- |');

for (const r of runs) {
  const wcCsv = r.items.map(it => it.wc).join(',');
  const cbCsv = r.items.map(it => it.codeblock ? 1 : 0).join(',');
  const frCsv = r.items.map(it => it.frame ? 1 : 0).join(',');
  const ocCsv = r.items.map(it => overCap(it) ? 1 : 0).join(',');
  out.push(`| ${r.runIdx} | ${r.scenarioName} | ${r.aggregateWc} | ${r.total} | ${wcCsv} | ${cbCsv} | ${frCsv} | ${ocCsv} |`);
}

out.push('');
out.push('## Gate decision');
out.push('');
out.push(`- **D1 (code-block disjunct):** ${d1Verdict} -- ${d1RunsFail}/${n} runs have >=1 code-block item over per-item cap (>15w fragment / >22w Assuming-frame). Threshold: >=${d1Threshold}/${n} for FAIL.`);
out.push(`- **D2 (aggregate disjunct):** ${d2Verdict} -- mean aggregate = ${meanAgg.toFixed(1)}w; ${d2RunsFail}/${n} per-run aggregate >110w. Threshold: mean>100 AND >=${d2Threshold}/${n} runs >110w for FAIL; mean in [98,105] AND non-decisive per-run for INCONCLUSIVE.`);
out.push(`- **Compound verdict:** ${compound}`);
out.push(`- **Disposition:** ${disposition}`);
out.push('');
out.push('## Recommendation');
out.push('');
out.push(`- **Plan 4 ships:** ${plan4Ships}`);

if (compound === 'INCONCLUSIVE') {
  out.push('- **Auto-extend (D-03):** Plan 3.5 spawn recommended -- run n=2 more fresh fixture-grade sessions on the same 3 scenarios (sampled with replacement) and re-evaluate compound OR-gate at n=5.');
} else if (compound === 'FAIL') {
  out.push(`- **Plan 4 scope:** ${disposition}`);
} else {
  out.push('- **P2 residual closes structurally:** advisor budget contract holds on n=' + n + ' evidence. Plan 4 does NOT ship.');
}

out.push('');
out.push('## Raw evidence (per-item flag matrix)');
out.push('');

for (const r of runs) {
  out.push(`### Run ${r.runIdx} (${r.scenarioName})`);
  out.push('');
  out.push(`- Parser log: \`${r.parserLogPath}\``);
  out.push(`- Trace: \`${r.tracePath}\``);
  out.push(`- Aggregate: ${r.aggregateWc}w`);
  out.push(`- Total items: ${r.total}`);
  out.push('');
  out.push('| Item | Words | Frame? | Code-block? | Over per-item cap? |');
  out.push('| --- | --- | --- | --- | --- |');

  for (const it of r.items) {
    out.push(`| ${it.idx} | ${it.wc} | ${it.frame ? 'yes' : 'no'} | ${it.codeblock ? 'yes' : 'no'} | ${overCap(it) ? 'YES' : 'no'} |`);
  }

  out.push('');
}

process.stdout.write(out.join('\n') + '\n');
