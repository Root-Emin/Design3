import { Check, Minus } from "lucide-react";
import type { Ref } from "react";
import { Icon } from "../icons/Icon";

interface CheckboxProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  ref?: Ref<HTMLInputElement>;
}

/** DS Checkbox. data-icon, DS'in seçili/ara durum işaretlerini görünür kılan seçicidir. */
export function Checkbox({ id, label, description, checked, onChange, ref }: CheckboxProps) {
  return (
    <div className="ds-check-wrap">
      <label className="ds-check" htmlFor={id}>
        <input
          ref={ref}
          type="checkbox"
          id={id}
          className="ds-check__input"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          data-testid={`form-${id}`}
        />
        <span className="ds-check__box" aria-hidden="true">
          <Icon icon={Check} size={16} data-icon="check" />
          <Icon icon={Minus} size={16} data-icon="minus" />
        </span>
        <span className="ds-check__text">
          <span className="ds-check__label">{label}</span>
          {description && <span className="ds-check__desc">{description}</span>}
        </span>
      </label>
    </div>
  );
}
