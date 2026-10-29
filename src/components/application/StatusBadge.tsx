import { STATUS } from "../../data/status";
import { cn } from "../../lib/utils";
import { statusLabel } from "../../state/appState";
import type { Application, StatusVariant } from "../../types";
import { Icon } from "../icons/Icon";

const statusClass = (v: StatusVariant) => (v === "application" ? "" : `ds-status--${v}`);

function BadgeContent({ app }: { app: Application }) {
  const label = statusLabel(app);
  return (
    <>
      <span className="ds-sr">Başvuru durumu: </span>
      <Icon icon={STATUS[label].icon} size={16} />
      <span className="ds-status__label">{label}</span>
    </>
  );
}

/** DS Status Badge (salt görüntü). */
export function StatusBadge({ app, size = "md" }: { app: Application; size?: "sm" | "md" }) {
  return (
    <span className={cn("ds-status", statusClass(STATUS[statusLabel(app)].variant), size === "sm" && "ds-status--sm")} data-testid="status-badge">
      <BadgeContent app={app} />
    </span>
  );
}
