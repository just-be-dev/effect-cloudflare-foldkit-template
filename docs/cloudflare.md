# Alchemy declares resources; Cloudflare hosts implementations

Use Alchemy **2** (`2.0.0-beta.81` in the snapshot), not the v1 `await alchemy(...)` API. The stack is an Effect program. A root `alchemy.run.ts` re-exports the resources/types and default Stack from `src/platform/cloudflare/stack.ts`.

## Keep the API private

```text
Browser / machine client
          │
          ▼
Cloudflare Access (deployed stages)
          │
          ▼
Website.Foldkit ── static assets
          │ /api/*, runWorkerFirst
          ▼
edge.ts ── service binding ── private Api Worker
                                      │
                                      ├── domain services
                                      ├── optional D1 adapters
                                      └── optional Durable Objects / AI
```

Declare the website with `Cloudflare.Website.Foldkit`, the private API with `Cloudflare.Worker`, and `env: { API: Api }` on the website. Set `assets.runWorkerFirst: ["/api/*"]` and the API's `workersDev: false`; do not add public API routes. Infer edge environment types with `Cloudflare.InferEnv<typeof Website>`. The edge only forwards to the binding; HTTP routing and business work belong elsewhere.

The source uses compatibility date `2026-10-04` on its Workers/Website. Choose and test a date deliberately for the new project. Do not silently rely on a changed default.

## Respect plan-time versus runtime

Worker and Durable Object declarations have two phases:

| Phase                                | Allowed work                                                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Outer Effect: plan time / cold start | Binding declarations, namespaces, resource selection, layer construction                                     |
| Returned handler / instance Effect   | Storage operations, raw AI binding access, durable callbacks, request headers, runtime-bound service methods |

Plan time runs under Bun and imports everything reached from `alchemy.run.ts`. A top-level module that loads `cloudflare:*` breaks that path. Acquire native capabilities in the appropriate runtime instead.

D1 adapters may acquire their database binding in the outer Effect and return a layer that requires `Alchemy.RuntimeContext`. Provide that layer per request or instance, where the context exists. Service methods capture that context so callers use portable capabilities without supplying native runtime requirements.

## Local and deployed state are different

`alchemy dev` uses stage `dev_$USER`, local Workers/DO/D1 data, and dev-mode Access bypass. Select `Alchemy.localState()` for dev and `Cloudflare.state()` for deployed stages using `Alchemy.ALCHEMY_DEV`. Local resource state must live beside the checkout's local database: shared deployment state can otherwise claim a migration was applied to a newly empty worktree database.

Run `mise run dev` only after implementing the stack. Use the Website URL it prints; do not assume a fixed port. Workers AI, if selected, still makes real remote requests and needs credentials even in local dev.

Configure a Cloudflare Alchemy profile for the new app with `bun alchemy profile edit --add Cloudflare`, or select an existing authorized profile via `ALCHEMY_PROFILE`. Never copy credentials/state from the source project. Deploys may offer to bootstrap Alchemy's Cloudflare-hosted state store; this changes shared infrastructure and needs authorization.

## Identity needs explicit authorization policy

The source deployed Website admits Cloudflare account members and an optional 30-day Access service token. Treat that as a single-tenant prototype policy, not a universal default. Configure the new audience deliberately. Machine tokens do not necessarily identify a person; dev requests may have no email.

Translate Access identity into a platform-independent, request-scoped service. Validate Access JWTs and their expected audience before relying on identity in production. Do not copy the prototype's “missing identity can approve” behavior. Authentication at the website and authorization of each application operation are different responsibilities.

The static CSP file applies to asset responses. Define any required security headers for Worker-generated API responses separately. Dev-server requirements are not grounds to loosen deployed CSP.

## Persistence and durable work are optional

- D1: declare `Cloudflare.D1.Database` with `migrations: "./migrations"`. Alchemy tracks applied migrations by hash in `__alchemy_migrations`; add new numbered files instead of editing applied ones. Start with the new product's schema, not the source seed data.
- Durable Objects: use them when instance-local storage, coordination, or durable callbacks are actually needed. Keep native hosts thin and delegate business operations to domain code.
- `Alchemy.makeCallback` delivers at least once. Callback names/payloads, schedule keys, storage keys, and replay journal names become persisted contracts. Make callbacks idempotent before shipping.
- If state writes and scheduling must be atomic, expose one host capability that guarantees their shared transaction and prove it on the native implementation. Separate D1/DO stores cannot share that transaction.
- Deterministic replay must rebuild working values from its authoritative journal; network effects belong in journaled Activities. Do not add a replay engine merely because the source project had one.

## Authoritative references

- [Alchemy documentation index](https://alchemy.run/llms.txt); append `.md` to documentation page URLs.
- Installed `node_modules/alchemy/src`: final reference for this pinned beta.
- [Cloudflare Workers](https://developers.cloudflare.com/workers/), [Durable Objects](https://developers.cloudflare.com/durable-objects/), [D1](https://developers.cloudflare.com/d1/), and [Access](https://developers.cloudflare.com/cloudflare-one/access-controls/).
