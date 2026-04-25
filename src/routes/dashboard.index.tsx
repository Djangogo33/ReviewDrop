import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Globe, Image as ImageIcon } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Project = Tables<"projects"> & { open_count: number };

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — ReviewDrop" }] }),
  component: () => (
    <RequireAuth>
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
    </RequireAuth>
  ),
});

function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    (async () => {
      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (!projectsData) {
        if (mounted) {
          setProjects([]);
          setLoading(false);
        }
        return;
      }

      // Fetch open feedback counts per project
      const counts = await Promise.all(
        projectsData.map(async (p) => {
          const { count } = await supabase
            .from("feedbacks")
            .select("*", { count: "exact", head: true })
            .eq("project_id", p.id)
            .eq("status", "open");
          return { ...p, open_count: count ?? 0 };
        })
      );
      if (mounted) {
        setProjects(counts);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Mes projets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {projects.length} projet{projects.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link to="/dashboard/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement...</div>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-semibold">Aucun projet pour l'instant</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Créez votre premier projet pour commencer à recevoir des feedbacks.
          </p>
          <Link to="/dashboard/projects/new" className="mt-4 inline-block">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Créer un projet
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              to="/dashboard/projects/$projectId"
              params={{ projectId: p.id }}
              className="rounded-lg border border-border bg-card p-5 hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    {p.type === "live" ? <Globe className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                  </span>
                  <h3 className="font-semibold truncate">{p.name}</h3>
                </div>
                {p.open_count > 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    {p.open_count}
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {p.type === "live" ? "Site web" : "Maquette"} · Créé le{" "}
                {new Date(p.created_at).toLocaleDateString("fr-FR")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
