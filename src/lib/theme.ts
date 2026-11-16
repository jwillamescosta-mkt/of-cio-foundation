export type Tema = "escuro" | "claro";

const CHAVE = "oficio-tema";
const EVENTO = "oficio-tema";

/**
 * Script que roda antes da página aparecer: marca que há JavaScript (para as
 * revelações na rolagem) e aplica o tema salvo, para não piscar o tema errado.
 */
export const scriptTemaInicial = `try{var d=document.documentElement;d.classList.add("js");if(localStorage.getItem("${CHAVE}")==="claro"){d.classList.remove("dark");d.classList.add("claro")}}catch(e){}`;

export function lerTema(): Tema {
  if (typeof document === "undefined") return "escuro";
  return document.documentElement.classList.contains("claro") ? "claro" : "escuro";
}

export function aplicarTema(tema: Tema) {
  const raiz = document.documentElement;
  raiz.classList.toggle("claro", tema === "claro");
  raiz.classList.toggle("dark", tema === "escuro");
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", tema === "claro" ? "#EAE4D9" : "#1F1D1B");
  try {
    localStorage.setItem(CHAVE, tema);
  } catch {
    // Armazenamento indisponível (aba anônima, por exemplo): o tema vale só nesta visita.
  }
  window.dispatchEvent(new Event(EVENTO));
}

/** Avisa quando o tema muda, para os botões de tema ficarem em sincronia. */
export function ouvirTema(aoMudar: () => void) {
  window.addEventListener(EVENTO, aoMudar);
  return () => window.removeEventListener(EVENTO, aoMudar);
}

type ComTransicao = Document & {
  startViewTransition?: (cb: () => void) => { finished: Promise<void> };
};

/**
 * Troca o tema com o anel: o tema novo abre em círculo a partir do ponto tocado.
 * Sem suporte do navegador, ou com "reduzir movimento" ligado, troca direto.
 */
export function trocarTema(tema: Tema, origem?: { x: number; y: number }) {
  const doc = document as ComTransicao;
  const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || reduzir || !origem) {
    aplicarTema(tema);
    return;
  }
  const raiz = document.documentElement;
  raiz.style.setProperty("--vt-x", `${origem.x}px`);
  raiz.style.setProperty("--vt-y", `${origem.y}px`);
  raiz.classList.add("trocando-tema");
  const transicao = doc.startViewTransition(() => aplicarTema(tema));
  transicao.finished.finally(() => raiz.classList.remove("trocando-tema"));
}
