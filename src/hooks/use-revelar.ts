import { useEffect } from "react";

/**
 * Revela na rolagem todo elemento com data-revelar: ganha a classe "visivel"
 * quando entra na tela. O estado escondido só vale com JavaScript (html.js).
 */
export function useRevelar() {
  useEffect(() => {
    const alvos = Array.from(document.querySelectorAll<HTMLElement>("[data-revelar]"));
    if (!("IntersectionObserver" in window)) {
      alvos.forEach((el) => el.classList.add("visivel"));
      return;
    }
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          entrada.target.classList.add("visivel");
          observador.unobserve(entrada.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    alvos.forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, []);
}
