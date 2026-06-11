No `<verify_request>` blocks in the reviewer's response. Rendering the final output.

---

## Review Summary

Reviewed: `review-src/handler.ts` -- TypeScript request handler module with JSON parsing, admin/user routing, and payload validation.

---

### Critical

1. review-src/handler.ts:17: `JSON.parse(req.body)` uncaught; malformed body throws SyntaxError crashing every request path. Wrap in try/catch, return 400-shaped error.
6. review-src/handler.ts:32: `validate` does `data.name.trim()` with no guard; a user payload missing `name` throws TypeError on every well-formed-JSON request. Guard `typeof data.name === 'string'`.

### Important

2. review-src/handler.ts:42-46: catch returns `null`, indistinguishable from valid `null` result; caller cannot detect suppressed errors. Return discriminated `{ok:false,error}` or rethrow.
3. review-src/handler.ts:13: `handleRequest(req)` untyped param + return; `RawRequest` defined but unused, so callers escape type-checking. Annotate `req: RawRequest`, add return type.

### Suggestions

4. review-src/handler.ts:27-30: `notified` is `false` and never reassigned; `sendAuditLog` is dead. Wire the trigger or remove the block and stub.
5. review-src/handler.ts:21: braceless `if` body violates project brace rule; later second-statement insert silently changes flow. Add `{ }`.

### Questions

7. review-src/handler.ts:9: `processAdmin` receives the parsed `payload` typed `RawRequest`, but the parse output is arbitrary JSON, not a `RawRequest`. Is `RawRequest` the wrong type for parsed bodies, or is the parse-vs-wire-object distinction intentional? The annotation on `processAdmin`/`sendAuditLog` claims the post-parse object has `body`/`headers`, which it does not.

---

### Cross-Cutting Patterns

Root cause across 1, 6, and 2: the module trusts unvalidated input at every boundary and has no error contract. Parse (1), field access (6), and validation (2) all assume well-formed input; the lone catch (2) then converts the one place that could surface a problem into a silent `null`. Findings 1 and 6 are the same untrusted-input class one layer apart -- a single schema-validation step at entry (e.g. parse-then-validate-shape) closes both and gives Finding 2 a real error to propagate. Finding 3's missing types are why 6 was invisible: an annotated `payload` shape would have flagged `data.name` access at compile time. Findings 4 and 5 are independent local cleanups.

**Missed surfaces (optional):** `validate` (line 31) and the `processUser` payload param are also untyped, same root as Finding 3; annotating them would surface Finding 6 at compile time.

---

**Verdict scope:** scope: api-correctness
