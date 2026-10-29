import { Bell, Bookmark, Briefcase, Files, FileText, History, Lock, Moon, Pencil, Settings, User, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AppBar, AppMenu } from "../../components/layout/AppBar";
import { ProfileCompletionCard } from "../../components/profile/ProfileCompletionCard";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { ListItem } from "../../components/ui/ListItem";
import { Toggle } from "../../components/ui/Toggle";
import { Heading, MutedText } from "../../components/ui/Typography";
import { profileCompletion } from "../../lib/profile";
import { routePath, useBackTarget, useVersion } from "../../routes/paths";
import { useAppState } from "../../state/AppStateProvider";
import type { AppState } from "../../state/appState";
import type { Version } from "../../types";
import { useTheme } from "../../state/ThemeProvider";
import { useToast } from "../../state/ToastProvider";
import { Content } from "../Content";

interface MenuRow {
  key: string;
  icon: LucideIcon;
  title: string;
  sup: ReactNode;
  /** Ekranı olmayan bölümde verilmez; satır "henüz hazır değil" bilgisini gösterir. */
  to?: string;
}

/** Kenarlıklı satır grubu; satırlar kenara yaslıdır, son satırın ayırıcısı kart kenarına karışır. */
const GROUP = "overflow-hidden rounded-card bg-surface shadow-hairline [&>:last-child]:shadow-none";

/** Başvuru sayısı, Başvurularım listesinin yükleme durumunu izler. */
function applicationsSup({ listState, apps }: AppState): ReactNode {
  if (listState === "yukleniyor") {
    return (
      <>
        <span className="ds-skel__line my-4 w-[96px]" aria-hidden="true" />
        <span className="en-sr">Başvuru sayısı yükleniyor</span>
      </>
    );
  }
  if (listState === "hata") return "Başvuru sayısı alınamadı";
  return apps.length ? `Toplam ${apps.length} başvuru` : "Henüz başvurun yok";
}

function menuRows(state: AppState, ver: Version): MenuRow[] {
  const { cv } = state.profile;
  const saved = state.savedJobIds.length;
  return [
    { key: "cv", icon: FileText, title: "Özgeçmişim", sup: cv ? `${cv.file} · ${cv.updated}’de güncellendi` : "Özgeçmişini yükle" },
    { key: "documents", icon: Files, title: "Diğer belgeler", sup: "Portföy, sertifika vb." },
    { key: "personal", icon: User, title: "Kişisel bilgiler", sup: "Ad, iletişim ve konum" },
    { key: "security", icon: Lock, title: "Şifre ve güvenlik", sup: "Şifre değiştir, iki adımlı doğrulama" },
    { key: "work", icon: Briefcase, title: "Çalışma tercihleri", sup: "Pozisyon, sektör, çalışma şekli" },
    { key: "alerts", icon: Bell, title: "İş alarmları", sup: "Yeni ilanlardan haberdar ol" },
    {
      key: "saved",
      icon: Bookmark,
      title: "Kaydedilen ilanlar",
      sup: saved ? `${saved} ilan` : "Henüz kayıtlı ilan yok",
      to: routePath(ver, "kayitli-ilanlar"),
    },
    { key: "applications", icon: History, title: "Başvuru geçmişim", sup: applicationsSup(state), to: routePath(ver, "basvurularim") },
    { key: "notifications", icon: Settings, title: "Bildirim ayarları", sup: "Başvuru güncellemeleri ve mesajlar" },
  ];
}

export function ProfilePage() {
  const state = useAppState();
  const ver = useVersion();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const { profile } = state;
  const completion = profileCompletion(profile);
  const back = useBackTarget(routePath(ver, "ana"));
  // Düzenleme ekranları henüz yok; bağlandığında satırlara `to` verilir.
  const notReady = () => showToast("Bu bölüm henüz hazır değil.", "info");

  return (
    <>
      <AppBar
        title="Profil"
        variant="rounded"
        center
        back={back}
        bell={false}
        actions={<AppMenu />}
        bottom={
          <div className="en-appbar__panel flex items-center gap-16">
            <Avatar initials={profile.initials} label={profile.name} tone="blue" size="lg" shape="person" />
            <div className="grid min-w-0 flex-1 gap-2">
              <Heading as="h2" look="h3" className="line-clamp-2 break-words">
                {profile.name}
              </Heading>
              <MutedText className="truncate" data-testid="profile-email">
                {profile.email}
              </MutedText>
            </div>
            <Button variant="secondary" size="sm" icon={Pencil} onClick={notReady} className="en-hit flex-none" testId="profile-edit">
              Düzenle
            </Button>
          </div>
        }
      />
      <Content>
        <ProfileCompletionCard completion={completion} onOpen={notReady} />

        <nav className={GROUP} aria-label="Profil menüsü">
          {menuRows(state, ver).map((r) => (
            <ListItem
              key={r.key}
              icon={r.icon}
              title={r.title}
              sup={r.sup}
              to={r.to}
              onClick={r.to ? undefined : notReady}
              testId={`profile-row-${r.key}`}
            />
          ))}
        </nav>

        <div className={GROUP}>
          <div className="flex min-h-(--size-list-item) items-center px-16">
            <Toggle
              id="theme-tg"
              label="Koyu tema"
              icon={Moon}
              checked={theme === "dark"}
              onChange={(on) => setTheme(on ? "dark" : "light")}
              testId="profile-theme"
            />
          </div>
        </div>
      </Content>
    </>
  );
}
