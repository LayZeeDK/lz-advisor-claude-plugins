# Phase 16: Deterministic off-model aggregator + validation fixture - Research

**Researched:** 2026-06-15
**Domain:** Zero-dependency Node ESM stdlib (file I/O, text normalization, `node:test`/`node:assert`) on Windows arm64 / Git Bash
**Confidence:** HIGH (spike-proven core + locked CONTEXT decisions; net-new guidance is Node stdlib mechanics verified against the running host)

## Summary

This phase is unusually well pre-researched: the spine, the verification anchor, the ceilings, the dedup approach, and the IO contract are ALREADY DECIDED in `16-CONTEXT.md` (D-01..D-16) and PROVEN in `plans/_spike/aggregate-spike.mjs` (spike A1, PASS). The job is to HARDEN the proven prototype into a production CLI + a committed `node:test` fixture, NOT to re-derive the design. Three behaviors extend the prototype: a three-way quote outcome (verified/downgraded/dropped), distinct-source corroboration counting, and in-code ceiling enforcement with observable counts. Everything else (the `norm`/`jaccard`/`quoteInExcerpt` core, the immutable per-worker merge, the tally rubric) transfers directly.

The net-new research is purely IMPLEMENTATION MECHANICS the existing docs do not spell out: how to structure a zero-dep `node:test` run, the exact CRLF/UTF-8/BOM normalization recipe, the cleanest deterministic three-way quote check, distinct-source corroboration as a `Set`, and observable ceiling caps. The host runs Node v24.13.0 (FNM-managed) where `node:test` and `node:assert` are fully stable with no experimental flag.

**Primary recommendation:** Refactor the spike's proven helpers into a pure-functions module (importable by the test), wrap them in a thin CLI that takes a positional `<run-dir>` and writes `survivors.json` + a deterministic stdout summary, extend the three named behaviors above, and lock all five SC-5 cases with `node --test` over committed `__fixtures__/<case>/` directories. This is a LOW-risk, high-leverage foundation phase.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Dedup / corroboration / rank / tally / quote re-check | Off-model Node script (`scripts/`) | - | Mechanizable; zero model tokens by design (ARCHITECTURE Pattern 2). The whole point is NO model reasoning over raw data. |
| Ceiling enforcement | Off-model Node script | - | Must be code-enforced, not model discretion (AGG-06, D-10). |
| Quote-vs-excerpt verbatim CONSISTENCY check | Off-model Node script | - | Deterministic, off-model, upstream of voting (VERIF-04, D-06). |
| Quote-vs-claim ENTAILMENT (does quote support claim) | (out of phase) verify-voter, Phase 18 | - | Model judgment; explicitly NOT the aggregator's job (self-anchor-rejection anti-pattern). Do NOT add to the script. |
| Validation fixture | `node:test` (Node stdlib) | - | Zero-dep, cross-platform; avoids the bash heredoc/CRLF hazards (D-13). |

## User Constraints (from CONTEXT.md)

### Locked Decisions

> Copied verbatim from `16-CONTEXT.md` `<decisions>`. These are LOCKED -- the planner MUST honor them and MUST NOT relitigate.

**CLI / IO contract (GA-1)**
- **D-01:** Invocation is a single positional argument: `node "<...>/scripts/lz-deep-research-aggregate.mjs" <run-dir>` where `<run-dir>` is the `.lz-research/<run-id>/` directory. No flags on the core path (keeps it to the A2-proven single named non-git `Bash(node:*)` call). Reference via `${CLAUDE_PLUGIN_ROOT}` at the skill layer; the script itself takes a plain path arg.
- **D-02:** The run dir uses three conventional IMMUTABLE subdirectories the script enumerates with `fs.readdirSync` + `path.join` (NO shell globbing): `claims/<worker-id>.json` (per-worker extract files), `excerpts/<excerpt-id>.txt` (immutable stored excerpts), `votes/<claim-or-cluster-id>-<seat>.json` (one file per claim x seat). This is exactly the spike A1 layout (`plans/_spike/run/{claims,excerpts,votes}`); the Phase 19 workers MUST write to it.
- **D-03:** Outputs are (a) `survivors.json` written into the run dir -- bounded, top <= SYNTH_CAP, verbatim evidence only; and (b) a bounded DETERMINISTIC stdout summary (counts: raw->clusters, merged, dropped-by-recheck, downgraded, capped-by-ceiling, survivors-by-confidence) that is the orchestrator's receipt -- raw source text NEVER returns through stdout. Exit NON-ZERO on contract violation (missing run dir, malformed worker file). Phase 17 FREEZES these exact shapes against this proven behavior (it does not invent them).

**Quote re-check outcome taxonomy + match strictness (GA-2)**
- **D-04:** Match strictness = the spike-proven normalized-substring test ONLY: lowercase, strip non-alphanumeric to spaces, number-word fold (`thirty`->`30`), drop the token `percent`, then `normalize(excerpt).includes(normalize(quote))`. Deterministic, zero-dep, explicit LF normalization. NO fuzzy / NO embedding matching.
- **D-05:** THREE-way outcome (extends the prototype's binary keep/drop so SC-5's two distinct cases are both expressible):
  - quote verbatim-present in its CITED excerpt (`excerpt_id`) -> **VERIFIED** (kept, full quote-fidelity assurance);
  - quote absent from its cited excerpt BUT verbatim-present in SOME OTHER stored excerpt -> **DOWNGRADED/FLAGGED** (real text, wrong attribution -- kept but quote-fidelity assurance lowered, NOT dropped);
  - quote absent from ALL stored excerpts -> **DROPPED** (fabricated/drifted).
- **D-06:** The re-check runs UPSTREAM of all vote-tally (VERIF-04, SC-3). Every drop/downgrade is OBSERVABLE in the stdout summary and the `survivors.json` / `dropped` record BEFORE any vote is considered. The aggregator guards verbatim CONSISTENCY only; claim-vs-quote ENTAILMENT (does the quote support the claim?) is the voter's job (Phase 18) and is reported as a SEPARATE assurance (frozen in Phase 17). See Pitfall 9.

**Dedup + corroboration / source independence (GA-3)**
- **D-07:** Dedup = number-word-normalized token-Jaccard at the spike-proven merge threshold (>= 0.6), BIASED toward UNDER-merging (keep separate when in doubt) so dissent is preserved and surfaced. Lexical-only; NO embedding/semantic dependency (zero-dep constraint; Pitfall 8; AGGX-01 deferred).
- **D-08:** Corroboration is counted by DISTINCT SOURCE (source id / canonical URL) via a Set -- NOT by raw claim count. A paraphrase pair tracing to ONE source counts as ONE corroboration; near-duplicate claims from DIFFERENT sources merge into one cluster with corroboration = distinct-source count. (Satisfies SC-5 "paraphrase pair NOT double-counted as independent" AND "near-duplicate pair merged"; this is where VERIF-03's source-independence principle is COMPUTED -- it is formalized as a contract in Phase 17 and the voter weighting lands in Phase 18.)
- **D-09:** The corroboration count is treated and labeled as a LOWER bound ("at least N near-duplicate sources"), never an exact independence count. The semantic-paraphrase under-merge residual is DOCUMENTED as a known limit (in code comments + the eventual report's phrasing), not solved with a new dependency. (Pitfall 8 residual; STATE.md Phase-16 watch item.)

**Ceiling enforcement semantics (GA-4)**
- **D-10:** The five named ceilings live in a SINGLE in-code constants block (single source of truth) and are ENFORCED by the script, not left to model discretion: `ANGLES ~5`, `MAX_FETCH = 15`, `MAX_VERIFY_CLAIMS ~24` (cap applied AFTER ranking), `VOTES_PER_CLAIM = 3` (seats beyond 3 ignored deterministically), `SYNTH_CAP ~20` (survivors output cap). (AGG-06, SC-4.)
- **D-11:** Over-ceiling input is CAPPED deterministically (keep top-N after ranking for the claim caps; ignore extra vote seats) and the cap action is RECORDED OBSERVABLY in the stdout summary (e.g. `capped: claims 31->24`). NO silent truncation (CLAUDE.md "no silent caps" / observability-as-contract).
- **D-12:** Ceilings are HARDCODED constants for this phase -- that is the enforced contract. An optional env/flag override (ARCHITECTURE.md "raise ceilings via config" for medium runs) is NOT required here; if a trivial override is wired it must override the SAME constants with defaults unchanged, otherwise it is deferred to the Phase 20 orchestrator.

**Validation fixture harness (GA-5)**
- **D-13:** Fixture runner = Node stdlib `node:test` + `node:assert`, run via `node --test`. Chosen over a bash `tests/*.sh` smoke script (avoids the Windows / Git-Bash heredoc/quoting/CRLF hazards) and over the prototype's inline `process.exit` assertions. Zero-dep, cross-platform.
- **D-14:** Co-locate everything under the skill: aggregator at `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs`; test at `.../scripts/lz-deep-research-aggregate.test.mjs`; committed fixture data under `.../scripts/__fixtures__/<case>/{claims,excerpts,votes}/`.
- **D-15:** The fixture asserts ALL FIVE load-bearing behaviors from SC-5, each a distinct committed case that PASSES: (1) fabricated quote dropped; (2) real-quote / wrong-passage DOWNGRADED (not dropped, not upheld); (3) paraphrase pair NOT double-counted as 2 independent sources; (4) near-duplicate pair merged; (5) named ceilings enforced (over-ceiling input capped, cap observable). These are REAL committed files authored fresh -- do NOT "reuse" or reference uncommitted fixtures (memory `project_phantom_smoke_fixtures`).
- **D-16:** Refactor the prototype into testable PURE functions (`normalize`, `jaccard`, `quoteOutcome`, `mergeClusters`/corroboration, `tally`, `enforceCeilings`) importable by the test, behind a thin CLI wrapper (parse arg -> read run dir -> run pipeline -> write `survivors.json` + print summary). This enables D-13 without the prototype's inline self-seeding.

### Claude's Discretion
- Exact stdout summary wording / formatting -- only constraint is "bounded + deterministic + counts observable".
- Whether to wire the optional ceiling env-override now vs defer to Phase 20 (D-12) -- planner/executor may add a trivial `LZ_DR_*` env override if it costs nothing; otherwise omit.
- Internal function names, file-split granularity, and whether `survivors.json` is pretty-printed (prototype used 2-space).
- Whether to keep a `dropped.json` / `ranked.json` intermediate on disk vs surfacing those only in the stdout summary (either satisfies observability).

### Deferred Ideas (OUT OF SCOPE)
- **Semantic / paraphrase dedup beyond number-word variance (AGGX-01)** -- v2-deferred. Lexical-only here; corroboration phrased as a lower bound. Do NOT add an embedding dependency.
- **Config-driven ceiling raising for medium runs** -- belongs to the Phase 20 orchestrator. Phase 16 hardcodes the named defaults.
- **In-flight concurrency / wave-batching ceiling (<=5 in-flight)** -- a skill/orchestrator concern (COST-03, Phase 20), NOT the aggregator.
- **Claim-vs-quote ENTAILMENT** -- the voter's job (Phase 18); frozen in Phase 17. The aggregator guards verbatim consistency only.
- **Crash-resumability beyond rerun-from-immutable-inputs (SCALE-03)** -- v2-deferred.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AGG-01 | All dedup/ranking/vote-tally/quote-re-check off-model in a deterministic Node script in `skills/lz-deep-research/scripts/` (zero model tokens, reproducible, auditable). | Spike A1 core (`mergeClaims`/`recheck`/`tally`) transfers directly; refactored to pure functions (D-16). Net-new guidance 1, 6. |
| AGG-02 | Zero external deps (Node stdlib only); CRLF/path-safe on Windows arm64 / Git Bash (explicit UTF-8 + LF, `path.join`, no shell globbing). | Net-new guidance 2 (exact CRLF/UTF-8/BOM recipe). No `package.json` exists (zero-dep confirmed). |
| AGG-04 | Aggregator covered by a validation fixture asserting load-bearing behaviors (the 5 SC-5 cases). | Net-new guidance 1 (`node:test` harness) + the 5 committed `__fixtures__` cases (D-15). Validation Architecture section maps each. |
| AGG-06 | Named ceilings enforced in code, not model discretion. | Net-new guidance 5 (cap-after-ranking + observable counts). D-10/D-11. |
| VERIF-04 | Each quote mechanically re-checked vs stored excerpt; failures dropped UPSTREAM of all voting. | Net-new guidance 3 (three-way outcome). Spike A1 PROVED the binary case; D-05 extends to downgrade. D-06 (upstream of voting). |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `node:fs` | stdlib (Node 24) | Read worker JSON + excerpt `.txt`; enumerate dirs (`readdirSync`); write `survivors.json` | Zero-dep mandate; spike A1 already uses it [VERIFIED: spike `aggregate-spike.mjs`] |
| `node:path` | stdlib (Node 24) | `path.join` for cross-platform addressing (no shell globbing) | AGG-02; Windows arm64 / Git Bash path safety [VERIFIED: spike] |
| `node:test` | stdlib, STABLE in Node 24 | Fixture runner via `node --test` | D-13; zero-dep, cross-platform; stable (no `--experimental`) [VERIFIED: host is Node v24.13.0, ran `node --version`] |
| `node:assert` (use `node:assert/strict`) | stdlib (Node 24) | Assertions inside the fixture | Pairs with `node:test`; strict mode avoids loose-equality surprises [ASSUMED -- standard pairing] |
| `node:url` | stdlib (Node 24) | `fileURLToPath(import.meta.url)` for ESM `__dirname` equivalent (test points at sibling `__fixtures__`) | Robust ESM self-location; replaces the spike's fragile `.pathname.replace(...)` regex [CITED: Node ESM docs pattern] |

### Supporting
None. The whole phase is Node stdlib by mandate. There is NO root `package.json` and none should be added (zero-dep is the contract; AGG-02, Out-of-Scope table). [VERIFIED: `ls package.json` returns nothing]

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `node:test` fixture | A `tests/*.sh` smoke script (the existing review-skill pattern) | REJECTED by D-13: bash heredoc/quoting/CRLF hazards on Git Bash (CLAUDE.md shell rules); wrong domain (text-parse word-budget gates, not a JSON aggregator). |
| `node:test` fixture | Inline `process.exit` assertions (the spike's current shape) | REJECTED by D-13/D-16: couples assertions to the CLI; the aggregator should be a pure importable lib + thin CLI so the test imports functions directly. |
| `import.meta.url` + `fileURLToPath` | The spike's `import.meta.url.pathname.replace(/^\/([A-Za-z]:)/, '$1')` regex | Use `fileURLToPath` -- the regex is a Windows drive-letter hack that is fragile and unnecessary; `node:url` does it correctly. |

**Installation:** None. `node` is FNM-managed on the host (v24.13.0). The script runs as `node "<abs-path>/lz-deep-research-aggregate.mjs" <run-dir>`; the fixture runs as `node --test` from the `scripts/` dir (or with an explicit path/glob).

**Version verification:** Host Node is **v24.13.0** [VERIFIED: ran `node --version` 2026-06-15]. `node:test` was stabilized in Node 20 (unflagged); in Node 24 it is fully stable -- no `--experimental-test-*` flags required for the features this fixture needs (`test`, `describe`, `it`, subtests, exit-code-on-failure). The published plugin should assume a modern Node; the script uses only long-stable stdlib APIs (`fs.readFileSync`, `fs.readdirSync`, `path.join`) that work back to Node 14+, so the only true floor is `node:test` itself (Node 18+ behind a flag; Node 20+ unflagged). Recommend documenting a **Node >= 20** floor for the test (the script alone needs only Node 14+).

## Package Legitimacy Audit

**Not applicable.** This phase installs ZERO external packages -- Node stdlib only, by hard constraint (AGG-02; Out-of-Scope: "Embedding / semantic-dedup runtime dependency -- violates the zero-external-dependency constraint"). There is no `package.json`, no `npm install`, no registry interaction. The slopcheck / registry-verification gate is moot. Any plan task that proposes adding a dependency (including a fuzzy-match or glob helper) is a constraint violation and must be rejected.

## Architecture Patterns

### System Architecture Diagram

```
  .lz-research/<run-id>/                 (positional <run-dir> arg, D-01)
        |
        |  claims/<worker-id>.json   excerpts/<excerpt-id>.txt   votes/<id>-<seat>.json
        |  (immutable, written once by Phase-19 workers; read-only here)
        v
  +------------------------------------------------------------------+
  | lz-deep-research-aggregate.mjs  (pure functions + thin CLI)      |
  |                                                                  |
  | 1. readWorkers()   fs.readdirSync(claims/) -> parse each JSON    |
  |        |             (UTF-8 + LF + BOM normalize on read)        |
  |        v                                                          |
  | 2. mergeClusters()  number-word-norm token-Jaccard >= 0.6,       |
  |        |             UNDER-merge bias; corroboration = Set       |
  |        |             of distinct source ids (D-07/D-08)          |
  |        v                                                          |
  | 3. quoteOutcome()   per member: normalize(quote) in              |
  |        |             normalize(cited excerpt)?                    |
  |        |               yes -> VERIFIED                            |
  |        |               no, but in SOME other excerpt -> DOWNGRADED|
  |        |               no anywhere -> DROPPED   (D-05)            |
  |        |             >>> runs UPSTREAM of tally (D-06) <<<        |
  |        v                                                          |
  | 4. enforceCeilings()  rank -> cap claims to MAX_VERIFY_CLAIMS;   |
  |        |               record cap counts (D-10/D-11)             |
  |        v                                                          |
  | 5. tally()          read <= VOTES_PER_CLAIM seats; rubric ->     |
  |        |             High/Medium/Low-Contested/Unsupported       |
  |        v                                                          |
  | 6. emit()           survivors.json (top <= SYNTH_CAP) +          |
  |                     deterministic stdout COUNTS summary          |
  +------------------------------------------------------------------+
        |                                   |
        v                                   v
  survivors.json (run dir)        stdout receipt (counts only;
  bounded, verbatim evidence      NO raw source text) -> orchestrator
```

File-to-function mapping: see Component Responsibilities below. The diagram shows DATA FLOW; the quote re-check (step 3) is deliberately UPSTREAM of the tally (step 5) per D-06/VERIF-04.

### Recommended Project Structure
```
plugins/lz-advisor/skills/lz-deep-research/scripts/
|-- lz-deep-research-aggregate.mjs        # pure functions + thin CLI (D-14, D-16)
|-- lz-deep-research-aggregate.test.mjs   # node:test fixture (D-13)
'-- __fixtures__/                          # committed fixture run-dirs (D-15)
    |-- fabricated-quote-dropped/{claims,excerpts,votes}/
    |-- wrong-passage-downgraded/{claims,excerpts,votes}/
    |-- paraphrase-one-source/{claims,excerpts,votes}/
    |-- near-duplicate-merged/{claims,excerpts,votes}/
    '-- ceilings-enforced/{claims,excerpts,votes}/
```
Note: a single fixture case CAN cover multiple behaviors (the spike's `run/` already proves near-dup-merge + fabricated-drop + corroborated-High together). The planner may choose 1 rich case + targeted cases, or 5 minimal cases -- D-15 requires each of the 5 behaviors be ASSERTED, not necessarily 5 separate directories. Separate directories are cleaner for diagnosing a single failure; recommend at least separating the three quote-outcome cases (verified/downgraded/dropped) so each maps to a named test.

### Pattern 1: Pure functions + thin CLI (D-16)
**What:** Export the deterministic helpers (`normalize`, `jaccard`, `quoteOutcome`, `mergeClusters`, `tally`, `enforceCeilings`, and a top-level `aggregate(runDir)`) from the `.mjs`; guard the CLI side-effects behind an `import.meta`-vs-`process.argv` check so importing the module in the test does NOT run the CLI.
**When to use:** Always here -- it is the mechanism that lets `node:test` import and assert the functions directly (replacing the spike's inline `process.exit`).
**Example:**
```js
// lz-deep-research-aggregate.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---- pure, exported, testable ----
export const NUMWORDS = { zero:'0', one:'1', two:'2', three:'3', four:'4', five:'5',
  six:'6', seven:'7', eight:'8', nine:'9', ten:'10', twenty:'20', thirty:'30',
  forty:'40', fifty:'50', hundred:'100' };

export function normalize(s) {
  return String(s)
    .replace(/^\uFEFF/, '')          // strip BOM
    .replace(/\r\n/g, '\n')          // CRLF -> LF
    .replace(/\r/g, '\n')            // lone CR -> LF
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .map(w => NUMWORDS[w] ?? w)
    .filter(w => w && w !== 'percent')
    .join(' ')
    .trim();
}

export const CEILINGS = Object.freeze({
  ANGLES: 5, MAX_FETCH: 15, MAX_VERIFY_CLAIMS: 24, VOTES_PER_CLAIM: 3, SYNTH_CAP: 20,
});

export function aggregate(runDir) { /* read -> merge -> recheck -> cap -> tally -> result */ }

// ---- thin CLI: only runs when invoked directly, NOT when imported ----
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const runDir = process.argv[2];
  if (!runDir || !fs.existsSync(runDir)) {
    console.error('lz-deep-research-aggregate: missing or invalid <run-dir>');
    process.exit(2);                 // contract violation -> non-zero (D-03)
  }
  const result = aggregate(runDir);
  fs.writeFileSync(path.join(runDir, 'survivors.json'), JSON.stringify(result.survivors, null, 2));
  console.log(result.summary);       // bounded deterministic COUNTS only (D-03)
}
```

### Pattern 2: Off-Model Deterministic Reduction (ARCHITECTURE Pattern 2 -- already adopted)
**What:** All dedup/rank/tally/quote-recheck are pure functions over on-disk files; zero model tokens. **When to use:** the entire script. **Trade-off:** lexical dedup under-merges semantic paraphrase beyond number/format variance -- documented as a known limit (D-09), NOT solved with a dependency.

### Anti-Patterns to Avoid
- **Self-anchor over-claim:** Do NOT make the script "verify a tool was called" or judge whether a quote SUPPORTS a claim (entailment). It verifies verbatim CONSISTENCY only (quote present in stored excerpt). Entailment is the Phase-18 voter's job. (ARCHITECTURE Anti-Pattern 2.)
- **Shell globbing for file enumeration:** Use `fs.readdirSync` + `.filter(f => f.endsWith('.json'))`, never a glob -- shell globbing is not portable on Git Bash and is forbidden by AGG-02.
- **Silent truncation at a ceiling:** every cap must surface a count in stdout (D-11). No silent drop.
- **Adding a `package.json` / any dependency:** zero-dep is the contract (AGG-02).
- **Trusting the spike's `import.meta.url.pathname.replace(...)` drive-letter regex:** replace with `fileURLToPath` (cleaner, correct on Windows).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ESM `__dirname` for locating sibling `__fixtures__` | A path-string regex hack (the spike's drive-letter `.replace`) | `fileURLToPath(import.meta.url)` + `path.dirname` | Stdlib does it correctly across Windows/Git Bash; the regex is fragile. |
| Test runner | A custom assert-and-`process.exit` script, or a bash harness | `node:test` + `node:assert/strict` via `node --test` | Stdlib runner gives TAP output, per-test isolation, and non-zero exit on failure for free (D-13). |
| Reading JSON files | A streaming/glob library | `fs.readdirSync` + `fs.readFileSync(p, 'utf8')` + `JSON.parse` | Zero-dep; deterministic; spike-proven. |
| Fuzzy/semantic matching | An embedding or fuzzy-match npm package | Number-word-normalized token-Jaccard (lexical) | Zero-dep mandate; AGGX-01 deferred; document the limit (D-09). |

**Key insight:** The deceptively-complex parts (the deterministic core, the quote re-check, the tally rubric) are ALREADY SOLVED in spike A1. The remaining work is wiring + three small extensions + the test harness -- all Node stdlib. Reaching for any external package here is a constraint violation, not a convenience.

## Net-New Implementation Guidance

> The six gaps the existing docs do not fully cover. Concrete Node recipes follow.

### 1. `node:test` + `node:assert` harness mechanics (zero-dep)

**Stability / version:** Host is Node **v24.13.0** [VERIFIED]. `node:test` is fully stable here -- run via `node --test`. No `--experimental` flag. The runner auto-discovers files matching `*.test.*` / `*.spec.*` (and files under `test/` dirs) when you pass a directory, OR you point it at a file. For this phase, the simplest invocation from the `scripts/` dir is `node --test` (discovers `lz-deep-research-aggregate.test.mjs`) or explicitly `node --test lz-deep-research-aggregate.test.mjs`.

**Exit-code behavior:** `node --test` exits **0** when all tests pass and **non-zero (1)** when any test/subtest fails or throws. This is the mechanical gate -- the fixture "PASSES" iff `node --test` exits 0. This is what the Validation Architecture section keys on.

**Importing pure functions:** Because the aggregator guards its CLI behind the `import.meta`/`argv` check (Pattern 1), the test does a plain ESM import and calls functions directly:
```js
// lz-deep-research-aggregate.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalize, jaccard, quoteOutcome, aggregate, CEILINGS } from './lz-deep-research-aggregate.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const fixture = (name) => path.join(HERE, '__fixtures__', name);

test('fabricated quote is DROPPED (upstream of voting)', () => {
  const r = aggregate(fixture('fabricated-quote-dropped'));
  assert.ok(r.dropped.some(d => d.reason === 'quote-not-in-any-excerpt'));
  assert.equal(r.survivors.find(s => /cures z/i.test(s.claim)), undefined);
});

test('normalize folds number-words and strips percent/BOM/CRLF', () => {
  assert.equal(normalize('\uFEFFThirty percent\r\n'), '30');
});
```

**Fixture directory layout & pointing at it:** Committed under `scripts/__fixtures__/<case>/{claims,excerpts,votes}/` (D-14). The test resolves them relative to its own location via `fileURLToPath(import.meta.url)` -- NOT relative to `process.cwd()` (which varies with how `node --test` is launched). This is critical for the GSD worktree/headless paths where cwd is unpredictable.

**No in-repo precedent:** This is the plugin's FIRST `scripts/` dir and FIRST `node --test`. The existing `tests/*.sh` are bash word-budget gates for the review skills -- a DIFFERENT domain; do not model the fixture on them. There is no `package.json`; do not add one. (If a future convenience `test` script is wanted, that is a Phase-20/release concern, out of scope here.)

### 2. Exact zero-dep CRLF / UTF-8 / LF / BOM normalization

The quote-substring re-check must be newline- and BOM-insensitive so a `.txt` excerpt saved CRLF on Windows still matches a quote captured LF (or vice versa). Two layers:

**Layer A -- read every file as UTF-8 explicitly:**
```js
const readText = (p) => fs.readFileSync(p, 'utf8');     // excerpts/*.txt
const readJson = (p) => JSON.parse(stripBom(readText(p))); // claims/*.json, votes/*.json
```
Note: `JSON.parse` THROWS on a leading BOM, so strip BOM before parsing JSON. (`fs.readFileSync(p, 'utf8')` does NOT strip BOM.)
```js
const stripBom = (s) => s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s;
```

**Layer B -- normalize inside `normalize()` (Pattern 1) so the comparison is intrinsically newline-insensitive:** the `.replace(/\r\n/g,'\n').replace(/\r/g,'\n')` + BOM-strip live in `normalize()` itself. Because both the excerpt and the quote pass through `normalize()` before `.includes()`, newline style on either side cannot cause a false miss. The `[^a-z0-9 ]+ -> ' '` step already collapses newlines to spaces, but doing the explicit CRLF->LF first keeps the function correct even if the char-class step is ever changed, and makes the intent legible (AGG-02 requires EXPLICIT LF normalization).

**Where normalization must happen:** in `normalize()` (used by both `jaccard` and `quoteOutcome`). Do NOT normalize at read time only -- the JSON `quote` field and the `.txt` excerpt must go through the SAME `normalize()` so the substring test is apples-to-apples. Raw bytes are read with explicit `'utf8'`; semantic normalization is centralized in `normalize()`.

**Fixture caveat (Pitfall 10 + CLAUDE.md):** the committed `__fixtures__` `.txt`/`.json` files must themselves be authored with predictable line endings. Author them via the Write tool (not bash heredoc). Add a fixture case (or a sub-assertion) where an excerpt contains a CRLF and the quote does not, asserting the match still succeeds -- this proves Layer A+B on the actual host.

### 3. Three-way quote-outcome extension (D-05) over the binary prototype

The spike's `recheck` is binary (cluster kept if ANY member quote is in its excerpt, else dropped). Extend to a PER-MEMBER three-way outcome, computed UPSTREAM of tally (D-06):

```js
// excerptsById: Map<excerpt_id, normalizedExcerptText>; also keep an array of all normalized excerpts
export function quoteOutcome(member, excerptsById, allExcerpts) {
  const nq = normalize(member.quote);
  const cited = excerptsById.get(member.excerpt_id);
  if (cited != null && cited.includes(nq)) {
    return 'verified';                                  // in its CITED excerpt
  }
  if (allExcerpts.some(ex => ex.includes(nq))) {
    return 'downgraded';                                // real text, WRONG attribution
  }
  return 'dropped';                                     // absent everywhere -> fabricated/drifted
}
```
- **Pre-normalize each excerpt ONCE** into a Map (`excerpt_id -> normalize(text)`) and an array of the normalized values, so the re-check is O(members x excerpts) on already-normalized strings (deterministic, cheap).
- **Recording observably (D-06):** carry the outcome on each member; surface counts in the summary (`verified: N`, `downgraded: M`, `dropped: K`) and put the dropped/downgraded records into `survivors.json` (downgraded survivors stay, flagged) and/or a `dropped` list. A DOWNGRADED member is KEPT but its cluster's quote-fidelity assurance is lowered (e.g. a `quote_fidelity: 'downgraded'` field on the survivor); a DROPPED member is excluded before tally.
- **Cluster-level rule:** apply the member outcomes, then a cluster survives if it has >= 1 `verified` OR `downgraded` member; a cluster with ALL members `dropped` is dropped entirely (extends the spike's "at least one member quote found" to "at least one member not-dropped"). Keep the UNDER-merge bias: do not let a downgrade silently delete a cluster.
- **Two distinct assurances (D-06, VERIF-06 in Phase 17):** the aggregator records ONLY quote-verbatim-fidelity (verified/downgraded/dropped). It does NOT record entailment. Phase 17 freezes the second assurance field; do not invent it here.

### 4. Distinct-source corroboration + paraphrase-not-double-counted (D-07/D-08, Pitfall 8)

The spike already counts sources via a `Set` per cluster (`hit.sources.add(c.source)`). Make the contract explicit and add the paraphrase-from-one-source guard:

```js
// during merge: cluster.sources is a Set of distinct source ids (canonical URL or source id)
const hit = clusters.find(cl => jaccard(cl.text, c.text) >= 0.6);
if (hit) { hit.members.push(c); hit.sources.add(c.source); }
else     { clusters.push({ id: 'cluster' + clusters.length, text: c.text,
             members: [c], sources: new Set([c.source]) }); }
// corroboration = cluster.sources.size  (DISTINCT sources, a LOWER bound -- D-09)
```
- **Count by distinct source, never by member/claim count.** Two paraphrases of ONE source land in one cluster with `sources.size === 1` -> corroboration 1, NOT 2. Two near-duplicates from DIFFERENT sources -> one cluster, `sources.size === 2` -> corroboration 2. This is the entire mechanism that satisfies BOTH SC-5 sub-cases.
- **Number-word normalization stays** (`thirty` -> `30`, drop `percent`) so "30%" and "thirty percent" merge (spike A1 PROVED plain Jaccard ~0.57 missed this; the fold fixes it).
- **UNDER-merge bias (D-07):** keep the threshold at >= 0.6 and prefer keeping clusters separate when ambiguous -- preserving dissent. Over-merging hides disagreement (Pitfall 8 direction 2); under-merging at worst under-claims corroboration (the safe direction).
- **Lower bound (D-09):** label the count as "at least N near-duplicate sources" in code comments and in the survivor record (e.g. `corroboration_lower_bound: cluster.sources.size`). Do NOT present it as exact independence.
- **The precise fixture case (D-15 case 3):** TWO claim files, SAME `source` id, paraphrased text (e.g. `"X reduces Y by 30%"` and `"X cuts Y thirty percent"`). Assert the resulting cluster has `sources.size === 1` (NOT 2). Contrast with case 4: two files, DIFFERENT sources, near-duplicate -> one cluster with `sources.size === 2`. NO embeddings anywhere.

### 5. Ceiling enforcement WITH observability (D-10/D-11)

Single frozen constants block (D-10); cap AFTER ranking; surface every cap as a count (D-11):

```js
export const CEILINGS = Object.freeze({
  ANGLES: 5, MAX_FETCH: 15, MAX_VERIFY_CLAIMS: 24, VOTES_PER_CLAIM: 3, SYNTH_CAP: 20,
});

export function enforceCeilings(rankedClusters) {
  const caps = {};
  let kept = rankedClusters;
  if (kept.length > CEILINGS.MAX_VERIFY_CLAIMS) {
    caps.claims = `${kept.length}->${CEILINGS.MAX_VERIFY_CLAIMS}`;     // observable (D-11)
    kept = kept.slice(0, CEILINGS.MAX_VERIFY_CLAIMS);                  // cap AFTER ranking
  }
  return { kept, caps };
}
```
- **`MAX_VERIFY_CLAIMS` (~24):** rank clusters (e.g. by corroboration desc, then a deterministic tiebreak like normalized-text lexical order so output is reproducible), then `slice(0, 24)`. Record `claims: 31->24`.
- **`VOTES_PER_CLAIM = 3`:** read at most 3 seats per claim; seats `-3`, `-4`, ... are ignored deterministically. If extra seats exist, record `votes_ignored: K`.
- **`SYNTH_CAP` (~20):** `survivors.slice(0, 20)` for the output; record `synth_capped: 23->20` if it fired.
- **`ANGLES` (~5) / `MAX_FETCH` (15):** these bound UPSTREAM waves (search/fetch) that the aggregator does not perform. In THIS phase the aggregator can still defensively cap the number of distinct sources/worker-files it ingests to `MAX_FETCH` and surface a count, but the primary enforcement of ANGLES/MAX_FETCH is the Phase-20 orchestrator's wave dispatch. Keep all five constants in the block (single source of truth, D-10) and document which the aggregator actively enforces (MAX_VERIFY_CLAIMS, VOTES_PER_CLAIM, SYNTH_CAP) vs which it carries as the shared contract (ANGLES, MAX_FETCH). The fixture (D-15 case 5) feeds OVER-ceiling input (e.g. 31 clusters or a 4th vote seat) and asserts the cap fired AND the count appears in the summary.
- **`~` ceilings:** ANGLES/MAX_VERIFY_CLAIMS/SYNTH_CAP are "~" in the prose; pick exact integers (5/24/20) for the constants -- "enforced in code" requires a concrete number. The `~` signals these are tunable defaults, not that the code is fuzzy.

### 6. CLI contract + outputs (D-01/D-02/D-03) -- shapes FROZEN by Phase 17

- **Input:** one positional `<run-dir>`; read `claims/*.json`, `excerpts/*.txt`, `votes/*.json` via `fs.readdirSync` + `path.join` (D-02). No flags on the core path (D-01).
- **`survivors.json`:** array of bounded survivor records, top <= `SYNTH_CAP`, verbatim evidence only. The spike shape is `{ claim, sources, confidence }`; Phase 16 ADDS `corroboration_lower_bound` and `quote_fidelity` (verified/downgraded) per the extensions above. **Flag for the planner:** these field names are LOAD-BEARING -- Phase 17 freezes them and Phase 18/20 consume them. Choose them deliberately. Recommend: `{ id, claim, sources: [...], corroboration_lower_bound: N, quote_fidelity: 'verified'|'downgraded', confidence: 'High'|'Medium'|'Low/Contested'|'Unsupported' }`. (Phase 17 may also add the SECOND assurance field for entailment -- do NOT add it here.)
- **stdout summary:** bounded, deterministic, counts ONLY -- never raw source text (D-03). Recommended line set (Claude's Discretion on exact wording):
  ```
  raw: 31 -> clusters: 24 (merged: 7)
  quote-recheck: verified 20 | downgraded 2 | dropped 2
  capped: claims 31->24 | synth 22->20
  survivors: 20 (High 12, Medium 5, Low/Contested 3)
  ```
- **Exit codes:** `0` success; non-zero (recommend `2`) on contract violation -- missing/invalid `<run-dir>`, malformed worker JSON (catch `JSON.parse` failures and exit non-zero with a stderr message naming the bad file). The spike currently `process.exit`s on assertion pass/fail; the production CLI instead exits 0 on success and non-zero only on a real contract violation (the FIXTURE, not the CLI, asserts correctness). [confirms D-03]
- **Determinism:** any iteration over `fs.readdirSync` results must be ORDER-STABLE. `readdirSync` order is filesystem-dependent; SORT the file list (`.sort()`) before processing, and use deterministic tiebreaks in ranking, so the same inputs always produce byte-identical `survivors.json` and stdout. This is required for the fixture to assert exact output and for AGG-01's "reproducible" claim. [ASSUMED -- recommended hardening; the spike did not sort, but reproducibility (AGG-01) demands it]

## Common Pitfalls

### Pitfall 1: `readdirSync` order non-determinism breaks reproducibility
**What goes wrong:** Different file-enumeration order -> different cluster ids / ranking ties -> non-reproducible output; the fixture's exact-match assertions flake.
**Why it happens:** `fs.readdirSync` returns OS-dependent order; the spike relied on it implicitly.
**How to avoid:** `.sort()` the file list; deterministic tiebreak in ranking (e.g. normalized-text lexical order). Assert reproducibility by running `aggregate()` twice and deep-equal-ing the result.
**Warning signs:** fixture passes locally, fails in CI/worktree; cluster ids shift between runs.

### Pitfall 2: BOM crashes `JSON.parse`
**What goes wrong:** A `claims/*.json` saved with a UTF-8 BOM throws `Unexpected token` on `JSON.parse`.
**Why it happens:** `fs.readFileSync(p,'utf8')` keeps the BOM; `JSON.parse` rejects it.
**How to avoid:** `stripBom()` before `JSON.parse` (guidance 2, Layer A). `normalize()` strips BOM for `.txt` excerpts independently.
**Warning signs:** parse failure only on Windows-authored fixture files.

### Pitfall 3: cwd-relative fixture paths
**What goes wrong:** Test resolves `__fixtures__` relative to `process.cwd()`, breaks under GSD worktrees / headless `claude -p` where cwd drifts.
**How to avoid:** resolve via `fileURLToPath(import.meta.url)` (test-file-relative), never cwd. (CLAUDE.md worktree-cwd-drift memory reinforces this.)

### Pitfall 4: over-claiming corroboration from paraphrase (Pitfall 8 residual, D-09)
**What goes wrong:** lexical dedup under-merges semantic paraphrase beyond number/format variance, so two restatements of one source COULD count as two sources.
**How to avoid:** count by DISTINCT SOURCE id (not claim count) so even unmerged paraphrases from the SAME source still collapse to corroboration 1; label the count a LOWER bound; document the lexical limit in code (D-09). Do NOT add embeddings.
**Warning signs:** a survivor shows corroboration 2 when both members share a `source`.

### Pitfall 5: drifting from the entailment boundary
**What goes wrong:** the script grows logic to judge whether a quote SUPPORTS a claim.
**How to avoid:** the aggregator guards verbatim CONSISTENCY only (verified/downgraded/dropped). Entailment is the Phase-18 voter; the second assurance field is frozen in Phase 17. (ARCHITECTURE Anti-Pattern 2; D-06.)

## Code Examples

### Centralized normalize (CRLF/BOM/number-word safe) -- the comparison primitive
```js
// Source: hardened from plans/_spike/aggregate-spike.mjs `norm`, + BOM/CRLF (guidance 2)
export function normalize(s) {
  return String(s)
    .replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    .toLowerCase().replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/).map(w => NUMWORDS[w] ?? w).filter(w => w && w !== 'percent')
    .join(' ').trim();
}
export const jaccard = (a, b) => {
  const A = new Set(normalize(a).split(' ').filter(Boolean));
  const B = new Set(normalize(b).split(' ').filter(Boolean));
  let i = 0; for (const t of A) if (B.has(t)) i++;
  return i / (A.size + B.size - i);
};
```

### node:test fixture skeleton (run via `node --test`)
```js
// Source: net-new (guidance 1); Node v24.13.0 host [VERIFIED]
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { aggregate, normalize, CEILINGS } from './lz-deep-research-aggregate.mjs';
const fx = (n) => path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__', n);

test('SC5-1 fabricated quote dropped upstream of voting', () => {
  const r = aggregate(fx('fabricated-quote-dropped'));
  assert.ok(r.summary.includes('dropped 1') || r.dropped.length === 1);
});
test('SC5-2 real-quote/wrong-passage downgraded (kept, lowered)', () => {
  const r = aggregate(fx('wrong-passage-downgraded'));
  assert.ok(r.survivors.some(s => s.quote_fidelity === 'downgraded'));
});
test('SC5-3 paraphrase pair from one source NOT counted as 2', () => {
  const r = aggregate(fx('paraphrase-one-source'));
  assert.equal(r.survivors[0].corroboration_lower_bound, 1);
});
test('SC5-4 near-duplicate pair from two sources merged', () => {
  const r = aggregate(fx('near-duplicate-merged'));
  assert.equal(r.survivors[0].corroboration_lower_bound, 2);
});
test('SC5-5 over-ceiling input capped observably', () => {
  const r = aggregate(fx('ceilings-enforced'));
  assert.ok(/claims \d+->24/.test(r.summary));
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Binary quote keep/drop (spike) | Three-way verified/downgraded/dropped (D-05) | This phase | SC-5 needs both the drop AND the downgrade cases expressible |
| Inline `process.exit` assertions in the script | Pure functions + `node:test` fixture (D-13/D-16) | This phase | Aggregator becomes an importable lib + thin CLI; the test asserts correctness |
| `import.meta.url.pathname.replace(...)` drive-letter regex | `fileURLToPath(import.meta.url)` | This phase | Correct, portable ESM self-location |
| `node:test` experimental (Node 18, flagged) | Stable, unflagged (Node 20+; host is 24.13.0) | n/a (host already current) | No flags needed |

**Deprecated/outdated:** nothing in the spike is deprecated; the regex path-hack is merely fragile and should be replaced.

## Runtime State Inventory

Not applicable -- this is a GREENFIELD phase (new script + new fixture, no rename/refactor/migration of existing runtime state). The only "existing" artifact is the spike prototype under `plans/_spike/`, which is a reference to harden, not state to migrate.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | running the script + `node --test` | yes | v24.13.0 (FNM-managed) | none needed |
| `node:test` (stdlib) | the fixture | yes | stable in Node 24 | none needed |
| Git Bash | the host shell for invocation | yes | per CLAUDE.md | none needed |
| npm / external packages | (nothing) | n/a | n/a | n/a -- zero-dep mandate |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** none. The phase is pure Node stdlib on an already-current host.

## Validation Architecture

> nyquist_validation is ENABLED (`.planning/config.json` workflow.nyquist_validation: true). The `node --test` fixture is the PRIMARY validation instrument; each of the 5 success criteria maps to a mechanical check.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node:test` + `node:assert/strict` (Node stdlib), host Node v24.13.0 |
| Config file | none -- zero-config; no `package.json` (Wave 0 authors the test file itself) |
| Quick run command | `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` |
| Full suite command | `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/` (discovers all `*.test.mjs` in the dir) |

### Phase Requirements / Success Criteria -> Test Map
| SC / Req | Behavior | Test Type | Automated Command | File Exists? |
|----------|----------|-----------|-------------------|-------------|
| SC-1 / AGG-01 | Deterministic dedup/rank/tally/quote-recheck, zero deps, runs against a run-dir | integration | `node "...scripts/lz-deep-research-aggregate.mjs" "...__fixtures__/near-duplicate-merged"` exits 0 + writes `survivors.json` | NO -- Wave 0 |
| SC-1 (determinism) / AGG-01 | Same input -> byte-identical output (reproducible) | unit | `node --test` assert `aggregate(fx)` deep-equals a second `aggregate(fx)` | NO -- Wave 0 |
| SC-2 / AGG-02 | CRLF/BOM/UTF-8 safe; `path.join`; `readdirSync` (no glob); zero deps | unit | `node --test` assert `normalize('\uFEFFThirty percent\r\n') === '30'`; assert a CRLF excerpt still matches an LF quote; assert no `package.json` / no `import` of a non-`node:` module | NO -- Wave 0 |
| SC-3 / VERIF-04 | Fabricated quote DROPPED upstream of voting (observable before tally) | unit | `node --test` case `fabricated-quote-dropped`: assert dropped count 1, claim absent from survivors, and the drop is recorded before any vote is read | NO -- Wave 0 |
| SC-3 (downgrade) / D-05 | Real-quote / wrong-passage DOWNGRADED (kept, lowered), not dropped, not upheld | unit | `node --test` case `wrong-passage-downgraded`: assert survivor exists with `quote_fidelity === 'downgraded'` | NO -- Wave 0 |
| SC-4 / AGG-06 | Named ceilings enforced in code; over-ceiling input capped; cap observable in stdout | unit | `node --test` case `ceilings-enforced`: assert `/claims \d+->24/` in summary; assert `CEILINGS` is the single frozen source | NO -- Wave 0 |
| SC-5 (paraphrase) / D-08 | Paraphrase pair from ONE source NOT double-counted (corroboration 1) | unit | `node --test` case `paraphrase-one-source`: assert `corroboration_lower_bound === 1` | NO -- Wave 0 |
| SC-5 (near-dup) / D-08 | Near-duplicate pair from TWO sources merged (corroboration 2) | unit | `node --test` case `near-duplicate-merged`: assert one cluster, `corroboration_lower_bound === 2` | NO -- Wave 0 |
| SC-5 (gate) / AGG-04 | The committed fixture PASSES | gate | `node --test plugins/.../scripts/` exits 0 | NO -- Wave 0 |

### Sampling Rate
- **Per task commit:** `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` (fast, < 1s; the whole fixture is in-process).
- **Per wave merge:** same -- the suite is the single fixture file; run it whole.
- **Phase gate:** `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/` exits 0 (all 5 SC behaviors green) before `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] `scripts/lz-deep-research-aggregate.mjs` -- the aggregator (pure functions + thin CLI). Blocks all tests.
- [ ] `scripts/lz-deep-research-aggregate.test.mjs` -- the `node:test` fixture covering SC-1..SC-5.
- [ ] `scripts/__fixtures__/<case>/{claims,excerpts,votes}/` -- the committed fixture run-dirs (seed from `plans/_spike/run/`, then ADD the downgrade, paraphrase-one-source, and ceiling cases). Author via the Write tool, NOT bash heredoc; predictable line endings (and at least one deliberate-CRLF excerpt to prove Layer A+B).
- [ ] No framework install needed (Node stdlib `node:test`); no `package.json` to add.

*All test infrastructure is net-new; there is no prior `node --test` precedent in the repo. The existing `tests/*.sh` are a different domain (bash word-budget gates) and are NOT reused.*

## Security Domain

> `security_enforcement` is not set in config; default = enabled. This phase has a narrow surface (an off-model file reducer with no network, no auth, no eval), so most ASVS categories do not apply.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | no auth surface (local file reducer) |
| V3 Session Management | no | no sessions |
| V4 Access Control | no | reads/writes only within the supplied run dir |
| V5 Input Validation | yes | malformed worker JSON -> caught (`JSON.parse` in try/catch) -> non-zero exit (D-03); never trust file contents to be well-formed |
| V6 Cryptography | no | no crypto |
| V12 Files & Resources | yes | address files with `path.join` under the supplied `<run-dir>`; do NOT follow `excerpt_id`/`worker-id` values into arbitrary paths (treat ids as basenames; reject path separators / `..` in ids) |

### Known Threat Patterns for a local file reducer
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal via a crafted `excerpt_id`/filename (`../../etc`) | Tampering | Treat ids as basenames only; `path.join(runDir, 'excerpts', id + '.txt')` AND validate `id` has no separators / `..`; or resolve and assert the result stays under `runDir` |
| Malformed / non-JSON worker file crashes the run | Denial of Service | try/catch around `JSON.parse`; exit non-zero naming the bad file (D-03) rather than throwing an uncaught stack |
| Untrusted excerpt/quote text injected as "instructions" | (n/a here) | The aggregator treats all file text as DATA for substring/Jaccard only -- it never executes or interprets it. Prompt-injection is an orchestrator/worker concern (Rule 5a), out of scope for the off-model reducer. |

Note: the aggregator runs OFF-MODEL on local files the workers wrote into a gitignored scratch dir; it has no network and no model. The realistic risks are input-validation robustness (malformed JSON) and path-safety on the `*_id` -> filename mapping. Both are cheap to harden and worth a fixture sub-assertion (a malformed `claims/*.json` -> non-zero exit; an `excerpt_id` with a separator -> rejected, not traversed).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `node:assert/strict` is the right pairing for `node:test` | Standard Stack | LOW -- could use non-strict `assert`; strict is a recommendation, not load-bearing |
| A2 | Sorting `readdirSync` output + deterministic ranking tiebreaks are REQUIRED for reproducibility (spike did not sort) | guidance 6 / Pitfall 1 | LOW-MED -- if skipped, fixture exact-match assertions could flake across filesystems; recommend adopting |
| A3 | Recommended `survivors.json` field names (`corroboration_lower_bound`, `quote_fidelity`) | guidance 6 | MED -- these are FROZEN by Phase 17; the planner/Phase-17 may rename. Flagged as load-bearing so the choice is deliberate, not accidental |
| A4 | Treating `*_id` values as basenames + rejecting path separators is the right path-safety control | Security Domain | LOW -- defensive; the workers control the ids, but hardening is cheap |
| A5 | Node >= 20 floor for the test (script alone needs only Node 14+) | Standard Stack | LOW -- host is 24.13.0; only matters for documenting a published floor |

**Note:** Everything in User Constraints is LOCKED (CONTEXT D-01..D-16) or spike-PROVEN (`aggregate-spike.mjs`), not assumed. The assumptions above are net-new implementation recommendations, all LOW/MED risk, none contradicting a locked decision.

## Open Questions / Risks for the Planner

This is a LOW-risk foundation phase; the open items are small.

1. **`survivors.json` field names are load-bearing (A3).** Phase 17 FREEZES them; Phase 18/20 consume them. The planner should treat the field set (`id`, `claim`, `sources`, `corroboration_lower_bound`, `quote_fidelity`, `confidence`) as a deliberate contract choice, not an implementation detail. Recommend the names above; flag any change so Phase 17 inherits it.
2. **One rich fixture vs five minimal cases (D-15).** D-15 requires all 5 behaviors ASSERTED, not 5 directories. Recommend separating at least the three quote-outcome cases (so a single failure is diagnosable) while allowing the near-dup-merge + corroborated-High baseline to reuse the spike's `run/` seed. Planner's call on granularity (Claude's Discretion covers file-split).
3. **ANGLES / MAX_FETCH enforcement locus (guidance 5).** These bound UPSTREAM waves the aggregator does not run; the aggregator carries them in the constants block (single source of truth, D-10) but actively enforces only MAX_VERIFY_CLAIMS / VOTES_PER_CLAIM / SYNTH_CAP. Confirm the planner is comfortable that ANGLES/MAX_FETCH active enforcement is the Phase-20 orchestrator's job (the aggregator may still defensively cap ingested sources to MAX_FETCH + report it).
4. **Optional `LZ_DR_*` env override (D-12, Claude's Discretion).** Recommend OMIT for this phase (hardcoded constants are the enforced contract; the override is a Phase-20 concern). Only wire it if truly trivial AND defaults stay unchanged.
5. **Determinism hardening (A2) is a recommendation, not a locked decision.** Sorting `readdirSync` + deterministic tiebreaks is needed for AGG-01's "reproducible" claim and for stable fixture assertions. Recommend adopting; flag if the planner prefers to assert only behavioral (not byte-exact) properties.

## Sources

### Primary (HIGH confidence)
- `plans/_spike/aggregate-spike.mjs` -- spike A1 (PASS); the proven core (`norm`/`jaccard`/`quoteInExcerpt`/`mergeClaims`/`recheck`/`tally`) and run-dir layout. The behavioral contract to preserve + extend.
- `plans/_spike/run/{claims,excerpts,votes,survivors.json}` -- the proven immutable run-dir layout + the exact JSON/`.txt` shapes (inspected this session).
- `plans/_spike/merge.mjs`, `plans/_spike/a2/` -- A2 headless-permission proof (single named non-git `node` Bash call permitted under `--permission-mode auto`).
- `.planning/phases/16-.../16-CONTEXT.md` -- LOCKED decisions D-01..D-16.
- `.planning/research/SESSION-DESIGN.md` SS6/SS7/SS8/SS13-A1 -- spine, ceilings, off-model aggregation, evidence-artifact verification, the A1 proof.
- `.planning/research/PITFALLS.md` Pitfalls 8/9/10 + the "Looks Done But Isn't" checklist -- the exact fixture assertions.
- `.planning/research/ARCHITECTURE.md` Pattern 2 + data-flow P4 + Anti-Pattern 2 (self-anchor rejection).
- `.planning/ROADMAP.md` Phase 16 (goal + 5 success criteria); `.planning/REQUIREMENTS.md` (AGG-01/02/04/06, VERIF-04, Out-of-Scope).
- Host probe: `node --version` -> v24.13.0; `ls package.json` -> none (zero-dep confirmed) [VERIFIED this session].

### Secondary (MEDIUM confidence)
- Node.js `node:test` stability lineage (stable/unflagged from Node 20; exit-code-on-failure; `node --test` directory discovery) -- training knowledge cross-checked against the running Node 24.13.0 host. [CITED: Node test-runner docs behavior]
- ESM `__dirname` via `fileURLToPath(import.meta.url)` -- standard Node ESM pattern. [CITED: Node ESM docs]

### Tertiary (LOW confidence)
- None load-bearing. All net-new guidance is Node stdlib mechanics verified on the host or cross-checked against the spike.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Node stdlib only, host version verified, no registry risk.
- Architecture: HIGH -- spine + IO contract are LOCKED (CONTEXT) and PROVEN (spike A1).
- Pitfalls: HIGH -- enumerated in PITFALLS.md + verified Node stdlib gotchas (BOM/CRLF/readdir order).
- Net-new mechanics (node:test, CRLF recipe, three-way outcome, distinct-source count, observable caps): HIGH for the recipes; the load-bearing risk is the FROZEN field names (A3), flagged for the planner.

**Research date:** 2026-06-15
**Valid until:** ~30 days (stable domain -- Node stdlib + locked decisions; the only moving part is the Phase-17 field-name freeze, which this phase SETS).
