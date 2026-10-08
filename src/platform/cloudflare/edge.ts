import type { AppEnv } from "./stack.ts";

export default {
  fetch(request: Request, env: AppEnv): Promise<Response> {
    return env.API.fetch(request);
  },
};
