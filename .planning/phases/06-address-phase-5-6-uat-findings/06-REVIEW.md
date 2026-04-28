---
phase: 06-address-phase-5-6-uat-findings
reviewed: 2026-04-28T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - plugins/lz-advisor/.claude-plugin/plugin.json
  - plugins/lz-advisor/references/context-packaging.md
  - plugins/lz-advisor/references/orient-exploration.md
  - plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.review/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md
findings:
  critical: 0
  warning: 0
  info: 5
  total: 5
status: issues_found
---

# Phase 6: Code Review Report

**Reviewed:** 2026-04-28
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Phase 6 ships Pattern D as a new shared reference (`references/orient-exploration.md`) wired into the four SKILL.md files via inline `<context_trust_contract>` and `<orient_exploration_ranking>` blocks, plus cross-referenced from `references/context-packaging.md` Rule 5. A new Rule 7 (carry prior Strategic Direction across consultations) is added to context-packaging.md. Plugin version bumps to 0.8.5 in `plugin.json` and all four SKILL.md frontmatter `version:` fields.

The work is well-aligned with the phase plan (D-01 through D-06). Cross-references between files all resolve. Plugin and skill versions are consistent. The four SKILL.md files contain identical inline `<context_trust_contract>` and `<orient_exploration_ranking>` blocks, matching the D-02 decision to keep Patterns A / B inline canon and add only an `@`-load line for the new Pattern D reference.

No critical defects or warnings. Five Info-level findings worth surfacing to the maintainer; none block phase completion. They centre on documentation discoverability, an implicit conditional between two ranking surfaces, an example whose empirical fallback is not reachable from the skills' allowed-tools surface, prose density in Rule 5, and an under-specified placeholder convention in Rule 7.

## Info

### IN-01: README.md References section omits the new orient-exploration.md

**File:** `plugins/lz-advisor/README.md:65-75`
**Issue:** The `## References` section enumerates `references/advisor-timing.md` and `references/context-packaging.md` but does not list the newly added `references/orient-exploration.md`. All four SKILL.md files now `@`-load this reference (see e.g., `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md:70`), and `references/context-packaging.md:44` cross-references it. A user reading the README will not discover the third reference file. The README's existing convention is to list every reference file with a one-paragraph description; the new file should match.
**Fix:** Add a third bullet under `## References`, in the established style:
```markdown
- `references/orient-exploration.md` -- Pattern D question-class
  ranking. Refines `<orient_exploration_ranking>` by deciding which
  orient source to read FIRST based on the question class
  (type-symbol existence, API currency, migration / deprecation,
  language semantics).
```

### IN-02: Implicit conditional between context_trust_contract and Pattern D Class 1

**File:** `plugins/lz-advisor/references/orient-exploration.md:18-27` (cross-references all four SKILL.md `<context_trust_contract>` blocks, e.g., `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md:51`)
**Issue:** The inline `<context_trust_contract>` block in each SKILL.md states "Reading inside `node_modules/` is out of scope" when an authoritative source is present. `references/orient-exploration.md` Class 1 (Type-symbol existence) directs the executor to read `node_modules/<package>/` `.d.ts` first. These two rules are reconcilable -- Class 1 only applies in the no-authoritative-source branch -- but the conditional is implicit. The opening of the orient-exploration.md file does not restate the precondition that the standard ranking (and thus Pattern D) only fires when no authoritative source block is present. An executor reading orient-exploration.md in isolation could conclude `node_modules` reads are always permitted for Class 1 questions.
**Fix:** Add a one-sentence preamble to `references/orient-exploration.md`, between the introductory paragraph (lines 1-10) and Class 1, that names the precondition explicitly:
```markdown
Pattern D applies only when no authoritative source block is
present in the user prompt (per `<context_trust_contract>` in
the skill). When an authoritative source IS present, that block
takes precedence and `node_modules/` reads remain out of scope
even for type-symbol existence questions.
```

### IN-03: Class 4 example references tsc, which is not in any skill's allowed-tools

**File:** `plugins/lz-advisor/references/orient-exploration.md:71`
**Issue:** Class 4 (Language semantics) directs the executor to "an empirical compile or run (build the example, observe the error) or a `WebFetch` of the language spec," and the worked example reads: "First action: an empirical `tsc --noEmit` against a minimal example, or `WebFetch` of the TypeScript handbook page on dynamic imports." The four skills' frontmatter `allowed-tools` is `Bash(git:*)` plus `Read`, `Glob`, `Write`/`Edit`, `WebSearch`, `WebFetch`, `Agent(...)`. There is no `Bash(tsc:*)` or general-`Bash` entitlement, so the empirical compile path is not actually reachable in-skill -- the executor would fall back to `WebFetch`. The example is illustrative, but as written it implies a tool-use path the skill cannot execute. A reader (or executor) following Class 4 against a real TS question and reaching for `tsc --noEmit` would hit a permission denial.
**Fix:** Either narrow the example to the reachable path, or call out the constraint explicitly. Suggested narrowing:
```markdown
Example. Question: "How does TypeScript treat `import()` at
compile time when the imported module is a type-only export?"
Class: language semantics. First action: `WebFetch` of the
TypeScript handbook page on dynamic imports. (An empirical
`tsc --noEmit` against a minimal example is the strongest
evidence but requires a Bash permission outside the skill's
default `allowed-tools`; if the user has granted Bash, prefer
the empirical path.)
```

### IN-04: Rule 5 paragraph mixes three concerns and is hard to scan

**File:** `plugins/lz-advisor/references/context-packaging.md:44`
**Issue:** Rule 5 is now a single ~110-word paragraph that combines (a) the verify-before-asserting requirement and `<pre_verified>` block contract, (b) a cross-reference to `references/orient-exploration.md`, and (c) the authoritative-source override clause ("when the user has inlined an authoritative source ... no further fetch or read is required"). All three concerns are correct, but readers scanning the rule for the original (a) intent get the cross-reference and the override clause spliced in. The override clause in particular -- "re-verifying it via tool use wastes the executor's tokens and the advisor's turn budget" -- is a behavioral directive that warrants its own visual breath. No correctness defect; readability tax is real and the executor follows this rule on every consultation.
**Fix:** Either split into two list items (5 = verify-before-asserting + cross-reference; 5b = authoritative-source-overrides-verification) or insert paragraph breaks within Rule 5. Lowest-churn fix:
```markdown
5. **Verify your external claims before consulting.** [original
   text through "do not assert what you have not verified."]
   Verification ranking is defined in the skill's
   `<orient_exploration_ranking>` block; see also
   `@${CLAUDE_PLUGIN_ROOT}/references/orient-exploration.md`
   for the question-class taxonomy.

   When the user has inlined an authoritative source (see
   `<context_trust_contract>` in the skill), the source IS the
   verification -- no further fetch or read is required, and
   re-verifying it via tool use wastes the executor's tokens
   and the advisor's turn budget.
```

### IN-05: Rule 7 marker uses literal "N" without specifying substitution

**File:** `plugins/lz-advisor/references/context-packaging.md:58`
**Issue:** Rule 7 instructs the executor to wrap prior Strategic Direction text in literal markers `--- Prior Strategic Direction (consultation N) ---` / `--- End Prior Strategic Direction ---`. The intent is clearly that `N` is a placeholder for the consultation index, but the prose says "verbatim, between literal `--- Prior Strategic Direction (consultation N) ---` ... markers." Reading literally, the executor would emit the character `N`. Phase 6's emphasis on "preserve the advisor's literal output" (see e.g., `lz-advisor.plan/SKILL.md:118-124` Do-Not list) makes this kind of literal-vs-placeholder ambiguity higher-stakes than usual, because the executor is conditioned to err on the side of literal preservation. A 1-2 word clarification removes the ambiguity.
**Fix:** Replace `(consultation N)` with `(consultation <N>)` and add a parenthetical clarifying the substitution. Suggested edit to `references/context-packaging.md:58`:
```markdown
... verbatim, between literal `--- Prior Strategic Direction
(consultation <N>) ---` / `--- End Prior Strategic Direction ---`
markers (substitute `<N>` with the consultation index, starting
at 1 for the first prior consultation; e.g., `(consultation 1)`,
`(consultation 2)`)...
```

---

_Reviewed: 2026-04-28_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
