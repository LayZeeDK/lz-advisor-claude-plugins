# Phase 1: Plugin Scaffold and Advisor Agent - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-04-10
**Phase:** 01-plugin-scaffold-and-advisor-agent
**Areas discussed:** Advisor persona and voice, Agent description triggers, Reference file scope, Plugin identity

---

## Advisor Persona and Voice

### Persona approach

| Option | Description | Selected |
|--------|-------------|----------|
| One-sentence role + instructions | Follows official plugin pattern: role line then structured sections | * |
| Senior architect | Frames advice through architectural lens | |
| Minimal -- no persona | Skip persona framing entirely | |

**User's choice:** One-sentence role + instructions (Recommended)
**Notes:** Research into plugin-dev guidelines and 19 official agents showed a universal pattern: one-sentence "You are [role] specializing in [domain]" opening, then zero persona maintenance -- pure structured instructions.

### Advisor tool use behavior

| Option | Description | Selected |
|--------|-------------|----------|
| maxTurns: 1, reactive tools | Single Opus inference. Reads files only to verify executor claims. | * |
| maxTurns: 2, safety net | Second turn as fallback if executor summary incomplete | |

**User's choice:** maxTurns: 1, reactive tools (Recommended)
**Notes:** User asked whether "single turn" was based on the real Advisor tool. Deep analysis revealed: API advisor has ZERO tools and sees the full transcript server-side. Our plugin gives Read/Glob to compensate but should keep maxTurns: 1 to maintain single-inference cost and mirror the advisor philosophy: judgment on pre-gathered context, not exploration.

### Ambiguity handling

| Option | Description | Selected |
|--------|-------------|----------|
| Always commit | Give concrete recommendation even with incomplete info | * |
| Flag gaps, then advise | Note what's missing AND give recommendation | |
| Claude's discretion | Don't specify | |

**User's choice:** Always commit (Recommended)

### Model awareness

| Option | Description | Selected |
|--------|-------------|----------|
| No -- model-agnostic | References "an executor" not "Sonnet" | * |
| Yes -- context-aware | Knows it advises a faster executor model | |

**User's choice:** No -- model-agnostic (Recommended)

### Agent count

| Option | Description | Selected |
|--------|-------------|----------|
| Single agent + awareness | One lz-advisor with consultation awareness section | * |
| Multiple agents per consultation | Separate agents for orient/stuck/verify/pivot | |
| Defer to Phase 2 testing | Build single now, split if needed later | |

**User's choice:** Single agent + awareness (Recommended)
**Notes:** User asked whether multiple consultation-specific agents should be considered. Analysis showed: API advisor is one tool called at different moments. 90% of each agent would be identical. Executor prompt framing (guided by skill instructions) is the right specialization point, not the agent system prompt.

### Stance and output format

**User's choice:** Both recommended -- don't prescribe stance (let consultation framing drive it), use Anthropic's validated conciseness instruction (no template)
**Notes:** User asked for ultrathink analysis. Recommendation: stance depends on consultation type (orient, diagnose, verify, evaluate) -- prescribing one in the static system prompt would serve one type at the expense of others. Output format follows Anthropic's tested instruction that cut tokens 35-45%.

### Color and constraint style

| Option | Description | Selected |
|--------|-------------|----------|
| Follow plugin-dev pattern | Magenta color, positive-only instructions | * |
| Keep "What Not to Do" | Explicit negative constraints alongside positive | |

**User's choice:** Follow plugin-dev pattern (Recommended)
**Notes:** Research showed none of the 3 plugin-dev agents or 6 pr-review-toolkit agents include negative constraint sections. All define behavior through positive instructions only.

---

## Agent Description Triggers

### Description style

| Option | Description | Selected |
|--------|-------------|----------|
| Style A with examples | "Use this agent when..." + 3 example blocks | * |
| Style B -- short declarative | Simple capability statement, no examples | |
| Hybrid -- short + 1 example | Middle ground | |

**User's choice:** Style A with examples (Recommended)
**Notes:** Comprehensive survey of 19 agents across 6 official plugins showed Style A is the prescribed pattern (11/16 frontmatter agents). User clarified agent is skill-orchestrated only -- not for direct user invocation because it requires structured context packaging. Revised examples to show only skill-driven scenarios.

---

## Reference File Scope

### Content scope

| Option | Description | Selected |
|--------|-------------|----------|
| Timing + advice weight + context packaging | All three operational concerns in one file | * |
| Timing only | Just Anthropic's timing block | |
| Timing + advice weight | Two Anthropic blocks, no context packaging | |

**User's choice:** Timing + advice weight + context packaging (Recommended)

### Wording approach

| Option | Description | Selected |
|--------|-------------|----------|
| Adapted from Anthropic | Start from tested text, adapt for plugin context | * |
| Rewrite from scratch | Entirely new text capturing same concepts | |

**User's choice:** Adapted from Anthropic (Recommended)

---

## Plugin Identity

### plugin.json fields

| Option | Description | Selected |
|--------|-------------|----------|
| name + description + version + author | Matches Anthropic pattern + version | |
| Full recommended set | All manifest-reference recommended fields | * |
| Minimal (name only) | Bare minimum, add fields in Phase 5 | |

**User's choice:** Full recommended set
**Notes:** User chose the most thorough option after reviewing plugin-dev manifest-reference guidelines for marketplace distribution. Includes name, description, version, author, license, repository, keywords.

---

## Claude's Discretion

- System prompt exact wording and section ordering
- Reference file internal section flow
- Agent description example scenario details

## Deferred Ideas

- Review skills architecture (context: fork vs advisor pattern) -- Phase 4 concern
- Multiple consultation-specific agents -- decided against for v1, revisit if Phase 2-3 testing shows issues

## Project-Level Decision

- Renamed `/lz-advisor.implement` to `/lz-advisor.execute` across all planning artifacts (10 files updated)
