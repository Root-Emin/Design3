import type { LucideIcon, LucideProps } from "lucide-react";
import { cn } from "../../lib/utils";

export type { LucideIcon };

interface IconProps extends Omit<LucideProps, "ref"> {
  /** Lucide ikon bileşeni (ör. `Search`). */
  icon: LucideIcon;
  size?: number;
  /** Verilirse ikon anlamlı görsel olarak duyurulur; verilmezse gizlenir. */
  label?: string;
  /** "en-icon"a eklenen sınıf. Varsayılan DS ikon sınıfıdır. */
  className?: string;
}

/** Lucide ikonlarını DS çizgi kalınlığı (1.75) ve sınıflarıyla çizer. */
export function Icon({ icon: Glyph, size = 20, label, className = "ds-icon", ...rest }: IconProps) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true, focusable: false };
  return <Glyph className={cn("en-icon", className)} {...a11y} size={size} strokeWidth={1.75} {...rest} />;
}
