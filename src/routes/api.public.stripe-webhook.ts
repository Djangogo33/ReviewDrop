// Stripe webhook — endpoint stable, prêt à activer.
// URL publique : https://reviewdrop.lovable.app/api/public/stripe-webhook
//
// Activation : ajouter STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET, faire
// `bun add stripe`, puis décommenter le bloc ci-dessous.

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_SECRET_KEY;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!secret || !webhookSecret) {
          return new Response("billing_not_configured", { status: 503 });
        }

        const signature = request.headers.get("stripe-signature");
        if (!signature) return new Response("missing_signature", { status: 400 });

        const body = await request.text();

        // --- ACTIVATE BLOCK (uncomment after `bun add stripe`) ---
        // const Stripe = (await import("stripe")).default;
        // const stripe = new Stripe(secret, { apiVersion: "2024-12-18.acacia" });
        // const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        //
        // let event: import("stripe").Stripe.Event;
        // try {
        //   event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        // } catch {
        //   return new Response("invalid_signature", { status: 401 });
        // }
        //
        // switch (event.type) {
        //   case "checkout.session.completed": {
        //     const s = event.data.object as import("stripe").Stripe.Checkout.Session;
        //     const userId = s.client_reference_id;
        //     const plan = (s.metadata?.plan as "pro" | "max" | undefined) ?? "pro";
        //     if (userId) {
        //       await supabaseAdmin.from("profiles").update({
        //         plan,
        //         stripe_customer_id: typeof s.customer === "string" ? s.customer : null,
        //         stripe_subscription_id: typeof s.subscription === "string" ? s.subscription : null,
        //         plan_expires_at: null,
        //       }).eq("id", userId);
        //     }
        //     break;
        //   }
        //   case "customer.subscription.updated":
        //   case "customer.subscription.deleted": {
        //     const sub = event.data.object as import("stripe").Stripe.Subscription;
        //     const active = sub.status === "active" || sub.status === "trialing";
        //     await supabaseAdmin.from("profiles").update({
        //       plan: active ? (sub.metadata?.plan ?? "pro") : "free",
        //       stripe_subscription_id: active ? sub.id : null,
        //     }).eq("stripe_customer_id", typeof sub.customer === "string" ? sub.customer : "");
        //     break;
        //   }
        // }
        // --- END ACTIVATE BLOCK ---

        return new Response("ok");
      },
    },
  },
});
