# Claude Opus 4.6 Implementation Optimization Guide

**Model**: Claude Opus 4.6 (1M context, adaptive thinking, effort parameter (GA), max output 128K)

**Purpose**: Optimize implementation workflows for Claude Opus 4.6's strengths

**Related**: [MODEL-OPTIMIZATION-SONNET.md](./MODEL-OPTIMIZATION-SONNET.md), [MODEL-OPTIMIZATION-HAIKU.md](./MODEL-OPTIMIZATION-HAIKU.md)

**Note**: This guide documents **Claude Opus 4.6** - the most capable Claude model for complex reasoning and state-of-the-art software engineering.

**Note**: Opus 4.6 benchmark scores are pending; comparative claims marked "TBD" use Opus 4.5 data as proxy.

---

## Model Characteristics for Implementation

### Claude Opus 4.6 Implementation Strengths

1. **State-of-the-Art Coding** - Frontier performance on SWE-bench Verified (Opus 4.6 scores TBD; Opus 4.5 scored 80.9%)
2. **Hybrid Reasoning Model** - Pushes frontier for coding, agents, computer use
3. **Effort Parameter (GA)** - Control token usage with four levels: low, medium, high, max
4. **Token Efficiency** - Lower effort levels "proceed directly to action without preamble" and use terse confirmations
5. **Adaptive Thinking** - Claude decides when and how much to think; no manual budget_tokens required
6. **Long-Horizon Excellence** - Best for complex, multi-step autonomous tasks
7. **Strongest Tool Use** - One of the best tool-using models available
8. **1M Context Window** - Full 1M token context available on both Claude Code and API
9. **128K Max Output** - Up to 128K output tokens per response
10. **More Direct Communication** - Naturally less verbose, more grounded, may skip verbal summaries for efficiency

**Sources**:

- [What's new in Claude 4.6](https://platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-6)
- [Claude Opus 4.5 Announcement](https://www.anthropic.com/news/claude-opus-4-5) (historical baseline)
- [Claude 4.6 Migration Guide](https://platform.claude.com/docs/en/docs/about-claude/models/migration-guide)

### Context Window Strategy

**Context Availability by Platform**:

| Platform         | 1M Context     | Recommendation                                      |
| ---------------- | -------------- | --------------------------------------------------- |
| **Claude Code**  | Available      | Full 1M context for both Opus 4.6 and Sonnet 4.6    |
| **API Standard** | Available      | Full 1M context for both Opus 4.6 and Sonnet 4.6    |

**Note**: On Opus 4.5, the 1M context window was exclusive to Sonnet. As of Opus 4.6, both models support 1M context on all platforms.

**For Claude Code Users**:

- **<1M tokens**: Use full 1M context with Opus (standard)
- **>1M tokens**: Use progressive disclosure (chunk into phases)

**For API Users**:

- **<1M tokens**: Use full 1M context (standard)
- **>1M tokens**: Use progressive disclosure (REQUIRED)

**Pricing**: $5/M input, $25/M output

**Sources**:

- [What's new in Claude 4.6](https://platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-6) - 1M context for Opus
- [Claude 4.6 Migration Guide](https://platform.claude.com/docs/en/docs/about-claude/models/migration-guide)

---

## Opus 4.6-Specific Optimizations

### Optimization 1: Effort Parameter for Token Control (GA)

**What it is**: The effort parameter controls how many tokens Claude uses when responding, trading off between thoroughness and efficiency. It is **generally available** (GA) on Opus 4.6 -- no beta header required.

**Key behavioral difference from Opus 4.5**: The effort parameter was in beta on Opus 4.5, requiring the `effort-2025-11-24` header. On Opus 4.6, it is GA with no header needed and adds a fourth level: `max`.

**Source**: [Effort - Claude Docs](https://platform.claude.com/docs/en/docs/build-with-claude/effort)

#### Effort Settings

| Effort     | Behavior                                        | Use Case                             |
| ---------- | ----------------------------------------------- | ------------------------------------ |
| **max**    | Deepest reasoning, most tool calls              | Hardest problems, research-grade     |
| **high**   | Explains plan before acting, detailed summaries | Complex reasoning, difficult coding  |
| **medium** | Proceeds directly to action without preamble    | Balanced speed/quality, daily work   |
| **low**    | Fewest tool calls, terse confirmations          | Classification, lookups, high-volume |

**Lower effort levels** (from official docs):

- Combine multiple operations into fewer tool calls
- Make fewer tool calls
- Proceed directly to action without preamble
- Use terse confirmation messages after completion

**Higher effort levels** (from official docs):

- Make more tool calls
- Explain the plan before taking action
- Provide detailed summaries of changes
- Include more comprehensive code comments

**Sources**:

- [Effort - Claude Docs](https://platform.claude.com/docs/en/docs/build-with-claude/effort)

#### Implementation Pattern

````markdown
<effort_parameter_strategy>

## For Implementation Workflows

**Default**: Medium effort
**Reasoning**: Proceeds directly to action without preamble; balanced cost/quality

**When to Override**:

- **High effort**: User explicitly requests "maximum quality" OR task marked "critical"
- **Max effort**: Deepest possible reasoning (new on 4.6); hardest problems only
- **Low effort**: Simple boilerplate tasks (not recommended for implementation)

## Effort Configuration (GA -- no header needed)

```json
{
  "model": "claude-opus-4-6-20260214",
  "effort": "medium"
}
```

**Note**: No beta header required on Opus 4.6. The `effort` parameter is generally available.

</effort_parameter_strategy>
````

**Optimization Impact**: Medium effort provides significant token savings vs high/max effort while maintaining quality

---

### Optimization 2: Adaptive Thinking (Replaces Manual budget_tokens)

**What it is**: On Opus 4.6, adaptive thinking replaces manual `budget_tokens` configuration. Claude automatically decides when and how much to think based on query complexity.

**Key change from Opus 4.5**: On Opus 4.5, extended thinking required manual `budget_tokens` configuration (1K-64K). On Opus 4.6, `budget_tokens` is deprecated (still functional but should be migrated). The recommended approach is adaptive thinking.

**Sources**:

- [Adaptive Thinking - Claude Docs](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking)
- [What's new in Claude 4.6](https://platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-6)

#### Adaptive Thinking Configuration

```json
{
  "thinking": {
    "type": "adaptive"
  }
}
```

**Interaction with effort parameter**:

| Effort | Thinking Behavior                                              |
| ------ | -------------------------------------------------------------- |
| **max**    | Almost always thinks, deepest reasoning                    |
| **high**   | Almost always thinks                                       |
| **medium** | Moderate thinking; may skip for simple queries             |
| **low**    | Minimizes thinking                                         |

The `effort` parameter controls thinking depth automatically. No manual budget management needed.

**Interleaved thinking**: On Opus 4.6, interleaved thinking (thinking between tool calls) is automatic with adaptive thinking. No beta header required (unlike Opus 4.5).

**Deprecated approach (Opus 4.5)**:

```json
// DEPRECATED -- still functional but should migrate to adaptive thinking
{
  "thinking": {
    "type": "enabled",
    "budget_tokens": 16384
  }
}
```

#### Implementation Pattern

```markdown
<adaptive_thinking_opus>

## Opus 4.6 Adaptive Thinking Strategy

**Combine with Effort Parameter**:

- **Medium effort** + adaptive thinking = Balanced implementation (Claude thinks when needed)
- **High effort** + adaptive thinking = Thorough implementation (Claude almost always thinks)
- **Max effort** + adaptive thinking = Maximum quality (deepest reasoning available)

**For implementation workflows**:

1. **Phase 1 (Context)**: Medium effort -- Claude decides thinking depth
2. **Phase 3 (Implementation)**: High or max effort for complex tasks
3. **Phase 4 (Verification)**: Medium effort -- quick integration check

**Opus 4.6 Advantage**: No need to guess budget_tokens. Claude allocates thinking
resources proportionally to actual task complexity.

</adaptive_thinking_opus>
```

---

### Optimization 3: System Prompt Sensitivity (Opus 4.6 Specific)

**Research Finding**:

> "Claude Opus 4.5 is more responsive to the system prompt than previous models, and if your prompts were designed to reduce undertriggering on tools or skills, Claude Opus 4.5 may now overtrigger, with the fix being to dial back any aggressive language."

This sensitivity carries forward to Opus 4.6, with the model being even more direct and grounded in its communication style.

**Source**: [Prompting best practices - Claude Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)

#### Implementation Pattern

````markdown
<system_prompt_calibration>

## Tone Down Aggressive Language

**BAD -- Opus may overtrigger**:

```markdown
CRITICAL: You MUST use the Read tool when examining files!
REQUIRED: You MUST mark tasks complete immediately!
MANDATORY: You MUST run tests after each implementation!
```

**GOOD -- Calibrated for Opus 4.6**:

```markdown
Use the Read tool to examine files.
Mark tasks complete after finishing them.
Run tests after each implementation.
```

## Why This Matters

Opus 4.6's increased sensitivity means:

- **Old prompts** with "MUST" / "CRITICAL" may cause over-triggering
- **Opus 4.6** responds to normal language without emphasis
- **Benefit**: Cleaner, more natural prompting style

## Communication Style (New in 4.6)

Opus 4.6 is naturally more direct and grounded:
- More concise and natural communication
- May skip verbal summaries for efficiency unless prompted otherwise
- Less verbose than 4.5

This means effort: medium combined with Opus 4.6's natural terseness provides
strong preamble suppression without aggressive prompt instructions.

</system_prompt_calibration>
````

---

### Optimization 4: "Think" Keyword as Control Mechanism (Opus 4.6)

**Important change from Opus 4.5**: On Opus 4.5, the word "think" and its variants were problematic when extended thinking was disabled. On Opus 4.6, "Think" keywords are **intentional control mechanisms** that trigger progressively deeper extended thinking.

**Valid control keywords on Opus 4.6**:

- "Think" -- standard depth
- "Think hard" -- deeper reasoning
- "Think harder" -- even deeper reasoning
- "Ultrathink" -- maximum reasoning depth

These keywords work as expected on Opus 4.6 and should NOT be replaced with alternatives.

**Sources**:

- [Prompting best practices - Claude Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)

**Opus 4.5 historical note**: On Opus 4.5, the guidance was to replace "think" with alternatives like "consider," "evaluate," or "reason through" when extended thinking was disabled. This guidance is specific to Opus 4.5 only and does not apply to Opus 4.6.

#### Implementation Pattern

````markdown
<think_keyword_usage>

## On Opus 4.6: "Think" is a Valid Control Mechanism

**Safe to use "think" keywords**:

```markdown
Think about the edge cases before implementing.
Think hard about the architecture.
Think harder about the race conditions.
Ultrathink about the overall design.
```

These trigger progressively deeper extended thinking on Opus 4.6.

## Alternative Words Still Work

For variety or clarity, alternatives are fine but NOT required:

- "consider", "evaluate", "analyze" -- all work
- "think" -- also works correctly on 4.6

## For implementation workflows

Use "think" keywords to control reasoning depth:

- "Think about the dependencies" -- standard reasoning
- "Think hard about the edge cases" -- deeper analysis
- "Ultrathink about the architecture" -- maximum depth

</think_keyword_usage>
````

---

### Optimization 5: Prefilling Removed (Opus 4.6 Breaking Change)

**Breaking change**: Assistant message prefilling is **removed** on Opus 4.6. Attempting to use prefilling returns a **400 error**.

This was a common technique on Opus 4.5 for controlling output format (e.g., prefilling `{` to force JSON output, or prefilling a function name to skip preamble).

**Alternative strategies for preamble elimination**:

1. **Effort parameter**: Use `effort: medium` to "proceed directly to action without preamble"
2. **System prompt**: Direct instructions like "Respond with the answer only, no preamble"
3. **Structured output**: Use tool_use or JSON mode instead of prefilling `{`

**Source**: [Claude 4.6 Migration Guide](https://platform.claude.com/docs/en/docs/about-claude/models/migration-guide)

---

### Optimization 6: Parallel Tool Use (Same as Sonnet)

Opus 4.6 inherits enhanced parallel tool call capabilities.

**Implementation Pattern**: Same as Sonnet optimization

````markdown
<parallel_context_loading>

## Load Multiple Files Simultaneously

```typescript
// Execute in SINGLE message (parallel)
Read(FEATURE_DIR + '/requirements.md');
Read(FEATURE_DIR + '/design.md');
Read(FEATURE_DIR + '/tasks.md');
Read(FEATURE_DIR + '/data-model.md');
Read('guidelines.md');
```

**Speedup**: ~10-20x faster than sequential reads

</parallel_context_loading>
````

---

### Optimization 7: First-Try Correctness & Deep Debugging

**Research Finding**:

> "Opus is tuned to be an 'expert coder,' and in tricky programming challenges, Opus has a higher chance of producing a correct and optimized solution on the first try. It also handles deep debugging better. Opus's stronger logical planning means it can keep track of intricate conditions and long code execution flows with less oversight."

**Sources**:

- [Claude Opus 4.5 vs Sonnet 4.5 - DataStudios](https://www.datastudios.org/post/claude-opus-4-5-vs-claude-sonnet-4-5-full-report-and-comparison-of-features-performance-pricing-a)
- [Claude Sonnet 4.5 vs Opus 4.5 - Cosmic](https://www.cosmicjs.com/blog/claude-sonnet-45-vs-opus-45-a-real-world-comparison)

#### Implementation Pattern

```markdown
<first_try_correctness>

## Leverage Opus 4.6's Expert Coding

**For complex tasks**:

1. **Use adaptive thinking** (effort: high or max)
2. **Minimal constraints** (trust expert judgment)
3. **1M context** available for full codebase awareness

**Opus 4.6 will**:

- Produce correct solution on first try (higher success rate than Sonnet)
- Handle edge cases proactively
- Optimize code structure
- Track intricate conditions across long flows

**When to Use Opus 4.6 Over Sonnet 4.6**:

- Complex algorithms requiring intricate logic
- Deep debugging of subtle bugs (race conditions, timing issues)
- First-time correctness critical (production code, risky refactors)
- Long code execution flows with many conditions

</first_try_correctness>
```

---

### Optimization 8: Vision & Image Processing

**Research Finding**:

> "Claude Opus 4.5 has improved vision capabilities compared to previous Claude models and performs better on image processing and data extraction tasks, particularly when there are multiple images present in context."

These capabilities carry forward and are further enhanced in Opus 4.6.

**Source**: [Prompting best practices - Claude Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)

#### Implementation Pattern (For UI Development)

```markdown
<vision_for_ui_implementation>

## Leverage Opus 4.6's Vision Capabilities

**When implementing UI components**:

1. Take screenshot of reference design
2. Take screenshot of current implementation
3. Compare side-by-side with Opus 4.6

**Crop Tool Technique**:

> "One technique found effective is to give Claude a crop tool or skill, with consistent uplift on image evaluations when Claude is able to 'zoom' in on relevant regions of an image."

**Source**: [Prompting best practices - Claude Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)

</vision_for_ui_implementation>
```

---

## Implementation-Specific Optimizations (Shared with Sonnet 4.6)

### Optimization 9: Structured Prompting with XML Tags

Same as Sonnet 4.6 - use `<role>`, `<task>`, `<constraints>`, `<output_format>`

**Source**: [Prompting best practices - Claude Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)

### Optimization 10: Literal Instruction Following

Same as Sonnet 4.6 - Claude 4.x takes instructions literally

**Source**: [Prompting best practices - Claude Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)

### Optimization 11: Direct Communication (Skip Preamble)

Same as Sonnet 4.6 - be direct and explicit. Opus 4.6 naturally communicates more directly and may skip verbal summaries for efficiency.

---

## Complete Implementation Workflow Example

### Complex Feature Implementation (~500K tokens, 1M context)

````markdown
## Configuration

**Model**: Claude Opus 4.6
**Effort**: Medium (balanced cost/quality, no preamble)
**Thinking**: Adaptive (Claude decides when and how much)
**Context**: 1M available

---

## Phase 1: Context Loading (2 minutes)

**Parallel tool use** (15 seconds):
- Load requirements.md, design.md, tasks.md simultaneously
- Glob for implementation files
- Read guidelines

**Adaptive thinking** (Claude decides depth, ~1 minute):
- Understand architecture
- Identify critical dependencies
- Evaluate complexity level

**Opus 4.6 advantage**: Superior logical planning + 1M context = full codebase awareness

---

## Phase 2: Implementation (First-Try Correctness)

### Task T1.1: Complex State Management (5 min)

**Effort**: Medium (or high for critical tasks)
**Thinking**: Adaptive (Claude allocates as needed)

**Opus 4.6's approach**:

```typescript
// First try is correct - handles all edge cases
export class StatefulComponent {
  readonly #items = [];
  readonly multiMode = false;

  toggle(item) {
    if (item.disabled) return;

    if (!this.multiMode) {
      // Close all other items (exclusive mode)
      this.#items.forEach(i => {
        if (i !== item) i.expanded = false;
      });
    }

    item.expanded = !item.expanded;
  }

  // Edge case: Handle SSR (no DOM)
  afterContentInit() {
    if (isBrowser()) {
      // Only register items in browser
      this.#registerItems();
    }
  }
}
```

**Quality check**:

- Handles exclusive mode correctly (first try)
- Handles disabled state proactively
- Handles SSR edge case (without being asked)
- Clean, maintainable code

---

## Phase 3: Verification

**Adaptive thinking** (Claude decides depth):

- Evaluate integration between tasks
- Consider edge cases across full implementation
- Assess test coverage completeness

**Opus advantage**: Stronger logical planning + full context awareness

---

**Total time**: ~30 minutes
**Context used**: ~500K tokens (1M available)
**Effort**: Medium (balanced cost/quality)
**Thinking**: Adaptive (Claude managed)
**Quality**: State-of-the-art
**First-try success**: Higher than Sonnet 4.6
````

---

## Model Selection Matrix

### Opus 4.6 vs. Sonnet 4.6

| Scenario                       | Best Choice         | Why                                       |
| ------------------------------ | ------------------- | ----------------------------------------- |
| **Complex reasoning required** | Opus 4.6            | Frontier SWE-bench performance             |
| **First-try correctness critical** | Opus 4.6        | Expert coder, higher success rate         |
| **Deep debugging**             | Opus 4.6            | Superior logical planning                 |
| **Daily development**          | Sonnet 4.6          | Faster, cheaper                            |
| **Simple tasks**               | Haiku               | Cheapest, fastest                          |
| **Cost-sensitive**             | Sonnet 4.6 / Haiku  | Opus is premium ($5/$25 vs $3/$15)        |
| **Large context (>200K)**      | Either              | Both Opus 4.6 and Sonnet 4.6 support 1M   |

**Note**: On Opus 4.5, large context (>200K) required switching to Sonnet. On Opus 4.6, both models support 1M context.

**Recommendation**:

- **Use Opus 4.6**: Complex implementations, first-try correctness critical, deep debugging
- **Use Sonnet 4.6**: Daily work, good balance of speed/quality/cost
- **Use Haiku**: Simple tasks, high-volume, rapid iteration

---

## Effort + Adaptive Thinking Combinations

### For Different Task Complexities

| Task Type              | Effort | Thinking   | Use Case               |
| ---------------------- | ------ | ---------- | ---------------------- |
| **Simple**             | Medium | Adaptive   | Quick refactors        |
| **Moderate**           | Medium | Adaptive   | Standard features      |
| **Complex**            | High   | Adaptive   | **Default for Opus**   |
| **Very Complex**       | High   | Adaptive   | Multi-component logic  |
| **Critical/Production**| Max    | Adaptive   | Maximum quality needed |

**Cost Optimization**:

- **Medium effort** provides significant savings vs high effort
- **Adaptive thinking** eliminates manual budget_tokens guesswork
- For most implementations: Medium effort + adaptive thinking is optimal

---

## Common Pitfalls & Solutions

### Pitfall 1: Using High/Max Effort by Default

```markdown
BAD: Always use high or max effort (wastes tokens)

GOOD: Use medium effort (balanced, no preamble)
Only override to high/max for critical tasks
```

**Solution**: Default to medium effort

---

### Pitfall 2: Aggressive System Prompts

```markdown
BAD: "CRITICAL: You MUST use tools!"

GOOD: "Use tools for file operations."
```

**Solution**: Opus 4.6 is more sensitive - use normal language

---

### Pitfall 3: Manual budget_tokens Instead of Adaptive Thinking

```markdown
BAD (deprecated approach):
{
  "thinking": {"type": "enabled", "budget_tokens": 16384}
}

GOOD (Opus 4.6 approach):
{
  "thinking": {"type": "adaptive"}
}
```

**Solution**: Use adaptive thinking; let Claude decide thinking depth

---

### Pitfall 4: Avoiding "Think" Keywords

```markdown
BAD (Opus 4.5 guidance, no longer applies):
"Consider the edge cases..." (avoiding "think")

GOOD (Opus 4.6):
"Think about the edge cases..." (valid control mechanism)
"Think hard about the architecture..." (deeper reasoning)
```

**Solution**: On Opus 4.6, "think" keywords are valid control mechanisms that trigger progressively deeper reasoning. The Opus 4.5 guidance to avoid "think" does not apply.

---

### Pitfall 5: Using Assistant Message Prefilling

```markdown
BAD (returns 400 error on Opus 4.6):
Prefilling assistant message with "{" to force JSON

GOOD:
Use tool_use or JSON mode for structured output
Use effort: medium for preamble elimination
```

**Solution**: Prefilling is removed on Opus 4.6. Use effort parameter and system prompt instructions instead.

---

### Pitfall 6: Not Leveraging First-Try Correctness

```markdown
BAD: Use same TDD approach as Sonnet (error-first)

GOOD: Let Opus implement complete solution first try

- Opus proactively handles edge cases
- Error-first TDD may be redundant for Opus
```

**Solution**: Trust Opus's expert coding - implement fully, then test

---

## Success Metrics

After optimization, expect:

**Quality**:

- SWE-bench: Opus 4.6 scores TBD (Opus 4.5 scored 80.9% vs Sonnet 4.5's 77.2%)
- First-try correctness: Higher than Sonnet
- Deep debugging: Superior
- Edge case handling: More proactive

**Cost** (with medium effort):

- Significant token savings vs high/max effort
- $5/$25 per million tokens

**Speed**:

- Slower than Sonnet 4.6 (more thorough reasoning)
- But higher success rate reduces iteration cycles

**When Opus 4.6 Wins**:

- Complex implementations: Fewer iterations than Sonnet
- Deep debugging: Finds root cause faster
- Long-horizon tasks: Better state tracking, fewer dead-ends
- Large codebase: Full 1M context (no longer Sonnet-exclusive)

---

## Token Efficiency Comparison

**Same task, different effort levels**:

| Configuration                  | Behavior                           | Cost Efficiency |
| ------------------------------ | ---------------------------------- | --------------- |
| Opus 4.6 (max effort)          | Deepest reasoning, most tokens     | Highest cost    |
| Opus 4.6 (high effort)         | Thorough, explains before acting   | High cost       |
| Opus 4.6 (medium effort)       | Direct to action, no preamble      | Balanced        |
| Opus 4.6 (low effort)          | Terse, minimal reasoning           | Lowest cost     |

**Key insight**: Opus 4.6 at medium effort provides the best balance of quality and cost for most tasks

---

## Research Sources

### Anthropic Official

- [What's new in Claude 4.6](https://platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-6) - Model announcement, 1M context, adaptive thinking
- [Effort - Claude Docs](https://platform.claude.com/docs/en/docs/build-with-claude/effort) - Effort parameter (GA), four levels, behavioral differences
- [Adaptive Thinking - Claude Docs](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking) - Replaces manual budget_tokens
- [Claude 4.6 Migration Guide](https://platform.claude.com/docs/en/docs/about-claude/models/migration-guide) - Breaking changes, prefill removal, budget_tokens deprecation
- [Prompting best practices - Claude Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) - System prompt sensitivity, think keywords, communication style

### Opus 4.5 Historical (for comparison context)

- [Introducing Claude Opus 4.5](https://www.anthropic.com/news/claude-opus-4-5) - Original model announcement (200K context, beta effort)
- [What's new in Claude 4.5](https://platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-5) - Opus 4.5 feature overview

### Performance Analysis

- [Claude Opus 4.5 vs Sonnet 4.5 - DataStudios](https://www.datastudios.org/post/claude-opus-4-5-vs-claude-sonnet-4-5-full-report-and-comparison-of-features-performance-pricing-a) - Opus 4.5 performance data
- [Claude Sonnet 4.5 vs Opus 4.5 - Cosmic](https://www.cosmicjs.com/blog/claude-sonnet-45-vs-opus-45-a-real-world-comparison) - Real-world comparison (Opus 4.5)

---

## Quick Reference Card

### Claude Opus 4.6 Optimization Checklist

```
[OK] Medium effort (default) -- balanced cost/quality, no preamble
[OK] High/Max effort (critical tasks) -- maximum quality, first-try correctness
[OK] Adaptive thinking -- Claude decides when/how much to think (replaces budget_tokens)
[OK] Avoid aggressive language -- "Use X" not "MUST use X"
[OK] "Think" keywords work -- "Think", "Think hard", "Ultrathink" trigger deeper reasoning
[OK] Parallel tool use -- load files simultaneously
[OK] Trust first-try correctness -- less iteration needed than Sonnet
[OK] Vision for UI tasks -- compare screenshots, crop for detail
[OK] XML structure -- same as Sonnet 4.6
[OK] Direct communication -- same as Sonnet 4.6; Opus 4.6 naturally more direct
[OK] 1M context -- full codebase awareness (no longer Sonnet-exclusive)
[OK] 128K max output -- large responses supported
[OK] No prefilling -- removed on 4.6 (400 error); use effort parameter instead
```

**Result**: State-of-the-art coding with adaptive thinking and full context awareness

---

## When to Use Opus 4.6 vs. Sonnet 4.6

### Decision Tree

```
Task complexity assessment:

IF task is simple (boilerplate, standard patterns):
  -> Use Haiku or Sonnet 4.6 (Opus overkill)

ELSE IF task is moderate (standard implementation):
  -> Use Sonnet 4.6 (faster, cheaper)

ELSE IF task is complex AND first-try correctness critical:
  -> Use Opus 4.6 (medium effort + adaptive thinking)
  -> Frontier SWE-bench, better first-try rate

ELSE IF deep debugging OR intricate logic:
  -> Use Opus 4.6 (high effort + adaptive thinking)
  -> Superior logical planning, root cause analysis

ELSE IF cost is primary concern:
  -> Use Sonnet 4.6 or Haiku
```

### Cost-Benefit Analysis

| Model      | Cost (Input/Output) | SWE-bench      | First-Try Rate | Best For              |
| ---------- | ------------------- | -------------- | -------------- | --------------------- |
| Haiku      | $0.80/$4.00         | ~70%           | Moderate       | Simple tasks          |
| Sonnet 4.6 | $3.00/$15.00        | ~77%           | Good           | Daily development     |
| Opus 4.6   | $5.00/$25.00        | **Frontier**   | **Excellent**  | **Complex reasoning** |

**Note**: Opus 4.6 benchmark scores are TBD. Opus 4.5 scored 80.9% on SWE-bench Verified. Sonnet 4.5 scored 77.2%. The relative ranking (Opus > Sonnet > Haiku) is expected to hold.

**Opus 4.6 ROI**: Worth premium cost when:

- Reducing iteration cycles (first-try correctness)
- Critical production code (quality > cost)
- Complex debugging (faster root cause identification)
- Multi-component coordination (superior logical planning)
- Large codebase context needed (1M tokens available)

---

## Opus 4.6-Specific Best Practices

### 1. Leverage Effort Parameter for Cost Control

```markdown
**For most implementation tasks**:

- Use medium effort (balanced, no preamble)
- Optimal cost/performance balance

**For critical/complex tasks**:

- Use high effort (thorough reasoning, explains plan before acting)
- Use max effort for hardest problems (new on 4.6)
- Worth the token cost
```

### 2. Trust Adaptive Thinking

```markdown
**Opus 4.6 approach**:

- Let Claude decide thinking depth (adaptive)
- No manual budget_tokens tuning
- Effort parameter controls thinking automatically

**vs. Opus 4.5 approach** (manual budget management):

- Set budget_tokens per task complexity
- Risk of under/over-allocating
- More configuration overhead
```

### 3. Trust First-Try Implementations

```markdown
**Opus 4.6 approach**:

- Implement complete solution
- Run tests once
- High probability of passing first try

**Insight**: Opus's higher first-try rate makes error-first TDD less necessary
```

### 4. Use Vision for UI Components

```markdown
**When implementing UI**:

- Take screenshots of reference design
- Ask Opus to analyze and compare
- Leverage improved vision capabilities
- Consider crop tool for detailed regions
```

### 5. Calibrate System Prompt Language

```markdown
**Opus 4.6 is more sensitive**:

- Use normal language, not aggressive
- "Use X when..." not "CRITICAL: MUST use X"
- Cleaner, more natural prompts
- The model naturally communicates more directly
```

### 6. Use "Think" Keywords for Depth Control

```markdown
**On Opus 4.6**:

- "Think" -- standard reasoning
- "Think hard" -- deeper reasoning
- "Think harder" -- even deeper
- "Ultrathink" -- maximum depth

These are intentional control mechanisms, not problems to work around.
```

---

**Related Documents:**

- [MODEL-OPTIMIZATION-SONNET.md](./MODEL-OPTIMIZATION-SONNET.md) - Sonnet 4.6 patterns
- [MODEL-OPTIMIZATION-HAIKU.md](./MODEL-OPTIMIZATION-HAIKU.md) - Haiku patterns
- [TASK-SPAWNING-GUIDE.md](./TASK-SPAWNING-GUIDE.md) - Multi-agent orchestration

---

**Version**: 2.0.0
**Last Updated**: 2026-04-14
