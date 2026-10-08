# Architecture

Organize code around domains and lifetimes. Effect is how you express those boundaries; it doesn't decide them for you.

## Group code by domain

Keep a domain's models, validation, operations, and service contracts together. Top-level `services/`, `schemas/`, and `layers/` folders spread one feature across the whole repo.

Split a module when part of it has its own state, invariants, dependencies, or lifecycle. A large file is a hint to look for that seam, not a reason to cut one where none exists.

A facade is fine when callers need one entry point. It should compose the pieces and join their results, and leave the business logic in the pieces.

## Isolate platform code

SDK bindings, database adapters, deployment declarations, native entry points, and runtime glue go under `platform/<provider>/`. Service contracts and business rules stay in their domains.

Platform code imports domains, never the reverse. Domain code doesn't touch platform modules, deployment libraries, or platform globals. `src/platform/boundary.test.ts` enforces this.

Only move code into `platform/` if it actually depends on the platform. Portable logic that the platform happens to call stays in the domain. Skip wrappers that just rename SDK methods.

## Services describe capabilities; layers build them

Name a service after what callers need (`EntityStore`), not how it's built (D1). The contract should express real operations and guarantees, not mirror a vendor API.

Put validation and merge rules in shared domain code so the memory and production implementations follow the same rules. Adapters translate storage, transport, and runtime details.

Use `Context.Service` for capabilities supplied through the environment. Many internal components can just be an Effect that returns a record of operations, with dependencies passed in directly. Add indirection when it protects a boundary or removes real complexity.

Compose layers where the app picks its implementations. Business operations don't choose infrastructure.

## Be explicit about lifetimes

For each resource and mutable value, decide whether it belongs to the application, a request, a tenant, a session, or an execution. Build it at that boundary.

Use scoped layers for anything that needs cleanup. Watch for locks that get recreated per operation, or request identity that leaks across requests. A lock only protects callers sharing the same instance, and an in-memory lock can't coordinate separate processes.

When a framework separates deploy-time construction from runtime handling, respect it. Declaring a binding doesn't make it usable yet. Acquire request- or instance-bound capabilities where they're valid.

## Application operations own whole use cases

HTTP handlers decode input, call an application operation, and encode the result. They don't finish the job by writing to another store afterwards.

Ordering, authorization, transactions, and partial-failure handling live in the operation that owns the use case. If saving means validating, storing a snapshot, updating subscriptions, and touching a directory, callers shouldn't need to know that sequence.

Separate required writes from best-effort ones. Know what's been written after each possible failure and how a retry recovers. A successful return should mean something specific.

## Keep capabilities together when they share an invariant

If persistence and job scheduling must commit or roll back together, expose them as one capability. Make the transaction part of the contract and test it against each implementation.

Two unrelated stores don't become atomic because one layer provides both. Without a shared transaction, write down the partial-failure policy and make retries safe.

## Separate representations

Persisted records, interpreter working values, and replay journals each get their own name and owner. Be clear about which one drives execution, which is rebuilt, and which is shown to people. If the journal is authoritative, never seed execution from a display record.

Decode everything untrusted with Schema: HTTP input, storage reads, remote responses, configuration, model output. Decide what happens when stored data no longer decodes instead of treating every failure as "missing".

Brand IDs that look the same on the wire but mean different things, like a run ID and an execution ID. Use discriminated unions instead of piles of independent flags.

Storage keys, callback payloads, workflow results, and journal names are compatibility contracts. Renaming one can break work already in flight.

## Read configuration at the edges

Use Effect `Config` for runtime configuration. Validate it before building services and pass the resolved values in. Domain code doesn't read environment variables.

Give secrets only to the implementation that needs them. They don't belong in business models or stored workflow definitions.

Add a config option when the app needs the choice.

## Test the guarantees

Memory implementations cover application behavior; integration tests cover native platform behavior. A passing memory test says nothing about the production adapter's transactions.

Test partial failures, retries, concurrent updates, and replay with inputs that would catch a plausible bug. For example: change a display record while an execution is waiting and check that replay still uses the journaled values, or overlap two parallel reports and check that both survive.

Refactor structure and change behavior in separate steps. Keep serialized contracts and failure policies as they are unless the task is to change them.

## Review questions

- Who owns this rule and the data it changes?
- Where is each dependency supplied, and how long does it live?
- What boundary does this abstraction protect?
- What does success guarantee, and what's left behind after a failure?
- Is this safe to retry or replay?
- Which stored contracts have to stay compatible?
- Which test fails if the guarantee breaks?

## References

- [Effect Solutions: Services and Layers](https://www.effect.solutions/services-and-layers)
- [Effect Solutions: Data Modeling](https://www.effect.solutions/data-modeling)
- [Effect Solutions: Config](https://www.effect.solutions/config)
