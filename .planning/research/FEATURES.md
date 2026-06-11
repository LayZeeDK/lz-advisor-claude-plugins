# Feature Research

**Domain:** Severity-labeled code-review report presentation (user-facing output for an AI review agent)
**Researched:** 2026-06-07
**Milestone:** v1.0.1 "No review report shorthands"
**Confidence:** HIGH (all tool behaviors verified against current vendor docs/specs; trade-offs corroborated across multiple independent sources)

## Scope note

This milestone changes ONLY the *presentation* of severity in user-facing `review` / `security-review` reports. The reviewer/security-reviewer agents currently emit findings in a compact fragment grammar with severity shorthands (`crit:` / `imp:` / `sug:` / `q:`), and both skills render the agent response verbatim. The target is fully spelled-out labels (`Critical` / `Important` / `Suggestion` / `Question`), optionally grouped into `### Critical` / `### Important` / ... sections.

This research maps how established review tools present severity so the requirements step can choose: (a) inline label per finding vs (b) grouped-by-severity sections, and decide the mechanical-conversion vs emit-spelled-out trade-off.

## How established tools present severity (verified)

| Tool | Severity vocabulary | Presentation | Cross-ref mechanism |
|------|--------------------|--------------|--------------------|
| **Conventional Comments** (spec) | `praise` / `nitpick` / `suggestion` / `issue` / `todo` / `question` / `thought` / `chore` / `note` (labels = comment *kind*); severity carried orthogonally by decorations `(blocking)` / `(non-blocking)` / `(if-minor)` | **Inline label per comment**, format `<label> [decorations]: <subject>` then optional discussion. One comment, one label. | None (each comment is standalone in a PR thread) |
| **GitHub PR reviews** (convention, not enforced) | Ad-hoc prefixes: `nit:`, `Blocking:`, `[suggestion]`, `Question:`, `FYI:` | **Inline per comment** on the diff. UI itself only encodes one binary signal (approve / request-changes); severity lives in the comment text prefix. | None native; reviewers say "see comment above" (positional, fragile) |
| **CodeRabbit** | Four severity buckets (critical / major / + filterable) PLUS orthogonal "comment type" (potential issue / refactor / nitpick) and "effort" (quick win / heavy lift) | **Hybrid**: high-level walkthrough summary + per-file inline comments tagged with severity. Newer "Change Stack" groups diff into cohorts. Custom team reports group by Priority (High/Medium/Low). | Filterable/sortable by bucket |
| **reviewdog** | Three levels: `error` / `warning` / `info` (RDFormat `severity` field; LSP-inspired) | **Inline per diagnostic** at file:line. Severity is a structured field, not grouped sections. `-level` overrides reporting, `-fail-level` gates exit code. | Structured `Diagnostic` objects with optional `Code` (rule id) |
| **SonarQube** | Legacy 5-level: `Blocker` / `Critical` / `Major` / `Minor` / `Info`. New (10.2+): `High` / `Medium` / `Low` | **Grouped + counted by severity**, ordered highest-to-lowest impact. Severity also rolls up into A-E letter ratings. Often crossed with issue *type* (Bug / Vulnerability / Code Smell). | Issue IDs; dashboard filters |
| **Semgrep** | New 4-level: `Critical` / `High` / `Medium` / `Low`. Legacy CLI: `ERROR` / `WARNING` / `INFO` (= High/Medium/Low) | **Inline per finding** in text output; severity is a per-finding attribute. `--severity` filters which run. | Rule ID per finding |
| **Danger (JS/Ruby)** | Three-tier by function: `fail` (blocking) > `warn` (non-blocking) > `message` (info); each has a distinct icon | **Grouped by function into one HTML table** (fails together, warns together), free-form `markdown()` below. Inline supported via optional `file`/`line`. | Markdown table rows; no finding numbers by default |

**Key cross-tool findings:**

1. **Spelled-out severity is universal in user-facing output.** Not one verified tool ships terse single-letter or 3-char severity codes to end users. Conventional Comments uses full words (`issue`, `suggestion`). reviewdog/Semgrep use `error`/`warning` (RDFormat is a *wire* format; rendered output is spelled out). SonarQube/CodeRabbit/Danger all spell severity out fully. The current `crit:`/`imp:`/`sug:`/`q:` shorthand is an outlier driven by an internal token-economy motivation (Phase 7 Plan 07-09) that PROJECT.md notes "may not bind" since word budgets are `wc -w`-based and spelled-out labels are word-neutral.

2. **Two orthogonal axes recur: severity (how urgent) vs kind/intent (what kind).** Conventional Comments separates them cleanly (label = kind, decoration = blocking). CodeRabbit separates severity from "comment type" and "effort". The lz-advisor vocabulary conflates them: `Critical`/`Important`/`Suggestion` are severity tiers; `Question` is a *kind* (a genuine author question, not a severity tier). This matters for grouping -- a `### Question` section is a kind-section sitting alongside severity-sections.

3. **The dominant modern pattern is a HYBRID**: a severity-grouped (or at least severity-counted) summary, PLUS per-finding inline severity at file:line, with findings carrying stable numbers/IDs for cross-referencing. CodeRabbit, SonarQube, and current agent-skill review templates all converge here.

4. **Cross-referencing must survive regrouping.** Multiple sources warn that positional references ("the issue above") break when findings are regrouped into severity sections. The robust pattern is stable finding numbers/IDs (continuous across sections, or severity-prefixed like `CRIT-009`). The current reviewer.md `### Cross-Cutting Patterns` already references findings by ordinal ("Findings 1, 2, and 4 share a root cause...") -- so any grouping change MUST preserve a stable finding-number scheme or that section breaks.

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = report feels incomplete or wrong.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Severity spelled out in full (`Critical`/`Important`/`Suggestion`/`Question`) | Every verified peer tool ships spelled-out severity; `imp:`/`sug:`/`q:` shorthands are jargon a user must decode. This is the milestone's entire reason for existing. | LOW | Word-budget-neutral (`wc -w` counts `imp` and `Important` as 1 word each). The token-economy rationale that motivated shorthands does not bind. |
| One unambiguous severity per finding | Users prioritize by severity; ambiguity defeats the purpose. Inline-per-finding is the most common form (reviewdog, Semgrep, GitHub, Conventional Comments). | LOW | Already present (one shorthand per fragment line) -- only the *label rendering* changes. |
| Highest-severity-first ordering | SonarQube orders Blocker->Info; review-workflow guidance says address high severity first. Users scan top-down. | LOW | Current `### Findings` is a flat list in author-emit order, NOT severity order. Spelled-out-inline alone does NOT deliver this; grouping or sorting does. |
| Finding count per severity (roll-up) | "X issues (Critical: 2, Important: 3...)" lets a user decide shippability at a glance. SonarQube counts per severity; agent-skill templates end with a roll-up. | LOW | Net-new. Cheap to add; high scannability payoff. A grouped layout makes counts implicit (count = section length). |
| Stable finding identifiers that survive reordering | `### Cross-Cutting Patterns` already references "Findings 1, 2, 4". Cross-ref breaks if findings regroup without stable numbers. | MEDIUM | This is the load-bearing dependency for any grouping change (see Dependencies). |

### Differentiators (Competitive Advantage)

Features that set the report apart. Not strictly required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Section-per-severity grouping (`### Critical` / `### Important` / `### Suggestion` / `### Question`) | Maximum scannability: a user reads only the `### Critical` block to triage. Matches SonarQube grouping + agent-skill template convention. Section length IS the per-severity count. | MEDIUM | The milestone explicitly flags this "to be evaluated/decided in requirements." Tension: it restructures the agent's `### Findings` contract that the skill parses + that smoke fixtures (`FRAGMENT_RE`) match. Empty severity sections need an explicit "none" convention (SonarQube shows "(none or list)"). |
| Severity as a leading column / aligned prefix | If staying inline (not grouped), aligning severity as the first token after file:line makes the column visually scannable even in a flat list. | LOW | Cheaper than full grouping; preserves the existing flat `### Findings` parser. The label simply expands `crit:` -> `Critical:` in place. |
| Mechanical label-expansion at the skill layer (vs agent emitting spelled-out) | Preserves the render-verbatim contract: a deterministic find/replace (`crit:`->`Critical:`) cannot paraphrase or drop findings, satisfying PROJECT.md's "cannot paraphrase or drop findings" constraint. | MEDIUM | Trade-off vs having the agent emit spelled-out labels directly (simpler, but the agent could drift). A mechanical step is auditable and regression-testable but adds a skill-layer transform that must be exactly lossless. |
| Decoration / kind separation (Conventional-Comments style) | Splitting "is this blocking?" from "what kind is it?" is the cleanest model. `Question` is really a *kind*, not a severity. | HIGH | OUT OF SCOPE for v1.0.1 -- it re-architects the vocabulary, not just the rendering. Note for future-consideration. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for this specific milestone.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Numeric severity scores (e.g., 1-10 risk score) | Feels precise, sortable | A verified security tool *removed* its numeric score because "a number turns a highlighter into a judgment -- people anchor on the number instead of reading the findings." Adds calibration burden with no upside for a 4-tier scheme. | Keep the 4 named tiers; they are already the industry norm. |
| Emoji / icon severity markers (Danger-style fail/warn icons) | Visually punchy | Violates the project's hard no-emoji / ASCII-only constraint (CLAUDE.md). Mojibake on Windows cp1252. | ASCII section headers (`### Critical`) or text labels carry the signal. |
| Expanding the severity vocabulary (adding Blocker/Major/Minor, or Conventional-Comments' 9 labels) | "More granular = better triage" | Scope creep beyond "spell out the existing labels." More tiers = worse scannability ("if AI highlights everything, it highlights nothing"). The 4 tiers are already validated (Phase 4). Security-review uses a *different* set (Critical/High/Medium) -- do not unify them in this milestone. | Spell out the EXISTING per-skill vocab only. Vocabulary change is a separate decision. |
| Paraphrasing findings into prose during the expansion step | "More readable than fragments" | Directly violates the render-verbatim contract and PROJECT.md's "cannot paraphrase or drop findings." Re-introduces the exact drift the fragment grammar was built to prevent. | Mechanical label-only substitution; leave the `<problem>. <fix>.` body byte-identical. |
| A severity *column table* (`\| Severity \| File \| Finding \|`) | Looks structured | Markdown tables wrap badly in terminals, and the current `file:line:` prefix grammar is already column-like. Tables also complicate the `FRAGMENT_RE` smoke parser. | Keep one-line-per-finding fragment shape; expand the label token only. |

## Feature Dependencies

```
[Spelled-out severity labels]  (the milestone core)
    |
    |--requires--> [Agent Output Constraint update]
    |                 (reviewer.md + security-reviewer.md severity-prefix block
    |                  + worked examples currently show crit:/imp:/sug:/q:)
    |
    |--requires--> [FRAGMENT_RE smoke-fixture update in lockstep]
    |                 (D-reviewer-budget.sh / D-security-reviewer-budget.sh
    |                  parse findings by the shorthand regex)
    |
    '--may-require--> [references/context-packaging.md severity-vocab sync]
                          (WR-01 Hedge Marker carve-out references the vocab)

[Section-per-severity grouping]  (optional differentiator)
    |
    |--requires--> [Stable finding-number scheme]
    |                 (### Cross-Cutting Patterns references "Findings 1,2,4"
    |                  by ordinal; regrouping breaks ordinals unless numbered)
    |
    |--conflicts--> [Author-emit-order flat ### Findings list]
    |                 (grouping reorders; the skill parser + verbatim contract
    |                  assume a single ### Findings block)
    |
    '--requires--> ["none" convention for empty severity sections]

[Mechanical label-expansion at skill layer]
    '--conflicts (tension)--> [Render-verbatim contract]
          (resolved only if the transform is provably lossless:
           label-token substitution, never body rewrite)
```

### Dependency Notes

- **Spelled-out labels requires Agent Output Constraint + smoke-fixture update in lockstep:** The shorthands live in the `### Findings` severity-prefix block AND in 5+ worked examples in `reviewer.md` (lines 64-67, 96-134) and the parallel `security-reviewer.md`. The `FRAGMENT_RE` in `D-reviewer-budget.sh` / `D-security-reviewer-budget.sh` parses findings by that regex; PROJECT.md mandates updating it "in lockstep so budget gates still parse findings." Changing one surface without the other breaks either the contract or the gate.
- **Section-per-severity grouping requires stable finding numbers:** `### Cross-Cutting Patterns` ("Findings 1, 2, and 4 share a root cause") cross-references by positional ordinal. If findings are regrouped into severity sections, ordinals scramble unless an explicit, stable numbering scheme is introduced (continuous across sections, per the verified best practice). This is the single highest-complexity coupling in the milestone.
- **Section-per-severity conflicts with the flat `### Findings` block:** Both review skills parse the agent's response around the literal `### Findings` and `### Cross-Cutting Patterns` headers (reviewer.md "Output Constraint"). Replacing one `### Findings` block with four `### Critical`/`### Important`/... blocks changes the output contract the skill enforces and the smoke fixtures assert.
- **Mechanical expansion has a designed tension with render-verbatim:** PROJECT.md states "any skill-layer conversion must be a mechanical label expansion that cannot paraphrase or drop findings." A pure label-token substitution (`crit:`->`Critical:`) is lossless and testable; anything that touches the finding body re-opens the drift problem.

## MVP Definition

### Launch With (v1.0.1)

Minimum to satisfy the milestone goal -- "no shorthands in user-facing output."

- [ ] **Full severity labels inline** (`Critical:` / `Important:` / `Suggestion:` / `Question:` for review; the security-review set `Critical:`/`High:`/`Medium:` per its existing vocab) -- the milestone's reason for existing; word-budget-neutral.
- [ ] **Updated agent Output Constraint + worked examples** in `reviewer.md` and `security-reviewer.md` so the agent emits (or the skill expands to) spelled-out labels -- the source surfaces that currently teach the shorthand.
- [ ] **`FRAGMENT_RE` smoke fixtures updated in lockstep** (`D-reviewer-budget.sh`, `D-security-reviewer-budget.sh`) so budget gates still parse findings.
- [ ] **`references/context-packaging.md` severity-vocab sync** (WR-01 Hedge Marker carve-out references the vocab) to avoid the schema/lexicon drift called out in PROJECT.md.
- [ ] **Atomic 5-surface version bump** per the existing convention.

### Add After Validation (v1.x)

- [ ] **Section-per-severity grouping** (`### Critical` / `### Important` / ...) -- trigger: the requirements step decides grouping is worth restructuring the `### Findings` contract. Requires the stable-finding-number dependency resolved first.
- [ ] **Per-severity roll-up count** ("Critical: 2, Important: 3...") -- trigger: users want a triage-at-a-glance line; cheap once labels are spelled out.
- [ ] **Highest-severity-first ordering** of the flat list (if grouping is NOT adopted) -- trigger: users report scanning friction in author-emit order.

### Future Consideration (v2+)

- [ ] **Severity/kind axis separation** (Conventional-Comments model: severity decoration vs comment-kind label; reclassify `Question` as a kind not a tier) -- defer: re-architects the vocabulary, not just rendering; out of this milestone's scope.
- [ ] **Stable severity-prefixed finding IDs** (`CRIT-009`) for durable cross-referencing across reports -- defer: only valuable if reports are persisted/diffed across runs.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Spelled-out severity labels (inline, in-place) | HIGH | LOW | P1 |
| Agent Output Constraint + worked-example update | HIGH (enabler) | LOW | P1 |
| `FRAGMENT_RE` smoke-fixture update in lockstep | HIGH (gate integrity) | LOW | P1 |
| context-packaging.md vocab sync | MEDIUM (drift prevention) | LOW | P1 |
| Mechanical lossless label-expansion (if chosen over agent-emit) | MEDIUM | MEDIUM | P2 |
| Section-per-severity grouping | MEDIUM | MEDIUM-HIGH (breaks `### Findings` contract + needs stable numbers) | P2 |
| Per-severity roll-up count | MEDIUM | LOW | P2 |
| Highest-severity-first ordering (flat) | MEDIUM | LOW | P2 |
| Numeric scores / emoji / vocab expansion | LOW or negative | -- | P3 (anti-feature) |

**Priority key:**
- P1: Must have for v1.0.1 launch
- P2: Should have / next milestone
- P3: Defer or avoid

## Trade-off: Inline labels vs Section-per-severity grouping

The milestone explicitly asks this to be decided in requirements. Concrete trade-offs from the verified ecosystem:

**Inline label per finding (expand shorthand in place -- lowest-risk path):**
- + Preserves the existing flat `### Findings` block, the skill parser, and the `FRAGMENT_RE` shape (minimal contract churn).
- + `### Cross-Cutting Patterns` ordinal references ("Findings 1, 2, 4") keep working unchanged.
- + Matches reviewdog / Semgrep / GitHub / Conventional Comments (the most common form).
- - No severity ordering by default; a user scanning for `Critical` must read every line.
- - Per-severity count is not visible without manual tallying.

**Section-per-severity grouping (`### Critical` / `### Important` / ...):**
- + Maximum scannability; SonarQube + agent-skill convention. Section length = per-severity count for free.
- + A user can read only the `### Critical` section to triage shippability.
- - Restructures the `### Findings` output contract that both skills parse and smoke fixtures assert.
- - Breaks ordinal cross-referencing unless a stable finding-number scheme is added (the load-bearing dependency).
- - Needs an explicit "none" convention for empty severity sections, and `Question` (a kind, not a severity) sits awkwardly as a peer section.

**Hybrid (industry default):** a severity-grouped summary + inline labels + continuous finding numbers. Highest scannability, highest cost. Likely a v1.x target, not v1.0.1, because it compounds every dependency above.

**Recommendation for requirements:** Ship **inline spelled-out labels in place** for v1.0.1 (P1, low risk, directly satisfies the goal). Evaluate **grouping + roll-up counts** as a fast-follow once the stable-finding-number dependency is designed -- grouping without stable numbers will silently break `### Cross-Cutting Patterns`.

## Competitor Feature Analysis

| Feature | Conventional Comments | SonarQube | CodeRabbit | Our Approach (recommended) |
|---------|----------------------|-----------|------------|---------------------------|
| Severity rendering | Full-word labels + blocking decoration | Full-word, ordered, counted | Full-word buckets + filters | Full-word labels, expanded in place from existing 4-tier vocab |
| Layout | Inline per comment | Grouped + counted by severity | Hybrid (summary + inline + cohorts) | Inline now; grouped + roll-up as v1.x |
| Severity vs kind | Separated (label=kind, decoration=severity) | Severity x type matrix | Severity x type x effort | Keep conflated for v1.0.1; separation is future-consideration |
| Cross-referencing | None (PR threads) | Issue IDs | Bucket filters | Preserve existing ordinal "Finding N"; need stable numbers before grouping |
| Numeric score | No | Letter ratings (A-E) | No (filters) | No -- avoid (anchoring anti-pattern) |

## Sources

- [Conventional Comments specification](https://conventionalcomments.org/) -- label vocabulary (praise/nitpick/suggestion/issue/todo/question/thought/chore/note) and decoration syntax (blocking/non-blocking/if-minor); confirms labels = kind, decorations = severity. HIGH.
- [CodeRabbit custom reports docs](https://docs.coderabbit.ai/guides/custom-reports) + [Change Stack / Atlas blog](https://www.coderabbit.ai/blog/introducing-atlas-the-first-ai-native-code-review-interface) -- severity buckets, hybrid inline + grouped cohorts, grouping by priority. HIGH.
- [reviewdog Diagnostic Format (DeepWiki)](https://deepwiki.com/reviewdog/reviewdog/3.2-reviewdog-diagnostic-format) + [reviewdog repo](https://github.com/reviewdog/reviewdog) -- error/warning/info levels, LSP-inspired structured severity, -level / -fail-level. HIGH.
- [SonarQube Issues docs (10.3)](https://docs.sonarsource.com/sonarqube-server/10.3/user-guide/issues) + [metrics definition](https://docs.sonarsource.com/sonarqube-server/user-guide/code-metrics/metrics-definition) -- 5-level legacy + 3-level (10.2+) severity, grouping/counting, highest-first ordering, A-E ratings. HIGH.
- [Semgrep CLI reference](https://semgrep.dev/docs/cli-reference) + [understand-severities KB](https://semgrep.dev/docs/kb/rules/understand-severities) -- Critical/High/Medium/Low (new) vs ERROR/WARNING/INFO (legacy), per-finding severity, --severity filter. HIGH.
- [Danger reference](https://danger.systems/reference) + [Danger JS](https://danger.systems/js/) + [messaging plugin source](https://github.com/danger/danger/blob/master/lib/danger/danger_core/plugins/dangerfile_messaging_plugin.rb) -- fail/warn/message tiers grouped into one table, optional inline file/line, markdown table with Severity column. HIGH.
- [Code review comment prefixes (emmer.dev)](https://emmer.dev/blog/code-review-comment-prefixes/) + [What does "nit" mean (Augment)](https://www.augmentcode.com/guides/what-does-nit-mean-in-code-review) + [Nitpicks vs must-fix (Propel)](https://www.propelcode.ai/blog/code-review-nitpicks-vs-must-fix-issues) -- GitHub PR severity conventions, blocking/non-blocking, "don't mix severity signals." MEDIUM (community convention, multi-source agreement).
- [Banish "nitpick" / granular severity (codetinkerer)](https://www.codetinkerer.com/2024/01/12/nitpick-code-reviews.html) -- GitHub UI only encodes one binary signal; argument for explicit severity in text. MEDIUM.
- WebSearch synthesis on grouped-vs-inline trade-offs (agent-skill review templates, security tooling) -- hybrid layout, continuous numbering across sections, "a number turns a highlighter into a judgment," "if AI highlights everything it highlights nothing." MEDIUM (multi-source; the numeric-score and over-highlighting cautions appeared in independent sources).

---
*Feature research for: severity-labeled code-review report presentation*
*Researched: 2026-06-07*
