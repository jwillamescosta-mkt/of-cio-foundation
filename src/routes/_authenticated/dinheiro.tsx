import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { EmBreve } from "@/components/em-breve";

export const Route = createFileRoute("/_authenticated/dinheiro")({
  head: () => ({
    meta: [
      { title: "Dinheiro — Ofício" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DinheiroPage,
});

function DinheiroPage() {
  return (
    <EmBreve
      icone={Wallet}
      titulo="Dinheiro"
      texto="Orçamentos, recibos e o que você tem a receber."
      itens={["Contas a receber com aviso de “vence hoje” e “atrasado”", "Recibo em PDF gerado do serviço feito, com mensagem pronta para o WhatsApp", "Orçamento com os itens do seu catálogo de serviços"]}
    />
  );
}
