# Que développer ensuite ?

Voici ce qui manque encore à ReviewDrop, classé par impact business. Choisis une piste et je l'implémente.

## 1. Paiements & abonnements (impact: 🔥🔥🔥)

Aujourd'hui les plans Free/Pro/Max existent dans le code, mais **personne ne peut payer**. La page Tarifs n'a pas de bouton fonctionnel et `dashboard.billing.tsx` est un placeholder.

À faire :

- Activer Stripe (intégration Lovable Payments)
- Créer les produits Pro (12€/mois) et Max (29€/mois) + équivalents annuels
- Checkout depuis `/` et `/dashboard/billing`
- Webhook qui met à jour `profiles.plan`, `stripe_customer_id`, `stripe_subscription_id`
- Portail client (annulation, changement de plan, factures)
- Crédit du parrainage : +1 mois Pro à chaque filleul confirmé (statut `confirmed` déclenché par la 1ʳᵉ facture payée)

## 2. Notifications email pour les feedbacks (impact: 🔥🔥)

Le champ `projects.notify_email` existe mais aucun email n'est envoyé. C'est pourtant LE moment de vérité du produit : le freelance doit savoir tout de suite qu'un client a laissé un retour.

À faire :

- Activer Lovable Emails (domaine d'envoi)
- Email transactionnel à chaque nouveau feedback (auteur, message, screenshot, lien dashboard)
- Digest quotidien optionnel pour les projets très actifs
- Préférences par projet (instant / daily / off)

## 3. Réponses aux feedbacks côté client (impact: 🔥🔥)

La table `feedback_replies` existe et les RLS sont en place, mais **il n'y a aucune UI**. Le freelance ne peut pas répondre à son client, et le client ne voit jamais les réponses.

À faire :

- UI de fil de discussion dans `dashboard.projects.$projectId.tsx`
- Affichage des réponses dans le widget (tooltip d'un pin existant)
- Notification email au client quand le freelance répond (via lien magique `/r/$token`)
- Statuts `open` / `in_progress` / `resolved` activables d'un clic

## 4. Page publique de partage des feedbacks (impact: 🔥)

Permettre au freelance d'envoyer un lien type `/r/$token` à son client pour qu'il voie les retours sans créer de compte (la route `r.$token.tsx` existe déjà mais à vérifier).

## 5. Export CSV + Webhooks (plans Pro/Max) (impact: 🔥)

Promis dans `plans.ts` (`csvExport`, `webhooks`) mais pas implémenté. Sans ça, les avantages Pro/Max ne sont pas tenus.

## 6. Onboarding & première install (impact: 🔥)

Aujourd'hui un nouveau user atterrit sur un dashboard vide. À ajouter :

- Wizard 3 étapes après signup (nom du 1ᵉʳ projet → snippet à coller → essayer)
- État vide guidé sur `/dashboard`
- Checklist de progression ("Premier feedback reçu", "Snippet installé", etc.)

---

## Ma recommandation

**Commencer par #1 (Paiements)**. Tout le reste (limites de plan, parrainage, badge "Powered by") est déjà câblé en attente d'un vrai plan payant. Sans monétisation, le parrainage que tu viens de mettre en place ne crédite rien et l'offre Max n'a pas de réalité commerciale.

Ensuite #2 (Emails) qui transforme le produit d'un "outil qu'on consulte" en "outil qui te prévient" — c'est ce qui fait revenir les freelances dans le dashboard.

Dis-moi laquelle tu veux et je lance.

&nbsp;

*Pour l'instant, ne rien activer option payante mais faire en sorte qu'elle soient prêtes à implémenter.*