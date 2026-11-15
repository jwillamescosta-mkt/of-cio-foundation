import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { EmBreve } from "@/components/em-breve";

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Ofício" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClientesPage,
});

function ClientesPage() {
  return (
    <EmBreve
      icone={Users}
      titulo="Clientes"
      texto="Cada cliente com endereço, telefone e tudo o que já foi feito para ele."
      itens={["Cadastro rápido, por voz ou importando da agenda do celular", "Linha do tempo com visitas, orçamentos, serviços e pagamentos", "Lembrete de retorno quando a última manutenção ficar antiga"]}
    />
  );
}
