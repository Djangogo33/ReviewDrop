import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({ feedback_id: z.string().uuid() });

const CATEGORIES = ["bug", "idea", "question", "ux", "other"] as const;

/**
 * Categorize a feedback using Lovable AI Gateway.
 * Fire-and-forget: called after a feedback insert. Failures are swallowed
 * so a slow AI response never blocks the submission API.
 */
export const categorizeFeedback = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { ok: false, reason: "no_api_key" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: fb } = await supabaseAdmin
      .from("feedbacks")
      .select("id, message, page_url")
      .eq("id", data.feedback_id)
      .maybeSingle();
    if (!fb) return { ok: false, reason: "not_found" };

    const prompt = `Tu classes des feedbacks utilisateurs pour un outil web.
Message: """${fb.message.slice(0, 1500)}"""
Page: ${fb.page_url ?? "n/a"}

Réponds uniquement en JSON valide avec ces champs:
- category: une valeur parmi ${CATEGORIES.join(", ")}
- summary: résumé français en 1 phrase de max 120 caractères.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": apiKey,
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "Tu réponds toujours en JSON strict, sans texte hors JSON." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (!res.ok) {
        console.error("categorize gateway error", res.status);
        return { ok: false, reason: `gateway_${res.status}` };
      }
      const j = await res.json();
      const text = j?.choices?.[0]?.message?.content ?? "{}";
      let parsed: { category?: string; summary?: string } = {};
      try { parsed = JSON.parse(text); } catch { /* ignore */ }

      const category = CATEGORIES.includes(parsed.category as typeof CATEGORIES[number])
        ? (parsed.category as string)
        : "other";
      const summary = typeof parsed.summary === "string" ? parsed.summary.slice(0, 140) : null;

      await supabaseAdmin
        .from("feedbacks")
        .update({ category, ai_summary: summary })
        .eq("id", fb.id);

      return { ok: true, category, summary };
    } catch (e) {
      console.error("categorize error", e);
      return { ok: false, reason: "exception" };
    }
  });
