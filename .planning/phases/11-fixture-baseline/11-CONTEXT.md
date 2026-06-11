# Phase 11: Fixture baseline - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

The two budget smoke fixtures -- `tests/D-reviewer-budget.sh` (3-slot FRAGMENT_RE for `crit:`/`imp:`/`sug:`/`q:`) and `tests/D-security-reviewer-budget.sh` (4-slot, OWASP `[Axx]` bracket preserved) -- exist as committed, tracked tests under `tests/` that pass green against the CURRENT shorthand grammar in `plugins/lz-advisor/agents/reviewer.md` and `plugins/lz-advisor/agents/security-reviewer.md`, each carrying an anti-vacuous-pass assertion (`matched_count >= min`) that runs BEFORE the word-budget loop. This establishes the regression baseline before any grammar change (Phase 12 does the rewrite; Phase 13 does the empirical n>=3 live runs).

Requirement: GATE-01. This phase makes NO changes under `plugins/lz-advisor/` and NO version bump (the 5-surface 1.0.0 -> 1.0.1 bump is Phase 12 scope, SYNC-02).

</domain>

<decisions>
## Implementation Decisions

### Baseline input source (what the fixtures parse to go green in this phase)
- **D-01:** Primary mode: fixtures self-extract the holistic worked example from the agent files at runtime (strip the `> ` blockquote framing, parse the example findings). This satisfies ROADMAP success criterion 2 literally ("green when run against the current shorthand-grammar agent prompts") and creates automatic lockstep coupling: Phase 12's worked-example rewrite flips the fixtures RED until the parser retargets.
- **D-02:** Secondary mode: `--from-trace <file>` argument parses a captured headless response file instead -- preserves the Phase 08 `--from-trace` replay precedent and lets Phase 13 reuse the same parser + assertions against live `claude -p` output.
- **D-03:** NO live `claude -p` invocation inside the fixtures. Live capture is Phase 13's job (GATE-02, n>=3 budget-gate run); fixtures must be runnable green in the repo at zero session-pool cost.

### Anti-vacuous enforcement
- **D-04:** Runtime assertion `matched_count >= 5` runs BEFORE the word-budget loop in both fixtures (both holistic worked examples contain 7 findings; min 5 follows the PITFALLS.md recommendation).
- **D-05:** Built-in `--self-test` mode feeds the parser a zero-finding input and asserts the fixture exits NON-zero -- proving the fail-loudly behavior reproducibly (PITFALLS.md "Looks Done But Isn't": verify the fixture FAILS when fed zero-finding input).
- **D-06:** Verbose output MUST print the parsed-finding count (a green run showing "0 findings parsed" is the documented silent-pass detection signal).

### Budget-cap fidelity (which caps the parser asserts)
- **D-07:** Fixtures encode the Phase 08 FINAL parser state, not a naive 1:1 copy of the agent `<output_constraints>`: agents stay aimed at canonical word targets; tolerance lives at the fixture-parser layer ONLY (the Phase 7 ef97e21 +10% precedent).
- **D-08:** Specifically carried Phase 08 fixture decisions: backtick-tolerant fragment regex (RES-SHAPE-REGRESSION-PARSER, Plan 08-02: optional leading + trailing backtick on fragment-grammar lines) and PFV `outlier_soft_cap` raised 66w -> 75w on the security fixture (RES-PFV-OUTLIER-CAP, Plan 08-02). Planner verifies exact values against `.planning/milestones/v1.0-ROADMAP.md` Plan 08-02 entries.
- **D-09:** Canonical agent budgets the parser checks (with parser-layer tolerance applied): per-entry <=22w target / <=28w outlier soft cap (prefix excluded from the counted span), `cross_cutting_patterns`/`threat_patterns` <=160w, `missed_surfaces` <=30w, `per_finding_validation` <=60w/entry (agent-canonical; 75w at the security fixture-parser layer per D-08). No aggregate cap -- per-section budgets are the binding constraint, matching the agents' `<output_constraints>` blocks.

### Script conventions and structure
- **D-10:** Two standalone scripts (no shared helper lib, no parameterized single script) -- ROADMAP names both files literally; duplication across exactly 2 zero-dependency files is acceptable and keeps each gate independently runnable.
- **D-11:** Follow the committed `tests/validate-phase-03.sh` / `tests/validate-phase-04.sh` house style: `set -euo pipefail`, `[PASS]`/`[FAIL]` lines with pass/fail counters, ASCII-only output, paths relative to repo root, exit non-zero when any assertion fails.
- **D-12:** 4-slot security fixture preserves the OWASP `[Axx]` bracket as a parsed slot (`<file>:<line>: <severity>: [<OWASP-tag>] <threat>. <fix>.`); the `[Uncategorized]` tag is a valid OWASP-slot value. The 3-slot reviewer shape is `<file>:<line>: <severity>: <problem>. <fix>.`.

### Claude's Discretion
- Exact regex spelling, blockquote-stripping mechanics, and how `--self-test` synthesizes its zero-finding input.
- Whether `verify_request` XML blocks inside `### Findings` are skipped or counted by the parser (Phase 08 fixtures handled them; planner recovers the precedent from the archived roadmap if documented, otherwise picks the simplest correct treatment).
- Per-fixture handling of the security auto-clarity carve-out (the full-prose CVE finding in the holistic example absorbs volume under `per_finding_validation` -- the parser must not flag it as a per-entry budget violation).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirements
- `.planning/ROADMAP.md` -- Phase 11 goal + 4 success criteria (fixture names, green-on-shorthand, anti-vacuous assertion ordering, Phase 08 3-slot/4-slot shape)
- `.planning/REQUIREMENTS.md` -- GATE-01 wording + milestone locked-decisions table (Route A, section-per-severity, unified vocab, 1.0.1 -- all Phase 12+ scope, listed here so the planner does not pull them forward)

### Milestone research (fully scopes this phase; research-phase skippable per SUMMARY.md)
- `.planning/research/SUMMARY.md` -- build-order step 0 rationale; "Phase 1 (Requirements + fixtures)" guidance
- `.planning/research/ARCHITECTURE.md` -- "CRITICAL pre-finding: the smoke fixtures are not committed" (lines 73-77); STEP 0 re-author instructions (lines 194-199); fixture integration map
- `.planning/research/PITFALLS.md` -- Pitfall 2 (regression-fixture lockstep + vacuous pass, with the `matched_count >= min` and fail-loudly requirements); the "Looks Done But Isn't" checklist
- `.planning/research/STACK.md` + `.planning/research/FEATURES.md` -- fixture surface enumeration (FRAGMENT_RE dependency graph)

### Grammar source of truth (what the fixtures parse)
- `plugins/lz-advisor/agents/reviewer.md` -- 3-slot fragment grammar (Format line ~59, severity legend 64-67, holistic worked example 123-144, `<output_constraints>` 160-187)
- `plugins/lz-advisor/agents/security-reviewer.md` -- 4-slot grammar with OWASP `[Axx]` (Format line 60, legend 65-68, holistic example ~135-141, `<output_constraints>` ~168-182, auto-clarity CVE carve-out note ~151)

### Fixture-shape precedents (Phase 08 decisions)
- `.planning/milestones/v1.0-ROADMAP.md` -- Plan 08-02 (SHAPE regex loosening: optional leading/trailing backtick; PFV outlier_soft_cap 66w -> 75w), Plan 07-17 (3x re-run gate protocol), Phase 7 ef97e21 +10% parser-layer tolerance precedent
- `tests/validate-phase-03.sh` + `tests/validate-phase-04.sh` -- the committed house style for tracked test scripts (PASS/FAIL counters, git grep assertions, repo-root relative)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tests/validate-phase-03.sh` / `tests/validate-phase-04.sh`: the only committed test scripts; their assertion/reporting skeleton (pass()/fail() helpers, counters, exit logic) is the template for the new fixtures.
- Agent holistic worked examples (reviewer.md lines 125-144, security-reviewer.md ~135-141): canonical grammar demonstrations with 7 findings each -- the self-extracting baseline input (D-01).

### Established Patterns
- Empirically confirmed (3 ways: `git ls-files`, `git grep -l FRAGMENT_RE`, `rg -uu -l FRAGMENT_RE`): the budget fixtures exist NOWHERE on disk -- this phase authors them fresh, it does not edit anything.
- Phase 7/8 precedent: agents aim at canonical word targets; all slack is applied at the fixture-parser layer (+10% ef97e21; PFV 75w cap 08-02). Never loosen the agent's stated budget.
- The fixtures' historical home was transient `.planning/phases/<phase>/` workspaces (cleared at v1.0 completion) -- committing under `tests/` is the durability fix.

### Integration Points
- Fixture file names are referenced by name inside `agents/reviewer.md` (~line 189) and `agents/security-reviewer.md` (~line 194) -- the committed paths must match those references (`D-reviewer-budget.sh`, `D-security-reviewer-budget.sh`).
- Phase 12 consumes these fixtures as its lockstep retarget target (RED on old shorthand, GREEN on new sample); Phase 13 reuses the parser via `--from-trace` against captured live output.

</code_context>

<specifics>
## Specific Ideas

- The fixtures should be self-contained regression gates: `bash tests/D-reviewer-budget.sh` from repo root with no arguments = parse the agent file's own worked example and assert grammar + budgets; `--from-trace <file>` = same assertions against captured output; `--self-test` = prove fail-loudly on zero-finding input.
- min threshold 5 comes from PITFALLS.md ("e.g., >= 5 for the holistic example"); both holistic examples currently carry 7 findings, leaving headroom of 2.

</specifics>

<deferred>
## Deferred Ideas

### Reviewed Todos (not folded)
- **Research RTK command suitability for skills and agents** (`.planning/todos/pending/research-rtk-command-suitability-for-skills-and-agents.md`, match score 0.2 -- below the 0.4 auto-fold threshold): RTK token-savings analysis for review skills is plugin-tooling research, unrelated to fixture authoring. Stays pending.

No other deferred ideas -- discussion stayed within phase scope. (Phase 12 decisions -- grouped grammar, vocabulary, version bump -- were intentionally NOT pulled forward.)

</deferred>

---

*Phase: 11-Fixture baseline*
*Context gathered: 2026-06-07*
