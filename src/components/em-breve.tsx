import type { LucideIcon } from "lucide-react";

/** Tela de módulo que ainda não foi construído. Diz o que vai existir ali, sem prometer data. */
export function EmBreve({
  icone: Icone,
  titulo,
  texto,
  itens,
}: {
  icone: LucideIcon;
  titulo: string;
  texto: string;
  itens: string[];
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <Icone className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
        <h2 className="text-2xl font-medium tracking-tight text-foreground md:text-[28px]">
          {titulo}
        </h2>
        <p className="text-base text-muted-foreground">{texto}</p>
      </div>
      <div className="bg-card p-5">
        <p className="text-sm text-muted-foreground">O que vai ficar aqui</p>
        <ul className="mt-3 space-y-2">
          {itens.map((item) => (
            <li key={item} className="flex gap-3 text-base text-foreground">
              <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
