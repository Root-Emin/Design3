import { useLayoutEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router";
import { DemoPanel } from "../../features/demo/DemoPanel";
import { OverlayHost } from "../../features/OverlayHost";
import { cn } from "../../lib/utils";
import { hidesBottomNav, navKeyFor, routeKeyOf, versionOf, VersionContext } from "../../routes/paths";
import { useOverlay } from "../../state/OverlayProvider";
import { useCurrentToast } from "../../state/ToastProvider";
import { Snackbar } from "../ui/Snackbar";
import { BottomNav } from "./BottomNav";

/**
 * Uygulama çerçevesi: kaydırılan ekran, alt gezinme, katman (sheet/dialog) ve snackbar alanı.
 * 600px altında tam ekrana yayılır; üstünde ekran yüksekliğinde, ortalı mobil genişlikte bir sütundur.
 * Çerçevenin dış boşluğu ve köşe yarıçapı yoktur: üst çubuk ekranın en üstünden kenardan kenara başlar,
 * köşe yarıçapını yalnız çubuğun kendisi (rounded varyant, alt köşeler) taşır.
 */
export function AppShell() {
  const { pathname } = useLocation();
  const version = versionOf(pathname);
  const routeKey = routeKeyOf(pathname);
  const showNav = !hidesBottomNav(routeKey);
  const screenRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const { closeOverlay } = useOverlay();
  const toast = useCurrentToast();

  // Ekran değişince: katmanı kapat, başa kaydır, odak zaten sayfadaysa yeni başlığa taşı.
  useLayoutEffect(() => {
    closeOverlay();
    const screen = screenRef.current;
    if (!screen) return;
    screen.scrollTop = 0;
    const heading = screen.querySelector<HTMLElement>("[data-focus]") ?? screen.querySelector<HTMLElement>("h1, h2");
    if (heading && document.activeElement !== document.body) {
      if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }, [pathname, closeOverlay]);

  // Alt gezinme ekranın üstünde durur (içerik camın altından geçer); ekran gezinme yüksekliği kadar
  // alttan boşluk bırakır, alttaki yapışkan çubuklar da bu payı kullanır. Kendi zemini olan sayfada
  // (Mesajlar: bg-subtle) bu boşluk da aynı zemini alır; camın arkası her ekranda sayfanın devamıdır.
  useLayoutEffect(() => {
    const nav = navRef.current;
    const frame = nav?.parentElement;
    if (!nav || !frame) return;
    const sync = () => frame.style.setProperty("--bnav-overlap", `${nav.offsetHeight}px`);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  return (
    <VersionContext value={version}>
      <div className="grid size-full justify-items-center">
        <div className="relative flex h-full w-[390px] max-w-full flex-col overflow-hidden bg-canvas shadow-frame max-medium:w-full max-medium:shadow-none">
          <main
            ref={screenRef}
            className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-canvas has-[>.bg-subtle]:bg-subtle pb-[var(--bnav-overlap,0px)] scroll-pb-[var(--bnav-overlap,0px)] focus:outline-none"
            tabIndex={-1}
            aria-live="off"
          >
            <Outlet />
          </main>
          <div ref={navRef} className="absolute inset-x-0 bottom-0 z-(--z-sticky)">
            {showNav && <BottomNav active={navKeyFor(routeKey)} />}
          </div>
          <OverlayHost />
          <div
            className={cn(
              "pointer-events-none absolute right-16 left-16 z-(--z-toast) flex justify-center",
              showNav ? "bottom-[calc(var(--bnav-overlap,var(--size-bottomnav))+var(--space-12))]" : "bottom-16",
            )}
          >
            {toast && <Snackbar key={toast.id} toast={toast} />}
          </div>
        </div>
      </div>
      <DemoPanel />
    </VersionContext>
  );
}
