# Phase 6 Gap-Closure Research (G1, G2, G3)

**Researched:** 2026-04-30
**Domain:** Trust-contract source-provenance classification; ToolSearch-availability rule; Class 2-S security-currency taxonomy; regression replay subset on plugin 0.9.0
**Confidence:** HIGH (all load-bearing claims verified against the codebase via `git grep` / Read or against primary Anthropic sources or against the four 06-VERIFICATION.md amendments verbatim)

> Companion to `06-RESEARCH.md` (which covered the original Pattern D shipping research). This file covers ONLY the gap-closure plan surface created by 06-VERIFICATION.md amendments 2, 3, and 4. Both files should be `@`-loaded by the planner.

## Summary

Phase 6 ships PASS-with-caveat at plugin 0.8.9. Three follow-up amendments to 06-VERIFICATION.md (2, 3, 4) describe behavioral gaps that are inside Phase 6's scope (trust-contract surface in 4 SKILL.md plus `references/orient-exploration.md`) and remain unclosed. The `/gsd-plan-phase 6 --gaps --research` invocation forces fresh research and produces this file so the planner can compose Plans 06-05+ that close G1, G2, G3 deterministically.

The single highest-leverage finding is that **G1 and G2 share a fix surface** (`<context_trust_contract>` block in 4 SKILL.md) but **G3 has a separate fix surface** (`references/orient-exploration.md` + a worked-example reference in `lz-advisor.security-review/SKILL.md`). The 4-skill byte-identical canon contract for `<context_trust_contract>` is currently respected (verified via `git grep`); the rewrite must preserve byte-identical landing across all 4 SKILL.md files at the end of the gap-closure plans, not in a half-modified state across plan boundaries.

The second highest-leverage finding is that **the suppression operates one layer earlier than amendment 2 framed it** (per amendment 3): WebSearch and WebFetch are deferred tools in agent-generated-source sessions, and the executor never invokes `ToolSearch select:WebSearch,WebFetch` to load them. The G2 fix must add a ToolSearch-availability rule that fires BEFORE ranking short-circuits -- this is structurally different from "rewrite the carve-out." The carve-out rewrite (provenance-based) and the ToolSearch-availability rule are the two halves of the G1+G2 fix and must land together.

The third highest-leverage finding is that **`npm audit --json` is the cheapest first-line check for Class 2-S** (G3) and is verified available on the local environment (`npm 11.6.2`). It is local, fast, and produces structured output. The fallback chain `npm audit --json -> WebFetch GitHub Security Advisories -> WebSearch "<package> CVE <year>"` is the recommended ordering. The G3 worked example in `references/orient-exploration.md` should anchor on the canonical `@compodoc/compodoc^1.2.1` Compodoc-version scenario from the 2026-04-30 security-review UAT (session log `2d388e98-...`).

**Primary recommendation for the planner:**
1. **Plan 06-05 (G1+G2):** Rewrite `<context_trust_contract>` in 4 SKILL.md byte-identically with a provenance-based classification (vendor-doc vs agent-generated) PLUS a new ToolSearch-availability rule that fires before ranking short-circuits when input contains agent-generated source on Class-2/3/4 questions. Same single commit lands all 4 files; `git grep -c` count post-commit must be exactly 4 for the new canon string.
2. **Plan 06-06 (G3):** Append a Class 2-S sub-section to `references/orient-exploration.md` with the `npm audit --json` -> GitHub Security Advisories -> WebSearch CVE ordering AND the `@compodoc/compodoc^1.2.1` worked example. Add a one-line cross-reference in `lz-advisor.security-review/SKILL.md`'s scan-phase guidance pointing at the new sub-section.
3. **Plan 06-07 (version + replay + verification amendment):** Bump 0.8.9 -> 0.9.0 across 5 surfaces (1 plugin.json + 4 SKILL.md frontmatter); re-run plan-fixes UAT and security-review UAT against plugin 0.9.0; write 06-VERIFICATION.md amendment 5 capturing closure verdict.

## User Constraints (from CONTEXT.md and VERIFICATION.md amendments)

### Locked Decisions (carry forward from 06-CONTEXT.md verbatim, refined by amendments)

The original D-01..D-06 from 06-CONTEXT.md remain locked. Gap closure refines D-01 (taxonomy gains Class 2-S sub-pattern) and D-02 (Pattern D location surface gains a trust-contract rewrite at the SKILL.md surface, not just the references/ surface). No new D-IDs are introduced -- gap closure operates inside the existing decision envelope.

**Closure criteria (verbatim from 06-VERIFICATION.md "Unclosed Phase-6 Gaps" section, lines 35-41):**

> 1. G1 + G2 closed: `<context_trust_contract>` rewritten to classify by source provenance (vendor-doc vs agent-generated); ToolSearch-availability rule fires before ranking when input contains agent-generated source on Class-2/3/4 questions; byte-identical canon preserved across 4 SKILL.md.
> 2. G3 closed: `references/orient-exploration.md` carries Class 2-S sub-pattern with worked example for CVE / npm audit / GitHub Security Advisories surfaces; security-review SKILL.md references the sub-pattern in its scan-phase guidance.
> 3. Plugin version bump (suggest 0.8.9 -> 0.9.0; minor for contract-shape change).
> 4. Regression replay: re-run a representative subset of the 6 closed UATs (at minimum: plan-fixes UAT and security-review UAT) on the new plugin version and verify Pattern D fires (web tool count > 0 OR pv-* synthesized OR Class 2-S worked example triggers a CVE check) on the inputs that previously suppressed it.
> 5. `06-VERIFICATION.md` final amendment downgrades `PASS-with-caveat` to `PASS` (or `PASS-with-residual-Phase-7-scope`).

### Claude's Discretion

- Exact wording of the rewritten `<context_trust_contract>` provenance-based classification -- anchored in the amendments 2 + 3 direction text (lines 256-260 + 301-306 of 06-VERIFICATION.md) but composed by the planner. Must remain ASCII-only; must remain in the calm-natural-language register (no `MUST` / `NEVER` / `CRITICAL` for tool-use steering per D-03 from CONTEXT.md).
- Exact wording of the ToolSearch-availability rule -- anchored in amendment 3 direction (line 306 of 06-VERIFICATION.md) but composed by the planner.
- Exact wording of Class 2-S sub-pattern + Compodoc worked example -- anchored in amendment 4 direction text (lines 353-365 of 06-VERIFICATION.md) but composed by the planner.
- Whether the trust-contract rewrite EXTENDS the existing 3 numbered authoritative-source-block shapes (`---` block / quoted-docs block / `<fetched>` block) or REPLACES them. Recommended: extend, with a new "Source provenance classification" subsection appended after the existing 3 shapes. Preserves the existing shape-detection logic (which is correct) and adds the provenance test on top.
- Whether the worked example for Class 2-S lives only in `references/orient-exploration.md`, only in `lz-advisor.security-review/SKILL.md`, or in both with cross-reference. Recommended: full worked example in `references/orient-exploration.md` (Class 2-S sub-section); `lz-advisor.security-review/SKILL.md` gains a one-line cross-reference inside its scan-phase guidance.
- Plan granularity: 3 plans (G1+G2 / G3 / version+replay+amendment) is the recommended decomposition; planner may merge G3 into the version-bump plan if the trust-contract plan is the only "big" plan. Recommended: 3 plans for clean revert-surface separation.
- Whether the regression replay is automated (rerun-all.sh script + tally-extension extension) or manual (user runs `claude -p` per UAT directly). Recommended: keep manual to mirror the original UAT cycle's manual style; the original 5 follow-up UATs were all manual and produced session-notes.md narrative.
- Whether the regression replay subset should also include execute-fixes UAT (the third gap-surfacing UAT). Recommended: NO -- closure criterion 4 names "minimum: plan-fixes + security-review"; execute-fixes is a stronger amendment-3 confirmation but its closure is implied by plan-fixes (same root cause: agent-generated source carve-out). Add execute-fixes only if planner wants a third data point on the trust-contract fix's strength on plan-file input.

### Deferred Ideas (OUT OF SCOPE -- Phase 7 territory)

These items are explicitly in PHASE-7-CANDIDATES.md, not in Phase 6 gap closure. The gap closure must NOT bleed into them:

- **Phase 7 Finding A (silent apply-then-revert):** execute-skill discipline; orthogonal to Pattern D / trust-contract.
- **Phase 7 Finding B.1 (pv-* carry-forward gap):** `references/context-packaging.md` Common Contract Rule 5; not orient-exploration / trust-contract.
- **Phase 7 Finding B.1 broadened (pv-* synthesis gap):** Common Contract Rule 5 same surface; the executor must SYNTHESIZE pv-* blocks for orient-phase empirical findings, not just propagate them. Out of Phase 6 scope.
- **Phase 7 Finding B.2 (Pre-verified Claims confabulation):** Common Contract Rule 5 same surface; out of Phase 6 scope.
- **Phase 7 Finding C (4 confidence-laundering guards including scope-disambiguated provenance markers):** cross-skill workflow concern; spans context-packaging.md + each SKILL.md output template; out of Phase 6 scope.
- **Phase 7 Finding D (word-budget regression on security-reviewer agent ~412w vs 300w cap):** `agents/security-reviewer.md` prompt engineering; orthogonal to Pattern D; out of Phase 6 scope.
- **Hedge marker preservation (regex propagation rule into `## Source Material`, prohibition on promotion into `## Pre-verified Claims`):** belongs primarily to Phase 7 Finding C; the Phase 6 gap closure references this only enough to set the trust-contract fix's expectation. The full hedge propagation rule with regex enforcement is Phase 7 territory.

The gap closure may MENTION these surfaces in trust-contract prose only insofar as the carve-out direction needs to gesture at hedge survival (per amendment 2 line 259); it must NOT define the regex enforcement, the propagation rule into the consultation prompt, or the prohibition on promotion. Those enforcement mechanisms live in `references/context-packaging.md`, not in `<context_trust_contract>`.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| D-01 (refined) | Pattern D taxonomy gains Class 2-S sub-pattern for security-embedded currency questions | Amendment 4 verbatim direction (06-VERIFICATION.md lines 353-365); empirical evidence in security-review UAT session log `2d388e98-...` (lines 49-71 of uat-security-review-skill/session-notes.md). Verified empirical: `npm audit` is available on the local environment (`npm 11.6.2`, confirmed via `npm --version`). [VERIFIED: empirical npm probe 2026-04-30] |
| D-02 (refined) | Pattern D fix surface extends to `<context_trust_contract>` block in 4 SKILL.md (provenance-based classification + ToolSearch-availability rule) | Amendments 2 + 3 verbatim direction (06-VERIFICATION.md lines 256-260 + 301-306); empirical evidence in plan-fixes UAT (session log `26868ae7-...`) and execute-fixes UAT (session log `e4592a03-...`). Trust-contract block currently byte-identical across 4 SKILL.md (verified via `git grep` -- see section Codebase Verification). [VERIFIED: codebase grep 2026-04-30] |
| D-06 (refined) | Plugin version bumps 0.8.9 -> 0.9.0 (minor for contract-shape change, per closure criterion 3) | All 5 surfaces verified at 0.8.9 today via `rg -uu -l "0\.8\.9" plugins/lz-advisor/`: `plugin.json`, `lz-advisor.plan/SKILL.md` line 18, `lz-advisor.execute/SKILL.md` line 19, `lz-advisor.review/SKILL.md` line 19, `lz-advisor.security-review/SKILL.md` line 19. [VERIFIED: codebase grep 2026-04-30] |
| (new) Closure | 06-VERIFICATION.md amendment 5 captures gap-closure verdict and downgrades PASS-with-caveat to PASS or PASS-with-residual-Phase-7-scope | Closure criterion 5 verbatim (06-VERIFICATION.md line 41). |
| (new) Replay | At minimum the plan-fixes UAT and security-review UAT re-run on plugin 0.9.0 with Pattern D firing (web_uses > 0 OR pv-* synthesized OR Class 2-S CVE check triggered) | Closure criterion 4 verbatim (06-VERIFICATION.md line 40). Trace-grep patterns derived in section Validation Architecture below. |

## Project Constraints (from CLAUDE.md)

> Project CLAUDE.md (lz-advisor-claude-plugins/CLAUDE.md) -- directives apply to gap-closure plan execution. Same constraints as the original Phase 6 plans inherit; the highest-priority constraints are listed first.

| Constraint | Source | How Gap Closure Honors |
|------------|--------|------------------------|
| ASCII-only output (no emoji, em-dashes, curly quotes, bullet `*`) | Global CLAUDE.md "Never use emojis, Unicode box-drawing, or non-ASCII symbols" | All gap-closure edits to 4 SKILL.md, `references/orient-exploration.md`, `references/context-packaging.md` (if amended), and `06-VERIFICATION.md` amendment 5 must be ASCII-only. The existing files are ASCII-clean (verified via Read pass 2026-04-30); maintain. |
| Use `git grep` first for tracked files; `rg -uu` only for git-ignored | Global CLAUDE.md "Content Search (Windows arm64)" | All static existence checks (e.g., "byte-identical canon present in all 4 SKILL.md", "no 0.8.9 residuals after bump") use `git grep`; trace inspection uses `rg`. Never `grep`. |
| Never `git add .` / `git add -A`; stage specific files by name | Global CLAUDE.md "Git rules" | Plan 06-05 stages 4 SKILL.md by name; Plan 06-06 stages `references/orient-exploration.md` + `lz-advisor.security-review/SKILL.md`; Plan 06-07 stages `plugin.json` + 4 SKILL.md (version bump) + the rerun artifacts + `06-VERIFICATION.md`. |
| Never write multi-line content via heredocs / echo; use Write tool | Global CLAUDE.md "Shell rules" | Trust-contract rewrite, Class 2-S sub-section, and 06-VERIFICATION.md amendment 5 must be created via Write tool, not `cat <<EOF`. |
| RTK prefix on git / build / file commands | Global CLAUDE.md "RTK Token Killer" | `rtk git status`, `rtk git diff`, `rtk git log`, `rtk git commit` consistently across plan commits. |
| GSD workflow: never edit outside `/gsd-quick`, `/gsd-debug`, `/gsd-execute-phase` | Project CLAUDE.md GSD enforcement | Gap-closure plans execute through `/gsd-execute-phase 6`. |
| Skill verification via `claude -p` non-interactive CLI | Project CLAUDE.md "Skill Verification with `claude -p`" | Regression replay UATs (Plan 06-07) use `claude --model sonnet --effort medium --plugin-dir plugins/lz-advisor -p "/lz-advisor.<skill> ..." --verbose --output-format stream-json` per the canonical pattern. |
| User memory: "Web tool usage must be observable" | MEMORY.md `feedback_web_tool_usage_must_be_observable.md` | The web-usage gate from original Phase 6 carries forward; the gap closure adds two parallel observability surfaces: ToolSearch invocation events (proves the loading layer fires) and `npm audit` invocation events for Class 2-S (proves the security-currency route fires). |
| User memory: "UAT canonical prompt format" | MEMORY.md `feedback_uat_canonical_prompt_format.md` | Regression replay prompts (Plan 06-07) use the canonical `/lz-advisor.<skill> <one sentence>:\n---\n<authoritative doc inlined>` shape OR the no-inlined-source shape from the original Phase 6 amendment 1 baseline (Compodoc + Storybook setup prompt). The plan-fixes UAT replay uses the SAME review-file input that suppressed Pattern D originally; the security-review UAT replay uses the SAME 3-commit range that didn't trigger Class 2-S originally. Reusing inputs is REQUIRED for the regression test to be valid. |
| Sonnet 4.6 prompt steering | MEMORY.md `reference_sonnet_46_prompt_steering.md` | Trust-contract rewrite + Class 2-S sub-section use descriptive triggers + few-shot examples; reserve imperatives for compliance only. The trust-contract block is one of the few places where compliance language is acceptable (it's a contract, not steering); the Class 2-S sub-section is steering and should mirror the descriptive style of the existing 4 class blocks. |

## Codebase Verification

Verified at-rest state of the gap-closure fix surfaces as of 2026-04-30:

### `<context_trust_contract>` block -- byte-identical across 4 SKILL.md

| File | Block start | Block end |
|------|-------------|-----------|
| `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` | line 37 | line 52 |
| `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` | line 40 | line 55 |
| `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` | line 38 | line 53 |
| `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` | line 39 | line 54 |

The 16 lines inside the block are identical across all 4 files (verified via Read pass; the prefix-line offset varies by skill because `description` frontmatter has different lengths, not because the block content differs). The block currently lists three authoritative-source shapes (numbered 1, 2, 3 inside the block) and gives a positive directive ("treat its content as ground truth") plus a negative inverse ("WebFetch and WebSearch against the same library are out of scope").

### `<orient_exploration_ranking>` block -- byte-identical across 4 SKILL.md

| File | Block start | Block end |
|------|-------------|-----------|
| `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` | line 54 | line 68 |
| `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` | line 57 | line 71 |
| `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` | line 55 | line 69 |
| `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` | line 56 | line 70 |

The 14 lines inside the block are identical across all 4 files. The block contains 3 numbered ranking steps (WebSearch/WebFetch first; local-project read for project-state-only questions; `git grep` for project usage patterns) plus a worked example plus the `@`-load reference to `references/orient-exploration.md`.

### Class blocks in `references/orient-exploration.md`

Verified against Read 2026-04-30:

| Class | Heading | Line range | First-action sentence |
|-------|---------|-----------|----------------------|
| Closing intro | Pattern D opening + multi-class rule | 1-14 | (intro paragraphs; not a class block) |
| Class 1 | "Type-symbol existence" | 16-27 | "the first orient action is to read the local `.d.ts` file under `node_modules/<package>/`" (line 19-22) |
| Class 2 | "API currency / configuration / recommended pattern" | 29-47 | "the first orient action is to locate the vendor's current docs page and read it. Run `WebSearch`..." (line 32-37) |
| Class 3 | "Migration / deprecation" | 49-67 | "the first orient action is to locate the relevant release notes or migration guide and read it. Run `WebSearch`..." (line 52-58) |
| Class 4 | "Language semantics" | 69-83 | "the first orient action is one of two paths. The empirical path... The spec path: `WebSearch`..." (line 72-78) |
| Closing | "Closing Note" | 85-92 | (recommends multi-class -> web-first; gestures at Pattern B step 5 fallthrough; cross-references context-packaging.md Rule 5) |

The Class 2-S addition (G3) appends BETWEEN Class 2 (line 47) and Class 3 (line 49) as a sub-section under Class 2, OR as a new Class 5 inserted between Class 4 (line 83) and "Closing Note" (line 85). Recommendation in section Architecture Patterns below.

### `references/context-packaging.md` Rule 5

Rule 5 already cross-references `references/orient-exploration.md` (line 44, end of Rule 5: "see also `@${CLAUDE_PLUGIN_ROOT}/references/orient-exploration.md` for the question-class taxonomy"). No additional Rule-5 edit is needed for G3 -- the Class 2-S sub-pattern lives inside `orient-exploration.md` and is reachable via the existing pointer.

### Plugin versions -- all 5 surfaces at 0.8.9

Verified via `rg -uu -l "0\.8\.9" plugins/lz-advisor/` 2026-04-30:

```
plugins/lz-advisor/.claude-plugin/plugin.json:3
plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md:18
plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md:19
plugins/lz-advisor/skills/lz-advisor.review/SKILL.md:19
plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md:19
```

No drift; the bump 0.8.9 -> 0.9.0 lands cleanly across 5 surfaces in a single commit.

### ToolSearch / deferred_tools_delta / server_tool_use surfaces -- NONE in plugin source

Verified via `rg -n "deferred_tools_delta|ToolSearch|server_tool_use" plugins/lz-advisor`: zero matches. The trust-contract rewrite is the FIRST mention of `ToolSearch` in the plugin source. The rewrite must use the canonical Claude Code tool name (`ToolSearch`, capitalized); the executor invokes it via the standard tool-use mechanism with the `select` parameter.

### `npm audit --json` availability

Verified via `npm --version` (returns `11.6.2`) and `npm audit --help`. The `--json` flag is documented and produces structured output with top-level keys `actions`, `advisories`, `vulnerabilities`, `metadata`. Severity levels are critical / high / moderate / low. There is no published JSON schema (per [GitHub community discussion #153882](https://github.com/orgs/community/discussions/153882) and [npm CLI v8 docs](https://docs.npmjs.com/cli/v8/commands/npm-audit/)) but the field shape is stable enough across npm 7+ for the Class 2-S worked example to anchor on `metadata.vulnerabilities` (counts) and `vulnerabilities` (per-package records). The Compodoc worked example in Class 2-S can show both branches (no-CVE outcome -> `pv-no-known-cves` block; CVE-list outcome -> `pv-cve-list` block with affected version range).

## Provenance Classification (G1+G2 Direction)

The amendments 2 and 3 directions converge on a provenance-based classification. Verbatim from amendment 3 (06-VERIFICATION.md lines 301-306):

> Refined direction (supersedes second amendment direction): `<context_trust_contract>` should classify by SOURCE PROVENANCE, not by structural shape:
> - **Vendor-doc authoritative source** (release notes, official guides, API references, MDN, RFCs): treated as authoritative; web tools out of scope for the same library.
> - **Agent-generated source material** (any artifact produced by a prior skill invocation -- review files, plan files, consultation transcripts, prior session notes -- regardless of structural shape): NOT authoritative for vendor-API behavior questions. Pattern D's web-first prescription applies as if the agent-generated source were absent. Verify-first markers within agent-generated source survive into the consultation prompt.
> - **Hedge marker preservation rule (unchanged from second amendment):** verify-first markers (`Verify .+ before acting`, `Assuming .+ \(unverified\)`, `confirm .+ before`) MUST survive into the consultation prompt's `## Source Material` section and MUST NOT be stripped or promoted into `## Pre-verified Claims`.
> - **NEW: ToolSearch availability rule:** the orient phase MUST invoke `ToolSearch select:WebSearch,WebFetch` (or equivalent ensure-loaded mechanism) when the input prompt contains agent-generated source material on a Class-2/3/4 question, regardless of whether the orient ranking has classified the question yet. This makes the web tools structurally available before the trust-contract carve-out can short-circuit ranking.

### Operational marker for "agent-generated"

The amendments do not specify a single marker; the failure mode is generic to any artifact-shaped block (numbered findings, code blocks, recommendations). Three viable marker heuristics -- pick the one with lowest false-positive rate while preserving simple operational shape:

| # | Marker | False positives | False negatives |
|---|--------|----------------|-----------------|
| 1 | **Path heuristic on @-resolved attached file**: any file whose path matches `**/plans/**`, `**/.planning/**`, `**/*review*.md`, or any file containing the string `lz-advisor:advisor` / `lz-advisor:reviewer` / `lz-advisor:security-reviewer` in a `Source:` byline | LOW (real plans / review files DO match this shape) | MEDIUM (a third-party plan file in a different directory wouldn't match; raw inlined transcript text wouldn't match either) |
| 2 | **Source-attribution preamble**: a literal `Source: <file path>` or `Generated by <skill name>` or similar attribution at the top of the block | LOW (only matches blocks that explicitly attribute themselves) | HIGH (most existing review files / plan files do not include such a preamble; this would require a separate convention) |
| 3 | **Structural-shape negative**: NOT vendor-doc-shaped (i.e., not a `---`-delimited block at top of message that starts with a `# Title` from a docs page, AND not a `<fetched source="..." trust="untrusted">` block; default to "treat as agent-generated") | MEDIUM (could over-match user-typed prose into "agent-generated") | LOW (catches all agent-generated shapes by default) |

**Recommendation: hybrid 1 + 3 (path heuristic + structural-shape negative).** The path heuristic catches the high-volume cases (plan files via @-mention, review files via @-mention, session-notes via @-mention) cheaply. The structural-shape negative catches inlined-content cases that don't have a path. The combined rule:

> **A block is treated as agent-generated when ANY of these conditions hold: (a) the block is sourced from an @-mentioned file whose path includes `/plans/`, `/.planning/`, or contains "review" / "consultation" / "session-notes" in the filename; (b) the block contains a "Source: <agent>" / "Generated by <skill>" attribution; (c) the block lacks the canonical vendor-doc markers (`---`-delimited block + docs-page heading OR `<fetched source="..." trust="untrusted">` wrapper). When agent-generated is detected, the trust-contract DOES NOT exempt the orient phase from web-first ranking on Class-2/3/4 questions.**

This is operationally implementable in plain prose (no code), and matches the existing 3-shape detection logic the trust-contract already does (the executor scans for the existing 3 shapes, so the negative test "shape-NOT-matched + agent-path-heuristic" composes naturally).

### ToolSearch-availability rule

The orient phase classifies the question against Pattern D (Class 1/2/3/4) BEFORE the trust-contract short-circuits. When the classification is Class 2 / 3 / 4 AND the input contains agent-generated source, the executor invokes `ToolSearch select:WebSearch,WebFetch` to ensure the web tools are loaded BEFORE proceeding. Concretely:

- **Step order in orient phase:** (1) classify the question against Pattern D; (2) IF question class is 2 / 3 / 4 AND input contains agent-generated source, invoke `ToolSearch select:WebSearch,WebFetch` to ensure web tools are loaded; (3) apply ranking (web-first for Class 2/3/4 per the loaded refs/orient-exploration.md class blocks).
- **What to do if `ToolSearch` is not available:** if the session does not expose `ToolSearch` as a tool (e.g., older Claude Code version), the rule degrades gracefully -- the executor proceeds to ranking, and if WebSearch / WebFetch are listed in `command_permissions.allowedTools` they will be invoked directly when ranking calls for them. The rule is "ensure loaded if loadable"; it does not block on tool absence. (Per existing context-packaging.md Rule 6: "recover gracefully from tool-use failure".)
- **Why before ranking:** amendment 3 line 293-295 verbatim: "this UAT shows suppression operates one layer EARLIER... the executor would have needed `ToolSearch select:WebSearch,WebFetch` to load their schemas before invocation. It never invoked ToolSearch. This implies the orient phase did not reach the question-class evaluation step that would have triggered a web-tool consideration; it short-circuited on the plan input's authoritative-source treatment BEFORE considering web-first ranking."

### Style anchor for the trust-contract rewrite

Anchored in the same R-01 sources from the original Phase 6 research (06-RESEARCH.md lines 87-94, sources verified 2026-04-28):

- **Anthropic 4.x prompting best practices** (https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices) -- "if you find that the model is not using your web search tools, clearly describe why and how it should." The trust-contract rewrite is exactly this pattern: clearly describe what triggers the carve-out (vendor-doc) vs what triggers Pattern D (agent-generated), with concrete why-and-how prose. Imperatives are reserved for the "MUST NOT strip the verify-first marker" hedge-survival rule (which is genuinely a contract, not steering).
- **Anthropic search_instructions block** (Simon Willison, 2025-05-25) -- descriptive triggers + concrete examples + selective imperatives. The trust-contract rewrite mirrors this: prose describing what each provenance class looks like, with 1-2 worked examples per class, and imperatives used sparingly where compliance matters.
- **Project memory `reference_sonnet_46_prompt_steering.md`** -- descriptive triggers + few-shot examples for tool-use steering on 4.x; reserve imperatives for compliance only. The trust-contract is the rare compliance-friendly surface (it's a contract, not steering); imperatives like "the orient phase MUST invoke ToolSearch..." (per amendment 3 verbatim) are appropriate here. The Class 2-S sub-section in `references/orient-exploration.md` is steering, not contract -- descriptive triggers, no imperatives.

## Class 2-S Sub-Pattern (G3 Direction)

The amendment 4 direction (06-VERIFICATION.md lines 353-365) is the verbatim source:

> Update `references/orient-exploration.md` to add a Class-2 sub-pattern for security-embedded queries:
> - **Class 2-S (Security currency):** vulnerability and advisory questions that depend on time-varying data (CVE databases, GitHub Security Advisories, vendor security bulletins, npm audit databases). When the SKILL is `lz-advisor.security-review` AND a finding involves a third-party dependency or library, the orient phase MUST consider Class 2-S as a primary route. Recommended sequence: `npm audit --json` first (local, fast); fallback to `WebFetch` against GitHub Security Advisories for the package; `WebSearch` for "<package> CVE <year>" as a third-line check. Result: a `pv-no-known-cves` block (or `pv-cve-list`) anchoring the supply-chain finding's severity.
>
> Add a worked example to the Pattern D ranking in each SKILL.md:
>
> ```
> Example -- security-review skill scanning unpinned @compodoc/compodoc^1.2.1:
> Class 2-S route: npm audit -> WebFetch GitHub Security Advisories
> -> WebSearch "@compodoc/compodoc CVE 2026"
> -> synthesize pv-no-known-cves block (or pv-cve-list with affected version range).
> Without this anchor, severity assertion is theoretical, not empirical.
> ```

### Recommended placement

Append Class 2-S as a **sub-section under Class 2** (between line 47 and line 49 of `references/orient-exploration.md`). Rationale: Class 2-S IS Class 2 (currency-dependent, vendor-doc-equivalent answers); the difference is the SURFACE (CVE database vs vendor docs page) and the SKILL CONTEXT (`security-review` vs others). A sub-section preserves Pattern D's "four classes exhaustive" property (per CONTEXT.md deferred ideas + open question 4 of original 06-RESEARCH.md) while adding a security-context conditional inside Class 2.

Alternative placement: parallel new class (Class 5) inserted between Class 4 (line 83) and "Closing Note" (line 85). Pros: visually parallel to the existing 4 classes. Cons: violates the "four classes exhaustive" property; invites a Class 6 catch-all next.

**Recommendation: sub-section under Class 2, named "### Class 2-S: Security currency (sub-pattern of Class 2)".** Inside the sub-section: trigger condition, ordering rationale, worked example, pv-* block contract. ~80-120 words per the existing class-block word budget convention (06-CONTEXT.md Claude's Discretion item 1).

### Ordering rationale

`npm audit --json` first -> `WebFetch` GitHub Security Advisories -> `WebSearch "<package> CVE <year>"` is the recommended ordering. Justification:

1. **`npm audit --json` is local and fast.** Runs against the project's `package-lock.json` directly; no network roundtrip per package; structured output (`metadata.vulnerabilities` count + `vulnerabilities` per-package records). ~100ms-2s typical. Catches the bulk of "is this package known-vulnerable" questions for any package in the dep tree, not just the top-level.
2. **GitHub Security Advisories is the canonical second-line check.** When `npm audit` returns a count for a package or the user wants advisory text (not just severity), `WebFetch https://github.com/advisories?query=<package>` returns the human-readable advisory list. Slower than npm audit (~1-3s per fetch) but provides advisory IDs (GHSA-*) and affected version ranges that anchor pv-* claims.
3. **WebSearch CVE is third-line for cases where (1) and (2) miss.** Catches CVEs that exist in the National Vulnerability Database but haven't been mirrored to GitHub Advisories yet (rare but happens), or CVEs that affect vendored / non-npm-published packages.

Caveats the planner should bake into the prose:

- `npm audit` only catches packages in the `package-lock.json` dep tree. For packages NOT in the project's lockfile (e.g., a package the security-review is asked to triage in isolation), skip directly to step 2.
- `npm audit --json` returns severity levels `critical / high / moderate / low`. The pv-* block should map these to OWASP severity tags consistently with the security-reviewer agent's existing severity classification.
- npm CLI source remains the authoritative reference; there is no published JSON schema (per the [GitHub community discussion](https://github.com/orgs/community/discussions/153882)). Field shape is stable across npm 7+ but planner should note "test parsing logic against new npm releases".

### `pv-no-known-cves` and `pv-cve-list` block shapes

Two outcomes from the 3-step Class 2-S sequence:

**Outcome A (no CVEs found):**

```xml
<pre_verified source="npm audit --json" claim_id="pv-no-known-cves-1">
  <claim>No known vulnerabilities for `@compodoc/compodoc@1.2.1` (or its transitive deps) as of <YYYY-MM-DD> per local npm audit + GitHub Security Advisories check.</claim>
  <evidence method="Bash">
    npm audit --json | jq '.metadata.vulnerabilities'
    {"info":0,"low":0,"moderate":0,"high":0,"critical":0,"total":0}
  </evidence>
</pre_verified>
```

**Outcome B (CVEs found):**

```xml
<pre_verified source="npm audit --json + GitHub Security Advisories" claim_id="pv-cve-list-1">
  <claim>`@<package>@<version>` has <N> known vulnerabilities (severity: <highest>; affected version range: <range>) per npm audit + GHSA-<ID>.</claim>
  <evidence method="Bash">
    [npm audit --json excerpt for the package's vulnerabilities record]
  </evidence>
  <evidence method="WebFetch">
    [GHSA advisory excerpt; verbatim quote]
  </evidence>
</pre_verified>
```

These block shapes match the existing pv-* convention from `references/context-packaging.md` Common Contract Rule 5 (lines 110-118 / 213-218). The `claim_id` namespace `pv-no-known-cves-N` / `pv-cve-list-N` is a Phase 6 gap-closure addition; it does not conflict with the existing `pv-N` namespace because the existing namespace is local-to-each-consultation (see context-packaging.md "Number claim_ids sequentially (pv-1, pv-2, ...)" -- the executor numbers within a single consultation).

### Worked example end-to-end (Compodoc scenario)

Anchor: 2026-04-30 security-review UAT, session log `2d388e98-1e6a-4978-8290-115852470529.jsonl`. Finding 2 of that UAT was the unpinned `@compodoc/compodoc^1.2.1` supply-chain risk; the security-reviewer flagged it theoretically but never ran an empirical CVE check (uat-security-review-skill/session-notes.md lines 49-71).

Worked example end-to-end (intended for `references/orient-exploration.md` Class 2-S sub-section):

```
Example -- security-review skill scanning unpinned `@compodoc/compodoc^1.2.1`:

Orient question: "Are there known CVEs in `@compodoc/compodoc@1.2.1`
or its transitive deps?"

Class 2-S route:
1. `npm audit --json` (local, fast). Output: `{"metadata": {"vulnerabilities":
   {"info":0,"low":0,"moderate":0,"high":0,"critical":0,"total":0}}}`. Zero
   advisories for the installed version.
2. (Optional) `WebFetch https://github.com/advisories?query=@compodoc/compodoc`
   to confirm the empty result against GitHub's Security Advisories index. No
   advisories returned.
3. (Optional) `WebSearch "@compodoc/compodoc CVE 2026"` for
   third-line confirmation.

Synthesize a `<pre_verified source="npm audit --json" claim_id="pv-no-known-cves-1">`
block with the empirical finding. Use the pv-* block to anchor Finding 2's
severity in the consultation prompt.

Without this anchor, the supply-chain severity assertion is theoretical
(based on "unpinned package" pattern alone), not empirical.
```

The worked example shows BOTH the no-CVE happy path AND the next-step option for the CVE-list branch. The planner may shorten it to fit the 80-120-word class-block budget by trimming the WebFetch / WebSearch sub-bullets.

### Cross-reference in security-review SKILL.md

The amendment 4 direction includes a phrase about adding the worked example "to the Pattern D ranking in each SKILL.md". The recommended interpretation: full worked example lives in `references/orient-exploration.md` Class 2-S sub-section; `lz-advisor.security-review/SKILL.md` gets a one-line cross-reference inside its scan-phase guidance pointing at the sub-section.

Recommended insertion location in `lz-advisor.security-review/SKILL.md`: after line 71 (after the existing "When fetching CVE data, OWASP references..." sentence about Common Contract rules 5 and 5a). Add:

```markdown
For supply-chain findings on third-party dependencies (CVE / advisory / security-bulletin questions), see Class 2-S in `@${CLAUDE_PLUGIN_ROOT}/references/orient-exploration.md` for the recommended `npm audit -> GitHub Security Advisories -> WebSearch CVE` sequence and the `pv-no-known-cves` / `pv-cve-list` synthesis contract.
```

This keeps `lz-advisor.security-review/SKILL.md` lightweight (one line addition; no inline duplication of the worked example), preserves the byte-identical canon contract for the OTHER 3 SKILL.md (which do not get the cross-reference because Class 2-S is security-review-specific per amendment 4), and gives the executor a direct path from the security-review scan phase into the Class 2-S taxonomy.

## SemVer 0.9.0 Surface Inventory

Closure criterion 3 specifies bump 0.8.9 -> 0.9.0 (minor). All 5 surfaces are at 0.8.9 today (verified 2026-04-30):

| File | Line | Current value | New value |
|------|------|---------------|-----------|
| `plugins/lz-advisor/.claude-plugin/plugin.json` | 3 | `"version": "0.8.9",` | `"version": "0.9.0",` |
| `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` | 18 | `version: 0.8.9` | `version: 0.9.0` |
| `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` | 19 | `version: 0.8.9` | `version: 0.9.0` |
| `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` | 19 | `version: 0.8.9` | `version: 0.9.0` |
| `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` | 19 | `version: 0.8.9` | `version: 0.9.0` |

Post-bump verification:

```bash
# All 5 surfaces at 0.9.0
git grep -c '"version": "0\.9\.0"' plugins/lz-advisor/.claude-plugin/plugin.json   # expect 1
git grep -c '^version: 0\.9\.0$' plugins/lz-advisor/skills/*/SKILL.md              # expect 4

# Zero 0.8.9 residuals
! rg -uu -l '0\.8\.9' plugins/lz-advisor/ || true                                  # expect zero matches
```

Rationale for minor (vs patch): closure criterion 3 explicitly says "minor for contract-shape change". The trust-contract rewrite changes the contract shape (provenance-based classification + ToolSearch-availability rule both affect HOW the executor decides what to do during orient). The Class 2-S sub-pattern is additive and could be patch-level alone, but bundled with the contract-shape change, the whole gap closure is minor.

Phase 5.6 D-13 / Phase 6 D-06 SemVer convention treats "calibration-only refinements" as patch and "contract-shape changes" as minor. Phase 7 should resume the patch convention (Findings A-D are calibration / discipline refinements, not contract-shape changes).

## Regression Replay Subset

Closure criterion 4 specifies "at minimum: plan-fixes UAT and security-review UAT". The original UATs that surfaced amendments 2 and 4 (and a third that surfaced amendment 3) are:

| UAT | Date | Plugin | Session log | Surfaced gap | Original verdict |
|-----|------|--------|-------------|--------------|-------------------|
| `uat-plan-skill-fixes` | 2026-04-29 | 0.8.9 | `26868ae7-1f9a-4a71-a146-16e7781b74c6.jsonl` | Amendment 2 (review-file authoritative-source carve-out) | PASS-with-significant-observations |
| `uat-execute-skill-fixes` | 2026-04-29 | 0.8.9 | `e4592a03-0cf4-4925-af93-fdf20c663a25.jsonl` | Amendment 3 (plan-file input + ToolSearch-loading-layer suppression) | PASS-with-significant-observations |
| `uat-security-review-skill` | 2026-04-30 | 0.8.9 | `2d388e98-1e6a-4978-8290-115852470529.jsonl` | Amendment 4 (Class 2-S taxonomy gap) | PASS-with-observations |

**Recommended replay subset:** all THREE original gap-surfacing UATs. Closure criterion 4 names two; the third (execute-fixes) is the strongest amendment-3 confirmation and adds little replay cost. Specifically:

- **plan-fixes UAT replay** -- same review-file input that suppressed Pattern D originally, on plugin 0.9.0. Success: `web_uses > 0` in the trace OR ToolSearch invocation event present, AND the consultation prompt's `## Source Material` section preserves the "Verify Storybook Angular version behavior before acting" hedge marker (per closure criterion 4 + amendment 2 line 259).
- **execute-fixes UAT replay** -- same plan-file input (commit `2173e39`) that suppressed Pattern D originally, on plugin 0.9.0. Success: `web_uses > 0` OR ToolSearch invocation event present.
- **security-review UAT replay** -- same 3-commit range `09a09d7^..05ea109` that did not trigger Class 2-S originally, on plugin 0.9.0. Success: `npm audit` invocation event present (Bash tool with command starting `npm audit`) OR a `pv-no-known-cves` / `pv-cve-list` block synthesized in the consultation prompt for Finding 2 (`@compodoc/compodoc^1.2.1` supply-chain finding).

### UAT directory layout for replay

Mirror the original UAT directory shape:

```
.planning/phases/06-address-phase-5-6-uat-findings/
|-- uat-plan-skill-fixes-rerun/          # Plan 06-07 replay
|   `-- session-notes.md
|-- uat-execute-skill-fixes-rerun/       # Plan 06-07 replay
|   `-- session-notes.md
|-- uat-security-review-skill-rerun/     # Plan 06-07 replay
|   `-- session-notes.md
```

Each subdirectory's `session-notes.md` mirrors the shape of the original (frontmatter + workflow phase compliance table + empirical metrics table + observations + verdict). The session log path is captured in the frontmatter; the actual JSONL trace file lives under `c:/Users/.../claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/<session-id>.jsonl` per the canonical project log location.

### Trace-grep patterns for "Pattern D fires after gap closure"

The patterns for verifying Pattern D firing in each rerun trace, anchored on `rg` regex-dialect portability verified in 06-RESEARCH.md Pitfall 3:

| Pattern | Fires when | rg invocation |
|---------|-----------|---------------|
| WebSearch / WebFetch tool_use event | Pattern D's web-first ranking fires (Class 2/3/4) | `rg -c '"name":"(WebSearch\|WebFetch)"' "$TRACE"` |
| ToolSearch invocation event for Web tools | ToolSearch-availability rule fires (G2 closure signal) | `rg -c '"name":"ToolSearch"' "$TRACE"` AND `rg -B2 -A2 '"name":"ToolSearch"' "$TRACE" \| rg -F 'WebSearch'` |
| Pre-verified block synthesized | pv-* synthesis fires in consultation prompt (Phase 7 B.1 broadened, but also a Pattern-D-fired indicator) | `rg -c '<pre_verified source=' "$TRACE"` |
| `npm audit` invocation | Class 2-S route fires (G3 closure signal, security-review only) | `rg -c '"name":"Bash".*"command":".*npm audit' "$TRACE"` |
| `pv-no-known-cves` or `pv-cve-list` block | Class 2-S synthesis fires (G3 alternative closure signal) | `rg -c 'claim_id="pv-(no-known-cves\|cve-list)' "$TRACE"` |
| Hedge marker survival | Hedge marker preserved (G1+G2 closure refinement) | `rg -c 'Verify .+ before acting\|Assuming .+ \(unverified\)' "$TRACE"` (against the consultation prompt section of the trace specifically) |

**Per-UAT success criterion:**

- plan-fixes UAT replay: `(WebSearch_count + WebFetch_count) > 0` OR `ToolSearch_with_web_select_count > 0`.
- execute-fixes UAT replay: same.
- security-review UAT replay: `(npm_audit_count > 0)` OR `(pv-no-known-cves_count > 0 OR pv-cve-list_count > 0)`. NOT `WebSearch / WebFetch` -- security-review's primary questions are Class-1 domain reasoning; Class 2-S route is the embedded sub-check.

## 06-VERIFICATION.md Amendment 5 Template

Closure criterion 5 specifies the final amendment downgrades PASS-with-caveat to PASS or PASS-with-residual-Phase-7-scope. Skeleton for the planner to fill in:

```markdown
## Amendment 2026-MM-DD (fifth) -- Gap closure for amendments 2, 3, 4 + final verdict downgrade

The Phase 6 follow-up gap-closure cycle (Plans 06-05, 06-06, 06-07) closed
the three open gaps captured in amendments 2, 3, 4 against plugin 0.9.0.

### Gap-closure plans

| Plan | Closes | Surface | Commit |
|------|--------|---------|--------|
| 06-05 | G1 + G2 | `<context_trust_contract>` rewrite (provenance-based classification + ToolSearch-availability rule) byte-identically across 4 SKILL.md | <commit hash> |
| 06-06 | G3 | `references/orient-exploration.md` Class 2-S sub-section + `lz-advisor.security-review/SKILL.md` cross-reference | <commit hash> |
| 06-07 | Closure criteria 3, 4, 5 | Plugin version bump 0.8.9 -> 0.9.0; regression replay subset (plan-fixes + execute-fixes + security-review UATs); this amendment | <commit hash> |

### Regression replay results on plugin 0.9.0

| UAT | Original gap | Replay session log | Pattern D fires? | Verdict |
|-----|--------------|--------------------|------------------|---------|
| plan-fixes | Amendment 2 (review-file carve-out) | <new session id> | <yes/no with metric: web_uses=N OR ToolSearch+web=N> | <PASS/FAIL> |
| execute-fixes | Amendment 3 (plan-file + ToolSearch layer) | <new session id> | <yes/no with metric> | <PASS/FAIL> |
| security-review | Amendment 4 (Class 2-S) | <new session id> | <yes/no with metric: npm_audit=N OR pv-no-known-cves=N> | <PASS/FAIL> |

### Plugin version on disk

| Surface | Pre | Post |
|---------|-----|------|
| `plugins/lz-advisor/.claude-plugin/plugin.json` | 0.8.9 | 0.9.0 |
| 4 SKILL.md frontmatter | 0.8.9 | 0.9.0 |

### Final verdict

<PASS / PASS-with-residual-Phase-7-scope> -- the contract-shape changes in
G1+G2 land cleanly; Class 2-S surfaces empirically on the security-review
replay; <residual Phase 7 scope items, if any>.

### Residual Phase 7 scope (out of Phase 6 closure)

- Phase 7 Finding A (silent apply-then-revert): n>=3 trial requirement still
  open per PHASE-7-CANDIDATES.md.
- Phase 7 Finding B (B.1 carry-forward + B.1 broadened synthesis + B.2
  confabulation): pv-* discipline at the consultation-construction layer.
- Phase 7 Finding C (4-guard suite including scope-disambiguated provenance
  markers): cross-skill workflow concern.
- Phase 7 Finding D (security-reviewer word-budget regression).

Phase 6 closes; Phase 7 inherits the residual scope.
```

The planner fills in: actual commit hashes, actual session log IDs from the rerun, actual web_uses / ToolSearch / npm_audit counts from the trace-grep patterns, and the final verdict (PASS or PASS-with-residual-Phase-7-scope).

## Architecture Patterns

### Pattern G1+G2: Provenance-classified trust contract with ToolSearch-availability rule

**What:** The rewritten `<context_trust_contract>` block in 4 SKILL.md, byte-identical across all four files. Combines (a) the existing 3-shape detection logic (preserved unchanged), (b) a new provenance-classification step (vendor-doc vs agent-generated), and (c) a new ToolSearch-availability rule that fires before ranking short-circuits.

**When to use:** The orient phase of every skill (plan, execute, review, security-review).

**Recommended block shape (planner fills in exact wording per 06-CONTEXT.md D-03 phrasing constraints):**

```
<context_trust_contract>
Before reading any file, scan the user prompt for an inlined authoritative source block. An authoritative source block is any of:

1. A `---` delimited block at the top of the user message containing pasted documentation, specification text, release notes, or a published guide (canonical context-packed format).
2. A clearly-marked quoted block of pasted documentation (e.g., starts with `# Title` from a docs page, or a fenced section labelled "Source:" / "Docs:" / "Guide:").
3. A `<fetched source="...">...</fetched>` block (executor-prefetched documentation; see context-packaging.md Rule 5a).

[NEW: Provenance classification.] When a block is detected, classify its provenance:
- **Vendor-doc authoritative source**: release notes, official guides, API references, MDN, RFCs, vendor security bulletins. Treated as authoritative; web tools out of scope for the same library.
- **Agent-generated source material**: any artifact produced by a prior skill invocation -- review files, plan files, consultation transcripts, prior session notes. Detection heuristics: (a) @-mentioned file path includes `/plans/`, `/.planning/`, or contains "review" / "consultation" / "session-notes" in the filename; (b) block contains "Source: <agent>" / "Generated by <skill>" attribution; (c) block lacks vendor-doc markers.

When the source is **vendor-doc authoritative**: treat its content as ground truth for the public-API and framework-convention questions it answers. Your Orient phase ends as soon as you have parsed the block plus read the local project files needed to compose the consultation. Specifically: the consultation packaging step (Phase 2) is the next action; local project reads are still in scope; reading inside `node_modules/` is out of scope; WebFetch and WebSearch against the same library are out of scope.

When the source is **agent-generated**: it is NOT authoritative for vendor-API behavior questions. Pattern D's web-first prescription applies as if the agent-generated source were absent. Verify-first markers within agent-generated source (literal: `Verify .+ before acting`, `Assuming .+ \(unverified\)`, `confirm .+ before`) survive into the consultation prompt's `## Source Material` section verbatim; they MUST NOT be stripped, paraphrased, or promoted into `## Pre-verified Claims`.

[NEW: ToolSearch-availability rule.] When the input prompt contains agent-generated source material AND the question classifies as Class 2 / 3 / 4 per `@${CLAUDE_PLUGIN_ROOT}/references/orient-exploration.md`, invoke `ToolSearch select:WebSearch,WebFetch` (or equivalent ensure-loaded mechanism) to make the web tools structurally available BEFORE ranking. This step fires regardless of whether the orient ranking has classified the question yet; it is a precondition for ranking, not a result of it.

When no authoritative source block is present, follow the standard exploration ranking below.
</context_trust_contract>
```

**Anchor quotes (R-01 from 06-RESEARCH.md):**

> "if you find that the model is not using your web search tools, clearly describe why and how it should." [CITED: platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices section Tool use triggering]

The provenance-classification + ToolSearch-availability rules are exactly this pattern: clearly describe what triggers each branch and how to behave. Imperatives ("MUST NOT strip" / "MUST invoke ToolSearch") are reserved for the genuine compliance lines (hedge survival; ToolSearch invocation precondition).

### Pattern G3: Class 2-S sub-section appended under Class 2 of `references/orient-exploration.md`

**What:** A new `### Class 2-S: Security currency (sub-pattern of Class 2)` sub-section between the existing Class 2 (line 47) and Class 3 (line 49) of `references/orient-exploration.md`. Body: trigger condition, ordering rationale (npm audit -> GHSA -> WebSearch CVE), pv-* block contract, worked example.

**When to use:** When the SKILL is `lz-advisor.security-review` AND a finding involves a third-party dependency or library.

**Recommended block shape (planner fills in exact wording per 06-CONTEXT.md D-03 phrasing constraints, ~80-120 words):**

```
### Class 2-S: Security currency (sub-pattern of Class 2)

When the question is about whether a third-party dependency has known
vulnerabilities, security advisories, or CVE entries, the first orient
action is `npm audit --json` (local, fast; runs against
`package-lock.json` directly). Fallback ordering: `WebFetch
https://github.com/advisories?query=<package>` for advisory text and
GHSA-* IDs; `WebSearch "<package> CVE <year>"` as a third-line check for
NVD entries not mirrored to GitHub Advisories.

Synthesize a `<pre_verified source="npm audit --json"
claim_id="pv-no-known-cves-N">` block (no-CVE outcome) or
`<pre_verified source="..." claim_id="pv-cve-list-N">` block (CVE-list
outcome with affected version range). Use the pv-* anchor to ground the
supply-chain finding's severity in the consultation prompt.

This sub-pattern fires only inside `lz-advisor.security-review` for
findings on third-party dependencies. Other skills' security-adjacent
questions remain Class 2 (vendor-doc) or Class 1 (type-symbol existence).

Example -- security-review skill scanning unpinned `@compodoc/compodoc^1.2.1`:
[full worked example end-to-end, ~60-80 words]
```

### Anti-Patterns to Avoid

- **Half-modified state across plan boundaries.** The G1+G2 trust-contract rewrite touches all 4 SKILL.md byte-identically. Plan 06-05 must commit all 4 in a single commit OR the planner explicitly accepts that interim states (where 1-3 SKILL.md have the new contract and 0-3 still have the old contract) violate the byte-identical canon contract. Recommend: single commit for Plan 06-05; no intermediate states. The CONTEXT.md established pattern (Phase 5.6 Plan 06 / 07 byte-identical canon) is non-negotiable.
- **Inlining the Class 2-S worked example into all 4 SKILL.md.** Direct conflict with the `@`-load convention (D-02). Class 2-S is security-review-specific per amendment 4; only `lz-advisor.security-review/SKILL.md` gets a one-line cross-reference. The other 3 SKILL.md still `@`-load `references/orient-exploration.md` (which now contains Class 2-S) but they don't reference Class 2-S in their own prose because Class 2-S doesn't fire for them.
- **Adding a 5th catch-all class to Pattern D under "uncategorizable / hybrid".** Direct conflict with 06-CONTEXT.md deferred-ideas list. Class 2-S is a SUB-PATTERN of Class 2, not a new class. Pattern D remains four classes exhaustive; the safety net is the existing Pattern B step 5 ("name the gap explicitly in Findings").
- **Modifying the smoke-test scripts for Class 2-S coverage.** D-05 lock from CONTEXT.md (`KCB-economics.sh` assertions stay intact). The regression replay UATs are the empirical surface for Class 2-S verification; they live in new `uat-*-rerun/` subdirectories, not as new `KCB-`/`L-`-prefixed smoke scripts. New smoke-test letters (after `J`) remain Phase 7 territory if needed.
- **Bumping the agent prompts (`advisor.md` / `reviewer.md` / `security-reviewer.md`) for the gap closure.** Agent files are explicitly OUT OF SCOPE for Phase 6 (06-CONTEXT.md `<domain>` line 19: "agent architectural changes (`maxTurns: 3`, `model: opus`, `tools: ["Read", "Glob"]`) stay"). Phase 7 Finding D (word-budget regression on security-reviewer) is the agent-prompt-engineering Phase 7 surface; gap closure does not touch it.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Detecting agent-generated source provenance | LLM-assisted classifier or per-shape regex matching the input | The combined path-heuristic + structural-shape-negative rule documented in section Provenance Classification (G1+G2 Direction) above | The detection runs as plain prose in the trust-contract block; the executor's natural pattern-matching does the work. An automated classifier would defer the decision one step. The path heuristic catches the high-volume cases cheaply; the structural-shape negative catches the rest. |
| Counting `npm audit` invocations in JSONL | Hand-rolled bash loop with `jq` per-line + counter | `rg -c '"name":"Bash".*"command":".*npm audit'` -- verified portable on Git Bash Windows arm64 ripgrep 14.1.0 (mirrors KCB-economics.sh line 29 pattern) | Same `rg` regex-portability anchor as 06-RESEARCH.md Pitfall 3. No new escaping needed. |
| Detecting ToolSearch invocation for Web tools in JSONL | Custom JSON parser per JSONL line | `rg -B2 -A2 '"name":"ToolSearch"' "$TRACE" \| rg -F 'WebSearch'` -- context-aware grep on the ToolSearch event with WebSearch / WebFetch in the surrounding lines (which is where the `select:` parameter would land in stream-json output) | Two-pass `rg` is cheaper than building a JSON parser; matches the existing trace-inspection convention from prior phases. |
| Computing whether a hedge marker survives into the consultation prompt | New parser script that splits the trace into prompt sections and runs regex per section | Direct `rg` against the consultation prompt section of the trace (the `assistant` turn that emits the `Agent` tool_use input has the prompt body in JSONL `tool_use.input.prompt`) | One `rg` invocation per pattern; ~5 patterns total per trace. Cheaper than parser. |
| Generating the Plan 06-07 amendment 5 narrative | Custom report template | Copy the 06-VERIFICATION.md amendment 4 shape from line 320-388 -- same frontmatter (when, what UAT, what session log, gaps closed) + bulleted closures | Already validated as the canonical amendment shape; the user has read this format four times in 06-VERIFICATION.md. |

**Key insight:** Gap closure is text-edit + version-bump + replay infrastructure. The cardinal rule is **inherit Phase 6 Plan 01 / 02 byte-identical canon discipline + Phase 6 amendment 4 verbatim direction text** -- change only what G1, G2, G3 demand. No new test infrastructure (the original Phase 6 smoke + UAT runner shape is sufficient); no new agent prompt edits; no new commit surfaces beyond what the closure criteria explicitly mandate.

## Common Pitfalls

### Pitfall G1: Trust-contract rewrite drifts across the 4 SKILL.md

**What goes wrong:** Plan 06-05 edits the 4 SKILL.md sequentially and a typo or off-by-one diff lands one file with slightly different prose. The byte-identical canon contract is broken; downstream skills inherit different trust-contract behavior; subtle inconsistencies surface in the next UAT cycle.

**Why it happens:** Manual editing of 4 files in sequence is error-prone. The original Phase 6 Plan 02 commits (`098dd55` for the @-load addition) succeeded because the addition was a single line repeated 4 times; the gap closure is a multi-paragraph block addition.

**How to avoid:** Compose the new `<context_trust_contract>` block ONCE in a buffer (e.g., a temp file or a heredoc-equivalent in the planner's working notes), then apply it as 4 identical `Edit` operations against each SKILL.md. After the edits, run `git diff plugins/lz-advisor/skills/*/SKILL.md` and verify the diff hunks are byte-identical across the 4 files (the surrounding context lines may differ by line number, but the inserted / replaced block content must match). Optional verification: `git grep -F "ToolSearch select:WebSearch,WebFetch" plugins/lz-advisor/skills/*/SKILL.md` should return exactly 4 lines if the new canon string lands cleanly.

**Warning signs:** `git grep -c` count for the new canon string returns !=4 after the commit. Or `rg -c` for an old fragment of the previous block returns >0 in any of the 4 SKILL.md (indicates incomplete replacement).

### Pitfall G2: Class 2-S sub-section breaks the existing class boundary

**What goes wrong:** Plan 06-06 inserts the Class 2-S sub-section between Class 2 (line 47) and Class 3 (line 49) but accidentally truncates Class 3's opening or breaks the Class 2 closing example's formatting. The four-classes-exhaustive property is silently broken.

**Why it happens:** Markdown line-numbering in `references/orient-exploration.md` shifts when content is inserted; an `Edit` operation that targets a specific line range can clip neighbors.

**How to avoid:** Use `Edit` against a unique anchor string (e.g., the Class 2 closing example's last sentence) rather than against line numbers. Verify post-edit by reading the file and checking that all four class headings (`## Class 1: ...`, `## Class 2: ...`, `## Class 3: ...`, `## Class 4: ...`) are still present and in order, with the new `### Class 2-S: ...` sub-heading nested inside Class 2's section (one heading level deeper).

**Warning signs:** `git grep -c "^## Class " plugins/lz-advisor/references/orient-exploration.md` returns !=4. Or the rendered file has a `### Class 2-S` heading at top-level (`##` instead of `###`), which would suggest it's a parallel new class rather than a sub-pattern.

### Pitfall G3: Plugin version bump misses one of the 5 surfaces

**What goes wrong:** Plan 06-07 bumps the version but forgets one SKILL.md frontmatter line. Marketplace consumers see plugin.json claim 0.9.0 but one skill file claim 0.8.9; cache invalidation behavior is unpredictable.

**Why it happens:** Manual editing of 5 files in sequence with the same change is error-prone in the same way the trust-contract rewrite is.

**How to avoid:** After the bump commit, run two verification commands:

```bash
# All 5 surfaces at 0.9.0
git grep -c '"version": "0\.9\.0"' plugins/lz-advisor/.claude-plugin/plugin.json   # expect 1
git grep -c '^version: 0\.9\.0$' plugins/lz-advisor/skills/*/SKILL.md              # expect 4

# Zero 0.8.9 residuals
! rg -uu -l '0\.8\.9' plugins/lz-advisor/ || true                                  # expect zero matches
```

If either fails, the bump is incomplete; fix and re-commit before proceeding to the regression replay.

**Warning signs:** `rg -uu -l '0\.8\.9' plugins/lz-advisor/` returns any matches. Or `git grep -c '^version: 0\.9\.0$' plugins/lz-advisor/skills/*/SKILL.md` returns !=4.

### Pitfall G4: Regression replay reuses original session logs by accident

**What goes wrong:** The user runs the replay against the ngx-smart-components testbed, but the testbed's branch state differs from the original UAT (e.g., commits not at `2173e39` for the plan-fixes input or not at `09a09d7^..05ea109` for the security-review input). The replay reads the wrong input shape and produces a non-comparable trace.

**Why it happens:** The testbed branch `uat/manual-s4-v089-compodoc` may have moved on since the original UAT. Some session logs are stale relative to the current testbed state.

**How to avoid:** Before the regression replay, the planner explicitly verifies the testbed branch is at the original UAT commit hash:

```bash
# In the testbed directory
cd D:/projects/github/LayZeeDK/ngx-smart-components
git rev-parse uat/manual-s4-v089-compodoc            # capture current HEAD
# Compare to original UAT input commits:
#   plan-fixes input commit: 2173e39
#   execute-fixes output commit: 05ea109 (range 09a09d7^..05ea109 for security-review)
```

If the testbed has drifted, either `git checkout 05ea109` (to recreate the security-review input) before each replay, or document the new state in the rerun session-notes.md.

**Warning signs:** The rerun session-notes.md `input_*_commit` fields differ from the original UAT's session-notes.md fields.

### Pitfall G5: Provenance heuristic over-matches user-typed prose as "agent-generated"

**What goes wrong:** A user types a prompt containing numbered findings or recommendations as part of their natural prose (e.g., "I want to fix these 3 issues: 1. ... 2. ... 3. ..."). The structural-shape-negative branch of the provenance heuristic classifies this as "agent-generated" because it lacks the canonical vendor-doc markers. Pattern D's web-first prescription fires unnecessarily; the executor wastes web-tool budget on a question the user has already framed.

**Why it happens:** The structural-shape-negative test is conservative (defaults to "agent-generated" when no vendor-doc markers are present). User-typed prose can resemble agent-generated prose at the structural level.

**How to avoid:** Rely on the path-heuristic FIRST (branch (a) of the combined rule); only fall back to the structural-shape-negative when no @-mentioned file exists. User-typed prose generally does not include an @-mention; @-mention presence is the high-confidence signal that the input is file-resolved (and likely agent-generated). The structural-shape-negative is a last-resort fallback for inlined-content cases without an @-mention.

**Warning signs:** A regression replay UAT shows web tool usage on a session that did NOT have an @-mention to a plan / review file (i.e., the user's prompt was raw user-typed input without authoritative-source-shaped attachment). If web usage is non-zero and the session classifies as Class 1 (type-symbol existence) or has no web-relevant question, the provenance heuristic is over-matching.

## Code Examples

### Example G1: Provenance-classification block (paste-ready prose for `<context_trust_contract>` insertion)

See section Architecture Patterns Pattern G1+G2 above for the full block shape. The inserted prose lands between line 49 ("WebFetch and WebSearch against the same library are out of scope...") and line 51 ("When no authoritative source block is present...") of each SKILL.md `<context_trust_contract>` block. The "When no authoritative source block is present" sentence remains unchanged (line 51-52 of the existing block).

### Example G2: ToolSearch-availability rule (single sentence, paste-ready)

```
[NEW: ToolSearch-availability rule.] When the input prompt contains
agent-generated source material AND the question classifies as Class 2 / 3 / 4
per `@${CLAUDE_PLUGIN_ROOT}/references/orient-exploration.md`, invoke
`ToolSearch select:WebSearch,WebFetch` (or equivalent ensure-loaded mechanism)
to make the web tools structurally available BEFORE ranking. This step fires
regardless of whether the orient ranking has classified the question yet;
it is a precondition for ranking, not a result of it.
```

### Example G3: Class 2-S sub-section (paste-ready prose for `references/orient-exploration.md` insertion)

See section Architecture Patterns Pattern G3 above for the full sub-section shape. Insertion location: between line 47 (last line of Class 2) and line 49 (first line of Class 3). One blank line separates the sub-section from Class 3.

### Example G4: Regression replay UAT runner (manual style, mirrors original UAT cycle)

```bash
# Plan 06-07 Task 2: regression replay (manual style)
# Each invocation produces a session log that the rerun session-notes.md captures.

cd D:/projects/github/LayZeeDK/ngx-smart-components
git checkout uat/manual-s4-v089-compodoc

# (a) plan-fixes UAT replay -- same review-file input that suppressed Pattern D originally
claude --model sonnet --effort medium \
  --plugin-dir D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/plugins/lz-advisor \
  --dangerously-skip-permissions \
  -p "/lz-advisor.plan Address the review findings in @plans/compodoc-storybook-angular-signals.review.md" \
  --verbose --output-format stream-json > uat-plan-skill-fixes-rerun.jsonl

# (b) execute-fixes UAT replay -- same plan-file input
git checkout 2173e39
claude --model sonnet --effort medium \
  --plugin-dir D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/plugins/lz-advisor \
  --dangerously-skip-permissions \
  -p "/lz-advisor.execute Implement the plan at @plans/address-review-findings-compodoc-storybook.plan.md" \
  --verbose --output-format stream-json > uat-execute-skill-fixes-rerun.jsonl

# (c) security-review UAT replay -- same 3-commit range
git checkout 05ea109
claude --model sonnet --effort medium \
  --plugin-dir D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/plugins/lz-advisor \
  --dangerously-skip-permissions \
  -p "/lz-advisor.security-review Review the supply-chain and code surface for commits 09a09d7^..05ea109" \
  --verbose --output-format stream-json > uat-security-review-skill-rerun.jsonl
```

> Note: actual session log files land under `c:/Users/.../claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/<session-id>.jsonl` per the canonical project log location. The shell-redirected files above are the secondary copy; the rerun session-notes.md frontmatter captures the canonical session log path.

### Example G5: Trace-grep verification per UAT (validation)

```bash
# Plan 06-07 Task 3: trace-grep verification per UAT

# (a) plan-fixes rerun: web_uses > 0 OR ToolSearch+WebSearch present
WEB_USES=$(rg -c '"name":"(WebSearch|WebFetch)"' "$PLAN_FIXES_TRACE")
TOOLSEARCH_WEB=$(rg -B2 -A2 '"name":"ToolSearch"' "$PLAN_FIXES_TRACE" | rg -c -F 'WebSearch')
if [ "$WEB_USES" -gt 0 ] || [ "$TOOLSEARCH_WEB" -gt 0 ]; then
  echo "[OK] plan-fixes Pattern D fires: web_uses=$WEB_USES, ToolSearch+web=$TOOLSEARCH_WEB"
else
  echo "[ERROR] plan-fixes Pattern D suppressed: 0 web events and 0 ToolSearch+web"
  exit 1
fi

# (b) execute-fixes rerun: same logic
WEB_USES=$(rg -c '"name":"(WebSearch|WebFetch)"' "$EXECUTE_FIXES_TRACE")
TOOLSEARCH_WEB=$(rg -B2 -A2 '"name":"ToolSearch"' "$EXECUTE_FIXES_TRACE" | rg -c -F 'WebSearch')
# (assertion same as plan-fixes)

# (c) security-review rerun: npm_audit > 0 OR pv-no-known-cves / pv-cve-list present
NPM_AUDIT=$(rg -c '"name":"Bash".*"command":".*npm audit' "$SECURITY_REVIEW_TRACE")
PV_CVE=$(rg -c 'claim_id="pv-(no-known-cves|cve-list)' "$SECURITY_REVIEW_TRACE")
if [ "$NPM_AUDIT" -gt 0 ] || [ "$PV_CVE" -gt 0 ]; then
  echo "[OK] security-review Class 2-S fires: npm_audit=$NPM_AUDIT, pv-cve=$PV_CVE"
else
  echo "[ERROR] security-review Class 2-S not triggered: 0 npm audit and 0 pv-cve"
  exit 1
fi
```

These verifications run in the rerun session-notes.md or in a separate verification log; they are not new smoke-test scripts (per Pitfall G2 anti-pattern + D-05 lock from CONTEXT.md).

## State of the Art

| Old Approach | Current Approach (gap closure) | When Changed | Impact |
|--------------|-------------------------------|--------------|--------|
| `<context_trust_contract>` classifies authoritative source by structural shape only (3 numbered shapes: `---` block / quoted-docs block / `<fetched>` block) | Same 3-shape detection PLUS provenance classification (vendor-doc vs agent-generated) PLUS ToolSearch-availability rule | 2026-04-30 (gap closure) | G1 + G2 closure: agent-generated source no longer suppresses Pattern D's web-first prescription; ToolSearch loads Web tools before ranking can short-circuit. |
| Pattern D taxonomy is 4 classes exhaustive (Type-symbol existence, API currency, Migration / deprecation, Language semantics) | Same 4 classes PLUS Class 2-S sub-pattern under Class 2 (Security currency: CVE / advisory / npm audit) | 2026-04-30 (gap closure) | G3 closure: security-review's natural Class-2 sub-questions surface explicitly; `npm audit -> GHSA -> WebSearch CVE` ordering is documented. |
| Plugin SemVer at 0.8.9 (calibration patch from 0.8.5 baseline through iteration on contract refinements) | Plugin SemVer at 0.9.0 (minor for contract-shape change) | 2026-04-30 (Plan 06-07) | Marketplace cache invalidation; consumers know the contract shape changed (not just calibration). |
| Phase 6 verdict: PASS-with-caveat (mechanical closure but D-04 web-usage gate not empirically confirmed at smoke layer) | Phase 6 verdict: PASS or PASS-with-residual-Phase-7-scope | 2026-04-30 (Plan 06-07 amendment 5) | Phase 6 closes; Phase 7 inherits residual A / B / C / D scope. |

**Deprecated / outdated:**

- The "structural shape alone" trust-contract heuristic from Phase 5.6 Plan 06 / 07 is replaced by provenance + structural-shape combined classification. The 3 numbered shapes remain (still detected), but they no longer SUFFICE for the carve-out -- provenance also matters.
- Amendment 2's "enumerate specific input shapes (review output, prior plans, prior consultations)" direction is superseded by amendment 3's category-shaped approach (any artifact-shaped block).
- The original Phase 6 web-usage gate (`web_uses >= 1` in `>= 4 of 6` sessions) was the original validation mechanism; the gap-closure regression replay subset (3 UATs, per-UAT pass criterion) is the additional empirical surface. Both surfaces remain valid.

## Assumptions Log

> All claims in this research were verified or cited against primary sources (06-VERIFICATION.md amendments verbatim, codebase Read / git grep, empirical npm probe, Anthropic prompting docs from the original 06-RESEARCH.md). The table below is empty -- no `[ASSUMED]` claims required user confirmation.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| (none) | (none -- all claims verified or cited) | -- | -- |

**If this table is empty:** All claims in this research were verified or cited -- no user confirmation needed.

## Open Questions

1. **Should the provenance-detection prose in `<context_trust_contract>` enumerate the path-heuristic substring patterns (`/plans/`, `/.planning/`, "review", "consultation", "session-notes") or describe the heuristic abstractly?**
   - What we know: Enumerating substrings is concrete and operationally implementable; abstract prose is more durable as the project's directory conventions evolve.
   - What's unclear: Whether future plugin users (running on different projects) will have similar path conventions or completely different ones. Project-specific paths might over-fit to lz-advisor.
   - Recommendation: Enumerate the substring patterns AS EXAMPLES inside the prose, not as exhaustive list. E.g., "@-mentioned file path includes a planning-output directory or filename indicator (examples: `/plans/`, `/.planning/`, filename containing 'review' / 'consultation' / 'session-notes' / 'plan')". This gives the executor concrete pattern-matching cues while leaving room for project variation.
   - Decision driver: ASCII-only constraint + descriptive-triggers-with-examples style anchored in 06-RESEARCH.md R-01.

2. **Should the regression replay subset include execute-fixes UAT (the third gap-surfacing UAT)?**
   - What we know: Closure criterion 4 names "minimum: plan-fixes + security-review". Execute-fixes is the strongest amendment-3 confirmation but adds replay cost (~5min + ~$1).
   - What's unclear: Whether the planner wants 2 UATs or 3 UATs. The G2 ToolSearch-availability rule fires identically on review-file input (plan-fixes) and plan-file input (execute-fixes); a single plan-fixes replay is sufficient if the planner trusts the fix's generality.
   - Recommendation: Include execute-fixes (3 UAT replays total). Closure criterion 4 says "at minimum"; including all three gap-surfacing UATs gives the strongest empirical anchor for the amendment 5 verdict downgrade. Cost is ~$1-2 extra and ~5min wall-clock.
   - Decision driver: Empirical confidence in the verdict downgrade vs minor cost increase.

3. **Should the Class 2-S worked example use the no-CVE happy path or the CVE-list branch as the primary scenario?**
   - What we know: The 2026-04-30 security-review UAT empirical anchor scenario (`@compodoc/compodoc^1.2.1`) was a no-CVE outcome (Compodoc has no known advisories at that version per cursory inspection). A CVE-list outcome is more illustrative but harder to anchor empirically.
   - What's unclear: Whether the executor needs to see both branches or just the most-common branch.
   - Recommendation: Primary worked example uses no-CVE happy path (anchored in real Compodoc scenario); secondary example shows CVE-list branch with a synthetic / placeholder package name. Both branches are documented but the no-CVE path is the empirical anchor.
   - Decision driver: Empirical realism + fitting the 80-120-word class-block budget.

4. **Should Plan 06-07 ship the version bump and the regression replay in the same commit, or in separate commits?**
   - What we know: Phase 5.6 Plan 02 / 07 convention: separate commits for code edits vs UAT runs. The original Phase 6 Plan 03 commits (`94cb3b6`, `c2b41a4`, `b99117c`) separated runner setup from the UAT execution.
   - What's unclear: Whether the regression replay rerun-session-notes.md files belong in the same commit as the version bump (atomic Phase 6 closure) or in a follow-up commit (clear historical separation).
   - Recommendation: Three commits in Plan 06-07: (a) version bump 0.8.9 -> 0.9.0 across 5 surfaces; (b) regression replay rerun session-notes.md files (3 directories); (c) 06-VERIFICATION.md amendment 5. Separate commits give clean revert surfaces if the replay or amendment land needs to be redone.
   - Decision driver: Revert-surface preference (CONTEXT.md Claude's Discretion item: "Commit granularity (one commit per plan vs finer; planner picks per revert-surface preference)").

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| `node` | (no node use in gap closure; original Phase 6 tally.mjs not extended) | yes | v24.13.0 (verified 06-RESEARCH.md) | not needed |
| `rg` (ripgrep) | All trace-grep verifications + git-ignored search | yes | 14.1.0 (verified 06-RESEARCH.md) | not needed (grep tool DENIED per CLAUDE.md) |
| `git grep` | Tracked-file existence assertions for the 4 SKILL.md byte-identical canon + version-bump verification | yes | shipped with Git | not needed |
| `bash` (Git Bash) | All shell scripts; UAT runner (manual style) | yes | shipped with Git | not needed |
| `claude` CLI | 3 regression replay UATs in Plan 06-07 | yes | Claude Code Team Plan, current at session start | not needed |
| `--plugin-dir` flag | UAT runner | yes | supported | not needed |
| `--output-format stream-json` flag | UAT runner | yes | supported | not needed |
| `npm` | Class 2-S worked example anchors on `npm audit --json` (G3) | yes | 11.6.2 (verified 2026-04-30 via `npm --version`) | not needed |
| `npm audit --json` subcommand | Class 2-S empirical surface (G3 worked example anchor) | yes | documented in npm 11.6.2 (verified via `npm audit --help`) | not needed |
| Working `D:/projects/github/LayZeeDK/ngx-smart-components` worktree | Regression replay UATs against branch `uat/manual-s4-v089-compodoc` | unknown -- verify at Plan 06-07 execution | -- | If missing, `git clone` + `git switch -c uat/manual-s4-v089-compodoc 05ea109` (last UAT commit). Planner verifies at Plan 06-07 start. |
| Branch `uat/manual-s4-v089-compodoc` at expected commits (`2173e39` for plan-fixes input; `05ea109` for security-review input) | Regression replay validity | unknown -- verify per UAT replay | -- | If drifted, `git checkout <commit>` for each UAT input before invoking `claude -p`. Document any drift in the rerun session-notes.md. |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** ngx-smart-components worktree availability (planner re-clones if missing, per the original Phase 6 environment availability fallback).

## Validation Architecture

> Required per `workflow.nyquist_validation: true` in `.planning/config.json` (carrying forward from original Phase 6).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Bash + ripgrep + Node.js (the four existing smoke scripts re-run as part of phase gate; gap closure adds NO new smoke scripts per D-05 lock) + `claude -p` non-interactive CLI for regression replay UATs |
| Config file | None -- each smoke script is self-contained; rerun session-notes.md captures replay state by convention |
| Quick run command | `git grep -F "ToolSearch select:WebSearch,WebFetch" plugins/lz-advisor/skills/*/SKILL.md` (static check that gap-closure canon string lands in all 4 SKILL.md; expects 4 matches; runs in <1s) |
| Full suite command | `(static checks) git grep -c '"version": "0\.9\.0"' plugins/lz-advisor/.claude-plugin/plugin.json && git grep -c '^version: 0\.9\.0$' plugins/lz-advisor/skills/*/SKILL.md && git grep -F "Class 2-S" plugins/lz-advisor/references/orient-exploration.md` ; `(replay) bash plan-06-07-replay-runner.sh` (cost ~$5-10, ~30min) |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| G1+G2 | `<context_trust_contract>` byte-identical canon across 4 SKILL.md, contains "agent-generated" provenance branch | static (grep) | `git grep -c 'agent-generated' plugins/lz-advisor/skills/*/SKILL.md` (expect 4) | [FAIL] Wave 0 (rewrite happens in Plan 06-05) |
| G1+G2 | `<context_trust_contract>` contains ToolSearch-availability rule string | static (grep) | `git grep -c -F 'ToolSearch select:WebSearch,WebFetch' plugins/lz-advisor/skills/*/SKILL.md` (expect 4) | [FAIL] Wave 0 |
| G1+G2 | Hedge marker preservation rule referenced (literal regex shapes documented) | static (grep) | `git grep -F 'Verify .+ before acting' plugins/lz-advisor/skills/*/SKILL.md` (expect 4) | [FAIL] Wave 0 |
| G3 | Class 2-S sub-section present in `references/orient-exploration.md` | static (grep) | `git grep -c "Class 2-S: Security currency" plugins/lz-advisor/references/orient-exploration.md` (expect 1) | [FAIL] Wave 0 (sub-section appended in Plan 06-06) |
| G3 | npm audit / GitHub Security Advisories ordering documented | static (grep) | `git grep -F 'npm audit --json' plugins/lz-advisor/references/orient-exploration.md && git grep -F 'GitHub Security Advisories' plugins/lz-advisor/references/orient-exploration.md` | [FAIL] Wave 0 |
| G3 | `lz-advisor.security-review/SKILL.md` cross-reference to Class 2-S | static (grep) | `git grep -F 'Class 2-S' plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` (expect 1) | [FAIL] Wave 0 |
| Closure 3 | Plugin version 0.9.0 across 5 surfaces | static (grep) | `git grep -c '"version": "0\.9\.0"' plugins/lz-advisor/.claude-plugin/plugin.json && git grep -c '^version: 0\.9\.0$' plugins/lz-advisor/skills/*/SKILL.md` (expect 1, 4) | [OK] (files exist; bump pending) |
| Closure 3 | Zero 0.8.9 residuals after bump | static (grep) | `! rg -uu -l '0\.8\.9' plugins/lz-advisor/ \|\| true` | [OK] |
| Closure 4 | plan-fixes UAT replay: web_uses > 0 OR ToolSearch+web > 0 | runtime (rg trace) | `rg -c '"name":"(WebSearch\|WebFetch)"' "$PLAN_FIXES_RERUN_TRACE"` (expect >=1) OR `rg -B2 -A2 '"name":"ToolSearch"' "$PLAN_FIXES_RERUN_TRACE" \| rg -c -F 'WebSearch'` (expect >=1) | [FAIL] Wave 0 (rerun happens in Plan 06-07) |
| Closure 4 | execute-fixes UAT replay: same | runtime (rg trace) | (same patterns against `$EXECUTE_FIXES_RERUN_TRACE`) | [FAIL] Wave 0 |
| Closure 4 | security-review UAT replay: npm_audit > 0 OR pv-no-known-cves / pv-cve-list present | runtime (rg trace) | `rg -c '"name":"Bash".*"command":".*npm audit' "$SEC_REVIEW_RERUN_TRACE"` (expect >=1) OR `rg -c 'claim_id="pv-(no-known-cves\|cve-list)' "$SEC_REVIEW_RERUN_TRACE"` (expect >=1) | [FAIL] Wave 0 |
| Closure 5 | 06-VERIFICATION.md amendment 5 captures gap-closure verdict | static (grep) | `git grep -F 'Amendment 2026-' .planning/phases/06-address-phase-5-6-uat-findings/06-VERIFICATION.md \| wc -l` (expect >=5) | [FAIL] Wave 0 |
| ASCII-only | Gap-closure-authored files are ASCII | static (negative-grep) | `! rg -c '[^\x00-\x7F]' plugins/lz-advisor/skills/*/SKILL.md plugins/lz-advisor/references/orient-exploration.md plugins/lz-advisor/.claude-plugin/plugin.json \|\| true` (expect zero non-ASCII) | [FAIL] Wave 0 |
| Existing smoke gate | Original 4 smoke tests still pass on plugin 0.9.0 | runtime (bash) | `for f in KCB-economics DEF-response-structure HIA-discipline J-narrative-isolation; do bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/${f}.sh; done` | [OK] (scripts exist; gap-closure adds no smoke surface) |

### Sampling Rate

- **Per task commit (Plans 06-05, 06-06, 06-07 individual tasks):** Run the relevant static check for that task's surface (e.g., for Plan 06-05 task 1: `git grep -c 'agent-generated' plugins/lz-advisor/skills/*/SKILL.md`). ~1s.
- **Per plan merge:** Run all static checks for that plan + the existing 4 smoke scripts (~$3-5, ~3min) -- verifies no edit broke advisor word-budget, frame contract, or scope-derivation contracts.
- **Phase gate (post-Plan 06-07):** All static checks + 3 regression replay UATs + amendment 5 capture + final smoke pass on plugin 0.9.0. ~$8-15 + ~30min.

### Wave 0 Gaps

- [ ] `plugins/lz-advisor/skills/lz-advisor.{plan,execute,review,security-review}/SKILL.md` -- `<context_trust_contract>` block rewrite (provenance-based classification + ToolSearch-availability rule); ~30-40 added lines per file, byte-identical across 4 files. Plan 06-05.
- [ ] `plugins/lz-advisor/references/orient-exploration.md` -- Class 2-S sub-section appended under Class 2; ~80-120 words. Plan 06-06.
- [ ] `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` -- one-line cross-reference to Class 2-S inside scan-phase guidance. Plan 06-06.
- [ ] `plugins/lz-advisor/.claude-plugin/plugin.json` + 4 SKILL.md frontmatter -- version bump 0.8.9 -> 0.9.0 across 5 surfaces. Plan 06-07.
- [ ] `.planning/phases/06-address-phase-5-6-uat-findings/uat-plan-skill-fixes-rerun/session-notes.md` -- replay narrative for plan-fixes on plugin 0.9.0. Plan 06-07.
- [ ] `.planning/phases/06-address-phase-5-6-uat-findings/uat-execute-skill-fixes-rerun/session-notes.md` -- replay narrative for execute-fixes on plugin 0.9.0. Plan 06-07.
- [ ] `.planning/phases/06-address-phase-5-6-uat-findings/uat-security-review-skill-rerun/session-notes.md` -- replay narrative for security-review on plugin 0.9.0. Plan 06-07.
- [ ] `.planning/phases/06-address-phase-5-6-uat-findings/06-VERIFICATION.md` -- amendment 5 (gap closure for 2/3/4 + final verdict downgrade). Plan 06-07.

*(Framework install: not required -- Node + rg + Bash + npm + claude CLI all verified present.)*

## Sources

### Primary (HIGH confidence)

- **Phase 6 verification amendments 2, 3, 4** (verbatim direction text) -- `.planning/phases/06-address-phase-5-6-uat-findings/06-VERIFICATION.md` lines 230-269 (amendment 2), 273-316 (amendment 3), 320-388 (amendment 4). [VERIFIED: codebase Read 2026-04-30]
- **Empirical UAT session-notes** --
  - `.planning/phases/06-address-phase-5-6-uat-findings/uat-plan-skill-fixes/session-notes.md` (Amendment 2 evidence; session log `26868ae7-1f9a-4a71-a146-16e7781b74c6.jsonl`)
  - `.planning/phases/06-address-phase-5-6-uat-findings/uat-execute-skill-fixes/session-notes.md` (Amendment 3 evidence; session log `e4592a03-0cf4-4925-af93-fdf20c663a25.jsonl`)
  - `.planning/phases/06-address-phase-5-6-uat-findings/uat-security-review-skill/session-notes.md` (Amendment 4 evidence; session log `2d388e98-1e6a-4978-8290-115852470529.jsonl`) [VERIFIED: codebase Read 2026-04-30]
- **Codebase verification (2026-04-30)** -- Read tool against:
  - `plugins/lz-advisor/skills/lz-advisor.{plan,execute,review,security-review}/SKILL.md` -- confirmed `<context_trust_contract>` byte-identical across 4 files at lines 37-52 / 40-55 / 38-53 / 39-54
  - `plugins/lz-advisor/skills/lz-advisor.{plan,execute,review,security-review}/SKILL.md` -- confirmed `<orient_exploration_ranking>` byte-identical across 4 files at lines 54-68 / 57-71 / 55-69 / 56-70
  - `plugins/lz-advisor/references/orient-exploration.md` -- confirmed 4 class blocks at lines 16-27 / 29-47 / 49-67 / 69-83 plus closing note at 85-92
  - `plugins/lz-advisor/references/context-packaging.md` -- confirmed Rule 5 already cross-references `orient-exploration.md` at line 44
  - `plugins/lz-advisor/.claude-plugin/plugin.json` + 4 SKILL.md frontmatter -- confirmed version 0.8.9 across 5 surfaces
- **Empirical npm probe (2026-04-30)** -- `npm --version` returned `11.6.2`; `npm audit --help` confirmed `--json` flag documented and supported. [VERIFIED: empirical Bash 2026-04-30]
- **Empirical rg portability (carry forward from 06-RESEARCH.md)** -- `rg -c '"name":"(WebSearch|WebFetch)"'` against synthetic JSONL returned correct match count; pattern is Git Bash Windows arm64 portable on ripgrep 14.1.0. [VERIFIED: 06-RESEARCH.md Pitfall 3]
- **PHASE-7-CANDIDATES.md** -- explicit list of items the gap closure must NOT bleed into. [VERIFIED: codebase Read 2026-04-30]

### Secondary (MEDIUM confidence)

- **Anthropic Prompting best practices (4.x)** -- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices -- same anchor as 06-RESEARCH.md R-01; carries forward verbatim. The trust-contract rewrite uses the descriptive-trigger style (no `MUST` for tool-use steering); imperatives reserved for compliance lines (hedge-survival, ToolSearch precondition).
- **Anthropic search_instructions block** (Simon Willison, 2025-05-25) -- same anchor as 06-RESEARCH.md R-01; carries forward verbatim.
- **GitHub community discussion #153882** -- https://github.com/orgs/community/discussions/153882 -- confirms `npm audit --json` has no published JSON schema; field shape is stable across npm 7+. The Class 2-S worked example anchors on `metadata.vulnerabilities` (counts) and `vulnerabilities` (per-package records) without depending on a specific schema version. [CITED: WebSearch 2026-04-30]
- **npm audit official docs** -- https://docs.npmjs.com/cli/v8/commands/npm-audit/ -- confirms `--json` flag, severity levels (critical / high / moderate / low), and audit endpoint (Bulk Advisory). [CITED: WebSearch 2026-04-30]

### Tertiary (LOW confidence -- none in this research)

- (none -- all claims verified above)

## Metadata

**Confidence breakdown:**

- Verbatim amendment direction (G1, G2, G3): HIGH -- copied verbatim from 06-VERIFICATION.md lines.
- Codebase line-pointed source state (4 SKILL.md byte-identical canon, 5-surface version inventory): HIGH -- empirically verified via Read tool 2026-04-30.
- Provenance-classification heuristic (path heuristic + structural-shape negative): MEDIUM -- anchored in amendment 3 verbatim direction line 299 ("any artifact-shaped block") with operational expansion; the path-substring list is illustrative, not exhaustive. Pitfall G5 documents the over-match risk for review during regression replay.
- Class 2-S ordering rationale (npm audit -> GHSA -> WebSearch CVE): HIGH -- anchored in amendment 4 verbatim direction line 355-358 + npm CLI docs.
- pv-no-known-cves / pv-cve-list block shape: MEDIUM -- extends the existing pv-* convention from `references/context-packaging.md` Common Contract Rule 5; the new claim_id namespace is gap-closure-introduced, not pre-existing. The block shape is canonical XML matching Rule 5's existing template.
- Plugin version bump mechanics (5 surfaces, single-commit verification): HIGH -- empirically verified via `rg -uu -l "0\.8\.9"` 2026-04-30.
- Regression replay subset (3 UATs, per-UAT trace-grep success criterion): HIGH -- closure criterion 4 names the minimum; trace-grep patterns derive from the existing rg-portability anchor.
- 06-VERIFICATION.md amendment 5 template: HIGH -- mirrors the existing amendment shape from amendments 1-4 in the same file.

**Research date:** 2026-04-30

**Valid until:** 2026-05-30 (30 days for stable amendment direction text + npm CLI behavior; revisit if a new Claude Code release changes ToolSearch tool name or invocation shape, or if the testbed branch `uat/manual-s4-v089-compodoc` drifts from the original UAT input commits).
