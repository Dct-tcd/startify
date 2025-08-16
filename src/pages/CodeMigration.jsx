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

export default function CodeMigration() {
  const [sourceLanguage, setSourceLanguage] = useState("Java");
  const [targetLanguage, setTargetLanguage] = useState("Python");
  const [model, setModel] = useState("gpt-4o");
  const [inputCode, setInputCode] = useState("");
  const [migration, setMigration] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const handleMigrate = async () => {
    setErr("");
    setMigration(null);
    if (!inputCode.trim()) {
      setErr("Please paste code to migrate first.");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("Code-Migration", {
        body: { sourceLanguage, targetLanguage, code: inputCode, model },
      });

      if (error) throw error;
      setMigration(data);
    } catch (e) {
      setErr(e.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputCode("");
    setMigration(null);
    setErr("");
  };

  const handleCopy = async () => {
    if (!migration) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(migration, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setErr("Failed to copy to clipboard.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-100">
      <div className="mx-auto max-w-screen-lg px-2 py-1">
        <h1 className="mb-2 text-2xl font-bold tracking-tight">Code Migration</h1>

        {/* Controls */}
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-300">From</label>
            <select
              className="w-40 rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-sm"
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
            >
              {Object.keys(languageMap).map((lang) => (
                <option key={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-300">To</label>
            <select
              className="w-40 rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-sm"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
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
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium shadow hover:bg-sky-700 disabled:opacity-60"
              onClick={handleMigrate}
              disabled={isLoading || !inputCode.trim()}
            >
              {isLoading ? "Migrating…" : "Migrate Code"}
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
          <div className="h-[70vh] flex flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-800">
            <div className="border-b border-gray-700 px-4 py-3">
              <h2 className="text-sm font-semibold">Input Code</h2>
            </div>
            <Editor
              height="100%"
              language={languageMap[sourceLanguage]}
              value={inputCode}
              key={sourceLanguage}
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

          {/* Migration Output */}
          <div className="h-[70vh] flex flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
              <h2 className="text-sm font-semibold">Migration Results</h2>
              {migration && (
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
                <div className="text-gray-400">Migrating code…</div>
              ) : !migration ? (
                <div className="italic text-gray-500">No migration yet.</div>
              ) : (
                <div className="space-y-6">
                  {/* Migrated Code */}
                  {migration.migratedCode && (
                    <div>
                      <h3 className="font-semibold mb-2">Migrated Code</h3>
                      <Editor
                        height="300px"
                        language={languageMap[targetLanguage]}
                        value={migration.migratedCode}
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          readOnly: true,
                          scrollBeyondLastLine: false,
                          wordWrap: "on",
                        }}
                      />
                    </div>
                  )}

                  {/* Mapping Notes */}
                  {migration.mappingNotes?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-1">Mapping Notes</h3>
                      <ul className="list-disc list-inside text-gray-300">
                        {migration.mappingNotes.map((note, i) => (
                          <li key={i}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Manual Steps */}
                  {migration.manualSteps?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-1">Manual Steps</h3>
                      <ul className="list-disc list-inside text-gray-300">
                        {migration.manualSteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Limitations */}
                  {migration.limitations?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-1">Limitations</h3>
                      <ul className="list-disc list-inside text-gray-300">
                        {migration.limitations.map((lim, i) => (
                          <li key={i}>{lim}</li>
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
