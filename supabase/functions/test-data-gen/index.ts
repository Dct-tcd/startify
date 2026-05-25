import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
// Helpers
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
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const { language, code , model } = await req.json();
    if (!language  || !code) {
      return new Response(JSON.stringify({
        error: "Missing language, maxLength, or code/schema"
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
You are a senior test automation engineer. 

TASK:
Generate **realistic test data** in ${language} given this input schema or code:
${code}

RULES:
- Output STRICT JSON only (no markdown, no fences).
- Do not exceed 2000 characters in test data.
- Use meaningful sample values (names, IDs, emails, timestamps).
- Ensure syntax is valid for ${language}.
- Include metadata: "manualSteps" and "limitations".

OUTPUT FORMAT:
{
  "testData": "generated test data in ${language}",
  "manualSteps": ["things developer must do manually (configs, libraries, etc.)"],
  "limitations": ["known gaps or assumptions"]
}
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
    // Extra cleanup safety
    if (parsed.testData) parsed.testData = stripFences(String(parsed.testData));
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
