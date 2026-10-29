import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../icons/Icon";

interface EmptyStateProps {
  icon?: LucideIcon;
  /** İkon dairesi yerine çizilen görsel. */
  illustration?: ReactNode;
  title: string;
  text: string;
  action?: ReactNode;
  className?: string;
  testId: string;
}

/** Boş durum (DS'te bileşen yok; token ve Button ile kurulu). */
export function EmptyState({ icon, illustration, title, text, action, className, testId }: EmptyStateProps) {
  return (
    <section className={cn("grid justify-items-center gap-12 px-24 py-48 text-center", className)} data-testid={testId}>
      {illustration ??
        (icon && (
          <span className="grid size-[64px] place-items-center rounded-full bg-subtle text-secondary">
            <Icon icon={icon} size={28} />
          </span>
        ))}
      <h2 className="m-0 text-heading-3 text-primary">{title}</h2>
      <p className="m-0 max-w-[30ch] text-body-md text-secondary">{text}</p>
      {action}
    </section>
  );
}
