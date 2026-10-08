import { expect, test } from "bun:test";
import * as HttpRouter from "effect/http/HttpRouter";
import * as Layer from "effect/Layer";
import { AppInfo } from "./service.ts";
import { apiRoutes } from "./api.ts";

test("health reads the supplied capability and unknown routes return JSON errors", async () => {
  const { handler, dispose } = HttpRouter.toWebHandler(
    apiRoutes.pipe(Layer.provideMerge(AppInfo.layer("Different project"))),
    { disableLogger: true },
  );
  try {
    const health = await handler(new Request("http://app/api/health"));
    expect(health.status).toBe(200);
    expect(await health.text()).toBe(JSON.stringify({ name: "Different project", status: "ok" }));
    expect(health.headers.get("cache-control")).toBe("no-store");
    const missing = await handler(new Request("http://app/api/missing"));
    expect(missing.status).toBe(404);
    expect(await missing.text()).toBe(JSON.stringify({ error: "Not found" }));
  } finally {
    await dispose();
  }
});
