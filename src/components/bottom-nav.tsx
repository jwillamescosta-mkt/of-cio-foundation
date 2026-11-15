import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Home, Mic, Users, Wallet, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

type Destino = { titulo: string; url: string; icone: LucideIcon };

const esquerda: Destino[] = [
  { titulo: "Hoje", url: "/dashboard", icone: Home },
  { titulo: "Agenda", url: "/agenda", icone: CalendarDays },
];

const direita: Destino[] = [
  { titulo: "Clientes", url: "/clientes", icone: Users },
  { titulo: "Dinheiro", url: "/dinheiro", icone: Wallet },
];

/**
 * Barra inferior do celular. O item ativo é marcado pelo anel (docs/design.md).
 * O microfone fica no centro e é o maior alvo da barra.
 */
export function BottomNav() {
  const caminho = useRouterState({ select: (r) => r.location.pathname });

  return (
    <nav
      aria-label="Navegação principal"
      className="pb-seguro fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background md:hidden"
    >
      <ul className="mx-auto grid h-[4.5rem] max-w-md grid-cols-5 items-stretch">
        {esquerda.map((d) => (
          <ItemNav key={d.url} destino={d} ativo={caminho.startsWith(d.url)} />
        ))}
        <li className="flex items-center justify-center">
          <BotaoMicrofone />
        </li>
        {direita.map((d) => (
          <ItemNav key={d.url} destino={d} ativo={caminho.startsWith(d.url)} />
        ))}
      </ul>
    </nav>
  );
}

function ItemNav({ destino, ativo }: { destino: Destino; ativo: boolean }) {
  const Icone = destino.icone;
  return (
    <li>
      <Link
        to={destino.url}
        aria-current={ativo ? "page" : undefined}
        className={
          "flex h-full flex-col items-center justify-center gap-1 text-xs transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring " +
          (ativo ? "text-foreground" : "text-muted-foreground hover:text-foreground")
        }
      >
        {/* O anel: só o item ativo tem; os outros guardam o espaço para nada pular */}
        <span
          aria-hidden
          className={
            "h-1.5 w-1.5 rounded-full " + (ativo ? "border-[1.5px] border-ring" : "border-0")
          }
        />
        <Icone className="h-5 w-5" strokeWidth={1.5} />
        <span className={ativo ? "font-medium" : undefined}>{destino.titulo}</span>
      </Link>
    </li>
  );
}

function BotaoMicrofone() {
  return (
    <button
      type="button"
      aria-label="Falar um comando"
      onClick={() =>
        toast("Comando por voz", {
          description: "Chega na próxima etapa. Por enquanto, use as telas.",
        })
      }
      className="flex h-14 w-14 items-center justify-center bg-primary text-primary-foreground transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <Mic className="h-6 w-6" strokeWidth={1.5} />
    </button>
  );
}
