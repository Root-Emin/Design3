# Eleman.net · Başvurularım

Eleman.net aday uygulamasının "Başvurularım" deneyimi için tıklanabilir prototip. React + TypeScript + Tailwind CSS (Vite) ile yazıldı. Görsel referans `Eleman.net · Başvurularım prototipi.html` dosyasıdır; o dosya olduğu gibi duruyor.

Prototip **tamamen mock veriyle** çalışır: arka uç, API ya da kalıcı kayıt yoktur. Sayfa yenilenince her şey başlangıç hâline döner.

## Çalıştırma

```bash
npm install
npm run dev       # geliştirme sunucusu
npm run build     # tip denetimi + üretim derlemesi (dist/)
npm run preview   # derlemeyi yerelde sun
npm run lint      # oxlint
```

`dist/` herhangi bir statik sunucuda yayınlanabilir. Adresler hash tabanlı olduğu için sunucu ayarı gerekmez.

## Ekranlar

| Ekran | Adres |
|---|---|
| Ana sayfa | `#/v1/ana` |
| İş ara | `#/v1/ara` |
| İlan detayı | `#/v1/ilan/101` |
| Başvuru formu (ilan üstünde açılır) | `#/v1/basvur/101` |
| Başvuru tamamlandı | `#/v1/basari/101` |
| Başvurularım | `#/v1/basvurularim` |
| Başvuru detayı | `#/v1/basvuru/2` |
| Mesajlar | `#/v1/mesajlar` |
| Yazışma | `#/v1/mesaj/1` (mülakat daveti), `#/v1/mesaj/2` (iş teklifi) |
| Bildirimler | `#/v1/bildirimler` |
| Profil | `#/v1/profil` |
| Kayıtlı ilanlar | `#/v1/kayitli-ilanlar` |

Geçerli tasarım `v1`'dir. Eski ekranın sade kopyası (`#/baseline/...`) yalnız karşılaştırma testleri için kodda tutulur; arayüzde ona giden bir bağlantı yoktur.

## Demo paneli

Sağ alttaki **Demo paneli** düğmesi prototipin durumunu değiştirir. Ürünün parçası değildir. Ekranı değiştiren bir seçimden sonra panel kapanır ve sonuç ekranı açılır.

| Grup | Seçenekler | Ne yapar |
|---|---|---|
| Başvurularım durumu | Dolu liste, Boş durum, Filtre sonucu boş, Yükleniyor, Hata | Başvuru listesini o duruma getirir; yazışmalar da sıfırlanır |
| Uç durumlar | 25 başvuru, Tek başvuru | Uzun ve kısa liste |
| Mülakat daveti (Deniz Enerji) | Yeni davet, Tarih değişti, İptal edildi, Süresi doldu | İşverenin davetle ilgili hareketi |
| İş teklifi (Kuzey Yazılım) | Yeni teklif, Geri çekildi, Süresi doldu | İşverenin teklifle ilgili hareketi |
| Profil | Eksik profil, Tamamlanmış profil, Yeni üye (CV yok) | Profil doluluğu |
| Tema | Açık, Koyu | Renk teması |

Davet ve teklif seçenekleri ilgili başvuruyu ve yazışmayı başlangıç hâline getirip işverenin hareketini uygular. Başvuru listede yoksa eklenir, geri çekilmişse geri alınır. Hareket her yere yansır:

- yazışmaya Design3 Ai mesajı düşer;
- başvuru geçmişine işlenir;
- bildirimlerde okunmamış görünür;
- Mesajlar listesinde yazışma en üste çıkar;
- başvuru kartında "Yeni" işareti ve güncel not görünür.

## Mock veri

- Veriler `src/data/` altındadır ve kurgusaldır (şirketler, ilanlar, başvurular, yazışmalar).
- Prototipin "bugün"ü **27 Ekim 2026**'dır (`src/data/user.ts`: `TODAY`, `TODAY_ISO`). Yeni kayıtlar ve tarih hesapları bu güne göre yapılır. Mesaj saatleri ise cihazın saatinden alınır.
- Mülakat daveti 30 Ekim 2026 14.00 içindir. Gerçek tarih bunu geçtiğinde davet geçmişte kalmış görünür; gerekirse `src/data/messages.ts` içindeki tarihleri ileri alın.

## Mesajlaşma

Her yazışma bir başvuruya bağlıdır; başvuru yoksa yazışma da gösterilmez.

- **Yazanlar:** Design3 Ai (asistan), işveren ve aday. Asistan mesajı "AI Asistan" etiketiyle, aday mesajı sağda ve okundu işaretiyle gösterilir.
- **Bildirim mesajları:** Mülakat daveti ve iş teklifi. Yanıt beklerken altında hızlı yanıtlar çıkar:
  - mülakat: "Uygun, teşekkürler", "Başka saat öner", "Soru sor";
  - teklif: "Teklifi kabul et", "Görüşme talep et", "Soru sor".
- **Bildirim durumu:** bekliyor, kabul edildi, karşı öneri, iptal edildi, süresi doldu. Başvurunun durumu bildirimden önce gelir: başvuru geri çekildiyse, sonuçlandıysa ya da aşama geçtiyse hızlı yanıtlar kalkar ve durum satırı çıkar.
- **Asistan yanıtları:** Kısa bir "yazıyor" aralığından sonra hazır metinlerle gelir (`src/data/messages.ts`). Serbest mesajlarda asistan, işveren yanıt verene kadar "ilettim" notunu bir kez düşer.
- **Klavye:** Yazma alanı en altta sabittir; mobil klavye açılınca liste kısalır.

## Alt sayfalar, pencereler ve geri tuşu

Alt sayfalar (başvuru formu, filtreler, yeni saat önerisi) ve onay pencereleri `OverlayProvider` üzerinden açılır. Her katman tarayıcı ya da cihaz geri tuşuna bağlıdır: Geri, sayfadan çıkmak yerine katmanı kapatır. Uygulama içinden kapatınca (X, Esc, Vazgeç) geçmişte fazladan kayıt kalmaz. Yeni bir katman eklerken `openOverlay` ve `closeOverlay` kullanın. Kapattıktan sonra başka ekrana geçilecekse `closeOverlayThen` kullanın.

## Yapı

```
src/
  styles/
    tokens.css          DS token'ları (renk, boşluk, tip, gölge; açık/koyu tema), prototipten birebir
    ds/*.css            DS bileşen stilleri (en-*, ds-*), @layer components
    index.css           katman sırası + Tailwind teması (yalnız DS token'larına bağlı)
  components/
    icons/              <Icon>: Lucide ikonlarını DS çizgi kalınlığı ve sınıflarıyla çizer
    shadcn/             shadcn/ui parçaları (Radix): dialog, tabs, dropdown-menu; DS sınıflarıyla
    ui/                 Button, IconButton, Chip, Alert, TextField, SelectField, Sheet, Dialog, Snackbar, …
    application/        ApplicationCard, StatusBadge, CompactTrack, FullTrack
    chat/               ChatHeader, ChatMessage, QuickReplies, Composer
    job/, profile/      ilan ve profil bileşenleri
    layout/             AppShell (telefon çerçevesi), AppBar, BottomNav
  features/             chat (sohbet eylemleri, yeni saat önerisi), apply (başvuru formu),
                        applications (başvuru filtresi), search (filtre), withdraw (geri çekme), demo (demo paneli)
  pages/                v1/* ekranlar, baseline/* (karşılaştırma için), JobPage, NotFoundPage
  state/                uygulama durumu (useReducer), filtreler, tema, snackbar ve katman sağlayıcıları
  data/                 mock veri
  hooks/                kart gezinmesi, klavye yüksekliği
  lib/                  biçimlendirme (tarih, saat, para) ve yardımcılar
  routes/               router ve yol yardımcıları
```

## Tailwind ve design system

- Tailwind teması varsayılan paleti ve ölçeği kapatır, yalnız DS token'larını açar. Boşluk anahtarları DS adlarıyla aynıdır: `p-16` = `--space-16` = 16px, `gap-12` = 12px.
- Renkler semantik token'lara bağlıdır (`bg-surface`, `text-secondary`, `shadow-hairline` …) ve koyu temada kendiliğinden değişir.
- Tailwind preflight yüklenmez: DS bileşen stilleri tarayıcı varsayılanları ve DS'in kendi sıfırlaması üzerine yazılmıştır; preflight görsel fark üretir.
- shadcn/ui: `components.json` bileşenleri `src/components/shadcn`'e kurar (`npx shadcn add …`). shadcn'in hazır sınıfları (`h-9`, `px-4`, `bg-primary` …) bu temada çalışmaz; eklenen her bileşenin sınıfları DS sınıflarına ve token'larına çevrilmelidir. `cn` (`src/lib/utils.ts`) tailwind-merge'e DS temasını tanıtır.
- Onay kutusu, anahtar (toggle) ve açılır liste yerel `<input>`/`<select>` olarak kalır: DS CSS'i bunların `:checked` durumuna bağlıdır, mobilde yerel seçici daha iyidir.
- DS bileşenlerinin CSS'i (`src/styles/ds`) DS'in kaynağıdır; React bileşenleri bu sınıfları tipli varyantlarla sarar. Ekran yerleşimi Tailwind yardımcı sınıflarıyla yazılmıştır.
- Arayüz metinleri Eleman.net ton rehberine göre yazılır: kısa, net, emoji ve gereksiz ünlem yok, her mesaj bir sonraki adımı söyler.

## Bilinen sınırlar

- Veri kalıcı değildir; sayfa yenilenince başlangıç hâline döner.
- Üretim paketi tek dosyadır (~580 kB, sıkıştırılmış ~185 kB). Derleme bu yüzden boyut uyarısı verir; prototip için sorun değildir.
- Demo paneli yayınlanan sürümde de görünür.
