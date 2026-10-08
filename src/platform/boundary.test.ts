import { expect, test } from "bun:test";
import { dirname, resolve } from "node:path";

test("backend domains don't depend on platform adapters, SDKs, or Cloudflare globals", async () => {
  const src = resolve(import.meta.dir, "..");
  const violations: Array<string> = [];
  for await (const path of new Bun.Glob("**/*.ts").scan(src)) {
    if (path.startsWith("ui/") || path.startsWith("platform/")) continue;
    const source = await Bun.file(resolve(src, path)).text();
    // Include type-only imports and re-exports, which don't appear in a runtime import scan.
    for (const match of source.matchAll(/\b(?:from\s*|import\s*(?:\(\s*)?)["']([^"']+)["']/g)) {
      const specifier = match[1];
      if (specifier === undefined) continue;
      const target = resolve(src, dirname(path), specifier);
      if (
        /^(alchemy|cloudflare:|@cloudflare\/|agents(?:\/|$))/.test(specifier) ||
        target.startsWith(`${src}/platform/`)
      ) {
        violations.push(`${path}: ${specifier}`);
      }
    }
    const globals =
      source.match(
        /\b(?:DurableObjectStorage|DurableObjectState|D1Database|Ai|ExecutionContext|SqlStorage)\b/g,
      ) ?? [];
    violations.push(...globals.map((name) => `${path}: ${name}`));
  }
  expect(violations).toEqual([]);
});
