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

export default function BugFixer() {
  const [language, setLanguage] = useState("JavaScript");
  const [model, setModel] = useState("gpt-4o");
  const [inputCode, setInputCode] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFindFix = async () => {
    setErr("");
    setResult(null);
    if (!inputCode.trim()) {
      setErr("Please paste code with bugs first.");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("bug-finder-fixer", {
        body: { language, code: inputCode, model },
      });

      if (error) throw error;
      setResult(data);
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
    if (!result?.fixedCode) return;
    try {
      await navigator.clipboard.writeText(result.fixedCode);
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
          Bug Finder & Fixer
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
              onChange={(e) => setLanguage(e.target.value)}
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
              onClick={handleFindFix}
              type="button"
              disabled={isLoading || !inputCode.trim()}
            >
              {isLoading ? "Finding…" : "Find & Fix Bugs"}
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Input */}
          <div className="mx-auto w-full max-w-[600px] flex h-[70vh] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow">
            <div className="border-b border-gray-700 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-200">
                Input Code
              </h2>
            </div>
            <div className="flex-1 min-h-0">
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
          </div>

          {/* Output */}
          <div className="mx-auto w-full max-w-[600px] flex h-[70vh] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow">
            <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-200">
                Bug Fix Suggestions
              </h2>
              {result?.fixedCode && (
                <button
                  onClick={handleCopy}
                  className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-200 hover:bg-gray-600"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 text-sm">
              {isLoading ? (
                <p className="text-gray-400">Finding bugs…</p>
              ) : result ? (
                <>
                  {/* Summary */}
                  {result.summary && (
                    <div className="mb-2 text-gray-300">
                      <strong>Summary:</strong> {result.summary}
                    </div>
                  )}

                  {/* Bugs list */}
                  {Array.isArray(result.bugs) && result.bugs.length > 0 && (
                    <div className="space-y-2">
                      <strong className="text-gray-200">Bugs Found:</strong>
                      {result.bugs.map((bug, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-gray-700 bg-gray-900 p-3"
                        >
                          <div className="font-semibold text-red-400">
                            {bug.title} ({bug.severity})
                          </div>
                          <div className="text-xs text-gray-400 mb-1">
                            Type: {bug.type}
                          </div>
                          <div className="text-gray-300">
                            <p><strong>Evidence:</strong> {bug.evidence}</p>
                            <p><strong>Explanation:</strong> {bug.explanation}</p>
                            <p><strong>Fix:</strong> {bug.fix}</p>
                          </div>
                          {bug.patch && (
                            <pre className="mt-2 rounded bg-gray-800 p-2 text-xs text-gray-200 overflow-x-auto">
                              {bug.patch}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fixed Code */}
                  {result.fixedCode && (
                    <div>
                      <strong className="text-gray-200">Fixed Code:</strong>
                      <Editor
                        height="300px"
                        language={languageMap[language]}
                        value={result.fixedCode}
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
                  )}
                </>
              ) : (
                <p className="italic text-gray-500">
                  No bug fix suggestions yet.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500 text-center">
          Tip: Panels are fixed width (600px) for readability.
        </div>
      </div>
    </div>
  );
}
