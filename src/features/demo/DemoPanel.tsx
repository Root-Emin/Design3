import { Settings } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "../../components/ui/Button";
import { FilterChip } from "../../components/ui/Chip";
import { Heading } from "../../components/ui/Typography";
import { MESSAGE_IDS, MESSAGES, type RequestScenario } from "../../data/messages";
import { clockNow } from "../../lib/format";
import { cn } from "../../lib/utils";
import { routeKeyOf, routePath } from "../../routes/paths";
import { useAppDispatch, useAppState } from "../../state/AppStateProvider";
import { getRequest } from "../../state/appState";
import { useTheme, type Theme } from "../../state/ThemeProvider";
import type { DemoPreset, ProfilePreset } from "../../types";
import { cancelAssistantReplies } from "../chat/useChatActions";

/** Yanıt bekleyen bildirimi (davet, teklif) olan yazışmalar. */
const REQUEST_CHAT_IDS = MESSAGE_IDS.filter((id) => MESSAGES[id].request);

interface DemoOption {
  label: string;
  id: string;
  selected: boolean;
  onSelect: () => void;
}

function DemoGroup({ title, options }: { title: string; options: DemoOption[] }) {
  return (
    <div className="grid gap-8">
      <p className="m-0 text-overline text-secondary">{title}</p>
      <div className="flex flex-wrap gap-8">
        {options.map((o) => (
          <FilterChip key={o.id} label={o.label} selected={o.selected} onClick={o.onSelect} testId={`demo-${o.id}`} />
        ))}
      </div>
    </div>
  );
}

const PRESETS: ReadonlyArray<readonly [DemoPreset, string]> = [
  ["dolu", "Dolu liste"],
  ["bos", "Boş durum"],
  ["filtre", "Filtre sonucu boş"],
  ["yukleniyor", "Yükleniyor"],
  ["hata", "Hata"],
];
const PROFILE_PRESETS: ReadonlyArray<readonly [ProfilePreset, string]> = [
  ["eksik", "Eksik profil"],
  ["tam", "Tamamlanmış profil"],
  ["yeni", "Yeni üye (CV yok)"],
];
const EDGE_PRESETS: ReadonlyArray<readonly [DemoPreset, string]> = [
  ["25", "25 başvuru"],
  ["tek", "Tek başvuru"],
];

/**
 * Demo paneli: yalnız prototip içindir, ürünün parçası değildir. Veri durumu, işverenin bildirimlerle
 * ilgili hareketleri, profil ve tema seçer. Ekranı değiştiren seçimden sonra panel kapanır, sonuç görünür.
 */
export function DemoPanel() {
  const [open, setOpen] = useState(false);
  const state = useAppState();
  const { demoPreset } = state;
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Seçimin sonucunu gösteren ekrana geçer ve paneli kapatır.
  const show = (target: string) => {
    setOpen(false);
    if (pathname !== target) navigate(target);
  };
  const preset = ([id, label]: readonly [DemoPreset, string]): DemoOption => ({
    label,
    id: `state-${id}`,
    selected: demoPreset === id,
    onSelect: () => {
      cancelAssistantReplies();
      dispatch({ type: "applyDemoPreset", preset: id });
      show(routePath("v1", "basvurularim"));
    },
  });
  // İşverenin bildirimle ilgili hareketi: yazışmaya mesaj, başvuruya okunmamış hareket olarak düşer.
  const requestGroups = REQUEST_CHAT_IDS.map((chatId) => {
    const m = MESSAGES[chatId];
    const request = getRequest(state, chatId)!;
    const interview = request.type === "interview";
    const revised = request.messageId !== m.request!.messageId;
    const option = (scenario: RequestScenario, key: string, label: string, selected: boolean): DemoOption => ({
      label, id: `request-${chatId}-${key}`, selected, onSelect: () => {
        // Yazılmakta olan asistan yanıtı yeni duruma düşmez.
        cancelAssistantReplies(chatId);
        dispatch({ type: "applyRequestScenario", id: chatId, scenario, time: clockNow() });
        show(routePath("v1", "mesaj", chatId));
      },
    });
    const options = [
      option("new", "reset", interview ? "Yeni davet" : "Yeni teklif", request.status === "pending" && !revised),
      ...(interview ? [option("revised", "revised", "Tarih değişti", request.status === "pending" && revised)] : []),
      option("cancelled", "cancelled", interview ? "İptal edildi" : "Geri çekildi", request.status === "cancelled"),
      option("expired", "expired", "Süresi doldu", request.status === "expired"),
    ];
    return { chatId, title: `${m.subject} (${m.company})`, options };
  });
  const profileOption = ([id, label]: readonly [ProfilePreset, string]): DemoOption => ({
    label, id: `profile-${id}`, selected: state.profilePreset === id, onSelect: () => {
      dispatch({ type: "applyProfilePreset", preset: id });
      show(routePath("v1", "profil"));
    },
  });
  const themeOption = (t: Theme, label: string): DemoOption => ({ label, id: `theme-${t}`, selected: theme === t, onSelect: () => setTheme(t) });

  return (
    <aside
      className={cn(
        "fixed right-16 z-(--z-toast) grid max-w-[calc(100%-var(--space-32))] justify-items-end gap-8",
        // Sohbet ekranında yazma alanının (ve gönder düğmesinin) üstünde durur.
        routeKeyOf(pathname) === "mesaj"
          ? "bottom-[calc(var(--space-16)+var(--size-control-lg)+var(--space-16)+env(safe-area-inset-bottom,0px))]"
          : "bottom-[calc(var(--space-16)+env(safe-area-inset-bottom,0px))]",
      )}
      aria-label="Prototip kontrolleri"
    >
      <div
        id="demo-panel"
        role="region"
        aria-label="Demo paneli"
        hidden={!open}
        className={cn(
          open ? "grid" : "hidden",
          "max-h-[min(70vh,640px)] w-[320px] max-w-full gap-16 overflow-auto rounded-card bg-raised p-16 text-primary shadow-popover",
        )}
      >
        <Heading look="title">Demo paneli</Heading>
        <p className="m-0 text-caption text-tertiary">Yalnız prototip içindir; ürünün parçası değildir.</p>
        <DemoGroup title="Başvurularım durumu" options={PRESETS.map(preset)} />
        <DemoGroup title="Uç durumlar" options={EDGE_PRESETS.map(preset)} />
        {requestGroups.map((g) => (
          <DemoGroup key={g.chatId} title={g.title} options={g.options} />
        ))}
        <DemoGroup title="Profil" options={PROFILE_PRESETS.map(profileOption)} />
        <DemoGroup title="Tema" options={[themeOption("light", "Açık"), themeOption("dark", "Koyu")]} />
      </div>
      <Button
        variant="secondary"
        size="sm"
        icon={Settings}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="demo-panel"
        testId="demo-toggle"
      >
        {open ? "Demo panelini kapat" : "Demo paneli"}
      </Button>
    </aside>
  );
}
