import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => profileInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // upsert: garante persistência mesmo se a linha do perfil não existir ainda
    const { data: updated, error } = await supabase
      .from("profiles")
      .upsert({ ...data, id: userId }, { onConflict: "id" })
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return updated;
  });
