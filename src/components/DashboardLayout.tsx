import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, LayoutDashboard, CreditCard, LogOut, User, Code2, Gift } from "lucide-react";
import { ReactNode } from "react";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const navItems = [
    { to: "/dashboard", label: "Projets", icon: LayoutDashboard },
    { to: "/dashboard/install", label: "Installer le widget", icon: Code2 },
    { to: "/dashboard/referrals", label: "Parrainage", icon: Gift },
    { to: "/dashboard/account", label: "Mon compte", icon: User },
    { to: "/dashboard/billing", label: "Facturation", icon: CreditCard },
  ] as const;

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6 font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <MessageSquarePlus className="h-4 w-4" />
          </span>
          ReviewDrop
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || (to === "/dashboard" && location.pathname.startsWith("/dashboard/projects"));
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <div className="mb-2 px-3 text-xs text-muted-foreground truncate">{user?.email}</div>
          <Button onClick={handleSignOut} variant="ghost" size="sm" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <div className="md:hidden flex h-14 items-center justify-between border-b border-border bg-card px-4">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <MessageSquarePlus className="h-3.5 w-3.5" />
            </span>
            ReviewDrop
          </Link>
          <Button onClick={handleSignOut} variant="ghost" size="sm">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
