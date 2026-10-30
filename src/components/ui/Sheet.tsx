import { X } from "lucide-react";
import { useRef, type ReactNode } from "react";
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
  /** Açılınca odak ilk alana değil başlığa taşınır (ekran okuyucu önce sayfanın adını duyar). */
  focusTitle?: boolean;
  testId: string;
  children: ReactNode;
}

/** DS Bottom Sheet (shadcn Dialog üzerine), telefon çerçevesinin katmanında. Örtüye tıklamak ya da Esc kapatır. */
export function Sheet({ title, closeLabel, onClose, size, footer, focusTitle, testId, children }: SheetProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        overlayClassName="en-sheet-frame m-0 h-auto max-w-none rounded-none animate-fade motion-reduce:animate-none"
        className={cn(
          "en-sheet animate-rise motion-reduce:animate-none",
          size === "full" ? "en-sheet--full h-[94%] max-h-full" : "en-sheet--auto h-auto max-h-[92%]",
        )}
        aria-describedby={undefined}
        onOpenAutoFocus={
          focusTitle
            ? (e) => {
                e.preventDefault();
                titleRef.current?.focus();
              }
            : undefined
        }
        data-testid={testId}
      >
        <div className="en-sheet__handle" aria-hidden="true" />
        <header className="en-sheet__head">
          <DialogTitle ref={titleRef} className="en-sheet__title outline-none" tabIndex={focusTitle ? -1 : undefined}>
            {title}
          </DialogTitle>
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
