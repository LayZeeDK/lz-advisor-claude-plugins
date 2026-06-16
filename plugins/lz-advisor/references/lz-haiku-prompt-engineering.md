# Haiku Prompt Engineering for a Fair Verify-Voter

This is the single source of truth for engineering a fair Haiku voter prompt:
the verified Haiku 4.5 prompt-engineering techniques (H1-H12), the fairness
framing the gating eval depends on, and the stale-pattern corrections that keep
the Haiku prompt grounded in CURRENT authoritative guidance rather than an
outdated starting list.

## Fairness framing (D-08) -- read this first

The Haiku voter prompt is engineered to the SAME task contract as the Sonnet
baseline: identical schema, identical dataset, identical grader. The gating eval
(Plans 18-03 / 18-05) therefore measures MODEL capability, not prompt quality.
The whole point of authoring this artifact BEFORE any Haiku agent is to make the
Haiku-vs-Sonnet comparison honest: the Haiku voter is NOT a Sonnet prompt run on
`model: haiku`, and it is NOT a hand-tuned variant given an unfair advantage. It
is a research-grounded prompt that targets the same frozen `verdict` enum and the
same reserved envelope the Sonnet voter targets, so the only load-bearing
difference between the two agents is the model.

These downstream components consume this artifact and MUST be engineered against
it:

- The author of `agents/research-verify-voter-haiku.md` (Plan 18-05) derives the
  Haiku voter prompt from the techniques and corrections below. The Haiku prompt
  is engineered FROM this artifact, never copied from the Sonnet prompt with the
  model swapped.
- The Phase-19 Haiku search-worker author reuses the same techniques and the
  same stale-pattern corrections when the search worker's model tier is decided
  from the Phase-18 eval outcome.

The frozen task contract these prompts target is fixed in
`${CLAUDE_PLUGIN_ROOT}/references/lz-deep-research-schema.md` (the vote record,
the `verdict` enum, and the reserved voter envelope). This artifact never
restates that schema; it only describes how to prompt a cheaper model to fill it
faithfully.

## Sourcing note: the non-authoritative starting point

The local `lz-nx-ai-plugins` `MODEL-OPTIMIZATION-HAIKU.md` was used ONLY as a
NON-AUTHORITATIVE starting list of candidate techniques. Every load-bearing item
below was re-verified against the CURRENT authoritative Anthropic prompting doc
(`docs.anthropic.com/.../claude-4-best-practices`, which explicitly covers Claude
Haiku 4.5) and carries a `[CITED: ...]` tag naming the verified source. Items
that could not be promoted to a verified fact keep an `[ASSUMED]` tag verbatim --
the eval measures their effect rather than asserting it. Items from the starting
list that are now STALE are corrected in "Stale patterns to AVOID" below; they
are NOT carried into the Haiku prompt.

## The verified techniques (H1-H12)

Each technique below records WHAT it is, WHY it helps a cheap model on a
skeptic-voter task, and a VERIFIED source tag. The voter task is a single
isolated skeptic vote: read a claim plus its evidence, then return `unrefuted`
or `refuted` (and, on the open-book arm, run a disconfirming search first). A
cheap model on this task fails in predictable ways -- it drifts on output
format, defaults to a confident wrong answer under uncertainty, skims long
evidence, and over-reacts to aggressive prompt language. The techniques target
exactly those failure modes.

### H1 -- Be clear and direct; specify the exact output format and constraints

WHAT: State the task plainly and pin the exact output shape (the `verdict` enum
and the envelope fields) with no room for interpretation.

WHY it helps a cheap model: removes ambiguity a weaker model would otherwise
fill with drift. Pinning the `verdict` enum plus the envelope fields keeps the
vote file machine-parseable on every call.

Source: `[CITED: claude-4-best-practices "Be clear and direct"]`

### H2 -- Few-shot / multishot examples (3-5, wrapped in `<example>`/`<examples>`)

WHAT: Give 3-5 relevant, diverse, structured examples inside `<example>` tags,
INCLUDING disconfirming examples -- a partially-supported claim correctly
returned `refuted`, with the negation search shown.

WHY it helps a cheap model: examples are "one of the most reliable ways to steer
output format." Including a disconfirming example teaches Haiku the trap directly
(the partially-supported-claim-that-looks-supported case the eval gates on),
instead of relying on it to infer the skeptical default.

Source: `[CITED: claude-4-best-practices "Use examples effectively"]`

### H3 -- XML-tagged structure (`<instructions>`, `<claim>`, `<evidence>`, `<output_format>`)

WHAT: Wrap each part of the prompt in named XML tags so the claim, the evidence,
the instructions, and the required output format are unambiguously separated.

WHY it helps a cheap model: "XML tags help Claude parse complex prompts
unambiguously." Keeping claim vs evidence vs instruction in distinct tags stops a
cheap model from confusing the claim it is judging with the instructions about
how to judge it.

Source: `[CITED: claude-4-best-practices "Structure prompts with XML tags"]`

### H4 -- Role framing in one sentence

WHAT: Open with a single role sentence, e.g. "You are an adversarial
fact-checker."

WHY it helps a cheap model: "Setting a role focuses Claude's behavior ... even a
single sentence makes a difference." The adversarial frame biases the voter
toward skepticism, which is the SAFE direction for a gate -- a false uphold is the
failure the eval exists to catch, so erring skeptical is preferable.

Source: `[CITED: claude-4-best-practices "Give Claude a role"]` +
`[VERIFIED: pilot VOTE_PROMPT]`

### H5 -- Tell it what to DO, not what NOT to do

WHAT: Phrase every constraint as a positive instruction. For the voter: "Return
`refuted` when the evidence does not fully support the claim as stated," not "Do
not return `unrefuted` unless ..."

WHY it helps a cheap model: the authoritative guidance is "instead of 'Do not use
markdown' try 'compose flowing prose.'" A positive instruction gives a cheap
model a concrete action to take; a prohibition leaves it guessing what to do
instead.

Source: `[CITED: claude-4-best-practices "Control the format of responses"]`

### H6 -- Add context / motivation for each constraint

WHAT: Explain WHY a constraint exists, e.g. "a false uphold silently corrupts a
cited research report."

WHY it helps a cheap model: "Explaining WHY a constraint exists helps Claude
adhere strictly." Motivating the skeptical default makes a cheap model treat it
as load-bearing rather than as boilerplate it can relax under pressure.

Source: `[CITED: claude-4-best-practices "Add context to improve performance"]`

### H7 -- Explicit "return Unknown / abstain when unsure" out (maps to the schema's `insufficient`)

WHAT: Give the voter an explicit abstain path when the evidence is genuinely
insufficient, rather than forcing a confident verdict. This maps to the schema's
`insufficient` seat outcome.

WHY it helps a cheap model: a cheap model under uncertainty otherwise defaults to
a confident wrong answer. Instructing it to abstain rather than guess routes the
genuinely-ambiguous cases to the safe outcome.

Source: `[CITED: lz-deep-research-schema.md vote record]` + `[ASSUMED]`
abstain-when-unsure reduces Haiku false-upholds (the eval measures it)

### H8 -- Ground the verdict in quoted evidence first (open-book: quote relevant docs, THEN judge)

WHAT: On the open-book arm, instruct the voter to quote the relevant parts of the
retrieved documents BEFORE rendering a verdict.

WHY it helps a cheap model: "For long-document tasks, ask Claude to quote
relevant parts first ... cuts through the noise." Forcing the quote step makes a
cheap model actually read the retrieved evidence instead of judging from the
claim text alone.

Source: `[CITED: claude-4-best-practices "Long context prompting / Ground responses in quotes"]`

### H9 -- Disconfirming-search instruction: search the NEGATION, record the query (VERIF-02)

WHAT: On the open-book arm, instruct the voter to actively search for evidence
that CONTRADICTS the claim and to record that query into `disconfirming_query`.

WHY it helps a cheap model: the pilot's "ACTIVELY look for evidence that
contradicts" framing achieved 100% tool-use on Haiku open-book at n=18. Searching
the negation surfaces the refuting evidence a confirmation-biased search would
miss, and recording the query makes the behavior auditable.

Source: `[CITED: claude-4-best-practices "Research and information gathering"]` +
`[VERIFIED: pilot 100% Haiku tool-use]`

### H10 -- Bounded reasoning + commit to one approach (avoid open-ended exploration)

WHAT: Keep the voter on a single focused approach for one bounded vote; avoid
open-ended exploration.

WHY it helps a cheap model: Haiku "excels at focused, bounded tasks," and the
current doc warns against over-exploration. A bounded single-call voter stays
cheap and on-task instead of spiraling into multi-step reasoning that inflates
cost without improving the verdict.

Source: `[CITED: claude-4-best-practices "Overthinking"]` +
`[ASSUMED: non-authoritative "step-bounded reasoning 3-5 steps"]`

### H11 -- Plain phrasing, NOT `CRITICAL` / `MUST` / `NEVER`

WHAT: Use normal, plain phrasing for constraints; do NOT use aggressive
`CRITICAL` / `MUST` / `NEVER` framing.

WHY it helps a cheap model: current 4.6-era models OVERTRIGGER on aggressive
language; the authoritative guidance is to "use more normal prompting." This is a
live correction versus the stale starting list, which leaned on `MUST` / `NEVER`.

Source: `[CITED: claude-4-best-practices "Tool usage" / "Tune anti-laziness prompting"]`

### H12 -- Structured output via direct instruction (or Structured Outputs), NOT prefill

WHAT: Ask the model to conform to the schema directly (or use the Structured
Outputs feature); do NOT use a prefilled assistant response to force the format.

WHY it helps a cheap model: prefill returns a 400 error on 4.6, so the stale
prefill pattern simply fails. The voter writes a small JSON object -- a direct
instruction to emit exactly that shape is enough.

Source: `[CITED: claude-4-best-practices "Migrating away from prefilled responses"]`

## Haiku 4.5 facts (verify before treating as load-bearing)

The non-authoritative starting reference records the following Haiku 4.5 numbers:
200K context, $1 / $5 per-MTok input/output, ~73% SWE-bench, "90% of Sonnet's
agentic performance at 1/3 cost," 2-5x faster. These are `[ASSUMED]` -- they come
from a single non-authoritative source. Confirm any number against
`anthropic.com/news/claude-haiku-4-5` before relying on it.

For the eval's PURPOSE, none of these numbers is gate-relevant. The only
load-bearing fact is that Haiku is the cheaper tier whose verification SAFETY is
unknown until the eval measures it; exact pricing and benchmark figures do not
change the gate.

## Stale patterns to AVOID

These patterns appear in the NON-authoritative `MODEL-OPTIMIZATION-HAIKU.md`
starting list but are STALE on current models. They MUST NOT be carried into the
Haiku voter prompt.

- `budget_tokens` thinking config is DEPRECATED. Use adaptive thinking
  (`thinking: { type: 'adaptive' }`) plus `effort` instead. The starting list's
  manual `budget_tokens` examples are out of date; do NOT emit `budget_tokens`
  config in the Haiku agent.
- Prefilled assistant responses are UNSUPPORTED on 4.6 -- prefill returns a 400
  error. Use Structured Outputs or a direct format instruction (H12). Do NOT
  include prefill examples in the Haiku prompt.
- Aggressive `CRITICAL` / `MUST` / `NEVER` framing now OVERTRIGGERS on 4.6-era
  models. Prefer plain phrasing plus context and motivation (H5, H6, H11).
- The Structured-outputs "BETA -- DO NOT USE IN PRODUCTION" caveat is itself
  stale. The current Anthropic doc treats Structured Outputs as the recommended
  replacement for prefill; re-verify against the current doc rather than citing
  the old beta caveat.

## Provenance and assumption tracking

The technique set (H1-H12) is HIGH confidence: every load-bearing item is
`[CITED:]` against the current authoritative Anthropic prompting doc, which
explicitly covers Claude Haiku 4.5. The `[ASSUMED]` tags on H7 and H10 are
preserved verbatim and are NOT promoted to verified facts:

- H7 `[ASSUMED]` (A1): "Return Unknown / abstain when unsure" reduces Haiku
  false-upholds. If wrong, the Haiku prompt is slightly less optimal -- the eval
  MEASURES the outcome, so it surfaces as a worse gate result, not a silent
  error. Low risk.
- H10 `[ASSUMED]` (A3): the "step-bounded 3-5 steps" number comes from the
  non-authoritative list. The authoritative doc supports "commit to one approach"
  but not the exact 3-5 number; treat the number as a heuristic.

No `[ASSUMED]` claim is load-bearing for the gate itself. The gate is
deterministic (verdict-vs-gold-label plus a library-computed exact-binomial
interval), and the gold labels are human-annotated; the Haiku prompt techniques
shape HOW the voter behaves, but the eval result is what settles whether the
Haiku-first tier flips on.
