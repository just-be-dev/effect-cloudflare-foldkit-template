# Tooling

Every dependency in `package.json` is pinned to an exact version, and `bun.lock` locks the rest of the tree. Upgrades are deliberate.

| Tool / package group                 | Role                                                       |
| ------------------------------------ | ---------------------------------------------------------- |
| Bun / mise                           | Runtime, package manager, tests, tools and tasks           |
| TypeScript 7                         | Strict native compiler via `tsc --noEmit`                  |
| Effect 4 + browser/Bun platforms     | Schemas, services, errors, concurrency, platform runtime   |
| Effect language service / tsgo patch | Editor diagnostics and the patched native compiler         |
| Alchemy v2                           | Effect-native Cloudflare infrastructure and local dev      |
| Foldkit / @foldkit/ui                | Elm-style Effect UI and UI primitives                      |
| Foldkit Vite / DevTools MCP / lint   | Build integration, state inspection, UI architecture rules |
| Vite                                 | UI dev server and bundler, run by Alchemy                  |
| Tailwind v4 + Vite plugin            | Token-based CSS                                            |
| Oxfmt / Oxlint                       | Formatting and linting                                     |
| Effect Oxlint plugin                 | Effect lint rules                                          |
| Cloudflare types / workerd override  | Worker types and a pinned workerd                          |
| UI assets                            | Fontsource fonts, Lucide, `cn`, `tw-animate-css`           |

Effect 4 is a stable release; older guides that call it a pre-release are out of date. TypeScript 7 ships its native compiler as `tsc`, and the `prepare` script runs `effect-tsgo patch` on it. Check both when upgrading.

## Config files

- `mise.toml`: pins Bun, turns on experimental settings and pinning, adds `node_modules/.bin` to PATH, and runs `bun install` after tools install. Each package script has a matching mise task. Change tool versions with `mise use bun@<version>`.
- `bunfig.toml`: limits test discovery to `./src`.
- `package.json`: ESM, `private: true`, scripts, exact pins, the workerd override, and Bun patch mappings.
- `tsconfig.json`: strict mode, `noUncheckedIndexedAccess`, bundler resolution, preserved modules, `verbatimModuleSyntax`, and the Effect language-service plugin. Browser, Worker, and Bun types are all loaded; the boundary test keeps native globals out of backend domains.
- Language-service overrides allow the unstable `effect/http` module only in HTTP, UI command, and platform API files. `effect-oxlint` is allowed as a duplicate Effect consumer. Add narrow per-file exceptions for other unstable APIs as you use them.
- `vite.config.ts`: the `foldkit()` and Tailwind plugins, UI entry optimization, the `@/` alias, Effect/Foldkit deduplication, and a watch exclusion for `.alchemy/`. Alchemy adds its Cloudflare integration on top for dev and deploy. `bun run build` checks the UI bundle locally.
- `oxlint.config.ts`: loads the Effect and Foldkit plugins, turns on three Effect error rules everywhere, and applies Foldkit's architecture rules to `src/ui/**/*.ts`.
- `components.json`: foldcn registry and UI aliases for the shadcn CLI, pointing at `src/ui/styles.css`.
- `.mcp.json` and `.amp/settings.json`: run the `@foldkit/devtools-mcp` server with Bun. Amp reads `amp.mcpServers`; other clients read `.mcp.json`. The tools inspect a running app's Model and Messages and support time travel during local development.
- `public/_headers`: CSP and `nosniff` for static assets. Fonts and scripts are same-origin.
- `src/ui/AGENTS.md`: Foldkit conventions for this release and the steps to refresh them after an upgrade.
- `src/platform/boundary.test.ts`: the backend dependency-direction check.
- `patches/`: two Bun patches for the Foldkit DevTools relay, documented in `patches/README.md`.

Point your editor at the workspace TypeScript version so the language-service plugin loads. Effect Solutions guides are useful, but check their imports and patch commands against the installed Effect 4 and native compiler.

## Commands

Run these from the repo root:

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

`mise run format` rewrites files; `format:check` only reports. `mise run deploy` runs `bun run deploy --stage prod` and changes shared infrastructure, so only run it with approval and after setting up your own stack, account, and stage.

## Patches

Under `alchemy dev`, Cloudflare's Vite upgrade listener interferes with Foldkit's DevTools relay on Vite's HTTP server. One patch moves the relay to its own token-protected loopback listener. The other adds backoff when a connection closes right after opening. See [patches/README.md](../patches/README.md).

Edit patches with `bun patch <package>` and `bun patch --commit node_modules/<package>`, and document the symptom, cause, fix, and when to remove it. After an upgrade, check whether each patch is still needed and run a browser-connected DevTools session under `alchemy dev`; a clean install doesn't prove the relay is stable. Keep the relay on loopback with its token.

Revisit the workerd override whenever you upgrade Alchemy.

## AI and durable workflows

`@earendil-works/pi-ai`, `@earendil-works/pi-durable`, and `agents` are installed and ready to use. Remove them if the product doesn't need AI or durable workflows.

Define the AI or conversation capability in its owning domain and implement it with Workers AI or pi in `src/platform/cloudflare/`. Wrap Promise calls in `Effect.tryPromise`, decode model output with Schema, and make prompting, persistence, and retry policies explicit.

Never import a harness that loads `cloudflare:*` at the top level from a path Alchemy's Bun plan step reaches. Local dev can still call paid remote AI. Reuse idempotency or request IDs across replays where the API supports it, and verify real model calls separately from scripted tests.
