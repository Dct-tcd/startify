import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import mammoth from "mammoth";
import { PDFDocument, rgb } from "pdf-lib";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function FileTestCaseGen() {
  const [model, setModel] = useState("gemini");
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [response, setResponse] = useState(null);

  const [isLoading, setIsLoading] = useState(false); // generation
  const [isConverting, setIsConverting] = useState(false); // DOCX → PDF

  const [err, setErr] = useState("");
  const [expanded, setExpanded] = useState({});
  const [controller, setController] = useState(null);
  const [isDocx, setIsDocx] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  const convertDocxToPdf = async (docxFile) => {
    const arrayBuffer = await docxFile.arrayBuffer();
    const { value: text } = await mammoth.extractRawText({ arrayBuffer });

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { height } = page.getSize();
    const fontSize = 12;
    let y = height - 40;

    text.split("\n").forEach((line) => {
      page.drawText(line, {
        x: 40,
        y,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      y -= fontSize + 2;
    });

    const pdfBytes = await pdfDoc.save();
    return new File(
      [pdfBytes],
      docxFile.name.replace(/\.docx$/i, ".pdf"),
      { type: "application/pdf" }
    );
  };

  const handleFileChange = async (e) => {
    const f = e.target.files?.[0];
    setResponse(null);
    setErr("");
    setIsDocx(false);

    if (!f) return setFile(null);

    if (
      !f.name.toLowerCase().endsWith(".pdf") &&
      !f.name.toLowerCase().endsWith(".docx")
    ) {
      setErr("Only PDF or DOCX files are allowed.");
      e.target.value = "";
      return;
    }

    let processedFile = f;

    if (f.name.toLowerCase().endsWith(".docx")) {
      setIsDocx(true);
      setIsConverting(true);
      try {
        processedFile = await convertDocxToPdf(f);
      } catch (err) {
        setErr("Failed to convert DOCX to PDF: " + err.message);
        setIsConverting(false);
        return;
      }
      setIsConverting(false);
    }

    setFile(processedFile);
    setFileName(processedFile.name);
  };

  const handleGenerate = async () => {
    setErr("");
    setResponse(null);
    if (!file) return setErr("Please upload a PDF or DOCX first.");

    const newController = new AbortController();
    setController(newController);
    setIsLoading(true);

    try {
      const base64 = await toBase64(file);
      const { data, error } = await supabase.functions.invoke(
        "file-test-gen",
        {
          body: {
            fileName: file.name,
            fileContent: base64,
            model,
          },
          signal: newController.signal,
        }
      );

      if (error) throw new Error(error.message);
      setResponse(data);
    } catch (e) {
      if (e.name === "AbortError") {
        setErr("Generation stopped by user.");
      } else {
        setErr(e.message || "Failed to generate test cases.");
      }
    } finally {
      setIsLoading(false);
      setController(null);
    }
  };

  const handleStop = () => {
    if (controller) {
      controller.abort();
      setController(null);
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setFileUrl(null);
    setFileName("");
    setResponse(null);
    setErr("");
    setExpanded({});
    setController(null);
    setIsDocx(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadExcel = () => {
    if (!response?.testCases?.length) return;

    const rows = [];
    response.testCases.forEach((tc) => {
      tc.steps.forEach((s) =>
        rows.push({
          "Test Case ID": tc.testCaseId,
          Title: tc.title,
          Description: tc.description,
          Preconditions: tc.preconditions,
          "Step No": s.stepNo,
          Action: s.action,
          "Expected Result": s.expectedResult,
        })
      );
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TestCases");
    XLSX.writeFile(
      wb,
      `${fileName.replace(/\.pdf$/i, "")}_TestCases.xlsx`
    );
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-100">
      <div className="mx-auto max-w-screen-xl px-2 py-4">
        <h1 className="mb-4 text-2xl font-bold">
          File-based Test Case Generator
        </h1>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-400 mb-1">
                Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={isLoading}
                className="w-44 rounded-xl bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="gemini">Gemini</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-5">GPT-5</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-400 mb-1">
                Upload PDF or DOCX
              </label>
              <input
                type="file"
                accept=".pdf,.docx"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={isLoading || isConverting}
                className="w-64 rounded-xl bg-gray-800 px-3 py-2 text-sm text-gray-200 shadow-md file:mr-3 file:rounded-lg file:border-0 file:bg-sky-600 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-sky-700 focus:ring-2 focus:ring-sky-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex gap-2 md:ml-auto">
            {isLoading ? (
              <button
                onClick={handleStop}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm"
              >
                Stop
              </button>
            ) : (
              <>
                <button
                  onClick={handleGenerate}
                  disabled={!file || isConverting}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm"
                >
                  Generate
                </button>

                {(file || response) && (
                  <button
                    onClick={handleClear}
                    className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-sm"
                  >
                    Clear
                  </button>
                )}
              </>
            )}

            {response?.testCases?.length > 0 && (
              <button
                onClick={handleDownloadExcel}
                className="rounded-lg border border-sky-500 bg-sky-900/40 px-4 py-2 text-sm"
              >
                Download Excel
              </button>
            )}
          </div>
        </div>

        {err && (
          <div className="mb-4 rounded-lg border border-red-500 bg-red-900/40 p-3 text-sm">
            {err}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* File Preview */}
          <div className="rounded-2xl border border-gray-700 bg-gray-800 h-[75vh] overflow-hidden">
            <div className="border-b border-gray-700 px-4 py-3 text-sm font-semibold">
              Uploaded File
            </div>
            <div className="p-4 text-sm">
              {file ? (
                <>
                  <p><b>Name:</b> {fileName}</p>
                  <p><b>Size:</b> {(file.size / 1024).toFixed(2)} KB</p>

                  {!isDocx && (
                    <div className="mt-3 h-[60vh] border rounded-lg overflow-hidden">
                      <iframe
                        src={fileUrl}
                        className="w-full h-full"
                        title="Preview"
                      />
                    </div>
                  )}

                  {isDocx && (
                    <div className="mt-3 h-[60vh] flex items-center justify-center text-gray-400">
                      Preview not available for DOCX files.
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500 italic">
                  No file selected
                </div>
              )}
            </div>
          </div>

          {/* Output */}
          <div className="rounded-2xl border border-gray-700 bg-gray-800 h-[75vh] overflow-y-auto p-4">
            <h2 className="mb-3 text-sm font-semibold border-b pb-2">
              Generated Test Cases
            </h2>

            {isLoading ? (
              <div className="text-center text-gray-400 animate-pulse">
                Generating test cases...
              </div>
            ) : response?.testCases?.length ? (
              <div className="space-y-3">
                {response.testCases.map((tc) => (
                  <div
                    key={tc.testCaseId}
                    className="rounded-xl border bg-gray-900/50"
                  >
                    <div
                      onClick={() => toggleExpand(tc.testCaseId)}
                      className="flex cursor-pointer items-center justify-between px-4 py-2"
                    >
                      <div>
                        <p className="text-sky-400 font-semibold">
                          {tc.testCaseId}
                        </p>
                        <p className="text-sm">{tc.title}</p>
                      </div>
                      {expanded[tc.testCaseId] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>

                    {expanded[tc.testCaseId] && (
                      <div className="px-4 pb-3 pt-2 text-sm border-t">
                        <p><b>Description:</b> {tc.description}</p>
                        <p className="mt-1">
                          <b>Preconditions:</b> {tc.preconditions}
                        </p>

                        <div className="mt-3 overflow-x-auto">
                          <table className="w-full text-xs border-collapse border">
                            <thead>
                              <tr>
                                <th className="border px-2 py-1 w-12">Step</th>
                                <th className="border px-2 py-1">Action</th>
                                <th className="border px-2 py-1">
                                  Expected Result
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {tc.steps.map((s) => (
                                <tr key={s.stepNo}>
                                  <td className="border px-2 py-1 text-center">
                                    {s.stepNo}
                                  </td>
                                  <td className="border px-2 py-1">
                                    {s.action}
                                  </td>
                                  <td className="border px-2 py-1">
                                    {s.expectedResult}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 italic">
                No test cases generated yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
