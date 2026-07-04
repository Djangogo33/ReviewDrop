import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, LogOut, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import type { LucideIcon } from "lucide-react";

type NavItem = { to: string; label: string; icon: LucideIcon };

export function MobileNav({
  items,
  onSignOut,
}: {
  items: readonly NavItem[];
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-card border-r border-border shadow-xl flex flex-col animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 font-bold"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <MessageSquarePlus className="h-3.5 w-3.5" />
                </span>
                ReviewDrop
              </Link>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
              {items.map(({ to, label, icon: Icon }) => {
                const active =
                  location.pathname === to ||
                  (to === "/dashboard" &&
                    location.pathname.startsWith("/dashboard/projects")) ||
                  (to === "/dashboard/admin/users" &&
                    location.pathname.startsWith("/dashboard/admin"));
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-border p-3">
              <div className="mb-2 px-3 text-xs text-muted-foreground truncate">
                {user?.email}
              </div>
              <Button
                onClick={() => {
                  setOpen(false);
                  onSignOut();
                }}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
