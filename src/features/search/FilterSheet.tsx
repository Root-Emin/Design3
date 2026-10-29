import { Button } from "../../components/ui/Button";
import { FilterChip } from "../../components/ui/Chip";
import { Sheet } from "../../components/ui/Sheet";
import { FILTER_OPTIONS } from "../../data/jobs";
import { useAppDispatch, useAppState } from "../../state/AppStateProvider";
import { matchingJobIds } from "../../state/appState";
import { useOverlay } from "../../state/OverlayProvider";
import type { SheetFilterKey } from "../../types";

const GROUPS: ReadonlyArray<readonly [SheetFilterKey, string]> = [
  ["mode", "Çalışma şekli"],
  ["city", "Şehir"],
];

/** İş ara filtresi (alt sayfa). Seçimler arkadaki listeye anında uygulanır. */
export function FilterSheet() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { closeOverlay } = useOverlay();
  const count = matchingJobIds(state).length;

  return (
    <Sheet
      title="Filtrele"
      closeLabel="Kapat"
      onClose={closeOverlay}
      size="auto"
      testId="filter-sheet"
      footer={
        <>
          <Button variant="tertiary" onClick={() => dispatch({ type: "clearSheetFilters" })} testId="filter-clear-all">
            Temizle
          </Button>
          <Button block onClick={closeOverlay} testId="filter-apply">
            {`${count} ilanı göster`}
          </Button>
        </>
      }
    >
      {GROUPS.map(([key, title]) => (
        <div key={key} className="en-sheet__group">
          <p className="en-sheet__label">{title}</p>
          <div className="en-sheet__chips">
            {FILTER_OPTIONS[key].map((v) => (
              <FilterChip
                key={v}
                label={v}
                selected={state.sheetFilters[key].includes(v)}
                onClick={() => dispatch({ type: "toggleSheetFilter", key, value: v })}
                testId={`sheet-${key}-${v}`}
              />
            ))}
          </div>
        </div>
      ))}
    </Sheet>
  );
}
