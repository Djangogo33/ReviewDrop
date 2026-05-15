import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Sparkles, Zap } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/billing")({
  head: () => ({ meta: [{ title: "Abonnement — ReviewDrop" }] }),
  component: () => (
    <RequireAuth>
      <DashboardLayout>
        <BillingPage />
      </DashboardLayout>
    </RequireAuth>
  ),
});

type PlanId = "free" | "pro" | "max";

const PLANS: {
  id: PlanId;
  name: string;
  price: string;
  tagline: string;
  features: string[];
  highlight?: boolean;
  icon?: typeof Sparkles;
}[] = [
  {
    id: "free",
    name: "Free",
    price: "0€",
    tagline: "Pour démarrer",
    features: [
      "3 projets actifs",
      "Feedbacks illimités",
      "Widget JS + mode maquette",
      "Notifications email",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "9€",
    tagline: "Pour les freelances actifs",
    features: [
      "Projets illimités",
      "Personnalisation du widget (couleur, logo)",
      "Export CSV des feedbacks",
      "Support prioritaire",
    ],
    highlight: true,
    icon: Sparkles,
  },
  {
    id: "max",
    name: "Max",
    price: "19€",
    tagline: "Pour les agences",
    features: [
      "Tout du plan Pro",
      "Domaine personnalisé pour le widget",
      "Suppression du badge ReviewDrop",
      "Webhooks & intégrations Slack",
      "Support dédié sous 24h",
    ],
    icon: Zap,
  },
];

function BillingPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => setProfile(data));
  }, [user]);

  const currentPlan = (profile?.plan ?? "free") as PlanId;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Abonnement</h1>
        <p className="text-muted-foreground mt-1">
          Plan actuel : <span className="font-semibold text-foreground capitalize">{currentPlan}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const Icon = plan.icon;
          return (
            <div
              key={plan.id}
              className={cn(
                "rounded-lg border bg-card p-6 flex flex-col",
                plan.highlight ? "border-primary border-2 shadow-lg relative" : "border-border",
              )}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Populaire
                </span>
              )}
              <div className="flex items-center gap-2 mb-1">
                {Icon && <Icon className="h-5 w-5 text-primary" />}
                <h2 className="font-bold text-lg">{plan.name}</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{plan.tagline}</p>
              <p className="text-3xl font-bold mb-4">
                {plan.price}
                {plan.id !== "free" && (
                  <span className="text-base font-normal text-muted-foreground">/mois</span>
                )}
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <Button disabled variant="outline" className="w-full">
                  Plan actuel
                </Button>
              ) : plan.id === "free" ? (
                <Button disabled variant="outline" className="w-full">
                  Inclus par défaut
                </Button>
              ) : (
                <Button disabled variant={plan.highlight ? "default" : "outline"} className="w-full">
                  Bientôt disponible
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6">
        Le paiement Stripe arrive bientôt. La logique d'abonnement est déjà en place côté base de données.
      </p>
    </div>
  );
}
