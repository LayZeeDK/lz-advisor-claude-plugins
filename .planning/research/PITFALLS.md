# Pitfalls Research

**Domain:** Parallel-fan-out, web-searching, adversarially-verified deep-research capability inside a zero-dependency, headless-verifiable Claude Code plugin skill (`lz-deep-research`)
**Researched:** 2026-06-15
**Confidence:** HIGH for design-validated pitfalls (4 empirical spikes + 4-family advisor consult in SESSION-DESIGN.md); MEDIUM-HIGH for the externally-verified Claude Code platform limits (concurrency cap, disk-I/O storm) and citation-fidelity literature.

> **[CORRECTION 2026-06-15 -- script placement]** Where this document places the deterministic off-model aggregator in `bin/`, that is SUPERSEDED. Re-verified against the live plugins-reference + plugin-dev `plugin-structure`/`skill-development` + skill-creator: `bin/` is a real official component, but it is for USER-FACING executables injected onto the Bash PATH (invokable as bare commands). The aggregator is a SKILL-INTERNAL helper, so it belongs in the skill's own bundled `scripts/` dir -- `skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` -- invoked via `node "${CLAUDE_PLUGIN_ROOT}/skills/lz-deep-research/scripts/..."` (NOT a bare command; no PATH/exec-bit/shebang dependency, Windows-arm64 / Git-Bash safe). Read every `bin/` reference below as `skills/lz-deep-research/scripts/`. SUMMARY.md + REQUIREMENTS.md + ROADMAP.md use the corrected location.

> **How to read this file.** SESSION-DESIGN.md already enumerates and (in several cases) mitigates the headline pitfalls. This document does NOT re-derive them. It (1) validates and prioritizes the design's pitfalls, (2) tags each `[MITIGATED-IN-DESIGN]`, `[PARTIALLY MITIGATED]`, or `[OPEN]`, and (3) surfaces NEW pitfalls the design did not fully cover, tagged `[NEW]`. Every pitfall maps to a roadmap phase. Phase numbering continues from 15 (per PROJECT.md); the phase labels below are by-topic and the roadmap author should bind them to concrete phase numbers.

---

## Critical Pitfalls

### Pitfall 1: Silent false-uphold the escalation cannot catch  `[PARTIALLY MITIGATED]` (the structural hole is named; the guard is interim, unproven)

**What goes wrong:**
A claim is actually false, but all 3 isolated voters return "supported." Because the escalation trigger fires only on a *contested split*, a unanimous-wrong verdict has no split to detect, so it ships into the cited report at HIGH confidence. This is strictly worse than an over-refutation: over-refutes self-escalate and are recoverable; false-upholds are silent and uncatchable by the contested trigger alone.

**Why it happens:**
Three same-family (or same-tier) voters share blind spots. In the OPEN-BOOK path the failure is amplified: a weak voter fails to orchestrate an adversarial search, finds "no counter-evidence," and defaults to uphold; or it is misled by a plausible-but-irrelevant hit. SESSION-DESIGN.md §8 and §15.1 name this precisely ("3 same-family votes are a signal, not a proof"; "a Haiku FALSE-UPHOLD is by definition a UNANIMOUS uphold, so the contested-split trigger STRUCTURALLY CANNOT catch it").

**How to avoid:**
The design's interim guard is the only known mitigation and it is NOT optional. Escalate to Sonnet on the UNION of three triggers, not just the first:
(a) any contested split;
(b) any claim **load-bearing to the report's conclusions**, regardless of Tier-1 verdict;
(c) a **random audit sample (~15-20%) of unanimous UPHOLDs**.
Keep the deterministic quote-vs-excerpt drop UPSTREAM of all voting so the content-absent class never reaches voting at all -- that narrows what the voter must be good at to *reasoning* overreach. Keep ALL-SONNET as the active default; Haiku-first stays behind a config flag until the pre-registered gating eval (§15.1) clears with false-uphold rate as the SOLE hard gate.

**Warning signs:**
- A report ships a surprising/central claim at HIGH confidence with only 3 unanimous Tier-1 votes and no audit-sample or load-bearing escalation recorded.
- The audit-sample escalation fraction is configured at 0% "to save cost."
- "Contested" never appears as an outcome across many runs (suggests the skeptics are rubber-stamping, not adversarially searching).

**Phase to address:**
Adversarial verification phase. Bake (a)+(b)+(c) into the voter-dispatch logic and the tally rubric in `references/lz-deep-research-schema.md`; assert them in the validation fixture (a planted load-bearing false claim must escalate; a unanimous-uphold run must show an audit-sample escalation).

---

### Pitfall 2: Reference / corroboration pollution in the open-book voter  `[NEW]`

**What goes wrong:**
An open-book voter (WebSearch/WebFetch) "verifies" a false claim by finding pages that themselves repeat the false claim, and concludes it must be true. This is the mechanism by which ghost references survive verification: the web echo-chamber supplies apparent corroboration for a claim that is wrong at the root. It directly amplifies Pitfall 1 -- it is *how* a false-uphold gets manufactured with citations attached.

**Why it happens:**
The design gives voters live web access (`WebSearch`, `WebFetch`) specifically so they can find counter-evidence. But search relevance is keyword-driven; a voter searching the claim's own terms preferentially surfaces pages that assert the claim. SESSION-DESIGN.md does not name this -- it treats open-book as strictly stronger than closed-book, but open-book introduces this failure class that closed-book (claim-vs-provided-excerpt) does not have. Confirmed in the citation-hallucination literature: "RAG systems using general web search can be fooled by reference pollution. When an LLM searches the web to verify a citation, it may find pages that themselves cite the ghost reference, concluding the paper must be real."

**How to avoid:**
- In the voter prompt, mandate an explicit *disconfirming* search (search for the negation / contradiction, not the claim's own phrasing) and require the vote to record the disconfirming query it ran.
- Diversify voter attack modes (the design already does: factual-contradiction / scope-causality-overclaim / source-provenance) so at least one voter is structurally looking for the refutation rather than the assertion.
- Weight corroboration by **source independence**, not source count -- N pages that trace to one origin (syndication, mirror, citation-of-citation) are one source, not N. This dovetails with Pitfall 8.
- Require the voter to distinguish "found pages asserting X" from "found primary evidence for X."

**Warning signs:**
- Voter votes cite multiple URLs that are obviously the same wire story / syndicated copy.
- "Supported" verdicts whose cited evidence is itself a secondary aggregator, not a primary source.
- A claim known to be false in the eval fixture is upheld open-book but refuted closed-book (the gating eval must include exactly this contrast -- §15.1 already calls for closed AND open book).

**Phase to address:**
Adversarial verification phase + the gating eval. The open-book false-uphold rate on the SUBTLE subset is already the design's veto for Haiku-first; add a fixture row that plants a *polluted* false claim (false claim + several echo pages) to test the disconfirming-search mandate.

---

### Pitfall 3: Main-context exhaustion under fan-out  `[MITIGATED-IN-DESIGN]` (verify it survives SKILL packaging + scale)

**What goes wrong:**
Raw fetched pages, raw votes, and per-source claims accumulate in the main orchestrator session as workers return, and the Sonnet session blows its context window mid-run -- the classic deep-research failure where the orchestrator tries to "hold" the corpus.

**Why it happens:**
The naive design returns worker *content* to the parent. The lz-advisor design avoids this with the **receipt rule** (workers return `<ack path=... n=N/>`, never prose) plus **off-model reduction** (the `bin/` script reads many files, returns a tiny summary). Spike A2 proved the headless fan-out + receipt path. This is genuinely mitigated in the spine (§3, §6).

**How to avoid (what still needs verifying at build time):**
- Enforce the receipt rule in EACH worker agent's frontmatter/system prompt, not just the orchestrator's intent -- a worker that "helpfully" summarizes its findings in prose re-introduces the leak. Add a fixture assertion that a worker return is a one-line receipt under a hard char cap.
- Keep the orchestrator's only between-wave reasoning as a `bin/` shell-out (zero in-context reasoning over raw data, per §6).
- The named ceilings (`ANGLES~5`, `MAX_FETCH=15`, `MAX_VERIFY_CLAIMS~24`, `VOTES_PER_CLAIM=3`, `SYNTH_CAP~20`) must be ENFORCED in `bin/`, not merely documented -- an un-capped fetch wave defeats boundedness.
- The ~20k-token-per-subagent overhead is real (external sources); the *parent* doesn't pay it but it bounds how many waves are affordable. Boundedness protects the parent context, not total cost (see Pitfall 6).

**Warning signs:**
- A worker receipt longer than one line / over the char cap.
- Orchestrator transcript contains pasted source text or vote bodies between waves.
- Context-window pressure warnings appear in a multi-wave headless run.

**Phase to address:**
File-blackboard orchestration phase (receipt rule + ceilings in `bin/`) and the validation-fixture phase (assert receipt shape + ceiling enforcement).

---

### Pitfall 4: Parallel-spawn disk-I/O storm / silent concurrency batching  `[NEW]` (design flags "concurrency at scale unproven" but not THIS failure mode)

**What goes wrong:**
The fan-out (search wave ~5, fetch wave up to 15, verify wave up to 24 claims x 3 votes = up to 72 voter spawns) collides with Claude Code's platform behavior in two ways:
1. **Disk-I/O storm.** Each subagent is a Node process that writes its own session file and competes for disk I/O. A documented case spawned 24 parallel subagents in a 2-minute window and drove disk I/O 17.3x over baseline (8.83 -> 152.80 blocks/s), making the machine completely unresponsive and requiring a hard reboot. There is currently NO configurable `maxParallelAgents` setting (open feature request, proposed default 5).
2. **Silent batching at the ~10-concurrent cap.** Parallelism caps at ~10 concurrent operations; beyond that, spawns queue into batches transparently. The skill can *think* it fanned out 24 voters in parallel while they actually run in serial batches -- inflating wall-clock and making per-run cost/latency unpredictable and the "parallel" value-prop partly illusory.

This is a SPECIFIC, externally-documented failure mode. SESSION-DESIGN.md §13/A2 honestly flags "tested 2 workers, not ~5-15 concurrent (concurrency at scale unproven)" -- but it frames the unknown as "does it work," not "it can storm the host or silently serialize."

**Why it happens:**
The design's ceilings (MAX_FETCH=15, up to 72 voter spawns) were set for *boundedness of context and cost*, not for *host I/O safety* or the *platform concurrency cap*. A plugin cannot set `maxParallelAgents` (it doesn't exist) and cannot detect the host's I/O budget.

**How to avoid:**
- **Wave-batch explicitly in the orchestrator**: dispatch workers in batches of <=5 (the practitioner sweet spot and the proposed `maxParallelAgents` default), wait for receipts, then dispatch the next batch. Do NOT issue 72 voter spawns in one turn.
- Treat the in-flight spawn count as a first-class ceiling in `bin/` and the skill: cap concurrent in-flight workers, not just total workers.
- Because workers each write a session file AND an output file, prefer fewer, slightly-larger workers over many tiny ones where the decomposition allows (one extract-worker per source is fine at MAX_FETCH=15; one voter per (claim x seat) at full scale is the danger zone -- batch it).
- Add a build-time scale test (the design's "to confirm at build time") that runs the real ceilings, not 2 workers, and measures wall-clock + whether spawns serialized.

**Warning signs:**
- Headless run wall-clock scales linearly with worker count past ~10 (indicates batching/serialization, not parallelism).
- Host becomes unresponsive / disk light pegged during the verify wave.
- The run "succeeds" but took far longer than the ~1.2-2x single-pass cost model predicted.

**Phase to address:**
File-blackboard orchestration phase (wave-batching in the skill) + a dedicated build-time scale-concurrency spike before the verify wave is wired at full ceiling. This is the design's #1 named build-time unknown (§11.2) -- elevate it to a gated phase with the I/O-storm and batching observations as explicit acceptance criteria.

---

### Pitfall 5: Headless `--permission-mode auto` Write / non-git-Bash stall  `[MITIGATED-IN-DESIGN]` (proven at n=2; re-confirm as a packaged SKILL)

**What goes wrong:**
Under `claude -p --permission-mode auto`, the classifier denies or stalls on worker `Write` to `.lz-deep-research/` or on the non-git `node bin/lz-deep-research.mjs` call, halting the run mid-fan-out. (Project history: `acceptEdits` DENIES skill launch and blocks non-git Bash like `nx`; `auto` is the correct mode.)

**Why it happens:**
A skill's `allowed-tools` currently pre-approve only `Bash(git:*)`; Write and non-git Bash fall through to the permission mode. SESSION-DESIGN.md §2/§11.1 identifies this as the central gate, and spike A2 PROVED `auto` permits both worker `Write` and one named non-git `Bash` (`node merge.mjs`) headlessly with no stall -- corroborated by prior project UAT (auto permits `nx`).

**How to avoid (what still needs confirming):**
- Confine ALL Writes to the WORKER agent frontmatter so the MAIN session's only non-git Bash is the single named `bin/` call (§11.1 mitigation). The main skill should not itself Write raw evidence.
- Add `Write` and the exact `Bash(node ...)` invocation (e.g. `node ${CLAUDE_PLUGIN_ROOT}/bin/lz-deep-research.mjs`) to the skill's `allowed-tools` so the run does not depend solely on auto-mode classifier mood -- A2 was a direct `claude -p` prompt, NOT a packaged skill with declared `allowed-tools`. The packaged-skill path is explicitly untested (§13/A2 scope caveat).
- Pre-register the canonical headless verification command (per CLAUDE.md conventions: `--permission-mode auto`, NO `@file` mention in `-p` -- it breaks slash-command recognition; reference inputs by prose path).
- Apply Common Contract rule 5a (`<fetched source trust="untrusted">`) to every WebFetch'd page so a hostile doc cannot prompt-inject the orchestrator into changing tools or scope (existing plugin hardening -- reuse it).

**Warning signs:**
- Skill tool returns `is_error` on launch (symptom of wrong permission mode, e.g. `acceptEdits`).
- A worker `Write` or the `bin/` Bash call prompts/denies in a headless run.
- The packaged skill behaves differently from the A2 bare-prompt spike.

**Phase to address:**
Skill-packaging phase (declare `allowed-tools`) + the headless verification convention. Re-run A2's proof as the PACKAGED skill, not a bare prompt, as an acceptance gate.

---

### Pitfall 6: Cost blowup that breaks the value proposition  `[MITIGATED-IN-DESIGN]` (the cost-asymmetry framing is the live guard)

**What goes wrong:**
The skill costs 3-10x a single-pass run (the agent-teams multiplier the design explicitly avoids), so "near-Opus at Sonnet cost" becomes "more than Opus at no quality gain." Two concrete drivers: (1) flipping voters to Sonnet everywhere with a high escalation fraction, and (2) the ~20k-token per-subagent startup overhead times many workers.

**Why it happens:**
Each subagent carries ~20k tokens of startup overhead (external sources), and Opus, if mis-placed, scales with corpus size. The design pins Opus to exactly 2 read-only gates over bounded files (FLAT as corpus scales), keeps the bulk on Haiku/Sonnet, and makes `bin/` zero-token -- yielding ~1.2-2x single-pass Sonnet. §15.1 adds the decisive reframing: ALL-SONNET voters are already INSIDE the promised "Sonnet cost" envelope, so they are not a violation; Haiku-first must EARN its place by proving BOTH ~0 false-uphold AND a real cost win.

**How to avoid:**
- Keep Opus at 2 gates only; a 3rd "split-tally" gate "launders noisy votes into authority" and adds Opus cost for no rigor -- reject it (§10).
- Treat the escalation fraction as a cost gate: if escalation pulls >~40-50% of claims to Sonnet, Haiku-first is not worth the added failure surface (§15.1) -- fall back to Sonnet-default, which is already in budget.
- Minimize subagent count where the 20k overhead dominates (fewer larger workers; batch voters -- overlaps Pitfall 4).
- Report a per-run token/cost line so regressions are visible.

**Warning signs:**
- Per-run cost exceeds ~2x a single-pass Sonnet baseline.
- Haiku-first escalation fraction >40-50% (erases the savings -- the design's own kill threshold).
- A 3rd Opus gate creeps in during implementation.

**Phase to address:**
Verifier-tier / cost-model phase. The gating eval must report cost-per-report; Sonnet-default ships, Haiku-first stays flag-gated until it clears BOTH gates.

---

### Pitfall 7: Over-trusting a thin verification eval (n-size, open vs closed book, label fuzziness)  `[PARTIALLY MITIGATED]` (the discipline is documented; the full eval is not yet built)

**What goes wrong:**
A small, single-run, closed-book, blatant-claims eval is treated as settling the verifier tier, and Haiku-first is locked on n=6 evidence -- exactly the over-update the design caught itself almost making.

**Why it happens:**
Spikes are seductive: the n=6 A/B looked clean (Haiku 0 false-upholds) and the n=18 open-book pilot fired no kill triggers. But §15/§15.1/§15.2 enumerate why neither locks the tier: n too small, no variance (k too low), blatant claims under-sample SUBTLE overreach, closed-book != open-book, and **label fuzziness** (e.g. the honey/infant-botulism claim -- "supported" is contestable, so accuracy partly measures label ambiguity, not model error). The robust signal is the binary false-uphold gate (0/0), not aggregate accuracy.

**How to avoid:**
- Run the PRE-REGISTERED full eval before flipping the default: >=60-100 claims, BOTH closed- AND open-book, stratified ~40% supported / ~60% bad with ~half the bad SUBTLE, k>=5, report Pass@1 + Pass^k.
- **Pre-register the lock rule** and make **false-uphold rate the SOLE hard gate** (not aggregate accuracy) -- aggregate accuracy is polluted by label fuzziness.
- Use **vetted labels** with documented adjudication for contestable claims; treat any claim where two careful reviewers disagree as excluded or separately bucketed.
- Measure the Haiku tool-failure rate (searched vs hallucinated counter-evidence) as a secondary gate -- the open-book false-uphold number can FLIP from the closed-book result and can VETO Haiku-first.

**Warning signs:**
- A tier decision cites n<60 or a single run.
- Aggregate accuracy quoted as the pass criterion instead of false-uphold rate.
- The eval is closed-book only (cannot detect the open-book pollution flip of Pitfall 2).
- No Pass^k / variance reported.

**Phase to address:**
A dedicated verifier-tier gating-eval phase, downstream of the verification phase. ALL-SONNET ships in the interim; the flag flips only on a clean pre-registered eval.

---

### Pitfall 8: Over-claiming cross-source corroboration via lexical dedup  `[PARTIALLY MITIGATED]` (number-word fix landed; semantic paraphrase residual is OPEN)

**What goes wrong:**
The `bin/` dedup uses URL-canonical + normalized-text shingle/Jaccard to merge near-duplicates and increment a corroboration counter. Two failure directions:
1. **Under-merge -> over-claim corroboration:** "30%" and "thirty percent" (or any semantic paraphrase) don't merge, so two restatements of ONE source are counted as TWO independent corroborations, inflating confidence.
2. **Over-merge -> hidden dissent:** aggressive shingle merging collapses two genuinely-different claims into one, hiding a real disagreement.

**Why it happens:**
Lexical similarity is not semantic equivalence. Spike A1 reproduced the under-merge ("30%" vs "thirty percent" did not merge at Jaccard ~0.57) and PARTIALLY mitigated it with number-word normalization. §13/A1 is explicit: "semantic paraphrase beyond number/format variance still under-merges -- do not over-claim cross-source corroboration; treat lexical dedup as good for near-duplicates, moderate for paraphrase, not solved."

**How to avoid:**
- Keep the number-word normalization step (landed in A1) and extend it to obvious format variance (units, date formats).
- Treat the corroboration count as a LOWER bound, never an exact independence count; in the report, phrase confidence in terms of "at least N near-duplicate sources" and pair corroboration with **source-independence** weighting (overlaps Pitfall 2) so syndicated copies don't inflate it.
- Bias dedup toward UNDER-merging (keep separate) rather than over-merging, so dissent is preserved and surfaced (the design already biases toward Contested / surfacing dissent).
- Do NOT introduce an embedding/semantic-dedup dependency -- it violates the zero-dep constraint. Document the lexical limit instead of solving it with a new dependency.

**Warning signs:**
- A report cites "corroborated by N sources" where the sources are paraphrases of one origin.
- Confidence HIGH from corroboration count alone, with no independence check.
- A known disagreement in the eval fixture is silently merged away.

**Phase to address:**
Deterministic `bin/` aggregation phase. The validation fixture must include a paraphrase pair (assert it is NOT over-claimed as 2 independent sources) and a near-duplicate pair (assert it merges).

---

### Pitfall 9: Citation / quote fidelity -- right source, wrong passage (and the inverse)  `[PARTIALLY MITIGATED]` (quote-vs-excerpt re-check is the anchor; the entailment gap is OPEN)

**What goes wrong:**
The report cites a verbatim quote that does appear in the stored excerpt, but the quote does NOT actually support the claim (wrong passage / out-of-context), OR the extract worker stored an excerpt that itself doesn't represent the source faithfully. Quote-presence != claim-support.

**Why it happens:**
The design's strongest anti-hallucination guard is the deterministic quote-vs-stored-excerpt re-check (A1 PROVED a fabricated quote absent from its excerpt is dropped). But the literature is explicit that deterministic quoting "may still quote the wrong part of the source material" -- it guarantees the quote is REAL, not that it's RELEVANT. The entailment question (does the quote support the claim?) is a separate, model-judged step the design delegates to the voters, not to `bin/`. The design honestly reframes the trust mechanism from un-verifiable *provenance* to verifiable *consistency* (§8) -- consistency is necessary but not sufficient for support.

**How to avoid:**
- Keep the quote-vs-excerpt re-check UPSTREAM of voting (it removes the content-absent class at zero model risk -- Pitfall 1's de-risking lever).
- Make the EXCERPT, not just the quote, the unit the extract worker stores -- and store enough surrounding context that the voter can judge whether the quote is on-point, not cherry-picked.
- Treat the voter's verdict as the entailment check (the model judges support); the `bin/` re-check only guards verbatim fidelity. Be explicit in the report that "quote verified verbatim" and "claim supported" are two different assurances.
- Cite ONLY claims whose quotes mechanically re-check (already in §8) AND that survived the tally.

**Warning signs:**
- A cited quote is real but the claim paraphrases it beyond what it says (scope/magnitude creep).
- The stored excerpt is a single sentence with no surrounding context (cherry-pick risk).
- The report conflates "quote present in source" with "claim is true."

**Phase to address:**
Deterministic `bin/` aggregation phase (verbatim re-check) + adversarial verification phase (entailment via voters) + synthesis/report phase (label the two assurances distinctly). Fixture: plant a real-quote / wrong-passage claim and assert it is downgraded, not upheld.

---

## Moderate Pitfalls

### Pitfall 10: Shared appendable JSONL ledger race on Windows / Git Bash  `[MITIGATED-IN-DESIGN]`

**What goes wrong:** Many parallel workers append to one shared JSONL ledger -> partial writes, duplicate ids, line collisions on Windows arm64 / Git Bash (no atomic cross-process append guarantee).
**How to avoid:** The GPT-5.5 red-team correction (§7) already rejects this: use **immutable per-worker files** (`<wave>/<worker-id>.json`, written once) + an explicit deterministic merge step in `bin/`. No parallel append to shared files. KEEP this design; do not "optimize" back to a shared ledger. Verify on the real host that per-worker files never collide on path (unique worker ids).
**Phase to address:** File-blackboard orchestration phase. Fixture: spawn the real worker count, assert N distinct files, no path collisions.

### Pitfall 11: Refuted-as-deletion -- losing important claims to a 2/3 model vote  `[MITIGATED-IN-DESIGN]`

**What goes wrong:** Two of three voters refute an important claim and it is silently deleted from the report, when the "refutation" was a model error, not an explicit contradiction.
**How to avoid:** §8 already mandates: "Treat 'refuted' as a confidence DOWNGRADE unless the contradiction is EXPLICIT -- do not let 2/3 model votes silently delete an important claim." Contested is a first-class, surfaced outcome. Verify the tally rubric implements downgrade-not-delete and the report has a "contested/unverified" section.
**Phase to address:** Verification + synthesis phases. Fixture: a true-but-model-refuted claim must appear as Contested, not vanish.

### Pitfall 12: Scope guard skipped in headless mode -> answering the wrong question  `[MITIGATED-IN-DESIGN]`

**What goes wrong:** An underspecified question can't be clarified headlessly (`-p` can't ask), so the run answers a mis-framed question with full machinery.
**How to avoid:** §5 Phase 0 already handles it: interactive asks 2-3 clarifying questions; headless proceeds with stated assumptions surfaced as Assuming-frames (reuses the plugin's existing Assuming-X framing). Verify the headless path emits explicit Assuming-frames in the report header.
**Phase to address:** Skill phase-structure phase. Fixture: a vague headless prompt must surface Assuming-frames in the output.

### Pitfall 13: `bin/` script as the plugin's first off-model component -- zero-dep + cross-platform drift  `[NEW]`

**What goes wrong:** `bin/lz-deep-research.mjs` is the plugin's FIRST `bin/` component. Risks: it pulls an npm dependency (violates the zero-dep constraint), uses a path/shell idiom that breaks on Windows arm64 / Git Bash, or assumes a Node version the user lacks.
**Why it happens:** Node ESM scripts easily reach for a helper lib (a fuzzy-match or glob package). The project host is Windows arm64 / Git Bash / FNM-managed Node -- CRLF, path separators, and `node` resolution differ from CI defaults; the project has prior CRLF-normalization lessons in its test fixtures.
**How to avoid:** Pure Node stdlib only (no `package.json` deps); read/write with explicit UTF-8 and LF normalization; address files with `path.join` and `${CLAUDE_PLUGIN_ROOT}`; no reliance on shell globbing (enumerate via `fs.readdirSync`). Test on the actual host. Aligns with the existing plugin convention (no hardcoded paths, `${CLAUDE_PLUGIN_ROOT}`).
**Phase to address:** Deterministic `bin/` aggregation phase. Acceptance gate: `bin/` runs with zero installed deps on Windows arm64 / Git Bash.

### Pitfall 14: Cross-skill body references / progressive-disclosure violation  `[NEW]` (project-specific convention)

**What goes wrong:** `lz-deep-research/SKILL.md` references another skill's named sections, or duplicates shared knowledge inline instead of in `references/`.
**Why it happens:** It's tempting to point at `lz-execute`'s contract or inline the schema. The project has an explicit convention against this (memory: `feedback_no_cross_skill_body_references`).
**How to avoid:** Put shared knowledge (JSON schemas, tally rubric, quote-recheck contract) in `references/lz-deep-research-schema.md` (already in the design's component list). One skill must not reference another's named sections. Reuse the existing `advisor` agent without re-describing its contract inline.
**Phase to address:** Skill-packaging phase. Closing `git grep` gate: no cross-skill section references.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Shared appendable JSONL ledger instead of per-worker files | Simpler merge code | Windows/Git-Bash write races, dup ids, "the workflow engine we said we don't have" | Never (design already rejects it, §7) |
| Lock Haiku-first on the n=6 / n=18 pilots | Lower per-run cost now | False confidence in cited reports (credibility failure worse than cost) | Never before the pre-registered eval; ALL-SONNET is already in budget |
| Skip the audit-sample escalation of unanimous upholds | Cheaper verify wave | Silent false-upholds ship at HIGH confidence | Never (it's the only interim guard for the structural hole) |
| Spawn all voters in one turn (no wave-batching) | Less orchestration code | I/O storm / host lockup / silent serialization past the 10-cap | Never at full ceiling; fine at <=5 workers |
| Embedding/semantic dedup to fix paraphrase under-merge | Better corroboration counting | Violates zero-dep constraint | Never; document the lexical limit instead |
| 3rd Opus "split-tally" gate | Feels more rigorous | Opus cost for no rigor; "launders noisy votes into authority" | Never (§10) |
| Inline the schema in SKILL.md instead of `references/` | One fewer file | Progressive-disclosure violation; drift | Never (project convention) |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Claude Code subagent fan-out | Assume parallel == unlimited; spawn 20-70 at once | ~10-concurrent cap with silent batching; no `maxParallelAgents` exists; wave-batch at <=5, wait for receipts |
| `--permission-mode auto` (headless) | Use `acceptEdits` (denies skill launch + non-git Bash) | Use `auto`; confine Writes to worker frontmatter; declare `Write` + `Bash(node ...)` in skill `allowed-tools` |
| WebFetch'd documents | Trust fetched content as instructions | Wrap in `<fetched source trust="untrusted">` (Common Contract 5a); prompt-injection guard |
| WebSearch in voters | Search the claim's own terms -> reference pollution | Mandate a disconfirming search; weight by source independence, not count |
| `bin/` Node script | npm deps / CRLF / shell globbing | Pure stdlib; explicit UTF-8 + LF; `fs.readdirSync`; `${CLAUDE_PLUGIN_ROOT}` |
| Headless `-p` prompt | `@file` mention breaks slash-command recognition | Reference plan/inputs by PROSE PATH; skill Reads them during orient |
| Reusing the `advisor` agent | Re-describe its contract / add a 3rd gate | Reuse read-only `[Read,Glob]` advisor at exactly 2 gates |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Un-batched parallel spawn | Host unresponsive, disk pegged, hard reboot | Wave-batch <=5 in-flight | ~24 concurrent subagents (documented 17.3x I/O) |
| Silent serialization past the cap | Wall-clock linear in worker count; "parallel" run slow | Expect ~10 cap; batch accordingly | >10 concurrent operations |
| Unbounded fetch/verify waves | Cost + context grow with corpus | Enforce ceilings in `bin/`, not just docs | Corpus large; ceilings only documented |
| ~20k-token per-subagent overhead | Cost > 2x single-pass | Fewer larger workers; batch voters | Many tiny workers |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Treating WebFetch'd pages as trusted text | Prompt injection from a hostile doc changes orchestrator scope/tools | `<fetched source trust="untrusted">` wrapper (Common Contract 5a, existing hardening) |
| Citing a real quote that doesn't support the claim | Authoritative-looking but unsupported claim in a "fact-checked" report | Verbatim re-check (consistency) + voter entailment (support) labeled distinctly |
| Reference-pollution corroboration | A false claim cited with multiple "supporting" echo pages | Disconfirming search + source-independence weighting |
| No audit-sample of unanimous upholds | Silent false-upholds at HIGH confidence | ~15-20% random audit-sample escalation (structurally required) |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Confidence shown as a single number with no provenance | User can't tell corroboration from independent verification | Per-claim confidence + how-derived (votes, corroboration lower-bound, contested flag) |
| No "contested / unverified" section | User assumes everything in the report is verified | First-class contested section (already in §8); surface dissent, don't hide it |
| Silent Assuming-frames in headless mode | User gets a confident answer to a question they didn't ask | Surface assumptions in the report header (Pitfall 12) |

## "Looks Done But Isn't" Checklist

- [ ] **Receipt rule:** Workers actually return one-line receipts under a char cap -- verify NO worker leaks prose/evidence into the main context.
- [ ] **Ceilings enforced in `bin/`:** `ANGLES/MAX_FETCH/MAX_VERIFY_CLAIMS/VOTES_PER_CLAIM/SYNTH_CAP` are code-enforced, not just documented.
- [ ] **Wave-batching:** Spawns are batched <=5 in-flight, not all-at-once -- verify on a full-ceiling run, not n=2.
- [ ] **Escalation triggers:** Contested + load-bearing + ~15-20% audit-sample of unanimous upholds are ALL implemented, not just the contested split.
- [ ] **Quote re-check:** Fabricated-quote claim is dropped AND real-quote/wrong-passage claim is downgraded.
- [ ] **Open-book pollution:** Voter runs a disconfirming search; a polluted false claim is not upheld.
- [ ] **Packaged-skill headless:** A2's permission proof re-confirmed as the packaged `/lz-advisor:lz-deep-research` skill with declared `allowed-tools`, not a bare `-p` prompt.
- [ ] **Zero-dep `bin/`:** Runs with no installed deps on Windows arm64 / Git Bash; CRLF-safe.
- [ ] **Sonnet-default active:** Haiku-first is flag-gated OFF until the pre-registered eval clears on false-uphold rate.
- [ ] **Contested section:** Report has a first-class "contested/unverified" section; refuted-but-important claims are downgraded, not deleted.
- [ ] **Assuming-frames:** Headless run with a vague prompt surfaces explicit assumptions.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Silent false-uphold shipped | HIGH (credibility) | Add/raise audit-sample %, mark affected reports unverified, re-run with load-bearing escalation; treat as the design's named worst case |
| I/O storm / host lockup | MEDIUM | Wave-batch <=5; re-run; checkpointed rerun from immutable wave inputs (§10 resumability) |
| Permission stall mid-run | LOW-MEDIUM | Switch to `--permission-mode auto`; declare `allowed-tools`; checkpointed rerun of the failed wave |
| Over-claimed corroboration | LOW | Re-tally with source-independence weighting; restate confidence as lower-bound; report is regenerable from on-disk evidence |
| Locked Haiku-first too early | MEDIUM | Flip default back to ALL-SONNET (in budget); re-open the gating eval |
| `bin/` dep / CRLF breakage | LOW | Strip the dep; normalize LF; re-test on host; deterministic + regenerable |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase (by topic) | Verification |
|---------|------------------------------|--------------|
| 1. Silent false-uphold | Adversarial verification | Fixture: load-bearing planted-false claim escalates; unanimous-uphold run shows audit-sample escalation |
| 2. Reference pollution (open-book) | Adversarial verification + gating eval | Fixture: polluted false claim + disconfirming-search mandate; open-book false-uphold rate gate |
| 3. Main-context exhaustion | File-blackboard orchestration + fixture | Receipt is one line under char cap; no raw data in orchestrator transcript |
| 4. Disk-I/O storm / batching | File-blackboard + dedicated scale-concurrency spike | Full-ceiling run: host stable, wall-clock not linear-serial; spawns batched <=5 |
| 5. Headless permission stall | Skill packaging + verification convention | Packaged-skill A2 re-proof under `--permission-mode auto` |
| 6. Cost blowup | Verifier-tier / cost-model | Per-run cost <=~2x single-pass; escalation fraction <40-50% |
| 7. Thin-eval over-trust | Verifier-tier gating-eval | Pre-registered: >=60-100 claims, closed+open book, k>=5, false-uphold SOLE gate, Pass^k |
| 8. Lexical-dedup over-claim | Deterministic `bin/` aggregation | Fixture: paraphrase pair NOT counted as 2 independent; near-dup pair merges |
| 9. Quote/passage fidelity | `bin/` re-check + verification + synthesis | Fixture: fabricated-quote dropped; real-quote/wrong-passage downgraded |
| 10. Shared-ledger race | File-blackboard orchestration | Full-count run: N distinct per-worker files, no path collision |
| 11. Refuted-as-deletion | Verification + synthesis | Fixture: true-but-refuted claim appears Contested, not deleted |
| 12. Scope guard skipped | Skill phase-structure | Vague headless prompt surfaces Assuming-frames |
| 13. `bin/` zero-dep / CRLF | Deterministic `bin/` aggregation | Runs zero-dep on Windows arm64 / Git Bash; CRLF-safe |
| 14. Cross-skill references | Skill packaging | Closing `git grep` gate: no cross-skill section references |

## Sources

- `.planning/research/SESSION-DESIGN.md` (this milestone's converged design; 4 empirical spikes A1/A2/verifier-A-B/open-book pilot; 4-family advisor consult) -- primary, HIGH confidence for design-validated pitfalls.
- `.planning/PROJECT.md` (constraints: zero-dep, headless `claude -p` verification, advisor reuse; phase numbering; existing Common Contract rules 5/5a/6, D-11 allowed-tools ladder) -- HIGH.
- Global + project CLAUDE.md / MEMORY.md (Windows arm64 / Git Bash; headless `-p` gotchas -- `@file` breaks slash commands, `--permission-mode auto` vs `acceptEdits`; `feedback_no_cross_skill_body_references`; worktree/CRLF lessons) -- HIGH.
- [FEATURE: Add `maxParallelAgents` Configuration Setting -- anthropics/claude-code#15487](https://github.com/anthropics/claude-code/issues/15487) -- 24 parallel subagents, 17.3x disk-I/O (8.83 -> 152.80 blocks/s), host lockout; no configurable limit exists (proposed default 5) -- MEDIUM-HIGH (single documented case + open issue).
- [Claude Code Sub-Agents Explained: Context, Cost, and Parallel Execution -- MindStudio](https://www.mindstudio.ai/blog/claude-code-sub-agents-explained) -- ~10 concurrent cap with batch queueing; ~20k token per-subagent overhead; 3-5 practical sweet spot -- MEDIUM.
- [Claude Code subagents: parallel without rate limits -- DEV Community](https://dev.to/subprime2010/claude-code-subagents-how-to-run-parallel-tasks-without-hitting-rate-limits-4bpl) -- cap concurrency, exponential backoff guidance -- MEDIUM.
- [Configure permissions -- Claude Agent SDK Docs](https://platform.claude.com/docs/en/agent-sdk/permissions) -- allow/deny/ask/auto semantics; unlisted tools fall through to permission mode -- MEDIUM-HIGH.
- [Create custom subagents -- Claude Code Docs](https://code.claude.com/docs/en/sub-agents) -- subagent permission inheritance; depth-5 background spawn cap -- MEDIUM-HIGH.
- [Detecting and Correcting Reference Hallucinations in Commercial LLMs and Deep Research Agents -- arXiv 2604.03173](https://arxiv.org/html/2604.03173v1) -- citation hallucination mechanisms -- MEDIUM.
- [Deterministic Quoting: Making LLMs Safer for Healthcare -- Matt Yeung](https://mattyyeung.github.io/deterministic-quoting) -- verbatim-by-construction; "may still quote the wrong part of the source material" (quote-present != claim-support) -- MEDIUM, validates the design's quote-vs-excerpt anchor AND its limit.
- [CiteAudit: A Benchmark for Verifying Scientific References -- arXiv 2602.23452](https://arxiv.org/pdf/2602.23452) -- multi-role claim-extract/retrieve/match/reason/judge verification pipeline; reference-pollution failure (web echo of ghost refs) -- MEDIUM, validates Pitfall 2.

---
*Pitfalls research for: parallel-fan-out adversarially-verified deep-research skill in a zero-dep, headless-verifiable Claude Code plugin*
*Researched: 2026-06-15*
