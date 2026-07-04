# Plan d'amélioration ReviewDrop

Objectif : renforcer conversion, UX, fonctionnalités et qualité — sans toucher aux paiements. Découpé en 4 lots livrables indépendamment.

---

## Lot 1 — Conversion & landing (`src/routes/index.tsx`)

But : donner envie d'essayer en < 10 secondes.

- **Hero plus vendeur** : titre orienté bénéfice ("Collectez les retours de vos utilisateurs, sans friction"), sous-titre, double CTA (Essayer gratuitement / Voir la démo), badge "Beta gratuite".
- **Preuve sociale** : bandeau logos "propulsé sur X projets", 2–3 témoignages courts (placeholders honnêtes en beta).
- **Section "Comment ça marche"** en 3 étapes (Créer projet → Coller le widget → Recevoir feedbacks + notifs Discord).
- **Section fonctionnalités** en grille (Widget 1-ligne, Catégorisation IA, Réponses, Webhooks Discord/Slack, Export CSV, Analytics).
- **Aperçu widget interactif** existant (`InteractiveDemo`) mis en avant plus haut.
- **FAQ** (6 questions) + **CTA final**.
- **SEO** : title/description/OG spécifiques, JSON-LD `SoftwareApplication`, canonical.
- **Pages dédiées** manquantes : `/features`, `/pricing` (déjà `billing` côté app mais page publique lisible), `/vs/*` (déjà `vs.marker`, ajouter 1–2 comparatifs).

## Lot 2 — UX Dashboard

- **Onboarding tour** : vérifier qu'il se déclenche bien au 1er login (flag `onboarding_seen` sur profile) et couvre : créer projet → installer widget → voir feedback → configurer webhook.
- **États vides** soignés partout (projets, feedbacks, webhooks, analytics) avec CTA clair + capture d'écran d'exemple.
- **Feedbacks** :
  - Recherche plein texte + filtres combinables (catégorie, statut, note, date) déjà présents → ajouter tri, pagination, compteur.
  - Vue détail feedback en drawer plutôt que reload.
  - Actions rapides (changer statut, répondre) au survol.
- **Realtime** : brancher `supabase.channel` sur `feedbacks` et `feedback_replies` pour maj live (déjà partiellement en place, à vérifier).
- **Navigation** : sidebar mobile propre, breadcrumbs sur pages profondes, indicateur de projet actif.
- **Notifications in-app** (cloche) pour nouveaux feedbacks non lus.

## Lot 3 — Nouvelles fonctionnalités

Prioritaires (impact / effort) :

1. **Notifications email** au propriétaire à chaque nouveau feedback (via Lovable email + template simple, opt-in dans les settings projet).
2. **Tags manuels** sur feedbacks (en plus de la catégorie IA) + filtre par tag.
3. **Assignation** d'un feedback à un membre (préparer table `project_members`, pour l'instant = owner seulement).
4. **Vue publique roadmap** optionnelle par projet (`/p/:slug/roadmap`) : feedbacks marqués "planned/in-progress/done", votes anonymes.
5. **Widget** : props supplémentaires (position, langue FR/EN, thème dark auto), capture d'écran optionnelle (html2canvas), champ email optionnel configurable.
6. **Export CSV** : ajouter export JSON + filtrable selon la vue courante.
7. **Webhooks** : ajouter Microsoft Teams (même principe que Discord/Slack) et event `feedback.deleted`.

## Lot 4 — Qualité & fiabilité

- **Audit runtime** : parcours complet (signup, création projet, submit widget, réponse, webhook test, export, delete account) → corriger bugs trouvés.
- **SEO global** : `sitemap.xml` à jour avec toutes les routes publiques, `robots.txt` OK, meta par route (login, signup, changelog, legal, demo, vs).
- **Accessibilité** : labels aria manquants, contraste, focus visible, navigation clavier sur drawers/dialogs.
- **Perf** : lazy-load routes dashboard, images en `loading="lazy"`, `Suspense` sur listes lourdes.
- **i18n** : le site est mixte FR/EN → choisir une langue par défaut (FR vu le contenu) et harmoniser, ou préparer i18n light (dictionnaire simple).
- **Erreurs** : `errorComponent` + `notFoundComponent` sur toutes les routes avec loader, page 404 custom.
- **Sécurité** : relire policies RLS des tables clés (`feedbacks`, `webhooks`, `webhook_deliveries`, `projects`, `user_roles`), `security--run_security_scan`.
- **Analytics interne** : vérifier que la page `/dashboard/analytics` affiche bien tout (volumes, catégories, taux de réponse, tendance).

---

## Ordre d'exécution proposé

1. Lot 4 (bugs + SEO + a11y) — base saine.
2. Lot 2 (UX dashboard + realtime + onboarding) — rétention.
3. Lot 1 (landing + pages publiques) — acquisition.
4. Lot 3 (nouvelles fonctionnalités) — par ordre d'impact (emails → tags → roadmap publique → widget → Teams).

## Détails techniques

- Emails : `Lovable AI Gateway` non applicable → utiliser Resend via connector standard (`standard_connectors--connect`) ou fonction email intégrée.
- Realtime : `supabase.channel('feedbacks:project=' + id).on('postgres_changes', …)` côté client, invalider la query TanStack correspondante.
- Roadmap publique : nouvelle route `src/routes/p.$slug.roadmap.tsx`, RLS lecture publique filtrée sur `feedbacks.is_public = true`.
- Tags : nouvelle table `feedback_tags(id, project_id, label, color)` + `feedback_tag_links(feedback_id, tag_id)`, GRANT + RLS via `has_role`/ownership.
- Notifications email : préférence par projet `email_notifications_enabled boolean default true`, envoi dans `api.public.feedback.ts` après insert.
- Sitemap : régénérer depuis `routeTree.gen.ts` ou lister à la main dans `sitemap[.]xml.ts`.

## Hors périmètre

- Paiements (Stripe/Paddle/plans) : intacts.
- Refonte visuelle radicale : ce plan garde le design system actuel.
- Multi-workspace / équipes payantes : différé (préparation seulement via `project_members`).
