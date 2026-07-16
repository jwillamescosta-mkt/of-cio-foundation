import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, FileText, Receipt, Calculator, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <span className="font-mono text-sm font-semibold text-primary-foreground">O</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">Ofício</span>
          </div>
          <Link
            to="/auth"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-primary">
            Para profissionais autônomos e liberais
          </p>
          <h1 className="text-5xl font-semibold leading-tight tracking-tight text-foreground">
            Recibos, contratos e precificação — sem contador, sem planilha.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            O Ofício substitui o Word, o Excel e a dor de cabeça administrativa.
            Documentos com cara de empresa, cálculos que fecham, tudo em um lugar.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              to="/auth"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Criar conta grátis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/auth"
              className="inline-flex h-11 items-center rounded-md border border-border bg-transparent px-5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Já tenho conta
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Receipt, title: "Recibos com IA", desc: "Descreve o serviço, a IA formaliza." },
            { icon: FileText, title: "Contratos", desc: "Templates editáveis por instrução." },
            { icon: Calculator, title: "Precificação", desc: "Valor/hora baseado em custos reais." },
            { icon: Wallet, title: "Despesas", desc: "Lançamento e lucro do mês." },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border border-border bg-card p-5">
              <f.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
              <h3 className="mt-4 text-sm font-medium text-foreground">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
