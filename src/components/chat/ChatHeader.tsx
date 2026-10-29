import { ArrowLeft, ChevronRight, EllipsisVertical, type LucideIcon } from "lucide-react";
import { Link } from "react-router";
import { cn } from "../../lib/utils";
import type { Job } from "../../types";
import { Icon } from "../icons/Icon";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../shadcn/dropdown-menu";
import { CompanyAvatar } from "../ui/Avatar";
import { IconButton } from "../ui/IconButton";

interface ChatHeaderProps {
  back: string;
  job: Job;
  company: string;
  online: boolean;
  menu: ReadonlyArray<{ label: string; icon: LucideIcon; to: string; testId: string }>;
}

/** Sohbet başlığı: geri, şirket avatarı, ad + çevrim içi durumu, seçenek menüsü. */
export function ChatHeader({ back, job, company, online, menu }: ChatHeaderProps) {
  return (
    // DS App Bar'ın yüzeyi ve alt çizgisi; iki satırlı başlık için kendi yerleşimi.
    <header className="sticky top-0 z-(--z-sticky) flex min-h-(--size-appbar-mobile) flex-none items-center gap-8 bg-surface px-4 py-8 text-primary shadow-hairline-bottom">
      <IconButton icon={ArrowLeft} label="Geri" to={back} testId="appbar-back" />
      <CompanyAvatar job={job} />
      <div className="grid min-w-0 flex-1">
        <h1 className="m-0 truncate text-title text-primary" tabIndex={-1} data-focus="" data-testid="chat-company">
          {company}
        </h1>
        <p className="m-0 flex items-center gap-4 text-caption text-secondary">
          <span className={cn("size-8 flex-none rounded-full", online ? "bg-(--progress-default)" : "bg-(--status-closed)")} aria-hidden="true" />
          {online ? "Çevrim içi" : "Çevrim dışı"}
        </p>
      </div>
      <ChatMenu items={menu} />
    </header>
  );
}

/** Üç noktalı seçenek menüsü (shadcn Dropdown Menu). Dışarı tıklama, Esc ve ok tuşları Radix'ten gelir. */
function ChatMenu({ items }: { items: ChatHeaderProps["menu"] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton icon={EllipsisVertical} label="Seçenekler" testId="chat-menu" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={0}>
        {items.map((it) => (
          <DropdownMenuItem key={it.to} asChild>
            <Link to={it.to} data-testid={it.testId}>
              <Icon icon={it.icon} className="ds-icon text-secondary" />
              {it.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ApplicationContextCardProps {
  to: string;
  icon: LucideIcon;
  title: string;
  subject: string;
}

/** Başlığın altındaki başvuru kartı: "Ürün Tasarımcısı başvurun · Mülakat daveti" → başvuru detayı. */
export function ApplicationContextCard({ to, icon, title, subject }: ApplicationContextCardProps) {
  return (
    <Link
      to={to}
      className="en-state en-focus mx-16 mt-12 flex items-center gap-12 rounded-card bg-(--chat-incoming) p-12 text-body-md text-primary no-underline"
      data-testid="message-view-application"
    >
      <span className="grid size-40 flex-none place-items-center rounded-control bg-action-secondary text-(--action-on-secondary)">
        <Icon icon={icon} />
      </span>
      <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
        <strong className="font-semibold">{title}</strong>
        {` başvurun · ${subject}`}
      </span>
      <Icon icon={ChevronRight} className="ds-icon text-secondary" />
    </Link>
  );
}
