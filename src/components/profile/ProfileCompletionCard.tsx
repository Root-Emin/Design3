import { ChevronRight, CircleCheck, FileText } from "lucide-react";
import type { ProfileCompletion } from "../../lib/profile";
import { cn } from "../../lib/utils";
import { Icon } from "../icons/Icon";
import { Progress } from "../ui/Progress";

interface ProfileCompletionCardProps {
  completion: ProfileCompletion;
  /** Kartın tamamı ilk eksik bölüme götürür; profil tamamsa kart yalnız bilgi verir. */
  onOpen: () => void;
}

/** Profil ekranındaki tamamlanma kartı: açık mavi zemin, oran çubuğu ve chevron. */
export function ProfileCompletionCard({ completion, onOpen }: ProfileCompletionCardProps) {
  const { percent, next } = completion;
  const cls =
    "flex w-full items-center gap-16 rounded-card bg-(--surface-selected) p-16 text-left text-primary shadow-[inset_0_0_0_var(--border-width-default)_var(--feedback-info-border)]";

  if (!next) {
    return (
      <section className={cls} aria-labelledby="pc-title" data-testid="profile-completion">
        <span className="grid size-48 flex-none place-items-center rounded-full bg-surface text-success">
          <Icon icon={CircleCheck} size={24} />
        </span>
        <span className="grid min-w-0 gap-2">
          <span id="pc-title" className="text-title">
            Profilin tamamlandı
          </span>
          <span className="text-body-md text-secondary">İşverenler başvurunu açtığında profilinin tamamını görür.</span>
        </span>
      </section>
    );
  }

  return (
    <button
      type="button"
      className={cn(cls, "en-state en-focus cursor-pointer border-0 [font:inherit]")}
      onClick={onOpen}
      data-testid="profile-completion"
    >
      <span className="grid size-48 flex-none place-items-center rounded-full bg-surface text-(--action-primary)">
        <Icon icon={FileText} size={24} />
      </span>
      <span className="grid min-w-0 flex-1 gap-8">
        <span className="grid gap-2">
          <span className="text-title">Profilini tamamla</span>
          <span className="text-body-md text-secondary">Daha fazla iş fırsatına erişmek için profilini tamamla.</span>
        </span>
        <Progress id="pc-progress" label="Profil tamamlanma" value={percent} primary inline />
      </span>
      <Icon icon={ChevronRight} className="flex-none text-secondary" />
    </button>
  );
}
