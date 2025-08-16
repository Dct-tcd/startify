
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Editor from "@monaco-editor/react";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


export default function AutomationWriter() {
  const [topic, setTopic] = useState("");
  const [useCase, setUseCase] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setErr("");
    setResponse("");
    if (!topic.trim() || !useCase.trim()) {
      setErr("Please provide a topic and use case.");
      return;
    }
    setIsLoading(true);
    try {
      // Simulate async automation generation
      setTimeout(() => {
        setResponse(
          `// Automation Script for: ${topic}\n// Use case: ${useCase}\n// Step 1: Open browser\n// Step 2: Navigate to login page\n// Step 3: Enter credentials\n// Step 4: Click Login\n// Step 5: Verify dashboard`
        );
        setIsLoading(false);
      }, 1000);
    } catch (e) {
      setErr(e.message || "Something went wrong");
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setTopic("");
    setUseCase("");
    setResponse("");
    setErr("");
  };

  const handleCopy = async () => {
    if (!response) return;
    try {
      await navigator.clipboard.writeText(response);
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
          Automation Writer
        </h1>

        {/* Controls */}
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end">
          {/* <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-300">Topic Name</label>
            <input
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-sky-500"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Login Automation"
            />
          </div> */}
          <div className="flex gap-2 md:ml-auto mt-2 md:mt-0">
            <button
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-sky-700 disabled:opacity-60"
              onClick={handleGenerate}
              type="button"
              disabled={!topic.trim() || !useCase.trim() || isLoading}
            >
              {isLoading ? "Generating…" : "Generate Automation"}
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

        {/* Use case input below header */}
        {/* <div className="mb-4">
          <label className="block text-xs font-medium text-gray-300 mb-1">Describe your use case</label>
          <Editor
            height="100px"
            language="markdown"
            value={useCase}
            onChange={val => setUseCase(val || "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              wordWrap: "on",
            }}
          />
        </div> */}

        {/* Panels with fixed width */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Use Case Panel */}
          <div className="mx-auto w-full max-w-[600px] flex h-[70vh] min-h-[200px] flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow">
            <div className="border-b border-gray-700 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-200">Use Case</h2>
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                language="markdown"
                value={useCase}
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
          {/* Output Panel */}
          <div className="mx-auto w-full max-w-[600px] flex h-[70vh] min-h-[200px] flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow">
            <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-200">Generated Automation Script</h2>
              {response && (
                <button
                  onClick={handleCopy}
                  className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-200 hover:bg-gray-600"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            <div className="flex-1 min-h-0">
              {response ? (
                <Editor
                  height="100%"
                  language="javascript"
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
                  Generating automation…
                </div>
              ) : (
                <div className="h-full w-full rounded-xl border border-gray-700 bg-gray-900 p-4 text-sm italic text-gray-500">
                  No automation script generated yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-xs text-gray-500 text-center">
          Tip: Panels are fixed width (600px) for readability.
        </div>
      </div>
    </div>
  );
}
