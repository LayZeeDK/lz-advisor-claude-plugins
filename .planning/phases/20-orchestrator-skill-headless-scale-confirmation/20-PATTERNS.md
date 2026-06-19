# Phase 20: Orchestrator skill + headless scale confirmation - Pattern Map

**Mapped:** 2026-06-19
**Files analyzed:** 11 (3 NEW skill/ref + 3 EDIT additive-lockstep + 1 EDIT worker + 4 NEW eval-tree + 1 EDIT .gitignore)
**Analogs found:** 11 / 11 (this is a reuse-heavy / additive-extension phase -- every new file has a strong in-repo analog)

> Scope note: Phase 20 authors almost no greenfield logic. It (A) WIRES already-shipped agents + the
> frozen aggregator into a NEW orchestrator SKILL.md, (B) makes an ADDITIVE `load_bearing`/`escalate`
> extension to the frozen aggregator + schema under the proven anti-drift lockstep, (C) composes the
> frozen `eval/` certification seams into a NEW live-cert harness, and (D) proves the packaged skill at
> headless concurrency. The locked decisions D-01..D-19 are AUTHORITATIVE; this map assigns each new
> file its closest existing analog + the concrete excerpts to copy. It does not re-open any decision.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `plugins/lz-advisor/skills/lz-deep-research/SKILL.md` (NEW) | skill (orchestrator) | event-driven / pub-sub (wave dispatch + receipt fan-in) | `plugins/lz-advisor/skills/lz-execute/SKILL.md` | role-match (most-complex existing orchestrator skill) |
| `plugins/lz-advisor/references/lz-deep-research-orchestration.md` (NEW, optional) | reference (progressive disclosure) | n/a (docs) | `plugins/lz-advisor/references/advisor-timing.md` + `context-packaging.md` | role-match |
| `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` (EDIT, additive) | utility (off-model reducer) | transform / batch | itself (frozen) + the FNV-1a `hash32` in `eval/lz-eval-oof-batch.mjs` | exact (extends the file under the lockstep it already documents) |
| `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` (EDIT) | test | transform-fixture | itself (`SC5-5` / `TEST-2b` / `SC-1` discriminating + determinism + frozen-object tests) | exact |
| `plugins/lz-advisor/references/lz-deep-research-schema.md` (EDIT, additive) | config (data contract) | n/a (docs) | itself (the frozen contract + its own anti-drift discipline section) | exact |
| `plugins/lz-advisor/agents/research-extract-worker.md` (EDIT: emit `load_bearing`) | agent (worker) | request-response (fetch -> write -> receipt) | itself (additive field on the existing claim record) | exact |
| `eval/lz-eval-live-cert.mjs` (NEW) | utility (eval orchestrator) | batch / staged-spend | `eval/lz-eval-offline-read.mjs` (composes `certifyModel` / `decisionMatrix`) | role-match (same compose-the-frozen-seams shape) |
| `eval/lz-eval-live-cert.test.mjs` (NEW) | test | deterministic-seam | `eval/lz-eval-offline-read.test.mjs` + `eval/lz-eval-worker-contract.test.mjs` | role-match |
| `eval/lz-eval-harvest.mjs` (NEW) | utility (control-set loader) | file-I/O / transform | `eval/lz-eval-control-source.mjs` / `survival-probe.mjs` (loaders), but source = the pipeline's OWN run dirs | role-match |
| `eval/lz-eval-live-lock-rule.md` (NEW) | config (pre-registration prose) | n/a (docs) | `eval/lz-eval-lock-rule.md` (sibling discipline doc) | exact (sibling lock rule) |
| `.gitignore` (EDIT: add `/.lz-research/`) | config | n/a | itself (`/eval/.cache/` + `/plans/` entries) | exact |

## Pattern Assignments

### `plugins/lz-advisor/skills/lz-deep-research/SKILL.md` (skill orchestrator, event-driven)

**Analog:** `plugins/lz-advisor/skills/lz-execute/SKILL.md` (the most complex shipped orchestrator skill).

**Frontmatter pattern** (analog lines 1-21) -- copy the third-person `description` shape (trigger phrases + a "should NOT be used when ..." sibling-skill exclusion) and the `version` + `allowed-tools` lines. The analog declares:

```yaml
---
name: lz-execute
description: >
  This skill should be used when the user wants to implement,
  build, or execute a coding task ... Trigger phrases include
  "implement this task", ... This skill should NOT be used when
  the user wants to plan before coding, review completed code, or
  run security audits -- those are handled by sibling skills lz-plan,
  lz-review, and lz-security-review respectively.
version: 2.0.0
allowed-tools: Agent(lz-advisor:advisor), Read, Glob, Edit, Write, Bash(git:*), WebSearch, WebFetch
---
```

For the NEW skill, declare (D-10 verbatim, parsed-not-enforced documentation): `allowed-tools: Agent, Read, Glob, Write, WebSearch, WebFetch, Bash(git:*), Bash(node:*), AskUserQuestion`. CORRECTION vs the analog: the analog narrows `Agent(lz-advisor:advisor)` to one agent; the deep-research orchestrator dispatches MANY agents per invocation, so declare bare `Agent`. `Bash(node:*)` is the correct command-prefix filter form (NOT `Bash(node "...")`). Version stays `2.1.0` (RESEARCH.md frontmatter block; plugin.json is currently `2.0.0` and is bumped only if the planner decides).

**Phase-block + progressive-disclosure pattern** (analog lines 23-34, 35, 112, 121, 173, 229, 244, 274) -- the analog wraps each phase in a named XML-ish block (`<orient>`, `<consult>`, `<execute>`, `<verify_before_commit>`, `<durable>`, `<final>`, `<complete>`) and pushes timing/packaging detail into `references/` via `@`-mention:

```markdown
@${CLAUDE_PLUGIN_ROOT}/references/advisor-timing.md
@${CLAUDE_PLUGIN_ROOT}/references/context-packaging.md
```

For the deep-research orchestrator, mirror this with the SESSION-DESIGN section-5 phases: `<scope>`, `<decompose>`, `<search>`, `<extract>`, `<aggregate>`, `<verify>`, `<synthesize>` (RESEARCH.md Pattern 1). Push the report micro-format, the canonical-URL recipe reminder, and the advisor-consult packaging into `@${CLAUDE_PLUGIN_ROOT}/references/lz-deep-research-orchestration.md`. NO cross-skill body references -- shared knowledge lives in `references/` (MEMORY `feedback_no_cross_skill_body_references`).

**Assuming-frame fallback pattern (PIPE-02 / D-09)** -- the analog's Orient phase and the `advisor.md` agent both use the `Assuming X (unverified)` convention. The advisor's literal frame (`advisor.md` lines 58, 185-189) is the canonical shape to echo into `scope.md` + the report header on the no-answer (`-p`) path:

```
Assuming X (unverified), do Y. Verify X before acting.
```

The skill ATTEMPTS `AskUserQuestion` when scope is underspecified and, on no-answer, proceeds on stated assumptions surfaced as `Assuming <X> (unverified)` frames -- it must NOT block waiting for an answer that never arrives (RESEARCH.md Risk 4). Workers NEVER call `AskUserQuestion` (unavailable to subagents).

**`${CLAUDE_PLUGIN_ROOT}` aggregator-shell pattern (D-10)** -- the skill shells the aggregator once per stage (the frozen CLI guard at `lz-deep-research-aggregate.mjs` lines 721-740). The exact form:

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs" "<run-dir>"
# exit 0 -> writes survivors.json + prints the 4-line summary; exit 2 -> ContractError (RUN FAILURE, D-16)
```

A non-zero aggregator exit is a RUN FAILURE (D-16) -- the report stage must treat it as such, never silently consume a missing `survivors.json`.

**Wave-batching pattern (COST-03 / D-08)** -- no code analog (it is a behavioral turn-structure instruction). Author it as a hard counted skill-body instruction (RESEARCH.md Pattern 2):

```
Dispatch exactly N = min(remaining, 5) Agent calls in ONE turn, each in the FOREGROUND.
Wait for all N one-line receipts before the next turn. Assert you received exactly N receipts.
If remaining > 5, repeat as ceil(count/5) sequential sub-waves of at most 5; never a sixth concurrent Agent call.
```

Foreground only -- background fan-out auto-denies prompts under `-p` and has no backpressure (D-08).

**Per-invocation `model` pattern (D-10 / R1 -- the single most load-bearing fact)** -- the worker agents' frontmatter `model:` is INERT for plugin-shipped agents. The orchestrator sets the tier on each Agent call (`model: sonnet` for workers; `model: opus` for the two advisor gates). The existing agents carry `model: sonnet` (search/extract/voter) and `model: opus` (advisor) lines as DOCUMENTATION only.

**Two-Opus-gates pattern (COST-01 / D-18)** -- reuse the existing `advisor` agent (read-only `[Read, Glob]`, `maxTurns 3`, `effort high`; `advisor.md` lines 41-46) at EXACTLY two gates (Gate 1 scope/ranking-cut-line; Gate 2 synthesis/calibration), each with a per-invocation `model: opus`. NEVER spawn `research-verify-voter-opus` (eval-reference-only). Reconcile SESSION-DESIGN section 5 "Gate 1b" INTO the single Gate-1 consult. The SC-5 trace asserts advisor spawns == 2.

**Cited-report structure (PIPE-06/08/09 + VERIF-06 / D-11)** -- the report claim record is the schema's stage-2 record (`lz-deep-research-schema.md` lines 435-462). Copy the field set + the side-by-side two-assurance pair verbatim:

```json
{
  "id": "cluster0",
  "claim": "X reduces Y by 30%",
  "sources": ["https://example.org/a/study"],
  "corroboration_lower_bound": 2,
  "quote_fidelity": "verified",
  "confidence": "High",
  "claim_support": "supported",
  "citation": "A randomized study of X and Y (https://example.org/a/study)"
}
```

Five report sections (D-11): (1) Question & Scope (+ Assuming-frames); (2) Key Findings (one bullet/surviving claim, inline `(Title, url)` citation, confidence tag from the frozen five `High|Medium|Low|Contested|Unsupported`, the two-assurance pair); (3) Contested & Unsupported (FIRST-CLASS, not averaged away); (4) Confidence & Assurance legend (the two orthogonal axes, one NEVER derived from the other); (5) Sources.

**Citation-provenance join (D-17)** -- for every `survivors[].sources[]` canonical key, the synthesis step READS the percent-encoded `sources/<key>.json` for title/citation (schema lines 130-142, "Phase 19 filename-safety rule") and FAILS LOUDLY (or marks `citation: source-record-missing`) -- never fabricates a title, never RE-canonicalizes the key (the aggregator counts the key it is given).

**`claim_support` (Assurance 2) producer (D-12)** -- produced by the orchestrator's synthesis step, never the aggregator (schema lines 362-372, 537). It is NEVER derived from `quote_fidelity` (the orthogonality worked example, schema lines 374-400).

**Run-id generation (D-14)** -- the SESSION generates the run-id at scope-guard time, format `YYYYMMDD-HHMMSS-<short-slug>`. The Node aggregator NEVER generates it (it receives `<run-dir>` as `process.argv[2]`, uses no `Date.now()`; CLI guard lines 722-723). The run dir is RETAINED as the audit trail (AGG-05) -- gitignored, not deleted; the skill body must NOT clean it up.

**Caps-before-spawn (D-16)** -- the orchestrator caps `MAX_FETCH = 15` extract workers and `ANGLES ~5` sub-angles BEFORE spawning (the aggregator fail-closes with `ContractError` exit 2 above its ceilings -- a hard mid-run abort). `CEILINGS` is the single source (`lz-deep-research-aggregate.mjs` lines 115-121); import it or mirror it with a dev-time identity test.

**Vote-keying dispatch order (D-15)** -- load-bearing. Run aggregate stage-1 FIRST (emits `clusterN` ids), dispatch the 3 verify voters keyed by `clusterN` (vote files `cluster0-0.json` ...), THEN aggregate stage-2. The tally reads `<clusterId>-<seat>.json` FIRST, then `<memberId>-<seat>.json` (`lz-deep-research-aggregate.mjs` lines 545-555; schema lines 217-220). Voters keyed by claim/member id silently mis-tally merged multi-member clusters.

---

### `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` (utility, additive transform extension)

**Analog:** itself -- the frozen aggregator, extended under the anti-drift lockstep it already documents.

**Frozen-ceilings pattern (extend, additive)** -- the `CEILINGS` object (lines 115-121) is the single frozen source. Add the `AUDIT_SAMPLE_RATE` constant (within 15-20%, planner's discretion e.g. `0.15`) as a frozen sibling (own `Object.freeze`, or a new key) -- the schema doc quotes it byte-for-byte and a dev-time test asserts `Object.isFrozen` + the pinned value (mirror `SC5-5`):

```javascript
export const CEILINGS = Object.freeze({
  ANGLES: 5,
  MAX_FETCH: 15,
  MAX_VERIFY_CLAIMS: 24,
  VOTES_PER_CLAIM: 3,
  SYNTH_CAP: 20,
});
```

**`load_bearing` carry pattern (D-12b)** -- carry `load_bearing` through `mergeClusters` (lines 305-321). A cluster is `load_bearing: true` if ANY member carries it (OR-fold) -- analogous to the existing `sources` Set OR-accumulation:

```javascript
// existing (lines 310-320) -- mirror the member-spread + cluster-level field shape:
if (hit) {
  hit.members.push(c);
  hit.sources.add(c.source);
} else {
  clusters.push({ id: 'cluster' + clusters.length, text: c.text, members: [c], sources: new Set([c.source]) });
}
```

The extract worker emits `load_bearing: true` as an additive field on its `claims[]` entry (the schema's "consumers MUST ignore unknown fields" rule already permits it; D-12 promotes it to a defined optional field).

**`escalate` flag pattern (D-12, NEW survivor field)** -- emitted on the survivor record (additive field, after `confidence`; the survivor record is built explicitly in `aggregate()` lines 659-666) on the UNION of: (a) `confidence === 'Contested'` (already computed by `tally`, lines 620-621); (b) `load_bearing === true` (carried in step above); (c) a ~15-20% audit sample of unanimous (3/3 unrefuted) upholds, selected by a STABLE HASH of the cluster id.

**Stable-hash pattern (D-12c) -- copy the FNV-1a `hash32` from the eval tree** (`eval/lz-eval-oof-batch.mjs` lines 50-59) -- there is NO existing deterministic-hash in the runtime aggregator, so author a tiny pure helper in this style (ASCII-only, zero-dep), and select when `hash32(clusterId) / 2^32 < AUDIT_SAMPLE_RATE`:

```javascript
// Source to MIRROR: eval/lz-eval-oof-batch.mjs lines 50-59 (FNV-1a 32-bit)
function hash32(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
```

NEVER `Math.random` -- the aggregator stays a pure function of run-dir contents (D-14; RESEARCH.md Pitfall 4). The audit-sample hash is a DISTRIBUTION hash, NOT a security primitive (RESEARCH.md Security V6) -- collision-resistance is irrelevant, mirroring the schema's percent-encode-not-SHA rationale.

**Fail-closed / safeId pattern (preserve)** -- the new `escalate` logic re-uses cluster ids (`'cluster' + N`, never worker-authored), but route any new content-derived id through `safeId` (lines 149-163) per the V12/V5 frozen discipline.

---

### `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` (test, additive)

**Analog:** itself. Mirror the EXISTING discipline -- discriminating pairs (never tautologies), determinism, frozen-object.

**Discriminating-pair pattern** (`SC5-3` lines 74-87, `SC5-4` lines 89-96) -- a precondition guard prevents a vacuous pass. For the `escalate` audit-sample (branch c), author a DISCRIMINATING PAIR: a 3/3-unanimous-uphold fixture whose cluster id hashes INTO the sample (`escalate === true`) AND a sibling whose id hashes OUT (`escalate === false`). Mirror the SC5-3 precondition-guard comment style. (MEMORY `project_fixture_must_discriminate_ordering`: a single in-sample fixture would be tautological.)

**Determinism pattern** (`TEST-2b` lines 507-550, `SC-1` line 670) -- assert the same run-dir yields byte-identical `escalate` flags across two `aggregate()` calls:

```javascript
const r = aggregate(runDir);
const r2 = aggregate(runDir);
assert.deepEqual(r, r2, 'aggregate must be deterministic (byte-identical) over the same run-dir');
```

**Frozen-object pattern** (`SC5-5` lines 552-569) -- assert the new `AUDIT_SAMPLE_RATE` is frozen + value-pinned:

```javascript
assert.equal(Object.isFrozen(CEILINGS), true);
assert.equal(CEILINGS.MAX_VERIFY_CLAIMS, 24);
// MIRROR for the new constant: assert.equal(Object.isFrozen(AUDIT_SAMPLE_RATE_HOLDER), true) + value-pin
```

**Run via the FILE form ONLY** (header lines 14-18; MEMORY `reference_node_test_dir_exit1_quirk`):

```
node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs
```

**Fixture-resolution pattern** (lines 32-35) -- resolve `__fixtures__` test-file-relative via `fileURLToPath(import.meta.url)`, NEVER `process.cwd()` (cwd drifts under worktrees / headless `-p`).

---

### `plugins/lz-advisor/references/lz-deep-research-schema.md` (config / data contract, additive)

**Analog:** itself -- the frozen contract + its own anti-drift discipline section (lines 29-53).

**Anti-drift lockstep pattern** -- the doc's own rule (lines 49-53): "Any future change to a frozen shape MUST update the code AND this reference in lockstep ... the code wins." ADD `load_bearing` (to the claim record table ~line 165, the survivor record table ~line 418, and the stage-ownership table ~line 532) and `escalate` (to the survivor record, after `confidence`), copying field names byte-for-byte from the code. Quote the new `AUDIT_SAMPLE_RATE` constant byte-for-byte in the named-ceilings block (lines 464-486). The worker-contract SSOT test (`eval/lz-eval-worker-contract.test.mjs` lines 43-54) READS this schema directly -- so a schema-only edit that drifts is caught.

**Lockstep ordering (one wave, do NOT split)** -- edit the aggregator + add the tests + edit the schema doc + edit the extract-worker prompt ALL in one lockstep wave, with the byte-identity test as the gate (RESEARCH.md "additive extension" + Risk 2). Do not let the SKILL.md authoring wave depend on a half-landed schema change.

---

### `plugins/lz-advisor/agents/research-extract-worker.md` (agent worker, request-response)

**Analog:** itself -- emit `load_bearing: true` as an additive field at claim-extraction time (D-12b).

**Claim-record pattern (extend additive)** -- the existing claim-record block (lines 108-121) is the worker's runtime contract (inlined because the worker has no Read tool). Add `load_bearing` to the per-claim entry and a one-paragraph instruction on WHEN to set it (the claim is central/high-consequence -- the worker's judgment). Keep the existing fail-closed field discipline (`id`/`text`/`quote`/`source`, lines 124-135) UNCHANGED. The new field is additive (the schema's "consumers MUST ignore unknown fields", lines 110-112, already permits it).

**Inlined-contract pattern (preserve)** -- the worker's contract is the prose inlined in the prompt (lines 163-167) kept byte-identical to the schema by a dev-time test. The `load_bearing` addition must be mirrored into the schema in the same lockstep wave. The least-privilege `tools: ["WebFetch", "Write"]` grant (line 35) and `model: sonnet` (line 32, INERT) stay UNCHANGED.

---

### `eval/lz-eval-live-cert.mjs` (eval orchestrator, batch / staged-spend) -- gitignored, NEVER ships

**Analog:** `eval/lz-eval-offline-read.mjs` -- the compose-the-frozen-seams shape (it owns the deterministic decision logic and COMPOSES the frozen engine + the search spine; it does NOT spawn subagents itself, header lines 9-13).

**Module-header / tree-boundary pattern** (analog lines 1-28) -- copy the header boilerplate: the eval-tree boundary statement ("lives in the repo-level eval/ tree, NEVER in the distributed plugin tree ... one-directional eval -> runtime, NEVER runtime -> eval"), ASCII-only, zero-direct-npm-deps (the CI math is jstat-backed via the frozen engine, never hand-rolled here), and the guarded-CLI note.

**Frozen-seam reuse (consume byte-identical)** -- import + call the frozen `certifyModel` (analog lines 402-523) and `decisionMatrix` (analog lines 543-604). The over-refusal CP gate MOVES here (RESEARCH.md "What is REUSED" table). The exact compose:

```javascript
// Source: eval/lz-eval-offline-read.mjs (certifyModel; CONSUMED unchanged)
const sonnet = certifyModel({
  model: 'sonnet',
  falseUpholds, nTrap,            // ESTIMAND A over the dense-trap monitor set
  overRefusals, nCtrl,            // ESTIMAND B over the harvested SUPPORTED controls (over-refusal MOVED here)
  traceAudit,                     // { upheldRecords:[...], anyUpholdOnTruncatedOrQuotaKilled }
  difficultyFloorMet, covariateOverlapMet, evidenceAbsentStratumMet,
});
const matrix = decisionMatrix({ haiku, sonnet, opus }); // raiseToUser is ALWAYS true (settle-OR-raise)
```

`certifyModel` returns `WORKS` iff `estimandA.pass` (CP1s false-uphold <= TAU_FU 0.10) AND `estimandB.pass` (CP1s over-refusal <= TAU_OR 0.15) AND the floors met (analog lines 517-519). Reuse `clopperPearsonUpperOneSided` + `EVAL_THRESHOLDS` byte-identical (imported from `lz-eval-aggregate.mjs`, analog lines 38-47).

**OOF adjudication reuse** -- compose `makeBatchedOofProbe` (`eval/lz-eval-oof-batch.mjs` line 42 `BATCH_DEFAULTS` + the `prepareBatches` pre-pass, header lines 22-36) + `runProbeConsensus` for the OUT-OF-FAMILY all-agree gold adjudicator (GPT-5.5 + Gemini), UNCHANGED. The D-04 hybrid routes only the residue (OOF-split / response-set-indeterminate / cheap-vs-unanimous-OOF) to the solo maintainer.

**Resumable vote persistence reuse** -- `persistVote` + `STOP_REASONS` + skip-already-done (analog lines 805-886) for the dual-run vote set. The per-vote search trace is REQUIRED (analog lines 849-873).

**Staged-spend hard-guard pattern (D-07)** -- every model-spend stage THROWS unless `LZ_SPEND=1`; the dry-run runs stubs only (RESEARCH.md "staged blocking spend"):

```javascript
if (process.env.LZ_SPEND !== '1') { throw new Error('refusing to spend: set LZ_SPEND=1'); }
```

Stage 0 (D-19 harvest feasibility probe) -> Stage 1 [HUMAN BLOCK] (freeze gold) -> Stage 2 (dual-run + CP) -> Stage 3 (unanimous-uphold audit). NO optional-stopping (N frozen in advance; RESEARCH.md Pitfall 5).

**Guarded-CLI pattern** (analog lines 896-940) -- copy the `if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]))` guard so `import`-ing the module does NOT run the CLI; exit 0/2 with a `.file`-annotated stderr on `ContractError`.

---

### `eval/lz-eval-live-cert.test.mjs` (test, deterministic-seam) -- gitignored

**Analog:** `eval/lz-eval-offline-read.test.mjs` (deterministic-seam unit tests) + `eval/lz-eval-worker-contract.test.mjs` (SSOT-drift gate shape).

**Stub-only deterministic-seam pattern** -- exercise the harness's deterministic seams (harvest selection, N-freeze guard, `certifyModel` composition, the `LZ_SPEND` hard-guard) with STUBS, no spend. Mirror the `ContractError` fail-closed assertions (the analog's `certifyModel` throws on missing floors / count-mismatch). FILE-form run only (header `node --test eval/lz-eval-live-cert.test.mjs`).

**Cross-tree read pattern** (`lz-eval-worker-contract.test.mjs` lines 25-34) -- read shipped artifacts via `new URL('..', import.meta.url)` (eval -> runtime, one-directional, ships nothing).

---

### `eval/lz-eval-harvest.mjs` (control-set loader, file-I/O / transform) -- gitignored

**Analog:** `eval/lz-eval-control-source.mjs` / `lz-eval-survival-probe.mjs` (control loaders) -- BUT the source is the pipeline's OWN run dirs, not FEVER/VitaminC (D-02 "run the skill on itself").

**Loader pattern** -- read `survivors.json` + the report claim records from a curated set of real run dirs, select SUPPORTED-confidence claims, and difficulty-STRATIFY to OVERSAMPLE dense/contested-evidence claims (the band where correlated cheap-tier errors live). Reuse the eval `listJson` + `readJson` fail-closed read primitives (imported from the runtime aggregator across the tree boundary, `lz-eval-aggregate.mjs` lines 38-45). The two arms (over-refusal control N_ctrl = 40 floor 30; dense-trap monitor N_trap ~34-40 floor 30) are NEVER pooled (D-03).

---

### `eval/lz-eval-live-lock-rule.md` (pre-registration prose) -- gitignored

**Analog:** `eval/lz-eval-lock-rule.md` -- a NEW pre-registered sibling.

**Pre-registration / freeze-before-scoring pattern** (analog lines 1-23, 160-203) -- copy the discipline: written + committed BEFORE any CHEAP scored vote; the prose threshold numbers MUST match `EVAL_THRESHOLDS` byte-for-byte (the anti-drift test asserts prose == code). The live N targets (N_ctrl = 40 floor 30; N_trap ~34-40 floor 30) are run-config TARGETS, not threshold changes -- the `TAU_OR 0.15 / TAU_FU 0.10 / N_CTRL_FLOOR 24` references stay BYTE-IDENTICAL (D-03). Include the N=24-knife-edge arithmetic (0/24 clears 0.15 only at exactly zero; 1/24 -> ~0.183 FAILS; 0/24 -> ~0.117 can FAIL the 0.10 gate). NEVER relax a TAU to fit a realized N (analog line 77). State the distribution-scope limit ("certifies on the maintainer-curated distribution, not all production", D-05; RESEARCH.md Risk 3).

---

### `.gitignore` (config, EDIT)

**Analog:** itself -- add `/.lz-research/` alongside the existing `/eval/.cache/` + `/plans/` entries (lines 8-17):

```
# Deep-research run dirs (audit trail; retained on disk, never committed -- INTEG-02 / AGG-05)
/.lz-research/
```

Verify with `git check-ignore .lz-research/<run-id>/scope.md` (RESEARCH.md INTEG-02).

## Shared Patterns

### Per-invocation `model` override (the single load-bearing orchestration fact)
**Source:** `plugins/lz-advisor/agents/research-search-worker.md` line 35, `research-extract-worker.md` line 32, `research-verify-voter-sonnet.md` line 45, `advisor.md` line 41 (all carry `model:` as DOCUMENTATION).
**Apply to:** the SKILL.md (every Agent dispatch) + a build-time test (D-10/R1).
Plugin-shipped agents' frontmatter `model:` is SILENTLY IGNORED. Tier is controlled ONLY by the orchestrator passing `model` per Agent-invocation. A build-time test must assert this (frontmatter `model:` treated as documentation). Without per-invocation `model`, the whole cost model + the Haiku-OFF/Sonnet-default discipline are unfounded.

### Least-privilege worker tool grants (V4 access control)
**Source:** `research-search-worker.md` lines 50-58 (`["WebSearch", "Write"]`), `research-extract-worker.md` lines 49-55 (`["WebFetch", "Write"]`), `research-verify-voter-sonnet.md` lines 61-70 (per-arm `["WebSearch", "WebFetch", "Write"]` or `["Write"]`), `advisor.md` line 44 (`["Read", "Glob"]`).
**Apply to:** the orchestrator -- it dispatches these as-is; it cannot widen/narrow a subagent's own grant (the grant is the subagent's, Phase 19). The skill's own `allowed-tools` is parsed-not-enforced documentation (D-10).

### Receipt-only return contract (bounded main context)
**Source:** `research-search-worker.md` lines 121-131, `research-extract-worker.md` lines 169-182 (one line, <=~200 chars, counts-only, NO raw text).
**Apply to:** every worker wave in the SKILL.md -- the main session holds ONLY receipts, bounded summaries, and the two advisor notes; raw source text stays in `excerpts/<id>.txt` (RESEARCH.md responsibility map).

### Anti-drift lockstep (code authoritative; doc copies byte-for-byte; dev-time test gates)
**Source:** `lz-deep-research-schema.md` lines 29-53 (the discipline) + `eval/lz-eval-worker-contract.test.mjs` lines 43-54 (the SSOT gate that reads code + prompts + schema) + `lz-deep-research-aggregate.test.mjs` `SC5-5` (frozen-object assertion).
**Apply to:** the `load_bearing`/`escalate` extension (aggregator + schema + extract-worker + test in ONE wave) and the live lock rule (prose == `EVAL_THRESHOLDS`).

### Pre-registration / staged blocking spend (anti-result-shopping)
**Source:** `eval/lz-eval-lock-rule.md` lines 1-23, 160-203 (freeze-before-scoring; prose == code) + the `LZ_SPEND=1` hard-guard (RESEARCH.md code example).
**Apply to:** `lz-eval-live-cert.mjs` + `lz-eval-live-lock-rule.md` -- freeze N + ceilings + estimator BEFORE any CHEAP scored vote; settle-OR-raise (`decisionMatrix.raiseToUser` always true; Sonnet-default ships regardless).

### Host-quirk FILE-form node:test + ASCII-only zero-dep
**Source:** `lz-deep-research-aggregate.test.mjs` header lines 14-18; `lz-eval-worker-contract.test.mjs` line 15; CLAUDE.md / MEMORY `reference_node_test_dir_exit1_quirk`.
**Apply to:** EVERY new/edited `*.test.mjs` -- gate on the explicit `.test.mjs` file form (`node --test <file>`), never the dir form (spuriously exits 1 on this host). ASCII-only source, zero-dep (plugin tree); the eval tree's only dep is the already-pinned `jstat@1.9.6`.

### SC-5 headless scale spike (the build-time UAT)
**Source:** CLAUDE.md "Skill Verification with `claude -p`" + the headless gotchas; RESEARCH.md "SC-5 spike" section.
**Apply to:** the SC-5 spike (D-13). Invocation:
```bash
claude --model sonnet --permission-mode auto --plugin-dir plugins/lz-advisor \
  -p "/lz-advisor:lz-deep-research <fixed question>" --verbose --output-format stream-json
```
`--permission-mode auto` (NOT `acceptEdits`); NO `@file` mention in the `-p` prompt (breaks slash-command recognition -- prose path only); the committed `.claude/settings.json` already disables the marketplace lz-advisor in this repo so the `--plugin-dir` build is under test. Un-fakeable acceptance (parsed from the stream-json trace): max concurrent in-flight Agent calls <= 5 across >= 3 waves; next-batch spawn AFTER all prior-batch results; exit 0 + `survivors.json` on disk + an independent `node` aggregator re-run reproduces the summary; zero worker `Write` failures; advisor spawns == 2. Nested tool-use hides from the parent stream-json -- the per-agent JSONL (`~/.claude/projects/<cwd-hash>/<session>/subagents/agent-<id>.jsonl`) is the documented fallback (MEMORY `project_test_5_tool_budget_threshold_ambiguity`). A MERGED multi-member cluster's votes must key by cluster id and tally correctly (Risk 1 -- a single-member question would not exercise this).

## No Analog Found

None. Every Phase-20 file has a strong in-repo analog (this is the milestone-capping wiring/extension/reuse phase). The closest thing to net-new is:

| File | Role | Data Flow | Reason it is still anchored |
|------|------|-----------|------------------------------|
| `eval/lz-eval-harvest.mjs` | utility (loader) | file-I/O / transform | No prior loader sources from the pipeline's OWN run dirs -- BUT the loader shape (fail-closed read + difficulty-stratify) is the `control-source`/`survival-probe` pattern; only the input corpus is new (D-02 "run the skill on itself"). |
| the `escalate` STABLE-HASH helper | utility (pure fn) | transform | No deterministic hash exists in the RUNTIME aggregator -- BUT the FNV-1a `hash32` style is lifted verbatim from `eval/lz-eval-oof-batch.mjs` lines 50-59 (cross-tree pattern reuse, not a new invention). |

## Metadata

**Analog search scope:** `plugins/lz-advisor/skills/`, `plugins/lz-advisor/agents/`, `plugins/lz-advisor/references/`, `plugins/lz-advisor/skills/lz-deep-research/scripts/`, `eval/`, `.gitignore`, `.claude-plugin/plugin.json`.
**Files scanned:** 12 read in full or in targeted ranges (lz-execute SKILL.md, the aggregator + its test, the schema, the four research agents, advisor, offline-read, lock-rule, aggregate header, oof-batch header, worker-contract test, .gitignore).
**Pattern extraction date:** 2026-06-19
