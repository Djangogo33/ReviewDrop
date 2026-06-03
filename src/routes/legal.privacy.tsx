import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — ReviewDrop" },
      { name: "description", content: "Politique de confidentialité et traitement des données personnelles." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link to="/" className="font-bold">← ReviewDrop</Link>
        </div>
      </header>
      <article className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
        </p>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-xl font-semibold mt-8">1. Responsable du traitement</h2>
          <p>
            Le responsable du traitement des données est l'éditeur de ReviewDrop, joignable à
            l'adresse <a href="mailto:paul.ardant@gmail.com" className="text-primary underline">paul.ardant@gmail.com</a>.
          </p>

          <h2 className="text-xl font-semibold mt-8">2. Données collectées</h2>
          <p>Nous collectons les données suivantes :</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Compte</strong> : email, nom complet (optionnel), mot de passe chiffré ou identifiant OAuth.</li>
            <li><strong>Projets</strong> : noms, URL de sites, maquettes téléversées.</li>
            <li><strong>Feedbacks</strong> : messages laissés par vos clients, position du clic, URL de la page, taille du viewport, user-agent du navigateur.</li>
            <li><strong>Anti-fraude</strong> : hash de l'adresse IP lors de l'inscription (non réversible, utilisé pour limiter les fraudes au parrainage).</li>
            <li><strong>Paiement</strong> : géré par notre prestataire (Stripe). Nous ne stockons jamais vos données bancaires.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8">3. Finalités</h2>
          <p>Vos données sont utilisées pour :</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Fournir le service (création de projets, collecte de feedbacks) ;</li>
            <li>Vous envoyer des notifications transactionnelles (nouveau feedback, facturation) ;</li>
            <li>Améliorer le service via des statistiques agrégées et anonymes ;</li>
            <li>Détecter et prévenir les abus du programme de parrainage.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8">4. Base légale</h2>
          <p>
            Le traitement de vos données repose sur l'exécution du contrat (CGU), votre consentement
            pour certaines fonctionnalités optionnelles, et notre intérêt légitime à sécuriser le service.
          </p>

          <h2 className="text-xl font-semibold mt-8">5. Hébergement</h2>
          <p>
            Les données sont hébergées sur une infrastructure située dans l'Union Européenne (Supabase EU,
            Cloudflare). Aucun transfert hors UE n'est effectué pour vos données de service.
          </p>

          <h2 className="text-xl font-semibold mt-8">6. Durée de conservation</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Données de compte : conservées tant que le compte est actif, puis supprimées sous 30 jours après résiliation.</li>
            <li>Feedbacks : conservés tant que le projet associé existe.</li>
            <li>Données de facturation : 10 ans (obligation légale comptable).</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8">7. Vos droits (RGPD)</h2>
          <p>
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement,
            de portabilité et d'opposition. Vous pouvez exercer ces droits :
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>directement depuis la section « Compte » de votre dashboard (export ou suppression) ;</li>
            <li>en écrivant à <a href="mailto:paul.ardant@gmail.com" className="text-primary underline">paul.ardant@gmail.com</a>.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8">8. Cookies</h2>
          <p>
            Nous utilisons uniquement des cookies techniques nécessaires à l'authentification.
            Aucun cookie publicitaire ou de tracking tiers n'est déposé sans votre consentement.
          </p>

          <h2 className="text-xl font-semibold mt-8">9. Sécurité</h2>
          <p>
            Les communications sont chiffrées en HTTPS. Les mots de passe sont hashés. L'accès aux
            données est restreint par des politiques de sécurité de niveau base de données (RLS).
          </p>

          <h2 className="text-xl font-semibold mt-8">10. Réclamation</h2>
          <p>
            Vous pouvez introduire une réclamation auprès de la CNIL (www.cnil.fr) si vous estimez que
            le traitement de vos données ne respecte pas la réglementation.
          </p>

          <p className="mt-12 text-xs text-muted-foreground">
            Voir aussi : <Link to="/legal/terms" className="underline">Conditions Générales d'Utilisation</Link>
          </p>
        </section>
      </article>
    </div>
  );
}
