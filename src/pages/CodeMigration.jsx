
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CodeMigration() {
  const [sourceLang, setSourceLang] = useState("JavaScript");
  const [targetLang, setTargetLang] = useState("Python");
  const [maxLength, setMaxLength] = useState(200);
  const [inputCode, setInputCode] = useState("");
  const [response, setResponse] = useState("");

  const handleMigrate = () => {
    setResponse(
      `// Code migrated from ${sourceLang} to ${targetLang} (max length: ${maxLength})\n// ...migrated code here...`
    );
  };

  const handleClear = () => {
    setInputCode("");
    setResponse("");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-2">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Source Language</label>
          <select
            className="input w-28 text-xs py-1 px-2"
            value={sourceLang}
            onChange={e => setSourceLang(e.target.value)}
          >
            <option>JavaScript</option>
            <option>Python</option>
            <option>Java</option>
            <option>C#</option>
            <option>Go</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Target Language</label>
          <select
            className="input w-28 text-xs py-1 px-2"
            value={targetLang}
            onChange={e => setTargetLang(e.target.value)}
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
            onClick={handleMigrate}
            type="button"
          >
            Migrate Code
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
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 card p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold">Input Code</h2>
          </div>
          <textarea
            className="input font-mono h-64 flex-1 resize-y"
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
            placeholder="Paste code to migrate here..."
            spellCheck={false}
          />
        </div>
        <div className="flex-1 card p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold">Migrated Code</h2>
          </div>
          <pre className="font-mono text-sm flex-1 whitespace-pre-wrap bg-slate-50 rounded-lg p-3 border border-slate-200 min-h-[22rem]">
            {response || <span className="text-slate-400 italic">No migrated code yet.</span>}
          </pre>
        </div>
      </div>
    </div>
  );
}
