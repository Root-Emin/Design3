import type { UserProfile } from "../types";

/** Profil bölümü; ekran hazır olduğunda adresi buraya bağlanır. */
export type ProfileSection = "personal" | "cv" | "work";

export interface ProfileStep {
  key: string;
  done: boolean;
  /** Tamamlandığında ve eksikken listede görünen metin. */
  doneText: string;
  todoText: string;
  section: ProfileSection;
}

/** Tamamlanma ölçütleri: her biri eşit ağırlıkta. Ana sayfa ve profil ekranı aynı hesabı kullanır. */
export function profileSteps(p: UserProfile): ProfileStep[] {
  return [
    { key: "personal", done: !!(p.phone && p.city), doneText: "İletişim ve konum eklendi", todoText: "İletişim ve konum bilgini ekle", section: "personal" },
    { key: "cv", done: !!p.cv, doneText: "Özgeçmiş yüklendi", todoText: "Özgeçmişini yükle", section: "cv" },
    { key: "experience", done: p.experienceCount > 0, doneText: "Deneyimler eklendi", todoText: "Deneyimlerini ekle", section: "cv" },
    { key: "education", done: !!p.education, doneText: "Eğitim bilgisi eklendi", todoText: "Eğitim bilgini ekle", section: "cv" },
    { key: "salary", done: p.salary != null, doneText: "Maaş beklentisi belirtildi", todoText: "Maaş beklentini belirt", section: "work" },
  ];
}

export interface ProfileCompletion {
  steps: ProfileStep[];
  /** 0–100, tam sayı. */
  percent: number;
  /** İlk eksik adım; profil tamamsa yok. */
  next?: ProfileStep;
}

export function profileCompletion(p: UserProfile): ProfileCompletion {
  const steps = profileSteps(p);
  const done = steps.filter((s) => s.done).length;
  return { steps, percent: Math.round((done / steps.length) * 100), next: steps.find((s) => !s.done) };
}
