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
// The schema reference is the human-maintainer home of the canonical-URL recipe; its own anti-drift
// clause claims the recipe is "kept byte-identical ... by a dev-time test", so this gate must actually
// read it (F#10: pre-fix the recipe was pinned only transitively via the two prompts, never the schema
// -- a schema-only edit would have gone uncaught despite the stated guarantee).
const SCHEMA = read('../plugins/lz-advisor/references/lz-deep-research-schema.md');
void HERE;

// ===========================================================================
// SSOT: the inlined denylist in BOTH prompts must carry every key of the deterministic TRACKING_PARAMS
// set + the utm_ prefix + case-insensitive matching. A maintainer dropping a key (or the case-insensitive
// clause) fails the gate -- this is the drift the F3 bug + the Group-C review surfaced.
// ===========================================================================

test('SSOT: both worker prompts AND the schema reference inline EVERY TRACKING_PARAMS denylist key (no drift from the eval set)', () => {
  const keys = [...TRACKING_PARAMS];
  assert.ok(keys.length >= 11, 'TRACKING_PARAMS carries the full denylist (>= 11 keys)');

  for (const key of keys) {
    assert.ok(EXTRACT.includes(key), 'extract-worker prompt inlines denylist key: ' + key);
    assert.ok(SEARCH.includes(key), 'search-worker prompt inlines denylist key: ' + key);
    // F#10: pin the schema reference directly so a schema-only edit (e.g. dropping a key) fails the
    // gate -- making the schema's own "kept byte-identical ... by a dev-time test" claim honest.
    assert.ok(SCHEMA.includes(key), 'schema reference inlines denylist key: ' + key);
  }
});

test('SSOT: both prompts AND the schema strip the utm_ prefix and match CASE-INSENSITIVELY (the F3 fix, mirrored)', () => {
  for (const [name, text] of [['extract', EXTRACT], ['search', SEARCH], ['schema', SCHEMA]]) {
    assert.ok(/utm_/.test(text), name + ' mentions the utm_ prefix');
    assert.ok(/case-insensitiv/i.test(text), name + ' requires case-insensitive matching');
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
  // F#8: EXTRACT owns the sources/ filename rule, so a re-introduced SHA-256 filename instruction is
  // most likely to land here. The narrow /sha-?256[ -]?hex/i check (the "hex"-adjacent form, above)
  // misses a bare "SHA-256" without the word "hex"; assert the broad form against EXTRACT too. Extract
  // legitimately needs no SHA-256 token now that percent-encoding is settled.
  assert.ok(!/sha-?256/i.test(EXTRACT), 'extract prompt carries no SHA-256 reference anywhere (incl. description + examples)');
  assert.ok(!/sources\/<sha/i.test(SEARCH), 'search prompt carries no stale sources/<sha> reference');
  assert.ok(!/sources\/<sha/i.test(EXTRACT), 'extract prompt carries no stale sources/<sha> reference');
  assert.ok(!/\(capped\)/i.test(EXTRACT), 'extract prompt carries no stale "(capped)" excerpt reference');
  // The search worker must not instruct writing to sources/ in any example (extract owns sources/).
  assert.ok(!/write[^.\n]*\bto\b[^.\n]*sources\//i.test(SEARCH), 'no example tells search to write to sources/');
});

// ===========================================================================
// Cluster 3 (GAP, /gsd:validate-phase): least-privilege tools grant -- the T-19-05 (EoP) mitigation.
//
// PIPE-03 / PIPE-04 / PIPE-05 each declare the worker's frontmatter `tools` list as the role's
// access-control boundary: the search worker is EXACTLY [WebSearch, Write] (it never fetches page
// bodies or runs shell), the extract worker is EXACTLY [WebFetch, Write] (it never searches). Before
// this gate the grant was proven only by a one-time manual `git grep` during execution -- a maintainer
// re-adding Read/Bash, or flipping search to WebFetch, would NOT be caught by any test. This converts
// the least-privilege grant from a one-shot review into a checked regression gate against the SHIPPED
// frontmatter. It parses the actual `tools:` line, so it FAILS if a tool is added, removed, or swapped.
// ===========================================================================

// Parse the frontmatter `tools: [...]` array from a shipped agent prompt into a string set.
const parseToolsGrant = (prompt, name) => {
  const m = prompt.match(/^tools:\s*\[([^\]]*)\]/m);
  assert.ok(m, name + ' frontmatter declares a tools: [...] array');
  return m[1]
    .split(',')
    .map((t) => t.trim().replace(/^["']|["']$/g, ''))
    .filter((t) => t.length > 0);
};

test('Cluster 3 (T-19-05): the SEARCH worker frontmatter grants EXACTLY [WebSearch, Write] -- no WebFetch/Read/Bash', () => {
  const grant = parseToolsGrant(SEARCH, 'search-worker');
  assert.deepEqual(
    [...grant].sort(),
    ['WebSearch', 'Write'],
    'search worker must grant exactly WebSearch + Write (got: ' + grant.join(', ') + ')',
  );
  // Discriminating negatives: each over-privilege tool is individually absent from the grant.
  for (const forbidden of ['WebFetch', 'Read', 'Bash', 'Edit', 'Glob']) {
    assert.ok(!grant.includes(forbidden), 'search worker must NOT grant ' + forbidden);
  }
});

test('Cluster 3 (T-19-05): the EXTRACT worker frontmatter grants EXACTLY [WebFetch, Write] -- no WebSearch/Read/Bash', () => {
  const grant = parseToolsGrant(EXTRACT, 'extract-worker');
  assert.deepEqual(
    [...grant].sort(),
    ['WebFetch', 'Write'],
    'extract worker must grant exactly WebFetch + Write (got: ' + grant.join(', ') + ')',
  );
  // Discriminating negatives: each over-privilege tool is individually absent from the grant.
  for (const forbidden of ['WebSearch', 'Read', 'Bash', 'Edit', 'Glob']) {
    assert.ok(!grant.includes(forbidden), 'extract worker must NOT grant ' + forbidden);
  }
});

// ===========================================================================
// Cluster 4 (GAP, /gsd:validate-phase): the AGG-03 receipt contract against the SHIPPED documented
// receipt example -- the D-14 / T-19-06 (Information Disclosure) mitigation.
//
// The existing plugin-tree receipt test (lz-deep-research-aggregate.test.mjs) asserts a HARDCODED inline
// sample string, divorced from the agent files -- it cannot catch a maintainer making the DOCUMENTED
// receipt multi-line, over-cap, or raw-text-bearing. The whole point of the one-line counts-only receipt
// is that the main session never holds raw source text; if the shipped example drifts to demonstrate a
// non-conforming receipt, the agent ships a contract violation. This gate extracts the receipt example
// from the actual shipped fenced ```text block in each agent and asserts the AGG-03 contract on it.
// ===========================================================================

// Extract the receipt example -- the single line inside the agent's documented ```text fenced block
// that begins with the counts-only sentinel "ok worker=".
const extractReceiptExample = (prompt, name) => {
  const fences = [...prompt.matchAll(/```text\s*\n([\s\S]*?)```/g)].map((mm) => mm[1]);
  for (const block of fences) {
    for (const line of block.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('ok worker=')) {
        return trimmed;
      }
    }
  }
  assert.fail(name + ' must document a counts-only receipt example ("ok worker=...") in a ```text block');
};

test('Cluster 4 (AGG-03/D-14): the SEARCH worker documented receipt is one line, <= 200 chars, counts-only, no raw text', () => {
  const receipt = extractReceiptExample(SEARCH, 'search-worker');
  assert.ok(!/[\r\n]/.test(receipt), 'search receipt example must be a single line (no CR/LF)');
  assert.ok(receipt.length <= 200, 'search receipt must be <= ~200 chars; got ' + receipt.length);
  // Counts-only shape: carries the worker id + a numeric candidate count + a status word.
  assert.match(
    receipt,
    /\bworker=\S+[\s\S]*\bcandidates=\d+[\s\S]*\bstatus=\S+/,
    'search receipt must be counts-only (worker=... candidates=N status=...)',
  );
});

test('Cluster 4 (AGG-03/D-14): the EXTRACT worker documented receipt is one line, <= 200 chars, counts-only, no raw quote', () => {
  const receipt = extractReceiptExample(EXTRACT, 'extract-worker');
  assert.ok(!/[\r\n]/.test(receipt), 'extract receipt example must be a single line (no CR/LF)');
  assert.ok(receipt.length <= 200, 'extract receipt must be <= ~200 chars; got ' + receipt.length);
  // Counts-only shape: carries the worker id + numeric excerpt and claim counts + a status word.
  assert.match(
    receipt,
    /\bworker=\S+[\s\S]*\bexcerpts=\d+[\s\S]*\bclaims=\d+[\s\S]*\bstatus=\S+/,
    'extract receipt must be counts-only (worker=... excerpts=N claims=M status=...)',
  );
});

test('Cluster 4 (AGG-03/T-19-06): both workers state the one-line / counts-only / no-raw-text receipt contract in prose', () => {
  for (const [name, text] of [['extract', EXTRACT], ['search', SEARCH]]) {
    assert.match(text, /exactly ONE line/i, name + ' states the one-line receipt rule');
    assert.match(text, /200 characters/i, name + ' states the ~200-char cap');
    assert.match(text, /counts-only/i, name + ' states the receipt is counts-only');
    assert.match(text, /NO raw\b[\s\S]{0,40}(text|quote)/i, name + ' states the receipt carries no raw text/quotes');
  }
});
