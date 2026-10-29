import { Star } from "lucide-react";
import { useParams } from "react-router";
import { Icon } from "../../components/icons/Icon";
import { AppBar } from "../../components/layout/AppBar";
import { CompanyAvatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Heading } from "../../components/ui/Typography";
import { BASELINE_STATUS_ICON } from "../../data/status";
import { baselineDate } from "../../lib/format";
import { routePath } from "../../routes/paths";
import { useAppState } from "../../state/AppStateProvider";
import { findApp, getJob, statusLabel } from "../../state/appState";
import { Content, MediaHead } from "../Content";
import { NotFoundPage } from "../NotFoundPage";
import { BaselineSub } from "./BaselineSub";

export function BaselineApplicationPage() {
  const state = useAppState();
  const app = findApp(state, Number(useParams().id));
  if (!app) return <NotFoundPage />;
  const job = getJob(state, app.id)!;

  return (
    <>
      <AppBar title="Başvuru" back={routePath("baseline", "basvurularim")} />
      <Content>
        <MediaHead media={<CompanyAvatar job={job} />}>
          <Heading look="title">{job.title}</Heading>
          <BaselineSub>
            {`${job.company} `}<Icon icon={Star} size={12} className="flex-none text-tertiary" />
          </BaselineSub>
        </MediaHead>
        <BaselineSub>
          {`Başvuru tarihi: ${baselineDate(app.applied)} `}
          <Icon icon={BASELINE_STATUS_ICON[statusLabel(app)]} size={16} className="flex-none text-tertiary" />
        </BaselineSub>
        <Button variant="secondary" block to={routePath("baseline", "ilan", app.id)} testId="detail-view-job">
          İlana git
        </Button>
      </Content>
    </>
  );
}
