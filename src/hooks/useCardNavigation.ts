import type { MouseEvent } from "react";
import { useNavigate } from "react-router";

/** Kartın tamamı tıklanabilir; içteki bağlantı ve düğmeler kendi işini yapar. */
export function useCardNavigation(to: string) {
  const navigate = useNavigate();
  return (e: MouseEvent) => {
    if (!(e.target as Element).closest("a, button")) navigate(to);
  };
}
