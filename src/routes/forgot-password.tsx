import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MessageSquarePlus, MailCheck } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Mot de passe oublié — ReviewDrop" },
      { name: "description", content: "Réinitialisez votre mot de passe ReviewDrop." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 font-bold text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <MessageSquarePlus className="h-4 w-4" />
          </span>
          ReviewDrop
        </Link>
        <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MailCheck className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-2xl font-bold">Email envoyé</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien pour
                réinitialiser votre mot de passe dans quelques instants.
              </p>
              <Button asChild variant="outline" className="mt-6 w-full">
                <Link to="/login">Retour à la connexion</Link>
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Entrez votre email, on vous envoie un lien de réinitialisation.
              </p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Envoi…" : "Envoyer le lien"}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
