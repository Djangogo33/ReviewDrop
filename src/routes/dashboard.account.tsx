import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Trash2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/account")({
  head: () => ({ meta: [{ title: "Mon compte — ReviewDrop" }] }),
  component: () => (
    <RequireAuth>
      <DashboardLayout>
        <AccountPage />
      </DashboardLayout>
    </RequireAuth>
  ),
});

function AccountPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).single().then(({ data }) => {
      if (data?.full_name) setFullName(data.full_name);
    });
  }, [user]);

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() || null })
      .eq("id", user.id);
    setSavingName(false);
    if (error) toast.error(error.message);
    else toast.success("Nom mis à jour");
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("8 caractères minimum");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setSavingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPwd(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Mot de passe modifié");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== "SUPPRIMER") {
      toast.error('Tape "SUPPRIMER" pour confirmer');
      return;
    }
    setDeleting(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setDeleting(false);
      toast.error("Session expirée");
      return;
    }
    const { error } = await supabase.functions.invoke("delete-account", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (error) {
      setDeleting(false);
      toast.error(error.message);
      return;
    }
    await signOut();
    toast.success("Compte supprimé");
    navigate({ to: "/" });
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>
      <h1 className="text-2xl font-bold mb-6">Mon compte</h1>

      {/* Email (read-only) */}
      <div className="rounded-lg border border-border bg-card p-5 mb-4">
        <Label className="text-xs text-muted-foreground">Adresse email</Label>
        <p className="mt-1 text-sm font-medium">{user?.email}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          L'email ne peut pas être modifié pour le moment.
        </p>
      </div>

      {/* Full name */}
      <form onSubmit={saveName} className="rounded-lg border border-border bg-card p-5 mb-4 space-y-3">
        <div>
          <Label htmlFor="fullName">Nom complet</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Votre nom"
            maxLength={100}
            className="mt-1"
          />
        </div>
        <Button type="submit" disabled={savingName} size="sm">
          {savingName ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </form>

      {/* Password */}
      <form onSubmit={changePassword} className="rounded-lg border border-border bg-card p-5 mb-4 space-y-3">
        <h2 className="font-semibold">Changer le mot de passe</h2>
        <div>
          <Label htmlFor="newPassword">Nouveau mot de passe</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirmer</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            className="mt-1"
          />
        </div>
        <Button type="submit" disabled={savingPwd || !newPassword} size="sm">
          {savingPwd ? "Modification..." : "Modifier le mot de passe"}
        </Button>
      </form>

      {/* Danger zone */}
      <div className="rounded-lg border border-destructive/30 bg-card p-5 space-y-3">
        <h2 className="font-semibold text-destructive flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Supprimer le compte
        </h2>
        <p className="text-sm text-muted-foreground">
          Cette action est irréversible. Tous vos projets, feedbacks et données seront définitivement supprimés.
        </p>
        <div>
          <Label htmlFor="deleteConfirm" className="text-xs">
            Tapez <code className="bg-muted px-1 py-0.5 rounded">SUPPRIMER</code> pour confirmer
          </Label>
          <Input
            id="deleteConfirm"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button
          variant="destructive"
          size="sm"
          disabled={deleting || deleteConfirm !== "SUPPRIMER"}
          onClick={deleteAccount}
        >
          {deleting ? "Suppression..." : "Supprimer définitivement mon compte"}
        </Button>
      </div>
    </div>
  );
}
