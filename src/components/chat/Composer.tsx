import { Paperclip, Send } from "lucide-react";
import { useRef, useState, type RefObject } from "react";
import { IconButton } from "../ui/IconButton";

const ACCEPT_FILES = ".pdf,.doc,.docx,.png,.jpg,.jpeg";

interface ComposerProps {
  placeholder: string;
  onSend: (text: string) => void;
  onAttach: (fileName: string) => void;
  /** Sayfa, "Soru sor" ile alana odaklanmak için kullanır. */
  inputRef: RefObject<HTMLTextAreaElement | null>;
}

/**
 * Mesaj yazma alanı: dosya ekle, metin (yazdıkça en fazla 5 satıra kadar büyür), gönder.
 * Enter gönderir, Shift+Enter yeni satır açar.
 */
export function Composer({ placeholder, onSend, onAttach, inputRef }: ComposerProps) {
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function fit(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  function send() {
    const el = inputRef.current!;
    const value = text.trim();
    if (!value) return el.focus();
    onSend(value);
    setText("");
    el.value = "";
    fit(el);
    el.focus();
  }

  return (
    <div className="flex flex-none items-end gap-4 bg-surface px-8 py-8 shadow-hairline-top">
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT_FILES}
        className="en-sr"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onAttach(file.name);
          e.target.value = "";
        }}
        data-testid="message-file"
      />
      <span className="py-4">
        <IconButton icon={Paperclip} label="Dosya ekle" onClick={() => fileRef.current?.click()} testId="message-attach" />
      </span>
      <label htmlFor="reply" className="en-sr">
        Yanıtın
      </label>
      <textarea
        ref={inputRef}
        id="reply"
        rows={1}
        value={text}
        placeholder={placeholder}
        enterKeyHint="send"
        className="max-h-[calc(5*var(--type-body-large-line)+var(--space-24))] min-h-48 min-w-0 flex-1 resize-none overflow-y-auto rounded-sheet border-0 bg-surface px-16 py-12 [font:var(--type-body-large)] text-primary shadow-hairline-strong placeholder:text-tertiary"
        onChange={(e) => {
          setText(e.target.value);
          fit(e.target);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            send();
          }
        }}
        data-testid="message-input"
      />
      <IconButton icon={Send} label="Yanıtı gönder" variant="filled" size="lg" onClick={send} testId="message-send" />
    </div>
  );
}
