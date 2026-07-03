## Objectif

Les webhooks existent déjà (URL générique + signature HMAC), mais Discord attend un format précis (`content` + `embeds`). Aujourd'hui, coller une URL Discord ne produit qu'un 400 "invalid body". On ajoute un vrai support Discord (et Slack, même principe) pour que ça marche en collant simplement l'URL.

## Ce qu'on ajoute

**1. Détection auto du type de destination**
Dans `src/lib/webhooks.server.ts`, à l'envoi :
- URL contenant `discord.com/api/webhooks` ou `discordapp.com` → payload Discord
- URL contenant `hooks.slack.com` → payload Slack
- Sinon → payload générique actuel (JSON signé, inchangé)

**2. Formatage Discord (embeds)**
Un petit formateur par événement :
- `feedback.created` : embed vert, titre "Nouveau feedback", champs Message / Note / Email / Catégorie, lien vers le dashboard du projet
- `feedback.status_changed` : embed bleu, "Statut : X → Y"
- `reply.created` : embed violet, "Nouvelle réponse", extrait du message
- `test.ping` : embed gris, "Test ReviewDrop ✅"

Pas de signature HMAC pour Discord/Slack (ils ne la vérifient pas) — on garde la signature uniquement pour les webhooks génériques.

**3. UI Webhooks (`dashboard.webhooks.$projectId.tsx`)**
- Petit badge auto à côté de l'URL : `Discord` / `Slack` / `Générique` (détecté depuis l'URL).
- Bloc "Secret de signature" masqué pour Discord/Slack (inutile), affiché pour générique.
- Aide contextuelle : lien "Comment créer un webhook Discord" (Paramètres du salon → Intégrations → Webhooks → Copier l'URL).
- Placeholder de l'input URL mis à jour : `https://discord.com/api/webhooks/... ou votre endpoint`.
- Le bouton "Envoyer un test" fonctionne pour les trois formats.

**4. Livraisons**
Le log `webhook_deliveries` reste identique (status_code, ok, snippet, error) — utile pour voir qu'un webhook Discord a répondu 204.

## Ce qu'on ne change pas

- Schéma DB (colonnes existantes suffisent)
- Signature/format des webhooks génériques déjà configurés
- Aucun secret Discord à demander : l'URL suffit
- Paiements

## Fichiers touchés

- `src/lib/webhooks.server.ts` — détection + formateurs Discord/Slack
- `src/routes/dashboard.webhooks.$projectId.tsx` — badge, aide, placeholder, masquage secret
