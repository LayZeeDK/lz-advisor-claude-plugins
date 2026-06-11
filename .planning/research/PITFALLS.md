# Pitfalls Research

**Domain:** Structured-output grammar change in a prompt-based LLM plugin (lz-advisor review/security-review severity-label expansion)
**Researched:** 2026-06-07
**Confidence:** HIGH (codebase + project-history analysis; every claim anchored to a file path in this repo)

## Scope note

This milestone (v1.0.1 "No review report shorthands") changes the **user-facing severity vocabulary** of two Opus agents (`reviewer`, `security-reviewer`) from the fragment-grammar shorthands `crit:`/`imp:`/`sug:`/`q:` to fully spelled-out `Critical`/`Important`/`Suggestion`/`Question`, possibly grouped section-per-severity. The change is small in surface area but high in coupling: the same vocabulary is load-bearing in agent prompts, two skills' verbatim-render contracts, regression fixtures, the context-packaging reference, eval/worked examples, and 16 phases of frozen planning history. This file catalogs the project-specific ways that change breaks, not generic LLM advice.

The single most important framing finding: **the two review skills currently contain an explicit prohibition against the exact report shape this milestone wants to introduce.** `review/SKILL.md:178` and `security-review/SKILL.md:164` both say:

> Do NOT reformat the [security-]reviewer's response into severity groups (Critical / Important / Suggestion).

So this is not a green-field addition. It is a **contract reversal** on a fidelity rule that was hardened precisely to stop the skill layer from touching agent output. Every pitfall below flows from that tension.

---

## Critical Pitfalls

### Pitfall 1: Worked-example/grammar disagreement (LLMs follow examples over rules)

**What goes wrong:**
The agents change the *stated* grammar in the `### Findings` "Format:" line (e.g., `crit:` -> `Critical:`) but leave the 8+ worked examples in `reviewer.md` (lines 96, 104, 112, 121, 127-134) and `security-reviewer.md` (lines 98-127, 135-141) emitting the old `crit:`/`imp:`/`sug:` shorthands. Opus is a literal, example-anchored follower (per project memory `reference_sonnet_46_prompt_steering` and the agents' own design: "the executor follows examples over prose rules"). When the holistic worked example shows `src/auth.ts:42: crit: ...` but the format line says `Critical:`, the model will emit a **mixture** -- sometimes `crit:`, sometimes `Critical:`, sometimes inventing `Crit:` -- because the highest-signal training input in the prompt is the demonstrated shape, not the imperative.

**Why it happens:**
There are two co-located sources of truth in each agent file: the prose Format line plus the Severity Classification section, AND the worked examples. They drift independently because the examples are long, numerous, and easy to miss in a "find/replace the format line" edit. This is the exact mechanism behind Phase 7 WR-05 (a worked example still showed `Severity: High` after the prose was fixed; see PROJECT.md 2026-05-05 Evolution entry).

**How to avoid:**
Treat the worked examples as the **primary** edit target, not an afterthought. In one plan task, rewrite every worked example in both agent files in lockstep with the format line, including: the per-finding examples, the holistic multi-finding example, the `<verify_request>` trailing-line examples (`severity="important"` attribute -- decide whether the XML attribute stays lowercase-canonical or also spells out), and the Hedge Marker examples (`reviewer.md:121`, `security-reviewer.md:123`). Add a grammar-consistency assertion to the smoke fixture (Pitfall 2) that greps the agent file itself for any surviving `crit:|imp:|sug:|q:` literal outside an explicit "deprecated/legacy" annotation.

**Warning signs:**
- A diff that touches the "Format:" line but shows < 8 changed example lines per agent file.
- Headless `claude -p` review output that mixes `Critical:` and `crit:` in the same response.
- The `(formerly High)`/`(formerly Medium)` annotation pattern at `security-reviewer.md:66-67` -- this is residue from the LAST rename (WR-01) and shows the project's own habit of leaving partial vocabulary behind.

**Phase to address:**
Implementation phase (the agent-prompt edit). This is the core change; it cannot be deferred.

---

### Pitfall 2: Regression-fixture lockstep -- silent pass or hard fail on the new shape

**What goes wrong:**
The budget gates `D-reviewer-budget.sh` / `D-security-reviewer-budget.sh` parse agent output with `FRAGMENT_RE`-style regexes keyed on the literal severity prefixes (`crit:`/`imp:`/`sug:`/`q:`) to locate finding entries, then run `wc -w` per-section sub-caps (per-entry <=22w/<=28w outlier, `cross_cutting_patterns`/`threat_patterns` <=160w, `missed_surfaces` <=30w; see `reviewer.md:160-187`). When the grammar changes to `Critical:` etc., the regex stops matching finding lines. **Two failure modes, both dangerous:** (a) **silent pass** -- if the regex no longer matches any finding, the per-finding word-budget loop iterates zero times and the gate exits 0 (green) while actually testing nothing; (b) **hard fail** -- if the parser asserts "at least N findings matched," the new shape trips a false regression that looks like the agent broke.

**Why it happens:**
The fixtures were authored against the shorthand grammar and the regex literals are the coupling point. Mode (a) is the more insidious: a vacuously-passing gate is worse than a failing one because it removes the safety net silently. This is structurally identical to the "regression-fixture lockstep" failure the milestone goal explicitly calls out (PROJECT.md milestone context: "Regression smoke fixtures... updated in lockstep so budget gates still parse findings").

**How to avoid:**
- Update the fixture regexes in the **same plan/commit** as the agent grammar change -- never in a follow-up. Note: these fixtures are not currently tracked in git (they live transiently under `.planning/phases/<phase>/` and are re-created per execution; confirmed via `git ls-files` returning nothing for `*budget*`). The plan must **author them fresh** against the new grammar, not edit an existing file.
- Add an **anti-vacuous-pass assertion**: the fixture must assert `matched_finding_count >= expected_min` (e.g., >= 5 for the holistic example) BEFORE running word budgets, so a regex that matches nothing fails loudly instead of passing silently.
- If section-per-severity grouping is adopted, the parser must handle severity-grouped `### Critical` / `### Important` headers as well as (or instead of) the flat `### Findings` section. Decide the section shape in requirements BEFORE writing the parser.
- Recall the Phase 7 tolerance precedent (ROADMAP 2026-05-08, commit ef97e21): a +10% smoke-gate tolerance was added **at the fixture-parser layer only**, with agents kept aimed at canonical targets. Spelled-out labels are word-neutral under `wc -w` (`Critical:` counts as one whitespace-delimited word, same as `crit:`), so the existing budgets should still hold -- but verify this assumption empirically rather than assuming it (Pitfall 4).

**Warning signs:**
- A budget fixture that exits 0 but whose verbose output shows "0 findings parsed."
- Fixture regex literals (`crit:`, `\bimp:`) surviving in the new `.sh` files.
- A green gate run that completes suspiciously fast (no per-finding iterations).

**Phase to address:**
Same phase as the grammar change (lockstep is the whole point). The fixture authoring should be a sibling task to the agent edit, gated by an empirical run (`bash D-reviewer-budget.sh` against a captured headless response).

---

### Pitfall 3: Cross-surface lexicon drift (the WR-01/WR-02 case study)

**What goes wrong:**
The severity vocabulary appears on at least **six distinct surfaces** beyond the two agent Format lines. A rename that touches only the obvious surfaces leaves the others misaligned, producing exactly the multi-plan reconciliation tail that the milestone context warns about. The surfaces (verified in this repo):

| Surface | File:line | What it contains |
|---------|-----------|------------------|
| reviewer agent Format + Severity Classification | `agents/reviewer.md:64-67`, `196-201` | `crit:`/`imp:`/`sug:`/`q:` prefixes + spelled-out classification |
| security-reviewer agent Format + Severity prefix | `agents/security-reviewer.md:65-68` | prefixes + `(formerly High)`/`(formerly Medium)` legacy annotations |
| review SKILL.md verbatim contract | `skills/review/SKILL.md:13,178` | "classified as Critical, Important, or Suggestion" + the "Do NOT reformat into severity groups" prohibition |
| security-review SKILL.md verbatim contract | `skills/security-review/SKILL.md:164` | the "Do NOT reformat into severity groups" prohibition |
| context-packaging.md (WR-01 Hedge Marker carve-out + templates) | `references/context-packaging.md:290-291, 390` | `Severity (initial): [Critical/Important/Suggestion...]` + verify_request `severity="<critical\|important\|suggestion>"` |
| verify_request schema severity attribute | `references/context-packaging.md:378, 388-390`; both agents' `<verify_request>` schema | lowercase `critical\|important\|suggestion` attribute values |

**Why it happens:**
This is the project's own documented scar. Phase 7 Plan 07-13 (ROADMAP:234) did a severity-vocabulary rename and had to touch **5 surfaces** in one plan (WR-02: "mechanical text replacements at 4 surfaces ... with Surface 4 Option A full alignment"), and even then WR-04 (schema BNF still permitted `|high|medium` at `context-packaging.md:376`) and WR-05 (a worked example still showed `Severity: High`) **leaked into Phase 8 candidates** -- two follow-up plans of cleanup (PROJECT.md 2026-05-05 entry). The root cause is that no single surface is the source of truth; the vocabulary is replicated as literal strings across prompt text, contract prose, fixtures, and schema attribute enums.

**How to avoid:**
- Enumerate the surface list (above) in the **requirements/roadmap phase** as a mandatory checklist, and make the version-bump plan a single atomic 5-surface commit per the established convention (PROJECT.md repeatedly references "atomic 5-surface version bump").
- Decide the **case-normalization rule explicitly**: user-facing labels are Title-Case (`Critical`), but the `<verify_request severity=...>` and `<pre_verified ... severity=...>` XML attribute values are lowercase-canonical (`critical`). These are TWO different lexicons on purpose (display vs. machine attribute). The pitfall is "fixing" the XML attributes to Title-Case and breaking the verify_request escalation hook parser. Document which surfaces are display (rename) vs. machine-attribute (leave lowercase).
- Strip the `(formerly High)`/`(formerly Medium)` annotations at `security-reviewer.md:66-67` as part of this pass IF they are now pure noise -- or knowingly keep them. Do not leave a THIRD generation of "formerly X" residue.
- Add a cross-surface grep assertion to the smoke fixture or a doc-hygiene check: after the rename, `git grep -n 'crit:|imp:|sug:'` across `plugins/lz-advisor/` should return only intentional/annotated occurrences.

**Warning signs:**
- A version-bump plan that touches fewer than the 6 surfaces above.
- Any `high|medium` or `High`/`Medium` token surviving in `context-packaging.md` (the WR-04 leak signature).
- A worked example anywhere showing the old prefix after the Format line was changed (the WR-05 leak signature).

**Phase to address:**
Requirements phase produces the surface checklist; implementation phase executes the atomic multi-surface edit; a verification phase greps for residue. This is the pitfall most likely to need its OWN dedicated reconciliation step given the Phase 7 precedent of a 2-plan cleanup tail.

---

### Pitfall 4: Word/token budget interaction when labels get longer

**What goes wrong:**
The per-section word budgets (`reviewer.md:160-187`) were empirically tuned on the **shorthand** grammar. The aggregate cap was falsified at 354w mean and replaced with per-section sub-caps after exactly this kind of length pressure (`reviewer.md:189`, `security-reviewer.md:194`). Spelled-out labels are *nominally* word-neutral under `wc -w` (`crit:` and `Critical:` each count as one whitespace-delimited token), BUT two second-order effects can still push over budget: (a) if section-per-severity grouping adds `### Critical` / `### Important` / `### Suggestion` / `### Question` header lines, those headers add words AND change the parser's section boundaries; (b) longer, more "official-looking" labels can subtly steer Opus toward more verbose finding prose ("Critical:" reads as a heavier flag than "crit:", inviting justification text). The history shows budget regressions are this project's most recurrent failure (Phase 7 had 5/5 over-cap runs; a security-reviewer budget regression on 0.12.2 in MEMORY).

**Why it happens:**
`wc -w` neutrality is an assumption, not a measurement. The project has been burned three times by assuming a prompt change is budget-neutral (Plan 07-13 severity rename induced a word-budget regression -- the milestone context names this directly). Label length is not the only lever; label *gravity* changes model verbosity.

**How to avoid:**
- Run the budget fixtures **empirically against captured headless output on the new grammar** before declaring the phase done -- do not reason about `wc -w` neutrality, measure it. Use the established n=3 (or n=10 for the statistical gate per ROADMAP E.1) re-run discipline to defeat stochastic outliers (the 0.12.1 326w "regression" was an outlier disconfirmed by a 3x re-run mean of 272w; PROJECT.md 2026-05-05).
- If section-per-severity grouping is adopted, recompute the section-boundary parsing and ensure the new severity-group headers are NOT counted against the per-finding word budgets (they are structural, like `### Findings`).
- Keep agents aimed at canonical word targets; apply any slack at the fixture-parser tolerance layer only (the Phase 7 ef97e21 precedent), never by loosening the agent's stated budget.

**Warning signs:**
- A single budget-gate run used as proof (no n>=3 re-run).
- Per-finding entries growing justification clauses after the rename ("Critical: this is critical because...").
- New `### <Severity>` headers being caught by the per-finding `<=22w` regex.

**Phase to address:**
Verification phase (empirical budget re-run is a gate). The implementation phase should include the measurement as an acceptance criterion, not defer it to manual UAT.

---

### Pitfall 5: Verbatim-contract erosion if a skill-layer conversion step is added

**What goes wrong:**
The milestone offers two implementation routes (PROJECT.md target features): (A) change the agent grammar to emit spelled-out labels directly, or (B) add a "mechanical conversion step before output" at the skill layer. Route B is the dangerous one. The review skills enforce a **hard render-verbatim contract** (`review/SKILL.md:165-184`, `security-review/SKILL.md:160-170`) that was hardened specifically because paraphrasing dropped/distorted findings in the past. The contract literally says "Render the reviewer agent's response verbatim" and "Do NOT reformat... strip, rename, or bold the headers... add any other section." A conversion step at the skill layer is, by definition, the skill mutating agent output -- the exact thing the contract forbids. Once you open the door to "mechanically expand `crit:` -> `Critical:`," you have established that the skill MAY transform output, and the next drift is the skill "helpfully" regrouping, re-summarizing, or dropping a `### Cross-Cutting Patterns` section it deems redundant -- re-introducing the paraphrase failure mode that 16 phases of work eliminated.

**Why it happens:**
Route B looks cheaper (one regex in the skill vs. rewriting 8 worked examples per agent) and looks safer for budgets (the agent keeps its tuned shorthand grammar). But it inverts the architecture: it makes the SKILL responsible for output shape, when the entire design (`reviewer.md:53`: "These two headers are the skill's output contract") puts the agent in charge of shape and the skill in charge of faithful pass-through.

**How to avoid:**
- **Strongly prefer Route A** (agent emits spelled-out labels). It keeps the agent as the single source of output shape and preserves the verbatim contract intact. The token-economy motivation for shorthands is dead anyway: budgets are `wc -w`-based and `Critical:` is word-equivalent to `crit:` (PROJECT.md milestone context explicitly notes "the original token-economy motivation may not bind").
- If Route B is chosen for budget reasons, constrain it to a **provably non-paraphrasing, total, injective label expansion**: a fixed lookup `{crit:->Critical:, imp:->Important:, sug:->Suggestion:, q:->Question:}` applied ONLY to the severity token, with an explicit invariant test that the conversion changes no other byte (assert a `diff` between pre- and post-conversion output shows only the four label substitutions). The verbatim-contract prose must be amended to carve out *exactly this one mechanical substitution* and re-affirm the prohibition on every other mutation -- otherwise the contract self-contradicts.
- Whichever route, **resolve the SKILL.md "Do NOT reformat into severity groups" contradiction in requirements** (`review/SKILL.md:178`, `security-review/SKILL.md:164`). If section-per-severity grouping is adopted, that prohibition must be rewritten, and the rewrite must still forbid finding-content paraphrase even while permitting the new grouping.

**Warning signs:**
- A plan that adds regex/string-replace logic to a SKILL.md `<output>` block.
- The verbatim-contract prose left unchanged while a conversion step is added (silent self-contradiction).
- Any conversion that operates on more than the four severity tokens.
- The "Do NOT reformat into severity groups" line surviving unedited while the report shape changes to severity groups.

**Phase to address:**
Requirements phase MUST pick Route A vs. B and resolve the verbatim-contract / no-regrouping contradiction -- this is an architecture decision, not an implementation detail. Implementation phase enforces the chosen invariant.

---

### Pitfall 6: Downstream consumers of the old grammar drift out of sync

**What goes wrong:**
Surfaces that *read* or *demonstrate* the grammar but are not the grammar definition get forgotten. Verified downstream surfaces in this repo:

- **Eval JSON queries** (`evals/lz-advisor/lz-advisor-review-eval.json`, `...security-review-eval.json`): these are **trigger-only** (`query` + `should_trigger`); they contain NO severity-vocab assertions. **Good news: they are NOT a rename surface.** Documenting this prevents a wasted edit and a false "we missed the evals" panic. (The `conciseness-assessment.md` and `review-workspace/optimization-results.md` DO mention severity words but are historical analysis artifacts, not live contracts.)
- **README** (`plugins/lz-advisor/README.md`): currently does NOT show finding-line examples with severity prefixes (grep found only "verification-chain integrity" prose at line 85). If the milestone adds a sample report to the README to showcase the new labels, that sample becomes a NEW surface to keep in sync -- a future drift source.
- **context-packaging.md worked examples** (`references/context-packaging.md:317-330`): the Verification-template worked example shows `Severity: Important` in the executor's *input packaging* (the executor's initial assessment fed TO the agent), distinct from the agent's *output* grammar. This surface uses spelled-out labels already and is about input packaging, so it may not need changing -- but verify the distinction holds and document it, because it is easy to "fix" a surface that was already correct (the inverse of WR-05).
- **Frozen planning history** (~362 `.planning/` artifacts): per the Phase 9 precedent (PROJECT.md 2026-06-01: "the ~362 frozen historical `.planning/` artifacts ... left UNCHANGED as accurate history"), historical phase docs that reference the old grammar should NOT be rewritten -- they are an accurate record. The pitfall is a well-meaning find/replace sweeping through `.planning/` and corrupting history.

**Why it happens:**
"Find every occurrence of `crit:`" over-matches: it hits live contracts (must change), input-packaging templates (may not change), eval triggers (don't change), and frozen history (must NOT change). Without a surface-by-surface disposition, the rename either misses live surfaces or corrupts inert ones.

**How to avoid:**
- In requirements, produce a **per-surface disposition table** (rename / leave-canonical / leave-as-history / not-applicable) covering: 2 agent files (rename), 2 SKILL.md contracts (rewrite prose + grouping prohibition), context-packaging templates (decide input vs. output), verify_request XML attributes (leave lowercase-canonical), README (add-sample-or-not), eval JSON (not-applicable), `.planning/` history (leave-as-history).
- Scope every grep/sweep to `plugins/lz-advisor/` and exclude `.planning/` per the Phase 9 history-preservation precedent.

**Warning signs:**
- A rename diff that modifies files under `.planning/`.
- A README sample report added without a corresponding fixture to keep it honest.
- The verify_request `severity="critical"` attribute "corrected" to `severity="Critical"` (breaks the hook parser).

**Phase to address:**
Requirements phase (disposition table); implementation phase (scoped edits); verification phase (grep confirms `.planning/` untouched and live surfaces aligned).

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skill-layer conversion (Route B) instead of agent grammar change (Route A) | Avoids rewriting 8 worked examples per agent; keeps tuned budgets untouched | Erodes the render-verbatim contract; opens the door to future paraphrase regressions; self-contradicts the SKILL.md prohibition prose | Only with a provably injective 4-token-only expansion + amended contract carve-out + invariant test |
| Edit the Format line, defer worked examples to "later" | Fast green diff | LLMs follow examples over rules -> mixed output; this is literally WR-05 | Never -- examples are the primary edit target |
| Reuse the existing budget fixture by string-replacing the regex | Less work | Inherits the vacuous-pass risk if the new regex matches nothing | Only with an added `matched_count >= min` anti-vacuous assertion |
| Leave `(formerly High)`/`(formerly Medium)` annotations as-is | No extra edit | Accumulates a third generation of vocabulary residue; confuses future readers | Acceptable only if explicitly documented as intentional in the plan |
| Blanket `find/replace crit: -> Critical:` across the whole repo | One command | Corrupts frozen `.planning/` history; breaks lowercase verify_request attributes | Never -- must be surface-scoped per disposition table |

## Integration Gotchas

Common mistakes when connecting the changed grammar to the surrounding system.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Budget smoke fixtures (`D-*-budget.sh`) | Editing a tracked fixture (none exists -- `git ls-files` returns nothing); or reusing old regex that silently matches zero findings | Author fresh fixtures against the new grammar with an anti-vacuous `matched_count >= min` assertion before word-budget loops |
| verify_request escalation hook | "Normalizing" the `severity="critical"` XML attribute to Title-Case to match display labels | Keep attribute values lowercase-canonical; they are machine tokens, NOT display labels -- the executor's hook parser greps them |
| context-packaging.md Verification template | Rewriting the `Severity (initial): [Critical/...]` input-packaging shape thinking it is agent output | Confirm it is executor INPUT (already spelled out); change only if requirements decide input and output must share one vocabulary |
| Section-per-severity grouping + the two-slot header contract | Adding `### Critical`/`### Important` groups that collide with the parser's `### Findings` / `### Cross-Cutting Patterns` / `### Threat Patterns` section detection | Decide grouping in requirements; re-architect the parser's section boundaries; ensure severity-group headers are excluded from per-finding word budgets |
| Hedge Marker carve-out (WR-01) in context-packaging.md | Forgetting it references severity vocab in the verify_request `severity=` attribute | Include it in the surface checklist; treat its severity values as machine-canonical (lowercase) |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Agent grammar changed:** Often missing the 8+ worked examples -- verify `git grep -c 'crit:|imp:|sug:|q:'` in both agent files returns only intentional occurrences, and the holistic multi-finding example uses the new labels.
- [ ] **Budget fixtures updated:** Often missing the anti-vacuous-pass guard -- verify the fixture FAILS when fed zero-finding input, and PASSES on a captured real response with `matched_count >= 5`.
- [ ] **Cross-surface rename:** Often missing one of the 6 surfaces -- verify the surface checklist from requirements is fully ticked and `git grep` finds no unintended residue in `plugins/lz-advisor/`.
- [ ] **Verbatim contract:** Often missing the resolution of the "Do NOT reformat into severity groups" contradiction -- verify both SKILL.md prohibition lines are reconciled with the chosen report shape.
- [ ] **Budget neutrality:** Often assumed, not measured -- verify an empirical n>=3 budget-gate run on the new grammar passes (do not reason from `wc -w` neutrality).
- [ ] **History preserved:** Often corrupted by a blanket sweep -- verify `git diff` touches NO files under `.planning/`.
- [ ] **XML attributes:** Often over-normalized -- verify `verify_request`/`pre_verified` `severity=` attributes remain lowercase-canonical.
- [ ] **Atomic version bump:** Often partial -- verify the 5-surface version bump landed in one commit per convention.

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Worked-example drift (mixed output) | LOW | Grep both agent files for surviving shorthands; rewrite missed examples; re-run budget fixture |
| Vacuous-pass fixture (silent green) | MEDIUM | Add `matched_count >= min` assertion; re-run against a known-good and a zero-finding input to confirm it fails loudly when appropriate |
| Cross-surface drift leak (WR-04/WR-05 recurrence) | MEDIUM-HIGH | This is the documented 2-plan cleanup tail; budget a dedicated reconciliation step rather than hot-patching one surface |
| Verbatim-contract erosion (paraphrase regression) | HIGH | Revert the skill-layer conversion; move expansion to the agent (Route A); re-validate via headless UAT that findings are not dropped/reordered |
| `.planning/` history corruption | LOW-MEDIUM | `git checkout` the `.planning/` paths; re-scope the sweep to `plugins/lz-advisor/` |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 5: Route A/B + verbatim-contract + no-regrouping contradiction | Requirements | Decision recorded; SKILL.md prohibition lines have a reconciliation plan |
| 6: Downstream-consumer disposition table | Requirements | Per-surface disposition table covers all 6+ surfaces incl. eval JSON (N/A) and `.planning/` (history) |
| 3: Cross-surface lexicon drift | Requirements (checklist) + Implementation (atomic edit) + Verification (grep) | `git grep` finds no unintended residue in `plugins/lz-advisor/`; 6-surface checklist ticked |
| 1: Worked-example/grammar disagreement | Implementation | Both agent files: examples + format line + classification all use new labels; grammar-consistency grep clean |
| 2: Regression-fixture lockstep | Implementation (sibling task to agent edit) | Fixtures authored fresh with anti-vacuous guard; empirical run green on real output, red on zero-finding input |
| 4: Word/token budget interaction | Verification (empirical gate) | n>=3 budget-gate run passes on new grammar; severity-group headers excluded from per-finding caps |

## Sources

- `plugins/lz-advisor/agents/reviewer.md` (Format line, Severity Classification, 8 worked examples, `<output_constraints>` per-section budgets) -- HIGH
- `plugins/lz-advisor/agents/security-reviewer.md` (Format line, `(formerly High/Medium)` legacy annotations, worked examples, budgets) -- HIGH
- `plugins/lz-advisor/skills/review/SKILL.md:165-184` and `skills/security-review/SKILL.md:160-170` (render-verbatim contract + "Do NOT reformat into severity groups" prohibition) -- HIGH
- `plugins/lz-advisor/references/context-packaging.md` (Hedge Marker / WR-01 carve-out, Verification template Severity field, verify_request schema severity attribute) -- HIGH
- `.planning/PROJECT.md` Evolution entries 2026-05-03..2026-05-08 (Phase 7 WR-01/WR-02/WR-04/WR-05 severity-rename case study + budget-regression history) and milestone context -- HIGH
- `.planning/milestones/v1.0-ROADMAP.md:233-240` (Plan 07-12/07-13/07-17 severity-vocabulary alignment + per-section budget + +10% fixture tolerance precedent) -- HIGH
- `evals/lz-advisor/lz-advisor-review-eval.json`, `...security-review-eval.json` (confirmed trigger-only; NOT a rename surface) -- HIGH
- `git ls-files` (confirmed budget fixtures are not git-tracked; must be authored fresh) -- HIGH
- Project memory: `reference_sonnet_46_prompt_steering` (examples-over-prose steering), `feedback_no_cross_skill_body_references`, `version_numbers_not_load_bearing_prerelease` -- MEDIUM

---
*Pitfalls research for: structured-output severity-label expansion in the lz-advisor review/security-review grammar*
*Researched: 2026-06-07*
