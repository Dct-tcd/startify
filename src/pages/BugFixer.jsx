
import { useState } from "react";

export default function BugFixer() {
  const [language, setLanguage] = useState("JavaScript");
  const [maxLength, setMaxLength] = useState(200);
  const [inputCode, setInputCode] = useState("");
  const [response, setResponse] = useState("");

  const handleFindFix = () => {
    setResponse(
      `// Bug Fix Suggestions for ${language} (max length: ${maxLength})\n- Found 1 bug: 'user' is undefined on line 12.\n- Suggestion: Declare 'user' before using it.\n- Fixed code example:\nconst user = getUser();\nconsole.log(user.name);`
    );
  };

  const handleClear = () => {
    setInputCode("");
    setResponse("");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Inputs */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-2">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Language</label>
          <select
            className="input w-28 text-xs py-1 px-2"
            value={language}
            onChange={e => setLanguage(e.target.value)}
          >
            <option>JavaScript</option>
            <option>Python</option>
            <option>Java</option>
            <option>C#</option>
            <option>Go</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Maximum Output Length</label>
          <input
            type="number"
            className="input w-20 text-xs py-1 px-2"
            min={50}
            max={1000}
            value={maxLength}
            onChange={e => setMaxLength(Number(e.target.value))}
          />
        </div>
        <div className="flex gap-2 md:ml-auto">
          <button
            className="btn btn-primary px-3 py-1 text-xs"
            onClick={handleFindFix}
            type="button"
          >
            Find & Fix Bugs
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

      {/* Two equal code block panels */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Input code block */}
        <div className="flex-1 card p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold">Input Code</h2>
          </div>
          <textarea
            className="input font-mono h-64 flex-1 resize-y"
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
            placeholder="Paste code with bugs here..."
            spellCheck={false}
          />
        </div>
        {/* Output code block */}
        <div className="flex-1 card p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold">Bug Fix Suggestions</h2>
          </div>
          <pre className="font-mono text-sm flex-1 whitespace-pre-wrap bg-slate-50 rounded-lg p-3 border border-slate-200 min-h-[22rem]">
            {response || <span className="text-slate-400 italic">No bug fix suggestions yet.</span>}
          </pre>
        </div>
      </div>
    </div>
  );
}
