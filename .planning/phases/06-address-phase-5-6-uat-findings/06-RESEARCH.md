# Phase 6: Address Phase 5.6 UAT Findings - Research

**Researched:** 2026-04-28
**Domain:** Claude 4.x prompt engineering for tool-use steering; question-class-aware orient ranking; UAT replay infrastructure on Git Bash Windows arm64
**Confidence:** HIGH (all load-bearing claims verified against primary Anthropic sources or empirically against the existing codebase)

## Summary

Phase 6 ships a question-class-aware Pattern D in a new shared reference file (`plugins/lz-advisor/references/orient-exploration.md`), reshapes the six Phase 5.4 UAT prompts so each one classifies unambiguously into a Pattern D class, and re-runs the four existing smoke tests plus a 6-session UAT replay against plugin 0.8.5. The phase has no CLAUDE.md conflicts and no missing tooling (all required tools verified available).

The single highest-leverage finding is that Anthropic's own canonical 4.x prompting doc explicitly endorses the steering shape Pattern D was already converging on: `"if you find that the model is not using your web search tools, clearly describe why and how it should."` That sentence is the doctrinal anchor — Pattern D's four class blocks should each be a concrete answer to "why and how" for one question class. Combined with the doc's literalism warning (`"Claude Opus 4.7 interprets prompts more literally and explicitly than Claude Opus 4.6"`) and the dial-back-on-imperatives guidance (`"Where you might have said 'CRITICAL: You MUST use this tool when...', you can use more normal prompting like 'Use this tool when...'"`), Pattern D's research-backed style is locked: descriptive triggers + worked classification examples, no `MUST` / `NEVER` for tool steering.

Empirical regex portability for the JSONL `"name":"WebFetch"` / `"name":"WebSearch"` count assertion is confirmed on Git Bash Windows arm64 with ripgrep 14.1.0 — the pattern KCB-economics.sh already uses (`'"name":"(WebSearch|WebFetch)"'`) is the working baseline; no new escaping needed for any new web-usage gate.

**Primary recommendation:** Anchor every Pattern D class block in the verbatim Anthropic 4.x best-practices style: a one-sentence trigger ("When the question is about ..."), a one-sentence first-action commitment ("the first orient action is `WebFetch` of ..."), a one-sentence corroboration sentence (".d.ts and `node_modules` corroborate the web answer; they do not replace it"), and 1-2 worked classification examples. Reserve all-caps imperatives for genuine compliance contracts (none in Pattern D — it is steering). Set the UAT web-usage gate at `>= 1 web tool call in >= 4 of 6 sessions` as the deliberate baseline, with `>= 5/6` as a planner option once reshaped prompts are drafted. Extend `tally.mjs` with a `web_uses` metric column (cheaper and more portable than a new `rg`-based assertion).

## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01 — Pattern D taxonomy (4-class, spirit-honoring):**
1. **Type-symbol existence** (does symbol X exist in the typed contract for the installed version?) → read the local `.d.ts` first. The `.d.ts` IS the typed contract for the exact installed version, more authoritative than docs that may lag. WebFetch is corroborating evidence, not the only source.
2. **API currency / configuration / recommended pattern** (what is the documented behavior / current best practice?) → `WebFetch` of the official source first. The library's homepage, GitHub README, current-version docs are valid first-fetch targets. Local files corroborate the web answer; they do not replace it.
3. **Migration / deprecation** (was X removed, deprecated, or replaced between versions?) → `WebFetch` of release notes or migration guides first. The `CHANGELOG.md` / GitHub releases / migration-guide pages decide. `.d.ts` shows the current shape but does not show what was removed.
4. **Language semantics** (how does the language itself behave?) → empirical compile / run first (build the example, observe the error) OR `WebFetch` the language spec. `node_modules` archaeology is the wrong source for language-level questions.

**D-02 — Pattern D location:** New shared reference file `plugins/lz-advisor/references/orient-exploration.md`. The four SKILL.md files each gain a single `@`-load line inside the existing `<orient_exploration_ranking>` block; Pattern B inline prose stays. `references/context-packaging.md` Rule 5 gains a one-line cross-reference.

**D-03 — Pattern D phrasing:** Descriptive triggers + 1-2 worked classification examples per class + a single positive directive. No `MUST` / `REQUIRED` / `NEVER` for tool-use steering; reserve all-caps imperatives for compliance only (none in Phase 6). Anchored in three Sonnet-4.6 / Opus-4.7 prompting-research findings (R-01).

**D-04 — Validation approach:** Full 6-session UAT replay (Phase 5.6 Plan 07 pattern) against plugin 0.8.5. Phase 5.4 Compodoc/Storybook scenario preserved as regression baseline; six prompts (S1..S6) RESHAPED in place to classify unambiguously into a target Pattern D web-first class:
  - S1 (`/lz-advisor.plan`): API-currency framing on Storybook 10.x docs configuration
  - S2 (`/lz-advisor.execute`): migration / deprecation framing on `setCompodocJson` removal between Storybook 9 → 10
  - S3 (`/lz-advisor.review`): API-currency framing on alignment with Storybook 10.x current docs
  - S4 (`/lz-advisor.plan`): migration / deprecation framing on Nx Compodoc generator currency in 2026-Q1
  - S5 (`/lz-advisor.execute`): language-semantics framing on TS dynamic-import behavior at compile time
  - S6 (`/lz-advisor.security-review`): API-currency framing on `@compodoc/compodoc` supply-chain status

  All four existing smoke tests re-run as part of the verification gate. Per-skill D-11 thresholds carry forward verbatim from Phase 5.5 D-11 / Phase 5.6 D-12 (plan / review / security-review ≤1 advisor call; execute ≤2). UAT trace gated on **non-zero `WebFetch` / `WebSearch` tool_use events** (default ≥1 web tool call in ≥4 of 6 sessions). S2 Bun-crash exemption inherits Phase 5.5 D-11 / Phase 5.6 verbatim.

**D-05 — KCB-economics treatment:** `KCB-economics.sh` assertions stay intact. The script re-runs as part of the Phase 6 verification gate and must report `[OK]` on Findings K + C + B. Pattern D + the reshaped UAT prompts are the closure mechanism — no taxonomy update to the script.

**D-06 — Plugin version:** Bump 0.8.4 → 0.8.5 (SemVer patch). Applies to `plugins/lz-advisor/.claude-plugin/plugin.json` and the four SKILL.md `version:` frontmatter fields.

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

### Deferred Ideas (OUT OF SCOPE)

- **README "Recommended prompt shape" section** — deferred from Phase 5.5 / 5.6, deferred again. Phase 6 reshapes UAT prompts privately; user-facing prompt-shape guidance is a polish phase concern.
- **Pattern D as a `claude -p` linter / pre-flight check** — Phase 6 has no automated mechanism for users to verify their prompts classify cleanly into one of Pattern D's four classes.
- **Fifth catch-all class in Pattern D** — defer unless reshaped UAT prompts reveal cases where the four classes don't fit cleanly. Current Pattern B step 5 ("name the gap explicitly in Findings") is the safety net.
- **Smoke-test extension for per-class coverage** — Phase 6's web-usage gate is a single `>=1 in >=4 of 6` aggregate threshold. Defer per-class assertions unless aggregate gate proves insufficient.
- **Retroactive extraction of Pattern A + B to shared reference** — Phase 6 keeps Patterns A / B inline (D-02). A future polish phase may revisit once Pattern D's shared-ref pattern proves stable.
- **`maxTurns` cap removal or SendMessage-based bidirectional advisor** — architectural change, deferred since Phase 5.3 / 5.4 / 5.5 / 5.6.
- **Pro / Free plan tier UAT cross-tier verification** — structurally impossible from Team subscription.
- **KCB-economics.sh extension for `.d.ts` reads as Pre-Verified Claim source** — D-05 explicitly chose NOT to loosen KCB.
- **Plugin README update for Pattern D** — out of Phase 6 scope. Pattern D is an internal orient-phase refinement.

## Phase Requirements

> Phase 6 has no formal REQ-IDs in REQUIREMENTS.md (the v1 traceability table maps requirements to Phases 1-4; Phase 6 is calibration-only beyond v1). The phase requirement set is the CONTEXT.md `<decisions>` block, which D-01..D-06 enumerate as the de-facto contract.

| ID | Description | Research Support |
|----|-------------|------------------|
| D-01 | Pattern D 4-class taxonomy | R-01 anchors phrasing in Anthropic prompting docs; § Sonnet 4.6 prompt-steering quotes confirm descriptive-trigger + few-shot pattern is canonical [VERIFIED: Anthropic best-practices doc] |
| D-02 | Pattern D in `references/orient-exploration.md`, `@`-loaded from 4 SKILL.md | Existing references/advisor-timing.md + references/context-packaging.md already use this pattern (verified by `git grep`) [VERIFIED: codebase grep] |
| D-03 | Descriptive triggers + worked examples + selective imperatives | Verbatim quote from Anthropic best-practices: `"if you find that the model is not using your web search tools, clearly describe why and how it should"` [CITED: platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices § Tool use triggering] |
| D-04 | 6-session UAT replay against plugin 0.8.5 with reshaped prompts; 4 smoke tests + web-usage gate | UAT runner shape from Phase 5.6 Plan 07 (`run-all.sh`, `run-session.sh`, `tally.mjs`) verified present and reusable [VERIFIED: codebase Read] |
| D-05 | KCB-economics.sh re-run as gate signal, no script change | Existing `'"name":"(WebSearch|WebFetch)"'` regex confirmed working on Git Bash Windows arm64 with rg 14.1.0 [VERIFIED: empirical rg test 2026-04-28] |
| D-06 | Plugin version bump 0.8.4 → 0.8.5 across `plugin.json` + 4 SKILL.md | All 5 surfaces verified at 0.8.4 in current main; bump pattern matches Phase 5.6 D-13 SemVer convention [VERIFIED: codebase Read] |

## Project Constraints (from CLAUDE.md)

> Project CLAUDE.md (lz-advisor-claude-plugins/CLAUDE.md) — directives apply to Phase 6 plan execution. Highest-priority constraints listed first.

| Constraint | Source | How Phase 6 Honors |
|------------|--------|---------------------|
| ASCII-only in all output (no emoji, em-dashes, curly quotes, bullet `•`) | Global CLAUDE.md "Never use emojis, Unicode box-drawing, or non-ASCII symbols" | The new `references/orient-exploration.md`, all reshaped prompts, all session-notes, and tally.txt must be ASCII-only. Phase 5.6 Plan 07 already verified this constraint (zero non-ASCII in `context-packaging.md`); Phase 6 inherits the same gate. |
| Use `git grep` first for tracked files; `rg -uu` for gitignored / `node_modules` | Global CLAUDE.md "Content Search (Windows arm64)" | All Pattern D existence checks (e.g., "no Plan 05 bullet residuals") use `git grep`; any UAT trace inspection uses `rg` directly. Never `grep`. |
| Never `git add .` / `git add -A` / `git add -u`; stage specific files by name | Global CLAUDE.md "Git rules" | All Phase 6 plan commits stage explicit file lists. |
| `git mv` for moving / renaming tracked files | Global CLAUDE.md "Git rules" | No moves expected in Phase 6 (only adds + edits + version bumps). |
| Never write multi-line content via heredocs / echo; use Write tool | Global CLAUDE.md "Shell rules" | The new `references/orient-exploration.md` and reshaped prompts must be created via the Write tool, not `cat <<EOF`. |
| Avoid `cd <path> &&` prefix; rely on Bash tool's persistent cwd OR use absolute paths | Global CLAUDE.md "Shell rules" | UAT runner scripts (`run-all.sh`) already follow this pattern (one explicit `cd "$NGX_DIR"` near the top). |
| Avoid backticks / `$(...)` / `$VAR` inside `-e` / `-c` flags wrapped in double quotes | Global CLAUDE.md "Shell rules" | Phase 6 has no inline `node -e` / `python -c` needs; tally.mjs is a separate file invoked via `node tally.mjs`. |
| RTK prefix on git / build / file commands | Global CLAUDE.md "RTK Token Killer" | `rtk git status`, `rtk git diff`, `rtk git log`, `rtk git commit` — apply consistently across plan commits. UAT runner shell scripts run unaltered (third-party `claude -p` invocation, not RTK-wrappable). |
| GSD workflow: never edit outside `/gsd-quick`, `/gsd-debug`, `/gsd-execute-phase` | Project CLAUDE.md GSD enforcement | Phase 6 work happens through `/gsd-execute-phase` after planning is complete. |
| Skill verification via `claude -p` non-interactive CLI | Project CLAUDE.md "Skill Verification with `claude -p`" | UAT replay uses the canonical `claude --model sonnet --effort medium --plugin-dir plugins/lz-advisor -p "/lz-advisor.<skill> ..." --verbose --output-format stream-json` invocation (already encoded in `run-session.sh`). |
| Spawn researcher agents with explicit fetch fallback chain | Global CLAUDE.md "Spawning researcher agents" | Phase 6 has no further spawned researchers expected. If a researcher is spawned for a sub-question, the prompt must paste the markdown.new → WebFetch → url-to-markdown → playwright-cli chain verbatim. |
| `code.claude.com` / `docs.claude.com` blocked for WebFetch | Global CLAUDE.md "Fetch" | Phase 6 cited `docs.claude.com/...` URLs were redirected to `platform.claude.com/...` and fetched there successfully (verified during this research). The redirect is the cue to follow when WebFetch returns 302. |
| User memory: "Web tool usage must be observable" — empirical contract, not preference | MEMORY.md `feedback_web_tool_usage_must_be_observable.md` | Phase 6's web-usage gate is the direct codification of this contract. The `tally.mjs` `web_uses` metric column is the observability surface. |

## Standard Stack

> Phase 6 ships only Markdown + YAML edits to the plugin tree plus Bash/Node test infrastructure under `.planning/`. No new npm dependencies, no new runtime stack — Phase 6 reuses Phase 5.6 Plan 07's runner shape verbatim.

### Core (already installed, verified 2026-04-28)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ripgrep (`rg`) | 14.1.0 (rev e50df40a19) | JSONL trace pattern matching for the web-usage gate | Already used by all four smoke tests; arm64-native for `rg -uu`; the only available content-search tool per CLAUDE.md (grep tool DENIED on this machine). |
| Node.js | v24.13.0 | `tally.mjs` execution; `extract-advisor-sd.mjs` for DEF-response-structure | Already on PATH via fnm; ESM-friendly (`.mjs`); zero install. |
| Bash (Git Bash) | shipped with Git | UAT runner scripts; smoke test scripts | The Bash tool is the canonical shell invocation surface; all Phase 5.4 → 5.6 smoke tests run here. |
| `claude` CLI | (Claude Code Team Plan) | Non-interactive UAT session invocation per `--plugin-dir` + `-p` + `--output-format stream-json` | Required by D-08 / Phase 5.5 Plan 06 invocation pattern. |
| `git grep` | shipped with Git | Tracked-file existence assertions | Per CLAUDE.md "Content Search" — primary search tool, ~2.5x faster than `rg`. |

### Supporting (no new files needed; reuse Phase 5.6 Plan 07 artifacts)

| Asset | Source | Purpose | When to Use |
|-------|--------|---------|-------------|
| `run-all.sh` | `.planning/phases/05.6-.../uat-plan-07-rerun/run-all.sh` | 6-session sequential runner with pre-flight slash-prefix assertion | Copy verbatim to `.planning/phases/06-.../uat-pattern-d-replay/run-all.sh`; update `RUN_DIR` constant only. |
| `run-session.sh` | Same parent dir | Single-session runner | Same — copy with `RUN_DIR` constant updated. |
| `tally.mjs` | Same parent dir | JSONL trace metrics aggregator (Session/Turns/Sec/Cost/Adv/Tools/SD/Crit/Assum/Find/CCP/TP/Err) | Copy with `base` constant updated to Phase 6 traces dir; **extend** with a `web_uses` metric column counting `tool_use` events where `name === 'WebFetch' || name === 'WebSearch'`. ~5-line addition. |
| `KCB-economics.sh` | `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/KCB-economics.sh` | Findings K (web-tool usage) + C (Pre-Verified section) + B (`<pre_verified>` block) | Re-run unchanged on plugin 0.8.5 per D-05. |
| `DEF-response-structure.sh` | Same dir | Findings D (no Critical) + E (literal Assuming frame) + F (reviewer slots) + G+H (security-reviewer slots) + word-budget + I (frame count ≥2) | Re-run unchanged on plugin 0.8.5. |
| `HIA-discipline.sh` | Same dir | Findings H (no permission prompts) + I (graceful degradation) + A (D-14 reword) | Re-run unchanged. |
| `J-narrative-isolation.sh` | Same dir | Finding J (review scope from git, not narrative) | Re-run unchanged. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Extending `tally.mjs` with `web_uses` column | New `L-pattern-d-coverage.sh` smoke test | New shell script duplicates the JSONL parsing tally.mjs already does. Extending tally is cleaner: one place to count, one place to assert. |
| `rg` for the web-usage gate inside a smoke script | `node tally.mjs --check-web-uses` | rg is already verified portable for this exact pattern (see § Pitfall 3 below); both work. The shell-script path matches existing KCB shape; the tally-extension path centralizes metrics. Recommend tally-extension for canonical aggregation, but a shell-only `rg -c` assertion is acceptable. |
| Reshaping prompts in place under `uat-pattern-d-replay/prompts/` | Editing the Phase 5.4 originals | T-05.5-13 mitigation pattern: never edit Phase 5.4 sources in place; copy-and-edit preserves regression baseline. Phase 6 inherits this convention. |

**Installation:** None required. All tools verified present.

**Version verification (2026-04-28):**

```bash
node --version       # v24.13.0
rg --version         # ripgrep 14.1.0 (rev e50df40a19)
git --version        # ships with Git for Windows; not version-pinned for this phase
```

## Architecture Patterns

### Recommended Phase 6 Directory Structure

```
.planning/phases/06-address-phase-5-6-uat-findings/
├── 06-CONTEXT.md                          # already present
├── 06-DISCUSSION-LOG.md                   # already present
├── 06-RESEARCH.md                         # this file
├── 06-VALIDATION.md                       # written by gsd-planner per Nyquist
├── 06-{01..N}-PLAN.md                     # one per plan
├── 06-{01..N}-SUMMARY.md                  # one per plan after execute
├── 06-VERIFICATION.md                     # final phase-gate report
└── uat-pattern-d-replay/                  # mirrors Phase 5.6's uat-plan-07-rerun/ shape
    ├── run-all.sh                         # copied from Phase 5.6 Plan 07; RUN_DIR updated
    ├── run-session.sh                     # copied; RUN_DIR updated
    ├── tally.mjs                          # copied + extended with web_uses column
    ├── prompts/
    │   ├── session-1-plan.txt             # API-currency reshape (S1)
    │   ├── session-2-execute.txt          # migration / deprecation reshape (S2)
    │   ├── session-3-review.txt           # API-currency reshape (S3)
    │   ├── session-4-plan.txt             # migration / deprecation reshape (S4)
    │   ├── session-5-execute.txt          # language-semantics reshape (S5)
    │   └── session-6-security-review.txt  # API-currency reshape (S6)
    ├── traces/
    │   ├── session-1.jsonl                # written by run-all.sh
    │   └── ... (2..6)
    ├── tally.txt                          # tally.mjs output
    └── session-notes.md                   # narrative + S2 Bun-crash convention
```

```
plugins/lz-advisor/
├── .claude-plugin/
│   └── plugin.json                        # version: 0.8.4 → 0.8.5
├── references/
│   ├── advisor-timing.md                  # unchanged
│   ├── context-packaging.md               # Rule 5 gains 1-line cross-ref to orient-exploration.md
│   └── orient-exploration.md              # NEW; ~400-600 words; 4 class blocks
└── skills/
    ├── lz-advisor.plan/SKILL.md           # version 0.8.5; @-load line added inside <orient_exploration_ranking>
    ├── lz-advisor.execute/SKILL.md        # same edits
    ├── lz-advisor.review/SKILL.md         # same edits
    └── lz-advisor.security-review/SKILL.md # same edits
```

### Pattern 1: Pattern D — descriptive-triggers + worked-examples class block

**What:** Each of Pattern D's four class blocks follows the same micro-shape, anchored in Anthropic's own production prompting style (R-01).

**When to use:** Each Pattern D class block in `references/orient-exploration.md`. Apply the same shape four times (one per class).

**Source-anchored shape:**

```markdown
### Class N: <Name> (<one-phrase intent>)

When the question is about <trigger condition>, the first orient action
is <named first action with concrete tool>. <One-sentence rationale anchored
in why this source is the right contract for this question class>.

<One-sentence corroborating-evidence sentence: where the supplementary sources fit>.

Example. Question: <quoted realistic question from the Compodoc/Storybook scenario>.
Class: <name>, because <one-clause reason naming the trigger condition>.
First action: <named first action with concrete URL or path shape>.

Example. Question: <second realistic question, optional but recommended for the load-bearing classes 2 and 3>.
Class: <name>, because <one-clause reason>.
First action: <named first action>.
```

**Anchor quotes (R-01):**

> "if you find that the model is not using your web search tools, clearly describe why and how it should." [CITED: platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices § Tool use triggering]

This sentence is the doctrinal mandate: each class block's first-action sentence is the "how"; the trigger condition is the "why."

> "Tell Claude what to do instead of what not to do" — `"Instead of: 'Do not use markdown in your response'; Try: 'Your response should be composed of smoothly flowing prose paragraphs.'"` [CITED: best-practices doc § Control the format of responses]

Pattern D's first-action sentences are positive ("the first orient action is `WebFetch` of release notes"), not negative ("do NOT search node_modules first"). Already mandated by D-03; verbatim Anthropic-doc support cited.

> "Use examples effectively. Examples are one of the most reliable ways to steer Claude's output format, tone, and structure. A few well-crafted examples (known as few-shot or multishot prompting) can dramatically improve accuracy and consistency." [CITED: best-practices doc § Use examples effectively]

The 1-2 worked classification examples per class are the few-shot lever. Recommendation: 1 example for the unambiguous classes (Class 1, 4); 2 examples for the load-bearing classes (Class 2, 3) — these are the classes the executor most often misclassifies given the Plan 07 UAT evidence.

> "Where you might have said 'CRITICAL: You MUST use this tool when...', you can use more normal prompting like 'Use this tool when...'." [CITED: best-practices doc § Tool usage]

Pattern D uses "When the question is about ..., the first orient action is ..." — declarative-imperative-natural, not all-caps-imperative. The dial-back guidance directly underwrites D-03's no-`MUST`-for-tool-steering rule.

### Pattern 2: Two-stage verification (smoke → 6-session UAT replay)

**What:** Phase 5.6's three-stage structure (forward-capture → fix-validation smoke → 6-session UAT replay) simplifies to two-stage in Phase 6 because Phase 6 has no diagnostic forward-capture step (the gap is already named, the fix shape is locked).

**When to use:** As the canonical Phase 6 verification gate ordering. The planner enforces this sequence in `06-VERIFICATION.md`.

**Stages:**

| Stage | What | Cost | Gate |
|-------|------|------|------|
| **Stage 1: Smoke** | Run all four existing smoke tests on plugin 0.8.5: `KCB-economics.sh`, `DEF-response-structure.sh`, `HIA-discipline.sh`, `J-narrative-isolation.sh`. Optionally a new `L-` smoke if planner picks the shell-script-assertion path for the web-usage gate (otherwise extend `tally.mjs`). | ~$3-5 (each smoke is one or two `claude -p` invocations) | All scripts exit 0 with `[OK]` on every assertion. KCB-economics.sh K + C + B all `[OK]` is the load-bearing signal that Pattern D + reshaped prompts work. |
| **Stage 2: 6-session UAT replay** | Run reshaped prompts S1..S6 via `claude -p` against plugin 0.8.5 in the `ngx-smart-components` worktree. Aggregate via `tally.mjs` (extended with `web_uses` column). | ~$5-10 (6 sessions × ~$1-2 each per Plan 07 baseline) | Per-skill D-11 thresholds (plan / review / security-review ≤1 advisor call; execute ≤2). New web-usage gate: `web_uses ≥ 1` in `≥ 4 of 6` sessions (recommended baseline; planner may tighten to `≥ 5/6`). S2 Bun-crash exemption inherits Phase 5.5 D-11 / Phase 5.6. |

**Order of operations:**

1. Stage 1 must pass before Stage 2 spend is committed. If KCB-economics fails, Pattern D is empirically broken — halt, diagnose, do not run Stage 2.
2. Stage 2 produces `tally.txt` + `session-notes.md`; planner records before/after delta vs Plan 07's `tally.txt` baseline (zero web tool calls).
3. `06-VERIFICATION.md` covers both stages plus the Plan 07 baseline delta.

### Pattern 3: Reshaped prompt class assignment (R-02 anchor)

**What:** Each S1..S6 reshaped prompt opens with the canonical `/lz-advisor.<skill>` slash prefix (T-05.5-15 invariant), names the version-aware question, and explicitly invites the executor to consult web sources. The shape is sufficient for Pattern D classification without being a tutorial.

**When to use:** When composing each of `prompts/session-{1..6}-<skill>.txt` per D-04.

**Shape:**

```
/lz-advisor.<skill> <One-sentence task verb naming the deliverable>. <Version-aware question or assertion that triggers Pattern D's target class>. <Optional follow-up sentence with verification cue, e.g., "Storybook released v10 in late 2025 — check the docs.">
```

**Why this shape:** The Plan 07 traces showed zero web-tool usage on prompts that DID inline an authoritative source block (Phase 5.4 / 5.6 prompts had Nx docs pasted in). Pattern B's `<context_trust_contract>` correctly fires on those — the inlined source IS the contract. Phase 6 reshaped prompts deliberately strip the inlined-docs block (or include only project-side hints) so that Pattern D's web-first first-action sentence becomes the primary cue, not Pattern A's context-trust contract.

### Anti-Patterns to Avoid

- **`MUST WebFetch` / `NEVER read .d.ts first` for tool steering.** Direct contradiction of Anthropic's `"more normal prompting like 'Use this tool when...'"` guidance. Triggers the over-correction failure mode the best-practices doc warns about: `"Claude Opus 4.5 and Claude Opus 4.6 are also more responsive to the system prompt than previous models. If your prompts were designed to reduce undertriggering on tools or skills, these models may now overtrigger."` Pattern D MUST NOT contain `MUST` / `NEVER` / `CRITICAL` for the four class blocks themselves. Reserve all-caps for the existing `<context_trust_contract>` compliance language (which is already calibrated and out of Phase 6 scope).
- **Five or more classes in Pattern D.** The Plan 07 evidence supports four classes (the executor's failure modes cluster at 2-3 of these). Adding a fifth catch-all class invites the executor to default to it, defeating Pattern D's purpose. Per the deferred-ideas list, the safety net is the existing Pattern B step 5 ("name the gap explicitly in Findings"); Phase 6 D-01 endorses 4-classes-exhaustive.
- **Inline Pattern D in all four SKILL.md files.** Direct conflict with D-02 (single shared reference, `@`-loaded). Inline duplication invites the same drift Phase 5.6 Plan 06 / 07 just resolved for Pattern A / B (those stayed inline only because the canon was already settled byte-identically — Pattern D is new and ships once via the shared ref).
- **Reshaping prompts to game the gate.** If a reshaped prompt is so leading that the executor has nowhere to go but `WebFetch` ("WebFetch the Storybook 10.x release notes and report back"), the gate measures prompt rewriting, not Pattern D. Reshaped prompts must still produce useful work AND remain plausible as something a real user would ask. R-02 mandates "the reshaped prompts must still produce useful work."
- **Editing Phase 5.4 prompt source files in place.** T-05.5-13 mitigation: regression-baseline preservation requires the originals at `.planning/phases/05.4-address-uat-findings-a-k/uat-5-compodoc-run/prompts/` stay untouched. Phase 6's reshaped versions live at `.planning/phases/06-.../uat-pattern-d-replay/prompts/`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Counting `WebFetch` / `WebSearch` events in JSONL | Hand-rolled bash loop with `jq` per-line + counter | Extend `tally.mjs` (existing JSONL parser already iterates every assistant content block; adds ~5 lines of code) OR `rg -c '"name":"(WebSearch|WebFetch)"'` (already verified portable; KCB-economics.sh line 29 baseline). | tally.mjs already parses the same JSONL the new gate inspects; one parse pass is cheaper than two. `rg -c` is the simpler shell-only fallback. Both are simpler than handcrafting jq pipelines. |
| Validating that S1..S6 reshaped prompts open with the canonical slash prefix | New custom validator script | Reuse the pre-flight assertion from `run-session.sh` lines 14-18: `head -3 "$PROMPT_FILE" \| rg -q '^[/]lz-advisor\\.'`. Already encoded; T-05.5-15 invariant. | One source of truth for the slash-prefix invariant; `run-all.sh` aborts the session early if missing. |
| Detecting whether a Pattern D class assignment is unambiguous | LLM-assisted classifier or per-class regex matching the prompt body | Manual planner classification per R-02 mandate: "before running the UAT, mentally classify each reshaped prompt against the four-class taxonomy in D-01 and verify the assigned class matches." | The planner has full Pattern D context; an automated classifier would need exactly the same Pattern D taxonomy and would just defer the manual judgment one step. Manual classification at planning time is canonical. |
| Generating session-notes.md narratively | Custom report template | Copy the Phase 5.6 Plan 07 `AUTONOMOUS-UAT.md` shape (frontmatter + Execution Summary table + Plan 07 Gap-Closure Validation sections + Tool-Use Breakdown + Comparison to Plan 04 Baseline + per-test verdict). | Already validated as the canonical session-notes shape; user has read this format multiple times. |
| `claude -p` invocation parameters | Hand-tuning each session's flags | Reuse the `run-session.sh` invocation block verbatim (D-08 / Phase 5.5 Plan 06 contract): `--model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" --dangerously-skip-permissions -p "$PROMPT" --verbose --output-format stream-json`. | All flags load-bearing per D-08; one source of truth across phases. |

**Key insight:** Phase 6 is a calibration phase, not a feature phase. The cardinal rule is **inherit Phase 5.6 Plan 07's runner shape and metrics infrastructure verbatim, change only what Pattern D + reshaped prompts demand**. Most of Phase 6's "new code" is one new reference file plus prompt rewrites — the test infrastructure is already built.

## Common Pitfalls

### Pitfall 1: `<context_trust_contract>` overrides Pattern D when source is inlined

**What goes wrong:** A reshaped prompt that includes any pasted documentation block (Storybook release notes, Nx guide, migration notes) triggers Pattern A's `<context_trust_contract>`. Pattern A explicitly says: `"WebFetch and WebSearch against the same library are out of scope for the same reason -- the source is already in context."` The executor obeys Pattern A, skips Pattern D's web-first first-action sentence, and the web-usage gate fails.

**Why it happens:** Pattern A and Pattern D address different orient phases. Pattern A handles "user pasted authoritative source"; Pattern D handles "executor must decide where to look first." When both fire, Pattern A wins (it is the higher-priority gate per the SKILL.md prose: `"When such a block is present, treat its content as ground truth ... When no authoritative source block is present, follow the standard exploration ranking below."`)

**How to avoid:** Reshaped prompts MUST NOT include large pasted documentation blocks. Reshape S1, S3, S6 (originally Nx-docs-inlined) to pose the question framing only — let the executor `WebFetch` the docs themselves. This is the direct mechanism by which Pattern D wins over the executor's local-`.d.ts`-first heuristic in Plan 07.

**Warning signs:** Pre-Pattern-D-UAT, run a quick manual classification: does the reshaped prompt contain a `---` block, a `<fetched>` tag, or a code-fenced documentation excerpt? If yes, the prompt will trigger Pattern A, not Pattern D. Strip the inlined source.

### Pitfall 2: S5 (language-semantics, dynamic-import) classifies into both empirical-compile and `WebFetch`-spec

**What goes wrong:** Pattern D Class 4 says: `"empirical compile / run first ... OR WebFetch the language spec."` This is genuinely ambiguous; the executor may pick whichever is cheaper. If the executor runs `tsc --noEmit` and gets a clean answer, no WebFetch fires for S5, and the per-session web-usage gate fails for S5 (one of six required hits if threshold is `≥ 5/6`).

**Why it happens:** Class 4 is structurally different from Classes 1, 2, 3. Empirical compile is often cheaper than spec fetch for language-semantics questions, and Pattern D D-01 endorses this OR.

**How to avoid:** Set the web-usage gate threshold at `≥ 1 in ≥ 4 of 6 sessions` (CONTEXT.md recommended baseline) rather than `≥ 5 of 6`. Five web-first-class sessions exist in D-04's assignment (S1, S2, S3, S4, S6); S5 is allowed to use empirical compile per Pattern D Class 4. The `≥ 4/6` threshold tolerates one of those five also using local-first heuristic without failing the gate. Document the trade-off explicitly in `06-VERIFICATION.md` Section 2.

**Warning signs:** Plan 07 baseline shows zero web tool calls across all six sessions. If Phase 6 lands at 2-3 of 6 sessions with web tool calls, Pattern D moved the needle but not enough — diagnostic-only run, not yet a pass; the planner should examine which sessions still skipped web and whether the reshaped prompt for those sessions has Pitfall 1 (inlined source).

### Pitfall 3: `rg` regex portability on Git Bash Windows arm64 (R-03)

**What goes wrong:** A new web-usage assertion using a regex pattern that works in PCRE / GNU grep but not in `rg`'s Rust regex dialect would silently return zero matches and falsely report "no web tool use" — the same failure mode Phase 5.5 R-02 had to debug.

**Why it happens:** `rg` uses Rust regex (default) or PCRE2 (with `-P`). Default Rust regex supports `\d`, `\w`, escaped parens, escaped periods, alternation `(a|b)`, and standard character classes. It does NOT support lookahead / lookbehind without `-P` (and Chocolatey x86_64-on-arm64 emulation may have flaky PCRE2). Backslash-double-quote escaping inside Bash double-quoted strings is fragile.

**How to avoid (verified empirically 2026-04-28):** The pattern KCB-economics.sh already uses works exactly as-is for Phase 6's needs:

```bash
rg -q '"name":"(WebSearch|WebFetch)"' "$TRACE_FILE"
```

Empirical verification (2026-04-28, Git Bash, ripgrep 14.1.0):

```bash
$ printf '{"type":"tool_use","name":"WebFetch","input":{}}\n{"type":"tool_use","name":"Read"}\n' \
    | rg -c '"name":"(WebSearch|WebFetch)"'
1
```

Match count: 1 (correct — one WebFetch event in the input). The literal-frame regex from DEF-response-structure.sh `^[0-9]+\. Assuming .+ \(unverified\), do .+\. Verify .+ before acting\.` also passed an empirical match test.

**Recommendation:** Reuse the KCB-economics line 29 pattern. If Phase 6 adds a new shell-only smoke (e.g., `L-pattern-d-coverage.sh`), use the same single-quoted alternation pattern. Do not switch to PCRE2 (`-P`) — no need.

**Warning signs:** A `rg -c` returning 0 against a JSONL trace that visibly contains `"name":"WebFetch"` strings. Cross-check with `rg -F "WebFetch" "$TRACE"` (fixed-string) to confirm the issue is the regex, not absence of data. If literal-string match returns hits but the alternation pattern returns zero, escape the parens differently (e.g., switch to two `rg -c` calls + sum) — but this should not be necessary on the verified ripgrep 14.1.0 on Git Bash Windows arm64.

### Pitfall 4: tally.mjs hardcoded `base` path

**What goes wrong:** `tally.mjs` line 4 hardcodes `const base = 'D:/projects/.../uat-plan-07-rerun/traces';`. If Phase 6 copies tally.mjs verbatim and forgets to update `base`, the metrics report counts Phase 5.6 Plan 07 traces (zero web tool calls), not Phase 6 reshaped-prompt traces. Hidden gate failure: tally reports "no web uses" because it parsed the wrong directory.

**Why it happens:** Path is hardcoded for arm64-on-Windows path-syntax simplicity (no env-var thrash). Phase 5.6 Plan 07 inherited this from Phase 5.5; Phase 6 inherits it again.

**How to avoid:** When copying `tally.mjs` to `.planning/phases/06-.../uat-pattern-d-replay/tally.mjs`, change the `base` constant on line 4 in the SAME edit. Alternatively (Claude's discretion per CONTEXT.md), accept a path argument: `const base = process.argv[2] || 'D:/.../traces';`. If the planner chooses the path-argument path, document in 06-VERIFICATION.md so future phases inherit the convention.

**Warning signs:** `tally.txt` reports values that exactly match Phase 5.6 Plan 07 baseline (e.g., S2=39 tools, S5=31 tools). Phase 6 traces will produce different counts unless something is wrong.

### Pitfall 5: `claude -p` stdout vs JSONL turn-shape mismatch (Shape 3 lesson)

**What goes wrong:** Phase 5.6 Plan 02 discovered that `claude -p` stdout surfaces only the FINAL assistant turn; intermediate turns (including the advisor's verbatim Strategic Direction echo from the executor in Phase 3) land in JSONL but not stdout. A web-usage gate that searched stdout for `"name":"WebFetch"` would always return zero.

**Why it happens:** Stream-json output (`--output-format stream-json`) is the only mode that preserves intermediate `tool_use` events; default text mode collapses them.

**How to avoid:** The KCB-economics.sh / Plan 07 / Phase 6 invocation already uses `--output-format stream-json` and writes stream-json to a file:

```bash
claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  -p "$PROMPT" \
  --verbose --output-format stream-json > "$TRACE_FILE" 2>&1
```

The web-usage assertion runs against `$TRACE_FILE` (the stream-json file), not against any stdout-only artifact. tally.mjs already parses stream-json correctly — same lesson, already encoded.

**Warning signs:** A web-usage assertion that runs against `$OUT` from a non-`--output-format stream-json` invocation. None of the existing smoke tests have this issue (KCB / DEF / HIA / J all set `--output-format stream-json` or assert against the stdout-style file produced by the default invocation specifically for the assertion they make).

## Code Examples

### Example 1: Pattern D class block (Class 2 — API currency)

> Verified shape anchor: Anthropic best-practices doc § Tool use triggering + § Use examples effectively.

```markdown
### Class 2: API currency / configuration / recommended pattern

When the question is about the library's documented behavior, recommended
configuration, or the current best practice for an integration, the first
orient action is `WebFetch` of the official source. The library's homepage,
GitHub README, current-version docs, and migration guides are the contracts
the maintainers publish; local files and `node_modules` show what is installed,
not what the library currently recommends.

Local project reads (project.json, package.json, .storybook/main.ts, src/**)
and `.d.ts` corroborate the web answer; they do not replace it.

Example. Question: "What is the current recommended approach for Storybook
10.x docs configuration in an Nx Angular library?" Class: API currency,
because the question asks for the documented current best practice. First
action: `WebFetch` of https://storybook.js.org/docs/configure or the matching
10.x docs URL.

Example. Question: "How should the Nx Compodoc generator be configured for
2026-Q1 Storybook?" Class: API currency, because the question asks for the
documented current pattern. First action: `WebFetch` of the Nx docs page for
the Compodoc generator at the current Nx version.
```

> Verified anchor (best-practices doc § Tool use triggering): "if you find that the model is not using your web search tools, clearly describe why and how it should." Each class block is the literal "why and how" answer for one class.

### Example 2: Reshaped UAT prompt (S2 — migration / deprecation)

```
/lz-advisor.execute Implement the Compodoc integration for this Nx Angular library. Note: `setCompodocJson` may have been removed between Storybook 9 and 10 — check the migration guide before proceeding. Commit each completed step atomically.
```

**Why this shape:**
- Slash prefix on line 1 (T-05.5-15 invariant pre-flight assertion passes).
- Task verb is "Implement the Compodoc integration" — produces useful work, not gate-gaming.
- "may have been removed between Storybook 9 and 10" is the migration / deprecation cue (Pattern D Class 3) — version-aware existence question; `.d.ts` cannot show what was removed.
- "check the migration guide before proceeding" is the explicit corroborating-evidence cue per Pattern D Class 3 first-action sentence.
- "Commit each completed step atomically" inherits Phase 5.4 Plan 07 commit-discipline.
- No inlined Nx docs, no `---` block, no `<fetched>` tag — Pattern A `<context_trust_contract>` does NOT fire; Pattern D Class 3 first-action wins.

### Example 3: tally.mjs `web_uses` extension (~5 lines)

```javascript
// Inside the per-line tool_use loop in tally.mjs:
if (c.type === 'tool_use') {
  tools++;
  toolBreakdown[c.name] = (toolBreakdown[c.name] || 0) + 1;

  if (c.name === 'Agent' || c.name === 'Task') {
    advisor++;
  }

  if (c.name === 'WebFetch' || c.name === 'WebSearch') {
    webUses++;            // <-- new counter
  }
}

// In the rows.push() call, add:
rows.push({
  session: n,
  // ... existing fields ...
  webUses,                // <-- new field
});

// In the header line, add column:
console.log('Session\tTurns\tSec\tCost\tAdv\tWeb\tTools\tSD\t...');

// In the per-row console.log, add:
const row = [
  r.session,
  r.turns,
  r.durSec,
  '$' + r.cost.toFixed(4),
  r.advisor,
  r.webUses,              // <-- new column
  r.tools,
  // ... rest of existing fields ...
];
```

> Source: extension shape inferred from existing `tally.mjs` lines 22-50 + 95-113 (verified via Read 2026-04-28).

### Example 4: rg-based web-usage gate (alternative to tally extension)

```bash
# Inside a new L-pattern-d-coverage.sh (or appended to an existing smoke):
SESSIONS_WITH_WEB=0
for N in 1 2 3 4 5 6; do
  TRACE=".planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/traces/session-${N}.jsonl"
  if rg -q '"name":"(WebSearch|WebFetch)"' "$TRACE"; then
    SESSIONS_WITH_WEB=$((SESSIONS_WITH_WEB + 1))
  fi
done

if [ "$SESSIONS_WITH_WEB" -ge 4 ]; then
  echo "[OK] Pattern D web-usage gate: $SESSIONS_WITH_WEB / 6 sessions used WebFetch or WebSearch (>=4)"
else
  echo "[ERROR] Pattern D web-usage gate: only $SESSIONS_WITH_WEB / 6 sessions used web tools (need >=4)"
  exit 1
fi
```

> Verified anchor: `rg -q '"name":"(WebSearch|WebFetch)"' "$OUT"` is the exact pattern at `KCB-economics.sh:29`. Empirical match confirmed 2026-04-28.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single ranking-list `<orient_exploration_ranking>` (Pattern B, Phase 5.6 Plan 06 / 07) | Question-class-aware shared reference (Pattern D, Phase 6) | 2026-04-28 (Phase 6 ships) | Disambiguates four behaviorally distinct question classes; web-usage gate becomes measurable. |
| Inline Pattern A / B / C across 4 SKILL.md (Phase 5.6 Plan 06 / 07) | Inline Pattern A / B / C **plus** `@`-loaded Pattern D ref file (Phase 6) | 2026-04-28 | Eliminates 4× duplication for the new content; preserves byte-identical inline canon for Patterns A / B (no retroactive churn). |
| Phase 5.6 Plan 07 zero-web-uses baseline (`tally.txt`: 0 WebFetch / 0 WebSearch across 6 sessions) | Phase 6 web-usage gate: ≥1 in ≥4 of 6 (target) | 2026-04-28 | Makes the user's load-bearing directive ("We must see WebSearch+WebFetch usage") empirically measurable. |
| Three-stage Phase 5.6 verification (forward-capture → fix-validation smoke → 6-session UAT) | Two-stage Phase 6 verification (smoke → 6-session UAT) | 2026-04-28 | Phase 6 has no diagnostic forward-capture step (gap is named, fix is locked); simplifies sequencing. |
| Anthropic 4.x prompting best practices: published at `docs.claude.com` | Now redirected to `platform.claude.com` (302) | sometime 2025-2026 | WebFetch users must follow the redirect (Phase 6 research did this 2026-04-28). |

**Deprecated / outdated:**
- Phase 5.5 D-08 verbose-prompt nudge (only triggers on user-pasted-source-mixed-with-directive shape) is still in `lz-advisor.plan/SKILL.md` line 77 but does not conflict with Pattern D.
- Phase 5.4 D-15 stdout-pass-through contract (advisor's Strategic Direction rendered verbatim in user-visible output) still load-bearing; Phase 6 does not touch it.
- Old "Pattern B as written conflates four classes" — Phase 6 D-01 explicitly endorses keeping Pattern B inline (no retroactive surgery) while adding Pattern D as the new layer; old criticism stands as motivation, not as required fix.

## Assumptions Log

> All claims in this research were verified or cited against primary sources (Anthropic prompting docs, codebase Read tool, empirical rg / node tests). The table below is empty — no `[ASSUMED]` claims required user confirmation.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| (none) | (none — all claims verified or cited) | — | — |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

## Open Questions (RESOLVED)

> All four open questions were resolved during planning. Each question retains its analysis below; the inline `**RESOLVED:**` line under each question records the decision and the plan that locked it. No D-XX escalation needed (per checker guidance: inline RESOLVED markers are sufficient; CONTEXT.md `## Decisions` block stays under the discuss-step lock).

1. **Question:** Should `tally.mjs` add the `web_uses` column or should a new shell-only smoke script (`L-pattern-d-coverage.sh`) handle the assertion?
   - **What we know:** Both work technically. tally.mjs extension is ~5 lines; new shell script is ~30 lines but mirrors KCB-economics shape.
   - **What's unclear:** Phase convention. Phase 5.4 added new smoke scripts (KCB, DEF, HIA, J); Phase 5.5 / 5.6 extended them. Phase 6 has both options open per CONTEXT.md Claude's Discretion.
   - **Recommendation:** Extend tally.mjs (canonical aggregation, 5 lines) AND add a single trivial assertion line to `06-VERIFICATION.md` Section 2. Skip the new shell script unless the planner wants per-class assertions later (deferred per CONTEXT.md). Single source of truth for metrics; cheaper to maintain.
   - **RESOLVED:** Extend `tally.mjs` with `web_uses` column (no new shell script) per Plan 06-03 Task 2. The web-usage gate is asserted directly against the tally output in Plan 06-04 Task 2.

2. **Question:** Should the web-usage gate threshold be `≥1 in ≥4 of 6` or `≥1 in ≥5 of 6`?
   - **What we know:** Per D-04 class assignment: S1, S2, S3, S4, S6 are web-first-class (5 sessions). S5 is language-semantics, may use empirical compile per Pattern D Class 4 — legitimately not WebFetch.
   - **What's unclear:** How aggressively to enforce. Pitfall 2 documents the trade-off.
   - **Recommendation:** `≥1 in ≥4 of 6` as the BASELINE (CONTEXT.md recommended) — this gives one session of tolerance beyond S5's allowed-not-WebFetch behavior. If Phase 6 reshaped prompts perform well in dry-run preview, planner may tighten to `≥5/6`. Default to the conservative threshold; document the upgrade path in 06-VERIFICATION.md.
   - **RESOLVED:** Threshold locked at `>=4/6` per Plan 06-04 Task 2. Tightening to `>=5/6` is an explicit future-phase concern, not a Phase 6 runtime decision. The lock prevents the executor from retroactively shifting the bar after seeing UAT data.

3. **Question:** Does Class 4 (language semantics) need its own corroborating-evidence sentence shape?
   - **What we know:** Classes 1, 2, 3 share the same shape ("X corroborates the web answer; they do not replace it"). Class 4 has an OR (empirical compile OR `WebFetch` language spec) that doesn't fit the same template.
   - **What's unclear:** Whether the OR is best expressed as a fork-in-the-prose or as two sub-classes (4a empirical, 4b spec fetch).
   - **Recommendation:** Single Class 4 with an OR ("the first orient action is empirical compile / run OR `WebFetch` of the language spec"). Two sub-classes inflate to 5+ classes (anti-pattern). Single OR matches Pattern D D-01 text verbatim. Provide one worked example for each branch (compile; spec fetch) so the executor can see both legitimate first actions.
   - **RESOLVED:** Single Class 4 with an OR shape per Plan 06-01. Both worked branches (empirical compile and language-spec WebFetch) are present in `references/orient-exploration.md` so the executor can pattern-match either legitimate first action.

4. **Question:** Is the `references/context-packaging.md` Rule 5 cross-reference a one-line pointer or a paragraph mirror?
   - **What we know:** Rule 5 currently says: "Verification ranking is defined in the skill's `<orient_exploration_ranking>` block." (~one sentence, line 44).
   - **What's unclear:** Whether the cross-reference adds depth or just a pointer.
   - **Recommendation:** One-line pointer: append after "skill's `<orient_exploration_ranking>` block": " — see also `@${CLAUDE_PLUGIN_ROOT}/references/orient-exploration.md` for the question-class taxonomy." Paragraph-mirror inflates context-packaging.md unnecessarily; the SKILL.md `@`-loads orient-exploration.md anyway, so the planner / advisor agent sees both. Pointer suffices.
   - **RESOLVED:** One-line pointer per Plan 06-02. The SKILL.md `@`-loads `orient-exploration.md` already; Rule 5 just gains a single reference line, no paragraph mirror.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `node` | tally.mjs execution; extract-advisor-sd.mjs | ✓ | v24.13.0 | — |
| `rg` (ripgrep) | All smoke scripts (KCB / DEF / HIA / J); web-usage gate | ✓ | 14.1.0 (rev e50df40a19) | — (grep tool DENIED per CLAUDE.md; no fallback needed) |
| `git grep` | Tracked-file existence assertions in plan tasks (Pattern D ref file presence, version-bump verification, residual-check) | ✓ | shipped with Git for Windows | — |
| `bash` (Git Bash) | Smoke scripts; UAT runner | ✓ | shipped with Git for Windows | — |
| `claude` CLI | Stage 1 smoke (5 invocations); Stage 2 UAT (6 invocations) | ✓ | Claude Code Team Plan, current at session start | — |
| `--plugin-dir` flag | UAT runner per D-08 | ✓ | supported by `claude` CLI | — |
| `--output-format stream-json` flag | UAT runner per D-08 | ✓ | supported by `claude` CLI | — |
| Working `D:/projects/github/LayZeeDK/ngx-smart-components` worktree | Stage 2 UAT against branch `uat/phase-5.6-plan-07-rerun` (or new branch for Phase 6) | unknown — verify at plan execution | — | If missing, `git clone` + `git switch -c uat/phase-6-pattern-d-replay 4ae4761` (Plan 07 base commit). The planner verifies at Stage 2 start. |

**Missing dependencies with no fallback:** None (the only conditional dependency is the ngx-smart-components worktree; planner verifies at execution time and reclones if needed).

**Missing dependencies with fallback:** None.

## Validation Architecture

> Required per `workflow.nyquist_validation: true` in `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Bash + ripgrep + Node.js (the four existing smoke scripts) + `claude -p` non-interactive CLI for UAT |
| Config file | None — each smoke script is self-contained; `tally.mjs` parses JSONL by convention |
| Quick run command | `bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/KCB-economics.sh` (single smoke, ~$1, ~30s) |
| Full suite command | (smoke) `for f in KCB-economics DEF-response-structure HIA-discipline J-narrative-isolation; do bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/${f}.sh; done` (cost ~$3-5, ~3min); (UAT) `bash .planning/phases/06-.../uat-pattern-d-replay/run-all.sh && node .planning/phases/06-.../uat-pattern-d-replay/tally.mjs` (cost ~$5-10, ~30min) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| D-01 | Pattern D 4-class taxonomy present in `references/orient-exploration.md` | static (grep) | `git grep -l "Type-symbol existence" plugins/lz-advisor/references/orient-exploration.md && git grep -l "API currency" plugins/lz-advisor/references/orient-exploration.md && git grep -l "Migration / deprecation" plugins/lz-advisor/references/orient-exploration.md && git grep -l "Language semantics" plugins/lz-advisor/references/orient-exploration.md` | ❌ Wave 0 (file does not exist yet; created by Plan ~02) |
| D-02 | `@`-load line for orient-exploration.md present in 4 SKILL.md | static (grep) | `git grep -c "references/orient-exploration.md" plugins/lz-advisor/skills/*/SKILL.md` (expect 4) | ❌ Wave 0 (load lines added by Plan ~02) |
| D-02 | `references/context-packaging.md` Rule 5 cross-reference present | static (grep) | `git grep -F "orient-exploration.md" plugins/lz-advisor/references/context-packaging.md` | ❌ Wave 0 (cross-ref added by Plan ~02) |
| D-03 | Pattern D phrasing uses descriptive triggers, no `MUST` / `NEVER` for tool-use steering | static (negative-grep) | `! git grep -E '\b(MUST|NEVER|REQUIRED|CRITICAL)\b' plugins/lz-advisor/references/orient-exploration.md \|\| true` (zero matches expected; the existing `<context_trust_contract>` keywords are NOT in this file) | ❌ Wave 0 |
| D-04 | All four existing smoke tests pass on plugin 0.8.5 | runtime (bash) | `bash .../KCB-economics.sh && bash .../DEF-response-structure.sh && bash .../HIA-discipline.sh && bash .../J-narrative-isolation.sh` | ✅ (scripts exist; just need 0.8.5 to pass) |
| D-04 | KCB-economics K + C + B all `[OK]` (load-bearing gate signal) | runtime (bash) | `bash .planning/phases/05.4-.../smoke-tests/KCB-economics.sh` exit 0 | ✅ |
| D-04 | 6 reshaped UAT sessions complete; per-session D-11 thresholds satisfied | runtime (claude -p loop + tally.mjs) | `bash uat-pattern-d-replay/run-all.sh && node uat-pattern-d-replay/tally.mjs > tally.txt` | ❌ Wave 0 (run-all.sh, run-session.sh, tally.mjs, prompts/ all need to be created in Plan ~03) |
| D-04 | Web-usage gate: `web_uses ≥ 1` in `≥ 4 of 6` sessions | static (grep tally.txt) OR (alternative L-script) | `awk -F'\t' 'NR>1 && $6>=1 {n++} END {exit (n>=4)?0:1}' tally.txt` (column 6 is webUses if extended) | ❌ Wave 0 (extended tally.mjs needed) |
| D-04 | S2 Bun-crash exemption documented in session-notes.md | static (grep) | `git grep -F "S2 Bun-crash" .planning/phases/06-.../uat-pattern-d-replay/session-notes.md` | ❌ Wave 0 |
| D-06 | plugin.json version 0.8.5 | static (json parse) | `node -e "process.exit(JSON.parse(require('fs').readFileSync('plugins/lz-advisor/.claude-plugin/plugin.json','utf8')).version === '0.8.5' ? 0 : 1)"` (one-shot, no shell escaping concerns) | ✅ (file exists; bump pending) |
| D-06 | All 4 SKILL.md frontmatter at version: 0.8.5 | static (grep) | `git grep -c '^version: 0\.8\.5$' plugins/lz-advisor/skills/*/SKILL.md` (expect 4) | ✅ |
| D-06 | Zero 0.8.4 residuals after bump | static (grep) | `! rg -uu -l '0\.8\.4' plugins/lz-advisor/ \|\| true` (expect zero matches) | ✅ |
| ASCII-only | All Phase 6-authored files (orient-exploration.md, reshaped prompts, session-notes.md, tally.txt) are ASCII | static (negative-grep) | `! rg -c '[^\x00-\x7F]' .planning/phases/06-address-phase-5-6-uat-findings/ plugins/lz-advisor/references/orient-exploration.md \|\| true` (expect zero non-ASCII) | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `bash .../KCB-economics.sh` (single smoke; ~$1, ~30s) — verifies executor still uses web tools when prompted with API-migration questions. Cheap signal.
- **Per wave merge:** Run all four smoke scripts (~$3-5, ~3min) — verifies no Pattern D edit broke advisor word-budget, frame contract, or scope-derivation contracts.
- **Phase gate:** Smoke + 6-session UAT replay + tally.mjs aggregation (~$5-10 + ~$3-5 = ~$8-15 total, ~33min UAT time) — full Pattern D + reshaped-prompt empirical confirmation.

### Wave 0 Gaps

- [ ] `plugins/lz-advisor/references/orient-exploration.md` — NEW file containing Pattern D's 4 class blocks per D-01 / D-03 phrasing. Created by Plan ~01 or ~02.
- [ ] `plugins/lz-advisor/references/context-packaging.md` — Rule 5 line gains 1-line cross-ref.
- [ ] `plugins/lz-advisor/skills/lz-advisor.{plan,execute,review,security-review}/SKILL.md` — each gains `@`-load line inside existing `<orient_exploration_ranking>` block + frontmatter `version:` bump.
- [ ] `plugins/lz-advisor/.claude-plugin/plugin.json` — version bump 0.8.4 → 0.8.5.
- [ ] `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/run-all.sh` — copy from Phase 5.6 with RUN_DIR updated.
- [ ] `.planning/phases/06-.../uat-pattern-d-replay/run-session.sh` — copy with RUN_DIR updated.
- [ ] `.planning/phases/06-.../uat-pattern-d-replay/tally.mjs` — copy with `base` updated + `web_uses` column extension (~5 lines).
- [ ] `.planning/phases/06-.../uat-pattern-d-replay/prompts/session-{1..6}-<skill>.txt` — six reshaped prompts per D-04 class assignment.
- [ ] `.planning/phases/06-.../uat-pattern-d-replay/session-notes.md` — narrative shape mirroring Phase 5.6 Plan 07's `AUTONOMOUS-UAT.md`.
- [ ] `.planning/phases/06-.../06-VERIFICATION.md` — two-section gate report (Stage 1 smoke + Stage 2 UAT) per Pattern 2 above.

*(Framework install: not required — Node + rg + Bash all verified present.)*

## Sources

### Primary (HIGH confidence)

- **Anthropic Prompting best practices (4.x)** — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices [retrieved 2026-04-28; full 60.9KB content captured to local tool-results file]
  - § Tool use triggering — primary anchor for D-03's "describe why and how" mandate
  - § Tool usage — anchor for "more normal prompting like 'Use this tool when...'" (dial-back imperatives)
  - § More literal instruction following — anchor for the literalism warning
  - § Use examples effectively — anchor for the few-shot pattern in Pattern D worked examples
  - § Control the format of responses — anchor for positive-form ("Tell Claude what to do instead of what not to do")
  - § Add context to improve performance — anchor for explanation-of-rationale phrasing
  - § Overthinking and excessive thoroughness — anchor for "Replace blanket defaults with more targeted instructions"
- **Anthropic Tool use overview** — https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview [retrieved 2026-04-28]
  - § What happens when Claude needs more information — anchor for Sonnet's "do its best to infer a reasonable value" tendency vs Opus's "more likely to recognize that a parameter is missing and ask for it"
- **Simon Willison — Claude 4 system prompt analysis (2025-05-25)** — https://simonwillison.net/2025/May/25/claude-4-system-prompt/ [retrieved 2026-04-28]
  - search_instructions block — descriptive-trigger pattern Anthropic uses in production
  - "Use web_search only when information is beyond the knowledge cutoff, the topic is rapidly changing, or the query requires real-time data." — verbatim canonical trigger phrasing
  - "Adaptive scaling" — anchor for Pattern D's "first action is X, corroborating sources are Y" graduated structure
- **Anthropic — Writing tools for agents** — https://www.anthropic.com/engineering/writing-tools-for-agents [retrieved 2026-04-28]
  - "think of how you would describe your tool to a new hire on your team" — anchor for descriptive over imperative
  - "Consider the context that you might implicitly bring—specialized query formats, definitions of niche terminology, relationships between underlying resources—and make it explicit." — anchor for naming corroborating-evidence sentences
  - "Namespacing (grouping related tools under common prefixes) can help delineate boundaries between lots of tools" — anchor for Pattern D's class boundaries
- **Codebase verification (2026-04-28)** — Read tool against:
  - `plugins/lz-advisor/skills/lz-advisor.{plan,execute,review,security-review}/SKILL.md` — confirmed all 4 SKILL.md files contain `<orient_exploration_ranking>` block
  - `plugins/lz-advisor/references/context-packaging.md` — confirmed Rule 5 line 44 location for cross-reference insertion; confirmed Rule 7 (Plan 07) shape Pattern D mirrors at the references-file granularity
  - `plugins/lz-advisor/references/advisor-timing.md` — confirmed reference-file convention Pattern D uses
  - `plugins/lz-advisor/.claude-plugin/plugin.json` — confirmed version: 0.8.4 baseline
  - `.planning/phases/05.6-.../uat-plan-07-rerun/{run-all.sh,run-session.sh,tally.mjs}` — confirmed reusable runner shape
  - `.planning/phases/05.4-.../smoke-tests/{KCB-economics,DEF-response-structure,HIA-discipline,J-narrative-isolation}.sh` — confirmed all four smoke tests reusable
  - `.planning/phases/05.4-.../uat-5-compodoc-run/prompts/session-{1,2,3,4,5,6}-<skill>.txt` — confirmed original prompts; identified S1, S4 as Nx-docs-inlined (Pitfall 1 candidates for reshape)
- **Empirical rg portability test (2026-04-28)** — Bash tool verified:
  - `rg -c '"name":"(WebSearch|WebFetch)"'` against synthetic JSONL input returned correct match count (1 for one WebFetch event); pattern is Git Bash Windows arm64 portable.
  - `rg -q '^[0-9]+\. Assuming .+ \(unverified\), do .+\. Verify .+ before acting\.'` against literal-frame input returned MATCH; DEF-response-structure.sh tightened-E regex confirmed working.
  - `node --version` → v24.13.0; `rg --version` → ripgrep 14.1.0 (rev e50df40a19).

### Secondary (MEDIUM confidence)

- Phase 5.6 Plan 07 `AUTONOMOUS-UAT.md` — empirical evidence for Plan 07's Gap 3 closure + Conclusion 4 refinement; the table at lines 65-78 (zero web tool uses across all 6 sessions) is the load-bearing motivation for Pattern D.
- Phase 5.6 Plan 07 `05.6-VERIFICATION.md` — three-stage verification structure (forward-capture → fix-validation smoke → 6-session UAT replay) Phase 6 simplifies to two-stage.
- Phase 5.4 / 5.5 / 5.6 SUMMARY.md and CONTEXT.md files — historical anchor for letter-naming convention (A-K → I → next free L), prompt-rule + smoke-test-lock pattern, regression-baseline preservation (T-05.5-13 mitigation), positive-framing-over-negative-prohibitions convention.

### Tertiary (LOW confidence — none in this research)

- (none — all claims verified above)

## Metadata

**Confidence breakdown:**

- Standard stack (Bash + rg + Node + claude CLI): HIGH — empirically verified via `rg --version` / `node --version` / Bash tool tests on 2026-04-28.
- Architecture patterns (Pattern D shape; two-stage verification): HIGH — Pattern D shape anchored in 4 verbatim quotes from Anthropic 4.x best-practices doc (CITED above); two-stage simplification anchored in Phase 5.6 verification structure (read directly).
- Reshaped prompt class assignments (R-02): MEDIUM — D-04 names the class per session, but the worked text is Claude's discretion; class assignment is unambiguous on inspection (S1, S3, S6 = API-currency; S2, S4 = migration/deprecation; S5 = language-semantics; cross-checked against D-01 taxonomy).
- Common pitfalls (Pattern A vs Pattern D conflict; rg portability; tally hardcoded path; stream-json vs stdout): HIGH — Pitfall 1 anchored in Pattern A SKILL.md prose verbatim; Pitfall 3 empirically verified; Pitfalls 4-5 documented in Phase 5.5 / 5.6 prior research.
- UAT gate threshold (≥1 in ≥4 of 6): MEDIUM — empirical baseline is zero (Plan 07 trace); D-04 names ≥4/6 as recommended baseline; the trade-off vs ≥5/6 is documented in Pitfall 2 + Open Question 2 for the planner to pick deliberately.

**Research date:** 2026-04-28

**Valid until:** 2026-05-28 (30 days for stable Anthropic prompting docs; revisit if a new 4.x model release shifts the tool-use steering guidance, or if Phase 6 UAT empirically falsifies Pattern D's expected behavior).
