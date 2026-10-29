import { Sparkle } from "lucide-react";
import { Icon } from "../icons/Icon";

type MatchLevel = "high" | "mid" | "low";

function matchLevel(v: number): [MatchLevel, string] {
  if (v >= 80) return ["high", "Yüksek uyum"];
  if (v >= 65) return ["mid", "İyi uyum"];
  return ["low", "Kısmi uyum"];
}

/** DS Match, satır içi rozet. */
export function MatchInline({ value }: { value: number }) {
  const [lvl, text] = matchLevel(value);
  return (
    <span className={`en-match en-match--inline en-match--${lvl}`} role="img" aria-label={`%${value} uyum, ${text.toLowerCase()}`}>
      <Icon icon={Sparkle} size={16} />
      <span className="en-num">{`%${value}`}</span>
      <span className="en-match__level">{text}</span>
    </span>
  );
}

const RING_SIZE = 64;
const RING_R = 29;

/** DS Match, halka (64px). */
export function MatchRing({ value }: { value: number }) {
  const [lvl, text] = matchLevel(value);
  const c = 2 * Math.PI * RING_R;
  const offset = c * (1 - value / 100);
  return (
    <div className={`en-match en-match--ring en-match--${lvl}`}>
      <div
        className="en-match__ring size-[64px]"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={`%${value} uyum, ${text.toLowerCase()}`}
      >
        <svg width={RING_SIZE} height={RING_SIZE} viewBox="0 0 64 64" aria-hidden="true">
          <circle className="en-match__ring-track" cx="32" cy="32" r={RING_R} strokeWidth="6" fill="none" />
          <circle
            className="en-match__ring-fill"
            cx="32"
            cy="32"
            r={RING_R}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c.toFixed(2)}
            strokeDashoffset={offset.toFixed(2)}
            transform="rotate(-90 32 32)"
          />
        </svg>
        <span className="en-match__value en-num">{`%${value}`}</span>
      </div>
      <div className="en-match__text">
        <span className="en-match__level">
          <Icon icon={Sparkle} size={16} />
          {text}
        </span>
      </div>
    </div>
  );
}
