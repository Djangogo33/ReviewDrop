import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { DEFAULT_BRAND_COLOR, getLimits, normalizePlan } from "@/lib/plans";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/widget-config/$token")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      GET: async ({ params }) => {
        const token = params.token;
        if (!token || !/^[a-zA-Z0-9]{8,64}$/.test(token)) {
          return new Response(JSON.stringify({ error: "Invalid token" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        const { data: project } = await supabaseAdmin
          .from("projects")
          .select("id, name, type, brand_color, mockup_image_path, is_active, owner_id")
          .eq("public_token", token)
          .maybeSingle();

        if (!project) {
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        // Look up owner plan to enforce widget-side limits.
        const { data: ownerProfile } = await supabaseAdmin
          .from("profiles")
          .select("plan")
          .eq("id", project.owner_id)
          .maybeSingle();

        const plan = normalizePlan(ownerProfile?.plan);
        const limits = getLimits(plan);

        // Apply plan gates to what's exposed publicly.
        const publicProject = {
          id: project.id,
          name: project.name,
          type: project.type,
          brand_color: limits.customBrandColor ? project.brand_color : DEFAULT_BRAND_COLOR,
          mockup_image_path: project.mockup_image_path,
          is_active: project.is_active,
          show_badge: !limits.removeBadge,
          plan,
        };

        return new Response(JSON.stringify({ project: publicProject }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=60",
            ...corsHeaders,
          },
        });
      },
    },
  },
});
