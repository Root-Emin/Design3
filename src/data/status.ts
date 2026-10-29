import { Calendar, CircleCheck, CircleMinus, Clock, Eye, Send, Star, type LucideIcon } from "lucide-react";
import type { StatusLabel, StatusVariant } from "../types";

export interface StatusMeta {
  key: string;
  variant: StatusVariant;
  icon: LucideIcon;
  what: string;
  next: string;
}

/** Durum sözlüğü: rozet, açıklama penceresi ve aşama göstergesi bu tablodan beslenir. */
export const STATUS: Record<StatusLabel, StatusMeta> = {
  "Başvuruldu": {
    key: "basvuruldu",
    variant: "application",
    icon: Send,
    what: "Başvurun işverene ulaştı. İşveren henüz açmadı.",
    next: "İşveren başvurunu incelediğinde burada görürsün.",
  },
  "Görüntülendi": {
    key: "goruntulendi",
    variant: "viewed",
    icon: Eye,
    what: "İşveren başvurunu açtı ve inceledi.",
    next: "Uygun görülürse işveren seninle iletişime geçer.",
  },
  "Değerlendirmede": {
    key: "degerlendirmede",
    variant: "pending",
    icon: Clock,
    what: "İşveren başvurunu değerlendirme listesine aldı.",
    next: "İşveren adayları değerlendiriyor. Sonuç burada görünür.",
  },
  "Mülakat": {
    key: "mulakat",
    variant: "interview",
    icon: Calendar,
    what: "İşveren seni mülakata davet etti.",
    next: "Mülakat bilgilerin Mesajlar'da.",
  },
  "Teklif": {
    key: "teklif",
    variant: "offer",
    icon: CircleCheck,
    what: "İşveren sana iş teklifi gönderdi.",
    next: "İşverenin teklifini Mesajlar'da inceleyebilirsin.",
  },
  "Sonuçlanmadı": {
    key: "sonuclanmadi",
    variant: "closed",
    icon: CircleMinus,
    what: "İşveren bu pozisyon için başka bir adayla ilerlemeye karar verdi.",
    next: "Benzer ilanlara göz atabilirsin.",
  },
  "Geri çekildi": {
    key: "geri-cekildi",
    variant: "closed",
    icon: CircleMinus,
    what: "Bu başvuruyu sen geri çektin.",
    next: "Benzer ilanlara göz atabilirsin.",
  },
};

/** Tüm durumlar, sözlükteki sırayla: önce aşamalar, sonra sonuçlar. */
export const STATUS_LABELS = Object.keys(STATUS) as StatusLabel[];

/** "Mevcut ekran" (baseline) listesindeki durum ikonları. */
export const BASELINE_STATUS_ICON: Record<StatusLabel, LucideIcon> = {
  "Başvuruldu": Send,
  "Görüntülendi": Eye,
  "Değerlendirmede": Clock,
  "Mülakat": Calendar,
  "Teklif": Star,
  "Sonuçlanmadı": CircleMinus,
  "Geri çekildi": CircleMinus,
};
