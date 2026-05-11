import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Check, Globe, Image as ImageIcon, ExternalLink, Code2, Figma } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Project = Tables<"projects">;

export const Route = createFileRoute("/dashboard/install")({
  head: () => ({ meta: [{ title: "Installer le widget — ReviewDrop" }] }),
  component: () => (
    <RequireAuth>
      <DashboardLayout>
        <InstallPage />
      </DashboardLayout>
    </RequireAuth>
  ),
});

function InstallPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (mounted) {
        setProjects(data || []);
        setSelectedId(data?.[0]?.id ?? "");
        setLoading(false);
      }
    })();
  }, [user]);

  const project = useMemo(
    () => projects.find((p) => p.id === selectedId) ?? null,
    [projects, selectedId]
  );

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const widgetUrl = `${origin}/widget.js`;
  const snippet = project
    ? `<script src="${widgetUrl}" data-project="${project.public_token}" defer></script>`
    : "";
  const reviewUrl = project ? `${origin}/r/${project.public_token}` : "";

  const defaultTab = project?.type === "mockup" ? "mockup" : "live";

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Installer le widget</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Collez le snippet sur votre site, ou partagez le lien de la maquette à votre client.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement...</div>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
          <Code2 className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-semibold">Aucun projet pour l'instant</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Créez d'abord un projet pour obtenir votre snippet d'installation.
          </p>
          <Link to="/dashboard/projects/new" className="mt-4 inline-block">
            <Button>Créer un projet</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-5">
            <Label className="mb-2 block">Projet</Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-full sm:max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="flex items-center gap-2">
                      {p.type === "live" ? (
                        <Globe className="h-3.5 w-3.5" />
                      ) : (
                        <ImageIcon className="h-3.5 w-3.5" />
                      )}
                      {p.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {project && (
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:max-w-md">
                <TabsTrigger value="live">
                  <Globe className="mr-2 h-4 w-4" />
                  Site live
                </TabsTrigger>
                <TabsTrigger value="mockup">
                  <Figma className="mr-2 h-4 w-4" />
                  Maquette / Figma
                </TabsTrigger>
              </TabsList>

              <TabsContent value="live" className="mt-6 space-y-6">
                <Step
                  number={1}
                  title="Copiez le snippet"
                  desc="Une seule ligne à coller dans le <head> ou avant </body>."
                >
                  <CopyBlock value={snippet} />
                </Step>

                <Step
                  number={2}
                  title="Collez-le dans votre site"
                  desc="Le widget apparaît automatiquement en bas à droite, uniquement pour les visiteurs."
                >
                  <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-4 text-xs">
{`<!DOCTYPE html>
<html>
  <head>
    <title>Mon site</title>
    ${snippet}
  </head>
  <body>...</body>
</html>`}
                  </pre>
                  <div className="grid gap-2 sm:grid-cols-2 mt-3">
                    <FrameworkHint
                      name="WordPress"
                      hint="Apparence → Éditeur de thème → header.php, ou un plugin 'Insert Headers'."
                    />
                    <FrameworkHint
                      name="Webflow"
                      hint="Project Settings → Custom Code → Head Code."
                    />
                    <FrameworkHint
                      name="Shopify"
                      hint="Online Store → Themes → Edit code → theme.liquid."
                    />
                    <FrameworkHint
                      name="Next / React / Vite"
                      hint="Ajoutez le <script> dans index.html ou via <Head> de votre framework."
                    />
                  </div>
                </Step>

                <Step number={3} title="Ouvrez votre site et testez">
                  <p className="text-sm text-muted-foreground">
                    Cliquez sur le bouton <span className="font-medium text-foreground">Feedback</span>,
                    pointez un élément, écrivez un message. Il apparaît instantanément dans votre dashboard.
                  </p>
                </Step>
              </TabsContent>

              <TabsContent value="mockup" className="mt-6 space-y-6">
                <Step
                  number={1}
                  title="Exportez votre maquette en image"
                  desc="Depuis Figma : sélectionnez la frame → panneau Export → format PNG ou JPG (1x ou 2x)."
                >
                  <p className="text-xs text-muted-foreground">
                    Astuce : exportez la frame entière (pas une sélection) pour conserver les proportions.
                  </p>
                </Step>

                <Step
                  number={2}
                  title="Uploadez l'image dans le projet"
                  desc="Depuis la page du projet, ajoutez ou remplacez l'image de maquette."
                >
                  <Link to="/dashboard/projects/$projectId" params={{ projectId: project.id }}>
                    <Button variant="outline" size="sm">
                      Ouvrir le projet
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </Step>

                <Step
                  number={3}
                  title="Partagez le lien à votre client"
                  desc="Pas d'inscription requise : votre client clique, pointe, commente."
                >
                  <CopyBlock value={reviewUrl} />
                  <a
                    href={reviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center text-sm text-primary hover:underline"
                  >
                    Prévisualiser le lien
                    <ExternalLink className="ml-1 h-3.5 w-3.5" />
                  </a>
                </Step>
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
    </div>
  );
}

function Step({
  number,
  title,
  desc,
  children,
}: {
  number: number;
  title: string;
  desc?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {number}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold">{title}</h3>
          {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </div>
  );
}

function CopyBlock({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copié dans le presse-papier");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Impossible de copier");
    }
  };
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-4 pr-14 text-xs">
        <code className="break-all">{value}</code>
      </pre>
      <Button
        size="sm"
        variant="secondary"
        onClick={copy}
        className="absolute right-2 top-2"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}

function FrameworkHint({ name, hint }: { name: string; hint: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <div className="text-xs font-semibold">{name}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}
