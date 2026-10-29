import { ArrowLeft, CalendarX, ChevronRight, CircleCheck, CircleMinus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Icon } from "../../components/icons/Icon";
import { IconButton } from "../../components/ui/IconButton";
import { Heading, MutedText } from "../../components/ui/Typography";
import { cn } from "../../lib/utils";
import { routePath, useBackTarget, useVersion, useWithBack } from "../../routes/paths";
import { useAppState } from "../../state/AppStateProvider";
import { messageSortKey } from "../../state/appState";
import type { Application, ApplicationEvent } from "../../types";

const MAX_ROWS = 8;

type Filter = "tumu" | "okunmamis";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "tumu", label: "Tümü" },
  { id: "okunmamis", label: "Okunmamış" },
];

type Tone = "blue" | "green" | "red";
/** İkon dairesinin rengi. */
const TONE: Record<Tone, string> = {
  blue: "bg-(--feedback-info-bg) text-(--action-primary)",
  green: "bg-(--feedback-success-bg) text-(--feedback-success)",
  red: "bg-(--feedback-error-bg) text-(--feedback-error)",
};

/** Teklif yeşil; olumsuz sonuç ve iptal kırmızı; diğer hareketler mavi. */
function toneOf(e: ApplicationEvent): Tone {
  if (e.icon === CircleCheck) return "green";
  if (e.icon === CircleMinus || e.icon === CalendarX) return "red";
  return "blue";
}

/** "27 Eki 08.15" → sıralama anahtarı. */
function eventSortKey(e: ApplicationEvent): number {
  const [day, month, time] = e.at.split(" ");
  return messageSortKey({ day: `${day} ${month}`, time });
}

/** Başvurunun en son işveren hareketi; adayın kendi hareketleri (gönderim, geri çekme, yanıtlar) bildirim değildir. */
const lastEmployerEvent = (a: Application) => a.events.find((e) => !e.own);

/**
 * Bildirimler: her başvurunun en son işveren hareketi (adayın kendi hareketleri hariç), en yeniden eskiye.
 * Okunmamışlar "Yeni" altında kalın başlıklı mavi kartta, okunmuşlar "Bu hafta" altında ince ve silik.
 * Karta basınca başvuru detayı açılır ve bildirim okunmuş sayılır.
 */
export function NotificationsPage() {
  const ver = useVersion();
  // Zil her ekranın üst çubuğunda; geri, zile basılan ekrana döner.
  const back = useBackTarget(routePath(ver, "basvurularim"));
  const withBack = useWithBack();
  const [filter, setFilter] = useState<Filter>("tumu");
  const { apps } = useAppState();
  const rows = apps
    .flatMap((a) => {
      const e = lastEmployerEvent(a);
      return e ? [{ a, e }] : [];
    })
    .sort((x, y) => eventSortKey(y.e) - eventSortKey(x.e))
    .slice(0, MAX_ROWS)
    .map((r, i) => ({ ...r, i }));
  const unread = rows.filter(({ a }) => a.unread);
  const read = filter === "tumu" ? rows.filter(({ a }) => !a.unread) : [];

  const card = ({ a, e, i }: (typeof rows)[number]) => (
    <li key={a.id}>
      <Link
        to={withBack(routePath(ver, "basvuru", a.id))}
        className={cn(
          "en-state en-focus flex items-center gap-16 rounded-card p-16 no-underline",
          a.unread ? "bg-(--feedback-info-bg) shadow-[inset_0_0_0_1px_var(--feedback-info-border)]" : "bg-surface shadow-card",
        )}
        data-testid={`notification-${i}`}
      >
        <span
          className={cn(
            "grid size-[56px] flex-none place-items-center rounded-full",
            TONE[toneOf(e)],
            // Okunmamış kartın mavi zemininde mavi daire bir ton koyulaşır.
            a.unread && toneOf(e) === "blue" && "bg-(--action-secondary-hover)",
          )}
        >
          <Icon icon={e.icon} size={28} />
        </span>
        <span className="grid min-w-0 flex-1 gap-4">
          <span className={cn("text-body-lg", a.unread ? "font-semibold text-primary" : "text-secondary")}>{e.text}</span>
          <span className="text-body-md text-tertiary en-num">{e.at}</span>
        </span>
        {a.unread && (
          <>
            <span className="size-8 flex-none rounded-full bg-(--action-primary)" aria-hidden="true" />
            <span className="ds-sr">, okunmamış</span>
          </>
        )}
        <Icon icon={ChevronRight} className="flex-none text-secondary" />
      </Link>
    </li>
  );

  return (
    <div className="flex min-h-full flex-col gap-24 px-20 pt-16 pb-24">
      <header className="grid gap-8">
        <div className="-ml-8 flex items-center justify-between">
          <IconButton icon={ArrowLeft} label="Geri" to={back} testId="appbar-back" />
          {unread.length > 0 && (
            <span
              className="flex items-center gap-8 rounded-full bg-(--action-secondary) px-16 py-4 text-body-md text-(--action-primary) en-num"
              data-testid="notifications-new-count"
            >
              <span className="size-8 rounded-full bg-(--action-primary)" aria-hidden="true" />
              {unread.length} yeni
            </span>
          )}
        </div>
        <Heading as="h1" look="h1" focusTarget>
          Bildirimler
        </Heading>
        <MutedText>Başvuruların ve iş fırsatlarınla ilgili güncellemeler</MutedText>
      </header>

      <div className="flex gap-12" role="group" aria-label="Bildirimleri süz">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "en-state en-focus cursor-pointer rounded-full border-0 px-24 py-8 text-body-lg",
              filter === f.id ? "bg-(--action-primary) text-(--text-on-action)" : "bg-(--bg-muted) text-primary",
            )}
            data-testid={`notifications-filter-${f.id}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {unread.length > 0 && (
        <section className="grid gap-12" aria-labelledby="notifications-new">
          <Heading id="notifications-new" look="title">
            Yeni
          </Heading>
          <ul className="m-0 grid list-none gap-8 p-0">{unread.map(card)}</ul>
        </section>
      )}
      {read.length > 0 && (
        <section className="grid gap-12" aria-labelledby="notifications-week">
          <Heading id="notifications-week" look="title" className="text-secondary">
            Bu hafta
          </Heading>
          <ul className="m-0 grid list-none gap-8 p-0">{read.map(card)}</ul>
        </section>
      )}
      {filter === "okunmamis" && unread.length === 0 && <MutedText>Okunmamış bildirimin yok.</MutedText>}
    </div>
  );
}
