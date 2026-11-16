import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { CalendarDays, Mic, Receipt, Users } from "lucide-react";
import { DemoComando } from "@/components/demo-comando";
import { DiaRolagem } from "@/components/dia-rolagem";
import { FraseRolagem } from "@/components/frase-rolagem";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRevelar } from "@/hooks/use-revelar";
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

const i = (n: number) => ({ "--i": n }) as CSSProperties;

function Landing() {
  useRevelar();

  return (
    <div className="min-h-screen bg-background">
      <div className="progresso-rolagem" aria-hidden />

      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 md:px-6">
          <span className="text-lg font-medium tracking-tight">Ofício</span>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              to="/auth"
              className="inline-flex h-11 items-center px-3 text-base font-medium text-foreground md:h-9 md:text-sm"
            >
              <span className="link-vivo">Entrar</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Abertura */}
        <section className="mx-auto max-w-6xl px-4 pb-14 pt-14 md:px-6 md:pb-20 md:pt-24">
          <p className="entrar text-base text-muted-foreground" style={i(0)}>
            Para técnicos e prestadores de serviço
          </p>
          <h1 className="mt-4 max-w-4xl text-[44px] font-medium leading-[1.02] tracking-[-0.035em] text-foreground md:text-[88px]">
            <span className="linha-titulo">
              <span style={i(1)}>Você fala.</span>
            </span>
            <span className="linha-titulo">
              <span style={i(2)}>O Ofício organiza.</span>
            </span>
          </h1>
          <p className="entrar mt-6 max-w-xl text-lg text-muted-foreground md:text-xl" style={i(5)}>
            Agenda, clientes, orçamentos, recibos e cobranças no bolso. Você termina um serviço, diz o
            que fez e quanto cobrou. O resto fica anotado.
          </p>
          <div className="entrar mt-8 flex flex-wrap items-center gap-6" style={i(6)}>
            <Link
              to="/auth"
              className="botao-vivo inline-flex h-12 items-center bg-primary px-6 text-base font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Criar conta grátis
            </Link>
            <Link to="/auth" className="text-base text-foreground">
              <span className="link-vivo">Já tenho conta</span>
            </Link>
          </div>

          <DemoComando className="entrar mt-14 md:mt-20" />
        </section>

        {/* Frase que acende na rolagem */}
        <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-36">
          <FraseRolagem
            className="max-w-5xl text-[32px] font-medium leading-[1.12] tracking-[-0.03em] text-foreground md:text-[64px]"
            texto="Seu trabalho é na casa do cliente, não na planilha. O que você anota de cabeça, no papel e no WhatsApp cabe em uma frase dita no caminho para o próximo serviço."
          />
        </section>

        {/* Um dia de trabalho, contado na rolagem */}
        <section className="border-y border-border">
          <DiaRolagem />
        </section>

        {/* O que tem dentro */}
        <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-32">
          <h2
            data-revelar
            className="max-w-2xl text-[32px] font-medium leading-[1.08] tracking-[-0.03em] text-foreground text-balance md:text-[48px]"
          >
            Quatro ferramentas que conversam entre si.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recursos.map((r, n) => (
              <div key={r.titulo} data-revelar style={i(n)} className="bloco-vivo bg-card p-6">
                <r.icone className="bloco-icone h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
                <h3 className="mt-8 text-[19px] font-medium text-foreground">{r.titulo}</h3>
                <p className="mt-2 text-base text-muted-foreground">{r.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Chamada final */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-32">
            <h2
              data-revelar
              className="max-w-3xl text-[40px] font-medium leading-[1.04] tracking-[-0.035em] text-foreground text-balance md:text-[72px]"
            >
              Comece pelo próximo serviço.
            </h2>
            <p data-revelar style={i(1)} className="mt-5 max-w-xl text-lg text-muted-foreground">
              Crie a conta, preencha os dados da sua empresa e anote o primeiro cliente.
            </p>
            <div data-revelar style={i(2)} className="mt-8">
              <Link
                to="/auth"
                className="botao-vivo inline-flex h-12 items-center bg-primary px-6 text-base font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Criar conta grátis
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-sm text-muted-foreground md:px-6">
          <span>Ofício</span>
          <span>Feito para quem trabalha na rua</span>
        </div>
      </footer>
    </div>
  );
}
