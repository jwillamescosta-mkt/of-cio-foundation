import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Supabase = SupabaseClient<Database>;

/**
 * Empresa atual do usuário: a que ele é dono; se não for dono de nenhuma,
 * a mais antiga de que faz parte.
 */
export async function empresaDoUsuario(supabase: Supabase, userId: string) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("org_id, role, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Sua conta ainda não tem empresa. Fale com o suporte.");
  const dono = data.find((m) => m.role === "owner");
  const escolhida = dono ?? data[0];
  return {
    orgId: escolhida.org_id,
    podeEditar: escolhida.role === "owner" || escolhida.role === "admin",
  };
}

