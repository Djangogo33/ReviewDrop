import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Notif = {
  id: string;
  project_id: string;
  author_name: string;
  message: string;
  created_at: string;
};

export function NotificationsBell() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notif[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const load = async () => {
      // Only projects owned by the user thanks to RLS.
      const { data } = await supabase
        .from("feedbacks")
        .select("id, project_id, author_name, message, created_at, is_read")
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(8);
      if (!mounted || !data) return;
      setItems(data as Notif[]);
      setCount(data.length);
    };
    load();

    const channel = supabase
      .channel(`notif-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feedbacks" },
        () => load(),
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={`Notifications${count ? ` (${count} non lues)` : ""}`}
        >
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-4 py-3">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {count === 0
              ? "Aucun feedback non lu"
              : `${count} feedback${count > 1 ? "s" : ""} non lu${count > 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Vous êtes à jour ✨
            </div>
          ) : (
            items.map((n) => (
              <Link
                key={n.id}
                to="/dashboard/projects/$projectId"
                params={{ projectId: n.project_id }}
                className="block border-b border-border px-4 py-3 hover:bg-muted last:border-b-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold truncate">{n.author_name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(n.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {n.message}
                </p>
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
