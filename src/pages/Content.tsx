import type { ComponentProps, ReactNode } from "react";

/**
 * Ekran gövdesi: 16px kenar boşluklu dikey akış; çocuklar DS'in genişlik sınırlarını taşımaz.
 * Sütun ekran genişliğini aşmaz (minmax(0,1fr)): bir kartın doğal genişliği dar ekranda taşma üretmez.
 */
export function Content({ children, ...rest }: Omit<ComponentProps<"div">, "className">) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-16 p-16 *:max-w-none" {...rest}>
      {children}
    </div>
  );
}

/** Logo/avatar + başlık bloğu (.job-head). */
export function MediaHead({ media, children }: { media: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-start gap-12">
      {media}
      <div className="grid min-w-0 gap-8">{children}</div>
    </div>
  );
}
