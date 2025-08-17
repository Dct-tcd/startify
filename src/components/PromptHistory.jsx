import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

export default function PromptHistory() {
  const [history, setHistory] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("promptHistory");
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  const handleClear = () => {
    setHistory([]);
    localStorage.removeItem("promptHistory");
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-100">
      <div className="mx-auto max-w-screen-lg px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Prompt History</h1>
          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1 text-sm text-gray-200 hover:bg-gray-700"
            >
              Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center text-gray-500 italic">
            No prompts yet. Try generating automation or migrating code.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-gray-700 bg-gray-800 shadow"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-400">
                    {entry.timestamp}
                  </span>
                  {entry.type && (
                    <span className="text-xs text-gray-500">{entry.type}</span>
                  )}
                </div>

                {/* Input */}
                <div className="p-3">
                  <h2 className="text-sm font-semibold text-gray-300 mb-1">
                    Input
                  </h2>
                  {entry.input ? (
                    <Editor
                      height="150px"
                      language="javascript"
                      value={entry.input}
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
                    <div className="rounded-lg border border-gray-700 bg-gray-900 p-2 text-sm text-gray-500 italic">
                      No input provided.
                    </div>
                  )}
                </div>

                {/* Output */}
                <div className="p-3">
                  <h2 className="text-sm font-semibold text-gray-300 mb-1">
                    Output
                  </h2>
                  {entry.output ? (
                    <Editor
                      height="200px"
                      language="javascript"
                      value={entry.output}
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
                    <div className="rounded-lg border border-gray-700 bg-gray-900 p-2 text-sm text-gray-500 italic">
                      No output generated.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
