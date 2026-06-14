# Design: `lz-research` — a deep-research capability for the lz-advisor plugin

**Status:** Design converged (3 lineages) + core feasibility PROVEN by spike (§13: A1 deterministic core PASS, A2 headless fan-out/permission PASS). Remaining gates are build-time (verifier-tier A/B, scale concurrency, skill packaging). Draft 2, 2026-06-14.
**Branch:** `feat/deep-research`.
**Scope axis:** `scope: api-correctness` (architecture/feasibility). Not a security or perf verdict.

> **[CORRECTION 2026-06-15 -- script placement]** Where this document places the deterministic off-model aggregator in `bin/`, that is SUPERSEDED. Re-verified against the live plugins-reference + plugin-dev `plugin-structure`/`skill-development` + skill-creator: `bin/` is a real official component, but it is for USER-FACING executables injected onto the Bash PATH (invokable as bare commands). The aggregator is a SKILL-INTERNAL helper, so it belongs in the skill's own bundled `scripts/` dir -- `skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` -- invoked via `node "${CLAUDE_PLUGIN_ROOT}/skills/lz-deep-research/scripts/..."` (NOT a bare command; no PATH/exec-bit/shebang dependency, Windows-arm64 / Git-Bash safe). Read every `bin/` reference below as `skills/lz-deep-research/scripts/`. SUMMARY.md + REQUIREMENTS.md + ROADMAP.md use the corrected location.

---

## 1. Summary (the decision)

Add a `lz-research` **skill** to the lz-advisor plugin that produces deep, multi-source, fact-checked, **cited** research reports whose key claims are adversarially verified. The Sonnet session model orchestrates; **worker subagents write evidence to disk and return only receipts**; a deterministic **`bin/` Node script** does all dedup/ranking/vote-tally **off-model**; the Opus **advisor** is consulted read-only at exactly **two** high-leverage gates (scope/ranking, and final synthesis/calibration). This is the advisor strategy applied to research: cheap tiers do the volume, frontier reasoning lands only where judgment is non-mechanizable.

This design is **triangulated across three independent model lineages** (see Section 12): six blind Opus architects, GPT-5.5 (OpenAI), and Gemini 3.1 Pro (Google) all independently converged on the same spine, and an out-of-family GPT-5.5 red-team supplied three corrections now folded in.

## 2. Why a skill (not a workflow, not agent teams)

Verified facts (Claude Code v2.1.177, 2026-06-14, against live docs + a local empirical test):

- **A plugin cannot ship a dynamic Workflow.** Component surface is `skills/ commands/ agents/ hooks/ .mcp.json .lsp.json output-styles/ themes/ monitors/ bin/` — no `workflows/`. Dynamic workflows live only in user/project `.claude/workflows/`. So the capability must be a **skill + agents (+ `bin/` scripts)**.
- **The session model can't even auto-orchestrate a workflow:** `ultracode`/`xhigh` is gated to Fable 5 / Opus 4.8 / Opus 4.7; Sonnet 4.6 caps at `high`. A plugin running on a user's Sonnet session must be self-contained skill orchestration.
- **Agent teams are rejected:** experimental, require a user-set `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` flag a plugin cannot set/detect; ~7x token cost (docs: ~7x in plan mode); headless-incompatible (tmux/iTerm2), which breaks the `claude -p` verification convention.
- **Subagents can nest** (v2.1.172, empirically confirmed: a subagent spawned a nested subagent; foreground any depth, background depth-5 cap). Nesting is used here only as an optional **scale refinement** (a "phase-runner" subagent), not the spine. (The `Task` tool == `Agent` tool since v2.1.63.)
- **Skills** run in the main session, trigger by description, can spawn subagents and call `Bash`/`WebSearch`/`WebFetch`. A skill's `allowed-tools` currently pre-approve only `Bash(git:*)`; non-git Bash and Write are permission-gated under `--permission-mode auto`.

## 3. The spine

```
Main session (Sonnet) = thin dispatcher
  holds ONLY: a small manifest (paths/ids/counts), bounded summaries, 2 advisor notes
  NEVER holds: raw source text, raw votes
        |
        |-- spawns --> worker subagents (Haiku/Sonnet) that WRITE files + return a 1-line receipt
        |-- runs   --> bin/ Node script (off-model) for dedup / rank / tally / merge
        '-- consults --> Opus advisor (read-only [Read,Glob]) at 2 gates only

State on disk: .lz-research/<run-id>/   (immutable per-worker files; see Section 7)
```

Bounded main context is achieved by the **receipt rule** (workers return paths + scalar counts, never prose/evidence) plus **off-model reduction** (the script reads many files and returns a tiny summary). Main-context growth is ~O(workers x receipt) + bounded summaries — independent of corpus size.

## 4. Components

| Component | Kind | Model | Tools | Role |
|---|---|---|---|---|
| `skills/lz-research/SKILL.md` | skill | session (Sonnet) | `Agent`, `WebSearch`, `WebFetch`, `Read`, `Glob`, `Write`(scoped), `Bash`(git + one named `bin/` call) | Orchestrator: decompose, dispatch waves, run `bin/`, consult advisor, assemble report |
| `agents/advisor.md` | agent | opus | `Read`, `Glob` | **Reuse existing.** Gate 1 (scope/ranking), Gate 2 (synthesis/calibration). Read-only judge; never fetches/writes |
| `agents/research-search-worker.md` | agent | haiku | `WebSearch`, `Write` | Per-angle search dispatch; writes candidate sources; returns receipt |
| `agents/research-extract-worker.md` | agent | sonnet | `WebFetch`, `Write` | Per-source fetch + extract falsifiable claims (claim + verbatim quote + stored excerpt + source meta); returns receipt |
| `agents/research-verify-voter.md` | agent | **sonnet** (see §10) | `WebSearch`, `WebFetch`, `Write` | One isolated skeptic vote per (claim x seat); writes vote (verdict + cited counter-evidence); returns receipt |
| `bin/lz-research.mjs` | script | none (deterministic Node ESM) | filesystem | Off-model: merge per-worker files, dedup, rank/cap, tally votes, re-check quotes vs stored excerpts, emit bounded summaries |
| `references/lz-research-schema.md` | reference | none | — | JSON schemas (source/claim/vote/excerpt), the tally rubric, the quote-recheck contract |

Roster change vs today: **reuse `advisor`; add 3 executor-tier workers + 1 `bin/` script + 1 reference.** No new Opus specialist (honors the "too many specialists" warning).

## 5. Phases

0. **Scope guard** — if the question is underspecified, ask 2-3 clarifying questions (interactive only; in headless `-p`, proceed with stated assumptions surfaced as Assuming-frames). Create `.lz-research/<run-id>/`.
1. **Decompose + Gate 1 (Opus)** — Sonnet drafts ~5 angles; advisor reviews framing/angles and (later) the ranked claim cut-line. Read-only, bounded input.
2. **Search (Haiku wave)** — ~5 `research-search-worker` subagents, one per angle; each writes candidate sources to disk, returns a count.
3. **Fetch + Extract (Sonnet wave)** — `research-extract-worker` per source (~15); each WebFetches, **stores the relevant fetched excerpt immutably**, extracts falsifiable claims (claim + verbatim quote + excerpt id + source meta), writes a per-worker file, returns a count.
4. **Dedup + Rank (off-model)** — `bin/lz-research.mjs` merges per-worker files, dedups (URL-canonical + normalized-text shingle/Jaccard, incrementing corroboration), ranks (corroboration x source-quality x falsifiability x centrality), caps to top ~24. Returns a compact summary.
5. **Gate 1b (Opus, optional re-order)** — advisor may re-order/trim the top-24 slice (may NOT expand the corpus).
6. **Verify (Sonnet wave, isolated)** — for each top claim, 3 **isolated** skeptic voters (no sibling sight), each diversified by attack mode (factual contradiction / scope-causality overclaim / source-provenance). Each writes a vote + cited counter-evidence, returns a receipt.
7. **Tally + quote re-check (off-model)** — `bin/lz-research.mjs`: tally per claim (rubric in §8), **mechanically re-check each surviving claim's quote against its stored excerpt** (drop/flag claims whose quote does not match stored text), emit `survivors.json` (bounded, top ~20, verbatim evidence only).
8. **Synthesize + Gate 2 (Opus)** — advisor reads only `survivors.json`; Sonnet writes the cited report (per-claim confidence, citations, a "contested/unverified" section). Report is a deliverable, not intermediate state.

## 6. Context-boundedness

- Worker returns are one-line receipts (`<ack path=... n=N/>`); raw pages/claims/votes never enter the main context.
- Verbose work lives in each worker's isolated context (discarded on return) and on disk.
- Between waves the orchestrator does ZERO in-context reasoning over raw data — it shells the `bin/` script which returns only tallies.
- Opus reads only bounded files (scope inputs; top-24 slice; `survivors.json`).
- Named ceilings: `ANGLES~5`, `MAX_FETCH=15`, `MAX_VERIFY_CLAIMS~24`, `VOTES_PER_CLAIM=3`, `SYNTH_CAP~20`.

## 7. Aggregation = deterministic, off-model, immutable files (CORRECTED)

All dedup/ranking/tally/quote-recheck run in `bin/lz-research.mjs` (pure functions, reproducible, auditable, zero model tokens). **Correction from the GPT-5.5 red-team:** do **not** use a shared appendable JSONL ledger written by many parallel subagents — that is a Windows/Git-Bash race-condition magnet (partial writes, dup ids, collisions) and is effectively "the workflow engine we said we don't have." Instead:

- **Immutable per-worker output files** (one file per worker, addressed by `<wave>/<worker-id>.json`), written once.
- An explicit **deterministic merge step** in the script reads all per-worker files and produces the merged/deduped/ranked/tallied artifacts. No parallel append to shared files.

## 8. Verification = evidence-artifact-centric (CORRECTED — the key change)

**Correction from the GPT-5.5 red-team (highest-impact):** "self-anchor rejection enforced in code" is **overclaimed** — a script can verify a vote *cites* a tool/source, but not that a tool was actually *called* with that result. So the trust mechanism is reframed from un-verifiable *provenance* to verifiable *consistency*:

- Extract workers **store the fetched excerpt** they quote from (immutable, on disk, addressed by id).
- Each claim/quote carries its `excerpt_id`.
- `bin/lz-research.mjs` **mechanically re-checks** that each surviving claim's verbatim quote actually appears in its stored excerpt; quotes that don't match are dropped/flagged (catches fabricated or drifted quotes deterministically).
- The final report **cites only claims whose quotes mechanically re-check** against stored excerpts.

Tally rubric (per claim, 3 isolated votes): `3/3 unrefuted -> High`, `2/3 -> Medium`, `<=1/3 or any explicit refutation -> Low/Contested`, `all insufficient -> Unsupported`. **Treat "refuted" as a confidence downgrade unless the contradiction is explicit** — do not let 2/3 model votes silently delete an important claim (GPT correction). Contested is a first-class outcome.

Honest limit (all three lineages flagged): 3 same-family votes are a signal, not a proof; they can share blind spots. The design biases toward under-claiming (Contested) and surfaces dissent rather than hiding it. The real anti-hallucination guard is the **quote-vs-excerpt re-check**, not the vote count.

## 9. Cost model

Opus runs at exactly 2 short read-only gates over bounded files. The bulk is Haiku (search) + Sonnet (extract, votes). The `bin/` script is zero model tokens. Token multiplier ~1.2-2x a single-pass Sonnet run (genuine parallel work, not orchestration tax) — and it avoids the 3-10x/~7x agent-teams multiplier. Opus spend is **flat** as the corpus scales (still 2 fixed-size calls), so cost scales with worker volume (cheap tiers), not with the expensive tier.

## 10. Decided forks (out-of-family adjudication)

| Fork | Decision | Source |
|---|---|---|
| Verifier model tier | **Haiku-first + Sonnet escalation on contested claims** (revised by A/B evidence, §13 — overrides the GPT prior). A/B REFUTED "Haiku creates false confidence": Haiku had **0 false-upholds** and caught all 4 overreach/absent claims 3/3; its only error was OVER-refuting 1 true claim (the safe direction). So Haiku is trust-safe; its cost is recall. Run the cheap Haiku pass, escalate ONLY Haiku-contested claims to Sonnet to recover recall at low cost. | A/B evidence > GPT-5.5 prior |
| Vote independence | **3 isolated** voters, diversified by attack mode | GPT-5.5 + Gemini (anti "herd mentality") |
| Opus gates | **2** (scope/ranking + synthesis); a 3rd split-tally gate "launders noisy votes into authority" | GPT-5.5 |
| Resumability v1 | **Checkpointed reruns** from immutable wave inputs (rerun a failed wave), NOT a manifest-cursor state machine | GPT-5.5 + simplicity lens |

## 11. Empirical unknowns — to be resolved by the feasibility spike

These are *behavioral*, not deliberative; a build spike settles them. **(This section is updated after the spike — Section 13.)**

1. **Headless fan-out + permission path:** under `claude -p --permission-mode auto`, does the classifier reliably permit (a) worker `Write` to `.lz-research/` and (b) one named non-git `Bash` invocation of `node bin/lz-research.mjs` without stalling/denying mid-run? Mitigation: confine all Writes to worker-agent frontmatter so the main session's only non-git Bash is the single named `bin/` call.
2. **Does a skill actually fan out parallel subagents headlessly,** and what is the realistic concurrency?
3. **Quote-re-check mechanism:** does a deterministic `bin/` re-check of quote-vs-stored-excerpt work on representative data?
4. **Immutable-files + merge concurrency** on Windows arm64 / Git Bash (no shared append).
5. **Haiku vs Sonnet refutation quality** (the cost driver) — a measured A/B before fixing the voter tier.

## 12. Validation provenance

- **Run 1** (custom deep-research workflow): independently produced the file-mediated design.
- **Blind 6-architect Opus panel** (cost/rigor/simplicity/scale/latency/contrarian lenses): 6/6 converged on filesystem-as-spine + deterministic scripts.
- **Cross-lineage blind** (`copilot -p`): GPT-5.5 (OpenAI) and Gemini 3.1 Pro (Google) independently produced the same spine — confirms it is not an Opus artifact.
- **GPT-5.5 red-team** (out-of-family): supplied the three corrections in §7, §8, §10 (immutable files; evidence-artifact-centric verification; checkpointed reruns; Sonnet voters).
- Honest caveat: a *seeded* Opus panel once flipped to "nested-coordinators default" — an anchoring artifact; every unseeded/out-of-family analysis lands on files-as-spine with nesting only as a scale refinement.

## 13. Spike findings

### A1 — deterministic core (local, `plans/_spike/aggregate-spike.mjs`): PASS
- **Quote-vs-stored-excerpt re-check works** — a claim whose verbatim quote is absent from its stored excerpt is deterministically dropped (proved by planting a fabricated "X cures Z" claim whose quote isn't in its excerpt). This validates the GPT-corrected verification anchor (§8): the trust mechanism is verifiable *consistency*, computed off-model.
- **Immutable per-worker files + explicit merge + dedup + corroboration + off-model vote tally → bounded `survivors.json`** works as specified (§7).
- **Paraphrase-dedup limitation reproduced + partially mitigated:** "30%" vs "thirty percent" did NOT merge under plain token-Jaccard (~0.57); a small number-word normalization step merges this and similar number/format variance. **Residual (known caveat across all lineages):** semantic paraphrase beyond number/format variance still under-merges — do not over-claim cross-source corroboration; treat lexical dedup as "good for near-duplicates, moderate for paraphrase," not solved.

### Verifier-tier A/B (`plans/lz-research-verifier-tier-ab.wf.js`): Haiku trust-safe; Sonnet higher recall
- Fixture: 6 ground-truth claims (2 supported, 4 overreach/absent), 3 isolated votes/claim/tier, deterministic scoring vs truth.
- **Haiku: 0 false-upholds** — caught all 4 bad claims unanimously (scope mice→humans, correlation→causation, magnitude inflation, absent-from-source). One error: OVER-refuted a genuinely-supported RCT claim (2/3 UNSUPPORTED). Binary 5/6.
- **Sonnet: 6/6**, no false-upholds, no over-refutes.
- **Verdict:** the GPT-5.5 "Haiku rubber-stamps overclaims → false confidence" hypothesis is NOT supported; Haiku errs toward OVER-skepticism (safe for a verification gate — demotes a true claim to Contested rather than passing a false one). **Design change: Haiku-first voting + Sonnet escalation on Haiku-contested claims** — exploits the measured error structure (Haiku over-flags, never under-flags), giving near-Sonnet recall at near-Haiku cost; strictly better than all-Sonnet (GPT prior) or all-Haiku (cost-min).
- **Caveats:** n=6, single run, one fixture — directional, not a calibrated benchmark (a real eval needs a larger labeled set + Pass@k/variance). Closed-book (claim vs provided excerpt), not the production open-book WebSearch voter — bounds reasoning quality, not full production behavior.

### A2 — headless fan-out + permission path (`claude -p --permission-mode auto`): PASS
- Under `claude -p --permission-mode auto` with `--model sonnet`, the session **fanned out 2 parallel subagents**, each **`Write`-ing a JSON file** to a scratch dir, then the orchestrator **ran a non-git `node` Bash command** — all headless, no stall/deny. Verified un-fakeably: both files exist on disk with correct values; an independent re-run of the merge script returns `sum=42`. Artifacts: `plans/_spike/{merge.mjs,a2/}`.
- Resolves the central gate (§11.1, §11.2): worker `Write` + one named non-git `Bash` invocation are permitted by the auto-mode classifier, and skill-style parallel fan-out works headless. Corroborated by prior project UAT (auto mode permits non-git Bash like `nx`).
- **Scope of the proof (still to confirm at build time):** tested 2 workers, not ~5-15 concurrent (concurrency at scale unproven); tested a direct `claude -p` prompt, not yet a packaged `/lz-advisor:lz-research` SKILL with declared `allowed-tools` (the skill likely needs `Write` + `Bash(node:*)` in `allowed-tools`, or to rely on auto mode); the Haiku-vs-Sonnet verifier A/B (§11.5) is untested and remains the cost-driving fork.

## 14. Open / next

- Resolve §11 via the spike, then update §13 and re-confirm the voter tier.
- If the spike passes, route into implementation (`/gsd-plan-phase` for `feat/deep-research`), authoring the (currently non-existent) validation fixture as part of the work.
- Constraints to honor in build: zero-dep; reuse `advisor`; least-privilege read-only Opus; `references/*` for progressive disclosure; no cross-skill body references.

## 15. Verifier-tier decision — CORRECTED after a 3-family advisor consult

_(Supersedes the §10 "Verifier model tier" row, the §13 verifier-A/B "design change" line, and §11.5 item 5.)_

After the n=6 A/B, advisors from all three families were consulted to avoid over-updating: **native Opus 4.8** (Agent tool — Claude models are NOT routed through Copilot), **GPT-5.5**, and **Gemini 3.1 Pro** (`copilot -p`). **All three independently ruled PROVISIONAL.** Treating the A/B as settling the tier was an over-update.

**What the A/B did establish:** it falsifies the STRONG form of the "Haiku = false confidence" claim — Haiku produced 0 false-upholds and erred toward over-refusal, the safe direction for a gate.

**Why it does NOT settle the tier:**
- n=6, single run, no variance; the fixture's bad claims are BLATANT and under-sample SUBTLE overreach (hedged causal / mild scope creep) — the regime where a weak skeptic actually fails.
- Closed-book is not the open-book (WebSearch) production voter. All three warn Haiku may FLIP to false-upholds in open-book: failing to orchestrate the adversarial search -> "no counter-evidence found" -> default uphold, or being misled by a plausible-but-irrelevant hit.
- Cost is unproven: Haiku **over-refused 50% of the SUPPORTED claims** in the A/B; if that escalation fraction holds on a real corpus, escalating contested claims to Sonnet ERASES the savings.

**Adopted decision:**
- **FINAL — the escalation architecture:** deterministic quote-vs-excerpt drop -> Tier-1 cheap vote -> Sonnet escalation on ANY contested claim. Robust regardless of the Tier-1 model.
- **PROVISIONAL — the Haiku-as-Tier-1 binding:** ALL-SONNET remains the active default, Tier-1 behind a config flag, until the gating eval clears.
- **Always escalate** central / surprising / high-stakes (medical/legal/security) claims to Sonnet, plus a random audit slice of Haiku-unanimous passes (GPT-5.5).

**Gating eval (run before flipping the default to Haiku-first):** >=50-80 claims, LIVE open-book WebSearch, stratified ~40% supported / ~60% bad with ~half the bad SUBTLE; k>=3 (ideally 5) runs/claim/tier; report Pass@1 + Pass^k. Lock Haiku-first ONLY if open-book false-uphold rate stays ~0 ON THE SUBTLE SUBSET AND the Haiku-contested escalation fraction keeps real cost-per-report materially below all-Sonnet; also measure Haiku tool-failure rate (searched vs hallucinated). Otherwise the Sonnet default stays.

**Meta-lesson:** the n=6 result was a directional signal, not a decision; consulting all families before reverting a reasoned prior caught the over-update. (This is itself a validation of the lz-research design's own "advisor at high-leverage moments" + "don't over-trust a thin verification" principles.)

### 15.1 Decisive hardening from the Copilot-routed Opus (4th opinion; concurs PROVISIONAL)

A 4th advisor instance — Opus 4.8 via Copilot, re-run at the user's request — concurred PROVISIONAL and supplied the most important correction:

- **Silent false-uphold (a hole in "escalate only contested"):** a Haiku FALSE-UPHOLD is by definition a UNANIMOUS uphold, so the contested-split trigger STRUCTURALLY CANNOT catch it. Over-refutes are recoverable (they escalate); false-upholds are silent and uncatchable. Therefore the extra escalation triggers are NOT optional — they are STRUCTURALLY REQUIRED: also escalate (b) any claim **load-bearing to the report's conclusions** regardless of Haiku's verdict, and (c) a **random audit sample (~15-20%) of Haiku-unanimous UPHOLDs.** (b)+(c) are the only interim guard against the silent failure.
- **Quote-vs-excerpt drop runs UPSTREAM of all voting** (already in §8) — it removes the content-absent class at zero model risk, narrowing what Haiku must be good at to *reasoning* overreach (scope / correlation→causation / magnitude). Lean on this explicitly as Haiku de-risking.
- **Cost-asymmetry reframing (weakens the case for Haiku-first):** the value prop is "near-Opus at **Sonnet** cost," so ALL-SONNET voters are already INSIDE the promised budget — not a violation. Stakes are asymmetric: staying Sonnet risks only "spending within an envelope already called acceptable"; Haiku-first failing risks "false confidence in a cited research report," a credibility failure strictly worse than an acceptable cost. So Haiku-first must EARN its place by proving BOTH ~0 false-uphold AND a real cost win below an already-acceptable baseline; absent that, Sonnet-default is the conservative-correct choice.
- **Eval hardening:** 60-100 claims; BOTH closed- AND open-book (the open-book false-uphold number can veto Haiku-first); k>=5 (no variance signal exists yet); **PRE-REGISTER the lock rule** before running; **false-uphold rate is the SOLE hard gate** (not aggregate accuracy). Cost gate: if escalation pulls >~40-50% of claims to Sonnet, Haiku-first is not worth the added failure surface.

**Net:** the escalation architecture stays FINAL but its trigger set is HARDENED (contested + load-bearing + audit-sample of unanimous upholds). Haiku-first stays PROVISIONAL, and the cost-asymmetry raises the bar to ever flip away from the Sonnet default.

### 15.2 Open-book viability pilot (downgrade-only): NO kill signal

Ran the pilot the consult called for, scoped strictly as downgrade-only: open-book (live WebSearch), 18 claims (6 supported incl. weakly-worded / 6 blatant-false / 6 SUBTLE overclaim), k=3, **108 voter calls, 870 real search tool-uses**. Pre-stated downgrade triggers (unanimous subtle false-uphold / Haiku>Sonnet false-uphold / Haiku tool-use <0.6 / Haiku >50% true-claim escalation): **NONE fired.**

- **Haiku (open-book):** 0 false-upholds across all 12 bad claims INCLUDING all 6 subtle (0 unanimous); 6/6 true upheld (0 over-refute); **tool-use 100%** (searched every vote — refutes the "Haiku won't orchestrate search" worry at this n); **0% true-claim escalation.**
- **Sonnet (open-book):** 0 false-upholds; but over-refuted 1 true claim (s5 honey, unanimous OVERCLAIM) and 33% true-claim escalation.

Why this still does NOT lock the tier:
- The over-refutation **flipped tiers** vs the closed-book A/B (there Haiku; here Sonnet) -> small-n variance; neither tier is consistently the over-refuter.
- **Label fuzziness:** Sonnet's unanimous OVERCLAIM on the honey claim (crystallization / infant-botulism nuance) is defensible, so my SUPPORTED label is contestable. The 3-way exact accuracy (Haiku 15/18, Sonnet 14/18) is partly label ambiguity, not model error; the robust binary false-uphold gate is the clean signal (0/0). A real eval needs vetted labels.
- n=18, k=3, single run -> still not the pre-registered full eval.

**Per the symmetric discipline:** no kill signal -> (a) no family consult triggered (it was scoped to a kill-early result), and (b) a clean pilot is NOT treated as a lock. **Decision unchanged: Sonnet-default, Haiku-first PROVISIONAL.** The pilot's effect is to REMOVE the kill risk and add positive viability evidence (Haiku: 0 open-book false-upholds incl. subtle, full search compliance, lower escalation than Sonnet) -> Haiku-first is worth CARRYING INTO the full eval (§15.1) rather than dropped. Locked only by that pre-registered eval; the cost-asymmetry still governs the conservative default.
