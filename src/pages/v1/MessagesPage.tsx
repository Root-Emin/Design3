import { Search } from "lucide-react";
import { useState } from "react";
import { AppBar, AppBarSearch, AppMenu } from "../../components/layout/AppBar";
import { CompanyAvatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { ListItem } from "../../components/ui/ListItem";
import { Panel } from "../../components/ui/Panel";
import { MutedText } from "../../components/ui/Typography";
import { MESSAGES } from "../../data/messages";
import { routePath, useBackTarget } from "../../routes/paths";
import { useAppState } from "../../state/AppStateProvider";
import { getConversationApp, getConversationIds, getConversationSubject, getJob, getLastMessage } from "../../state/appState";

/**
 * Mesajlar: yuvarlatılmış çubukta başlık ve yazışma araması, altında açıklama ve tek kartta yazışma
 * listesi. Zemin bg-subtle; kart yumuşak gölge ve silik kenarla ayrışır. Liste ekranla birlikte kayar,
 * alt gezinme sabit kalır.
 */
export function MessagesPage() {
  const state = useAppState();
  const all = getConversationIds(state);
  const [q, setQ] = useState("");
  const back = useBackTarget(routePath("v1", "ana"));
  const needle = q.trim().toLocaleLowerCase("tr-TR");
  // Arama şirket adı, pozisyon ve yazışmanın süreç durumu ("Mülakat daveti" …) içinde yapılır.
  const ids = needle
    ? all.filter((id) =>
        `${MESSAGES[id].company} ${getJob(state, MESSAGES[id].jid)!.title} ${getConversationSubject(state, id)}`
          .toLocaleLowerCase("tr-TR")
          .includes(needle),
      )
    : all;
  return (
    <div className="flex min-h-full flex-col bg-subtle pb-24">
      <AppBar
        title="Mesajlar"
        variant="rounded"
        center
        back={back}
        bell={false}
        actions={<AppMenu />}
        bottom={all.length > 0 && <AppBarSearch label="Şirket veya pozisyon ara" value={q} onChange={setQ} testId="messages-search" />}
      />
      <MutedText className="px-20 pt-16 pb-12">İş fırsatlarıyla ilgili mesajlarını burada görebilirsin.</MutedText>
      {all.length === 0 ? (
        <EmptyState
          illustration={<MessagesIllustration />}
          title="Henüz mesajın yok"
          text="İşverenlerle gerçekleştireceğin görüşmeler burada listelenecek."
          className="flex-1 content-center gap-8 py-32"
          testId="messages-empty"
        />
      ) : ids.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Aramana uygun mesaj yok."
          text="Farklı bir şirket ya da pozisyon adı dene."
          action={
            <Button variant="tertiary" onClick={() => setQ("")} testId="messages-search-clear">
              Aramayı temizle
            </Button>
          }
          testId="messages-search-empty"
        />
      ) : (
        <Panel flush className="mx-12 gap-0 py-0 shadow-card">
          {ids.map((id) => {
            const m = MESSAGES[id];
            const job = getJob(state, m.jid)!;
            const last = getLastMessage(state, id);
            return (
              <ListItem
                key={id}
                variant="conversation"
                avatar={<CompanyAvatar job={job} className="rounded-card [--_s:var(--size-control-lg)]" />}
                title={`${m.company} · ${getConversationSubject(state, id)}`}
                sup={job.title}
                meta={last && `${last.day} ${last.time}`}
                unread={getConversationApp(state, id)?.unread}
                to={routePath("v1", "mesaj", id)}
                testId={`message-${id}`}
              />
            );
          })}
        </Panel>
      )}
    </div>
  );
}

/** İki konuşma balonu; renkler tema token'larından, koyu temada kendiliğinden değişir. */
function MessagesIllustration() {
  return (
    <svg width="168" height="120" viewBox="0 0 168 120" fill="none" aria-hidden="true" className="mb-8">
      <path
        d="M20 66c0-30 24-54 58-54 22 0 34 14 50 22 18 9 32 16 32 36 0 26-26 42-60 42H62c-26 0-42-16-42-46Z"
        fill="var(--action-secondary)"
      />
      <rect x="42" y="34" width="56" height="38" rx="9" fill="var(--bg-muted)" />
      <path d="M52 70v12l12-10Z" fill="var(--bg-muted)" />
      <rect x="52" y="45" width="30" height="4" rx="2" fill="var(--border-default)" />
      <rect x="52" y="55" width="18" height="4" rx="2" fill="var(--border-default)" />
      <rect x="72" y="52" width="60" height="40" rx="10" fill="var(--feedback-info-border)" />
      <path d="M118 90v12l-12-10Z" fill="var(--feedback-info-border)" />
      <circle cx="90" cy="72" r="4" fill="var(--action-primary)" />
      <circle cx="102" cy="72" r="4" fill="var(--action-primary)" />
      <circle cx="114" cy="72" r="4" fill="var(--action-primary)" />
      <path d="M118 30l4-9M127 37l8-5" stroke="var(--action-primary)" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
