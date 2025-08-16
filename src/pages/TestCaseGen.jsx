
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Editor from "@monaco-editor/react";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


const languageMap = {
  JavaScript: "javascript",
  TypeScript: "typescript",
  Python: "python",
  Java: "java",
  "C#": "csharp",
  Go: "go",
  JSON: "json",
};



export default function TestCaseGen() {
  const [language, setLanguage] = useState("JavaScript");
  const [model, setModel] = useState("gpt-4o");
  const [inputCode, setInputCode] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");

  const normalizeCode = (code) => {
    if (!code || typeof code !== "string") return "";
    return code.replace(/\r\n/g, "\n").trim();
  };

  const handleGenerate = async () => {
    setErr("");
    setResponse("");
    if (!inputCode.trim()) {
      setErr("Please paste some code first.");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("test-case-gen", {
        body: { language, code: inputCode, model },
      });
      if (error) throw error;

      let code = data?.testCases;

      // 🔑 Format always as JSON string
      if (Array.isArray(code)) {
        code = JSON.stringify({ testCases: code }, null, 2);
      } else if (typeof code === "string") {
        try {
          // ensure valid JSON if string looks like JSON
          const parsed = JSON.parse(code);
          code = JSON.stringify(parsed, null, 2);
        } catch {
          code = JSON.stringify({ testCases: [String(code || "")] }, null, 2);
        }
      } else {
        code = JSON.stringify({ testCases: [] }, null, 2);
      }

      setResponse(normalizeCode(code));
    } catch (e) {
      setErr(e.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputCode("");
    setResponse("");
    setErr("");
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-100">
      <div className="mx-auto max-w-screen-lg px-2 py-1">
        {/* Header */}
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-100">
          Test Case Generator
        </h1>

        {/* Controls */}
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-300">
              Language
            </label>
            <select
              className="w-40 rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-sky-500"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              <option>JavaScript</option>
              <option>TypeScript</option>
              <option>Python</option>
              <option>Java</option>
              <option>C#</option>
              <option>Go</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-300">
              AI Model
            </label>
            <select
              className="w-40 rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-sky-500"
              value={model}
              onChange={e => setModel(e.target.value)}
            >
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-5">GPT-5</option>
              <option value="gemini">Gemini</option>
            </select>
          </div>
          <div className="flex gap-2 md:ml-auto">
            <button
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-sky-700 disabled:opacity-60"
              onClick={handleGenerate}
              type="button"
              disabled={isLoading || !inputCode.trim()}
            >
              {isLoading ? "Generating…" : "Generate"}
            </button>
            <button
              className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-100 shadow hover:bg-gray-700"
              onClick={handleClear}
              type="button"
            >
              Clear
            </button>
          </div>
        </div>

        {err && (
          <div className="mb-4 rounded-lg border border-red-400 bg-red-900/30 p-3 text-sm text-red-300 shadow-sm">
            {err}
          </div>
        )}

        {/* Panels with fixed width */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Input */}
          <div className="mx-auto w-full max-w-[600px] flex h-[70vh] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow">
            <div className="border-b border-gray-700 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-200">Input Code</h2>
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                language={languageMap[language]}
                value={inputCode}
                key={language}
                onChange={val => setInputCode(val || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                }}
              />
            </div>
          </div>
          {/* Output */}
          <div className="mx-auto w-full max-w-[600px] flex h-[70vh] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow">
            <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-200">Generated Test Cases</h2>
            </div>
            <div className="flex-1 min-h-0">
              {response ? (
                <Editor
                  height="100%"
                  language="json"
                  value={response}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                  }}
                />
              ) : isLoading ? (
                <div className="h-full w-full rounded-xl border border-gray-700 bg-gray-900 p-4 text-sm text-gray-400">
                  Generating test cases…
                </div>
              ) : (
                <div className="h-full w-full rounded-xl border border-gray-700 bg-gray-900 p-4 text-sm italic text-gray-500">
                  No test cases generated yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-xs text-gray-500 text-center">
          Tip: Output is always formatted as valid JSON with pretty-print.
        </div>
      </div>
    </div>
  );
}
