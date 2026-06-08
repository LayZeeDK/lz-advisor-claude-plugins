## Review Summary

Reviewed: `review-src/handler.ts` — request handler module (parse, dispatch, process)

### Critical

1. review-src/handler.ts:17: `JSON.parse(req.body)` has no try/catch; malformed body throws uncaught `SyntaxError` and crashes handler. Wrap in try/catch, return controlled error.
2. review-src/handler.ts:44-45: `processUser` catch discards `e` and returns `null`; failures vanish, callers see success-shaped `null`. Log/rethrow, return discriminated error.
3. review-src/handler.ts:52: `data.name.trim()` derefs `name` with no guard; null/non-string `name` throws `TypeError`. Guard `typeof data?.name === 'string'`.

### Important

4. review-src/handler.ts:21: braceless `if` returning `processAdmin` violates CLAUDE.md always-braces rule. Add `{ }` block around the return.
5. review-src/handler.ts:13: `handleRequest(req)` lacks param and return type; `req` is implicit `any`. Annotate `req: RawRequest` and an explicit return type.

### Suggestions

(none)

### Questions

6. review-src/handler.ts:35,57: `processAdmin`/`sendAuditLog` type `payload` as `RawRequest`, but it is the parsed body (arbitrary JSON). Is `RawRequest` the wrong type here?

### Per-finding validation

Validation of Finding 3: confirmed; raised severity is unchanged (Important is correct in isolation). `validate` is reached on the non-admin path for every request, so a missing/non-string `name` is normal-operation reachable, not a rare edge — but the throw is the defect; its downstream effect compounds with Finding 2 (see Cross-Cutting).

Validation of Finding 6: lines 35/57 annotate `payload: RawRequest`, yet `payload` is `JSON.parse(req.body)` output — the wire body's parsed content, not the `{body, headers}` wrapper. `processAdmin` returns `{data: payload}` typed as a `RawRequest`, which is structurally wrong. The binary: is `RawRequest` simply the wrong annotation for parsed payloads, or is a parsed-vs-wire distinction intended but unmodeled?

### Cross-Cutting Patterns

Findings 1, 3, and 5 share a root cause: no validated typed boundary at `handleRequest`. Untyped `req` (5) lets the unguarded parse (1) and unguarded `validate` deref (3) ship; a single schema-validated parse at entry closes all three. Findings 2 and 3 compound: the line-52 `TypeError` is swallowed by the line-44 catch, so both malformed input and a genuine validation pass return `null` — malformed input becomes indistinguishable from success, making this a data-integrity defect, not a bare crash. Fixing 2 alone surfaces 3's crash; fixing 3 alone still leaves other throws silently swallowed — they must be fixed together.

### Missed surfaces (optional)

Lines 25-30 (`notified` dead branch) and line 57 (`sendAuditLog` no-op stub) are unflagged correctness/maintainability defects adjacent to the scoped findings.

---

**Verdict scope:** scope: api-correctness
