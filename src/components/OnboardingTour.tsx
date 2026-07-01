import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { X, LayoutDashboard, Code2, User, Gift } from "lucide-react";

const STEPS = [
  {
    icon: LayoutDashboard,
    title: "Bienvenue sur ReviewDrop",
    body: "Créez un projet pour votre site ou votre maquette. Chaque projet a son propre snippet et son propre lien de partage.",
  },
  {
    icon: Code2,
    title: "Installer le widget",
    body: "L'onglet « Installer le widget » vous donne un snippet à coller (site live) ou un lien à partager (maquette). Un bouton de test valide l'intégration en un clic.",
  },
  {
    icon: Gift,
    title: "Invitez et gagnez",
    body: "Chaque filleul confirmé vous fait gagner du temps sur votre abonnement Pro. Retrouvez votre lien dans l'onglet « Parrainage ».",
  },
  {
    icon: User,
    title: "Votre compte",
    body: "Depuis « Mon compte » vous pouvez changer votre mot de passe, votre nom, ou supprimer votre compte. C'est parti !",
  },
] as const;

export function OnboardingTour() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("onboarded_at")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data && !data.onboarded_at) setOpen(true);
      });
    return () => { cancelled = true; };
  }, [user]);

  const finish = async () => {
    setOpen(false);
    if (user) {
      await supabase.from("profiles").update({ onboarded_at: new Date().toISOString() }).eq("id", user.id);
    }
  };

  if (!open) return null;
  const s = STEPS[step];
  const Icon = s.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={finish}
          aria-label="Fermer"
          className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold">{s.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-1.5 bg-border"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
                Précédent
              </Button>
            )}
            {isLast ? (
              <Button size="sm" onClick={finish}>C'est parti</Button>
            ) : (
              <Button size="sm" onClick={() => setStep(step + 1)}>Suivant</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
