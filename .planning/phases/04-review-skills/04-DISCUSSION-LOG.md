# Phase 4: Review Skills - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 04-review-skills
**Mode:** discuss (--analyze)
**Areas discussed:** Review scope targeting, Output structure and delivery, Executor scan strategy, Security review specialization

---

## Review Scope Targeting

| Option | Description | Selected |
|--------|-------------|----------|
| Executor judges (Recommended) | Skill describes file paths, directories, and git diff as targeting modes. Executor picks based on user's request. | * |
| Git diff as default | Default to reviewing recent git changes. User can override with explicit paths. | |
| Explicit paths only | Require user to specify files or directories. Most precise but least natural. | |

**User's choice:** Executor judges
**Notes:** Matches plan/execute pattern where executor determines scope from user's request.

---

## Output Structure and Delivery

### Design approach

| Option | Description | Selected |
|--------|-------------|----------|
| Advisor-pattern review (Recommended) | Sonnet scans and curates, Opus provides strategic depth. General-purpose, not tied to execute output. | * |
| Match pr-review-toolkit style | Confidence scoring, Opus-direct. Duplicates what Anthropic already ships. | |
| Advisor pattern + confidence scoring | Hybrid of both approaches. | |

**User's choice:** Advisor-pattern review
**Notes:** Extensive research into native review ecosystem. User directed exploration of code-review plugin (claude-code repo), pr-review-toolkit, and the deprecated /review command. Key finding: code-review plugin (claude-code repo) is 4 months ahead of claude-plugins-official version -- uses Opus bug agents + validation (not confidence scoring). Our advisor pattern is genuinely differentiated: strategic depth (Opus analyzes curated findings) vs detection breadth (multiple parallel agents scan raw code).

### Output destination

| Option | Description | Selected |
|--------|-------------|----------|
| Console only (Recommended) | Findings inline in conversation. Reviews are advisory, no downstream consumer. | * |
| Console + file artifact | Summary inline, full report to file. | |
| File artifact only | Full report to file. | |

**User's choice:** Console only

### Severity (general review)

| Option | Description | Selected |
|--------|-------------|----------|
| Critical / Important / Suggestion | Matches pr-review-toolkit aggregated output tiers. | * |
| Match native taxonomy | Important / Nit / Pre-existing (PR-focused). | |
| Advisor-curated | No fixed tiers. Opus decides per finding. | |
| You decide | Claude's discretion. | |

**User's choice:** Critical / Important / Suggestion
**Notes:** Extensively researched native severity approaches. code-review plugin uses no severity (flat list). pr-review-toolkit uses Critical/Important/Suggestions for aggregated output. User chose pr-review-toolkit's tiers for ecosystem familiarity.

### Advisor focus

| Option | Description | Selected |
|--------|-------------|----------|
| Top findings (Recommended) | Sonnet packages 3-5 most significant. Fits 100-word budget. | * |
| Architectural themes | Cross-cutting patterns. Highest strategic value but less per-finding. | |
| You decide | Claude's discretion. | |

**User's choice:** Top findings

### Strengths section

| Option | Description | Selected |
|--------|-------------|----------|
| Findings only (Recommended) | No strengths section. Concise, action-oriented. | * |
| Include strengths | Balanced feedback but adds length. | |

**User's choice:** Findings only

### Opus attribution

| Option | Description | Selected |
|--------|-------------|----------|
| Woven in silently (Recommended) | Seamless. No separate section or tags. | * |
| Strategic Direction section | Visible advisor contribution. Consistent with plan skill. | |
| Per-finding annotation | Granular but noisy. | |

**User's choice:** Woven in silently

### Summary header

| Option | Description | Selected |
|--------|-------------|----------|
| Yes (Recommended) | Brief stats line at top. | * |
| No | Jump straight to findings. | |

**User's choice:** Yes

### Fix suggestions

| Option | Description | Selected |
|--------|-------------|----------|
| Yes (Recommended) | Each finding includes concrete fix. Both native tools do this. | * |
| No | Description only. | |

**User's choice:** Yes
**Notes:** Informed by comparison of code-review (claude-code repo -- committable suggestion blocks) and pr-review-toolkit (concrete fix per finding).

### Action section

| Option | Description | Selected |
|--------|-------------|----------|
| No action section (Recommended) | Severity tiers imply priority. Leaner. | * |
| Yes | Prioritized list like pr-review-toolkit. | |

**User's choice:** No action section

### Code-review inspired improvements

All four adopted from advisor-redesign analysis:
- CLAUDE.md awareness
- Opus validates + analyzes (not just analyzes)
- Cross-cutting pattern recognition
- High-signal criteria + exclusion list

---

## Agent Architecture

### Number of agents

| Option | Description | Selected |
|--------|-------------|----------|
| 3 agents (Recommended) | advisor.md + reviewer.md + security-reviewer.md | * |
| 2 agents | advisor.md + reviewer.md (security via executor framing) | |
| 1 flexible agent | advisor.md for everything (honors D-07) | |

**User's choice:** 3 agents
**Notes:** Deep analysis across advisor strategy blog, subagents blog, code-review plugin, and pr-review-toolkit. Key finding: subagents blog's canonical custom subagent example IS a dedicated security-reviewer. Phase 1 D-07 (single agent) was decided when reviews used context: fork. Now reviews use advisor pattern, and REVW-03 "deep analysis" conflicts with ADVR-02 "under 100 words." Separate agents resolve this naturally.

### Word budget for review agents

Emerged from user's question "What if we loosened the 100-word budget?" Analysis showed:
- 100 words validated for coding direction, not analytical review
- Review analysis IS the deliverable, not direction for future work
- ~300 words needed for 3-5 finding validation + cross-cutting analysis + per-finding depth
- Resolved naturally by 3-agent decision: each agent optimized for its role

### Advisor call count

| Option | Description | Selected |
|--------|-------------|----------|
| 1 call (Recommended) | Single call with all findings. Enables cross-cutting analysis. | * |
| 2 sequential calls | Validate first, deep-analyze second. | |
| 2-3 parallel aspect calls | Like code-review multi-agent. Kills cross-cutting analysis. | |

**User's choice:** 1 call
**Notes:** Parallel aspect calls would destroy cross-cutting pattern recognition -- the one capability our advisor pattern has that parallel isolated agents don't.

### Token overhead

| Option | Description | Selected |
|--------|-------------|----------|
| Note for Phase 5 (Recommended) | Measure during testing. Economics fundamentally sound. | * |
| Research now | Measure before proceeding. | |
| effort: medium | Reduce thinking tokens. | |

**User's choice:** Note for Phase 5

---

## Executor Scan Strategy

Resolved as consequence of prior decisions. Sonnet reads thoroughly within scope, filters by high-signal criteria, packages top findings. Scope (D-06) + signal criteria (D-08) + packaging (D-12) define the scan strategy. No separate depth knob needed. Validated by advisor strategy blog ("the rest of the run stays at executor-level cost") and native plugin patterns (scope constraints, not depth constraints).

---

## Security Review Specialization

### Skill structure

| Option | Description | Selected |
|--------|-------------|----------|
| Shared structure (Recommended) | Both skills follow same workflow. Only scan focus and agent differ. | * |
| Distinct workflows | Security has its own phases. More specialized but more to maintain. | |

**User's choice:** Shared structure
**Notes:** Synthesized across advisor strategy blog, subagents blog, code-review, and pr-review-toolkit. Both skills follow: determine scope -> scan with focus -> package findings -> consult reviewer agent -> structure output.

### Security severity tiers

| Option | Description | Selected |
|--------|-------------|----------|
| Critical / High / Medium (Recommended) | CVSS/OWASP-aligned. 3 tiers. Everything reported is actionable. | * |
| Same as general review | Critical / Important / Suggestion. Consistent but "Suggestion" wrong for security. | |
| 4 tiers (add Low) | Full CVSS. More comprehensive. | |
| 5 tiers (add Low + Informational) | Full OWASP. Most comprehensive but includes FYI items. | |

**User's choice:** Critical / High / Medium
**Notes:** "Suggestion" doesn't fit security -- findings are risks, not suggestions. Matches silent-failure-hunter's CRITICAL/HIGH/MEDIUM. Low and Informational filtered by executor's high-signal gate before reaching Opus. Development-time advisor, not audit tool.

---

## Claude's Discretion

- Exact system prompt wording for reviewer.md and security-reviewer.md
- Executor scan instructions specificity
- Internal structure of review output
- Whether review agents include effort: high
- Skill prompt wording and XML tag structure
- How executor summarizes context for reviewer consultations

## Deferred Ideas

- Token overhead measurement (Phase 5)
- Effort level tuning for reviewer agents (Phase 5)
- Parallel review subagents / deep-review pattern (v2)
- PR integration / --comment flag (v2)
