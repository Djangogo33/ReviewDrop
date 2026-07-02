## Objectif

Compléter les fonctionnalités déjà ébauchées pour qu'elles soient toutes utilisables de bout en bout. Les paiements Stripe restent inertes (déjà pilotés par le mode beta).

## État actuel (audit rapide)

- Onboarding tour : composant + `profiles.onboarded_at` OK, monté dans `DashboardLayout` → ✅ déjà branché.
- Threads dashboard : UI de réponse existe dans `dashboard.projects.$projectId.tsx` (INSERT dans `feedback_replies`) mais **pas de Realtime** et **pas d'affichage côté visiteur** (`r.$token.tsx` et `widget.js`).
- Filtres : filtre par statut ✅, filtre par catégorie ❌.
- Export CSV : ✅ déjà branché.
- Webhooks : listés comme "inclus beta" mais **aucune table, aucune UI, aucun envoi**.
- Realtime : activé côté DB pour `feedback_replies` mais non consommé côté UI.

## Ce que je vais livrer

### 1. Threads visibles côté visiteur + Realtime

- `r.$token.tsx` : après soumission, garder la référence du feedback créé (renvoyée par `/api/public/feedback`) et afficher la liste des réponses de l'équipe pour ce feedback, avec un abonnement Realtime `postgres_changes` sur `feedback_replies` filtré par `feedback_id`. Petit CTA "Voir les réponses" avec token stocké en `localStorage` pour retrouver les feedbacks postés depuis ce navigateur.
- `api.public.feedback.ts` : renvoyer `{ id }` du feedback créé (déjà fait à vérifier) ; ajouter un handler `GET /api/public/feedback/:id/replies` (nouveau server route) qui expose uniquement `author_name`, `body`, `created_at` des réponses non-internes via client publishable + policy `TO anon` étroite.
- Migration : nouvelle colonne `feedback_replies.is_internal boolean default false` + policy anon SELECT restreinte à `is_internal = false`.
- `dashboard.projects.$projectId.tsx` : abonnement Realtime sur `feedback_replies` du feedback ouvert pour rafraîchir sans reload ; checkbox "Note interne" à la saisie.
- `public/widget.js` : afficher un message de confirmation avec lien "Suivre ma demande" pointant vers `/r/<token>?f=<feedbackId>`.

### 2. Filtres catégorie + statut unifiés

- `dashboard.projects.$projectId.tsx` : ajouter un `<select>` catégorie (bug/idée/question/UX/autre/toutes) qui combine avec le filtre statut existant. Compteurs mis à jour.
- Bouton "Re-catégoriser" sur un feedback qui ré-appelle la server fn `categorize` (déjà existante).

### 3. Webhooks sortants

- Migration : nouvelle table `public.webhooks` (`project_id`, `url`, `secret`, `events text[]`, `is_active`, timestamps) + `webhook_deliveries` (log succès/échec, réponse HTTP tronquée, `attempt_count`). GRANT authenticated + RLS via `projects.owner_id`.
- Nouvelle page `dashboard.projects.$projectId.webhooks.tsx` : CRUD (URL, secret auto-généré, choix des évènements `feedback.created`, `feedback.status_changed`, `reply.created`), bouton "Envoyer un test", historique des 20 dernières livraisons.
- Server fn `dispatchWebhook` (`src/lib/webhooks.functions.ts`) : lit les webhooks actifs du projet correspondant à l'évènement, POST JSON signé HMAC-SHA256 (`x-reviewdrop-signature`), timeout 5s, journalise dans `webhook_deliveries`. Appelée en `waitUntil`-style (fire-and-forget) depuis :
  - `api.public.feedback.ts` après INSERT (`feedback.created`)
  - `dashboard.projects.$projectId.tsx` via une server fn `updateFeedbackStatus` (nouveau) qui centralise le UPDATE et déclenche `feedback.status_changed`
  - même approche pour `reply.created`

### 4. Nettoyage cohérence

- `src/lib/plans.ts` : la liste beta annonce "Domaine personnalisé" — hors scope paiement mais aussi hors scope de cette itération : conserver l'affichage sans code mort supplémentaire.
- Vérifier que `dashboard.billing` reste en mode beta (aucun changement).

## Détails techniques

- Nouveaux fichiers :
  - `src/routes/dashboard.projects.$projectId.webhooks.tsx`
  - `src/routes/api.public.feedback-replies.$id.ts` (GET public restreint)
  - `src/lib/webhooks.functions.ts` (`listWebhooks`, `upsertWebhook`, `deleteWebhook`, `sendTestWebhook`, `dispatchEvent`)
- Migration unique :
  - `feedback_replies.is_internal boolean not null default false`
  - policy anon `SELECT` sur `feedback_replies` filtrée `is_internal = false`
  - `CREATE TABLE public.webhooks` + GRANT + RLS (owner via `projects.owner_id`)
  - `CREATE TABLE public.webhook_deliveries` + GRANT + RLS lecture seule owner
- Realtime : `ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback_replies` (à ajouter si absent).
- Signature HMAC : `crypto.createHmac('sha256', secret).update(rawBody).digest('hex')`, préfixe `sha256=`.
- Toutes les nouvelles routes dashboard sont protégées par `RequireAuth` + `DashboardLayout` (pattern existant).

## Hors scope explicite

- Toute activation Stripe / portail client / prix / limites payantes → paiements gelés en beta comme demandé.
- Domaine personnalisé du widget.

## Ordre d'exécution

1. Migration DB (threads privés + webhooks + realtime replies).
2. Threads visibles + Realtime (dashboard + r.$token + widget.js).
3. Filtre catégorie + re-catégoriser.
4. Webhooks (server fn, UI, dispatch depuis les 3 évènements).
5. Passage rapide QA sur les parcours principaux.
