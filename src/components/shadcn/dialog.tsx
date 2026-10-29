import { Dialog as DialogPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/*
 * shadcn Dialog, DS'e uyarlanmış. Odak hapsi, Esc ve örtüye tıklayınca kapanma Radix'ten gelir.
 * İçerik portalsız ve örtünün içinde çizilir: katmanlar telefon çerçevesinde kalır (OverlayHost).
 * DS Dialog (en-dialog) ve Bottom Sheet (en-sheet) ikisi de bunun üstüne kurulur.
 */

function Dialog(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogContent({
  className,
  overlayClassName,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { overlayClassName?: string }) {
  return (
    <DialogPrimitive.Overlay data-slot="dialog-overlay" className={cn("absolute inset-0", overlayClassName)}>
      <DialogPrimitive.Content data-slot="dialog-content" className={className} {...props}>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Overlay>
  );
}

function DialogTitle(props: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="dialog-title" {...props} />;
}

function DialogDescription(props: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description data-slot="dialog-description" {...props} />;
}

function DialogClose(props: ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle };
