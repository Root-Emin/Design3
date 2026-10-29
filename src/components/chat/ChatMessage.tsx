import { Briefcase, Calendar, CalendarClock, Check, CheckCheck, Waves, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ASSISTANT_NAME, INTERVIEW_MODES } from "../../data/messages";
import { USER } from "../../data/user";
import { formatInterviewDate, formatLongDay } from "../../lib/format";
import { cn } from "../../lib/utils";
import type { ChatMessage, DeliveryStatus, Interview, Job, Offer, RequestMessage } from "../../types";
import { Icon } from "../icons/Icon";
import { Avatar, CompanyAvatar } from "../ui/Avatar";
import { FileRow } from "../ui/FileRow";

const AVATAR_COL = "w-40 flex-none";

/** Design3 Ai avatarı (dalga işareti). */
export function AssistantAvatar() {
  return (
    <span className="en-avatar en-avatar--md en-avatar--blue" role="img" aria-label={ASSISTANT_NAME}>
      <Icon icon={Waves} size={24} strokeWidth={2.25} />
    </span>
  );
}

function Meta({ time, status }: { time: string; status?: DeliveryStatus }) {
  return (
    <>
      <time className="en-num">{time}</time>
      {status && (
        <>
          <Icon
            icon={status === "read" ? CheckCheck : Check}
            size={16}
            className={cn("ds-icon", status === "read" && "text-(--action-primary)")}
          />
          <span className="en-sr">{status === "read" ? "Okundu" : "Gönderildi"}</span>
        </>
      )}
    </>
  );
}

const fileKind = (name: string) => `${name.split(".").pop()?.toUpperCase() ?? "Dosya"} belge`;

const META_CLS = "inline-flex items-center gap-4 text-caption text-tertiary";

/**
 * Sohbet balonu. Saat (ve teslim durumu) son satırın sağ altına oturur: son metnin sonuna
 * görünmez bir kopyası eklenir, böylece kısa satırda yan yana, uzun satırda alta kayar.
 */
function Bubble({ outgoing, blocks, meta, testId }: { outgoing?: boolean; blocks: ReactNode[]; meta: ReactNode; testId?: string }) {
  const last = blocks.at(-1);
  const textTail = typeof last === "string";
  const rest = textTail ? blocks.slice(0, -1) : blocks;
  return (
    <div
      className={cn(
        "relative grid min-w-0 gap-8 rounded-card px-16 py-12 text-body-md text-primary [overflow-wrap:anywhere]",
        outgoing ? "bg-(--chat-outgoing)" : "bg-(--chat-incoming)",
      )}
      data-testid={testId}
    >
      {rest.map((b, i) => (typeof b === "string" ? <Text key={i}>{b}</Text> : <div key={i}>{b}</div>))}
      {textTail ? (
        <>
          <Text>
            {last}
            <span className={cn(META_CLS, "invisible ml-12")} aria-hidden="true">
              {meta}
            </span>
          </Text>
          <span className={cn(META_CLS, "absolute right-16 bottom-12")}>{meta}</span>
        </>
      ) : (
        <span className={cn(META_CLS, "justify-self-end")}>{meta}</span>
      )}
    </div>
  );
}

const Text = ({ children }: { children: ReactNode }) => <p className="m-0 whitespace-pre-line">{children}</p>;

/* ---------- Bildirimler: mülakat daveti, iş teklifi ---------- */

function InfoRow({ icon, tone, label, value, struck }: { icon: LucideIcon; tone: string; label: string; value: string; struck?: boolean }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-12">
      <span className={cn("row-span-2 grid size-40 place-items-center rounded-full", tone)} aria-hidden="true">
        <Icon icon={icon} />
      </span>
      <dt className="text-caption text-secondary">{label}</dt>
      <dd className={cn("m-0 font-semibold", struck && "text-secondary line-through")}>{value}</dd>
    </div>
  );
}

export function InterviewCard({ interview, struck }: { interview: Interview; struck?: boolean }) {
  const mode = INTERVIEW_MODES[interview.mode];
  return (
    <dl className="m-0 grid gap-12 rounded-card bg-(--chat-card) p-12" data-testid="interview-card">
      <InfoRow icon={Calendar} tone="bg-action-secondary text-(--action-on-secondary)" label="Tarih" value={formatInterviewDate(interview.at)} struck={struck} />
      <InfoRow icon={mode.icon} tone="bg-(--highlight-bg) text-(--highlight-default)" label="Görüşme şekli" value={mode.label} struck={struck} />
    </dl>
  );
}

export function OfferCard({ offer, job, struck }: { offer: Offer; job: Job; struck?: boolean }) {
  return (
    <div className="grid gap-12 rounded-card bg-(--chat-card) p-12" data-testid="offer-card">
      <dl className="m-0 grid gap-12">
        <InfoRow icon={Briefcase} tone="bg-action-secondary text-(--action-on-secondary)" label="Pozisyon" value={job.title} struck={struck} />
        <InfoRow
          icon={CalendarClock}
          tone="bg-(--status-pending-subtle) text-(--status-pending)"
          label="Yanıt için son tarih"
          value={formatLongDay(offer.deadline)}
          struck={struck}
        />
      </dl>
      <FileRow name={offer.attach} detail={fileKind(offer.attach)} />
    </div>
  );
}

/** Bildirim mesajının metni: selamlama, açıklama, bilgi kartı, not ve İK imzası. */
function requestBlocks(m: RequestMessage, job: Job, struck: boolean): ReactNode[] {
  if (m.kind === "offer") {
    return [
      `Merhaba ${USER.first}, 👋`,
      `${job.title} pozisyonu için sana teklifimizi iletiyoruz. 🎉`,
      <OfferCard key="card" offer={m.offer} job={job} struck={struck} />,
      "Teklifin ayrıntıları ekteki belgede.",
      "Yanıtını son tarihe kadar bu yazışmadan iletebilirsin; sormak istediğin bir şey olursa bu mesaja yanıt vermen yeterli.",
      `${job.company} İnsan Kaynakları`,
    ];
  }
  const mode = INTERVIEW_MODES[m.interview.mode];
  return [
    `Merhaba ${USER.first}, 👋`,
    m.revision
      ? `${job.title} mülakatının saatinde değişiklik oldu. Güncel görüşme bilgileri aşağıda.`
      : `${job.title} başvurunu inceledik ve seninle bir mülakat yapmak istiyoruz.`,
    <InterviewCard key="card" interview={m.interview} struck={struck} />,
    mode.note,
    "Bu saat sana uygun değilse, bu mesaja yanıt vererek başka bir saat önerebilirsin.",
    `${job.company} İnsan Kaynakları`,
  ];
}

/* ---------- Mesaj satırı ---------- */

interface MessageRowProps {
  message: ChatMessage;
  job: Job;
  /** Grubun ilk mesajı: gönderici bilgisi ve avatar görünür. */
  groupStart: boolean;
  /** Bildirim geçersiz (iptal, güncellendi): kart bilgileri üstü çizili gösterilir. */
  struck?: boolean;
  /** Balonun altına eklenen içerik (bildirim durumu). */
  footer?: ReactNode;
}

export function MessageRow({ message: m, job, groupStart, struck = false, footer }: MessageRowProps) {
  const blocks: ReactNode[] =
    m.kind !== "text" ? requestBlocks(m, job, struck) : [...m.body, ...(m.attach ? [<FileRow key="file" name={m.attach} detail={fileKind(m.attach)} />] : [])];
  const meta = <Meta time={m.time} status={m.status} />;

  if (m.author === "candidate") {
    return (
      <div className="flex items-start justify-end gap-8" data-testid="message-mine">
        <div className="grid max-w-[80%] min-w-0">
          <Bubble outgoing blocks={blocks} meta={meta} />
        </div>
        <span className={cn("flex-none", !groupStart && "invisible")} aria-hidden={!groupStart || undefined}>
          <Avatar initials={USER.initials} label={USER.name} tone="blue" shape="person" />
        </span>
      </div>
    );
  }

  const assistant = m.author === "assistant";
  return (
    <div className="flex items-start gap-12" data-testid={assistant ? "message-assistant" : "message-employer"}>
      <span className={AVATAR_COL}>{groupStart && (assistant ? <AssistantAvatar /> : <CompanyAvatar job={job} />)}</span>
      <div className="grid min-w-0 flex-1 gap-4">
        {groupStart && (
          <p className="m-0 flex flex-wrap items-center gap-x-8 gap-y-2">
            <strong className="text-body-md font-semibold text-primary">{assistant ? ASSISTANT_NAME : job.company}</strong>
            {assistant && (
              <span className="rounded-full bg-action-secondary px-8 text-caption font-semibold text-(--action-on-secondary)">AI Asistan</span>
            )}
            <span className="text-caption text-tertiary">{`${m.day} ${m.time}`}</span>
          </p>
        )}
        <Bubble blocks={blocks} meta={meta} testId={m.kind === "text" ? "message-body" : `message-${m.kind}`} />
        {footer}
      </div>
    </div>
  );
}

/** Design3 Ai yanıt hazırlarken. */
export function TypingRow() {
  return (
    <div className="flex items-center gap-12" data-testid="assistant-typing">
      <span className={AVATAR_COL}>
        <AssistantAvatar />
      </span>
      <span className="rounded-card bg-(--chat-incoming) px-16 py-8 text-caption text-secondary">{`${ASSISTANT_NAME} yazıyor…`}</span>
    </div>
  );
}
