## Review Summary

Reviewed: `review-src/handler.ts` -- TypeScript request handler (parse, route, validate)

### Critical

1. review-src/handler.ts:17: `JSON.parse(req.body)` unguarded; malformed body throws uncaught `SyntaxError` crashing handler at trust boundary. Wrap in try/catch, return 400.

### Important

2. review-src/handler.ts:52: `data.name.trim()` dereferences `data.name` with no null/shape check; `TypeError` on missing `name`. Guard shape before `.trim()`.
3. review-src/handler.ts:44-46: `catch (e)` returns `null` discarding error; failures undebuggable. Log `e` before returning, or rethrow typed error.
4. review-src/handler.ts:27-30: `notified` never set true; `if (notified)` is dead, `sendAuditLog` unreachable. Remove dead branch or wire the trigger.
6. review-src/handler.ts:13,39,51: `req`/`data` untyped (implicit `any`); type boundary defeated, enabling Findings 1/2. Type `req: RawRequest`, `data: unknown` + narrow.

### Suggestions

5. review-src/handler.ts:21: braceless `if` returns `processAdmin` -- violates CLAUDE.md always-braces rule. Add `{ }` block.

### Questions

(none)

---

**Per-finding validation**

Validation of Finding 5: lowered to Suggestion (executor said Important). Pure style-rule violation with no behavioral impact; the always-braces rule is a maintainability/diff-cleanliness convention. CLAUDE.md compliance matters but does not affect correctness, so it belongs under Suggestions per the severity classification.

### Cross-Cutting Patterns

Findings 1, 2, and 6 share one root cause: the trust boundary (`handleRequest`) accepts untyped, unvalidated input and propagates it untouched into `processUser`/`validate`. A single typed parse-and-validate step (typed `req`, schema-checked `payload`, narrowed `data`) collapses all three. Findings 3 and 4 are an observability pair: Finding 3 swallows the very `TypeError` Finding 2 produces, and Finding 4's dead audit branch means even a successful path emits no trace -- the module is structurally unobservable in production.

**Missed surfaces:** `processAdmin` (line 35) skips `validate` entirely -- admin payloads reach output with zero validation, a broader gap than the user path the findings cover.

---

**Verdict scope:** scope: api-correctness
