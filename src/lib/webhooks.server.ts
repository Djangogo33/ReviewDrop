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

export type WebhookKind = "discord" | "slack" | "generic";

export function detectWebhookKind(url: string): WebhookKind {
  const u = url.toLowerCase();
  if (u.includes("discord.com/api/webhooks") || u.includes("discordapp.com/api/webhooks")) {
    return "discord";
  }
  if (u.includes("hooks.slack.com/")) return "slack";
  return "generic";
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 5000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

// ---------- Formatters ----------

const COLORS = {
  created: 0x22c55e, // green
  status: 0x3b82f6, // blue
  reply: 0x8b5cf6, // violet
  test: 0x64748b, // slate
};

function truncate(s: string | null | undefined, n = 1000): string {
  if (!s) return "—";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function projectLink(projectId: string | undefined): string | undefined {
  if (!projectId) return undefined;
  const base =
    process.env.PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "https://reviewdrop.lovable.app";
  return `${base.replace(/\/$/, "")}/dashboard/projects/${projectId}`;
}

function formatDiscord(event: string, payload: any): Record<string, unknown> {
  const p = payload ?? {};
  const url = projectLink(p.project_id);
  switch (event) {
    case "feedback.created": {
      const fields: Array<{ name: string; value: string; inline?: boolean }> = [
        { name: "Message", value: truncate(p.message, 1000) },
      ];
      if (p.rating != null) fields.push({ name: "Note", value: `${p.rating}/5`, inline: true });
      if (p.category) fields.push({ name: "Catégorie", value: String(p.category), inline: true });
      if (p.email) fields.push({ name: "Email", value: String(p.email), inline: true });
      if (p.page_url) fields.push({ name: "Page", value: truncate(p.page_url, 200) });
      return {
        username: "ReviewDrop",
        embeds: [
          {
            title: "🆕 Nouveau feedback",
            url,
            color: COLORS.created,
            fields,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }
    case "feedback.status_changed": {
      return {
        username: "ReviewDrop",
        embeds: [
          {
            title: "🔄 Statut mis à jour",
            url,
            color: COLORS.status,
            description: `**${p.old_status ?? "?"}** → **${p.new_status ?? "?"}**`,
            fields: p.message
              ? [{ name: "Feedback", value: truncate(p.message, 500) }]
              : undefined,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }
    case "reply.created": {
      return {
        username: "ReviewDrop",
        embeds: [
          {
            title: "💬 Nouvelle réponse",
            url,
            color: COLORS.reply,
            description: truncate(p.reply ?? p.body ?? p.message, 1500),
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }
    case "test.ping":
    default: {
      return {
        username: "ReviewDrop",
        embeds: [
          {
            title: "✅ Test ReviewDrop",
            color: COLORS.test,
            description:
              typeof p.message === "string"
                ? p.message
                : "Votre webhook est bien connecté.",
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }
  }
}

function formatSlack(event: string, payload: any): Record<string, unknown> {
  const p = payload ?? {};
  const url = projectLink(p.project_id);
  const link = url ? ` <${url}|Ouvrir le projet>` : "";
  switch (event) {
    case "feedback.created": {
      const bits = [`*🆕 Nouveau feedback*${link}`, truncate(p.message, 1000)];
      if (p.rating != null) bits.push(`Note: ${p.rating}/5`);
      if (p.category) bits.push(`Catégorie: ${p.category}`);
      if (p.email) bits.push(`Email: ${p.email}`);
      return { text: bits.join("\n") };
    }
    case "feedback.status_changed":
      return {
        text: `*🔄 Statut*${link}\n${p.old_status ?? "?"} → *${p.new_status ?? "?"}*`,
      };
    case "reply.created":
      return {
        text: `*💬 Nouvelle réponse*${link}\n${truncate(p.reply ?? p.body ?? p.message, 1500)}`,
      };
    case "test.ping":
    default:
      return { text: `✅ Test ReviewDrop — ${p.message ?? "webhook OK"}` };
  }
}

// ---------- Delivery ----------

export async function deliverWebhookEvent(
  hook: WebhookRow,
  event: string,
  payload: unknown,
) {
  const kind = detectWebhookKind(hook.url);

  let body: string;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (kind === "discord") {
    body = JSON.stringify(formatDiscord(event, payload));
  } else if (kind === "slack") {
    body = JSON.stringify(formatSlack(event, payload));
  } else {
    body = JSON.stringify({
      event,
      data: payload,
      sent_at: new Date().toISOString(),
    });
    headers["x-reviewdrop-event"] = event;
    headers["x-reviewdrop-signature"] =
      "sha256=" + createHmac("sha256", hook.secret).update(body).digest("hex");
  }

  let status_code: number | null = null;
  let ok = false;
  let response_snippet: string | null = null;
  let error: string | null = null;
  try {
    const res = await fetchWithTimeout(hook.url, { method: "POST", headers, body });
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
  const enriched =
    payload && typeof payload === "object" && !("project_id" in (payload as any))
      ? { ...(payload as any), project_id }
      : payload;
  await Promise.all(
    hooks
      .filter((h: WebhookRow) => Array.isArray(h.events) && h.events.includes(event))
      .map((h: WebhookRow) => deliverWebhookEvent(h, event, enriched)),
  );
}
