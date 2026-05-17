import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Copy, Check, Share2, Users, Sparkles, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/referrals")({
  head: () => ({ meta: [{ title: "Parrainage — ReviewDrop" }] }),
  component: () => (
    <RequireAuth>
      <DashboardLayout>
        <ReferralsPage />
      </DashboardLayout>
    </RequireAuth>
  ),
});

type Referral = {
  id: string;
  referred_id: string;
  status: string;
  created_at: string;
  confirmed_at: string | null;
  blocked_reason?: string | null;
};

type ReferralEvent = {
  id: string;
  event_type: string;
  reason: string | null;
  created_at: string;
  referral_code: string | null;
};

const REASON_LABELS: Record<string, string> = {
  self_referral: "Auto-parrainage détecté",
  duplicate_email: "Email déjà utilisé sur un autre compte",
  ip_limit_per_referrer: "Trop de filleuls depuis la même IP",
  referrer_daily_limit: "Limite quotidienne de parrainages atteinte",
  unknown_code: "Code de parrainage inconnu",
  ip_signup_rate_limit: "Trop d'inscriptions depuis votre réseau",
};

function ReferralsPage() {
  const { user } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [events, setEvents] = useState<ReferralEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, { data: refs }, { data: evts }] = await Promise.all([
        supabase.from("profiles").select("referral_code").eq("id", user.id).maybeSingle(),
        supabase
          .from("referrals")
          .select("id, referred_id, status, created_at, confirmed_at, blocked_reason")
          .eq("referrer_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("referral_events" as any)
          .select("id, event_type, reason, created_at, referral_code")
          .eq("referrer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      setCode((profile as any)?.referral_code ?? null);
      setReferrals((refs as Referral[]) ?? []);
      setEvents(((evts as unknown) as ReferralEvent[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = code ? `${origin}/signup?ref=${code}` : "";
  const confirmedCount = referrals.filter((r) => r.status === "confirmed").length;
  const rewardMonths = confirmedCount; // 1 mois Pro offert par filleul confirmé

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const share = async () => {
    if (!link) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ReviewDrop",
          text: "Recueillez les retours de vos clients directement sur vos sites et maquettes. Essaie ReviewDrop avec mon lien :",
          url: link,
        });
      } catch {}
    } else {
      copy();
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Gift className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Parrainage</h1>
          <p className="text-sm text-muted-foreground">Invitez vos amis freelances et gagnez du Pro gratuit.</p>
        </div>
      </div>

      {/* How it works */}
      <div className="mb-6 rounded-xl border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h2 className="font-semibold">Comment ça marche</h2>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• Partagez votre lien personnel à un autre freelance ou agence.</li>
              <li>• Dès qu'il crée un compte, vous gagnez <strong className="text-foreground">1 mois Pro offert</strong>.</li>
              <li>• Votre filleul reçoit aussi <strong className="text-foreground">1 mois Pro offert</strong> à son inscription.</li>
              <li>• Cumul illimité — invitez 12 personnes = 1 an Pro gratuit.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Inscriptions" value={referrals.length} />
        <StatCard icon={Check} label="Confirmées" value={confirmedCount} />
        <StatCard icon={Gift} label="Mois Pro gagnés" value={rewardMonths} highlight />
      </div>

      {/* Link */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-3">Votre lien de parrainage</h2>
        {loading ? (
          <div className="h-10 rounded-md bg-muted animate-pulse" />
        ) : code ? (
          <>
            <div className="flex gap-2">
              <Input readOnly value={link} className="font-mono text-sm" onClick={(e) => (e.currentTarget as HTMLInputElement).select()} />
              <Button onClick={copy} variant="outline" className="shrink-0 gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copié" : "Copier"}
              </Button>
              <Button onClick={share} className="shrink-0 gap-2">
                <Share2 className="h-4 w-4" />
                Partager
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Code : <span className="font-mono font-medium text-foreground">{code}</span>
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun code généré. Rechargez la page.</p>
        )}
      </div>

      {/* Referrals list */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-4">Vos filleuls</h2>
        {loading ? (
          <div className="space-y-2">
            <div className="h-12 rounded-md bg-muted animate-pulse" />
            <div className="h-12 rounded-md bg-muted animate-pulse" />
          </div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
            Aucun filleul pour l'instant. Partagez votre lien pour commencer !
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {referrals.map((r, i) => (
              <li key={r.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium">Filleul #{r.referred_id.slice(0, 8)}</div>
                    <div className="text-xs text-muted-foreground">
                      Inscrit le {new Date(r.created_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      r.status === "confirmed"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : r.status === "blocked"
                        ? "bg-red-500/10 text-red-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {r.status === "confirmed" ? "Confirmé" : r.status === "blocked" ? "Bloqué" : "En attente"}
                  </span>
                  {r.blocked_reason && (
                    <span className="text-[10px] text-muted-foreground">
                      {REASON_LABELS[r.blocked_reason] ?? r.blocked_reason}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Anti-fraud activity log */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Journal d'activité</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Les protections anti-fraude détectent les inscriptions multiples, l'auto-parrainage et les emails dupliqués.
        </p>
        {loading ? (
          <div className="h-10 rounded-md bg-muted animate-pulse" />
        ) : events.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">Aucun événement récent.</div>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {events.map((e) => {
              const isBlock = e.event_type === "referral_blocked" || e.event_type === "rate_limited";
              return (
                <li key={e.id} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {isBlock ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    ) : (
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    )}
                    <span className="truncate">
                      {e.event_type === "referral_credited" && "Filleul crédité"}
                      {e.event_type === "referral_blocked" && `Bloqué — ${REASON_LABELS[e.reason ?? ""] ?? e.reason}`}
                      {e.event_type === "rate_limited" && "Limite anti-spam atteinte"}
                      {e.event_type === "signup_attempt" && "Tentative d'inscription"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(e.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof Gift;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className={`mt-2 text-3xl font-bold ${highlight ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}
