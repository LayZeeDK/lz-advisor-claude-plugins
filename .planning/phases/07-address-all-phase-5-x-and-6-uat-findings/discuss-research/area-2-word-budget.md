# Area 2 Research: Word-budget enforcement (Finding D)

## Research questions

1. How does Anthropic enforce length constraints in production agent prompts?
2. Is hard-rule layer (imperative) more effective than descriptive prose for output length on Claude 4.x?
3. What's the empirical cost of length caps on quality?
4. How are smoke fixtures structured for LLM output length validation?

## Findings

### Anthropic's own production prompt: descriptive prose dominates

PromptHub's analysis of the leaked Claude 4 system prompt:

- Output formatting uses descriptive prose, NOT imperative caps:
  - "Claude should not use bullet points or numbered lists for reports"
  - "Claude should give concise responses to very simple questions, but provide thorough responses to complex and open-ended questions"
- ALL-CAPS reserved for safety-critical rules ONLY:
  - "MUST refuse" (malware/weapons)
  - "NEVER reproduce any copyrighted material"
  - "ALWAYS use the web_fetch tool"
- **No explicit word-budget guidance** appears in Anthropic's own main system prompt

Source: <https://www.prompthub.us/blog/an-analysis-of-the-claude-4-system-prompt>

### Length caps cost measurable quality

From the Build This Now Claude Code Quality Regression analysis:

- Anthropic's own April 2026 ablation tests showed a **3% drop in coding quality** for both Opus 4.6 and 4.7 from a single verbosity-cap prompt addition.
- Length caps are real cost, not free.

Source: <https://www.buildthisnow.com/blog/models/claude-code-quality-regression-2026>

### Claude 4.x literal interpretation magnifies cap effect

- Opus 4.7 "follows instructions more literally"
- "Adjusts response length based on perceived task complexity rather than defaulting to a fixed verbosity"
- Well-specified caps are MORE effective on 4.x; poorly-specified caps are MORE penalized

Source: <https://miraflow.ai/blog/claude-opus-4-7-prompting-best-practices-2026>

### Anthropic's recommended layered control

From the Blockchain Council "Claude Output Control" guide:

> "Effective Claude output control is not a single setting. It is a layered strategy. Start with a hard cap using max_tokens, then reduce verbosity through system-level response rules, and finally minimize tokens by using structured outputs and strict tool use."

Hard caps prevent overflow but don't optimize token use. System-prompt rules reduce verbosity. Structured outputs minimize per-token cost.

Source: <https://www.blockchain-council.org/claude-ai/claude-output-control/>

### Effective prompt patterns for length caps (industry consensus)

From the Anthropic prompting best practices and the same Blockchain Council guide:
- Word/token budget: "Respond in under 200 words"
- Format restriction: "Use bullet points only. No preamble"
- Audience and scope: "Assume the reader is an engineer. Skip basic definitions"
- Stop conditions: "Do not provide examples unless asked"

> "In practice, the best results come from combining a firm budget instruction with a strict structure requirement."

Source: <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices>

### Three-layer self-validating agent architecture (directly relevant)

From claudefa.st's Self-Validating Claude Code Agents:

1. **Micro validation** (PostToolUse hooks) — runs linters/formatters/typecheckers per file
2. **Macro validation** (Stop hooks) — blocks completion until structural requirements pass; uses STOP_HOOK_ACTIVE check to prevent infinite loops
3. **Team validation** (Read-only validator agent) — fresh-context independent review with `disallowedTools: Write, Edit, NotebookEdit`; "builder-validator pattern at orchestration level"

> "Stack all three layers: embedded hooks handle 90% of quality issues automatically, while the independent validator catches architectural mismatches the builder cannot self-detect."

Source: <https://claudefa.st/blog/tools/hooks/self-validating-agents>

**Note:** lz-advisor cannot use hooks (PROJECT.md "No hooks for v1" decision). The 3-layer architecture maps to lz-advisor as:
- Micro = each agent's Output Constraint section (already exists)
- Macro = smoke fixtures (currently DEF/KCB/HIA/J)
- Team = subagent UAT replay (gsd-execute-phase reviews the changes)

### Outcome-based verification (transcript parsing fails)

From the AI coding agents lie about their work analysis:

> "Most orchestration tools verify work by reading transcripts. The agent says 'committed 3 files' or 'all tests passing' and the verifier pattern-matches those strings as evidence of completion. That's trusting the agent's self-report."

Five-check validation: `git_diff` / `build_exec` / `test_exec` / `file_existence` / `transcript` (last one demoted to supplementary).

Source: <https://dev.to/moonrunnerkc/ai-coding-agents-lie-about-their-work-outcome-based-verification-catches-it-12b4>

## Synthesis

The research converges on:

1. **Descriptive prose + worked examples** is Anthropic's own pattern. Imperatives reserved for safety-critical rules.
2. **Length caps cost measurable quality** (~3% on coding tasks). Tighter cap is not free.
3. **Smoke fixtures must validate on disk**, not parse transcripts (extends the smoke-test trace-grepping convention in `KCB-economics.sh` and `DEF-response-structure.sh` already).
4. **Combining a firm budget instruction with strict structural constraints** outperforms either alone.

For lz-advisor's three agents:

- The pattern matching Anthropic's own approach: **descriptive triggers + worked example + structural sub-caps + smoke fixture per agent**.
- Cap re-evaluation (option 2 from original framing) is empirically defensible IF the smoke fixture shows structural sub-caps still produce useful output above 300w.
- Hard-rules layer (option 3) carries quality cost (~3% coding-task drop per Anthropic's ablation) — defer unless next regression cycle confirms it's needed.

The 3-layer architecture maps cleanly: Output Constraint (micro) + smoke fixture (macro) + UAT replay (team). All three already exist for lz-advisor; Phase 7 strengthens layer 1 + adds layer 2 fixtures for reviewer/security-reviewer.

## Updated trade-off table for the user

| Approach | Empirical anchor | Pros | Cons |
|---|---|---|---|
| **Descriptive triggers + worked example + smoke fixture per agent** | Matches Anthropic's own production prompt (PromptHub Claude 4 analysis); aligns with claudefa.st's three-layer macro-validation pattern; +smoke catches regressions | Cheap; preserves existing prompt shape; reversible | If +37-46% regression is structural (not prompt-shape), this layer alone may be insufficient — needs follow-up cycle to confirm |
| **Cap re-evaluation with structural sub-caps** | Aligns with Blockchain Council guidance ("combine firm budget instruction with strict structure") | Honest about Threat Patterns being legitimately multi-finding-spanning; smoke fixture parses sub-cap structure | Admits original cap was empirically wrong; sub-cap parsing more complex |
| **Hard-rules layer (alongside tool_uses discipline)** | Matches Anthropic's safety-critical ALL-CAPS pattern (PromptHub) | Closes the regression definitively | Anthropic's own ablation shows ~3% coding-quality cost from cap addition; risks suppressing useful Threat Patterns content |
| **Hybrid: descriptive triggers + sub-caps + smoke fixture** | Combines Anthropic's prose style + structural rigor recommendation | Most aligned with research-backed pattern; fixture-detected sub-cap regression localizes future fixes | More moving parts; sub-cap thresholds need empirical baseline (currently no per-section measurement) |
