# lz-advisor

Claude Code plugin implementing the advisor strategy -- pair an Opus advisor with your session model for near-Opus intelligence at Sonnet cost.

## Overview

The advisor strategy pairs a stronger model (Opus 4.6) with a faster model (typically Sonnet 4.6) to get the best of both worlds. The faster model handles the bulk of token generation -- reading files, writing code, running tools -- while the stronger model provides strategic guidance at high-leverage moments: before committing to an approach, when stuck, and before declaring done.

Anthropic's internal benchmarks show that Sonnet 4.6 paired with an Opus advisor achieved +2.7 percentage points on SWE-bench Multilingual coding benchmarks at 11.9% lower cost compared to Sonnet solo. The advisor adds most value on the first call, before the approach crystallizes, and on the final check after work is complete.

This plugin uses Claude Code's native Agent tool to implement the pattern -- no API keys, no external dependencies, no additional setup beyond installation. Skills orchestrate the executor-advisor loop, consulting the `lz-advisor` agent at strategic moments during task execution.

## Skills

| Skill | Description |
|-------|-------------|
| `/lz-advisor.plan` | Get an Opus-informed strategic plan before writing code. The executor orients on the codebase, consults the advisor for strategic direction, then produces an actionable plan. |
| `/lz-advisor.execute` | Execute tasks with strategic Opus consultation at high-leverage moments. The executor works through the task, consulting the advisor before substantive work, when stuck, and before declaring done. |
| `/lz-advisor.review` | Opus-powered code quality review of completed work. The executor scans the changes and packages context for the advisor to provide deep quality analysis. |
| `/lz-advisor.security-review` | Opus-powered security-focused threat analysis. The executor identifies attack surfaces and packages findings for the advisor to assess threats and recommend mitigations. |

## Installation

```
claude plugin install LayZeeDK/lz-advisor-claude-plugins
```

After installation, verify the plugin loads correctly:

```
claude --debug
```

Look for `lz-advisor` in the loaded plugins output to confirm the agent is discovered.

If skills do not trigger after installation, verify that `lz-advisor` appears in `enabledPlugins` in your Claude Code settings. This is a known issue where plugins install correctly but are not automatically enabled.

## How it works

- Skills run on your session model (typically Sonnet 4.6) as the executor.
- At strategic moments, the executor consults the `lz-advisor` agent, which runs on Opus 4.6.
- The advisor provides concise guidance -- under 100 words, enumerated steps focused on what to do.
- The executor continues with the task, informed by the advice.

The advisor is consulted at the moments where a stronger model adds the most value:

1. **Before substantive work** -- after orientation (reading files, understanding the codebase), the executor consults the advisor before writing any code or committing to an approach.
2. **When stuck** -- if errors recur, the approach is not converging, or results do not fit expectations.
3. **Before declaring done** -- a final check to verify the approach is sound and catch anything the executor may have missed.

## Cost expectations

The advisor is consulted 2-3 times per typical task, keeping Opus usage focused on high-leverage moments rather than running end-to-end.

- Each consultation uses approximately 400-700 Opus output tokens.
- Total advisor cost per task: approximately $0.05-0.15 at current Opus rates.
- The cost savings come from Sonnet handling the bulk of token generation (reading, writing, tool calls) while Opus provides only strategic guidance.

The plugin does not add any costs beyond the Opus advisor consultations -- no external API calls, no third-party services.

## Requirements

- Claude Code with access to both Sonnet 4.6 and Opus 4.6
- No API keys or external dependencies required

## License

MIT
