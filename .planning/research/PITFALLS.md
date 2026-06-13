# Pitfalls Research

**Domain:** Claude Code marketplace plugin -- v2.0.0 (skill rename to de-shadow built-ins + on-demand Fable advisor + breaking release)
**Researched:** 2026-06-13
**Confidence:** HIGH (per-invocation override + Fable mechanics verified against anthropics/claude-code issues #10993, #44385, #34821, #43869 and Anthropic/press Fable docs)

> Scope note: pitfalls are specific to THESE three changes. Generic "test your code" advice is omitted.

---

## HEADLINE FINDING (read first -- reshapes the milestone design)

The milestone goal says the skill "passes a per-invocation `model: claude-fable-5` override" on the Task/Agent call. **This is not achievable as written.** The Task/Agent tool `model` parameter is a hardcoded enum of `["sonnet", "opus", "haiku"]` ([#34821](https://github.com/anthropics/claude-code/issues/34821)). You cannot pass `claude-fable-5` (a full model name) as the per-invocation Task parameter. The ONLY mechanisms that can route a subagent onto `claude-fable-5` are:

1. **Session-model inheritance** -- user launches `claude --model claude-fable-5`; the advisor subagent inherits it (because frontmatter `model:` is ignored, [#44385](https://github.com/anthropics/claude-code/issues/44385)). But this also makes the *executor* run on Fable, defeating the "Sonnet executor" value prop.
2. **`CLAUDE_CODE_SUBAGENT_MODEL=claude-fable-5`** (accepts full model names; aliases like `fable` do NOT work, [#10993](https://github.com/anthropics/claude-code/issues/10993)). This routes ALL subagents to Fable for that session, not just per-call.

Neither gives the clean per-call Fable selection the milestone describes. **The Fable advisor phase MUST begin with a feasibility spike** that empirically establishes which mechanism actually puts the advisor (and only the advisor) on Fable, then re-scope the feature to that mechanism. If no mechanism cleanly isolates Fable to the advisor subagent, the honest v2.0.0 shape is "document `CLAUDE_CODE_SUBAGENT_MODEL=claude-fable-5` as the opt-in, default stays Opus" rather than a `--model fable` skill argument that silently no-ops.

(Note: the milestone context cites issue #173 for "frontmatter not respected" -- that attribution is wrong; #173 is an unrelated file-modification-approval request. The correct frontmatter-ignored report is **#44385**.)

---

## Critical Pitfalls

### Pitfall 1: Per-invocation model override silently no-ops -> Fable feature ships dead

**What goes wrong:**
The skill instructs the Sonnet executor to spawn the advisor with a model override, the run "succeeds," but the advisor actually ran on the parent/default model -- Fable was never used and the user paid nothing extra and got no Fable. Two compounding causes: (a) the Task `model` param does not accept `claude-fable-5` at all (enum-limited, see Headline); (b) even for valid aliases, the Sonnet executor does not reliably EMIT the `model` parameter on every Task call, and agent frontmatter `model:` is ignored ([#44385](https://github.com/anthropics/claude-code/issues/44385)), so omission silently inherits the parent model. [#43869](https://github.com/anthropics/claude-code/issues/43869) reports ALL FIVE selection mechanisms (Task param, frontmatter, `CLAUDE_CODE_SUBAGENT_MODEL` full-name, `CLAUDE_CODE_SUBAGENT_MODEL` alias, settings.json env) intermittently resolving to parent Opus.

**Why it happens:**
Claude Code's documented behavior ("omitted -> uses agent frontmatter") does not match runtime; frontmatter is ignored. The executor is a stochastic Sonnet model -- it may forget to inject the `model` argument on a given run. There is no compile-time check that the argument was passed.

**How to avoid:**
- Treat "does the executor emit the override every time?" as the LOAD-BEARING empirical risk. Verify with a headless UAT (`claude --model sonnet ... -p "/lz-execute ..."`) that asserts the resolved advisor model, not just that the skill ran.
- Make the resolved model OBSERVABLE: instruct the advisor agent's first output line to state its own model id (e.g. "advisor model: <id>"), and have the skill echo the requested vs resolved model. The advisor's own model is recoverable from the subagent JSONL (`~/.claude/projects/<hash>/<session>/subagents/agent-<id>.jsonl`, `toolUseResult.usage`), per the project's prior tool-budget observability finding.
- Keep `model: opus` frontmatter as the SAFE FALLBACK so the degraded path is "advisor ran on Opus" (still correct, never broken), never "advisor ran on Sonnet/Haiku" (broken advice quality).
- Do NOT claim the Fable path works until a UAT shows a resolved Fable model id in the trace; a green skill run does not prove it.

**Warning signs:**
Skill run completes with no Fable cost on the bill; advisor output indistinguishable from Opus; the `model` argument absent from the Task call in the transcript; SUMMARY asserts "Fable used" with no resolved-model evidence.

**Phase to address:**
Fable advisor phase -- feasibility spike + observability + headless UAT gate. This is the phase most likely to need its own deeper research pass.

---

### Pitfall 2: `CLAUDE_CODE_SUBAGENT_MODEL` footgun -- user's global env silently overrides the plugin's choice AND frontmatter

**What goes wrong:**
A user who set `CLAUDE_CODE_SUBAGENT_MODEL` globally (common for cost control, e.g. pinning subagents to Haiku) silently overrides BOTH the plugin's per-call model AND the `model: opus` frontmatter. Resolution priority makes the env var #1 -- it wins unconditionally ([#10993](https://github.com/anthropics/claude-code/issues/10993): "When set, it ALWAYS overrides per-subagent model fields"). The advisor then runs on Haiku, producing weak guidance while the user believes they are getting Opus/Fable advice.

**Why it happens:**
Priority order is env var > invocation param > frontmatter > parent inheritance. The env var is the one input the plugin cannot see or control, and most users who set it forget it is set. Cowork even injects it unconditionally as `claude-haiku-4-5` ([#47488](https://github.com/anthropics/claude-code/issues/47488)).

**How to avoid:**
- DETECTION + WARNING strategy: at advisor consult time, surface the resolved model and, if it diverges from the requested model, emit a one-line caveat: "advisor resolved to <model> (CLAUDE_CODE_SUBAGENT_MODEL override?) -- guidance quality may differ from Opus." The skill cannot reliably read the env var via its `allowed-tools` profile, so make the divergence visible via the resolved-model echo (Pitfall 1's observability hook doubles as this detector).
- Document the footgun in README + CHANGELOG: "If `CLAUDE_CODE_SUBAGENT_MODEL` is set in your environment, it overrides the advisor model selection, including the Opus default."
- Do NOT attempt to unset or fight the env var -- it is the user's deliberate global choice; only detect-and-disclose.

**Warning signs:**
Advisor output suddenly terse/low-quality across all skills; resolved-model echo shows Haiku/Sonnet despite an Opus/Fable request; behavior reproduces only on one user's machine.

**Phase to address:**
Fable advisor phase -- bundle the env-var detection into the same observability work as Pitfall 1.

---

### Pitfall 3: Partial-rename drift -- a reference left pointing at an old skill name

**What goes wrong:**
The four skill directories/`name:` fields get renamed to `lz-plan`/`lz-execute`/`lz-review`/`lz-security-review`, but a cross-reference somewhere still says `lz-advisor:plan` / `/review` / `lz-advisor:execute`. The plugin loads but the stale reference resolves to nothing (or to the built-in it was supposed to de-shadow), and the bug is silent until a user hits that path.

**Why it happens:**
The skill name appears across many surfaces: 4 SKILL.md `name:` + dir names, agent `Agent(...)` allowed-tools entries, references/*.md, README, CHANGELOG, the project's OWN headless UAT invocation strings in CLAUDE.md (`/lz-advisor:execute Implement the plan...`), eval workspace JSON, and the budget test fixtures. The v1.0 Phase 9 rename (dotted -> plain) already proved this is a wide blast radius requiring a "cross-reference sweep across operational surfaces."

**How to avoid:**
- Enumerate every surface BEFORE renaming (mirror the Phase 9 sweep list). Use `git grep -n` for each old bare and qualified form across `plugins/`, `tests/`, `evals/`, README, CLAUDE.md.
- Use `git mv` for the skill directories (preserves history, stages atomically).
- After rename, `git grep` for each OLD name; expect zero hits in operational surfaces (frozen `.planning/` history stays unchanged as accurate record, per the Phase 9 precedent).
- CRITICAL: update the project's own `claude -p` UAT invocation examples in CLAUDE.md "Conventions" -- they reference `/lz-advisor:execute` etc. and will break the verification workflow if left stale (overlaps Pitfall 7; the mechanical fix lives here).

**Warning signs:**
A skill resolves to a built-in instead of the plugin; `git grep` finds an old name in an operational file; a headless UAT errors "unknown skill"; the agent `Agent(lz-advisor:advisor)` grant mismatches the spawn `subagent_type`.

**Phase to address:**
Rename phase -- the atomic rename + cross-reference sweep, gated by a zero-old-name `git grep` check.

---

### Pitfall 4: Bare-vs-qualified collision NOT verified -- a new name still collides, or disambiguation is unverifiable headlessly

**What goes wrong:**
The rename is meant to STOP `/plan` `/review` `/security-review` shadowing built-ins. But (a) a chosen `lz-` name might collide with some OTHER built-in or another installed plugin's skill, and (b) the project's standard verification method -- a headless `claude -p "/lz-execute ..."` probe -- CANNOT detect bare-form collisions at all. The qualified form `/lz-advisor:lz-plan` never collides, so a green headless probe says NOTHING about whether bare `/lz-plan` disambiguates. This exact false-confidence bug already bit the project: Phase 9's 09-03-SUMMARY wrongly recorded `/plan` as having "no built-in twin" because the headless probe was blind to it; the interactive picker later proved `/plan` DOES collide (project memory: headless-probe-misses-bare-form-collisions).

**Why it happens:**
Bare-form collisions only surface in the INTERACTIVE slash-command picker (which lists both entries and disambiguates via the `(lz-advisor)` qualifier). The headless `--output-format stream-json` path and the qualified form are both structurally blind to the bare-form collision class.

**How to avoid:**
- Verify the new names do NOT collide with ANY built-in: enumerate the current Claude Code built-in slash commands and confirm `lz-plan`/`lz-execute`/`lz-review`/`lz-security-review` are absent. The `lz-` prefix makes collision unlikely but MUST be checked, not assumed.
- VERIFICATION METHOD: bare-form disambiguation MUST be checked in the interactive picker, NOT headless. Type bare `/lz-plan`, confirm it appears (ideally with no built-in twin now), and confirm selection expands to the clean qualified `/lz-advisor:lz-plan`. Headless probes are acceptable ONLY for qualified-form resolution, never for the collision claim.
- Record this as a human_needed UAT item explicitly flagged "interactive picker, not headless" so it is not silently closed by a green `claude -p` run.

**Warning signs:**
A SUMMARY claims "no collision" citing only a headless probe; the picker shows two entries for a bare `/lz-*` name; selecting the plugin skill expands to something other than `/lz-advisor:lz-<skill>`.

**Phase to address:**
Rename-phase verification -- with an interactive-picker UAT item, not a headless gate.

---

### Pitfall 5: Fable safety classifier silently hands off security-review to Opus 4.8 (Fable is the WEAKEST fit for `/lz-security-review`)

**What goes wrong:**
A user runs `/lz-security-review` with the Fable opt-in expecting Fable-grade threat analysis. Fable 5 carries safety classifiers (it is the "public-safe" sibling of Mythos 5, which has NO cybersecurity/bio classifiers). When a query matches the cybersecurity (or bio/chem/distillation) classifier, the request is AUTOMATICALLY ROUTED to Claude Opus 4.8 -- the user is notified and billing switches to Opus rates. So the one skill where a stronger reviewer would matter most is exactly where Fable silently degrades to Opus. The bio/chem classifier is "tuned conservatively" and catches benign requests, so even non-security review content may trip it.

**Why it happens:**
Security review prompts are dense with attack-surface, exploit, and vulnerability language -- precisely the cybersecurity classifier's trigger surface. The handoff is a feature of Fable, not a bug; but it makes the Fable opt-in misleading for `/lz-security-review`.

**How to avoid:**
- GUARDRAIL: document that Fable on `/lz-security-review` will frequently hand off to Opus 4.8 (user notified + Opus billing). Set expectation that Fable adds little here.
- Make the handoff OBSERVABLE: the resolved-model echo (Pitfall 1) will show Opus 4.8 instead of Fable on a handoff -- surface that to the user rather than silently absorbing it.
- Consider scoping the Fable opt-in to `/lz-plan` and `/lz-execute` advisors only, OR explicitly warning in `/lz-security-review` that Fable degrades to Opus. The graceful-degradation-to-Opus default means this is safe, just not value-adding.

**Warning signs:**
`/lz-security-review` Fable run shows a resolved model of `claude-opus-4-8`; user sees a Claude Code handoff notification mid-review; Fable billing absent despite the opt-in.

**Phase to address:**
Fable advisor phase -- the security-review skill's Fable guardrail + handoff observability.

---

### Pitfall 6: Plugin REQUIRES Fable / breaks when Fable is unavailable (the access-suspension trap)

**What goes wrong:**
The plugin hard-wires Fable somewhere (default model, mandatory arg, agent frontmatter), so when a user lacks easy Fable access the advisor errors or stalls. This is acute because **bundled Fable access on Pro/Max/Team/Enterprise ENDS June 22, 2026**; from June 23 it requires usage credits (no committed restoration date). Most subscription users will LOSE one-click Fable access within days of v2.0.0 shipping. Fable also costs exactly 2x Opus ($10/$50 vs $5/$25 per M tokens) and counts as 2x subscription usage -- directly contradicting the plugin's "near-Opus intelligence at Sonnet cost" value prop.

**Why it happens:**
Easy to set Fable as the default during development (when the dev has access) and forget that most users will not, or will be on credits. The 2x cost makes Fable an anti-default for a plugin whose whole pitch is cost efficiency.

**How to avoid:**
- Fable MUST be strictly OPT-IN; default stays Opus; the absence/unavailability of Fable MUST degrade gracefully to Opus (the safe-fallback frontmatter from Pitfall 1 provides this).
- NEVER make the Fable opt-in mandatory, NEVER set Fable in agent frontmatter, NEVER require Fable for any skill to function.
- Document the cost (2x Opus, 2x subscription usage) and the June-22 access change in README so users opt in with eyes open.
- Position Fable as a deliberate "spend more for the hardest problems" lever, NOT the path that serves the core value prop.

**Warning signs:**
Any skill errors when Fable is not the session model; default-path billing shows Fable; README/CHANGELOG implies Fable is the headline default; a user on credits hits unexpected charges from a default-on Fable.

**Phase to address:**
Fable advisor phase -- design the opt-in + graceful-degradation; release phase -- the cost/access documentation.

---

### Pitfall 7: Breaking-change under-signaled -- users' muscle memory + automation break with no migration path

**What goes wrong:**
The `/plan` -> `/lz-plan` (etc.) rename is BREAKING: any user invoking the old bare names, any saved workflow, and the project's OWN headless UAT scripts referencing `/lz-advisor:execute` stop working. If this ships without a migration table or under-bumps the version, users hit "unknown skill" with no guidance.

**Why it happens:**
Rename feels like an internal fix ("we're de-shadowing built-ins") so the breaking nature is easy to under-rate. The old qualified forms `lz-advisor:plan` etc. ALSO change to `lz-advisor:lz-plan`, so even users who used the qualified form are affected.

**How to avoid:**
- SemVer MAJOR (1.0.1 -> 2.0.0) -- already planned; hold the line on it.
- CHANGELOG `[2.0.0]` MUST include a migration table: old name -> new name for all four (both bare and qualified forms), e.g. `/plan` -> `/lz-plan`, `/lz-advisor:plan` -> `/lz-advisor:lz-plan`.
- README "What's New" shows ONLY the 2.0.0 entry, self-contained (project convention: stable/major releases collapse What's New to the current version, no prerelease backfill).
- Update the project's own `claude -p` UAT invocation examples in CLAUDE.md "Conventions" to the new names IN THE SAME COMMIT as the rename (overlaps Pitfall 3) -- otherwise the verification workflow silently runs against names that no longer exist.

**Warning signs:**
CHANGELOG lacks a migration table; bump is anything less than major; CLAUDE.md UAT examples still say `/lz-advisor:execute`; README backfills prerelease changelog into What's New.

**Phase to address:**
Release phase -- CHANGELOG migration table + SemVer + README; rename phase owns the CLAUDE.md UAT-example update.

---

### Pitfall 8: 5-surface version bump drifts (one surface left at 1.0.1)

**What goes wrong:**
The version is bumped on most surfaces but one is missed, leaving the plugin in an inconsistent 1.0.1/2.0.0 split state.

**Why it happens:**
The project's release discipline requires an ATOMIC 5-surface bump (`plugin.json` + the other version-carrying surfaces). It is easy to miss one when also doing the rename + Fable work in the same milestone.

**How to avoid:**
- Treat the 1.0.1 -> 2.0.0 bump as one atomic change across all 5 surfaces (project convention; v1.0/v1.0.1 releases established this).
- `git grep -n "1\.0\.1"` after the bump; expect hits only in frozen `.planning/` history.
- git tag `v2.0.0` + GitHub Release as the final step (note: prior milestones did NOT push the tag -- confirm publish intent with the user before pushing).

**Warning signs:**
`git grep "1\.0\.1"` finds a live (non-archived) hit post-bump; plugin.json and README disagree on version.

**Phase to address:**
Release phase -- atomic bump + tag + Release.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Ship a `--model fable` skill arg that emits a Task `model` param | Looks like the milestone goal | Silently no-ops (enum is sonnet/opus/haiku only); feature ships dead | Never -- spike the real mechanism first |
| Trust agent `model:` frontmatter to select the advisor model | Clean, declarative | Frontmatter is IGNORED at runtime (#44385); inherits parent | Only as a SAFE FALLBACK (opus), never as the selection mechanism |
| Verify name collision with a headless probe | Fast, scriptable | Blind to bare-form collisions; gives false "no collision" confidence | Only for qualified-form resolution, never for the collision claim |
| Default the advisor to Fable | Best advice quality | 2x cost, breaks "Sonnet cost" prop, breaks on post-June-22 access loss | Never -- opt-in only |
| Skip the resolved-model echo | Less prompt surface | Cannot detect override/handoff; Fable feature unverifiable | Never -- observability is the only proof the model resolved |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Task/Agent tool `model` param | Passing `claude-fable-5` (full name) | Enum-limited to sonnet/opus/haiku ([#34821](https://github.com/anthropics/claude-code/issues/34821)); full names not accepted -- use `CLAUDE_CODE_SUBAGENT_MODEL=claude-fable-5` or session model |
| Agent frontmatter `model:` | Relying on it to route the subagent | Ignored at runtime ([#44385](https://github.com/anthropics/claude-code/issues/44385)); keep `opus` only as the safe inherited fallback |
| `CLAUDE_CODE_SUBAGENT_MODEL` | Assuming aliases work | Full model names ONLY; aliases like `fable`/`opus` rejected ([#10993](https://github.com/anthropics/claude-code/issues/10993)) |
| Fable 5 + security content | Expecting Fable-grade security review | Auto-handoff to Opus 4.8 on cybersecurity/bio classifier match, with notification + Opus billing |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Routing security-review to Fable expecting deeper analysis | Silent handoff to Opus 4.8; false belief Fable analyzed it; conservative bio/chem classifier trips benign content | Document the handoff; surface resolved-model; consider excluding Fable from `/lz-security-review` |
| Assuming the renamed `/lz-security-review` no longer collides | A residual built-in/plugin collision could route security review to a built-in | Interactive-picker collision check (Pitfall 4), not headless |

## "Looks Done But Isn't" Checklist

- [ ] **Fable advisor:** skill runs green BUT resolved-model echo never shows a Fable id -- verify the trace shows `claude-fable-5`, not just a successful run.
- [ ] **Per-invocation override:** the `model` argument is actually present on the Task call in the transcript -- verify it is emitted EVERY run, not just once.
- [ ] **Name collision:** "no collision" claim is backed by an INTERACTIVE picker check -- verify it is not a headless probe (blind to bare-form collisions).
- [ ] **Rename sweep:** `git grep` for every old bare AND qualified name returns zero operational hits -- verify CLAUDE.md UAT examples were updated too.
- [ ] **Graceful degradation:** with no Fable access / `CLAUDE_CODE_SUBAGENT_MODEL` unset, the advisor falls back to Opus and the skill still completes -- verify the degraded path, not just the happy path.
- [ ] **5-surface bump:** `git grep "1\.0\.1"` shows only archived hits -- verify all 5 surfaces moved to 2.0.0.
- [ ] **Migration table:** CHANGELOG `[2.0.0]` lists old->new for all four skills (bare + qualified) -- verify it is present and complete.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Fable feature shipped dead (override no-ops) | HIGH | Patch release; re-scope to `CLAUDE_CODE_SUBAGENT_MODEL` mechanism + observability; the spike should have prevented this |
| Partial-rename drift | LOW | `git grep` old name, fix the stale ref, patch release |
| Bare-form collision shipped undetected | MEDIUM | Interactive verification post-hoc; rename again if a residual collision exists (another breaking change) |
| Env-var override confusion (support burden) | LOW | Add the resolved-model echo + README note in a patch; behavior was always user-controlled |
| 5-surface drift | LOW | Bump the missed surface, re-tag |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1. Per-invocation override no-ops | Fable advisor phase | Headless UAT asserts resolved Fable model id in subagent JSONL; override arg present every run |
| 2. CLAUDE_CODE_SUBAGENT_MODEL footgun | Fable advisor phase | Resolved-model echo diverges-and-warns; README documents the override |
| 3. Partial-rename drift | Rename phase | `git grep` old bare+qualified names = 0 operational hits |
| 4. Bare-form collision unverified | Rename-phase verification | INTERACTIVE picker check (flagged human_needed, not headless) |
| 5. Fable security-review handoff | Fable advisor phase | Fable `/lz-security-review` resolved-model echo shows the handoff |
| 6. Plugin requires Fable | Fable advisor (design) + release (docs) | Degraded-path UAT (no Fable) completes on Opus |
| 7. Breaking-change under-signaled | Release phase + rename phase (CLAUDE.md) | CHANGELOG migration table present; major bump; UAT examples updated |
| 8. 5-surface bump drift | Release phase | `git grep "1\.0\.1"` = archived hits only |

## Sources

- [anthropics/claude-code #10993](https://github.com/anthropics/claude-code/issues/10993) -- CLAUDE_CODE_SUBAGENT_MODEL accepts full names only (not aliases); when set, ALWAYS overrides per-subagent model field (priority 1) -- HIGH
- [anthropics/claude-code #44385](https://github.com/anthropics/claude-code/issues/44385) -- agent frontmatter `model:` is IGNORED; subagents inherit parent unless `model` explicitly passed on the Agent call -- HIGH
- [anthropics/claude-code #34821](https://github.com/anthropics/claude-code/issues/34821) -- Task tool `model` param is a hardcoded enum `["sonnet","opus","haiku"]`; full names like `claude-fable-5` NOT accepted -- HIGH
- [anthropics/claude-code #43869](https://github.com/anthropics/claude-code/issues/43869) -- all FIVE subagent model-selection mechanisms reported resolving to parent Opus (15 runs / 5 tests) -- HIGH (reliability risk)
- [anthropics/claude-code #47488](https://github.com/anthropics/claude-code/issues/47488) -- Cowork injects CLAUDE_CODE_SUBAGENT_MODEL=claude-haiku-4-5 unconditionally, overriding everything -- MEDIUM
- [anthropics/claude-code #173](https://github.com/anthropics/claude-code/issues/173) -- UNRELATED (file-modification approval request); the milestone's #173 attribution for "frontmatter not respected" is incorrect -- HIGH (correction)
- [Claude Code model configuration (support.claude.com)](https://support.claude.com/en/articles/11940350-claude-code-model-configuration) -- `claude-fable-5` is a valid SESSION model via `--model` / `ANTHROPIC_MODEL` / `/model` (not a Task-param value) -- HIGH
- [Finout: Fable 5 / Mythos 5 pricing & benchmarks](https://www.finout.io/blog/claude-fable-5-mythos-5-pricing-benchmarks) -- cybersecurity/bio/chem/distillation classifier match AUTO-ROUTES to Opus 4.8 (notified, Opus billing); Fable = 2x Opus ($10/$50 vs $5/$25) -- HIGH
- [TechCrunch: Fable 5 release](https://techcrunch.com/2026/06/09/anthropic-released-claude-fable-5-its-most-powerful-model-publicly-days-after-warning-ai-is-getting-too-dangerous/) -- Fable 5 = public-safe Mythos 5; Mythos has NO cybersecurity/bio classifiers -- MEDIUM
- [Developers Digest: Fable 5 June 22 deadline](https://www.developersdigest.tech/blog/claude-fable-5-june-22-deadline) -- bundled Pro/Max/Team/Enterprise access ends June 22 2026; credits from June 23; no committed restoration date -- HIGH
- Project memory: `headless-probe-misses-bare-form-collisions` -- bare-form collisions only visible in interactive picker, not headless -- HIGH (prior project finding)
- Project memory: `release-readme-current-version-only` -- stable/major release README What's New = current version only -- HIGH (project convention)
- `.planning/PROJECT.md` Phase 9 Key Decision -- prior rename established the cross-reference-sweep blast radius -- HIGH

---
*Pitfalls research for: lz-advisor v2.0.0 (skill rename + Fable advisor + breaking release)*
*Researched: 2026-06-13*
