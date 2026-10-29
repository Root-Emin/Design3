import { Calendar, CircleCheck, CircleMinus, Clock, Eye, FileText, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Application, ApplicationEvent, Stage } from "../types";
import { EXTRA_JOB_COUNT, EXTRA_JOB_FIRST_ID, JOBS } from "./jobs";

export function ev(icon: LucideIcon, text: string, at: string, messageId: number | null = null): ApplicationEvent {
  return { icon, text, at, messageId };
}

/** Adayın kendi hareketi; başvuru geçmişinde görünür, bildirimlerde görünmez. */
export function ownEv(icon: LucideIcon, text: string, at: string, messageId: number | null = null): ApplicationEvent {
  return { ...ev(icon, text, at, messageId), own: true };
}

export function baseApplications(): Application[] {
  return [
    {
      id: 1, stage: "Görüntülendi", outcome: null, applied: "24 Eki", appliedOn: "2026-10-24", ago: "3 gün önce başvurdun", upd: 20261026.1035, updLabel: "26 Eki", unread: true,
      dates: { "Başvuruldu": "24 Eki", "Görüntülendi": "26 Eki" },
      events: [ev(FileText, "Kıyı Lojistik CV’ni indirdi", "26 Eki 10.35"), ev(Eye, "Kıyı Lojistik başvurunu görüntüledi", "26 Eki 10.32"), ownEv(Send, "Başvurunu gönderdin", "24 Eki 09.12")],
    },
    {
      id: 2, stage: "Mülakat", outcome: null, applied: "2 Eki", appliedOn: "2026-10-02", ago: "25 gün önce başvurdun", upd: 20261027.0815, updLabel: "Bugün", unread: true,
      dates: { "Başvuruldu": "2 Eki", "Görüntülendi": "3 Eki", "Değerlendirmede": "9 Eki", "Mülakat": "27 Eki" },
      events: [ev(Calendar, "Deniz Enerji seni mülakata davet etti", "27 Eki 08.15", 1), ev(Clock, "Deniz Enerji başvurunu değerlendirmeye aldı", "9 Eki 11.00"), ev(Eye, "Deniz Enerji başvurunu tekrar görüntüledi", "8 Eki 16.20"), ev(FileText, "Deniz Enerji CV’ni indirdi", "3 Eki 09.41"), ev(Eye, "Deniz Enerji başvurunu görüntüledi", "3 Eki 09.40"), ownEv(Send, "Başvurunu gönderdin", "2 Eki 14.05")],
    },
    {
      id: 3, stage: "Değerlendirmede", outcome: null, applied: "15 Eki", appliedOn: "2026-10-15", ago: "12 gün önce başvurdun", upd: 20261021.14, updLabel: "21 Eki", unread: false,
      dates: { "Başvuruldu": "15 Eki", "Görüntülendi": "16 Eki", "Değerlendirmede": "21 Eki" },
      events: [ev(Clock, "Mavi Liman Perakende başvurunu değerlendirmeye aldı", "21 Eki 14.00"), ev(Eye, "Mavi Liman Perakende başvurunu görüntüledi", "16 Eki 10.05"), ownEv(Send, "Başvurunu gönderdin", "15 Eki 20.30")],
    },
    {
      id: 4, stage: "Başvuruldu", outcome: null, applied: "25 Eki", appliedOn: "2026-10-25", ago: "2 gün önce başvurdun", upd: 20261025.1948, updLabel: "25 Eki", unread: false,
      dates: { "Başvuruldu": "25 Eki" },
      events: [ownEv(Send, "Başvurunu gönderdin", "25 Eki 19.48")],
    },
    {
      id: 5, stage: "Teklif", outcome: null, applied: "18 Eyl", appliedOn: "2026-09-18", ago: "39 gün önce başvurdun", upd: 20261025.173, updLabel: "25 Eki", unread: false,
      dates: { "Başvuruldu": "18 Eyl", "Görüntülendi": "19 Eyl", "Değerlendirmede": "24 Eyl", "Mülakat": "6 Eki", "Teklif": "25 Eki" },
      events: [ev(CircleCheck, "Kuzey Yazılım sana teklif gönderdi", "25 Eki 17.30", 2), ev(Calendar, "Kuzey Yazılım seni mülakata davet etti", "6 Eki 15.10"), ev(Clock, "Kuzey Yazılım başvurunu değerlendirmeye aldı", "24 Eyl 11.20"), ev(FileText, "Kuzey Yazılım CV’ni indirdi", "19 Eyl 09.02"), ev(Eye, "Kuzey Yazılım başvurunu görüntüledi", "19 Eyl 09.00"), ownEv(Send, "Başvurunu gönderdin", "18 Eyl 21.40")],
    },
    {
      id: 6, stage: "Değerlendirmede", outcome: "Sonuçlanmadı", applied: "6 Eki", appliedOn: "2026-10-06", ago: "21 gün önce başvurdun", upd: 20261022.1, updLabel: "22 Eki", unread: false,
      dates: { "Başvuruldu": "6 Eki", "Görüntülendi": "7 Eki", "Değerlendirmede": "22 Eki" },
      events: [ev(CircleMinus, "Ilgaz Gıda bu pozisyon için başka bir adayla ilerledi", "22 Eki 10.00"), ev(Clock, "Ilgaz Gıda başvurunu değerlendirmeye aldı", "10 Eki 13.30"), ev(Eye, "Ilgaz Gıda başvurunu görüntüledi", "7 Eki 15.45"), ownEv(Send, "Başvurunu gönderdin", "6 Eki 12.10")],
    },
    {
      id: 7, stage: "Görüntülendi", outcome: "Geri çekildi", applied: "1 Eki", appliedOn: "2026-10-01", ago: "26 gün önce başvurdun", upd: 20261012.09, updLabel: "12 Eki", unread: false,
      dates: { "Başvuruldu": "1 Eki", "Görüntülendi": "12 Eki" },
      events: [ownEv(CircleMinus, "Başvurunu geri çektin", "12 Eki 09.00"), ev(Eye, "Tepe Sağlık Grubu başvurunu görüntüledi", "3 Eki 11.25"), ownEv(Send, "Başvurunu gönderdin", "1 Eki 18.00")],
    },
  ];
}

/** "25 başvuru" uç durumu: temel 7 başvuru + 18 üretilmiş başvuru. */
export function manyApplications(): Application[] {
  const stages: Stage[] = ["Başvuruldu", "Görüntülendi", "Değerlendirmede", "Görüntülendi", "Başvuruldu", "Değerlendirmede"];
  const list = baseApplications();
  for (let i = 0; i < EXTRA_JOB_COUNT; i++) {
    const id = EXTRA_JOB_FIRST_ID + i;
    const day = 30 - i;
    const stage = stages[i % stages.length];
    const d = `${day > 0 ? day : 1} Eyl`;
    const dates: Application["dates"] = { "Başvuruldu": d };
    if (stage !== "Başvuruldu") dates["Görüntülendi"] = d;
    if (stage === "Değerlendirmede") dates["Değerlendirmede"] = d;
    const events = [ownEv(Send, "Başvurunu gönderdin", `${d} 10.00`)];
    if (stage !== "Başvuruldu") events.unshift(ev(Eye, `${JOBS[id].company} başvurunu görüntüledi`, `${d} 15.00`));
    list.push({
      id, stage, outcome: i % 5 === 4 ? "Sonuçlanmadı" : null, applied: d, appliedOn: `2026-09-${String(day).padStart(2, "0")}`, ago: `${d} tarihinde başvurdun`,
      upd: 20260900 + day, updLabel: d, unread: false, dates, events,
    });
  }
  return list;
}
