import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/integrations/supabase/client";

const routeTitles: Record<string, string> = {
  "/dashboard": "Hoje",
  "/agenda": "Agenda",
  "/clientes": "Clientes",
  "/dinheiro": "Dinheiro",
  "/settings": "Configurações",
};

function getInitials(name?: string | null, email?: string | null) {
  const source = (name || email || "?").trim();
  const parts = source.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function AppHeader() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const title =
    Object.entries(routeTitles).find(([k]) => currentPath.startsWith(k))?.[1] ?? "Ofício";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile-header"],
    queryFn: async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, email")
        .eq("id", user.id)
        .maybeSingle();
      return {
        display_name: data?.display_name ?? null,
        email: data?.email ?? user.email ?? null,
        avatar_url: data?.avatar_url ?? null,
      };
    },
  });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const nome = profile?.display_name || profile?.email?.split("@")[0] || "Conta";

  return (
    <div className="flex flex-1 items-center justify-between gap-2">
      <h1 className="text-lg font-medium text-foreground md:text-sm">{title}</h1>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Conta e configurações"
            className="flex h-11 items-center gap-3 pl-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:h-9"
          >
            <span className="hidden text-right leading-tight md:block">
              <span className="block text-sm font-medium text-foreground">{nome}</span>
              <span className="block text-xs text-muted-foreground">{profile?.email ?? ""}</span>
            </span>
            <Avatar className="h-9 w-9 md:h-8 md:w-8">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="" />}
              <AvatarFallback className="bg-secondary text-xs font-medium">
                {getInitials(profile?.display_name, profile?.email)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <span className="block text-sm font-medium">{nome}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {profile?.email ?? ""}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="h-11 md:h-9">
              <Link to="/settings">
                <Settings className="h-4 w-4" strokeWidth={1.5} />
                Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleSignOut} className="h-11 md:h-9">
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
