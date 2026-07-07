import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ReviewDrop — Feedback client visuel" },
      { name: "description", content: "Recueillez les retours clients directement sur vos sites et maquettes. Sans email, sans chaos. Pensé pour les freelances web." },
      { name: "author", content: "ReviewDrop" },
      { property: "og:site_name", content: "ReviewDrop" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_FR" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "ReviewDrop — Feedback client visuel en 30 secondes" },
      { name: "twitter:title", content: "ReviewDrop — Feedback client visuel en 30 secondes" },
      { property: "og:description", content: "Retours clients visuels sur vos sites et maquettes. Sans email, sans chaos. Pensé pour freelances web." },
      { name: "twitter:description", content: "Retours clients visuels sur vos sites et maquettes. Sans email, sans chaos. Pensé pour freelances web." },
      // NOTE: og:image and twitter:image MUST live on leaf routes only.
      // A root-level og:image is concatenated into every route and overrides
      // each leaf's share preview. Set them per-route in src/routes/*.tsx.
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <main>
        <Outlet />
      </main>
      <Toaster />
    </AuthProvider>
  );
}
