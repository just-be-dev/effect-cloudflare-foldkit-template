import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import Api from "./api.ts";

export const App = Cloudflare.Website.Foldkit("App", {
  main: "src/platform/cloudflare/edge.ts",
  env: { API: Api },
  assets: { runWorkerFirst: ["/api/*"] },
  compatibility: { date: "2026-10-04" },
  observability: {
    enabled: true,
    logs: { enabled: true, invocationLogs: true, headSamplingRate: 1, persist: true },
    traces: { enabled: true, headSamplingRate: 1, persist: true },
  },
});

export type AppEnv = Cloudflare.InferEnv<typeof App>;

const state = Layer.unwrap(
  Effect.gen(function* () {
    const dev = yield* Alchemy.ALCHEMY_DEV.pipe(Effect.orDie);
    return dev ? Alchemy.localState() : Cloudflare.state();
  }),
);

export default Alchemy.Stack(
  "project-starter",
  { providers: Cloudflare.providers(), state },
  Effect.gen(function* () {
    yield* Api;
    const app = yield* App;
    return { url: app.url };
  }),
);
