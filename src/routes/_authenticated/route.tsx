import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedShell,
});

function AuthedShell() {
  const caminho = useRouterState({ select: (r) => r.location.pathname });
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background px-4">
          {/* No celular a navegação é a barra inferior; o menu lateral é só do desktop */}
          <SidebarTrigger className="-ml-1 hidden md:inline-flex" />
          <AppHeader />
        </header>
        <main className="pb-barra flex-1 px-4 pt-5 md:p-6">
          {/* A chave faz cada tela entrar com o movimento padrão ao trocar de rota */}
          <div key={caminho} className="entrar">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
      <BottomNav />
    </SidebarProvider>
  );
}
