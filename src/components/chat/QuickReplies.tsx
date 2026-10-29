import { Calendar, CircleAlert, CircleCheck, CircleHelp, CircleMinus, Clock, Info, MessagesSquare, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import type { RequestPhase, RequestState, RequestType } from "../../types";
import { Icon } from "../icons/Icon";

type QuickTone = "success" | "neutral" | "danger";

const TONE: Record<QuickTone, string> = {
  success: "bg-success-bg text-success shadow-[inset_0_0_0_1px_var(--feedback-success-border)]",
  neutral: "bg-surface text-primary shadow-hairline",
  danger: "bg-(--feedback-error-bg) text-(--feedback-error-text) shadow-[inset_0_0_0_1px_var(--feedback-error-border)]",
};

function QuickReply({ tone, icon, label, onClick, testId }: { tone: QuickTone; icon: LucideIcon; label: string; onClick: () => void; testId: string }) {
  return (
    <button
      type="button"
      className={cn(
        "en-state en-focus en-hit inline-flex min-h-40 flex-none cursor-pointer items-center gap-8 rounded-full border-0 px-12 [font:var(--type-label)] whitespace-nowrap",
        TONE[tone],
      )}
      onClick={onClick}
      data-testid={testId}
    >
      <Icon icon={icon} />
      {label}
    </button>
  );
}

/** Bildirim türüne göre onay ve karşı öneri düğmeleri; üçüncüsü her zaman "Soru sor". */
const REPLIES: Record<RequestType, { accept: string; counter: string; counterIcon: LucideIcon }> = {
  interview: { accept: "Uygun, teşekkürler", counter: "Başka saat öner", counterIcon: Calendar },
  offer: { accept: "Teklifi kabul et", counter: "Görüşme talep et", counterIcon: MessagesSquare },
};

interface QuickRepliesProps {
  type: RequestType;
  onAccept: () => void;
  onCounter: () => void;
  onAsk: () => void;
}

/** Bildirimin altındaki hızlı yanıtlar. Dar ekranda taşmaz, yatay kayar. */
export function QuickReplies({ type, onAccept, onCounter, onAsk }: QuickRepliesProps) {
  const r = REPLIES[type];
  return (
    <div
      role="group"
      aria-label="Hızlı yanıtlar"
      className="en-chat__scroller -mx-16 flex gap-8 overflow-x-auto px-16 py-4"
      data-testid="quick-replies"
    >
      <QuickReply tone="success" icon={CircleCheck} label={r.accept} onClick={onAccept} testId="quick-accept" />
      <QuickReply tone="neutral" icon={r.counterIcon} label={r.counter} onClick={onCounter} testId="quick-counter" />
      <QuickReply tone="danger" icon={CircleHelp} label="Soru sor" onClick={onAsk} testId="quick-ask" />
    </div>
  );
}

/** Hızlı yanıtların yerine çıkan satırın anahtarı: bildirimin hâli ya da daha yeni bir bildirim. */
export type StatusKey = Exclude<RequestPhase, "pending"> | "superseded";
type StatusLine = { icon: LucideIcon; cls: string; text: (r: RequestState) => string };

const DONE = "text-success";
const WAITING = "text-(--status-pending-text)";
const CLOSED = "text-secondary";

const STATUS: Record<RequestType, Record<StatusKey, StatusLine>> = {
  interview: {
    accepted: { icon: CircleCheck, cls: DONE, text: () => "Katılımını onayladın" },
    countered: { icon: Clock, cls: WAITING, text: (r) => `Yeni saat önerdin: ${r.proposal} · Yanıt bekleniyor` },
    cancelled: { icon: CircleMinus, cls: CLOSED, text: () => "Bu görüşme iptal edildi" },
    expired: { icon: CircleAlert, cls: CLOSED, text: () => "Bu davetin yanıt süresi doldu" },
    superseded: { icon: Info, cls: CLOSED, text: () => "Bu davet güncellendi; güncel bilgiler aşağıda" },
    withdrawn: { icon: CircleMinus, cls: CLOSED, text: () => "Başvurunu geri çektiğin için bu davet artık geçerli değil" },
    closed: { icon: CircleMinus, cls: CLOSED, text: () => "Başvurun sonuçlandığı için bu davet artık geçerli değil" },
    passed: { icon: CircleCheck, cls: CLOSED, text: () => "Mülakat aşaması tamamlandı" },
  },
  offer: {
    accepted: { icon: CircleCheck, cls: DONE, text: () => "Teklifi kabul ettin" },
    countered: { icon: Clock, cls: WAITING, text: () => "Görüşme talep ettin · Yanıt bekleniyor" },
    cancelled: { icon: CircleMinus, cls: CLOSED, text: () => "Bu teklif geri çekildi" },
    expired: { icon: CircleAlert, cls: CLOSED, text: () => "Bu teklifin yanıt süresi doldu" },
    superseded: { icon: Info, cls: CLOSED, text: () => "Bu teklif güncellendi; güncel bilgiler aşağıda" },
    withdrawn: { icon: CircleMinus, cls: CLOSED, text: () => "Başvurunu geri çektiğin için bu teklif artık geçerli değil" },
    closed: { icon: CircleMinus, cls: CLOSED, text: () => "Başvurun sonuçlandığı için bu teklif artık geçerli değil" },
    passed: { icon: CircleCheck, cls: CLOSED, text: () => "Teklif aşaması tamamlandı" },
  },
};

/** Bildirim yanıtlandığında ya da geçersizleştiğinde hızlı yanıtların yerine çıkan durum satırı. */
export function RequestStatusLine({ request, status }: { request: RequestState; status: StatusKey }) {
  const s = STATUS[request.type][status];
  return (
    <p className={cn("m-0 flex items-start gap-4 text-caption", s.cls)} role="status" data-testid="request-status">
      <Icon icon={s.icon} size={16} className="ds-icon mt-2" />
      <span>{s.text(request)}</span>
    </p>
  );
}
