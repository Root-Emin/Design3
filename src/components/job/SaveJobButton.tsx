import { Bookmark } from "lucide-react";
import { useAppDispatch, useAppState } from "../../state/AppStateProvider";
import { isSaved } from "../../state/appState";
import { useToast } from "../../state/ToastProvider";
import { IconButton } from "../ui/IconButton";

/** İlanı kaydet/çıkar. Durum uygulama durumunda tutulur; Profil › Kaydedilen ilanlar aynı listeyi gösterir. */
export function SaveJobButton({ jobId, testId }: { jobId: number; testId: string }) {
  const saved = isSaved(useAppState(), jobId);
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  return (
    <IconButton
      icon={Bookmark}
      label="İlanı kaydet"
      pressed={saved}
      onClick={() => {
        dispatch({ type: "toggleSavedJob", id: jobId });
        showToast(saved ? "İlan kayıtlardan çıkarıldı" : "İlan kaydedildi", "success");
      }}
      testId={testId}
    />
  );
}
