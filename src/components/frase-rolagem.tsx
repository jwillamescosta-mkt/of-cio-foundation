import { useRef } from "react";
import { useProgressoRolagem } from "@/hooks/use-progresso-rolagem";

/** Frase grande que "acende" palavra por palavra conforme a página rola. */
export function FraseRolagem({ texto, className = "" }: { texto: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const palavras = texto.split(" ");

  useProgressoRolagem(ref, (p) => {
    const spans = ref.current?.querySelectorAll<HTMLElement>("span[data-p]");
    if (!spans) return;
    const total = spans.length;
    spans.forEach((s, i) => {
      // Cada palavra acende numa janela curta do progresso
      const local = Math.min(1, Math.max(0, p * (total + 3) - i));
      s.style.opacity = String(0.22 + 0.78 * local);
    });
  });

  return (
    <p ref={ref} className={className}>
      {palavras.map((palavra, i) => (
        <span key={i} data-p>
          {palavra}{" "}
        </span>
      ))}
    </p>
  );
}
