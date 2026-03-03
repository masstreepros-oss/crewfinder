// supabase/functions/stripe-webhook/index.ts
// Handles Stripe webhook events for subscription lifecycle
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string
): Promise<boolean> {
  const parts = sigHeader.split(",").reduce((acc: Record<string, string>, part) => {
    const [key, val] = part.split("=");
    acc[key.trim()] = val;
    return acc;
  }, {});

  const timestamp = parts["t"];
  const signature = parts["v1"];

  if (!timestamp || !signature) return false;

  // Check timestamp is within 5 minutes
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const expectedSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedSig === signature;
}

serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://crewfinder.pages.dev",
    "Access-Control-Allow-Headers": "content-type, stripe-signature",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const body = await req.text();
    const sigHeader = req.headers.get("stripe-signature");

    if (!sigHeader) {
      return new Response("Missing signature", { status: 400 });
    }

    const isValid = await verifyStripeSignature(body, sigHeader, webhookSecret);
    if (!isValid) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body);

    // Use service role for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (userId) {
          await supabase.from("profiles").update({
            subscription_status: "active",
            stripe_customer_id: session.customer,
            subscription_id: session.subscription,
            plan_type: session.metadata?.plan || "monthly",
          }).eq("id", userId);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const periodEnd = new Date(invoice.lines?.data?.[0]?.period?.end * 1000).toISOString();
        await supabase.from("profiles").update({
          subscription_status: "active",
          current_period_end: periodEnd,
        }).eq("stripe_customer_id", customerId);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await supabase.from("profiles").update({
          subscription_status: "past_due",
        }).eq("stripe_customer_id", invoice.customer);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await supabase.from("profiles").update({
          subscription_status: "cancelled",
          subscription_id: null,
          current_period_end: null,
          plan_type: "free",
        }).eq("stripe_customer_id", subscription.customer);
        break;
      }

      default:
        // Unhandled event type — acknowledge receipt
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
