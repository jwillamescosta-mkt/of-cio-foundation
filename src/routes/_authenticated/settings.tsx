import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyProfile, updateMyProfile } from "@/lib/profile.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload, ImageIcon, PenLine } from "lucide-react";
import {
  maskCPF,
  maskCNPJ,
  maskCEP,
  onlyDigits,
  isValidCPF,
  isValidCNPJ,
} from "@/lib/format";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — Perfil Profissional | Ofício" },
      {
        name: "description",
        content:
          "Dados fiscais, endereço, logo, assinatura e dados bancários usados nos seus recibos e contratos.",
      },
      { property: "og:title", content: "Configurações — Perfil Profissional | Ofício" },
      {
        property: "og:description",
        content: "Dados que alimentam automaticamente seus recibos e contratos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  legal_name: string | null;
  document_type: "cpf" | "cnpj" | null;
  document_number: string | null;
  address_zip: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_district: string | null;
  address_city: string | null;
  address_state: string | null;
  logo_url: string | null;
  signature_url: string | null;
  bank_name: string | null;
  bank_agency: string | null;
  bank_account: string | null;
  bank_account_type: "checking" | "savings" | null;
  pix_key: string | null;
  pix_key_type: "cpf" | "cnpj" | "email" | "phone" | "random" | null;
};

type FormState = Omit<ProfileRow, "id" | "email">;

const empty: FormState = {
  display_name: "",
  avatar_url: null,
  legal_name: "",
  document_type: "cpf",
  document_number: "",
  address_zip: "",
  address_street: "",
  address_number: "",
  address_complement: "",
  address_district: "",
  address_city: "",
  address_state: "",
  logo_url: null,
  signature_url: null,
  bank_name: "",
  bank_agency: "",
  bank_account: "",
  bank_account_type: "checking",
  pix_key: "",
  pix_key_type: "email",
};

function SettingsPage() {
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getMyProfile);
  const saveProfile = useServerFn(updateMyProfile);

  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(),
  });

  const [form, setForm] = useState<FormState>(empty);
  const [signedLogo, setSignedLogo] = useState<string | null>(null);
  const [signedSignature, setSignedSignature] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setForm({
      display_name: data.display_name ?? "",
      avatar_url: data.avatar_url,
      legal_name: data.legal_name ?? "",
      document_type: (data.document_type as "cpf" | "cnpj" | null) ?? "cpf",
      document_number: data.document_number ?? "",
      address_zip: data.address_zip ?? "",
      address_street: data.address_street ?? "",
      address_number: data.address_number ?? "",
      address_complement: data.address_complement ?? "",
      address_district: data.address_district ?? "",
      address_city: data.address_city ?? "",
      address_state: data.address_state ?? "",
      logo_url: data.logo_url,
      signature_url: data.signature_url,
      bank_name: data.bank_name ?? "",
      bank_agency: data.bank_agency ?? "",
      bank_account: data.bank_account ?? "",
      bank_account_type:
        (data.bank_account_type as "checking" | "savings" | null) ?? "checking",
      pix_key: data.pix_key ?? "",
      pix_key_type:
        (data.pix_key_type as "cpf" | "cnpj" | "email" | "phone" | "random" | null) ?? "email",
    });
  }, [data]);

  // Resolve signed URLs for private buckets
  useEffect(() => {
    (async () => {
      if (form.logo_url) {
        const { data: s } = await supabase.storage
          .from("logos")
          .createSignedUrl(form.logo_url, 3600);
        setSignedLogo(s?.signedUrl ?? null);
      } else setSignedLogo(null);
      if (form.signature_url) {
        const { data: s } = await supabase.storage
          .from("signatures")
          .createSignedUrl(form.signature_url, 3600);
        setSignedSignature(s?.signedUrl ?? null);
      } else setSignedSignature(null);
    })();
  }, [form.logo_url, form.signature_url]);

  const mutation = useMutation({
    mutationFn: (payload: FormState) => saveProfile({ data: payload as never }),
    onSuccess: () => {
      toast.success("Perfil salvo");
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["profile-header"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Erro ao salvar";
      toast.error("Não foi possível salvar", { description: msg });
    },
  });

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key as string] ? { ...e, [key as string]: "" } : e));
  }

  function validate(f: FormState): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!f.display_name?.trim()) errs.display_name = "Informe seu nome de exibição.";
    const doc = onlyDigits(f.document_number ?? "");
    if (doc) {
      if (f.document_type === "cnpj" && !isValidCNPJ(doc)) errs.document_number = "CNPJ inválido.";
      if (f.document_type === "cpf" && !isValidCPF(doc)) errs.document_number = "CPF inválido.";
    }
    const zip = onlyDigits(f.address_zip ?? "");
    if (zip && zip.length !== 8) errs.address_zip = "CEP deve ter 8 dígitos.";
    const uf = (f.address_state ?? "").trim();
    if (uf && uf.length !== 2) errs.address_state = "Use a sigla de 2 letras.";
    return errs;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Revise os campos destacados");
      return;
    }
    mutation.mutate(form);
  }

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando…
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Configurações</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Estes dados aparecem em todos os recibos e contratos gerados.
          </p>
        </div>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      </div>

      <Section title="Identidade" description="Nome que aparece no app e sua marca visual.">
        <Field label="Nome de exibição" required>
          <Input
            value={form.display_name ?? ""}
            onChange={(e) => set("display_name", e.target.value)}
            placeholder="Como aparecerá no app"
            required
          />
        </Field>
        <Field label="Logo">
          <FileUploader
            bucket="logos"
            currentPath={form.logo_url}
            signedUrl={signedLogo}
            icon={<ImageIcon className="h-4 w-4" strokeWidth={1.5} />}
            onUploaded={(path) => set("logo_url", path)}
            onRemoved={() => set("logo_url", null)}
          />
        </Field>
      </Section>

      <Section title="Dados fiscais" description="Usado nos documentos oficiais.">
        <Field label="Tipo">
          <Select
            value={form.document_type ?? "cpf"}
            onValueChange={(v) => set("document_type", v as "cpf" | "cnpj")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cpf">CPF</SelectItem>
              <SelectItem value="cnpj">CNPJ</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field
          label={form.document_type === "cnpj" ? "CNPJ" : "CPF"}
          className="md:col-span-2"
        >
          <Input
            className="font-mono"
            value={
              form.document_type === "cnpj"
                ? maskCNPJ(form.document_number ?? "")
                : maskCPF(form.document_number ?? "")
            }
            onChange={(e) => set("document_number", e.target.value)}
            placeholder={form.document_type === "cnpj" ? "00.000.000/0000-00" : "000.000.000-00"}
          />
        </Field>
        <Field
          label={form.document_type === "cnpj" ? "Razão social" : "Nome completo"}
          className="md:col-span-3"
        >
          <Input
            value={form.legal_name ?? ""}
            onChange={(e) => set("legal_name", e.target.value)}
            placeholder={
              form.document_type === "cnpj" ? "Ex: Estúdio Ofício LTDA" : "Nome como no documento"
            }
          />
        </Field>
      </Section>

      <Section title="Endereço" description="Endereço comercial ou residencial.">
        <Field label="CEP">
          <Input
            className="font-mono"
            value={maskCEP(form.address_zip ?? "")}
            onChange={(e) => set("address_zip", e.target.value)}
            placeholder="00000-000"
          />
        </Field>
        <Field label="Rua" className="md:col-span-2">
          <Input
            value={form.address_street ?? ""}
            onChange={(e) => set("address_street", e.target.value)}
          />
        </Field>
        <Field label="Número">
          <Input
            className="font-mono"
            value={form.address_number ?? ""}
            onChange={(e) => set("address_number", e.target.value)}
          />
        </Field>
        <Field label="Complemento" className="md:col-span-2">
          <Input
            value={form.address_complement ?? ""}
            onChange={(e) => set("address_complement", e.target.value)}
          />
        </Field>
        <Field label="Bairro">
          <Input
            value={form.address_district ?? ""}
            onChange={(e) => set("address_district", e.target.value)}
          />
        </Field>
        <Field label="Cidade">
          <Input
            value={form.address_city ?? ""}
            onChange={(e) => set("address_city", e.target.value)}
          />
        </Field>
        <Field label="UF">
          <Input
            maxLength={2}
            className="font-mono uppercase"
            value={form.address_state ?? ""}
            onChange={(e) => set("address_state", e.target.value.toUpperCase())}
            placeholder="SP"
          />
        </Field>
      </Section>

      <Section title="Dados bancários" description="Para constar nos recibos.">
        <Field label="Banco" className="md:col-span-2">
          <Input
            value={form.bank_name ?? ""}
            onChange={(e) => set("bank_name", e.target.value)}
            placeholder="Ex: Nubank, Itaú"
          />
        </Field>
        <Field label="Tipo">
          <Select
            value={form.bank_account_type ?? "checking"}
            onValueChange={(v) => set("bank_account_type", v as "checking" | "savings")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="checking">Corrente</SelectItem>
              <SelectItem value="savings">Poupança</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Agência">
          <Input
            className="font-mono"
            value={form.bank_agency ?? ""}
            onChange={(e) => set("bank_agency", e.target.value)}
          />
        </Field>
        <Field label="Conta" className="md:col-span-2">
          <Input
            className="font-mono"
            value={form.bank_account ?? ""}
            onChange={(e) => set("bank_account", e.target.value)}
          />
        </Field>

        <Field label="Tipo de chave PIX">
          <Select
            value={form.pix_key_type ?? "email"}
            onValueChange={(v) =>
              set("pix_key_type", v as "cpf" | "cnpj" | "email" | "phone" | "random")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cpf">CPF</SelectItem>
              <SelectItem value="cnpj">CNPJ</SelectItem>
              <SelectItem value="email">E-mail</SelectItem>
              <SelectItem value="phone">Telefone</SelectItem>
              <SelectItem value="random">Aleatória</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Chave PIX" className="md:col-span-2">
          <Input
            className="font-mono"
            value={form.pix_key ?? ""}
            onChange={(e) => set("pix_key", e.target.value)}
          />
        </Field>
      </Section>

      <Section
        title="Assinatura"
        description="Imagem PNG/JPG com fundo transparente ou branco. Aparecerá nos documentos."
      >
        <div className="md:col-span-3">
          <FileUploader
            bucket="signatures"
            currentPath={form.signature_url}
            signedUrl={signedSignature}
            icon={<PenLine className="h-4 w-4" strokeWidth={1.5} />}
            onUploaded={(path) => set("signature_url", path)}
            onRemoved={() => set("signature_url", null)}
          />
        </div>
      </Section>

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar perfil
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-medium">{title}</h3>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-2 block text-xs font-normal text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </Label>
      {children}
    </div>
  );
}

function FileUploader({
  bucket,
  currentPath,
  signedUrl,
  icon,
  onUploaded,
  onRemoved,
}: {
  bucket: "logos" | "signatures";
  currentPath: string | null;
  signedUrl: string | null;
  icon: React.ReactNode;
  onUploaded: (path: string) => void;
  onRemoved: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) throw new Error("Sessão expirada");
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const path = `${uid}/${bucket === "logos" ? "logo" : "signature"}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (error) throw error;
      // Remove old file if any
      if (currentPath && currentPath !== path) {
        await supabase.storage.from(bucket).remove([currentPath]);
      }
      onUploaded(path);
      toast.success("Arquivo enviado");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro no upload";
      toast.error("Falha no upload", { description: msg });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border border-border bg-background">
        {signedUrl ? (
          <img src={signedUrl} alt="" className="h-full w-full object-contain" />
        ) : (
          <span className="text-muted-foreground">{icon}</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <Upload className="mr-2 h-3 w-3" strokeWidth={1.5} />
            )}
            {currentPath ? "Trocar" : "Enviar"}
          </Button>
          {currentPath && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.storage.from(bucket).remove([currentPath]);
                onRemoved();
              }}
            >
              Remover
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">PNG, JPG, WEBP ou SVG. Máx 5 MB.</p>
      </div>
    </div>
  );
}
