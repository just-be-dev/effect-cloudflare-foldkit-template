# Organize by ownership, not framework category

The starter implements this shape with `src/app-info/`, `src/http/`, `src/platform/cloudflare/`, and `src/ui/`. The reusable principle is a domain-oriented backend, a platform adapter boundary, and an independently organized Foldkit frontend. The larger shape below is guidance for growth: placeholder names are not folders you must create up front.

```text
alchemy.run.ts                     thin re-export of the platform stack
src/
  <domain>/
    model.ts                       Schema models, IDs, validation, errors
    service.ts                     capability contract where one is needed
    application.ts                 complete use cases and composition
    store.ts                       shared persistence rules + memory implementation
    *.test.ts                      domain and application tests
  http/
    api.ts                         platform-independent route composition
    <domain>.ts                    request/response adapters
    identity.ts                    platform-independent request identity contract
    response.ts                    shared decoding/error response policy
  platform/
    boundary.test.ts               dependency-direction guard
    cloudflare/
      stack.ts                     Alchemy stack, Website, Access, state selection
      edge.ts                      forwarding-only Website entry
      api.ts                       private API Worker and per-request layers
      database.ts                  optional D1 resource declaration
      <domain>-d1.ts               optional D1 adapter
      <domain>-object.ts           optional Durable Object host
      access.ts                    request-scoped identity extraction
  ui/
    AGENTS.md                      framework conventions and upgrade procedure
    entry.ts                       Runtime.makeApplication / Runtime.run only
    main.ts                        root init and pure definitions for small apps
    model.ts / message.ts          root Schema state and fact-like Messages
    command.ts / route.ts          root effects and URL mapping when needed
    update/ / view/                split by responsibility as the root grows
    page/<page>/                   independent Submodels and their tests
    domain/                        pure UI/domain transformations
    api.ts / theme.ts              HTTP helpers and optional theme Flags
    lib/ / components/             shared leaves; foldcn copies in components/ui/
    styles.css                     Tailwind v4 and application-owned theme tokens
public/                            assets, self-hosted scripts, static _headers
migrations/                        optional append-only D1 migrations
patches/                           versioned Bun patches with rationale
docs/                              architecture, API contracts, operations
```

## Dependency direction

```text
Cloudflare host ──→ HTTP/application ──→ domain models + capability contracts
       │                                      ▲
       └── selects adapters/layers ────────────┘

UI entry ──→ root ──→ page Submodels ──→ shared UI/domain leaves
```

HTTP has no Cloudflare binding names or Access-header assumptions. Platform hosts provide the service contracts it uses. Public domain re-exports may stabilize frontend imports, but backend code imports the owning domain directly; do not add barrels without a consumer.

A page never imports the root app. Use Submodel Messages/OutMessages and parent composition for communication. Split `model`, `message`, and `command` only when dependencies or responsibilities call for it; a small app can keep pure definitions in `main.ts`. Runtime boot must always be separate so tests can import definitions without starting the browser.

## What not to inherit

Do not copy the original project's workflow DSL, automation facades, replay engine, entities, approval roles, seed migrations, API paths, or product-specific UI layout. Durable execution and AI are optional capabilities. Name the new domains after the new product and document its own invariants.

The supplied boundary test is a lightweight source-text guard, not a complete dependency analyzer. It covers relative platform imports, named SDKs, and selected Cloudflare globals. If you introduce backend aliases, `.tsx` files, or other SDKs, extend the guard accordingly. Do not treat it as a security sandbox.
