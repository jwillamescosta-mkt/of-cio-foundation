import { useState, type CSSProperties } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Home, Mic, Users, Wallet, type LucideIcon } from "lucide-react";
import { DemoComando } from "@/components/demo-comando";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type Destino = { titulo: string; url: string; icone: LucideIcon; coluna: number };

// A coluna 2 é o microfone
const destinos: Destino[] = [
  { titulo: "Hoje", url: "/dashboard", icone: Home, coluna: 0 },
  { titulo: "Agenda", url: "/agenda", icone: CalendarDays, coluna: 1 },
  { titulo: "Clientes", url: "/clientes", icone: Users, coluna: 3 },
  { titulo: "Dinheiro", url: "/dinheiro", icone: Wallet, coluna: 4 },
];

/**
 * Barra inferior do celular. O anel marca o item ativo e desliza até ele
 * (docs/design.md). O microfone fica no centro e é o maior alvo da barra.
 */
export function BottomNav() {
  const caminho = useRouterState({ select: (r) => r.location.pathname });
  const ativo = destinos.find((d) => caminho.startsWith(d.url));

  return (
    <nav
      aria-label="Navegação principal"
      className="pb-seguro fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background md:hidden"
    >
      <ul className="relative mx-auto grid h-[4.5rem] max-w-md grid-cols-5 items-stretch">
        <li
          aria-hidden
          className="anel-nav"
          style={{ "--pos": ativo?.coluna ?? 0, opacity: ativo ? 1 : 0 } as CSSProperties}
        >
          <span className="h-1.5 w-1.5 rounded-full border-[1.5px] border-ring" />
        </li>
        {destinos.slice(0, 2).map((d) => (
          <ItemNav key={d.url} destino={d} ativo={d === ativo} />
        ))}
        <li className="flex items-center justify-center">
          <BotaoMicrofone />
        </li>
        {destinos.slice(2).map((d) => (
          <ItemNav key={d.url} destino={d} ativo={d === ativo} />
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
          "toque flex h-full flex-col items-center justify-center gap-1 pt-2.5 text-xs transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring " +
          (ativo ? "text-foreground" : "text-muted-foreground hover:text-foreground")
        }
      >
        <Icone className="h-5 w-5" strokeWidth={1.5} />
        <span className={ativo ? "font-medium" : undefined}>{destino.titulo}</span>
      </Link>
    </li>
  );
}

function BotaoMicrofone() {
  const [aberto, setAberto] = useState(false);

  return (
    <Drawer open={aberto} onOpenChange={setAberto}>
      <DrawerTrigger asChild>
        <button
          type="button"
          aria-label="Falar um comando"
          className="toque flex h-14 w-14 items-center justify-center bg-primary text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Mic className="h-6 w-6" strokeWidth={1.5} />
        </button>
      </DrawerTrigger>
      <DrawerContent className="folha-comando max-h-[92svh] border-x-0 border-b-0">
        <div className="overflow-y-auto">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-xl font-medium">Comando por voz</DrawerTitle>
            <DrawerDescription className="text-base">
              Ainda em construção. Veja como vai funcionar: você fala, confere os cartões e confirma.
            </DrawerDescription>
          </DrawerHeader>
          {/* Só monta quando abre, para a demonstração começar do início */}
          {aberto && <DemoComando className="pb-seguro" />}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
