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
orient action is `WebFetch` of the official source. The library's
homepage, GitHub README, current-version docs, and migration guides
are the contracts the maintainers publish; local files show what is
installed, not what the library currently recommends.

Local reads (`project.json`, `package.json`, `.storybook/main.ts`,
`src/**`) and `.d.ts` corroborate the web answer; they do not replace it.

Example. Question: "What is the current recommended approach for Storybook 10.x docs configuration in an Nx Angular library?" Class: API currency. First action: `WebFetch` of `https://storybook.js.org/docs/configure` or the matching 10.x docs URL.

Example. Question: "How should the Nx Compodoc generator be configured for 2026-Q1 Storybook?" Class: API currency. First action: `WebFetch` of the Nx docs page for the Compodoc generator at the current Nx version.

## Class 3: Migration / deprecation

When the question is about whether a symbol was removed, deprecated, or
replaced between versions, the first orient action is `WebFetch` of the
release notes or the migration guide. The `CHANGELOG.md`, GitHub
releases, and migration-guide pages decide what was removed; `.d.ts`
shows the current shape but cannot show what used to be there.

`.d.ts` and `node_modules` corroborate the migration answer and provide
negative evidence when a symbol named in old docs is absent from the
current types.

Example. Question: "Is `setCompodocJson` still exported from `@storybook/addon-docs/angular` in Storybook 10.3.5?" Class: migration / deprecation. First action: `WebFetch` Storybook 10.x release notes at `https://github.com/storybookjs/storybook/releases` and the Storybook 9 to 10 migration guide.

Example. Question: "Was the Nx Compodoc generator deprecated between Nx 19 and Nx 20?" Class: migration / deprecation. First action: `WebFetch` of the Nx release notes and migration-guide pages for the current Nx version.

## Class 4: Language semantics

When the question is about how the language itself behaves at compile
time or runtime, independent of any specific library, the first orient
action is an empirical compile or run (build the example, observe the
error) or a `WebFetch` of the language spec. The spec and the compiler
decide language semantics, not archaeology in `node_modules`.

Library `.d.ts` files reflect language semantics but do not define them.

Example. Question: "How does TypeScript treat `import()` at compile time when the imported module is a type-only export?" Class: language semantics. First action: an empirical `tsc --noEmit` against a minimal example, or `WebFetch` of the TypeScript handbook page on dynamic imports.

## Closing Note

The four classes are exhaustive in practice. Multi-class questions
prefer the web-first class so that the gap behavior surfaces.
Uncategorizable questions fall through to the standard ranking step 5
(name the gap in the consultation Findings section and proceed). For
the cross-cutting packaging contract on pre-verified claims, see
`references/context-packaging.md` Rule 5.
