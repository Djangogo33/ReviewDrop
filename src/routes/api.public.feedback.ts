import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

const FeedbackSchema = z.object({
  project_token: z.string().min(8).max(64).regex(/^[a-zA-Z0-9]+$/),
  page_url: z.string().max(2048).optional().nullable(),
  position_x: z.number().min(0).max(100),
  position_y: z.number().min(0).max(100),
  viewport_w: z.number().int().min(1).max(20000).optional().nullable(),
  viewport_h: z.number().int().min(1).max(20000).optional().nullable(),
  css_selector: z.string().max(1024).optional().nullable(),
  screenshot_data_url: z.string().max(5_000_000).optional().nullable(),
  author_name: z.string().min(1).max(80).default("Anonyme"),
  message: z.string().min(1).max(2000),
  user_agent: z.string().max(500).optional().nullable(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/feedback")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const parsed = FeedbackSchema.safeParse(body);
          if (!parsed.success) {
            return new Response(JSON.stringify({ error: "Invalid input", details: parsed.error.flatten() }), {
              status: 400,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            });
          }
          const data = parsed.data;

          // Find project by public token
          const { data: project, error: projErr } = await supabaseAdmin
            .from("projects")
            .select("id, owner_id, is_active, notify_email, name")
            .eq("public_token", data.project_token)
            .maybeSingle();

          if (projErr || !project) {
            return new Response(JSON.stringify({ error: "Project not found" }), {
              status: 404,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            });
          }
          if (!project.is_active) {
            return new Response(JSON.stringify({ error: "Project inactive" }), {
              status: 403,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            });
          }

          // Optional: upload screenshot if provided as data URL
          let screenshotPath: string | null = null;
          if (data.screenshot_data_url && data.screenshot_data_url.startsWith("data:image/")) {
            try {
              const match = data.screenshot_data_url.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
              if (match) {
                const mime = match[1];
                const ext = mime.split("/")[1].replace("+xml", "");
                const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
                if (bytes.length < 5_000_000) {
                  const path = `${project.id}/${crypto.randomUUID()}.${ext}`;
                  const { error: upErr } = await supabaseAdmin.storage
                    .from("screenshots")
                    .upload(path, bytes, { contentType: mime, cacheControl: "3600" });
                  if (!upErr) screenshotPath = path;
                }
              }
            } catch {
              // ignore screenshot failure
            }
          }

          const { data: inserted, error: insErr } = await supabaseAdmin
            .from("feedbacks")
            .insert({
              project_id: project.id,
              page_url: data.page_url ?? null,
              position_x: data.position_x,
              position_y: data.position_y,
              viewport_w: data.viewport_w ?? null,
              viewport_h: data.viewport_h ?? null,
              css_selector: data.css_selector ?? null,
              screenshot_path: screenshotPath,
              author_name: data.author_name || "Anonyme",
              message: data.message,
              user_agent: data.user_agent ?? null,
              status: "open",
            })
            .select()
            .single();

          if (insErr) {
            return new Response(JSON.stringify({ error: insErr.message }), {
              status: 500,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            });
          }

          return new Response(JSON.stringify({ ok: true, id: inserted.id }), {
            status: 201,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: "Server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
      },
    },
  },
});
