import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MessageSquarePlus, MousePointerClick, X, Check, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Démo interactive — ReviewDrop" },
      { name: "description", content: "Testez ReviewDrop en direct : placez une épingle, laissez un commentaire, voyez le résultat. Sans inscription." },
      { property: "og:title", content: "Démo ReviewDrop — Essayez sans inscription" },
      { property: "og:description", content: "Testez le widget de feedback visuel en 30 secondes." },
    ],
  }),
  component: DemoPage,
});

type Pin = {
  id: string;
  x: number; // percent
  y: number; // percent
  author: string;
  message: string;
  at: number;
};

function DemoPage() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [mode, setMode] = useState<"idle" | "picking" | "form">("idle");
  const [draft, setDraft] = useState<{ x: number; y: number } | null>(null);
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");
  const [activePin, setActivePin] = useState<string | null>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("rd_demo_pins");
      if (raw) setPins(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("rd_demo_pins", JSON.stringify(pins));
    } catch {}
  }, [pins]);

  function handleSurfaceClick(e: React.MouseEvent) {
    if (mode !== "picking") return;
    const rect = surfaceRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDraft({ x, y });
    setMode("form");
  }

  function submitFeedback() {
    if (!draft || !message.trim()) return;
    const newPin: Pin = {
      id: crypto.randomUUID(),
      x: draft.x,
      y: draft.y,
      author: author.trim() || "Anonyme",
      message: message.trim(),
      at: Date.now(),
    };
    setPins((p) => [...p, newPin]);
    setDraft(null);
    setMessage("");
    setMode("idle");
  }

  function cancelForm() {
    setDraft(null);
    setMessage("");
    setMode("idle");
  }

  function resetDemo() {
    setPins([]);
    setActivePin(null);
    sessionStorage.removeItem("rd_demo_pins");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <MessageSquarePlus className="h-4 w-4" />
            </span>
            ReviewDrop
          </Link>
          <nav className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Accueil</Link>
            <Link to="/signup"><Button size="sm">Créer un compte</Button></Link>
          </nav>
        </div>
      </header>

      {/* Hero démo */}
      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
            <Sparkles className="h-3 w-3" />
            Démo interactive — aucune inscription
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Testez ReviewDrop en 30 secondes
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Imaginez que la maquette ci-dessous est votre site. Cliquez sur le bouton flottant, posez une épingle, écrivez votre retour. C'est exactement ce que vivront vos clients.
          </p>
        </div>
      </section>

      {/* Fake website + widget */}
      <section className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-5xl">
          {/* Browser chrome */}
          <div className="rounded-t-xl border border-b-0 border-border bg-muted/50 px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            <div className="ml-3 flex-1 truncate rounded bg-background px-3 py-1 text-xs text-muted-foreground">
              demo-client.fr
            </div>
          </div>

          {/* Fake site surface */}
          <div
            ref={surfaceRef}
            onClick={handleSurfaceClick}
            className={`relative rounded-b-xl border border-border bg-background overflow-hidden ${
              mode === "picking" ? "cursor-crosshair" : ""
            }`}
            style={{ minHeight: 520 }}
          >
            {/* Picking overlay */}
            {mode === "picking" && (
              <div className="absolute inset-0 z-30 bg-primary/5 ring-2 ring-inset ring-primary/40 pointer-events-none flex items-start justify-center pt-6">
                <div className="rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium shadow-lg flex items-center gap-2">
                  <MousePointerClick className="h-4 w-4" />
                  Cliquez sur la zone à commenter
                </div>
              </div>
            )}

            {/* Fake page content */}
            <div className="p-8 md:p-12">
              <div className="flex items-center justify-between mb-10">
                <div className="font-bold text-xl">🍃 Maison Verte</div>
                <div className="hidden md:flex gap-6 text-sm text-muted-foreground">
                  <span>Boutique</span>
                  <span>À propos</span>
                  <span>Contact</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Des plantes qui font du bien à votre intérieur.
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Livraison gratuite dès 50€. Garantie reprise 30 jours. Plus de 200 espèces sélectionnées.
                  </p>
                  <div className="flex gap-3">
                    <div className="rounded-md bg-green-600 text-white px-5 py-2.5 text-sm font-medium">
                      Découvrir la boutique
                    </div>
                    <div className="rounded-md border border-border px-5 py-2.5 text-sm font-medium">
                      Voir le guide
                    </div>
                  </div>
                </div>
                <div className="aspect-square rounded-xl bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center text-7xl">
                  🪴
                </div>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-4">
                {["Monstera", "Pilea", "Calathea"].map((n, i) => (
                  <div key={i} className="rounded-lg border border-border p-4">
                    <div className="aspect-square rounded-md bg-muted mb-3 flex items-center justify-center text-3xl">
                      🌿
                    </div>
                    <div className="font-medium text-sm">{n}</div>
                    <div className="text-xs text-muted-foreground">À partir de 24€</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Render pins */}
            {pins.map((pin, idx) => (
              <button
                key={pin.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePin(activePin === pin.id ? null : pin.id);
                }}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg ring-2 ring-background hover:scale-110 transition"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                title={pin.message}
              >
                {idx + 1}
              </button>
            ))}

            {/* Active pin tooltip */}
            {activePin && (() => {
              const pin = pins.find((p) => p.id === activePin);
              if (!pin) return null;
              return (
                <div
                  className="absolute z-30 w-64 rounded-lg border border-border bg-background p-3 shadow-xl"
                  style={{
                    left: `${pin.x}%`,
                    top: `${pin.y}%`,
                    transform: `translate(${pin.x > 70 ? "-100%" : "12px"}, 12px)`,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-semibold">{pin.author}</div>
                    <button onClick={() => setActivePin(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="text-sm">{pin.message}</div>
                </div>
              );
            })()}

            {/* Draft pin */}
            {draft && (
              <div
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg ring-2 ring-background animate-pulse"
                style={{ left: `${draft.x}%`, top: `${draft.y}%` }}
              >
                ?
              </div>
            )}

            {/* Floating widget button */}
            {mode === "idle" && (
              <button
                onClick={() => setMode("picking")}
                className="absolute bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-3 text-sm font-medium shadow-xl hover:scale-105 transition"
              >
                <MessageSquarePlus className="h-4 w-4" />
                Laisser un avis
              </button>
            )}

            {/* Cancel picking button */}
            {mode === "picking" && (
              <button
                onClick={() => setMode("idle")}
                className="absolute bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-3 text-sm font-medium shadow-xl"
              >
                <X className="h-4 w-4" />
                Annuler
              </button>
            )}

            {/* Form modal */}
            {mode === "form" && (
              <div className="absolute inset-0 z-40 flex items-end md:items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
                <div className="w-full max-w-md rounded-xl border border-border bg-background p-5 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Votre retour</h3>
                    <button onClick={cancelForm} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <Input
                      placeholder="Votre nom (optionnel)"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                    />
                    <Textarea
                      placeholder="Décrivez ce qui ne va pas, ou ce que vous aimez..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={cancelForm}>Annuler</Button>
                      <Button onClick={submitFeedback} disabled={!message.trim()}>
                        Envoyer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Counter + reset */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              {pins.length === 0
                ? "Aucun feedback pour l'instant. Cliquez sur le bouton en bas à droite ☝️"
                : `${pins.length} feedback${pins.length > 1 ? "s" : ""} déposé${pins.length > 1 ? "s" : ""} sur cette maquette.`}
            </div>
            {pins.length > 0 && (
              <button onClick={resetDemo} className="text-muted-foreground hover:text-foreground underline">
                Réinitialiser
              </button>
            )}
          </div>

          {/* Feedback list (mirror what freelance would see) */}
          {pins.length > 0 && (
            <div className="mt-8 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Check className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Ce que vous verriez dans votre dashboard</h3>
              </div>
              <ul className="space-y-3">
                {pins.map((pin, idx) => (
                  <li key={pin.id} className="flex gap-3 rounded-lg border border-border p-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{pin.author}</div>
                        <div className="text-xs text-muted-foreground">À l'instant</div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">{pin.message}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Convaincu ? Créez votre premier projet.</h2>
          <p className="text-muted-foreground mb-6">
            Gratuit jusqu'à 3 projets. Installation en 1 ligne de code. Aucune carte bancaire.
          </p>
          <Link to="/signup">
            <Button size="lg" className="gap-2">
              Commencer gratuitement <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
