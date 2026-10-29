import type { LucideIcon } from "lucide-react";

export const STAGES = ["Başvuruldu", "Görüntülendi", "Değerlendirmede", "Mülakat", "Teklif"] as const;
export type Stage = (typeof STAGES)[number];
export type Outcome = "Sonuçlanmadı" | "Geri çekildi";
export type StatusLabel = Stage | Outcome;

/** DS'teki durum modifier'ı: ds-status--*, ds-track__step--* */
export type StatusVariant = "application" | "viewed" | "pending" | "interview" | "offer" | "closed";

export type Tone = "blue" | "amber" | "green" | "indigo" | "slate";
export type WorkMode = "İş yerinde" | "Hibrit" | "Uzaktan";

/** İşverenin ilanda seçebildiği yan haklar; etiket ve ikon `data/benefits.ts` kataloğundan gelir. */
export type BenefitKind = "yemek" | "yemek-karti" | "yol" | "servis" | "prim" | "saglik";

export interface Job {
  title: string;
  company: string;
  init: string;
  tone: Tone;
  city: string;
  cityShort: string;
  mode: WorkMode;
  type: string;
  sal: readonly [number, number];
  match: number;
  posted: string;
  desc: string;
  req: readonly string[];
  /** İşverenin seçtiği yan haklar. Yoksa ilan kartında ve detayında yan hak alanı çizilmez. */
  benefits?: readonly BenefitKind[];
  /** Katalogda olmayan yan haklar, işverenin yazdığı gibi ("Esnek çalışma saatleri"). */
  otherBenefits?: readonly string[];
}

export interface ApplicationEvent {
  icon: LucideIcon;
  text: string;
  at: string;
  /** İlgili mesajın kimliği; varsa satır mesaja bağlanır. */
  messageId: number | null;
  /** Adayın kendi hareketi (gönderim, geri çekme, bildirime yanıt); bildirim sayılmaz. */
  own?: boolean;
}

export interface Application {
  id: number;
  stage: Stage;
  outcome: Outcome | null;
  applied: string;
  /** Başvuru günü, ISO biçiminde ("2026-10-24"); tarih filtresi bu alanla çalışır. */
  appliedOn: string;
  ago: string;
  /** Sıralama anahtarı (YYYYAAGG.SSDD). */
  upd: number;
  updLabel: string;
  unread: boolean;
  dates: Partial<Record<Stage, string>>;
  events: ApplicationEvent[];
  /** Geri çekme işleminden önceki hâl; "Geri al" için tutulur. */
  beforeWithdraw?: Pick<Application, "outcome" | "events" | "upd">;
}

/**
 * Mesajı kim yazdı: Design3 Ai asistanı, işverenin kendisi ya da aday.
 * İşverenin yazdığı mesaj asla asistan mesajı gibi gösterilmez.
 */
export type MessageAuthor = "assistant" | "employer" | "candidate";
/** Adayın mesajının teslim durumu. */
export type DeliveryStatus = "sent" | "read";
export type InterviewMode = "online" | "office" | "phone";

export interface Interview {
  /** Yerel saatle ISO tarih: "2026-10-30T14:00". */
  at: string;
  mode: InterviewMode;
}

export interface Offer {
  /** Yanıt için son gün: "2026-11-03". */
  deadline: string;
  attach: string;
}

/** Adaydan yanıt bekleyen bildirim türü: mülakat daveti ya da iş teklifi. */
export type RequestType = "interview" | "offer";

/**
 * Bildirimin son hâli; hızlı yanıtlar yalnız "pending" iken görünür.
 * countered: aday karşı öneri yaptı (mülakatta yeni saat, teklifte görüşme talebi).
 */
export type RequestStatus = "pending" | "accepted" | "countered" | "cancelled" | "expired";

interface ChatMessageBase {
  id: string;
  author: MessageAuthor;
  /** "Bugün", "25 Eki" … */
  day: string;
  /** "08.15" */
  time: string;
  status?: DeliveryStatus;
}

/** Bildirim mesajlarının metni iş ilanı ve bildirim verisinden çizim anında kurulur. */
export type ChatMessage =
  | (ChatMessageBase & { kind: "text"; body: readonly string[]; attach?: string })
  | (ChatMessageBase & { kind: "invite"; interview: Interview; revision: boolean })
  | (ChatMessageBase & { kind: "offer"; offer: Offer });

export type RequestMessage = Extract<ChatMessage, { kind: "invite" | "offer" }>;

/**
 * Bildirimin başvuruya göre geçerliliği. Başvuru geri çekildiyse, sonuçlandıysa ya da aşama
 * bildirimin aşamasını geçtiyse bildirime artık yanıt verilmez.
 */
export type RequestBlock = "withdrawn" | "closed" | "passed";
/** Bildirimin ekranda görünen hâli: kendi durumu ya da başvurudan gelen engel. */
export type RequestPhase = RequestStatus | RequestBlock;

export interface RequestState {
  type: RequestType;
  /** Hızlı yanıtların bağlı olduğu (en güncel) bildirim mesajı. */
  messageId: string;
  status: RequestStatus;
  /** Mülakat: geçerli görüşme bilgisi. */
  interview?: Interview;
  /** Mülakat: adayın önerdiği yeni saat ("31 Ekim 2026 Cumartesi, 10.00"). */
  proposal?: string;
}

/** Bir başvuruya bağlı yazışma. */
export interface Conversation {
  jid: number;
  company: string;
  subject: string;
  subjectIcon: LucideIcon;
  online: boolean;
  thread: readonly ChatMessage[];
  /** İlk bildirim yanıt bekliyorsa (davet, teklif). */
  request?: RequestState;
}

export type Version = "v1" | "baseline";
export type ApplicationsTab = "devam" | "sonuc";
export type ListState = "dolu" | "yukleniyor" | "hata";
export type DemoPreset = "dolu" | "bos" | "filtre" | "yukleniyor" | "hata" | "25" | "tek";

export interface SheetFilters {
  mode: string[];
  city: string[];
}
export type SheetFilterKey = keyof SheetFilters;

/** Başvuru tarihi için hızlı seçimler. */
export type DatePreset = "bugun" | "7g" | "30g";

export interface DateFilter {
  /** Hızlı seçim; seçiliyse aralık "bugün"e göre hesaplanır, from/to kullanılmaz. */
  preset: DatePreset | null;
  /** Kapsayıcı aralık, ISO gün ("2026-10-01"); boş dize sınır yok demektir. */
  from: string;
  to: string;
}

/** Başvurularım filtreleri: farklı ölçütler VE, seçilen durumlar kendi aralarında VEYA ile birleşir. */
export interface ApplicationFilters {
  title: string;
  company: string;
  date: DateFilter;
  statuses: StatusLabel[];
}

/** Adayın profil bölümleri; boş (null/0) alan eksik bölüm sayılır ve tamamlanma oranını düşürür. */
export interface UserProfile {
  name: string;
  initials: string;
  email: string;
  phone: string | null;
  city: string | null;
  cv: { file: string; updated: string } | null;
  experienceCount: number;
  education: string | null;
  /** Aylık net maaş beklentisi (TL). */
  salary: number | null;
}

export type ProfilePreset = "eksik" | "tam" | "yeni";
