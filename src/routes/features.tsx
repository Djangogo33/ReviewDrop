import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  MessageSquarePlus,
  MousePointerClick,
  Image as ImageIcon,
  Camera,
  Sparkles,
  Webhook,
  Download,
  Bell,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Fonctionnalités — ReviewDrop" },
      {
        name: "description",
        content:
          "Widget 1 ligne, mode maquette, screenshots auto, catégorisation IA, webhooks, export CSV. Tout pour recueillir du feedback client sans friction.",
      },
      { property: "og:title", content: "Fonctionnalités — ReviewDrop" },
      {
        property: "og:description",
        content:
          "Widget, mode maquette, screenshots, IA, webhooks : récoltez des retours clients pertinents en 30 secondes.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://reviewdrop.lovable.app/features" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://reviewdrop.lovable.app/features" }],
  }),
  component: FeaturesPage,
});

const FEATURES = [
  {
    icon: MousePointerClick,
    title: "Widget en 1 ligne",
    desc: "Un snippet à coller dans le <head>. Compatible WordPress, Webflow, Framer, React, Vue, Svelte. Aucune config à apprendre.",
  },
  {
    icon: ImageIcon,
    title: "Mode maquette",
    desc: "Pas encore de site en ligne ? Uploadez un PNG/JPG, partagez un lien, le client commente au pixel près.",
  },
  {
    icon: Camera,
    title: "Screenshots automatiques",
    desc: "Chaque feedback capture l'écran du client, l'URL, le viewport et le navigateur. Fini les allers-retours pour comprendre le contexte.",
  },
  {
    icon: Sparkles,
    title: "Catégorisation IA",
    desc: "Bug, idée, question, UX : chaque retour est classé automatiquement. Un résumé court vous fait gagner du temps sur les longs messages.",
  },
  {
    icon: Webhook,
    title: "Webhooks & intégrations",
    desc: "Poussez les feedbacks vers Slack, Discord, Linear, Notion ou n'importe quel endpoint HTTP en temps réel.",
  },
  {
    icon: Download,
    title: "Export CSV",
    desc: "Exportez l'historique complet de vos feedbacks en un clic pour vos reportings ou vos archives.",
  },
  {
    icon: Bell,
    title: "Notifications en temps réel",
    desc: "Cloche in-app + email : soyez prévenu dès qu'un client laisse un retour, où que vous soyez.",
  },
  {
    icon: Check,
    title: "Workflow de résolution",
    desc: "Statuts open / en cours / résolu, notes internes, réponses au client : suivez l'avancement sans quitter l'outil.",
  },
];

function FeaturesPage() {
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
            <Link to="/features" className="hidden sm:inline text-sm text-primary font-medium">
              Fonctionnalités
            </Link>
            <Link to="/pricing" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground">
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
        <h1 className="mx-auto max-w-3xl text-4xl sm:text-5xl font-bold tracking-tight">
          Toutes les fonctionnalités pour arrêter le chaos du feedback client.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          ReviewDrop remplace vos allers-retours par email, PDF annotés et captures Loom par un
          flux clair, contextualisé et exploitable.
        </p>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-lg">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Prêt à essayer ?</h2>
          <p className="mt-3 text-muted-foreground">3 projets gratuits, sans carte bancaire.</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/signup">
              <Button size="lg">Commencer gratuitement</Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline">
                Voir les tarifs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/" className="hover:text-foreground">Accueil</Link>
            <span>·</span>
            <Link to="/pricing" className="hover:text-foreground">Tarifs</Link>
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
