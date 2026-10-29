import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/** Telefon çerçevesinin üstündeki katman: alt sayfalar ve onay penceresi. */
export type Overlay =
  | { kind: "apply"; jobId: number }
  | { kind: "filter" }
  | { kind: "applicationFilter" }
  | { kind: "withdraw"; appId: number }
  | { kind: "reschedule"; conversationId: number };

interface OverlayApi {
  openOverlay: (o: Overlay) => void;
  closeOverlay: () => void;
  /** Katmanı kapatır; `then`, katmanın geçmiş kaydı geri alındıktan sonra çalışır (ör. yeni ekrana gitmek). */
  closeOverlayThen: (then: () => void) => void;
}

const OverlayApiContext = createContext<OverlayApi | null>(null);
const OverlayValueContext = createContext<Overlay | null>(null);

/**
 * Katmanın geçmiş kaydındaki işaret; react-router'ın kaydı (`idx`) korunur, adres değişmez.
 * "end": uygulama içinden kapatılmış, ilerisinde kayıt olmayan katman kaydı.
 */
const MARK = "overlay";

type HistoryState = { [MARK]?: true | "end"; idx?: number } | null;
const historyState = () => window.history.state as HistoryState;

/**
 * Katmanlar tarayıcı/cihaz geri tuşuna bağlıdır: açılınca geçmişe aynı adresle bir kayıt eklenir,
 * geri tuşu sayfadan çıkmak yerine katmanı kapatır. Uygulama içinden kapatınca kayıt geri alınır.
 * Katman açıkken başka ekrana geçilirse geride kalan kayıt geri/ileri giderken atlanır.
 */
export function OverlayProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const isOpen = useRef(false);
  // Katmanın kaydı geri alınıyor; popstate gelince `afterPop` çalışır.
  const popping = useRef(false);
  const afterPop = useRef<(() => void) | null>(null);
  // Son bilinen konumun react-router sırası; atlanacak kayda hangi yönden gelindiğini söyler.
  const lastIdx = useRef<number | undefined>(undefined);

  const openOverlay = useCallback((o: Overlay) => {
    // Kayıt geri alınırken yeniden açıldıysa kayıt popstate'te yeniden eklenir.
    if (!popping.current && historyState()?.[MARK] !== true) window.history.pushState({ ...historyState(), [MARK]: true }, "");
    isOpen.current = true;
    setOverlay(o);
  }, []);

  const close = useCallback((then?: () => void) => {
    const wasOpen = isOpen.current;
    isOpen.current = false;
    setOverlay(null);
    lastIdx.current = historyState()?.idx;
    if (wasOpen && historyState()?.[MARK] === true && !popping.current) {
      popping.current = true;
      afterPop.current = then ?? null;
      window.history.replaceState({ ...historyState(), [MARK]: "end" }, "");
      window.history.back();
    } else if (popping.current) {
      afterPop.current = then ?? afterPop.current;
    } else {
      then?.();
    }
  }, []);
  const closeOverlay = useCallback(() => close(), [close]);

  useEffect(() => {
    const onPop = () => {
      const st = historyState();
      const from = lastIdx.current;
      lastIdx.current = st?.idx;
      if (popping.current) {
        popping.current = false;
        if (isOpen.current) window.history.pushState({ ...historyState(), [MARK]: true }, "");
        const then = afterPop.current;
        afterPop.current = null;
        then?.();
        return;
      }
      if (st?.[MARK]) {
        // Kapanmış bir katmanın kaydı: ekran değişmeyeceği için geldiği yönde atlanır.
        if (!isOpen.current) {
          const forward = st[MARK] === true && from !== undefined && st.idx !== undefined && from <= st.idx;
          if (forward) window.history.forward();
          else window.history.back();
        }
      } else if (isOpen.current) {
        // Geri tuşu: katman kapanır, ekran yerinde kalır.
        isOpen.current = false;
        setOverlay(null);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const api = useMemo(() => ({ openOverlay, closeOverlay, closeOverlayThen: close }), [openOverlay, closeOverlay, close]);
  return (
    <OverlayApiContext value={api}>
      <OverlayValueContext value={overlay}>{children}</OverlayValueContext>
    </OverlayApiContext>
  );
}

export function useOverlay(): OverlayApi {
  const api = use(OverlayApiContext);
  if (!api) throw new Error("useOverlay, OverlayProvider içinde kullanılmalı");
  return api;
}

export const useCurrentOverlay = () => use(OverlayValueContext);
