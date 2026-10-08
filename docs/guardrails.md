# Guardrails must have owners and executable checks

These are defaults for the new application, not a claim that configuration alone enforces every policy.

| Concern               | Rule                                                                            | Enforcement / evidence                                                           |
| --------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Platform isolation    | Domains and HTTP do not import Cloudflare or Alchemy                            | `src/platform/boundary.test.ts`; extend for new import paths/globals             |
| Untrusted data        | Schema-decode bodies, params, storage, remote output, configuration, AI answers | Boundary and malformed-input tests                                               |
| Effect errors         | Typed expected failures; structural mapping across RPC                          | `Schema.TaggedError`, failure tests, lint rules                                  |
| Request lifetime      | Identity belongs to one request; locks to the shared instance they protect      | Concurrent/request-isolation tests and native smoke checks                       |
| Use-case ownership    | Application owns authorization, all writes, partial success, retry              | Failure after each required write; assertions about what remains                 |
| Durable behavior      | At-least-once delivery; deterministic replay; idempotent side effects           | Crash/retry/replay tests against the actual host                                 |
| Storage compatibility | Append migrations; preserve persisted contracts or migrate explicitly           | Upgrade and old-data tests                                                       |
| UI architecture       | Schema Model, fact-like Messages, pure Update/View, effects in Commands         | UI-scoped Foldkit lint, Story and Scene tests                                    |
| Dependencies          | Compatible exact pins; reviewed patches and lockfile                            | Frozen install, typecheck, lint, tests, build, documented patch removal criteria |
| Operations            | No unauthorized deployment, production write, or publication                    | Agent instructions and explicit human authorization; not an automated guarantee  |

## Security defaults to retain

- Keep the API Worker directly reachable only through the public Website's service binding. Its forwarded HTTP routes are public; add verified identity and application authorization before exposing protected data or operations. Cloudflare Access is not configured by default.
- Preserve persisted native Worker logs/traces and the API's `Cloudflare.Telemetry` layer. Tune sampling and retention for the new product; never attach secrets, authentication headers, payloads, or personal data to logs/spans.
- Keep a bounded API request body (32 KB was the source default) and consistent `{ "error": string }` failures. Add your own boundary-limit tests; this template does not ship those handlers.
- If accepting outbound URLs, protect against SSRF when validating **and** before sending: HTTPS, no credentials, no private/loopback destination, with an explicit redirect/DNS policy. The source's literal URL restriction is workflow-specific, not a generic requirement for every app.
- Do not forward credentials or tracing headers to arbitrary external destinations. Persist no secrets in business models, prompts, or workflow definitions.
- Serve fonts/scripts locally. Start from `public/_headers` CSP and adjust only for actual resource requirements. `style-src 'unsafe-inline'` is inherited, not a hardening target already achieved.
- Keep secrets in authorized runtime bindings/configuration. Ignore `.env`, `.dev.vars`, local Cloudflare/Alchemy state, dependencies, and builds. Publish only reviewed files from the new repository, never the source checkout/history.
- If an integration is simulated, label results as simulated rather than implying an external action happened.

## Verification after implementing an app

```sh
bun run typecheck && bun run lint && bun run test && bun run format:check
bun run build  # UI/bundling changes; no infrastructure writes
```

Use `bun:test` adjacent to domain/application code and memory implementations with scripted external services. Test properties that a plausible wrong implementation violates: limits on both sides, asymmetric values, interrupted writes, duplicate delivery, stale replies, and overlapping reports. Derive expected results independently.

Foldkit Story tests drive Messages through Update; Scene tests drive the view through accessible locators. Add page-local tests for page-owned behavior and root tests for routing/parent-child communication. Scene is not a substitute for visually inspecting the running browser's CSS and affected states. Render and inspect before finishing appearance changes.

Native integration checks run under `mise run dev` against the printed Website URL. Start with GET endpoints and assert status **and decoded body**, not just “HTTP succeeded.” Mutating calls can change data, schedule jobs, invoke paid AI, or contact other systems: use disposable local data and approved destinations. Memory tests cannot verify native transactions, callback delivery, real AI, or telemetry ingestion. Confirm logs/traces in Cloudflare's dashboard after an authorized deployment.

Record limitations explicitly, including expired credentials, untested model calls, and absent production JWT/authorization coverage. Separate local edits, committed changes, pushed changes, and deployment status.

## Maintenance and approval boundaries

Refactor without behavior changes first, verify, then change behavior in a separate reviewable step. Preserve user work and leave unrelated fixes out.

Require explicit authorization before deploy/destroy, using dev against deployed stages, shared database writes/migrations, production restarts, access-control changes, pushes/PRs, or package/release publication. Do not add automatic deployment or shared-state migration to an install hook or CI check. This template intentionally includes no CI/deployment workflow because the source does not supply one to inherit.
