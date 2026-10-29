import { Briefcase, CircleCheck, ListFilter, LoaderCircle } from "lucide-react";
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
import { routePath, useBackTarget } from "../../routes/paths";
import { useAppDispatch, useAppState } from "../../state/AppStateProvider";
import { activeFilterChips, activeFilterCount, EMPTY_FILTERS } from "../../state/applicationFilters";
import { filterApps, isClosed, sortByUpdated } from "../../state/appState";
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

  const setFilters = (filters: ApplicationFilters) => dispatch({ type: "setAppFilters", filters });
  const clearFilters = () => setFilters(EMPTY_FILTERS);

  function retry() {
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
                <Button variant="secondary" onClick={() => dispatch({ type: "setTab", tab: otherTab })} testId="filter-other-tab">
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

    const list = ongoing ? open : closed;
    return (
      <>
        <div className="flex flex-wrap items-center gap-8" data-testid="app-filter-bar">
          <Button variant="secondary" size="sm" block icon={ListFilter} onClick={() => openOverlay({ kind: "applicationFilter" })} testId="app-filter-open">
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
              onClick={() => setFilters({ ...appFilters, statuses: [] })}
              testId="filter-tumu"
            />
            {STAGES.map((s) => (
              <FilterChip
                key={s}
                label={s}
                selected={appFilters.statuses.includes(s)}
                count={openAnyStatus.filter((a) => a.stage === s).length}
                onClick={() => dispatch({ type: "toggleStatusFilter", status: s })}
                testId={`filter-${STATUS[s].key}`}
              />
            ))}
          </div>
        )}
        {list.length > 0 ? (
          <div className="grid gap-12" data-testid="application-list">
            {sortByUpdated(list).map((a) => (
              <ApplicationCard key={a.id} app={a} />
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
        onChange={(t) => dispatch({ type: "setTab", tab: t })}
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
