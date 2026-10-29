import { CircleAlert, type LucideIcon } from "lucide-react";
import type { InputHTMLAttributes, Ref } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../icons/Icon";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  id: string;
  label: string;
  /** Etiket yalnız ekran okuyucuya duyurulur. */
  hideLabel?: boolean;
  icon?: LucideIcon;
  helper?: string;
  /** Doğrulama hatası; verilirse yardımcı metnin yerine geçer. */
  errorText?: string;
  testId?: string;
  ref?: Ref<HTMLInputElement>;
  className?: string;
}

/** DS Text Field (en-field). */
export function TextField({ id, label, hideLabel, icon, helper, errorText, required, testId, className, ...input }: TextFieldProps) {
  const note = errorText ?? helper;
  const helperId = note ? `${id}-h` : undefined;
  return (
    <div className={cn("en-field w-full max-w-none", errorText && "is-error", className)}>
      <label className={cn("en-field__label", hideLabel && "en-sr")} htmlFor={id}>
        {label}
        {required && (
          <span className="en-field__req" aria-hidden="true">
            {" *"}
          </span>
        )}
      </label>
      <div className="en-field__control">
        {icon && <Icon icon={icon} />}
        <input
          className="en-field__input"
          id={id}
          required={required}
          aria-describedby={helperId}
          aria-invalid={errorText ? true : undefined}
          data-testid={testId}
          {...input}
        />
      </div>
      {note && (
        <p className="en-field__helper" id={helperId}>
          {errorText && <Icon icon={CircleAlert} size={16} />}
          <span>{note}</span>
        </p>
      )}
    </div>
  );
}
