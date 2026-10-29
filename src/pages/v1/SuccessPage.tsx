import { CircleCheck } from "lucide-react";
import { useParams } from "react-router";
import { Icon } from "../../components/icons/Icon";
import { AppBar } from "../../components/layout/AppBar";
import { Button } from "../../components/ui/Button";
import { Heading, MutedText } from "../../components/ui/Typography";
import { routePath } from "../../routes/paths";
import { useAppState } from "../../state/AppStateProvider";
import { getJob } from "../../state/appState";
import { NotFoundPage } from "../NotFoundPage";

export function SuccessPage() {
  const state = useAppState();
  const job = getJob(state, Number(useParams().id));
  if (!job) return <NotFoundPage />;

  return (
    <>
      <AppBar title="Başvuru gönderildi" bell={false} />
      <div className="grid justify-items-center gap-12 px-24 pt-48 pb-24 text-center" data-testid="success-screen">
        <span className="grid size-[72px] place-items-center rounded-full bg-success-bg text-success">
          <Icon icon={CircleCheck} size={36} />
        </span>
        <Heading look="h2" focusTarget>
          Başvurun alındı
        </Heading>
        <MutedText>
          {`CV’n${state.lastCover ? " ve ön yazın " : " "}${job.company} şirketine iletildi. İşveren başvurunu incelediğinde Başvurularım’da görürsün.`}
        </MutedText>
        <div className="mt-16 grid w-full gap-8">
          <Button block to={routePath("v1", "basvurularim")} testId="success-go-applications">
            Başvurularıma git
          </Button>
          <Button variant="secondary" block to={routePath("v1", "ara")} testId="success-similar">
            Benzer ilanları gör
          </Button>
        </div>
      </div>
    </>
  );
}
