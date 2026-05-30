import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { clearLocalHistory, loadLocalHistory } from "../lib/promptHistoryService";

export default function PromptHistory() {
  const [history, setHistory] = useState([]);
  const [copyStatus, setCopyStatus] = useState({ id: null, field: "" });

  useEffect(() => {
    setHistory(loadLocalHistory());
  }, []);

  const handleClear = () => {
    setHistory([]);
    clearLocalHistory();
  };

  const handleCopy = async (text, id, field) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus({ id, field });
      setTimeout(() => setCopyStatus({ id: null, field: "" }), 1200);
    } catch {
      // ignore clipboard errors
    }
  };

  const formatOutput = (value) => {
    if (typeof value !== "string") {
      return JSON.stringify(value, null, 2);
    }

    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-screen-lg px-4 py-6">
        <div className="mb-6 rounded-3xl border border-slate-700 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">Prompt History</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Saved prompt runs from the app. Each entry includes the original input, generated output, and the action type.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                {history.length} entr{history.length === 1 ? "y" : "ies"}
              </span>
              {history.length > 0 && (
                <button
                  onClick={handleClear}
                  className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                >
                  Clear history
                </button>
              )}
            </div>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-12 text-center text-slate-500">
            <p className="mb-2 text-lg font-medium text-slate-200">No prompts saved yet</p>
            <p className="text-sm">Run a prompt in any feature to capture history here.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {history.map((entry) => {
              const outputValue = formatOutput(entry.output);
              const inputValue = typeof entry.input === "string" ? entry.input : JSON.stringify(entry.input, null, 2);
              const isCopiedInput = copyStatus.id === entry.id && copyStatus.field === "input";
              const isCopiedOutput = copyStatus.id === entry.id && copyStatus.field === "output";

              return (
                <div key={entry.id} className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900/90 shadow-lg shadow-slate-950/20">
                  <div className="flex flex-col gap-3 border-b border-slate-700 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{entry.type || "Prompt"}</p>
                      <p className="mt-1 text-sm font-medium text-slate-100">{entry.timestamp}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(inputValue, entry.id, "input")}
                        className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
                      >
                        {isCopiedInput ? "Copied input" : "Copy input"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(outputValue, entry.id, "output")}
                        className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
                      >
                        {isCopiedOutput ? "Copied output" : "Copy output"}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 p-5 lg:grid-cols-[1.15fr_1fr]">
                    <div className="space-y-3 rounded-3xl border border-slate-700 bg-slate-950/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h2 className="text-sm font-semibold text-slate-100">Input</h2>
                          <p className="text-xs uppercase tracking-wide text-slate-500">Original prompt data</p>
                        </div>
                      </div>
                      {inputValue ? (
                        <Editor
                          height="240px"
                          language="text"
                          value={inputValue}
                          theme="vs-dark"
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 13,
                            scrollBeyondLastLine: false,
                            wordWrap: "on",
                          }}
                        />
                      ) : (
                        <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 px-4 py-5 text-sm text-slate-500 italic">
                          No input recorded for this entry.
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 rounded-3xl border border-slate-700 bg-slate-950/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h2 className="text-sm font-semibold text-slate-100">Output</h2>
                          <p className="text-xs uppercase tracking-wide text-slate-500">Generated result</p>
                        </div>
                      </div>
                      {outputValue ? (
                        <Editor
                          height="240px"
                          language="text"
                          value={outputValue}
                          theme="vs-dark"
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 13,
                            scrollBeyondLastLine: false,
                            wordWrap: "on",
                          }}
                        />
                      ) : (
                        <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 px-4 py-5 text-sm text-slate-500 italic">
                          No output recorded for this entry.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
