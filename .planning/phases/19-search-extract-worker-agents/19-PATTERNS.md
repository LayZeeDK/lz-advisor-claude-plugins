# Phase 19: Search + extract worker agents - Pattern Map

**Mapped:** 2026-06-16
**Files analyzed:** 11 new/modified (2 agents, 2 new eval modules + tests, 3 extend/re-register, 1 round-trip fixture, 1 loader fix)
**Analogs found:** 11 / 11

> Phase 19 is ~80% consumption of FROZEN contracts. Every new file has a strong in-repo analog;
> there is NO "no analog" row. The two-tree boundary is load-bearing: agent files copy the
> `agents/research-verify-voter-*.md` template; eval-tree `.mjs` files copy `eval/*.mjs`; the round-trip
> fixture copies the plugin-tree aggregator test. NEVER map an eval-tree file to an agent analog or
> vice versa, and NEVER introduce a `package.json` / `node_modules` under `plugins/lz-advisor/` (the
> packaging-boundary test fails closed).

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `plugins/lz-advisor/agents/research-search-worker.md` | agent (worker subagent) | request-response (search -> receipt) | `plugins/lz-advisor/agents/research-verify-voter-sonnet.md` (+ `-haiku.md`) | exact (least-privilege worker template) |
| `plugins/lz-advisor/agents/research-extract-worker.md` | agent (worker subagent) | file-I/O (fetch -> immutable excerpt + claims + source) | `plugins/lz-advisor/agents/research-verify-voter-sonnet.md` | exact (same template; + schema-write contract) |
| `eval/lz-eval-search-loop.mjs` | utility (deterministic driver module) | transform (search-and-stop core + adapters + dateFilter + canonicalizeUrl + sourceFilename) | `eval/lz-eval-dataset.mjs` + `eval/lz-eval-aggregate.mjs` | role-match (zero-dep eval module, cross-tree import, ContractError/safeId/createHash) |
| `eval/lz-eval-search-loop.test.mjs` | test | n/a | `eval/lz-eval-dataset.test.mjs` (+ aggregate test) | exact (node:test FILE-form, fail-closed assertions) |
| `eval/lz-eval-traps.mjs` | utility (trap-construction recipe) | batch (mutate AVeriTeC seeds + sha256 + manifest) | `eval/lz-eval-dataset.mjs` | role-match (HF/manifest/sha256 discipline) |
| `eval/lz-eval-traps.test.mjs` | test | n/a | `eval/lz-eval-dataset.test.mjs` | exact (node:test FILE-form) |
| `eval/lz-eval-dataset.mjs` (D-12 edit) | utility (loader) | batch (HF fetch + stratify) | itself -- existing `--repo-type`/`gated`/`fetchDataset` handling | exact (surgical 2-field parameterization) |
| `eval/lz-eval-dataset.test.mjs` (extend) | test | n/a | itself -- existing DRIFT GATE + remap tests | exact (extend the drift gate to new strata rows) |
| `eval/lz-eval-aggregate.test.mjs` (extend) | test | n/a | `eval/lz-eval-dataset.test.mjs` threshold-match style | exact (CP(1,N) formula-ceiling anti-drift) |
| `eval/lz-eval-lock-rule.md` (re-register) | config (pre-registered prose) | n/a | itself -- existing frozen-thresholds table | exact (re-register to pooled-n CP(1,N) formula) |
| worker-output round-trip fixture (under `eval/__fixtures__/` or the aggregator's `__fixtures__/`) | test fixture | file-I/O | `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` `fx()` fixtures | exact (run-dir fixture the frozen aggregator accepts) |

## Pattern Assignments

### `plugins/lz-advisor/agents/research-search-worker.md` (agent, request-response)

**Analog:** `plugins/lz-advisor/agents/research-verify-voter-sonnet.md` (frontmatter + body) and `research-verify-voter-haiku.md` (the cheap-tier `model:` variant + `<role>`/`<context>`/`<instructions>`/`<output_format>` tag structure).

**Frontmatter pattern** (`research-verify-voter-sonnet.md` lines 1-50): copy the YAML field set verbatim, change only the worker-specific values.
```yaml
---
name: research-verify-voter-sonnet
description: |
  Use this agent when the deep-research verify stage needs ... Requires the
  claim text, ... packaged into the prompt by the harness; not intended for
  direct user invocation.
  <example>
  Context: The verify stage dispatches seat 0 ...
  user: "Vote on the claim: ... Write to votes/cluster0-0.json."
  assistant: "I will read the excerpt, test the claim ..."
  <commentary> Closed-book control arm: the voter sees only ... </commentary>
  </example>
model: sonnet
color: green
effort: medium
tools: ["WebSearch", "WebFetch", "Write"]
maxTurns: 4
---
```
For the search worker: `name: research-search-worker`, `tools: ["WebSearch", "Write"]` (D-02 least-privilege), `model:` = the cheap-tier the gate clears (Sonnet ships by default; the offline read tests the Haiku variant -- D-02/D-10). Keep `effort: medium`, `maxTurns: 4`, a distinct `color`. The `description` MUST be third person + carry `<example>` blocks + end with "not intended for direct user invocation" (the exact non-user-invoked framing the voters use, lines 9-10).

**Least-privilege "tools per arm" body pattern** (`research-verify-voter-sonnet.md` lines 61-69): the voter documents the minimum grant and why. The search worker mirrors this -- declare `[WebSearch, Write]`, search for source candidates per sub-angle, write `sources/<sha>.json`, return the receipt; never `Read`/`Bash`.

**Bounded-action + receipt close** (`research-verify-voter-sonnet.md` lines 207-212):
```
Cast one bounded vote and commit. Do not open-endedly explore: one disconfirming
search plus the quoting step is enough ... Reference plugin resources via
`${CLAUDE_PLUGIN_ROOT}` if you need them. Write only the vote file; take no
other action.
```
Copy this discipline: bounded search, write only the run-dir files, return a one-line receipt (D-14), reference resources via `${CLAUDE_PLUGIN_ROOT}` and NEVER inline the schema (no cross-skill body references -- the voter points at it, it does not paste it).

**Disconfirming-search + source-independence cue** (`research-verify-voter-sonnet.md` lines 84-102): the search-and-stop PROTOCOL the worker shares with the voter (D-09/D-10) -- search the negation, restrict retrieval, weight corroboration by source independence. The deterministic core for this lives in `eval/lz-eval-search-loop.mjs` (Pattern below); the agent body specifies the protocol prose, the .mjs specifies the testable mechanics.

---

### `plugins/lz-advisor/agents/research-extract-worker.md` (agent, file-I/O)

**Analog:** same voter template (frontmatter, body discipline) PLUS the frozen WRITE shapes from `plugins/lz-advisor/references/lz-deep-research-schema.md`.

**Frontmatter:** `name: research-extract-worker`, `model: sonnet` (D-02 fixed Sonnet, trust-critical, NOT gated), `tools: ["WebFetch", "Write"]`, `effort: medium`, `maxTurns: 4`, distinct `color`. Use the RESEARCH.md Pattern-1 example body (19-RESEARCH.md lines 209-231) as the literal starting draft -- it is already cast to this agent.

**The three frozen WRITE shapes** the body must specify (copy field names byte-for-byte from `lz-deep-research-schema.md`; the aggregator is authoritative):

Claim record `claims/<worker-id>.json` (schema lines 138-160):
```json
{
  "worker": "w1",
  "source": "https://example.org/a/study",
  "claims": [
    { "id": "c1", "text": "X reduces Y by 30%", "quote": "X reduces Y by 30%", "excerpt_id": "e1" }
  ]
}
```
Fail-closed fields enforced by `mergeClusters` (the acceptance surface): non-empty `source` (WR-03), non-empty `claims[].id` (AGG-1), non-empty `claims[].text` (WR-02), non-empty `claims[].quote` (WR-01); `excerpt_id` optional. The worker MUST emit all of these or the aggregator aborts (exit 2).

Source record `sources/<source-id>.json` (schema lines 93-107): `{id, url, title, fetched_at?}`. The `id` is the RAW canonical URL key and MUST equal `claims[].source` (D-08). The FILENAME is the SHA-256 hex of that key (Phase-19 filename-safety rule, schema lines 122-130).

Excerpt `excerpts/<excerpt-id>.txt` (schema lines 167-182): plain UTF-8, CRLF/LF/BOM tolerated, stored verbatim at fetch time (D-04), capped ~50 KB (D-15). `excerpt_id` is the filename basename run through `safeId`.

**Receipt close** (D-14): copy the voter's "write only / take no other action" close; the receipt is one line `<= ~200` chars, counts-only (`worker=... source=... excerpts=N claims=M status=...`), NO raw source text. See 19-RESEARCH.md lines 446-451 for the exact receipt form.

**URL canonicalization + SHA filename:** the agent body references the deterministic recipe; the actual pure functions (`canonicalizeUrl`, `sourceFilename`) live in `eval/lz-eval-search-loop.mjs` and are MC/DC-tested (see below). The body specifies the rule (D-13), the .mjs specifies the implementation.

---

### `eval/lz-eval-search-loop.mjs` (utility, transform)

**Analog:** `eval/lz-eval-dataset.mjs` (module header, cross-tree import, ContractError discipline, `node:crypto` SHA-256, guarded CLI) and `eval/lz-eval-aggregate.mjs` (same import block, `Object.freeze` constants, fail-closed `readJson` copy). It contains: the search-and-stop core, both retrieval adapters, `dateFilter`/`parseAvtDate`, `canonicalizeUrl`, `sourceFilename`.

**Module header + tree-boundary comment** (`lz-eval-dataset.mjs` lines 1-32): copy the "lives in the repo-level eval/ tree, NEVER in the distributed plugin tree ... ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval)" preamble. This is the load-bearing zero-dep boundary statement.

**Cross-tree import of hardening primitives** (`lz-eval-dataset.mjs` lines 44-48 / `lz-eval-aggregate.mjs` lines 39-44):
```javascript
import { createHash } from 'node:crypto';
import {
  ContractError,
  stripBom,
  safeId,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';
```
Use this exact one-directional import. `node:crypto.createHash('sha256')` for `sourceFilename` (already in use at `lz-eval-dataset.mjs:36`). Do NOT hand-roll a hash, do NOT duplicate `ContractError`/`safeId`/`stripBom`.

**Fail-closed `readJson` copy** (`lz-eval-dataset.mjs` lines 172-188, identical in `lz-eval-aggregate.mjs` lines 147-163): copy verbatim if the module reads JSON -- never a bare `JSON.parse` on untrusted data.

**`Object.freeze` constants pattern** (`lz-eval-dataset.mjs` lines 55-59, `lz-eval-aggregate.mjs` lines 69-81): freeze the tracking-param denylist set / search-minimum defaults the same way `STRATA_FRACTIONS` and `EVAL_THRESHOLDS` are frozen.

**`canonicalizeUrl` + `sourceFilename`** (already drafted against this codebase, 19-RESEARCH.md lines 418-443): lowercase scheme+host, strip :80/:443, strip `utm_*` + the D-13 denylist, strip fragment + trailing slash; `sourceFilename` = `createHash('sha256').update(canonicalKey, 'utf8').digest('hex') + '.json'`. `new URL(raw)` throws on malformed -> fail-closed upstream (the established ContractError discipline).

**`dateFilter` + `parseAvtDate`** (19-RESEARCH.md lines 279-292): fail-closed -- `parseAvtDate` throws `ContractError` on a malformed `DD-MM-YYYY`; `dateFilter` drops any undated OR `>= claimDate` doc (the D-05/D-07 leakage guard).

**`searchAndStop` core + pluggable adapter seam** (19-RESEARCH.md lines 245-268): the adapter is the ONLY swappable line (`adapter.fetchResults(query)` -- live WebSearch vs static-KS+date-filter). Mirror the existing injectable-seam pattern (`listJson(dir, readdir = fs.readdirSync)` at `lz-deep-research-aggregate.mjs:192` -- an injected default that lets the determinism be tested host-independently). The static-KS adapter is the MC/DC-testable pure function; mechanical search minimums + the per-vote search trace `{queries[], depth, stop_reason}` are adapter-agnostic.

**Guarded CLI tail** (`lz-eval-dataset.mjs` lines 364-384, `lz-eval-aggregate.mjs` lines 264-288): copy the `/* node:coverage disable */ ... if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) { ... }` guard so `import`-ing the module does NOT run the CLI; exit 0 on success / 2 on `ContractError` with `(${err.file})` annotation.

---

### `eval/lz-eval-search-loop.test.mjs` (test)

**Analog:** `eval/lz-eval-dataset.test.mjs` (node:test FILE-form, `assert/strict`, test-file-relative fixture resolution, discriminating + fail-closed assertions).

**Imports + host-quirk header** (`lz-eval-dataset.test.mjs` lines 30-59):
```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { /* functions under test */ } from './lz-eval-search-loop.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));   // NEVER process.cwd()
```
Copy the HOST QUIRK comment verbatim (lines 30-34): the gate is `node --test eval/lz-eval-search-loop.test.mjs` (FILE form), NEVER the dir form.

**Fail-closed `assert.throws` shape** (`lz-eval-dataset.test.mjs` lines 93-99, 106-118):
```javascript
assert.throws(
  () => parseAvtDate('not-a-date'),
  (err) => err.name === 'ContractError' && /unparseable|date/i.test(err.message),
  'a malformed claim_date must throw ContractError',
);
```
Use this for `parseAvtDate` malformed, `canonicalizeUrl` on malformed URL, etc.

**Discriminating (non-tautological) assertion pattern** (`lz-eval-dataset.test.mjs` lines 82-91, 263-277): every behavior test proves the function actually FLIPS / discriminates, never that it returns a constant. Apply to: `dateFilter` keeps a pre-cutoff doc AND drops a post-cutoff AND drops an undated (lines 550 of the Validation Architecture test map); `sourceFilename` same key -> same name, different key -> different name, no path separators in output; `searchAndStop` min-not-met -> insufficient vs minimums-met+decisive -> verdict.

**Per-function test points:** drive them from the 19-RESEARCH.md "Deterministic driver function coverage" table (lines 546-554) -- it is the authoritative MC/DC sampling list.

---

### `eval/lz-eval-traps.mjs` (utility, batch) + `eval/lz-eval-traps.test.mjs` (test)

**Analog:** `eval/lz-eval-dataset.mjs` (HF/sha256/manifest discipline, cross-tree import, `verifySha256`, guarded CLI) and `eval/__fixtures__/lz-eval-manifest.json` (the manifest shape it writes uids + recipe into). Test analog: `eval/lz-eval-dataset.test.mjs`.

**`verifySha256` fail-closed pattern** (`lz-eval-dataset.mjs` lines 96-108): reuse the imported `verifySha256` (or copy its 64-hex-validate-then-compare-then-throw shape) -- a tampered/HTML-error body must fail loudly naming the file, never silently "verify".

**License posture (CRITICAL, Pitfall 5):** the trap recipe WRITES mutated AVeriTeC text to gitignored `eval/.cache/` ONLY. The committed manifest carries uids + remapped labels + the mutation recipe/seed -- NEVER the NC text (D-07). Mirror the `lz-eval-dataset.mjs` header (lines 22-26): "AVeriTeC (CC-BY-NC) ... FETCH-ONLY: the committed manifest carries only IDs + remapped labels + a pinned revision + sha256, and their text is fetched into the gitignored eval/.cache/ at eval time -- never committed."

**Generator-hygiene + validity-gate (recipe-not-text):** the trap test asserts the one-step overreach mutation flips the gold to `refuted` and that the validity gate (deliberately-weak-verifier flip) discriminates (19-RESEARCH.md lines 339-343, test map line 554). The generator is OUTSIDE the voter families (A3 -- human-gated or a non-voter Claude model).

**Manifest extension shape:** `lz-eval-manifest.json` already has `strata.open-book` (lines 17-20) and a per-source object with `{id, repo, revision, license, vendored, gated, files:[{file, sha256}]}` (lines 27-...). The new AVeriTeC rows attach to this same shape -- add `chenxwh/AVeriTeC` as a `gated:false` source (D-12) with uids + recipe, NO `text` field on any row (the drift gate asserts this).

---

### `eval/lz-eval-dataset.mjs` (D-12 surgical edit) + `eval/lz-eval-dataset.test.mjs` (extend)

**Analog:** the file's OWN existing `fetchDataset` / `preflightToken` / `gated` handling.

**The edit** (`lz-eval-dataset.mjs` lines 323-357 `fetchDataset`): currently hardcodes `'--repo-type', 'dataset'` at line 334 for ALL repos. D-12 = thread a per-source `repoType` (default `'dataset'`) + the correct `gated` flag through from the manifest entry. The RESEARCH-drafted signature (19-RESEARCH.md lines 457-463):
```javascript
export function fetchDataset(repo, { revision, include, gated, repoType = 'dataset', cacheDir, runner = spawnSync } = {}) {
  preflightToken(repo, { gated });   // chenxwh/AVeriTeC: gated=false -> token-free
  const args = ['download', repo, '--repo-type', repoType, '--revision', revision, '--local-dir', localDir];
  // chenxwh/AVeriTeC -> repoType:'model', gated:false ;  jon-tow/wice -> repoType:'dataset', gated:false
}
```
NOT a blanket flip (Pitfall 6): WiCE stays `dataset`; only `chenxwh/AVeriTeC` becomes `model`+ungated. `preflightToken` already returns null for ungated (lines 147-166) -- no change needed there.

**Test extension** (`lz-eval-dataset.test.mjs` DRIFT GATE lines 291-356): extend the existing drift gate to cover the new open-book strata rows (uids covered, NO `text` field on any AVeriTeC row, sha256 discipline). Keep the discriminating-coverage assertion (matched count == manifest uid count -- no vacuous empty-set pass, line 311-315). The existing `assert.notEqual` discriminating style (lines 82-91) is the template for proving the per-source `repoType` parameterization actually differentiates WiCE from AVeriTeC.

---

### `eval/lz-eval-aggregate.test.mjs` (extend) + `eval/lz-eval-lock-rule.md` (re-register)

**Analog:** `eval/lz-eval-lock-rule.md` itself (the frozen-thresholds table + the byte-for-byte anti-drift discipline) and `eval/lz-eval-dataset.test.mjs` threshold-match assertions.

**Anti-drift discipline (load-bearing, State-of-the-Art note 19-RESEARCH.md line 477):** the lock-rule prose numbers MUST match `EVAL_THRESHOLDS` byte-for-byte (lock-rule lines 9-13, 28). The re-registration replaces the legacy `DELTA_UPPER_MAX = 0.25` scalar (lock-rule line 37, `lz-eval-aggregate.mjs:75`) with the pooled-n `clopperPearsonUpper(1, N_pooled, ALPHA)` FORMULA at the realized n (~0.05 at N=60-100). Update `EVAL_THRESHOLDS` + the lock-rule table IN LOCKSTEP (the code wins; the doc mirrors it).

**Pre-registration timing (CRITICAL):** re-register in the legitimate ZERO-VOTES window, BEFORE any vote (EVAL-04; Security Domain "Result-shopping" mitigation, 19-RESEARCH.md line 593). Lock the trap-construction rules + mechanical search-minimums in the SAME pre-registration.

**Test extension:** add a threshold-match / formula-ceiling assertion that the realized CP(1,N) value at the locked N matches the lock-rule's recorded ceiling (mirror the `clopperPearsonUpper` anchor tests already in `lz-eval-aggregate.test.mjs`; the existing engine exports `clopperPearsonUpper`, `passAtK`, `passHatK`, `countFalseUpholds`, `lockRuleVerdict` -- all frozen, consumed not rewritten).

---

### worker-output round-trip fixture (test fixture, file-I/O)

**Analog:** `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` (the `fx()` run-dir fixtures + the `aggregate(fx('...'))` round-trip assertions).

**Fixture + assertion pattern** (`lz-deep-research-aggregate.test.mjs` lines 30-87):
```javascript
import { aggregate, normalize, CEILINGS, listJson, safeId } from './lz-deep-research-aggregate.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const fx = (name) => path.join(HERE, '__fixtures__', name);

test('worker output round-trips through the frozen aggregator', () => {
  const r = aggregate(fx('worker-output-roundtrip'));
  assert.equal(r.dropped.length, 0);
  assert.ok(r.survivors.some((s) => s.quote_fidelity === 'verified'));
});
```
Build a `__fixtures__/worker-output-roundtrip/` run dir containing `claims/<worker-id>.json`, `excerpts/<excerpt-id>.txt`, `sources/<sha>.json` shaped EXACTLY as the extract worker emits them, and assert the FROZEN `aggregate()` accepts it (PIPE-04/05, AGG-03). This proves the producer-output contract without touching the frozen aggregator. The fixture lives test-file-relative (NEVER `process.cwd()` -- T-16-05 / cwd drifts under worktrees + headless `claude -p`).

## Shared Patterns

### Least-privilege worker frontmatter
**Source:** `plugins/lz-advisor/agents/research-verify-voter-sonnet.md` lines 45-50; `research-verify-voter-haiku.md` lines 38-43.
**Apply to:** both new agent files.
```yaml
model: sonnet          # search worker: cheap-tier per the gate outcome; extract worker: fixed sonnet
color: green           # pick a distinct color per agent
effort: medium
tools: ["WebSearch", "Write"]   # search worker; extract worker: ["WebFetch", "Write"]
maxTurns: 4
```
Plus: third-person `description` with `<example>` blocks and the "not intended for direct user invocation" close (lines 9-10). No `Read`, no `Bash`.

### ContractError / safeId / stripBom / createHash cross-tree reuse
**Source:** `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` lines 128-209 (the primitives); imported in `eval/lz-eval-dataset.mjs` lines 44-48 and `eval/lz-eval-aggregate.mjs` lines 39-44.
**Apply to:** every new eval-tree `.mjs` (`lz-eval-search-loop.mjs`, `lz-eval-traps.mjs`).
```javascript
import { ContractError, stripBom, safeId } from
  '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';
```
One-directional (eval -> runtime, NEVER reverse). Never duplicate these; never `import` an eval module from the plugin tree.

### Fail-closed `readJson` (no bare JSON.parse on untrusted data)
**Source:** `eval/lz-eval-dataset.mjs` lines 172-188 (identical at `eval/lz-eval-aggregate.mjs` lines 147-163 and `lz-deep-research-aggregate.mjs` lines 167-181).
**Apply to:** any new eval module that reads JSON (the trap recipe reading the KS/manifest).

### Guarded CLI tail (import-safe module)
**Source:** `eval/lz-eval-dataset.mjs` lines 364-384; `eval/lz-eval-aggregate.mjs` lines 264-288.
**Apply to:** `lz-eval-search-loop.mjs`, `lz-eval-traps.mjs`.
```javascript
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try { /* ...; process.exit(0); */ }
  catch (err) {
    const where = err && err.file ? ' (' + err.file + ')' : '';
    console.error('lz-eval-...: ' + (err && err.message ? err.message : String(err)) + where);
    process.exit(2);
  }
}
/* node:coverage enable */
```

### node:test FILE-form + test-file-relative fixtures (HOST QUIRK)
**Source:** `eval/lz-eval-dataset.test.mjs` lines 30-59; `lz-deep-research-aggregate.test.mjs` lines 14-35.
**Apply to:** all new + extended `.test.mjs`.
- Run via `node --test eval/<file>.test.mjs` (explicit FILE form). NEVER `node --test <dir>` (spurious exit 1 on this host).
- Resolve fixtures with `path.dirname(fileURLToPath(import.meta.url))`, NEVER `process.cwd()`.
- Use `node:assert/strict`; every behavior test is DISCRIMINATING (proves the flip), with a third `assert.throws` predicate arg checking `err.name === 'ContractError'` + a message regex.

### Object.freeze frozen-constant + anti-drift
**Source:** `eval/lz-eval-aggregate.mjs` lines 69-81 (`EVAL_THRESHOLDS`); `eval/lz-eval-dataset.mjs` lines 55-59 (`STRATA_FRACTIONS`).
**Apply to:** the search-minimum / denylist constants in `lz-eval-search-loop.mjs`, and the re-registered lock-rule ceiling. Doc and code mirror each other byte-for-byte; the code wins.

## No Analog Found

None. Every Phase-19 file has a strong in-repo analog (the phase is ~80% consumption of frozen contracts). The one genuinely-open surface -- trap-set CONSTRUCTION METHODOLOGY (which seeds, which strata, the saturation calibration) -- is a research/judgment surface, not a code-pattern surface; its plumbing (`lz-eval-traps.mjs`) still copies `lz-eval-dataset.mjs`. The methodology itself is specified in 19-RESEARCH.md "The Trap-Set Construction Methodology" (lines 319-360), not derivable from a code analog.

## Metadata

**Analog search scope:** `plugins/lz-advisor/agents/`, `plugins/lz-advisor/skills/lz-deep-research/scripts/`, `plugins/lz-advisor/references/`, `eval/`, `eval/__fixtures__/`.
**Files scanned (read in full or targeted):** `research-verify-voter-sonnet.md`, `research-verify-voter-haiku.md`, `lz-eval-dataset.mjs`, `lz-eval-aggregate.mjs`, `lz-deep-research-aggregate.mjs`, `lz-deep-research-schema.md`, `lz-eval-lock-rule.md`, `lz-eval-dataset.test.mjs`, `lz-deep-research-aggregate.test.mjs` (head), `lz-eval-manifest.json` (head), `eval/package.json`, agents dir listing.
**Two-tree boundary confirmed:** plugin tree zero-dep (only `node:*` + cross-tree primitive reuse); eval tree owns `eval/package.json` (`jstat@1.9.6`, `private`, `UNLICENSED`, never ships).
**Pattern extraction date:** 2026-06-16
