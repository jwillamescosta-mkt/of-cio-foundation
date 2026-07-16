import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Receipt,
  FileText,
  Calculator,
  Wallet,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, enabled: true },
  { title: "Recibos", url: "/receipts", icon: Receipt, enabled: false },
  { title: "Contratos", url: "/contracts", icon: FileText, enabled: false },
  { title: "Calculadora", url: "/pricing", icon: Calculator, enabled: false },
  { title: "Despesas", url: "/expenses", icon: Wallet, enabled: false },
] as const;

const secondaryItems = [
  { title: "Configurações", url: "/settings", icon: Settings, enabled: true },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({
    select: (r) => r.location.pathname,
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex h-12 items-center gap-2 px-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary">
            <span className="font-mono text-xs font-semibold text-primary-foreground">O</span>
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight">Ofício</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Trabalho</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                const isActive = currentPath.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild={item.enabled}
                      isActive={isActive && item.enabled}
                      disabled={!item.enabled}
                      tooltip={item.title}
                      className={
                        !item.enabled ? "cursor-not-allowed opacity-50" : undefined
                      }
                    >
                      {item.enabled ? (
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4" strokeWidth={1.5} />
                          <span>{item.title}</span>
                        </Link>
                      ) : (
                        <div>
                          <item.icon className="h-4 w-4" strokeWidth={1.5} />
                          <span>{item.title}</span>
                          {!collapsed && (
                            <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                              em breve
                            </span>
                          )}
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Conta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => {
                const isActive = currentPath.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" strokeWidth={1.5} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Sair">
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
