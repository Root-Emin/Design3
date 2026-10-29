import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Heading } from "./Typography";

interface PanelProps {
  /** Kenara yaslı liste paneli (iç boşluk yalnız dikeyde). */
  flush?: boolean;
  title?: string;
  titleId?: string;
  as?: "div" | "section";
  className?: string;
  children: ReactNode;
}

/** Kenarlıklı yüzey kartı (.panel). */
export function Panel({ flush, title, titleId, as: Tag = "div", className, children }: PanelProps) {
  return (
    <Tag
      className={cn(
        "grid gap-12 rounded-card bg-surface shadow-hairline",
        flush ? "overflow-hidden px-0 py-8" : "p-(--inset-card)",
        className,
      )}
      aria-labelledby={title ? titleId : undefined}
    >
      {title && (
        <Heading as="h3" look="title" id={titleId} className={flush ? "px-16 pt-8 pb-0" : undefined}>
          {title}
        </Heading>
      )}
      {children}
    </Tag>
  );
}
