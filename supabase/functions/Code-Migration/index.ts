import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
// helpers
function stripFences(s) {
  if (!s) return "";
  return s.replace(/^\s*```(?:json|[a-zA-Z]+)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
}
function safeParseJSON(s) {
  try {
    return JSON.parse(s);
  } catch  {
    return null;
  }
}
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") return new Response("ok", {
    headers: corsHeaders
  });
  try {
    const { sourceLanguage, targetLanguage, code } = await req.json();
    if (!sourceLanguage || !targetLanguage || !code) {
      return new Response(JSON.stringify({
        error: "Missing sourceLanguage, targetLanguage, or code"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({
        error: "Missing GEMINI_API_KEY"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const prompt = `
You are a senior engineer performing a **code migration**.

TASK:
Translate the given code from ${sourceLanguage} to idiomatic ${targetLanguage}, preserving behavior and edge cases.

OUTPUT (STRICT JSON ONLY):
{
  "migratedCode": "full translated code in ${targetLanguage}",
  "mappingNotes": ["api/class/library mapping notes"],
  "manualSteps": ["things the developer must do manually (libs, configs)"],
  "limitations": ["known gaps or uncertainties"]
}

RULES:
- Use idiomatic patterns for ${targetLanguage}.
- Replace libraries/APIs with closest equivalents and document them in mappingNotes.
- Keep comments meaningful if present; otherwise do not add explanations in code.
- No markdown, no fences; escaped JSON string values only.

SOURCE CODE (${sourceLanguage}):
${code}
    `;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({
        error: errText
      }), {
        status: res.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const data = await res.json();
    let raw = (data.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
    raw = stripFences(raw);
    const parsed = safeParseJSON(raw) || {};
    // extra safety: strip any stray fences inside migratedCode
    if (parsed.migratedCode) parsed.migratedCode = stripFences(String(parsed.migratedCode));
    return new Response(JSON.stringify(parsed), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
