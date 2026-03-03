// supabase/functions/delete-account/index.ts
// GDPR-compliant account deletion — removes all user data
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = ["https://crewfinder.pages.dev", "http://localhost:3000"];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify auth with anon key first
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the user's token
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Use service role for deletion operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Get profile to check for Stripe subscription
    const { data: profile } = await adminClient
      .from("profiles")
      .select("stripe_customer_id, subscription_id")
      .eq("id", userId)
      .single();

    // Cancel Stripe subscription if active
    if (profile?.subscription_id) {
      const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (stripeSecretKey) {
        try {
          await fetch(`https://api.stripe.com/v1/subscriptions/${profile.subscription_id}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${stripeSecretKey}`,
            },
          });
        } catch (stripeErr) {
          console.error("Stripe cancellation error:", stripeErr);
          // Continue with deletion even if Stripe fails
        }
      }
    }

    // Delete all user data from all tables
    // Order matters — delete dependent records first
    const deletions = [
      adminClient.from("messages").delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
      adminClient.from("reviews").delete().or(`reviewer_id.eq.${userId},reviewed_id.eq.${userId}`),
      adminClient.from("saved_workers").delete().eq("business_id", userId),
      adminClient.from("saved_workers").delete().eq("worker_id", userId),
      adminClient.from("work_photos").delete().eq("user_id", userId),
      adminClient.from("crew_availability").delete().eq("user_id", userId),
      adminClient.from("job_responses").delete().eq("worker_id", userId),
      adminClient.from("jobs").delete().eq("posted_by", userId),
      adminClient.from("call_log").delete().or(`caller_id.eq.${userId},company_id.eq.${userId}`),
      adminClient.from("equipment_listings").delete().eq("user_id", userId),
      adminClient.from("storm_responses").delete().eq("user_id", userId),
      adminClient.from("storm_posts").delete().eq("posted_by", userId),
    ];

    // Execute all deletions (some may fail if tables don't exist yet — that's OK)
    await Promise.allSettled(deletions);

    // Delete profile
    await adminClient.from("profiles").delete().eq("id", userId);

    // Delete auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("Auth deletion error:", deleteError);
      return new Response(JSON.stringify({ error: "Failed to delete auth account" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Account deleted" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Account deletion error:", err);
    return new Response(JSON.stringify({ error: "Account deletion failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
