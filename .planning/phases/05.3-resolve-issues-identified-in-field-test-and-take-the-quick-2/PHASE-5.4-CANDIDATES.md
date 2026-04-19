---
source: "05.3 UAT observations (review + execute sessions)"
captured: 2026-04-19
type: phase-5.4-candidates
---

# Phase 5.4 Candidates — Advisor/Reviewer Economics & Packaging Symmetry

Captured during Phase 5.3 UAT-H3 (review skill) analysis after observing the reviewer agent burn 4 tool uses at Opus xhigh effort, at least one inside `node_modules/@storybook/angular/` source code — work the executor (Sonnet, cheaper) could and should have done upfront.

## Context

Phase 5.3 delivered the Context Trust Contract (D-06..D-09) and `references/context-packaging.md` (D-10..D-12). Both codify the AGENT-side obligation ("trust what is packaged; don't waste tool calls re-verifying packaged content"). They do not codify the symmetric EXECUTOR-side obligation: "verify the claims YOU package that depend on external package behavior, so the agent doesn't have to."

Result in the field: executors flag uncertainties but don't resolve them before consulting. Agents compensate by reading dependency sources at 8-12x the executor's per-token cost.

## Candidate Findings

### A. D-13 orient-budget instruction is too blunt

**Current wording** (`lz-advisor.plan` + `lz-advisor.execute` SKILL.md):

> Stop exploring when you have enough context to formulate a specific question for the advisor. Do not read bundled, minified, or files under `node_modules/*/dist/`.

**Problem:** The "do not read" clause reads as a blanket node_modules ban. Executors now treat `node_modules` as off-limits and punt any dependency-behavior verification to the advisor/reviewer agents. Opus at high/xhigh effort is 8-12x more expensive per token than Sonnet at medium.

**Intent:** Discourage **full-file reads** of bundled/minified content (5000-line webpack chunks where the useful signal is 3 lines). Encourage **targeted reads** (read with offset/limit, or search then read the one function) when dependency behavior is load-bearing.

**Proposed direction:** Reframe from "don't enter node_modules" to "enter node_modules with discipline." Keep wording tool-agnostic — no specific command names. Emphasize: (a) targeted reads only, never full-file for bundled/minified content; (b) surface the verified behavior verbatim in the advisor/reviewer package so the agent trusts it.

### B. Context Trust Contract is one-sided

**Current:** agent-side obligation only — "trust what is packaged; tools only for facts NOT in your prompt."

**Missing:** executor-side symmetric obligation — "if a packaged claim hinges on external package behavior, verify upfront and quote the verification output inline; don't assert and wait for the agent to verify."

**Proposed direction:** Add the converse rule to the Context Trust Contract section in each agent file, OR add an executor-facing rule to the Common Contract in `references/context-packaging.md`. The latter may be cleaner — packaging discipline lives in one place already.

### C. context-packaging.md templates lack a "Pre-Verified Package Behavior Claims" section

**Observed failure mode (UAT-H3):** Executor's Finding 2 said: "In Storybook 10 with `@storybook/angular`, this may be auto-injected by the framework — this is the key uncertainty." The executor flagged the uncertainty but did not resolve it. The reviewer then read `@storybook/angular` builder source code inside node_modules to answer it.

**Proposed direction:** Add a new section to both Proposal and Verification templates titled along the lines of "Package Behavior Claims (Pre-Verified)." Each entry pairs an assertion about third-party package behavior with the tool-output excerpt that verified it. Agents treat pre-verified claims as trusted and don't re-verify. Target impact: material reduction in agent internal tool uses.

### D. Advisor response lacks an "Out-of-scope:" convention

**Observed (pre-execute consultation):** Executor asked 3 questions; advisor returned 5 numbered points. Points 1-4 directly answered questions; point 5 (configurations.ci check) was helpful-but-unasked. Worth catching — scope creep inflates word budget and dilutes answer-to-question ratio.

**Proposed direction:** Instruct advisor (via Response Structure guidance in `advisor.md`) to append concerns outside the packaged question under a separate `**Out-of-scope:**` marker instead of numbering them alongside direct answers. Same principle applies to reviewer/security-reviewer if analogous scope-creep observed.

### E. Agents lack "Assuming X (unverified)" discipline for context not packaged

**Observed (final-review consultation):** Advisor point 5 speculated about CI behavior: "For CI, ensure the build-storybook job installs devDependencies... has no `--no-optional` flag stripping it." Nothing in the packaged context mentioned CI, pnpm, or `--no-optional`. The recommendation is reasonable engineering advice but presented as if verified.

**Proposed direction:** When agents give advice that depends on context NOT in the packaging (infra, CI, runtime environment), format as conditional: "Assuming X (unverified), do Y" so the executor knows to confirm the assumption before acting. Codify in agent Edge Cases sections.

### F. Reviewer word-cap tension

**Observed (Plan 04 UAT + Phase 5.3 UAT-H3):** Both baseline and post-fix reviewer responses land at 340-383w, above the 300w cap + 10% tolerance ceiling of 330w. The Cross-Cutting Pattern synthesis section (~80w in UAT-H3) is the highest-value part of the response and the source of most of the overflow.

**Proposed directions** (pick one):
- Raise reviewer (and security-reviewer) cap to ~400w.
- Exclude Cross-Cutting Pattern from the word count as qualitative synthesis.
- Give Cross-Cutting Pattern its own named slot in `reviewer.md` Response Structure with its own budget (~100-150w).

Plan 04 UAT-RESULTS.md already flagged this as a recalibration candidate. Phase 5.3 closes without fixing; Phase 5.4 is the right scope to resolve.

### G. Related: executor-packaged uncertainty flags should be resolved, not just annotated

**Observed (UAT-H3 executor prompt):** The executor packaged the `setCompodocJson` auto-injection uncertainty and flagged it as "the key uncertainty" — which is good discipline. But flagging without resolving still costs: the reviewer had to resolve it inside node_modules at xhigh rates.

Addressed structurally by finding C above (Pre-Verified Package Behavior Claims). Listing separately for traceability — this is the concrete case where finding C's gap materialized.

### H. Executor chooses expensive verification primitives when cheap ones suffice

**Observed (UAT-H3b review-with-plan executor orient step):** To check a single dependency version the executor ran a chained shell pipeline invoking one language runtime with a defensive fallback to another language runtime piped through a text extractor. The pipeline required a permission prompt on the fallback branch because the pipe receiver was not in the default allowlist.

**Three problems, independent of project ecosystem:**

1. **Wrong primitive.** The fact lives in a structured text file. The session's built-in file-read primitive opens the file at zero permission cost, zero runtime spawn cost, and returns the full content with line numbers — strictly more useful than a single parsed value.
2. **Defensive fallback without benefit.** The `||` fallback branch only fires if the primary language runtime is unavailable, which doesn't happen in practice. It adds a permission prompt surface without any real recovery behavior.
3. **Redundant verification.** The value was already in the plan file (provided as background context) and already observed verbatim during the prior execute session's orientation. Re-verifying a known fact is wasted effort.

**Proposed direction — two complementary levers:**

**Lever 1 (structural): expand each skill's `allowed-tools` frontmatter to declare the sanctioned tool set the executor is expected to rely on.**

Currently each lz-advisor skill pre-approves only its paired Agent (e.g., `Agent(lz-advisor:reviewer)`). The file-read, search, and git-inspection primitives the executor needs during orientation fall through to the user's settings.json, which produces permission prompts in locked-down environments. Adding the expected primitives to `allowed-tools` removes that friction for marketplace consumers AND declaratively steers the executor toward the sanctioned list by making pre-approved tools the path of least resistance.

Likely toolsets (finalize during Phase 5.4 discussion):

| Skill | `allowed-tools` additions beyond Agent |
|-------|----------------------------------------|
| `lz-advisor.plan` | Read, Glob, Bash(git:*), Write |
| `lz-advisor.execute` | Read, Glob, Edit, Write, Bash(git:*), plus the test-runner surface the project uses |
| `lz-advisor.review` | Read, Glob, Bash(git:*) |
| `lz-advisor.security-review` | Read, Glob, Bash(git:*) |

Crucially, `allowed-tools` is additive only — it cannot override user deny rules. A user who denies `Bash(python3:*)` still blocks that path; the skill simply doesn't ask for it. This is the correct posture: pre-approve the cheap sanctioned primitives, leave everything else to user governance.

**Lever 2 (prompt-level): add an executor-discipline rule to `references/context-packaging.md` Common Contract.**

Advise that when a fact lives in a structured text file (manifest, lock file, config, frontmatter), the session's built-in read primitive should be preferred over invoking a language runtime to parse the file inline, and that defensive fallback chains should be avoided unless the primary path genuinely can fail. `references/context-packaging.md` is the single source of truth for executor packaging discipline and reaches all four skills via `@`-load; adding the rule there flows it to plan/execute/review/security-review at once.

Keep wording command-agnostic: no specific tool names, no specific shell commands, no specific file names. The rule is about primitive selection and over-verification, not about any particular ecosystem or tool.

**Why both levers together:** Lever 1 makes the cheap sanctioned path prompt-free; Lever 2 makes it the executor's first choice. Either lever alone leaves one gap — Lever 1 without Lever 2 doesn't discourage `node -e` / `python3 -c` habits; Lever 2 without Lever 1 leaves the friction in place for locked-down environments. Together they close both sides.

Pairs well with Findings B and C: an executor coached to verify its own claims (B) and to pre-quote verifications in the agent package (C) also benefits from being coached to use cheap verification primitives (H) when they suffice, and from skipping verification entirely when the fact is already in context (also covered by B's "pre-verify" discipline — if the executor reads the plan thoroughly during orientation, it doesn't need to re-verify declared deps).

### I. Executor halts on tool-use denial instead of gracefully degrading

**Observed (UAT-H3b review-with-plan executor orient step, 3rd python3 invocation):** After the user denied the permission prompt for a third redundant `python3 -c` orientation check, the executor halted with `Interrupted · What should Claude do instead?` — it did not (a) try a different primitive, (b) mark the information as unavailable and proceed, or (c) skip the check and continue to package findings for the reviewer. The review workflow stopped mid-orientation; the reviewer was never invoked.

**Why this matters, independent of Finding H:**

1. **Common denial surface.** Any orientation tool call can fail for reasons other than permission denial — network errors, missing files, runtime errors, timeouts. The executor must tolerate all of them.
2. **Non-interactive modes are silently broken.** In `claude -p` automation (the Phase 5.3 UAT harness pattern), there is no user to respond to an `Interrupted · What should Claude do instead?` prompt. The skill would hang until the harness timed out.
3. **Brittleness compounds with scope drift.** The denied check was non-essential (lock-file dependency enumeration is not in the review scope for the commits under test — see Finding H point 3). A more disciplined executor would not have pursued it, but even a disciplined executor pursuing a load-bearing check should recover from denial gracefully, not halt.

**Proposed direction:** Add a graceful-degradation rule to `references/context-packaging.md` Common Contract (and mirror to SKILL.md bodies if finer-grained guidance is needed per skill). Approximately:

> When a tool use during orientation fails for any reason (permission denial, missing file, runtime error, timeout), treat the information as unavailable. Note the unavailability in the packaged context if the information is load-bearing, then proceed. Do not halt the workflow waiting for user intervention unless the missing information blocks every possible path forward.

Keep wording primitive-agnostic and error-type-agnostic. The rule is about not halting mid-workflow, not about any particular tool or error class.

**Why this is load-bearing for marketplace distribution:** Users who install the plugin into corporate / sandboxed / locked-down environments will hit permission denials routinely. A skill that halts on denial is un-shippable for those users. A skill that degrades gracefully is portable.

Pairs with Finding H (together they cover both "don't reach for expensive primitives" and "recover when any primitive is denied"). Also pairs with B (pre-verify during orientation while context is still live, so failed later checks aren't load-bearing).

### J. Plan-primed reviewer executor narrows orientation scope to the plan's stated scope

**Observed (UAT-H3b review-with-plan, Test 6):** When the review skill was invoked with the implementation plan as background context, the executor's orientation phase narrowed to only the files the plan said were changed. The plan explicitly stated "No changes to .storybook/main.ts or .storybook/tsconfig.json" (steps 5 and 6). The executor treated this as a signal to skip those files entirely during orientation. Consequently, preview.ts (empty), tsconfig.json (using project references that Compodoc cannot follow), and main.ts were never read — even though all three are in the same .storybook directory as the changes and all three are directly coupled to whether the Compodoc integration actually produces working autodocs.

**A/B signal vs Test 5 (no-plan):**

Test 5 (no plan): 0 Critical / 2 Important / 2 Suggestion. Both Importants were real defects (empty-docs via tsconfig references; missing setCompodocJson wiring in preview.ts).

Test 6 (with plan, same commits, no code changes since Test 5): 0 Critical / 0 Important / 2 Suggestion. Both Test 5 Importants MISSED. One Test 5 Suggestion (browserTarget self-reference) correctly downgraded. One net-new Suggestion (artifact-location three-way coupling / redirect-to-dist/ synthesis) — genuinely insightful.

Score: no-plan caught 2 real defects; with-plan caught 0 real defects and added 1 nice synthesis. Reviewer agent response quality was comparable (0 internal tool uses in both runs, clean enumerations); the regression was entirely at the executor's orientation scope.

**Root cause:** The review skill's value comes from INDEPENDENT triage. Passing a plan as background context creates latent orientation bias: the executor reads "no changes to X" and interprets it as "don't investigate X" — even when X is directly coupled to what WAS changed. Result: the reviewer becomes a conformance checker ("did they do what the plan said?") instead of a quality reviewer ("does this code work correctly?").

**Proposed directions** (pick during Phase 5.4 planning):

1. **Don't accept plan context in the review skill.** Review works excellently without it (Test 5 proves this). Plan context creates scope-collapse risk without commensurate benefit. Simplest fix; preserves Test 5 quality signal.
2. **Accept plan, invert its use.** Instruct the executor: "The plan tells you what the implementer CLAIMED. Your job is to verify the claims AND investigate everything the plan says was NOT changed — those are the highest-risk files because they may have coupling the implementer missed." Harder to word robustly; easier for the executor to misinterpret.
3. **Accept plan, require adjacent-file investigation.** Instruct the executor to investigate all files in directories touched by the diff, not just the files explicitly modified. Loosely approximates option 2 without requiring the executor to reason about risk-ranking.

Preference for phase 5.4 discussion: option 1. Clean separation of concerns (plan skill is for planning, review skill is for independent validation). If users want plan-informed review, they can run `/lz-advisor.review` on commits twice — once without plan context, once with — and compare, which is what Tests 5 and 6 effectively did.

**Scope note:** Finding J only applies to the review skill. For the execute skill, plan context is load-bearing and beneficial — the executor NEEDS to know what to build. The distinction is "executor needs to deliver what was planned" (execute) vs "reviewer needs to independently judge quality" (review).

Pairs with no other finding directly — this is a skill-specific scope-discipline concern, not a packaging or primitive concern.

### K. No web-search tools in skill or agent allowed-tools -- forces source-tree archaeology for API-migration questions

**Observed (remediation execute session, 2026-04-20):** To verify whether `setCompodocJson` is still exported from `@storybook/addon-docs/angular` in Storybook 10.3.5, the executor ran approximately 50 targeted searches inside `node_modules` over three layers: (a) the @storybook/* package tree, (b) reverse-engineered browser/node chunk exports for `__STORYBOOK_COMPODOC_JSON__` globals, and (c) @nx/storybook + @nx/angular generator templates. Total Bash invocations in the session: 55. The single answer retrieved (symbol was removed, global-write path required) would have returned in 1 WebSearch or 1 WebFetch against Storybook's migration docs or release notes.

**Two-sided cause:**

1. **Advisor's `allowed-tools` lacks web access** (currently `Read, Glob` only). The plan session's advisor confidently asserted the Storybook 8.x API path for `setCompodocJson` — the correct Storybook 10.x path (direct global write) was outside the advisor's investigable scope, so it produced an authoritative-sounding but out-of-date answer.
2. **Executor's `allowed-tools` also lacks web access.** When the executor then tried to verify the advisor's claim, it had no cheap external-documentation path and fell back to source archaeology.

**Why this matters separately from Findings B, C, H:**

- Finding C (Pre-Verified Package Behavior Claims) assumes executors can verify claims cheaply. Without web access, verifying an API-migration claim requires full node_modules excavation. Finding K is thus a **precondition** for Finding C being economical.
- Finding B (symmetric executor obligation) tells the executor to verify claims it packages. Without web access, that obligation scales cost with package size.
- Finding H (prefer cheap primitives) says "use the built-in read primitive for structured files." Web search fits the same category for non-file questions (API change logs, migration guides, removed-export confirmation).

**Proposed direction -- two levers:**

**Lever 1 (structural): add `WebSearch, WebFetch` to both skill `allowed-tools` and Opus agent tool lists.**

Skills get them so the executor can reach authoritative answers without friction. Opus agents get them so the advisor/reviewer/security-reviewer can pre-verify package-behavior assertions they make. Applicable scopes:

| Component | Web tools rationale |
|-----------|---------------------|
| `lz-advisor.plan` skill | executor orient phase: verify library/framework API state before packaging a plan |
| `lz-advisor.execute` skill | executor mid-execute: resolve API mismatches without node_modules archaeology |
| `lz-advisor.review` skill | executor orient: check for recently-disclosed vulnerabilities / deprecated APIs in dep set |
| `lz-advisor.security-review` skill | executor orient: fetch CVE advisories for flagged dependency versions |
| advisor agent | pre-verify API assertions before committing in Strategic Direction |
| reviewer agent | verify "framework X does not auto-inject" style claims during batched verification |
| security-reviewer agent | verify CVE/version claims directly from NVD / GitHub advisory DB |

**Lever 2 (prompt-level): add a rule to `references/context-packaging.md` Common Contract on web vs local investigation:**

Approximately:

> When the fact to verify concerns (a) an external library's API that may have changed across major versions, (b) a recently-disclosed vulnerability, (c) released product behavior, or (d) authoritative framework documentation, a single web fetch or web search returns the answer faster and more reliably than exhaustive source-tree searching. Prefer web tools for API-migration and documentation-lookup questions; prefer the built-in file-read primitive for project-specific config, lock-file resolution, and internal module wiring.

Keep wording tool-agnostic and decision-rule-oriented (when web vs when local), not command-specific.

**Measured cost avoided:** ~50 Bash invocations in this session alone. Each Sonnet tool call is cheaper than an Opus call but still non-zero; aggregate per-feature cost is substantial. Latency cost is also real — the 50 calls likely added 30-60 seconds of serialized tool execution before the executor could commit to the alternative path via mid-execute consultation.

**Security caveat worth surfacing in Phase 5.4 discussion:** Web fetches introduce a prompt-injection surface that source-tree reads do not. The Common Contract rule should probably note that fetched content should be treated as untrusted source material (packaged verbatim with `BEGIN FETCHED / END FETCHED` markers like Nx guides) — not executed-as-instruction. The user's global CLAUDE.md already names known-blocked domains and a fetch fallback chain; lz-advisor shouldn't attempt to override those patterns.

Pairs with Findings B (pre-verification obligation), C (Pre-Verified Package Behavior Claims), and H (cheap primitive selection). Together these four findings form a coherent "executor verifies cheaply and correctly before burdening agents" doctrine.

## Priority Signal

Rough ROI ranking by reviewer/advisor cost delta:

1. **J (plan-primed reviewer executor narrows scope to plan scope)** — correctness-affecting: review skill misses real defects when plan-primed. Empirically measured (Test 5 vs Test 6: 2 real Important defects lost).
2. **I (graceful degradation on tool-use denial)** — makes skills portable to locked-down environments; prevents mid-workflow halts. Load-bearing for marketplace distribution.
3. **K (add WebSearch / WebFetch to skill + agent allowed-tools for API-migration questions)** — precondition for Finding C economics. Empirically measured: ~50 Bash calls on one remediation session that a single web lookup would resolve. Touches every skill and every Opus agent.
4. **C (Pre-Verified Package Behavior Claims section)** — largest single lever for Opus cost; directly prevents node_modules work at reviewer/advisor rates. Low authoring effort. Depends on K being practical.
5. **B (symmetric executor obligation in Context Trust Contract)** — pairs with C; gives executors explicit license to pre-verify. Also depends on K being practical.
6. **A (D-13 rewording)** — removes the blanket "no node_modules" mental model that currently blocks (5).
7. **H (expand skill `allowed-tools` + prompt-coach primitive choice for structured-file lookups)** — structural lever eliminates permission-prompt friction in locked-down environments; prompt lever discourages language-runtime parse habit. Pairs with (2) to close both sides of the denial-resilience problem.
8. **D (Out-of-scope: convention)** — word-budget hygiene; small per-response wins.
9. **E (Assuming X unverified framing)** — hallucination-reduction; catches infra speculation.
10. **F (reviewer word-cap recalibration)** — measurement-regression cleanup; no correctness implication.

## Open questions for Phase 5.4 discussion

- For Finding J, which of the three proposed directions do we adopt? Option 1 (don't accept plan context in review skill) is the simplest and preserves Test 5's quality signal; option 2 (invert plan use) is appealing but harder to word robustly; option 3 (require adjacent-file investigation) approximates option 2 structurally.
- For Finding K, should agents (advisor/reviewer/security-reviewer) also receive `WebSearch` / `WebFetch`, or only skills? The case for agents: pre-verify assertions before committing in Strategic Direction. The case against: more tool-call budget consumption in the already-constrained agent turn budget.
- For Finding K, should the Common Contract carry an explicit "treat fetched content as untrusted / package verbatim with BEGIN/END markers" rule to mitigate prompt-injection surface?
- Should the executor-side pre-verification obligation (B) live in `references/context-packaging.md` (one place) or in each Opus agent's Context Trust Contract mirrored as a contract-partner obligation?
- Is "Pre-Verified Package Behavior Claims" the right section name, or should it live under "Source Material" with a tagged subtype?
- Is the word-cap tension (F) worth solving, or does Phase 5.3's UAT-RESULTS.md "advisor/reviewer responses exceed cap but quality improves" already close it as a non-issue?

## Related artifacts

- `05.3-VERIFICATION.md` Key Findings 6 already flagged word-count caps as a follow-up item.
- `05.3-UAT-RESULTS.md` Recommendation section item 1 already flagged parse-trace.mjs heuristic refinement (separate from this candidate set but in the same Phase-5.4 cohort).
- This file captured ad-hoc during UAT-H3 analysis; promote to a formal phase plan via `/gsd-add-phase` when ready.
