# Plan global — améliorations transversales

L'utilisateur veut avancer sur tous les axes. Voici un plan ordonné, du plus impactant au plus fin, pour être livré en plusieurs lots successifs.

## Lot A — Landing & conversion (public)

- **Hero refonte** sur `/` : promesse claire ("Récoltez du feedback client en 30 secondes"), sous-titre bénéfices, double CTA (Essai gratuit / Voir la démo), visuel produit annoté.
- **Preuve sociale** : bandeau logos + 3 témoignages courts + compteur ("X feedbacks collectés").
- **Nouvelle route `/features`** : 6 blocs bénéfices (widget 1-ligne, maquettes, screenshots auto, catégorisation IA, webhooks, export CSV), chacun avec icône + capture.
- **Nouvelle route `/pricing`** : tableau Free/Pro/Max lisible, FAQ tarifs, CTA vers `/signup`. Head SEO propre (title, description, og:*, canonical).
- **CTA sticky** en bas de landing sur mobile.

## Lot B — UX Dashboard (suite Lot 2)

- **Assignation** : ajout colonne `assigned_to` sur `feedbacks` (migration + policies + GRANT), sélecteur d'assigné dans le drawer détail, filtre "Mes feedbacks".
- **Tags manuels** : table `feedback_tags` (id, project_id, label, color) + join `feedback_tag_map`, UI de gestion dans les paramètres projet, affichage/filtrage dans la liste.
- **Raccourcis clavier** dans la vue projet : `j`/`k` navigation, `1/2/3` statut, `e` marquer lu, `?` aide.
- **États vides scénarisés** : dashboard sans projet → tuto 3 étapes, projet sans feedback → snippet + lien démo.

## Lot C — Nouvelles fonctionnalités

- **Notifications email** : préférence par projet (immédiat / digest quotidien), envoi via l'infra Emails Lovable (queue `transactional_emails`) déclenché sur `feedback.created`.
- **Roadmap publique** : nouvelle route `/roadmap/$projectId` en lecture seule des feedbacks marqués `is_public`, vote anonyme (table `feedback_votes` avec ip_hash), tri par votes.
- **Widget** : options `position` (bottom-right/left, top-*), `theme` (auto/light/dark), `hide_on_mobile`. Réglages exposés dans `dashboard/install` et servis via `/api/public/widget-config/$token`.

## Lot D — Qualité & fiabilité (suite Lot 4)

- **Sitemap** : passer de `sitemap[.]xml.ts` actuel à une génération dynamique incluant `/features`, `/pricing`, `/roadmap/*` publics.
- **Accessibilité** : audit rapide (focus visible, labels, contrastes, aria-labels sur icônes cliquables), correctifs ciblés.
- **Perf** : lazy-load images landing, `loading="lazy"` + `decoding="async"`, préconnect fonts, code-split pages admin.
- **Tests Playwright** : 3 scénarios critiques (signup → création projet → snippet visible ; envoi feedback via widget → apparition realtime ; upgrade code promo).

## Ordre de livraison proposé

```text
1. Lot A (landing & pricing) — plus fort levier commercial
2. Lot B (assignation + tags + raccourcis)
3. Lot C (emails + roadmap + options widget)
4. Lot D (sitemap étendu, a11y, perf, Playwright)
```

Chaque lot est livré indépendamment, avec vérif TypeScript et rapide check visuel avant de passer au suivant.

## Détails techniques (résumé)

- Nouvelles routes publiques : `src/routes/features.tsx`, `src/routes/pricing.tsx`, `src/routes/roadmap.$projectId.tsx` avec head SEO complet (title, description, og:title/description/url/type, canonical leaf-only).
- Migrations Supabase : `feedbacks.assigned_to uuid`, tables `feedback_tags`, `feedback_tag_map`, `feedback_votes`, `notification_prefs` — chacune avec GRANT + RLS scoped `auth.uid()` et policies owner-only, sauf `feedback_votes` (INSERT anon avec rate-limit ip_hash) et lecture publique roadmap (SELECT anon sur `is_public = true`).
- Emails via `email_domain--setup_email_infra` (queue + cron), template React Email, enqueue depuis un serverFn déclenché après insert.
- Options widget servies par la route publique existante `api.public.widget-config.$token`, appliquées côté `public/widget.js`.
- Playwright dans `/tmp/browser/` (script + screenshots), pas de fichier tracké dans le repo tant qu'on n'a pas de CI dédié.

Est-ce que je commence par le **Lot A** ?
