import * as Schema from "effect/Schema";
import type { Document, HtmlBuilder } from "foldkit/html";
import { defineMessageUnion } from "foldkit/message";
import { modifyFields } from "foldkit/struct";
import type * as Update from "foldkit/update";
import { button } from "@/components/ui/button";

// MODEL

export const Model = Schema.Struct({ count: Schema.Int });
export type Model = typeof Model.Type;

// MESSAGE

export const Message = defineMessageUnion({ ClickedIncrement: {}, ClickedReset: {} });
export type Message = typeof Message.Type;

// INIT

export const init = () => ({ model: Model.make({ count: 0 }) });

// UPDATE

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ClickedIncrement: () => ({ model: modifyFields(model, { count: (count) => count + 1 }) }),
    ClickedReset: () => ({ model: modifyFields(model, { count: () => 0 }) }),
  });

// VIEW

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: "Project starter",
  body: h.main(
    [h.Class("mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6 py-12")],
    [
      h.header(
        [h.Class("space-y-3")],
        [
          h.p(
            [h.Class("font-mono text-sm text-muted-foreground")],
            ["EFFECT / CLOUDFLARE / FOLDKIT"],
          ),
          h.h1(
            [h.Class("text-4xl font-semibold tracking-tight")],
            ["Your next project starts here."],
          ),
          h.p(
            [h.Class("text-muted-foreground")],
            ["The tooling and boundaries are ready. Make the product your own."],
          ),
        ],
      ),
      h.section(
        [
          h.Class("rounded-xl border border-border bg-card p-6 shadow-sm"),
          h.AriaLabel("Counter example"),
        ],
        [
          h.h2([h.Class("text-lg font-medium")], ["A small, pure update"]),
          h.p(
            [h.Class("mt-2 text-sm text-muted-foreground")],
            ["Messages change the Model; the view follows."],
          ),
          h.p(
            [h.Class("my-6 font-mono text-4xl"), h.AriaLive("polite")],
            [`Count: ${model.count}`],
          ),
          h.div(
            [h.Class("flex gap-3")],
            [
              button({ onClick: Message.ClickedIncrement(), type: "button" }, "Increment", h),
              button(
                { onClick: Message.ClickedReset(), type: "button", variant: "outline" },
                "Reset",
                h,
              ),
            ],
          ),
        ],
      ),
      h.p(
        [h.Class("text-sm text-muted-foreground")],
        ["Start with README.md and docs/. The private API exposes GET /api/health."],
      ),
    ],
  ),
});
