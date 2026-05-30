import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
// --- CORS headers ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
// --- helpers ---
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
// --- Main handler ---
Deno.serve(async (req)=>{
  // 🔹 Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders
      }
    });
  }
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
    // --- Build prompt for Gemini ---
    const prompt = `
You are a principal engineer conducting a rigorous code review.

DELIVERABLE:
Return ONLY valid JSON with this schema:
{
  "summary": "2-4 sentences",
  "score": { "readability": 0-10, "correctness": 0-10, "robustness": 0-10, "performance": 0-10, "security": 0-10, "maintainability": 0-10 },
  "issues": [
    {
      "title": "short issue title",
      "severity": "low|medium|high|critical",
      "category": "correctness|security|performance|style|maintainability|testing",
      "evidence": "quote or snippet",
      "explanation": "why this matters",
      "fix": "suggested fix snippet"
    }
  ],
  "quickWins": ["bulleted actionable items"],
  "deeperRefactors": ["bulleted larger refactors"],
  "testingGaps": ["tests we should add"],
  "references": ["official doc links or keywords to search"]
}

REVIEW FOCUS:
- Catch correctness bugs, edge cases, concurrency hazards, resource leaks.
- Security: input validation, injection, authz, secrets handling.
- Performance: hot paths, N+1, memory, algorithmic complexity.
- Maintainability: cohesion, coupling, naming, dead code, duplication.
- Testing: coverage of branches, error handling, boundaries.
- If you do not find any code suggestions, say the code looks great , no imporvements.
CONTEXT:
- Language: ${language}
- Be precise but concise; do not add extra fields.


CODE UNDER REVIEW:
${code}
    `;
    // --- Call Gemini ---
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
    console.log(parsed, "parsed");
    return new Response(JSON.stringify(parsed), {
      status: 200,
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
