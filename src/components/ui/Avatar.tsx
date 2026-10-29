import { cn } from "../../lib/utils";
import type { Job, Tone } from "../../types";

interface AvatarProps {
  initials: string;
  label: string;
  tone: Tone;
  size?: "sm" | "md" | "lg";
  shape?: "company" | "person";
  className?: string;
}

/** DS Avatar: şirket (köşeli) veya kişi (yuvarlak). */
export function Avatar({ initials, label, tone, size = "md", shape = "company", className }: AvatarProps) {
  return (
    <span className={cn("en-avatar", `en-avatar--${size}`, `en-avatar--${shape}`, `en-avatar--${tone}`, className)} role="img" aria-label={label}>
      <span>{initials}</span>
    </span>
  );
}

export function CompanyAvatar({ job, size, className }: { job: Job; size?: AvatarProps["size"]; className?: string }) {
  return <Avatar initials={job.init} label={job.company} tone={job.tone} size={size} className={className} />;
}
