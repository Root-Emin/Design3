import { createContext, use } from "react";
import { useLocation, useSearchParams } from "react-router";
import type { Version } from "../types";

export type RouteKey =
  | "ana" | "ara" | "basvurularim" | "basvuru" | "ilan" | "basvur" | "basari"
  | "mesajlar" | "mesaj" | "profil" | "kayitli-ilanlar" | "bildirimler";

export function routePath(ver: Version, route: RouteKey, id?: number): string {
  return `/${ver}/${route}${id == null ? "" : `/${id}`}`;
}

/** Adresteki sürüm: "/baseline/..." dışındaki her adres yeni tasarımdır. */
export function versionOf(pathname: string): Version {
  return pathname.split("/")[1] === "baseline" ? "baseline" : "v1";
}

/** Adresteki ekran anahtarı: "/v1/basvuru/3" → "basvuru"; "/v1" → "basvurularim". */
export function routeKeyOf(pathname: string): string {
  return pathname.split("/")[2] || "basvurularim";
}

const BACK_PARAM = "geri";

/** Adresin taşıdığı geri hedefi; yalnız uygulama içi yollar kabul edilir. */
function useBackParam(): string | null {
  const back = useSearchParams()[0].get(BACK_PARAM);
  return back?.startsWith("/") && !back.startsWith("//") ? back : null;
}

/**
 * Hedef adrese bu ekranın adresini ekler; hedefin geri düğmesi buraya döner.
 * "/v1/basvuru/3" → "/v1/basvuru/3?geri=%2Fv1%2Fmesaj%2F1". Zincirlenebilir (detay → ilan → detay → yazışma).
 * Hedef zaten bu ekranın geri hedefiyse o adres olduğu gibi kullanılır: ileri-geri gidip gelmek zinciri uzatmaz.
 */
export function useWithBack(): (to: string) => string {
  const { pathname, search } = useLocation();
  const back = useBackParam();
  return (to) => (back?.split("?")[0] === to ? back : `${to}?${BACK_PARAM}=${encodeURIComponent(pathname + search)}`);
}

/** Geri düğmesinin hedefi: adres geldiği ekranı taşıyorsa orası, yoksa `fallback`. */
export function useBackTarget(fallback: string): string {
  return useBackParam() ?? fallback;
}

export type NavKey = "ana" | "ara" | "basvurularim" | "mesajlar" | "profil";

const NAV_FOR_ROUTE: Record<string, NavKey> = {
  basvurularim: "basvurularim", basvuru: "basvurularim", bildirimler: "basvurularim",
  ana: "ana", ara: "ara", ilan: "ara", mesajlar: "mesajlar", mesaj: "mesajlar", profil: "profil",
  "kayitli-ilanlar": "profil",
};
export const navKeyFor = (routeKey: string): NavKey | undefined => NAV_FOR_ROUTE[routeKey];

/** Alt gezinme bu ekranlarda gizlenir. */
export const hidesBottomNav = (routeKey: string) => routeKey === "basari" || routeKey === "mesaj";

export const VersionContext = createContext<Version>("v1");
export const useVersion = () => use(VersionContext);
