import { useEffect, useRef, useState, type CSSProperties } from "react";
import { CalendarDays, Check, Mic, Receipt, Repeat, User, Wallet, type LucideIcon } from "lucide-react";

type Cartao = {
  icone: LucideIcon;
  rotulo: string;
  titulo: string;
  detalhe: string;
  status?: { texto: string; cor: "success" | "warning" };
};

type Exemplo = { nome: string; frase: string; cartoes: Cartao[] };

const exemplos: Exemplo[] = [
  {
    nome: "Fechar um serviço",
    frase:
      "Fechei com a Dona Marta do Farol, limpeza de dois splits terça às duas da tarde, trezentos reais no Pix.",
    cartoes: [
      { icone: User, rotulo: "Cliente", titulo: "Marta", detalhe: "Bairro Farol" },
      {
        icone: CalendarDays,
        rotulo: "Agenda",
        titulo: "Terça, 14h",
        detalhe: "Limpeza de 2 splits",
      },
      {
        icone: Wallet,
        rotulo: "A receber",
        titulo: "R$ 300,00",
        detalhe: "Pix, no dia do serviço",
        status: { texto: "Pendente", cor: "warning" },
      },
    ],
  },
  {
    nome: "Receber",
    frase: "Terminei na clínica, recebi cento e cinquenta e ficam cento e cinquenta para sexta.",
    cartoes: [
      { icone: Check, rotulo: "Serviço", titulo: "Clínica", detalhe: "Concluído hoje" },
      {
        icone: Receipt,
        rotulo: "Recibo",
        titulo: "R$ 150,00",
        detalhe: "Pronto para o WhatsApp",
        status: { texto: "Pago", cor: "success" },
      },
      {
        icone: Wallet,
        rotulo: "A receber",
        titulo: "R$ 150,00",
        detalhe: "Vence na sexta",
        status: { texto: "Pendente", cor: "warning" },
      },
    ],
  },
  {
    nome: "Criar uma rotina",
    frase: "Manutenção na casa da Ana a cada seis meses, começando em março.",
    cartoes: [
      { icone: User, rotulo: "Cliente", titulo: "Ana", detalhe: "Residência" },
      {
        icone: Repeat,
        rotulo: "Rotina",
        titulo: "A cada 6 meses",
        detalhe: "Manutenção, a partir de março",
      },
      {
        icone: CalendarDays,
        rotulo: "Lembrete",
        titulo: "Uma semana antes",
        detalhe: "Aviso para confirmar o horário",
      },
    ],
  },
];

type Fase = "parado" | "ouvindo" | "pronto" | "confirmado";

const reduzirMovimento = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Exemplo do comando por voz: a frase aparece como se fosse falada e vira
 * cartões para conferir. É uma demonstração: nada é gravado.
 */
export function DemoComando({ className = "" }: { className?: string }) {
  const [indice, setIndice] = useState(0);
  const [letras, setLetras] = useState(0);
  const [fase, setFase] = useState<Fase>("parado");
  const raiz = useRef<HTMLDivElement>(null);
  const exemplo = exemplos[indice];

  // Começa quando o bloco entra na tela
  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setFase("ouvindo");
      return;
    }
    const obs = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setFase((f) => (f === "parado" ? "ouvindo" : f));
          obs.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // "Fala" a frase letra por letra
  useEffect(() => {
    if (fase !== "ouvindo") return;
    if (reduzirMovimento()) {
      setLetras(exemplo.frase.length);
      setFase("pronto");
      return;
    }
    if (letras >= exemplo.frase.length) {
      const t = setTimeout(() => setFase("pronto"), 450);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setLetras((n) => n + 1), 26);
    return () => clearTimeout(t);
  }, [fase, letras, exemplo.frase.length]);

  // Depois de confirmar, passa para o próximo exemplo
  useEffect(() => {
    if (fase !== "confirmado") return;
    const t = setTimeout(() => escolher((indice + 1) % exemplos.length), 1800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, indice]);

  function escolher(i: number) {
    setIndice(i);
    setLetras(0);
    setFase("ouvindo");
  }

  const ouvindo = fase === "ouvindo";
  const pronto = fase === "pronto" || fase === "confirmado";

  return (
    <div ref={raiz} className={"bg-card " + className}>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-border px-5 py-3">
        <span className="text-sm text-muted-foreground">Exemplo</span>
        <div role="tablist" aria-label="Exemplos de comando" className="flex flex-wrap gap-x-5">
          {exemplos.map((e, i) => (
            <button
              key={e.nome}
              role="tab"
              type="button"
              aria-selected={i === indice}
              onClick={() => escolher(i)}
              className={
                "aba-demo h-11 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:h-9 " +
                (i === indice
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {e.nome}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-10 md:p-8">
        <div>
          <div className="flex items-center gap-4">
            <span
              className="anel-pulso flex h-12 w-12 shrink-0 items-center justify-center bg-primary text-primary-foreground"
              data-ouvindo={ouvindo}
            >
              <Mic className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <span className="onda" data-ouvindo={ouvindo} aria-hidden>
              {Array.from({ length: 9 }, (_, i) => (
                <i key={i} style={{ "--i": i } as CSSProperties} />
              ))}
            </span>
            <span className="text-sm text-muted-foreground" aria-live="polite">
              {ouvindo ? "Ouvindo" : fase === "confirmado" ? "Salvo" : pronto ? "Confira" : ""}
            </span>
          </div>
          <p className="mt-5 min-h-[4.5em] text-xl leading-snug text-foreground md:text-2xl md:leading-snug">
            {exemplo.frase.slice(0, letras)}
            {ouvindo && <span className="cursor" aria-hidden />}
          </p>
        </div>

        <div data-pronto={pronto}>
          <ul className="space-y-2">
            {exemplo.cartoes.map((c, i) => (
              <li
                key={exemplo.nome + c.rotulo}
                className="cartao-demo flex items-center gap-4 bg-background px-4 py-3"
                style={{ "--i": i } as CSSProperties}
              >
                <c.icone className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-muted-foreground">{c.rotulo}</div>
                  <div className="truncate text-base font-medium tabular-nums text-foreground">
                    {c.titulo}
                  </div>
                  <div className="truncate text-sm text-muted-foreground">{c.detalhe}</div>
                </div>
                {c.status && (
                  <span className="flex shrink-0 items-center gap-2 text-sm text-foreground">
                    <span
                      aria-hidden
                      className={
                        "h-2 w-2 rounded-full " +
                        (c.status.cor === "success" ? "bg-success" : "bg-warning")
                      }
                    />
                    {c.status.texto}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div
            className="cartao-demo mt-4 flex items-center gap-5"
            style={{ "--i": exemplo.cartoes.length } as CSSProperties}
          >
            <button
              type="button"
              disabled={!pronto || fase === "confirmado"}
              onClick={() => setFase("confirmado")}
              className="botao-vivo inline-flex h-11 items-center gap-2 bg-primary px-5 text-base font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none md:h-10 md:text-sm"
            >
              {fase === "confirmado" && <Check className="h-4 w-4" strokeWidth={1.5} />}
              {fase === "confirmado" ? "Confirmado" : "Confirmar"}
            </button>
            <span className="text-sm text-muted-foreground">
              Nada é salvo sem você conferir.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
