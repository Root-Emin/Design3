export function formatTL(n: number): string {
  return "₺" + n.toLocaleString("tr-TR");
}

/** Şu anki saat, "SS.DD" biçiminde. */
export function clockNow(): string {
  return new Date().toTimeString().slice(0, 5).replace(":", ".");
}

/** "24 Eki" → "24.10.2026" (mevcut ekranın tarih biçimi). */
export function baselineDate(applied: string): string {
  return applied.replace(" Eki", ".10.2026").replace(" Eyl", ".09.2026");
}

const pad = (n: number) => String(n).padStart(2, "0");

/** ISO gün ("2026-10-27") ↔ o günün yerel gece yarısı. */
export const fromIsoDay = (iso: string) => new Date(`${iso}T00:00`);
export const toIsoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Yerel takvime göre gün ekler: addDays("2026-10-27", 1) → "2026-10-28". */
export function addDays(iso: string, days: number): string {
  const d = fromIsoDay(iso);
  d.setDate(d.getDate() + days);
  return toIsoDay(d);
}

/** "2026-11-03" → "3 Kasım 2026 Salı" */
export function formatLongDay(iso: string): string {
  return fromIsoDay(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" });
}

/** "2026-10-30T14:00" → "30 Ekim 2026 Cuma, 14.00" */
export function formatInterviewDate(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" });
  const time = d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }).replace(":", ".");
  return `${date}, ${time}`;
}

// Okunuşun son kelimesine göre bulunma eki: "bir"→de, "üç"→te, "altı"→da, "on"→da, "kırk"→ta …
const UNIT_SUFFIX = ["da", "de", "de", "te", "te", "te", "da", "de", "de", "da"];
const TENS_SUFFIX = ["da", "da", "de", "da", "ta", "de"];

/** Saatle biten metne bulunma eki ekler: "… 14.00" → "… 14.00’te", "… 10.30" → "… 10.30’da". */
export function withLocative(text: string): string {
  const m = /(\d{1,2})\.(\d{2})$/.exec(text);
  if (!m) return text;
  const n = m[2] === "00" ? Number(m[1]) : Number(m[2]);
  const suffix = n % 10 ? UNIT_SUFFIX[n % 10] : TENS_SUFFIX[n / 10];
  return `${text}’${suffix}`;
}
