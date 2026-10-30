import { Briefcase, CircleCheck, ListFilter, LoaderCircle } from "lucide-react";
import { useLocation } from "react-router";
import { ApplicationCard } from "../../components/application/ApplicationCard";
import { AppBar, AppMenu } from "../../components/layout/AppBar";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { FilterChip, InputChip } from "../../components/ui/Chip";
import { EmptyState } from "../../components/ui/EmptyState";
import { Progress } from "../../components/ui/Progress";
import { CardSkeletonList } from "../../components/ui/Skeleton";
import { Tabs } from "../../components/ui/Tabs";
import { STATUS } from "../../data/status";
import { track, useTrackLoaded, useTrackOnce } from "../../lib/analytics";
import { routePath, useBackTarget } from "../../routes/paths";
import { useAppDispatch, useAppState } from "../../state/AppStateProvider";
import { activeFilterChips, activeFilterCount, EMPTY_FILTERS } from "../../state/applicationFilters";
import { filterApps, isClosed, sortByUpdated, unreadCount } from "../../state/appState";
import { useOverlay } from "../../state/OverlayProvider";
import { STAGES, type ApplicationFilters } from "../../types";
import { Content } from "../Content";

const RETRY_MS = 1400;
const TAB_NAME = { devam: "Devam eden", sonuc: "Sonuçlanan" } as const;

export function ApplicationsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { openOverlay } = useOverlay();
  const { apps, tab, appFilters, listState } = state;
  const ongoing = tab === "devam";
  const otherTab = ongoing ? "sonuc" : "devam";
  const filterCount = activeFilterCount(appFilters);
  const back = useBackTarget(routePath("v1", "ana"));
  const visible = filterApps(state);
  const open = visible.filter((a) => !isClosed(a));
  const closed = visible.filter(isClosed);
  // Hızlı durum satırının sayıları, durum dışındaki filtrelere göre.
  const openAnyStatus = filterApps(state, { ...appFilters, statuses: [] }).filter((a) => !isClosed(a));
  // Devam eden sekmesinde aşamalar hızlı durum satırında görünür; etiket olarak tekrar edilmez.
  const chips = activeFilterChips(appFilters, ongoing ? STAGES : []);
  const list = ongoing ? open : closed;
  const loaded = listState === "dolu" || listState === "cevrimdisi";
  let emptyReason: string | null = null;
  if (loaded && apps.length === 0) emptyReason = "no_applications";
  else if (loaded && list.length === 0) emptyReason = filterCount ? "filter_no_result" : "tab_empty";

  // Ölçüm (handoff Bölüm 7): kaynak, giriş noktasının bağlantı durumundan gelir.
  const source = (useLocation().state as { source?: string } | null)?.source ?? "other";
  useTrackOnce("applications_list_viewed", {
    source,
    tab,
    ongoing_count: apps.filter((a) => !isClosed(a)).length,
    closed_count: apps.filter(isClosed).length,
    new_update_count: unreadCount(state),
  });
  useTrackLoaded("applications_list_loaded", loaded, { item_count: apps.length });
  useTrackOnce("applications_load_failed", { screen: "applications_list", error_type: "network" }, listState === "hata");
  useTrackOnce("applications_empty_viewed", { reason: emptyReason }, emptyReason !== null, emptyReason);

  const setFilters = (filters: ApplicationFilters) => dispatch({ type: "setAppFilters", filters });
  const clearFilters = () => {
    track("applications_filter_cleared", { cleared_filter_count: filterCount });
    setFilters(EMPTY_FILTERS);
  };
  const setTab = (t: typeof tab) => {
    track("applications_tab_changed", { tab: t, item_count: (t === "devam" ? open : closed).length });
    dispatch({ type: "setTab", tab: t });
  };
  const selectStatus = (status: string, resultCount: number, apply: () => void) => {
    track("applications_status_chip_selected", { status, result_count: resultCount });
    apply();
  };

  function retry() {
    track("applications_retry_tapped", { screen: "applications_list" });
    dispatch({ type: "setListState", listState: "yukleniyor" });
    window.setTimeout(() => dispatch({ type: "setListState", listState: "dolu" }), RETRY_MS);
  }

  function emptyList() {
    if (filterCount) {
      const other = ongoing ? closed.length : open.length;
      return (
        <EmptyState
          icon={ListFilter}
          title="Filtrelerine uyan başvuru yok."
          text={
            other
              ? `Filtrelerine uyan ${other} başvuru ${TAB_NAME[otherTab]} sekmesinde.`
              : "Filtreleri değiştir ya da temizleyip tüm başvurularını gör."
          }
          action={
            <div className="flex flex-wrap justify-center gap-8">
              {other > 0 && (
                <Button variant="secondary" onClick={() => setTab(otherTab)} testId="filter-other-tab">
                  {`${TAB_NAME[otherTab]} sekmesine geç`}
                </Button>
              )}
              <Button variant="tertiary" onClick={clearFilters} testId="filter-clear">
                Filtreleri temizle
              </Button>
            </div>
          }
          testId="empty-filter"
        />
      );
    }
    return ongoing ? (
      <EmptyState
        icon={Briefcase}
        title="Devam eden başvurun yok."
        text="Yeni ilanlara göz atıp başvurabilirsin."
        action={
          <Button to={routePath("v1", "ara")} testId="empty-open-browse">
            İlanlara göz at
          </Button>
        }
        testId="empty-open"
      />
    ) : (
      <EmptyState icon={CircleCheck} title="Sonuçlanan başvurun yok." text="Sonuçlanan ve geri çektiğin başvurular burada görünür." testId="empty-closed" />
    );
  }

  function body() {
    if (listState === "yukleniyor") {
      return (
        <>
          <Progress id="pb-l" label="Başvuruların yükleniyor" thin />
          <CardSkeletonList />
        </>
      );
    }
    if (listState === "hata") {
      return (
        <Alert
          tone="error"
          title="Başvuruların yüklenemedi"
          message="Bağlantını kontrol edip tekrar dene."
          action={
            <Button variant="secondary" size="sm" icon={LoaderCircle} onClick={retry} testId="error-retry">
              Tekrar dene
            </Button>
          }
        />
      );
    }
    if (apps.length === 0) {
      return (
        <EmptyState
          icon={Briefcase}
          title="Henüz başvurun yok"
          text="Başvurduğun ilanları ve işverenin hareketlerini burada takip edersin."
          action={
            <Button to={routePath("v1", "ara")} testId="empty-browse">
              İlanlara göz at
            </Button>
          }
          testId="empty-applications"
        />
      );
    }

    return (
      <>
        {listState === "cevrimdisi" && (
          <Alert
            tone="info"
            title="Çevrimdışısın"
            message="İnternet bağlantın yok. Son yüklenen başvuruların gösteriliyor; bağlantın gelince güncellenir."
            action={
              <Button variant="secondary" size="sm" icon={LoaderCircle} onClick={retry} testId="offline-retry">
                Tekrar dene
              </Button>
            }
          />
        )}
        <div className="flex flex-wrap items-center gap-8" data-testid="app-filter-bar">
          <Button
            variant="secondary"
            size="sm"
            block
            icon={ListFilter}
            onClick={() => {
              track("applications_filter_opened", { active_filter_count: filterCount });
              openOverlay({ kind: "applicationFilter" });
            }}
            testId="app-filter-open"
          >
            {filterCount ? `Filtrele (${filterCount})` : "Filtrele"}
          </Button>
          {chips.map((c) => (
            <InputChip
              key={c.id}
              label={c.label}
              removeLabel={`${c.label} filtresini kaldır`}
              onRemove={() => setFilters(c.without)}
              testId={`app-filter-chip-${c.id}`}
            />
          ))}
          {filterCount > 0 && (
            <Button variant="tertiary" size="sm" onClick={clearFilters} testId="app-filter-reset">
              Temizle
            </Button>
          )}
          <p className="en-sr" aria-live="polite">
            {filterCount ? `Filtrelerine uyan ${list.length} başvuru gösteriliyor.` : ""}
          </p>
        </div>
        {ongoing && (
          <div
            className="-mx-16 -mt-8 flex gap-8 overflow-x-auto px-16 pt-4 pb-8 [scrollbar-width:none] *:flex-none [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Duruma göre filtrele"
          >
            <FilterChip
              label="Tümü"
              selected={appFilters.statuses.length === 0}
              count={openAnyStatus.length}
              onClick={() => selectStatus("Tümü", openAnyStatus.length, () => setFilters({ ...appFilters, statuses: [] }))}
              testId="filter-tumu"
            />
            {STAGES.map((s) => (
              <FilterChip
                key={s}
                label={s}
                selected={appFilters.statuses.includes(s)}
                count={openAnyStatus.filter((a) => a.stage === s).length}
                onClick={() =>
                  selectStatus(s, openAnyStatus.filter((a) => a.stage === s).length, () => dispatch({ type: "toggleStatusFilter", status: s }))
                }
                testId={`filter-${STATUS[s].key}`}
              />
            ))}
          </div>
        )}
        {list.length > 0 ? (
          <div className="grid gap-12" data-testid="application-list">
            {sortByUpdated(list).map((a, i) => (
              <ApplicationCard key={a.id} app={a} position={i + 1} />
            ))}
          </div>
        ) : (
          emptyList()
        )}
      </>
    );
  }

  return (
    <>
      <Tabs
        label="Başvuru listeleri"
        items={[
          { id: "devam", label: TAB_NAME.devam, count: open.length },
          { id: "sonuc", label: TAB_NAME.sonuc, count: closed.length },
        ]}
        active={tab}
        onChange={setTab}
        variant="segmented"
        bar={(tabs) => (
          <AppBar title="Başvurularım" variant="rounded" center back={back} bell={false} actions={<AppMenu />} bottom={tabs} pinBottom />
        )}
      >
        <Content>{body()}</Content>
      </Tabs>
    </>
  );
}
