import { useState } from "react";
export default function TestCaseGen() {
  const [language, setLanguage] = useState("JavaScript");
  const [maxLength, setMaxLength] = useState(200);
  const [inputCode, setInputCode] = useState("");
  const [response, setResponse] = useState("");

  const handleGenerate = () => {
    setResponse(
      `// Sample Test Case for ${language} (max length: ${maxLength})\n1. Open the application\n2. Enter valid credentials\n3. Click Login\n4. Verify dashboard loads`
    );
  };

  const handleClear = () => {
    setInputCode("");
    setResponse("");
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Test Case Generation</h1>
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
            className="btn btn-primary px-2 text-xs"
            onClick={handleGenerate}
            type="button"
          >
            Generate Test Cases
          </button>
          <button
            className="btn btn-ghost"
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
            placeholder="Enter code here..."
            spellCheck={false}
          />
        </div>
        {/* Output code block */}
        <div className="flex-1 card p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold">Generated Test Cases</h2>
          </div>
          <pre className="font-mono text-sm flex-1 whitespace-pre-wrap bg-slate-50 rounded-lg p-3 border border-slate-200 min-h-[22rem]">
            {response || <span className="text-slate-400 italic">No test cases generated yet.</span>}
          </pre>
        </div>
      </div>
    </div>
  );
}
   
