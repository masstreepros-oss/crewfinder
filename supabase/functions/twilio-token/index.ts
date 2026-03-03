// supabase/functions/twilio-token/index.ts
// Generates a Twilio Access Token for browser-based VoIP calling
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// TODO: Add rate limiting - consider using Supabase edge function rate limiter
// or implement token bucket per IP/user to prevent abuse

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

function base64url(source: ArrayBuffer): string {
  const bytes = new Uint8Array(source);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signJwt(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT", cty: "twilio-fpa;v=1" };
  const enc = new TextEncoder();
  const hB64 = base64url(enc.encode(JSON.stringify(header)));
  const pB64 = base64url(enc.encode(JSON.stringify(payload)));
  const input = `${hB64}.${pB64}`;
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(input));
  return `${input}.${base64url(sig)}`;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const apiKeySid = Deno.env.get("TWILIO_API_KEY_SID");
    const apiKeySecret = Deno.env.get("TWILIO_API_KEY_SECRET");
    const twimlAppSid = Deno.env.get("TWILIO_TWIML_APP_SID");

    if (!accountSid || !apiKeySid || !apiKeySecret || !twimlAppSid) {
      return new Response(JSON.stringify({ error: "Missing Twilio config" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let identity = "caller";
    try { const body = await req.json(); if (body.identity) identity = String(body.identity); } catch { /* default */ }
    identity = identity.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128);

    const now = Math.floor(Date.now() / 1000);
    const token = await signJwt({
      jti: `${apiKeySid}-${now}`,
      iss: apiKeySid,
      sub: accountSid,
      exp: now + 3600,
      iat: now,
      grants: {
        identity,
        voice: { incoming: { allow: true }, outgoing: { application_sid: twimlAppSid } },
      },
    }, apiKeySecret);

    return new Response(JSON.stringify({ token, identity }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Token error:", err);
    return new Response(JSON.stringify({ error: "Token generation failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
