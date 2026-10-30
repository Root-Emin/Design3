import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Briefcase, House, MessageSquare, Search, User, type LucideIcon } from "lucide-react";
import { Link } from "react-router";
import { routePath, useVersion, type NavKey } from "../../routes/paths";
import { useAppState } from "../../state/AppStateProvider";
import { unreadCount } from "../../state/appState";
import { Icon } from "../icons/Icon";

const ITEMS: ReadonlyArray<readonly [NavKey, LucideIcon, string]> = [
  ["ana", House, "Ana sayfa"],
  ["ara", Search, "İş ara"],
  ["basvurularim", Briefcase, "Başvurularım"],
  ["mesajlar", MessageSquare, "Mesajlar"],
  ["profil", User, "Profil"],
];

/**
 * DS Bottom Navigation (liquid glass yüzen kapsül). Aktif sekmeyi kayan cam pill işaretler.
 * Başvurularım sekmesi okunmamış güncelleme sayısını taşır.
 */
export function BottomNav({ active }: { active?: NavKey }) {
  const ver = useVersion();
  const n = unreadCount(useAppState());
  const navRef = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  // Cam pill aktif sekmeyi kaplar. Sekme genişlikleri etiketlere göre değiştiğinden konum ölçülür;
  // pill ilk ölçümden sonra çizilir, böylece yalnız sekme değişiminde kayar.
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const place = () => {
      const item = nav.querySelector<HTMLElement>('[aria-current="page"]');
      if (!item) return setPill(null);
      const box = item.getBoundingClientRect();
      setPill({ x: box.left - nav.getBoundingClientRect().left, w: box.width });
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(nav);
    nav.querySelectorAll(".ds-bnav__item").forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [active]);

  return (
    <nav ref={navRef} className="ds-bnav ds-bnav--glass max-w-none" aria-label="Ana gezinme">
      {pill && (
        <span
          className="ds-bnav__pill"
          style={{ "--bnav-x": `${pill.x}px`, "--bnav-w": `${pill.w}px` } as CSSProperties}
          aria-hidden="true"
        />
      )}
      {ITEMS.map(([key, icon, label]) => (
        <Link
          key={key}
          to={routePath(ver, key)}
          state={{ source: "bottom_nav" }}
          className="ds-bnav__item"
          aria-current={active === key ? "page" : undefined}
          data-testid={`nav-${key}`}
        >
          <span className="ds-bnav__icon">
            <Icon icon={icon} size={24} />
            {key === "basvurularim" && n > 0 && (
              <>
                <span className="ds-bnav__badge" aria-hidden="true">
                  {n > 99 ? "99+" : n}
                </span>
                <span className="ds-sr">, {n} yeni durum güncellemesi</span>
              </>
            )}
          </span>
          <span className="ds-bnav__label">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
