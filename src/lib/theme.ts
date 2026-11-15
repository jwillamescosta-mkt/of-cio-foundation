export type Tema = "escuro" | "claro";

const CHAVE = "oficio-tema";

/** Script que roda antes da página aparecer, para não piscar o tema errado. */
export const scriptTemaInicial = `try{if(localStorage.getItem("${CHAVE}")==="claro"){var d=document.documentElement;d.classList.remove("dark");d.classList.add("claro")}}catch(e){}`;

export function lerTema(): Tema {
  if (typeof document === "undefined") return "escuro";
  return document.documentElement.classList.contains("claro") ? "claro" : "escuro";
}

export function aplicarTema(tema: Tema) {
  const raiz = document.documentElement;
  raiz.classList.toggle("claro", tema === "claro");
  raiz.classList.toggle("dark", tema === "escuro");
  try {
    localStorage.setItem(CHAVE, tema);
  } catch {
    // Armazenamento indisponível (aba anônima, por exemplo): o tema vale só nesta visita.
  }
}
