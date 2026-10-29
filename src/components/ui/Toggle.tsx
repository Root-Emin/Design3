import type { LucideIcon } from "lucide-react";
import { Icon } from "../icons/Icon";

interface ToggleProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Etiketin solunda, liste satırlarıyla aynı dairesel ikon alanı. */
  icon?: LucideIcon;
  testId?: string;
}

/** DS Toggle (switch), etiket solda. */
export function Toggle({ id, label, checked, onChange, icon, testId }: ToggleProps) {
  return (
    <label className="en-toggle en-toggle--start" htmlFor={id}>
      {icon && (
        <span className="en-li__icon">
          <Icon icon={icon} size={24} />
        </span>
      )}
      <span className="en-toggle__text flex-1">
        <span className="en-toggle__label">{label}</span>
      </span>
      <span className="en-toggle__wrap">
        <input
          className="en-toggle__input"
          type="checkbox"
          role="switch"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          data-testid={testId}
        />
        <span className="en-toggle__track en-state" aria-hidden="true">
          <span className="en-toggle__thumb" />
        </span>
      </span>
    </label>
  );
}
