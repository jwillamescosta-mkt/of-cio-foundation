import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
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

  return (
    <div className="flex flex-1 items-center justify-between">
      <h1 className="text-sm font-medium text-foreground">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <div className="text-sm font-medium text-foreground">
            {profile?.display_name || profile?.email?.split("@")[0] || "—"}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {profile?.email ?? ""}
          </div>
        </div>
        <Avatar className="h-8 w-8">
          {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="" />}
          <AvatarFallback className="bg-secondary text-xs font-medium">
            {getInitials(profile?.display_name, profile?.email)}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
