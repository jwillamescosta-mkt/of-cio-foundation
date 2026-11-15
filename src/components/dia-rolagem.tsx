import { useRef, useState } from "react";
import { useProgressoRolagem } from "@/hooks/use-progresso-rolagem";

type Momento = {
  hora: string;
  titulo: string;
  texto: string;
  linhas: { a: string; b: string; status?: "success" | "warning" | "destructive" }[];
};

const momentos: Momento[] = [
  {
    hora: "07h40",
    titulo: "A rota do dia já está pronta",
    texto: "As visitas aparecem na ordem do caminho. Um toque abre no Google Maps ou no Waze.",
    linhas: [
      { a: "08h30  Marta, Farol", b: "Limpeza de 2 splits" },
      { a: "10h30  Clínica, Jatiúca", b: "Visita técnica" },
      { a: "14h00  Ana, Ponta Verde", b: "Manutenção" },
    ],
  },
  {
    hora: "10h50",
    titulo: "O orçamento sai antes de você ir embora",
    texto: "Você fala os itens, o Ofício puxa os preços do seu catálogo e monta o PDF com a sua marca.",
    linhas: [
      { a: "Instalação de split", b: "R$ 450,00" },
      { a: "Tubulação, 3 m", b: "R$ 120,00" },
      { a: "Total", b: "R$ 570,00" },
    ],
  },
  {
    hora: "15h10",
    titulo: "Serviço feito, recibo enviado",
    texto: "Ao terminar, o recibo já está pronto com os dados do cliente e vai pelo WhatsApp.",
    linhas: [
      { a: "Recibo para Ana", b: "R$ 200,00", status: "success" },
      { a: "Forma de pagamento", b: "Pix" },
      { a: "Enviado", b: "WhatsApp" },
    ],
  },
  {
    hora: "18h00",
    titulo: "Ninguém fica sem ser cobrado",
    texto: "O que vence hoje e o que atrasou aparecem na frente, com a mensagem de cobrança pronta.",
    linhas: [
      { a: "Clínica", b: "R$ 150,00, vence hoje", status: "warning" },
      { a: "Carlos", b: "R$ 320,00, 5 dias", status: "destructive" },
      { a: "Marta", b: "R$ 300,00, pago", status: "success" },
    ],
  },
  {
    hora: "Em 6 meses",
    titulo: "O cliente volta sem você lembrar",
    texto: "Quando a última manutenção fica antiga, o Ofício avisa e sugere a mensagem de retorno.",
    linhas: [
      { a: "Marta, Farol", b: "Última limpeza há 6 meses" },
      { a: "Sugestão", b: "Oferecer nova limpeza" },
    ],
  },
];

const corStatus = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
} as const;

/**
 * Um dia de trabalho contado na rolagem: a seção fica presa na tela e o anel
 * anda pela linha do tempo enquanto os momentos se revezam.
 */
export function DiaRolagem() {
  const ref = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState(0);
  const [progresso, setProgresso] = useState(0);

  useProgressoRolagem(
    ref,
    (p) => {
      setProgresso(p);
      setAtivo(Math.min(momentos.length - 1, Math.floor(p * momentos.length)));
    },
    { inicio: 0, fim: 1 },
  );

  return (
    <div ref={ref} style={{ height: `${momentos.length * 70}vh` }} className="relative">
      <div className="sticky top-0 flex h-[100svh] items-center">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 md:grid-cols-[220px_minmax(0,1fr)] md:gap-16 md:px-6">
          {/* Linha do tempo */}
          <div>
            <p className="text-sm text-muted-foreground">Um dia com o Ofício</p>
            <ol className="relative mt-4 flex justify-between md:mt-8 md:block md:space-y-8">
              <span
                aria-hidden
                className="absolute left-0 right-0 top-[5px] h-px bg-border md:bottom-2 md:left-[5px] md:right-auto md:top-2 md:h-auto md:w-px"
              />
              <span
                aria-hidden
                className="trilho-dia absolute left-0 top-[5px] h-px w-full origin-left bg-foreground md:left-[5px] md:top-2 md:h-[calc(100%-1rem)] md:w-px md:origin-top"
                style={{ "--p": progresso } as React.CSSProperties}
              />
              {momentos.map((m, i) => (
                <li key={m.hora} className="relative flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                  <span
                    aria-hidden
                    className={
                      "ponto-dia relative z-[1] block h-[11px] w-[11px] rounded-full " +
                      (i === ativo
                        ? "border-2 border-ring bg-background scale-[1.35]"
                        : i < ativo
                          ? "bg-foreground"
                          : "bg-border")
                    }
                  />
                  <span
                    className={
                      "hidden text-sm tabular-nums transition-colors duration-[400ms] md:block " +
                      (i === ativo ? "font-medium text-foreground" : "text-muted-foreground")
                    }
                  >
                    {m.hora}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Momentos, um por vez */}
          <div className="relative min-h-[23rem] md:min-h-[24rem]">
            {momentos.map((m, i) => (
              <article
                key={m.hora}
                aria-hidden={i !== ativo}
                className={
                  "momento-dia absolute inset-0 " +
                  (i === ativo ? "ativo" : i < ativo ? "passou" : "")
                }
              >
                <p className="text-base tabular-nums text-muted-foreground md:hidden">{m.hora}</p>
                <h3 className="mt-1 max-w-xl text-[28px] font-medium leading-[1.1] tracking-[-0.02em] text-foreground text-balance md:text-[44px]">
                  {m.titulo}
                </h3>
                <p className="mt-3 max-w-xl text-base text-muted-foreground md:text-lg">{m.texto}</p>
                <ul className="mt-6 max-w-xl bg-card">
                  {m.linhas.map((l) => (
                    <li
                      key={l.a}
                      className="flex items-center justify-between gap-4 border-b border-background px-4 py-3 text-sm last:border-b-0 md:text-base"
                    >
                      <span className="flex min-w-0 items-center gap-2 whitespace-pre text-foreground">
                        {l.status && (
                          <span aria-hidden className={"h-2 w-2 shrink-0 rounded-full " + corStatus[l.status]} />
                        )}
                        <span className="truncate tabular-nums">{l.a}</span>
                      </span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">{l.b}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
