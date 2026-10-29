import { BadgePercent, Bus, CirclePlus, CreditCard, HeartPulse, Route, Utensils, type LucideIcon } from "lucide-react";
import type { BenefitKind, Job } from "../types";

/** Yan hak kataloğu; sıra kartta ve detayda gösterim sırasıdır. */
export const BENEFITS: Readonly<Record<BenefitKind, { label: string; icon: LucideIcon }>> = {
  yemek: { label: "Yemek", icon: Utensils },
  "yemek-karti": { label: "Yemek kartı", icon: CreditCard },
  yol: { label: "Yol desteği", icon: Route },
  servis: { label: "Servis", icon: Bus },
  prim: { label: "Prim", icon: BadgePercent },
  saglik: { label: "Özel sağlık sigortası", icon: HeartPulse },
};

const ORDER = Object.keys(BENEFITS) as BenefitKind[];

export interface BenefitItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

/** İlanın yan hakları: katalogdakiler katalog sırasıyla, ardından işverenin yazdıkları. */
export function jobBenefits(job: Job): BenefitItem[] {
  const picked = ORDER.filter((k) => job.benefits?.includes(k)).map((k) => ({ key: k, ...BENEFITS[k] }));
  const other = (job.otherBenefits ?? []).map((label) => ({ key: `diger-${label}`, label, icon: CirclePlus }));
  return [...picked, ...other];
}
