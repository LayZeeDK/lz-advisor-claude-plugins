# Phase 18: Haiku prompt-engineering deep research + verify-voter + early gating eval - Pattern Map

**Mapped:** 2026-06-16 (REGENERATED for the 2026-06-16 zero-dep AMENDMENT -- supersedes the prior PATTERNS.md)
**Files analyzed:** 11 new + 2 modified
**Analogs found:** 13 / 13 (every new/modified file has a strong in-repo analog)

> **REGENERATED 2026-06-16 (owner-directed AMENDMENT; supersedes the prior `18-PATTERNS.md`).**
> The prior map placed every eval artifact under the plugin tree
> (`plugins/lz-advisor/skills/lz-deep-research/scripts/lz-eval-*.mjs`) and treated a hand-rolled
> Clopper-Pearson (`logGamma`/`incbeta`/`betaInv`) as a binding pattern. BOTH are now WRONG. Per the
> amended CONTEXT.md (D-01b/D-07/D-10/D-11) + refreshed RESEARCH.md: (a) the EVAL scripts MOVE to a
> repo-level `eval/` dir OUTSIDE `plugins/` with their own `package.json` + committed lockfile +
> gitignored `node_modules`; (b) the CI statistics MUST be computed by the pinned `jstat@1.9.6`
> library -- hand-rolling the math is FORBIDDEN; (c) the existing Phase-16 `SC-2 zero-dependency
> contract` test is RE-SCOPED (in-scope edit) from a repo-root walk to a plugin-tree assertion; (d) a
> NEW eval-only packaging-boundary test (D-11) is added; (e) the eval scripts import the SHIPPED
> runtime aggregator's hardening primitives ACROSS trees by relative path (eval -> runtime, never the
> reverse). The SHIPPED runtime aggregator + the two voter agents + the `references/` docs STAY in the
> plugin tree, strictly zero-dep, unchanged. When this body conflicts with the amended CONTEXT,
> CONTEXT wins.

This is a green-field-WITHIN-an-established-codebase phase: every new artifact is a NEW instance of an
EXISTING shape in this exact plugin. The single capability with no prior in-repo analog is the
HuggingFace fetch (now done via the `hf` CLI, not a hand-rolled `fetch`) and the library-computed CI
math (now a thin wrapper over `jstat`, not a hand-rolled special function). Treat the analogs below as
the literal STRUCTURE/hardening templates to copy: `ContractError`, `safeId`, `stripBom`/`readJson`,
sorted `listJson`, the guarded thin CLI, frozen `Object.freeze` constants, the explicit-`.test.mjs`
file-form gate, discriminating fixtures, the committed per-file `__fixtures__` layout, the three Opus
agent files, the `references/*.md` anti-drift house style, and the `.gitignore` comment-then-glob style.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `plugins/lz-advisor/references/lz-haiku-prompt-engineering.md` (EVAL-05; SHIPS) | reference doc | transform (research -> prose contract) | `references/lz-deep-research-schema.md` (+ `verify-target-selection.md`) | role-match (house-style) |
| `plugins/lz-advisor/agents/research-verify-voter-sonnet.md` (D-09; SHIPS, ship default) | agent | request-response (one isolated vote) | `agents/advisor.md` (+ `reviewer.md` output-contract shape) | exact (agent frontmatter + output contract) |
| `plugins/lz-advisor/agents/research-verify-voter-haiku.md` (D-08/D-09; SHIPS, behind flag) | agent | request-response (one isolated vote) | `agents/research-verify-voter-sonnet.md` (its sibling) + `agents/advisor.md` | exact |
| `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` (MODIFIED -- re-scope SC-2) | test | unit | itself (in-place edit of the SC-2 test, lines 677-719) | exact (in-scope edit) |
| `eval/package.json` (NEW; D-10/D-11) | config | n/a (package manifest) | NONE in-repo (first install surface) -- shape from RESEARCH | no-analog (new install surface) |
| `eval/package-lock.json` (NEW; D-10/D-11, COMMITTED) | config | n/a (lockfile) | NONE in-repo | no-analog (npm-generated) |
| `eval/lz-eval-aggregate.mjs` (EVAL-02/04, D-06/D-07) | utility (script) | batch / transform (off-model reduce + CI math) | `scripts/lz-deep-research-aggregate.mjs` (structure) + `jstat` (math) | role-match (cross-tree import; math via library) |
| `eval/lz-eval-aggregate.test.mjs` (NEW) | test | unit | `scripts/lz-deep-research-aggregate.test.mjs` | exact (structure); anchors are new |
| `eval/lz-eval-dataset.mjs` (EVAL-01, D-04) | utility (loader) | file-I/O + network (hf CLI fetch + sha256) | `scripts/lz-deep-research-aggregate.mjs` (IO/hardening half only) | role-match (no fetch analog; uses `hf` CLI) |
| `eval/lz-eval-dataset.test.mjs` (NEW) | test | unit | `scripts/lz-deep-research-aggregate.test.mjs` | exact (structure) |
| `eval/lz-eval-packaging-boundary.test.mjs` (NEW; D-11) | test | unit | `scripts/lz-deep-research-aggregate.test.mjs:677-719` (the SC-2 walk, inverted to the plugin tree) | role-match (asserts boundary from the eval side) |
| `eval/lz-eval-lock-rule.md` (EVAL-04; committed BEFORE the run) | reference/spec doc | transform (pre-registered thresholds) | `references/lz-deep-research-schema.md` (anti-drift house style) | role-match (house-style) |
| `eval/__fixtures__/lz-eval-manifest.json` + `wice-vendored/` + `NOTICE` (D-04, COMMITTED) | config / fixture (committed data) | file-I/O | `scripts/__fixtures__/<case>/{claims,excerpts,votes}/` per-file tree | exact (layout) |
| `.gitignore` (MODIFIED -- add `/eval/.cache/` + `/eval/node_modules/`) | config | file-I/O | `.gitignore` existing "Eval pipeline outputs" comment-then-glob block | exact |
| `.github/workflows/ci.yml` (CANDIDATE edit -- extend the test glob to `eval/`) | config (CI) | n/a | `ci.yml:24-29` existing `node --test ... "plugins/lz-advisor/skills/**/*.test.mjs"` | exact (flagged for planner) |

**Tree boundary (D-10/D-11 -- the load-bearing change vs the prior map):**
- SHIPS (plugin tree, strictly zero-dep, `node:`/`./`/`../` imports only): the two voter agents, the
  EVAL-05 reference doc, the EXISTING runtime aggregator + its (re-scoped) test.
- NEVER SHIPS (repo-level `eval/`, may use the pinned `jstat`): the two eval scripts + their tests, the
  packaging-boundary test, `package.json`/`package-lock.json`, the manifest + vendored WiCE + cache,
  the lock rule.

## Pattern Assignments

### `eval/lz-eval-aggregate.mjs` (utility, batch/transform) -- THE primary structure analog

**Analog (STRUCTURE):** `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs`
(frozen, 30+ fixtures). RESEARCH Pattern 5 makes this a HARD convention: "The new `eval/lz-eval-*.mjs`
scripts MUST inherit the proven patterns."
**Analog (MATH):** the pinned `jstat@1.9.6` library (NOT a hand-rolled special function -- D-07).

**Imports -- cross-tree + library (the changed pattern).** The runtime aggregator imports only `node:*`
(`lz-deep-research-aggregate.mjs:22-24`):
```javascript
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
```
The eval aggregator ADDS two import classes the runtime one never has (RESEARCH Pattern 1 + Pattern 2):
```javascript
// (1) the pinned stats library -- ONLY allowed under eval/ (D-07; jstat 1.9.6 default export shape):
import jStatPkg from 'jstat';
const { jStat } = jStatPkg;

// (2) cross-tree reuse of the SHIPPED runtime aggregator's hardening primitives (D-10; eval -> runtime,
//     one-directional, never runtime -> eval). From eval/ to the plugin tree: up one level, then in.
import {
  safeId, listJson, ContractError, stripBom,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';
```
NEVER import `jstat` from any plugin-tree file (D-11 / Anti-Pattern). The relative-import depth from
`eval/lz-eval-aggregate.mjs` to the runtime aggregator is exactly `../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs`.

**Library-computed CI math (REPLACES the prior hand-rolled exception -- D-07).** Wrap the library; do
NOT re-derive. The exported wrappers (RESEARCH Pattern 2) are the only new functions on top of the
analog's structure:
```javascript
// Clopper-Pearson UPPER bound = Beta^{-1}(1 - alpha/2 ; x + 1, n - x). x = false-uphold count, n = trials.
function clopperPearsonUpper(x, n, alpha = 0.05) {
  if (n === 0) return 1;
  if (x === n) return 1;                              // CP(n,n) = 1
  return jStat.beta.inv(1 - alpha / 2, x + 1, n - x);
}
// Pass@k / pass^k via the library's combinatorics (prefer over a hand-rolled comb -- D-07):
function passAtK(n, c, k)  { return n < k ? NaN : 1 - jStat.combination(n - c, k) / jStat.combination(n, k); }
function passHatK(n, c, k) { return n < k ? NaN : jStat.combination(c, k) / jStat.combination(n, k); }
```
There is NO `logGamma`/`incbeta`/`betaInv`/hand-coded Clopper-Pearson/Wilson/`comb` to paste. The SUBTLE
gate quantity is the Haiku-MINUS-Sonnet DELTA on the shared SUBTLE pool, routed through
`jStat.beta.inv` (the per-tier vs paired-Beta-Bernoulli combination is Claude's Discretion, D-07).

**Frozen named-constants block** (copy the `CEILINGS` shape, `lz-deep-research-aggregate.mjs:115-121`):
```javascript
export const CEILINGS = Object.freeze({
  ANGLES: 5,
  MAX_FETCH: 15,
  MAX_VERIFY_CLAIMS: 24,
  VOTES_PER_CLAIM: 3,
  SYNTH_CAP: 20,
});
```
The eval analog is a frozen `Object.freeze({ ... })` of eval thresholds turned CONCRETE (the prose `~`
in decisions becomes integers here): `ALPHA: 0.05`, `RELIABLE_TRIALS: 15`, `MIN_K: 5`, the
escalation-kill fraction band, the strata fractions. The lock-rule numbers in `eval/lz-eval-lock-rule.md`
MUST match this object byte-for-byte (anti-drift, see that file's assignment). The test asserts
`Object.isFrozen(...)` (analog test `lz-deep-research-aggregate.test.mjs:568` region).

**Fail-closed IO + ContractError (REUSE via cross-tree import, do NOT fork).** The runtime aggregator
EXPORTS `ContractError`, `stripBom`, `safeId`, `listJson` (`lz-deep-research-aggregate.mjs:128-209`):
```javascript
export class ContractError extends Error {
  constructor(message, file) { super(message); this.name = 'ContractError'; this.file = file; }
}
export function stripBom(s) { return typeof s === 'string' && s.charCodeAt(0) === 0xfeff ? s.slice(1) : s; }
export function safeId(id, file) { /* path-traversal + Windows reserved-name guard, lines 149-163 */ }
export function listJson(dir, readdir = fs.readdirSync) { /* sorted *.json listing, lines 192-209 */ }
```
The eval aggregator imports these (Pattern 1) rather than re-implementing them. `readJson`
(`:167-181`) is module-private in the analog -- the eval scripts EITHER copy the verbatim 14-line
`readJson` shape OR re-export it from the runtime aggregator if the planner adds an export. Untrusted
downloaded JSONL (RESEARCH Security V5) MUST route every parse through a `ContractError`-on-failure
`readJson`, never a bare `JSON.parse`.

**Sorted-listing determinism + injectable `readdir` seam** (`lz-deep-research-aggregate.mjs:192-209`):
`listJson(dir, readdir = fs.readdirSync)` is injectable SO `.sort()` determinism can be proven
host-independently (manifest example order, per-stratum counting must be reproducible). Reuse via the
cross-tree import.

**Guarded thin CLI -- import does NOT run the CLI** (copy verbatim, `lz-deep-research-aggregate.mjs:721-741`):
```javascript
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  // ... single positional arg; exit 0 on success, 2 on ContractError ...
}
/* node:coverage enable */
```
Pure exported functions ABOVE the guard so the `.test.mjs` imports them without invoking the CLI.

---

### `eval/lz-eval-dataset.mjs` (utility/loader, file-I/O + network)

**Analog (IO/hardening HALF):** `lz-deep-research-aggregate.mjs` via the cross-tree import (Pattern 1):
`ContractError`, `safeId`, `stripBom`, sorted listing, guarded CLI, frozen constants.
**Analog (FETCH HALF):** there is NO in-repo network analog. The fetch is now the `hf` CLI
(RESEARCH Pattern 3), NOT a hand-rolled `fetch` + 307 chase (the prior map's verbatim `fetchPinned`
snippet is REPLACED):
```bash
# Pinned, selective, integrity-checked fetch into the gitignored eval cache (eval-time TOOL dep, D-01b):
hf download chenxwh/AVeriTeC --repo-type dataset \
  --revision <pinned-sha> --include "<ks-glob>" \
  --local-dir eval/.cache/chenxwh__AVeriTeC
```
The loader shells out to `hf download` (handles gated auth via `HF_TOKEN` env -> `HF_TOKEN_PATH` ->
`HF_HOME/token`, LFS, `--include`, `--revision`), then computes sha256 ITSELF and verifies against the
committed manifest, failing CLOSED on mismatch (RESEARCH Pattern 3; the ONLY integrity primitive that
is in-repo Node):
```javascript
import { createHash } from 'node:crypto';
const got = createHash('sha256').update(buf).digest('hex');
if (got !== expectedSha) {
  throw new ContractError('checksum mismatch for ' + id + '/' + file + ': expected ' + expectedSha + ' got ' + got, file);
}
```
**Gated-401 path (RESEARCH Pitfall 2):** pre-flight token presence before the open-book/stress stages;
surface an actionable "set HF_TOKEN / run `hf auth login` (this dataset is gated; accept its terms on
the HF page first)" message and exit non-zero -- NEVER retry as transient. The WiCE spine is ungated,
so the closed-book SUBTLE gate runs without a token.

**Label remap (RESEARCH Pattern 4; VERIFIED WiCE enum):** `supported -> expected_verdict: unrefuted`;
`partially_supported -> refuted` (the SUBTLE substratum); `not_supported -> refuted`. The remap target
enum is the FROZEN `verdict` enum (see Shared Patterns -- Frozen vote-record contract), not a new one.
The false-uphold trap on SUBTLE = a voter returning `unrefuted` on a `partially_supported` claim.

---

### `eval/lz-eval-aggregate.test.mjs` and `eval/lz-eval-dataset.test.mjs` (test, unit)

**Analog:** `scripts/lz-deep-research-aggregate.test.mjs` (exact -- structure, hardening, host-quirk).

**Imports + host-quirk header** (copy the structure, `lz-deep-research-aggregate.test.mjs:23-35`):
```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { /* exports under test */ } from './lz-eval-aggregate.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const fx = (name) => path.join(HERE, '__fixtures__', name);
```
COPY the load-bearing host-quirk comment block (`lz-deep-research-aggregate.test.mjs:14-18`): the phase
gate MUST use the explicit `.test.mjs` FILE form; `node --test <dir>` spuriously exits 1 on this host
(D-10, memory `node-test-dir-exit1-quirk`). RESEARCH Validation Architecture pins the quick-run command
to the explicit file path. The eval-aggregator test ALSO imports the pinned `jstat` transitively (via
the script under test), so `eval/node_modules/` must be restored (`cd eval && npm install`) before it
runs.

**Fixture resolution** (`lz-deep-research-aggregate.test.mjs:32-35`): resolve `__fixtures__`
test-file-relative via `fileURLToPath(import.meta.url)`, NEVER `process.cwd()` (cwd drifts under GSD
worktrees / headless `claude -p`).

**Numeric-anchor tests for the CI math (the changed assertion target -- D-07).** The fixture asserts
ONLY that the LIBRARY IS WIRED, NOT that a hand-rolled implementation is numerically correct. Mirror
the value-pinning style (analog line 569 region, e.g. `assert.equal(CEILINGS.MAX_VERIFY_CLAIMS, 24)`)
against the verified anchors:
```
clopperPearsonUpper(0, 15, 0.05) ~= 0.218   (verified 0.2180194)
jStat.beta.inv(0.2, 3, 3)        ~= 0.327   (verified 0.3265979)
jStat.beta.inv(0.4, 1, 6)        ~= 0.082   (verified 0.0816141)
clopperPearsonUpper(15, 15)       = 1
jStat.combination(15, 3)          = 455
```
Use `assert.ok(Math.abs(got - expected) < 1e-3)` for the float anchors and `assert.equal(...)` for the
exact ones (CP(n,n)=1, combination=455). Do NOT re-derive the special function in the test.

**Discriminating-fixture discipline (memory `fixture-must-discriminate-ordering`, Phase 17 CR-01).**
The analog's precondition-guard pattern (`lz-deep-research-aggregate.test.mjs:74-87`) and the
contested-split ordering guard (`:156-165` region) are the template. For the eval, mirror this for the
false-uphold counter, the label remap, and the DELTA: build a vote-dir fixture where a `refuted`-gold
claim called `unrefuted` IS counted as a false-uphold, AND a sibling fixture where it is NOT, so the
counter genuinely flips. A `partially_supported -> refuted` remap test must prove the remap actually
flips, not pass tautologically (RESEARCH Pitfall 3 -- the saturated/non-discriminating gate is the
exact prior-phase failure pattern).

**Throwaway temp-dir + try/finally cleanup** (copy the `os.tmpdir()` + `mkdtempSync` + `try { ... }
finally { fs.rmSync(runDir, { recursive: true, force: true }); }` pattern, e.g.
`lz-deep-research-aggregate.test.mjs:732-769`): runtime/bad inputs (a wrong-sha fixture, a mocked-401
response) are written to `os.tmpdir()`, NEVER into the committed `__fixtures__` tree. The
fail-closed assertion shape is the analog's `assert.throws(() => ..., (err) => err.name ===
'ContractError')` + `caught.file.endsWith(...)` (`:755-766`): the dataset test asserts
`/checksum mismatch/` and the specific gated-401 HF_TOKEN error this way.

---

### `agents/research-verify-voter-sonnet.md` and `agents/research-verify-voter-haiku.md` (agent, request-response; SHIP, plugin tree, zero-dep)

**Analog:** `agents/advisor.md` for frontmatter + visibility/trust + output-contract discipline;
`agents/reviewer.md` for the exact-machine-parsed output-header contract shape. The two new files are
siblings: the Haiku one is engineered FROM the EVAL-05 reference (D-08), NOT a model-swapped copy of the
Sonnet prompt.

**Frontmatter pattern** (`agents/advisor.md:1-46`; all three existing agents share the shape):
```yaml
---
name: <kebab-case>
description: |
  Use this agent when ...        # third person; <example> blocks with <commentary>
  <example>
  Context: ...
  user: "..."
  assistant: "..."
  <commentary>...</commentary>
  </example>
model: opus
color: magenta
effort: high
tools: ["Read", "Glob"]
maxTurns: 3
---
```
Voter-specific deltas (RESEARCH "Voter agent structure"):
- `model: sonnet` (sonnet file) / `model: haiku` (haiku file) -- the ONLY load-bearing capability
  difference; same dataset + grader so the eval measures MODEL, not prompt (D-08).
- `tools`: `["WebSearch", "WebFetch", "Write"]` for the open-book arm, `["Write"]` for the closed-book
  control. The existing agents use `["Read", "Glob"]` and NEVER Write -- voters DO write the vote file,
  so the grant differs by design (least-privilege per arm). Open-book retrieval is restricted to the
  AVeriTeC revised KS (2024-11-15) + per-claim date cutoff, never live web (D-05).
- `color`: pick two colors not already used (existing: magenta `advisor` / cyan `reviewer` / yellow
  `security-reviewer`).
- Keep `maxTurns` bounded and an `effort` value (RESEARCH H10 bounded-reasoning; Haiku "excels at
  focused, bounded tasks").

**Output-contract discipline.** The existing agents pin an EXACT machine-parsed output shape: the
advisor's `## Output Constraint` "Begin your response with `1.`" (`advisor.md:51-56`), and the
reviewer's literal-header contract "Emit them exactly as shown ... A severity section with no findings
still emits its header followed by a single literal `(none)` line" (`reviewer.md:53`). The voter's
analog is the FROZEN vote JSON -- emit EXACTLY:
```json
{ "verdict": "unrefuted",
  "attack_mode": "scope-causality-overclaim",
  "disconfirming_query": "evidence that X does NOT reduce Y",
  "source_independence_note": "3 hits, 1 canonical source (syndicated) -> counts as 1" }
```
`verdict` is the frozen consumed core (`unrefuted` | `refuted`); the envelope is additive-only
(schema D-09/D-10, see Shared Patterns). Use the advisor's `### Density example` few-shot pattern
(`advisor.md:86-100`) to give the voter 3-5 examples INCLUDING disconfirming ones (RESEARCH H2): a
`partially_supported` claim correctly returned `refuted` with the negation search shown.

**Haiku-prompt corrections to APPLY (vs the existing Opus agents' style).** The existing agents use
some aggressive `MUST`/`NEVER` framing (e.g. `reviewer.md:53` "Do NOT paraphrase", `advisor.md` "MUST
begin") that is fine at Opus but OVERTRIGGERS at the 4.6-era Haiku. The Haiku voter MUST use plain
phrasing ("Use ... when ...", "Return `refuted` when ...") not `CRITICAL/MUST/NEVER` (RESEARCH H5/H6/H11
+ State of the Art table). NO `budget_tokens`, NO prefill (both stale -- RESEARCH State of the Art).
These corrections come from the EVAL-05 reference (authored BEFORE the Haiku agent, D-08).

---

### `plugins/lz-advisor/references/lz-haiku-prompt-engineering.md` (EVAL-05; SHIPS) and `eval/lz-eval-lock-rule.md` (EVAL-04; eval tree)

**Analog:** `references/lz-deep-research-schema.md` (the canonical-home, copy-from-code, anti-drift
house style) and `references/verify-target-selection.md` (the "single source of truth for X; both
consumers reference this file" framing).

**House-style opener** (`lz-deep-research-schema.md:1-27`, `verify-target-selection.md:1-12`):
- Lead sentence: "This is the single source of truth for ..." naming what it freezes and WHO consumes
  it.
- Name downstream consumers explicitly (the schema names Phase 18/19/20 with WHAT each reads,
  `schema.md:12-22`).

**For `plugins/lz-advisor/references/lz-haiku-prompt-engineering.md` (SHIPS -- plugin tree, pure prose,
zero-dep):** each technique = WHAT / WHY-it-helps-a-cheap-model / VERIFIED-source, exactly the table
shape RESEARCH drafted (H1-H12). Open with the D-08 fairness framing: the Haiku prompt is engineered to
the SAME task contract as the Sonnet baseline (identical schema, dataset, grader), so the eval measures
MODEL capability, not prompt quality. Reference scripts via `${CLAUDE_PLUGIN_ROOT}` (schema.md:8).

**For `eval/lz-eval-lock-rule.md` (eval tree; NOT shipped):** state it is written BEFORE any model call
(EVAL-04); enumerate the EXACT thresholds (SUBTLE open-book false-uphold DELTA upper-CI ~0; cost gate
escalation > 40-50% kills Haiku; reliable=15 on PASS; raise-to-user on FAIL); state it is mechanically
enforced by `eval/lz-eval-aggregate.mjs`. Mirror the schema's anti-drift discipline (schema.md:29-53,
"the code is authoritative; the doc copies byte-for-byte") -- the lock rule's numbers MUST match the
aggregator's frozen `Object.freeze` constants. RESEARCH Open Q4 recommends this file live at
`eval/lz-eval-lock-rule.md` (eval infrastructure, not a user-facing reference); the planner picks.

---

### `eval/__fixtures__/lz-eval-manifest.json` + `wice-vendored/` + `NOTICE` (config/fixture; COMMITTED, eval tree)

**Analog:** the committed per-file fixture tree at
`scripts/__fixtures__/<case>/{claims,excerpts,votes}/`. A representative record is a single-line JSON
file (`near-duplicate-merged/claims/w1.json`):
```json
{"worker":"w1","source":"s1","claims":[{"id":"c1","text":"X reduces Y by 30%","quote":"X reduces Y by 30%","excerpt_id":"e1"}]}
```
and a vote file is one line (`near-duplicate-merged/votes/cluster0-0.json`): `{"verdict":"unrefuted"}`.
The eval fixtures follow the SAME immutable, per-file, committed layout, but under `eval/__fixtures__/`
(NOT the plugin tree). The manifest shape is RESEARCH Pattern 4: `schema_version`, `strata`, `sources`
(id / revision / files+sha256 / vendored / gated), `examples[]` (uid / source / source_label / stratum
/ book / expected_verdict). Vendored WiCE lands under `eval/__fixtures__/wice-vendored/` with a `NOTICE`
(D-04 ODC-BY/MIT attribution). NON-vendored corpora (LLM-AggreFact, AVeriTeC) are NEVER committed --
only the manifest's IDs + remapped labels + pinned revision + sha256 (D-04 license compliance).

---

### `eval/package.json` + `eval/package-lock.json` (NEW install surface; D-10/D-11) and `.gitignore` (MODIFIED)

**Analog:** NONE in-repo for the package files (this is the FIRST install surface the repo has ever
had -- the whole point of the amendment). Shape from RESEARCH Standard Stack:
- `eval/package.json`: `"name": "lz-eval"` (private), `"type": "module"`, the exact pin
  `"jstat": "1.9.6"` under `devDependencies` (add via `npm install --save-exact jstat@1.9.6`).
- `eval/package-lock.json`: COMMITTED (reproducible pin); npm-generated, do not hand-edit.
- First `npm install jstat@1.9.6` SHOULD be gated behind a `checkpoint:human-verify` task (confirm the
  pin + lockfile + MIT LICENSE file) per RESEARCH slopcheck note.

**`.gitignore` analog:** the existing "Eval pipeline outputs" comment-then-glob block (`.gitignore:8-9`):
```
# Eval pipeline outputs (regenerated on re-run)
evals/**/outputs/
```
Add in the SAME comment-then-glob style (RESEARCH ".gitignore additions"):
```
# Eval dataset cache (fetched at eval time; license-compliant local-only; never committed)
/eval/.cache/
# Eval dev dependencies (pinned in eval/package-lock.json; restored via `cd eval && npm install`; never shipped)
/eval/node_modules/
```
The committed manifest + vendored WiCE live IN the repo (under `eval/`); the fetched non-vendored text
and `node_modules` do NOT.

---

### `.github/workflows/ci.yml` (CANDIDATE edit -- FLAGGED for the planner)

**Analog:** the existing single test step (`ci.yml:24-29`):
```yaml
      - run: >-
          node --test --experimental-test-coverage
          --test-coverage-lines=97 --test-coverage-branches=89 --test-coverage-functions=100
          "plugins/lz-advisor/skills/**/*.test.mjs"
```
This glob MISSES `eval/**` (RESEARCH Open Q4). The eval tests need an `eval/` install step (`cd eval &&
npm install`) before running, and the eval-aggregator test imports `jstat`. The planner SHOULD either
extend CI to run the `eval/` tests (after the install) OR note them as a local-only gate. Flagged, not
prescribed -- CI shape is a planner decision.

## Shared Patterns

### Tree-boundary / packaging-boundary contract (D-10/D-11 -- the regeneration's load-bearing pattern)
**Source:** CONTEXT D-10/D-11 + RESEARCH Pattern 1 + Pitfall 1. The plugin tree
(`plugins/lz-advisor/`) stays strictly zero-dep: every `.mjs` there imports ONLY `node:*`/`./`/`../`,
and there is NO `package.json`/`node_modules` anywhere under it. The `eval/` tree is the ONLY install
surface: it carries the pinned `jstat`, a committed lockfile, and a gitignored `node_modules`. Imports
are ONE-DIRECTIONAL: `eval/*` MAY import the runtime aggregator; NO shipped runtime artifact may import
any `eval/` file. This is enforced from BOTH sides -- the re-scoped runtime SC-2 test (plugin side) and
the new `eval/lz-eval-packaging-boundary.test.mjs` (eval side).

### SC-2 re-scope (MODIFIED existing test -- in-scope Phase-16-test edit; RESEARCH Pitfall 1)
**Source:** `scripts/lz-deep-research-aggregate.test.mjs:677-719` (the EXISTING `SC-2 zero-dependency
contract` test). The current test (a) asserts the aggregator imports only `node:`/`./`/`../` (KEEP
verbatim, lines 681-691), and (b) walks UP from the scripts dir to the repo root asserting NO
`package.json` at any level (lines 693-718). Part (b) encodes a now-WRONG contract ("the repo has no
install surface") once `eval/package.json` lands. RE-SCOPE part (b):
- KEEP the import-spec assertion (lines 681-691) unchanged.
- REPLACE the repo-root `package.json` walk (lines 693-718) with: assert NO `package.json` and NO
  `node_modules` anywhere UNDER `plugins/lz-advisor/` (the distributed tree), instead of walking to the
  repo root.
This stays a plugin-tree test (lives in the existing test file, runs under the existing CI glob
`plugins/lz-advisor/skills/**/*.test.mjs`, stays zero-dep). State clearly in the plan: the SC-2
re-scope is a CHANGE to an EXISTING test; the packaging-boundary test below is a NEW eval-only check.

### Eval-side packaging-boundary check (NEW; D-11)
**Source:** the inverted SC-2 walk, run from `eval/`. `eval/lz-eval-packaging-boundary.test.mjs`
asserts (1) no `package.json`/`node_modules` anywhere under `plugins/lz-advisor/`, and (2) no shipped
runtime artifact imports any `eval/` script (scan the plugin tree for an `eval/` import spec; expect
zero). This test may use stdlib only (no `jstat` needed) and uses the explicit-`.test.mjs` file form.

### Fail-closed ContractError with `.file` (applies to eval aggregator + loader)
**Source:** `scripts/lz-deep-research-aggregate.mjs:128-181` (`ContractError`, `stripBom`, `readJson`,
`safeId`). Every parse / read / content-derived-basename path fails CLOSED and carries the offending
file; the CLI maps it to exit 2. Reuse via the cross-tree import (Pattern 1) rather than forking. The
loader's untrusted downloaded JSONL and the checksum-mismatch / gated-401 paths all route through this
(RESEARCH Security V5).

### Library-computed statistics, never hand-rolled (applies to the eval aggregator + its test -- D-07)
**Source:** CONTEXT D-07 (AMENDED) + RESEARCH Pattern 2 + "Don't Hand-Roll" table. ALL CI/interval and
special-function math comes from the pinned `jstat@1.9.6` (`jStat.beta.inv`, `jStat.normal.inv`,
`jStat.combination`). NO in-repo `logGamma`/`incbeta`/`betaInv`, NO hand-coded Clopper-Pearson / Wilson
/ Beta-Bernoulli, NO hand-rolled `comb`. The test asserts ONLY the verified anchors (the library is
wired), never re-derives the math. NEVER Wald/normal-approx CI or bootstrap (D-07; arXiv 2503.01747).

### Explicit `.test.mjs` FILE-form gate (applies to ALL test files, both trees)
**Source:** `scripts/lz-deep-research-aggregate.test.mjs:14-18` + memory `node-test-dir-exit1-quirk` +
CONTEXT D-10. NEVER `node --test <dir>`; gate on `node --test <explicit-file.test.mjs>` per file. The
eval-tree tests additionally require `eval/node_modules/` restored first (`cd eval && npm install`).

### Frozen vote-record contract (applies to BOTH voter agents + the eval aggregator's gold-label compare)
**Source:** `references/lz-deep-research-schema.md:184-223` ("The vote record"). `verdict` is
`"unrefuted" | "refuted"`, read by `tally` via `readJson(f).verdict`; missing/`null` -> `insufficient`.
The voters fill the reserved ADDITIVE envelope (`attack_mode`, `disconfirming_query`,
source-independence note, schema lines 210-218) WITHOUT changing `verdict`. The eval aggregator scores
`verdict` vs gold label only (grade outcomes, not steps -- D-09). The label remap target enum
(`unrefuted`/`refuted`) is THIS frozen enum, not a new one.

### Discriminating-fixture discipline (applies to BOTH new eval test files)
**Source:** memory `fixture-must-discriminate-ordering` + `scripts/lz-deep-research-aggregate.test.mjs:74-87`
(precondition guard) and `:156-165` region (the contested-split ordering guard). Every fixture must
genuinely exercise the behavior it claims (no tautology). For the SUBTLE stratum this is load-bearing:
RESEARCH Pitfall 3 (saturated/non-discriminating gate = the exact prior-phase failure). The
aggregator's false-uphold counter, the label remap, and the DELTA must each have a fixture that FAILS
if the logic is removed/swapped.

### ASCII-only output + `${CLAUDE_PLUGIN_ROOT}` references (applies to ALL new files)
**Source:** CLAUDE.md shell rules + `references/lz-deep-research-schema.md:8`. No emojis, em-dashes,
en-dashes, curly quotes, ellipsis, or box-drawing in any file (Windows cp1252; use `--`, `->`, `|--`,
`'--`). The aggregator writes a BOM only as the JS escape `\uFEFF` (source, `lz-deep-research-aggregate.mjs:16-17,69`)
/ `String.fromCharCode(0xFEFF)` (test, `:20-21,654`), never as a literal byte -- mirror this if the
loader/test must emit a BOM/CRLF byte sequence (generate at runtime under `os.tmpdir()`, never commit
it). SHIPPED docs reference scripts via `${CLAUDE_PLUGIN_ROOT}`.

## No Analog Found

Files / capabilities with no close in-repo match (planner should use RESEARCH patterns / library docs
instead of mining the codebase):

| File / capability | Role | Data Flow | Reason |
|-------------------|------|-----------|--------|
| `eval/package.json` + `eval/package-lock.json` | config | n/a | First install surface in the repo's history; the whole codebase was zero-dep until the amendment. Shape from RESEARCH Standard Stack; lockfile is npm-generated. |
| `eval/lz-eval-dataset.mjs` FETCH half | utility (loader) | network | No in-repo network-fetch analog; uses the `hf` CLI (eval-time TOOL dep, D-01b) + a `node:crypto` sha256 verify (RESEARCH Pattern 3). Its IO/hardening half DOES have an analog (the runtime aggregator, cross-tree import). |
| CI statistics (Clopper-Pearson / Wilson / Pass@k) | utility (math) | transform | New code, but a THIN wrapper over `jstat` (D-07), not a pattern to mine. The prior map's hand-rolled `logGamma`/`incbeta`/`betaInv` is FORBIDDEN and removed. |

Everything else is a new instance of an established in-repo shape (the runtime aggregator, its
`.test.mjs`, the committed `__fixtures__/` per-file layout, the three Opus agent files, the
`references/*.md` house style, the `.gitignore` block, the CI test step).

## Metadata

**Analog search scope:** `plugins/lz-advisor/agents/`, `plugins/lz-advisor/references/`,
`plugins/lz-advisor/skills/lz-deep-research/scripts/` (+ `__fixtures__/`), repo-root `.gitignore`,
`.github/workflows/ci.yml`.
**Files scanned:** 3 agent files (advisor, reviewer sampled), 5 reference docs (schema +
verify-target-selection opener sampled), the runtime aggregator (full) + its `.test.mjs` (header +
SC-2 + null-vote test), the committed `__fixtures__/` tree (one claims + one vote record sampled), the
schema vote-record + reserved-envelope section, `.gitignore`, `ci.yml`.
**Pattern extraction date:** 2026-06-16 (regeneration for the zero-dep AMENDMENT)

## PATTERN MAPPING COMPLETE

**Phase:** 18 - haiku-prompt-engineering-deep-research-verify-voter-early-ga
**Files classified:** 11 new + 2 modified (13 total; + 1 flagged CI candidate)
**Analogs found:** 13 / 13 (3 are role-match / no-analog for novel capabilities: the install surface,
the network fetch half, the library-computed math)

### Coverage
- Files with exact analog: 7 (the re-scoped SC-2 test, the two voter agents, the two eval `.test.mjs`,
  the committed `__fixtures__` layout, the `.gitignore` block)
- Files with role-match analog: 4 (the eval aggregator structure + library math, the loader IO half +
  hf-CLI fetch, the two reference/spec docs, the eval packaging-boundary test)
- Files with no analog: 2 (the `eval/` package + lockfile install surface; the loader's network-fetch
  half + the `jstat`-wrapped CI math both treated under role-match)

### Key Patterns Identified
- Tree boundary is the load-bearing change: the plugin tree stays strictly zero-dep (`node:`/`./`/`../`
  only, no `package.json`/`node_modules`); the new repo-level `eval/` dir is the ONLY install surface
  (pinned `jstat@1.9.6` + committed lockfile + gitignored `node_modules`), enforced from both sides.
- The CI/interval/Pass@k math is computed by the pinned `jstat` library (`jStat.beta.inv` /
  `jStat.combination`), NEVER hand-rolled; the test asserts only the five verified anchors to prove the
  wiring (0.218 / 0.327 / 0.082 / CP(n,n)=1 / combination(15,3)=455).
- The eval scripts reuse the SHIPPED runtime aggregator's hardening primitives (`ContractError`,
  `safeId`, `stripBom`, `listJson`) via a one-directional cross-tree relative import; they never fork
  them and the runtime never imports `eval/`.
- The existing Phase-16 `SC-2 zero-dependency contract` test is RE-SCOPED in place (in-scope edit) from
  a repo-root walk to a plugin-tree assertion; a NEW eval-only packaging-boundary test guards the same
  boundary from the eval side (D-11).

### File Created
`.planning/phases/18-haiku-prompt-engineering-deep-research-verify-voter-early-ga/18-PATTERNS.md`
(OVERWROTE the stale prior version).

### Ready for Planning
Pattern mapping complete and aligned to the amended CONTEXT.md (D-01b/D-07/D-10/D-11) + refreshed
RESEARCH.md. The planner can reference the analog files + line ranges directly in PLAN.md action steps.
