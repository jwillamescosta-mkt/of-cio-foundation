import { Moon, Sun } from "lucide-react";
import { useTema } from "@/hooks/use-tema";

export function ThemeToggle() {
  const { tema, alternar } = useTema();
  const rotulo = tema === "claro" ? "Usar tema escuro" : "Usar tema claro, para sol forte";

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={rotulo}
      title={rotulo}
      className="group inline-flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:h-9 md:w-9"
    >
      <span className="transition-transform duration-[400ms] ease-[cubic-bezier(.2,0,0,1)] group-hover:rotate-45 group-active:scale-90">
        {tema === "claro" ? (
          <Moon className="h-5 w-5" strokeWidth={1.5} />
        ) : (
          <Sun className="h-5 w-5" strokeWidth={1.5} />
        )}
      </span>
    </button>
  );
}
