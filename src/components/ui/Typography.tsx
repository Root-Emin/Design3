import type { ElementType, ReactNode } from "react";
import { cn } from "../../lib/utils";

/** Prototipin tipografi rolleri: .h2, .h3, .sec-title ve .lead/.meta (ikisi aynı stil); h1 büyük sayfa başlığıdır. */
const HEADING = {
  h1: "m-0 text-heading-1 text-primary",
  h2: "m-0 text-heading-2 text-primary",
  h3: "m-0 text-heading-3 text-primary",
  title: "m-0 text-title text-primary",
} as const;

interface HeadingProps {
  as?: "h1" | "h2" | "h3" | "p";
  look: keyof typeof HEADING;
  id?: string;
  /** Ekran açıldığında odak alacak başlık. */
  focusTarget?: boolean;
  className?: string;
  children: ReactNode;
}

export function Heading({ as: Tag = "h2", look, id, focusTarget, className, children }: HeadingProps) {
  return (
    <Tag id={id} className={cn(HEADING[look], className)} {...(focusTarget && { tabIndex: -1, "data-focus": "" })}>
      {children}
    </Tag>
  );
}

interface MutedTextProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  [key: `aria-${string}` | `data-${string}`]: string | undefined;
}

export function MutedText({ as: Tag = "p", className, children, ...rest }: MutedTextProps) {
  return (
    <Tag className={cn("m-0 text-body-md text-secondary", className)} {...rest}>
      {children}
    </Tag>
  );
}
