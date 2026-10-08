import type { Attribute, Html, HtmlBuilder } from "foldkit/html";

import { cn } from "@/lib/utils";

type Child = Html | string;

export type MessageAlign = "start" | "end";

export type MessagePartConfig<M> = Readonly<{
  className?: string;
  attributes?: ReadonlyArray<Attribute<M>>;
}>;

export type MessageConfig<M> = MessagePartConfig<M> & Readonly<{ align?: MessageAlign }>;

export const messageGroupClass = "gap-2 flex min-w-0 flex-col";

export const messageClass =
  "text-sm gap-2 group/message relative flex w-full min-w-0 data-[align=end]:flex-row-reverse";

export const messageAvatarClass =
  "min-w-8 group-has-data-[slot=message-footer]/message:-translate-y-8 flex w-fit shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-muted";

export const messageContentClass =
  "gap-2.5 group-data-[align=end]/message:*:data-slot:self-end flex w-full min-w-0 flex-col wrap-break-word";

export const messageHeaderClass =
  "text-xs font-medium text-muted-foreground px-3 group-has-data-[variant=ghost]/message:px-0 flex max-w-full min-w-0 items-center";

export const messageFooterClass =
  "text-xs font-medium text-muted-foreground px-3 group-has-data-[variant=ghost]/message:px-0 flex max-w-full min-w-0 items-center group-data-[align=end]/message:justify-end";

const messageGroup = <M>(
  config: MessagePartConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.Class(cn(messageGroupClass, config.className)),
      h.DataAttribute("slot", "message-group"),
      ...(config.attributes ?? []),
    ],
    children,
  );

const messageContainer = <M>(
  config: MessageConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.Class(cn(messageClass, config.className)),
      h.DataAttribute("slot", "message"),
      h.DataAttribute("align", config.align ?? "start"),
      ...(config.attributes ?? []),
    ],
    children,
  );

const messageAvatar = <M>(
  config: MessagePartConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.Class(cn(messageAvatarClass, config.className)),
      h.DataAttribute("slot", "message-avatar"),
      ...(config.attributes ?? []),
    ],
    children,
  );

const messageContent = <M>(
  config: MessagePartConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.Class(cn(messageContentClass, config.className)),
      h.DataAttribute("slot", "message-content"),
      ...(config.attributes ?? []),
    ],
    children,
  );

const messageHeader = <M>(
  config: MessagePartConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.Class(cn(messageHeaderClass, config.className)),
      h.DataAttribute("slot", "message-header"),
      ...(config.attributes ?? []),
    ],
    children,
  );

const messageFooter = <M>(
  config: MessagePartConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.Class(cn(messageFooterClass, config.className)),
      h.DataAttribute("slot", "message-footer"),
      ...(config.attributes ?? []),
    ],
    children,
  );

/** Chat message layout, composed with Bubble and Avatar for its content. */
export const Message = Object.assign(messageContainer, {
  group: messageGroup,
  avatar: messageAvatar,
  content: messageContent,
  header: messageHeader,
  footer: messageFooter,
});
