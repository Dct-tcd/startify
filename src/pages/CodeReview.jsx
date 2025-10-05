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

export default function CodeReview() {
  const [language, setLanguage] = useState("JavaScript");
  const [model, setModel] = useState("gpt-4o");
  const [inputCode, setInputCode] = useState("");
  const [review, setReview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const handleReview = async () => {
    setErr("");
    setReview(null);
    if (!inputCode.trim()) {
      setErr("Please paste code to review first.");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("Code-Review", {
        body: { language, code: inputCode, model },
      });

      if (error) throw error;
      setReview(data);
    } catch (e) {
      setErr(e.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputCode("");
    setReview(null);
    setErr("");
  };

  const handleCopy = async () => {
    if (!review) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(review, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setErr("Failed to copy to clipboard.");
    }
  };

  const severityColors = {
    low: "bg-green-700 text-green-200",
    medium: "bg-yellow-700 text-yellow-200",
    high: "bg-orange-700 text-orange-200",
    critical: "bg-red-700 text-red-200",
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-100">
      <div className="mx-auto max-w-screen-lg px-2 py-1">
        <h1 className="mb-2 text-2xl font-bold tracking-tight">Code Review</h1>

        {/* Controls */}
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-300">
              Language
            </label>
            <select
              className="w-40 rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-sm"
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
              className="w-40 rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-sm"
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
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium shadow hover:bg-sky-700 disabled:opacity-60"
              onClick={handleReview}
              disabled={isLoading || !inputCode.trim()}
            >
              {isLoading ? "Reviewing…" : "Review Code"}
            </button>
            <button
              className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </div>

        {err && (
          <div className="mb-4 rounded-lg border border-red-400 bg-red-900/30 p-3 text-sm text-red-300">
            {err}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Input */}
          <div className="h-[70vh] min-h-[420px] flex flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-800">
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

          {/* Review Output */}
          <div className="h-[70vh] min-h-[420px] flex flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
              <h2 className="text-sm font-semibold">Review Results</h2>
              {review && (
                <button
                  onClick={handleCopy}
                  className="rounded bg-gray-700 px-2 py-1 text-xs hover:bg-gray-600"
                >
                  {copied ? "Copied!" : "Copy JSON"}
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 text-sm">
              {isLoading ? (
                <div className="text-gray-400">Reviewing code…</div>
              ) : !review ? (
                <div className="italic text-gray-500">
                  No review suggestions yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary */}
                  {review.summary && (
                    <div>
                      <h3 className="font-semibold mb-1">Summary</h3>
                      <p className="text-gray-300">{review.summary}</p>
                    </div>
                  )}

                  {/* Issues */}
                  {review.issues?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Issues</h3>
                      <div className="space-y-3">
                        {review.issues.map((issue, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg border border-gray-700 bg-gray-900 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{issue.title}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  severityColors[issue.severity] || "bg-gray-600"
                                }`}
                              >
                                {issue.severity}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              Category: {issue.category}
                            </p>
                            <p className="mt-2 text-gray-300">
                              <strong>Evidence:</strong> {issue.evidence}
                            </p>
                            <p className="mt-1 text-gray-300">
                              <strong>Explanation:</strong> {issue.explanation}
                            </p>
                            <p className="mt-1 text-gray-300">
                              <strong>Fix:</strong>{" "}
                              <code className="bg-gray-800 px-1 py-0.5 rounded">
                                {issue.fix}
                              </code>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Wins */}
                  {review.quickWins?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-1">Quick Wins</h3>
                      <ul className="list-disc list-inside text-gray-300">
                        {review.quickWins.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Deeper Refactors */}
                  {review.deeperRefactors?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-1">Deeper Refactors</h3>
                      <ul className="list-disc list-inside text-gray-300">
                        {review.deeperRefactors.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Testing Gaps */}
                  {review.testingGaps?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-1">Testing Gaps</h3>
                      <ul className="list-disc list-inside text-gray-300">
                        {review.testingGaps.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* References */}
                  {review.references?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-1">References</h3>
                      <ul className="list-disc list-inside text-blue-400">
                        {review.references.map((ref, i) => (
                          <li key={i}>
                            {ref.startsWith("http") ? (
                              <a
                                href={ref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-blue-300"
                              >
                                {ref}
                              </a>
                            ) : (
                              ref
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
