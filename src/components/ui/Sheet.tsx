import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "../shadcn/dialog";
import { Icon } from "../icons/Icon";

interface SheetProps {
  title: string;
  closeLabel: string;
  onClose: () => void;
  /** "full": ekranın %94'ü; "auto": içerik kadar. */
  size: "full" | "auto";
  footer: ReactNode;
  testId: string;
  children: ReactNode;
}

/** DS Bottom Sheet (shadcn Dialog üzerine), telefon çerçevesinin katmanında. Örtüye tıklamak ya da Esc kapatır. */
export function Sheet({ title, closeLabel, onClose, size, footer, testId, children }: SheetProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        overlayClassName="en-sheet-frame m-0 h-auto max-w-none rounded-none animate-fade motion-reduce:animate-none"
        className={cn(
          "en-sheet animate-rise motion-reduce:animate-none",
          size === "full" ? "en-sheet--full h-[94%] max-h-full" : "en-sheet--auto h-auto max-h-[92%]",
        )}
        aria-describedby={undefined}
        data-testid={testId}
      >
        <div className="en-sheet__handle" aria-hidden="true" />
        <header className="en-sheet__head">
          <DialogTitle className="en-sheet__title">{title}</DialogTitle>
          <DialogClose className="en-sheet__close en-state en-focus en-hit" aria-label={closeLabel} data-testid="sheet-close">
            <Icon icon={X} size={24} />
          </DialogClose>
        </header>
        <div className="en-sheet__body">{children}</div>
        <footer className="en-sheet__foot">{footer}</footer>
      </DialogContent>
    </Dialog>
  );
}
