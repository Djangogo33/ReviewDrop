import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { RequireAdmin } from "@/components/RequireAdmin";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Users, Ticket, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/dashboard/admin")({
  head: () => ({ meta: [{ title: "Admin — ReviewDrop" }] }),
  component: () => (
    <RequireAdmin>
      <DashboardLayout>
        <AdminShell />
      </DashboardLayout>
    </RequireAdmin>
  ),
});

function AdminShell() {
  const location = useLocation();
  const tabs = [
    { to: "/dashboard/admin/users", label: "Utilisateurs", icon: Users },
    { to: "/dashboard/admin/codes", label: "Codes promo", icon: Ticket },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Espace administrateur</h1>
          <p className="text-sm text-muted-foreground">Gestion utilisateurs & codes promo</p>
        </div>
      </div>

      <div className="mb-6 flex gap-1 border-b border-border">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to || (to === "/dashboard/admin/users" && location.pathname === "/dashboard/admin");
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </div>

      <Outlet />
    </div>
  );
}
