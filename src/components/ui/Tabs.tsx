import type { ReactElement, ReactNode } from "react";
import { cn } from "../../lib/utils";
import { TabsContent, TabsList, TabsTrigger, Tabs as TabsRoot } from "../shadcn/tabs";

export interface TabItem<K extends string> {
  id: K;
  label: string;
  count: number;
}

interface TabsProps<K extends string> {
  label: string;
  items: TabItem<K>[];
  active: K;
  onChange: (id: K) => void;
  /** DS görünümü: alt çizgili (varsayılan) ya da segmented. */
  variant?: "underline" | "segmented";
  /** Sekme çubuğunu saran kabın sınıfı (ör. yapışkan başlık). */
  barClassName?: string;
  /** Sekme çubuğunu başka bir kabın içine yerleştirir (ör. App Bar'ın alt alanı); barClassName yok sayılır. */
  bar?: (tabs: ReactNode) => ReactNode;
  /** Etkin sekmenin paneli; tabpanel rolü ve ARIA bağları bu öğeye eklenir. */
  children: ReactElement;
}

/** DS Tabs (tam genişlik), shadcn Tabs üzerine. Ok tuşlarıyla sekmeler arasında gezilir. */
export function Tabs<K extends string>({ label, items, active, onChange, variant = "underline", barClassName, bar, children }: TabsProps<K>) {
  const tabs = (
    // max-w-none: DS'in 560px sınırı geniş telefonlarda alt çizgiyi yarıda kesiyordu.
    <div className={cn("en-tabs en-tabs--full max-w-none", `en-tabs--${variant}`)}>
      <TabsList aria-label={label}>
        {items.map((t) => (
          <TabsTrigger key={t.id} value={t.id} className={cn(t.id === active && "is-active")} data-testid={`tab-${t.id}`}>
            <span>{t.label}</span>
            <span className="en-tabs__count en-num">{t.count}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
  return (
    // contents: kök kutu üretmez, böylece yapışkan çubuk kaydırılan ekrana göre yapışır.
    <TabsRoot value={active} onValueChange={(id) => onChange(id as K)} className="contents">
      {bar ? bar(tabs) : <div className={barClassName}>{tabs}</div>}
      <TabsContent value={active} asChild>
        {children}
      </TabsContent>
    </TabsRoot>
  );
}
