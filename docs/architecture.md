# Structuring Effect codebases

Organize around domain responsibilities and lifetimes. Use Effect to express those boundaries, not to decide them.

These guidelines were extracted from a working Effect/Cloudflare application. They are principles to adapt, not a mandatory directory template. Examples involving workflows and replay apply only when the new product needs durable execution.

## Group code by domain and ownership

Keep a domain's models, validation, operations, and service contracts together. Avoid top-level `services/`, `schemas/`, and `layers/` directories that scatter one responsibility across the repository.

Split a module when a responsibility has its own state, invariants, dependencies, or lifecycle. File size is a reason to look for such a boundary, not a reason to invent one. Design sessions and execution coordination can evolve independently; arbitrary groups of helper functions cannot.

Keep a facade when callers need a single application interface. It should compose components and join their results, rather than retain the business logic that those components were extracted to own.

## Isolate platform implementations

Put SDK bindings, database adapters, deployment declarations, native entry points, and runtime integration under `platform/<provider>/`. Keep service contracts and business rules in their owning domains.

Dependencies point from platform adapters into domains, never back. Domain code should not import platform modules, deployment libraries, or platform-native globals. Enforce this boundary with an import-boundary test or lint rule.

Separation is useful when it removes actual platform dependencies. Do not move portable logic into a platform directory merely because the platform currently calls it. Likewise, do not add generic wrappers that expose the same SDK operations under different names.

## Services describe capabilities; layers construct implementations

Name a service for what callers need, such as `EntityStore`, rather than how it is implemented, such as D1. A contract should express meaningful operations and guarantees, not mirror a vendor API.

Keep business validation and merging rules in shared domain code so memory and production implementations obey the same rules. An adapter should translate storage, transport, or runtime details rather than duplicate policy.

Use `Context.Service` for capabilities supplied through the environment. Not every internal component needs a service tag: an Effect constructor returning an operation record is often sufficient when dependencies are explicitly supplied. Add indirection only when it protects a meaningful boundary or removes real complexity.

Compose layers where the application's implementation choices are made. Keep infrastructure selection out of business operations.

## Make lifetime and construction sites explicit

Decide whether each resource and mutable value belongs to the application, request, tenant, session, or execution. Construct it at that boundary and capture the dependencies appropriate to that lifetime.

Use scoped layers for resources requiring cleanup. Do not accidentally recreate a synchronization lock for every operation or share request identity across requests. A lock protects only callers that share its instance; an in-memory lock does not coordinate separate processes.

Where a framework separates deployment-time construction from runtime handling, respect that distinction. Declaring a binding does not mean it can already perform storage or network operations. Acquire request- or instance-bound capabilities where they are valid.

## Application operations own complete use cases

Transport handlers decode inputs, invoke an application operation, and encode its result. They should not finish business work by writing another store after the application returns.

Put ordering, authorization, transaction boundaries, and partial-failure policy inside the operation that owns the use case. For example, saving may require validation, snapshot storage, subscription changes, and a directory update. Callers should not need to know that sequence.

Distinguish required writes from best-effort updates. Specify what remains written after each failure and how retries recover. A successful return should have a clear meaning.

## Preserve capabilities that share an invariant

Do not split persistence and job scheduling into independent capabilities when they must commit or roll back together. Keep the transaction guarantee visible in the contract and test it in implementations.

Conversely, unrelated stores do not become atomic merely because one layer supplies both. When no shared transaction exists, define the partial-failure policy explicitly and make recovery or retries safe. Do not imply all-or-nothing behavior that the infrastructure cannot provide.

## Distinguish representations and authorities

Give persisted application records, interpreter working values, and replay journals separate names and owners. State which representation controls execution, which is reconstructed, and which is displayed to people. Never seed execution from a display record when the journal is authoritative.

Use Schema to decode untrusted boundaries, including HTTP inputs, storage reads, remote responses, configuration, and model output. Define an explicit policy for incompatible persisted data rather than silently treating every decoding failure as missing data.

Brand identifiers that have identical wire shapes but different meanings, such as a run ID and an execution ID. Decode them at boundaries; preserve their serialized values. Use discriminated unions where they prevent invalid combinations of state, rather than accumulating independent flags.

Treat storage keys, callback payloads, workflow results, and journal names as compatibility contracts. A rename can be a behavior change when existing work depends on it.

## Read configuration at composition boundaries

Use Effect `Config` for runtime configuration, validate it before constructing services, and pass resolved values into implementations. Domain operations should not read environment variables or know where configuration comes from.

Keep deployment-time declarations distinct from request-time capabilities. Supply secrets to the implementation that needs them; do not include them in business models or persisted workflow definitions.

Avoid hypothetical configuration. Add an option when the application needs a choice, not merely because a value could become configurable.

## Test architectural guarantees, not just happy paths

Use memory implementations to test application behavior and integration tests to check native platform behavior. A memory adapter passing a test does not prove that a production adapter provides the same transaction or runtime guarantees.

Test partial failures, retries, concurrent updates, and replay with inputs that distinguish correct behavior from plausible mistakes. For example, change a displayed record while an execution waits and verify that replay still uses journaled values; make parallel reports overlap and verify that both results survive.

Refactor ownership separately from changing behavior. Preserve serialized contracts and existing failure policies unless changing them is an explicit part of the task. Verify each reviewable stage before committing it.

## Review questions

- Who owns this rule and the data it changes?
- Where is each dependency supplied, and how long does it live?
- Is this abstraction protecting a real boundary?
- What does success guarantee, and what remains written after failure?
- Can this operation safely be retried or replayed?
- Which persisted contracts must remain compatible?
- Which test would fail if that guarantee were broken?

A reader should be able to answer these questions without tracing the entire application.

## References

- [Effect Solutions: Services and Layers](https://www.effect.solutions/services-and-layers)
- [Effect Solutions: Data Modeling](https://www.effect.solutions/data-modeling)
- [Effect Solutions: Config](https://www.effect.solutions/config)
