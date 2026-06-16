// lz-eval-packaging-boundary.test.mjs
//
// D-11 packaging-boundary check, enforced from the EVAL side (Plan 18-02).
// Zero external dependencies: Node stdlib node:test + node:assert/strict only -- NO jstat import.
// (The packaging boundary is structural; it needs no statistics library.)
//
// Asserts the one-directional D-11 boundary between the DISTRIBUTED plugin tree
// (plugins/lz-advisor/) and the repo-level dev-only eval/ tree:
//   (1) NO package.json and NO node_modules anywhere under plugins/lz-advisor/ -- the marketplace
//       package carries no install surface (mirrors the re-scoped runtime SC-2 test from the other
//       side).
//   (2) NO shipped runtime artifact under plugins/lz-advisor/ imports any eval/ script -- the import
//       boundary is one-directional (eval/ -> runtime only, never runtime -> eval/), so an eval
//       dev dependency can never leak into the shipped plugin.
//
// HOST QUIRK (load-bearing): on this host (Node v24.13.0 / Windows arm64 / Git Bash) the phase gate
// MUST target the explicit FILE form:
//   node --test eval/lz-eval-packaging-boundary.test.mjs
// The directory form (`node --test <dir>`) spuriously exits 1 on this host even when every real
// test passes. The suite is one file, so the file form is the equivalent reliable gate.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve the plugin tree test-file-relative (NEVER process.cwd() -- cwd drifts under GSD worktrees
// and headless `claude -p`). HERE is the repo-level eval/ dir; the plugin root is one level up,
// then into plugins/lz-advisor.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = path.resolve(HERE, '..', 'plugins', 'lz-advisor');

test('D-11 boundary: no package.json/node_modules anywhere under the plugin tree', () => {
  assert.ok(
    fs.existsSync(PLUGIN_ROOT),
    'plugin root not found at ' + PLUGIN_ROOT + ' (boundary test mis-located)',
  );

  let inspected = 0;

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);

      assert.notEqual(
        entry.name,
        'package.json',
        'unexpected package.json under the plugin tree at ' + full + ' (D-11)',
      );
      assert.notEqual(
        entry.name,
        'node_modules',
        'unexpected node_modules under the plugin tree at ' + full + ' (D-11)',
      );

      if (entry.isDirectory()) {
        walk(full);
      } else {
        inspected += 1;
      }
    }
  };

  walk(PLUGIN_ROOT);

  // Non-vacuous self-check: the scan must have walked real files. A zero count means the walk
  // silently no-op'd (a vacuous pass that would mask a regression).
  assert.ok(inspected >= 1, 'plugin-tree scan inspected no files (vacuous walk)');
});

test('D-11 boundary: no shipped runtime .mjs imports any eval/ script (one-directional import)', () => {
  // The import boundary is one-directional: eval/ MAY import the runtime aggregator across trees,
  // but NO file under plugins/lz-advisor/ may import any eval/ script. A runtime -> eval import would
  // drag the eval dev dependency (jstat) into the shipped package. Scan every .mjs under the plugin
  // tree for an import/require spec that resolves into eval/.
  const importRe = /\b(?:from|import|require)\s*\(?\s*['"]([^'"]+)['"]/g;

  let mjsInspected = 0;
  const offenders = [];

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(full);
        continue;
      }

      if (!entry.name.endsWith('.mjs')) {
        continue;
      }

      mjsInspected += 1;
      const src = fs.readFileSync(full, 'utf8');
      let m;

      while ((m = importRe.exec(src)) !== null) {
        const spec = m[1];

        // A relative spec that reaches the sibling eval/ tree, or any spec naming an eval/ path
        // segment, is a boundary violation. Match '../eval/', '.../eval/...', or a bare 'eval/...'.
        if (/(^|\/)eval\//.test(spec) || /(^|\.\.\/)eval\//.test(spec)) {
          offenders.push(full + ' -> ' + spec);
        }
      }
    }
  };

  walk(PLUGIN_ROOT);

  // Non-vacuous self-check: at least one .mjs (the runtime aggregator + its test) must have been
  // scanned, or the boundary assertion below would pass vacuously.
  assert.ok(mjsInspected >= 1, 'no .mjs files scanned under the plugin tree (vacuous walk)');
  assert.equal(
    offenders.length,
    0,
    'shipped runtime artifact(s) import an eval/ script (D-11 one-directional violation):\n' +
      offenders.join('\n'),
  );
});
