import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Hoje — Ofício" },
      {
        name: "description",
        content: "Visitas do dia, o que você tem a receber e o que está atrasado.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HojePage,
});

// Os números chegam com os módulos de agenda e cobrança. Por enquanto, o traço indica "ainda sem dados".
const resumo = [
  { rotulo: "Visitas hoje", dica: "Agendadas para hoje", status: null },
  { rotulo: "A receber", dica: "Contas em aberto", status: null },
  { rotulo: "Atrasado", dica: "Vencidas e não pagas", status: "destructive" as const },
];

function HojePage() {
  const hoje = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground first-letter:uppercase">{hoje}</p>
        <h2 className="mt-1 text-2xl font-medium tracking-tight text-foreground md:text-[28px]">
          Seu dia
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {resumo.map((c) => (
          <div key={c.rotulo} className="bg-card p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {c.status === "destructive" && (
                <span aria-hidden className="h-2 w-2 rounded-full bg-destructive" />
              )}
              {c.rotulo}
            </div>
            <div className="mt-3 text-[28px] font-medium leading-none tabular-nums text-foreground">
              —
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{c.dica}</div>
          </div>
        ))}
      </div>

      <div className="bg-card p-5">
        <h3 className="text-[17px] font-medium text-foreground">Primeiro passo</h3>
        <p className="mt-1 text-base text-muted-foreground">
          Preencha os dados da sua empresa. Eles entram sozinhos em orçamentos e recibos.
        </p>
        <Link
          to="/settings"
          className="mt-4 inline-flex h-11 items-center bg-primary px-5 text-base font-medium text-primary-foreground transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:h-9 md:px-4 md:text-sm"
        >
          Preencher dados da empresa
        </Link>
      </div>
    </div>
  );
}
