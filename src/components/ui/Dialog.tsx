import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { DialogContent, DialogDescription, DialogTitle, Dialog as DialogRoot } from "../shadcn/dialog";
import { Icon } from "../icons/Icon";

interface DialogProps {
  icon: LucideIcon;
  title: string;
  body: string;
  actions: ReactNode;
  onClose: () => void;
  testId: string;
}

/** DS Dialog, yıkıcı işlem onayı (shadcn Dialog üzerine). Örtüye tıklamak ya da Esc kapatır. */
export function Dialog({ icon, title, body, actions, onClose, testId }: DialogProps) {
  return (
    <DialogRoot open onOpenChange={(open) => !open && onClose()}>
      <DialogContent overlayClassName="en-dialog-frame has-scrim min-h-0 rounded-none" className="en-dialog" data-testid={testId}>
        <span className="en-dialog__icon is-destructive">
          <Icon icon={icon} size={24} />
        </span>
        <DialogTitle className="en-dialog__title">{title}</DialogTitle>
        <DialogDescription className="en-dialog__body">{body}</DialogDescription>
        <div className="en-dialog__actions">{actions}</div>
      </DialogContent>
    </DialogRoot>
  );
}
