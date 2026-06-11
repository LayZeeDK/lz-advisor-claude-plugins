# Architecture Research

**Domain:** Claude Code marketplace plugin (Markdown/YAML prompt-engineering artifacts; no runtime). Integration of a new output-format change (fully spelled-out severity labels) into an existing scan -> consult -> render-verbatim review pipeline.
**Researched:** 2026-06-07
**Confidence:** HIGH (pure codebase analysis of committed plugin sources; no external dependency on stale docs)

## Scope Note

This is an integration-architecture study for milestone v1.0.1 "No review report shorthands." It evaluates WHERE the spelled-out-label change should live and HOW each of three candidate architectures integrates with the existing render-verbatim contract. The generic web-app template sections (scaling tiers, request/response data flow) do not map onto a Markdown-prompt plugin; they are reframed to the relevant axes: contract surfaces, blast radius, regression-gate impact, and build order.

## Standard Architecture (Existing Pipeline)

### System Overview

The review and security-review skills share one three-phase pipeline. Severity labels are emitted by the Opus agent in a compact fragment grammar and reach the user UNCHANGED because Phase 3 renders the agent response verbatim.

```
USER invokes /lz-advisor:review (or :security-review)
        |
        v
+--------------------------------------------------------------+
|  EXECUTOR (session model, Sonnet-optimized)  -- the SKILL    |
|                                                              |
|  Phase 1: SCAN                                               |
|    - mechanical scope from git diff / ls-files (Mechanism C) |
|    - curate 3-5 findings, file:line, initial severity        |
|    - pre-empt Class-2 surfaces -> <pre_verified> pv-* blocks  |
|                                                              |
|  Phase 2: CONSULT                                            |
|    - package Verification template + spawn Opus agent        |
|      via Agent(lz-advisor:reviewer | :security-reviewer)     |
|                            |                                 |
|                            v                                 |
|             +-------------------------------+                |
|             |  OPUS AGENT (maxTurns 3,      |                |
|             |  effort medium, [Read,Glob])  |                |
|             |                               |                |
|             |  Output Constraint:           |                |
|             |   ### Findings  (literal hdr) |                |
|             |   <file>:<ln>: crit:/imp:/    |  <-- SHORTHAND  |
|             |     sug:/q: <problem>. <fix>. |      EMITTED    |
|             |   [<OWASP-tag>] (sec only)    |      HERE       |
|             |   <verify_request .../>       |                |
|             |   ### Cross-Cutting Patterns  |                |
|             |     | ### Threat Patterns      |                |
|             |   per-section <output_        |                |
|             |     constraints> word budgets |                |
|             +-------------------------------+                |
|                            |                                 |
|                            v                                 |
|  Phase 3: OUTPUT (render-verbatim contract)                 |
|    - prepend "## Review Summary / Reviewed: <scope>"         |
|    - emit agent response UNCHANGED (no reformat, no rename)   |
|    - one-shot <verify_request> escalation (re-invoke once)   |
|    - append "**Verdict scope:** scope: ..."                  |
+--------------------------------------------------------------+
        |
        v
USER sees report containing `crit:` / `imp:` / `sug:` / `q:`  <-- the v1.0.1 problem
```

### Component Responsibilities

| Component | File(s) | Owns | Touches the severity label? |
|-----------|---------|------|-----------------------------|
| Reviewer agent prompt | `plugins/lz-advisor/agents/reviewer.md` | Fragment grammar, severity prefix legend, `<output_constraints>`, 8+ worked examples, Hedge Marker frame, Class-2 hook | EMITS `crit:`/`imp:`/`sug:`/`q:` |
| Security-reviewer agent prompt | `plugins/lz-advisor/agents/security-reviewer.md` | Same as above + OWASP `[A0N]` tags + Class 2-S carve-out | EMITS `crit:`/`imp:`/`sug:`/`q:` + `[A0N]` |
| Review skill | `plugins/lz-advisor/skills/review/SKILL.md` | Scan/consult/output phases; render-verbatim contract; "named sections with literal headers" rule; escalation hook | Passes labels through UNCHANGED (Phase 3) |
| Security-review skill | `plugins/lz-advisor/skills/security-review/SKILL.md` | Same as review skill + Threat Model Context required | Passes through UNCHANGED |
| Context-packaging reference | `plugins/lz-advisor/references/context-packaging.md` | Common Contract (Rules 5/5a/5b/5c/5d/6/7); Verify Request Schema; pv-* discipline; Hedge Marker carve-out severity vocab | References full labels in templates; WR-01 carve-out names the severity vocab |
| Smoke fixtures (NOT in repo) | `D-reviewer-budget.sh`, `D-security-reviewer-budget.sh` | FRAGMENT_RE parse + `wc -w` per-section budget assertions | Parser regex matches the shorthand prefixes |

### CRITICAL pre-finding: the smoke fixtures are not committed

`D-reviewer-budget.sh` and `D-security-reviewer-budget.sh` are referenced by name inside `agents/reviewer.md` (line 189) and `agents/security-reviewer.md` (line 194) and throughout the milestone context, but **they do not exist anywhere on disk -- neither tracked nor untracked.** Verified three ways: `git ls-files` (0 matches), `git grep -l FRAGMENT_RE` (0 matches), and `rg -uu -l FRAGMENT_RE` across the whole tree (only the two agent prompts + planning docs reference the NAME, never a script body). The `.planning/phases/` workspace where they lived was removed at v1.0 completion (Phase 10). The only committed test scripts are `tests/validate-phase-03.sh` and `tests/validate-phase-04.sh`, which use `git grep` content assertions, not FRAGMENT_RE word-budget parsing.

Consequence for every candidate: "update the FRAGMENT_RE fixtures in lockstep" actually means **re-author the fixtures from the agent-prompt contract first** (recovering the 3-slot reviewer / 4-slot security-reviewer regex shape documented in STATE.md Phase 08 decisions: `### Findings`, `crit:|imp:|sug:|q:` capture, OWASP `[A0N]` bracket preserved for security), then commit them under `tests/` so the lockstep update is meaningful and durable. Any roadmap that assumes the fixtures are sitting in the repo waiting to be edited is wrong. This is build-order step zero for all three options.

## Candidate Architectures

The three options differ in WHICH layer expands the label and therefore which contracts and gates take the blast.

### System placement of the change

```
Option A: agent emits full labels        Option B: skill expands at output       Option C: agent emits severity sections
-----------------------------------       -----------------------------------     -----------------------------------------
[AGENT]  ### Findings                     [AGENT]  ### Findings                    [AGENT]  ### Findings
  Critical: <problem>. <fix>.               crit: <problem>. <fix>.    (unchanged)    ### Critical
  Important: ...                          [SKILL Phase 3]                              <file>:<ln>: <problem>. <fix>.
[SKILL Phase 3] render verbatim (untouched) mechanical s/crit:/Critical:/ EXPANSION   ### Important ...
[USER] full labels                       [USER] full labels                       [SKILL Phase 3] render verbatim
                                          ^^ carve-out from verbatim contract       [USER] severity-grouped report
```

---

### Option A: Change the agent emit grammar to spell out labels

**What:** Replace the `crit:`/`imp:`/`sug:`/`q:` prefixes with `Critical:`/`Important:`/`Suggestion:`/`Question:` inside the `### Findings` fragment grammar of both review agents. The render-verbatim contract is untouched -- the skill keeps passing the response through unchanged; the response simply already contains full words.

**Integration points (files modified -- all MODIFIED, none NEW except re-authored fixtures):**

| File | Change |
|------|--------|
| `agents/reviewer.md` | Severity prefix legend (lines 64-67); `Format:` lines (59, 61); ALL worked examples (lines 96, 104, 112, 117, 121, 127-134) -- 8+ inline-code finding lines; the holistic example (123-144); Hedge-frame example (121); Class-2 example (117). Auto-clarity prose if it references prefixes. |
| `agents/security-reviewer.md` | Same surfaces (lines 64-68 legend; 60, 62 format; examples 98-128, 135-141 holistic); the `[A0N]` OWASP tag is orthogonal and stays. Class 2-S CVE carve-out example (127). |
| `tests/D-reviewer-budget.sh` (re-authored) | FRAGMENT_RE severity capture group changes from `(crit|imp|sug|q)` to `(Critical|Important|Suggestion|Question)`. |
| `tests/D-security-reviewer-budget.sh` (re-authored) | Same regex change; OWASP `[A0N]` slot preserved. |
| `references/context-packaging.md` | Low/none. Templates already use full words (`Severity (initial): [Critical/Important/Suggestion]`). WR-01 Hedge Marker carve-out severity vocab unaffected. Verify against lines 290, 320. |
| 5-surface version bump | plugin.json + README + any version mirrors per the atomic-5-surface convention. |

**Blast radius:** Largest *prompt-editing* surface (8+ worked examples per agent must change in lockstep with the legend, or the few-shot examples will pull the model back toward shorthand -- Sonnet/Opus follow the demonstrated shape over the stated rule). But the *architectural* blast radius is the smallest: zero new contract, the verbatim contract is preserved as an absolute, and the section grammar (`### Findings` / `### Cross-Cutting Patterns` / `### Threat Patterns`) is unchanged.

**Risk to existing validated behaviors:**

| Behavior | Risk | Why |
|----------|------|-----|
| Word budgets (`wc -w`, per-section caps) | LOW. `Critical:` is one word like `crit:`; per-entry `<=22w/<=28w` budgets are word-neutral. The original token-economy motive for shorthand does not bind because budgets count words, not characters. | The milestone's own key insight. |
| Hedge Marker Discipline (`Unresolved hedge:` literal frame) | NONE if examples are edited carefully. The frame is independent of the severity prefix. | Frame greps for `Unresolved hedge:` token, not severity. |
| Class-2 Escalation Hook (`<verify_request severity="...">`) | LOW. The `severity=` ATTRIBUTE already uses full words (`critical|important|suggestion`). Only the inline finding-line prefix changes. Keep attribute lowercase, line prefix Title-case -- document the asymmetry. | Lines 117/261-268 reviewer; 117/270-279 sec-reviewer. |
| Two-slot output (`### Findings` + patterns header) | NONE. Section headers unchanged. | Option A does not touch section shape. |
| OWASP tags `[A0N]` | NONE. Orthogonal to severity prefix. | Tag is a separate `[...]` token. |
| Cross-agent consistency | LOW-MEDIUM. Advisor already uses full-word `**Critical:**` blocks (agents/advisor.md). Option A brings reviewers into alignment with the advisor's spelled-out style -- a consistency *gain*. Execute SKILL.md line 261 references `### Findings entries with severity tags` -- verify that prose still reads correctly. | Advisor not in milestone scope but sets the precedent. |

**Best for:** This milestone's stated preference. Cleanest architecture, preserves the absolute verbatim contract, and aligns reviewer style with the advisor. The cost is mechanical breadth (every example) but each edit is trivial and the fixture catches regressions.

---

### Option B: Keep agent shorthand; add a mechanical label-expansion rule to the skill output phase

**What:** Agents keep emitting `crit:`/`imp:`/`sug:`/`q:`. The skill's Phase 3, before rendering, applies a narrowly-scoped mechanical substitution (`crit:`->`Critical:`, etc.) to the agent response, then emits the expanded text. This is a deliberate carve-out from the "render the response verbatim, unchanged" contract.

**Integration points:**

| File | Change |
|------|--------|
| `skills/review/SKILL.md` | Phase 3 `<output>` block (lines 162-204): add an explicit, bounded "Mechanical Severity Expansion" sub-step that defines the EXACT and ONLY permitted transform (a fixed 4-entry substitution table on line-leading prefixes inside `### Findings`), then re-states verbatim for everything else. The "Do NOT reformat into severity groups / Do NOT rename headers" list (177-183) must be amended to add "the ONLY permitted modification is the 4-entry severity-prefix expansion." |
| `skills/security-review/SKILL.md` | Same Phase 3 amendment (lines 148-172). Substitution must not touch the `[A0N]` tag. |
| `agents/reviewer.md`, `agents/security-reviewer.md` | Minimal -- grammar unchanged. Possibly a one-line note that the skill expands the prefix downstream so the agent should not also spell it out (avoid double-expansion / `Critical: Critical:`). |
| `tests/D-*-budget.sh` (re-authored) | FRAGMENT_RE keeps matching shorthand (agent output is still shorthand). NEW assertion needed: a fixture (or skill-output fixture) that the USER-FACING text contains full labels and zero shorthand. The existing budget fixtures parse the agent response, not the skill's post-expansion output -- so they do NOT cover the new behavior. This is a coverage gap unique to B. |
| 5-surface version bump | Same. |

**Blast radius:** Smallest *prompt-editing* surface (grammar and examples untouched). But the largest *architectural / behavioral* blast radius, because it converts the verbatim contract from absolute to "verbatim except for an enumerated transform."

**Risk to existing validated behaviors:**

| Behavior | Risk | Why |
|----------|------|-----|
| Render-verbatim fidelity (the contract that exists *because of empirical paraphrase/fidelity-loss failures*) | HIGH -- this is the central risk. Once the skill is permitted to mutate the agent response at all, the executor (Sonnet) has demonstrated paraphrase creep: it tends to "tidy," re-order, or summarize when given any editing license. The verbatim contract was introduced precisely to stop that. A carve-out reopens the door. | PROJECT.md / milestone context call out paraphrase/fidelity-loss as the reason the contract is hard. |
| Word budgets | LOW for the budget itself; but the budget fixtures parse the AGENT output (still shorthand), so they no longer validate what the user sees. Coverage shifts away from the user-facing surface. | Fixture target mismatch. |
| Hedge Marker Discipline | MEDIUM. A naive substitution could collide if `crit:` appears inside a `Unresolved hedge:` body or a fix clause. The transform must be anchored to the line-leading `<file>:<ln>: <prefix>:` position only, not a global string replace. Risk of mangling hedge frames if anchoring is loose. | Substitution-anchoring correctness. |
| Class-2 Escalation Hook | MEDIUM. The hook's one-shot re-invocation replaces the agent response (review/SKILL.md step 5). The expansion must run AFTER the re-invocation, on the final response only -- otherwise it expands an intermediate that gets discarded, or double-expands. Ordering dependency. | Phase 3 step ordering. |
| Two-slot output / OWASP tags | LOW if substitution is prefix-anchored and excludes `[A0N]`. | Anchoring again. |

**Best for:** Only if the milestone wanted to keep agent token-economy (it does not -- budgets are word-based) or could not edit the agents. Given the word-neutral finding, B trades a tiny edit surface for a HIGH risk to the most expensively-won invariant in the project. Not recommended as primary.

---

### Option C: Restructure to section-per-severity headers emitted by the agent

**What:** The agent groups findings under `### Critical` / `### Important` / `### Suggestion` / `### Question` subsection headers inside (or replacing) the `### Findings` block, rather than tagging each line with an inline prefix. This is the section-per-severity report shape the milestone flags for evaluation.

**Integration points:**

| File | Change |
|------|--------|
| `agents/reviewer.md` | Largest change. The single `### Findings` section becomes (or contains) per-severity subsections; the `<output_constraints>` block (lines 160-187) must add the new headings and decide their budgets; the section-ordering contract (line 188) changes; ALL worked examples re-grouped; the "header is MANDATORY" rule for empty sections multiplies (4 severity headers, most empty on a typical review). |
| `agents/security-reviewer.md` | Same + OWASP tags now live inside per-severity sections. The Class 2-S full-prose carve-out interacts with grouping. |
| `skills/review/SKILL.md` | The Phase 3 "named sections with literal headers" rule (line 165) and the explicit "Do NOT reformat the response into severity groups" prohibition (line 178) DIRECTLY CONTRADICT Option C -- that prohibition exists today and must be inverted. The output template (171-175) changes shape. |
| `skills/security-review/SKILL.md` | Same inversion (lines 164, 155-161). |
| `references/context-packaging.md` | The Verification template Findings shape (lines 286-294) and the two-slot section model are referenced project-wide; section-per-severity may ripple into how the executor packages initial severities. |
| `tests/D-*-budget.sh` (re-authored) | Biggest fixture change. FRAGMENT_RE must parse per-severity headers AND the now-headerless finding lines; per-section budget assertions must be re-scoped to the new headings; the "header MANDATORY even when empty" assertion multiplies. |
| 5-surface version bump | Same -- but this is arguably a MINOR (contract-shape change) per the project's SemVer-for-contract-change convention, vs PATCH for A/B. |

**Blast radius:** Largest overall -- it changes both the agent emit shape AND the section contract that the skills' output rules and the fixtures consume. It is the only option that contradicts an EXISTING explicit prohibition ("Do NOT reformat the response into severity groups"), so it requires inverting validated skill text rather than extending it.

**Risk to existing validated behaviors:**

| Behavior | Risk | Why |
|----------|------|-----|
| Two-slot output contract | HIGH. Today's contract is exactly two slots (`### Findings` + `### Cross-Cutting Patterns`/`### Threat Patterns`). Section-per-severity adds 2-4 slots and changes the parser's section model. The `Per-finding validation` and `Missed surfaces` optional sections must be re-placed relative to severity groups. | Direct contract restructure. |
| Word budgets | MEDIUM-HIGH. Per-section budgets (lines 160-187) are defined for `findings`/`cross_cutting_patterns`/`missed_surfaces`. Splitting `findings` into 4 severity sections requires re-deriving budgets per section and updating both fixtures' assertion targets. | Budget re-scoping. |
| Hedge Marker Discipline | MEDIUM. The frame currently lives "inside the relevant `### Findings` entry." With grouping it must live inside the relevant severity subsection -- the placement rule text changes in both agents and the Hedge carve-out reference. | Placement rule rewrite. |
| Class-2 Escalation Hook | MEDIUM. `<verify_request>` placement is "INSIDE the `### Findings` section, immediately after the affected finding." That anchor moves into severity subsections; the executor's parse-and-replace scan must find blocks across multiple subsections. | Anchor moves. |
| OWASP tags | LOW. Tags ride with each finding regardless of grouping. | Orthogonal. |
| Empty-section discipline | NEW risk. Most reviews have findings in only 1-2 severities; the "emit header even when body is short" rule would force 4 mostly-empty severity headers, which is noisy and was explicitly avoided by the inline-prefix design. | Report ergonomics regression. |

**Best for:** Only if the requirements phase decides section-grouped reports are a hard UX requirement that outweighs the restructure cost. C also delivers spelled-out labels as a side effect (the section header IS the label), so it can SUBSUME Option A. But it is the highest-risk path and inverts existing validated prohibitions.

## Recommended Build Order (per option, with cross-option step 0)

```
STEP 0 (ALL OPTIONS, do first): Re-author + commit the smoke fixtures
  - Recreate tests/D-reviewer-budget.sh (3-slot FRAGMENT_RE) and
    tests/D-security-reviewer-budget.sh (4-slot, OWASP bracket preserved)
    from the agent-prompt contract. Capture CURRENT (shorthand) behavior so
    they pass on HEAD before any change -- establishes a green baseline.
  - Commit. Now "update fixtures in lockstep" is a real, durable operation.
```

**Recommended primary: Option A.** Dependency-ordered:

```
A1. Step 0 fixtures (baseline green on shorthand).
A2. agents/reviewer.md: rewrite legend + Format lines + ALL worked examples
    to full labels IN ONE COMMIT (examples and rule must move together, or
    few-shot drift). Same commit or paired commit for security-reviewer.md.
A3. Update tests/D-*-budget.sh FRAGMENT_RE severity capture to full words;
    fixtures must now go RED on old shorthand and GREEN on new full-label
    sample output. (Tightening lockstep with A2.)
A4. Verify references/context-packaging.md needs no change (templates already
    full-word); confirm the verify_request severity= attribute asymmetry note.
A5. Atomic 5-surface version bump (PATCH).
A6. Behavioral verification: claude -p /lz-advisor:review against a fixture
    repo; assert user-facing output contains Critical/Important/Suggestion/
    Question and zero crit:/imp:/sug:/q:; assert word budgets still pass.
```

Rationale for ordering: the agent prompt is the source of truth; the fixture must change in the same logical unit so the gate is never lying. Examples-with-legend in one commit prevents the documented few-shot-drift failure mode. Behavioral verification last because it is the only check that catches the model ignoring the rewritten grammar.

**If C is chosen instead** (after a requirements decision): C subsumes A's label goal, so do NOT do both. Order: Step 0 -> invert the skills' "do not reformat into severity groups" prohibitions and output templates FIRST (the skills consume the section contract) -> rewrite agent `<output_constraints>` + section-ordering + examples -> re-scope both fixtures' per-section budgets -> version bump (MINOR) -> behavioral verification including empty-section ergonomics.

**Option B is not recommended** but if forced: Step 0 -> add the bounded expansion sub-step to both skills with strict line-prefix anchoring -> add a NEW user-facing-output assertion fixture (the budget fixtures do not cover the post-expansion surface) -> ensure expansion runs AFTER the Class-2 re-invocation -> version bump -> behavioral verification focused on paraphrase-creep regression (the HIGH risk).

## Data Flow Changes by Option

| Stage | Today | Option A | Option B | Option C |
|-------|-------|----------|----------|----------|
| Agent emits | shorthand prefix | full-word prefix | shorthand prefix (unchanged) | severity-section headers |
| Skill Phase 3 | render verbatim | render verbatim (unchanged) | verbatim + bounded expansion | render verbatim (new section shape) |
| Verbatim contract | absolute | absolute (preserved) | RELAXED (carve-out) | absolute (new shape) |
| Fixture parses | agent output | agent output (new regex) | agent output + NEW user-output check | agent output (new section regex) |
| User sees | shorthand | full labels | full labels | severity-grouped full labels |

## Anti-Patterns (specific to this change)

### Anti-Pattern 1: Editing the legend without editing the worked examples
**What people do:** Change the severity-prefix legend to full words but leave the 8+ `crit:`/`imp:` worked examples intact (they look like "documentation").
**Why it's wrong:** Sonnet/Opus weight demonstrated few-shot shape over stated rules; the agent will regress to shorthand following the examples. This is the dominant failure mode for Option A.
**Do this instead:** Treat the legend and every worked example as one atomic edit unit; never split them across commits.

### Anti-Pattern 2: Assuming the FRAGMENT_RE fixtures exist
**What people do:** Plan "update the fixtures" as a small edit, then discover at execution time that the `.sh` files were never committed.
**Why it's wrong:** They live only in deleted phase workspaces; the roadmap mis-estimates effort and the lockstep gate is vacuous.
**Do this instead:** Re-author and commit the fixtures as build-order step 0 for every option.

### Anti-Pattern 3: Relaxing the verbatim contract for "just a label swap" (Option B)
**What people do:** Add a "small, mechanical" carve-out to the verbatim contract, reasoning that a fixed substitution is safe.
**Why it's wrong:** The contract is absolute by design because empirical paraphrase/fidelity-loss occurred whenever the executor had editing license. Any carve-out is the wedge.
**Do this instead:** Prefer Option A (move the change into the agent), keeping the verbatim contract absolute.

### Anti-Pattern 4: Doing both A and C
**What people do:** Spell out inline labels (A) AND add severity sections (C).
**Why it's wrong:** C's headers already ARE the spelled-out labels; doing both duplicates the severity and bloats the report.
**Do this instead:** Pick one. If section-grouping is required, C subsumes A.

### Anti-Pattern 5: Global string-replace for expansion or label rewrite
**What people do:** `s/crit:/Critical:/g` (B) or unanchored example edits (A).
**Why it's wrong:** `crit:`/`imp:` substrings can appear inside fix clauses, hedge frames, or prose; a global replace mangles them.
**Do this instead:** Anchor to the line-leading `<file>:<ln>: <prefix>:` position only.

## Integration Points Summary

### Modified components (per recommended Option A)
| Component | New or Modified | Notes |
|-----------|-----------------|-------|
| `agents/reviewer.md` | Modified | Legend + format + all examples; verbatim contract untouched |
| `agents/security-reviewer.md` | Modified | Same + OWASP tag preserved + Class 2-S carve-out example |
| `tests/D-reviewer-budget.sh` | New (re-authored) | 3-slot FRAGMENT_RE, full-word capture |
| `tests/D-security-reviewer-budget.sh` | New (re-authored) | 4-slot, OWASP bracket preserved |
| `references/context-packaging.md` | Verify-only / minimal | Templates already full-word; check verify_request severity= asymmetry |
| `skills/review/SKILL.md`, `skills/security-review/SKILL.md` | Unchanged (Option A) | Verbatim contract stays absolute -- this is A's whole advantage |
| version surfaces (5) | Modified | Atomic PATCH bump |

### Internal boundaries affected
| Boundary | Option A | Option B | Option C |
|----------|----------|----------|----------|
| Agent grammar <-> skill verbatim render | unchanged boundary | boundary breached (carve-out) | unchanged boundary, new payload shape |
| Skill output <-> fixture parser | regex retarget | NEW user-output assertion | section-model retarget |
| Agent <-> agent (cross-agent `Assuming X` frame, advisor `**Critical:**` style) | converges (gain) | divergence (reviewers shorthand, advisor full) | converges via sections |

## Sources

- `plugins/lz-advisor/agents/reviewer.md` (committed HEAD) -- fragment grammar, `<output_constraints>`, worked examples, Class-2 hook, Hedge Marker
- `plugins/lz-advisor/agents/security-reviewer.md` (committed HEAD) -- same + OWASP tags, Class 2-S carve-out
- `plugins/lz-advisor/skills/review/SKILL.md`, `skills/security-review/SKILL.md` (committed HEAD) -- render-verbatim contract, "named sections with literal headers", "do not reformat into severity groups" prohibition, escalation hook
- `plugins/lz-advisor/references/context-packaging.md` (committed HEAD) -- Common Contract, Verification template, Verify Request Schema, severity vocab
- `.planning/STATE.md` (committed HEAD) -- Phase 08 decisions documenting the 3-slot/4-slot FRAGMENT_RE shape and the now-removed phase workspace
- `tests/validate-phase-04.sh` (committed HEAD) -- existing committed test approach (git grep assertions, not FRAGMENT_RE)
- `git ls-files` / `git grep -l FRAGMENT_RE` / `rg -uu -l FRAGMENT_RE` -- empirical confirmation the budget fixtures are absent from the repo

---
*Architecture research for: lz-advisor v1.0.1 spelled-out severity label integration*
*Researched: 2026-06-07*
