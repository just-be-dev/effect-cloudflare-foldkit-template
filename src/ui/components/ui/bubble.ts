import type { Attribute, Html, HtmlBuilder } from "foldkit/html";

type Child = Html | string;

import { cn } from "@/lib/utils";

/** Bubble variant keys. Sync with `bubbleVariants` is compiler-enforced:
 *  `bubbleVariants` is `Record<BubbleVariant, string>` (missing key = error)
 *  and annotated object literals reject unknown keys. */
export const bubbleVariantKeys = [
  "default",
  "secondary",
  "muted",
  "tinted",
  "outline",
  "ghost",
  "destructive",
] as const;

export type BubbleVariant = (typeof bubbleVariantKeys)[number];

export const bubbleVariants: Record<BubbleVariant, string> = {
  default:
    "*:data-[slot=bubble-content]:bg-primary *:data-[slot=bubble-content]:text-primary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-primary/80",
  secondary:
    "*:data-[slot=bubble-content]:bg-secondary *:data-[slot=bubble-content]:text-secondary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]",
  muted:
    "*:data-[slot=bubble-content]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_5%)]",
  tinted:
    "*:data-[slot=bubble-content]:bg-[oklch(from_var(--primary)_0.93_calc(c*0.4)_h)] dark:*:data-[slot=bubble-content]:bg-[oklch(from_var(--primary)_0.3_calc(c*0.4)_h)] *:data-[slot=bubble-content]:text-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[oklch(from_var(--primary)_0.88_calc(c*0.5)_h)] dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-[oklch(from_var(--primary)_0.35_calc(c*0.5)_h)]",
  outline:
    "*:data-[slot=bubble-content]:bg-background *:data-[slot=bubble-content]:border-border [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-input/30",
  ghost:
    "*:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted/50 border-none",
  destructive:
    "*:data-[slot=bubble-content]:bg-destructive/10 dark:*:data-[slot=bubble-content]:bg-destructive/20 *:data-[slot=bubble-content]:text-destructive [&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/20 dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/30",
};

export type BubbleAlign = "start" | "end";

export type BubbleReactionsSide = "top" | "bottom";

export const bubbleClass =
  "gap-1 data-[align=end]:self-end max-w-[80%] data-[variant=ghost]:max-w-full group-data-[align=end]/message:self-end group/bubble relative flex w-fit min-w-0 flex-col";

export const bubbleGroupClass = "gap-2 flex min-w-0 flex-col";

export const bubbleContentClass =
  "rounded-xl border border-transparent px-3 py-2 text-sm leading-relaxed [button,a]:outline-none [button,a]:focus-visible:border-ring [button,a]:focus-visible:ring-3 [button,a]:focus-visible:ring-ring/50 group-data-[align=end]/bubble:self-end w-fit max-w-full min-w-0 overflow-hidden wrap-break-word [button]:text-left [button,a]:transition-colors";

export const bubbleReactionsClass =
  "rounded-full ring-3 ring-card bg-muted shrink-0 gap-1 px-1.5 py-0.5 has-[button]:p-0 text-sm absolute z-10 flex w-fit items-center justify-center";

export const bubbleReactionsSideClasses: Record<BubbleReactionsSide, string> = {
  top: "top-0 -translate-y-3/4",
  bottom: "bottom-0 translate-y-3/4",
};

export const bubbleReactionsAlignClasses: Record<BubbleAlign, string> = {
  start: "left-3",
  end: "right-3",
};

type BubbleConfig = Readonly<{
  className?: string;
  variant?: BubbleVariant;
  align?: BubbleAlign;
}>;

const bubbleGroup = <M>(
  config: Readonly<{ className?: string }>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.Class(cn(bubbleGroupClass, config.className)), h.DataAttribute("slot", "bubble-group")],
    children,
  );

const bubbleContainer = <M>(
  config: BubbleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [
      h.Class(cn(bubbleClass, bubbleVariants[config.variant ?? "default"], config.className)),
      h.DataAttribute("slot", "bubble"),
      h.DataAttribute("variant", config.variant ?? "default"),
      h.DataAttribute("align", config.align ?? "start"),
    ],
    children,
  );

export type BubbleContentConfig<M> = Readonly<{
  className?: string;
  /** Element to render as — foldcn's stand-in for upstream's `useRender`
   *  `render` prop. Button/anchor bubbles keep the same content classes,
   *  including the variant hover state keyed on the content element itself. */
  as?: "div" | "button" | "a";
  /** Click message when rendered `as: 'button'`. */
  onClick?: M;
  /** Extra attributes merged onto the content element (href, labels, …). */
  attributes?: ReadonlyArray<Attribute<M>>;
}>;

const bubbleContent = <M>(
  config: BubbleContentConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html => {
  const attributes: ReadonlyArray<Attribute<M>> = [
    h.Class(cn(bubbleContentClass, config.className)),
    h.DataAttribute("slot", "bubble-content"),
    ...(config.attributes ?? []),
  ];
  if (config.as === "button")
    return h.button(
      [...attributes, ...(config.onClick ? [h.OnClick(config.onClick)] : [])],
      children,
    );
  if (config.as === "a") return h.a(attributes, children);
  return h.div(attributes, children);
};

export type BubbleReactionsConfig<M> = Readonly<{
  side?: BubbleReactionsSide;
  align?: BubbleAlign;
  className?: string;
  /** Extra attributes merged onto the reactions element (role, labels, …). */
  attributes?: ReadonlyArray<Attribute<M>>;
}>;

const bubbleReactions = <M>(
  config: BubbleReactionsConfig<M>,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html => {
  const side = config.side ?? "bottom";
  const align = config.align ?? "end";
  return h.div(
    [
      h.Class(
        cn(
          bubbleReactionsClass,
          bubbleReactionsSideClasses[side],
          bubbleReactionsAlignClasses[align],
          config.className,
        ),
      ),
      h.DataAttribute("slot", "bubble-reactions"),
      h.DataAttribute("align", align),
      h.DataAttribute("side", side),
    ],
    children,
  );
};

/** Styled chat bubble — `Bubble.group`, `Bubble.content` and
 *  `Bubble.reactions` sub-builders. Mirrors the shadcn v4 `bubble.tsx`. */
export const Bubble = Object.assign(bubbleContainer, {
  group: bubbleGroup,
  content: bubbleContent,
  reactions: bubbleReactions,
});
