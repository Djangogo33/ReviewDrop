import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Globe, Image as ImageIcon, Sparkles, Code2, Bell, Check, Zap } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { getLimits, PLAN_LABEL, normalizePlan, type PlanId } from "@/lib/plans";

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

const ONBOARDING_DISMISSED_KEY = "reviewdrop_onboarding_dismissed";

function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [plan, setPlan] = useState<PlanId>("free");
  const [loading, setLoading] = useState(true);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOnboardingDismissed(localStorage.getItem(ONBOARDING_DISMISSED_KEY) === "1");
    }
  }, []);

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

  const dismissOnboarding = () => {
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, "1");
    setOnboardingDismissed(true);
  };

  const hasProject = projects.length > 0;
  const hasFeedback = projects.some((p) => p.open_count > 0);
  const showOnboarding = !loading && !onboardingDismissed && (!hasProject || !hasFeedback);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {showOnboarding && (
        <OnboardingCard
          hasProject={hasProject}
          hasFeedback={hasFeedback}
          firstName={user?.user_metadata?.full_name?.split(" ")[0]}
          onDismiss={dismissOnboarding}
        />
      )}

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

function OnboardingCard({
  hasProject,
  hasFeedback,
  firstName,
  onDismiss,
}: {
  hasProject: boolean;
  hasFeedback: boolean;
  firstName?: string;
  onDismiss: () => void;
}) {
  const steps = [
    {
      done: hasProject,
      icon: Plus,
      title: "Créez votre premier projet",
      desc: "Site live ou maquette image — choisissez le type adapté à votre client.",
      cta: !hasProject ? { to: "/dashboard/projects/new" as const, label: "Créer un projet" } : null,
    },
    {
      done: hasProject,
      icon: Code2,
      title: "Installez le widget ou partagez le lien",
      desc: "Collez le snippet dans le <head> du site, ou envoyez le lien de la maquette à votre client.",
    },
    {
      done: hasFeedback,
      icon: Bell,
      title: "Recevez les feedbacks en temps réel",
      desc: "Les retours apparaissent ici instantanément, ancrés au pixel près.",
    },
  ];

  return (
    <div className="mb-8 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">
              Bienvenue{firstName ? ` ${firstName}` : ""} sur ReviewDrop
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            3 étapes pour collecter votre premier feedback.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Masquer
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className={`relative rounded-lg border p-4 transition-colors ${
                s.done ? "border-primary/30 bg-card" : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold ${
                    s.done
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s.done ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-sm">{s.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
              {s.cta && (
                <Link to={s.cta.to} className="mt-3 inline-block">
                  <Button size="sm">{s.cta.label}</Button>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
