import { expect, test } from "bun:test";
import { given, message, model, story } from "foldkit/story";
import { init, Message, update } from "./main.ts";

test("increments compose and reset returns to zero", () => {
  story(
    update,
    given(init().model),
    message(Message.ClickedIncrement()),
    message(Message.ClickedIncrement()),
    model((value) => expect(value.count).toBe(2)),
    message(Message.ClickedReset()),
    model((value) => expect(value.count).toBe(0)),
  );
});
