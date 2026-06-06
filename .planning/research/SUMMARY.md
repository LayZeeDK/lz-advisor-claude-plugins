# Project Research Summary

**Project:** lz-advisor
**Domain:** Structured-output grammar change in a Claude Code marketplace plugin (Markdown/YAML prompt-engineering artifacts; zero runtime dependencies) -- user-facing severity-label presentation for two Opus review agents
**Researched:** 2026-06-07
**Confidence:** HIGH

## Executive Summary

This milestone (v1.0.1 "No review report shorthands") is a pure prompt/contract-text change, not a feature build. The `reviewer` and `security-reviewer` Opus agents currently emit findings in a compact fragment grammar with severity shorthands (`crit:`/`imp:`/`sug:`/`q:`), and both review skills render that response verbatim, so the jargon reaches the user unchanged. Every verified peer tool (Conventional Comments, SonarQube, CodeRabbit, reviewdog, Semgrep, Danger) ships fully spelled-out severity in user-facing output; the shorthand is an outlier driven by a Phase 7 token-economy motivation that no longer binds, because the binding budget gates are `wc -w` per-section caps and the severity prefix sits OUTSIDE the counted span -- `crit:` and `Critical:` each count as one word. All four research dimensions independently reach the same verdict: spell out the labels by editing the agent emit grammar (Option A / Mechanism A), keep the render-verbatim contract absolute, and do NOT add any hook, output style, MCP server, or script -- each native "automation" path either fails to reach the durable report, requires a script (breaking the zero-dependency and "no hooks for v1" constraints), or is a strictly weaker form of the prompt edit.

The recommended approach is Option A: replace the shorthand prefixes with `Critical:`/`Important:`/`Suggestion:`/`Question:` (review) and the security-review's own `Critical:`/`High:`/`Medium:` vocabulary directly in the agent `### Findings` grammar, leaving the skill pass-through untouched. The chief risk is not the label swap itself but its coupling: the same vocabulary is replicated as literal strings across at least six surfaces (two agent files, two SKILL.md verbatim contracts, the context-packaging reference, and the verify_request XML schema), and Sonnet/Opus follow demonstrated few-shot examples over stated rules -- so changing the Format line while leaving 8+ worked examples on shorthand produces mixed output. This is the project's own documented scar (Phase 7 WR-04/WR-05 leaked a two-plan cleanup tail). Mitigation: treat the worked examples as the PRIMARY edit target in one atomic unit, and produce a per-surface disposition table in requirements that distinguishes rename surfaces (display labels, Title-Case) from leave-canonical surfaces (machine XML attributes, lowercase) from leave-as-history surfaces (~362 frozen `.planning/` artifacts that must NOT be swept).

Two decisions must be made in requirements before implementation, both architectural rather than incidental. First, Route A (agent emits spelled-out labels) vs Route B (skill-layer mechanical expansion): Route B is a carve-out from the absolute verbatim contract that was hardened precisely because the executor paraphrased and dropped findings when given any editing license -- strongly prefer A. Second, inline-in-place labels vs section-per-severity grouping (Option C): grouping is the milestone's flagged-for-evaluation option, but it directly contradicts an EXISTING explicit prohibition ("Do NOT reformat the response into severity groups"), breaks ordinal cross-references ("Findings 1, 2, 4") unless a stable finding-number scheme is added, and forces mostly-empty severity headers. Recommendation: ship inline spelled-out labels in place for v1.0.1 (low risk, directly satisfies the goal), defer grouping to a fast-follow once the stable-finding-number dependency is designed. A critical, build-order-zero pre-finding cuts across all options: the `D-reviewer-budget.sh` / `D-security-reviewer-budget.sh` smoke fixtures are NOT committed anywhere on disk -- they must be re-authored from the agent-prompt contract and committed under `tests/` before "update fixtures in lockstep" can mean anything.

## Key Findings

### Recommended Stack

No stack additions are justified -- this is a pure Markdown/text edit confined to existing component files plus a regex literal in re-authored bash fixtures. There is no Claude Code-native mechanism (output style, hook, references file) that can mechanically expand labels in the durable user-facing report without either introducing a script dependency or failing to durably reach the report. `MessageDisplay` is the only hook that rewrites user-visible text and it is explicitly display-only (shorthands persist in the transcript and for downstream consumers); output styles steer generation rather than deterministically rewrite. Editing the agent emit grammar is the direct, reliable, zero-dependency answer. See `.planning/research/STACK.md`.

**Core technologies (UNCHANGED -- no additions):**
- Agent files (`agents/reviewer.md`, `agents/security-reviewer.md`, Markdown + YAML) -- the single highest-leverage surface; the severity vocabulary is authored here as the emit-format line, the `Severity prefix` legend, and every worked example. The label change is a text edit.
- Skill files (`skills/review/SKILL.md`, `skills/security-review/SKILL.md`) -- own the render-verbatim contract; under Option A they need only a note refresh, and the verbatim contract stays absolute.
- References file (`references/context-packaging.md`) -- carries the shared severity vocabulary in consultation templates and the `<verify_request>` schema; templates already use word forms, so this is a consistency cross-check, not new tooling.
- `wc -w` + regex bash smoke fixtures (transient, NOT committed) -- the `FRAGMENT_RE` severity alternation (`crit|imp|sug|q`) is the only fixture surface that must change, in lockstep; word budgets are unaffected because the prefix is excluded from the counted span.

### Expected Features

Spelled-out severity is universal in user-facing peer-tool output; the dominant modern pattern is a hybrid (severity-grouped summary + inline labels + stable finding numbers). For v1.0.1 the scope is presentation only. See `.planning/research/FEATURES.md`.

**Must have (table stakes):**
- Severity spelled out in full (`Critical`/`Important`/`Suggestion`/`Question` for review; `Critical`/`High`/`Medium` for security-review per its existing vocab) -- the milestone's entire reason for existing; word-budget-neutral.
- One unambiguous severity per finding -- already present; only the label rendering changes.
- Updated agent Output Constraint + worked examples + `FRAGMENT_RE` fixtures in lockstep -- the enabler surfaces.
- `references/context-packaging.md` severity-vocab consistency sync -- drift prevention.

**Should have (competitive / next milestone):**
- Section-per-severity grouping (`### Critical` / `### Important` / ...) -- maximum scannability, but requires the stable-finding-number dependency first.
- Per-severity roll-up count and highest-severity-first ordering -- cheap scannability wins once labels are spelled out.

**Defer (v2+):**
- Severity/kind axis separation (reclassify `Question` as a kind, not a tier) -- re-architects the vocabulary, out of scope.
- Stable severity-prefixed finding IDs (`CRIT-009`) -- only valuable if reports are persisted/diffed.
- Anti-features to AVOID entirely: numeric severity scores (anchoring anti-pattern), emoji/icon markers (violates ASCII-only constraint), vocabulary expansion (scope creep), severity-column tables, and any paraphrasing during expansion.

### Architecture Approach

The review and security-review skills share one three-phase pipeline (SCAN -> CONSULT -> render-verbatim OUTPUT). Severity labels are emitted by the Opus agent and reach the user unchanged because Phase 3 renders verbatim. The change should live in the agent (the source of output shape), keeping the skill as a faithful pass-through. Three candidate placements were evaluated; Option A is recommended. See `.planning/research/ARCHITECTURE.md`.

**Major components:**
1. Reviewer / security-reviewer agent prompts -- own the fragment grammar, severity legend, `<output_constraints>` budgets, and 8+ worked examples; EMIT the shorthand today (the change lives here under Option A).
2. Review / security-review skills -- own the SCAN/CONSULT/OUTPUT phases and the render-verbatim contract; pass labels through unchanged (untouched under Option A).
3. context-packaging reference -- carries the Common Contract, Verification template, and verify_request schema; verify-only under Option A.
4. Smoke fixtures (`tests/D-*-budget.sh`) -- NOT committed; must be re-authored as build-order step 0.

**Option comparison:** Option A (agent emits full labels) has the smallest architectural blast radius (zero new contract, verbatim contract preserved) at the cost of the largest prompt-editing surface (every worked example). Option B (skill-layer mechanical expansion) has the smallest edit surface but the HIGHEST behavioral risk -- it breaches the absolute verbatim contract. Option C (agent emits severity sections) has the largest overall blast radius, inverts an existing prohibition, and subsumes A's label goal (do NOT do both A and C).

### Critical Pitfalls

The change is small in surface area but high in coupling. Top pitfalls, all anchored to this repo's own history. See `.planning/research/PITFALLS.md`.

1. **Worked-example/grammar disagreement** -- LLMs follow examples over rules; changing the Format line while leaving the 8+ worked examples on shorthand yields mixed output (this is exactly the Phase 7 WR-05 failure). Avoid by treating worked examples as the PRIMARY edit target, rewriting legend + format + every example (including the holistic example, Hedge Marker examples, and verify_request example lines) in ONE atomic unit.
2. **Regression-fixture lockstep + vacuous pass** -- the fixtures are not committed and must be authored fresh; a regex that no longer matches any finding exits green while testing nothing. Avoid by re-authoring fixtures in the same plan/commit as the grammar change WITH an anti-vacuous `matched_count >= min` assertion before the word-budget loop.
3. **Cross-surface lexicon drift** -- the vocabulary lives on 6+ surfaces; a partial rename leaves the WR-04/WR-05 two-plan cleanup tail. Avoid with a requirements-phase per-surface disposition table and an atomic edit, distinguishing display labels (Title-Case rename) from machine XML attributes (lowercase, leave canonical).
4. **Verbatim-contract erosion (Route B)** -- any skill-layer conversion is the skill mutating agent output, the exact failure the contract was hardened to stop. Strongly prefer Route A; if B is forced, constrain it to a provably injective 4-token-only expansion with a byte-diff invariant test and an amended contract.
5. **Downstream-consumer drift + history corruption** -- a blanket `find/replace crit: -> Critical:` over-matches: it must hit live contracts (change), must NOT touch the lowercase verify_request attributes, and must NOT corrupt the ~362 frozen `.planning/` history artifacts. Scope every sweep to `plugins/lz-advisor/` and exclude `.planning/`. Eval JSON is trigger-only (NOT a rename surface).

## Implications for Roadmap

Based on research, a tight 2-3 phase structure (the milestone is small and the dependencies are explicit). Build-order step 0 is mandatory and cross-cutting.

### Phase 1: Requirements decisions + fixture baseline

**Rationale:** Two architectural decisions (Route A vs B; inline vs section-per-severity grouping) MUST be settled before any edit -- both research-confirmed as decisions, not implementation details. Concurrently, the smoke fixtures do not exist on disk and must be re-authored from the agent-prompt contract and committed so they pass green on the CURRENT shorthand grammar, establishing a baseline before any change. This is build-order step 0 for every option.
**Delivers:** A recorded Route A decision (recommended) + grouping decision (recommended: inline in place, defer grouping); a per-surface disposition table covering all 6+ surfaces (rename / leave-canonical / leave-as-history / N/A); committed `tests/D-reviewer-budget.sh` (3-slot FRAGMENT_RE) and `tests/D-security-reviewer-budget.sh` (4-slot, OWASP bracket preserved) green on shorthand.
**Addresses:** The MVP enabler surfaces from FEATURES.md.
**Avoids:** Pitfall 5 (Route A/B + verbatim-contract contradiction), Pitfall 6 (downstream disposition), Pitfall 2 (vacuous fixtures via re-authoring), and Anti-Pattern 2 (assuming fixtures exist).

### Phase 2: Atomic agent-grammar rename + lockstep fixture retarget

**Rationale:** The agent prompt is the source of truth; the legend, Format lines, and ALL worked examples must change in one logical unit (or few-shot drift), and the fixture regex must retarget in lockstep so the gate is never lying.
**Delivers:** `agents/reviewer.md` and `agents/security-reviewer.md` rewritten to full-word labels (legend + format + every worked example + holistic example + Hedge Marker examples + verify_request example tokens); `FRAGMENT_RE` severity capture retargeted to full words (RED on old shorthand, GREEN on new sample); `references/context-packaging.md` consistency-verified; the verify_request `severity=` XML attributes left lowercase-canonical (documented asymmetry); atomic 5-surface version bump (PATCH).
**Uses:** Agent files + fixtures from STACK.md; the Option A integration map from ARCHITECTURE.md.
**Implements:** The agent-prompt emit-grammar component, with the skill verbatim contract untouched.
**Avoids:** Pitfall 1 (worked-example drift -- examples are the primary target), Pitfall 3 (cross-surface drift -- atomic edit), and Anti-Patterns 1/5 (legend-without-examples; global string-replace).

### Phase 3: Empirical verification + residue sweep

**Rationale:** Budget neutrality is an assumption until measured; the project has been burned three times assuming a prompt change is budget-neutral. Behavioral verification is the only check that catches the model ignoring the rewritten grammar.
**Delivers:** A headless `claude -p /lz-advisor:review` (and security-review) run asserting the rendered report contains the full labels and zero shorthand; an empirical n>=3 budget-gate run on the new grammar (do not reason from `wc -w` neutrality); a scoped `git grep` confirming no unintended `crit:|imp:|sug:|q:` residue in `plugins/lz-advisor/` and that `git diff` touches NO files under `.planning/`.
**Addresses:** The "Looks Done But Isn't" checklist from PITFALLS.md.
**Avoids:** Pitfall 4 (word/token budget interaction -- empirical gate) and Pitfall 6 (history preservation).

### Phase Ordering Rationale

- Requirements/baseline first because the Route A/B and grouping decisions are architectural and the fixtures literally do not exist (step 0 cannot be skipped); committing a green-on-shorthand baseline makes the subsequent lockstep retarget meaningful.
- The grammar rename and fixture retarget are one phase because lockstep is the whole point -- splitting them across phases creates either a lying gate or few-shot-drift output.
- Verification is last because empirical budget measurement and behavioral output checks are the only signals that catch model regression and budget drift, and they require the changed grammar to exist first.
- If section-per-severity grouping (Option C) is chosen in Phase 1 instead, it SUBSUMES the inline label goal (do not also do Option A); Phase 2 then inverts the skills' "do not reformat into severity groups" prohibitions FIRST, re-scopes per-section budgets, and the version bump becomes MINOR -- a materially larger and higher-risk phase.

### Research Flags

Phases likely needing deeper research during planning:
- **None.** This milestone is fully scoped by the four research files; all surfaces, decisions, and dependencies are enumerated with file:line anchors. No external integration, niche domain, or sparse-documentation risk remains.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Requirements + fixtures):** the decisions and disposition table are fully laid out in PITFALLS.md and ARCHITECTURE.md; fixture shape is documented in STATE.md Phase 08 decisions.
- **Phase 2 (Grammar rename):** mechanical text edits at enumerated file:line surfaces; the dominant failure mode (few-shot drift) and its prevention are documented.
- **Phase 3 (Verification):** uses the established `claude -p` headless verification convention and n>=3 budget-gate discipline already proven in prior phases.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified against current hook/output-style vendor docs plus committed local sources; the no-additions verdict is corroborated by every native mechanism failing the zero-dependency or durable-report test. |
| Features | HIGH | Tool behaviors verified against current vendor docs/specs; spelled-out-severity universality and the inline-vs-grouping trade-off corroborated across multiple independent sources. |
| Architecture | HIGH | Pure codebase analysis of committed plugin sources; the missing-fixtures pre-finding empirically confirmed three ways (`git ls-files`, `git grep -l`, `rg -uu -l`). |
| Pitfalls | HIGH | Every claim anchored to a file path in this repo plus the project's own documented WR-01..WR-05 severity-rename scar and budget-regression history. |

**Overall confidence:** HIGH

### Gaps to Address

- **Smoke fixtures absent from the repo:** "Update the fixtures in lockstep" is vacuous until they are re-authored and committed. Handle in Phase 1 (build-order step 0): recreate the 3-slot/4-slot FRAGMENT_RE shape from the agent contract and commit them green on the current shorthand grammar.
- **Two unresolved requirements decisions:** Route A vs B and inline vs section-per-severity grouping are not yet decided. Handle in Phase 1: record the recommended Route A + inline-in-place with explicit rationale; grouping is a deferred fast-follow gated on a stable-finding-number scheme.
- **Budget neutrality is assumed, not measured:** `wc -w` neutrality is an assumption the project has been burned by three times. Handle in Phase 3 as an empirical n>=3 acceptance gate, not manual UAT.
- **Case-normalization asymmetry:** display labels are Title-Case while verify_request/pre_verified `severity=` XML attributes are lowercase-canonical machine tokens. Handle in the disposition table -- do NOT over-normalize the XML attributes (breaks the escalation-hook parser).

## Sources

### Primary (HIGH confidence)
- `plugins/lz-advisor/agents/reviewer.md`, `agents/security-reviewer.md` (committed HEAD) -- fragment grammar, severity legend, `<output_constraints>` budgets, 8+ worked examples, Class-2 hook, Hedge Marker, OWASP tags.
- `plugins/lz-advisor/skills/review/SKILL.md`, `skills/security-review/SKILL.md` (committed HEAD) -- render-verbatim contract, "named sections with literal headers" rule, "Do NOT reformat into severity groups" prohibition.
- `plugins/lz-advisor/references/context-packaging.md` (committed HEAD) -- Common Contract, Verification template, verify_request schema, severity vocab, WR-01 Hedge Marker carve-out.
- `.planning/PROJECT.md` + `.planning/STATE.md` + `.planning/milestones/v1.0-ROADMAP.md` -- zero-dependency / no-hooks constraints, Phase 7 WR-01..WR-05 severity-rename case study, per-section budget + +10% fixture tolerance precedent, 3-slot/4-slot FRAGMENT_RE shape.
- `https://code.claude.com/docs/en/hooks` (fetched via markdown.new) -- hook lifecycle/schemas; `MessageDisplay` display-only; SubagentStop/PostToolUse/Stop input-only.
- `git ls-files` / `git grep -l FRAGMENT_RE` / `rg -uu -l FRAGMENT_RE` -- empirical confirmation the budget fixtures are absent from the repo.
- Conventional Comments spec, SonarQube Issues docs, CodeRabbit reports docs, reviewdog Diagnostic Format, Semgrep CLI/severities, Danger reference -- peer-tool severity presentation (spelled-out universality, inline vs grouped, cross-referencing).

### Secondary (MEDIUM confidence)
- `https://code.claude.com/docs/en/output-styles` (WebSearch summary; code.claude.com blocks direct AI fetch) -- output styles steer the system prompt, not deterministic rewriting.
- GitHub PR severity-prefix conventions (emmer.dev, Augment, Propel, codetinkerer) -- community convention, multi-source agreement.
- WebSearch synthesis on grouped-vs-inline trade-offs, numeric-score anchoring, over-highlighting cautions -- multi-source.
- Project memory: `reference_sonnet_46_prompt_steering` (examples-over-prose steering), `feedback_no_cross_skill_body_references`, `version_numbers_not_load_bearing_prerelease`.

### Tertiary (LOW confidence)
- None. All findings anchor to committed sources, current vendor docs, or empirically-confirmed repo state.

---
*Research completed: 2026-06-07*
*Ready for roadmap: yes*
