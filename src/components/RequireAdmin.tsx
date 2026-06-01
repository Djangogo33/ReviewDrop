import { RequireAuth } from "@/components/RequireAuth";
import { useIsAdmin } from "@/lib/use-is-admin";
import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AdminGate>{children}</AdminGate>
    </RequireAuth>
  );
}

function AdminGate({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useIsAdmin();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 text-xl font-bold">Accès refusé</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cette page est réservée aux administrateurs.
          </p>
          <Link to="/dashboard" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
