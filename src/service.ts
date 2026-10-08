import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Info } from "./model.ts";

export class AppInfo extends Context.Service<AppInfo, { readonly read: Effect.Effect<Info> }>()(
  "starter/AppInfo",
) {
  static readonly layer = (name: string) =>
    Layer.succeed(AppInfo, {
      read: Effect.succeed(Info.make({ name, status: "ok" })),
    });
}
