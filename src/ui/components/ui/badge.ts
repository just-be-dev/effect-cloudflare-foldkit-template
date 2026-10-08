import type { Html, HtmlBuilder } from "foldkit/html";

type Child = Html | string;

import { cn } from "@/lib/utils";

/** Badge variant keys — keep in sync with `badgeVariants`. */
export const badgeVariantKeys = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "ghost",
  "link",
] as const;

export const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
  secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
  destructive:
    "bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20",
  outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
  ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
  link: "text-primary underline-offset-4 hover:underline",
};

export type BadgeVariant = (typeof badgeVariantKeys)[number];

export const badgeClass =
  "h-5 gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none";

type StyleConfig = Readonly<{ className?: string; variant?: BadgeVariant }>;

/** Styled badge built as a themed `<span>` (mirrors the shadcn v4 `badge.tsx`
 *  default element). For a link badge, render an `<a>` child and apply
 *  `badgeClass` via `cn` — foldcn has no Radix `Slot`. */
export const badge = <M>(
  config: StyleConfig,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<M>,
): Html =>
  h.span(
    [
      h.Class(cn(badgeClass, badgeVariants[config.variant ?? "default"], config.className)),
      h.DataAttribute("slot", "badge"),
      h.DataAttribute("variant", config.variant ?? "default"),
    ],
    children,
  );
