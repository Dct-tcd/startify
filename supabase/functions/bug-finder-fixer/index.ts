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
    const { language, code } = await req.json();
    if (!language || !code) {
      return new Response(JSON.stringify({
        error: "Missing language or code"
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
You are a senior engineer and debugging expert.

TASK:
Identify **bugs, vulnerabilities, and edge-case failures**, then provide a **corrected version** of the code.

STRICT JSON OUTPUT ONLY:
{
  "summary": "1-3 sentence overview of issues & fixes",
  "bugs": [
    {
      "title": "concise bug title",
      "severity": "low|medium|high|critical",
      "type": "logic|concurrency|security|api|performance|resource|style|other",
      "evidence": "snippet or description that proves the bug",
      "explanation": "why it fails and when",
      "fix": "short explanation of the fix",
      "patch": "unified diff or minimal code snippet showing the fix"
    }
  ],
  "fixedCode": "full corrected code in ${language}"
}

GUIDELINES:
- Prefer minimal, targeted fixes that fully resolve the root cause.
- Consider error handling, input validation, boundary conditions, timeouts, resource cleanup.
- Keep output deterministic; no comments outside JSON.
- No markdown fences in any field.

ORIGINAL CODE (${language}):
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
    // Safety: strip fences inside fixedCode or patches if present
    if (parsed.fixedCode) parsed.fixedCode = stripFences(String(parsed.fixedCode));
    if (Array.isArray(parsed.bugs)) {
      parsed.bugs = parsed.bugs.map((b)=>({
          ...b,
          patch: b?.patch ? stripFences(String(b.patch)) : b?.patch
        }));
    }
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
