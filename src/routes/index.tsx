import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { CalendarDays, Mic, Receipt, Users } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ofício — o app de bolso do prestador de serviço" },
      {
        name: "description",
        content:
          "Agenda, clientes, orçamentos, recibos e cobranças num só lugar. Você fala e o Ofício organiza.",
      },
      { property: "og:title", content: "Ofício — o app de bolso do prestador de serviço" },
      {
        property: "og:description",
        content: "Agenda, clientes, orçamentos, recibos e cobranças num só lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: Landing,
});

const recursos = [
  {
    icone: Mic,
    titulo: "Você fala, ele organiza",
    texto: "Uma frase vira cliente, visita e cobrança. Você confere antes de salvar.",
  },
  {
    icone: CalendarDays,
    titulo: "Agenda e rota do dia",
    texto: "Visitas, orçamentos e manutenções periódicas, na ordem do caminho.",
  },
  {
    icone: Users,
    titulo: "Clientes em um lugar",
    texto: "Endereço, telefone e tudo o que já foi feito para cada um.",
  },
  {
    icone: Receipt,
    titulo: "Recibo e cobrança",
    texto: "Recibo pronto para o WhatsApp e aviso do que venceu.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <span className="text-lg font-medium tracking-tight">Ofício</span>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              to="/auth"
              className="inline-flex h-11 items-center px-3 text-base font-medium text-foreground underline decoration-1 underline-offset-4 hover:opacity-80 md:h-9 md:text-sm"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-24">
        <div className="max-w-2xl">
          <p className="mb-4 text-base text-muted-foreground">
            Para técnicos e prestadores de serviço
          </p>
          <h1 className="text-[40px] font-medium leading-[1.05] tracking-[-0.03em] text-foreground text-balance md:text-[64px]">
            Agenda, clientes e cobranças no bolso.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Você termina um serviço, fala o que fez e quanto cobrou. O Ofício anota o cliente, gera o
            recibo e avisa quando o pagamento atrasar.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              to="/auth"
              className="inline-flex h-12 items-center bg-primary px-6 text-base font-medium text-primary-foreground transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Criar conta grátis
            </Link>
            <Link
              to="/auth"
              className="text-base text-foreground underline decoration-1 underline-offset-4 hover:opacity-80"
            >
              Já tenho conta
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:mt-24">
          {recursos.map((r) => (
            <div key={r.titulo} className="bg-card p-5">
              <r.icone className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              <h3 className="mt-4 text-[17px] font-medium text-foreground">{r.titulo}</h3>
              <p className="mt-1 text-base text-muted-foreground">{r.texto}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
