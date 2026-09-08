# Deep-Research Orchestration Reference

This is the progressive-disclosure reference for the deep-research orchestrator
skill. It is the canonical home for the shared orchestration knowledge the skill
`@`-mentions so the skill body stays free of cross-skill body references (one
skill must not reference another skill's named sections; shared knowledge lives
here). It holds five things: the report 5-section micro-format, the
citation-provenance join + canonical-URL rule, the two advisor-gate consult
packaging, the wave-batch + per-invocation-model reminders, and the cross-session
resume UX.

The frozen JSON shapes (the survivor record, the report claim record, the tally
rubric, the confidence enum, the named ceilings, the two assurances) live in
`${CLAUDE_PLUGIN_ROOT}/references/lz-deep-research-schema.md`. This reference
points at that schema; it never re-derives the shapes. ASCII-only throughout.

## 1. The report 5-section micro-format (D-11)

The deliverable is a single cited Markdown report written to `<run-dir>/report.md`
and surfaced to the user (PIPE-09). It has EXACTLY five sections, in this order.

### (a) Question and Scope

The research question as stated, plus the scope frame. When the run proceeded on
stated assumptions (the no-answer `-p` path), echo the `Assuming <X> (unverified)`
frames recorded in `<run-dir>/scope.md` here verbatim, so the reader sees which
premises were not confirmed. Keep the frame words intact: `Assuming`,
`(unverified)`.

### (b) Key Findings

One bullet per surviving claim. Each bullet carries:

- The claim text.
- An INLINE citation in the form `(Title, url)` (PIPE-06), joined from the source
  record (see section 2). When a claim has multiple sources, list each
  `(Title, url)` pair.
- A confidence tag from the frozen five `High | Medium | Low | Contested |
  Unsupported`. This is the single confidence vocabulary; never invent a sixth
  value.
- The two-assurance pair, side by side and never collapsed: `quote_fidelity`
  (`verified | downgraded`, Assurance 1, the aggregator's mechanical
  verbatim-match assurance) and `claim_support` (`supported | partial |
  unsupported | unassessed`, Assurance 2, the synthesis-produced
  does-the-quote-entail-the-claim judgment).

### (c) Contested and Unsupported

A FIRST-CLASS section (PIPE-08). Surviving claims whose confidence is `Contested`
or `Unsupported` are shown here in full, with their dissent surfaced -- the
disagreement is presented, never averaged into a single blended verdict. A
`Contested` claim shows that voters split (at least one `unrefuted` AND at least
one `refuted`); an `Unsupported` claim had zero readable verify seats. Do not
demote either to a footnote and do not silently drop them from Key Findings; the
report names the disagreement explicitly.

### (d) Confidence and Assurance legend

Define the two orthogonal axes so the reader cannot conflate them:

- `quote_fidelity` answers "is the quote a verbatim match against its cited
  stored excerpt?" (mechanical, off-model, aggregator-owned).
- `claim_support` answers "does the quoted text actually entail the claim?"
  (a judgment, synthesis-owned).

State plainly that one is NEVER derived from the other (VERIF-06): a quote can be
a perfect verbatim match AND still fail to support the claim. Also state that the
confidence tag is exactly the frozen five `High | Medium | Low | Contested |
Unsupported` -- never a sixth.

### (e) Sources

The list of distinct sources cited in the report, each `Title (url)`, joined from
the per-source records (see section 2).

### Distribution-scope caveat (D-05)

Wherever the report references the live-certification verdict for the verify-voter
tier (the WORKS / over-refusal certification), it MUST carry the maintainer-curated
distribution caveat: the verdict certifies on the maintainer-curated distribution,
NOT "all production." There is no production traffic; the certification is honest
about its scope and the report does not over-generalize it.

## 2. The citation-provenance join + canonical-URL rule (D-17)

For every canonical key in a survivor's `sources[]` array, the synthesis step
READS the per-source record at `<run-dir>/sources/<percent-encoded-key>.json`
for the `title` and `url` to build the inline `(Title, url)` citation.

- The filename is the PERCENT-ENCODED canonical key (every character that is not
  an ASCII letter, digit, `-`, `_`, or `.` becomes `%` + two uppercase hex
  digits; `/` -> `%2F`, `:` -> `%3A`). The `id` field INSIDE the JSON is the RAW
  canonical key. Read the file by the percent-encoded basename; trust the `id`
  inside as the raw key.
- FAIL LOUDLY on a missing record: if `sources/<percent-encoded-key>.json` is
  absent or unreadable, do NOT fabricate a title. Mark the citation
  `citation: source-record-missing` (or surface the missing record as a run
  defect) -- the absence is a real signal, not a gap to paper over.
- NEVER RE-CANONICALIZE the key in synthesis. The aggregator counts corroboration
  by the exact key it was given; the search and extract workers compute the
  canonical key with the byte-frozen recipe (kept identical to the schema and the
  eval `canonicalizeUrl` by a dev-time test). Re-canonicalizing the key in the
  synthesis step would silently under- or over-count corroboration. Read the
  record by the key as-given; do not transform it.

`claim_support` (Assurance 2) is PRODUCED by the synthesis step. It is NEVER the
aggregator's output and is NEVER derived from `quote_fidelity`. The aggregator
emits `quote_fidelity` (Assurance 1) only; synthesis judges entailment and writes
`claim_support` independently.

## 3. The two advisor-gate consult packaging (COST-01 / D-18)

The skill consults the reused Opus `advisor` agent at EXACTLY TWO gates, and no
more. Each gate is a single foreground Agent call to `advisor` with a
per-invocation `model: opus`, over BOUNDED CURATED JSON only (never raw source
text or raw votes). The advisor is read-only (`[Read, Glob]`, `maxTurns 3`,
`effort high`) and returns a 100-word enumerated response (numbered items, no
preamble); do not expect or request a longer report shape from it.

### Gate 1 -- scope, angle framing, and the ranking cut-line

Consult after the question is decomposed into sub-angles, before the search wave.
Package the research question, the proposed sub-angles, and the ranking cut-line
(which angles or candidate themes to prioritize). The SESSION-DESIGN section-5
"Gate 1b (optional re-order)" is RECONCILED INTO this single Gate-1 consult -- it
is the SAME consult continued (the advisor may return both the angle framing and a
re-ordering in one response), NOT a new spawn. Gate 1 is one Opus spawn.

### Gate 2 -- synthesis and calibration

Consult after the verify stage and the stage-2 aggregator tally, before assembling
the report. Package `survivors.json` ONLY (the bounded, post-tally survivor array)
-- not the raw excerpts, not the raw votes. Ask the advisor to sanity-check the
synthesis and confidence calibration. Gate 2 is the second and final Opus spawn.

### The hard discipline

- Exactly TWO Opus consults total. Never add a third.
- NEVER spawn `research-verify-voter-opus` from the skill -- it is
  eval-reference-only (D-18). The verify re-vote workers are Sonnet
  (`research-verify-voter-sonnet`), not Opus.
- The packaged content is bounded curated JSON only; raw source text stays on disk
  in the run dir and is never pulled into an advisor prompt.

## 4. Wave-batch and per-invocation-model reminders

These back the inline SKILL.md instructions; the skill body states them, this
reference holds the rationale.

### Wave-batch: at most 5 in-flight, foreground per turn (COST-03 / D-08)

Per worker wave, dispatch exactly `N = min(remaining, 5)` Agent calls in ONE
assistant turn, each in the FOREGROUND, then wait for all `N` one-line receipts
before the next turn. Assert exactly `N` receipts returned. If a wave needs more
than 5 workers, split it into `ceil(count / 5)` sequential sub-waves of at most 5
each, and spawn the next sub-wave's batch only AFTER all prior-batch receipts have
returned. Never issue a sixth concurrent Agent call. Foreground is mandatory:
background fan-out auto-denies prompts under `-p` and has no backpressure. There
is no platform concurrency cap for skill-spawned subagents, so this cap is a HARD
behavioral instruction, not an enforced limit.

### Per-invocation model: frontmatter `model:` is INERT (D-15 / R1)

A plugin-shipped agent's frontmatter `model:` line is SILENTLY IGNORED at
dispatch. The `model: sonnet` / `model: opus` lines in the `research-*` and
`advisor` agent files are DOCUMENTATION only. The tier is controlled SOLELY by the
orchestrator passing `model` per Agent invocation: `model: sonnet` for every
search / extract / verify worker, and `model: opus` for the two advisor gates.
The skill's own `allowed-tools` line is likewise parsed-not-enforced documentation;
workers carry their own least-privilege `tools` grants, which the skill cannot
widen or narrow.

## 5. The cross-session resume UX (D-21)

A deep-research run is a long, interruptible spend. It can die mid-pipeline at the
org usage / spend limit (HTTP 429), and a naive re-run re-pays for all the
search / fetch / extract work already on disk. Resumability is a SHIPPED,
user-facing feature: a run that died resumes from its run dir and reuses every
prior artifact, re-spending only on the phases that did not finish. The skill body
implements this as a `<resume>` section that runs BEFORE the Phase-0 scope guard;
this reference holds the detection heuristic and the per-phase semantics.

### The slug-match auto-detect heuristic (the default, headless-safe)

The resume entry point needs NO interactive prompt, so it works under `claude -p`
where `AskUserQuestion` has no answer channel. The detection steps:

1. Normalize the current research question to a slug (the same kebab-case
   derivation the run-id uses: lowercase, non-alphanumeric -> `-`, collapse
   repeats, trim). Keep it `:`-free (a Windows filename constraint).
2. Scan `.lz-research/` for candidate run dirs. A run dir is a RESUME CANDIDATE iff
   it has NO `report.md` (an absent terminal sentinel means the run did not finish)
   AND its run-id slug matches the normalized question slug (or its `scope.md`
   scope matches). A run dir WITH `report.md` is complete and is never a resume
   candidate.
3. If one or more candidates match, pick the MOST RECENT (the run-id timestamp
   prefix `YYYYMMDD-HHMMSS` orders them). Surface `Resuming <run-id>` to the user,
   then jump to the FIRST INCOMPLETE phase (the first phase whose done-signal is
   absent; see "The resume done-signals" in the schema reference).
4. If no candidate matches, start a fresh run via the normal Phase-0 path (generate
   a new run-id, create the run dir).

### The explicit `--resume <run-id>` fallback

When the auto-detect is ambiguous or the user wants a specific prior run, the user
may pass `--resume <run-id>`. The skill then resumes THAT run dir directly
(skipping the slug scan), surfaces `Resuming <run-id>`, and jumps to its first
incomplete phase. An explicit `--resume <run-id>` whose dir is missing or already
has `report.md` is surfaced as such (nothing to resume / already complete), not
silently restarted.

### The degenerate-aggregate guard on the stage-2 boundary

When resuming a run whose `report.md` is ABSENT, the skill NEVER infers stage-2
completion from `survivors.json` confidence values (a crashed run can leave a
PREMATURE all-`Unsupported` stage-1 `survivors.json`). It treats the run as
incomplete past the verify wave, fills any missing votes, then ALWAYS re-runs the
idempotent aggregator stage-2 tally (`node
"${CLAUDE_PLUGIN_ROOT}/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs"
"<run-dir>"`) and writes the `run_state.json` `{ stage2_complete: true }` sentinel
only after a clean exit. A non-zero aggregator exit stays a RUN FAILURE (surface
stderr; never consume a missing `survivors.json`) -- the resume path does not
weaken the aggregator's fail-closed ContractError discipline.
