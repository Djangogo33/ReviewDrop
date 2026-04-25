import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/dashboard/billing")({
  head: () => ({ meta: [{ title: "Facturation — ReviewDrop" }] }),
  component: () => (
    <RequireAuth>
      <DashboardLayout>
        <BillingPage />
      </DashboardLayout>
    </RequireAuth>
  ),
});

function BillingPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => setProfile(data));
  }, [user]);

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>
      <h1 className="text-2xl font-bold mb-6">Facturation</h1>

      <div className="rounded-lg border border-border bg-card p-6 mb-6">
        <p className="text-sm text-muted-foreground">Plan actuel</p>
        <p className="text-2xl font-bold mt-1 capitalize">{profile?.plan ?? "free"}</p>
        {profile?.plan === "free" && (
          <p className="text-sm text-muted-foreground mt-2">3 projets actifs maximum</p>
        )}
      </div>

      {profile?.plan === "free" && (
        <div className="rounded-lg border-2 border-primary bg-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-lg">Passer à Pro</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Projets illimités, support prioritaire, personnalisation du widget.
          </p>
          <p className="text-3xl font-bold mb-4">9€<span className="text-base font-normal text-muted-foreground">/mois</span></p>
          <Button disabled className="w-full">Bientôt disponible</Button>
          <p className="text-xs text-muted-foreground text-center mt-2">Le paiement Stripe arrive très bientôt.</p>
        </div>
      )}
    </div>
  );
}
