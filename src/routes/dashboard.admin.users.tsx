import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

export const Route = createFileRoute("/dashboard/admin/users")({
  component: AdminUsersPage,
});

type Row = {
  id: string;
  email: string | null;
  full_name: string | null;
  plan: string;
  plan_expires_at: string | null;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
  project_count: number;
  feedback_count: number;
};

function AdminUsersPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name, plan, plan_expires_at, referral_code, referred_by, created_at")
        .order("created_at", { ascending: false });

      if (!profiles) {
        setRows([]);
        return;
      }

      const ids = profiles.map((p) => p.id);
      const [{ data: projects }, { data: feedbacks }] = await Promise.all([
        supabase.from("projects").select("id, owner_id").in("owner_id", ids),
        supabase.from("feedbacks").select("id, project_id"),
      ]);

      const projByOwner = new Map<string, number>();
      const projOwnerById = new Map<string, string>();
      projects?.forEach((p) => {
        projByOwner.set(p.owner_id, (projByOwner.get(p.owner_id) || 0) + 1);
        projOwnerById.set(p.id, p.owner_id);
      });
      const fbByOwner = new Map<string, number>();
      feedbacks?.forEach((f) => {
        const owner = projOwnerById.get(f.project_id);
        if (owner) fbByOwner.set(owner, (fbByOwner.get(owner) || 0) + 1);
      });

      setRows(
        profiles.map((p) => ({
          ...p,
          project_count: projByOwner.get(p.id) || 0,
          feedback_count: fbByOwner.get(p.id) || 0,
        })),
      );
    })();
  }, []);

  const filtered = rows?.filter((r) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.email?.toLowerCase().includes(q) ||
      r.full_name?.toLowerCase().includes(q) ||
      r.referral_code?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher (email, nom, code)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">{filtered?.length ?? 0} utilisateur(s)</div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Expire</th>
                <th className="px-4 py-3">Projets</th>
                <th className="px-4 py-3">Feedbacks</th>
                <th className="px-4 py-3">Code parrain</th>
                <th className="px-4 py-3">Inscrit</th>
              </tr>
            </thead>
            <tbody>
              {!rows &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-3" colSpan={7}>
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))}
              {filtered?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    Aucun utilisateur.
                  </td>
                </tr>
              )}
              {filtered?.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.full_name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{r.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={r.plan === "max" ? "default" : r.plan === "pro" ? "secondary" : "outline"}>
                      {r.plan}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {r.plan_expires_at ? new Date(r.plan_expires_at).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{r.project_count}</td>
                  <td className="px-4 py-3 tabular-nums">{r.feedback_count}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.referral_code || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("fr-FR")}
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
