# Effect / Cloudflare / Foldkit

This is a runnable starter. Read `README.md` and `docs/`, replace the sample domain/UI, and add the new product's layout, API, and invariants. Do not recreate the source project's automation application.

`src/model.ts` and `src/service.ts` own the sample Schema/service. `src/api.ts` composes its health route. `src/platform/cloudflare/{stack,api,edge}.ts` declares resources, hosts the private API, and forwards requests. `src/ui/entry.ts` boots the counter definitions in `main.ts`. D1, Durable Objects, and AI are available dependencies but are not provisioned by default.

## Ownership and scope

- Keep small applications flat under `src/`; group business code by domain under `src/<domain>/` as responsibilities emerge. Keep models, validation, operations, and capability contracts together.
- Platform-independent HTTP starts in `src/api.ts`. Handlers decode inputs, invoke complete application operations, and encode responses; split routes into `src/http/` only when they need their own modules.
- Cloudflare SDKs, native globals, storage adapters, entry points, identity extraction, bindings, and deployment configuration belong in `src/platform/cloudflare/`. Domain code must not import them.
- Platform imports domain, never the reverse. Preserve `src/platform/boundary.test.ts`; update it when adding other platform SDKs or aliases.
- UI lives in `src/ui/`; follow its `AGENTS.md`. Its alias `@/` maps to `src/ui/`, not all of `src/`.
- Split by responsibility and lifetime, not line count. Add abstractions only for real boundaries. Refactor ownership separately from changing behavior.
- Keep public schemas, storage keys, callback names/payloads, and replay journal names compatible unless an explicit migration changes them.

## Effect

- Before writing Effect code, run `bunx effect-solutions list`, then `bunx effect-solutions show <topic>` for the patterns needed. Check examples against the installed Effect 4 APIs; guides can target a different release.
- Import bare modules, e.g. `import * as Effect from "effect/Effect"`.
- New Worker and Durable Object code is Effect-native. Wrap Promise SDKs at the platform boundary with `Effect.tryPromise` and a typed error.
- Decode HTTP bodies/params, stored values, remote responses, configuration, and model output with Schema. Define an explicit policy for incompatible stored data.
- Model expected failures with `Schema.TaggedError`; name operations with `Effect.fn("Module.operation")`.
- Services describe capabilities; layers build implementations. Capture runtime dependencies at the valid request/instance lifetime so public operations do not leak platform requirements.
- Authorization, write ordering, transactions, and partial-failure policy belong to the application operation. Memory and production adapters must share business validation.
- Distinguish IDs with brands and states with discriminated unions. Separate execution authority from records shown to users when implementing replay.
- Do not use `instanceof` to recognize errors crossing Durable Object RPC; map their structural fields.

## Alchemy 2 and Cloudflare

- Use Alchemy 2's Effect API, not v1 Promise-based examples. Installed `node_modules/alchemy/src` is the final reference; documentation starts at https://alchemy.run/llms.txt.
- The outer Worker/DO Effect runs at plan time and cold start: declare/acquire bindings there. Storage, raw bindings, callbacks, and identity are usable only in the returned instance/request runtime.
- Never load `cloudflare:*` at module top level through a plan-time import path.
- Keep the public Website edge forwarding-only. The API Worker remains private (`workersDev: false`, no public routes), reached over a service binding from the public Website. Its HTTP routes are public through that Website.
- Do not add Cloudflare Access by default. The starter has no authentication; implement the new product's identity and authorization deliberately before exposing protected operations.
- Preserve native Workers Observability logs and traces on both Workers. Provide `Cloudflare.Telemetry` on Effect-native hosts so `Effect.withSpan` / named `Effect.fn` spans reach Cloudflare, rather than merely enabling the trace metadata. Keep compatibility dates at least `2026-07-28`, tune sampling for volume, and never attach secrets or payloads to telemetry.
- Callbacks are delivered at least once. Make side effects and scheduled jobs idempotent, and test crash/retry behavior.
- Use checkout-local Alchemy state in dev and Cloudflare-hosted state for deployed stages. Never commit local state or credentials.
- Never edit an applied D1 migration. Add the next numbered migration instead.

## Verify before finishing

Run from the repository root:

```sh
bun run typecheck && bun run lint && bun run test && bun run format:check
```

- Run `bun run build` for UI/build changes. Build is a local check, not a deploy.
- Tests use `bun:test` beside the code they cover; run Effects with `Effect.runSync` or `Effect.runPromise`.
- Use memory services for application tests. Native Worker, DO, D1, identity, and AI behavior needs local end-to-end checks with `mise run dev` and the URL it prints.
- Test both sides of boundaries and failure/retry/concurrency cases that distinguish correct behavior from plausible errors. Memory tests do not establish native transactional guarantees.
- UI tests use Foldkit Story/Scene. Render and inspect affected visual states before claiming visual changes are complete; use DOM/accessibility checks for interaction-only changes.
- For template maintenance, also check frozen installation, documentation links, config parsing, native API smoke checks, and publication status. Never confuse a passing UI build with a deployment.

## Dependencies and operational safety

- Keep Foldkit, `@foldkit/*`, Vite, and `@effect/platform-*` exactly pinned. Upgrade compatible versions together and refresh UI conventions against the installed Foldkit tag.
- Patch dependencies only with `bun patch`. Document symptom, cause, fix, and removal criteria in `patches/README.md`; recheck patches on upgrades.
- Never commit secrets, tokens, `.env` files, `.alchemy/`, `.wrangler/`, `node_modules/`, or generated build output. `private: true` prevents npm publication; it does not configure GitHub visibility.
- Inspect user-shared local URLs with read-only API calls first. Mutating requests, AI prompts, job starts, and migrations may change data or spend money.
- Do not deploy/destroy, target a deployed stage with dev, migrate shared databases, restart production, change access controls, push, publish, or open/merge PRs without explicit authorization for that action. Local disposable tests are fine.
- Preserve existing user work. Report exactly what was verified and whether work is local, committed, pushed, or deployed.
