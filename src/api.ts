import * as Effect from "effect/Effect";
import * as HttpRouter from "effect/http/HttpRouter";
import * as HttpServerResponse from "effect/http/HttpServerResponse";
import * as Layer from "effect/Layer";
import { AppInfo } from "./service.ts";

const json = (body: unknown, status = 200) =>
  HttpServerResponse.jsonUnsafe(body, {
    status,
    headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" },
  });

export const apiRoutes = Layer.mergeAll(
  HttpRouter.add(
    "GET",
    "/api/health",
    Effect.gen(function* () {
      const info = yield* AppInfo;
      return json(yield* info.read);
    }),
  ),
  HttpRouter.add("*", "*", json({ error: "Not found" }, 404)),
);
