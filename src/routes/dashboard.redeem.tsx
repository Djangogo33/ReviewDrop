import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ticket, Sparkles } from "lucide-react";
import { toast } from "sonner";

type RedeemSearch = { code?: string };

export const Route = createFileRoute("/dashboard/redeem")({
  head: () => ({ meta: [{ title: "Activer un code — ReviewDrop" }] }),
  validateSearch: (s: Record<string, unknown>): RedeemSearch => ({
    code: typeof s.code === "string" ? s.code : undefined,
  }),
  component: () => (
    <RequireAuth>
      <DashboardLayout>
        <RedeemPage />
      </DashboardLayout>
    </RequireAuth>
  ),
});

const ERRORS: Record<string, string> = {
  unknown_code: "Ce code n'existe pas.",
  inactive: "Ce code a été désactivé.",
  expired: "Ce code est expiré.",
  max_uses_reached: "Ce code a atteint son nombre maximum d'utilisations.",
  already_redeemed: "Vous avez déjà utilisé ce code.",
  unauthenticated: "Vous devez être connecté.",
};

function RedeemPage() {
  const { code: initial } = useSearch({ from: "/dashboard/redeem" });
  const [code, setCode] = useState(initial?.toUpperCase() ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ plan: string; granted_until: string } | null>(null);

  useEffect(() => {
    if (initial) setCode(initial.toUpperCase());
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const { data, error } = await supabase.rpc("redeem_promo_code", { _code: code.trim() });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const res = data as { ok: boolean; error?: string; plan?: string; granted_until?: string };
    if (!res.ok) {
      toast.error(ERRORS[res.error || ""] || "Code invalide");
      return;
    }
    setResult({ plan: res.plan!, granted_until: res.granted_until! });
    toast.success("Code activé !");
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Ticket className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold">Activer un code</h1>
            <p className="text-sm text-muted-foreground">Débloquez Pro ou Max gratuitement.</p>
          </div>
        </div>

        {result ? (
          <div className="mt-6 rounded-md border border-primary/30 bg-primary/5 p-4 text-center">
            <Sparkles className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-2 font-semibold">Plan {result.plan.toUpperCase()} activé !</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Valable jusqu'au {new Date(result.granted_until).toLocaleDateString("fr-FR")}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="code">Code promo</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX"
                required
                className="mt-1 font-mono"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !code}>
              {loading ? "Activation…" : "Activer le code"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
