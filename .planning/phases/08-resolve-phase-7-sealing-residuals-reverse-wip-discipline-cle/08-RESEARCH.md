# Phase 8: Resolve Phase 7 sealing residuals + reverse wip-discipline + clear Phase 8 carry-forward backlog - Research

**Researched:** 2026-05-18
**Domain:** Plugin behavior contract refinement + smoke-test parser hardening + measurement-driven gate decision + Class-2 escalation observability
**Confidence:** HIGH

## Summary

Phase 8 ships 7 plans on plugin 0.13.1 (-> 0.14.x). Most plans are mechanical, well-scoped, and have unambiguous validation harnesses already in place. Two findings change planning priorities:

1. **WR-04 and WR-05 (Plan 5 scope) are ALREADY CLOSED on main.** Commits `7f28903` (WR-04 schema BNF) and `5ea449f` (WR-05 worked-example severity) landed 2026-05-05 in the Phase 7 window. `git grep` confirms zero remaining hits for `Severity: High`, `Severity: Medium`, or `|high|medium` across the plugin. CONTEXT.md describes Plan 5 as if these edits are pending; the planner MUST verify current state and either reduce Plan 5 to a no-op audit step (recording the discovery in 08-SUMMARY.md) OR repurpose Plan 5 (e.g., a different mechanical edit). The locked decision D-01 still calls for 7 plans, so Plan 5 should remain in slot 5 of the version trail to preserve ordering but its content needs reconciliation.

2. **The trace inventory is richer than CONTEXT.md states.** `traces/` contains **9 captured trace files (not 5)**: 5 strict-gate FAILs from 0.13.0 + 0.13.1, plus 4 tolerance-gate runs from 0.13.1. The strict-gate 0.13.0 traces (`0.13.0-strict-D-reviewer-budget-run-2.txt`, `0.13.0-strict-D-security-reviewer-budget-run-2.txt`, `0.13.0-strict-D-security-reviewer-budget-run-3.txt`) and the 0.13.1 strict traces (4 files) exhibit the backtick-wrapped finding-line SHAPE failure that Plan 2's regex change addresses. Use all 9 traces for `--from-trace` replay coverage; the 5-count in CONTEXT.md was a conservative estimate.

Everything else in CONTEXT.md is accurate at the file-level and line-number level.

**Primary recommendation:** Plan 5 must be either retired or repurposed; the planner cannot ship a no-op as drafted. Plan 2's regex change is well-defined and trace-replay verifiable with high confidence. Plans 1, 3, 4 (conditional), 6, 7 have clean scope and acceptance criteria.

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Phase 8 ships **7 plans** in tight multi-step ordering. Plan 1 (P0 wip) is independent contract-shape change. Plans 2 + 5 are fixture-parser-layer / doc-only PATCH-tier additions (parallelizable). Plan 3 (P2 measure) accumulates measurement artifact only; no behavior change. Plan 4 ships ONLY if compound OR-gate fires per disposition rule. Plans 6 + 7 add evidence-weighted P3 surfaces. Recommended execution order (PATCH-first principle; superseded by D-04 -- version cadence is not load-bearing, but plan ordering still respects logical dependency).
  - Plan 1: P0 wip-discipline reversal -- ~60 lines removed across 3 files.
  - Plan 2: P1 SHAPE + PFV parser bundle -- loosen regex + raise PFV outlier_soft_cap.
  - Plan 3: P2 measure -- per-item code-block flag detection + n=3 fixture-grade across Compodoc + generic feature + refactor scenarios.
  - Plan 4: P2 structural conditional -- ships ONLY if Plan 3 OR-gate fires.
  - Plan 5: P3 mechanical (WR-04 + WR-05).
  - Plan 6: P8-18 advisor narrative SD self-anchor.
  - Plan 7: FIND-F Class-2 Escalation Hook observability.

- **D-02:** Compound OR-gate + disposition rule + measurement artifact. Single-predicate alternatives rejected.
  - D1 (code-block disjunct): >=2/3 runs have >=1 code-block item over per-item hard cap (15w fragment / 22w Assuming-frame).
  - D2 (aggregate disjunct): mean aggregate >100w (no tolerance) AND >=2/3 per-run aggregate >110w (+10% tolerance).
  - Each disjunct independently carries the >=2/3 FAIL stochastic-outlier guard (Plan 07-12 precedent).
  - **Disposition rule:** D1 alone -> fragment-grammar template extension in advisor.md. D2 alone -> density example audit. Both -> ship both atomically. Neither -> P2 closes structurally. Escalation: per-section `<output_constraints>` XML extension (Plan 07-14 canon mirror) if measurement reveals structural binding failure.
  - **Borderline band:** D1 INCONCLUSIVE if exactly 2/3 code-block-FAIL AND all FAIL items in [15w, 17w] or [22w, 25w] soft band. D2 INCONCLUSIVE if mean in [98w, 105w] AND per-run pattern non-decisive. Compound INCONCLUSIVE if either is INCONCLUSIVE.
  - **Measurement artifact (`08-MEASUREMENT.md`):** per-run aggregate, per-item words, per-item code-block flag, per-item assuming-frame flag, gate decision (PASS/FAIL/INCONCLUSIVE), disposition selected.

- **D-03:** Auto-extend on borderline (tri-state). INCONCLUSIVE at n=3 -> Plan 3.5 (n=2 more, total n=5). INCONCLUSIVE at n=5 -> Plan 3.6 (n=10 statistical gate; Plan 07-15 E.1 precedent). Cost profile: 3 sessions (unambiguous), 5 sessions (INCONCLUSIVE-at-3), 10 sessions (worst case).

- **D-04:** Version numbers are not load-bearing in this pre-release plugin. Planner picks any coherent trail. Atomic 5-surface version sync hard constraint preserved.

### Claude's Discretion

- PFV outlier_soft_cap target value: 75w vs 80w on `D-security-reviewer-budget.sh`. Decide based on n=3 fresh re-run distribution.
- Symmetric vs asymmetric PFV cap raise: asymmetric (security-reviewer only) is default; symmetric raise OK if n=3 surfaces D-reviewer PFV outliers in [60w, 75w].
- Feature implementation + refactor prompt composition for Plan 3 (Compodoc prompt locked; other two scenario prompts open).
- Code-block detection regex in Plan 3 parser: backtick-fenced (single / triple / 4+) is minimum bar; multi-backtick block detection is a stronger signal.
- Plan 7 fixture extension vs standalone: standalone `F-class-2-escalation.sh` matches letter-based naming convention (F is unused; F = FIND-F anchor).
- Plan 6 sub-rule placement: extend Rule 5b vs add Rule 5c. Suggested: extend 5b.
- Plan 1 ordering relative to other plans: independent; planner picks. Suggested PATCH-first.
- Plan 4 version classification (if it ships): PATCH for fragment-grammar template extension; MINOR if escalation path triggers.

### Deferred Ideas (OUT OF SCOPE)

- P8-03 Pre-Verified Contradiction Rule -- defensive rule; no empirical FAIL evidence. Defer to Phase 9.
- P8-12 Cross-Skill Hedge Tracking auto-detect -- enhancement; no empirical FAIL evidence. Defer to Phase 9.
- Per-section `<output_constraints>` XML extension to advisor.md (default fix is fragment-grammar template extension; escalation only if Plan 3 measurement reveals structural binding failure).
- n=10 statistical gate -- worst case only.
- 1.0.0 marketplace-readiness cut -- deferred until carry-forward backlog clears.
- Reviewer + security-reviewer per-section XML contract changes (Plan 07-14 canon preserved).
- Hard-rules layer for word-budget on advisor (deferred from Phase 7 D-03).
- maxTurns cap removal / SendMessage-based bidirectional advisor.
- README "Recommended prompt shape" section.
- Pattern D as claude -p linter / pre-flight check.
- Plugin README update for Phase 8 contract changes.
- TeammateIdle hook analog (no hooks for v1).
- Reviewer iterative re-invoke loop (Spotify Honk one-shot principle preserved).
- Pro / Free plan tier UAT.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RES-WIP-DISCIPLINE-REVERSAL | Remove Plan 07-08 wip rule + path-d assertion + GAP-G2 row | Plan 1 surface inventory complete (see Removal Surface Inventory). Lines 224-286 in execute SKILL.md; lines 160-188 + 217-269 in E-verify-before-commit.sh; line 70-71 in REQUIREMENTS.md |
| RES-SHAPE-REGRESSION-PARSER | Loosen smoke parser regex to accept optional leading + trailing backtick | Plan 2: exact regex change documented (D-reviewer-budget.sh:154 + D-security-reviewer-budget.sh:154). 9 traces available for --from-trace replay |
| RES-PFV-OUTLIER-CAP | Raise PFV outlier_soft_cap 66w -> 75-80w on D-security-reviewer-budget.sh | Plan 2: cap location is line 238 (per-finding-validation check-pfv-entries.mjs). Two values to set: target 60w (line 240) + outlier 66w (line 238) |
| RES-ADVISOR-FRAGMENT-GRAMMAR | n>=3 fixture-grade measurement; conditional structural fix | Plan 3 + Plan 4: D-advisor-budget.sh parser already has `ADVISOR_FRAGMENT_RE` + `ASSUMING_FRAME_RE` (lines 89, 96); per-item code-block flag detection insertion target is the matches.forEach() loop at line 112 |
| WR-04 | Schema BNF severity allow-list legacy `high\|medium` residual | **ALREADY CLOSED** on main per commit 7f28903 (2026-05-05); current line 376 reads `severity="<critical\|important\|suggestion>"`. Plan 5 must reconcile |
| WR-05 | Worked-example demo `Severity: High` residual | **ALREADY CLOSED** on main per commit 5ea449f (2026-05-05); current line 317 reads `Severity: Important`. Plan 5 must reconcile |
| P8-03 (deferred) | Pre-Verified Contradiction Rule | Out of Phase 8 scope per CONTEXT D-01 |
| P8-12 (deferred) | Cross-Skill Hedge Tracking | Out of Phase 8 scope per CONTEXT D-01 |
| P8-18 | Self-anchor through advisor narrative SD prose | Plan 6: Rule 5b extension in context-packaging.md lines 48-80 (or add Rule 5c after 5b); new smoke fixture (suggested name `G-advisor-narrative-sd-pv.sh` -- letter G is reusable per CONTEXT) |
| FIND-F-CLASS-2-OBSERVABILITY | Class-2 Escalation Hook conditional firing observability | Plan 7: existing `## Class-2 Escalation Hook` section at security-reviewer.md lines 263-289. `<verify_request>` schema documented at context-packaging.md lines 369-409. CVE candidates researched (see Plan 7 section) |

## Project Constraints (from CLAUDE.md)

The repo's CLAUDE.md and global user CLAUDE.md impose the following directives that constrain Phase 8 execution:

- **ASCII-only output everywhere.** No emojis, no curly quotes, no em dashes (use `--`), no Unicode bullets (use `*` / `-`). Affects all SUMMARY.md / MEASUREMENT.md / smoke-fixture script text.
- **Never use `git add .` / `git add -A` / `git add -u`.** Stage specific files by name. Affects every commit in Phase 8.
- **`git mv` for renames.** Affects nothing in Phase 8 (no renames planned) but applies if any file restructure surfaces.
- **No AI attribution in commits.** No `Co-Authored-By`, no `Generated with`. Standard for all Phase 8 commits.
- **Content Search:** `git grep -n "pattern"` preferred over `rg`. `rg -uu` for git-ignored paths (e.g., node_modules). NEVER `| grep`; always `| rg`.
- **Bash tool runs Git Bash** on Windows. Inline scripts must be Git Bash-compatible. Permanent scripts prefer Node.js ESM (.mjs) or PowerShell Core (.ps1).
- **No multi-line heredocs in Bash tool.** Use Write tool for files >1 line.
- **Avoid `cd <path> &&` prefix on commands.** Defeats allowed-tools pattern matching. Run commands directly or use separate cd calls.
- **No backticks / `$(...)` / `$VAR` in `-e` / `-c` inline-script flags wrapped in double quotes.** Bash command-substitutes them before the inner runtime sees them. Use temp script files instead.
- **Skill Verification with `claude -p`** convention:
  - Pattern: `claude --model sonnet --effort medium --plugin-dir plugins/lz-advisor -p "/lz-advisor.<skill-name> <realistic task prompt>" --verbose`
  - Use slash-command syntax (`/lz-advisor.<skill>`) not natural-language triggers.
  - Verify orientation references specific files; advisor SD <100w enumerated; expected artifact present.
- **GSD Workflow Enforcement:** All file changes must run through GSD commands (`/gsd-execute-phase` for planned work). Direct edits forbidden outside GSD workflow.
- **Project context:** plugin-only, no API dependency, no external runtime, Markdown + YAML only. Sonnet 4.6 + Opus 4.7 model availability assumed.

## Standard Stack

### Core (already installed; Phase 8 uses these without modification)

| Component | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| Claude Code | (host CLI) | Plugin runtime | The plugin runs as a Claude Code plugin only |
| Sonnet 4.6 | session model | Executor in all skills | Plugin design constraint (no model override on skills) |
| Opus 4.7 | advisor agent | Strategic direction | Plugin design constraint (`model: opus` in 3 agents) |
| Git Bash (Windows) | system shell | Smoke-test runtime | Phase 8 smoke fixtures (D-*, E-, F-, G-) run in Git Bash |
| Node.js ESM (.mjs) | local installed | Smoke-test parser logic | Existing parsers in `D-*-budget.sh` use Node ESM via `cat > "$SCRIPT" << EOF` |
| ripgrep (`rg`) | local installed | Smoke-test stdin filtering | Already used in D-*-budget.sh and E-verify-before-commit.sh |
| awk (POSIX) | local installed | Smoke-test section extraction | Already used in D-*-budget.sh for findings-body / pfv-body / ccp-body extraction |

### Supporting (Phase 8 introduces / extends)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `08-MEASUREMENT.md` (NEW file) | -- | Plan 3 durable measurement artifact | Plan 3 writes per-run aggregate + per-item words + flags; Plan 4 reads it to pick disposition |
| `F-class-2-escalation.sh` (NEW smoke fixture) | -- | Plan 7 Class-2 trigger scenario | Designs trigger; runs claude -p; asserts `<verify_request class="2"` block emission |
| `G-advisor-narrative-sd-pv.sh` (NEW smoke fixture) | -- | Plan 6 advisor narrative SD pv-extension | Synthesizes advisor SD with false technical claim; asserts executor verifies or flags as hedge |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `D-advisor-budget.sh` parser extension (Plan 3) | Separate `D-advisor-codeblock.sh` fixture | Locked decision: extend existing parser (CONTEXT.md `<code_context>` integration plan) |
| `--from-trace` replay validation (Plan 2) | n=3 fresh re-runs only | Locked decision: trace replay is zero-cost; complement with n=3 PFV fresh runs (PFV threshold change can't trace-replay because it changes future-output classification) |
| Single-disjunct gate (Plan 3 evidentiary structure) | D-02 compound OR-gate | Locked decision: compound is foundational per "highest quality, no shortcuts" directive |

**Installation:** No new packages required. All Phase 8 infrastructure uses already-installed tools.

**Version verification:** The plugin version is currently 0.13.1 across all 5 surfaces (`plugin.json` + 4 `SKILL.md` frontmatter). Confirmed via `git grep -n "version:" plugins/lz-advisor/skills/lz-advisor.*/SKILL.md plugins/lz-advisor/.claude-plugin/plugin.json` (all hits show `0.13.1`).

## Architecture Patterns

### Pattern 1: Compound OR-gate with disposition rule (D-02)

**What:** Two independent disjuncts (D1 code-block + D2 aggregate); either firing triggers Plan 4. Disposition selects fix surface based on which disjunct fires.

**When to use:** Multi-modal residual where the fix surface depends on which failure mode dominates.

**Anchor:** Plan 3 (P2 measurement) writes `08-MEASUREMENT.md`; Plan 4 conditional reads it to pick disposition.

### Pattern 2: Trace-replay validation infrastructure

**What:** `--from-trace <file>` flag on `D-{reviewer,security-reviewer}-budget.sh` skips `claude -p` invocation and feeds the trace file as the agent output to the parser. Validation runs at zero `claude -p` spend.

**Example:**
```bash
# Source: D-reviewer-budget.sh lines 30-87 (--from-trace flag handling)
bash D-reviewer-budget.sh --from-trace .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/traces/0.13.0-strict-D-reviewer-budget-run-2.txt
```

**When to use:** Plan 2 parser regex change validation. Must FLIP from FAIL to PASS on all 9 captured traces after regex update.

### Pattern 3: Atomic 5-surface version sync (D-04 hard constraint)

**What:** When a version bump occurs, all 5 surfaces move together within a single commit:
1. `plugins/lz-advisor/.claude-plugin/plugin.json` `"version"` field (line 3 currently)
2. `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` frontmatter `version:` (line 18 currently)
3. `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` frontmatter `version:` (line 19 currently)
4. `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` frontmatter `version:` (line 19 currently)
5. `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` frontmatter `version:` (line 19 currently)

**Anchor:** Plan 07-15 / 07-17 atomic-5-surface canon (commits `bf8a8db` + `1c30729`).

### Pattern 4: Fragment-grammar emit template canon (Plan 07-10)

**What:** Each finding / numbered item emits as a single line with verb-led action + concrete object + one-clause rationale or Assuming-frame.

**Plan 4 D1 disposition target:** advisor.md `## Output Constraint` section (lines 51-100) -- specifically the per-item Format line (line 60) + Density example blocks (lines 86-100).

**Plan 4 D2 disposition target:** advisor.md Density example blocks (Plan 05.5-03 commit `84aaa5b` -- the prose-density surface that may have drifted aggregate up).

**Plan 4 escalation target (if structural binding fails):** advisor.md `## Output Constraint` (lines 51-100) replaced with per-section `<output_constraints>` XML mirror of security-reviewer.md lines 165-192.

### Anti-Patterns to Avoid

- **Reusing a no-op as a plan.** If Plan 5 is reduced to a verification-only audit because WR-04 + WR-05 are already closed, the plan must explicitly say so in its PLAN.md so downstream auditors don't wonder why it shipped zero file changes.
- **Trace-replay alone for PFV cap raise.** Plan 2's regex change is fully trace-replay validatable; the PFV cap change is NOT (raising the cap changes which findings cross the threshold on FUTURE runs, not historical ones). Plan 2 must include n=3 fresh `D-security-reviewer-budget.sh` re-runs against the live plugin for PFV validation.
- **Synthesizing advisor SD in Plan 6 smoke fixture without empirical anchor.** The fixture must mirror the Phase 7 closure amendment's evidence (advisor narrative SD prose self-anchor leak) -- not invent a contrived claim. Suggested anchor: an advisor SD that contains a TypeScript 5 feature claim or an Nx 19 configuration claim that the executor must verify before propagating.
- **Class-2 trigger scenario in Plan 7 using a stale CVE.** Pick a current, well-documented CVE with stable version data. See "Plan 7 CVE candidates" section below.
- **Removing the wip-discipline section without checking for downstream skill references.** The execute SKILL.md's `<verify_before_commit>` block has a "Phase 4 step 0" cross-reference (line 311). Plan 1 must update or remove this cross-reference too.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSONL trace parsing for advisor SD extraction (Plan 3) | New Node script | Existing `extract-advisor-sd.mjs` | Already integrated with `D-advisor-budget.sh` lines 55-57 |
| Trace-replay validation (Plan 2) | New CLI wrapper | Existing `--from-trace <file>` flag | Already implemented in `D-{reviewer,security-reviewer}-budget.sh` |
| Section extraction from agent output (any new fixture) | Custom regex pipeline | Existing `awk '/^### Findings/ {flag=1; next} flag && /^### / {flag=0} flag {print}'` idiom from D-reviewer-budget.sh:135-139 | Already battle-tested for Plan 07-15 boundary-termination edge case |
| Per-finding word-count parser (any new fixture) | Custom split | Existing `check-entries.mjs` heredoc pattern in D-reviewer-budget.sh:144-201 | Already handles fragment-grammar shape + backward-compat fallback |
| Severity-prefix regex (Plan 2) | Hand-rolled allow-list | Reuse current `(?:crit\|imp\|sug\|q)` literal | Plan 07-09 + 07-13 lexicon canon |
| Class-2 escalation scaffolding (Plan 7) | New executor code path | Existing `## Class-2 Escalation Hook` in security-reviewer.md lines 263-289 + `<verify_request>` schema in context-packaging.md lines 369-409 | Plan 07-13 structural canon preserved; Plan 7 only designs trigger scenario |
| Version sync mechanic (any version bump) | Custom bump script | Manual 5-file edit in one commit | Atomic 5-surface canon (Plan 07-15 / 07-17) |

**Key insight:** Phase 8 is almost entirely a composition of existing canonical patterns. The novel design surfaces are (a) Plan 3's compound OR-gate + measurement artifact, (b) Plan 7's CVE trigger scenario design, and (c) Plan 6's advisor narrative SD pv-extension. Everything else extends or modifies existing structure.

## Common Pitfalls

### Pitfall 1: Backtick-wrapped finding lines NOT matched by current regex (Plan 2 SHAPE)

**What goes wrong:** The current parser regex at `D-reviewer-budget.sh:154`:
```
/^[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):\s+(.+)$/gm
```
requires the line to START with a non-whitespace non-colon character. But Sonnet 4.6 wraps findings in backticks for markdown emphasis:
```
`review-src/handler.ts:7: crit: unguarded JSON.parse...`
```
The leading backtick character ` ` ` is not `[^:\s]` in the strictest reading because `[^:\s]` actually MATCHES backtick (backtick is non-colon non-whitespace), but the regex anchor `^` requires the line start, and the trailing backtick at line end is consumed by `(.+)$` -- HOWEVER, the captured `.+` then contains the trailing backtick, which is harmless for word counting. The actual SHAPE failure is more subtle: when the agent emits `` `<file>:<line>: <severity>: <body>` `` with backticks AT BOTH ENDS, the regex does match (leading backtick is `[^:\s]`), but only when `<file>` does not contain `/`. Actually, `[^:\s]` matches `/` too. Let me trace once more: the regex `^[^:\s]+:` reads "line start, one or more non-colon non-whitespace, colon". Backtick is non-colon non-whitespace, so `` `review-src `` matches `[^:\s]+` (backtick + alphanumeric + `/` + alphanumeric). Then the colon after `handler.ts` is consumed. So this regex SHOULD match the backtick-wrapped line.

**Investigation needed by planner:** Run the current regex against the captured trace and observe what fails. Hypothesis: the failure is in the trailing backtick interaction with `(.+)$` greedy match, OR in the multi-line `m` flag interaction with multi-line backtick fences. The CONTEXT.md proposed new regex (`/^\`?[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):.+\`?$/m`) explicitly anchors both leading and trailing backticks as optional, which makes the SHAPE matching unambiguous. The planner should:
1. Replicate the FAIL on a captured trace by running the unmodified parser
2. Apply the proposed regex change
3. Re-replay; assert FLIP from FAIL to PASS

**Why it happens:** Markdown idiom: Sonnet 4.6 emits backticks around code-like content (file paths, severity tokens) for visual clarity. The fragment-grammar emit template doesn't explicitly forbid this; the parser was designed for the un-wrapped shape.

**How to avoid:** Plan 2's exact regex change. Use the proposed regex literally.

**Warning signs:** Trace files in `traces/` show `` `<file>:<line>: <severity>: <body>` `` shape (visible by reading the first finding line of any 0.13.0-strict or 0.13.1-strict trace).

### Pitfall 2: PFV cap raise cannot be trace-replay validated

**What goes wrong:** Plan 2 raises `outlier_soft_cap` from 66w to 75-80w. The captured traces have PFV entries at their fixed historical word counts. Raising the cap reclassifies those entries' status but does NOT introduce new behavior.

**Why it happens:** Cap thresholds operate on FUTURE outputs. A trace-replay validates the parser change, not the threshold change.

**How to avoid:** Plan 2 must include n=3 fresh `D-security-reviewer-budget.sh` runs against the live plugin AFTER the cap change. Each run must PASS (no PFV-related FAIL) without exhibiting any other regression. Cost: 3x `claude -p` invocations on the canonical scenario (~$0.50-$1.50 estimated).

### Pitfall 3: Plan 4 conditional firing decision based on stale or partial 08-MEASUREMENT.md

**What goes wrong:** If `08-MEASUREMENT.md` is missing a required field (e.g., the per-item code-block flag), Plan 4 disposition cannot be selected mechanically.

**Why it happens:** Plan 3 (P2 measure) must emit a structurally-complete artifact. Fields: per-run aggregate (n=3 or n=5), per-item words, per-item code-block flag (boolean), per-item assuming-frame flag (boolean), gate decision (PASS/FAIL/INCONCLUSIVE), disposition selected (D1/D2/both/neither/escalation/N/A), scenarios run (Compodoc + feature + refactor + optional + optional).

**How to avoid:** Plan 3 PLAN.md must specify the 08-MEASUREMENT.md schema upfront. Suggested schema (planner-finalized):

```markdown
# 08-MEASUREMENT.md: P2-ADVISOR fixture-grade measurement

## Scenarios

| # | Scenario | Prompt | Trace path |
|---|----------|--------|------------|
| 1 | Compodoc | (canonical from memory: project_compodoc_uat_initial_plan_prompt.md) | uat-replay-0.14.x/scenario-1.jsonl |
| 2 | Feature implementation | (TBD planner) | uat-replay-0.14.x/scenario-2.jsonl |
| 3 | Refactor | (TBD planner) | uat-replay-0.14.x/scenario-3.jsonl |

## Per-run results

| Run | Aggregate (w) | Per-item words (csv) | Per-item code-block flag | Per-item assuming-frame flag | Per-item over-cap? |
|-----|---------------|----------------------|--------------------------|------------------------------|--------------------|
| 1   | 102           | 18,15,19,12,20       | 0,1,1,0,0                | 0,0,0,1,0                    | 1,0,1,0,1          |
| ... | ...           | ...                  | ...                      | ...                          | ...                |

## Gate decision

- D1 (code-block disjunct): {PASS|FAIL|INCONCLUSIVE} -- {X}/3 runs have >=1 code-block item over per-item cap
- D2 (aggregate disjunct): {PASS|FAIL|INCONCLUSIVE} -- mean aggregate = {Yw}; {Z}/3 per-run aggregate >110w
- Compound: {PASS|FAIL|INCONCLUSIVE}
- Disposition: {N/A | fragment-grammar template extension | density example audit | both atomic | escalation to <output_constraints> XML}
```

### Pitfall 4: Plan 7 trigger scenario using a CVE Sonnet 4.6 already knows about cold

**What goes wrong:** If Sonnet has CVE knowledge from training, the executor might resolve the Class-2 question from prior knowledge, never invoking WebSearch / WebFetch -- and security-reviewer never emits a `<verify_request>` block.

**Why it happens:** Class-2 escalation hook fires when security-reviewer cannot resolve from local context alone. Sonnet 4.6 + training cutoff Jan 2026 likely covers most 2024 CVEs.

**How to avoid:**
- Use a recent CVE (publication after Sonnet 4.6 training cutoff)
- Use a version-conditional question (specific patch level matters)
- Frame the question so the security-reviewer agent encounters it during scan and cannot resolve via `[Read, Glob]` alone
- Suggested: `systeminformation@<5.27.14` CVE-2025-68154 (command injection, published Dec 2025; vulnerable version range needs version lookup). See "Plan 7 CVE candidates" below.

### Pitfall 5: Plan 5 ships an empty commit because WR-04 + WR-05 already landed

**What goes wrong:** CONTEXT.md describes Plan 5 as 2 mechanical edits to context-packaging.md lines 317 + 376. Both edits already landed in Phase 7 commits `7f28903` (WR-04) and `5ea449f` (WR-05). Running Plan 5 as drafted produces zero file changes.

**Why it happens:** Phase 7 closure was non-monotonic: WR-04 / WR-05 were deferred in the 2026-05-05 closure_amendment but were ALSO fixed in the same day (commits 7f28903 + 5ea449f). The deferral note was preserved in 07-VERIFICATION.md but the underlying fixes ALSO landed. CONTEXT.md inherited the deferral note without re-checking file state.

**How to avoid:**
- Plan 5 PLAN.md must include `<read_first>` for `git grep -n "Severity: High" plugins/lz-advisor/` and `git grep -nF "high|medium" plugins/lz-advisor/`; if both return zero matches, the plan documents the prior closure and ships nothing OR is repurposed.
- Repurposing option: Plan 5 becomes a CONTEXT.md / REQUIREMENTS.md reconciliation step — remove the stale WR-04 / WR-05 deferral references from the planning trail, register the items as RESOLVED.

### Pitfall 6: Plan 1 removes path-d but breaks --replay flag

**What goes wrong:** `E-verify-before-commit.sh` has a `--replay <sha>` manual auditor mode (lines 42-81) that checks the wip-discipline rule against arbitrary commits. If Plan 1 removes the wip discipline contract but leaves `--replay` in place, the auditor tool prints a path-d violation against any commit with Outstanding Verification + non-wip subject -- forever.

**Why it happens:** The --replay flag is independent of the synthesized in-process scenario block, but both encode the same contract.

**How to avoid:** Plan 1 PLAN.md must specify removal targets:
1. `E-verify-before-commit.sh` lines 42-81 (--replay flag block)
2. `E-verify-before-commit.sh` lines 160-188 (SYNTHESIZE_PATH_D block) -- the synthesized in-process scenario
3. `E-verify-before-commit.sh` lines 217-269 (PATH_D_VIOLATION detection block)
4. `E-verify-before-commit.sh` "## Outstanding Verification" cross-references throughout

The script's positive paths (a, b, c) remain. Reduce E-verify-before-commit.sh to a 3-path positive assertion only. Total removed: ~110 lines (more than CONTEXT.md's "~30 lines" estimate -- the planner should plan for the larger removal).

## Code Examples

### Plan 1: wip-discipline removal from execute SKILL.md (Plan 07-08 reversal)

**Surface:** `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` lines 224-286.

**Current content (lines 224-234, Subject-prefix discipline section header + rule):**
```markdown
### Subject-prefix discipline when Outstanding Verification is populated

When a commit body contains a `## Outstanding Verification` section listing one or more pending `Run:` directives, the commit subject MUST use the `wip:` prefix...

The rule's purpose is BRANCH-STATE preservation...

Carve-out: when a follow-up commit ONLY records additional `Verified: <claim>` trailers...

Convert the `wip:` chain to a regular commit...

The motivation: branch-state semantics ensure that a reviewer auditing `git log --oneline`...
```

**Action:** Remove lines 224-234 (rule + worked example intro).

**Current content (lines 236-286, 3-shape worked example pair):**
```markdown
### Worked example: wip subject + Outstanding Verification

Three commit shapes in sequence, exercising the rule and its carve-out:

**Shape 1 (CORRECT): Parent wip commit with Outstanding Verification.**
[...]

**Shape 2 (INCORRECT, per-commit reading): Follow-up fix while parent's Outstanding Verification is still pending.**
[...]

**Shape 3 (CORRECT carve-out): Trailer-only follow-up closes Outstanding Verification entries.**
[...]
```

**Action:** Remove lines 236-286 (the worked example block).

**Total removal from execute SKILL.md:** ~62 lines (224-286 inclusive). CONTEXT.md estimated ~25 lines; the actual removal is larger because the worked example block has 3 shapes.

**Cross-reference cleanup:** Line 311 currently reads:
```markdown
0. Apply Phase 3.5 verify-before-commit rules from `<verify_before_commit>` -- resolve hedge markers, execute plan Run: directives, route long-running validations to a `wip:` commit if necessary, and record verifications via `Verified:` trailers. The commit you make in step 3 must reflect either completed verifications or a `wip:` prefix with an Outstanding Verification body section.
```

**Action:** Edit line 311 to remove `route long-running validations to a wip: commit if necessary, and` and `or a wip: prefix with an Outstanding Verification body section`. Simplified to:
```markdown
0. Apply Phase 3.5 verify-before-commit rules from `<verify_before_commit>` -- resolve hedge markers, execute plan Run: directives, and record verifications via `Verified:` trailers.
```

### Plan 1: REQUIREMENTS.md row removal

**Surface:** `.planning/REQUIREMENTS.md` lines 70-71 (`GAP-G2-wip-scope` row) + line 150 (traceability row).

**Action:** Delete lines 70-71 entirely. Delete line 150 (the `| GAP-G2-wip-scope | Phase 7 | Pending |` row). Update line 154-157 coverage block (v1 requirements count: 42 -> 41; mapped to phases: 42 -> 41).

### Plan 2: Regex change in D-reviewer-budget.sh and D-security-reviewer-budget.sh

**Surface 1:** `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh` line 154.

**Current:**
```javascript
const FRAGMENT_RE = /^[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):\s+(.+)$/gm;
```

**Proposed (per CONTEXT.md):**
```javascript
const FRAGMENT_RE = /^`?[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):.+`?$/gm;
```

Note: The capture group `(.+)` is now lost in the proposed pattern because `.+` is the entire trailing match. The planner needs to preserve the capture for the per-item word counting downstream code. Suggested:

```javascript
const FRAGMENT_RE = /^`?[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):\s+(.+?)`?$/gm;
```

This anchors optional leading backtick, keeps the non-greedy capture for the body, and makes the trailing backtick optional too.

**Surface 2:** `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh` line 154.

**Current:**
```javascript
const FRAGMENT_RE = /^[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):\s+\[[A-Za-z0-9\-]+\]\s+(.+)$/gm;
```

**Proposed:**
```javascript
const FRAGMENT_RE = /^`?[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):\s+\[[A-Za-z0-9\-]+\]\s+(.+?)`?$/gm;
```

### Plan 2: PFV cap raise in D-security-reviewer-budget.sh

**Surface:** `D-security-reviewer-budget.sh` lines 236-244 (`check-pfv-entries.mjs` heredoc).

**Current (relevant lines):**
```javascript
if (wc > 66) {
  console.log(`[ERROR] Per-finding validation entry ${idx + 1}: ${wc} words (>66 outlier soft cap; target <=60w)`);
  bad++;
} else if (wc > 60) {
  console.log(`[WARN] Per-finding validation entry ${idx + 1}: ${wc} words (>60 target but <=66 outlier; acceptable)`);
} else {
```

**Proposed (raise outlier_soft_cap from 66w -> 75w or 80w; planner picks):**

Option A (75w; covers max observed 77w UAT outlier with -2w margin):
```javascript
if (wc > 75) {
  console.log(`[ERROR] Per-finding validation entry ${idx + 1}: ${wc} words (>75 outlier soft cap; target <=60w)`);
  bad++;
} else if (wc > 60) {
  console.log(`[WARN] Per-finding validation entry ${idx + 1}: ${wc} words (>60 target but <=75 outlier; acceptable)`);
}
```

Option B (80w; more headroom for future CVE-class auto-clarity findings):
```javascript
if (wc > 80) {
  console.log(`[ERROR] Per-finding validation entry ${idx + 1}: ${wc} words (>80 outlier soft cap; target <=60w)`);
  bad++;
} else if (wc > 60) {
  console.log(`[WARN] Per-finding validation entry ${idx + 1}: ${wc} words (>60 target but <=80 outlier; acceptable)`);
}
```

Note: D-reviewer-budget.sh has the SAME structure at lines 238-242 with 66w cap; CONTEXT.md notes "asymmetric raise" (security-reviewer only) is the default. Planner may consider symmetric raise if n=3 surfaces D-reviewer PFV outliers in [60w, 75w].

### Plan 3: D-advisor-budget.sh per-item code-block flag detection

**Surface:** `D-advisor-budget.sh` lines 100-141 (the `matches.forEach()` loop in `check-advisor-items.mjs` heredoc).

**Current per-item structure (lines 113-138):**
```javascript
matches.forEach((m, idx) => {
  const itemBody = m[1].trim();
  const wc = itemBody.split(/\s+/).filter(Boolean).length;
  const isFrame = ASSUMING_FRAME_RE.test(itemBody);
  total++;
  aggregateWc += wc;

  if (isFrame) {
    // ... per-frame logging
  } else {
    // ... per-item logging
  }
});
```

**Proposed extension (insert code-block flag detection + emit structured log line per item):**

```javascript
// Code-block detection: backtick-fenced (single, triple, 4+), <code> HTML tags, indented 4+ spaces.
const CODE_BLOCK_RE = /`[^`]+`|`{3,}|<code[\s>]|\n {4,}/;

matches.forEach((m, idx) => {
  const itemBody = m[1].trim();
  const wc = itemBody.split(/\s+/).filter(Boolean).length;
  const isFrame = ASSUMING_FRAME_RE.test(itemBody);
  const hasCodeBlock = CODE_BLOCK_RE.test(itemBody);
  total++;
  aggregateWc += wc;

  // ... existing per-item logging

  // NEW: structured log for 08-MEASUREMENT.md ingestion
  console.log(`[ITEM] idx=${idx+1} wc=${wc} frame=${isFrame ? 1 : 0} codeblock=${hasCodeBlock ? 1 : 0}`);
});
```

The `[ITEM]` lines are machine-parseable by a thin Node ESM script run from Plan 3's measurement harness, which collates the items across n=3 runs and writes `08-MEASUREMENT.md`. The planner finalizes the regex shape; the suggested baseline is the union of "any backtick-pair," "triple backtick," "`<code>` HTML tag," "indented 4+ spaces."

### Plan 4 (conditional): Fragment-grammar template extension in advisor.md

**Surface:** `plugins/lz-advisor/agents/advisor.md` line 60 (Format line) + the Density examples lines 86-100.

**Current (line 60):**
```
Format: each numbered item is `<verb-led action>. <concrete object or path>. <one-clause rationale or Assuming-frame if needed>.`
```

**Proposed D1 disposition (fragment-grammar binds on code-block items):**
```
Format: each numbered item is `<verb-led action>. <concrete object or path>. <one-clause rationale or Assuming-frame if needed>.` When the action involves a code-block (configuration block, function signature, or multi-line snippet), keep the code-block inline-wrapped in single backticks; do NOT expand the code-block across multiple lines. The 15-word per-item budget applies to the entire item including the inline-wrapped code-block; if the code-block alone exceeds 12 words, abstract it: replace the literal block with the symbolic name + a verify-step on a follow-up item.
```

**Proposed D2 disposition (density example audit):**

Read advisor.md lines 86-92 (Density example, full-context) and lines 94-100 (Density example, thin-context). Audit for inline-code patterns that may be inflating word counts. Suggested edit: ensure each density example item is <=15w including the inline `` `code` `` backtick-wrapped configuration. If currently >15w, abstract or split into two items.

### Plan 7: Class-2 trigger scenario design

**Suggested CVE candidates** (publication after Sonnet 4.6 training; vulnerable versions documented; reproducible):

| CVE ID | Library | Vulnerable | Patched | Publication | Why suitable |
|--------|---------|-----------|---------|-------------|--------------|
| CVE-2025-68154 | systeminformation | < 5.27.14 | 5.27.14 | 2025-12-16 | Command injection on Windows; recent enough to post-date Sonnet 4.6 training. PoC: `fsSize("; calc.exe;")` |
| CVE-2024-29041 | express | < 4.19.2 (and 5.0.0-beta < beta.3) | 4.19.2 | 2024-03-25 | Open redirect via Location header; well-documented. May be in training corpus. |
| CVE-2024-21538 | cross-spawn | (specific version range; check GHSA) | (patched) | 2024 | ReDoS in widely-used transitive dep; easy to reproduce via crafted input |
| CVE-2024-21529 | dset | (range; check GHSA) | (patched) | 2024 | Prototype pollution; trivial PoC |

**Recommendation:** Use `systeminformation@<5.27.14` (CVE-2025-68154) -- the December 2025 publication date is the strongest hedge against the executor resolving the question from training data. The PoC is a single function call; the affected version range is narrow and clear. Pin the scenario's `package.json` to e.g. `"systeminformation": "5.27.13"` and have the executor's security-review scan a file that calls `fsSize(userInput)`. The security-reviewer will (a) recognize the CVE-class question, (b) lack version-specific authoritative knowledge from `[Read, Glob]` alone, (c) emit `<verify_request question="..." class="2-S" anchor_target="pv-cve-2025-68154-systeminformation" severity="critical">`, (d) the executor parses + WebSearches GHSA + synthesizes pv-* + re-invokes security-reviewer with the new anchor, (e) security-reviewer closes the hedge with anchored citation.

**Trigger scenario file structure (planner finalizes):**
```
F-class-2-escalation.sh (smoke fixture)
  -> seeds scratch repo with package.json pinning systeminformation@5.27.13
  -> seeds src/disk-info.ts calling fsSize(userInput) without input sanitization
  -> invokes claude -p "/lz-advisor.security-review Review the last commit." --verbose --output-format stream-json
  -> asserts: (a) <verify_request class="2-S" appears in trace; (b) WebSearch or WebFetch tool_use appears in trace; (c) pv-cve-2025-68154-... synthesized in subsequent agent call; (d) security-reviewer re-invocation references the pv-* anchor
```

### Plan 6: Rule 5b extension for advisor narrative SD self-anchor

**Surface:** `plugins/lz-advisor/references/context-packaging.md` Rule 5b at lines 48-80.

**Current 5b structure:**
- Format mandate (lines 50-64; internal-prompt XML + user-facing token-form)
- Source-grounded evidence requirement (line 66)
- Self-anchor rejection (lines 68-74)
- Synthesis mandate (line 76)
- ToolSearch precondition (line 78)

**Proposed extension (planner finalizes 5b extension vs 5c):**

Option A (extend 5b -- planner-suggested per CONTEXT.md):
```markdown
   - **Advisor narrative SD self-anchor.** When the advisor's Strategic Direction prose introduces a load-bearing technical assertion (e.g., "TypeScript 5 supports decorators on accessors"; "Nx 19 supports cache inputs on targets"; "@storybook/angular 10.x exports `setCompodocJson`") that the executor will propagate into subsequent skill consultation prompts, the executor MUST verify the assertion against the installed-version source (package.json, .d.ts, official docs via WebFetch) before propagating. Verification produces a `<pre_verified>` block per Rule 5b synthesis mandate. Unresolved hedges (e.g., advisor uses the inline `Assuming X (unverified), do Y. Verify X before acting.` frame) inherit Rule 5c (Hedge propagation rule). The failure mode this sub-rule closes: advisor SD prose that asserts a framework / library behavior without source backing, executor propagates verbatim into the next consultation (review / security-review), downstream agent treats as authoritative.
```

Option B (new Rule 5e or 5c-bis):
```markdown
   **5c. Advisor narrative SD verification.** (Place after 5b ends and before 5c hedge propagation begins; if planner prefers, restructure numbering to 5e.)
```

The planner picks based on prose flow. CONTEXT.md suggested 5b extension.

**Smoke fixture (Plan 6):** Suggested name `G-advisor-narrative-sd-pv.sh` (letter G; even though G+H are used as DEF subscriptions historically, `G-` as a smoke-test letter is unused). Fixture synthesizes an advisor SD with a deliberately-false technical claim (e.g., "TypeScript 5 supports parameter decorators on instance methods" -- this is FALSE; only class decorators are supported in TC39 Stage 3 decorators). Fixture asserts executor either (a) flags the assertion as unverified hedge, or (b) verifies + cites source.

## Runtime State Inventory

This section is included for completeness; Phase 8 is not a rename/refactor phase, but it is a contract-shape change (Plan 1) and a parser-shape change (Plan 2), so the state inventory ensures nothing carries forward implicitly.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None -- the plugin has no datastore. Smoke-test scratch directories are ephemeral (cleaned via `trap 'rm -rf "$SCRATCH"' EXIT` in every fixture). | None |
| Live service config | None -- plugin distributes via Claude Code marketplace as Markdown + YAML only. No external service touched by version bump. | None |
| OS-registered state | None -- no Windows Task Scheduler / launchd / systemd entries reference plugin internals. | None |
| Secrets/env vars | None -- plugin has no env-var dependencies; smoke tests use synthetic scratch repos. | None |
| Build artifacts | None -- pure Markdown / YAML; no compilation step. Plan 4 conditional escalation (per-section XML extension) is a doc-only edit. | None |

**Nothing found in category:** All five categories return clean. Plugin's stateless design simplifies Phase 8.

## Environment Availability

Phase 8 depends on the following local tools / runtimes. Probed availability:

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Claude Code CLI (`claude`) | Plans 2 (PFV n=3), 3 (n=3 measurement), 7 (UAT) | Assumed available (project requires it; pre-checked by CLAUDE.md skill verification convention) | -- | None; plan execution requires `claude -p` |
| Node.js (ESM .mjs scripts) | Smoke-test parsers (existing); 08-MEASUREMENT.md collator (Plan 3 new) | Assumed available (FNM installed per global CLAUDE.md) | -- | None |
| Git Bash | Smoke-test runtime; --from-trace replay | Assumed available (Windows arm64 dev env per global CLAUDE.md) | -- | None |
| ripgrep (`rg`) | Smoke-test stdin filtering | Available (allowed in settings.json; bug workaround in place per global CLAUDE.md) | -- | None |
| awk (POSIX) | Smoke-test section extraction | Available (Git Bash bundle) | -- | None |
| WebSearch + WebFetch | Plan 7 trigger scenario (executor invokes from claude -p session) | Available (Claude Code native tools) | -- | None |
| systeminformation@5.27.13 npm package | Plan 7 Class-2 trigger scenario (if planner selects CVE-2025-68154) | Probably available via `npm install systeminformation@5.27.13` in scratch repo; package is on npm registry | 5.27.13 | Alternative CVE candidate (e.g., CVE-2024-21529 dset, CVE-2024-21538 cross-spawn) |

**Missing dependencies with no fallback:** None. All required tooling is in place.

**Missing dependencies with fallback:** Only Plan 7's CVE candidate is a single-point choice; multiple fallback CVEs available (see CVE candidates table).

## Validation Architecture

(Nyquist validation is enabled per `.planning/config.json` workflow.nyquist_validation=true.)

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Shell-based smoke tests (`bash`); Node.js ESM (`node`) inline parsers; ripgrep stdin filtering; awk section extraction |
| Config file | None (no pytest.ini / jest.config.* equivalent; each `.sh` file is self-contained) |
| Quick run command | `bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/<fixture>.sh` |
| Full suite command | `for f in .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/*.sh; do bash "$f"; done` (sequential; no test runner) |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| RES-WIP-DISCIPLINE-REVERSAL | wip-discipline contract removed from execute SKILL.md; path-d assertion removed; REQUIREMENTS row removed | manual file diff + smoke re-run | `git diff` post-removal + `bash E-verify-before-commit.sh` (must PASS with TOTAL_PATHS >= 1 on 3-path positive criterion) | YES |
| RES-SHAPE-REGRESSION-PARSER | Smoke parser regex accepts backtick-wrapped finding lines | trace-replay (9 captured traces) | `bash D-reviewer-budget.sh --from-trace traces/0.13.0-strict-D-reviewer-budget-run-2.txt` (must FLIP from FAIL to PASS) | YES (D-reviewer-budget.sh + D-security-reviewer-budget.sh) |
| RES-PFV-OUTLIER-CAP | PFV outlier_soft_cap raised on D-security-reviewer-budget.sh | n=3 fresh re-runs | 3x `bash D-security-reviewer-budget.sh` (each must PASS) | YES |
| RES-ADVISOR-FRAGMENT-GRAMMAR | Compound OR-gate evaluation across n=3 fixture-grade scenarios | n=3 (or n=5/n=10) fresh measurement; structured log to 08-MEASUREMENT.md | 3x `bash D-advisor-budget.sh --capture-trace <path>` + custom collator that writes 08-MEASUREMENT.md | PARTIAL (D-advisor-budget.sh exists; collator script + measurement.md template are Plan 3 deliverables) |
| WR-04 (NO-OP candidate) | Schema BNF `severity="<critical\|important\|suggestion>"` (no legacy `\|high\|medium`) | git grep audit | `git grep -nF "high\|medium" plugins/lz-advisor/` (must return 0 matches; currently does) | YES (no further work) |
| WR-05 (NO-OP candidate) | Worked-example shows `Severity: Important` (no `Severity: High`) | git grep audit | `git grep -nF "Severity: High" plugins/lz-advisor/` (must return 0 matches; currently does) | YES (no further work) |
| P8-18 | Advisor narrative SD pv-extension fires | smoke fixture (new) | `bash G-advisor-narrative-sd-pv.sh` (must assert verify-or-flag-as-hedge path) | NO -- Wave 0 |
| FIND-F-CLASS-2-OBSERVABILITY | Class-2 escalation hook emits `<verify_request class="2-S"` block in designed scenario | smoke fixture (new) | `bash F-class-2-escalation.sh` (must assert block emission + WebSearch tool_use + pv-* synthesis + re-invocation) | NO -- Wave 0 |

### Sampling Rate

- **Per task commit:** `bash D-reviewer-budget.sh --from-trace ...` (zero cost; trace replay) for Plan 2 regex iteration. `bash D-security-reviewer-budget.sh` (PFV change) and `bash D-advisor-budget.sh` (Plan 3 measurement) require live `claude -p`; budget 3x per plan.
- **Per wave merge:** Full smoke suite (all 9 fixtures + 2 new). Estimate 3 minutes (excluding live `claude -p` calls).
- **Phase gate:** Pre-`/gsd-verify-work`: Plan 3's `08-MEASUREMENT.md` must be written and Plan 4 disposition must be decided. All smoke fixtures must PASS in default mode. The 9 captured traces must FLIP from FAIL to PASS under the new regex.

### Wave 0 Gaps

- [ ] `F-class-2-escalation.sh` -- covers FIND-F-CLASS-2-OBSERVABILITY (Plan 7 deliverable). NEW fixture.
- [ ] `G-advisor-narrative-sd-pv.sh` -- covers P8-18 (Plan 6 deliverable). NEW fixture. Letter G picked per CONTEXT discretion; rename if planner prefers.
- [ ] `08-MEASUREMENT.md` collator script -- Plan 3 deliverable. Reads `D-advisor-budget.sh` structured `[ITEM]` log lines from n=3 traces and writes the schema table. Suggested location: `.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/measurement-collator.mjs`.
- [ ] `08-MEASUREMENT.md` template -- Plan 3 deliverable. Schema enumerated in Pitfall 3 above.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The current FRAGMENT_RE regex actually fails on backtick-wrapped finding lines [ASSUMED based on CONTEXT.md problem statement; the regex character class `[^:\s]+` MAY actually match the leading backtick, suggesting a subtler failure mode] | Common Pitfalls -> Pitfall 1 | The proposed regex still works (accepts both shapes), but the FAIL mode may be elsewhere. Planner should reproduce FAIL on a captured trace before applying the fix. |
| A2 | `08-MEASUREMENT.md` schema enumerated in Pitfall 3 is sufficient for Plan 4 disposition decision [ASSUMED based on D-02 disposition rule structure] | Common Pitfalls -> Pitfall 3 | If schema is insufficient, Plan 4 cannot select disposition mechanically -- Plan 3 would need an amendment. Plan 3 PLAN.md should explicitly schema-fix upfront. |
| A3 | CVE-2025-68154 (systeminformation) is the strongest Plan 7 trigger candidate because of its post-training-cutoff publication date [CITED: WebSearch result + cyberpress.org article] | Plan 7 CVE candidates | If Sonnet 4.6 still has stale 2025 CVE knowledge, the executor may resolve from training data instead of WebSearching. Fallback: pick a CVE with version-specific patch granularity that requires lookup. Multiple fallbacks listed. |
| A4 | Plan 1 ~62-line removal (vs. CONTEXT.md ~25-line estimate) [VERIFIED by reading execute SKILL.md lines 224-286] | Plan 1 Code Examples | None -- this is a HIGHER bound than CONTEXT.md provided; the planner should plan for the larger removal, not the smaller. |
| A5 | Plan 5 is a no-op or needs repurposing because WR-04 + WR-05 already landed in commits 7f28903 + 5ea449f [VERIFIED via `git log` + `git grep` returning zero hits] | Summary; Plan 5 surface | None -- this is a VERIFIED finding (commits are on main; grep confirms no remaining lexicon hits). The planner must reconcile Plan 5 scope. |
| A6 | Letter G is safe for Plan 6 smoke fixture even though G+H were used historically as DEF subscriptions [VERIFIED: no `G-*.sh` file exists in smoke-tests directory] | Plan 6 surface; CVE candidates | None. |
| A7 | Symmetric vs asymmetric PFV cap raise can be decided post-hoc based on n=3 D-reviewer re-run distribution [VERIFIED by reading current D-reviewer-budget.sh check-pfv-entries.mjs structure -- it has the SAME cap shape as D-security-reviewer] | Plan 2 Discretion | None -- this is the locked Claude Discretion area per CONTEXT.md. |
| A8 | Plan 4 escalation to per-section `<output_constraints>` XML mirrors security-reviewer.md lines 165-192 [VERIFIED by reading security-reviewer.md] | Plan 4 escalation path; Architecture Pattern 4 | None; the canonical XML is intact. The planner adapts it for advisor's single-section nature. |
| A9 | `claude -p` invocation pattern for n=3 measurement uses sonnet + medium effort + --plugin-dir + --verbose [CITED: project CLAUDE.md Skill Verification convention; existing D-advisor-budget.sh line 49-52] | Plan 3 invocation pattern | None. |

## Open Questions

1. **Plan 5 reconciliation -- no-op or repurpose?**
   - What we know: WR-04 + WR-05 already landed (commits `7f28903` + `5ea449f`). Current line 317 reads `Severity: Important`; line 376 reads `severity="<critical|important|suggestion>"`. Zero remaining lexicon hits.
   - What's unclear: Whether the planner should ship Plan 5 as a verification-only audit step (recording that WR-04/05 are already closed) OR repurpose it (e.g., a CONTEXT.md / REQUIREMENTS.md / VERIFICATION.md reconciliation step removing stale deferral references).
   - Recommendation: Plan 5 becomes a SHORT planning-trail reconciliation plan (delete the WR-04/05 row from Phase 7 closure_amendment carry-forward; close the WR-04/05 deferral with a one-line note). Plan 5 ships ~5-10 lines of `.planning/` file edits (REQUIREMENTS.md if WR-04/05 had a row; STATE.md if Phase 7 closure is referenced; CONTEXT.md / DISCUSSION-LOG.md cleanup) and zero plugin surface edits. This preserves the 7-plan structure (D-01 locked) without manufacturing a fake mechanical edit.

2. **Plan 3 scenario prompt composition for feature implementation + refactor scenarios.**
   - What we know: Compodoc prompt is locked per memory `project_compodoc_uat_initial_plan_prompt.md`.
   - What's unclear: The other two scenario prompts. CONTEXT.md suggests: feature impl = "add a debounced search input component to my Angular library"; refactor = "extract a shared validation utility from these 3 components".
   - Recommendation: Use the CONTEXT.md suggestions verbatim. Both are realistic and exercise different code-block density patterns (feature = new code with TypeScript interfaces / signal API; refactor = restructuring with `git mv` / barrel exports).

3. **Plan 4 escalation trigger ambiguity -- when does "structural binding fails" fire?**
   - What we know: CONTEXT D-02 says escalation triggers if "fragment-grammar template structurally can't bind on code blocks (e.g., per-item parser detects inline code that the fragment grammar consistently fails to wrap correctly across all 3 runs)."
   - What's unclear: What constitutes "consistently fails to wrap correctly" mechanically. Is it >=3/3 runs where ALL code-block items exceed per-item cap? >=2/3 runs?
   - Recommendation: Tie escalation to a binary 3/3 condition: if all 3 runs in `08-MEASUREMENT.md` show >=1 code-block item over per-item cap AND the code-block items collectively account for >=50% of the over-cap items, escalate. This is conservative; default to fragment-grammar template extension otherwise.

## Security Domain

(Required per `security_enforcement` enabled; absent in `.planning/config.json` = enabled.)

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | no | Plugin has no auth surface; runs locally |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | No access control surface; tools restricted via `tools: ["Read", "Glob"]` allow-list per Claude Code Agent tool grant (principle of least privilege; mirrors OWASP AI Agent Security Cheat Sheet) |
| V5 Input Validation | yes (Plan 2; Plan 7) | Regex validation in Plan 2 (parser inputs are captured traces or live agent output; no network input). SHA validation in E-verify-before-commit.sh --replay (lines 47-50; rg-pattern `^[0-9a-f]{6,40}$`) |
| V6 Cryptography | no | No cryptographic operations |

### Known Threat Patterns for {plugin / shell smoke-test stack}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| ReDoS on regex change (Plan 2) | DoS / Tampering | The new regex `/^`?[^:\s]+:\d+(?:-\d+)?:\s+(?:crit\|imp\|sug\|q):\s+(.+?)`?$/gm` is non-backtracking with bounded character classes; no nested quantifiers. Risk minimal. Input is captured trace or live agent output (length-bounded). |
| Command injection in trace-replay (Plan 2) | Elevation of Privilege | Trace paths are passed as `--from-trace <file>` argument; bash `case` statement parses them as literal strings (D-reviewer-budget.sh lines 33-40). No shell expansion of trace content. |
| Class-2 trigger CVE PoC (Plan 7) | Elevation of Privilege / Tampering | The smoke fixture seeds a scratch repo with a vulnerable package version but does NOT install or execute the vulnerable function. The `claude -p` invocation runs `/lz-advisor.security-review` which Read-only-scans the code. No actual CVE exploitation. |
| Synthesized advisor SD with false claim (Plan 6) | Information Disclosure | Smoke fixture's false claim is a synthetic test artifact (e.g., "TypeScript 5 supports parameter decorators on instance methods"). No actual training-data poisoning -- the fixture exists in a scratch repo, not the plugin distribution. |
| Plan 1 contract removal regression | Information Disclosure / Tampering | The wip-discipline contract was a workflow hygiene rule, not a security control. Removal does not weaken any security boundary. The path-d violation detection (lines 217-244 in E-verify-before-commit.sh) was never a security control either. |

**Threat model summary:** Phase 8 has minimal security surface. The biggest risk is Plan 7's CVE trigger scenario design — must ensure the fixture doesn't actually install or run the vulnerable code, only scans it. The current `D-security-reviewer-budget.sh` pattern (mkdir scratch; printf source files; git commit; claude -p security-review) is the standard pattern Plan 7 should follow byte-identically.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single-predicate gate (gate C / C2) for advisor regression | D-02 compound OR-gate + disposition rule + measurement artifact | Phase 8 CONTEXT (2026-05-08; user directive "highest quality, no shortcuts") | Eliminates judgment-call ambiguity for fix-surface attribution; durable audit record in 08-MEASUREMENT.md |
| Single-shot n=3 measurement | D-03 auto-extend tri-state (PASS / FAIL / INCONCLUSIVE) -> n=5 -> n=10 escalation | Phase 8 CONTEXT (2026-05-08) | Cost-aligned with evidence quality; pays for n>=5 only when n=3 is insufficient |
| Aggregate word-budget cap on reviewer / security-reviewer | Per-section `<output_constraints>` XML (Plan 07-14 canon) | Phase 7 (2026-05-06; Anthropic Apr 2026 postmortem + AgentIF benchmark) | 15-20% better binding on Claude per cloud-authority research; aggregate cap empirically falsified |
| Strict regex with single trailing-period anchor on advisor items | Optional-backtick anchoring (Plan 8 P1 SHAPE) | Phase 8 Plan 2 (2026-05-18 research) | Accepts markdown-natural backtick wrapping without rejecting fragment-grammar shape |
| ToolSearch availability rule conditional on Class 2 / 3 / 4 ranking | Default-on Phase 1 first action (Plan 07-07 Gap 1 closure) | Phase 7 (2026-05-04) | One redundant ToolSearch is much cheaper than one confabulated pv-* block |
| Plan 07-08 wip-discipline contract (Outstanding Verification -> wip: prefix) | Removal (Plan 8 Plan 1) | Phase 8 (2026-05-03 user directive `feedback_no_wip_commits.md`) | Removes branch-state preservation rule per user workflow preference; rule worked per spec but rejected at project-level |

**Deprecated/outdated:**
- WR-04 / WR-05 deferral notes in 07-VERIFICATION.md (commits 7f28903 + 5ea449f closed them; the deferral is obsolete documentation that Plan 5 should reconcile).
- Aggregate 300w cap on reviewer / security-reviewer (Plan 07-14 replaced with per-section XML).
- Single-predicate gate C / C2 design for advisor measurement (D-02 compound OR-gate supersedes).

## Sources

### Primary (HIGH confidence)

- `.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-CONTEXT.md` -- Locked decisions D-01..D-04; specific ideas; deferred items
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md` -- closure_amendment_2026_05_08_uat_replay_0_13_1 block; phase_8_worklist; residuals carry-forward
- `.planning/REQUIREMENTS.md` -- GAP-G2-wip-scope row (lines 70-71; line 150 traceability); coverage block (lines 154-157)
- `.planning/ROADMAP.md` -- Phase 8 entry (lines 242-250); requirement IDs
- `.planning/STATE.md` -- Plugin 0.13.1; Phase 7 sealed `passed_with_residual_on_0_13_1`
- `.planning/config.json` -- workflow.nyquist_validation=true; commit_docs=true; model_profile=quality
- `plugins/lz-advisor/agents/advisor.md` -- Fragment-grammar emit template (line 60); Density examples (lines 86-100); Output Constraint section (lines 51-100); 248 lines total
- `plugins/lz-advisor/agents/security-reviewer.md` -- Fragment-grammar Findings shape (line 60-62); `<output_constraints>` XML (lines 165-192); `## Class-2 Escalation Hook` section (lines 263-289); 363 lines total
- `plugins/lz-advisor/references/context-packaging.md` -- Common Contract Rule 5b (lines 48-80); Rule 5c hedge propagation (lines 82-89); Rule 5d version-qualifier (lines 91-110); Verify Request Schema (lines 369-409); 424 lines total
- `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` -- `<verify_before_commit>` block (lines 173-304); Phase 4 step 0 cross-reference (line 311); 376 lines total
- `plugins/lz-advisor/.claude-plugin/plugin.json` -- version 0.13.1 (line 3)
- All 4 `plugins/lz-advisor/skills/lz-advisor.*/SKILL.md` -- version 0.13.1 in frontmatter (lines 18-19)
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh` -- 305 lines; FRAGMENT_RE at line 154; --from-trace handler at lines 30-87
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh` -- 303 lines; FRAGMENT_RE at line 154; PFV cap at line 238
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh` -- 190 lines; ADVISOR_FRAGMENT_RE at line 89; ASSUMING_FRAME_RE at line 96
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh` -- 301 lines; --replay block (lines 42-81); SYNTHESIZE_PATH_D (lines 170-188); PATH_D_VIOLATION (lines 225-244)
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/traces/` -- 9 trace files (5 strict + 4 tolerance); extract-from-log.mjs (85 lines)
- Git log confirming WR-04 (commit 7f28903) + WR-05 (commit 5ea449f) closure on 2026-05-05 -- VERIFIED via `git log --format="%H %s %ai" 7f28903 5ea449f`
- Git grep confirming zero legacy lexicon hits: `git grep -nF "Severity: High" plugins/lz-advisor/` -> 0 matches; `git grep -nF "high|medium" plugins/lz-advisor/` -> 0 matches

### Secondary (MEDIUM confidence, web-research)

- CVE-2024-29041 (express open redirect; published 2024-03-25; vulnerable < 4.19.2) -- [NIST NVD](https://nvd.nist.gov/vuln/detail/cve-2024-29041), [GitHub Advisory GHSA-rv95-896h-c2vc](https://github.com/advisories/GHSA-rv95-896h-c2vc), [Snyk](https://security.snyk.io/vuln/SNYK-JS-EXPRESS-6474509)
- CVE-2025-68154 (systeminformation command injection; published 2025-12-16; vulnerable < 5.27.14) -- [CyberPress](https://cyberpress.org/flaw-in-popular-node-js-library/)
- Node.js npm CVE summary 2024-2025 -- [Red Hat advisory portal](https://access.redhat.com/security/supply-chain-attacks-NPM-packages), [npm CVEs OpenCVE](https://app.opencve.io/cve/?vendor=npmjs), [npm Security 2026](https://blog.cyberdesserts.com/npm-security-vulnerabilities/)
- Plan 4 escalation canon (Plan 07-14 per-section `<output_constraints>` XML) -- verified by reading reviewer.md + security-reviewer.md byte-identical pattern

### Tertiary (LOW confidence, marked for validation)

- A1: The current FRAGMENT_RE regex actually fails on backtick-wrapped finding lines. Reasoning: the captured traces visually show backtick-wrapped lines, AND the trace files are CATEGORIZED as shape-regression FAILs by Phase 7 closure. But the regex character class `[^:\s]+` would also match the leading backtick. The actual FAIL mode may be subtler (e.g., interaction with `(.+)$` greedy match consuming the trailing backtick, or multi-line `m` flag). The planner should reproduce the FAIL on a captured trace before applying the proposed regex change.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All tools already installed and used in existing fixtures
- Architecture: HIGH -- All patterns are extensions or modifications of existing canon; locked decisions in CONTEXT.md are foundational
- Pitfalls: HIGH on Pitfalls 2-6 (VERIFIED via file read); MEDIUM on Pitfall 1 (assumption A1 about regex failure mode needs reproduction)
- Plan 7 CVE candidates: HIGH (web research returned multiple anchors; primary recommendation CVE-2025-68154 has stable version data)
- Plan 5 reconciliation finding: HIGH (VERIFIED via git log + git grep)

**Research date:** 2026-05-18
**Valid until:** 2026-06-15 (30 days; plugin design is stable; only CVE data may shift)

---

*Phase: 08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle*
*Research completed: 2026-05-18*
