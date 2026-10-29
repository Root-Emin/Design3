import { CircleAlert, CircleCheck, Info, type LucideIcon } from "lucide-react";
import type { Toast } from "../../state/ToastProvider";
import { Icon } from "../icons/Icon";

const ICON: Record<Toast["tone"], LucideIcon> = { success: CircleCheck, info: Info, error: CircleAlert };

/** DS Snackbar (ters zeminli, isteğe bağlı eylemli). */
export function Snackbar({ toast }: { toast: Toast }) {
  return (
    <div
      className="en-snack pointer-events-auto animate-rise-fast motion-reduce:animate-none"
      role="status"
      aria-live="polite"
      data-testid="snackbar"
    >
      <span className="en-snack__icon">
        <Icon icon={ICON[toast.tone]} />
      </span>
      <p className="en-snack__msg">{toast.message}</p>
      {toast.action && (
        <div className="en-snack__actions">
          <button type="button" className="en-snack__action en-state en-focus" onClick={toast.action.onClick} data-testid="snackbar-action">
            {toast.action.label}
          </button>
        </div>
      )}
    </div>
  );
}
