// lz-eval-worker-contract.test.mjs
//
// Dev-time SSOT gate (Group-B/C review F12/N4): the two SHIPPED worker-agent prompts
// (research-extract-worker.md, research-search-worker.md) INLINE the canonical-URL recipe + record
// shapes because the agents have no Read tool to open the schema at run time. This test asserts the
// inlined contract has NOT drifted from the deterministic authority -- the eval `canonicalizeUrl`'s
// frozen `TRACKING_PARAMS` set -- and that the panel-resolved structural decisions hold (percent-encoded
// filename not SHA-256; extract is the sole `sources/` writer; search writes `candidates/`; the
// self-contradictory consult-the-schema instruction is gone). It converts the D-12 anti-drift discipline
// from a convention into a checked gate, with no runtime Read tool.
//
// Tree boundary: dev-only eval test. It READS the shipped prompt .md files (eval -> runtime is the
// allowed one-directional dependency) and imports the eval `TRACKING_PARAMS`. It ships nothing.
//
// HOST QUIRK: run via the explicit FILE form (`node --test eval/lz-eval-worker-contract.test.mjs`);
// the directory form spuriously exits 1 on this host.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { TRACKING_PARAMS } from './lz-eval-search-loop.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const read = (rel) => fs.readFileSync(new URL(rel, import.meta.url), 'utf8');

const EXTRACT = read('../plugins/lz-advisor/agents/research-extract-worker.md');
const SEARCH = read('../plugins/lz-advisor/agents/research-search-worker.md');
void HERE;

// ===========================================================================
// SSOT: the inlined denylist in BOTH prompts must carry every key of the deterministic TRACKING_PARAMS
// set + the utm_ prefix + case-insensitive matching. A maintainer dropping a key (or the case-insensitive
// clause) fails the gate -- this is the drift the F3 bug + the Group-C review surfaced.
// ===========================================================================

test('SSOT: both worker prompts inline EVERY TRACKING_PARAMS denylist key (no drift from the eval set)', () => {
  const keys = [...TRACKING_PARAMS];
  assert.ok(keys.length >= 11, 'TRACKING_PARAMS carries the full denylist (>= 11 keys)');

  for (const key of keys) {
    assert.ok(EXTRACT.includes(key), 'extract-worker prompt inlines denylist key: ' + key);
    assert.ok(SEARCH.includes(key), 'search-worker prompt inlines denylist key: ' + key);
  }
});

test('SSOT: both prompts strip the utm_ prefix and match CASE-INSENSITIVELY (the F3 fix, mirrored)', () => {
  for (const [name, text] of [['extract', EXTRACT], ['search', SEARCH]]) {
    assert.ok(/utm_/.test(text), name + ' prompt mentions the utm_ prefix');
    assert.ok(/case-insensitiv/i.test(text), name + ' prompt requires case-insensitive matching');
  }
});

// ===========================================================================
// Cluster 1: percent-encoding (LLM-executable), NOT SHA-256, for the sources/ filename.
// ===========================================================================

test('Cluster 1: the extract prompt uses PERCENT-ENCODING for the sources/ filename, not a SHA-256 hash', () => {
  assert.ok(/percent-encod/i.test(EXTRACT), 'extract prompt specifies percent-encoding for the filename');
  // The discriminating negative: the old SHA-256-hex filename instruction must be gone.
  assert.ok(!/sha-?256[ -]?hex/i.test(EXTRACT), 'extract prompt no longer instructs a SHA-256-hex filename');
});

test('Cluster 1: the extract prompt stores the excerpt VERBATIM (the unenforceable ~50 KB LLM cap is gone)', () => {
  assert.ok(/verbatim/i.test(EXTRACT), 'extract prompt stores the excerpt verbatim');
  assert.ok(!/~?\s*50\s*kb/i.test(EXTRACT), 'the ~50 KB model-directed truncation cap is removed');
});

// ===========================================================================
// Cluster 1: the self-contradictory schema instruction is removed from BOTH prompts.
// ===========================================================================

test('Cluster 1: neither prompt carries the self-contradictory "do not inline that schema" instruction', () => {
  assert.ok(!/do not inline that schema/i.test(EXTRACT), 'extract prompt drops the do-not-inline contradiction');
  assert.ok(!/do not inline that schema/i.test(SEARCH), 'search prompt drops the do-not-inline contradiction');
});

// ===========================================================================
// Cluster 2: ownership -- extract is the sole sources/ writer; search writes candidates/, not sources/.
// ===========================================================================

test('Cluster 2: the search prompt writes candidates/<worker-id>.json and explicitly does NOT write sources/', () => {
  assert.ok(/candidates\/<worker-id>\.json/.test(SEARCH), 'search prompt writes candidates/<worker-id>.json');
  // It states the prohibition on writing sources/ (the word appears only in the negative).
  assert.ok(/never\s+`?sources\/`?|not?\s+write[^.]*sources\//i.test(SEARCH), 'search prompt forbids writing sources/');
});

test('Cluster 2: the extract prompt remains the sources/ writer and owns the canonical key', () => {
  assert.ok(/sources\/</.test(EXTRACT), 'extract prompt writes the sources/ record');
  assert.ok(/claims\[\]\.source|claims\/<worker/.test(EXTRACT), 'extract prompt writes the authoritative claims[].source');
});

// ===========================================================================
// Clear fixes: search query floor + raised maxTurns on both (so the receipt is not cut off).
// ===========================================================================

test('clear fix: the search prompt hardcodes a >= 3 distinct-queries floor', () => {
  assert.ok(/at least 3 distinct queries/i.test(SEARCH), 'search prompt hardcodes the 3-query floor');
});

test('clear fix: both workers raise maxTurns above 4 (extract: 1 fetch + 3 writes + receipt)', () => {
  for (const [name, text] of [['extract', EXTRACT], ['search', SEARCH]]) {
    const m = text.match(/^maxTurns:\s*(\d+)/m);
    assert.ok(m, name + ' prompt declares maxTurns');
    assert.ok(Number(m[1]) >= 5, name + ' maxTurns raised to >= 5 (got ' + m[1] + ')');
  }
});

test('SSOT: no STALE design references survive in the frontmatter/examples (the re-gate-caught class)', () => {
  // The post-fix LLM re-gate caught stale description/<example> blocks that the body-recipe checks
  // missed: SHA-256 / sources/<sha> filenames and a "(capped)" excerpt. The WHOLE prompt (frontmatter
  // + examples + body) must be free of the superseded design, or the routing-surface description lies.
  assert.ok(!/sha-?256/i.test(SEARCH), 'search prompt carries no SHA-256 reference anywhere (incl. examples)');
  assert.ok(!/sources\/<sha/i.test(SEARCH), 'search prompt carries no stale sources/<sha> reference');
  assert.ok(!/sources\/<sha/i.test(EXTRACT), 'extract prompt carries no stale sources/<sha> reference');
  assert.ok(!/\(capped\)/i.test(EXTRACT), 'extract prompt carries no stale "(capped)" excerpt reference');
  // The search worker must not instruct writing to sources/ in any example (extract owns sources/).
  assert.ok(!/write[^.\n]*\bto\b[^.\n]*sources\//i.test(SEARCH), 'no example tells search to write to sources/');
});
