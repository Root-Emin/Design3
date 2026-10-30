import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  CircleMinus,
  Clock,
  Eye,
  FileText,
  ListFilter,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Icon, type LucideIcon } from "../../components/icons/Icon";
import { Button } from "../../components/ui/Button";
import { FilterChip } from "../../components/ui/Chip";
import { Sheet } from "../../components/ui/Sheet";
import { TextField } from "../../components/ui/TextField";
import { STATUS, STATUS_LABELS } from "../../data/status";
import { TODAY_ISO } from "../../data/user";
import { track } from "../../lib/analytics";
import { cn } from "../../lib/utils";
import { useAppDispatch, useAppState } from "../../state/AppStateProvider";
import {
  activeFilterCount,
  DATE_PRESETS,
  dateRange,
  EMPTY_FILTERS,
  formatDate,
  hasDateFilter,
  isDateRangeInvalid,
  normalizeFilters,
} from "../../state/applicationFilters";
import { filterApps, isClosed, statusLabel } from "../../state/appState";
import { useOverlay } from "../../state/OverlayProvider";
import type { ApplicationFilters, DatePreset, StatusLabel } from "../../types";

const tone = (token: string, subtle = `${token}-subtle`) => ({ color: `var(${token})`, backgroundColor: `var(${subtle})` });

/**
 * Filtredeki durum ikonları: her durum kendi ikonu ve rengiyle ayrışır. Renkler DS token'larıdır, koyu temada
 * kendiliğinden değişir; Başvuruldu ile Mülakat, kartlardaki rozetler gibi aynı mavi aileyi paylaşır
 * (DS'te mor/turuncu yok). Geri çekme, sonuçlanmayandan ayrılsın diye kırmızı tonu alır.
 */
const OPTION: Record<StatusLabel, { icon: LucideIcon; style: ReturnType<typeof tone> }> = {
  "Başvuruldu": { icon: Send, style: tone("--status-application") },
  "Görüntülendi": { icon: Eye, style: tone("--status-viewed") },
  "Değerlendirmede": { icon: Clock, style: tone("--status-pending") },
  "Mülakat": { icon: Users, style: tone("--feedback-info") },
  "Teklif": { icon: FileText, style: tone("--feedback-success") },
  "Sonuçlanmadı": { icon: CircleMinus, style: tone("--status-closed") },
  "Geri çekildi": { icon: X, style: tone("--feedback-error") },
};

interface SectionProps {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}

function Section({ id, icon, title, description, children }: SectionProps) {
  return (
    <section className="grid gap-16 not-first:pt-20 not-first:shadow-hairline-top" aria-labelledby={`${id}-t`} aria-describedby={`${id}-d`}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-12">
        <span className="grid size-40 place-items-center rounded-full bg-(--action-secondary) text-(--action-on-secondary)">
          <Icon icon={icon} />
        </span>
        <div className="grid gap-2">
          <h3 className="m-0 text-title text-primary" id={`${id}-t`}>
            {title}
          </h3>
          <p className="m-0 text-body-md text-secondary" id={`${id}-d`}>
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

interface DateCardProps {
  id: string;
  label: string;
  value: string;
  min?: string;
  max?: string;
  invalid: boolean;
  errorId: string;
  onChange: (value: string) => void;
  testId: string;
}

/**
 * Tarih kartı. Kartın üstünde görünmez bir yerel tarih alanı durur: dokunmak platformun takvimini açar,
 * klavye ve ekran okuyucu da yerel alanla çalışır.
 */
function DateCard({ id, label, value, min, max, invalid, errorId, onChange, testId }: DateCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const openPicker = () => {
    try {
      inputRef.current?.showPicker();
    } catch {
      // showPicker desteklenmiyorsa yerel alanın kendi davranışı kalır.
    }
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  };

  return (
    <div
      className={cn(
        "@container relative flex min-h-[64px] min-w-0 items-center gap-8 rounded-card bg-surface py-8 pr-8 pl-12 shadow-hairline",
        "has-[:focus-visible]:shadow-[inset_0_0_0_2px_var(--border-focus)]",
        invalid && "shadow-[inset_0_0_0_2px_var(--feedback-error)]",
      )}
    >
      <span className="grid size-[28px] flex-none place-items-center rounded-full bg-(--action-secondary) text-(--action-on-secondary) @max-[8.5rem]:hidden">
        <Icon icon={CalendarDays} size={16} />
      </span>
      <span className="grid min-w-0 flex-1" aria-hidden="true">
        <span className="text-caption text-secondary">{label}</span>
        <span className={cn("[font:var(--type-label)]", value ? "font-semibold text-primary" : "text-tertiary")}>
          {value ? formatDate(value) : "Tarih seç"}
        </span>
      </span>
      <Icon icon={ChevronDown} size={16} className="ds-icon -ml-4 text-secondary" />
      <input
        ref={inputRef}
        id={id}
        type="date"
        className="absolute inset-0 m-0 size-full cursor-pointer appearance-none border-0 p-0 opacity-0"
        value={value}
        min={min}
        max={max}
        aria-label={`${label} tarihi`}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : undefined}
        onChange={(e) => onChange(e.target.value)}
        onClick={openPicker}
        onKeyDown={onKeyDown}
        data-testid={testId}
      />
    </div>
  );
}

interface StatusOptionProps {
  status: StatusLabel;
  count: number;
  selected: boolean;
  onToggle: () => void;
}

/**
 * Durum kartı: ikon solda, sayı sağda, ad altta tam genişlikte. İki sütunda en uzun ad ("Değerlendirmede")
 * ikonla sayının arasına sığmadığı için ad kendi satırını alır; böylece hiçbir ad kesilmez ya da bölünmez.
 * Seçim yalnız renkle değil onay işaretiyle de gösterilir, ekran okuyucuya aria-pressed ile duyurulur.
 */
function StatusOption({ status, count, selected, onToggle }: StatusOptionProps) {
  const meta = STATUS[status];
  return (
    <button
      type="button"
      className={cn(
        "en-state en-focus grid min-w-0 cursor-pointer content-start gap-8 rounded-card border-0 bg-surface p-12 text-left text-primary shadow-hairline",
        selected && "bg-(--surface-selected) shadow-[inset_0_0_0_1.5px_var(--border-selected)]",
      )}
      aria-pressed={selected}
      onClick={onToggle}
      data-testid={`app-filter-status-${meta.key}`}
    >
      <span className="flex items-center justify-between gap-8">
        <span className="relative grid size-32 flex-none place-items-center rounded-full" style={OPTION[status].style}>
          <Icon icon={OPTION[status].icon} size={16} strokeWidth={2} />
          {/* Seçimde durum rengi korunur; onay işareti ikonun köşesine eklenir. */}
          {selected && (
            <span className="absolute -right-4 -bottom-4 grid size-16 place-items-center rounded-full bg-(--action-primary) text-(--action-on-primary) shadow-[0_0_0_2px_var(--surface-selected)]">
              <Icon icon={Check} size={12} strokeWidth={3} />
            </span>
          )}
        </span>
        <span
          className={cn(
            "en-num min-w-24 rounded-full px-8 text-center text-caption font-semibold",
            selected ? "bg-(--action-secondary-hover) text-(--action-on-secondary)" : "bg-(--bg-muted)",
            !selected && (count ? "text-secondary" : "text-tertiary"),
          )}
        >
          {count}
          <span className="en-sr"> başvuru</span>
        </span>
      </span>
      <span className="min-w-0 [font:var(--type-label)] [overflow-wrap:anywhere]">{status}</span>
    </button>
  );
}

/**
 * Başvurularım filtresi (alt sayfa). Seçimler önce taslakta tutulur, liste yalnız "göster" ile
 * güncellenir; sayılar yüklü başvurular üzerinden yerelde hesaplanır, istek atılmaz.
 */
export function ApplicationFilterSheet() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { closeOverlay } = useOverlay();
  const [draft, setDraft] = useState<ApplicationFilters>(state.appFilters);
  // "Özel aralık" tarih seçilmeden de seçili görünebilsin diye; tarih girilince aralığın kendisi yeter.
  const [customPicked, setCustomPicked] = useState(false);

  const invalidRange = isDateRangeInvalid(draft.date);
  const results = filterApps(state, draft);
  // Durum sayıları diğer ölçütlere göre: bir durumu seçince kaç başvuru ekleneceğini gösterir.
  const withoutStatus = filterApps(state, { ...draft, statuses: [] });
  const shownRange = dateRange(draft.date);
  const customSelected = draft.date.preset === null && (customPicked || hasDateFilter(draft.date));
  const canClear = activeFilterCount(draft) > 0 || customSelected;

  const set = (patch: Partial<ApplicationFilters>) => setDraft((d) => ({ ...d, ...patch }));
  const toggleStatus = (s: StatusLabel) =>
    setDraft((d) => ({ ...d, statuses: d.statuses.includes(s) ? d.statuses.filter((v) => v !== s) : [...d.statuses, s] }));
  const togglePreset = (p: DatePreset) => {
    setCustomPicked(false);
    set({ date: draft.date.preset === p ? EMPTY_FILTERS.date : { preset: p, from: "", to: "" } });
  };
  // Özel aralığa geçerken hızlı seçimin hesapladığı günler düzenlenebilir başlangıç olarak kalır.
  const toggleCustom = () => {
    setCustomPicked(!customSelected);
    set({ date: customSelected ? EMPTY_FILTERS.date : { preset: null, ...shownRange } });
  };
  // Gün elle değişince hızlı seçim özel aralığa döner; diğer uç görünen değerini korur.
  const setDay = (edge: "from" | "to", value: string) => set({ date: { ...shownRange, preset: null, [edge]: value } });

  function clear() {
    track("applications_filter_cleared", { cleared_filter_count: activeFilterCount(draft) });
    setCustomPicked(false);
    setDraft(EMPTY_FILTERS);
  }

  function apply() {
    if (invalidRange) return;
    const filters = normalizeFilters(draft);
    track("applications_filter_applied", {
      has_position_query: filters.title !== "",
      has_company_query: filters.company !== "",
      date_preset: filters.date.preset ?? (hasDateFilter(filters.date) ? "custom" : null),
      result_count: results.length,
    });
    dispatch({ type: "setAppFilters", filters });
    // Sonuçların hepsi diğer sekmedeyse oraya geç: boş bir sekmede bırakma.
    const open = results.filter((a) => !isClosed(a)).length;
    const onOpenTab = state.tab === "devam";
    if (results.length && (onOpenTab ? open === 0 : open === results.length)) {
      dispatch({ type: "setTab", tab: onOpenTab ? "sonuc" : "devam" });
    }
    closeOverlay();
  }

  const onEnter = (e: KeyboardEvent) => e.key === "Enter" && apply();
  const noMatch = results.length === 0 && state.apps.length > 0 && !invalidRange;

  return (
    <Sheet
      title="Başvuruları filtrele"
      closeLabel="Kapat"
      onClose={closeOverlay}
      size="auto"
      focusTitle
      testId="app-filter-sheet"
      footer={
        <div className="grid w-full gap-8">
          {noMatch && (
            <p className="m-0 flex items-center gap-4 text-caption text-secondary" data-testid="app-filter-no-match">
              <Icon icon={CircleAlert} size={16} />
              Bu filtrelere uyan başvuru yok. Birkaç ölçütü kaldırmayı dene.
            </p>
          )}
          <div className="flex items-center gap-8">
            <Button variant="tertiary" size="lg" onClick={clear} disabled={!canClear} testId="app-filter-clear">
              Temizle
            </Button>
            <Button size="lg" block onClick={apply} disabled={invalidRange} testId="app-filter-apply">
              {results.length ? `${results.length} başvuruyu göster` : "Sonuçları göster"}
            </Button>
          </div>
          <p className="en-sr" aria-live="polite">
            {invalidRange ? "" : `Filtrelere uyan ${results.length} başvuru var.`}
          </p>
        </div>
      }
    >
      <Section id="af-g1" icon={Briefcase} title="Pozisyon ve şirket" description="Belirli bir pozisyonun ya da şirketin başvurularını filtrele.">
        <TextField
          id="af-title"
          label="Pozisyon adı"
          icon={Search}
          type="search"
          value={draft.title}
          onChange={(e) => set({ title: e.target.value })}
          onKeyDown={onEnter}
          placeholder="Tasarımcı, geliştirici..."
          autoComplete="off"
          enterKeyHint="search"
          testId="app-filter-title"
        />
        <TextField
          id="af-company"
          label="Şirket adı"
          icon={Building2}
          type="search"
          value={draft.company}
          onChange={(e) => set({ company: e.target.value })}
          onKeyDown={onEnter}
          placeholder="Şirket adını yaz"
          autoComplete="off"
          enterKeyHint="search"
          testId="app-filter-company"
        />
      </Section>

      <Section id="af-g2" icon={CalendarDays} title="Başvuru tarihi" description="Başvurduğun tarih aralığını seç.">
        {/* Dört seçim telefonda tek satıra sığmaz: dengeli 2×2, yer olunca tek satır. */}
        <div className="@container" role="group" aria-labelledby="af-g2-t">
          <div className="grid grid-cols-2 gap-8 *:justify-center @min-[33rem]:grid-cols-4">
            {DATE_PRESETS.map(([p, label]) => (
              <FilterChip key={p} label={label} selected={draft.date.preset === p} onClick={() => togglePreset(p)} testId={`app-filter-date-${p}`} />
            ))}
            <FilterChip label="Özel aralık" selected={customSelected} onClick={toggleCustom} testId="app-filter-date-ozel" />
          </div>
        </div>
        <div className="grid gap-8">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
            <DateCard
              id="af-from"
              label="Başlangıç"
              value={shownRange.from}
              max={shownRange.to || TODAY_ISO}
              invalid={invalidRange}
              errorId="af-date-error"
              onChange={(v) => setDay("from", v)}
              testId="app-filter-from"
            />
            <Icon icon={ArrowRight} size={16} className="ds-icon text-tertiary" />
            <DateCard
              id="af-to"
              label="Bitiş"
              value={shownRange.to}
              min={shownRange.from || undefined}
              max={TODAY_ISO}
              invalid={invalidRange}
              errorId="af-date-error"
              onChange={(v) => setDay("to", v)}
              testId="app-filter-to"
            />
          </div>
          {invalidRange && (
            <p className="m-0 flex items-start gap-4 text-caption font-medium text-(--feedback-error)" id="af-date-error" role="alert">
              <Icon icon={CircleAlert} size={16} />
              <span>Bitiş tarihi, başlangıç tarihinden önce olamaz.</span>
            </p>
          )}
        </div>
      </Section>

      <Section id="af-g3" icon={ListFilter} title="Başvuru durumu" description="Görmek istediğin başvuru durumlarını seç.">
        <div className="grid grid-cols-2 gap-8" role="group" aria-labelledby="af-g3-t">
          {STATUS_LABELS.map((s) => (
            <StatusOption
              key={s}
              status={s}
              count={withoutStatus.filter((a) => statusLabel(a) === s).length}
              selected={draft.statuses.includes(s)}
              onToggle={() => toggleStatus(s)}
            />
          ))}
        </div>
      </Section>
    </Sheet>
  );
}
