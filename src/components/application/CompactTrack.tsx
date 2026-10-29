import { Check, CircleMinus, Ellipsis, type LucideIcon } from "lucide-react";
import { STATUS } from "../../data/status";
import { cn } from "../../lib/utils";
import { isClosed, statusLabel } from "../../state/appState";
import { STAGES, type Application, type StatusVariant } from "../../types";
import { Icon } from "../icons/Icon";

const trackStepClass = (v: StatusVariant) => (v === "application" ? "" : `ds-track__step--${v}`);

interface StepProps {
  state: "is-done" | "is-current" | "is-open";
  variant?: StatusVariant;
  icon: LucideIcon;
  text: string;
  srPrefix: string;
}

function Step({ state, variant, icon, text, srPrefix }: StepProps) {
  return (
    <li className={cn("ds-track__step", state, variant && trackStepClass(variant))} aria-current={state === "is-current" ? "step" : undefined}>
      <span className="ds-track__rail">
        <span className="ds-track__node">
          <Icon icon={icon} size={14} />
        </span>
        <span className="ds-track__line" />
      </span>
      <span className="ds-track__body">
        <span className="ds-track__label">
          <span className="ds-sr">{srPrefix}</span>
          {text}
        </span>
      </span>
    </li>
  );
}

/** Kart içindeki kısa aşama göstergesi: önceki, şu anki ve (varsa) sıradaki adım. */
export function CompactTrack({ app }: { app: Application }) {
  const idx = STAGES.indexOf(app.stage);
  const closed = isClosed(app);
  const prev = idx > 0 ? STAGES[idx - 1] : null;
  return (
    <div className="ds-app-card__track">
      <ol className="ds-track ds-track--horizontal ds-track--compact" aria-label="Başvuru ilerlemesi">
        {prev && <Step state="is-done" variant={STATUS[prev].variant} icon={Check} text={prev} srPrefix="Tamamlandı: " />}
        <Step
          state="is-current"
          variant={closed ? "closed" : STATUS[app.stage].variant}
          icon={closed ? CircleMinus : STATUS[app.stage].icon}
          text={closed ? statusLabel(app) : app.stage}
          srPrefix="Şu anki aşama: "
        />
        {!closed && idx < STAGES.length - 1 && (
          <Step state="is-open" icon={Ellipsis} text={idx === 0 ? "İşverenin incelemesi" : "Sonraki adım işverende"} srPrefix="Sonraki aşama: " />
        )}
      </ol>
    </div>
  );
}
