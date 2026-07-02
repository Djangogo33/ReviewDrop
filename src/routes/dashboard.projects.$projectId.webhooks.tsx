import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Copy, Trash2, Send, Webhook } from "lucide-react";
import {
  listWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  sendTestWebhook,
  type WebhookEvent,
} from "@/lib/webhooks.functions";

export const Route = createFileRoute("/dashboard/projects/$projectId/webhooks")({
  head: () => ({ meta: [{ title: "Webhooks — ReviewDrop" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <RequireAuth>
      <DashboardLayout>
        <WebhooksPage />
      </DashboardLayout>
    </RequireAuth>
  ),
});

const EVENT_LABEL: Record<WebhookEvent, string> = {
  "feedback.created": "Nouveau feedback",
  "feedback.status_changed": "Changement de statut",
  "reply.created": "Nouvelle réponse",
};
const ALL_EVENTS: WebhookEvent[] = ["feedback.created", "feedback.status_changed", "reply.created"];

type Hook = {
  id: string;
  project_id: string;
  url: string;
  secret: string;
  events: string[];
  is_active: boolean;
  created_at: string;
};
type Delivery = {
  id: string;
  webhook_id: string;
  event: string;
  status_code: number | null;
  ok: boolean;
  response_snippet: string | null;
  error: string | null;
  created_at: string;
};

function WebhooksPage() {
  const { projectId } = Route.useParams();
  const list = useServerFn(listWebhooks);
  const create = useServerFn(createWebhook);
  const update = useServerFn(updateWebhook);
  const remove = useServerFn(deleteWebhook);
  const sendTest = useServerFn(sendTestWebhook);

  const [hooks, setHooks] = useState<Hook[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState<WebhookEvent[]>(["feedback.created"]);
  const [creating, setCreating] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const res = await list({ data: { project_id: projectId } });
      setHooks(res.webhooks as Hook[]);
      setDeliveries(res.deliveries as Delivery[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || newEvents.length === 0) return;
    setCreating(true);
    try {
      await create({ data: { project_id: projectId, url: newUrl.trim(), events: newEvents } });
      setNewUrl("");
      setNewEvents(["feedback.created"]);
      toast.success("Webhook créé");
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (h: Hook) => {
    try {
      await update({ data: { id: h.id, is_active: !h.is_active } });
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  };

  const toggleEvent = async (h: Hook, evt: WebhookEvent) => {
    const events = h.events.includes(evt) ? h.events.filter((x) => x !== evt) : [...h.events, evt];
    if (events.length === 0) {
      toast.error("Sélectionnez au moins un événement");
      return;
    }
    try {
      await update({ data: { id: h.id, events: events as WebhookEvent[] } });
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  };

  const del = async (h: Hook) => {
    if (!confirm("Supprimer ce webhook ?")) return;
    try {
      await remove({ data: { id: h.id } });
      toast.success("Supprimé");
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  };

  const runTest = async (h: Hook) => {
    toast.info("Envoi du test…");
    try {
      await sendTest({ data: { id: h.id } });
      toast.success("Test envoyé");
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec");
    }
  };

  const copy = (v: string) => {
    navigator.clipboard.writeText(v);
    toast.success("Copié");
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
      <Link
        to="/dashboard/projects/$projectId"
        params={{ projectId }}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Retour au projet
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Webhook className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-sm text-muted-foreground">
            Recevez une requête HTTP à chaque événement (feedback, statut, réponse). Chaque envoi est signé
            (<code className="text-xs bg-muted px-1 rounded">x-reviewdrop-signature</code>).
          </p>
        </div>
      </div>

      <form
        onSubmit={submitCreate}
        className="rounded-lg border border-border bg-card p-5 mb-6 space-y-3"
      >
        <h2 className="font-semibold text-sm">Ajouter un webhook</h2>
        <div>
          <Label htmlFor="wh-url">URL de destination</Label>
          <Input
            id="wh-url"
            type="url"
            required
            placeholder="https://exemple.com/hooks/reviewdrop"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Événements</Label>
          <div className="mt-1 flex flex-wrap gap-2">
            {ALL_EVENTS.map((evt) => {
              const active = newEvents.includes(evt);
              return (
                <button
                  key={evt}
                  type="button"
                  onClick={() =>
                    setNewEvents((prev) =>
                      prev.includes(evt) ? prev.filter((e) => e !== evt) : [...prev, evt],
                    )
                  }
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
                  }`}
                >
                  {EVENT_LABEL[evt]}
                </button>
              );
            })}
          </div>
        </div>
        <Button type="submit" disabled={creating || !newUrl.trim()}>
          {creating ? "..." : "Créer le webhook"}
        </Button>
      </form>

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : hooks.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border bg-card p-8 text-center">
          <Webhook className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Aucun webhook. Ajoutez-en un ci-dessus pour recevoir les événements en temps réel.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {hooks.map((h) => {
            const hookDeliveries = deliveries.filter((d) => d.webhook_id === h.id).slice(0, 5);
            return (
              <div key={h.id} className="rounded-lg border border-border bg-card p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm break-all">{h.url}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Créé le {new Date(h.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleActive(h)}
                      className={`text-[11px] px-2 py-1 rounded ${
                        h.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {h.is_active ? "Actif" : "Inactif"}
                    </button>
                    <Button variant="ghost" size="sm" onClick={() => runTest(h)} title="Envoyer un test">
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => del(h)} title="Supprimer">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Événements</p>
                  <div className="flex flex-wrap gap-1">
                    {ALL_EVENTS.map((evt) => {
                      const on = h.events.includes(evt);
                      return (
                        <button
                          key={evt}
                          onClick={() => toggleEvent(h, evt)}
                          className={`text-[11px] px-2 py-0.5 rounded-full border ${
                            on
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {EVENT_LABEL[evt]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Secret de signature (à conserver, sert à vérifier <code className="text-xs bg-muted px-1 rounded">x-reviewdrop-signature</code>)
                  </p>
                  <div className="flex gap-2">
                    <code className="flex-1 text-xs bg-muted p-2 rounded font-mono truncate">{h.secret}</code>
                    <Button variant="outline" size="sm" onClick={() => copy(h.secret)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {hookDeliveries.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Dernières livraisons</p>
                    <ul className="space-y-1">
                      {hookDeliveries.map((d) => (
                        <li key={d.id} className="text-xs flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded font-mono ${
                              d.ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {d.status_code ?? "ERR"}
                          </span>
                          <span className="text-muted-foreground">{d.event}</span>
                          <span className="text-muted-foreground ml-auto">
                            {new Date(d.created_at).toLocaleString("fr-FR")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
