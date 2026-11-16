import { useEffect, useState, type MouseEvent } from "react";
import { lerTema, ouvirTema, trocarTema, type Tema } from "@/lib/theme";

/** Tema atual e uma função para alternar a partir de um clique (o anel abre no ponto tocado). */
export function useTema() {
  const [tema, setTema] = useState<Tema>("escuro");

  useEffect(() => {
    setTema(lerTema());
    return ouvirTema(() => setTema(lerTema()));
  }, []);

  function alternar(evento?: MouseEvent) {
    const proximo: Tema = lerTema() === "claro" ? "escuro" : "claro";
    trocarTema(proximo, evento ? { x: evento.clientX, y: evento.clientY } : undefined);
  }

  return { tema, alternar };
}
