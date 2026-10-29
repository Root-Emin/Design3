import { Building2, Calendar, CalendarClock, CalendarX, CircleMinus, FileText, Hourglass, Phone, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatInterviewDate, withLocative } from "../lib/format";
import type { ChatMessage, Conversation, Interview, InterviewMode, RequestPhase, RequestState, RequestType } from "../types";

export const ASSISTANT_NAME = "Design3 Ai";

const INTERVIEW_1: Interview = { at: "2026-10-30T14:00", mode: "online" };

export const MESSAGES: Readonly<Record<number, Conversation>> = {
  1: {
    jid: 2, company: "Deniz Enerji", subject: "Mülakat daveti", subjectIcon: Calendar, online: true,
    thread: [{ id: "1-0", author: "assistant", kind: "invite", day: "Bugün", time: "08.15", interview: INTERVIEW_1, revision: false }],
    request: { type: "interview", messageId: "1-0", interview: INTERVIEW_1, status: "pending" },
  },
  2: {
    jid: 5, company: "Kuzey Yazılım", subject: "İş teklifi", subjectIcon: FileText, online: false,
    thread: [{ id: "2-0", author: "assistant", kind: "offer", day: "25 Eki", time: "17.30", offer: { deadline: "2026-11-03", attach: "Teklif_Mektubu.pdf" } }],
    request: { type: "offer", messageId: "2-0", status: "pending" },
  },
};

export const MESSAGE_IDS = [1, 2] as const;

/** Başvuruya (iş ilanına) bağlı yazışma; yoksa undefined. */
export const conversationIdFor = (jid: number): number | undefined => MESSAGE_IDS.find((id) => MESSAGES[id].jid === jid);

/** Başvuru kartında ve Mesajlar listesinde görünen süreç durumu, bildirimin ekrandaki hâline göre. */
export const REQUEST_SUBJECT: Readonly<Record<RequestType, Record<RequestPhase, string>>> = {
  interview: {
    pending: "Mülakat daveti", accepted: "Mülakat onaylandı", countered: "Yeni saat önerildi", cancelled: "Mülakat iptal edildi",
    expired: "Davetin süresi doldu", withdrawn: "Geri çekildi", closed: "Sonuçlanmadı", passed: "Mülakat tamamlandı",
  },
  offer: {
    pending: "İş teklifi", accepted: "Teklif kabul edildi", countered: "Görüşme talep edildi", cancelled: "Teklif geri çekildi",
    expired: "Teklifin süresi doldu", withdrawn: "Geri çekildi", closed: "Sonuçlanmadı", passed: "Teklif aşaması geçti",
  },
};

/** Başvuru kartında "Sırada" yerine: işveren bildirimi iptal etti ya da yanıt süresi doldu. */
export const REQUEST_ENDED_NOTE: Readonly<Record<RequestType, Record<"cancelled" | "expired", string>>> = {
  interview: {
    cancelled: "Mülakat iptal edildi. Ayrıntılar Mesajlar'da.",
    expired: "Mülakat davetinin yanıt süresi doldu. Ayrıntılar Mesajlar'da.",
  },
  offer: {
    cancelled: "İş teklifi geri çekildi. Ayrıntılar Mesajlar'da.",
    expired: "İş teklifinin yanıt süresi doldu. Ayrıntılar Mesajlar'da.",
  },
};

export const INTERVIEW_MODES: Readonly<Record<InterviewMode, { label: string; icon: LucideIcon; note: string }>> = {
  online: { label: "Çevrim içi (video görüşme)", icon: Video, note: "Görüşme bağlantısını, görüşmeden bir gün önce bu yazışmada paylaşacağız." },
  office: { label: "Yüz yüze (ofiste)", icon: Building2, note: "Adres ve giriş bilgilerini, görüşmeden bir gün önce bu yazışmada paylaşacağız." },
  phone: { label: "Telefon görüşmesi", icon: Phone, note: "Görüşme saatinde seni profilindeki numaradan arayacağız." },
};

/* ---------- Hazır metinler: adayın hızlı yanıtları ve asistanın cevapları ---------- */

export const ACCEPT_TEXT = "Merhaba, teşekkür ederim! 🙏\nBu tarih ve saat benim için uygun, görüşmek üzere.";

export function rescheduleText(proposal: string, note: string): string {
  const ask = `Bu saat benim için uygun değil. Görüşmeyi ${withLocative(proposal)} yapabilir miyiz?`;
  return note ? `${ask}\n${note}` : ask;
}

export const acceptReply = (interview: Interview): string[] => [
  `Harika! O halde ${withLocative(formatInterviewDate(interview.at))} görüşmek üzere. 🎉`,
  "Görüşme bağlantısını bir gün önce buradan paylaşacağız. Herhangi bir değişiklik olursa sana mutlaka haber veririz.",
];

export const rescheduleReply = (company: string, proposal: string): string[] => [
  `Teşekkürler! ${proposal} önerini ${company} İnsan Kaynakları ekibine ilettim.`,
  "Yeni saat onaylandığında sana buradan haber vereceğim.",
];

export const OFFER_ACCEPT_TEXT = "Merhaba, teklifiniz için çok teşekkür ederim! 🙏\nTeklifi kabul ediyorum, birlikte çalışmayı sabırsızlıkla bekliyorum.";
export const OFFER_TALK_TEXT = "Merhaba, teklifiniz için teşekkür ederim.\nKarar vermeden önce ayrıntıları konuşmak için kısa bir görüşme yapabilir miyiz?";

export const offerAcceptReply = (company: string): string[] => [
  `Tebrikler! 🎉 Kabulünü ${company} İnsan Kaynakları ekibine ilettim.`,
  "Sözleşme ve işe başlama tarihiyle ilgili sonraki adımları bu yazışmada paylaşacaklar.",
];

export const offerTalkReply = (company: string): string[] => [
  `Görüşme talebini ${company} İnsan Kaynakları ekibine ilettim.`,
  "Uygun saatleri bu yazışmada paylaşacaklar; teklifin son yanıt tarihi değişirse sana haber vereceğim.",
];

export const forwardReply = (company: string): string[] => [
  `Mesajını ${company} İnsan Kaynakları ekibine ilettim. Yanıt geldiğinde bu yazışmada göreceksin.`,
];

/* ---------- Demo: işveren tarafındaki gelişmeler ---------- */

/** Demo panelindeki bildirim senaryoları: yeni bildirim ya da işverenin sonradan yaptığı değişiklik. */
export type RequestScenario = "new" | "revised" | "cancelled" | "expired";

/** İşverenin değiştirdiği görüşme saati. */
const REVISED_INTERVIEW: Interview = { at: "2026-11-02T10:30", mode: "online" };

interface ScenarioChange {
  /** Yazışmaya düşen asistan mesajı. */
  message: ChatMessage;
  request: Partial<RequestState>;
  /** Başvuru geçmişine (ve bildirimlere) düşen işveren hareketi. */
  event: { icon: LucideIcon; text: string };
}

/** Senaryonun yazışmaya ve başvuruya etkisi; "new" bildirimi ilk hâline döndürür, değişiklik yoktur. */
export function requestScenario(
  m: Conversation,
  scenario: RequestScenario,
  base: Pick<ChatMessage, "id" | "day" | "time">,
): ScenarioChange | undefined {
  const text = (body: string[]): ChatMessage => ({ ...base, author: "assistant", kind: "text", body });
  const interview = m.request?.type === "interview";
  switch (scenario) {
    case "new":
      return undefined;
    case "revised":
      return {
        message: { ...base, author: "assistant", kind: "invite", interview: REVISED_INTERVIEW, revision: true },
        request: { messageId: base.id, interview: REVISED_INTERVIEW, status: "pending" },
        event: { icon: CalendarClock, text: `${m.company} mülakat saatini değiştirdi` },
      };
    case "cancelled":
      return interview
        ? {
            message: text([
              `${m.company}, ${withLocative(formatInterviewDate(m.request!.interview!.at))} yapılacak mülakatı iptal etti.`,
              `Yeni bir mülakat tarihi paylaşırlarsa bu yazışmada göreceksin.`,
            ]),
            request: { status: "cancelled" },
            event: { icon: CalendarX, text: `${m.company} mülakatı iptal etti` },
          }
        : {
            message: text([
              `${m.company}, iş teklifini geri çekti.`,
              `Sormak istediğin bir şey varsa bu yazışmadan ${m.company} ekibine mesaj gönderebilirsin.`,
            ]),
            request: { status: "cancelled" },
            event: { icon: CircleMinus, text: `${m.company} iş teklifini geri çekti` },
          };
    case "expired":
      return {
        message: text([
          interview ? "Mülakat davetinin yanıt süresi doldu." : "İş teklifinin yanıt süresi doldu.",
          `Görüşmek istersen bu yazışmadan ${m.company} ekibine mesaj gönderebilirsin.`,
        ]),
        request: { status: "expired" },
        event: { icon: Hourglass, text: interview ? "Mülakat davetinin yanıt süresi doldu" : "İş teklifinin yanıt süresi doldu" },
      };
  }
}
