# Alchemy declares resources; Cloudflare hosts implementations

Use Alchemy **2** (`2.0.0-beta.81` in the snapshot), not the v1 `await alchemy(...)` API. The stack is an Effect program. A root `alchemy.run.ts` re-exports the resources/types and default Stack from `src/platform/cloudflare/stack.ts`.

## Keep the API private

```text
Browser / machine client
          │
          ▼
Public Website.Foldkit ── static assets
          │ /api/*, runWorkerFirst
          ▼
edge.ts ── service binding ── private Api Worker
                                      │
                                      ├── domain services
                                      ├── optional D1 adapters
                                      └── optional Durable Objects / AI
```

Declare the website with `Cloudflare.Website.Foldkit`, the private API with `Cloudflare.Worker`, and `env: { API: Api }` on the website. Set `assets.runWorkerFirst: ["/api/*"]` and the API's `workersDev: false`; do not add public API routes. Infer edge environment types with `Cloudflare.InferEnv<typeof Website>`. The edge only forwards to the binding; HTTP routing and business work belong elsewhere.

No Cloudflare Access policy or service token is declared. The Website and its forwarded `/api/*` routes are public. A private API Worker prevents direct invocation through workers.dev; it does not authenticate requests forwarded by the Website.

The source uses compatibility date `2026-10-04` on its Workers/Website. Choose and test a date deliberately for the new project. Do not silently rely on a changed default.

## Native telemetry includes Effect spans

`stack.ts` explicitly enables persisted invocation logs and native traces on the Website. `api.ts` enables persisted invocation logs and provides `Cloudflare.Telemetry({ headSamplingRate: 1, persist: true })` on its outer Effect. This layer contributes the API's trace configuration at plan time and builds a fresh native Effect tracer per invocation. Keep it on the host, not on domain services or a cached cross-request runtime.

Enabling `observability.traces` alone records platform spans but does not export Effect spans. The Telemetry layer mirrors `Api.request`, future `Effect.withSpan`, and named `Effect.fn` spans into Cloudflare's native waterfall alongside supported platform operations such as fetch and D1. It requires a compatibility date of at least `2026-07-28`; the starter's `2026-10-04` is sufficient. There is no external collector, export credential, or browser analytics script.

Logs and traces use sampling rate `1` (100%) and dashboard persistence. Tune the Website's logs/traces, the API's logs, and its Telemetry layer together for production volume and cost. Do not explicitly disable the API's `observability.traces`: an explicit trace configuration takes precedence over the layer's contributed configuration.

After an authorized deploy, request `/api/health`, then inspect each deployed Worker under **Workers & Pages → Observability**. Confirm an API invocation and an `Api.request` span; local tests cannot prove Cloudflare dashboard ingestion. Requests served entirely as static assets do not invoke the edge handler. Native tracing forwards scalar span attributes and records Effect completion; span events, links, and non-scalar attributes are not mirrored.

Never log secrets, authentication headers, request/response bodies, or arbitrary entity data. Prefer stable operation names and non-sensitive attributes. Review Cloudflare's collected request metadata and retention before handling personal data.

## Respect plan-time versus runtime

Worker and Durable Object declarations have two phases:

| Phase                                | Allowed work                                                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Outer Effect: plan time / cold start | Binding declarations, namespaces, resource selection, layer construction                                     |
| Returned handler / instance Effect   | Storage operations, raw AI binding access, durable callbacks, request headers, runtime-bound service methods |

Plan time runs under Bun and imports everything reached from `alchemy.run.ts`. A top-level module that loads `cloudflare:*` breaks that path. Acquire native capabilities in the appropriate runtime instead.

D1 adapters may acquire their database binding in the outer Effect and return a layer that requires `Alchemy.RuntimeContext`. Provide that layer per request or instance, where the context exists. Service methods capture that context so callers use portable capabilities without supplying native runtime requirements.

## Local and deployed state are different

`alchemy dev` uses stage `dev_$USER` and local Workers/DO/D1 data. Select `Alchemy.localState()` for dev and `Cloudflare.state()` for deployed stages using `Alchemy.ALCHEMY_DEV`. Local resource state must live beside the checkout's local database: shared deployment state can otherwise claim a migration was applied to a newly empty worktree database.

Run `mise run dev` from the root to start the included stack. Use the Website URL it prints; do not assume a fixed port. The starter provisions only a local Website and API Worker. Workers AI, if added, still makes real remote requests and needs credentials even in local dev.

Configure a Cloudflare Alchemy profile for the new app with `bun alchemy profile edit --add Cloudflare`, or select an existing authorized profile via `ALCHEMY_PROFILE`. Never copy credentials/state from the source project. Deploys may offer to bootstrap Alchemy's Cloudflare-hosted state store; this changes shared infrastructure and needs authorization.

## Identity needs explicit authorization policy

The starter has no authentication or authorization requirement for its public health endpoint. Do not assume forwarded requests carry a verified identity, or introduce Cloudflare Access as an inherited default. Choose the new product's authentication scheme when it needs protected data or operations.

Translate verified identity into a platform-independent, request-scoped service and enforce authorization inside application operations. Do not copy the prototype's “missing identity can approve” behavior. Authenticating a person and authorizing each operation are different responsibilities.

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
- [Cloudflare Workers](https://developers.cloudflare.com/workers/), [Workers Observability](https://developers.cloudflare.com/workers/observability/), [Durable Objects](https://developers.cloudflare.com/durable-objects/), and [D1](https://developers.cloudflare.com/d1/).
