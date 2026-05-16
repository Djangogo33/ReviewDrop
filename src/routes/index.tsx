import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { MessageSquarePlus, MousePointerClick, Bell, Image, Code2, Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
            <Link to="/demo" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground">Démo</Link>
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
          <p className="mt-3 text-center text-muted-foreground">Commencez gratuitement, montez en gamme quand vous êtes prêt.</p>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
            {/* Free */}
            <div className="rounded-lg border border-border bg-card p-6 flex flex-col">
              <h3 className="text-xl font-semibold">Free</h3>
              <p className="mt-1 text-sm text-muted-foreground">Pour tester et démarrer</p>
              <p className="mt-6 text-4xl font-bold">0€<span className="text-base font-normal text-muted-foreground">/mois</span></p>
              <ul className="mt-6 space-y-2 text-sm flex-1">
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />3 projets actifs</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Feedbacks illimités</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Widget JS + mode maquette</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Notifications email</li>
                <li className="flex gap-2 text-muted-foreground"><Check className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />Badge « ReviewDrop » sur le widget</li>
              </ul>
              <Link to="/signup" className="mt-6 block">
                <Button variant="outline" className="w-full">Commencer</Button>
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-lg border-2 border-primary bg-card p-6 relative flex flex-col">
              <div className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">Recommandé</div>
              <h3 className="text-xl font-semibold">Pro</h3>
              <p className="mt-1 text-sm text-muted-foreground">Pour les freelances actifs</p>
              <p className="mt-6 text-4xl font-bold">9€<span className="text-base font-normal text-muted-foreground">/mois</span></p>
              <ul className="mt-6 space-y-2 text-sm flex-1">
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Projets illimités</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Couleur du widget personnalisable</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Export CSV des feedbacks</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Support prioritaire</li>
                <li className="flex gap-2 text-muted-foreground"><Check className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />Badge « ReviewDrop » sur le widget</li>
              </ul>
              <Link to="/signup" className="mt-6 block">
                <Button className="w-full">Essayer Pro</Button>
              </Link>
            </div>

            {/* Max */}
            <div className="rounded-lg border border-border bg-card p-6 flex flex-col">
              <h3 className="text-xl font-semibold">Max</h3>
              <p className="mt-1 text-sm text-muted-foreground">Pour les agences</p>
              <p className="mt-6 text-4xl font-bold">19€<span className="text-base font-normal text-muted-foreground">/mois</span></p>
              <ul className="mt-6 space-y-2 text-sm flex-1">
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Tout du plan Pro</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Suppression du badge ReviewDrop</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Webhooks &amp; intégrations Slack</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Domaine personnalisé du widget</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />Support dédié sous 24h</li>
              </ul>
              <Link to="/signup" className="mt-6 block">
                <Button variant="outline" className="w-full">Choisir Max</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container mx-auto px-4 py-20">
        <h2 className="text-center text-3xl font-bold">Questions fréquentes</h2>
        <div className="mx-auto mt-10 max-w-2xl">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="q1">
              <AccordionTrigger>Comment installer le widget sur mon site ?</AccordionTrigger>
              <AccordionContent>
                Une fois votre projet créé, vous obtenez un snippet à coller dans la balise{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">&lt;head&gt;</code> de votre site.
                Compatible avec WordPress, Webflow, Framer, Shopify, ainsi que toutes les apps
                React, Vue ou Svelte (SPA inclus).
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger>Mes clients doivent-ils créer un compte ?</AccordionTrigger>
              <AccordionContent>
                Non. Ils cliquent sur le widget, écrivent leur retour et c'est tout.
                Vous recevez le contexte complet : URL, position du clic, capture d'écran et
                navigateur utilisé. Pas de friction pour le client.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3">
              <AccordionTrigger>Et si je n'ai qu'une maquette, pas encore de site ?</AccordionTrigger>
              <AccordionContent>
                Créez un projet de type « Maquette » et uploadez votre image (PNG ou JPG).
                Vous obtenez un lien à partager : votre client commente directement sur la
                maquette, comme s'il était sur un vrai site.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q4">
              <AccordionTrigger>Quelle est la différence entre Free et Pro ?</AccordionTrigger>
              <AccordionContent>
                Le plan Free vous permet de gérer jusqu'à 3 projets actifs avec un nombre
                illimité de feedbacks. Le plan Pro à 9€/mois débloque un nombre illimité de
                projets, la personnalisation du widget (couleur, position) et un support
                prioritaire.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q5">
              <AccordionTrigger>Puis-je annuler à tout moment ?</AccordionTrigger>
              <AccordionContent>
                Oui. L'abonnement Pro est sans engagement. Vous pouvez annuler en un clic
                depuis la page Facturation et conserver l'accès jusqu'à la fin du mois en cours.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q6">
              <AccordionTrigger>Mes données sont-elles hébergées en Europe ?</AccordionTrigger>
              <AccordionContent>
                Oui. ReviewDrop est hébergé sur une infrastructure européenne et conforme au RGPD.
                Vous restez propriétaire de vos données et pouvez les exporter ou les supprimer
                à tout moment.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Prêt à arrêter les emails de feedback en cascade ?</h2>
          <p className="mt-3 text-muted-foreground">3 projets gratuits, sans carte bancaire.</p>
          <div className="mt-8">
            <Link to="/signup">
              <Button size="lg">Commencer gratuitement</Button>
            </Link>
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
