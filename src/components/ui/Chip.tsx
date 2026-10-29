import { Check, X, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Icon } from "../icons/Icon";

interface FilterChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  count?: number;
  testId?: string;
}

/** DS Chip, filtre varyantı: seçiliyken onay ikonu gösterir. */
export function FilterChip({ label, selected, onClick, count, testId }: FilterChipProps) {
  return (
    <button
      type="button"
      className={cn("en-chip en-chip--filter en-state en-focus", selected && "is-selected")}
      aria-pressed={selected}
      onClick={onClick}
      data-testid={testId}
    >
      {selected && <Icon icon={Check} size={16} />}
      <span className="en-chip__label">{label}</span>
      {count != null && <span className="en-chip__count en-num">{count}</span>}
    </button>
  );
}

interface InputChipProps {
  label: string;
  removeLabel: string;
  onRemove: () => void;
  testId?: string;
}

/** DS Chip, girdi varyantı: seçili bir değeri gösterir, kapatma düğmesiyle kaldırılır. */
export function InputChip({ label, removeLabel, onRemove, testId }: InputChipProps) {
  return (
    <span className="en-chip en-chip--input max-w-full" data-testid={testId}>
      <span className="en-chip__label min-w-0 truncate">{label}</span>
      <button type="button" className="en-chip__remove en-state en-focus en-hit" aria-label={removeLabel} onClick={onRemove}>
        <Icon icon={X} size={16} />
      </button>
    </span>
  );
}

/** DS Chip, bilgi varyantı (liste öğesi olarak). */
export function InfoChip({ icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <li>
      <span className="en-chip en-chip--info">
        <Icon icon={icon} size={16} />
        <span className="en-chip__label">{label}</span>
      </span>
    </li>
  );
}
