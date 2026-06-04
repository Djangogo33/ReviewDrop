// Stripe checkout server function — READY but inert until STRIPE_SECRET_KEY is set.
//
// What this prepares for activation:
//   1. User clicks "Upgrade to Pro" in /dashboard/billing
//   2. We call `createCheckoutSession` (this file)
//   3. We redirect the browser to the Stripe-hosted checkout
//   4. Stripe sends a webhook to /api/public/stripe-webhook (see route file)
//   5. The webhook updates profiles.plan + profiles.stripe_customer_id
//
// To activate when ready:
//   - Add secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
//     STRIPE_PRICE_PRO, STRIPE_PRICE_MAX
//   - Run `bun add stripe`
//   - Uncomment the Stripe SDK block below and the webhook handler.
//   - That's it. The DB already has stripe_customer_id + stripe_subscription_id
//     on profiles, and the UI hook below is wired up.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CheckoutInput = z.object({
  plan: z.enum(["pro", "max"]),
});

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => CheckoutInput.parse(data))
  .handler(async ({ data, context }) => {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      // Stripe not configured yet — surfaced to the UI as a clear message.
      throw new Error("billing_not_configured");
    }

    const { userId, supabase } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, stripe_customer_id")
      .eq("id", userId)
      .single();

    const priceId =
      data.plan === "max"
        ? process.env.STRIPE_PRICE_MAX
        : process.env.STRIPE_PRICE_PRO;
    if (!priceId) throw new Error("billing_not_configured");

    // --- ACTIVATE BLOCK (uncomment after `bun add stripe`) ---
    // const Stripe = (await import("stripe")).default;
    // const stripe = new Stripe(secret, { apiVersion: "2024-12-18.acacia" });
    // const origin = process.env.PUBLIC_APP_URL ?? "https://reviewdrop.lovable.app";
    // const session = await stripe.checkout.sessions.create({
    //   mode: "subscription",
    //   customer: profile?.stripe_customer_id ?? undefined,
    //   customer_email: profile?.stripe_customer_id ? undefined : profile?.email ?? undefined,
    //   client_reference_id: userId,
    //   line_items: [{ price: priceId, quantity: 1 }],
    //   allow_promotion_codes: true,
    //   success_url: `${origin}/dashboard/billing?status=success`,
    //   cancel_url: `${origin}/dashboard/billing?status=cancelled`,
    //   subscription_data: { metadata: { user_id: userId, plan: data.plan } },
    // });
    // return { url: session.url };
    // --- END ACTIVATE BLOCK ---

    throw new Error("billing_not_configured");
  });

export const createPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) throw new Error("billing_not_configured");

    const { userId, supabase } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();
    if (!profile?.stripe_customer_id) throw new Error("no_customer");

    // --- ACTIVATE BLOCK ---
    // const Stripe = (await import("stripe")).default;
    // const stripe = new Stripe(secret, { apiVersion: "2024-12-18.acacia" });
    // const origin = process.env.PUBLIC_APP_URL ?? "https://reviewdrop.lovable.app";
    // const session = await stripe.billingPortal.sessions.create({
    //   customer: profile.stripe_customer_id,
    //   return_url: `${origin}/dashboard/billing`,
    // });
    // return { url: session.url };
    // --- END ACTIVATE BLOCK ---

    throw new Error("billing_not_configured");
  });
