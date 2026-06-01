import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Plus, Power } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/admin/codes")({
  component: AdminCodesPage,
});

type PromoCode = {
  id: string;
  code: string;
  plan: string;
  duration_days: number;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  note: string | null;
  created_at: string;
};

function randomCode(len = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function AdminCodesPage() {
  const { user } = useAuth();
  const [codes, setCodes] = useState<PromoCode[] | null>(null);
  const [code, setCode] = useState(randomCode());
  const [plan, setPlan] = useState<"pro" | "max">("pro");
  const [durationDays, setDurationDays] = useState("30");
  const [maxUses, setMaxUses] = useState("1");
  const [expiresAt, setExpiresAt] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });
    setCodes(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("promo_codes").insert({
      code: code.toUpperCase().trim(),
      plan,
      duration_days: Number(durationDays),
      max_uses: Number(maxUses),
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      note: note.trim() || null,
      created_by: user.id,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Code créé");
    setCode(randomCode());
    setNote("");
    load();
  };

  const toggleActive = async (c: PromoCode) => {
    const { error } = await supabase
      .from("promo_codes")
      .update({ is_active: !c.is_active })
      .eq("id", c.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    load();
  };

  const copyLink = (codeStr: string) => {
    const url = `${window.location.origin}/dashboard/redeem?code=${codeStr}`;
    navigator.clipboard.writeText(url);
    toast.success("Lien copié");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* Create form */}
      <form onSubmit={handleCreate} className="rounded-lg border border-border bg-card p-5 space-y-4 h-fit">
        <h2 className="font-semibold flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nouveau code
        </h2>

        <div>
          <Label htmlFor="code">Code</Label>
          <div className="mt-1 flex gap-2">
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-mono"
              required
            />
            <Button type="button" variant="outline" size="sm" onClick={() => setCode(randomCode())}>
              ↻
            </Button>
          </div>
        </div>

        <div>
          <Label>Plan accordé</Label>
          <Select value={plan} onValueChange={(v) => setPlan(v as "pro" | "max")}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="max">Max</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="duration">Durée (jours)</Label>
            <Input
              id="duration"
              type="number"
              min={1}
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="max_uses">Utilisations max</Label>
            <Input
              id="max_uses"
              type="number"
              min={1}
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              required
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="expires_at">Expire le (optionnel)</Label>
          <Input
            id="expires_at"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="note">Note interne (optionnel)</Label>
          <Input
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex : ProductHunt launch"
            className="mt-1"
          />
        </div>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "Création…" : "Créer le code"}
        </Button>
      </form>

      {/* List */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Durée</th>
                <th className="px-4 py-3">Usage</th>
                <th className="px-4 py-3">Expire</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {!codes &&
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    <td colSpan={7} className="px-4 py-3">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))}
              {codes?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    Aucun code pour l'instant.
                  </td>
                </tr>
              )}
              {codes?.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-mono font-semibold">{c.code}</div>
                    {c.note && <div className="text-xs text-muted-foreground">{c.note}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.plan === "max" ? "default" : "secondary"}>{c.plan}</Badge>
                  </td>
                  <td className="px-4 py-3">{c.duration_days} j</td>
                  <td className="px-4 py-3 tabular-nums">
                    {c.used_count} / {c.max_uses}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {c.is_active ? (
                      <Badge variant="outline" className="text-green-600 border-green-600/30">Actif</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Désactivé</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => copyLink(c.code)} title="Copier le lien">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleActive(c)}
                        title={c.is_active ? "Désactiver" : "Réactiver"}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
