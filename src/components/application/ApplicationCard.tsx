import { Calendar, Info, MapPin } from "lucide-react";
import { Link } from "react-router";
import { STATUS } from "../../data/status";
import { useCardNavigation } from "../../hooks/useCardNavigation";
import { cn } from "../../lib/utils";
import { routePath, useVersion, useWithBack } from "../../routes/paths";
import { useAppState } from "../../state/AppStateProvider";
import { getJob, getRequestEndedNote, statusLabel } from "../../state/appState";
import type { Application } from "../../types";
import { Icon } from "../icons/Icon";
import { Button } from "../ui/Button";
import { CompactTrack } from "./CompactTrack";
import { StatusBadge } from "./StatusBadge";

interface ApplicationCardProps {
  app: Application;
  density?: "comfortable" | "compact";
}

/** DS Application Card: şirket, durum rozeti, kısa aşama göstergesi ve sıradaki adım. */
export function ApplicationCard({ app, density = "comfortable" }: ApplicationCardProps) {
  const state = useAppState();
  const ver = useVersion();
  const job = getJob(state, app.id)!;
  const label = statusLabel(app);
  const ended = app.outcome !== null;
  // İşveren daveti/teklifi iptal ettiyse ya da süre dolduysa sıradaki adım yerine bu yazılır.
  const requestNote = getRequestEndedNote(state, app.id);
  // Kart ana sayfada da listelenir; detayın geri düğmesi kartın bulunduğu ekrana döner.
  const href = useWithBack()(routePath(ver, "basvuru", app.id));
  const onClick = useCardNavigation(href);

  return (
    <article
      className={cn("ds-app-card max-w-none cursor-pointer", density === "compact" && "ds-app-card--compact", app.unread && "is-unread")}
      onClick={onClick}
      data-testid={`app-card-${app.id}`}
    >
      <div className="ds-app-card__head min-w-0">
        <span className="ds-app-card__logo" aria-hidden="true">
          {job.init}
        </span>
        <div className="ds-app-card__titles">
          <h3 className="ds-app-card__title truncate">
            <Link className="ds-app-card__link" to={href} data-testid={`app-card-link-${app.id}`}>
              {job.title}
            </Link>
          </h3>
          <p className="ds-app-card__company text-body-md">{job.company}</p>
        </div>
        {app.unread && (
          <span className="ds-app-card__new">
            <span className="ds-badge ds-badge--brand ds-badge--solid ds-badge--sm">
              <span>Yeni</span>
            </span>
            <span className="ds-sr"> durum güncellemesi</span>
          </span>
        )}
      </div>
      <p className="ds-app-card__meta text-body-md">
        <span>
          <Icon icon={MapPin} size={16} />
          {job.city}
        </span>
        <span>
          <Icon icon={Calendar} size={16} />
          {app.ago}
        </span>
      </p>
      <div className="ds-app-card__status">
        <StatusBadge app={app} />
        <CompactTrack app={app} />
      </div>
      <p className="ds-app-card__next text-body-md">
        <Icon icon={Info} size={16} />
        {ended || requestNote ? (
          <span>{requestNote ?? STATUS[label].next}</span>
        ) : (
          <span>
            <strong>Sırada:</strong> {STATUS[label].next}
          </span>
        )}
      </p>
      {ended && (
        <div className="ds-app-card__actions">
          <Button variant="tertiary" size="sm" to={routePath(ver, "ara")} testId={`card-similar-${app.id}`}>
            Benzer ilanları gör
          </Button>
        </div>
      )}
    </article>
  );
}
