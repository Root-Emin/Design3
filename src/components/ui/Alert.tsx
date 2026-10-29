import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Icon } from "../icons/Icon";

type AlertTone = "info" | "error" | "success" | "warning";

const ICON: Record<AlertTone, LucideIcon> = {
  info: Info,
  error: CircleAlert,
  success: CircleCheck,
  warning: TriangleAlert,
};

interface AlertProps {
  tone: AlertTone;
  title: string;
  message: string;
  action?: ReactNode;
}

/** DS Alert (satır içi, sol vurgu çizgili). */
export function Alert({ tone, title, message, action }: AlertProps) {
  return (
    <div className={`ds-alert ds-alert--${tone} max-w-none`} role={tone === "error" || tone === "warning" ? "alert" : "status"}>
      <span className="ds-alert__icon">
        <Icon icon={ICON[tone]} />
      </span>
      <div className="ds-alert__body">
        <p className="ds-alert__title">{title}</p>
        <p className="ds-alert__msg">{message}</p>
        {action && <div className="ds-alert__actions">{action}</div>}
      </div>
    </div>
  );
}
