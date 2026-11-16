/** Endereço a partir do CEP, pelo ViaCEP (público, sem chave). Devolve null se não achar. */
export async function buscarCep(cep: string) {
  const digitos = cep.replace(/\D+/g, "");
  if (digitos.length !== 8) return null;
  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
    if (!resposta.ok) return null;
    const d = (await resposta.json()) as {
      erro?: boolean;
      logradouro?: string;
      bairro?: string;
      localidade?: string;
      uf?: string;
    };
    if (d.erro) return null;
    return {
      address_street: d.logradouro || "",
      address_district: d.bairro || "",
      address_city: d.localidade || "",
      address_state: d.uf || "",
    };
  } catch {
    return null;
  }
}

/** Link do WhatsApp para um telefone brasileiro (só dígitos, com ou sem 55). */
export function linkWhatsApp(telefone: string) {
  const d = telefone.replace(/\D+/g, "");
  return `https://wa.me/${d.startsWith("55") && d.length > 11 ? d : `55${d}`}`;
}

/** Link do Google Maps para o endereço do cliente. */
export function linkMapa(partes: (string | null | undefined)[]) {
  const q = partes.filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
