import { Bookmark } from "lucide-react";
import { JobCard } from "../../components/job/JobCard";
import { AppBar } from "../../components/layout/AppBar";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { MutedText } from "../../components/ui/Typography";
import { routePath, useVersion } from "../../routes/paths";
import { useAppState } from "../../state/AppStateProvider";
import { Content } from "../Content";

/** Kaydedilen ilanlar: son kaydedilen en üstte. Kayıttan çıkarılan ilan listeden hemen düşer. */
export function SavedJobsPage() {
  const ver = useVersion();
  const ids = [...useAppState().savedJobIds].reverse();

  return (
    <>
      <AppBar title="Kaydedilen ilanlar" back={routePath(ver, "profil")} bell={false} />
      {ids.length ? (
        <Content>
          <MutedText aria-live="polite" data-testid="saved-count">
            <span className="en-num">{ids.length}</span> ilan
          </MutedText>
          {ids.map((id) => (
            <JobCard key={id} jobId={id} />
          ))}
        </Content>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="Henüz kayıtlı ilanın yok."
          text="Beğendiğin ilanları kaydet, daha sonra buradan incele."
          action={
            <Button variant="tertiary" to={routePath(ver, "ara")} testId="saved-browse">
              İlanlara göz at
            </Button>
          }
          testId="empty-saved"
        />
      )}
    </>
  );
}
