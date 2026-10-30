import { useEffect, useRef } from "react";
import { USER } from "../data/user";
import { routeKeyOf, versionOf } from "../routes/paths";

/**
 * Handoff'taki tracking plan (Bölüm 7). Prototip arka uca bağlı değildir: event'ler konsola yazılır ve
 * `window.__events` listesinde birikir; sentetik test ve usability test notları bu listeden okunur.
 * Anket (ces_*) event'leri, anket tasarlanmadığı için henüz atılmıyor.
 */
export type EventName =
  | "applications_list_viewed"
  | "application_detail_viewed"
  | "job_detail_viewed"
  | "ces_prompt_shown"
  | "ces_submitted"
  | "ces_dismissed"
  | "applications_list_loaded"
  | "application_detail_loaded"
  | "applications_load_failed"
  | "applications_tab_changed"
  | "applications_status_chip_selected"
  | "applications_filter_opened"
  | "applications_filter_applied"
  | "applications_filter_cleared"
  | "application_card_tapped"
  | "application_activity_tapped"
  | "application_message_opened"
  | "application_job_opened"
  | "application_withdraw_started"
  | "application_withdraw_cancelled"
  | "application_withdraw_confirmed"
  | "application_withdraw_undone"
  | "applications_empty_viewed"
  | "applications_retry_tapped";

export type EventProps = Record<string, string | number | boolean | null>;

export interface TrackedEvent extends EventProps {
  event: EventName;
  user_id: string;
  session_id: string;
  timestamp: string;
  platform: string;
  theme: string;
  version: string;
}

declare global {
  interface Window {
    __events?: TrackedEvent[];
  }
}

const SESSION_ID = Math.random().toString(36).slice(2, 10);

export function track(event: EventName, props: EventProps = {}): void {
  const payload: TrackedEvent = {
    ...props,
    event,
    user_id: USER.email,
    session_id: SESSION_ID,
    timestamp: new Date().toISOString(),
    platform: "web",
    theme: document.documentElement.getAttribute("data-theme") ?? "light",
    // Hash tabanlı yönlendirme: adres "#/v1/..." biçiminde.
    version: versionOf(window.location.hash.slice(1)),
  };
  (window.__events ??= []).push(payload);
  console.info("[analytics]", event, payload);
}

/** Ekran açılışı gibi bir kez atılan event; `key` değişince (ör. başka bir başvuru) yeniden atılır. */
export function useTrackOnce(event: EventName, props: EventProps | (() => EventProps), enabled = true, key: unknown = null): void {
  const sent = useRef<unknown>(Symbol());
  useEffect(() => {
    if (!enabled || sent.current === key) return;
    sent.current = key;
    track(event, typeof props === "function" ? props() : props);
  });
}

/** Ekranın açıldığı andan ilk içeriğin görünmesine kadar geçen süre; `ready` true olunca bir kez atılır. */
export function useTrackLoaded(event: EventName, ready: boolean, props: EventProps, key: unknown = null): void {
  const start = useRef<{ key: unknown; at: number } | null>(null);
  // useTrackOnce'tan önce tanımlandığı için aynı karede önce bu çalışır.
  useEffect(() => {
    if (start.current?.key !== key) start.current = { key, at: performance.now() };
  }, [key]);
  useTrackOnce(
    event,
    () => ({ ...props, duration_ms: Math.round(performance.now() - (start.current?.at ?? performance.now())) }),
    ready,
    key,
  );
}

/** Geri hedefinin (`?geri=`) ekran anahtarı; açılan ekranın nereden geldiğini gösterir. */
export function sourceRoute(search: string): string | null {
  const back = new URLSearchParams(search).get("geri");
  return back ? routeKeyOf(back.split("?")[0]) : null;
}
