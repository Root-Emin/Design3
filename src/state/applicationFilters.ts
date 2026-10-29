import { STATUS } from "../data/status";
import { TODAY_ISO } from "../data/user";
import { addDays, fromIsoDay } from "../lib/format";
import type { Application, ApplicationFilters, DateFilter, DatePreset, Job, StatusLabel } from "../types";

export const EMPTY_FILTERS: ApplicationFilters = {
  title: "",
  company: "",
  date: { preset: null, from: "", to: "" },
  statuses: [],
};

export const DATE_PRESETS: ReadonlyArray<readonly [DatePreset, string]> = [
  ["bugun", "Bugün"],
  ["7g", "Son 7 gün"],
  ["30g", "Son 30 gün"],
];

/** Hızlı seçimlerin kapsadığı gün sayısı, bugün dahil. */
const PRESET_DAYS: Record<DatePreset, number> = { bugun: 1, "7g": 7, "30g": 30 };

const normalize = (s: string) => s.trim().toLocaleLowerCase("tr-TR");

/**
 * Filtrenin kapsadığı gün aralığı. Hızlı seçimler prototipin "bugün"üne (TODAY_ISO) göre, yerel takvim
 * günüyle hesaplanır ve bugünü de içerir: "Son 7 gün" = bugün ve önceki 6 gün.
 */
export function dateRange(date: DateFilter): { from: string; to: string } {
  if (!date.preset) return { from: date.from, to: date.to };
  return { from: addDays(TODAY_ISO, -(PRESET_DAYS[date.preset] - 1)), to: TODAY_ISO };
}

export const hasDateFilter = (date: DateFilter) => date.preset !== null || date.from !== "" || date.to !== "";
export const isDateRangeInvalid = ({ from, to }: DateFilter) => from !== "" && to !== "" && from > to;

/** Başvuru, filtrelerin hepsine uyuyor mu? Boş ölçüt her başvuruya uyar. */
export function matchesFilters(app: Application, job: Job, status: StatusLabel, f: ApplicationFilters): boolean {
  const title = normalize(f.title);
  if (title && !normalize(job.title).includes(title)) return false;
  const company = normalize(f.company);
  if (company && !normalize(job.company).includes(company)) return false;
  // ISO günler sözlük sırasıyla karşılaştırılabilir; iki uç da dahildir.
  const { from, to } = dateRange(f.date);
  if (from && app.appliedOn < from) return false;
  if (to && app.appliedOn > to) return false;
  if (f.statuses.length && !f.statuses.includes(status)) return false;
  return true;
}

/** Filtre düğmesindeki sayı: her metin ve tarih ölçütü bir, her seçili durum bir sayılır. */
export function activeFilterCount(f: ApplicationFilters): number {
  return Number(f.title.trim() !== "") + Number(f.company.trim() !== "") + Number(hasDateFilter(f.date)) + f.statuses.length;
}

/** Metinleri kırpılmış hâl; uygulanan filtre ve etiketler bununla çalışır. */
export function normalizeFilters(f: ApplicationFilters): ApplicationFilters {
  return { ...f, title: f.title.trim(), company: f.company.trim() };
}

/** "2026-10-24" → "24 Eki"; bugünün yılından farklıysa yıl da yazılır. */
export function formatDay(iso: string): string {
  const d = fromIsoDay(iso);
  const sameYear = d.getFullYear() === fromIsoDay(TODAY_ISO).getFullYear();
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", ...(!sameYear && { year: "numeric" }) });
}

/** "2026-10-12" → "12 Eki 2026"; tarih kartlarında yıl her zaman yazılır. */
export function formatDate(iso: string): string {
  return fromIsoDay(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

function dateLabel(date: DateFilter): string {
  if (date.preset) return DATE_PRESETS.find(([p]) => p === date.preset)![1];
  if (date.from && date.to) return `${formatDay(date.from)} – ${formatDay(date.to)}`;
  return date.from ? `${formatDay(date.from)} ve sonrası` : `${formatDay(date.to)} ve öncesi`;
}

export interface ActiveFilterChip {
  id: string;
  label: string;
  /** Bu etiket kaldırıldığında kalan filtreler. */
  without: ApplicationFilters;
}

/** Aktif filtre etiketleri. `hideStatuses` içindeki durumlar başka bir yerde (hızlı seçim satırında) gösterildiği için atlanır. */
export function activeFilterChips(f: ApplicationFilters, hideStatuses: readonly StatusLabel[] = []): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];
  if (f.title) chips.push({ id: "title", label: `Pozisyon: ${f.title}`, without: { ...f, title: "" } });
  if (f.company) chips.push({ id: "company", label: `Şirket: ${f.company}`, without: { ...f, company: "" } });
  if (hasDateFilter(f.date)) chips.push({ id: "date", label: dateLabel(f.date), without: { ...f, date: EMPTY_FILTERS.date } });
  for (const s of f.statuses) {
    if (!hideStatuses.includes(s)) chips.push({ id: `status-${STATUS[s].key}`, label: s, without: { ...f, statuses: f.statuses.filter((v) => v !== s) } });
  }
  return chips;
}
