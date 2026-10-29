import { Info } from "lucide-react";
import { AppBar } from "../components/layout/AppBar";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { routePath } from "../routes/paths";

export function NotFoundPage() {
  return (
    <>
      <AppBar title="Sayfa bulunamadı" />
      <EmptyState
        icon={Info}
        title="Bu sayfa bulunamadı."
        text="Başvurularına dönüp devam edebilirsin."
        action={
          <Button to={routePath("v1", "basvurularim")} testId="notfound-back">
            Başvurularıma git
          </Button>
        }
        testId="not-found"
      />
    </>
  );
}
