// lz-eval-p23-retain.mjs
//
// NET-NEW (Phase 23 gap closure, T-23-07): the MISSING path control for the lz retention step -- the
// run-id pattern check and the cache-containment assertion that 23-06-SUMMARY.md:116-119 claimed and
// 23-SECURITY.md found in no code anywhere. THE AUTHORITY is 23-SECURITY.md's "Suggested closure".
//
// WHY THIS EXISTS AS A MODULE RATHER THAN AS AN INLINE COMMAND: the Phase-23 retention composed a
// filesystem destination from a MODEL-AUTHORED run-id (`.lz-research/<run-id>/`) inside an ephemeral
// inline command. That command no longer exists, so the control could neither be re-run nor
// re-inspected, and the next operator repeating the retention gets the same unguarded composition. The
// realized Phase-23 outcome was verified clean; the exposure closed here is PROSPECTIVE.
//
// PURE VALIDATION, BY CONSTRUCTION. Nothing in this file reads, writes, copies, moves or deletes a
// single byte -- it resolves a destination and either returns it or throws. Retained capture evidence
// under eval/.cache/ is irreplaceable and has no backup (T-23-06), so the control that guards the write
// deliberately does not perform the write: the caller copies, using the destination this module
// returned. The thin CLI at the bottom prints that destination and nothing else.
//
// THE TWO CHECKS, AND WHY BOTH ARE NEEDED:
//   1. RUN_ID_RE, frozen. The run-id is untrusted because a model authored it. The pattern admits no
//      path separator, no dot and no drive letter, so a `..`-bearing or absolute run-id is rejected
//      before it can reach path composition at all.
//   2. Containment, with `+ path.sep`. The trailing separator is the whole point and is NOT cosmetic:
//      a bare `resolved.startsWith(root)` admits a SIBLING whose name merely begins with the root's
//      name -- `eval/.cache-evil` passes a bare prefix test against `eval/.cache` while sitting
//      entirely outside it. The co-test proves that case by weakening the guard.
// Check 1 alone would leave the destRoot argument unguarded; check 2 alone would admit a run-id that
// resolved back inside the root by a longer route. Each is asserted separately.
//
// DOCUMENTED LIMITATION: containment is checked on the LEXICALLY resolved path. A pre-existing symlink
// inside the cache root that points elsewhere would still redirect a caller's write, because detecting
// that needs `fs.realpathSync` on a path that does not exist yet. Naming the gap rather than implying
// the check is stronger than it is; no sibling module in this tree resolves symlinks either.
//
// Tree / dependency boundary (D-10/D-11): repo-level eval/ dev tree only, NEVER the distributed plugin
// tree. It imports the SHIPPED runtime aggregator's ContractError ACROSS trees by relative path --
// ONE-DIRECTIONAL (eval -> runtime, never the reverse). No package is added, no network call is made.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md); LF endings.

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// ---------------------------------------------------------------------------
// RUN_ID_RE -- the FROZEN run-id shape: 8 digits of date, 6 digits of time, then a lowercase slug.
// Frozen against the realized Phase-23 run-id `20260908-105102-post-training-quantization-4bit`, whose
// conformance 23-SECURITY.md verified independently. Anchored at both ends, and the slug class carries
// no `.`, no `/`, no `\` and no `:`, so traversal and absolute-path shapes are rejected by the pattern
// itself rather than by a later check.
//
// Frozen the same way RESOLVE_LIMITS, SPIKE_CEILING and DRAW are frozen in their modules, so the
// co-test can assert Object.isFrozen. Freezing is safe here because the pattern is non-global and
// non-sticky: `test` never writes lastIndex.
// ---------------------------------------------------------------------------
export const RUN_ID_RE = Object.freeze(/^[0-9]{8}-[0-9]{6}-[a-z0-9-]+$/);

// ---------------------------------------------------------------------------
// RETAIN_CACHE_ROOT -- the frozen containment root: this repo's eval/.cache tree, resolved from this
// module's own location so it does not depend on the caller's working directory. Every retention
// destination must land inside it. Phase-scoped subdirectories (p23-baseline/lz/q2 and whatever a later
// phase uses) are all inside, so the root stays reusable without being widened per phase.
// ---------------------------------------------------------------------------
export const RETAIN_CACHE_ROOT = Object.freeze({
  DIR: path.resolve(fileURLToPath(import.meta.url), '..', '.cache'),
});

function assertNonEmptyString(name, v, where) {
  if (typeof v !== 'string' || v.length === 0) {
    throw new ContractError(
      where + ' requires a non-empty string ' + name + ': ' + JSON.stringify(v),
      where,
    );
  }
}

// ---------------------------------------------------------------------------
// assertInside(root, candidate, label, where) -- the containment assertion, in ONE place so both the
// destRoot check and the final destination check share it.
//
// `candidate` is admitted only when it IS the root or sits under `root + path.sep`. The separator is
// what distinguishes a child from a sibling with a matching name prefix.
// ---------------------------------------------------------------------------
function assertInside(root, candidate, label, where) {
  if (candidate === root || candidate.startsWith(root + path.sep)) {
    return candidate;
  }

  throw new ContractError(
    where +
      ' refuses a ' +
      label +
      ' outside the retention cache root: ' +
      JSON.stringify(candidate) +
      ' is not the root ' +
      JSON.stringify(root) +
      ' and does not sit under it (T-23-07; a name that merely shares the root prefix, such as a ' +
      'sibling directory, is OUTSIDE)',
    where,
  );
}

// ---------------------------------------------------------------------------
// retainRunDirectory({ runId, destRoot, cacheRoot }) -- validate a retention destination and return it.
//
// Throws a ContractError when `runId` does not match the frozen pattern, when `destRoot` resolves
// outside the cache root, or when the composed destination does. Returns
// { runId, cacheRoot, destRoot, dest } with every path absolute and resolved; `dest` is where the
// caller may then copy `.lz-research/<runId>/`. This function itself touches no file.
//
// `cacheRoot` is injectable ONLY so the co-test can prove the sibling-prefix case against a scratch
// root; production callers pass two arguments and get the frozen root.
// ---------------------------------------------------------------------------
export function retainRunDirectory({ runId, destRoot, cacheRoot = RETAIN_CACHE_ROOT.DIR } = {}) {
  const where = 'retainRunDirectory';

  assertNonEmptyString('runId', runId, where);
  assertNonEmptyString('destRoot', destRoot, where);
  assertNonEmptyString('cacheRoot', cacheRoot, where);

  if (!RUN_ID_RE.test(runId)) {
    throw new ContractError(
      where +
        ' refuses a run-id that does not match the frozen pattern ' +
        String(RUN_ID_RE) +
        ': ' +
        JSON.stringify(runId) +
        ' (T-23-07; the run-id is model-authored and is composed into a filesystem path)',
      where,
    );
  }

  const root = path.resolve(cacheRoot);
  const resolvedDestRoot = assertInside(root, path.resolve(destRoot), 'destRoot', where);
  const dest = assertInside(root, path.resolve(resolvedDestRoot, runId), 'destination', where);

  return { runId, cacheRoot: root, destRoot: resolvedDestRoot, dest };
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it).
//   node eval/lz-eval-p23-retain.mjs <run-id> <dest-root>
//
// Prints the validated absolute destination on stdout and NOTHING else, so a retention shell step can
// use it directly and still get the control:
//   DEST=$(node eval/lz-eval-p23-retain.mjs "$RUN_ID" eval/.cache/p23-baseline/lz/q2) && cp -r ...
// It copies nothing itself. Exit 2 on a ContractError, so a rejected run-id fails the step rather than
// leaving the caller with an empty variable to interpolate.
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const { dest } = retainRunDirectory({ runId: process.argv[2], destRoot: process.argv[3] });
    console.log(dest);
    process.exit(0);
  } catch (err) {
    console.error('lz-eval-p23-retain: ' + (err && err.message ? err.message : String(err)));
    process.exit(2);
  }
}
/* node:coverage enable */
