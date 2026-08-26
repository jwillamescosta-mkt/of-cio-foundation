export function onlyDigits(v: string): string {
  return (v || "").replace(/\D+/g, "");
}

/** Máscara progressiva de CPF a partir de dígitos crus: 000.000.000-00 */
export function maskCPF(v: string): string {
  const d = onlyDigits(v).slice(0, 11);
  const parts = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean);
  let out = parts.join(".");
  if (d.length > 9) out += `-${d.slice(9, 11)}`;
  return out;
}

/** Máscara progressiva de CNPJ: 00.000.000/0000-00 */
export function maskCNPJ(v: string): string {
  const d = onlyDigits(v).slice(0, 14);
  let out = d.slice(0, 2);
  if (d.length > 2) out += `.${d.slice(2, 5)}`;
  if (d.length > 5) out += `.${d.slice(5, 8)}`;
  if (d.length > 8) out += `/${d.slice(8, 12)}`;
  if (d.length > 12) out += `-${d.slice(12, 14)}`;
  return out;
}

/** Máscara de CEP: 00000-000 */
export function maskCEP(v: string): string {
  const d = onlyDigits(v).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/** Máscara de telefone BR: (00) 00000-0000 */
export function maskPhone(v: string): string {
  const d = onlyDigits(v).slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  const rest = d.slice(2);
  const split = d.length > 10 ? 5 : 4;
  return rest.length > split
    ? `(${d.slice(0, 2)}) ${rest.slice(0, split)}-${rest.slice(split)}`
    : `(${d.slice(0, 2)}) ${rest}`;
}

export function isValidCPF(v: string): boolean {
  const d = onlyDigits(v);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}

export function isValidCNPJ(v: string): boolean {
  const d = onlyDigits(v);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const calc = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * weights[i];
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === Number(d[12]) && calc(13) === Number(d[13]);
}

/** Valores monetários sempre em BRL, formato brasileiro. */
export function formatBRL(value: number | null | undefined): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0));
}
