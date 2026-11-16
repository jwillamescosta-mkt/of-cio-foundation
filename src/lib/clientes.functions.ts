import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { empresaDoUsuario } from "@/lib/empresa";

const digitos = (v: string | null | undefined) => (v ? v.replace(/\D+/g, "") : v);
const texto = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

const clienteSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Informe o nome do cliente").max(160),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .nullable()
    .transform((v) => digitos(v) || null),
  email: z
    .string()
    .trim()
    .max(160)
    .optional()
    .nullable()
    .transform((v) => (v ? v.toLowerCase() : null))
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "E-mail inválido"),
  document_type: z.enum(["cpf", "cnpj"]).nullable().optional(),
  document_number: z
    .string()
    .trim()
    .max(20)
    .optional()
    .nullable()
    .transform((v) => digitos(v) || null),
  address_zip: z
    .string()
    .trim()
    .max(9)
    .optional()
    .nullable()
    .transform((v) => digitos(v) || null),
  address_street: texto(200),
  address_number: texto(20),
  address_complement: texto(120),
  address_district: texto(120),
  address_city: texto(120),
  address_state: z
    .string()
    .trim()
    .max(2)
    .optional()
    .nullable()
    .transform((v) => (v ? v.toUpperCase() : null)),
  notes: texto(2000),
});

export type ClienteInput = z.input<typeof clienteSchema>;

const colunas =
  "id, name, phone, email, document_type, document_number, address_zip, address_street, address_number, address_complement, address_district, address_city, address_state, notes, created_at, updated_at";

/** Lista os clientes da empresa do usuário, em ordem alfabética, com busca opcional. */
export const listarClientes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ busca: z.string().trim().max(80).optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { orgId } = await empresaDoUsuario(supabase, userId);

    let consulta = supabase
      .from("clients")
      .select(colunas)
      .eq("org_id", orgId)
      .order("name", { ascending: true })
      .limit(500);

    const busca = data.busca?.replace(/[%,()]/g, " ").trim();
    if (busca) {
      const soDigitos = busca.replace(/\D+/g, "");
      const filtros = [`name.ilike.%${busca}%`, `address_district.ilike.%${busca}%`, `address_city.ilike.%${busca}%`];
      if (soDigitos.length >= 3) filtros.push(`phone.ilike.%${soDigitos}%`);
      consulta = consulta.or(filtros.join(","));
    }

    const { data: linhas, error } = await consulta;
    if (error) throw new Error(error.message);
    return linhas ?? [];
  });

/** Cria um cliente novo ou atualiza um existente da mesma empresa. */
export const salvarCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => clienteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { orgId } = await empresaDoUsuario(supabase, userId);
    const { id, ...campos } = data;

    if (id) {
      const { data: atualizado, error } = await supabase
        .from("clients")
        .update(campos)
        .eq("id", id)
        .eq("org_id", orgId)
        .select(colunas)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!atualizado) throw new Error("Cliente não encontrado.");
      return atualizado;
    }

    const { data: criado, error } = await supabase
      .from("clients")
      .insert({ ...campos, org_id: orgId })
      .select(colunas)
      .single();
    if (error) throw new Error(error.message);
    return criado;
  });

/** Exclui um cliente da empresa do usuário. */
export const excluirCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { orgId } = await empresaDoUsuario(supabase, userId);
    const { data: apagado, error } = await supabase
      .from("clients")
      .delete()
      .eq("id", data.id)
      .eq("org_id", orgId)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!apagado) throw new Error("Cliente não encontrado.");
    return { ok: true };
  });
