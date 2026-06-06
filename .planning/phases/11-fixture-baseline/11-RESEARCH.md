# Phase 11: Fixture baseline - Research

**Researched:** 2026-06-07
**Domain:** Bash regression-fixture authoring (`wc -w` + `grep -E` per-section budget parser) that parses the CURRENT fragment-grammar review-agent contract; Git Bash on Windows; zero runtime deps
**Confidence:** HIGH (every claim anchored to a committed file:line in this repo or an empirically-run command this session; no external/stale-doc dependency)

## Summary

Phase 11 authors two new, committed, tracked bash smoke fixtures -- `tests/D-reviewer-budget.sh` and `tests/D-security-reviewer-budget.sh` -- that parse the CURRENT shorthand fragment grammar (`crit:`/`imp:`/`sug:`/`q:`) emitted by `plugins/lz-advisor/agents/reviewer.md` and `security-reviewer.md`, assert the per-section word budgets, and exit green on HEAD. The fixtures establish a regression baseline so Phase 12's grouped-grammar rewrite has something to flip RED, and Phase 13's live `claude -p` runs have a parser to reuse via `--from-trace`. This phase makes NO change under `plugins/lz-advisor/` and NO version bump (GATE-01 only; the 5-surface bump and grammar rewrite are Phase 12 SYNC-02 / RPT / AGNT).

The work is fully scoped by the four committed milestone-research files plus the CONTEXT.md locked decisions D-01..D-12. The fixtures live nowhere on disk today -- empirically reconfirmed this session three ways (`git ls-files "*budget*"` = 0, tracked `git grep -l FRAGMENT_RE` = only planning/agent docs that reference the NAME, `rg -uu -l` on `*.sh` = 0). The Phase 07/08 fixture *source code* did not survive (it lived in cleared `.planning/phases/` workspaces); only the Phase 08 roadmap line-item *descriptions* in `.planning/milestones/v1.0-ROADMAP.md` survive, so the planner reconstructs the parser from (a) the agent grammar as the contract source of truth and (b) the recovered roadmap descriptions for tolerance values. Every recovered value below carries its source line.

**Primary recommendation:** Author two standalone scripts following the committed `tests/validate-phase-0{3,4}.sh` house style (`set -euo pipefail`, `pass()`/`fail()` + counters, ASCII-only, exit non-zero on any fail), each with three modes -- default (self-extract the agent's holistic worked example), `--from-trace <file>` (parse a captured response), `--self-test` (zero-finding input must exit non-zero) -- and an anti-vacuous `matched_count >= 5` assertion that runs BEFORE the word-budget loop. Use `plugins/lz-advisor/agents/...` paths (NOT the stale top-level `agents/` paths the existing fixtures use -- see Pitfall 1). Apply the recovered Phase 08 tolerances at the PARSER layer only: backtick-tolerant fragment regex (optional leading + trailing backtick) and a 75w outlier cap for the security fixture's auto-clarity CVE finding.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Parse agent finding lines (fragment grammar) | Test fixture (bash regex) | -- | The fixture is a standalone parser; the agent file is the parsed input, not a participant |
| Self-extract the holistic worked example | Test fixture (blockquote-strip + regex) | Agent file (data source) | D-01: the agent's `> `-prefixed worked example IS the baseline input; the fixture reads + de-quotes it |
| Per-section word-budget assertion | Test fixture (`wc -w`) | -- | Budgets are encoded in the fixture parser layer (D-07), aimed at the agent's canonical `<output_constraints>` |
| Anti-vacuous-pass guard | Test fixture (count assertion before loop) | -- | D-04: `matched_count >= 5` runs before the budget loop |
| Live `claude -p` capture | Phase 13 (out of scope) | Test fixture (`--from-trace` reuses parser) | D-03: NO live invocation in the fixtures; the parser is reused downstream |

This is a single-tier deliverable (bash test scripts). The only "tier" interaction is the fixture READING the agent prompt file as data; it never modifies it.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Baseline input source:**
- **D-01:** Primary mode -- fixtures self-extract the holistic worked example from the agent files at runtime (strip the `> ` blockquote framing, parse the example findings). Satisfies ROADMAP criterion 2 ("green against current shorthand-grammar agent prompts") and creates automatic lockstep coupling: Phase 12's worked-example rewrite flips the fixtures RED until the parser retargets.
- **D-02:** Secondary mode -- `--from-trace <file>` argument parses a captured headless response file instead. Preserves the Phase 08 `--from-trace` replay precedent; lets Phase 13 reuse the same parser + assertions against live `claude -p` output.
- **D-03:** NO live `claude -p` invocation inside the fixtures. Live capture is Phase 13's job (GATE-02, n>=3 budget-gate run); fixtures must be runnable green in the repo at zero session-pool cost.

**Anti-vacuous enforcement:**
- **D-04:** Runtime assertion `matched_count >= 5` runs BEFORE the word-budget loop in both fixtures (both holistic worked examples contain 7 findings; min 5 follows PITFALLS.md).
- **D-05:** Built-in `--self-test` mode feeds the parser a zero-finding input and asserts the fixture exits NON-zero -- proving fail-loudly behavior reproducibly.
- **D-06:** Verbose output MUST print the parsed-finding count (a green run showing "0 findings parsed" is the documented silent-pass detection signal).

**Budget-cap fidelity:**
- **D-07:** Fixtures encode the Phase 08 FINAL parser state, not a naive 1:1 copy of the agent `<output_constraints>`: agents stay aimed at canonical word targets; tolerance lives at the fixture-parser layer ONLY (the Phase 7 ef97e21 +10% precedent).
- **D-08:** Specifically carried Phase 08 fixture decisions: backtick-tolerant fragment regex (RES-SHAPE-REGRESSION-PARSER, Plan 08-02: optional leading + trailing backtick on fragment-grammar lines) and PFV `outlier_soft_cap` raised 66w -> 75w on the security fixture (RES-PFV-OUTLIER-CAP, Plan 08-02). Planner verifies exact values against `.planning/milestones/v1.0-ROADMAP.md` Plan 08-02 entries.
- **D-09:** Canonical agent budgets the parser checks (with parser-layer tolerance applied): per-entry <=22w target / <=28w outlier soft cap (prefix excluded from the counted span), `cross_cutting_patterns`/`threat_patterns` <=160w, `missed_surfaces` <=30w, `per_finding_validation` <=60w/entry (agent-canonical; 75w at the security fixture-parser layer per D-08). No aggregate cap -- per-section budgets are the binding constraint, matching the agents' `<output_constraints>` blocks.

**Script conventions and structure:**
- **D-10:** Two standalone scripts (no shared helper lib, no parameterized single script) -- ROADMAP names both files literally; duplication across exactly 2 zero-dependency files is acceptable and keeps each gate independently runnable.
- **D-11:** Follow the committed `tests/validate-phase-03.sh` / `tests/validate-phase-04.sh` house style: `set -euo pipefail`, `[PASS]`/`[FAIL]` lines with pass/fail counters, ASCII-only output, paths relative to repo root, exit non-zero when any assertion fails.
- **D-12:** 4-slot security fixture preserves the OWASP `[Axx]` bracket as a parsed slot (`<file>:<line>: <severity>: [<OWASP-tag>] <threat>. <fix>.`); the `[Uncategorized]` tag is a valid OWASP-slot value. The 3-slot reviewer shape is `<file>:<line>: <severity>: <problem>. <fix>.`.

### Claude's Discretion
- Exact regex spelling, blockquote-stripping mechanics, and how `--self-test` synthesizes its zero-finding input.
- Whether `verify_request` XML blocks inside `### Findings` are skipped or counted by the parser (Phase 08 fixtures handled them; planner recovers the precedent from the archived roadmap if documented, otherwise picks the simplest correct treatment). **Recovered precedent + recommendation below in "Recovered Phase 08 Fixture Contract" and "Code Examples."**
- Per-fixture handling of the security auto-clarity carve-out (the full-prose CVE finding in the holistic example absorbs volume under `per_finding_validation` -- the parser must not flag it as a per-entry budget violation). **Empirically measured at 35w body / 38w line below -- this is the binding design constraint for the security fixture.**

### Deferred Ideas (OUT OF SCOPE)
- **Research RTK command suitability for skills and agents** (`.planning/todos/pending/research-rtk-command-suitability-for-skills-and-agents.md`, match score 0.2): stays pending; unrelated to fixture authoring.
- No other deferred ideas. Phase 12 decisions (grouped grammar, vocabulary, version bump) were intentionally NOT pulled forward.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GATE-01 | Budget smoke fixtures (`D-reviewer-budget.sh`, `D-security-reviewer-budget.sh`) re-authored and committed as tracked tests with anti-vacuous-pass assertions (`matched_count >= min`) -- they currently exist nowhere in the repo | This entire research file. Scope guard: Phase 11 authors them GREEN on the CURRENT shorthand grammar; the "re-authored against the grouped grammar" clause in REQUIREMENTS.md GATE-01 is the Phase 12 retarget. CONTEXT.md D-01..D-12 and ARCHITECTURE.md STEP 0 (lines 194-199) define the build-order-zero baseline this phase delivers. |

**Important scope nuance for the planner:** REQUIREMENTS.md GATE-01 reads "re-authored against the *grouped* grammar." The ROADMAP Phase 11 goal and CONTEXT.md D-01 instead require the fixtures to pass green against the *CURRENT shorthand* grammar. The traceability table maps GATE-01 to Phase 11. These reconcile as a two-step delivery: Phase 11 commits the fixtures green on shorthand (baseline); Phase 12 retargets them to the grouped grammar in lockstep (RED-on-old, GREEN-on-new). GATE-01's "grouped" wording is satisfied at the *end* of Phase 12; Phase 11 delivers the baseline half. Do NOT author the fixtures against the grouped grammar in Phase 11 -- that grammar does not exist yet and would make the baseline RED on HEAD.
</phase_requirements>

## Standard Stack

No package installs. Pure bash + coreutils that Git Bash on Windows already ships.

### Core
| Tool | Version (verified) | Purpose | Why Standard |
|------|--------------------|---------|--------------|
| Git Bash (`bash`) | GNU bash 5.3.9(1) (x86_64-pc-cygwin) [VERIFIED: `bash --version` this session] | Fixture interpreter | The committed `tests/validate-phase-0{3,4}.sh` use it; CLAUDE.md mandates Git Bash compatibility for inline scripts/throwaway scripts |
| `wc -w` | coreutils (bundled) | Word-count the per-finding and per-section spans | The budget unit is whitespace-delimited words; `crit:` and `Critical:` each count as 1 word [CITED: STATE.md:102] |
| `grep -E` / bash `[[ =~ ]]` | bundled | Match section headers + fragment-grammar lines | ERE is sufficient for the fragment shape; both are explicitly sanctioned by the phase brief |
| `git grep` | bundled | (Optional) structural assertions in house style | The existing fixtures use `git grep` for content checks; the new fixtures parse a self-extracted span instead, but `git grep`-style assertions remain in-house-style for any structural check |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `sed` | Strip the `> ` blockquote prefix and surrounding backticks during self-extraction (D-01) | Default mode, when reading the agent file's worked example |
| `awk` | Range-extract the holistic example block between `### Findings` and the section that ends it | Alternative to sed for block extraction; either is fine |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Two standalone scripts (D-10) | One parameterized script + a config | D-10 locks two standalone files; ROADMAP names both literally; rejected |
| `wc -w` | Token counter | Budgets are defined in words, not tokens [CITED: reviewer.md:144, 158-189]; `wc -w` is the contract unit |
| `grep -E` | PCRE (`grep -P`) | ERE suffices; PCRE adds no value and Cygwin `grep -P` is slower under emulation |

**Installation:** None. `bash tests/D-reviewer-budget.sh` runs from repo root with zero setup.

**Version verification:** Not applicable -- no external packages. Bash 5.3.9 confirmed available this session. CLAUDE.md notes Git Bash here is Cygwin x86_64 under QEMU emulation; prefer POSIX-ish constructs and avoid GNU-only flags. `wc -w`, `grep -E`, bash `[[ =~ ]]`, `sed`, `awk` are all available.

## Package Legitimacy Audit

Not applicable. Phase 11 installs zero external packages. The fixtures depend only on bash + coreutils already present in the Git Bash runtime. No npm/PyPI/crates surface exists, so slopcheck and registry verification do not apply.

## Recovered Phase 08 Fixture Contract

> Per the phase brief's instruction to recover every value with its source line. The Phase 07/08 fixture *source code* did NOT survive (cleared `.planning/phases/` workspaces; confirmed `git ls-files ".planning/phases/"` returns only the Phase 11 CONTEXT + DISCUSSION-LOG this session). The authoritative recovered source is the archived roadmap's Plan 08-02 line items.

| Recovered decision | Value | Source (verified this session) |
|--------------------|-------|--------------------------------|
| Fixture names referenced by the agents | `D-reviewer-budget.sh`, `D-security-reviewer-budget.sh` | `plugins/lz-advisor/agents/reviewer.md:189`; `plugins/lz-advisor/agents/security-reviewer.md:194` [VERIFIED: `git grep -n` this session] |
| RES-SHAPE-REGRESSION-PARSER (backtick tolerance) | "loosen smoke parser regex to accept optional **leading + trailing backtick** on fragment-grammar lines; 5 captured shape-regression traces in `traces/` provide `--from-trace` replay verification" | `.planning/milestones/v1.0-ROADMAP.md:246` [VERIFIED: `git grep -n`] |
| RES-PFV-OUTLIER-CAP | "raise PFV `outlier_soft_cap` **66w -> 75-80w** on `D-security-reviewer-budget.sh` for security carve-out, or both fixtures for symmetry; n=3 fresh re-runs verify" -- Plan 08-02 landed it at **75w** | `.planning/milestones/v1.0-ROADMAP.md:246` (range) + `:255` (Plan 08-02 landed value "66w -> 75w on D-security-reviewer-budget.sh") [VERIFIED] |
| Plan 08-02 bundle | "P1 SHAPE regex loosening + PFV outlier_soft_cap 66w -> 75w on D-security-reviewer-budget.sh; **`--from-trace` replay + n=3 fresh re-runs**" | `.planning/milestones/v1.0-ROADMAP.md:255` [VERIFIED] |
| Phase 7 ef97e21 +10% tolerance precedent | "+10% smoke-gate tolerance **at fixture-parser layer only** (commit ef97e21; per user directive 2026-05-07: agents stay aimed at canonical targets)" | `.planning/milestones/v1.0-ROADMAP.md:240` [VERIFIED] |
| Plan 07-17 3x re-run gate protocol | "3x re-run gate D-reviewer-budget.sh + D-security-reviewer-budget.sh on plugin 0.13.0 with logs to regression-gate-0.13.0/" | `.planning/milestones/v1.0-ROADMAP.md:238` [VERIFIED] -- Phase 13 reuses this; informational for Phase 11 |
| n=10 statistical gate (E.1) | "n=10 statistical gate (E.1; commit 35916d8)" | `.planning/milestones/v1.0-ROADMAP.md:240` [VERIFIED] -- Phase 13 scope |
| `--from-trace` replay precedent | Plan 08-02 used 5 captured traces in `traces/` for `--from-trace` verification | `.planning/milestones/v1.0-ROADMAP.md:246, 255` [VERIFIED] -- the `traces/` dir is NOT tracked today (`git ls-files "*trace*"` = 0); D-02 re-introduces the `--from-trace` *capability*, Phase 13 supplies live traces |

**`verify_request` XML block handling (Claude's Discretion item):** The archived roadmap does NOT document an explicit verify_request parse rule for the budget fixtures (the RES-SHAPE/RES-PFV entries are about backtick tolerance and the PFV cap only). Therefore the precedent is "not documented" and the planner picks the simplest correct treatment. **Recommendation: SKIP `<verify_request ...>` lines when counting findings and when applying the per-entry word budget.** Rationale: (1) the agent grammar treats verify_request as a *trailing line on the affected finding* (`reviewer.md:114-117`, "trails the affected finding line as a separate line"), not as its own finding; (2) both holistic examples contain exactly one verify_request line and 7 findings, and counting the verify_request line as a finding would inflate `matched_count` and mis-apply the `<=28w` per-entry cap to a ~20w XML attribute string. The reviewer.md word-count breakdown explicitly treats it as a separate ~20w line distinct from the 7 findings (`reviewer.md:144`). Detect via a line beginning (after optional backtick + `> `) with `<verify_request` and `continue` past it.

## Architecture Patterns

### System Architecture Diagram

```
  bash tests/D-reviewer-budget.sh [--from-trace <file> | --self-test]
            |
            v
  +-----------------------------------------------+
  |  MODE DISPATCH (parse $1)                      |
  |   no arg        -> SELF-EXTRACT (D-01)          |
  |   --from-trace  -> READ <file>      (D-02)      |
  |   --self-test   -> SYNTHESIZE zero findings (D-05)|
  +-----------------------------------------------+
            |
            v  (raw report text on a variable / stdin)
  +-----------------------------------------------+
  |  NORMALIZE                                     |
  |   - strip leading "> " blockquote framing      |
  |   - strip optional leading/trailing backtick    |  <-- RES-SHAPE backtick tolerance (D-08)
  |     on fragment-grammar lines                   |
  +-----------------------------------------------+
            |
            v
  +-----------------------------------------------+
  |  PARSE FINDINGS  (FRAGMENT_RE)                 |
  |   3-slot: <file>:<ln>: <sev>: <problem>. <fix>.|
  |   skip <verify_request ...> lines (recommended)|
  |   count -> matched_count                        |
  +-----------------------------------------------+
            |
            v
  +-----------------------------------------------+
  |  ANTI-VACUOUS GUARD (D-04)                     |
  |   assert matched_count >= 5  ELSE fail+exit 1   |  <-- runs BEFORE budget loop
  |   print "N findings parsed" (D-06)              |
  +-----------------------------------------------+
            |
            v
  +-----------------------------------------------+
  |  PER-SECTION BUDGET ASSERTIONS (D-09)          |
  |   per-finding span (prefix EXCLUDED) <=28w      |
  |     (security: 75w cap for auto-clarity finding)|  <-- RES-PFV cap (D-08)
  |   cross_cutting/threat_patterns <=160w          |
  |   missed_surfaces <=30w                          |
  |   per_finding_validation <=60w (sec parser 75w) |
  +-----------------------------------------------+
            |
            v
  +-----------------------------------------------+
  |  SUMMARY + EXIT (D-11)                          |
  |   "[PASS]/[FAIL]" counters; exit 0 / 1          |
  |   --self-test inverts: zero findings => exit !=0|  <-- D-05
  +-----------------------------------------------+
```

The two fixtures are structurally identical except the security fixture parses a 4th slot (OWASP `[Axx]`) inside FRAGMENT_RE, uses `### Threat Patterns` instead of `### Cross-Cutting Patterns`, and applies the 75w auto-clarity outlier cap.

### Recommended Project Structure
```
tests/
|-- validate-phase-03.sh           # existing (house-style template)
|-- validate-phase-04.sh           # existing (house-style template)
|-- D-reviewer-budget.sh           # NEW (3-slot, Cross-Cutting Patterns)
'-- D-security-reviewer-budget.sh  # NEW (4-slot OWASP, Threat Patterns, 75w auto-clarity cap)
```
No new directories. No `traces/` directory in Phase 11 (D-02 adds the `--from-trace` *capability*; Phase 13 supplies the trace files).

### Pattern 1: Self-extracting the holistic worked example (D-01)
**What:** In default mode, the fixture reads its own agent file, isolates the holistic worked example block, strips the `> ` blockquote prefix and the wrapping backticks, then feeds the de-quoted text through the same parser used for `--from-trace`.
**When to use:** Default mode (no args). This is what makes the fixture "green against the current agent prompts" (ROADMAP criterion 2) and creates the Phase 12 lockstep coupling.
**Source anchors:** The reviewer holistic example is `plugins/lz-advisor/agents/reviewer.md:125-142` (7 findings: lines 127-134, with the verify_request at 133). The security holistic example is `plugins/lz-advisor/agents/security-reviewer.md:133-149` (7 findings: lines 135-141, verify_request at 140, CVE auto-clarity finding at 141).
**Example:** see Code Examples below.

### Pattern 2: Mode dispatch with three entry points (D-01/D-02/D-05)
**What:** A small case statement on `$1`: empty -> self-extract; `--from-trace` -> read `$2`; `--self-test` -> synthesize and invert the exit assertion.
**When to use:** Top of both fixtures.

### Pattern 3: Anti-vacuous guard before the budget loop (D-04/D-06)
**What:** After parsing, assert `matched_count >= 5` and print the count; only then enter the per-finding word-budget loop. A regex that matches zero findings fails loudly instead of iterating zero times and exiting green.
**When to use:** Mandatory in both fixtures (Pitfall 2 of milestone PITFALLS.md, lines 42-62).

### Anti-Patterns to Avoid
- **Counting the `<verify_request>` line as a finding:** inflates `matched_count` and mis-applies the `<=28w` per-entry cap to a ~20w XML string. Skip it (see Recovered Contract).
- **Applying `<=28w` to the security CVE auto-clarity finding:** it is 35w (measured); it must be allowed up to the 75w carve-out cap (D-08). A flat 28w cap makes the baseline RED on HEAD.
- **Hardcoding the stale top-level `agents/reviewer.md` path:** the existing `validate-phase-04.sh` uses `agents/reviewer.md` and `skills/lz-advisor-execute/SKILL.md`, which NO LONGER EXIST (everything moved under `plugins/lz-advisor/`). New fixtures MUST use `plugins/lz-advisor/agents/...`. See Pitfall 1.
- **Loosening the agent's stated budget:** all slack goes at the parser layer (D-07; ef97e21 precedent). Never edit `<output_constraints>` in this phase (it is read-only Phase 11 input).
- **`git add .` / heredoc file creation:** CLAUDE.md forbids both. Use the Write tool for the scripts; stage by explicit name.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Word counting | A character/token counter | `wc -w` | The budget contract unit is whitespace-delimited words [CITED: reviewer.md:158-189] |
| Pass/fail reporting + counters | A new logging convention | Copy `pass()`/`fail()` + `PASS_COUNT`/`FAIL_COUNT` from `validate-phase-03.sh:13-22` | D-11 mandates the existing house style; consistency across `tests/` |
| Strict-mode error handling | Manual `$?` checks | `set -euo pipefail` (line 7 of both existing fixtures) | House style; catches unset vars + pipe failures |
| Section-body extraction | A markdown parser | `awk`/`sed` range between heading literals | Headings are fixed literals (`### Findings`, `### Cross-Cutting Patterns`, `### Threat Patterns`, `### Missed surfaces (optional)`); a full parser is overkill |

**Key insight:** Everything this phase needs already exists as a committed pattern (`validate-phase-0{3,4}.sh`) or a coreutils primitive. The only genuinely new logic is the FRAGMENT_RE + the anti-vacuous guard + the auto-clarity carve-out -- all of which are small, testable bash, not libraries.

## Common Pitfalls

### Pitfall 1: Hardcoding the stale top-level component paths
**What goes wrong:** The two existing committed fixtures reference `skills/lz-advisor-execute/SKILL.md` (validate-phase-03.sh:9) and `agents/reviewer.md` / `agents/security-reviewer.md` (validate-phase-04.sh:12-13). These top-level paths DO NOT EXIST anymore -- Phase 9 moved skills under `plugins/lz-advisor/skills/<plain-name>/` and agents under `plugins/lz-advisor/agents/`. [VERIFIED this session: `git ls-files "skills/lz-advisor-execute/SKILL.md" "agents/reviewer.md"` returns nothing; the live files are `plugins/lz-advisor/agents/reviewer.md` etc.] If the planner copies the existing fixtures' path variables verbatim, the new fixtures will fail to find the agent files (or worse, with `set -e` and a `[ -f ]` guard, silently report "file not found").
**Why it happens:** The existing fixtures are stale relics from before the Phase 9 rename and the `plugins/` reorg; they are not maintained against the current tree.
**How to avoid:** Set `REVIEWER_AGENT="plugins/lz-advisor/agents/reviewer.md"` and `SECURITY_AGENT="plugins/lz-advisor/agents/security-reviewer.md"`. Add an explicit `[ -f "$AGENT" ] || { fail "agent file missing at $AGENT"; exit 1; }` guard so a future path move fails loudly.
**Warning signs:** Fixture exits 0 with "0 findings parsed" (the D-06 silent-pass signal) because it self-extracted from an empty/nonexistent file.

### Pitfall 2: Vacuous pass (regex matches zero findings, gate exits green)
**What goes wrong:** If FRAGMENT_RE no longer matches any finding line, the per-finding budget loop iterates zero times and the script exits 0 -- testing nothing. [CITED: milestone PITFALLS.md:42-62, Pitfall 2.] This is the single most dangerous failure for a regression gate.
**Why it happens:** The regex is the coupling point; any drift (or, in Phase 12, the grammar change) silently un-matches.
**How to avoid:** D-04 -- assert `matched_count >= 5` BEFORE the budget loop and exit non-zero on failure. D-05 -- a `--self-test` that feeds zero-finding input and asserts non-zero exit proves the guard works. D-06 -- always print the parsed count.
**Warning signs:** Green run completing suspiciously fast; verbose output shows "0 findings parsed."

### Pitfall 3: Mis-capping the security auto-clarity CVE finding
**What goes wrong:** The security holistic example's CVE finding (`security-reviewer.md:141`) is a deliberate full-prose carve-out. Its body (threat + fix, prefix and OWASP/CVE tags excluded) is **35 words** [VERIFIED: `wc -w` this session]; the full emitted line including `crit: [A06] [CVE-2025-1234]` is 38 words. A flat `<=28w` per-entry cap flags it as a violation and the baseline goes RED on HEAD -- a false regression.
**Why it happens:** The auto-clarity carve-out (`security-reviewer.md:125-129, 151`) intentionally drops fragment grammar for CVE/GHSA/CWE findings; volume is "absorbed under `per_finding_validation`" per the agent prose, but in the holistic example it appears as a `### Findings` line, not a `### Per-finding validation` line. This mismatch is exactly why RES-PFV-OUTLIER-CAP raised the cap to 75w.
**How to avoid:** In the security fixture, detect auto-clarity findings (line contains a `[CVE-...]`, `[GHSA-...]`, or `[CWE-...]` token, or otherwise classified as the carve-out) and apply the 75w cap instead of 28w. D-08/D-09/D-12 and the Recovered Contract specify 75w. The 5 non-CVE security findings (17, 9, 15, 9, 13w measured) fit the normal 28w cap; only the CVE finding needs the carve-out.
**Warning signs:** Security fixture fails on exactly one finding (the CVE line) at 35w against a 28w cap.

### Pitfall 4: Backtick framing breaks the regex
**What goes wrong:** The worked-example findings are wrapped in inline-code backticks AND prefixed with `> ` (blockquote). E.g. `reviewer.md:127` is literally `` > `src/auth.ts:42: crit: user can be null after .find(). Add guard before .email.` ``. If FRAGMENT_RE anchors on `^<file>:` it will never match because the line starts with `` > ` ``.
**Why it happens:** Self-extraction (D-01) reads the raw markdown; the framing must be stripped first. The Phase 08 RES-SHAPE-REGRESSION-PARSER decision (roadmap:246) made the parser tolerate "optional leading + trailing backtick on fragment-grammar lines" precisely for this.
**How to avoid:** Two-step normalize: (1) strip the leading `> ` blockquote prefix; (2) make the leading and trailing backtick optional in FRAGMENT_RE (D-08). Use `sed 's/^> //'` then a regex with optional `` `? `` at both ends.
**Warning signs:** `matched_count = 0` on a self-extract that clearly contains 7 finding lines -> the anti-vacuous guard catches it loudly (good), pointing at a normalization bug.

### Pitfall 5: Per-entry budget counts the prefix
**What goes wrong:** D-09 + both agent files specify the per-finding word budget EXCLUDES the `<file>:<line>: <severity>:` prefix (reviewer.md:69: "excludes the `<file>:<line>: <severity>:` prefix"; security-reviewer.md:72: "excludes the `<file>:<line>: <severity>: [<tag>]` prefix"). If the parser counts the whole line, every finding inflates by 3-5 words and findings that fit the 28w body cap may falsely exceed it.
**Why it happens:** The counted span is the `<problem>. <fix>.` (reviewer) or `<threat>. <fix>.` (security) clauses only.
**How to avoid:** After matching FRAGMENT_RE, strip everything up to and including the severity prefix (and, for security, the `[OWASP-tag]`) before `wc -w`. Measured reviewer bodies (prefix excluded): 10, 9, 11, 7, 17, 13, 16 words -- all <=28w. [VERIFIED this session.]

## Runtime State Inventory

> Phase 11 is a greenfield-fixture authoring phase (no rename/refactor/migration). This section is included because the brief flagged path/grammar coupling; each category answered explicitly.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None -- fixtures read the agent markdown files as input; they persist no state. Verified: no datastore touched. | None |
| Live service config | None -- D-03 forbids any `claude -p` invocation; no external service. | None |
| OS-registered state | None -- standalone scripts run on demand; no scheduler/daemon registration. | None |
| Secrets/env vars | None -- no secret or env-var dependency; scripts run with zero env setup. | None |
| Build artifacts / installed packages | None -- no build step, no compiled artifact, no package install. The fixtures are the artifact. | None |

**Stale-reference note (not runtime state, but path coupling):** the two EXISTING fixtures reference now-nonexistent top-level paths (Pitfall 1). The new fixtures must use `plugins/lz-advisor/agents/...`. This is a path-correctness concern, not stored runtime state.

## Code Examples

> Patterns assembled from the committed house style (`validate-phase-03.sh`) and the agent grammar. ASCII-only per CLAUDE.md. Illustrative skeletons -- the planner refines exact regex spelling (Claude's Discretion).

### Header + house-style helpers (copy from validate-phase-03.sh:1-22)
```bash
#!/usr/bin/env bash
# Budget smoke fixture for the reviewer agent (3-slot fragment grammar).
# Parses the holistic worked example in plugins/lz-advisor/agents/reviewer.md
# (default), a captured trace (--from-trace), or a synthetic zero-finding
# input (--self-test). Asserts per-section word budgets with an anti-vacuous
# matched_count >= 5 guard. Run from repo root: bash tests/D-reviewer-budget.sh
set -euo pipefail

REVIEWER_AGENT="plugins/lz-advisor/agents/reviewer.md"   # NOT the stale top-level agents/ path
MIN_FINDINGS=5                                            # D-04
PER_ENTRY_CAP=28                                          # D-09 outlier soft cap (prefix excluded)
PATTERNS_CAP=160                                          # D-09 cross_cutting_patterns
MISSED_CAP=30                                             # D-09 missed_surfaces
PASS_COUNT=0
FAIL_COUNT=0
pass() { echo "[PASS] $1"; PASS_COUNT=$((PASS_COUNT + 1)); }
fail() { echo "[FAIL] $1"; echo "       $2"; FAIL_COUNT=$((FAIL_COUNT + 1)); }
```

### Mode dispatch (D-01 / D-02 / D-05)
```bash
MODE="self-extract"
TRACE_FILE=""
case "${1:-}" in
  --from-trace) MODE="from-trace"; TRACE_FILE="${2:?--from-trace needs a file}";;
  --self-test)  MODE="self-test";;
  "")           MODE="self-extract";;
  *)            echo "usage: $0 [--from-trace <file> | --self-test]" >&2; exit 2;;
esac
```

### Self-extract + backtick/blockquote normalize (D-01, D-08 backtick tolerance)
```bash
# Isolate the holistic example block, strip "> " blockquote and wrapping backticks.
# Heading literals are fixed (reviewer.md:125,136,140).
get_report() {
  case "$MODE" in
    self-extract)
      # awk range from the holistic "### Findings" to end of "### Missed surfaces"
      awk '/^> ### Findings$/{f=1} f{print} /^> ### Missed surfaces/{m=1} m&&/^$/{exit}' "$REVIEWER_AGENT" \
        | sed -e 's/^> //' -e 's/^`//' -e 's/`$//'   # de-quote + drop wrapping backticks
      ;;
    from-trace)  cat "$TRACE_FILE";;
    self-test)   printf '### Findings\n\n### Cross-Cutting Patterns\nNo findings.\n';;  # zero findings (D-05)
  esac
}
REPORT="$(get_report)"
```

### FRAGMENT_RE parse, skip verify_request, count (3-slot reviewer)
```bash
# 3-slot: <file>:<line>: <severity>: <problem>. <fix>.   (D-12)
# Backtick-tolerant (D-08): optional wrapping backticks already stripped above,
# but keep the regex tolerant in case a trace preserves them.
FRAGMENT_RE='^`?[^[:space:]]+:[0-9]+(-[0-9]+)?: (crit|imp|sug|q): '
matched_count=0
declare -a FINDING_BODIES=()
while IFS= read -r line; do
  [[ "$line" == *"<verify_request"* ]] && continue          # skip escalation lines (recommended)
  if [[ "$line" =~ $FRAGMENT_RE ]]; then
    matched_count=$((matched_count + 1))
    # strip prefix up to and including "<severity>: " -> counted span only (D-09, Pitfall 5)
    body="$(printf '%s' "$line" | sed -E 's/^`?[^[:space:]]+:[0-9]+(-[0-9]+)?: (crit|imp|sug|q): //; s/`$//')"
    FINDING_BODIES+=("$body")
  fi
done < <(printf '%s\n' "$REPORT")
```

### Anti-vacuous guard BEFORE budget loop (D-04 / D-06)
```bash
echo "$matched_count findings parsed"                       # D-06 silent-pass detection signal
if [ "$matched_count" -ge "$MIN_FINDINGS" ]; then
  pass "anti-vacuous: matched_count $matched_count >= $MIN_FINDINGS"
else
  fail "anti-vacuous: only $matched_count findings parsed (need >= $MIN_FINDINGS)" \
       "FRAGMENT_RE matched too few findings -- gate would be vacuous"
fi
```

### --self-test inversion (D-05)
```bash
# In --self-test, the EXPECTED outcome is a NON-zero exit (the guard must fire).
if [ "$MODE" = "self-test" ]; then
  if [ "$matched_count" -lt "$MIN_FINDINGS" ]; then
    echo "[PASS] --self-test: zero-finding input correctly triggers fail-loudly (would exit non-zero)"
    exit 0
  else
    echo "[FAIL] --self-test: zero-finding input did NOT trip the anti-vacuous guard"
    exit 1
  fi
fi
```

### Per-entry budget loop with security auto-clarity carve-out (D-08 / Pitfall 3)
```bash
# Security fixture only: 75w cap for auto-clarity CVE/GHSA/CWE findings (RES-PFV-OUTLIER-CAP).
AUTO_CLARITY_CAP=75
for body in "${FINDING_BODIES[@]}"; do
  wc_words=$(printf '%s' "$body" | wc -w)
  cap=$PER_ENTRY_CAP
  if printf '%s' "$body" | grep -Eq '\[(CVE|GHSA|CWE)'; then
    cap=$AUTO_CLARITY_CAP                                    # auto-clarity carve-out
  fi
  if [ "$wc_words" -le "$cap" ]; then
    pass "per-entry budget: $wc_words <= $cap"
  else
    fail "per-entry budget exceeded: $wc_words > $cap" "$body"
  fi
done
```

### Summary + exit (copy from validate-phase-03.sh:144-158)
```bash
TOTAL=$((PASS_COUNT + FAIL_COUNT))
echo ""
echo "Results: $PASS_COUNT/$TOTAL passed"
if [ "$FAIL_COUNT" -gt 0 ]; then
  echo "Status: [FAIL] -- $FAIL_COUNT assertion(s) failed"; exit 1
else
  echo "Status: [PASS] -- all assertions passed"; exit 0
fi
```

**Security fixture deltas vs reviewer (D-12):** `SECURITY_AGENT="plugins/lz-advisor/agents/security-reviewer.md"`; FRAGMENT_RE adds the OWASP slot `\[[A-Za-z0-9]+\]` after the severity (e.g. `... (crit|imp|sug|q): \[[^]]+\] `); the prefix-strip also removes `[<OWASP-tag>] `; the patterns heading is `### Threat Patterns` not `### Cross-Cutting Patterns`; the 75w auto-clarity cap applies. `[Uncategorized]` is a valid OWASP-slot value (D-12) -- the `\[[^]]+\]` class already matches it.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Aggregate 300w cap | Per-section `<output_constraints>` sub-caps (per-entry/patterns/missed_surfaces/per_finding_validation) | Phase 7 (5/5 over-cap falsified the aggregate) [CITED: reviewer.md:158-189] | Fixtures assert PER-SECTION, never an aggregate (D-09: "No aggregate cap") |
| Flat 66w PFV outlier | 75w PFV outlier on the security fixture | Phase 8 Plan 08-02 (RES-PFV-OUTLIER-CAP) [CITED: v1.0-ROADMAP.md:255] | Security auto-clarity CVE finding (35w) passes |
| Strict line-anchored regex | Backtick-tolerant fragment regex (optional leading+trailing backtick) | Phase 8 Plan 08-02 (RES-SHAPE-REGRESSION-PARSER) [CITED: v1.0-ROADMAP.md:246] | Self-extraction from `> `+backtick-wrapped worked examples works |
| Top-level `agents/` + `skills/lz-advisor-*/` paths | `plugins/lz-advisor/agents/...` + plain skill dir names | Phase 9 rename + `plugins/` reorg | New fixtures must use `plugins/lz-advisor/...`; existing fixtures are stale (Pitfall 1) |

**Deprecated/outdated:**
- The existing `tests/validate-phase-0{3,4}.sh` PATH variables (top-level `agents/`, `skills/lz-advisor-execute/`) are stale post-Phase-9. Use them only as a STYLE template, not a path template.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The simplest-correct treatment of `<verify_request>` lines is to SKIP them (not count as findings, not budget-check). The archived roadmap does not document the historical fixture's exact treatment. | Recovered Contract / Code Examples | LOW. If Phase 08 actually counted them, the only effect is a different `matched_count` (8 vs 7) and an extra ~20w line checked against 28w (it fits). Both holistic examples still pass either way; the planner can flip the rule with one `continue`. The agent grammar (reviewer.md:114) treating it as a "separate line" on the affected finding supports skipping. |
| A2 | The auto-clarity carve-out is detectable by the presence of a `[CVE.../[GHSA.../[CWE...` token in the finding body. | Code Examples / Pitfall 3 | LOW-MEDIUM. The holistic CVE finding (security-reviewer.md:141) carries `[CVE-2025-1234]`. If a future auto-clarity finding lacks such a token (e.g. an architectural-disagreement prose finding per reviewer.md:156), the detector misses it. For the Phase 11 BASELINE this is sufficient (the only >28w finding in either holistic example is the CVE one). The planner may broaden the heuristic (e.g. apply 75w to any finding the agent emits as full prose) at discretion. |
| A3 | Plan 08-02 landed the PFV outlier cap at exactly 75w (the roadmap range is "75-80w"; line :255 states "66w -> 75w"). | Recovered Contract / D-08 | LOW. CONTEXT.md D-08 also states 75w. If the true landed value were 80w, the CVE finding (35w) still passes; 75w is the more conservative (tighter) choice and matches both the roadmap :255 line and D-08. |

## Open Questions

1. **GATE-01 "grouped grammar" wording vs Phase 11 "shorthand baseline" goal**
   - What we know: REQUIREMENTS.md GATE-01 says "re-authored against the grouped grammar"; the ROADMAP Phase 11 goal + CONTEXT.md D-01 say "green against the CURRENT shorthand grammar."
   - What's unclear: Whether the planner should treat GATE-01 as fully satisfied at end of Phase 11 or end of Phase 12.
   - Recommendation: Phase 11 delivers the shorthand baseline (the build-order-zero half); GATE-01's "grouped" clause closes at the end of Phase 12 when the fixtures are retargeted in lockstep. Documented in the phase_requirements block above. No action needed beyond authoring against shorthand.

2. **Whether to add a grammar-consistency grep to the fixture (milestone PITFALLS.md:30 suggests it for Phase 12)**
   - What we know: PITFALLS.md Pitfall 1 recommends a fixture assertion that greps the agent file for surviving shorthands after the Phase 12 rename.
   - What's unclear: Whether that assertion belongs in the Phase 11 baseline.
   - Recommendation: OUT OF SCOPE for Phase 11 -- in Phase 11 the agent files INTENTIONALLY contain shorthands (they are HEAD). Such an assertion would be a Phase 12 addition. Phase 11's job is to parse the shorthand grammar, not police it.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| bash (Git Bash) | Fixture interpreter | Yes [VERIFIED] | GNU bash 5.3.9(1) x86_64-pc-cygwin | -- |
| `wc` | word counting | Yes (coreutils, bundled) | -- | -- |
| `grep -E` | regex matching | Yes (bundled) | -- | bash `[[ =~ ]]` |
| `sed` / `awk` | blockquote strip + block extract | Yes (bundled) | -- | -- |
| `git grep` | optional structural assertions | Yes (bundled) | -- | `rg` per CLAUDE.md |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None -- all bundled in Git Bash. CLAUDE.md note: the runtime is Cygwin under QEMU emulation, so avoid GNU-only flags; the constructs above are POSIX-portable.

## Validation Architecture

> nyquist_validation: the config key is absent from `.planning/config.json` per the init query (no `workflow.nyquist_validation: false` surfaced), so treat as enabled. NOTE: in this phase the deliverable IS the test fixtures; the "test framework" is bash assertions, not a unit-test runner.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | bash assertions (`pass()`/`fail()` + counters), the committed `tests/` convention -- no external runner |
| Config file | none -- scripts are self-contained, run from repo root |
| Quick run command | `bash tests/D-reviewer-budget.sh && bash tests/D-security-reviewer-budget.sh` |
| Full suite command | `for f in tests/*.sh; do bash "$f" || exit 1; done` (includes the existing validate-phase scripts) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GATE-01 | Reviewer fixture green on current shorthand (self-extract) | smoke | `bash tests/D-reviewer-budget.sh` | NEW (this phase) |
| GATE-01 | Security fixture green on current shorthand (self-extract) | smoke | `bash tests/D-security-reviewer-budget.sh` | NEW (this phase) |
| GATE-01 | Anti-vacuous guard fires on zero findings (both) | smoke | `bash tests/D-reviewer-budget.sh --self-test` ; `bash tests/D-security-reviewer-budget.sh --self-test` | NEW (this phase) |
| GATE-01 | `--from-trace` parses a captured response (both) | smoke | `bash tests/D-reviewer-budget.sh --from-trace <file>` | NEW (capability this phase; live traces Phase 13) |

### Sampling Rate
- **Per task commit:** run the just-authored fixture in all three modes (default, `--self-test`, and `--from-trace` against a small captured-or-synthesized fixture sample).
- **Per wave merge:** both new fixtures green in default mode + both `--self-test` exit non-zero.
- **Phase gate:** both fixtures exit 0 on HEAD (self-extract); both `--self-test` exit non-zero; before `/gsd:verify-work`.

### Wave 0 Gaps
- [ ] `tests/D-reviewer-budget.sh` -- covers GATE-01 (reviewer baseline)
- [ ] `tests/D-security-reviewer-budget.sh` -- covers GATE-01 (security baseline)
- [ ] No framework install needed -- bash + coreutils present; the existing `tests/` convention is the template.
- [ ] (Optional) a tiny committed sample trace for `--from-trace` smoke verification, OR synthesize inline -- planner's discretion (D-02 capability; Phase 13 supplies live traces).

## Security Domain

> `security_enforcement` not surfaced as `false` in the init config; included for completeness. Phase 11 authors test scripts only; it adds no auth, network, crypto, or data-handling surface.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth surface (test fixtures) |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | No access control |
| V5 Input Validation | yes (minor) | `--from-trace <file>` reads a path argument; validate the arg is present (`${2:?}`) and the file is readable before `cat`. Self-extract reads a fixed repo-relative agent path. |
| V6 Cryptography | no | No crypto (do not hand-roll any) |

### Known Threat Patterns for bash test fixtures
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Untrusted `--from-trace` path -> command injection via unquoted expansion | Tampering | Quote all expansions (`"$TRACE_FILE"`); never `eval`; `set -u` catches unset args; read with `cat "$file"`, never source it |
| Self-test synthesizes input -> no external input path | -- | `--self-test` builds its input with `printf`, no file read; lowest-risk mode |
| Reading the agent markdown as data | Info disclosure | None -- the agent files are committed, public plugin prompts; reading them is the intended behavior |

No network, no secrets, no privileged operation. The fixtures are read-only over committed files.

## Sources

### Primary (HIGH confidence)
- `plugins/lz-advisor/agents/reviewer.md` (HEAD) -- 3-slot fragment grammar (Format line 59), severity legend (64-67), per-finding budget rule + prefix-exclusion (69), worked examples (88-134), holistic example with 7 findings (125-142), `<output_constraints>` (160-187), fixture name reference (189). [VERIFIED: Read this session]
- `plugins/lz-advisor/agents/security-reviewer.md` (HEAD) -- 4-slot grammar (Format line 60), OWASP `[Axx]` legend (70), severity legend (65-68), auto-clarity CVE carve-out (125-129, 151), holistic example with 7 findings incl. CVE line (133-149), `<output_constraints>` (165-192), fixture name reference (194). [VERIFIED: Read this session]
- `tests/validate-phase-03.sh`, `tests/validate-phase-04.sh` (HEAD) -- committed house style: `set -euo pipefail` (line 7), `pass()`/`fail()` + counters (13-22), summary + exit logic (144-158 / 380-394). NOTE: their path variables are stale post-Phase-9. [VERIFIED: Read this session]
- `.planning/milestones/v1.0-ROADMAP.md` (HEAD) -- Plan 08-02 (RES-SHAPE-REGRESSION-PARSER backtick tolerance + RES-PFV-OUTLIER-CAP 66w->75w, lines 246, 255), ef97e21 +10% parser-layer tolerance (240), Plan 07-17 3x re-run gate (238), n=10 E.1 gate (240). [VERIFIED: `git grep -n` this session]
- `.planning/research/SUMMARY.md`, `ARCHITECTURE.md` (esp. CRITICAL pre-finding 73-77, STEP 0 194-199), `PITFALLS.md` (Pitfall 2 42-62, "Looks Done But Isn't" 197-208), `FEATURES.md` -- milestone scope at HIGH confidence. [VERIFIED: Read this session]
- `.planning/phases/11-fixture-baseline/11-CONTEXT.md` -- locked decisions D-01..D-12. [VERIFIED: Read this session]
- `.planning/REQUIREMENTS.md` -- GATE-01 wording + locked-decisions table. [VERIFIED: Read this session]
- Empirical commands this session: `git ls-files "*budget*"` (0 matches, fixtures absent), `git grep -l FRAGMENT_RE` (planning/agent docs only), `git ls-files "skills/lz-advisor-execute/SKILL.md" "agents/reviewer.md"` (0, stale paths confirmed), `wc -w` on every holistic-example finding body (reviewer 10/9/11/7/17/13/16; security 17/9/15/9/13/35; CVE line 38; reviewer Cross-Cutting 63w; security Threat Patterns 60w), `bash --version` (5.3.9 Cygwin). [VERIFIED]

### Secondary (MEDIUM confidence)
- Project memory: `feedback_no_wip_commits` (no wip: commits), `version_numbers_not_load_bearing_prerelease`, `reference_sonnet_46_prompt_steering`. CLAUDE.md: Git Bash compatibility, ASCII-only, `git grep`-first, Write-tool-not-heredoc, stage-by-name. [Project-local conventions]

### Tertiary (LOW confidence)
- None. Every claim anchors to a committed file:line or a command run this session.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero external deps; bash 5.3.9 + coreutils verified present; house style is committed and read.
- Architecture (fixture design): HIGH -- the parser shape is fully determined by the committed agent grammar (read) + recovered Phase 08 decisions (roadmap-verified) + empirically-measured word counts.
- Recovered Phase 08 contract: HIGH for the values present in `v1.0-ROADMAP.md` (backtick tolerance, 75w cap, --from-trace, ef97e21); MEDIUM for the verify_request treatment (not documented -> A1 assumption, low risk either way).
- Pitfalls: HIGH -- each anchored to a file:line or a command output (stale paths, CVE 35w overflow, backtick framing, prefix exclusion, vacuous pass).

**Research date:** 2026-06-07
**Valid until:** 2026-07-07 (stable -- local prompt-engineering artifacts; the only drift vector is Phase 12 editing the agent grammar, which is the intended lockstep trigger, not a research-invalidation).
