import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

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

function CodeBlock({ code, language }) {
  const syntaxLanguage = languageMap[language] || "text";
  return (
    <div className="overflow-auto w-full rounded-md border border-slate-700">
      <SyntaxHighlighter
        language={syntaxLanguage}
        style={oneDark}
        wrapLines={true}
        showLineNumbers={true}
      >
        {String(code)}
      </SyntaxHighlighter>
    </div>
  );
}

export default function TestCaseGen() {
  const [language, setLanguage] = useState("JavaScript");
  const [maxLength, setMaxLength] = useState(200);
  const [inputCode, setInputCode] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");

  // Normalize line breaks for all languages
  const formatCode = (code) => {
    if (!code || typeof code !== "string") return "";
    return code.replace(/\r\n/g, "\n").trim();
  };

  const handleGenerate = async () => {
    setErr("");
    setResponse("");
    if (!inputCode.trim()) {
      setErr("Please paste some code first.");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("test-case-gen", {
        body: { language, code: inputCode, maxLength },
      });
      if (error) throw error;

      let code = data?.testCases;
      if (Array.isArray(code)) code = code.join("\n");
      if (typeof code !== "string") code = String(code || "");

      setResponse(formatCode(code));
    } catch (e) {
      setErr(e.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputCode("");
    setResponse("");
    setErr("");
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    handleClear(); // Clear input/output when language changes
  };

  return (
    <div className="flex flex-col gap-6 w-full px-4">
      <h1 className="text-xl font-bold">Test Case Generation</h1>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-2">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Language
          </label>
          <select
            className="input w-32 text-xs py-1 px-2"
            value={language}
            onChange={handleLanguageChange}
          >
            <option>JavaScript</option>
            <option>TypeScript</option>
            <option>Python</option>
            <option>Java</option>
            <option>C#</option>
            <option>Go</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Maximum Output Length
          </label>
          <input
            type="number"
            className="input w-24 text-xs py-1 px-2"
            min={50}
            max={4000}
            value={maxLength}
            onChange={(e) => setMaxLength(Number(e.target.value))}
          />
        </div>

        <div className="flex gap-2 md:ml-auto">
          <button
            className="btn btn-primary px-3 text-xs disabled:opacity-60"
            onClick={handleGenerate}
            type="button"
            disabled={isLoading || !inputCode.trim()}
          >
            {isLoading ? "Generating…" : "Generate Test Cases"}
          </button>
          <button className="btn btn-ghost" onClick={handleClear} type="button">
            Clear
          </button>
        </div>
      </div>

      {err && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {err}
        </div>
      )}

      {/* Input/Output Panels */}
      <div className="flex flex-col md:flex-row gap-6 w-full">
        <div className="card p-4 flex flex-col flex-1 w-full max-w-[800px]">
          <h2 className="text-base font-semibold mb-2">Input Code</h2>
          <textarea
            className="input font-mono h-64 resize-none overflow-auto w-full"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Paste the code you want tests for…"
            spellCheck={false}
          />
        </div>

        <div className="card p-4 flex flex-col flex-1 w-full max-w-[800px]">
          <h2 className="text-base font-semibold mb-2">Generated Test Cases</h2>
          {response ? (
            <CodeBlock code={response} language={language} />
          ) : isLoading ? (
            <div>Generating test cases…</div>
          ) : (
            <span className="text-slate-400 italic">
              No test cases generated yet.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
