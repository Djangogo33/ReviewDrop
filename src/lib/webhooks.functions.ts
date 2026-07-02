import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const WEBHOOK_EVENTS = [
  "feedback.created",
  "feedback.status_changed",
  "reply.created",
] as const;
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

async function assertOwner(
  supabase: any,
  userId: string,
  projectId: string,
) {
  const { data } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("owner_id", userId)
    .maybeSingle();
  if (!data) throw new Error("forbidden");
}

// --- List
export const listWebhooks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ project_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertOwner(context.supabase, context.userId, data.project_id);
    const { data: hooks, error } = await context.supabase
      .from("webhooks")
      .select("*")
      .eq("project_id", data.project_id)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const ids = (hooks ?? []).map((h: any) => h.id);
    let deliveries: any[] = [];
    if (ids.length > 0) {
      const { data: d2 } = await context.supabase
        .from("webhook_deliveries")
        .select("*")
        .in("webhook_id", ids)
        .order("created_at", { ascending: false })
        .limit(50);
      deliveries = d2 ?? [];
    }
    return { webhooks: hooks ?? [], deliveries };
  });

// --- Create
export const createWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        project_id: z.string().uuid(),
        url: z.string().url().max(2048),
        events: z.array(z.enum(WEBHOOK_EVENTS)).min(1),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertOwner(context.supabase, context.userId, data.project_id);
    const secret =
      "whsec_" +
      Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    const { data: hook, error } = await context.supabase
      .from("webhooks")
      .insert({
        project_id: data.project_id,
        url: data.url,
        secret,
        events: data.events,
      })
      .select()
      .single();
    if (error) throw error;
    return hook;
  });

// --- Update
export const updateWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        url: z.string().url().max(2048).optional(),
        events: z.array(z.enum(WEBHOOK_EVENTS)).min(1).optional(),
        is_active: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { data: hook, error } = await context.supabase
      .from("webhooks")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return hook;
  });

// --- Delete
export const deleteWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("webhooks").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// --- Send test event
export const sendTestWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: hook } = await context.supabase
      .from("webhooks")
      .select("*")
      .eq("id", data.id)
      .single();
    if (!hook) throw new Error("not_found");
    const { deliverWebhookEvent } = await import("./webhooks.server");
    await deliverWebhookEvent(hook, "test.ping", {
      message: "Test depuis ReviewDrop",
      timestamp: new Date().toISOString(),
    });
    return { ok: true };
  });

// --- Emit a project event (called from dashboard after a successful write)
export const emitProjectEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        project_id: z.string().uuid(),
        event: z.enum(WEBHOOK_EVENTS),
        payload: z.record(z.any()),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertOwner(context.supabase, context.userId, data.project_id);
    const { dispatchWebhookEvent } = await import("./webhooks.server");
    await dispatchWebhookEvent(data.project_id, data.event, data.payload);
    return { ok: true };
  });
