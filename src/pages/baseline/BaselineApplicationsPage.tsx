import { Star } from "lucide-react";
import { Link } from "react-router";
import { Icon } from "../../components/icons/Icon";
import { AppBar } from "../../components/layout/AppBar";
import { CompanyAvatar } from "../../components/ui/Avatar";
import { MutedText } from "../../components/ui/Typography";
import { BASELINE_STATUS_ICON } from "../../data/status";
import { baselineDate } from "../../lib/format";
import { routePath } from "../../routes/paths";
import { useAppState } from "../../state/AppStateProvider";
import { getJob, sortByUpdated, statusLabel } from "../../state/appState";
import { Content } from "../Content";
import { BaselineSub } from "./BaselineSub";

/** Mevcut ekranın sade kopyası: düz liste, durum yalnız ikonla. */
export function BaselineApplicationsPage() {
  const state = useAppState();
  return (
    <>
      <AppBar title="Başvurularım" />
      {state.apps.length === 0 ? (
        <Content>
          <MutedText>Başvuru bulunamadı.</MutedText>
        </Content>
      ) : (
        <div className="grid" data-testid="application-list">
          {sortByUpdated(state.apps).map((a) => {
            const job = getJob(state, a.id)!;
            return (
              <Link
                key={a.id}
                className="flex items-center gap-12 bg-surface px-16 py-12 text-primary no-underline shadow-hairline-bottom"
                to={routePath("baseline", "basvuru", a.id)}
                data-testid={`app-card-${a.id}`}
              >
                <CompanyAvatar job={job} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="m-0 block truncate text-body-md font-semibold">{job.title}</span>
                  <BaselineSub as="span">
                    {`${job.company} `}<Icon icon={Star} size={12} className="flex-none text-tertiary" />
                  </BaselineSub>
                  <BaselineSub as="span">{baselineDate(a.applied)}</BaselineSub>
                </span>
                <Icon icon={BASELINE_STATUS_ICON[statusLabel(a)]} size={16} className="flex-none text-tertiary" />
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
