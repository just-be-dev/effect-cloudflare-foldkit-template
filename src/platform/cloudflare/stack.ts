import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import Api from "./api.ts";

export const TestClient = Cloudflare.Access.ServiceToken("TestClient", { duration: "720h" });

export const App = Cloudflare.Website.Foldkit(
  "App",
  Effect.gen(function* () {
    const dev = yield* Alchemy.ALCHEMY_DEV.pipe(Effect.orDie);
    const access = dev
      ? undefined
      : yield* Effect.map(TestClient, (token) => ({
          policies: [
            { decision: "allow" as const, include: [{ cloudflareAccountMember: token.accountId }] },
            {
              decision: "non_identity" as const,
              include: [{ serviceToken: token.serviceTokenId }],
            },
          ],
        }));
    return {
      main: "src/platform/cloudflare/edge.ts",
      env: { API: Api },
      assets: { runWorkerFirst: ["/api/*"] },
      compatibility: { date: "2026-10-04" },
      access,
    };
  }),
);

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
