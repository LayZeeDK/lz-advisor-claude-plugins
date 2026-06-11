No `<verify_request>` blocks in the reviewer's response -- no escalation needed.

## Review Summary

Reviewed: `review-src/handler.ts` -- request handler module (parse, route, validate)

### Critical

1. review-src/handler.ts:17: `JSON.parse(req.body)` unguarded crashes handler on malformed body (`"{"` -> uncaught `SyntaxError`). Wrap in try/catch returning a 400-shaped error.

### Important

2. review-src/handler.ts:13,39,51: `req`, `payload`, `data` are implicit `any` at entry/route/validate boundaries. Annotate `req: RawRequest` and `data: { name?: string; admin?: boolean }`.
3. review-src/handler.ts:52: `data.name.trim()` throws `TypeError` when `name` absent/null. Guard `typeof data?.name === 'string'` before `.trim()`.
4. review-src/handler.ts:44-45: catch returns `null`, masking validation failures (incl. finding 3) as legitimate empty results. Log error and return a discriminated `{ ok: false, error }`.

### Suggestions

5. review-src/handler.ts:27-30: `notified` is `const`-false; `if (notified)` and `sendAuditLog` unreachable. Remove dead block or wire the trigger condition.
6. review-src/handler.ts:21: braceless guard violates CLAUDE.md always-braces rule. Wrap body: `if (...) { return processAdmin(payload); }`.
7. review-src/handler.ts:57-61: `sendAuditLog` is an empty TODO stub on an (currently dead) audit path. Implement sink or delete until needed.

### Questions

(none)

### Cross-Cutting Patterns

Findings 1, 2, 3 share one root cause: no validated boundary type for the request payload. A single parse-and-validate step (try/catch around `JSON.parse` producing a typed, schema-checked `payload`) collapses all three -- finding 4's swallow then becomes the surfacing mechanism rather than a silencer. Findings 5 and 7 form a second cluster: a half-wired audit path (dead guard + stub sink) that together create the false impression audit logging exists; resolve them as one unit.

Missed surface: `processAdmin` (line 35) takes the same unvalidated `payload` via the line 21 branch and is reachable before any validation -- the admin path bypasses `validate` entirely.

**Verdict scope:** scope: api-correctness
