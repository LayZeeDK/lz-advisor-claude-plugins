// lz-eval-readjson.mjs
//
// Shared fail-closed JSON read for the eval tree (Group-B F12 de-dup). Five eval modules each carried
// a byte-identical copy of the runtime aggregator's module-private readJson shape; this consolidates
// them into one definition so the fail-closed read cannot drift between modules.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ tree, NEVER in the
// distributed plugin tree. It imports the SHIPPED runtime aggregator's hardening primitives ACROSS
// trees by relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval) -- so no eval
// dependency can ever leak into the marketplace package. NEVER add an eval/ import to any plugin-tree
// file. The module is node stdlib + the runtime hardening primitives; zero npm deps.
//
// The byte-order mark is code point U+FEFF. This source contains no literal byte-order mark; the
// imported stripBom handles a BOM at read time (ASCII-only source per CLAUDE.md).

import fs from 'node:fs';

import {
  ContractError,
  stripBom,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// Fail-closed JSON read (the runtime aggregator's module-private readJson shape, using the IMPORTED
// ContractError + stripBom -- never a bare JSON.parse on untrusted data). Error messages are kept
// verbatim ('cannot read file: ...' / 'malformed JSON: ...') so callers + tests that match on them are
// unaffected by the de-dup.
export function readJson(p) {
  let text;

  try {
    text = stripBom(fs.readFileSync(p, 'utf8'));
  } catch (err) {
    throw new ContractError('cannot read file: ' + err.message, p);
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new ContractError('malformed JSON: ' + err.message, p);
  }
}
