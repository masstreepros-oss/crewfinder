// supabase/functions/twilio-voice/index.ts
// TwiML webhook — routes outbound browser calls to the actual phone number
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Twilio sends form-encoded data to TwiML webhooks
    const formData = await req.formData();
    const to = formData.get("To") as string | null;
    const callerId = Deno.env.get("TWILIO_CALLER_ID") || formData.get("From") as string || "+10000000000";

    if (!to) {
      // No destination — return a "say" response
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">No phone number was provided. Please try again.</Say>
</Response>`;
      return new Response(twiml, { headers: { ...corsHeaders, "Content-Type": "text/xml" } });
    }

    // Validate To parameter against E.164 format
    const e164Regex = /^\+?[1-9]\d{1,14}$/;
    if (!e164Regex.test(to)) {
      return new Response(JSON.stringify({ error: "Invalid phone number format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Clean the number — ensure E.164 format
    let cleanNumber = to.replace(/[^\d+]/g, "");
    if (!cleanNumber.startsWith("+")) {
      // Assume US number if no country code
      if (cleanNumber.length === 10) cleanNumber = "+1" + cleanNumber;
      else if (cleanNumber.length === 11 && cleanNumber.startsWith("1")) cleanNumber = "+" + cleanNumber;
      else cleanNumber = "+" + cleanNumber;
    }

    console.log(`Routing call to: ${cleanNumber}`);

    // XML escape helper for callerId
    const escapeXml = (str: string) => str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

    // Generate TwiML to dial the number
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${escapeXml(callerId)}" timeout="30" action="/functions/v1/twilio-voice?status=complete">
    <Number>${cleanNumber}</Number>
  </Dial>
</Response>`;

    return new Response(twiml, { status: 200, headers: { ...corsHeaders, "Content-Type": "text/xml" } });
  } catch (err) {
    console.error("TwiML generation error:", err);
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">An error occurred while connecting your call. Please try again.</Say>
</Response>`;
    return new Response(errorTwiml, { status: 200, headers: { ...corsHeaders, "Content-Type": "text/xml" } });
  }
});
