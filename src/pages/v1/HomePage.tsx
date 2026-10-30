import { Circle, CircleCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { ApplicationCard } from "../../components/application/ApplicationCard";
import { Icon } from "../../components/icons/Icon";
import { JobCard } from "../../components/job/JobCard";
import { AppBar, AppBarSearch, AppMenu } from "../../components/layout/AppBar";
import { Button } from "../../components/ui/Button";
import { Progress } from "../../components/ui/Progress";
import { Heading, MutedText } from "../../components/ui/Typography";
import { RECOMMENDED_JOB_IDS } from "../../data/jobs";
import { USER } from "../../data/user";
import { profileCompletion } from "../../lib/profile";
import { routePath } from "../../routes/paths";
import { useAppDispatch, useAppState } from "../../state/AppStateProvider";
import { isClosed, sortByUpdated, unreadCount } from "../../state/appState";
import type { UserProfile } from "../../types";
import { Content } from "../Content";

/** Profil tamamlanma kartı; oran ve adımlar profil ekranıyla aynı hesaptan gelir. Profil tamamsa çizilmez. */
function ProfileCompletion({ profile }: { profile: UserProfile }) {
  const { steps, percent, next } = profileCompletion(profile);
  if (!next) return null;
  const nextText = next.todoText.charAt(0).toLocaleLowerCase("tr-TR") + next.todoText.slice(1);
  return (
    <section className="en-pcm en-pcm--card max-w-none" aria-label="Profil tamamlanma">
      <p className="en-pcm__title">Profilini tamamla</p>
      <p className="en-pcm__sub">{`Sıradaki adım: ${nextText}. İşverenler başvurunu açtığında profilinin tamamını görür.`}</p>
      <Progress id="pb-p" label="Profil tamamlanma" value={percent} />
      <ol className="en-pcm__steps">
        {steps.map((s) => (
          <li key={s.key} className={s.done ? "is-done" : s === next ? "is-next" : undefined}>
            <Icon icon={s.done ? CircleCheck : Circle} size={16} />
            <span>{s.done ? s.doneText : s.todoText}</span>
            {s.done && <span className="en-sr">(tamamlandı)</span>}
          </li>
        ))}
      </ol>
      <Button block to={routePath("v1", "profil")} testId="home-complete-profile">
        Profili tamamla
      </Button>
    </section>
  );
}

export function HomePage() {
  const state = useAppState();
  const recent = sortByUpdated(state.apps.filter((a) => !isClosed(a)))[0];
  const n = unreadCount(state);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [q, setQ] = useState(state.q);

  return (
    <>
      <AppBar
        variant="rounded"
        center
        logo="Design3"
        bell={false}
        actions={<AppMenu />}
        bottom={
          // Arama İş ara ekranında sonuçlanır; yazılan kelime oradaki aramaya taşınır.
          <AppBarSearch
            label="Pozisyon, şirket veya şehir"
            value={q}
            onChange={setQ}
            onSubmit={() => {
              dispatch({ type: "setQuery", q });
              navigate(routePath("v1", "ara"));
            }}
            testId="home-search"
          />
        }
      />
      <Content>
        <div className="grid gap-8">
          <Heading as="h1" look="h2" focusTarget>
            {`Merhaba ${USER.first}`}
          </Heading>
          <MutedText>{n ? `${n} başvurunda yeni güncelleme var.` : "Başvurularındaki son durum aşağıda."}</MutedText>
        </div>
        {recent && (
          <section className="grid gap-12">
            <div className="flex items-center justify-between gap-8">
              <Heading look="title">Son güncellenen başvurun</Heading>
              <Button variant="tertiary" size="sm" to={routePath("v1", "basvurularim")} linkState={{ source: "home_see_all" }} testId="home-all-applications">
                Tümünü gör
              </Button>
            </div>
            <ApplicationCard app={recent} density="compact" />
          </section>
        )}
        <ProfileCompletion profile={state.profile} />
        <section className="grid gap-12">
          <Heading look="title">Sana uygun ilanlar</Heading>
          {RECOMMENDED_JOB_IDS.map((id) => (
            <JobCard key={id} jobId={id} />
          ))}
        </section>
      </Content>
    </>
  );
}
