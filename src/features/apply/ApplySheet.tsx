import { Mail, Phone, Send, User } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Checkbox } from "../../components/ui/Checkbox";
import { FileRow } from "../../components/ui/FileRow";
import { SelectField } from "../../components/ui/SelectField";
import { Sheet } from "../../components/ui/Sheet";
import { TextField } from "../../components/ui/TextField";
import { MutedText } from "../../components/ui/Typography";
import { ownEv } from "../../data/applications";
import { EXPERIENCE_OPTIONS, START_OPTIONS, TODAY, TODAY_ISO, USER } from "../../data/user";
import { clockNow } from "../../lib/format";
import { routePath, useVersion } from "../../routes/paths";
import { useAppDispatch, useAppState } from "../../state/AppStateProvider";
import { getJob } from "../../state/appState";
import { useOverlay } from "../../state/OverlayProvider";
import { useToast } from "../../state/ToastProvider";
import type { Application } from "../../types";

type QuestionId = "q1" | "q2";
type SubmitStatus = "idle" | "loading" | "success";

const SEND_MS = 1200;
const CLOSE_AFTER_SUCCESS_MS = 600;
const QUESTION_HELPER = "Bu yanıt başvurunla birlikte işverene iletilir.";
const QUESTION_ERROR = "Başvuruyu göndermek için bir seçenek seç.";

function FormGroup({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <section className="grid gap-12" aria-labelledby={id}>
      <p className="en-sheet__label" id={id}>
        {label}
      </p>
      {children}
    </section>
  );
}

function newApplication(jobId: number): Application {
  return {
    id: jobId, stage: "Başvuruldu", outcome: null, applied: TODAY, appliedOn: TODAY_ISO, ago: "Bugün başvurdun",
    upd: 20261027.2359, updLabel: "Bugün", unread: false,
    dates: { "Başvuruldu": TODAY }, events: [ownEv(Send, "Başvurunu gönderdin", `${TODAY} ${clockNow()}`)],
  };
}

/**
 * Başvuru formu (alt sayfa). İşveren soruları zorunludur: yeni tasarımda alan altında hata
 * gösterilir ve ilk hatalı alana odaklanılır; mevcut ekranda (baseline) yalnız snackbar çıkar.
 */
export function ApplySheet({ jobId }: { jobId: number }) {
  const ver = useVersion();
  const baseline = ver === "baseline";
  const job = getJob(useAppState(), jobId)!;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { closeOverlay, closeOverlayThen } = useOverlay();

  const [answers, setAnswers] = useState<Record<QuestionId, string>>({ q1: "", q2: "" });
  const [invalid, setInvalid] = useState<Partial<Record<QuestionId, boolean>>>({});
  const [cover, setCover] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const coverRef = useRef<HTMLInputElement>(null);
  const questionRefs = { q1: useRef<HTMLSelectElement>(null), q2: useRef<HTMLSelectElement>(null) };
  // Gönderim sürerken form kapatılabilir; o zaman sonuç ekranı açılmaz, başka bir katman da kapatılmaz.
  const open = useRef(true);
  useEffect(() => {
    open.current = true;
    return () => {
      open.current = false;
    };
  }, []);

  function answer(id: QuestionId, value: string) {
    setAnswers((a) => ({ ...a, [id]: value }));
    if (value) setInvalid((v) => ({ ...v, [id]: false }));
  }

  function submit() {
    if (status !== "idle") return;
    const bad = { q1: !answers.q1, q2: !answers.q2 };
    if (!baseline) setInvalid(bad);
    if (bad.q1 || bad.q2) {
      if (baseline) showToast("Eksik alanlar var.", "error");
      else questionRefs[bad.q1 ? "q1" : "q2"].current?.focus();
      return;
    }
    setStatus("loading");
    // Gönderim, sayfa kapatılsa da tamamlanır (prototipteki davranış); kapatıldıysa yalnız snackbar çıkar.
    window.setTimeout(() => {
      setStatus("success");
      window.setTimeout(() => {
        dispatch({ type: "addApplication", app: newApplication(jobId), cover });
        if (!open.current) {
          showToast(baseline ? "Başvurunuz alınmıştır." : "Başvurun gönderildi.", "success");
          return;
        }
        closeOverlayThen(() => {
          if (baseline) {
            navigate(routePath("baseline", "basvurularim"));
            showToast("Başvurunuz alınmıştır.", "success");
          } else {
            navigate(routePath("v1", "basari", jobId));
          }
        });
      }, CLOSE_AFTER_SUCCESS_MS);
    }, SEND_MS);
  }

  const question = (id: QuestionId, label: string, options: readonly string[], helper: string) => (
    <SelectField
      ref={questionRefs[id]}
      id={id}
      label={label}
      options={options}
      value={answers[id]}
      onChange={(v) => answer(id, v)}
      helper={helper}
      invalid={invalid[id]}
      errorText={QUESTION_ERROR}
    />
  );
  const coverCheckbox = (label: string, description?: string) => (
    <Checkbox ref={coverRef} id="cover" label={label} description={description} checked={cover} onChange={setCover} />
  );

  const submitLabel = status === "loading" ? "Gönderiliyor…" : status === "success" ? "Gönderildi" : baseline ? "Gönder" : "Başvuruyu gönder";
  const footer = (
    <Button block loading={status === "loading"} success={status === "success"} onClick={submit} testId="form-submit">
      {submitLabel}
    </Button>
  );

  return (
    <Sheet
      title={baseline ? "Başvuru" : "Başvuru formu"}
      closeLabel="Formu kapat"
      onClose={closeOverlay}
      size="full"
      footer={footer}
      testId="apply-sheet"
    >
      {baseline ? (
        <>
          <TextField id="ad" label="Ad soyad" type="text" defaultValue={USER.name} required testId="form-ad" />
          <TextField id="tel" label="Telefon" type="tel" defaultValue={USER.phone} required testId="form-tel" />
          {coverCheckbox("Ön yazı ekle")}
          {question("q1", "Ne zaman işe başlayabilirsin?", START_OPTIONS, "")}
          <TextField id="eposta" label="E-posta" type="email" defaultValue={USER.email} required testId="form-eposta" />
          <FileRow name={USER.cv} />
          {question("q2", "Kaç yıl deneyimin var?", EXPERIENCE_OPTIONS, "")}
        </>
      ) : (
        <>
          <MutedText>
            {`${job.title} · ${job.company}`}
          </MutedText>
          <FormGroup id="g1" label="İletişim bilgilerin">
            <TextField id="ad" label="Ad soyad" type="text" icon={User} defaultValue={USER.name} required testId="form-ad" />
            <TextField
              id="eposta"
              label="E-posta adresi"
              type="email"
              icon={Mail}
              defaultValue={USER.email}
              helper="İşverenler bu adresle sana ulaşır."
              required
              testId="form-eposta"
            />
            <TextField id="tel" label="Telefon numarası" type="tel" icon={Phone} defaultValue={USER.phone} required testId="form-tel" />
          </FormGroup>
          <FormGroup id="g2" label="CV ve ön yazı">
            <FileRow name={USER.cv} detail={`${USER.cvDate}’de güncellendi · Profilindeki CV gönderilir`} />
            <Alert
              tone="info"
              title="Ön yazı eklemek isteğe bağlı"
              message="Eklersen işveren CV’nin yanında ön yazını da görür."
              action={
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={() => {
                    setCover(true);
                    coverRef.current?.focus();
                  }}
                  testId="form-add-cover"
                >
                  Ön yazı ekle
                </Button>
              }
            />
            {coverCheckbox("Kayıtlı ön yazımı ekle", "Profilindeki ön yazı başvuruna eklenir.")}
          </FormGroup>
          <FormGroup id="g3" label="İşverenin soruları">
            {question("q1", "Ne zaman işe başlayabilirsin?", START_OPTIONS, QUESTION_HELPER)}
            {question("q2", "Bu alanda kaç yıl deneyimin var?", EXPERIENCE_OPTIONS, QUESTION_HELPER)}
          </FormGroup>
        </>
      )}
    </Sheet>
  );
}
