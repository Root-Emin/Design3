import { TriangleAlert } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { TODAY } from "../../data/user";
import { track } from "../../lib/analytics";
import { clockNow } from "../../lib/format";
import { useAppDispatch, useAppState } from "../../state/AppStateProvider";
import { findApp, getJob, statusLabel } from "../../state/appState";
import { useOverlay } from "../../state/OverlayProvider";
import { useToast } from "../../state/ToastProvider";

/**
 * Başvuruyu geri çekme onayı; geri çekilen başvuru snackbar'dan geri alınabilir. İstek başarısız olursa
 * (demo) başvuru değişmez, hata snackbar'ı onayı yeniden açan "Tekrar dene" sunar.
 */
export function WithdrawDialog({ appId }: { appId: number }) {
  const state = useAppState();
  const job = getJob(state, appId)!;
  const app = findApp(state, appId)!;
  const dispatch = useAppDispatch();
  const { closeOverlay, openOverlay } = useOverlay();
  const { showToast, hideToast } = useToast();

  function cancel() {
    track("application_withdraw_cancelled", { application_id: appId });
    closeOverlay();
  }

  function confirm() {
    closeOverlay();
    if (state.withdrawFails) {
      showToast("Başvurun geri çekilemedi. Bağlantını kontrol edip tekrar dene.", "error", {
        label: "Tekrar dene",
        onClick: () => {
          hideToast();
          openOverlay({ kind: "withdraw", appId });
        },
      });
      return;
    }
    track("application_withdraw_confirmed", { application_id: appId, status_before: statusLabel(app) });
    const withdrawnAt = Date.now();
    dispatch({ type: "withdraw", id: appId, at: `${TODAY} ${clockNow()}` });
    showToast("Başvurun geri çekildi", "success", {
      label: "Geri al",
      onClick: () => {
        track("application_withdraw_undone", { application_id: appId, seconds_since_withdraw: Math.round((Date.now() - withdrawnAt) / 1000) });
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
      onClose={cancel}
      testId="withdraw-dialog"
      actions={
        <>
          <Button variant="tertiary" onClick={cancel} testId="dialog-cancel">
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
