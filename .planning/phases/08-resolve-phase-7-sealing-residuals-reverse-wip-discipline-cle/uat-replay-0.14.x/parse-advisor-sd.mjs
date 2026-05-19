#!/usr/bin/env node
// parse-advisor-sd.mjs -- Phase 8 Plan 03 standalone parser runner.
//
// Mirrors the per-item check logic embedded in D-advisor-budget.sh's
// check-advisor-items.mjs heredoc, applied to a Strategic Direction text file.
// Emits the same [ITEM]/[AGGREGATE] structured log lines that the canonical
// parser emits when invoked via the full smoke fixture path.
//
// Why standalone:
//   D-advisor-budget.sh does NOT currently expose a `--from-trace` flag; it
//   always spawns its own `claude -p` session against a synthesized fixture.
//   Plan 03 needs to score CAPTURED traces from heterogeneous scenarios
//   (Compodoc + feature impl + refactor) without re-running claude -p, so
//   we extract advisor SD from each captured JSONL trace via extract-advisor-sd.mjs
//   and feed it into this script (which embeds the same regex + logic).
//
// Usage:
//   node parse-advisor-sd.mjs <path-to-sd-body.txt>
//
// Output (stdout):
//   * `[INFO] Fragment-grammar shape detected: <N> numbered item(s)` (or [WARN] if fallback)
//   * `[OK]/[INFO]/[ERROR] Item <idx>...` human-readable per-item log (preserved)
//   * `[ITEM] idx=<N> wc=<W> frame=<0|1> codeblock=<0|1>` structured log per item
//   * `[INFO] Per-item check: <total> items; <bad> over-cap; aggregate <W> words`
//   * `[AGGREGATE] total=<N> aggregate_wc=<W>` structured aggregate
//
// Exit codes (mirrored from D-advisor-budget.sh check-advisor-items.mjs):
//   0 -- fragment-grammar detected AND all items within per-item target/outlier
//   1 -- fragment-grammar detected BUT one or more items over per-item outlier limit
//   2 -- fragment-grammar NOT detected (fallback to legacy aggregate-only)
//
// NOTE: This script is canonical-mirror of D-advisor-budget.sh:84-167 (check-advisor-items.mjs
// heredoc body). If the canonical parser changes, this mirror must also change.

import { readFileSync } from 'node:fs';

const path = process.argv[2];

if (!path) {
  console.error('Usage: node parse-advisor-sd.mjs <path-to-sd-body.txt>');
  process.exit(2);
}

const body = readFileSync(path, 'utf8');

const ADVISOR_FRAGMENT_RE = /^\d+\.\s+(.+?)\.\s*$/gm;
const ASSUMING_FRAME_RE = /Assuming\s+.+?\s+\(unverified\),\s+do\s+.+?\.\s+Verify\s+.+?\s+before\s+acting\b/;
const CODE_BLOCK_RE = /`[^`]+`|`{3,}|<code[\s>]|\n {4,}/;

const matches = [...body.matchAll(ADVISOR_FRAGMENT_RE)];

if (matches.length === 0) {
  console.log('[WARN] Fragment-grammar shape NOT detected; falling back to Plan 07-04 legacy whole-body word count. New fragment-grammar shape is preferred per Plan 07-10.');
  process.exit(2);
}

console.log(`[INFO] Fragment-grammar shape detected: ${matches.length} numbered item(s)`);

let bad = 0;
let total = 0;
let aggregateWc = 0;

matches.forEach((m, idx) => {
  const itemBody = m[1].trim();
  const wc = itemBody.split(/\s+/).filter(Boolean).length;
  const isFrame = ASSUMING_FRAME_RE.test(itemBody);
  const hasCodeBlock = CODE_BLOCK_RE.test(itemBody);
  total++;
  aggregateWc += wc;

  if (isFrame) {
    if (wc > 22) {
      console.log(`[ERROR] Item ${idx + 1} (Assuming-frame): ${wc} words (>22 outlier soft cap)`);
      bad++;
    } else if (wc > 18) {
      console.log(`[INFO] Item ${idx + 1} (Assuming-frame): ${wc} words (>18 but <=22 outlier; acceptable for frame items)`);
    } else {
      console.log(`[OK] Item ${idx + 1} (Assuming-frame): ${wc} words`);
    }
  } else {
    if (wc > 18) {
      console.log(`[ERROR] Item ${idx + 1}: ${wc} words (>18 outlier; target <=15w)`);
      bad++;
    } else if (wc > 15) {
      console.log(`[INFO] Item ${idx + 1}: ${wc} words (>15 target but <=18 outlier; acceptable)`);
    } else {
      console.log(`[OK] Item ${idx + 1}: ${wc} words (<=15 target)`);
    }
  }

  console.log(`[ITEM] idx=${idx + 1} wc=${wc} frame=${isFrame ? 1 : 0} codeblock=${hasCodeBlock ? 1 : 0}`);
});

console.log(`[INFO] Per-item check: ${total} items; ${bad} over-cap; aggregate ${aggregateWc} words`);
console.log(`[AGGREGATE] total=${total} aggregate_wc=${aggregateWc}`);

process.exit(bad === 0 ? 0 : 1);
