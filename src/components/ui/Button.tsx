import { Check, LoaderCircle, type LucideIcon } from "lucide-react";
import type { MouseEventHandler, ReactNode } from "react";
import { Link } from "react-router";
import { cn } from "../../lib/utils";
import { Icon } from "../icons/Icon";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  icon?: LucideIcon;
  iconPosition?: "start" | "end";
  /** Verilirse düğme bağlantı olarak çizilir. */
  to?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  loading?: boolean;
  success?: boolean;
  className?: string;
  testId?: string;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
}

/** DS Button (ds-btn): birincil, ikincil, üçüncül, yıkıcı; sm/md/lg; yükleniyor ve başarı durumları. */
export function Button({
  children,
  variant = "primary",
  size = "md",
  block,
  icon,
  iconPosition = "start",
  to,
  onClick,
  disabled,
  loading,
  success,
  className,
  testId,
  ...aria
}: ButtonProps) {
  const cls = cn(
    "ds-btn",
    `ds-btn--${variant}`,
    `ds-btn--${size}`,
    block && "ds-btn--block",
    loading && "is-loading",
    success && "is-success",
    className,
  );
  const label = <span className="ds-btn__label">{children}</span>;

  let content: ReactNode;
  if (loading) {
    content = (
      <>
        <span className="ds-btn__spinner ds-spin">
          <Icon icon={LoaderCircle} />
        </span>
        {label}
        <span className="ds-sr">Yükleniyor</span>
      </>
    );
  } else if (success) {
    content = (
      <>
        <Icon icon={Check} />
        {label}
      </>
    );
  } else {
    content = (
      <>
        {icon && iconPosition === "start" && <Icon icon={icon} />}
        {label}
        {icon && iconPosition === "end" && <Icon icon={icon} />}
      </>
    );
  }

  if (to) {
    return (
      <Link to={to} className={cn(cls, "no-underline")} data-testid={testId}>
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={cls}
      onClick={onClick}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={loading || success || undefined}
      data-testid={testId}
      {...aria}
    >
      {content}
    </button>
  );
}
