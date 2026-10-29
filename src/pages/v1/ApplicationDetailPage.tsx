import { MessageSquare } from "lucide-react";
import { useLayoutEffect } from "react";
import { useParams } from "react-router";
import { FullTrack } from "../../components/application/FullTrack";
import { StatusBadge } from "../../components/application/StatusBadge";
import { AppBar } from "../../components/layout/AppBar";
import { CompanyAvatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { ListItem } from "../../components/ui/ListItem";
import { Panel } from "../../components/ui/Panel";
import { Heading, MutedText } from "../../components/ui/Typography";
import { conversationIdFor } from "../../data/messages";
import { routePath, useBackTarget, useWithBack } from "../../routes/paths";
import { useAppDispatch, useAppState } from "../../state/AppStateProvider";
import { findApp, getJob, isClosed } from "../../state/appState";
import { useOverlay } from "../../state/OverlayProvider";
import { Content, MediaHead } from "../Content";
import { NotFoundPage } from "../NotFoundPage";

export function ApplicationDetailPage() {
  const id = Number(useParams().id);
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { openOverlay } = useOverlay();
  const app = findApp(state, id);
  // Yazışmadan gelindiyse geri o yazışmaya, yoksa başvuru listesine döner.
  const back = useBackTarget(routePath("v1", "basvurularim"));
  const withBack = useWithBack();

  // Detay açıldığında güncelleme okunmuş sayılır; rozet sayıları aynı karede düşer.
  useLayoutEffect(() => {
    if (app?.unread) dispatch({ type: "markRead", id: app.id });
  }, [app, dispatch]);

  if (!app) return <NotFoundPage />;
  const job = getJob(state, app.id)!;
  const open = !isClosed(app);
  const chatId = conversationIdFor(app.id);

  return (
    <>
      <AppBar title="Başvuru detayı" back={back} />
      <Content>
        {/* Başlık: rozet ve başvuru tarihi dar ekranda alt satıra kayar. */}
        <header className="grid gap-12">
          <MediaHead media={<CompanyAvatar job={job} size="lg" />}>
            <Heading look="h3" className="break-words">{job.title}</Heading>
            <MutedText>{`${job.company} · ${job.city}`}</MutedText>
          </MediaHead>
          <div className="flex flex-wrap items-center gap-x-12 gap-y-8">
            <StatusBadge app={app} />
            <MutedText>{`${app.applied} tarihinde başvurdun`}</MutedText>
          </div>
        </header>
        <FullTrack app={app} />
        <Panel as="section" flush title="İşveren hareketleri" titleId="ev-t">
          {app.events.map((e, i) => (
            <ListItem
              key={i}
              variant="event"
              icon={e.icon}
              title={e.text}
              sup={e.at}
              to={e.messageId ? withBack(routePath("v1", "mesaj", e.messageId)) : undefined}
              testId={`event-${i}`}
            />
          ))}
        </Panel>
        <div className="grid gap-8">
          {open && chatId != null && (app.stage === "Mülakat" || app.stage === "Teklif") && (
            <Button variant="secondary" block to={withBack(routePath("v1", "mesaj", chatId))} icon={MessageSquare} testId="detail-open-message">
              {app.stage === "Mülakat" ? "Mülakat mesajını aç" : "Teklif mesajını aç"}
            </Button>
          )}
          <Button variant="secondary" block to={withBack(routePath("v1", "ilan", app.id))} testId="detail-view-job">
            İlanı görüntüle
          </Button>
          {open && app.stage !== "Teklif" && (
            <Button variant="tertiary" block onClick={() => openOverlay({ kind: "withdraw", appId: app.id })} testId="detail-withdraw">
              Başvuruyu geri çek
            </Button>
          )}
        </div>
      </Content>
    </>
  );
}
