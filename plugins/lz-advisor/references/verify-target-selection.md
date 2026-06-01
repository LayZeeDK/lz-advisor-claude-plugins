# Verify Target Selection by Change Surface

This is the single source of truth for choosing the verification command that
actually exercises a change. Both `plan` and `execute`
consume this contract:

- `plan` names the matching command in a plan `**Validate**` step so
  the executor runs the right target.
- `execute` selects and runs the matching target before committing
  (Phase 3.5, rule E.3).

Neither skill duplicates the mapping below -- both reference this file.

## The principle

The verification that matters is the one that exercises the files you changed.
Before choosing a verify command, identify the dominant change surface and run
the target that actually loads it. A unit-test pass is not evidence a config
change is correct -- it exercises the source, not the changed config surface.
When in doubt, run the target whose executor reads the file you edited.

## Surface-to-target mapping

- **Source or library code changed** -> the unit-test or type-check target for
  that code (`nx test`, `jest`, `tsc --noEmit`).
- **Build, bundler, or packaging config changed** (build target options, output
  config, a packaging executor's schema keys) -> the build target (`nx build`,
  `nx build-storybook`, `vite build`, `next build`).
- **Dev-server or tool-runtime config changed** (a Storybook builder option, a
  dev-server target, a serve or watch executor's schema keys) -> the dev-server
  or tool-runtime target itself (`nx storybook`, `nx serve`, `vite dev`), because
  a build-time target and a dev-server target can read the same config through
  different schemas and diverge.
- **Lint or format config changed** -> the lint target.

## Worked examples

**The gap this contract closes:** a change that removed a `browserTarget` key
from a Storybook target verified clean under `nx test` (unit) -- but `nx test`
never invokes the Storybook executor, so a dev-server regression that only
`nx storybook` would surface shipped undetected. The change surface was
Storybook-config; the matching target was `nx storybook` / `build-storybook`,
not `nx test`.

**Correct selection:** a change to a component's `@Input()` signal type verified
under `nx test` -- correct, because the unit-test target compiles and exercises
the component source that changed.

## Tooling freshness (stale-daemon caveat)

A correct target still lies if the tool reading it serves stale state. Build
orchestrators with a persistent daemon or cache (Nx, Turborepo, Gradle,
watch-mode bundlers) can return a result from a cached graph that predates your
change. When you verify a config change through such a tool, ensure the tooling
state is fresh first -- clear the daemon or cache between config-mutating runs
and prefer the workspace-local CLI (for example `npm exec nx --`) over a
globally-installed one. A stale-daemon result is not a verification.
