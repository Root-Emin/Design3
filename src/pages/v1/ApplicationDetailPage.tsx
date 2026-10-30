import { LoaderCircle, MessageSquare } from "lucide-react";
import { useLayoutEffect } from "react";
import { useLocation, useParams } from "react-router";
import { FullTrack } from "../../components/application/FullTrack";
import { StatusBadge } from "../../components/application/StatusBadge";
import { AppBar } from "../../components/layout/AppBar";
import { Alert } from "../../components/ui/Alert";
import { CompanyAvatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { ListItem } from "../../components/ui/ListItem";
import { Panel } from "../../components/ui/Panel";
import { Progress } from "../../components/ui/Progress";
import { CardSkeletonList } from "../../components/ui/Skeleton";
import { Heading, MutedText } from "../../components/ui/Typography";
import { conversationIdFor } from "../../data/messages";
import { sourceRoute, track, useTrackLoaded, useTrackOnce } from "../../lib/analytics";
import { routePath, useBackTarget, useWithBack } from "../../routes/paths";
import { useAppDispatch, useAppState } from "../../state/AppStateProvider";
import { findApp, getJob, isClosed, statusLabel } from "../../state/appState";
import { useOverlay } from "../../state/OverlayProvider";
import { Content, MediaHead } from "../Content";
import { NotFoundPage } from "../NotFoundPage";

const RETRY_MS = 1400;

/** Detayın açıldığı ekran (geri hedefinden). */
const DETAIL_SOURCE: Record<string, string> = {
  basvurularim: "applications_list",
  ilan: "job_detail",
  bildirimler: "notification",
  ana: "home",
};

export function ApplicationDetailPage() {
  const id = Number(useParams().id);
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { openOverlay } = useOverlay();
  const app = findApp(state, id);
  // Yazışmadan gelindiyse geri o yazışmaya, yoksa başvuru listesine döner.
  const back = useBackTarget(routePath("v1", "basvurularim"));
  const withBack = useWithBack();
  const { search } = useLocation();
  const { detailState } = state;
  const ready = detailState === "dolu";
  const status = app ? statusLabel(app) : null;

  // Detay açıldığında güncelleme okunmuş sayılır; rozet sayıları aynı karede düşer.
  useLayoutEffect(() => {
    if (ready && app?.unread) dispatch({ type: "markRead", id: app.id });
  }, [app, ready, dispatch]);

  // Ölçüm (handoff Bölüm 7): kaynak, geri hedefinden okunur.
  useTrackOnce(
    "application_detail_viewed",
    { application_id: id, status, source: DETAIL_SOURCE[sourceRoute(search) ?? ""] ?? "other" },
    !!app,
    id,
  );
  useTrackLoaded("application_detail_loaded", ready && !!app, { application_id: id, activity_count: app?.events.length ?? 0 }, id);
  useTrackOnce("applications_load_failed", { screen: "application_detail", error_type: "network" }, detailState === "hata", id);

  if (!app) return <NotFoundPage />;
  const job = getJob(state, app.id)!;
  const open = !isClosed(app);
  const chatId = conversationIdFor(app.id);
  const ctx = { application_id: app.id, status };

  function retry() {
    track("applications_retry_tapped", { screen: "application_detail" });
    dispatch({ type: "setDetailState", detailState: "yukleniyor" });
    window.setTimeout(() => dispatch({ type: "setDetailState", detailState: "dolu" }), RETRY_MS);
  }

  if (!ready) {
    return (
      <>
        <AppBar title="Başvuru detayı" back={back} />
        <Content>
          {detailState === "yukleniyor" ? (
            <>
              <Progress id="pb-d" label="Başvuru detayı yükleniyor" thin />
              <CardSkeletonList count={2} />
            </>
          ) : (
            <Alert
              tone="error"
              title="Başvuru detayı yüklenemedi"
              message="Bağlantını kontrol edip tekrar dene."
              action={
                <Button variant="secondary" size="sm" icon={LoaderCircle} onClick={retry} testId="detail-error-retry">
                  Tekrar dene
                </Button>
              }
            />
          )}
        </Content>
      </>
    );
  }

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
        {app.listingRemoved && (
          <Alert
            tone="info"
            title="İlan yayından kaldırıldı"
            message={`${job.company} bu ilanı ${app.listingRemoved} tarihinde yayından kaldırdı. Başvurun ve geçmişi burada kalmaya devam eder.`}
          />
        )}
        <FullTrack app={app} />
        {/* B5: liste adayın kendi hareketlerini de içerdiği için "Başvuru geçmişi". */}
        <Panel as="section" flush title="Başvuru geçmişi" titleId="ev-t">
          {app.events.map((e, i) => (
            <ListItem
              key={i}
              variant="event"
              icon={e.icon}
              title={e.text}
              sup={e.at}
              to={e.messageId ? withBack(routePath("v1", "mesaj", e.messageId)) : undefined}
              onClick={e.messageId ? () => track("application_activity_tapped", { application_id: app.id, activity_type: e.text }) : undefined}
              testId={`event-${i}`}
            />
          ))}
        </Panel>
        <div className="grid gap-8">
          {open && chatId != null && (app.stage === "Mülakat" || app.stage === "Teklif") && (
            <Button
              variant="secondary"
              block
              to={withBack(routePath("v1", "mesaj", chatId))}
              onClick={() => track("application_message_opened", ctx)}
              icon={MessageSquare}
              testId="detail-open-message"
            >
              {app.stage === "Mülakat" ? "Mülakat mesajını aç" : "Teklif mesajını aç"}
            </Button>
          )}
          {!app.listingRemoved && (
            <Button
              variant="secondary"
              block
              to={withBack(routePath("v1", "ilan", app.id))}
              onClick={() => track("application_job_opened", ctx)}
              testId="detail-view-job"
            >
              İlanı görüntüle
            </Button>
          )}
          {open && app.stage !== "Teklif" && (
            <Button variant="tertiary" block onClick={() => {
                track("application_withdraw_started", ctx);
                openOverlay({ kind: "withdraw", appId: app.id });
              }}
              testId="detail-withdraw"
            >
              Başvuruyu geri çek
            </Button>
          )}
        </div>
      </Content>
    </>
  );
}
