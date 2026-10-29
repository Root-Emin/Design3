import type { ProfilePreset, UserProfile } from "../types";

export const USER = {
  name: "Elif Yıldız",
  first: "Elif",
  initials: "EY",
  email: "elif.yildiz@ornekposta.com",
  phone: "0532 000 00 00",
  cv: "Elif_Yildiz_CV.pdf",
  cvDate: "12 Eki",
} as const;

/** Profil ekranının ve tamamlanma oranının kaynağı; eğitim ve maaş beklentisi henüz girilmedi. */
export const PROFILE: UserProfile = {
  name: USER.name,
  initials: USER.initials,
  email: USER.email,
  phone: USER.phone,
  city: "İstanbul",
  cv: { file: USER.cv, updated: USER.cvDate },
  experienceCount: 2,
  education: null,
  salary: null,
};

/** Demo panelindeki profil durumları. */
export function profilePreset(preset: ProfilePreset): UserProfile {
  switch (preset) {
    case "eksik":
      return PROFILE;
    case "tam":
      return { ...PROFILE, education: "Lisans · İşletme", salary: 45000 };
    case "yeni":
      return { ...PROFILE, phone: null, city: null, cv: null, experienceCount: 0 };
  }
}

/** Başvuru formundaki işveren soruları. */
export const START_OPTIONS = ["Hemen", "2 hafta içinde", "1 ay içinde", "1 aydan sonra"] as const;
export const EXPERIENCE_OPTIONS = ["1 yıldan az", "1–3 yıl", "3–5 yıl", "5 yıldan fazla"] as const;

/** Prototipin "bugün"ü: yeni kayıtlar bu tarihle oluşturulur. */
export const TODAY = "27 Eki";
export const TODAY_ISO = "2026-10-27";
