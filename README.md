# Effect · Cloudflare · Foldkit project template

A runnable starter for a new application using TypeScript, Effect 4, Foldkit, Bun, mise, and Alchemy 2 on Cloudflare. It captures the organization, tooling, and engineering guardrails of a working project without carrying over its product.

Configuration and code live at the repository root, ready to install, test, build, and run locally. The starter has a neutral Foldkit counter page, a portable Effect service, `GET /api/health`, and an Alchemy stack with an Access-protected Website and private API Worker. It includes the source's full dependency set, but does not provision D1, Durable Objects, or AI until the new product needs them.

```sh
mise trust && mise install
bun install --frozen-lockfile
bun run typecheck && bun run lint && bun run test && bun run format:check
bun run build
mise run dev
```

Open the Website URL printed by `mise run dev` (not the private API Worker's URL). Access is skipped locally. `GET /api/health` returns `{ "name": "Project starter", "status": "ok" }`; unknown API routes return a JSON 404. There are no mutating API routes or request bodies yet. Native development is local; adding Workers AI later can make real remote calls.

## Included code structure

```text
alchemy.run.ts                   re-exports the platform stack
src/
  app-info/{model,service}.ts     portable Schema and Effect capability
  http/{api,api.test}.ts          routes and HTTP contract tests
  platform/
    boundary.test.ts             guards backend dependency direction
    cloudflare/{stack,api,edge}.ts  resources, private Worker, forwarding edge
  ui/
    entry.ts                     runtime boot
    main.ts                      pure Model, Messages, init, update, view
    styles.css                   neutral light/dark Tailwind theme
    lib/utils.ts                 foldcn class helper
    story.test.ts / scene.test.ts  update and accessible-view tests
    AGENTS.md                    release-specific Foldkit conventions
```

The remaining root files configure Bun, mise, TypeScript/Effect, Vite, lint/format, foldcn, DevTools MCP, and dependency patches. `bunfig.toml` scopes tests to `src/`; the original project relied on Bun defaults and had no separate Bun config.

## Start a different project

1. Use GitHub's **Use this template → Create a new repository**. Choose private visibility explicitly; do not assume it is inherited.
2. Describe the new product and its first use case. Choose domain names, data ownership, identity/authorization requirements, and whether you need D1, Durable Objects, or AI. The original project's single-tenant prototype is not a requirement.
3. Rename `package.json` from `new-project`, the `project-starter` stack in `src/platform/cloudflare/stack.ts`, the health service's app name in `src/platform/cloudflare/api.ts`, and the page title/content in `src/ui/`. Resource names are persisted contracts after deployment, so choose them before the first deploy.
4. Run `mise trust && mise install`, then `bun install --frozen-lockfile`. Commit the resulting project configuration and retain `bun.lock`. Check the [tooling guide](docs/tooling.md) before upgrading the snapshot.
5. Replace the sample domain and counter with the new product's first vertical slice. Preserve platform isolation and runtime boot separation. Add persistence/AI resources and other folders only when they own real behavior.
6. Add the new product's invariants to `AGENTS.md`, replace this README with project setup/API documentation, and run the [verification checks](docs/guardrails.md). Deployment requires a separately configured Cloudflare profile and explicit authorization.

An agent can start with: “Read AGENTS.md and docs/ in this repository. Adapt this starter for an application that does [product description]. Keep the stack and boundaries; do not invent an automation designer or workflow engine. Implement one useful vertical slice and verify it locally. Do not deploy.”

## Deployment requires a new project's choices

Configure an authorized Cloudflare profile (`bun alchemy profile edit --add Cloudflare` or `ALCHEMY_PROFILE`). Review the Access audience in `stack.ts`: the inherited default admits Cloudflare account members and creates a 30-day machine-test service token. Credentials and local state are not included. The API remains private (`workersDev: false`) behind a service binding. Add JWT validation and application authorization before exposing user-specific or mutating operations.

`mise run deploy` targets `prod` and changes shared infrastructure; run it only with explicit authorization. The first deploy may offer to bootstrap Cloudflare-hosted Alchemy state. No automatic deploy workflow is included.

## What to read

| Guide                                       | What it captures                                                           |
| ------------------------------------------- | -------------------------------------------------------------------------- |
| [Organization](docs/organization.md)        | Suggested repository shape and dependency direction                        |
| [Effect architecture](docs/architecture.md) | Domain ownership, services/layers, lifetimes, transactions, compatibility  |
| [Tooling](docs/tooling.md)                  | Version snapshot, config choices, commands, MCP, patches, optional AI      |
| [Cloudflare](docs/cloudflare.md)            | Alchemy 2 phases, private API topology, local state, D1, durable callbacks |
| [Guardrails](docs/guardrails.md)            | Boundaries, security, verification, operational approval rules             |
| [Root agent instructions](AGENTS.md)        | Reusable instructions for implementing the new application                 |
| [UI agent instructions](src/ui/AGENTS.md)   | Foldkit architecture, testing, components, upgrade procedure               |
| [Dependency patches](patches/README.md)     | Known Alchemy/Foldkit DevTools integration fixes                           |

## Provenance and limits

Extracted on 2026-10-08 from the private [automations project](https://github.com/just-be-dev/automations/tree/b7024a19094ee6af342899a3e04520aa9cfe9626). That repository is a reference, not a runtime dependency. All necessary guidance is included here.

All source direct dependencies are included and pinned to the versions resolved in its lockfile, not to today's `latest` tags. AI packages are installed but unused by the starter. Source transitive resolutions are retained. Working starter code is not a claim that a new product is production-ready: authentication, authorization, persistence/recovery, and real integrations need their own verification.

Not copied: automation/workflow/entity business code, stored data, migrations, API-specific schemas, product branding, credentials, `.alchemy/`, `.wrangler/`, build output, source Git history, or machine-specific agent skills.
