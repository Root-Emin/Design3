import { useRef, useState } from "react";
import { Button } from "../../components/ui/Button";
import { SelectField } from "../../components/ui/SelectField";
import { Sheet } from "../../components/ui/Sheet";
import { TextField } from "../../components/ui/TextField";
import { MutedText } from "../../components/ui/Typography";
import { TODAY_ISO } from "../../data/user";
import { addDays, formatInterviewDate } from "../../lib/format";
import { useAppState } from "../../state/AppStateProvider";
import { getRequest } from "../../state/appState";
import { useOverlay } from "../../state/OverlayProvider";
import { useChatActions } from "./useChatActions";

/** 09.00–18.00 arası, yarım saatlik dilimler. */
const TIMES = Array.from({ length: 19 }, (_, i) => `${String(9 + Math.floor(i / 2)).padStart(2, "0")}.${i % 2 ? "30" : "00"}`);

/** En erken önerilebilen gün: prototipin "bugün"ünden (TODAY_ISO) sonraki gün. */
const MIN_DAY = addDays(TODAY_ISO, 1);

/** Mülakat daveti için aday yeni bir tarih/saat önerir. Öneri yazışmaya aday mesajı olarak düşer. */
export function RescheduleSheet({ conversationId }: { conversationId: number }) {
  const interview = getRequest(useAppState(), conversationId)?.interview;
  const { proposeTime } = useChatActions(conversationId);
  const { closeOverlay } = useOverlay();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [tried, setTried] = useState(false);
  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLSelectElement>(null);

  const dateError = !date ? "Bir tarih seç." : date < MIN_DAY ? "Yarından sonraki bir tarih seç." : undefined;

  function submit() {
    setTried(true);
    if (dateError) return dateRef.current?.focus();
    if (!time) return timeRef.current?.focus();
    proposeTime(`${date}T${time.replace(".", ":")}`, note.trim());
    closeOverlay();
  }

  return (
    <Sheet
      title="Başka saat öner"
      closeLabel="Kapat"
      onClose={closeOverlay}
      size="auto"
      testId="reschedule-sheet"
      footer={
        <>
          <Button variant="tertiary" onClick={closeOverlay} testId="reschedule-cancel">
            Vazgeç
          </Button>
          <Button block onClick={submit} testId="reschedule-submit">
            Öneriyi gönder
          </Button>
        </>
      }
    >
      {interview && <MutedText>{`Mevcut saat: ${formatInterviewDate(interview.at)}`}</MutedText>}
      <TextField
        ref={dateRef}
        id="rs-date"
        label="Tarih"
        type="date"
        required
        min={MIN_DAY}
        value={date}
        onChange={(e) => setDate(e.target.value)}
        errorText={tried ? dateError : undefined}
        testId="reschedule-date"
      />
      <SelectField
        ref={timeRef}
        id="rs-time"
        label="Saat"
        options={TIMES}
        value={time}
        onChange={setTime}
        helper="Önerin işverenin onayına gönderilir."
        invalid={tried && !time}
        errorText="Bir saat seç."
      />
      <TextField
        id="rs-note"
        label="Not (isteğe bağlı)"
        type="text"
        maxLength={200}
        placeholder="Örneğin: Öğleden sonraları daha uygunum."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        testId="reschedule-note"
      />
    </Sheet>
  );
}
