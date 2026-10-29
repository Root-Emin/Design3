import { useLayoutEffect, useRef } from "react";
import { cn } from "../lib/utils";
import { useCurrentOverlay } from "../state/OverlayProvider";
import { ApplicationFilterSheet } from "./applications/ApplicationFilterSheet";
import { ApplySheet } from "./apply/ApplySheet";
import { RescheduleSheet } from "./chat/RescheduleSheet";
import { FilterSheet } from "./search/FilterSheet";
import { WithdrawDialog } from "./withdraw/WithdrawDialog";

/**
 * Çerçeve içi katman. Odak hapsi, ilk odak ve Esc shadcn Dialog'dan (Radix) gelir. Katmanlar
 * tetikleyicisiz açıldığından odağı açan öğeye geri vermek burada yapılır.
 */
export function OverlayHost() {
  const overlay = useCurrentOverlay();
  const returnFocus = useRef<Element | null>(null);
  const kind = overlay?.kind;

  useLayoutEffect(() => {
    if (!kind) return;
    returnFocus.current = document.activeElement;
    return () => {
      const el = returnFocus.current;
      if (el instanceof HTMLElement && document.contains(el)) el.focus();
    };
  }, [kind]);

  return (
    <div className={cn("absolute inset-0 z-(--z-modal)", overlay ? "flex" : "hidden")}>
      {overlay?.kind === "apply" && <ApplySheet jobId={overlay.jobId} />}
      {overlay?.kind === "filter" && <FilterSheet />}
      {overlay?.kind === "applicationFilter" && <ApplicationFilterSheet />}
      {overlay?.kind === "withdraw" && <WithdrawDialog appId={overlay.appId} />}
      {overlay?.kind === "reschedule" && <RescheduleSheet conversationId={overlay.conversationId} />}
    </div>
  );
}
