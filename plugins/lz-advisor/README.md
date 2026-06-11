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

### 1.0.1

Review report grammar overhaul. The `/review` and `/security-review` agents now
present findings GROUPED under fully spelled-out severity headlines --
`### Critical`, `### Important`, `### Suggestions`, and `### Questions` -- in a
fixed order, replacing the prior inline two-letter severity fragment shorthand
that prefixed each finding line. Findings carry continuous integer numbers across all sections so
cross-references stay unambiguous, every severity section is always emitted with
an explicit `(none)` marker when empty, and the OWASP `[Axx]` category tags are
preserved verbatim on security findings. The render-verbatim contract and the
per-section word-budget gates are intact -- the skills carry the grouped shape to
the user without reformatting.

### 1.0.0

Initial stable release. The advisor-strategy plugin pairs an Opus advisor with
your session model across four skills -- `/plan`, `/execute`, `/review`, and
`/security-review` -- each backed by a dedicated Opus agent (`advisor`,
`reviewer`, `security-reviewer`) using the same orient -> consult -> produce
pattern. Highlights: verification-chain integrity (pre-verified-claim discipline,
hedge-marker handling, ToolSearch-backed web verification), per-section output
budgets for the review agents, change-surface-matched verification targets, and
pack-then-trust final advisor consultations.

## License

MIT
