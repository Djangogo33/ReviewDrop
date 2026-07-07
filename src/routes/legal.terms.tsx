import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: [
      { title: "Conditions Générales d'Utilisation — ReviewDrop" },
      { name: "description", content: "CGU du service ReviewDrop : compte, abonnements, responsabilités et résiliation." },
      { property: "og:title", content: "CGU — ReviewDrop" },
      { property: "og:description", content: "Conditions générales d'utilisation de la plateforme ReviewDrop." },
      { property: "og:url", content: "https://reviewdrop.lovable.app/legal/terms" },
    ],
    links: [{ rel: "canonical", href: "https://reviewdrop.lovable.app/legal/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link to="/" className="font-bold">← ReviewDrop</Link>
        </div>
      </header>
      <article className="container mx-auto max-w-3xl px-4 py-12 prose prose-sm">
        <h1 className="text-3xl font-bold mb-2">Conditions Générales d'Utilisation</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
        </p>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-xl font-semibold mt-8">1. Objet</h2>
          <p>
            ReviewDrop est un service en ligne (SaaS) permettant aux freelances, agences et entreprises
            de collecter des retours visuels (« feedbacks ») de leurs clients sur des sites web et maquettes.
            Les présentes CGU régissent l'utilisation du service accessible à l'adresse reviewdrop.lovable.app.
          </p>

          <h2 className="text-xl font-semibold mt-8">2. Compte utilisateur</h2>
          <p>
            La création d'un compte est gratuite. L'utilisateur s'engage à fournir des informations exactes
            et à maintenir la confidentialité de ses identifiants. Il est seul responsable de toute activité
            réalisée depuis son compte.
          </p>

          <h2 className="text-xl font-semibold mt-8">3. Abonnements et facturation</h2>
          <p>
            Le service propose un plan gratuit (3 projets) et des abonnements payants Pro (9€/mois) et
            Max (19€/mois). Les abonnements sont sans engagement et peuvent être annulés à tout moment.
            La résiliation prend effet à la fin du mois en cours.
          </p>

          <h2 className="text-xl font-semibold mt-8">4. Utilisation acceptable</h2>
          <p>L'utilisateur s'interdit notamment :</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>de collecter du contenu illégal, diffamatoire, haineux ou portant atteinte aux droits d'autrui ;</li>
            <li>de tenter de contourner les limitations techniques du service ;</li>
            <li>d'utiliser le service à des fins de spam ou d'envoi massif de messages non sollicités ;</li>
            <li>de revendre ou redistribuer le service sans autorisation écrite.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8">5. Données et propriété</h2>
          <p>
            L'utilisateur reste propriétaire des données et contenus qu'il publie sur le service.
            Il accorde à ReviewDrop une licence non exclusive permettant de stocker et afficher ces
            contenus dans le cadre du fonctionnement normal du service.
          </p>

          <h2 className="text-xl font-semibold mt-8">6. Disponibilité — Phase bêta</h2>
          <p>
            ReviewDrop est actuellement en phase bêta. Le service est fourni « tel quel » sans garantie
            de disponibilité ou d'absence d'erreurs. L'éditeur s'efforce de maintenir un service de qualité
            mais ne peut être tenu responsable des interruptions ou pertes de données.
          </p>

          <h2 className="text-xl font-semibold mt-8">7. Résiliation</h2>
          <p>
            L'utilisateur peut supprimer son compte à tout moment depuis la section « Compte » de son
            tableau de bord. L'éditeur se réserve le droit de suspendre un compte en cas de violation
            des présentes CGU.
          </p>

          <h2 className="text-xl font-semibold mt-8">8. Droit applicable</h2>
          <p>
            Les présentes CGU sont régies par le droit français. Tout litige sera soumis aux tribunaux
            compétents du ressort du siège de l'éditeur.
          </p>

          <h2 className="text-xl font-semibold mt-8">9. Contact</h2>
          <p>
            Pour toute question : <a href="mailto:djangogo33.tdac@gmail.com" className="text-primary underline">djangogo33.tdac@gmail.com</a>
          </p>

          <p className="mt-12 text-xs text-muted-foreground">
            Voir aussi : <Link to="/legal/privacy" className="underline">Politique de confidentialité</Link>
          </p>
        </section>
      </article>
    </div>
  );
}
