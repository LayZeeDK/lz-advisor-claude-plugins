---
seed_id: SEED-001
trigger_when: Anthropic enables Fable (or any stronger-than-Opus model) for subagent / programmatic (firstParty) dispatch
planted_during: v2.0.0 (Prefixed skill names) research
planted_date: 2026-06-14
status: dormant
area: advisor-model-selection
---

# SEED-001: On-demand stronger-than-Opus advisor (Fable)

## Idea

Let users select a stronger advisor model than Opus on demand for the lz-advisor advisor subagent (originally Fable / `claude-fable-5`), via a per-invocation override or a session env var, while the executor stays on the cheap session model.

## Why This Matters

The advisor strategy's value scales with the advisor being STRONGER than the executor. Fable 5 (Anthropic's most capable GA model, ~2x Opus) would be a meaningfully stronger advisor than Opus. The override MECHANISM is already PROVEN: `model: opus` frontmatter overridden to `haiku` per-invocation runs on haiku, observable via the subagent JSONL `"model"` field (see `.planning/research/FABLE-OVERRIDE-PROBE.md`). Only the model ACCESS is blocked.

## Why Deferred (2026-06-14)

Subagent-Fable is blocked SERVER-SIDE. The Anthropic API returns `404 not_found` -- "Claude Fable 5 is not available. Please use Opus 4.8. Learn more: https://www.anthropic.com/news/fable-mythos-access" -- for subagent/firstParty dispatch, even though interactive `/model fable` works as a primary session model. Confirmed via `claude --debug` (raw API error) across every mechanism (per-invocation override AND `CLAUDE_CODE_SUBAGENT_MODEL`). This is an Anthropic access restriction on Mythos-class models, not an engineering gap. Full evidence: `.planning/research/FABLE-OVERRIDE-PROBE.md` Finding 4 + root cause.

## When to Surface

- Anthropic enables Mythos-class models (Fable) for subagent/API dispatch on Team/Pro/Max plans (watch https://www.anthropic.com/news/fable-mythos-access).
- OR any new model stronger than the then-current Opus becomes available for subagent dispatch.

## Implementation Readiness (when unblocked)

Small change (~1 phase): keep `model: opus` frontmatter as the safe floor on the 3 agents; add a shared `references/model-selection.md` (`@`-loaded by the 4 skills) that interprets a `--model` arg / natural-language intent and passes a per-invocation override; emit a resolved-model echo for observability; document the `CLAUDE_CODE_SUBAGENT_MODEL` priority-1 footgun. The override mechanism and observability method are already proven.
