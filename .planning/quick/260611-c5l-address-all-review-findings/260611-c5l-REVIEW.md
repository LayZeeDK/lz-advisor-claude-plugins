# Quick Task 260611-c5l: Address all review findings

Source: `/code-review` of PR #1 (Milestone v1.0.1). These are the curated, verified findings.

## Hard constraints (apply to EVERY task)

1. **Both budget fixtures MUST stay GREEN after every change.** After any edit, run:
   - `bash tests/D-reviewer-budget.sh` -> exit 0
   - `bash tests/D-security-reviewer-budget.sh` -> exit 0
   - `bash tests/D-reviewer-budget.sh --self-test` -> exit 1 (fail-loudly proof)
   - `bash tests/D-security-reviewer-budget.sh --self-test` -> exit 1
2. **The fixtures self-extract their baseline from the agent worked examples.** Any edit to a worked example in `reviewer.md` / `security-reviewer.md` must keep the self-extract parse valid and within budgets. Check which example the fixture extracts before editing.
3. **Preserve the render-verbatim contract.** The literal headers each agent emits (`### Critical` / `### Important` / `### Suggestions` / `### Questions` + `### Cross-Cutting Patterns` for reviewer / `### Threat Patterns` for security) MUST byte-match what the skills name and what the fixtures' `SEV_HEADERS` parse. DO NOT change any header spelling.
4. **Respect locked decisions.** D-10 (no fixture dedup -- finding #10 is WON'T-FIX), D-09 (per-section budgets / parser-layer tolerance), and the 75w CVE auto-clarity carve-out (by design) are NOT to be reversed.
5. **No version bump.** These are corrections folded into the unmerged 1.0.1 PR; do NOT touch the 5 version surfaces.
6. **Scope:** changes only under `plugins/lz-advisor/` and `tests/`. Do NOT touch `.planning/` frozen history. No AI attribution in commits.

## Findings

### FIX -- consistency (highest value)

**#1 -- security-reviewer.md:156 vs :470 -- contradictory hedge placement.**
The worked example at 156-158 calls the CORS `[A05]` case a "security-clearance question" and files its UNCONFIRMED `Unresolved hedge:` finding under `### Important`; the rule at :470 mandates an unconfirmed "security-clearance question" go under `### Suggestions` until verified (then move up). Make them agree: either move the worked example to `### Suggestions` (preferred -- matches the rule) or narrow the rule's wording so an A05/CORS dev-config hedge is legitimately Important. Keep the teaching intent and the `Unresolved hedge:` frame intact.

**#2 -- tests/D-reviewer-budget.sh (and security) -- budget gate coverage gap.**
The fixture enforces only the 28w outlier, 160w Cross-Cutting, 30w Missed-surfaces caps. The `<output_constraints>` ALSO declare `per_finding_validation max_words=60` (per entry), `max_count=15` (finding ceiling), and a 22w per-entry target. Add assertions for the PFV 60w/entry cap and the max_count=15 ceiling (the 22w target is a soft target -- assert it as a warning, not a hard fail, OR document why it stays unchecked). Verify the holistic worked examples satisfy the new assertions so the fixtures stay GREEN.

### FIX -- robustness (nits)

**#3 -- D-reviewer-budget.sh:253 -- asymmetric Cross-Cutting extraction.**
The awk hardcodes `### Missed surfaces` as the terminator; the security fixture uses a generic `extract_section()` that stops at the next `### `. Change the reviewer fixture's Cross-Cutting (and Missed-surfaces if applicable) extraction to the generic next-`### ` boundary, mirroring `extract_section()`. (This is NOT dedup -- do not merge the two files; just align the boundary logic.) Keep GREEN.

**#4 -- D-reviewer-budget.sh:152 / D-security-reviewer-budget.sh:142 -- SEV_HEADERS over-anchored vs its comment.**
`SEV_HEADERS='^### (...)$'` is intolerant to trailing space / surviving CR, but the adjacent comment promises tolerance to exactly those. Resolve the contradiction: either drop the `$` to make it genuinely prefix-tolerant (preferred -- then a CR/trailing-space header still matches) OR correct the comment to state the match is strict. Be consistent across both fixtures. Keep GREEN.

**#5 -- security-reviewer.md:154 -- dangling "as shown in example 3 above."**
There is no labeled "example 3"; the `<verify_request>` is demonstrated in the finding-5 `@compodoc` example just above (151-152). Repoint the reference to that example (or drop the bogus label).

### FIX -- cleanup (apply the MINIMAL SAFE version; verifier confirms no contract break)

**#6 -- reviewer.md:416-438 ~= security-reviewer.md:446-470 -- "Hedge Marker Discipline" duplicated near-verbatim.**
CAUTION: only extract to a shared `references/*.md` IF the agents actually support `@`-loading references (verify how the agents currently reference `references/context-packaging.md` -- skills `@`-load, agents may not). If the agents do NOT `@`-load, DO NOT extract (it would silently drop the content from the system prompt) -- instead keep the duplication and add a one-line "keep in sync with the other reviewer agent" maintenance note to both. Do not break either agent.

**#7 -- review/SKILL.md:175 (and security-review/SKILL.md ~161) -- incomplete "Required output shape".**
The template lists Critical->four sections->Cross-Cutting, omitting `### Per-finding validation` (between Questions and Cross-Cutting per reviewer.md:303) and `### Missed surfaces`, implying Cross-Cutting is last. Complete the template to reflect the full ordering, or add a note that the optional `### Per-finding validation` and `### Missed surfaces` sections may also appear and pass through verbatim. Prose-only; do not change the verbatim mechanism.

**#8 -- security-reviewer.md -- 75w CVE auto-clarity carve-out restated 4x** (~107, 215, 263, 291).
Consolidate to a single source of truth: keep the `<auto_clarity_carve_out cap="75">` XML element canonical and trim the redundant prose restatements to a single short reference (one of them already self-admits it "mirrors" the element). DO NOT change the carve-out semantics or the 75w value (by design, D-09). Keep GREEN (the CVE finding in the worked example must still pass under its 75w cap).

**#9 -- reviewer.md:57 (and security-reviewer.md:58) -- `### Severity sections` unfenced heading.**
It is a `###` heading in the prompt body not enumerated in `<output_constraints>` (which forbids non-enumerated headings in OUTPUT). Demote it so it cannot be echoed as an output section heading -- e.g. make it bold prose (`**Severity sections**`) or a non-`###` label -- while keeping the legend readable. Keep the "MUST begin with `### Critical`" constraint and the legend content intact.

**#11 -- context-packaging.md:390 -- redundant duplicated clause + singular "Suggestion".**
The `severity` doc has a duplicated identical clause ("... for reviewer; ... for security-reviewer" with identical halves) and uses singular "Suggestion" vs the plural `### Suggestions` header. De-duplicate the clause and align the wording. Trivial prose fix. (The lowercase machine attribute `severity="suggestion"` stays lowercase per SYNC-01 -- only the human-readable prose label is corrected.)

**#12 -- reviewer.md:98 (and security-reviewer.md) -- FIX-* namespace + stale run-id provenance.**
MINIMAL SAFE version ONLY: the FIX-* rule IDs are load-bearing internal cross-references -- DO NOT rename them (renaming risks breaking the prompt's own references). Instead, strip the stale run-id provenance citations (e.g. "the review-2 anti-pattern", "r2-security-1", "security-3 F8") that reference archived UAT traces, replacing them with generic phrasing ("a documented anti-pattern"). If stripping a citation is not cleanly possible without disturbing a cross-reference, leave that instance and note it.

### WON'T-FIX

**#10 -- deduplicate the two fixtures into a shared helper -- WON'T-FIX.**
Reverses **Phase 11 D-10** (`.planning/phases/11-fixture-baseline/11-CONTEXT.md:34`, decided 2026-06-07, this same milestone): "Two standalone scripts (no shared helper lib, no parameterized single script) ... duplication across exactly 2 zero-dependency files is acceptable and keeps each gate independently runnable." The narrower #3 asymmetry fix is applied; the files stay standalone. Record this disposition in SUMMARY.md.
