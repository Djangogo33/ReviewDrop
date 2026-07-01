# Plan — 4 chantiers en série

Livré dans cet ordre (impact décroissant, dépendances gérées).

## 1. Réponses aux feedbacks (fil de discussion)

**Base de données**
- Ajouter `feedbacks.status` (`open` | `in_progress` | `resolved`), défaut `open`.
- Vérifier RLS sur `feedback_replies` (déjà en place) : lecture/écriture par propriétaire du projet.
- Activer Realtime sur `feedback_replies`.

**Dashboard**
- Dans `dashboard.projects.$projectId.tsx` : panneau latéral au clic sur un feedback avec le fil (auteur = "Vous"), zone de réponse, sélecteur de statut, badge coloré par statut.
- Filtre en haut de liste : Tous / Ouverts / En cours / Résolus.

**Widget & page publique `/r/$token`**
- Widget : au clic sur une épingle existante, tooltip affichant le fil des réponses (lecture seule).
- `r.$token.tsx` : afficher les réponses sous chaque feedback + statut visible.

## 2. Analytics dashboard

Nouvelle route `dashboard.analytics.tsx` (onglet sidebar).

Métriques par projet (ou global) sur 7/30/90 jours :
- Feedbacks reçus (courbe jour par jour) via `recharts` (déjà dans le stack shadcn).
- Répartition par statut (donut).
- Top 5 pages (`page_url`) qui reçoivent des feedbacks.
- Taux de résolution (% de `resolved` / total).
- Temps de première réponse moyen.

Requêtes : agrégations SQL via `supabase.from("feedbacks").select(...)` filtré côté client (< 10k lignes attendues), pas de RPC nécessaire.

## 3. Catégorisation IA des feedbacks

**Base de données**
- Ajouter `feedbacks.category` (`bug` | `idea` | `question` | `ux` | `other`) nullable.
- Ajouter `feedbacks.ai_summary` text nullable (1 phrase).

**Server function `categorize.functions.ts`**
- Trigger : à chaque insertion réussie dans `api.public.feedback.ts`, on lance une catégorisation en fond via `createServerFn` (fire-and-forget côté API).
- Modèle : `google/gemini-3-flash-preview` via Lovable AI Gateway.
- Prompt structuré (JSON output) → écrit `category` + `ai_summary` sur la ligne.

**UI**
- Badge de catégorie coloré à côté de chaque feedback dans `dashboard.projects.$projectId.tsx`.
- Filtres par catégorie (combinables avec statut).
- Bouton "Re-catégoriser" pour l'utilisateur (Pro/Max).

## 4. Polish UX + onboarding guidé

**Tour interactif première connexion**
- Petit composant maison (pas de dépendance) : overlay avec 4 bulles pointant vers "Nouveau projet" → "Installer" → "Feedbacks" → "Compte".
- Skip persistant dans `profiles.onboarded_at`.

**Empty states améliorés**
- `dashboard.index.tsx` sans projet : illustration + CTA large.
- Projet sans feedback : déjà en place, on rajoute un lien "Envoyer un feedback de test".

**Micro-animations**
- Transition d'apparition sur les cartes (fade + slide-up, Tailwind `animate-in`).
- Toast animé lors d'un nouveau feedback realtime (déjà partiel).

**Raccourcis clavier**
- `g p` → projets, `g d` → dashboard, `g a` → analytics, `?` → aide.
- Composant `KeyboardShortcuts` dans le layout.

## Détails techniques

- Toutes les nouvelles routes sous `_authenticated/` ne s'appliquent pas ici (le projet garde le pattern actuel `dashboard.*` avec `RequireAuth` component) — on conserve la convention existante.
- IA : bien lire `LOVABLE_API_KEY` **dans le handler** (Cloudflare Workers).
- Realtime : channels avec cleanup dans `useEffect` (pas de fuite).
- Migrations : une seule par chantier, GRANTs inclus.

## Ordre de livraison

1. Migration (status + category + ai_summary + onboarded_at) — une seule, tout en un.
2. Chantier 1 (réponses) — le plus attendu.
3. Chantier 3 (IA) — court, apporte du "wow".
4. Chantier 2 (analytics) — visuel, valorisant.
5. Chantier 4 (polish) — finition.

Je peux tout enchaîner sans validation intermédiaire, ou t'arrêter après chaque chantier pour que tu testes. Dis-moi.
