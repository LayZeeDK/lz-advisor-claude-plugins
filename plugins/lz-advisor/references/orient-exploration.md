# Orient Exploration: Pattern D -- Question-Class Ranking

Pattern D refines the standard `<orient_exploration_ranking>` block by
answering one question: which orient source do I read FIRST? The answer
depends on the kind of question being asked. Four classes cover the
cases the executor encounters in practice. The local-`.d.ts`-first
heuristic is the right first action for type-symbol existence
questions; for the other three classes, `.d.ts` is the wrong first
source because it cannot show what was removed, what is currently
recommended, or how the language itself behaves.

When a question fits more than one class, prefer the web-first class.
When no class fits cleanly, name the gap in the consultation Findings
section per the standard ranking step 5 and proceed.

## Class 1: Type-symbol existence

When the question is about whether a specific exported symbol, type, or
interface exists in the typed contract for the installed package
version, the first orient action is to read the local `.d.ts` file
under `node_modules/<package>/`. The `.d.ts` is the typed contract for
the exact installed version, which makes it more authoritative than
docs that may lag behind a release.

`WebFetch` and `WebSearch` corroborate the answer; they do not replace it.

Example. Question: "Is the `DocsOptions` type still exported from `@storybook/angular` in Storybook 10.3.5?" Class: type-symbol existence. First action: read `node_modules/@storybook/angular/dist/index.d.ts` and the package's `exports` map.

## Class 2: API currency / configuration / recommended pattern

When the question is about documented behavior, recommended
configuration, or current best practice for an integration, the first
orient action is to locate the vendor's current docs page and read it.
Run `WebSearch` with the library name, the installed version, and the
specific symbol or topic, then `WebFetch` the top result. Vendor docs
URLs are not stable across releases, so search discovers the current
canonical URL rather than guessing it. The library's current-version
docs, GitHub README, and migration guides are the contracts the
maintainers publish; local files show what is installed, not what the
library currently recommends.

Local reads (`project.json`, `package.json`, `.storybook/main.ts`,
`src/**`) and `.d.ts` corroborate the web answer; they do not replace it.

Example. Question: "What is the current recommended approach for Storybook docs configuration in an Nx Angular library?" Class: API currency. First action: `WebSearch` for `Storybook Angular docs configuration`, then `WebFetch` the top result. Corroborate with `Read` of the installed `@storybook/angular` `package.json` exports.

Example. Question: "How should the Nx Compodoc generator be configured for current Storybook?" Class: API currency. First action: `WebSearch` for `Nx Compodoc Storybook generator`, then `WebFetch` the top Nx-hosted result. Corroborate with `Read` of `nx.json` and the workspace's project graph.

### Class 2-S: Security currency (sub-pattern of Class 2)

When the question is whether a third-party dependency has known
vulnerabilities, security advisories, or CVE entries, the first orient
action is `npm audit --json` (local, fast; runs against
`package-lock.json` directly; produces structured output with severity
levels critical / high / moderate / low). Fallback ordering: `WebFetch
https://github.com/advisories?query=<package>` for advisory text and
GHSA-* IDs; `WebSearch "<package> CVE <year>"` as a third-line check
for NVD entries not mirrored to GitHub Advisories.

Synthesize a `<pre_verified source="npm audit --json"
claim_id="pv-no-known-cves-N">` block (no-CVE outcome) or
`<pre_verified source="..." claim_id="pv-cve-list-N">` block (CVE-list
outcome with affected version range). Use the pv-* anchor to ground
the supply-chain finding's severity in the consultation prompt; without
this anchor, the severity assertion is theoretical, not empirical.

This sub-pattern fires only inside `lz-advisor.security-review` for
findings on third-party dependencies. Other skills' security-adjacent
questions remain Class 2 (vendor-doc) or Class 1 (type-symbol existence).

Example. Question: "Are there known CVEs in `@compodoc/compodoc@1.2.1`
or its transitive deps?" Class: 2-S. First action: `npm audit --json`.
Output: `{"metadata": {"vulnerabilities": {"info":0, "low":0,
"moderate":0, "high":0, "critical":0, "total":0}}}` -- zero advisories
for the installed version. Optional second action: `WebFetch
https://github.com/advisories?query=@compodoc/compodoc` to confirm the
empty result against GitHub's Security Advisories index. Synthesize a
`<pre_verified source="npm audit --json" claim_id="pv-no-known-cves-1">`
block anchoring Finding 2's severity. Without this empirical anchor,
the supply-chain risk assertion remains "unpinned package" pattern
alone, not vulnerability-grounded.

## Class 3: Migration / deprecation

When the question is about whether a symbol was removed, deprecated, or
replaced between versions, the first orient action is to locate the
relevant release notes or migration guide and read it. Run `WebSearch`
with the library name, the symbol, and the version range or change
keyword (e.g. `removed`, `deprecated`, `migration`), then `WebFetch` the
top result. The `CHANGELOG.md`, GitHub releases, and migration-guide
pages decide what was removed; their URLs change with each release, so
search discovers the current location rather than guessing it. `.d.ts`
shows the current shape but cannot show what used to be there.

`.d.ts` and `node_modules` corroborate the migration answer and provide
negative evidence when a symbol named in old docs is absent from the
current types.

Example. Question: "Is `setCompodocJson` still exported from `@storybook/addon-docs/angular`?" Class: migration / deprecation. First action: `WebSearch` for `setCompodocJson Storybook removed`, then `WebFetch` the top result (likely the migration guide or a v10 release page). Corroborate with `rg setCompodocJson node_modules/@storybook/` to confirm the symbol's current absence.

Example. Question: "Was the Nx Compodoc generator deprecated in a recent Nx release?" Class: migration / deprecation. First action: `WebSearch` for `Nx Compodoc generator deprecated`, then `WebFetch` the top result (Nx release notes or migration page). Corroborate with `Read` of the workspace's `nx.json` and `package.json`.

## Class 4: Language semantics

When the question is about how the language itself behaves at compile
time or runtime, independent of any specific library, the first orient
action is one of two paths. The empirical path: build a minimal example
that triggers the rule and observe the compiler or runtime output
(`tsc --noEmit`, `node`, `deno run`). The spec path: `WebSearch` for the
language name plus the construct (e.g. `TypeScript dynamic import type`,
`ECMAScript optional chaining`), then `WebFetch` the top spec or
handbook result. The spec and the compiler decide language semantics,
not archaeology in `node_modules`.

Library `.d.ts` files reflect language semantics but do not define them.

Example. Question: "How does TypeScript treat `import()` at compile time when the imported module is a type-only export?" Class: language semantics. First action: an empirical `tsc --noEmit` against a minimal example, or `WebSearch` for `TypeScript dynamic import type-only` followed by `WebFetch` of the top handbook result.

## Closing Note

The four classes are exhaustive in practice. Multi-class questions
prefer the web-first class so that the gap behavior surfaces.
Uncategorizable questions fall through to the standard ranking step 5
(name the gap in the consultation Findings section and proceed). For
the cross-cutting packaging contract on pre-verified claims, see
`references/context-packaging.md` Rule 5.

## Cross-Skill Hedge Tracking

When a skill is invoked with input from another skill -- review file passed to plan-skill, plan file passed to execute-skill, commit range plus prior plan/review passed to security-review -- the upstream output may contain verify-first markers that the upstream skill placed deliberately. Sentinel patterns: `\b(unverified)\b`, `\bverify .+ before acting\b`, `\bAssuming .+ \(unverified\)\b`, `\bconfirm .+ before\b`, `\bfall back to .+ if .+\b`. These markers signal that the upstream skill could not resolve the hedged claim within its own scope and is asking the downstream skill (or the user) to either verify or carry the hedge forward.

The downstream skill MUST NOT strip these markers silently. Stripping is the laundering pathway documented in the 7-hop confidence-laundering chain (Finding C hop 3): an upstream review's "Assuming X (unverified) ... Verify Y before acting" gets repackaged as "X" without the hedge by the downstream plan-fixes executor; the plan output asserts X as established fact; downstream execute and security-review propagate X with no verification anchor.

### Tracking rule

For every input artifact in the workflow context (file path supplied via @ mention, file referenced in the user prompt, prior consultation output cited in the source material), the executor MUST scan for sentinel patterns at the start of the orient phase. For each surviving marker, the executor takes ONE action per `references/context-packaging.md` Common Contract Rule 5c:

- (a) Resolve empirically and synthesize a `<pre_verified>` block citing the verification source.
- (b) Carry the marker verbatim into the consultation prompt's `## Source Material` section -- never under `## Pre-Verified Package Behavior Claims`.

### Workflow-level note

This rule applies WITHIN one user-driven workflow (a sequence of skill invocations on the same task). Across separate user invocations, the user may paste prior output manually, in which case the prior content is treated like any other source material and Rule 5c applies. The cross-skill propagation contract does not require persistent state -- it operates on the input artifacts the executor can see in its current invocation.

### Multi-skill chain example

A typical 4-skill workflow surfaces a hedge that must propagate intact:

1. `/lz-advisor.review` flags Finding 4 with hedge: "Assuming `continuous: true` disables caching for this target (unverified against the installed Nx version), the practical impact is limited."
2. User invokes `/lz-advisor.plan @review-output.md` to plan fixes. The plan-skill orient phase scans `review-output.md` for sentinels; the marker survives. Per Rule 5c, the marker either gets resolved (Read Nx docs / package.json + synthesize pv-* block) OR carries verbatim into the plan-skill consultation source material.
3. The plan output preserves the marker in the plan-file's `## Findings Disposition` section (per Plan 07-02 silent-resolve fix) AND -- if unresolved -- in the plan rationale.
4. User invokes `/lz-advisor.execute @plan-output.md` to apply fixes. The execute-skill orient phase scans `plan-output.md` for sentinels; the marker survives. Per Rule 5c + Plan 07-02 `<verify_before_commit>` block, the marker either triggers verification before commit OR carries forward into a `wip:` commit + `## Outstanding Verification` section.

The marker survives all 4 hops or gets resolved at the first hop where empirical verification is available. The chain breaks only when stripping occurs without verification -- the failure mode this rule prohibits.

For the agent-side counterpart (advisor / reviewer / security-reviewer flag unresolved hedges with the literal `Unresolved hedge:` frame), see `agents/{advisor,reviewer,security-reviewer}.md` `## Hedge Marker Discipline` section.
