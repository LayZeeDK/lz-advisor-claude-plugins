---
phase: 16
phase_name: "deterministic-off-model-aggregator-validation-fixture"
project: "lz-advisor"
generated: "2026-06-16"
counts:
  decisions: 8
  lessons: 6
  patterns: 5
  surprises: 4
missing_artifacts: ["16-UAT.md"]
---

# Phase 16 Learnings: deterministic-off-model-aggregator-validation-fixture

## Decisions

### Three-way quote outcome instead of the spike's binary keep/drop
`quoteOutcome` returns `verified` (quote in its CITED excerpt), `downgraded` (quote absent from cited but verbatim-present in SOME OTHER excerpt -- kept, fidelity lowered), or `dropped` (quote absent everywhere). It runs UPSTREAM of `tally()` in `aggregate()`.

**Rationale:** SC-5 demands BOTH "fabricated quote dropped" AND "real-quote / wrong-passage downgraded"; the prototype's binary keep/drop cannot express the second state. The aggregator guards verbatim CONSISTENCY only -- claim-vs-quote ENTAILMENT is the voter's job (Phase 18).
**Source:** 16-CONTEXT.md (D-05, D-06), 16-01-SUMMARY.md

---

### Corroboration counted by distinct source as a LOWER bound
`cluster.sources` is a `Set` of distinct source ids; `corroboration_lower_bound = sources.size`. A paraphrase pair tracing to ONE source counts as 1; different-source near-duplicates merge to a count of distinct sources. The number is labeled a lower bound, never an exact independence count.

**Rationale:** Raw-claim counting inflates confidence from syndicated/paraphrased copies (Pitfall 8). The lexical-only under-merge residual is documented, not solved with an embedding dependency (zero-dep constraint; AGGX-01 deferred).
**Source:** 16-CONTEXT.md (D-08, D-09), 16-01-SUMMARY.md

---

### Frozen survivor record field names chosen deliberately for Phase 17
The `survivors.json` record shape `{id, claim, sources, corroboration_lower_bound, quote_fidelity, confidence}` is the load-bearing contract Phase 17 freezes verbatim, with the run-dir input layout (`claims/<worker-id>.json`, `excerpts/<excerpt-id>.txt`, `votes/<id>-<seat>.json`) also frozen.

**Rationale:** Build the aggregator first so Phase 17's schema is grounded in proven behavior rather than guessed. The names are deliberately picked per RESEARCH guidance 6 / A3 because they propagate downstream.
**Source:** 16-CONTEXT.md (D-02, D-03), 16-01-SUMMARY.md, 16-VERIFICATION.md (PLAN truth 7)

---

### Aggregator ACTIVELY enforces three ceilings, CARRIES two
The frozen `CEILINGS` block (`Object.freeze({ANGLES:5, MAX_FETCH:15, MAX_VERIFY_CLAIMS:24, VOTES_PER_CLAIM:3, SYNTH_CAP:20})`) is the single source of truth. The aggregator actively enforces `MAX_VERIFY_CLAIMS`/`VOTES_PER_CLAIM`/`SYNTH_CAP` (cap after ranking, observable in stdout); it carries `ANGLES`/`MAX_FETCH` as shared contract for the Phase-20 orchestrator to enforce at wave dispatch.

**Rationale:** AGG-06 / SC-4 require code enforcement, not model discretion; the wave-dispatch ceilings are an orchestrator concern. A code comment documents which are active vs carried.
**Source:** 16-CONTEXT.md (D-10, D-11), 16-01-SUMMARY.md

---

### LZ_DR_* env override intentionally NOT wired
The optional ceiling env/flag override (Claude's Discretion / D-12) was omitted; the hardcoded `CEILINGS` defaults are the enforced contract for this phase.

**Rationale:** A config-driven override is a Phase-20 orchestrator concern; wiring it now adds surface the orchestrator does not need. Verified absent (no env read anywhere in the .mjs).
**Source:** 16-CONTEXT.md (D-12), 16-01-SUMMARY.md, 16-VERIFICATION.md (PLAN truth 6)

---

### Pure functions behind a guarded thin CLI
The spike core is refactored into exported pure functions (normalize, jaccard, quoteOutcome, mergeClusters, enforceCeilings, tally, aggregate) importable by the test; a thin CLI guarded by `fileURLToPath(import.meta.url) === path.resolve(process.argv[1])` parses a single positional `<run-dir>`, writes `survivors.json`, prints a counts-only summary, and exits 0/2.

**Rationale:** D-16 separation enables the node:test fixture without the prototype's inline self-seeding; the guard ensures importing the module produces no CLI side effect.
**Source:** 16-CONTEXT.md (D-16), 16-01-PLAN.md, 16-01-SUMMARY.md

---

### node:test stdlib fixture over a bash smoke script
The validation harness is `node:test` + `node:assert/strict` run via `node --test`, co-located with the aggregator under `scripts/` (test + `__fixtures__/<case>/{claims,excerpts,votes}/`).

**Rationale:** A JSON-heavy aggregator under bash invites the exact heredoc/quoting/CRLF hazards CLAUDE.md forbids; node:test is zero-dep and cross-platform. The existing `tests/*.sh` budget gates are a different domain, not a precedent to match.
**Source:** 16-CONTEXT.md (D-13, D-14), 16-DISCUSSION-LOG.md (GA-5)

---

### confidence vocabulary extended with Unsupported (later superseded by Phase 17)
Phase 16 shipped `confidence` as `High | Medium | Low/Contested | Rejected | Unsupported` (Unsupported added per RESEARCH guidance 6 for zero-readable-seats clusters).

**Rationale:** The four spike labels were preserved verbatim; Unsupported covers a cluster with no readable vote seats. NOTE: superseded by Phase 17 (GA-1) which ratified a single enum `High | Medium | Low | Contested | Unsupported` (Rejected dropped, Low/Contested un-fused) via repo-blind cross-model consensus.
**Source:** 16-01-SUMMARY.md (key-decisions + the SUPERSEDED-IN-PART note)

---

## Lessons

### The stdout merge count regressed silently because mergeClusters discarded the raw-claim total
`aggregate()` set `rawCount = clusters.length` (the post-merge output of `mergeClusters`), so `merged` computed to identically 0 for every input and the `clusters:` figure equalled `raw:`. The committed `near-duplicate-merged` fixture (2 claims, 1 cluster) printed `raw: 1 -> clusters: 1 (merged: 0)` instead of `raw: 2 -> clusters: 1 (merged: 1)`. The fixture suite did not catch it -- no test asserted the summary's first line.

**Context:** The summary is the D-03/D-11 load-bearing receipt the Phase-20 orchestrator consumes, and Phase 17 freezes it verbatim -- a broken count would freeze into the schema. Fixed (commit 94023db) by having `mergeClusters` return `{clusters, rawClaimCount}` and adding a regression test asserting line 1.
**Source:** 16-REVIEW.md (CR-01), 16-VERIFICATION.md (post-review fix table)

---

### normalize(undefined) coerces to the literal token "undefined", which can false-verify or wrongly merge
`normalize(s)` began with `String(s)`, so a claim missing its `quote` field produced the token `"undefined"` (non-empty, bypassing the empty-quote guard); if any excerpt contained the word "undefined" the fabricated claim was VERIFIED. Two text-less claims both normalized to `"undefined"` (Jaccard 1.0) and merged into one cluster.

**Context:** The quote re-check is the load-bearing fidelity guard; a fabricated/empty quote silently passing it defeats the phase's purpose. Fixed (94023db) with a non-string type guard returning '' so a missing quote hits the `dropped` path; fixtures never exercised missing quote/text.
**Source:** 16-REVIEW.md (WR-01)

---

### Missing source/text fields silently corrupted the FROZEN record shape
A missing `claims[].text` produced a survivor whose `claim` key was dropped by `JSON.stringify` (undefined own-property), violating the required-string contract. A missing `source` leaked `null` into `sources[]` (declared `string[]`) and two source-less workers collapsed to one `null` Set entry -- silently under-counting corroboration.

**Context:** Per D-08 the `source` field is load-bearing for the whole corroboration mechanism, so a missing field must fail closed. Fixed (94023db) with `ContractError` validation on non-empty text and source in `mergeClusters`; WR-01/02/03 regression tests added.
**Source:** 16-REVIEW.md (WR-02, WR-03), 16-VERIFICATION.md

---

### The test polluted the committed tree by writing the runtime BOM excerpt in place
The CRLF+BOM test wrote `crlf-bom-safe/excerpts/e1.txt` INTO the committed fixture tree on every run, leaving an untracked, non-idempotent artifact (`?? .../crlf-bom-safe/excerpts/`) that risked accidental staging.

**Context:** The intent (author the only non-ASCII bytes at runtime so none is committed) was sound, but the target should be an OS temp dir. Fixed (commit 830b4bf) by assembling the BOM excerpt in `os.tmpdir()`; `git status` is clean after a full test run.
**Source:** 16-REVIEW.md (WR-05), 16-VERIFICATION.md (post-review fix table)

---

### The RESEARCH-suggested paraphrase pair would have produced a vacuous pass
RESEARCH guidance 4 / D-15 case 3 suggested `"X reduces Y by 30%"` vs `"X cuts Y thirty percent"` as a same-source paraphrase pair, but those normalize to `{x,reduces,y,by,30}` vs `{x,cuts,y,30}` -> Jaccard 0.5 (below the 0.6 merge threshold), so they would NOT merge and the corroboration-1 assertion would trivially pass on two unmerged single-member clusters.

**Context:** Plan 16-01 caught this empirically; Plan 16-02 used the genuinely-merging pair `"X reduces Y by 30%"` / `"X reduces Y by thirty percent"` (both normalize to `{x,reduces,y,by,30}`, Jaccard 1.0) and added a `survivors.length === 1` precondition guard BEFORE the corroboration assertion.
**Source:** 16-01-SUMMARY.md (note), 16-02-SUMMARY.md (key-decisions), 16-REVIEW.md (summary)

---

### The Write tool inserts literal BOM bytes where JS source needs the U+FEFF escape
Authoring the aggregator, the Write tool inserted literal U+FEFF (BOM) bytes at points where the source needed the six-character JS escape, breaking the ASCII-only source rule.

**Context:** Resolved by a one-off Node fixer (run, then deleted) replacing literal BOM chars with the ASCII escape; pure-ASCII confirmed via a non-ASCII byte scan (`rg -n "[^\x00-\x7F]"`) before each commit. Recurs for any source that must reference a BOM.
**Source:** 16-01-SUMMARY.md (Issues Encountered)

---

## Patterns

### Three-way quote outcome upstream of vote tally
Run the verbatim quote re-check (verified/downgraded/dropped) BEFORE any vote is read; drop fabricated-quote members so they never reach `tally()`, even when they have passing vote seats.

**When to use:** Any evidence-verification reducer where fidelity must gate before scoring -- proven by `fabricated-quote-dropped` dropping a claim that had 3 unrefuted seats.
**Source:** 16-01-SUMMARY.md (patterns-established), 16-VERIFICATION.md (key-link)

---

### Observability-as-contract: every drop/downgrade/cap is a stdout count
Every merge, drop, downgrade, and ceiling cap surfaces as a count in a deterministic counts-only stdout summary; raw source text never returns through stdout.

**When to use:** Off-model reducers whose receipt an orchestrator consumes without parsing raw evidence -- mirrors the project's `web_tool_usage_must_be_observable` discipline (D-03).
**Source:** 16-01-SUMMARY.md (tech-stack patterns), 16-CONTEXT.md (specifics)

---

### Centralized normalize() comparison primitive
One `normalize()` (BOM strip + CRLF/CR->LF + lowercase + non-alnum->space + number-word fold + drop 'percent') is the single comparison primitive used by BOTH `jaccard` and `quoteOutcome` -- normalize at comparison time, never only at read time.

**When to use:** Whenever multiple comparison operations must agree on tokenization; a divergent ad-hoc normalize in one path silently breaks the other.
**Source:** 16-01-SUMMARY.md (tech-stack patterns), 16-01-PLAN.md (Task 1)

---

### Runtime-generated non-ASCII fixture via String.fromCharCode(0xFEFF)
Generate the one BOM/CRLF test input at runtime in `os.tmpdir()` via `String.fromCharCode(0xFEFF)` + CRLF newlines, so the committed-on-disk bytes stay pure ASCII while still exercising the Layer A+B normalization path on the host.

**When to use:** Proving non-ASCII handling under an ASCII-only-commit constraint (CLAUDE.md cp1252 rule) without committing a non-ASCII byte.
**Source:** 16-02-SUMMARY.md (tech-stack patterns, key-decisions)

---

### Precondition length guard before a per-cluster assertion
Assert `survivors.length === 1` (the pair actually merged) BEFORE asserting that cluster's `corroboration_lower_bound`, closing the vacuous-pass hole where two unmerged single-member clusters each trivially show corroboration 1.

**When to use:** Any test of a merge/dedup invariant where a non-merge would still satisfy the downstream value assertion; pair a contrast fixture (one-source vs two-source) to lock the semantics.
**Source:** 16-02-SUMMARY.md (patterns-established, key-decisions), 16-VALIDATION.md

---

## Surprises

### The whole node:test fixture runs in ~0.12 seconds
The full validation suite (13 named tests driving 6 fixture run-dirs in-process) runs in roughly 0.12s, well under the 2s feedback-latency target.

**Impact:** Allows the suite to run after every task commit and every wave with negligible cost; the single-file gate is the routine regression check.
**Source:** 16-VALIDATION.md (Validation Sign-Off)

---

### `node --test <dir>` spuriously exits 1 on this host even when all tests pass
On the host (Node v24.13.0 / Windows arm64 / Git Bash) the directory form `node --test <dir>` reports a phantom failing test for the directory entry and exits 1 even when every real test passes; only the explicit FILE form is a reliable gate.

**Impact:** The phase gate is pinned to the single-file form (`node --test <file>`). This is a known recurring host quirk (also hit in Phase 18 eval per memory `reference_node_test_dir_exit1_quirk`).
**Source:** 16-02-PLAN.md (Task 3), 16-02-SUMMARY.md (Phase gate), 16-VALIDATION.md

---

### The suite grew from 9 planned to 13 tests via the review fix cycle
The planned suite was 9 named tests (5 SC-5 + 4 hardening); the 16-REVIEW fixes (CR-01 summary count, WR-01/02/03 fail-closed) added 4 regression tests, ending at 13 -- additive coverage with no gap.

**Impact:** The retroactive Nyquist audit found 0 gaps; the review cycle strengthened the frozen contract beyond the original plan map.
**Source:** 16-VALIDATION.md (Validation Audit), 16-VERIFICATION.md

---

### Plan 02 committed 97 fixture files in ~7 minutes
Plan 16-02 created 98 tracked files (1 test + 97 committed fixture files across 6 cases) in roughly 7 minutes, including the 31-claim / 31-excerpt `ceilings-enforced` case.

**Impact:** Fixture authoring at this volume was fast because all files are small synthetic ASCII run-dirs written via the Write tool; the bulk lives in the ceiling case driving the 31->24 cap.
**Source:** 16-02-SUMMARY.md (Performance, key-files)
