import type { Job } from "../types";

/** Örnek ilanlar (kurgusal şirketler). */
const BASE_JOBS: Record<number, Job> = {
  1: {
    title: "Depo Sorumlusu", company: "Kıyı Lojistik", init: "KL", tone: "blue", city: "İstanbul, Tuzla", cityShort: "İstanbul",
    mode: "İş yerinde", type: "Tam zamanlı", sal: [42000, 52000], match: 82, posted: "5 gün önce",
    desc: "Tuzla deposunda giriş, çıkış ve stok süreçlerini yönetecek, vardiya ekibini koordine edecek bir depo sorumlusu arıyoruz.",
    req: ["Depo veya lojistik alanında en az 3 yıl deneyim", "Stok yönetim yazılımı kullanımı", "Vardiyalı çalışmaya uygunluk"],
    benefits: ["yemek", "servis", "prim"],
  },
  2: {
    title: "Ürün Tasarımcısı", company: "Deniz Enerji", init: "DE", tone: "amber", city: "İzmir, Bayraklı", cityShort: "İzmir",
    mode: "Hibrit", type: "Tam zamanlı", sal: [70000, 90000], match: 88, posted: "4 hafta önce",
    desc: "Müşteri uygulamamızın faturalama ve tüketim ekranlarını araştırmadan teste kadar uçtan uca tasarlayacak bir ürün tasarımcısı arıyoruz.",
    req: ["Mobil ürün tasarımında en az 3 yıl deneyim", "Figma ve tasarım sistemleriyle çalışma", "Kullanıcı araştırması yürütme"],
    benefits: ["yemek-karti", "saglik"], otherBenefits: ["Esnek çalışma saatleri"],
  },
  3: {
    title: "Müşteri Deneyimi Uzmanı", company: "Mavi Liman Perakende", init: "ML", tone: "green", city: "Ankara, Çankaya", cityShort: "Ankara",
    mode: "Uzaktan", type: "Tam zamanlı", sal: [38000, 46000], match: 74, posted: "2 hafta önce",
    desc: "Çevrim içi mağazamızın müşteri taleplerini yanıtlayacak ve tekrar eden sorunları ilgili ekiplere raporlayacak bir uzman arıyoruz.",
    req: ["Müşteri hizmetlerinde en az 2 yıl deneyim", "Yazılı iletişimde özen", "Destek yazılımı kullanımı"],
    benefits: ["yemek-karti"],
  },
  4: {
    title: "Muhasebe Uzmanı", company: "Pusula Danışmanlık", init: "PD", tone: "indigo", city: "Bursa, Nilüfer", cityShort: "Bursa",
    mode: "İş yerinde", type: "Tam zamanlı", sal: [45000, 55000], match: 79, posted: "3 gün önce",
    desc: "Müşteri portföyümüzün aylık beyanname ve kayıt süreçlerini yürütecek bir muhasebe uzmanı arıyoruz.",
    req: ["Muhasebe veya finans bölümü mezunu", "Genel muhasebe süreçlerinde en az 2 yıl deneyim", "Muhasebe yazılımı kullanımı"],
    benefits: ["yemek", "yol"],
  },
  5: {
    title: "Kıdemli Frontend Geliştirici", company: "Kuzey Yazılım", init: "KY", tone: "slate", city: "İstanbul, Maslak", cityShort: "İstanbul",
    mode: "Hibrit", type: "Tam zamanlı", sal: [95000, 120000], match: 91, posted: "6 hafta önce",
    desc: "Bankacılık müşterilerimiz için web uygulamaları geliştiren ekibimize kıdemli bir frontend geliştirici arıyoruz.",
    req: ["React ve TypeScript ile en az 5 yıl deneyim", "Erişilebilirlik ve performans odaklı geliştirme", "Kod incelemesi ve mentorluk"],
    benefits: ["yemek-karti", "yol", "prim", "saglik"], otherBenefits: ["Eğitim bütçesi"],
  },
  6: {
    title: "Satış Danışmanı", company: "Ilgaz Gıda", init: "IG", tone: "green", city: "Eskişehir, Tepebaşı", cityShort: "Eskişehir",
    mode: "İş yerinde", type: "Tam zamanlı", sal: [32000, 40000], match: 66, posted: "4 hafta önce",
    desc: "Bölge marketlerle ilişkileri yürütecek ve sipariş süreçlerini takip edecek bir satış danışmanı arıyoruz.",
    req: ["Saha satışında deneyim", "B sınıfı sürücü belgesi", "Bölgede ikamet"],
    benefits: ["yemek", "yol", "prim"],
  },
  7: {
    title: "Hasta Danışmanı", company: "Tepe Sağlık Grubu", init: "TS", tone: "blue", city: "Antalya, Muratpaşa", cityShort: "Antalya",
    mode: "İş yerinde", type: "Yarı zamanlı", sal: [22000, 26000], match: 71, posted: "5 hafta önce",
    desc: "Poliklinik kabul ve randevu süreçlerinde hastalara yardımcı olacak yarı zamanlı bir hasta danışmanı arıyoruz.",
    req: ["Hastane veya klinikte ön büro deneyimi", "Hafta sonu çalışmaya uygunluk", "İngilizce iletişim"],
  },
  101: {
    title: "Depo Operasyon Şefi", company: "Kıyı Lojistik", init: "KL", tone: "blue", city: "Kocaeli, Gebze", cityShort: "Kocaeli",
    mode: "İş yerinde", type: "Tam zamanlı", sal: [55000, 68000], match: 87, posted: "Bugün",
    desc: "Gebze aktarma merkezimizin günlük operasyonunu yönetecek bir operasyon şefi arıyoruz.",
    req: ["Depo operasyonunda en az 5 yıl deneyim", "Ekip yönetimi", "Performans raporlaması"],
    benefits: ["yemek", "servis", "prim", "saglik"],
  },
  102: {
    title: "İnsan Kaynakları Uzmanı", company: "Pusula Danışmanlık", init: "PD", tone: "indigo", city: "İstanbul, Ataşehir", cityShort: "İstanbul",
    mode: "Hibrit", type: "Tam zamanlı", sal: [52000, 64000], match: 76, posted: "Dün",
    desc: "İşe alım ve çalışan deneyimi süreçlerini yürütecek bir insan kaynakları uzmanı arıyoruz.",
    req: ["İşe alım süreçlerinde en az 3 yıl deneyim", "Mülakat planlama ve yürütme", "İK yazılımı kullanımı"],
    benefits: ["yemek-karti", "yol"],
  },
  103: {
    title: "Mağaza Müdür Yardımcısı", company: "Mavi Liman Perakende", init: "ML", tone: "green", city: "İzmir, Karşıyaka", cityShort: "İzmir",
    mode: "İş yerinde", type: "Tam zamanlı", sal: [45000, 54000], match: 69, posted: "3 gün önce",
    desc: "Karşıyaka mağazamızda satış ve stok süreçlerinde mağaza müdürüne destek olacak bir yönetici arıyoruz.",
    req: ["Perakende sektöründe en az 3 yıl deneyim", "Vardiya planlama", "Satış hedefi takibi"],
    benefits: ["yemek", "yol", "prim"],
  },
  104: {
    title: "Satın Alma Uzmanı", company: "Ilgaz Gıda", init: "IG", tone: "green", city: "Eskişehir, Odunpazarı", cityShort: "Eskişehir",
    mode: "Hibrit", type: "Tam zamanlı", sal: [48000, 60000], match: 58, posted: "1 hafta önce",
    desc: "Hammadde tedarikçileriyle fiyat ve teslimat görüşmelerini yürütecek bir satın alma uzmanı arıyoruz.",
    req: ["Satın almada en az 3 yıl deneyim", "Tedarikçi değerlendirme", "İleri düzey Excel"],
  },
  105: {
    title: "Veri Analisti", company: "Anka Teknoloji", init: "AT", tone: "indigo", city: "Ankara, Yenimahalle", cityShort: "Ankara",
    mode: "Hibrit", type: "Tam zamanlı", sal: [65000, 80000], match: 84, posted: "Bugün",
    desc: "Satış ve müşteri verilerini raporlayacak, yönetim ekibine karar destek analizleri hazırlayacak bir veri analisti arıyoruz.",
    req: ["Veri analizinde en az 2 yıl deneyim", "SQL ve raporlama araçları kullanımı", "Bulguları sade bir dille sunma"],
    benefits: ["yemek-karti", "saglik"],
  },
  106: {
    title: "Üretim Planlama Uzmanı", company: "Bereket Tekstil", init: "BT", tone: "amber", city: "Bursa, Osmangazi", cityShort: "Bursa",
    mode: "İş yerinde", type: "Tam zamanlı", sal: [47000, 58000], match: 72, posted: "2 gün önce",
    desc: "Fabrikamızın haftalık üretim planını hazırlayacak, malzeme ve kapasite takibini yürütecek bir planlama uzmanı arıyoruz.",
    req: ["Üretim planlamada en az 2 yıl deneyim", "ERP yazılımı kullanımı", "İleri düzey Excel"],
    benefits: ["yemek", "servis"],
  },
  107: {
    title: "Ön Büro Görevlisi", company: "Lara Otel", init: "LO", tone: "blue", city: "Antalya, Muratpaşa", cityShort: "Antalya",
    mode: "İş yerinde", type: "Tam zamanlı", sal: [30000, 36000], match: 63, posted: "Dün",
    desc: "Otelimizde giriş, çıkış ve rezervasyon işlemlerini yürütecek, misafir taleplerini karşılayacak bir ön büro görevlisi arıyoruz.",
    req: ["Otelcilikte ön büro deneyimi", "İngilizce ve Almanca iletişim", "Vardiyalı çalışmaya uygunluk"],
    benefits: ["yemek", "servis"],
  },
  108: {
    title: "İçerik Editörü", company: "Mavi Liman Perakende", init: "ML", tone: "green", city: "İstanbul, Kadıköy", cityShort: "İstanbul",
    mode: "Uzaktan", type: "Yarı zamanlı", sal: [24000, 30000], match: 77, posted: "4 gün önce",
    desc: "Çevrim içi mağazamızın ürün açıklamalarını ve kampanya metinlerini yazacak yarı zamanlı bir içerik editörü arıyoruz.",
    req: ["Ürün veya pazarlama metni yazma deneyimi", "Türkçe yazım ve noktalama kurallarına hâkimiyet", "İçerik yönetim sistemi kullanımı"],
  },
  109: {
    title: "Elektrik Bakım Teknisyeni", company: "Deniz Enerji", init: "DE", tone: "amber", city: "İzmir, Aliağa", cityShort: "İzmir",
    mode: "İş yerinde", type: "Tam zamanlı", sal: [40000, 50000], match: 61, posted: "1 hafta önce",
    desc: "Santralimizdeki elektrik ekipmanlarının periyodik bakım ve arıza onarımını yapacak bir bakım teknisyeni arıyoruz.",
    req: ["Elektrik veya elektronik bölümü mezunu", "Endüstriyel bakımda en az 2 yıl deneyim", "Vardiyalı çalışmaya uygunluk"],
    benefits: ["yemek", "servis", "saglik"],
  },
  110: {
    title: "Dağıtım Şoförü", company: "Kıyı Lojistik", init: "KL", tone: "blue", city: "Bursa, Nilüfer", cityShort: "Bursa",
    mode: "İş yerinde", type: "Tam zamanlı", sal: [38000, 45000], match: 68, posted: "5 gün önce",
    desc: "Bursa bölgesindeki mağazalara şehir içi dağıtım yapacak bir dağıtım şoförü arıyoruz.",
    req: ["C sınıfı sürücü belgesi ve SRC belgesi", "Şehir içi dağıtımda en az 2 yıl deneyim", "Erken saatte işe başlamaya uygunluk"],
    benefits: ["yemek", "prim"],
  },
};

/** "25 başvuru" uç durumu için üretilen ek ilanlar (id 200–217). */
const EXTRA_TITLES: ReadonlyArray<readonly [string, string, string]> = [
  ["Lojistik Planlama Uzmanı", "Kıyı Lojistik", "KL"],
  ["Kasa Sorumlusu", "Mavi Liman Perakende", "ML"],
  ["Bordro Uzmanı", "Pusula Danışmanlık", "PD"],
  ["Kalite Kontrol Teknisyeni", "Ilgaz Gıda", "IG"],
  ["Çağrı Merkezi Temsilcisi", "Mavi Liman Perakende", "ML"],
  ["Backend Geliştirici", "Kuzey Yazılım", "KY"],
];
export const EXTRA_JOB_COUNT = 18;
export const EXTRA_JOB_FIRST_ID = 200;
const EXTRA_REF_IDS = [1, 103, 4, 6, 3, 5];

const EXTRA_JOBS: Record<number, Job> = {};
for (let i = 0; i < EXTRA_JOB_COUNT; i++) {
  const [title, company, init] = EXTRA_TITLES[i % EXTRA_TITLES.length];
  const ref = BASE_JOBS[EXTRA_REF_IDS[i % EXTRA_REF_IDS.length]];
  EXTRA_JOBS[EXTRA_JOB_FIRST_ID + i] = { ...ref, title, company, init, match: 60 + ((i * 7) % 35), posted: "Eylül" };
}

export const JOBS: Readonly<Record<number, Job>> = { ...BASE_JOBS, ...EXTRA_JOBS };

/** İş ara ekranında listelenen ilanlar, en yeniden eskiye; hiçbirine başvurulmamış. */
export const SEARCH_JOB_IDS = [101, 105, 102, 107, 106, 103, 108, 110, 104, 109] as const;
/** Ana sayfadaki "Sana uygun ilanlar". */
export const RECOMMENDED_JOB_IDS = [101, 102] as const;

export const FILTER_OPTIONS = {
  mode: ["İş yerinde", "Hibrit", "Uzaktan"],
  city: ["İstanbul", "Ankara", "İzmir", "Bursa", "Eskişehir", "Kocaeli", "Antalya"],
} as const;
