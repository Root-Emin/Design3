import { TriangleAlert } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { TODAY } from "../../data/user";
import { clockNow } from "../../lib/format";
import { useAppDispatch, useAppState } from "../../state/AppStateProvider";
import { getJob } from "../../state/appState";
import { useOverlay } from "../../state/OverlayProvider";
import { useToast } from "../../state/ToastProvider";

/** Başvuruyu geri çekme onayı; geri çekilen başvuru snackbar'dan geri alınabilir. */
export function WithdrawDialog({ appId }: { appId: number }) {
  const job = getJob(useAppState(), appId)!;
  const dispatch = useAppDispatch();
  const { closeOverlay } = useOverlay();
  const { showToast, hideToast } = useToast();

  function confirm() {
    dispatch({ type: "withdraw", id: appId, at: `${TODAY} ${clockNow()}` });
    closeOverlay();
    showToast("Başvurun geri çekildi", "success", {
      label: "Geri al",
      onClick: () => {
        dispatch({ type: "undoWithdraw", id: appId });
        hideToast();
        showToast("Başvurun geri alındı", "info");
      },
    });
  }

  return (
    <Dialog
      icon={TriangleAlert}
      title="Başvuruyu geri çekmek istiyor musun?"
      // [Tekrar başvuru kuralı]: ürün kuralı netleşince doldurulacak yer tutucu (prototipten).
      body={`${job.company} şirketindeki “${job.title}” başvurun geri çekilecek. [Tekrar başvuru kuralı].`}
      onClose={closeOverlay}
      testId="withdraw-dialog"
      actions={
        <>
          <Button variant="tertiary" onClick={closeOverlay} testId="dialog-cancel">
            Vazgeç
          </Button>
          <Button variant="destructive" onClick={confirm} testId="dialog-confirm">
            Başvuruyu geri çek
          </Button>
        </>
      }
    />
  );
}
