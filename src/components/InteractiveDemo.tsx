import { useState } from "react";
import { MessageSquarePlus, X } from "lucide-react";

type Pin = { id: number; x: number; y: number; text: string; author: string };

const SAMPLES = [
  { author: "Marie · Cliente", text: "Le bouton est trop discret, on peut le rendre plus visible ?" },
  { author: "Paul · Designer", text: "J'aimerais une autre photo ici, plus chaleureuse." },
  { author: "Léa · PM", text: "Texte un peu trop long, on peut raccourcir ?" },
  { author: "Tom · Client", text: "Parfait ce visuel 👌" },
];

export function InteractiveDemo() {
  const [pins, setPins] = useState<Pin[]>([
    { id: 0, x: 72, y: 28, text: SAMPLES[0].text, author: SAMPLES[0].author },
  ]);
  const [activeId, setActiveId] = useState<number | null>(0);
  const [nextId, setNextId] = useState(1);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const sample = SAMPLES[nextId % SAMPLES.length];
    const newPin: Pin = { id: nextId, x, y, text: sample.text, author: sample.author };
    setPins((p) => [...p, newPin]);
    setActiveId(nextId);
    setNextId((n) => n + 1);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">
          👇 Cliquez n'importe où sur la maquette pour ajouter un commentaire
        </p>
        {pins.length > 0 && (
          <button
            onClick={() => {
              setPins([]);
              setActiveId(null);
            }}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Browser frame */}
      <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400/70" />
            <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
            <span className="h-3 w-3 rounded-full bg-green-400/70" />
          </div>
          <div className="mx-auto rounded-md bg-background px-3 py-1 text-xs text-muted-foreground font-mono">
            monsite-client.fr
          </div>
        </div>

        <div
          onClick={handleClick}
          className="relative cursor-crosshair bg-gradient-to-br from-primary/10 via-background to-accent/10 select-none"
          style={{ aspectRatio: "16 / 9" }}
        >
          {/* Fake site content */}
          <div className="absolute inset-0 p-8 sm:p-12 pointer-events-none">
            <div className="h-3 w-32 rounded bg-foreground/20 mb-6" />
            <div className="h-8 w-3/4 rounded bg-foreground/30 mb-3" />
            <div className="h-8 w-1/2 rounded bg-foreground/30 mb-6" />
            <div className="h-3 w-2/3 rounded bg-foreground/15 mb-2" />
            <div className="h-3 w-3/5 rounded bg-foreground/15 mb-8" />
            <div className="inline-flex h-10 w-32 rounded-md bg-primary/80" />
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="h-20 rounded-lg bg-foreground/10" />
              <div className="h-20 rounded-lg bg-foreground/10" />
              <div className="h-20 rounded-lg bg-foreground/10" />
            </div>
          </div>

          {/* Pins */}
          {pins.map((pin) => (
            <div
              key={pin.id}
              className="absolute"
              style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%, -50%)" }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveId(activeId === pin.id ? null : pin.id);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-background hover:scale-110 transition-transform animate-in zoom-in"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
              </button>
              {activeId === pin.id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-8 top-0 w-56 rounded-lg border border-border bg-popover p-3 shadow-xl text-left cursor-default animate-in fade-in slide-in-from-left-2"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-foreground">{pin.author}</span>
                    <button
                      onClick={() => {
                        setPins((p) => p.filter((x) => x.id !== pin.id));
                        setActiveId(null);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-xs text-foreground/80 leading-snug">{pin.text}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Chaque commentaire est ancré au pixel près. Vos clients voient exactement ce qu'ils veulent corriger.
      </p>
    </div>
  );
}
