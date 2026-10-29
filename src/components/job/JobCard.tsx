import { Building2, Clock, MapPin, Wallet } from "lucide-react";
import { Link } from "react-router";
import { useCardNavigation } from "../../hooks/useCardNavigation";
import { formatTL } from "../../lib/format";
import { routePath, useVersion, useWithBack } from "../../routes/paths";
import { useAppState } from "../../state/AppStateProvider";
import { findApp, getJob } from "../../state/appState";
import { StatusBadge } from "../application/StatusBadge";
import { Icon } from "../icons/Icon";
import { CompanyAvatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { InfoChip } from "../ui/Chip";
import { MatchInline } from "../ui/Match";
import { JobBenefits } from "./JobBenefits";
import { SaveJobButton } from "./SaveJobButton";

/** DS Job Card: başvurulmuş ilanlarda düğme yerine durum rozeti gösterilir. */
export function JobCard({ jobId }: { jobId: number }) {
  const state = useAppState();
  const ver = useVersion();
  const job = getJob(state, jobId)!;
  const app = findApp(state, jobId);
  // Kart ana sayfada, aramada ve kaydedilenlerde listelenir; ilanın geri düğmesi kartın bulunduğu ekrana döner.
  const withBack = useWithBack();
  const href = withBack(routePath(ver, "ilan", jobId));
  const onClick = useCardNavigation(href);

  return (
    <article className="en-job en-state max-w-none cursor-pointer" onClick={onClick} data-testid={`job-card-${jobId}`}>
      <div className="en-job__top">
        <CompanyAvatar job={job} size="lg" />
        <div className="en-job__heading">
          {job.posted === "Bugün" && (
            <div className="en-job__tags">
              <span className="en-badge en-badge--highlight en-badge--soft">
                <span>Yeni</span>
              </span>
            </div>
          )}
          <h3 className="en-job__title truncate">
            <Link to={href} className="en-job__link" data-testid={`job-link-${jobId}`}>
              {job.title}
            </Link>
          </h3>
          <p className="en-job__company">{job.company}</p>
        </div>
        <div className="en-job__save">
          <SaveJobButton jobId={jobId} testId={`job-save-${jobId}`} />
        </div>
      </div>
      <ul className="en-job__meta" aria-label="İlan özellikleri">
        <InfoChip icon={MapPin} label={job.cityShort} />
        <InfoChip icon={Building2} label={job.mode} />
        <InfoChip icon={Clock} label={job.type} />
      </ul>
      <p className="en-job__salary">
        <Icon icon={Wallet} size={16} />
        <span className="en-num">
          {`${formatTL(job.sal[0])} – ${formatTL(job.sal[1])}`}
        </span>
        <span className="en-job__unit">/ ay net</span>
      </p>
      <JobBenefits job={job} />
      <div className="en-job__foot">
        <MatchInline value={job.match} />
        <span className="en-job__posted">{job.posted}</span>
        <div className="en-job__cta">
          {app ? (
            <StatusBadge app={app} size="sm" />
          ) : (
            <Button variant="secondary" size="sm" to={withBack(routePath(ver, "basvur", jobId))} testId={`job-apply-${jobId}`}>
              Başvur
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
