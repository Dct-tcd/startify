import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const promptTemplate = `
You are an expert automation engineer.

The user has described an automation idea. 
Your task is to generate a clean, runnable automation script in {{LANGUAGE}}.

Instructions for formatting your answer:
1. Start with a short explanation in plain text (2–5 sentences).
2. Then provide the script inside a fenced code block.
   - Use triple backticks with the correct language identifier (like \`\`\`{{language.toLowerCase()}}\`\`\`).
3. Do not include anything outside this format.

Automation Idea:
"{{IDEA}}"

if you do not see anything to generate , return failed to return anythinng in explanantion
`;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const { language, idea } = await req.json();
    const prompt = promptTemplate.replace(/{{LANGUAGE}}/g, language).replace(/{{IDEA}}/g, idea);
    // 🔹 Mock fallback if no API key
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({
        explanation: `This is a mock explanation for your ${language} automation.`,
        code: `# mock ${language} script\nprint("Hello world!")`,
        mock: true
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // 🔹 Call Gemini
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
    const data = await res.json();
    let rawOutput = data;
    // 🔹 Split into explanation + code
    let explanation = rawOutput;
    let code = "";
    console.log(code, explanation);
    const codeMatch = rawOutput.match(/```(\w+)?([\s\S]*?)```/);
    if (codeMatch) {
      explanation = rawOutput.slice(0, codeMatch.index).trim();
      code = codeMatch[2].trim();
    }
    console.log(code, explanation);
    return new Response(JSON.stringify({
      explanation,
      code
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
