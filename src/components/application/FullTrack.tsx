import { ArrowRight, Check, Circle, CircleCheck, Info, Minus } from "lucide-react";
import { STATUS } from "../../data/status";
import { cn } from "../../lib/utils";
import { routePath } from "../../routes/paths";
import { useAppState } from "../../state/AppStateProvider";
import { getRequestEndedNote, isClosed } from "../../state/appState";
import { STAGES, type Application } from "../../types";
import { Icon } from "../icons/Icon";
import { Button } from "../ui/Button";

type StepState = "is-done" | "is-current" | "is-closed" | "is-skipped" | "is-todo";

function stepState(app: Application, i: number): StepState {
  const idx = STAGES.indexOf(app.stage);
  const closed = isClosed(app);
  if (i < idx || (i === idx && !closed && app.stage === "Teklif")) return "is-done";
  if (i === idx) return closed ? "is-closed" : "is-current";
  return closed ? "is-skipped" : "is-todo";
}

const SR_TEXT: Record<StepState, string> = {
  "is-done": ", tamamlandı",
  "is-current": ", mevcut aşama",
  "is-closed": ", süreç bu aşamada sonuçlandı",
  "is-skipped": ", uygulanmadı",
  "is-todo": ", bekliyor",
};

function StepNode({ state }: { state: StepState }) {
  if (state === "is-done") return <Icon icon={Check} size={14} />;
  if (state === "is-closed") return <Icon icon={Minus} size={14} />;
  if (state === "is-current") return <Icon icon={Circle} size={6} fill="currentColor" stroke="none" className="" />;
  return null;
}

function TrackNote({ app }: { app: Application }) {
  // İşveren daveti/teklifi iptal ettiyse ya da süre dolduysa sıradaki adım yerine bu yazılır (kartla aynı).
  const requestNote = getRequestEndedNote(useAppState(), app.id);
  if (app.outcome === "Sonuçlanmadı") {
    return (
      <div className="en-track__note is-neutral">
        <p>
          <Icon icon={Info} size={16} />
          <span>Bu pozisyon için süreç sonuçlandı. İşveren başka bir adayla ilerlemeye karar verdi.</span>
        </p>
        <Button variant="tertiary" size="sm" to={routePath("v1", "ara")} icon={ArrowRight} iconPosition="end" testId="track-similar">
          Benzer ilanları gör
        </Button>
      </div>
    );
  }
  if (app.outcome === "Geri çekildi") {
    return (
      <div className="en-track__note is-neutral">
        <p>
          <Icon icon={Info} size={16} />
          <span>Bu başvuruyu sen geri çektin.</span>
        </p>
      </div>
    );
  }
  if (requestNote) {
    return (
      <p className="en-track__note is-neutral" data-testid="track-next">
        <Icon icon={Info} size={16} />
        <span>{requestNote}</span>
      </p>
    );
  }
  if (app.stage === "Teklif") {
    return (
      <p className="en-track__note is-success">
        <Icon icon={CircleCheck} size={16} />
        <span>Teklifin detayları Mesajlar'da.</span>
      </p>
    );
  }
  // B14: kartta olan "Sırada" satırı detayda da durur; aday detaydan baktığında da sıradaki adımı görür.
  return (
    <p className="en-track__note is-neutral" data-testid="track-next">
      <Icon icon={Info} size={16} />
      <span>
        <strong>Sırada:</strong> {STATUS[app.stage].next}
      </span>
    </p>
  );
}

/** DS Tracker (dikey): tüm aşamalar, tarihleri ve sonuç notu. */
export function FullTrack({ app }: { app: Application }) {
  return (
    <section className={cn("en-track en-track--vertical max-w-none", isClosed(app) && "is-closed")} aria-label="Başvuru aşamaları">
      <ol className="en-track__steps">
        {STAGES.map((s, i) => {
          const state = stepState(app, i);
          return (
            <li key={s} className={cn("en-track__step", state)} aria-current={state === "is-current" ? "step" : undefined}>
              <span className="en-track__node">
                <StepNode state={state} />
              </span>
              <span className="en-track__label">{s}</span>
              <span className="en-track__date en-num">{app.dates[s] ?? "—"}</span>
              <span className="en-sr">{SR_TEXT[state]}</span>
            </li>
          );
        })}
      </ol>
      <TrackNote app={app} />
    </section>
  );
}
