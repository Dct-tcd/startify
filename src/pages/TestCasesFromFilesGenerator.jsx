import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import mammoth from "mammoth";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function FileTestCaseGen() {
  const [model, setModel] = useState("gpt-4o");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileText, setFileText] = useState("");
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFileChange = async (e) => {
    const f = e.target.files?.[0];
    setResponse(null);
    setErr("");
    setFileText("");

    if (!f) {
      setFile(null);
      setFileName("");
      return;
    }

    const validMime =
      f.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const validExt = f.name.toLowerCase().endsWith(".docx");

    if (!validMime || !validExt) {
      setErr("Only Word (.docx) files are allowed.");
      e.target.value = "";
      setFile(null);
      setFileName("");
      return;
    }

    setFile(f);
    setFileName(f.name);

    try {
      const result = await mammoth.extractRawText({ arrayBuffer: await f.arrayBuffer() });
      setFileText(result.value);
    } catch (e) {
      console.error("Error extracting text:", e);
      setErr("Failed to read file content.");
    }
  };

  const handleGenerate = async () => {
    setErr("");
    setResponse(null);

    if (!file) {
      setErr("Please select a Word (.docx) file first.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("file-test-gen", {
        body: {
          fileName,
          content: fileText,
          model,
        },
      });

      if (error) throw error;
      setResponse({ testCases: data?.testCases ?? [] });
    } catch (e) {
      console.error("Error generating test cases:", e);
      setErr(e.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setFileName("");
    setFileText("");
    setResponse(null);
    setErr("");
  };

  const handleCopy = async () => {
    if (!response?.testCases?.length) return;

    try {
      const plainText = response.testCases
        .map((tc, idx) => {
          const steps =
            tc.steps?.map((s, i) => `${i + 1}. ${s}`).join("\n") || "";
          return `${idx + 1}. ${tc.title || "Untitled"}\nSteps:\n${steps}\nExpected: ${
            tc.expected || "N/A"
          }`;
        })
        .join("\n\n");

      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setErr("Failed to copy to clipboard.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-100">
      <div className="mx-auto max-w-screen-xl px-2 py-4">
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-gray-100">
          File-based Test Case Generator
        </h1>

        {/* Controls */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-300">
              AI Model
            </label>
            <select
              className="w-40 rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-sky-500"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-5">GPT-5</option>
              <option value="gemini">Gemini</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-300">
              Upload Word (.docx)
            </label>
            <input
              type="file"
              accept=".docx"
              className="block w-60 rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100 shadow-sm file:mr-2 file:rounded-md file:border-0 file:bg-sky-600 file:px-3 file:py-1 file:text-white hover:file:bg-sky-700"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex gap-2 md:ml-auto">
            <button
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-sky-700 disabled:opacity-60"
              onClick={handleGenerate}
              type="button"
              disabled={isLoading || !file}
            >
              {isLoading ? "Generating Test Cases" : "Generate Test Cases"}
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

        {/* Error */}
        {err && (
          <div className="mb-4 rounded-lg border border-red-400 bg-red-900/30 p-3 text-sm text-red-300 shadow-sm">
            {err}
          </div>
        )}

        {/* Panels */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left Panel: File Text */}
          <div className="mx-auto w-full max-w-[600px] flex h-[70vh] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow">
            <div className="border-b border-gray-700 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-200">Uploaded File Text</h2>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-4 text-sm text-gray-200 whitespace-pre-wrap">
              {fileText || "No file content loaded."}
            </div>
          </div>

          {/* Right Panel: Generated Test Cases */}
          <div className="mx-auto w-full max-w-[600px] flex flex-col h-[70vh] min-h-[420px] overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow">
            <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-200">Generated Test Cases</h2>
              {response?.testCases?.length > 0 && (
                <button
                  onClick={handleCopy}
                  className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-200 hover:bg-gray-600"
                >
                  {copied ? "Copied!" : "Copy All"}
                </button>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="h-full w-full rounded-xl border border-gray-700 bg-gray-900 p-4 text-sm text-gray-400 text-center">
                  Generating test cases…
                </div>
              ) : response?.testCases?.length > 0 ? (
                response.testCases.map((tc, i) => (
                  <div key={i} className="rounded-lg bg-gray-800 p-4 shadow border border-gray-700 space-y-2">
                    <h3 className="font-semibold text-sky-400">
                      {i + 1}. {tc.title || "Untitled"}
                    </h3>
                    {tc.steps?.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-300">Steps:</span>
                        <ol className="list-decimal list-inside ml-3 text-gray-200">
                          {tc.steps.map((s, j) => (
                            <li key={j}>{s}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {tc.expected && (
                      <p>
                        <span className="font-medium text-gray-300">Expected:</span> {tc.expected}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="h-full w-full rounded-xl border border-gray-700 bg-gray-900 p-4 text-sm italic text-gray-500 text-center">
                  No test cases generated yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
