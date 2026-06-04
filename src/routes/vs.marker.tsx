import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquarePlus, Check, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/vs/marker")({
  head: () => ({
    meta: [
      { title: "ReviewDrop vs Marker.io & BugHerd — comparatif freelances" },
      { name: "description", content: "Comparatif honnête entre ReviewDrop, Marker.io et BugHerd : prix, fonctionnalités, ergonomie pour freelances et petits studios web." },
      { property: "og:title", content: "ReviewDrop vs Marker.io vs BugHerd" },
      { property: "og:description", content: "Quel outil de feedback visuel choisir en 2026 quand on est freelance ?" },
    ],
  }),
  component: ComparisonPage,
});

type Row = {
  feature: string;
  reviewdrop: string | boolean;
  marker: string | boolean;
  bugherd: string | boolean;
};

const ROWS: Row[] = [
  { feature: "Prix d'entrée payant", reviewdrop: "9 €/mois", marker: "49 $/mois", bugherd: "49 $/mois" },
  { feature: "Plan gratuit utilisable", reviewdrop: true, marker: false, bugherd: false },
  { feature: "Pas de compte requis pour les clients", reviewdrop: true, marker: true, bugherd: true },
  { feature: "Mode maquette (upload image)", reviewdrop: true, marker: false, bugherd: false },
  { feature: "Snippet 1 ligne", reviewdrop: true, marker: true, bugherd: true },
  { feature: "Workflow open / en cours / résolu", reviewdrop: true, marker: true, bugherd: true },
  { feature: "Export CSV", reviewdrop: true, marker: true, bugherd: true },
  { feature: "Notifications email instantanées", reviewdrop: true, marker: true, bugherd: true },
  { feature: "Interface en français", reviewdrop: true, marker: false, bugherd: false },
  { feature: "Hébergement européen (RGPD)", reviewdrop: true, marker: false, bugherd: false },
  { feature: "Pensé pour les freelances solo", reviewdrop: true, marker: false, bugherd: false },
];

function Cell({ v }: { v: string | boolean }) {
  if (typeof v === "boolean") {
    return v ? (
      <Check className="h-5 w-5 text-emerald-500 mx-auto" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
    );
  }
  return <span className="text-sm">{v}</span>;
}

function ComparisonPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <MessageSquarePlus className="h-4 w-4" />
            </span>
            ReviewDrop
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Accueil
          </Link>
        </div>
      </header>

      <section className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-center">
          ReviewDrop vs Marker.io vs BugHerd
        </h1>
        <p className="mt-4 text-center text-muted-foreground max-w-2xl mx-auto">
          Marker.io et BugHerd sont d'excellents outils, mais conçus pour des équipes
          QA en agence. ReviewDrop est pensé pour <strong>les freelances et petits studios web</strong> qui
          veulent un outil simple, en français, à un tarif accessible.
        </p>

        <div className="mt-12 overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Fonctionnalité</th>
                <th className="px-4 py-3 text-center font-semibold text-primary">ReviewDrop</th>
                <th className="px-4 py-3 text-center font-semibold">Marker.io</th>
                <th className="px-4 py-3 text-center font-semibold">BugHerd</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.feature} className="border-t border-border">
                  <td className="px-4 py-3">{r.feature}</td>
                  <td className="px-4 py-3 text-center"><Cell v={r.reviewdrop} /></td>
                  <td className="px-4 py-3 text-center"><Cell v={r.marker} /></td>
                  <td className="px-4 py-3 text-center"><Cell v={r.bugherd} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 rounded-lg border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
          <strong className="text-foreground">À noter :</strong> Marker.io et BugHerd
          proposent des intégrations Jira / Trello / Linear poussées, utiles pour les
          équipes de plus de 10 personnes. Si c'est votre cas, ils restent un excellent
          choix. ReviewDrop est plus pertinent quand vous gérez 5–30 projets clients
          en solo ou à 2.
        </div>

        <div className="mt-12 text-center">
          <Link to="/signup">
            <Button size="lg">Essayer ReviewDrop gratuitement</Button>
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">3 projets gratuits • Sans carte bancaire</p>
        </div>
      </section>
    </div>
  );
}
