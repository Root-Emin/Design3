import { ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { cn } from "../../lib/utils";
import { Icon } from "../icons/Icon";

interface ListItemProps {
  title: string;
  /** İkinci satır; veri yüklenirken iskelet de verilebilir. */
  sup?: ReactNode;
  icon?: LucideIcon;
  avatar?: ReactNode;
  meta?: string;
  to?: string;
  /** Adres yerine eylem: satır düğme olarak çizilir (chevron korunur). */
  onClick?: () => void;
  /**
   * "event": işveren hareketleri listesi (ikincil ikon, küçük zaman satırı, satır kırılan başlık).
   * "conversation": Mesajlar listesi (48px avatar, kalın başlık, silik ara çizgi, son satırda çizgi yok).
   */
  variant?: "default" | "event" | "conversation";
  /** Okunmamış yazışma: zamanın altına birincil renkte nokta düşer (yalnız "conversation"). */
  unread?: boolean;
  testId?: string;
}

/** DS List Item. Uygulamada her zaman panel içinde durduğu için zemin saydamdır. */
export function ListItem({ title, sup, icon, avatar, meta, to, onClick, variant = "default", unread, testId }: ListItemProps) {
  const event = variant === "event";
  const conversation = variant === "conversation";
  const interactive = to || onClick;
  const cls = cn(
    "en-li max-w-none bg-transparent",
    conversation ? "gap-12 p-16 shadow-divider-subtle last:shadow-none" : "en-li--divider",
    sup && "en-li--two",
    interactive && "en-state en-focus",
  );
  const content = (
    <>
      {avatar ??
        (icon && (
          <span className={cn("en-li__icon", event && "text-secondary")}>
            <Icon icon={icon} size={24} />
          </span>
        ))}
      <span className="en-li__text">
        <span className={cn("en-li__title", event && "whitespace-normal overflow-visible text-clip", conversation && "font-semibold")}>{title}</span>
        {sup && <span className={cn("en-li__sup", event && "text-caption text-tertiary")}>{sup}</span>}
      </span>
      {conversation ? (
        <span className="mt-4 flex flex-none flex-col items-end gap-8 self-start">
          {meta && <span className="text-caption whitespace-nowrap text-secondary en-num">{meta}</span>}
          {unread && (
            <>
              <span className="size-8 rounded-full bg-(--action-primary)" aria-hidden="true" />
              <span className="ds-sr">, okunmamış</span>
            </>
          )}
        </span>
      ) : (
        meta && <span className="en-li__meta en-num">{meta}</span>
      )}
      {interactive && <Icon icon={ChevronRight} className={cn("en-li__chev", conversation && "text-tertiary")} />}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls} data-testid={testId}>
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" className={cn(cls, "cursor-pointer border-0 text-left [font:inherit]")} onClick={onClick} data-testid={testId}>
        {content}
      </button>
    );
  }
  return (
    <div className={cls} data-testid={testId}>
      {content}
    </div>
  );
}
