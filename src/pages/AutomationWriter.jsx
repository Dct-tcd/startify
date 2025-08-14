import { useState } from "react";

export default function AutomationWriter() {
  const [topic, setTopic] = useState("");
  const [useCase, setUseCase] = useState("");
  const [response, setResponse] = useState("");

  const handleGenerate = () => {
    setResponse(
      `// Automation Script for: ${topic}\n// Use case: ${useCase}\n// Step 1: Open browser\n// Step 2: Navigate to login page\n// Step 3: Enter credentials\n// Step 4: Click Login\n// Step 5: Verify dashboard`
    );
  };

  const handleClear = () => {
    setTopic("");
    setUseCase("");
    setResponse("");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header input for topic */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-700 mb-1">Topic Name</label>
          <input
            className="input w-full text-xs py-1 px-2"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. Login Automation"
          />
        </div>
        <div className="flex gap-2 md:ml-auto mt-2 md:mt-0">
          <button
            className="btn btn-primary px-3 py-1 text-xs"
            onClick={handleGenerate}
            type="button"
            disabled={!topic.trim() || !useCase.trim()}
          >
            Generate Automation
          </button>
          <button
            className="btn btn-ghost px-3 py-1 text-xs"
            onClick={handleClear}
            type="button"
          >
            Clear
          </button>
        </div>
      </div>
      {/* Use case input below header */}
      <div className="card p-4">
        <label className="block text-xs font-medium text-slate-700 mb-1">Describe your use case</label>
        <textarea
          className="input w-full font-mono h-32 resize-y text-xs"
          value={useCase}
          onChange={e => setUseCase(e.target.value)}
          placeholder="e.g. Automate login and dashboard verification"
        />
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 card p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold">Use Case</h2>
          </div>
          <pre className="input font-mono h-64 flex-1 resize-y bg-white">{useCase || <span className="text-slate-400 italic">No use case provided.</span>}</pre>
        </div>
        <div className="flex-1 card p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold">Generated Automation Script</h2>
          </div>
          <pre className="font-mono text-sm flex-1 whitespace-pre-wrap bg-slate-50 rounded-lg p-3 border border-slate-200 min-h-[22rem]">
            {response || <span className="text-slate-400 italic">No automation script generated yet.</span>}
          </pre>
        </div>
      </div>
    </div>
  );
}
