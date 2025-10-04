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
};

export default function CodeOptimizer() {
  const [language, setLanguage] = useState("JavaScript");
  const [model, setModel] = useState("gpt-4o");
  const [inputCode, setInputCode] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const handleOptimize = async () => {
    setErr("");
    setResult(null);
    if (!inputCode.trim()) {
      setErr("Please paste some code first.");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("code-optmisation", {
        body: { language, code: inputCode, model },
      });
      if (error) throw error;

      setResult(data);

      // Save to local prompt history (optional)
      const history = JSON.parse(localStorage.getItem("promptHistory") || "[]");
      const newEntry = {
        id: Date.now(),
        type: "Code Optimization",
        input: inputCode,
        output: data?.optimizedCode || "",
        timestamp: new Date().toLocaleString(),
      };
      localStorage.setItem("promptHistory", JSON.stringify([newEntry, ...history]));
    } catch (e) {
      setErr(e.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputCode("");
    setResult(null);
    setErr("");
  };

  const handleCopy = async () => {
    if (!result?.optimizedCode) return;
    try {
      await navigator.clipboard.writeText(result.optimizedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setErr("Failed to copy to clipboard.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-100">
      <div className="mx-auto max-w-screen-lg px-2 py-1">
        {/* Header */}
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-100">
          Code Optimizer
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
              onChange={(e) => {
                setLanguage(e.target.value);
                setInputCode("");
              }}
            >
              {Object.keys(languageMap).map((lang) => (
                <option key={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-300">
              AI Model
            </label>
            <select
              className="w-40 rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-sky-500"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-5">GPT-5</option>
              <option value="gemini">Gemini</option>
            </select>
          </div>

          <div className="flex gap-2 md:ml-auto">
            <button
              className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-sky-700 disabled:opacity-60"
              onClick={handleOptimize}
              type="button"
              disabled={isLoading || !inputCode.trim()}
            >
              {isLoading ? "Optimizing…" : "Optimize"}
            </button>
            <button
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-100 shadow hover:bg-gray-700"
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

        {/* Input & Results (match CodeReview layout) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Input Panel */}
          <div className="h-[70vh] min-h-[420px] flex flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 max-w-[600px]">
            <div className="border-b border-gray-700 px-4 py-3">
              <h2 className="text-sm font-semibold">Input Code</h2>
            </div>
            <Editor
              height="100%"
              language={languageMap[language]}
              value={inputCode}
              key={language}
              onChange={(val) => setInputCode(val || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                wordWrap: "on",
              }}
            />
          </div>

          {/* Output Panel — show code + Improvements/Tradeoffs INSIDE the box */}
          <div className="h-[70vh] min-h-[420px] flex flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 max-w-[600px]">
            <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
              <h2 className="text-sm font-semibold">Optimization Results</h2>
              {result?.optimizedCode && (
                <button
                  onClick={handleCopy}
                  className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-200 hover:bg-gray-600"
                >
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 text-sm">
              {isLoading ? (
                <div className="text-gray-400">Optimizing code…</div>
              ) : !result ? (
                <div className="italic text-gray-500">No results yet.</div>
              ) : (
                <div className="space-y-6">
                  {/* Optimized Code (fixed height inside scroll, like a section) */}
                  {result.optimizedCode && (
                    <div>
                      <h3 className="font-semibold mb-2">Optimized Code</h3>
                      <div className="rounded-lg border border-gray-700 bg-gray-900">
                        <Editor
                          height="260px"
                          language={languageMap[language]}
                          value={result.optimizedCode}
                          theme="vs-dark"
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            wordWrap: "on",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Improvements */}
                  {result.improvements?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-1">Improvements</h3>
                      <ul className="list-disc list-inside text-gray-300">
                        {result.improvements.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tradeoffs */}
                  {result.potentialTradeoffs?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-1">Tradeoffs</h3>
                      <ul className="list-disc list-inside text-gray-300">
                        {result.potentialTradeoffs.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* References */}
                  {result.references?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-1">References</h3>
                      <ul className="list-disc list-inside text-blue-400">
                        {result.references.map((ref, i) => (
                          <li key={i}>
                            {typeof ref === "string" && ref.startsWith("http") ? (
                              <a
                                href={ref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-blue-300"
                              >
                                {ref}
                              </a>
                            ) : (
                              String(ref)
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
