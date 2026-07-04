import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquarePlus, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog — ReviewDrop" },
      { name: "description", content: "Toutes les nouveautés et améliorations de ReviewDrop, mises à jour chaque semaine pendant la beta." },
      { property: "og:title", content: "Changelog ReviewDrop" },
      { property: "og:description", content: "Suivez l'évolution de ReviewDrop semaine après semaine." },
      { property: "og:url", content: "https://reviewdrop.lovable.app/changelog" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://reviewdrop.lovable.app/changelog" }],
  }),
  component: ChangelogPage,
});

type Entry = {
  date: string;
  version: string;
  tag: "new" | "improved" | "fixed";
  title: string;
  desc: string;
};

const ENTRIES: Entry[] = [
  {
    date: "4 juin 2026",
    version: "0.7.0",
    tag: "new",
    title: "Démo interactive sur la landing",
    desc: "Cliquez sur la maquette de la page d'accueil pour tester le placement de commentaires sans créer de compte.",
  },
  {
    date: "4 juin 2026",
    version: "0.7.0",
    tag: "new",
    title: "Pages légales CGU & RGPD",
    desc: "Conditions générales et politique de confidentialité disponibles pour la beta.",
  },
  {
    date: "4 juin 2026",
    version: "0.6.5",
    tag: "improved",
    title: "Anti-spam & rate limiting",
    desc: "Protection honeypot et limite de fréquence côté serveur pour l'endpoint public de feedback.",
  },
  {
    date: "4 juin 2026",
    version: "0.6.0",
    tag: "new",
    title: "Workflow de statuts",
    desc: "Chaque feedback peut être marqué Ouvert / En cours / Résolu, avec filtres dans le dashboard.",
  },
  {
    date: "4 juin 2026",
    version: "0.6.0",
    tag: "new",
    title: "Export CSV",
    desc: "Exportez tous les feedbacks d'un projet en un clic depuis la page projet.",
  },
  {
    date: "4 juin 2026",
    version: "0.5.0",
    tag: "new",
    title: "Mode maquette",
    desc: "Uploadez une image PNG/JPG et partagez un lien : vos clients commentent directement dessus.",
  },
  {
    date: "4 juin 2026",
    version: "0.4.0",
    tag: "new",
    title: "Programme de parrainage",
    desc: "Invitez d'autres freelances et gagnez du temps de Pro offert.",
  },
  {
    date: "4 juin 2026",
    version: "0.3.0",
    tag: "new",
    title: "Codes promo & accès beta",
    desc: "Les codes promo débloquent automatiquement des accès Pro/Max temporaires.",
  },
];

const TAG_STYLES: Record<Entry["tag"], string> = {
  new: "bg-primary/10 text-primary",
  improved: "bg-amber-500/10 text-amber-600",
  fixed: "bg-emerald-500/10 text-emerald-600",
};

const TAG_LABEL: Record<Entry["tag"], string> = {
  new: "Nouveau",
  improved: "Amélioré",
  fixed: "Corrigé",
};

function ChangelogPage() {
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

      <section className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
        <p className="mt-3 text-muted-foreground">
          Ce que nous avons livré récemment. Mis à jour chaque semaine pendant la beta.
        </p>

        <div className="mt-12 space-y-8">
          {ENTRIES.map((e, i) => (
            <article key={i} className="relative pl-6 border-l-2 border-border">
              <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs text-muted-foreground">{e.date}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs font-mono text-muted-foreground">v{e.version}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAG_STYLES[e.tag]}`}>
                  {TAG_LABEL[e.tag]}
                </span>
              </div>
              <h2 className="font-semibold">{e.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{e.desc}</p>
            </article>
          ))}
        </div>

        <div className="mt-16 rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Une idée, un bug, une demande ?
          </p>
          <a
            href="mailto:djangogo33.tdac@gmail.com"
            className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
          >
            djangogo33.tdac@gmail.com
          </a>
        </div>
      </section>
    </div>
  );
}
