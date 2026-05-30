import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_UPLOAD_URL =
  "https://generativelanguage.googleapis.com/upload/v1beta/files?key=" + GEMINI_API_KEY;
const GEMINI_MODEL_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Safe base64 → Uint8Array
function base64ToUint8Array(base64: string) {
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { fileName, fileContent, model } = await req.json();
    console.log("Received request:", { fileName, model });

    if (!fileName || !fileContent) {
      console.log("Missing fileName or fileContent");
      return new Response(
        JSON.stringify({ error: "Missing fileName or fileContent" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!GEMINI_API_KEY) {
      console.log("Missing GEMINI_API_KEY");
      return new Response(
        JSON.stringify({ error: "Missing GEMINI_API_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // MIME detection
    let mimeType = "application/octet-stream";
    const lower = fileName.toLowerCase();
    if (lower.endsWith(".pdf")) mimeType = "application/pdf";
    if (lower.endsWith(".docx"))
      mimeType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    console.log("Detected MIME type:", mimeType);

    // Decode Base64
    const binary = base64ToUint8Array(fileContent);
    console.log("Binary length:", binary.length);

    // Prepare FormData for upload
    const form = new FormData();
    form.append(
      "file",
      new Blob([binary], { type: mimeType }),
      fileName
    );
    console.log("FormData created with file:", fileName);

    // Upload file to Gemini
    const uploadRes = await fetch(GEMINI_UPLOAD_URL, { method: "POST", body: form });
    console.log("Upload response status:", uploadRes.status);

    if (!uploadRes.ok) {
      const uploadErr = await uploadRes.text();
      console.log("Upload failed:", uploadErr);
      return new Response(
        JSON.stringify({ error: `Upload failed: ${uploadErr}` }),
        { status: uploadRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const uploadData = await uploadRes.json();
    console.log("Upload response data:", uploadData);
    const fileUri = uploadData?.file?.uri;

    if (!fileUri) {
      console.log("No file URI returned after upload");
      return new Response(
        JSON.stringify({ error: "File upload failed, no URI returned" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prompt
    const prompt = `
You are a senior QA engineer.
Generate at least 25 detailed test cases for the uploaded document (PDF or Word DOCX).
Make sure to generate at least 5 negative test cases.
Also if the uploaded document is a FSD or requirement definition file, make sure to generate 1 test case for every section / requirement.

DELIVERABLE:
Return ONLY valid JSON with this exact structure:
{
  "testCases": [
    {
      "testCaseId": "TC_01",
      "title": "string",
      "description": "string",
      "preconditions": "string",
      "steps": [
        { "stepNo": number, "action": "string", "expectedResult": "string" }
      ]
    }
  ]
}

File: ${fileName}
`;

    // Call Gemini
    console.log("Calling Gemini model with file URI:", fileUri);
    const genRes = await fetch(GEMINI_MODEL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              { file_data: { mime_type: mimeType, file_uri: fileUri } },
            ],
          },
        ],
      }),
    });

    console.log("Gemini response status:", genRes.status);

    if (!genRes.ok) {
      const errText = await genRes.text();
      console.log("Gemini model failed:", errText);
      return new Response(
        JSON.stringify({ error: errText }),
        { status: genRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await genRes.json();
    console.log("Gemini raw data:", data);

    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    rawText = rawText.replace(/```(json|text)?\n?/gi, "").replace(/```$/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      console.log("Error parsing JSON from Gemini:", parseErr, "Raw text:", rawText);
      parsed = {
        testCases: [
          {
            testCaseId: "TC_ERROR",
            title: "Error parsing test cases",
            description: rawText.slice(0, 200),
            preconditions: "",
            steps: [],
          },
        ],
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
