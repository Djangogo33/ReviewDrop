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
      { title: "ReviewDrop — Recueillez les feedbacks clients en 30 secondes" },
      { name: "description", content: "L'outil de feedback visuel pour freelances web. Vos clients commentent directement sur vos sites et maquettes — sans email, sans chaos." },
      { name: "author", content: "ReviewDrop" },
      { property: "og:title", content: "ReviewDrop — Recueillez les feedbacks clients en 30 secondes" },
      { property: "og:description", content: "L'outil de feedback visuel pour freelances web. Vos clients commentent directement sur vos sites et maquettes — sans email, sans chaos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ReviewDrop — Recueillez les feedbacks clients en 30 secondes" },
      { name: "twitter:description", content: "L'outil de feedback visuel pour freelances web. Vos clients commentent directement sur vos sites et maquettes — sans email, sans chaos." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d7c35e72-04d3-4495-a9b6-06b527861986/id-preview-ded5c66b--cca57c64-38f8-4796-b036-046a453e2951.lovable.app-1777102785275.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d7c35e72-04d3-4495-a9b6-06b527861986/id-preview-ded5c66b--cca57c64-38f8-4796-b036-046a453e2951.lovable.app-1777102785275.png" },
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
      <Outlet />
      <Toaster />
    </AuthProvider>
  );
}
