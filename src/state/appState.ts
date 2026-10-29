import { CircleMinus, type LucideIcon } from "lucide-react";
import { baseApplications, ev, manyApplications, ownEv } from "../data/applications";
import { JOBS, SEARCH_JOB_IDS } from "../data/jobs";
import { conversationIdFor, MESSAGE_IDS, MESSAGES, REQUEST_ENDED_NOTE, REQUEST_SUBJECT, requestScenario, type RequestScenario } from "../data/messages";
import { PROFILE, profilePreset, TODAY, TODAY_ISO } from "../data/user";
import { EMPTY_FILTERS, matchesFilters } from "./applicationFilters";
import type {
  Application,
  ApplicationFilters,
  ApplicationsTab,
  ChatMessage,
  DemoPreset,
  Job,
  ListState,
  ProfilePreset,
  RequestBlock,
  RequestPhase,
  RequestState,
  RequestType,
  SheetFilterKey,
  SheetFilters,
  Stage,
  StatusLabel,
  UserProfile,
} from "../types";
import { STAGES } from "../types";

export interface AppState {
  apps: Application[];
  tab: ApplicationsTab;
  /** Başvurularım filtreleri; ekranlar arasında gezinirken korunur. */
  appFilters: ApplicationFilters;
  listState: ListState;
  q: string;
  sheetFilters: SheetFilters;
  /** Yazışmaya sonradan eklenen mesajlar (yazışma kimliğine göre). */
  chatMessages: Record<number, ChatMessage[]>;
  /** Bildirimin (davet, teklif) güncel hâli; yoksa yazışmadaki ilk hâl geçerlidir. */
  requests: Record<number, RequestState>;
  /** Design3 Ai yanıt hazırlıyor. */
  assistantTyping: Record<number, boolean>;
  /** Son başvuruda ön yazı eklendi mi (başarı ekranı metni). */
  lastCover: boolean;
  demoPreset: DemoPreset;
  profile: UserProfile;
  profilePreset: ProfilePreset;
  /** Kaydedilen ilanlar, kaydedilme sırasıyla. */
  savedJobIds: number[];
}

export const initialState: AppState = {
  apps: baseApplications(),
  tab: "devam",
  appFilters: EMPTY_FILTERS,
  listState: "dolu",
  q: "",
  sheetFilters: { mode: [], city: [] },
  chatMessages: {},
  requests: {},
  assistantTyping: {},
  lastCover: false,
  demoPreset: "dolu",
  profile: PROFILE,
  profilePreset: "eksik",
  savedJobIds: [],
};

export type AppAction =
  | { type: "setTab"; tab: ApplicationsTab }
  | { type: "setAppFilters"; filters: ApplicationFilters }
  | { type: "toggleStatusFilter"; status: StatusLabel }
  | { type: "setListState"; listState: ListState }
  | { type: "markRead"; id: number }
  | { type: "withdraw"; id: number; at: string }
  | { type: "undoWithdraw"; id: number }
  | { type: "addApplication"; app: Application; cover: boolean }
  | { type: "setQuery"; q: string }
  | { type: "toggleSheetFilter"; key: SheetFilterKey; value: string }
  | { type: "clearSheetFilters" }
  | { type: "clearSearch" }
  | { type: "postMessage"; id: number; message: ChatMessage }
  | { type: "setAssistantTyping"; id: number; typing: boolean }
  /** Bildirim durumunu değiştirir; event verilirse ilgili başvurunun hareketlerine eklenir. */
  | { type: "updateRequest"; id: number; request: Partial<RequestState>; event?: { icon: LucideIcon; text: string; at: string } }
  /** Demo: bildirim senaryosu; başvuru ve yazışma ilk hâline döner, işverenin değişikliği uygulanır. */
  | { type: "applyRequestScenario"; id: number; scenario: RequestScenario; time: string }
  | { type: "applyDemoPreset"; preset: DemoPreset }
  | { type: "applyProfilePreset"; preset: ProfilePreset }
  | { type: "toggleSavedJob"; id: number };

const updateApp = (apps: Application[], id: number, fn: (a: Application) => Application) =>
  apps.map((a) => (a.id === id ? fn(a) : a));

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "setTab":
      return { ...state, tab: action.tab };
    case "setAppFilters":
      return { ...state, appFilters: action.filters };
    case "toggleStatusFilter": {
      const list = state.appFilters.statuses;
      const statuses = list.includes(action.status) ? list.filter((s) => s !== action.status) : [...list, action.status];
      return { ...state, appFilters: { ...state.appFilters, statuses } };
    }
    case "setListState":
      return { ...state, listState: action.listState };
    case "markRead":
      return { ...state, apps: updateApp(state.apps, action.id, (a) => ({ ...a, unread: false })) };
    case "withdraw":
      return {
        ...state,
        apps: updateApp(state.apps, action.id, (a) => ({
          ...a,
          beforeWithdraw: { outcome: a.outcome, events: a.events, upd: a.upd },
          outcome: "Geri çekildi",
          events: [ownEv(CircleMinus, "Başvurunu geri çektin", action.at), ...a.events],
          upd: 20261027.2358,
        })),
      };
    case "undoWithdraw":
      return {
        ...state,
        apps: updateApp(state.apps, action.id, ({ beforeWithdraw, ...a }) => (beforeWithdraw ? { ...a, ...beforeWithdraw } : a)),
      };
    case "addApplication":
      // Aynı ilana ikinci başvuru eklenmez (ör. mevcut ekranda başvurulmuş ilandan yeniden gönderim).
      if (findApp(state, action.app.id)) return { ...state, lastCover: action.cover };
      return { ...state, apps: [...state.apps, action.app], lastCover: action.cover };
    case "setQuery":
      return { ...state, q: action.q };
    case "toggleSheetFilter": {
      const list = state.sheetFilters[action.key];
      const next = list.includes(action.value) ? list.filter((v) => v !== action.value) : [...list, action.value];
      return { ...state, sheetFilters: { ...state.sheetFilters, [action.key]: next } };
    }
    case "clearSheetFilters":
      return { ...state, sheetFilters: { mode: [], city: [] } };
    case "clearSearch":
      return { ...state, q: "", sheetFilters: { mode: [], city: [] } };
    case "postMessage": {
      let list = state.chatMessages[action.id] ?? [];
      // Asistan yanıt verdiğinde adayın önceki mesajları okunmuş sayılır.
      if (action.message.author !== "candidate") list = list.map((m) => (m.status === "sent" ? { ...m, status: "read" as const } : m));
      return {
        ...state,
        chatMessages: { ...state.chatMessages, [action.id]: [...list, action.message] },
        assistantTyping: action.message.author === "assistant" ? { ...state.assistantTyping, [action.id]: false } : state.assistantTyping,
      };
    }
    case "setAssistantTyping":
      return { ...state, assistantTyping: { ...state.assistantTyping, [action.id]: action.typing } };
    case "updateRequest": {
      const current = getRequest(state, action.id);
      if (!current) return state;
      const { event } = action;
      return {
        ...state,
        requests: { ...state.requests, [action.id]: { ...current, ...action.request } },
        apps: event
          ? updateApp(state.apps, MESSAGES[action.id].jid, (a) => ({ ...a, events: [ownEv(event.icon, event.text, event.at, action.id), ...a.events] }))
          : state.apps,
      };
    }
    case "applyRequestScenario":
      return applyRequestScenario(state, action.id, action.scenario, action.time);
    case "applyDemoPreset":
      // Başvurular yeniden kurulduğunda yazışmalar da başlangıç hâline döner; ikisi tutarlı kalır.
      return { ...state, ...demoPreset(action.preset), demoPreset: action.preset, chatMessages: {}, requests: {}, assistantTyping: {} };
    case "applyProfilePreset":
      return { ...state, profile: profilePreset(action.preset), profilePreset: action.preset };
    case "toggleSavedJob": {
      const ids = state.savedJobIds;
      return { ...state, savedJobIds: ids.includes(action.id) ? ids.filter((i) => i !== action.id) : [...ids, action.id] };
    }
  }
}

function demoPreset(preset: DemoPreset): Partial<AppState> {
  const reset = { tab: "devam", appFilters: EMPTY_FILTERS, listState: "dolu" } as const;
  const onlyFirst = () => baseApplications().filter((a) => a.id === 1);
  switch (preset) {
    case "dolu":
      return { ...reset, apps: baseApplications() };
    case "bos":
      return { ...reset, apps: [] };
    case "filtre":
      return { ...reset, apps: onlyFirst(), appFilters: { ...EMPTY_FILTERS, statuses: ["Değerlendirmede"] } };
    case "yukleniyor":
      return { ...reset, apps: baseApplications(), listState: "yukleniyor" };
    case "hata":
      return { ...reset, apps: baseApplications(), listState: "hata" };
    case "25":
      return { ...reset, apps: manyApplications() };
    case "tek":
      return { ...reset, apps: onlyFirst() };
  }
}

/**
 * Demo bildirim senaryosu. Bağlı başvuru başlangıç hâline döner (listede yoksa eklenir, geri
 * çekildiyse geri alınır), yazışma sıfırlanır; işverenin değişikliği yazışmaya mesaj, başvuruya
 * okunmamış hareket olarak düşer.
 */
function applyRequestScenario(state: AppState, id: number, scenario: RequestScenario, time: string): AppState {
  const m = MESSAGES[id];
  const seed = baseApplications().find((a) => a.id === m.jid)!;
  const { [id]: _m, ...chatMessages } = state.chatMessages;
  const { [id]: _r, ...requests } = state.requests;
  const apps = findApp(state, seed.id) ? updateApp(state.apps, seed.id, () => seed) : [...state.apps, seed];
  const next = { ...state, chatMessages, requests, apps, assistantTyping: { ...state.assistantTyping, [id]: false } };
  const change = requestScenario(m, scenario, { id: `demo-${id}`, day: "Bugün", time });
  if (!change) return next;
  return {
    ...next,
    chatMessages: { ...chatMessages, [id]: [change.message] },
    requests: { ...requests, [id]: { ...m.request!, ...change.request } },
    apps: updateApp(apps, seed.id, (a) => ({
      ...a,
      unread: true,
      upd: messageSortKey(change.message),
      updLabel: "Bugün",
      events: [ev(change.event.icon, change.event.text, `${TODAY} ${time}`, id), ...a.events],
    })),
  };
}

/* ---------- Seçiciler ---------- */

export function getJob(_state: AppState, id: number): Job | undefined {
  return JOBS[id];
}

export function findApp(state: AppState, id: number): Application | undefined {
  return state.apps.find((a) => a.id === id);
}

export const isClosed = (a: Application) => a.outcome !== null;
export const statusLabel = (a: Application): StatusLabel => a.outcome ?? a.stage;
export const unreadCount = (state: AppState) => state.apps.filter((a) => a.unread).length;
export const isSaved = (state: AppState, id: number) => state.savedJobIds.includes(id);
export const sortByUpdated = (list: Application[]) => [...list].sort((a, b) => b.upd - a.upd);

/** Yazışmanın tüm mesajları: başlangıç verisi + sonradan eklenenler. */
export function getThread(state: AppState, id: number): ChatMessage[] {
  return [...(MESSAGES[id]?.thread ?? []), ...(state.chatMessages[id] ?? [])];
}

export function getRequest(state: AppState, id: number): RequestState | undefined {
  return state.requests[id] ?? MESSAGES[id]?.request;
}

/** Bildirimin ait olduğu başvuru aşaması. */
const REQUEST_STAGE: Record<RequestType, Stage> = { interview: "Mülakat", offer: "Teklif" };

export function requestBlock(app: Application, type: RequestType): RequestBlock | undefined {
  if (app.outcome === "Geri çekildi") return "withdrawn";
  if (app.outcome) return "closed";
  if (STAGES.indexOf(app.stage) > STAGES.indexOf(REQUEST_STAGE[type])) return "passed";
  return undefined;
}

/** Yazışmanın bağlı olduğu başvuru; başvuru yoksa yazışma da gösterilmez. */
export function getConversationApp(state: AppState, id: number): Application | undefined {
  const m = MESSAGES[id];
  return m && findApp(state, m.jid);
}

const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

/** Mesaj zamanının sıralama anahtarı, `upd` ile aynı biçimde (YYYYAAGG.SSDD): "Bugün"/"25 Eki" + "08.15". */
export function messageSortKey({ day, time }: Pick<ChatMessage, "day" | "time">): number {
  const [y, m, d] = TODAY_ISO.split("-").map(Number);
  const short = /^(\d{1,2}) (\S+)$/.exec(day);
  const ymd = day === "Bugün" ? y * 10000 + m * 100 + d : short ? y * 10000 + (MONTHS.indexOf(short[2]) + 1) * 100 + Number(short[1]) : 0;
  return ymd + Number(time) / 100;
}

/** Yazışmanın son mesajı (listede zamanı ve sırası buradan gelir). */
export const getLastMessage = (state: AppState, id: number): ChatMessage | undefined => getThread(state, id).at(-1);

/** Mesajlar listesi: başvurusu duran yazışmalar, son mesajı en yeni olan üstte. */
export function getConversationIds(state: AppState): number[] {
  const key = (id: number) => {
    const last = getLastMessage(state, id);
    return last ? messageSortKey(last) : 0;
  };
  return MESSAGE_IDS.filter((id) => getConversationApp(state, id)).sort((a, b) => key(b) - key(a));
}

/** Yazışmanın süreç durumu ("Mülakat daveti", "Teklif kabul edildi", "Geri çekildi" …). */
export function getConversationSubject(state: AppState, id: number): string {
  const request = getRequest(state, id);
  const phase = getRequestPhase(state, id);
  return request && phase ? REQUEST_SUBJECT[request.type][phase] : MESSAGES[id].subject;
}

/** Bildirimin ekrandaki hâli: başvuru engeli bildirimin kendi durumundan önce gelir. */
export function getRequestPhase(state: AppState, id: number): RequestPhase | undefined {
  const request = getRequest(state, id);
  const app = getConversationApp(state, id);
  if (!request || !app) return undefined;
  return requestBlock(app, request.type) ?? request.status;
}

/** Başvurunun bildirimi işveren tarafında kapandıysa (iptal, süre doldu) kartta gösterilen not. */
export function getRequestEndedNote(state: AppState, appId: number): string | undefined {
  const id = conversationIdFor(appId);
  if (id === undefined) return undefined;
  const request = getRequest(state, id);
  const phase = getRequestPhase(state, id);
  return request && (phase === "cancelled" || phase === "expired") ? REQUEST_ENDED_NOTE[request.type][phase] : undefined;
}

/** Filtrelere uyan başvurular (sırasız). Yalnız yüklü listeyi süzer; istek atmaz. */
export function filterApps(state: AppState, filters: ApplicationFilters = state.appFilters): Application[] {
  return state.apps.filter((a) => matchesFilters(a, getJob(state, a.id)!, statusLabel(a), filters));
}

export function matchingJobIds(state: AppState): number[] {
  const q = state.q.trim().toLocaleLowerCase("tr-TR");
  const { mode, city } = state.sheetFilters;
  return SEARCH_JOB_IDS.filter((id) => {
    // Aramada yalnız başvurulmamış ilanlar listelenir; başvurulan ilan listeden düşer.
    if (findApp(state, id)) return false;
    const j = getJob(state, id)!;
    if (q && !`${j.title} ${j.company} ${j.city}`.toLocaleLowerCase("tr-TR").includes(q)) return false;
    if (mode.length && !mode.includes(j.mode)) return false;
    if (city.length && !city.includes(j.cityShort)) return false;
    return true;
  });
}
