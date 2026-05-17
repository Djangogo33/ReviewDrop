import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createHash } from "crypto";
import { z } from "zod";

function hashIp(ip: string): string {
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "rd-default-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

function extractIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() ||
    "unknown"
  );
}

function normalizeEmail(email: string): string {
  const e = email.trim().toLowerCase();
  const [localRaw, domainRaw] = e.split("@");
  if (!domainRaw) return e;
  let local = localRaw.split("+")[0];
  let domain = domainRaw;
  if (domain === "gmail.com" || domain === "googlemail.com") {
    local = local.replace(/\./g, "");
    domain = "gmail.com";
  }
  return `${local}@${domain}`;
}

/**
 * Called from the signup form BEFORE supabase.auth.signUp.
 * - Computes a salted IP hash from request headers (server-only, can't be spoofed)
 * - Enforces IP rate-limit: max 5 signup attempts per IP / hour
 * - Logs the attempt in referral_events
 * - Returns the ip_hash to inject into signUp metadata
 */
export const prepareSignup = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; referralCode?: string | null }) => {
    return z
      .object({
        email: z.string().trim().email().max(255),
        referralCode: z
          .string()
          .trim()
          .max(16)
          .regex(/^[A-Z0-9]*$/i)
          .nullish(),
      })
      .parse(input);
  })
  .handler(async ({ data }) => {
    const req = getRequest();
    const ip = extractIp(req);
    const ipHash = hashIp(ip);
    const emailNorm = normalizeEmail(data.email);
    const code = data.referralCode ? data.referralCode.toUpperCase() : null;

    // IP rate limit: 5 signup attempts / hour
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("referral_events")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .eq("event_type", "signup_attempt")
      .gte("created_at", since);

    if ((count ?? 0) >= 5) {
      await supabaseAdmin.from("referral_events").insert({
        event_type: "rate_limited",
        ip_hash: ipHash,
        email_normalized: emailNorm,
        referral_code: code,
        reason: "ip_signup_rate_limit",
      });
      return { ok: false as const, reason: "rate_limit", ipHash: null };
    }

    await supabaseAdmin.from("referral_events").insert({
      event_type: "signup_attempt",
      ip_hash: ipHash,
      email_normalized: emailNorm,
      referral_code: code,
    });

    return { ok: true as const, ipHash };
  });
