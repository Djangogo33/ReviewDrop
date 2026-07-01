import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, MessageSquare, CheckCircle2, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const Route = createFileRoute("/dashboard/analytics")({
  head: () => ({ meta: [{ title: "Analytics — ReviewDrop" }] }),
  component: () => (
    <RequireAuth>
      <DashboardLayout>
        <AnalyticsPage />
      </DashboardLayout>
    </RequireAuth>
  ),
});

type Feedback = {
  id: string;
  project_id: string;
  status: string;
  category: string | null;
  page_url: string | null;
  created_at: string;
};

type Project = { id: string; name: string };

const RANGES = [
  { key: 7, label: "7 j" },
  { key: 30, label: "30 j" },
  { key: 90, label: "90 j" },
] as const;

const STATUS_COLORS: Record<string, string> = {
  open: "#3b82f6",
  in_progress: "#f59e0b",
  resolved: "#10b981",
};

const STATUS_LABEL: Record<string, string> = {
  open: "Ouvert",
  in_progress: "En cours",
  resolved: "Résolu",
};

const CATEGORY_COLORS: Record<string, string> = {
  bug: "#ef4444",
  idea: "#8b5cf6",
  question: "#3b82f6",
  ux: "#f59e0b",
  other: "#6b7280",
};

function AnalyticsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState<string>("all");
  const [days, setDays] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase
        .from("projects")
        .select("id, name")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      setProjects(p || []);

      const since = new Date();
      since.setDate(since.getDate() - 90);
      const ids = (p || []).map((x) => x.id);
      if (ids.length === 0) {
        setLoading(false);
        return;
      }
      const { data: f } = await supabase
        .from("feedbacks")
        .select("id, project_id, status, category, page_url, created_at")
        .in("project_id", ids)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false });
      setFeedbacks(f || []);
      setLoading(false);
    })();
  }, [user]);

  const filtered = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return feedbacks.filter(
      (f) =>
        new Date(f.created_at) >= cutoff &&
        (projectId === "all" || f.project_id === projectId),
    );
  }, [feedbacks, projectId, days]);

  const perDay = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      map.set(d.toISOString().slice(0, 10), 0);
    }
    filtered.forEach((f) => {
      const k = f.created_at.slice(0, 10);
      if (map.has(k)) map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map.entries()).map(([date, count]) => ({
      date: date.slice(5),
      count,
    }));
  }, [filtered, days]);

  const statusData = useMemo(() => {
    const c: Record<string, number> = { open: 0, in_progress: 0, resolved: 0 };
    filtered.forEach((f) => {
      if (c[f.status] !== undefined) c[f.status]++;
    });
    return Object.entries(c)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: STATUS_LABEL[k], key: k, value: v }));
  }, [filtered]);

  const categoryData = useMemo(() => {
    const c: Record<string, number> = {};
    filtered.forEach((f) => {
      const k = f.category || "uncategorized";
      c[k] = (c[k] || 0) + 1;
    });
    return Object.entries(c).map(([k, v]) => ({ name: k, value: v }));
  }, [filtered]);

  const topPages = useMemo(() => {
    const c = new Map<string, number>();
    filtered.forEach((f) => {
      if (!f.page_url) return;
      try {
        const u = new URL(f.page_url);
        const key = u.pathname || "/";
        c.set(key, (c.get(key) || 0) + 1);
      } catch {
        c.set(f.page_url, (c.get(f.page_url) || 0) + 1);
      }
    });
    return Array.from(c.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [filtered]);

  const total = filtered.length;
  const resolved = filtered.filter((f) => f.status === "resolved").length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const avgPerDay = total > 0 ? (total / days).toFixed(1) : "0";

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <BarChart3 className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Vue d'ensemble de l'activité de vos projets
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-sm"
        >
          <option value="all">Tous les projets</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <div className="flex overflow-hidden rounded-md border border-border bg-card">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setDays(r.key)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                days === r.key
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={MessageSquare} label="Feedbacks reçus" value={total.toString()} />
            <StatCard icon={TrendingUp} label="Moyenne / jour" value={avgPerDay} />
            <StatCard icon={CheckCircle2} label="Résolus" value={resolved.toString()} />
            <StatCard icon={BarChart3} label="Taux de résolution" value={`${resolutionRate}%`} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold">Feedbacks par jour</h3>
              {perDay.every((d) => d.count === 0) ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={perDay}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                    <XAxis dataKey="date" fontSize={11} />
                    <YAxis fontSize={11} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold">Répartition par statut</h3>
              {statusData.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                      {statusData.map((s) => (
                        <Cell key={s.key} fill={STATUS_COLORS[s.key]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold">Catégories (IA)</h3>
              {categoryData.length === 0 ? (
                <EmptyChart hint="Les catégories sont générées automatiquement pour les nouveaux feedbacks." />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={80}>
                      {categoryData.map((c) => (
                        <Cell key={c.name} fill={CATEGORY_COLORS[c.name] || "#6b7280"} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold">Pages les plus commentées</h3>
              {topPages.length === 0 ? (
                <EmptyChart />
              ) : (
                <ul className="space-y-2">
                  {topPages.map(([page, count]) => {
                    const max = topPages[0][1];
                    const pct = (count / max) * 100;
                    return (
                      <li key={page}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="truncate max-w-[75%] font-mono text-muted-foreground">{page}</span>
                          <span className="font-medium tabular-nums">{count}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof MessageSquare; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold tabular-nums">{value}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyChart({ hint }: { hint?: string }) {
  return (
    <div className="flex h-[220px] flex-col items-center justify-center text-center text-xs text-muted-foreground">
      <BarChart3 className="mb-2 h-8 w-8 opacity-30" />
      <p>Pas encore de données</p>
      {hint && <p className="mt-1 max-w-xs">{hint}</p>}
    </div>
  );
}
