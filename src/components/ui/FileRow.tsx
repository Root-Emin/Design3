import { FileText } from "lucide-react";
import { Icon } from "../icons/Icon";

/** Dosya satırı (CV, ek belge). */
export function FileRow({ name, detail }: { name: string; detail?: string }) {
  return (
    <div className="flex items-center gap-12 rounded-control p-12 text-body-md text-primary shadow-hairline-strong">
      <Icon icon={FileText} className="ds-icon flex-none text-secondary" />
      <span className="min-w-0 flex-1">
        {name}
        {detail && <small className="block text-caption text-tertiary">{detail}</small>}
      </span>
    </div>
  );
}
