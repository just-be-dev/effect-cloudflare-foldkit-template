# A versioned setup, not a collection of latest tags

`reference/package.json` pins the source project's resolved direct dependencies as of 2026-10-08. Its `bun.lock` is pruned from the source lockfile, preserving the original transitive resolutions rather than fetching newer compatible ranges. Exact pins intentionally make upgrades a reviewed decision; this snapshot will need maintenance.

| Tool / package group                 | Snapshot                    | Role                                                         |
| ------------------------------------ | --------------------------- | ------------------------------------------------------------ |
| Bun / mise                           | Bun 1.4.2                   | Runtime, package manager, tests, tool/task management        |
| TypeScript                           | 7.0.2                       | Strict native compiler via `tsc --noEmit`                    |
| Effect + browser/Bun platforms       | 4.0.0                       | Schemas, services, errors, concurrency, platform runtime     |
| Effect language service / tsgo patch | 0.87.3 / 0.48.0             | Editor diagnostics and patched native compiler               |
| Alchemy                              | 2.0.0-beta.81               | Effect-native Cloudflare infrastructure and local dev        |
| Foldkit / @foldkit/ui                | 0.165.0                     | Elm-style Effect UI and UI primitives                        |
| Foldkit Vite / DevTools MCP / lint   | 0.26.0 / 0.24.0 / 0.15.1    | Build integration, state inspection, UI architecture rules   |
| Vite                                 | 8.3.2                       | UI dev server/bundler, orchestrated by Alchemy               |
| Tailwind + Vite plugin               | 4.3.3                       | Token-based CSS and Vite integration                         |
| Oxfmt / Oxlint                       | 0.71.0 / 1.86.0             | Formatting and linting                                       |
| Effect Oxlint plugin                 | 0.6.0                       | Selected Effect guardrails                                   |
| Cloudflare types / workerd override  | 5.20261004.1 / 1.20261001.1 | Native host types and source runtime compatibility pin       |
| Optional UI assets                   | See manifest                | Self-hosted Fontsource fonts, Lucide, `cn`, `tw-animate-css` |

The original manifest used ranges or `latest` for some tools, but this reference freezes their resolved versions. Effect 4.0.0 was already installed: do not downgrade it to an RC tag because older setup guides say v4 is pre-release. `prepare: effect-tsgo patch` is inherited. The source's TypeScript 7 package exposes the native compiler as **`tsc`**, so the reference retains that actual executable instead of assuming a `tsgo` command exists. Recheck compiler binaries and patch support when upgrading.

## Config files and their contracts

- `mise.toml`: pins Bun, enables experimental settings and pinning, adds `node_modules/.bin` to PATH, and runs `bun install` after tool installation. Package scripts are the command source of truth; mise tasks call them. Manage tool pins with `mise use bun@<version>`, not hand-written tool entries.
- `package.json`: ESM, private npm package, scripts, exact dependency pins, workerd override, and Bun patch mappings. Keep package scripts and mise tasks aligned.
- `tsconfig.json`: strict checking, `noUncheckedIndexedAccess`, bundler resolution, preserved modules, `verbatimModuleSyntax`, and Effect language-service plugin. Browser/Worker/Bun types support this combined repo; the architectural test still prevents native globals leaking into backend domains.
- Language-service overrides permit `effect/http` only at HTTP/UI-command/platform HTTP boundaries. `effect-oxlint` is the specifically allowed duplicate Effect consumer from lint tooling. Add narrow per-file permissions for other unstable APIs only when used; source workflow/AI-specific exceptions were removed.
- `vite.config.ts`: `foldkit()` + Tailwind plugins, UI entry optimization, `@/` alias, Effect/Foldkit deduplication, and `.alchemy/` watch exclusion. Alchemy layers its Cloudflare integration on top for both dev and deploy. A standalone Vite build checks UI output; it does not provision infrastructure.
- `oxlint.config.ts`: registers Effect and Foldkit plugins, enables three selected Effect error rules globally, and scopes Foldkit's architecture rules to `src/ui/**/*.ts`. It does **not** enable every Effect recommended rule globally.
- `components.json`: foldcn registry and UI aliases for shadcn's copy-paste CLI. It points to `src/ui/styles.css`, which you implement for the new product.
- `.mcp.json`: local `@foldkit/devtools-mcp` process launched with Bun. It inspects a running Foldkit app's Model, Messages, and time travel; it is not a deployed application MCP endpoint. Clients that use Amp settings may need the same entry under `amp.mcpServers` in their settings; do not copy machine-specific settings or trust decisions.
- `public/_headers`: static-asset CSP and `nosniff`. Fonts/scripts are same-origin. It does not configure API response headers.
- `src/ui/AGENTS.md`: generalized Foldkit instructions plus the source's release-specific conventions and upgrade procedure. No source theme/layout is included.
- `src/platform/boundary.test.ts`: the original lightweight backend dependency guard.
- `patches/`: the two source Bun patches, unchanged so their hashes and context remain reproducible; `PATCH(automations)` comments identify provenance, not a dependency on the old app.

Use the workspace TypeScript version in your editor to activate the language-service plugin. Generic Effect Solutions guides remain useful, but their example imports and patch command may differ from the installed Effect 4/native compiler setup.

## Commands after scaffolding

```sh
mise trust && mise install
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run test
bun run format:check
bun run build
mise run dev
```

`mise run format` intentionally rewrites files; `format:check` does not. The template includes mise tasks for all package scripts. `mise run deploy` calls `bun run deploy --stage prod` and changes shared infrastructure; run it only when explicitly authorized, after configuring the new stack/account/stage.

## Known integration patches

Under `alchemy dev`, Cloudflare's Vite upgrade listener interferes with Foldkit's relay on Vite's HTTP server. One patch moves the MCP relay onto its dedicated token-protected loopback listener; the other adds backoff after connections that immediately close. Both are required by this source setup and included with rationale in [patches/README.md](../reference/patches/README.md).

Use `bun patch <package>` and `bun patch --commit node_modules/<package>` for future edits. Document the symptom, cause, fix, and upstream removal criteria. On an upgrade, determine whether each patch is still needed and run a browser-connected DevTools session under `alchemy dev`; a successful install alone does not verify relay stability. Do not expose the relay or configure an unauthenticated fixed port casually.

The source's workerd override is retained as a compatibility pin, not an assertion that every new Alchemy release needs it. Re-evaluate it together with Alchemy upgrades.

## Optional AI and durable workflow dependencies

The original product also resolved `@earendil-works/pi-ai@1.0.2`, `@earendil-works/pi-durable@1.0.2`, and `agents@0.26.0`. They are **not** in the default manifest because a different app may need none of them. If required, install reviewed compatible versions deliberately.

Define a portable AI/conversation capability in its owning domain; implement Workers AI/pi in `src/platform/cloudflare/`. Wrap Promise calls with `Effect.tryPromise`, decode model output with Schema, and keep prompting, persistence, and retry policies explicit. The source deliberately keeps pi rather than replacing it with Effect AI; that is a product integration choice, not a requirement to install two AI frameworks.

Do not import a harness that loads `cloudflare:*` at top level through Alchemy's Bun plan-time path. Local dev can still use paid remote AI. Reuse idempotency/request IDs across replay where supported, and verify real model calls separately from scripted tests.

Machine-local agent skills such as Effect setup, mise setup, or Linux desktop customization are not project dependencies and are not copied. Essential project guidance is written in the repo so another machine or agent can use it without those skills.
