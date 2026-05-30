// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// // Load prompt.md at runtime
// const promptTemplate = Deno.env.get("prompt") ?? "";
// const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
// };
// Deno.serve(async (req)=>{
//   if (req.method === "OPTIONS") {
//     return new Response("ok", {
//       headers: corsHeaders
//     });
//   }
//   try {
//     const { language, code } = await req.json();
//     // Replace placeholders in the prompt
//     const prompt = promptTemplate.replace(/{{LANGUAGE}}/g, language).replace(/{{CODE}}/g, code);
//     // Mock mode if no API key
//     if (!OPENAI_API_KEY) {
//       return new Response(JSON.stringify({
//         testCases: JSON.stringify([
//           `Mock test case for ${language}: Verify input is valid`,
//           "Verify expected output matches requirements",
//           "Test edge cases and invalid inputs",
//           "Ensure performance under load"
//         ]),
//         mock: true
//       }), {
//         headers: {
//           ...corsHeaders,
//           "Content-Type": "application/json"
//         }
//       });
//     }
//     console.log("Calling OpenAI...");
//     const res = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${OPENAI_API_KEY}`
//       },
//       body: JSON.stringify({
//         model: "gpt-5",
//         max_tokens: 500,
//         messages: [
//           {
//             role: "user",
//             content: prompt + code
//           }
//         ]
//       })
//     });
//     if (!res.ok) {
//       const errText = await res.text();
//       console.error("OpenAI error:", errText);
//       return new Response(JSON.stringify({
//         error: errText
//       }), {
//         status: res.status,
//         headers: {
//           ...corsHeaders,
//           "Content-Type": "application/json"
//         }
//       });
//     }
//     const data = await res.json();
//     let rawOutput = data.choices?.[0]?.message?.content ?? "[]";
//     // Try to ensure output is always valid JSON array
//     let parsed;
//     try {
//       parsed = JSON.parse(rawOutput);
//       if (!Array.isArray(parsed)) throw new Error("Not an array");
//     } catch  {
//       // Fallback: wrap into array
//       parsed = [
//         rawOutput
//       ];
//     }
//     console.log("Returning test cases:", parsed);
//     return new Response(JSON.stringify({
//       testCases: JSON.stringify(parsed)
//     }), {
//       headers: {
//         ...corsHeaders,
//         "Content-Type": "application/json"
//       }
//     });
//   } catch (err) {
//     console.error("Function error:", err);
//     return new Response(JSON.stringify({
//       error: err.message
//     }), {
//       status: 400,
//       headers: {
//         ...corsHeaders,
//         "Content-Type": "application/json"
//       }
//     });
//   }
// });
// supabase/functions/testcase-gen/index.ts
// functions/test-cases/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const promptTemplate = `
You are an expert software tester.
Generate runnable test cases for the provided code in {{LANGUAGE}}.

STRICT RULES:
1. Return an array of strings where each element is a FULL test case.
2. Each test case MUST include a short comment at the top (e.g. "// Tests X scenario").
3. Respond STRICTLY with valid JSON:
{
  "testCases": ["case1", "case2", "case3"]
}
4. Minimum of 5 test cases.

Code ({{LANGUAGE}}):
{{CODE}}
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
    const { language, code } = await req.json();
    const prompt = promptTemplate.replace(/{{LANGUAGE}}/g, language).replace(/{{CODE}}/g, code);
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({
        testCases: [
          `// Test valid input\nassert add(2,2) == 4`,
          `// Test negative numbers\nassert add(-1,-3) == -4`
        ],
        mock: true
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
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
    let rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    rawOutput = rawOutput.replace(/```(json|javascript|python|java|typescript|csharp)?/gi, "").trim();
    let parsed;
    try {
      const obj = JSON.parse(rawOutput);
      parsed = Array.isArray(obj.testCases) ? obj.testCases : [
        rawOutput
      ];
    } catch  {
      parsed = rawOutput.split("\n").map((line)=>line.trim()).filter(Boolean);
    }
    return new Response(JSON.stringify({
      testCases: parsed
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
