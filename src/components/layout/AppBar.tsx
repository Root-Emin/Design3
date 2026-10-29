import { ArrowLeft, Bell, Bookmark, Menu, Search, User } from "lucide-react";
import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "../../lib/utils";
import { routePath, useVersion, useWithBack } from "../../routes/paths";
import { useAppState } from "../../state/AppStateProvider";
import { unreadCount } from "../../state/appState";
import { useTheme } from "../../state/ThemeProvider";
import { Icon } from "../icons/Icon";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../shadcn/dropdown-menu";
import { IconButton } from "../ui/IconButton";

interface AppBarProps {
  title?: string;
  /** Geri düğmesinin hedefi. */
  back?: string;
  /** Başlık yerine marka logosu; metin verilirse logo o metinle yazılır. */
  logo?: boolean | string;
  /** Geri, logo/başlık ve eylemler ortalı ızgarada durur (logo tam ortada). */
  center?: boolean;
  actions?: ReactNode;
  /** Bildirim zili (okunmamış sayısıyla). */
  bell?: boolean;
  /**
   * "rounded": birincil renkte, alt köşeleri yuvarlatılmış çubuk; ekranın en üstünden başlar ve
   * durum çubuğu (safe area) alanını da kaplar.
   */
  variant?: "default" | "rounded";
  /**
   * Yalnız "rounded": çubuğun altına yerleşen, alt kenardan yarı taşan alan (ör. arama kutusu).
   * Kaydırdıkça çubuğun altına kayıp kaybolur; çubuk kompakt hâlde üstte kalır.
   */
  bottom?: ReactNode;
  /** Alt alan kaydırmada kaybolmaz, çubuğun hemen altında sabit kalır (ör. sekmeler gibi gezinme öğeleri). */
  pinBottom?: boolean;
}

/**
 * DS App Bar (mobil, yüzey, ince alt çizgi). Kaydırmada üstte sabit kalır. "rounded" çubuğun alt alanı
 * çubuğun kardeşidir: çubuk yapışkan kalırken alt alan içerikle birlikte kayar, böylece çubuk kaydırma
 * konumuna bağlı olarak kompakt hâline iner (yükseklik değişmez, sayfa kaymaz).
 */
export function AppBar({ title = "", back, logo, center, actions, bell = true, variant = "default", bottom, pinBottom }: AppBarProps) {
  const ver = useVersion();
  const brand = typeof logo === "string" ? logo : "eleman.net";
  const rounded = variant === "rounded";
  const ref = useRef<HTMLElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasBottom = rounded && !!bottom;
  useBarThemeColor(ref, rounded);
  useCollapseFallback(ref, bottomRef, hasBottom && !pinBottom);
  return (
    <>
      {/* max-w-none: DS'in 420px sınırı 421–599px genişlikte sağda boşluk bırakıyordu. */}
      <header
        ref={ref}
        className={cn(
          "en-appbar en-appbar--mobile max-w-none",
          center && "en-appbar--center",
          rounded && "en-appbar--brand en-appbar--rounded",
        )}
      >
        <div className="en-appbar__start empty:w-12">
          {back && (
            <span className="en-appbar__action">
              <IconButton icon={ArrowLeft} label="Geri" to={back} testId="appbar-back" />
            </span>
          )}
        </div>
        <div className="en-appbar__center">
          {logo ? (
            <Link to={routePath(ver, "ana")} className="en-appbar__logo en-focus" aria-label={`${brand} ana sayfa`} data-testid="appbar-logo">
              {brand}
            </Link>
          ) : (
            <h1 className="en-appbar__title" tabIndex={-1} data-focus="">
              {title}
            </h1>
          )}
        </div>
        <div className="en-appbar__actions en-appbar__end">
          {actions && <span className="en-appbar__action">{actions}</span>}
          {bell && <NotificationBell />}
        </div>
      </header>
      {hasBottom && (
        <div ref={bottomRef} className={cn("en-appbar__bottom", pinBottom && "en-appbar__bottom--pinned")}>
          {bottom}
        </div>
      )}
    </>
  );
}

/**
 * Scroll-driven animations desteklemeyen tarayıcılar için (Firefox, eski Safari/WebView): daralma
 * ilerlemesi (0–1) kaydırmadan hesaplanır ve `--_p` olarak çubuğa ve alt alana yazılır. Passive dinleyici,
 * kare başına tek güncelleme (requestAnimationFrame); yalnız opacity/transform'u etkiler.
 */
function useCollapseFallback(bar: RefObject<HTMLElement | null>, bottom: RefObject<HTMLDivElement | null>, active: boolean) {
  useEffect(() => {
    const el = bottom.current;
    const scroller = el?.closest("main");
    if (!active || !el || !scroller || CSS.supports("animation-timeline: view()")) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const p = String(Math.min(1, Math.max(0, scroller.scrollTop / Math.max(1, el.offsetHeight))));
      el.style.setProperty("--_p", p);
      bar.current?.style.setProperty("--_p", p);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [bar, bottom, active]);
}

/**
 * Tarayıcının durum/adres çubuğu (Android Chrome `theme-color`) çubuğun zeminini alır; çubuk ekrandan
 * çıkınca önceki renge döner. Renk token'dan okunur, tema değişince yenilenir.
 */
function useBarThemeColor(ref: RefObject<HTMLElement | null>, active: boolean) {
  const { theme } = useTheme();
  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.append(meta);
    }
    const prev = meta.content;
    meta.content = getComputedStyle(el).getPropertyValue("--_bar-bg").trim();
    return () => {
      if (created) meta.remove();
      else meta.content = prev;
    };
  }, [ref, active, theme]);
}

/**
 * Okunmamış sayısını taşıyan bildirim zili. App Bar dışında (büyük başlıklı ekranlar) da kullanılır;
 * orada sayacın halkası için kapsayıcı `--_badge-ring` değişkenini zemin rengine eşitler.
 */
export function NotificationBell() {
  const ver = useVersion();
  const n = unreadCount(useAppState());
  const withBack = useWithBack();
  return (
    <span className="en-appbar__action">
      <IconButton
        icon={Bell}
        label={n ? `Bildirimler, ${n} okunmamış` : "Bildirimler"}
        to={withBack(routePath(ver, "bildirimler"))}
        testId="appbar-bell"
      />
      {n > 0 && (
        <span className="en-appbar__count en-num" aria-hidden="true">
          {n}
        </span>
      )}
    </span>
  );
}

/**
 * Çerçeveli menü düğmesi (shadcn Dropdown Menu): bildirimler, kaydedilen ilanlar ve profil. Zilin yerini
 * aldığı ekranlarda okunmamış bildirim varsa düğmede nokta görünür.
 */
export function AppMenu() {
  const ver = useVersion();
  const n = unreadCount(useAppState());
  const withBack = useWithBack();
  const { pathname } = useLocation();
  const all = [
    { label: n ? `Bildirimler (${n})` : "Bildirimler", icon: Bell, to: withBack(routePath(ver, "bildirimler")), testId: "appmenu-notifications" },
    { label: "Kaydedilen ilanlar", icon: Bookmark, to: routePath(ver, "kayitli-ilanlar"), testId: "appmenu-saved" },
    { label: "Profil", icon: User, to: routePath(ver, "profil"), testId: "appmenu-profile" },
  ];
  // Bulunulan ekranın satırı menüde gösterilmez.
  const items = all.filter((it) => it.to.split("?")[0] !== pathname);
  return (
    <span className="en-appbar__action">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton icon={Menu} variant="outlined" label={n ? `Menü, ${n} okunmamış bildirim` : "Menü"} testId="appbar-menu" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {items.map((it) => (
            <DropdownMenuItem key={it.testId} asChild>
              <Link to={it.to} data-testid={it.testId}>
                <Icon icon={it.icon} className="ds-icon text-secondary" />
                {it.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {n > 0 && <span className="en-appbar__dot" aria-hidden="true" />}
    </span>
  );
}

interface AppBarSearchProps {
  /** Alanın erişilebilir adı; görünür etiket yerine placeholder olarak da yazılır. */
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Klavyedeki "Ara" tuşu; verilirse alan bir form içinde gönderilir. */
  onSubmit?: () => void;
  testId: string;
}

/** Yuvarlatılmış çubuğun alt alanındaki arama kutusu: birincil ikon, etiketsiz, dokunulan her yer alana odaklanır. */
export function AppBarSearch({ label, value, onChange, onSubmit, testId }: AppBarSearchProps) {
  const field = (
    <label className="en-appbar__search">
      <Icon icon={Search} size={24} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        aria-label={label}
        autoComplete="off"
        enterKeyHint="search"
        data-testid={testId}
      />
    </label>
  );
  if (!onSubmit) return field;
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {field}
    </form>
  );
}
