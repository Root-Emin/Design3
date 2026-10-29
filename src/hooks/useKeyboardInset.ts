import { useEffect, useState } from "react";

/**
 * Ekran klavyesinin düzen görünümünü (layout viewport) örttüğü yükseklik.
 * Android Chrome içeriği zaten yeniden boyutlandırır (viewport meta: interactive-widget=resizes-content),
 * değer 0 kalır; iOS Safari boyutlandırmaz, klavye kadar boşluk bu değerle bırakılır.
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setInset(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)));
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);
  return inset;
}
