import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

const cards = [
  { label: "Receita do mês", hint: "Recibos emitidos e pagos" },
  { label: "Despesas do mês", hint: "Custos lançados" },
  { label: "Recibos emitidos", hint: "Total no período" },
  { label: "Contratos ativos", hint: "Vigentes hoje" },
];

function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão geral do seu ofício. Comece configurando seu{" "}
          <span className="text-foreground">Perfil Profissional</span> em Configurações.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-card p-5">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {c.label}
            </div>
            <div className="mt-3 font-mono text-2xl font-medium text-foreground tabular-nums">
              —
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{c.hint}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Os módulos de <span className="text-foreground">Recibos</span>,{" "}
          <span className="text-foreground">Contratos</span>,{" "}
          <span className="text-foreground">Calculadora</span> e{" "}
          <span className="text-foreground">Despesas</span> chegam em breve.
        </p>
      </div>
    </div>
  );
}
