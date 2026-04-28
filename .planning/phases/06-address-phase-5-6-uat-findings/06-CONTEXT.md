# Phase 6: Address Phase 5.6 UAT Findings - Context

**Gathered:** 2026-04-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Close the two open behavioral gaps surfaced by Phase 5.6 Plan 07's 6-session autonomous UAT replay against `ngx-smart-components` (plugin 0.8.4, commit `4ae4761`, 2026-04-27), plus the pre-existing `KCB-economics.sh` smoke failure observed in the same regression-gate run:

- **Gap 1:** Zero `WebFetch` / `WebSearch` usage across all six sessions (S1..S6) despite Phase 5.6 Plan 06's `<orient_exploration_ranking>` Pattern B explicitly ranking web-tools above `node_modules` archaeology for public-library questions. Pattern B's web-first ranking did not win over the executor's pragmatic local-`.d.ts`-first heuristic.
- **Gap 2:** Pattern B as written conflates four distinct question classes (type-symbol existence, API currency / configuration / recommended pattern, migration / deprecation, language semantics). The executor's defensible local-`.d.ts` preference for type-symbol existence questions bleeds into questions where `.d.ts` is the wrong source.
- **KCB-economics smoke (pre-existing):** Synthetic prompt asking "Verify whether setCompodocJson is still exported from @storybook/addon-docs/angular in Storybook 10.3.5" failed Findings K + C + B because the executor used `npm pack` extraction (not `WebSearch`/`WebFetch`) and skipped advisor consultation. Per AUTONOMOUS-UAT.md Conclusion 5 this is a synthetic-prompt artifact, not a runtime regression — but the contract `KCB-economics.sh` enforces (executor uses web tools for API-migration questions) is the same contract the user wants Phase 6 to satisfy.

The phase ships a question-class-aware Pattern D ranking, mirrored prose in `references/context-packaging.md` Rule 5, and a 6-session UAT replay whose prompts are reshaped in place to hit Pattern D's web-first classes by construction. Phase 6 closes the loop the user articulated: "We must see WebSearch+WebFetch usage" — empirically, in the trace, in the gate.

**User directive (load-bearing):** "We must see WebSearch+WebFetch usage." This is a contract requirement, not a soft preference. Phase 6 success criteria include non-zero `WebFetch` / `WebSearch` tool_use events in the UAT trace and a green re-run of `KCB-economics.sh`.

**Not in scope:** new skills; new allowed-tools surface beyond the existing `Bash(git:*)`, `Read`, `Glob`, `Write`, `WebSearch`, `WebFetch`, `Agent(lz-advisor:advisor)`; retroactive refactor of Pattern A / B inline blocks (Phase 5.6 Plan 06 / 07 canon stays for those); marketplace re-publishing beyond the version bump; revisiting Phase 5.5 D-01..D-12 or Phase 5.6 D-01..D-13; agent architectural changes (`maxTurns: 3`, `model: opus`, `tools: ["Read", "Glob"]` stay); a separate UAT harness (Phase 5.4 fixture is reused with reshaped prompts); README "Recommended prompt shape" section (deferred again).

</domain>

<decisions>
## Implementation Decisions

### Pattern D taxonomy (foundational)

- **D-01:** Pattern D is 4-class, spirit-honoring. The four classes and their first-orient-action defaults:

  1. **Type-symbol existence** (does symbol X exist in the typed contract for the installed version?) → read the local `.d.ts` first. The `.d.ts` IS the typed contract for the exact installed version, more authoritative than docs that may lag. WebFetch is corroborating evidence, not the only source.
  2. **API currency / configuration / recommended pattern** (what is the documented behavior / current best practice?) → `WebFetch` of the official source first. The library's homepage, GitHub README, current-version docs are valid first-fetch targets. Local files corroborate the web answer; they do not replace it.
  3. **Migration / deprecation** (was X removed, deprecated, or replaced between versions?) → `WebFetch` of release notes or migration guides first. The `CHANGELOG.md` / GitHub releases / migration-guide pages decide. `.d.ts` shows the current shape but does not show what was removed.
  4. **Language semantics** (how does the language itself behave?) → empirical compile / run first (build the example, observe the error) OR `WebFetch` the language spec. `node_modules` archaeology is the wrong source for language-level questions.

  Spirit-honoring: the executor's `.d.ts`-first preference for type-symbol existence is endorsed (Plan 07 UAT showed it outperformed WebFetch for the Storybook 10.3.5 `DocsOptions` shape question). WebFetch is required corroboration, not exclusive source. The other three classes have WebFetch as the first action.

### Pattern D location and surface

- **D-02:** Pattern D lives in a new shared reference file `plugins/lz-advisor/references/orient-exploration.md`. The four existing SKILL.md files each gain a single `@`-load line inside the existing `<orient_exploration_ranking>` block pointing to the new reference; the inline Pattern B prose stays in place (no retroactive churn). `references/context-packaging.md` Rule 5 gains a one-line cross-reference to `orient-exploration.md` so the question-class taxonomy is reachable from both surfaces. Rationale: matches the existing `references/advisor-timing.md` + `references/context-packaging.md` pattern, eliminates 4× duplication for the new content, preserves Phase 5.6 Plan 06 / 07's settled inline canon for Patterns A / B (out of Phase 6 scope).

### Pattern D phrasing (research-backed)

- **D-03:** Pattern D ships with descriptive triggers + 1-2 worked classification examples per class + a single positive directive. Phrasing style anchored in three findings from the Sonnet 4.6 prompting research (see `<research_directives>` R-01 below):
  - Anthropic's "Prompting best practices" (single canonical 4.x doc) recommends explicit trigger conditions and concrete when/how guidance for tool-use steering. Imperatives ("MUST", "REQUIRED") are reserved for compliance rules in Anthropic's own production system prompt, not for tool-use steering.
  - The Claude 4.x family interprets prompts more literally than 3.x; soft rankings get under-weighted (the Pattern B failure mode), but imperatives risk satisfying-the-rule spurious tool use.
  - Positive directives outperform negative ("`.d.ts` corroborates; the web source decides" beats ".d.ts is NOT sufficient").

  Concrete shape: each class block opens with a one-sentence trigger condition ("When the question is about..."), names the first orient action ("the first orient action is `WebFetch` of..."), names the corroborating source ("`.d.ts` and `node_modules` corroborate the web answer; they do not replace it"), and includes 1-2 worked classification examples ("Question: `Is setCompodocJson still exported from @storybook/addon-docs/angular?` Class: migration / deprecation, because the question references a version-aware existence claim. First action: `WebFetch` Storybook 10.x release notes."). The ADVR-06 calm-natural-language convention applies to executor-side instructions in this phase, not just to the agent persona.

### Validation approach (full UAT replay with reshaped prompts)

- **D-04:** Phase 6 runs a full 6-session UAT replay (Phase 5.6 Plan 07 pattern) against plugin 0.8.5. The Phase 5.4 Compodoc/Storybook scenario is preserved as the regression baseline; the six prompts (S1..S6) are RESHAPED in place so each session unambiguously classifies into a target Pattern D web-first class:
  - S1 (`/lz-advisor.plan`): API-currency framing on Storybook 10.x docs configuration ("What is the current recommended approach for Storybook 10.x docs configuration in an Nx Angular library? Storybook released v10 in late 2025 — check the docs.")
  - S2 (`/lz-advisor.execute`): migration / deprecation framing on `setCompodocJson` removal between Storybook 9 → 10 ("Implement the Compodoc integration for this library. Note: `setCompodocJson` may have been removed between Storybook 9 and 10 — check the migration guide before proceeding.")
  - S3 (`/lz-advisor.review`): API-currency framing on the implementation's alignment with Storybook 10.x current docs
  - S4 (`/lz-advisor.plan`): migration / deprecation framing on Nx Compodoc generator currency in 2026-Q1
  - S5 (`/lz-advisor.execute`): language-semantics framing on TS dynamic-import behavior at compile time
  - S6 (`/lz-advisor.security-review`): API-currency framing on `@compodoc/compodoc` supply-chain status (current advisories / maintenance status)

  All four existing smoke tests (`DEF-response-structure.sh`, `KCB-economics.sh`, `HIA-discipline.sh`, `J-narrative-isolation.sh`) re-run as part of the Phase 6 verification gate. Per-skill D-11 thresholds (plan / review / security-review ≤1 advisor call; execute ≤2) carry forward verbatim from Phase 5.5 D-11 / Phase 5.6 D-12. The UAT trace is gated on **non-zero `WebFetch` / `WebSearch` tool_use events** (specific threshold per session is Claude's Discretion, default ≥1 web tool call in ≥4 of 6 sessions). The S2 Bun-crash exemption inherits Phase 5.5 D-11 / Phase 5.6 verbatim.

### KCB-economics treatment

- **D-05:** `KCB-economics.sh` assertions stay intact. The script re-runs as part of the Phase 6 verification gate and must report `[OK]` on Findings K + C + B. Pattern D + the reshaped UAT prompts (D-04) are the closure mechanism — no taxonomy update to the script. The `setCompodocJson` synthetic prompt in `KCB-economics.sh` line 23 maps to Pattern D's migration / deprecation class; under the new ranking the executor will `WebFetch` the Storybook release notes first, which produces the `name="WebFetch"` event the K assertion looks for, the Pre-Verified section the C assertion looks for, and the `<pre_verified>` block the B assertion looks for.

### Plugin version

- **D-06:** Bump plugin from 0.8.4 to 0.8.5 (SemVer patch). Rationale: Phase 6 is calibration-only — Pattern D extends an existing ranking with a question-class branch; phrasing matches research-backed descriptive style; smoke / UAT additions are test-infra only; no user-visible API change. Matches Phase 5.6 D-13 SemVer convention. Applies to `plugins/lz-advisor/.claude-plugin/plugin.json` and the four SKILL.md `version:` frontmatter fields.

### Claude's Discretion

- Exact word-budget per class block in `references/orient-exploration.md` (~80-120 words per class is reasonable; total file ~400-600 words).
- Exact wording of trigger conditions and 1-2 worked examples per class — anchored in R-01 research findings but composed by the planner.
- Exact reshaped text for each of the six S1..S6 prompts — anchored by the Pattern D class assignment in D-04 but composed by the planner. Reshaped prompts written to `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/prompts/session-{1..6}-<skill>.txt`.
- Smoke-test letter naming for any new assertion (next free letter after `J` is available — `L` for "Pattern D class coverage" or similar). Filename prefix continues `KCB-` / `DEF-` / `HIA-` / `J-` historical anchor convention; a new prefix is acceptable if a new script is needed.
- UAT trace web-usage gate threshold (`>= 1` web tool call in `>= 4` of 6 sessions is the recommended baseline; planner may tighten to `>= 5/6` if reshaped prompts make web usage trivially expected).
- Whether to copy `tally.mjs` from `.planning/phases/05.6-.../uat-plan-07-rerun/tally.mjs` (already migrated for that phase) verbatim or extend it with a new `web_uses` metric column for the per-skill gate.
- Whether the new `references/orient-exploration.md` includes a fifth catch-all class for "uncategorizable / hybrid" questions or treats the four classes as exhaustive (recommended: four classes exhaustive; the executor names ambiguity in the consultation Findings section per existing Pattern B step 5 prose).
- Whether `references/context-packaging.md` Rule 5 cross-reference is a one-liner pointer or a paragraph mirror of Pattern D's positive directive.
- Commit granularity (one commit per plan vs finer; planner picks per revert-surface preference).

</decisions>

<research_directives>
## Research Directives for Planner / Researcher

- **R-01 (anchors D-03):** Sonnet 4.6 prompt-phrasing research already produced findings during the Phase 6 discuss step. Key sources to cite when composing the Pattern D class blocks:
  - https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices — single canonical 4.x prompting doc; covers literal-interpretation warning and tool-use steering ("if you find that the model is not using your web search tools, clearly describe why and how it should").
  - https://www.anthropic.com/engineering/writing-tools-for-agents — tool-description prompting guidance; recommends clear when/why descriptions + few-shot examples over directive force.
  - https://simonwillison.net/2025/May/25/claude-4-system-prompt/ — Anthropic's own production system prompt for Claude 4 family; primary evidence for the "descriptive triggers + ALL-CAPS imperatives only for compliance" style. Look at the `search_instructions` block specifically for the descriptive-trigger pattern Pattern D should mirror.
  - https://www.anthropic.com/engineering/claude-code-best-practices — verification + plan-then-code patterns (relevant to executor orient phase).
  - https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview — notes Sonnet's "do its best to infer" tendency vs Opus asking for clarification (relevant to over-correction risk on imperatives).

  When composing Pattern D, mirror the search_instructions structure: describe the trigger condition, name the first action, name the supporting evidence, then provide 1-2 classification examples. Avoid `MUST` / `REQUIRED` / `NEVER` for tool-use steering; reserve all-caps imperatives for the small handful of cases where the contract is non-negotiable (none in Phase 6 — Pattern D is steering, not compliance).

- **R-02 (anchors D-04):** When reshaping the Phase 5.4 prompts S1..S6 in place, preserve the regression-baseline scenario (Compodoc + Storybook in `ngx-smart-components`-shaped Nx Angular library) but rewrite the question framing so each session unambiguously classifies into the assigned Pattern D class. Validation: before running the UAT, mentally classify each reshaped prompt against the four-class taxonomy in D-01 and verify the assigned class matches. If a prompt classifies into multiple classes (e.g., type-symbol existence + migration / deprecation), prefer the web-first class to surface the gap behavior. The reshaped prompts must still produce useful work (a planner / reviewer / executor session has to do something real on each).

- **R-03 (Git Bash regex portability, inherited convention):** Any new smoke-test assertion for Pattern D class coverage or web-usage detection runs on Git Bash on Windows arm64 (project convention). Confirm `rg` regex-dialect portability for any pattern targeting JSONL trace fields (`"name":"WebFetch"`, `"name":"WebSearch"`, etc.). Reuses the Phase 5.5 R-02 / Phase 5.6 R-03 portability-check pattern.

</research_directives>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 5.6 Plan 07 handoff (immediate source material for Phase 6)

- `.planning/phases/05.6-diagnose-e-runtime-regression-and-re-run-full-compodoc-uat-t/uat-plan-07-rerun/AUTONOMOUS-UAT.md` — The 6-session UAT replay that surfaced Gap 1 (zero web-tool usage) and Gap 2 (Pattern B class-conflation). Conclusion 4 ("Refinement opportunity") and the WebSearch / WebFetch usage table in lines 65-78 are the empirical anchor for Pattern D's question-class split.
- `.planning/phases/05.6-diagnose-e-runtime-regression-and-re-run-full-compodoc-uat-t/05.6-CONTEXT.md` — Phase 5.6 D-01..D-13 locked decisions. Phase 6 inherits and does NOT re-open: D-12 (per-skill D-11 thresholds), D-13 (SemVer patch convention). Phase 5.6 Plan 06 / 07 4-skill symmetry canon for Pattern A / B / Common Contract Rules 1-7 stays.
- `.planning/phases/05.6-diagnose-e-runtime-regression-and-re-run-full-compodoc-uat-t/05.6-VERIFICATION.md` — Three-stage verification structure (forward-capture → fix-validation smoke → 6-session UAT replay) reused for Phase 6, simplified to a two-stage structure (smoke + 6-session UAT replay, since Phase 6 has no diagnostic forward-capture step).
- `.planning/phases/05.6-diagnose-e-runtime-regression-and-re-run-full-compodoc-uat-t/uat-plan-07-rerun/run-all.sh` and `run-session.sh` — UAT runner scripts. Phase 6 reuses the runner shape and copies / adapts these for the reshaped-prompts replay.
- `.planning/phases/05.6-diagnose-e-runtime-regression-and-re-run-full-compodoc-uat-t/uat-plan-07-rerun/tally.mjs` — Metrics script. Phase 6 either reuses verbatim or extends with a `web_uses` metric column.

### Plugin files Phase 6 modifies

- `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` — `<orient_exploration_ranking>` block at lines 54-66 gains an `@`-load line pointing to `references/orient-exploration.md`. Frontmatter `version:` bumps 0.8.4 → 0.8.5.
- `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` — Same `<orient_exploration_ranking>` `@`-load addition. Frontmatter version bump.
- `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` — Same `@`-load addition. Frontmatter version bump.
- `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` — Same `@`-load addition. Frontmatter version bump.
- `plugins/lz-advisor/references/orient-exploration.md` — NEW. Contains Pattern D's four class blocks per D-01 / D-03 phrasing.
- `plugins/lz-advisor/references/context-packaging.md` — Rule 5 (lines 44-46) gains a one-line cross-reference to `references/orient-exploration.md`.
- `plugins/lz-advisor/.claude-plugin/plugin.json` — Version bump 0.8.4 → 0.8.5 (D-06).

### Phase 5.4 UAT fixtures (reshaped, not reused verbatim)

- `.planning/phases/05.4-address-uat-findings-a-k/uat-5-compodoc-run/prompts/session-{1..6}-<skill>.txt` — Original prompts. Phase 6 reshapes these into `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/prompts/session-{1..6}-<skill>.txt` per D-04 class assignments. Phase 5.4 originals stay untouched (regression-baseline preservation per Phase 5.5 T-05.5-13 mitigation pattern).

### Smoke tests (Phase 6 re-runs all four; KCB-economics.sh is a load-bearing gate signal)

- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/KCB-economics.sh` — Findings K + C + B for executor web-tool usage on API-migration questions. Lines 28-50 contain the assertion logic: K matches `"name":"(WebSearch|WebFetch)"` in the trace; C matches `Pre-Verified Package Behavior Claims` in the executor-to-advisor package; B matches `<pre_verified source=` block. Phase 6 verification gate requires this script to exit 0 on plugin 0.8.5. Per D-05 the script is NOT loosened — Pattern D + reshaped prompts are the closure mechanism.
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/DEF-response-structure.sh` — Advisor / reviewer / security-reviewer output-shape gate. Phase 5.6 extended this to ~135-145 lines with tightened E + new I assertions.
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/HIA-discipline.sh` — Re-run for cross-cutting regression coverage.
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/J-narrative-isolation.sh` — Re-run for Mechanism C scope-derivation regression coverage.

### Anthropic prompting research (anchors D-03 phrasing, R-01)

- https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices — Single canonical 4.x prompting doc. Quote on tool-use steering: "if you find that the model is not using your web search tools, clearly describe why and how it should." Quote on literalism: "Claude Opus 4.7 interprets prompts more literally and explicitly than Claude Opus 4.6, particularly at lower effort levels."
- https://www.anthropic.com/engineering/writing-tools-for-agents — Tool-description prompting; recommends clear when/why + few-shot examples over directive force.
- https://simonwillison.net/2025/May/25/claude-4-system-prompt/ — Anthropic's own production system prompt for Claude 4 family. Search_instructions block is the canonical descriptive-triggers + selective-imperatives pattern Pattern D mirrors.
- https://www.anthropic.com/engineering/claude-code-best-practices — Verification + plan-then-code patterns.
- https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview — Sonnet's "do its best to infer" tendency vs Opus asking for clarification.

### Project conventions (carried forward)

- `CLAUDE.md` — Skill Verification with `claude -p` convention; Git Bash Windows arm64 shell rules; ASCII-only constraint; fetch fallback chain (markdown.new → WebFetch → url-to-markdown → playwright-cli); RTK prefix convention. Same constraints apply to Phase 6 Plan execution.
- `plugins/lz-advisor/references/advisor-timing.md` — Anthropic's timing guidance reference (existing). Pattern D's worked examples should align with the timing guidance where they overlap.
- `plugins/lz-advisor/references/context-packaging.md` — Common Contract Rules 1-7 (Phase 5.6 Plan 07 added Rule 7). Pattern D's interaction with Rule 5 (Pre-Verified Package Behavior Claims) is the cross-reference D-02 mentions.

### Anthropic foundational research (preserved from prior phases)

- `research/anthropic/docs/advisor-tool.md` — Advisor tool docs; relevant if Pattern D's worked examples include consultation packaging.
- `research/anthropic/blog/the-advisor-strategy-give-agents-an-intelligence-boost.md` — Executor-holds-tools split; relevant to the orient-side classification logic Pattern D ships.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **Phase 5.6 Plan 07 UAT runner shape** (`.planning/phases/05.6-.../uat-plan-07-rerun/run-all.sh`, `run-session.sh`, `tally.mjs`) — Phase 6 copies these to `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/` and adapts: the `claude -p` invocation pattern is the same; the prompt files are the reshaped Phase 5.4 fixtures; tally.mjs may need a `web_uses` metric column for the per-skill web-usage gate.
- **Phase 5.4 prompt fixture set** — Six S1..S6 prompts in `.planning/phases/05.4-.../uat-5-compodoc-run/prompts/`. Phase 6 reshapes these into a separate directory; the originals stay untouched (regression-baseline preservation, T-05.5-13 mitigation inherited).
- **Existing `<orient_exploration_ranking>` blocks** in 4 SKILL.md (lines 54-66 in plan; 57-69 in execute; similar locations in review and security-review) — Phase 6 adds a single `@`-load line pointing to `references/orient-exploration.md` inside each existing block. The Pattern B inline prose stays.
- **Existing references infrastructure** — `references/advisor-timing.md` and `references/context-packaging.md` already follow the @-load pattern from SKILL.md. Phase 6's new `references/orient-exploration.md` uses the same conventions: plain markdown, no frontmatter, @-loaded via `${CLAUDE_PLUGIN_ROOT}/references/orient-exploration.md`.
- **Smoke test framework** — `KCB-economics.sh` (lines 1-58) is the canonical Bash + `rg` + JSONL trace-grepping pattern. Any new web-usage gate assertion can mirror its shape.

### Established Patterns

- **`<context_trust_contract>` + `<orient_exploration_ranking>` 4-skill byte-identical inline canon** (Phase 5.6 Plan 06 / 07) — Phase 6 preserves this for Patterns A / B and adds a single `@`-load line per skill for Pattern D. No retroactive churn on Patterns A / B.
- **Three-stage verification → two-stage for Phase 6** — Phase 5.6's "diagnose → fix-validation smoke → 6-session UAT replay" simplifies to "smoke → 6-session UAT replay" since Phase 6 has no diagnostic forward-capture step (the gap is named, the fix shape is locked).
- **Letter-based smoke-test naming** (Phase 5.4 A-K, Phase 5.5 G+H, Phase 5.6 I) — next free letter is `L`. Phase 6 may add an `L-pattern-d-coverage.sh` or extend `KCB-economics.sh` with a new assertion; planner picks.
- **Prompt rule + smoke-test lock** (Phase 5.4 D-15, Phase 5.5 D-04+D-05, Phase 5.6 D-03+D-05) — Phase 6 D-03 (Pattern D phrasing) + D-04 (UAT replay gate) follow the same pattern: the prompt-text fix and the validation gate land together.
- **Positive framing over negative prohibitions** (Phase 5.3 / 5.4 convention) — Phase 6 D-03 phrasing is positive-form ("the first orient action is `WebFetch`...") not negative-form ("do NOT skip WebFetch...").

### Integration Points

- New ref file (`plugins/lz-advisor/references/orient-exploration.md`) is the only new file in the plugin tree.
- Four SKILL.md files each get a one-line `@`-load addition inside their existing `<orient_exploration_ranking>` block + a one-line `version:` frontmatter bump = ~10 lines changed across 4 files.
- `plugin.json` gets a one-line version bump.
- `references/context-packaging.md` Rule 5 gets a one-line cross-reference (~5-10 words).
- Phase 6 phase directory at `.planning/phases/06-address-phase-5-6-uat-findings/` gets a `uat-pattern-d-replay/` subdirectory containing reshaped prompts + runner + traces + tally + session-notes (mirrors `uat-plan-07-rerun/` shape from Phase 5.6).
- Smoke test scripts re-run from Phase 5.4 location; no new copy required. If a new web-usage assertion script is added, it lives in `.planning/phases/05.4-.../smoke-tests/` (the canonical smoke-test home, not Phase 6's directory) per the historical-anchor convention.

</code_context>

<specifics>
## Specific Ideas

- **The Compodoc/Storybook scenario is preserved as the regression baseline.** Phase 5.4 chose Compodoc + Storybook because it exercises framework-convention discovery (Nx targets, Storybook 10.x docs config, Compodoc generator) at realistic complexity. Phase 6 keeps the scenario; only the prompt framing shifts toward web-first classes. This preserves 5 phases of regression coverage in the underlying scenario while letting Phase 6 measure Pattern D's specific behavior.
- **AUTONOMOUS-UAT.md Conclusion 4 framed the Pattern D refinement as "NOT a regression."** Phase 6 ships it as a forward refinement that expands behavior coverage rather than a regression fix. The SemVer-patch decision (D-06) reflects this: 0.8.5 is calibration, not capability.
- **Anthropic's own production system prompt is the strongest evidence for Pattern D's phrasing style.** The leaked search_instructions block (Simon Willison, 2026-04-25 — actually 2025-05-25 per the dated post URL) uses the same descriptive-trigger + concrete-when/how + reserved-imperatives-for-compliance shape Phase 6 D-03 mandates. The plugin's executor SKILL.md and the new orient-exploration.md should read like that block: factual, calm, classification-first.
- **The user's directive "We must see WebSearch+WebFetch usage" maps to a measurable gate, not a soft success criterion.** D-04's web-usage gate threshold is empirically anchored: ≥1 WebFetch / WebSearch tool_use in ≥4 of 6 sessions covers four out of four web-first classes (one per class minimum) plus tolerance. The S2 Bun-crash exemption inherits Phase 5.6 verbatim.
- **`KCB-economics.sh` becomes a load-bearing gate signal in Phase 6.** Pre-Phase 6 it was a regression-coverage script; Phase 6 promotes it to a Phase 6 verification gate signal. The script itself does not change (D-05); its role does. If KCB-economics.sh fails on plugin 0.8.5, Pattern D's classification mechanism is empirically broken and Phase 6 cannot ship.
- **Pattern D treats "exhaustive" as a planner discretion, not a CONTEXT.md lock.** D-01 names four classes; the planner may decide whether a fifth catch-all class is worth the prose cost or whether the existing Pattern B step 5 ("name the gap explicitly in the consultation Findings section and proceed") covers ambiguity. Recommended default: four classes exhaustive, Pattern B step 5 handles ambiguity.
- **The phase has no agent prompt edits.** Phase 5.6 considered touching `advisor.md`'s density example as a fix surface (D-04 escalation). Phase 6 explicitly does NOT touch `advisor.md`, `reviewer.md`, or `security-reviewer.md` — Pattern D is an executor-side classification refinement; advisor outputs are unaffected.

</specifics>

<deferred>
## Deferred Ideas

- **README "Recommended prompt shape" section** — deferred from Phase 5.5 / 5.6, deferred again. Phase 6 reshapes UAT prompts privately; user-facing prompt-shape guidance is a polish phase concern.
- **Pattern D as a `claude -p` linter / pre-flight check** — Phase 6 has no automated mechanism for users to verify their prompts classify cleanly into one of Pattern D's four classes. A future phase could add a heuristic linter (lightweight pre-flight that suggests "this prompt looks like API-currency class; consider adding version context for Pattern D classification") but it's out of Phase 6 scope.
- **Fifth catch-all class in Pattern D** — defer unless reshaped UAT prompts reveal cases where the four classes don't fit cleanly. Current Pattern B step 5 ("name the gap explicitly in Findings") is the safety net.
- **Smoke-test extension for per-class coverage** — Phase 6's web-usage gate is a single `>=1 in >=4 of 6` aggregate threshold. A future phase could add per-class assertions (e.g., "S2 trace must show migration-class WebFetch", "S5 trace must show language-semantics-class WebFetch"). Defer unless aggregate gate proves insufficient.
- **Retroactive extraction of Pattern A + B to shared reference** — Phase 6 keeps Patterns A / B inline (D-02). A future polish phase may revisit this once Pattern D's shared-ref pattern proves stable.
- **`maxTurns` cap removal or SendMessage-based bidirectional advisor** — architectural change, deferred since Phase 5.3 / 5.4 / 5.5 / 5.6. Still deferred.
- **Pro / Free plan tier UAT cross-tier verification** — structurally impossible from Team subscription. Inherits prior deferred status.
- **KCB-economics.sh extension for `.d.ts` reads as Pre-Verified Claim source** — D-05 explicitly chose NOT to loosen KCB. If a future phase wants to recognize `.d.ts` as a valid Pre-Verified Claim source for type-symbol existence questions specifically, it would extend KCB with an alternative-evidence path. Defer unless realistic scenarios demand it.
- **Plugin README update for Pattern D** — out of Phase 6 scope. The README documents skills + agents; Pattern D is an internal orient-phase refinement. Defer to next polish phase.

</deferred>

---

*Phase: 06-address-phase-5-6-uat-findings*
*Context gathered: 2026-04-28*
