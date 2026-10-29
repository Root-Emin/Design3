import type { ReactNode } from "react";

/** Mevcut ekranın ikincil satırı (.bl-row__sub). */
export function BaselineSub({ as: Tag = "p", children }: { as?: "p" | "span"; children: ReactNode }) {
  return <Tag className="m-0 flex items-center gap-4 text-caption text-tertiary">{children}</Tag>;
}
