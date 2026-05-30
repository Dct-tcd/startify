import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
Deno.serve(async (req)=>{
  // Handle preflight (CORS)
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const { language, code } = await req.json();
    if (!code || !language) {
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
You are a **principal software engineer** tasked with optimizing the following code.

DELIVERABLE:
Return ONLY valid JSON with this schema:
{
  "optimizedCode": "string - full optimized code in ${language}, no markdown fences",
  "improvements": [
    "list of short bullet points explaining key improvements"
  ],
  "potentialTradeoffs": [
    "list of possible downsides of your optimization (if any)"
  ],
  "references": [
    "official docs or keywords to search for further reading"
  ]
}

REQUIREMENTS:
- Output must be valid JSON.
- "optimizedCode" must contain only the improved code, not explanations or comments.
- Focus on:
  - Readability (clean naming, reduced complexity).
  - Performance (remove inefficiencies, better algorithms if possible).
  - Best practices (idiomatic style for ${language}).
- Preserve original logic unless unsafe or redundant.
- If the code is already optimal, return it unchanged with empty arrays for improvements/tradeoffs.

CODE:
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
    // Extract the raw text from Gemini
    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    // Try to parse Gemini output as JSON
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch  {
      // Fallback if Gemini adds markdown fences
      rawText = rawText.replace(/```json\n?/g, "").replace(/```$/g, "").trim();
      parsed = JSON.parse(rawText);
    }
    // Clean up code field (strip accidental fences)
    if (parsed.optimizedCode) {
      parsed.optimizedCode = parsed.optimizedCode.replace(/```[a-zA-Z]*\n?/g, "").replace(/```$/g, "").trim();
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
