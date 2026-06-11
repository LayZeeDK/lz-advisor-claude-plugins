No `<verify_request>` blocks -- proceeding directly to output.

## Review Summary

Reviewed: `review-src/handler.ts` (request handler module, no third-party imports)

### Critical

2. `review-src/handler.ts:17`: `JSON.parse(req.body)` has no try/catch; malformed body throws uncaught `SyntaxError`, crashing handler on every bad request. Wrap in try/catch, return 400-shaped error.
5. `review-src/handler.ts:52`: `data.name.trim()` derefs `name` with no guard; non-string/missing `name` throws `TypeError` -- swallowed by `processUser` catch (line 44), so valid-vs-malformed inputs both silently return `null`. Guard `typeof data?.name === 'string'`.

### Important

1. `review-src/handler.ts:13`: `req` untyped + no return type, both implicit `any`; `RawRequest` (line 6) defined but unused. Annotate `req: RawRequest`, return type.
6. `review-src/handler.ts:44`: `catch (e)` discards error -- no log, no rethrow. Failures undebuggable in production. Log `e` or rethrow a typed error.

### Suggestions

3. `review-src/handler.ts:21`: braceless `if` -- CLAUDE.md "always braces" violation; fragile if a second statement is added. Add `{ }`.
4. `review-src/handler.ts:27-30`: `notified` is `let false`, never mutated; `if (notified)` body and `sendAuditLog` stub are dead code. Remove, or wire `notified` from real signal.

### Questions

(none)

### Cross-Cutting Patterns

Findings 2, 5, and 6 share one root cause: zero input validation at the trust boundary. The compounding failure is the headline -- `JSON.parse` (2) and `data.name.trim()` (5) both throw on untrusted input, and the `processUser` catch (6) swallows the line-52 throw into a silent `null`, so malformed payloads return success-shaped `null` instead of erroring. Recommend a single schema validator (parse + shape-check) at `handleRequest` entry, with the catch logging or rethrowing. Findings 1 (missing types) and 6 (swallow) are the type-safety and observability halves of the same untyped-boundary theme: `any` at line 13/51 means the compiler never flagged the unguarded derefs.

**Missed surface (reviewer-noted):** `processAdmin` (line 35) trusts `payload` post-parse with no shape check before returning it under `role: 'admin'` -- same unvalidated-boundary theme as findings 2/5.

**Verdict scope:** scope: api-correctness
