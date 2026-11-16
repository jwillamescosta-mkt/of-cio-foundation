import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, MapPin, MessageCircle, Phone, Plus, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { excluirCliente, listarClientes, salvarCliente } from "@/lib/clientes.functions";
import { buscarCep, linkMapa, linkWhatsApp } from "@/lib/cep";
import { maskCEP, maskPhone, onlyDigits } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Ofício" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClientesPage,
});

type Cliente = Awaited<ReturnType<typeof listarClientes>>[number];

type Formulario = {
  id?: string;
  name: string;
  phone: string;
  email: string;
  address_zip: string;
  address_street: string;
  address_number: string;
  address_complement: string;
  address_district: string;
  address_city: string;
  address_state: string;
  notes: string;
};

const vazio: Formulario = {
  name: "",
  phone: "",
  email: "",
  address_zip: "",
  address_street: "",
  address_number: "",
  address_complement: "",
  address_district: "",
  address_city: "",
  address_state: "",
  notes: "",
};

const doCliente = (c: Cliente): Formulario => ({
  id: c.id,
  name: c.name,
  phone: c.phone ?? "",
  email: c.email ?? "",
  address_zip: c.address_zip ?? "",
  address_street: c.address_street ?? "",
  address_number: c.address_number ?? "",
  address_complement: c.address_complement ?? "",
  address_district: c.address_district ?? "",
  address_city: c.address_city ?? "",
  address_state: c.address_state ?? "",
  notes: c.notes ?? "",
});

const lugar = (c: { address_district?: string | null; address_city?: string | null }) =>
  [c.address_district, c.address_city].filter(Boolean).join(", ");

function useAtrasado<T>(valor: T, ms: number) {
  const [atrasado, setAtrasado] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setAtrasado(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return atrasado;
}

function ClientesPage() {
  const listar = useServerFn(listarClientes);
  const [busca, setBusca] = useState("");
  const buscaAtrasada = useAtrasado(busca.trim(), 250);
  const [aberto, setAberto] = useState<Formulario | null>(null);

  const { data: clientes, isLoading, isError, error } = useQuery({
    queryKey: ["clientes", buscaAtrasada],
    queryFn: () => listar({ data: { busca: buscaAtrasada || undefined } }),
    placeholderData: (anterior) => anterior,
  });

  const total = clientes?.length ?? 0;
  const semNenhum = !isLoading && !buscaAtrasada && total === 0;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-foreground md:text-[28px]">
            Clientes
          </h2>
          <p className="mt-1 text-sm tabular-nums text-muted-foreground">
            {isLoading
              ? "Carregando"
              : buscaAtrasada
                ? `${total} ${total === 1 ? "encontrado" : "encontrados"}`
                : `${total} ${total === 1 ? "cliente" : "clientes"}`}
          </p>
        </div>
        <Button onClick={() => setAberto({ ...vazio })} className="botao-vivo">
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Novo cliente
        </Button>
      </div>

      {!semNenhum && (
        <label className="flex h-11 items-center gap-3 bg-card px-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring md:h-10">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
          <span className="sr-only">Buscar cliente</span>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Nome, bairro, cidade ou telefone"
            className="h-full w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
      )}

      {isError && (
        <p className="bg-card p-4 text-sm text-destructive">
          Não foi possível carregar os clientes. {error instanceof Error ? error.message : ""}
        </p>
      )}

      {isLoading && (
        <ul className="space-y-1" aria-hidden>
          {[0, 1, 2, 3].map((n) => (
            <li key={n} className="h-[72px] animate-pulse bg-card" />
          ))}
        </ul>
      )}

      {semNenhum && (
        <div className="entrar bg-card p-6">
          <Users className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
          <h3 className="mt-4 text-[17px] font-medium text-foreground">Nenhum cliente ainda</h3>
          <p className="mt-1 max-w-md text-base text-muted-foreground">
            Cadastre o primeiro com nome e telefone. Endereço e observações podem vir depois.
          </p>
          <Button onClick={() => setAberto({ ...vazio })} className="botao-vivo mt-5">
            Cadastrar cliente
          </Button>
        </div>
      )}

      {!isLoading && buscaAtrasada && total === 0 && (
        <p className="bg-card p-4 text-base text-muted-foreground">
          Nenhum cliente encontrado para “{buscaAtrasada}”.
        </p>
      )}

      {!isLoading && total > 0 && (
        <ul className="space-y-1">
          {clientes!.map((c, i) => (
            <li
              key={c.id}
              className="entrar flex items-stretch bg-card"
              style={{ "--i": Math.min(i, 8) } as CSSProperties}
            >
              <button
                type="button"
                onClick={() => setAberto(doCliente(c))}
                className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3 text-left transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                <span className="truncate text-base font-medium text-foreground">{c.name}</span>
                <span className="truncate text-sm text-muted-foreground">
                  {lugar(c) || (c.phone ? maskPhone(c.phone) : "Sem endereço")}
                </span>
              </button>
              {c.phone && (
                <div className="flex shrink-0 items-center pr-1">
                  <a
                    href={linkWhatsApp(c.phone)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`WhatsApp de ${c.name}`}
                    className="toque flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
                  </a>
                  <a
                    href={`tel:${c.phone}`}
                    aria-label={`Ligar para ${c.name}`}
                    className="toque flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Phone className="h-5 w-5" strokeWidth={1.5} />
                  </a>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <FichaCliente inicial={aberto} aoFechar={() => setAberto(null)} />
    </div>
  );
}

function FichaCliente({
  inicial,
  aoFechar,
}: {
  inicial: Formulario | null;
  aoFechar: () => void;
}) {
  const celular = useIsMobile();
  const qc = useQueryClient();
  const salvar = useServerFn(salvarCliente);
  const excluir = useServerFn(excluirCliente);
  const [form, setForm] = useState<Formulario>(vazio);
  const [erros, setErros] = useState<Partial<Record<keyof Formulario, string>>>({});
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  useEffect(() => {
    if (inicial) {
      setForm(inicial);
      setErros({});
    }
  }, [inicial]);

  const editando = Boolean(form.id);
  const aberto = inicial !== null;

  const mutacaoSalvar = useMutation({
    mutationFn: (f: Formulario) => salvar({ data: f }),
    onSuccess: () => {
      toast.success(editando ? "Cliente atualizado" : "Cliente cadastrado");
      qc.invalidateQueries({ queryKey: ["clientes"] });
      aoFechar();
    },
    onError: (e: unknown) =>
      toast.error("Não foi possível salvar", {
        description: e instanceof Error ? e.message : undefined,
      }),
  });

  const mutacaoExcluir = useMutation({
    mutationFn: (id: string) => excluir({ data: { id } }),
    onSuccess: () => {
      toast.success("Cliente excluído");
      qc.invalidateQueries({ queryKey: ["clientes"] });
      setConfirmarExclusao(false);
      aoFechar();
    },
    onError: (e: unknown) =>
      toast.error("Não foi possível excluir", {
        description: e instanceof Error ? e.message : undefined,
      }),
  });

  function set<K extends keyof Formulario>(chave: K, valor: Formulario[K]) {
    setForm((f) => ({ ...f, [chave]: valor }));
    setErros((e) => (e[chave] ? { ...e, [chave]: undefined } : e));
  }

  async function aoMudarCep(valor: string) {
    set("address_zip", valor);
    if (onlyDigits(valor).length !== 8) return;
    setBuscandoCep(true);
    const endereco = await buscarCep(valor);
    setBuscandoCep(false);
    if (!endereco) return;
    setForm((f) => ({
      ...f,
      address_street: f.address_street || endereco.address_street,
      address_district: f.address_district || endereco.address_district,
      address_city: f.address_city || endereco.address_city,
      address_state: f.address_state || endereco.address_state,
    }));
  }

  function validar(f: Formulario) {
    const e: Partial<Record<keyof Formulario, string>> = {};
    if (!f.name.trim()) e.name = "Informe o nome.";
    const tel = onlyDigits(f.phone);
    if (tel && (tel.length < 10 || tel.length > 11)) e.phone = "Use DDD e número.";
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "E-mail inválido.";
    const cep = onlyDigits(f.address_zip);
    if (cep && cep.length !== 8) e.address_zip = "CEP com 8 dígitos.";
    return e;
  }

  function aoSalvar(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validar(form);
    setErros(e);
    if (Object.keys(e).length) return;
    mutacaoSalvar.mutate(form);
  }

  const enderecoCompleto = useMemo(
    () =>
      [
        [form.address_street, form.address_number].filter(Boolean).join(", "),
        form.address_district,
        form.address_city,
        form.address_state,
      ].filter(Boolean),
    [form],
  );

  return (
    <>
      <Sheet open={aberto} onOpenChange={(v) => !v && aoFechar()}>
        <SheetContent
          side={celular ? "bottom" : "right"}
          className={
            "flex flex-col gap-0 p-0 " +
            (celular ? "max-h-[92svh]" : "w-full sm:max-w-md")
          }
        >
          <SheetHeader className="border-b border-border px-5 py-4 text-left">
            <SheetTitle className="text-xl font-medium">
              {editando ? form.name || "Cliente" : "Novo cliente"}
            </SheetTitle>
            <SheetDescription className="text-sm">
              {editando ? "Confira ou altere os dados." : "Nome e telefone bastam para começar."}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={aoSalvar} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              {editando && (form.phone || enderecoCompleto.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {form.phone && (
                    <Button asChild variant="outline" size="sm">
                      <a href={linkWhatsApp(form.phone)} target="_blank" rel="noreferrer">
                        <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                        WhatsApp
                      </a>
                    </Button>
                  )}
                  {form.phone && (
                    <Button asChild variant="outline" size="sm">
                      <a href={`tel:${onlyDigits(form.phone)}`}>
                        <Phone className="h-4 w-4" strokeWidth={1.5} />
                        Ligar
                      </a>
                    </Button>
                  )}
                  {enderecoCompleto.length > 0 && (
                    <Button asChild variant="outline" size="sm">
                      <a href={linkMapa(enderecoCompleto)} target="_blank" rel="noreferrer">
                        <MapPin className="h-4 w-4" strokeWidth={1.5} />
                        Mapa
                      </a>
                    </Button>
                  )}
                </div>
              )}

              <Campo rotulo="Nome" erro={erros.name}>
                <Input
                  autoFocus={!editando}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Como você chama o cliente"
                  autoComplete="off"
                />
              </Campo>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Campo rotulo="Telefone" erro={erros.phone}>
                  <Input
                    inputMode="tel"
                    className="tabular-nums"
                    value={maskPhone(form.phone)}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="(82) 99999-0000"
                  />
                </Campo>
                <Campo rotulo="E-mail" erro={erros.email}>
                  <Input
                    type="email"
                    inputMode="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </Campo>
              </div>

              <fieldset className="space-y-5">
                <legend className="text-[17px] font-medium text-foreground">Endereço</legend>
                <div className="grid grid-cols-3 gap-3">
                  <Campo rotulo="CEP" erro={erros.address_zip} className="col-span-3 sm:col-span-1">
                    <div className="relative">
                      <Input
                        inputMode="numeric"
                        className="tabular-nums"
                        value={maskCEP(form.address_zip)}
                        onChange={(e) => aoMudarCep(e.target.value)}
                        placeholder="00000-000"
                      />
                      {buscandoCep && (
                        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </Campo>
                  <Campo rotulo="Rua" className="col-span-3 sm:col-span-2">
                    <Input
                      value={form.address_street}
                      onChange={(e) => set("address_street", e.target.value)}
                    />
                  </Campo>
                  <Campo rotulo="Número">
                    <Input
                      className="tabular-nums"
                      value={form.address_number}
                      onChange={(e) => set("address_number", e.target.value)}
                    />
                  </Campo>
                  <Campo rotulo="Complemento" className="col-span-2">
                    <Input
                      value={form.address_complement}
                      onChange={(e) => set("address_complement", e.target.value)}
                    />
                  </Campo>
                  <Campo rotulo="Bairro" className="col-span-3 sm:col-span-1">
                    <Input
                      value={form.address_district}
                      onChange={(e) => set("address_district", e.target.value)}
                    />
                  </Campo>
                  <Campo rotulo="Cidade" className="col-span-2 sm:col-span-1">
                    <Input
                      value={form.address_city}
                      onChange={(e) => set("address_city", e.target.value)}
                    />
                  </Campo>
                  <Campo rotulo="UF">
                    <Input
                      maxLength={2}
                      className="uppercase"
                      value={form.address_state}
                      onChange={(e) => set("address_state", e.target.value.toUpperCase())}
                    />
                  </Campo>
                </div>
              </fieldset>

              <Campo rotulo="Observações">
                <Textarea
                  rows={3}
                  className="text-base"
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Portão pelo lado, modelo do aparelho, melhor horário"
                />
              </Campo>

              {editando && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirmarExclusao(true)}
                >
                  Excluir cliente
                </Button>
              )}
            </div>

            <div className="pb-seguro flex items-center gap-5 border-t border-border px-5 py-4">
              <Button type="submit" disabled={mutacaoSalvar.isPending} className="botao-vivo">
                {mutacaoSalvar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {editando ? "Salvar" : "Cadastrar"}
              </Button>
              <button
                type="button"
                onClick={aoFechar}
                className="text-base text-foreground md:text-sm"
              >
                <span className="link-vivo">Cancelar</span>
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmarExclusao} onOpenChange={setConfirmarExclusao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {form.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              O cadastro some da sua lista. Isso não pode ser desfeito.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (form.id) mutacaoExcluir.mutate(form.id);
              }}
              className="border border-destructive bg-transparent text-destructive hover:bg-destructive/10"
            >
              {mutacaoExcluir.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Campo({
  rotulo,
  erro,
  className,
  children,
}: {
  rotulo: string;
  erro?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-2 block text-sm font-normal text-muted-foreground">{rotulo}</Label>
      {children}
      {erro && <p className="mt-1.5 text-sm text-destructive">{erro}</p>}
    </div>
  );
}
