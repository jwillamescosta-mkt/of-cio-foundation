import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { empresaDoUsuario } from "@/lib/empresa";

const profileInputSchema = z.object({
  display_name: z.string().trim().min(1, "Informe seu nome").max(120),
  legal_name: z.string().trim().max(200).optional().nullable(),
  document_type: z.enum(["cpf", "cnpj"]).nullable().optional(),
  document_number: z
    .string()
    .trim()
    .max(20)
    .optional()
    .nullable()
    .transform((v) => (v ? v.replace(/\D+/g, "") : v)),

  address_zip: z
    .string()
    .trim()
    .max(9)
    .optional()
    .nullable()
    .transform((v) => (v ? v.replace(/\D+/g, "") : v)),
  address_street: z.string().trim().max(200).optional().nullable(),
  address_number: z.string().trim().max(20).optional().nullable(),
  address_complement: z.string().trim().max(120).optional().nullable(),
  address_district: z.string().trim().max(120).optional().nullable(),
  address_city: z.string().trim().max(120).optional().nullable(),
  address_state: z.string().trim().max(2).optional().nullable(),

  logo_url: z.string().trim().max(500).optional().nullable(),
  signature_url: z.string().trim().max(500).optional().nullable(),
  avatar_url: z.string().trim().max(500).optional().nullable(),

  bank_name: z.string().trim().max(120).optional().nullable(),
  bank_agency: z.string().trim().max(20).optional().nullable(),
  bank_account: z.string().trim().max(30).optional().nullable(),
  bank_account_type: z.enum(["checking", "savings"]).nullable().optional(),

  pix_key: z.string().trim().max(200).optional().nullable(),
  pix_key_type: z.enum(["cpf", "cnpj", "email", "phone", "random"]).nullable().optional(),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;

// Campos que pertencem à empresa (organizations). O resto do formulário é do perfil.
const camposEmpresa = [
  "legal_name",
  "document_type",
  "document_number",
  "address_zip",
  "address_street",
  "address_number",
  "address_complement",
  "address_district",
  "address_city",
  "address_state",
  "logo_url",
  "signature_url",
  "bank_name",
  "bank_agency",
  "bank_account",
  "bank_account_type",
  "pix_key",
  "pix_key_type",
] as const;

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: perfil, error: erroPerfil }, empresa] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, display_name, avatar_url")
        .eq("id", userId)
        .maybeSingle(),
      empresaDoUsuario(supabase, userId),
    ]);
    if (erroPerfil) throw new Error(erroPerfil.message);

    const { data: org, error: erroOrg } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", empresa.orgId)
      .maybeSingle();
    if (erroOrg) throw new Error(erroOrg.message);

    const dadosEmpresa = Object.fromEntries(
      camposEmpresa.map((c) => [c, (org as Record<string, unknown> | null)?.[c] ?? null]),
    );

    return {
      id: userId,
      email: perfil?.email ?? null,
      display_name: perfil?.display_name ?? null,
      avatar_url: perfil?.avatar_url ?? null,
      ...dadosEmpresa,
      org_id: empresa.orgId,
      can_edit_org: empresa.podeEditar,
    } as {
      id: string;
      email: string | null;
      display_name: string | null;
      avatar_url: string | null;
      org_id: string;
      can_edit_org: boolean;
    } & { [K in (typeof camposEmpresa)[number]]: NonNullable<ProfileInput[K]> | null };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => profileInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const empresa = await empresaDoUsuario(supabase, userId);

    // Perfil: só o que é da pessoa
    const { error: erroPerfil } = await supabase
      .from("profiles")
      .upsert(
        { id: userId, display_name: data.display_name, avatar_url: data.avatar_url ?? null },
        { onConflict: "id" },
      );
    if (erroPerfil) throw new Error(erroPerfil.message);

    // Empresa: dados que vão nos documentos
    // Quem não é dono nem admin só altera o próprio nome (a tela avisa)
    if (!empresa.podeEditar) return { ok: true };
    const dadosEmpresa = Object.fromEntries(camposEmpresa.map((c) => [c, data[c] ?? null]));
    const nome = (data.legal_name ?? "").trim() || data.display_name;
    const { data: atualizada, error: erroOrg } = await supabase
      .from("organizations")
      .update({ ...dadosEmpresa, name: nome })
      .eq("id", empresa.orgId)
      .select("id")
      .maybeSingle();
    if (erroOrg) throw new Error(erroOrg.message);
    if (!atualizada) throw new Error("Não foi possível salvar os dados da empresa.");

    return { ok: true };
  });
