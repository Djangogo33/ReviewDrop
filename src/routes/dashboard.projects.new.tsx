import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Globe, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/dashboard/projects/new")({
  head: () => ({ meta: [{ title: "Nouveau projet — ReviewDrop" }] }),
  component: () => (
    <RequireAuth>
      <DashboardLayout>
        <NewProjectPage />
      </DashboardLayout>
    </RequireAuth>
  ),
});

function NewProjectPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [type, setType] = useState<"live" | "mockup">("live");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (type === "mockup" && !file) {
      toast.error("Veuillez sélectionner une image");
      return;
    }
    setLoading(true);

    // Free plan limit: 3 active projects
    const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
    if (profile?.plan === "free") {
      const { count } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id);
      if ((count ?? 0) >= 3) {
        setLoading(false);
        toast.error("Limite atteinte : 3 projets en plan Free. Passez Pro pour en créer plus.");
        return;
      }
    }

    let mockupPath: string | null = null;
    if (type === "mockup" && file) {
      const ext = file.name.split(".").pop() || "png";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("mockups").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) {
        setLoading(false);
        toast.error("Échec de l'upload : " + upErr.message);
        return;
      }
      mockupPath = path;
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        owner_id: user.id,
        name,
        type,
        mockup_image_path: mockupPath,
      })
      .select()
      .single();

    setLoading(false);
    if (error || !data) {
      toast.error(error?.message || "Erreur lors de la création");
      return;
    }
    toast.success("Projet créé !");
    navigate({ to: "/dashboard/projects/$projectId", params: { projectId: data.id } });
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>
      <h1 className="text-2xl font-bold mb-1">Nouveau projet</h1>
      <p className="text-sm text-muted-foreground mb-6">Donnez un nom et choisissez le type.</p>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-border bg-card p-6">
        <div>
          <Label htmlFor="name">Nom du projet</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Site Acme Corp" className="mt-1" />
        </div>

        <div>
          <Label>Type de projet</Label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("live")}
              className={`rounded-lg border-2 p-4 text-left transition-colors ${
                type === "live" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
              }`}
            >
              <Globe className="h-5 w-5 text-primary mb-2" />
              <div className="font-medium text-sm">Site web</div>
              <div className="text-xs text-muted-foreground mt-1">Snippet à coller</div>
            </button>
            <button
              type="button"
              onClick={() => setType("mockup")}
              className={`rounded-lg border-2 p-4 text-left transition-colors ${
                type === "mockup" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
              }`}
            >
              <ImageIcon className="h-5 w-5 text-primary mb-2" />
              <div className="font-medium text-sm">Maquette</div>
              <div className="text-xs text-muted-foreground mt-1">Upload d'image</div>
            </button>
          </div>
        </div>

        {type === "mockup" && (
          <div>
            <Label htmlFor="file">Image de la maquette (PNG/JPG, max 10 Mo)</Label>
            <Input
              id="file"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              required
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && f.size > 10 * 1024 * 1024) {
                  toast.error("Fichier trop lourd (max 10 Mo)");
                  e.target.value = "";
                  return;
                }
                setFile(f ?? null);
              }}
              className="mt-1"
            />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Création..." : "Créer le projet"}
        </Button>
      </form>
    </div>
  );
}
