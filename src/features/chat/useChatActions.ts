import { CalendarCheck, CalendarClock, CircleCheck, MessagesSquare } from "lucide-react";
import {
  ACCEPT_TEXT,
  acceptReply,
  forwardReply,
  MESSAGES,
  OFFER_ACCEPT_TEXT,
  OFFER_TALK_TEXT,
  offerAcceptReply,
  offerTalkReply,
  rescheduleReply,
  rescheduleText,
} from "../../data/messages";
import { TODAY } from "../../data/user";
import { clockNow, formatInterviewDate } from "../../lib/format";
import { useAppDispatch, useAppState } from "../../state/AppStateProvider";
import { getRequest, getRequestPhase, getThread } from "../../state/appState";
import type { ChatMessage, Interview, MessageAuthor } from "../../types";

/** Asistanın yanıtı bu kadar sonra düşer; arada "yazıyor" gösterilir. */
const REPLY_MS = 900;

let seq = 0;

/**
 * Yazışma başına sırada bekleyen asistan yanıtları. Yazışmadan çıkılsa da düşerler; yazışma
 * sıfırlanınca (demo) `cancelAssistantReplies` ile iptal edilir, eski yanıt yeni duruma düşmez.
 */
const pendingReplies = new Map<number, { timer: number; body: readonly string[] }[]>();

export function cancelAssistantReplies(id?: number) {
  for (const key of id === undefined ? [...pendingReplies.keys()] : [id]) {
    pendingReplies.get(key)?.forEach((r) => window.clearTimeout(r.timer));
    pendingReplies.delete(key);
  }
}

function textMessage(author: MessageAuthor, body: readonly string[], attach?: string): ChatMessage {
  return {
    id: `n${++seq}`, author, kind: "text", day: "Bugün", time: clockNow(), body, attach,
    status: author === "candidate" ? "sent" : undefined,
  };
}

/**
 * Bir yazışmadaki aday eylemleri (mock). Aday mesajı hemen eklenir; Design3 Ai kısa bir
 * "yazıyor" aralığından sonra hazır metinlerle yanıtlar.
 */
export function useChatActions(id: number) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const conversation = MESSAGES[id];
  const request = getRequest(state, id);
  // Başvuru geri çekildiyse, sonuçlandıysa ya da aşama geçtiyse bildirime yanıt verilmez.
  const pending = getRequestPhase(state, id) === "pending";
  const now = () => `${TODAY} ${clockNow()}`;

  const post = (message: ChatMessage) => dispatch({ type: "postMessage", id, message });

  function assistantReplies(body: readonly string[]) {
    const queue = pendingReplies.get(id) ?? [];
    const timer = window.setTimeout(() => {
      const rest = (pendingReplies.get(id) ?? []).filter((r) => r.timer !== timer);
      if (rest.length) pendingReplies.set(id, rest);
      else pendingReplies.delete(id);
      post(textMessage("assistant", body));
      // Sırada başka yanıt varsa "yazıyor" sürer.
      if (rest.length) dispatch({ type: "setAssistantTyping", id, typing: true });
    }, REPLY_MS);
    pendingReplies.set(id, [...queue, { timer, body }]);
    dispatch({ type: "setAssistantTyping", id, typing: true });
  }

  /** Serbest mesaj ya da dosya. Asistan "ilettim" notunu işveren yanıt verene kadar bir kez düşer. */
  function send(text: string, attach?: string) {
    const thread = getThread(state, id);
    const sinceEmployer = thread.slice(thread.findLastIndex((m) => m.author === "employer") + 1);
    const notice = forwardReply(conversation.company);
    const isNotice = (body: readonly string[]) => body[0] === notice[0];
    // Sırada bekleyen (henüz düşmemiş) not da sayılır: hızlı art arda gönderimde not iki kez düşmez.
    const alreadyForwarded =
      sinceEmployer.some((m) => m.author === "assistant" && m.kind === "text" && isNotice(m.body)) ||
      (pendingReplies.get(id) ?? []).some((r) => isNotice(r.body));
    post(textMessage("candidate", text ? [text] : [], attach));
    if (!alreadyForwarded) assistantReplies(notice);
  }

  /** "Uygun, teşekkürler" (mülakat) ya da "Teklifi kabul et" (teklif). */
  function accept() {
    if (!request || !pending) return;
    if (request.type === "interview") {
      post(textMessage("candidate", [ACCEPT_TEXT]));
      dispatch({ type: "updateRequest", id, request: { status: "accepted" }, event: { icon: CalendarCheck, text: "Mülakat davetini kabul ettin", at: now() } });
      assistantReplies(acceptReply(request.interview!));
    } else {
      post(textMessage("candidate", [OFFER_ACCEPT_TEXT]));
      dispatch({ type: "updateRequest", id, request: { status: "accepted" }, event: { icon: CircleCheck, text: "İş teklifini kabul ettin", at: now() } });
      assistantReplies(offerAcceptReply(conversation.company));
    }
  }

  /** Mülakat: yeni saat önerisi (alt sayfadan). */
  function proposeTime(at: Interview["at"], note: string) {
    if (request?.type !== "interview" || !pending) return;
    const proposal = formatInterviewDate(at);
    post(textMessage("candidate", [rescheduleText(proposal, note)]));
    dispatch({
      type: "updateRequest", id, request: { status: "countered", proposal },
      event: { icon: CalendarClock, text: `Mülakat için yeni saat önerdin: ${proposal}`, at: now() },
    });
    assistantReplies(rescheduleReply(conversation.company, proposal));
  }

  /** Teklif: karar öncesi görüşme talebi. */
  function requestTalk() {
    if (request?.type !== "offer" || !pending) return;
    post(textMessage("candidate", [OFFER_TALK_TEXT]));
    dispatch({ type: "updateRequest", id, request: { status: "countered" }, event: { icon: MessagesSquare, text: "Teklif için görüşme talep ettin", at: now() } });
    assistantReplies(offerTalkReply(conversation.company));
  }

  return { send, accept, proposeTime, requestTalk };
}
