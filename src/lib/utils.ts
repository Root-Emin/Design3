import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/*
 * tailwind-merge'e DS teması tanıtılır (index.css @theme). Tanıtılmazsa örneğin "text-caption"
 * bir renk sanılır ve aynı listedeki "text-tertiary" ile çakışıp silinir.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["heading-1", "heading-2", "heading-3", "title", "body-lg", "body-md", "caption", "overline"],
      shadow: ["hairline", "hairline-top", "hairline-bottom", "hairline-strong", "frame", "popover", "card", "divider-subtle"],
      radius: ["control", "card", "sheet"],
      spacing: ["appbar", "bottomnav"],
      animate: ["fade", "rise", "rise-fast"],
    },
  },
});

/** shadcn sınıf birleştiricisi: koşullu sınıflar (clsx) + çakışan Tailwind sınıflarında sonuncusu kazanır. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
