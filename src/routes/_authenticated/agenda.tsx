import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { EmBreve } from "@/components/em-breve";

export const Route = createFileRoute("/_authenticated/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda — Ofício" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AgendaPage,
});

function AgendaPage() {
  return (
    <EmBreve
      icone={CalendarDays}
      titulo="Agenda"
      texto="Visitas técnicas, orçamentos, serviços e manutenções periódicas, por dia e por semana."
      itens={["Visitas do dia em ordem de rota, abertas no Google Maps ou no Waze", "Manutenção periódica que se repete sozinha (a cada 3, 6 ou 12 meses)", "Aviso quando dois horários se chocam"]}
    />
  );
}
