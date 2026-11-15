import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { aplicarTema, lerTema, type Tema } from "@/lib/theme";

export function ThemeToggle() {
  const [tema, setTema] = useState<Tema>("escuro");

  useEffect(() => {
    setTema(lerTema());
  }, []);

  function alternar() {
    const proximo: Tema = tema === "claro" ? "escuro" : "claro";
    aplicarTema(proximo);
    setTema(proximo);
  }

  const rotulo = tema === "claro" ? "Usar tema escuro" : "Usar tema claro, para sol forte";

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={rotulo}
      title={rotulo}
      className="inline-flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:h-9 md:w-9"
    >
      {tema === "claro" ? (
        <Moon className="h-5 w-5" strokeWidth={1.5} />
      ) : (
        <Sun className="h-5 w-5" strokeWidth={1.5} />
      )}
    </button>
  );
}
