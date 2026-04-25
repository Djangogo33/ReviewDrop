import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MessageSquarePlus, Check } from "lucide-react";

export const Route = createFileRoute("/r/$token")({
  head: () => ({
    meta: [
      { title: "Laisser un feedback — ReviewDrop" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReviewPage,
});

interface PublicProject {
  id: string;
  name: string;
  type: "live" | "mockup";
  brand_color: string;
  mockup_image_path: string | null;
  is_active: boolean;
}

function ReviewPage() {
  const { token } = Route.useParams();
  const [project, setProject] = useState<PublicProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [pinning, setPinning] = useState(false);
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(0);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/public/widget-config/${token}`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        setProject(data.project);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
    const stored = localStorage.getItem("reviewdrop_name");
    if (stored) setName(stored);
  }, [token]);

  const mockupUrl = project?.mockup_image_path
    ? supabase.storage.from("mockups").getPublicUrl(project.mockup_image_path).data.publicUrl
    : null;

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!pinning) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPin({ x, y });
  };

  const submit = async () => {
    if (!project || !pin || !message.trim()) return;
    setSubmitting(true);
    localStorage.setItem("reviewdrop_name", name);
    try {
      const res = await fetch("/api/public/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_token: token,
          page_url: window.location.href,
          position_x: pin.x,
          position_y: pin.y,
          viewport_w: window.innerWidth,
          viewport_h: window.innerHeight,
          author_name: name.trim() || "Anonyme",
          message: message.trim(),
          user_agent: navigator.userAgent,
        }),
      });
      if (!res.ok) throw new Error("Échec");
      toast.success("Feedback envoyé !");
      setPin(null);
      setMessage("");
      setPinning(false);
      setSubmitted((n) => n + 1);
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement...</div>;
  if (!project || !project.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold">Projet introuvable</h1>
          <p className="text-sm text-muted-foreground mt-2">Ce lien n'est pas valide ou le projet est inactif.</p>
        </div>
      </div>
    );
  }
  if (project.type !== "mockup" || !mockupUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold">Mauvais type de projet</h1>
          <p className="text-sm text-muted-foreground mt-2">Ce lien est destiné aux maquettes uniquement.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-card border-b border-border sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold">{project.name}</h1>
            <p className="text-xs text-muted-foreground">
              {pinning ? "Cliquez sur l'image pour pointer un endroit" : "Cliquez sur le bouton pour laisser un feedback"}
            </p>
          </div>
          {!pinning && !pin && (
            <Button
              onClick={() => setPinning(true)}
              style={{ backgroundColor: project.brand_color }}
              className="text-white"
            >
              <MessageSquarePlus className="h-4 w-4 mr-2" />
              Laisser un feedback
            </Button>
          )}
          {pinning && !pin && (
            <Button variant="outline" onClick={() => setPinning(false)}>Annuler</Button>
          )}
          {submitted > 0 && (
            <div className="text-xs text-green-600 flex items-center gap-1">
              <Check className="h-3 w-3" /> {submitted} feedback{submitted > 1 ? "s" : ""} envoyé{submitted > 1 ? "s" : ""}
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto p-4 max-w-5xl">
        <div className="relative inline-block w-full">
          <img
            ref={imgRef}
            src={mockupUrl}
            alt={project.name}
            onClick={handleImageClick}
            className={`w-full block rounded-lg shadow-sm ${pinning ? "cursor-crosshair" : ""}`}
            draggable={false}
          />
          {pin && (
            <div
              className="absolute -translate-x-1/2 -translate-y-full pointer-events-none"
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            >
              <div
                className="h-7 w-7 rounded-full ring-2 ring-white shadow-lg"
                style={{ backgroundColor: project.brand_color }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Feedback form modal */}
      {pin && (
        <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-background/80 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
            <h2 className="font-semibold mb-4">Votre feedback</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Votre prénom</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Camille" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Message</label>
                <Textarea
                  autoFocus
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Cette zone pourrait être plus grande..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => { setPin(null); setMessage(""); }}>Annuler</Button>
              <Button
                onClick={submit}
                disabled={!message.trim() || submitting}
                style={{ backgroundColor: project.brand_color }}
                className="text-white"
              >
                {submitting ? "Envoi..." : "Envoyer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
