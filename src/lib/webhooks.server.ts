// Server-only helpers for webhook delivery. Never imported from client code.
import { createHmac } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type WebhookRow = {
  id: string;
  project_id: string;
  url: string;
  secret: string;
  events: string[];
  is_active: boolean;
};

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 5000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function deliverWebhookEvent(
  hook: WebhookRow,
  event: string,
  payload: unknown,
) {
  const body = JSON.stringify({ event, data: payload, sent_at: new Date().toISOString() });
  const signature =
    "sha256=" + createHmac("sha256", hook.secret).update(body).digest("hex");
  let status_code: number | null = null;
  let ok = false;
  let response_snippet: string | null = null;
  let error: string | null = null;
  try {
    const res = await fetchWithTimeout(hook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-reviewdrop-event": event,
        "x-reviewdrop-signature": signature,
      },
      body,
    });
    status_code = res.status;
    ok = res.ok;
    try {
      response_snippet = (await res.text()).slice(0, 500);
    } catch {
      /* ignore */
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  try {
    await supabaseAdmin.from("webhook_deliveries").insert({
      webhook_id: hook.id,
      event,
      status_code,
      ok,
      response_snippet,
      error,
    });
  } catch {
    /* logging is best-effort */
  }
}

export async function dispatchWebhookEvent(
  project_id: string,
  event: string,
  payload: unknown,
) {
  const { data: hooks } = await supabaseAdmin
    .from("webhooks")
    .select("*")
    .eq("project_id", project_id)
    .eq("is_active", true);
  if (!hooks || hooks.length === 0) return;
  await Promise.all(
    hooks
      .filter((h: WebhookRow) => Array.isArray(h.events) && h.events.includes(event))
      .map((h: WebhookRow) => deliverWebhookEvent(h, event, payload)),
  );
}
