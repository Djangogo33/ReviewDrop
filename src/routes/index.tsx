import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { MessageSquarePlus, MousePointerClick, Bell, Image, Code2, Check } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ReviewDrop — Feedback client visuel en 30 secondes" },
      { name: "description", content: "Recueillez les retours de vos clients directement sur vos sites web et maquettes. Sans email, sans chaos. L'outil pensé pour les freelances web et graphistes." },
      { property: "og:title", content: "ReviewDrop — Feedback client visuel pour freelances" },
      { property: "og:description", content: "Vos clients commentent directement sur vos sites et maquettes en 30 secondes." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user } = useAuth();

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
            <a href="#features" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground">Fonctionnalités</a>
            <a href="#pricing" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground">Tarifs</a>
            {user ? (
              <Link to="/dashboard"><Button size="sm">Dashboard</Button></Link>
            ) : (
              <>
                <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Connexion</Link>
                <Link to="/signup"><Button size="sm">Essayer gratuitement</Button></Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 sm:py-28 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Pensé pour les freelances français
        </div>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl sm:text-6xl font-bold tracking-tight text-foreground">
          Recueillez les feedbacks clients en{" "}
          <span className="text-primary">30 secondes</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Vos clients cliquent directement sur votre site ou maquette pour laisser un commentaire ancré au pixel près. Pas d'email, pas de PDF annoté à rallonge, pas de chaos.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/signup">
            <Button size="lg" className="w-full sm:w-auto">Commencer gratuitement</Button>
          </Link>
          <a href="#how" className="text-sm text-muted-foreground hover:text-foreground">
            Voir comment ça marche →
          </a>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">3 projets gratuits • Sans carte bancaire</p>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold">Comment ça marche</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { icon: Code2, title: "1. Collez le snippet", desc: "Une ligne de code dans le <head> de votre site. Compatible WordPress, Webflow, React, Vue, Framer." },
              { icon: MousePointerClick, title: "2. Le client commente", desc: "Il clique sur l'élément concerné, tape son retour. Vous recevez le contexte (URL, position, capture)." },
              { icon: Bell, title: "3. Vous résolvez", desc: "Tout dans votre dashboard : statut open, en cours, résolu. Notifications email en temps réel." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-center text-3xl font-bold">Tout ce qu'il faut, rien de plus</h2>
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          {[
            { icon: MousePointerClick, title: "Commentaires ancrés", desc: "Position au pixel, sélecteur CSS, viewport — vous savez exactement à quoi le client fait référence." },
            { icon: Image, title: "Mode maquette", desc: "Pas encore de site live ? Uploadez une image PNG/JPG, partagez le lien, le client commente dessus." },
            { icon: Bell, title: "Notifications email", desc: "Soyez alerté à chaque nouveau retour, sans rafraîchir le dashboard." },
            { icon: Check, title: "Workflow de résolution", desc: "Open, en cours, résolu. Notes internes pour suivre votre travail." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-y border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold">Tarifs simples</h2>
          <p className="mt-3 text-center text-muted-foreground">Commencez gratuitement, passez Pro quand vous êtes prêt.</p>
          <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-xl font-semibold">Free</h3>
              <p className="mt-1 text-sm text-muted-foreground">Pour tester et démarrer</p>
              <p className="mt-6 text-4xl font-bold">0€<span className="text-base font-normal text-muted-foreground">/mois</span></p>
              <ul className="mt-6 space-y-2 text-sm">
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary" />3 projets actifs</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary" />Feedbacks illimités</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary" />Notifications email</li>
              </ul>
              <Link to="/signup" className="mt-6 block">
                <Button variant="outline" className="w-full">Commencer</Button>
              </Link>
            </div>
            <div className="rounded-lg border-2 border-primary bg-card p-6 relative">
              <div className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">Recommandé</div>
              <h3 className="text-xl font-semibold">Pro</h3>
              <p className="mt-1 text-sm text-muted-foreground">Pour les freelances actifs</p>
              <p className="mt-6 text-4xl font-bold">9€<span className="text-base font-normal text-muted-foreground">/mois</span></p>
              <ul className="mt-6 space-y-2 text-sm">
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary" />Projets illimités</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary" />Feedbacks illimités</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary" />Personnalisation widget</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary" />Support prioritaire</li>
              </ul>
              <Link to="/signup" className="mt-6 block">
                <Button className="w-full">Essayer Pro</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ReviewDrop. Fait en France.
        </div>
      </footer>
    </div>
  );
}
