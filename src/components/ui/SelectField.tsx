import { ChevronDown } from "lucide-react";
import type { Ref } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../icons/Icon";

interface SelectFieldProps {
  id: string;
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  helper: string;
  /** Doğrulama sonucu; henüz doğrulanmadıysa undefined. */
  invalid?: boolean;
  errorText?: string;
  ref?: Ref<HTMLSelectElement>;
}

/** DS Select (ds-field ds-select): zorunlu, "Seç" yer tutuculu. */
export function SelectField({ id, label, options, value, onChange, helper, invalid, errorText, ref }: SelectFieldProps) {
  const helpId = `${id}-h`;
  return (
    <div className={cn("ds-field ds-select ds-field--md w-full max-w-none", !value && "is-placeholder", invalid && "is-error")}>
      <label className="ds-field__label" htmlFor={id}>
        {label}
        <span className="ds-field__req" aria-hidden="true">
          *
        </span>
      </label>
      <div className="ds-field__control ds-select__control">
        <select
          ref={ref}
          id={id}
          className="ds-field__input ds-select__input"
          required
          aria-required="true"
          aria-describedby={helpId}
          aria-invalid={invalid}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-testid={`form-${id}`}
        >
          <option value="" disabled>
            Seç
          </option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <span className="ds-select__chev">
          <Icon icon={ChevronDown} />
        </span>
      </div>
      <div className="ds-field__foot">
        <p className="ds-field__help" id={helpId}>
          <span>{invalid && errorText ? errorText : helper}</span>
        </p>
      </div>
    </div>
  );
}
