import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as HttpRouter from "effect/http/HttpRouter";
import { AppInfo } from "../../service.ts";
import { apiRoutes } from "../../api.ts";

export default class Api extends Cloudflare.Worker<Api>()(
  "Api",
  { main: import.meta.url, compatibility: { date: "2026-10-04" }, workersDev: false },
  Effect.gen(function* () {
    const handler = yield* HttpRouter.toHttpEffect(apiRoutes);
    return { fetch: handler.pipe(Effect.provide(AppInfo.layer("Project starter"))) };
  }),
) {}
