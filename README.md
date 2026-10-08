# Effect · Cloudflare · Foldkit project template

A documentation-first blueprint for a new application using TypeScript, Effect 4, Foldkit, Bun, mise, and Alchemy 2 on Cloudflare. It captures the organization, tooling, and engineering guardrails of a working project without carrying over its product.

**This is not a runnable starter app.** `reference/` contains reusable configuration, agent instructions, an architectural boundary test, and dependency patches. There is deliberately no application, infrastructure stack, UI theme, seed data, or deployment workflow. `dev`, `build`, and `deploy` become usable only after you implement the entry points described below.

## Start a different project

1. Use GitHub's **Use this template → Create a new repository**. Choose private visibility explicitly; do not assume it is inherited.
2. Describe the new product and its first use case. Choose domain names, data ownership, identity/authorization requirements, and whether you need D1, Durable Objects, or AI. The original project's single-tenant prototype is not a requirement.
3. Move the **contents** of `reference/` to the repository root, including `.mcp.json`. Keep the root `AGENTS.md` and `docs/`; update their `reference/` paths/links to the new locations. Rename `package.json` from `new-project`; name the Alchemy stack and resources for the new project. Remove `reference/` after moving it.
4. Run `mise trust && mise install`, then `bun install --frozen-lockfile`. Commit the resulting project configuration and retain `bun.lock`. Check the [tooling guide](docs/tooling.md) before upgrading the snapshot.
5. Implement a minimal domain, platform-independent HTTP route, Cloudflare host, and Foldkit page. Add `alchemy.run.ts`, `src/platform/cloudflare/{stack,api,edge}.ts`, `index.html`, `src/ui/entry.ts`, and `src/ui/styles.css`. Create other folders only when they own real behavior.
6. Add the new product's invariants to `AGENTS.md`, replace this README with project setup/API documentation, and run the [verification checks](docs/guardrails.md). Deployment requires a separately configured Cloudflare profile and explicit authorization.

An agent can start with: “Read AGENTS.md and docs/ in this repository. Use the reference setup for a new application that does [product description]. Keep the stack and boundaries; do not invent an automation designer or workflow engine. Implement one useful vertical slice and verify it locally. Do not deploy.”

## What to read

| Guide                                               | What it captures                                                           |
| --------------------------------------------------- | -------------------------------------------------------------------------- |
| [Organization](docs/organization.md)                | Suggested repository shape and dependency direction                        |
| [Effect architecture](docs/architecture.md)         | Domain ownership, services/layers, lifetimes, transactions, compatibility  |
| [Tooling](docs/tooling.md)                          | Version snapshot, config choices, commands, MCP, patches, optional AI      |
| [Cloudflare](docs/cloudflare.md)                    | Alchemy 2 phases, private API topology, local state, D1, durable callbacks |
| [Guardrails](docs/guardrails.md)                    | Boundaries, security, verification, operational approval rules             |
| [Root agent instructions](AGENTS.md)                | Reusable instructions for implementing the new application                 |
| [UI agent instructions](reference/src/ui/AGENTS.md) | Foldkit architecture, testing, components, upgrade procedure               |
| [Dependency patches](reference/patches/README.md)   | Known Alchemy/Foldkit DevTools integration fixes                           |

## Provenance and limits

Extracted on 2026-10-08 from the private [automations project](https://github.com/just-be-dev/automations/tree/b7024a19094ee6af342899a3e04520aa9cfe9626). That repository is a reference, not a runtime dependency. All necessary guidance is included here.

Core direct dependencies are pinned to the versions resolved in that project's lockfile, not to today's `latest` tags. AI dependencies are documented as optional. Bun pruned the source lockfile for this smaller dependency set while preserving its resolved versions. Copied configuration is not a claim that a new app is production-ready: native integrations, authentication, authorization, recovery, and UI rendering must be verified in the new project.

Not copied: automation/workflow/entity business code, stored data, migrations, API-specific schemas, product branding, credentials, `.alchemy/`, `.wrangler/`, build output, source Git history, or machine-specific agent skills.
