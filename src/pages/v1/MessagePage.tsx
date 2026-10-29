import { Briefcase, FileText } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { ApplicationContextCard, ChatHeader } from "../../components/chat/ChatHeader";
import { MessageRow, TypingRow } from "../../components/chat/ChatMessage";
import { Composer } from "../../components/chat/Composer";
import { QuickReplies, RequestStatusLine, type StatusKey } from "../../components/chat/QuickReplies";
import { MESSAGES } from "../../data/messages";
import { useChatActions } from "../../features/chat/useChatActions";
import { useKeyboardInset } from "../../hooks/useKeyboardInset";
import { cn } from "../../lib/utils";
import { routePath, useBackTarget, useWithBack } from "../../routes/paths";
import { useAppState } from "../../state/AppStateProvider";
import { getConversationApp, getConversationSubject, getJob, getRequest, getRequestPhase, getThread } from "../../state/appState";
import { useOverlay } from "../../state/OverlayProvider";
import { NotFoundPage } from "../NotFoundPage";

/** Son mesaja bu kadar yakınken kullanıcı "en altta" sayılır; yeni mesaj ve klavye bu durumu korur. */
const BOTTOM_SLACK = 48;

/**
 * İşveren yazışması. Ekran üç parçadır: başlık, kendi içinde kayan mesaj listesi ve en alta
 * sabit yazma alanı. Liste kalan yüksekliğin tamamını doldurur, altta boşluk kalmaz.
 */
export function MessagePage() {
  const id = Number(useParams().id);
  const state = useAppState();
  const { openOverlay } = useOverlay();
  const actions = useChatActions(id);
  const keyboard = useKeyboardInset();
  // Başvuru detayından açıldıysa geri o detaya, yoksa mesaj listesine döner.
  const back = useBackTarget(routePath("v1", "mesajlar"));
  // Yazışmadan açılan başvuru detayı ve ilanın geri düğmesi bu yazışmaya döner.
  const withBack = useWithBack();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const atBottom = useRef(false);
  const [asking, setAsking] = useState(false);

  const m = MESSAGES[id];
  const thread = m ? getThread(state, id) : [];
  const typing = !!state.assistantTyping[id];
  const tail = `${thread.length}:${typing}`;

  // İlk açılışta liste üstten başlar; sonra her yeni mesajda (ve "yazıyor"da) son mesaja kayar.
  const seen = useRef(tail);
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || seen.current === tail) return;
    seen.current = tail;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({ top: list.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, [tail]);

  // Klavye açılıp liste kısalınca, kullanıcı en alttaysa en altta kalır (zıplama olmaz).
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const ro = new ResizeObserver(() => {
      if (atBottom.current) list.scrollTop = list.scrollHeight;
    });
    ro.observe(list);
    return () => ro.disconnect();
  }, []);

  // Yazışma başvuruya bağlıdır: başvuru yoksa yazışma da yoktur.
  if (!m || !getConversationApp(state, id)) return <NotFoundPage />;
  const job = getJob(state, m.jid)!;
  const request = getRequest(state, id);
  // Bildirimin hâli başvurunun güncel durumundan türetilir (geri çekildi, sonuçlandı, aşama geçti).
  const phase = getRequestPhase(state, id);

  function ask() {
    setAsking(true);
    inputRef.current?.focus();
  }

  return (
    <div className="en-chat flex h-full flex-col bg-canvas" style={{ paddingBottom: keyboard || undefined }}>
      <ChatHeader
        back={back}
        job={job}
        company={m.company}
        online={m.online}
        menu={[
          { label: "Başvuruyu görüntüle", icon: Briefcase, to: withBack(routePath("v1", "basvuru", m.jid)), testId: "chat-menu-application" },
          { label: "İlanı görüntüle", icon: FileText, to: withBack(routePath("v1", "ilan", m.jid)), testId: "chat-menu-job" },
        ]}
      />
      <div
        ref={listRef}
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain"
        onScroll={(e) => {
          const el = e.currentTarget;
          atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_SLACK;
        }}
      >
        <ApplicationContextCard to={withBack(routePath("v1", "basvuru", m.jid))} icon={m.subjectIcon} title={job.title} subject={getConversationSubject(state, id)} />
        <div className="flex flex-col gap-8 p-16" role="log" aria-label={`${m.company} ile yazışma`}>
          {thread.map((msg, i) => {
            const prev = thread[i - 1];
            const groupStart = !prev || prev.author !== msg.author || prev.day !== msg.day;
            // Bildirim mesajı (davet, teklif): hızlı yanıtlar yalnız en güncel ve yanıt bekleyen bildirimde.
            const isRequest = msg.kind !== "text" && request != null;
            const current = isRequest && request.messageId === msg.id;
            const pending = current && phase === "pending";
            // Yanıt beklemeyen bildirimde hızlı yanıtların yerine durum satırı çıkar.
            const statusKey: StatusKey | undefined = !isRequest ? undefined : !current ? "superseded" : phase === "pending" ? undefined : phase;
            return (
              <div key={msg.id} className={cn("grid gap-12", groupStart && i > 0 && "mt-8")}>
                <MessageRow
                  message={msg}
                  job={job}
                  groupStart={groupStart}
                  struck={statusKey === "superseded" || statusKey === "cancelled" || statusKey === "withdrawn" || statusKey === "closed"}
                  footer={request && statusKey && <RequestStatusLine request={request} status={statusKey} />}
                />
                {pending && (
                  <QuickReplies
                    type={request.type}
                    onAccept={actions.accept}
                    onCounter={() =>
                      request.type === "interview" ? openOverlay({ kind: "reschedule", conversationId: id }) : actions.requestTalk()
                    }
                    onAsk={ask}
                  />
                )}
              </div>
            );
          })}
          {typing && <TypingRow />}
        </div>
      </div>
      <Composer
        inputRef={inputRef}
        placeholder={asking ? "Sorunu yaz…" : "Yanıtını yaz…"}
        onSend={(text) => {
          actions.send(text);
          setAsking(false);
        }}
        onAttach={(name) => actions.send("", name)}
      />
    </div>
  );
}
