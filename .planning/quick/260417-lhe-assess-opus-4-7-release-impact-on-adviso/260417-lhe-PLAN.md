---
phase: 260417-lhe-assess-opus-4-7-release-impact-on-adviso
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - plugins/lz-advisor/agents/reviewer.md
  - plugins/lz-advisor/agents/security-reviewer.md
  - plugins/lz-advisor/README.md
  - .planning/PROJECT.md
  - .planning/quick/260417-lhe-assess-opus-4-7-release-impact-on-adviso/260417-lhe-ASSESSMENT.md
autonomous: true
requirements:
  - OPUS47-ASSESS-01
  - OPUS47-REVIEWER-XHIGH
  - OPUS47-SECREV-XHIGH
  - OPUS47-DOCS-SYNC

must_haves:
  truths:
    - "ASSESSMENT.md opens with a TL;DR mapping 1:1 to shipped changes"
    - "ASSESSMENT.md includes the per-agent effort-tier table from RESEARCH.md verbatim"
    - "ASSESSMENT.md carries forward the open UAT questions from RESEARCH.md as follow-up work"
    - "effort: xhigh is empirically proven to load without frontmatter parser error OR reviewer agents are reverted to effort: high and the blocker is documented"
    - "reviewer.md and security-reviewer.md declare effort: xhigh in frontmatter (when parser accepts it)"
    - "advisor.md frontmatter is unchanged (model: opus, effort: high, maxTurns: 3, tools: [Read, Glob])"
    - "No agent pins model to claude-opus-4-7 (all three keep model: opus alias)"
    - "README.md reflects Opus 4.7 in model-tier references and notes auto-pickup via the opus alias"
    - "PROJECT.md Constraints section references Opus 4.7 (not 4.6) and notes prompt optimization targets 4.7 behavior"
    - "Root ./CLAUDE.md is NOT edited"
    - "plugins/lz-advisor/agents/advisor.md is NOT edited"
    - "plugins/lz-advisor/skills/*/SKILL.md is NOT edited"
    - "plugins/lz-advisor/references/advisor-timing.md is NOT edited"
  artifacts:
    - path: ".planning/quick/260417-lhe-assess-opus-4-7-release-impact-on-adviso/260417-lhe-ASSESSMENT.md"
      provides: "Written assessment of Opus 4.7 impact, decisions shipped, and follow-up UAT questions"
      contains: "TL;DR"
      min_lines: 80
    - path: "plugins/lz-advisor/agents/reviewer.md"
      provides: "Reviewer agent upgraded to effort: xhigh (or documented revert to high)"
      contains: "effort:"
    - path: "plugins/lz-advisor/agents/security-reviewer.md"
      provides: "Security-reviewer agent upgraded to effort: xhigh (or documented revert to high)"
      contains: "effort:"
    - path: "plugins/lz-advisor/README.md"
      provides: "User-facing documentation reflecting Opus 4.7 availability via opus alias"
      contains: "4.7"
    - path: ".planning/PROJECT.md"
      provides: "Project constraints updated to reflect Opus 4.7 baseline"
      contains: "4.7"
  key_links:
    - from: "plugins/lz-advisor/agents/reviewer.md"
      to: "Claude Code agent frontmatter parser"
      via: "effort field loaded without validation error at plugin startup"
      pattern: "effort: (xhigh|high)"
    - from: "plugins/lz-advisor/agents/security-reviewer.md"
      to: "Claude Code agent frontmatter parser"
      via: "effort field loaded without validation error at plugin startup"
      pattern: "effort: (xhigh|high)"
    - from: ".planning/quick/260417-lhe-assess-opus-4-7-release-impact-on-adviso/260417-lhe-ASSESSMENT.md"
      to: ".planning/quick/260417-lhe-assess-opus-4-7-release-impact-on-adviso/260417-lhe-RESEARCH.md"
      via: "citation of quote-backed findings and per-agent effort-tier table"
      pattern: "RESEARCH.md"
---

<objective>
Assess the Opus 4.7 release (2026-04-16) against the lz-advisor plugin and ship the agreed-upon upgrade changes in a single quick task.

Purpose: Opus 4.7 is auto-resolved by the `model: opus` alias and introduces a new `xhigh` effort tier Anthropic recommends for coding and agentic use cases. The plugin's reviewer and security-reviewer agents should opt into `xhigh`; the advisor should stay at `high` because its synthesis task benefits from 4.7's lower baseline tool usage at the current tier. Documentation that still references Opus 4.6 needs syncing.

Output:
- `260417-lhe-ASSESSMENT.md` summarizing findings, decisions, and shipped changes with the per-agent effort-tier table and open UAT questions.
- Frontmatter edits to `reviewer.md` and `security-reviewer.md` (effort high -> xhigh) GATED on empirical parser acceptance of `xhigh`.
- README and PROJECT.md updates reflecting Opus 4.7 baseline.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/quick/260417-lhe-assess-opus-4-7-release-impact-on-adviso/260417-lhe-CONTEXT.md
@.planning/quick/260417-lhe-assess-opus-4-7-release-impact-on-adviso/260417-lhe-RESEARCH.md
@plugins/lz-advisor/agents/advisor.md
@plugins/lz-advisor/agents/reviewer.md
@plugins/lz-advisor/agents/security-reviewer.md
@plugins/lz-advisor/README.md

<interfaces>
<!-- Current agent frontmatter shape (all three agents). Shipped via Claude Code's agent discovery. -->
<!-- Target change: reviewer.md and security-reviewer.md flip `effort: high` -> `effort: xhigh`. -->
<!-- advisor.md is NOT edited in this task. -->

reviewer.md / security-reviewer.md frontmatter (target fields):
```yaml
model: opus           # unchanged (alias auto-routes to claude-opus-4-7)
color: cyan | yellow  # unchanged
effort: high          # -> xhigh (gated on parser acceptance)
tools: ["Read", "Glob"]  # unchanged
maxTurns: 3           # unchanged
```

advisor.md frontmatter (DO NOT MODIFY):
```yaml
model: opus
color: magenta
effort: high          # stays at high per CONTEXT.md decision
tools: ["Read", "Glob"]
maxTurns: 3
```
</interfaces>

<constraints_from_context>
Out-of-scope (CONTEXT.md explicit):
- Root ./CLAUDE.md (user declined)
- plugins/lz-advisor/agents/advisor.md (no prompt or frontmatter changes)
- plugins/lz-advisor/skills/*/SKILL.md
- plugins/lz-advisor/references/advisor-timing.md
- Model pinning (`claude-opus-4-7`); keep `model: opus` alias
- maxTurns changes
</constraints_from_context>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Verify effort: xhigh frontmatter parser acceptance (critical gate)</name>
  <files>
    plugins/lz-advisor/agents/reviewer.md (temporary probe edit, then revert regardless of outcome)
  </files>
  <action>
    Prove empirically whether Claude Code's agent frontmatter parser accepts `effort: xhigh` before committing the real change. This is the critical gate from CONTEXT.md.

    Procedure:
    1. Temporarily edit `plugins/lz-advisor/agents/reviewer.md` frontmatter: change `effort: high` to `effort: xhigh`. Do NOT commit this probe edit.
    2. Run the probe command from the repo root:
       ```
       claude --plugin-dir plugins/lz-advisor -p "/lz-advisor.review probe task for xhigh frontmatter validation -- respond with literal string READY and no tool calls" --verbose
       ```
       Capture stdout and stderr into a temp log (e.g. `/tmp/xhigh-probe.log` or `$TMPDIR/xhigh-probe.log`; on Git Bash use `$(cygpath -u "$TEMP")/xhigh-probe.log`).
    3. Interpret the result:
       - PASS: command runs without YAML / frontmatter / schema validation error mentioning `effort` or `xhigh`. The skill may fail for unrelated reasons (no code to review, etc.) -- that is acceptable. What matters is that the agent loaded.
       - FAIL: command errors with a validation message indicating `effort: xhigh` is not an accepted value, OR the plugin refuses to load with a parse error rooted at the frontmatter.
    4. Fallback probe (only if step 2 is ambiguous): invoke plugin-dev's validator if available: `claude --plugin-dir plugins/lz-advisor --validate` or the `plugin-validator` agent. Green = PASS, red on the effort field = FAIL.
    5. Revert `plugins/lz-advisor/agents/reviewer.md` back to `effort: high` regardless of outcome (Task 2 is the real edit).
    6. Record the outcome (PASS or FAIL) in a shell variable or scratch note. This outcome drives Task 2's behavior:
       - PASS -> Task 2 writes `effort: xhigh` to reviewer.md and security-reviewer.md.
       - FAIL -> Task 2 keeps both at `effort: high`, and Task 4's ASSESSMENT.md documents the parser rejection as a blocker with the command output.

    Note on why this probe is necessary: RESEARCH.md confirms `xhigh` is a valid Claude API `effort` value and that Claude Code itself uses `xhigh` as the default for plans. It does NOT confirm that the plugin frontmatter YAML parser accepts the literal string `xhigh` as an agent `effort` value. The two parsers are independent code paths.
  </action>
  <verify>
    <automated>test -f plugins/lz-advisor/agents/reviewer.md &amp;&amp; git grep -n "^effort: high$" plugins/lz-advisor/agents/reviewer.md</automated>
    Probe log exists and outcome (PASS|FAIL) is captured. reviewer.md is reverted to `effort: high` on disk (no uncommitted edits remain).
  </verify>
  <done>
    - Probe command executed and log captured.
    - Parser outcome classified as PASS or FAIL.
    - reviewer.md is back to its original `effort: high` state (no leaked probe edit).
    - Outcome is ready to drive Task 2.
  </done>
</task>

<task type="auto">
  <name>Task 2: Apply effort-tier frontmatter changes (gated on Task 1 outcome)</name>
  <files>
    plugins/lz-advisor/agents/reviewer.md
    plugins/lz-advisor/agents/security-reviewer.md
  </files>
  <action>
    Apply the agent frontmatter changes per CONTEXT.md's per-agent decisions. Behavior depends on Task 1's outcome.

    If Task 1 = PASS (xhigh accepted):
    1. Edit `plugins/lz-advisor/agents/reviewer.md`: change `effort: high` to `effort: xhigh`. No other edits.
    2. Edit `plugins/lz-advisor/agents/security-reviewer.md`: change `effort: high` to `effort: xhigh`. No other edits.
    3. Leave `plugins/lz-advisor/agents/advisor.md` untouched (explicit out-of-scope per CONTEXT.md).
    4. Confirm with `git diff plugins/lz-advisor/agents/` that only the two `effort:` lines changed and no other frontmatter fields (model, color, tools, maxTurns) were touched.

    If Task 1 = FAIL (xhigh rejected):
    1. Do NOT change `effort:` in either file. Leave both at `effort: high`.
    2. Task 4's ASSESSMENT.md will document the blocker, the probe output, and the revert decision.
    3. Still complete Task 3 (README) and Task 4 (ASSESSMENT.md) -- the model-alias auto-upgrade is still shipped; the effort-tier upgrade is simply deferred.

    Constraints to enforce:
    - `model: opus` stays an alias on all three agents. Do NOT pin to `claude-opus-4-7`.
    - `maxTurns: 3` stays unchanged everywhere.
    - `tools: ["Read", "Glob"]` stays unchanged everywhere.
    - The prompt body (everything after the `---` frontmatter close) is NOT edited in any agent file.
  </action>
  <verify>
    <automated>git diff --stat plugins/lz-advisor/agents/ &amp;&amp; git grep -n "^effort:" plugins/lz-advisor/agents/</automated>
    On PASS path: `git grep -n "^effort: xhigh$" plugins/lz-advisor/agents/reviewer.md plugins/lz-advisor/agents/security-reviewer.md` returns both files; `git grep -n "^effort: high$" plugins/lz-advisor/agents/advisor.md` returns advisor.md.
    On FAIL path: all three files still show `effort: high`.
    In both cases: no `maxTurns` line was modified (`git diff` shows no changes on that line), no `model:` line changed, no prompt body changes (diff is frontmatter-only, minimal line count).
  </verify>
  <done>
    - Frontmatter changes applied per Task 1 outcome.
    - advisor.md untouched.
    - No out-of-scope fields (model, maxTurns, tools, prompt body) modified.
    - `git diff` is clean and minimal (one or two single-line frontmatter changes).
  </done>
</task>

<task type="auto">
  <name>Task 3: Sync user-facing and project docs to Opus 4.7</name>
  <files>
    plugins/lz-advisor/README.md
    .planning/PROJECT.md
  </files>
  <action>
    Update documentation to reflect Opus 4.7 as the current Opus generation. Keep edits minimal and targeted -- do not restructure or rewrite.

    Changes to `plugins/lz-advisor/README.md`:
    1. "Overview" section (around lines 7-11): update the sentence "pairs a stronger model (Opus 4.6) with a faster model (typically Sonnet 4.6)" to reflect Opus 4.7 as the current generation. Reasonable phrasing: "pairs a stronger model (Opus 4.7, auto-selected via the `opus` alias) with a faster model (typically Sonnet 4.6)". Keep the Anthropic benchmark sentence intact -- the +2.7pp / 11.9% figure was measured on 4.6 and attributing it to 4.7 is a misrepresentation. Reasonable phrasing: "Anthropic's internal benchmarks (measured on Opus 4.6) show..." to preserve accuracy.
    2. "How it works" section (around lines 47-49): update "the `lz-advisor` agent, which runs on Opus 4.6" to "the `lz-advisor` agent, which runs on Opus (currently Opus 4.7, auto-selected via the `opus` alias)".
    3. "Requirements" section (around line 60): update "Claude Code with access to both Sonnet 4.6 and Opus 4.6" to "Claude Code with access to Sonnet 4.6 or later and Opus 4.7 or later (the `opus` alias auto-resolves to the current Opus generation)".
    4. Add a short note somewhere natural (either appended to Requirements or added to How it works) along the lines of: "Opus 4.7 (released 2026-04-16) is auto-selected via the `opus` alias; no user action is required to adopt it." Keep it one sentence.

    Changes to `.planning/PROJECT.md`:
    1. "Constraints" section (around lines 57-62): update the `Model availability` bullet from "Requires user has access to both Sonnet 4.6 and Opus 4.6" to "Requires user has access to Sonnet 4.6 (or later) and Opus 4.7 (or later). The `model: opus` alias auto-resolves to the current Opus generation."
    2. Same section: update the `Prompt optimization` bullet from "Executor prompts optimized for Sonnet 4.6, advisor prompts optimized for Opus 4.6" to note 4.7 behavior. Reasonable phrasing: "Executor prompts optimized for Sonnet 4.6; advisor prompts optimized for Opus 4.7 (literal instruction following, lower baseline tool usage, task-calibrated response length)." per RESEARCH.md's summary of 4.7 behavior changes.
    3. Update the footer "Last updated" line to `2026-04-17 -- Opus 4.7 adoption via opus alias (260417-lhe quick task)`.

    Do NOT:
    - Edit root `./CLAUDE.md`.
    - Edit the "What This Is" or "Core Value" sections of PROJECT.md -- they are model-version-agnostic.
    - Edit the Key Decisions table -- add decisions in Task 4's ASSESSMENT.md instead, not in PROJECT.md's historical decision log.
    - Restructure or re-wrap existing paragraphs; apply surgical edits to the specified lines.
  </action>
  <verify>
    <automated>git grep -n "4.7" plugins/lz-advisor/README.md .planning/PROJECT.md &amp;&amp; ! git grep -n "Opus 4\.6" plugins/lz-advisor/README.md .planning/PROJECT.md | rtk grep -v "4.6 prompts" | rtk grep -v "measured on" | rtk grep -v "Phase"</automated>
    `git grep -n "Opus 4.7" plugins/lz-advisor/README.md` shows at least 2 hits (Overview + How it works + Requirements).
    `git grep -n "Opus 4.7" .planning/PROJECT.md` shows at least 1 hit in Constraints.
    `git grep -n "opus alias\|model: opus" plugins/lz-advisor/README.md .planning/PROJECT.md` confirms the alias is mentioned in at least one place per file.
    No edits to root `./CLAUDE.md` (`git status ./CLAUDE.md` reports unchanged).
  </verify>
  <done>
    - README.md Overview, How it works, and Requirements sections reference Opus 4.7 and the `opus` alias.
    - PROJECT.md Constraints section reflects 4.7 baseline for both model availability and prompt optimization.
    - PROJECT.md footer updated.
    - No out-of-scope doc files modified.
  </done>
</task>

<task type="auto">
  <name>Task 4: Write ASSESSMENT.md</name>
  <files>
    .planning/quick/260417-lhe-assess-opus-4-7-release-impact-on-adviso/260417-lhe-ASSESSMENT.md
  </files>
  <action>
    Create the assessment document that summarizes findings, decisions, and what shipped. Structure follows CONTEXT.md's specifics. Narrative and decision-focused, not exhaustive -- RESEARCH.md already has the deep findings.

    Required sections (in order):

    1. **Header**: title, date (2026-04-17), link to RESEARCH.md and to the canonical Anthropic sources (release post + migration guide URLs from CONTEXT.md).

    2. **TL;DR** (3-5 bullets, maps 1:1 to shipped changes per CONTEXT.md specifics):
       - advisor stays at `effort: high` (and why)
       - reviewer / security-reviewer moved to `effort: xhigh` (OR reverted to `effort: high` with blocker note, depending on Task 1 outcome)
       - All three agents keep `model: opus` alias; no pinning
       - README + PROJECT.md synced to 4.7 baseline
       - Root CLAUDE.md deferred to a later docs pass (user decision)

    3. **Per-agent effort-tier table**: reproduce verbatim the table from RESEARCH.md "Per-Agent Recommendation" section (the one with Agent / Current (4.6) / Recommended (4.7) / Rationale columns). This is the clearest decision artifact per CONTEXT.md specifics.

    4. **What shipped in this task**: bulleted list of the concrete file changes (agent frontmatter, README paragraphs, PROJECT.md constraints, this ASSESSMENT.md). One line per file. This section MUST match the actual git diff from Tasks 2 and 3 -- do not claim changes that were not made.

    5. **Task 1 parser-probe outcome**: brief subsection documenting:
       - Which probe command was run
       - Result (PASS or FAIL) with one-line evidence
       - If FAIL: the blocker text, the revert decision, and what follow-up is needed (file an issue upstream, retry in N weeks, pin model, etc.)

    6. **Why advisor stayed at `high`**: a short paragraph citing RESEARCH.md's rationale. Key quotes to carry: "4.7 has a tendency to use tools less often than Claude Opus 4.6 and to use reasoning more" and "the advisor's job is synthesis, not exploration." This is the most likely question a future reader will have.

    7. **Follow-up UAT questions (open)**: reproduce the list from RESEARCH.md "Open Questions (need empirical tests)" section. Mark clearly that these are NOT blockers for this quick task -- they are deferred empirical checks. At minimum include:
       - Does `effort: high` on 4.7 reduce advisor tool calls vs 4.6 baseline? (Phase 5.1 preamble waste sanity check)
       - Does `xhigh` on reviewer / security-reviewer expand output length above the 300-word cap? If so, consider a positive example per Anthropic's guidance.
       - Does 4.7's "more direct tone" over-apply to reviewer severity phrasing?
       - Is `maxTurns: 3` still the right ceiling at `xhigh`, or does `xhigh` warrant raising it?

    8. **Out of scope (reaffirmed)**: list the explicit exclusions from CONTEXT.md so a future reader knows these were considered and rejected for this quick task: root CLAUDE.md, advisor.md prompt changes, model pinning, maxTurns changes, skill SKILL.md edits, references/advisor-timing.md.

    9. **Source citations**: links to RESEARCH.md, the Anthropic release post, and the migration guide.

    Style:
    - Markdown, ASCII only (no em dashes, no curly quotes, no Unicode symbols -- user's global rule).
    - Narrative for the Why sections; tabular for the effort-tier comparison; bulleted for TL;DR and shipped changes.
    - Do NOT duplicate RESEARCH.md's detailed findings; link to them.
    - Target length: ~80-150 lines. This is a decision doc, not a research doc.
  </action>
  <verify>
    <automated>test -f .planning/quick/260417-lhe-assess-opus-4-7-release-impact-on-adviso/260417-lhe-ASSESSMENT.md &amp;&amp; git grep -c "TL;DR\|Per-Agent\|Follow-up\|Out of scope\|RESEARCH.md" .planning/quick/260417-lhe-assess-opus-4-7-release-impact-on-adviso/260417-lhe-ASSESSMENT.md</automated>
    ASSESSMENT.md exists with at least 80 lines. Contains the required section headers (TL;DR, Per-agent table, What shipped, Parser probe outcome, Why advisor stayed at high, Follow-up UAT, Out of scope, Sources). References RESEARCH.md at least once. No Unicode symbols (grep for em dash U+2014 and curly quotes returns zero hits).
  </verify>
  <done>
    - ASSESSMENT.md written with all required sections in order.
    - TL;DR maps 1:1 to the git diff from Tasks 2 and 3.
    - Per-agent effort-tier table included verbatim.
    - Parser-probe outcome recorded.
    - Open UAT questions preserved as follow-up items (clearly non-blocking).
    - Out-of-scope list reaffirmed.
    - ASCII-only content, no Unicode symbols.
  </done>
</task>

</tasks>

<verification>
Phase-level verification (run after all tasks complete):

1. **Files shipped**:
   - `git status` shows edits to: `plugins/lz-advisor/agents/reviewer.md`, `plugins/lz-advisor/agents/security-reviewer.md`, `plugins/lz-advisor/README.md`, `.planning/PROJECT.md`
   - `git status` shows new file: `.planning/quick/260417-lhe-assess-opus-4-7-release-impact-on-adviso/260417-lhe-ASSESSMENT.md`

2. **Out-of-scope files untouched**:
   - `git diff ./CLAUDE.md` shows no changes.
   - `git diff plugins/lz-advisor/agents/advisor.md` shows no changes.
   - `git diff plugins/lz-advisor/skills/` shows no changes.
   - `git diff plugins/lz-advisor/references/advisor-timing.md` shows no changes.

3. **Frontmatter constraints**:
   - `git grep -n "^model: opus$" plugins/lz-advisor/agents/` returns all three agents (no pinning).
   - `git grep -n "^maxTurns: 3$" plugins/lz-advisor/agents/` returns all three agents (unchanged).
   - advisor.md still has `effort: high`.

4. **Plugin loads without error** (final sanity check after Task 2):
   ```
   claude --plugin-dir plugins/lz-advisor -p "echo lz-advisor plugin probe" --verbose
   ```
   No YAML / frontmatter / schema validation errors. If the Task 1 gate passed, this should also pass.

5. **ASSESSMENT.md accuracy**: the "What shipped" section of ASSESSMENT.md matches the actual `git diff --stat` of this plan. No hallucinated changes.
</verification>

<success_criteria>
- `.planning/quick/260417-lhe-assess-opus-4-7-release-impact-on-adviso/260417-lhe-ASSESSMENT.md` exists with TL;DR, per-agent table, shipped changes, parser-probe outcome, why-advisor-stayed-at-high rationale, follow-up UAT items, out-of-scope reaffirmation, and sources.
- `plugins/lz-advisor/agents/reviewer.md` and `plugins/lz-advisor/agents/security-reviewer.md` declare `effort: xhigh` IF the parser accepts it; otherwise both remain at `effort: high` and the blocker is documented in ASSESSMENT.md.
- `plugins/lz-advisor/agents/advisor.md` is unchanged.
- All three agents keep `model: opus` (alias, not pinned) and `maxTurns: 3`.
- `plugins/lz-advisor/README.md` references Opus 4.7 in Overview, How it works, and Requirements, and notes the `opus` alias auto-pickup.
- `.planning/PROJECT.md` Constraints section references Opus 4.7 for model availability and for prompt optimization.
- Root `./CLAUDE.md`, skill SKILL.md files, and `references/advisor-timing.md` are untouched.
- No Unicode symbols introduced in any written file (user global rule: ASCII only).
- Claude Code's plugin frontmatter parser loads the modified plugin without validation errors (verified by Task 1 probe or by a post-Task-2 smoke run).
</success_criteria>

<output>
After completion, create `.planning/quick/260417-lhe-assess-opus-4-7-release-impact-on-adviso/260417-lhe-SUMMARY.md` documenting what shipped. Keep it short -- ASSESSMENT.md is the substantive artifact; SUMMARY.md is the GSD-workflow receipt.
</output>
