import { useEffect, type RefObject } from "react";

/**
 * Chama aoMudar(p) com p de 0 a 1 conforme o elemento atravessa a tela.
 * inicio e fim são frações da altura da janela onde o topo do elemento
 * começa (p = 0) e onde o fim do elemento termina (p = 1).
 */
export function useProgressoRolagem(
  ref: RefObject<HTMLElement | null>,
  aoMudar: (p: number) => void,
  { inicio = 0.85, fim = 0.4 }: { inicio?: number; fim?: number } = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      const r = el.getBoundingClientRect();
      const h = window.innerHeight;
      const de = h * inicio;
      const ate = h * fim - r.height;
      const p = (de - r.top) / (de - ate);
      aoMudar(Math.min(1, Math.max(0, p)));
    };
    const pedir = () => {
      if (!quadro) quadro = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
      if (quadro) cancelAnimationFrame(quadro);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
