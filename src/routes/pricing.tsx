import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Check, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = [
  {
    q: "Puis-je annuler à tout moment ?",
    a: "Oui. L'abonnement est sans engagement, résiliable en un clic depuis la page Facturation. Vous gardez l'accès jusqu'à la fin de la période payée.",
  },
  {
    q: "Que se passe-t-il quand j'atteins la limite Free ?",
    a: "Vous conservez l'accès à vos 3 projets existants avec un nombre illimité de feedbacks. Pour créer un 4ᵉ projet, passez sur Pro.",
  },
  {
    q: "Puis-je changer de plan quand je veux ?",
    a: "Oui, à la hausse comme à la baisse. Les changements sont proratisés automatiquement.",
  },
  {
    q: "Les feedbacks sont-ils limités ?",
    a: "Non. Tous les plans (Free inclus) offrent un nombre illimité de feedbacks par projet.",
  },
  {
    q: "Y a-t-il une remise annuelle ?",
    a: "Oui, 2 mois offerts en payant à l'année. L'option est proposée au moment de la souscription.",
  },
  {
    q: "Vous acceptez quels moyens de paiement ?",
    a: "Carte bancaire, Apple Pay, Google Pay et virement SEPA via Stripe.",
  },
];

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Tarifs — ReviewDrop" },
      {
        name: "description",
        content:
          "Free, Pro (9€/mois) et Max (19€/mois). Feedbacks illimités sur tous les plans, sans engagement. Choisissez la formule adaptée à votre activité.",
      },
      { property: "og:title", content: "Tarifs ReviewDrop — à partir de 0€" },
      {
        property: "og:description",
        content:
          "3 formules, feedbacks illimités, sans carte bancaire pour démarrer. Passez sur Pro dès que vous en avez besoin.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://reviewdrop.lovable.app/pricing" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://reviewdrop.lovable.app/pricing" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: PricingPage,
});

type Row = { label: string; free: boolean | string; pro: boolean | string; max: boolean | string };

const ROWS: Row[] = [
  { label: "Projets actifs", free: "3", pro: "Illimité", max: "Illimité" },
  { label: "Feedbacks par projet", free: "Illimité", pro: "Illimité", max: "Illimité" },
  { label: "Widget JavaScript", free: true, pro: true, max: true },
  { label: "Mode maquette (upload image)", free: true, pro: true, max: true },
  { label: "Screenshots automatiques", free: true, pro: true, max: true },
  { label: "Notifications in-app + email", free: true, pro: true, max: true },
  { label: "Catégorisation IA", free: true, pro: true, max: true },
  { label: "Couleur du widget personnalisable", free: false, pro: true, max: true },
  { label: "Export CSV", free: false, pro: true, max: true },
  { label: "Support prioritaire", free: false, pro: true, max: true },
  { label: "Badge « ReviewDrop » masqué", free: false, pro: false, max: true },
  { label: "Webhooks & intégrations", free: false, pro: false, max: true },
  { label: "Support dédié sous 24h", free: false, pro: false, max: true },
];

function Cell({ v }: { v: boolean | string }) {
  if (typeof v === "string")
    return <span className="text-sm font-medium">{v}</span>;
  return v ? (
    <Check className="h-4 w-4 text-primary inline-block" />
  ) : (
    <X className="h-4 w-4 text-muted-foreground/40 inline-block" />
  );
}

function PricingPage() {
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
          <nav className="flex items-center gap-3">
            <Link to="/features" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground">
              Fonctionnalités
            </Link>
            <Link to="/pricing" className="hidden sm:inline text-sm text-primary font-medium">
              Tarifs
            </Link>
            <Link to="/demo" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground">
              Démo
            </Link>
            <Link to="/signup">
              <Button size="sm">Essayer gratuitement</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16 sm:py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Des tarifs simples.</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Feedbacks illimités sur toutes les formules. Démarrez gratuitement, passez sur Pro dès
          que vous avez besoin de plus.
        </p>
      </section>

      {/* Cards */}
      <section className="container mx-auto px-4">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6 flex flex-col">
            <h2 className="text-xl font-semibold">Free</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pour tester et démarrer</p>
            <p className="mt-6 text-4xl font-bold">0€<span className="text-base font-normal text-muted-foreground">/mois</span></p>
            <ul className="mt-6 space-y-2 text-sm flex-1">
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />3 projets actifs</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Feedbacks illimités</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Widget + mode maquette</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Screenshots automatiques</li>
            </ul>
            <Link to="/signup" className="mt-6 block">
              <Button variant="outline" className="w-full">Commencer</Button>
            </Link>
          </div>

          <div className="rounded-lg border-2 border-primary bg-card p-6 relative flex flex-col">
            <div className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
              Recommandé
            </div>
            <h2 className="text-xl font-semibold">Pro</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pour les freelances actifs</p>
            <p className="mt-6 text-4xl font-bold">9€<span className="text-base font-normal text-muted-foreground">/mois</span></p>
            <ul className="mt-6 space-y-2 text-sm flex-1">
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Projets illimités</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Widget personnalisable</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Export CSV</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Support prioritaire</li>
            </ul>
            <Link to="/signup" className="mt-6 block">
              <Button className="w-full">Essayer Pro</Button>
            </Link>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 flex flex-col">
            <h2 className="text-xl font-semibold">Max</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pour les agences</p>
            <p className="mt-6 text-4xl font-bold">19€<span className="text-base font-normal text-muted-foreground">/mois</span></p>
            <ul className="mt-6 space-y-2 text-sm flex-1">
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Tout du plan Pro</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Badge ReviewDrop masqué</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Webhooks & Slack</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Support 24h dédié</li>
            </ul>
            <Link to="/signup" className="mt-6 block">
              <Button variant="outline" className="w-full">Choisir Max</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-center text-3xl font-bold">Comparer les formules</h2>
        <div className="mx-auto mt-10 max-w-4xl overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-semibold">Fonctionnalité</th>
                <th className="p-3 font-semibold text-center">Free</th>
                <th className="p-3 font-semibold text-center text-primary">Pro</th>
                <th className="p-3 font-semibold text-center">Max</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.label} className="border-t border-border">
                  <td className="p-3">{r.label}</td>
                  <td className="p-3 text-center"><Cell v={r.free} /></td>
                  <td className="p-3 text-center bg-primary/5"><Cell v={r.pro} /></td>
                  <td className="p-3 text-center"><Cell v={r.max} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-center text-3xl font-bold">Questions sur la facturation</h2>
          <Accordion type="single" collapsible className="mt-8">
            {FAQ.map((f, i) => (
              <AccordionItem key={f.q} value={`q${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Prêt à essayer gratuitement ?</h2>
          <p className="mt-3 text-muted-foreground">3 projets, sans carte bancaire.</p>
          <div className="mt-8">
            <Link to="/signup">
              <Button size="lg">Commencer gratuitement</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/" className="hover:text-foreground">Accueil</Link>
            <span>·</span>
            <Link to="/features" className="hover:text-foreground">Fonctionnalités</Link>
            <span>·</span>
            <Link to="/changelog" className="hover:text-foreground">Changelog</Link>
            <span>·</span>
            <Link to="/legal/terms" className="hover:text-foreground">CGU</Link>
            <span>·</span>
            <Link to="/legal/privacy" className="hover:text-foreground">Confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
