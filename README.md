# ReviewDrop — Plan de build MVP

## Vision

Une app SaaS qui permet aux freelances web français de recueillir des feedbacks visuels ancrés sur leurs sites/maquettes en 30 secondes, sans friction email pour le client.

## Architecture (3 composants)

```text
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Dashboard web  │     │   Widget JS      │     │  Notifications  │
│  (freelance)    │◄────│  (injecté chez   │────►│  email + temps  │
│                 │     │   le client)     │     │  réel           │
└────────┬────────┘     └──────────────────┘     └────────┬────────┘
         │                       │                         │
         └───────────────────────┴─────────────────────────┘
                          Lovable Cloud
                  (DB + Auth + Realtime + Storage)
```

## Périmètre MVP

**Inclus**
- Auth freelance (email + mot de passe + Google)
- Création de projet → génération d'un lien magique unique par projet
- Widget JS injectable (snippet `<script>` à coller, fonctionne sur sites statiques, WordPress, et SPA React/Vue avec re-positionnement au changement de route)
- Mode "maquette" : upload d'une image PNG/JPG, le client commente directement dessus via le même widget servi en page hébergée
- Commentaires ancrés à une position (x, y en %) avec capture du contexte (URL, viewport, sélecteur DOM)
- Identification du client par lien magique projet (pas d'email requis, juste un prénom)
- Dashboard de gestion : liste projets, liste feedbacks par projet, statut open/in-progress/closed
- Notifications email au freelance à chaque nouveau feedback (Resend via Lovable AI)
- Mises à jour temps réel dans le dashboard (Realtime Supabase)
- Paiement Stripe : Free (3 projets actifs) / Pro 9€/mois (illimité)
- Landing page FR avec pitch, démo, pricing, CTA signup

**Hors MVP (v2)**
- Intégration Figma, app mobile, vidéo feedback, gestion d'équipe, Slack/webhooks, SSO

## Pages & routes

- `/` — Landing FR (hero, démo, features, pricing, FAQ, CTA)
- `/login`, `/signup` — Auth freelance
- `/dashboard` — Liste des projets (carte par projet avec compteur feedbacks ouverts)
- `/dashboard/projects/new` — Création projet (nom, type: site live ou maquette upload)
- `/dashboard/projects/$id` — Détail projet : snippet à copier OU image maquette + liste feedbacks ancrés, filtres statut, vue détail commentaire
- `/dashboard/projects/$id/settings` — Renommer, régénérer lien magique, supprimer
- `/dashboard/billing` — Stripe customer portal + état abonnement
- `/r/$projectToken` — Page hébergée pour mode maquette (le client voit l'image et commente)
- `/widget.js` — Le script JS servi (route serveur)
- `/api/public/feedback` — Endpoint public pour soumettre un feedback depuis le widget
- `/api/public/widget-config/$projectToken` — Config projet pour le widget

## Le widget JS — comment ça marche

1. Le freelance copie un snippet : `<script src="https://reviewdrop.app/widget.js" data-project="TOKEN" defer></script>`
2. Au chargement, le widget :
   - Fetch la config projet (couleurs, nom, statut actif)
   - Affiche un bouton flottant "Laisser un feedback" en bas à droite
   - Au clic : passe en mode "épingle" — curseur en croix
   - Au clic suivant sur la page : pose un marqueur, ouvre un mini-formulaire (prénom + commentaire)
   - Capture : URL, position (x%, y%), viewport, sélecteur CSS de l'élément cliqué, screenshot via `html2canvas`
   - POST vers `/api/public/feedback` avec le token projet
3. Pour les SPA : observe les changements `history.pushState` pour ré-ancrer correctement par URL
4. Mode maquette : même UX mais sur la page `/r/$token` qui affiche l'image uploadée

## Modèle de données

- `profiles` (id → auth.users, email, full_name, plan: free|pro, stripe_customer_id, stripe_subscription_id)
- `projects` (id, owner_id, name, type: live|mockup, public_token unique, mockup_image_path nullable, brand_color, is_active, created_at)
- `feedbacks` (id, project_id, page_url, position_x, position_y, viewport_w, viewport_h, css_selector, screenshot_path, author_name, message, status: open|in_progress|closed, created_at)
- `feedback_replies` (id, feedback_id, author_id nullable, author_name, message, created_at) — pour conversation interne freelance

RLS : freelance ne voit que ses propres projets/feedbacks ; insertion publique de feedbacks autorisée uniquement avec un `public_token` valide (validation côté serveur).

## Plan de livraison (compressé en 1 itération MVP)

| Lot | Contenu |
|-----|---------|
| 1 | Auth + tables + dashboard vide + création projet + génération token |
| 2 | Widget JS (bouton, mode épingle, formulaire, capture, POST) + endpoints publics |
| 3 | Mode maquette (upload image + page `/r/$token` + même widget) |
| 4 | Dashboard détail projet : overlay des pins sur preview, liste feedbacks, statuts, replies |
| 5 | Realtime + notifications email (Resend) + polish UI |
| 6 | Stripe : pricing page, checkout, webhook, gating sur nb projets, customer portal |
| 7 | Landing page FR + screenshots démo |

À l'issue de ce plan tu auras un produit testable de bout en bout. Je recommande de livrer les lots 1→4 dans une première passe (cœur du produit) puis lots 5→7 en passes courtes successives pour pouvoir valider/itérer entre chaque.

## Détails techniques

- Stack Lovable native : TanStack Start + Lovable Cloud (Supabase géré)
- Widget servi en pur Vanilla JS via une route serveur `/widget.js` qui retourne le bundle avec `Content-Type: application/javascript` et CORS `*` ; bundle pré-buildé dans `public/widget.js` pour éviter une compilation à chaque request
- `html2canvas` pour le screenshot côté client (chargé dynamiquement par le widget pour ne pas bloquer le boot)
- Tracking SPA via patch de `history.pushState` / `popstate`
- Endpoint public `/api/public/feedback` : validation Zod stricte, vérification du `public_token`, rate limiting basique par IP+token
- Storage bucket public `mockups` pour les images maquettes, bucket public `screenshots` pour les captures
- Notifications email via Resend (clé à fournir en secret)
- Stripe via l'intégration native Lovable (Step recommend → enable → produits → checkout → webhook)
- Realtime Supabase sur la table `feedbacks` filtrée par `project_id` pour rafraîchir le dashboard
- Sécurité : RLS strictes, jamais de service role côté client, signature webhook Stripe vérifiée, le `public_token` ne donne accès qu'à l'INSERT de feedback (pas de SELECT)
- i18n : tout en français (UI, emails, landing) — pas de système i18n complet pour le MVP

## À confirmer après approbation

- Nom définitif (ReviewDrop ou autre — je pars sur ReviewDrop par défaut)
- Logo / palette : je propose un design moderne minimal (bleu indigo + blanc, typographie Inter) — ajustable
- Domaine de prod (pour le snippet du widget) — on utilise le domaine Lovable au début
