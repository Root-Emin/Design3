import { ListFilter, Search } from "lucide-react";
import { JobCard } from "../../components/job/JobCard";
import { AppBar, AppBarSearch, AppMenu } from "../../components/layout/AppBar";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { MutedText } from "../../components/ui/Typography";
import { routePath, useBackTarget } from "../../routes/paths";
import { useAppDispatch, useAppState } from "../../state/AppStateProvider";
import { matchingJobIds } from "../../state/appState";
import { useOverlay } from "../../state/OverlayProvider";
import { Content } from "../Content";

export function SearchPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { openOverlay } = useOverlay();
  const ids = matchingJobIds(state);
  const filterCount = state.sheetFilters.mode.length + state.sheetFilters.city.length;
  // Sekme ekranı: geri, geldiği ekrana (adres taşıyorsa) ya da ana sayfaya döner.
  const back = useBackTarget(routePath("v1", "ana"));

  return (
    <>
      <AppBar
        variant="rounded"
        center
        title="İş Ara"
        back={back}
        bell={false}
        actions={<AppMenu />}
        bottom={
          <AppBarSearch
            label="Pozisyon, şirket veya şehir"
            value={state.q}
            onChange={(q) => dispatch({ type: "setQuery", q })}
            testId="search-input"
          />
        }
      />
      <Content>
        <div className="flex items-center justify-between gap-8">
          <MutedText aria-live="polite" data-testid="search-count">
            <span className="en-num">{ids.length}</span> ilan
          </MutedText>
          <Button variant="secondary" size="sm" icon={ListFilter} onClick={() => openOverlay({ kind: "filter" })} testId="search-filter">
            {filterCount ? `Filtrele (${filterCount})` : "Filtrele"}
          </Button>
        </div>
        {ids.length ? (
          <div className="grid gap-12" id="results">
            {ids.map((id) => (
              <JobCard key={id} jobId={id} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="Aramana uygun ilan yok."
            text="Farklı bir kelime dene ya da filtreleri temizle."
            action={
              <Button variant="tertiary" onClick={() => dispatch({ type: "clearSearch" })} testId="search-clear">
                Filtreleri temizle
              </Button>
            }
            testId="empty-search"
          />
        )}
      </Content>
    </>
  );
}
