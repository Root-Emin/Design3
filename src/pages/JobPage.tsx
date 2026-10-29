import { Building2, Clock, MapPin } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router";
import { StatusBadge } from "../components/application/StatusBadge";
import { JobBenefitsSection } from "../components/job/JobBenefits";
import { SaveJobButton } from "../components/job/SaveJobButton";
import { AppBar } from "../components/layout/AppBar";
import { CompanyAvatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { InfoChip } from "../components/ui/Chip";
import { MatchRing } from "../components/ui/Match";
import { Panel } from "../components/ui/Panel";
import { Salary } from "../components/ui/Salary";
import { Heading, MutedText } from "../components/ui/Typography";
import { routePath, useBackTarget, useVersion, useWithBack } from "../routes/paths";
import { useAppState } from "../state/AppStateProvider";
import { findApp, getJob } from "../state/appState";
import { useOverlay } from "../state/OverlayProvider";
import { Content, MediaHead } from "./Content";
import { NotFoundPage } from "./NotFoundPage";

interface JobPageProps {
  /** "/basvur/:id" adresi: ekran açılınca başvuru formu da açılır. */
  openApply?: boolean;
}

/** İlan detayı. Yeni tasarım ve mevcut ekran yalnız üst çubuğun görünümünde ve alt çubukta ayrışır. */
export function JobPage({ openApply }: JobPageProps) {
  const id = Number(useParams().id);
  const ver = useVersion();
  const state = useAppState();
  const { openOverlay } = useOverlay();
  const job = getJob(state, id);
  const app = findApp(state, id);
  // Yeni tasarımda zaten başvurulmuş ilanda form açılmaz; mevcut ekranda her zaman açılır.
  // Geri, ilanın açıldığı ekrana döner (detay, yazışma, ana sayfa, arama, kaydedilenler).
  const back = useBackTarget(app ? routePath(ver, "basvuru", id) : routePath(ver, "ara"));
  const withBack = useWithBack();
  const autoOpen =openApply && !!job && (ver === "baseline" || !app);

  useEffect(() => {
    if (autoOpen) openOverlay({ kind: "apply", jobId: id });
  }, [autoOpen, id, openOverlay]);

  if (!job) return <NotFoundPage />;
  const apply = () => openOverlay({ kind: "apply", jobId: id });

  let bar;
  if (ver === "baseline") {
    bar = app ? (
      <Button disabled className="flex-1" testId="job-applied">
        Başvurdunuz
      </Button>
    ) : (
      <Button onClick={apply} className="flex-1" testId="job-apply">
        Başvur
      </Button>
    );
  } else if (app) {
    bar = (
      <>
        <StatusBadge app={app} />
        <Button variant="secondary" to={withBack(routePath(ver, "basvuru", id))} className="flex-1" testId="job-view-application">
          Başvurunu görüntüle
        </Button>
      </>
    );
  } else {
    bar = (
      <Button onClick={apply} className="flex-1" testId="job-apply">
        Hemen başvur
      </Button>
    );
  }

  return (
    <>
      <AppBar
        title="İlan detayı"
        back={back}
        bell={false}
        actions={<SaveJobButton jobId={id} testId="job-detail-save" />}
        variant={ver === "v1" ? "rounded" : "default"}
      />
      <Content>
        <MediaHead media={<CompanyAvatar job={job} size="lg" />}>
          <Heading look="h3">{job.title}</Heading>
          <MutedText>{job.company}</MutedText>
        </MediaHead>
        <ul className="en-job__meta items-center" aria-label="İlan özellikleri">
          <InfoChip icon={MapPin} label={job.city} />
          <InfoChip icon={Building2} label={job.mode} />
          <InfoChip icon={Clock} label={job.type} />
        </ul>
        <Panel>
          <Salary range={job.sal} />
        </Panel>
        <Panel>
          <div className="flex flex-nowrap items-center gap-8">
            <MatchRing value={job.match} />
            <MutedText>Profilindeki deneyim ve yetenekler bu ilanın aradıklarıyla karşılaştırıldı.</MutedText>
          </div>
        </Panel>
        <section className="grid gap-8">
          <Heading as="h3" look="title">
            İş tanımı
          </Heading>
          <MutedText>{job.desc}</MutedText>
        </section>
        <section className="grid gap-8">
          <Heading as="h3" look="title">
            Aranan nitelikler
          </Heading>
          <MutedText as="ul" className="grid gap-4 pl-20">
            {job.req.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </MutedText>
        </section>
        <JobBenefitsSection job={job} />
        <MutedText>{`İlan tarihi: ${job.posted}`}</MutedText>
      </Content>
      <div className="sticky bottom-[var(--bnav-overlap,0px)] z-(--z-sticky) flex items-center gap-12 bg-surface px-16 py-12 shadow-hairline-top">{bar}</div>
    </>
  );
}
