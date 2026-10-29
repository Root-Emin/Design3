import type { CSSProperties } from "react";
import { cn } from "../../lib/utils";

interface ProgressProps {
  id: string;
  label: string;
  /** 0–100; verilmezse belirsiz (indeterminate) çizilir. */
  value?: number;
  thin?: boolean;
  /** Birincil renkli dolgu (varsayılan: başarı yeşili). */
  primary?: boolean;
  /** Etiket yalnız ekran okuyucuya; yüzde çubuğun sağında. */
  inline?: boolean;
}

/** DS Progress (doğrusal). */
export function Progress({ id, label, value, thin, primary, inline }: ProgressProps) {
  const indeterminate = value == null;
  const valueText = !indeterminate && <span className="en-progress__value en-num">{`%${value}`}</span>;
  return (
    <div
      className={cn(
        "en-progress",
        thin && "en-progress--thin",
        primary && "en-progress--primary",
        inline && "flex items-center gap-12",
        indeterminate && "is-indeterminate",
      )}
    >
      {inline ? (
        <span id={id} className="en-sr">
          {label}
        </span>
      ) : (
        <div className="en-progress__head">
          <span id={id}>{label}</span>
          {valueText}
        </div>
      )}
      <div
        className={cn("en-progress__track", inline && "flex-1")}
        role="progressbar"
        aria-labelledby={id}
        {...(!indeterminate && { "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": value })}
      >
        {/* Doluluk oranı veriye bağlı olduğu için DS'in --_v değişkeniyle verilir. */}
        <div className="en-progress__fill" style={indeterminate ? undefined : ({ "--_v": `${value}%` } as CSSProperties)} />
      </div>
      {inline && valueText}
    </div>
  );
}
