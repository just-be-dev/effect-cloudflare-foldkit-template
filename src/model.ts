import * as Schema from "effect/Schema";

export const Info = Schema.Struct({ name: Schema.String, status: Schema.Literal("ok") });
export type Info = typeof Info.Type;
