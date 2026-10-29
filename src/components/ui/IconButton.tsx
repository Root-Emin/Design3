import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { Link } from "react-router";
import { cn } from "../../lib/utils";
import { Icon } from "../icons/Icon";

/** Kalan düğme özellikleri olduğu gibi aktarılır; böylece shadcn/Radix tetikleyicisi (asChild) olabilir. */
interface IconButtonProps extends Omit<ComponentProps<"button">, "children" | "className"> {
  icon: LucideIcon;
  label: string;
  to?: string;
  pressed?: boolean;
  /** DS varyantı: standart (şeffaf), dolu (birincil eylem) ya da çerçeveli. */
  variant?: "standard" | "filled" | "outlined";
  size?: "md" | "lg";
  testId?: string;
}

/** DS Icon Button (standart 40px / büyük 48px, en az 48px dokunma alanı). */
export function IconButton({ icon, label, to, pressed, variant = "standard", size = "md", testId, ...rest }: IconButtonProps) {
  const cls = cn("en-iconbtn", `en-iconbtn--${variant}`, size === "lg" && "en-iconbtn--lg", "en-state en-focus en-hit");
  // Basılı (açık) durumdaki geçiş düğmesi ikonu dolu çizilir (ör. kaydedilmiş ilan).
  const glyph = <Icon icon={icon} size={24} fill={pressed ? "currentColor" : "none"} />;
  if (to) {
    return (
      <Link to={to} className={cls} aria-label={label} data-testid={testId}>
        {glyph}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} aria-label={label} aria-pressed={pressed} data-testid={testId} {...rest}>
      {glyph}
    </button>
  );
}
