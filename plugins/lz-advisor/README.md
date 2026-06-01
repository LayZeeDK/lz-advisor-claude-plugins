# lz-advisor

Claude Code plugin implementing the advisor strategy -- pair an Opus advisor with your session model for near-Opus intelligence at Sonnet cost.

## Overview

The advisor strategy pairs a stronger model (Opus 4.7, auto-selected via the `opus` alias) with a faster model (typically Sonnet 4.6) to get the best of both worlds. The faster model handles the bulk of token generation -- reading files, writing code, running tools -- while the stronger model provides strategic guidance at high-leverage moments: before committing to an approach, when stuck, and before declaring done.

Anthropic's internal benchmarks (measured on Opus 4.6) show that Sonnet 4.6 paired with an Opus advisor achieved +2.7 percentage points on SWE-bench Multilingual coding benchmarks at 11.9% lower cost compared to Sonnet solo. The advisor adds most value on the first call, before the approach crystallizes, and on the final check after work is complete.

This plugin uses Claude Code's native Agent tool to implement the pattern -- no API keys, no external dependencies, no additional setup beyond installation. The skills consult one of three Opus agents at strategic moments: `advisor` (used by `/plan` and `/execute`), `reviewer` (used by `/review`), and `security-reviewer` (used by `/security-review`).

## Skills

| Skill | Description |
|-------|-------------|
| `/plan` | Get an Opus-informed strategic plan before writing code. The executor orients on the codebase, consults the advisor for strategic direction, then produces an actionable plan. |
| `/execute` | Execute tasks with strategic Opus consultation at high-leverage moments. The executor works through the task, consulting the advisor before substantive work, when stuck, and before declaring done. |
| `/review` | Opus-powered code quality review of completed work. The executor scans the changes and packages context for the advisor to provide deep quality analysis. |
| `/security-review` | Opus-powered security-focused threat analysis. The executor identifies attack surfaces and packages findings for the advisor to assess threats and recommend mitigations. |

## Installation

Add the marketplace and install the plugin:

```
/plugin marketplace add LayZeeDK/lz-advisor-claude-plugins
/plugin install lz-advisor@lz-advisor-claude-plugins
```

For local development or testing from a cloned repo:

```
claude --plugin-dir plugins/lz-advisor
```

After installation, verify the plugin loads correctly:

```
claude --debug
```

Look for `lz-advisor` in the loaded plugins output. If skills do not trigger, verify that `lz-advisor` appears in `enabledPlugins` in your Claude Code settings.

## How it works

- Skills run on your session model (typically Sonnet 4.6) as the executor.
- At strategic moments, the executor consults the relevant Opus agent -- `advisor` for `/plan` and `/execute`, `reviewer` for `/review`, `security-reviewer` for `/security-review`.
- The advisor provides concise guidance -- under 100 words, enumerated steps focused on what to do.
- The executor continues with the task, informed by the advice.

The advisor is consulted at the moments where a stronger model adds the most value:

1. **Before substantive work** -- after orientation (reading files, understanding the codebase), the executor consults the advisor before writing any code or committing to an approach.
2. **When stuck** -- if errors recur, the approach is not converging, or results do not fit expectations.
3. **Before declaring done** -- a final check to verify the approach is sound and catch anything the executor may have missed.

## Requirements

- Claude Code with access to Sonnet 4.6 or later and Opus 4.7 or later (the `opus` alias auto-resolves to the current Opus generation)
- No API keys or external dependencies required

Opus 4.7 (released 2026-04-16) is auto-selected via the `opus` alias; no user action is required to adopt it.

## References

- `references/advisor-timing.md` -- Anthropic's suggested timing patterns
  for advisor consultation: when to consult, how much weight to give the
  advice, and how to package context for a fresh-context advisor call.
- `references/context-packaging.md` -- Shared packaging contract and
  templates (Proposal, Verification) used by all four skills. Defines
  the Common Contract (4 packaging rules), the Proposal template for
  strategic direction calls, the Verification template for review calls,
  a short-form Proposal variant for mid-execute re-consultations, and a
  decision table mapping skill + call site to template.

## What's New

### 1.0.0

First stable release -- marks completion of the v1.0 milestone. The plugin is
feature-complete: 4 skills (`/plan`, `/execute`, `/review`, `/security-review`)
backed by 3 Opus agents (`advisor`, `reviewer`, `security-reviewer`), all using
the same orient -> consult -> produce pattern. Hardened across 15 phases of
UAT-driven field testing: verification-chain integrity (pre-verified-claim
discipline, hedge-marker handling, ToolSearch-backed web verification),
per-section output budgets for the review agents, change-surface-matched
verification targets, and pack-then-trust final consultations. No behavior change
from 0.15.0 -- this is the release tag for the completed milestone.

### 0.15.0

- Renamed the four skills from the dotted `lz-advisor.<skill>` form back to
  plain `<skill>` (`/plan`, `/execute`, `/review`, `/security-review`). The
  qualified `lz-advisor:<skill>` form already provides namespacing, so the
  `lz-advisor.` prefix only produced a redundant `lz-advisor:lz-advisor-<skill>`
  normalized name. Reverses the 0.3.0 rename.

### 0.14.0

- The execute skill now selects its verification target by change surface (a
  Storybook or build-config change is verified with the matching target, not a
  blanket `nx test`) and packs post-change file content into the final advisor
  consultation so the advisor synthesizes from the prompt instead of re-reading
  files from disk.
- Removed the `wip:` commit discipline: long-running validations now wait for
  completion rather than routing to a work-in-progress commit.
  (Rollup of 0.14.0, 0.14.1, and 0.14.2.)

### 0.13.0

- Reviewer and security-reviewer output budgets moved from a single aggregate
  300-word cap to per-section `<output_constraints>` (per-finding <=22 words,
  Cross-Cutting / Threat Patterns <=160 words, optional Missed surfaces <=30
  words; no aggregate cap), after aggregate caps were found to degrade reasoning
  quality.
  (Rollup of 0.13.0 and 0.13.1.)

### 0.10.0

- Verification-chain-integrity hardening across all three agents and four
  skills: pre-verified-claim validation, hedge-marker discipline,
  confidence-laundering guards, default-on ToolSearch loading for deferred web
  tools, a reviewer Class-2 escalation hook, and an aligned severity vocabulary
  (Critical / Important / Suggestion / Question).
  (Rollup of 0.10.0 through 0.12.2.)

### 0.9.0

- Added a provenance-based Context Trust Contract (vendor-doc vs.
  agent-generated) and a question-class-aware orient-exploration ranking
  (`references/orient-exploration.md`) so the executor prefers web research over
  stale local `node_modules` type stubs for API-currency, migration, and
  security-advisory questions.
  (Rollup of 0.8.5 and 0.9.0.)

### 0.8.0

- Added proactive web research to the plan skill (verify framework conventions
  before consulting the advisor), an advisor density worked example, a
  security-review output-shape smoke test, and an advisor word-budget gate.
  Fixed an advisor "Assuming X, do Y. Verify X." framing regression for
  thin-context tasks.
  (Rollup of 0.8.0 through 0.8.4.)

### 0.6.0

- Shipped the "executor verifies cheaply and correctly before burdening agents"
  doctrine: the review and security-review skills derive scope mechanically from
  git rather than from the conversation narrative, all four skills gained
  WebSearch / WebFetch in their allowed-tools, and the three agent response
  shapes were polished (Position B Critical marker, inline "Assuming X" framing,
  two-slot Findings + Cross-Cutting / Threat Patterns output).

### 0.5.0

- Added `## Context Trust Contract` section to all three Opus agents
  (advisor, reviewer, security-reviewer). Calibrated per role:
  advisor emphasizes compression, reviewer and security-reviewer
  emphasize efficient batched verification. Closes Phase 5.2 field
  findings F1 (advisor maxTurns exhaustion) and F2 (agents ignoring
  soft anti-re-read instructions).
- Added new shared reference file `references/context-packaging.md`
  consolidating packaging rules (Common Contract, Proposal template,
  Verification template, short-form variant, decision table) that
  were previously inline in each SKILL.md. All four skills now
  `@`-load this reference. Closes field finding F3 (executor context
  packaging quality).
- Added orientation-budget instruction to `plan` and
  `execute` skills to stop executor over-investigation of
  bundled, minified, or `node_modules/*/dist/` files. Closes field
  finding F5.
- Field finding F4 (executor recovery mechanism works but at high cost
  when the advisor returns a preamble-only response) is not addressed
  in 0.5.0. The F1 Context Trust Contract fix is expected to reduce
  the frequency of F4 triggers by curing the upstream cause; residual
  cost optimization of the recovery path itself is deferred to a
  future release.
- No agent frontmatter, allowed-tools, or workflow shape changes. All
  edits are prompt-level.

## License

MIT
