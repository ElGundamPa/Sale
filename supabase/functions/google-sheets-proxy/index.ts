// Edge Function: google-sheets-proxy
// Proxies a GET to the Apps Script URL stored in env var APPS_SCRIPT_URL.
// Public (no JWT required) so the dashboard can call it without auth.
//
// Deploy:
//   supabase secrets set APPS_SCRIPT_URL="https://script.google.com/macros/s/.../exec"
//   supabase functions deploy google-sheets-proxy --no-verify-jwt

const APPS_SCRIPT_URL = Deno.env.get("APPS_SCRIPT_URL") ?? "";

const allowedOrigins =
  Deno.env.get("ALLOWED_ORIGINS")?.split(",").map((s) => s.trim()) ?? ["*"];

const corsOrigin = (requestOrigin: string | null) => {
  if (allowedOrigins.includes("*")) return "*";
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }
  return allowedOrigins[0] ?? "*";
};

const corsHeaders = (requestOrigin: string | null) => ({
  "Access-Control-Allow-Origin": corsOrigin(requestOrigin),
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
});

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  if (!APPS_SCRIPT_URL.startsWith("https://script.google.com/")) {
    return new Response(
      JSON.stringify({
        error:
          "APPS_SCRIPT_URL not configured. Run: supabase secrets set APPS_SCRIPT_URL=...",
      }),
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } },
    );
  }

  try {
    const upstream = await fetch(APPS_SCRIPT_URL, {
      method: "GET",
      redirect: "follow",
    });
    if (!upstream.ok) {
      throw new Error(`Apps Script responded ${upstream.status}`);
    }
    const text = await upstream.text();
    // Validate JSON.
    JSON.parse(text);
    return new Response(text, {
      headers: {
        ...headers,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }
});
