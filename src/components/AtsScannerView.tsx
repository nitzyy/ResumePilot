import React, { useState } from "react";
import { CritiqueResult } from "../types";
import { Search, CheckCircle, AlertTriangle, Sparkles, Copy, FileText, Download, Check, AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  result: CritiqueResult;
  targetRole: string;
  experienceLevel: string;
  jobDescription: string;
  onCopyText: (text: string) => void;
}

export const AtsScannerView: React.FC<Props> = ({
  result,
  targetRole,
  experienceLevel,
  jobDescription,
  onCopyText
}) => {
  const [tailoredResult, setTailoredResult] = useState<{
    tailoredResumeText: string;
    changesMade: string[];
    matchingScore: number;
  } | null>(null);
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorError, setTailorError] = useState<string | null>(null);

  const foundCount = result.jobDescriptionMatch?.foundKeywords?.length ?? 0;
  const missingCount = result.jobDescriptionMatch?.missingKeywords?.length ?? 0;
  const totalKeywords = foundCount + missingCount;
  const keywordPercentage = totalKeywords > 0 ? Math.round((foundCount / totalKeywords) * 100) : 50;

  // Function to execute the backend tailor API
  const handleTailorResume = async () => {
    if (!jobDescription || jobDescription.trim().length < 20) {
      setTailorError("Please enter a valid job description on the left configuration panel to run the AI Tailoring engine.");
      return;
    }

    setIsTailoring(true);
    setTailorError(null);
    setTailoredResult(null);

    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText: result.extractedText || "Please refer to your pasted resume text.",
          jobDescription: jobDescription,
          targetRole: targetRole,
          experienceLevel: experienceLevel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to trigger tailoring service.");
      }

      const data = await response.json();
      setTailoredResult(data);
    } catch (err: any) {
      console.error(err);
      setTailorError(err.message || "An unexpected network error occurred while performing tailored rewrites.");
    } finally {
      setIsTailoring(false);
    }
  };

  const downloadTailoredFile = () => {
    if (!tailoredResult) return;
    const element = document.createElement("a");
    const file = new Blob([tailoredResult.tailoredResumeText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${targetRole.replace(/\s+/g, "_")}_Tailored_Resume.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. System Checklist Grid */}
      <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-5 shadow-[4px_4px_0px_var(--color-editorial-border)]">
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-editorial-text border-b border-editorial-border pb-3.5 mb-4">
          ATS Score System Integrity Checklist
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between border border-editorial-border p-3 bg-editorial-tint dark:bg-editorial-bg text-xs">
            <span className="font-mono uppercase text-[10px] tracking-wider text-editorial-sub">✓ Formatting Integrity</span>
            <span className={`font-mono font-bold text-[10px] uppercase px-1.5 py-0.5 border ${
              result.scores.formatting >= 70 ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-800"
            }`}>
              {result.scores.formatting >= 70 ? "Passed" : "Warning"}
            </span>
          </div>

          <div className="flex items-center justify-between border border-editorial-border p-3 bg-editorial-tint dark:bg-editorial-bg text-xs">
            <span className="font-mono uppercase text-[10px] tracking-wider text-editorial-sub">✓ Core Industry Keywords</span>
            <span className={`font-mono font-bold text-[10px] uppercase px-1.5 py-0.5 border ${
              keywordPercentage >= 60 ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-800"
            }`}>
              {keywordPercentage >= 60 ? `${keywordPercentage}% Match` : `${keywordPercentage}% (Low)`}
            </span>
          </div>

          <div className="flex items-center justify-between border border-editorial-border p-3 bg-editorial-tint dark:bg-editorial-bg text-xs">
            <span className="font-mono uppercase text-[10px] tracking-wider text-editorial-sub">✓ Work Experience Metrics</span>
            <span className={`font-mono font-bold text-[10px] uppercase px-1.5 py-0.5 border ${
              result.scores.impact >= 70 ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-800"
            }`}>
              {result.scores.impact >= 70 ? "Strong" : "Weak Metrics"}
            </span>
          </div>

          <div className="flex items-center justify-between border border-editorial-border p-3 bg-editorial-tint dark:bg-editorial-bg text-xs">
            <span className="font-mono uppercase text-[10px] tracking-wider text-editorial-sub">✓ Section Structure Ratings</span>
            <span className="font-mono font-bold text-[10px] uppercase px-1.5 py-0.5 border bg-emerald-50 border-emerald-200 text-emerald-800">
              Clear Headings
            </span>
          </div>
        </div>
      </div>

      {/* 2. Keyword Heatmap Mapping Section */}
      <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-5 shadow-[4px_4px_0px_var(--color-editorial-border)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-editorial-border pb-3.5 mb-4">
          <div>
            <h3 className="font-serif text-base font-bold italic text-editorial-text">Keyword Compatibility Mapping</h3>
            <p className="text-xs text-editorial-sub font-serif italic">Matched skills against ideal {targetRole} expectations</p>
          </div>
          
          <div className="mt-2 sm:mt-0 font-mono text-[10px] font-bold text-editorial-sub uppercase">
            Match Density: <span className="text-editorial-text">{foundCount} found / {totalKeywords} total</span>
          </div>
        </div>

        {/* Found vs Missing Heatmap */}
        <div className="space-y-4">
          {/* Found Keywords */}
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Found in Resume ({foundCount})</span>
            </div>
            
            <div className="mt-2.5 flex flex-wrap gap-2">
              {(result.jobDescriptionMatch?.foundKeywords ?? []).length > 0 ? (
                (result.jobDescriptionMatch?.foundKeywords ?? []).map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 border border-emerald-200 bg-[#F4FAF6] px-2.5 py-1 text-xs font-mono font-medium text-emerald-800 dark:border-emerald-950/40 dark:bg-emerald-950/20 dark:text-emerald-400"
                  >
                    ✓ {kw}
                  </span>
                ))
              ) : (
                <span className="text-xs text-editorial-sub italic">No core keywords detected. Use the One-Click Tailor below.</span>
              )}
            </div>
          </div>

          {/* Missing Keywords */}
          <div className="border-t border-editorial-border pt-4">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-rose-800 dark:text-rose-400">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <span>Missing Keywords Detected ({missingCount})</span>
            </div>
            
            <div className="mt-2.5 flex flex-wrap gap-2">
              {(result.jobDescriptionMatch?.missingKeywords ?? []).length > 0 ? (
                (result.jobDescriptionMatch?.missingKeywords ?? []).map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 border border-rose-200 bg-[#FFF5F5] px-2.5 py-1 text-xs font-mono font-medium text-rose-800 dark:border-rose-950/40 dark:bg-rose-950/20 dark:text-rose-400"
                  >
                    ❌ {kw}
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-800 dark:text-emerald-400 font-serif italic">Incredible! All critical keywords present!</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Technical Roadblocks (Issues) */}
      <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-5 shadow-[4px_4px_0px_var(--color-editorial-border)]">
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-editorial-text border-b border-editorial-border pb-3.5 mb-4">
          ATS Layout & Parsing Pitfalls
        </h3>

        {result.atsReport.issues.length > 0 ? (
          <ul className="space-y-2.5">
            {result.atsReport.issues.map((issue, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 border border-editorial-border bg-editorial-bg dark:bg-editorial-tint p-3 text-xs text-editorial-text"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <span className="leading-relaxed font-serif italic">{issue}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-2 border border-emerald-100 bg-[#F4FAF6] p-3 text-xs text-emerald-800">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
            <span>Excellent. No technical parsing roadblocks detected. Your template is extremely clean and parseable.</span>
          </div>
        )}
      </div>

      {/* 4. One-Click Resume Tailor Tool Section */}
      <div className="rounded-none border border-editorial-text bg-editorial-tint p-6 shadow-[4px_4px_0px_var(--color-editorial-text)]">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-editorial-text text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold italic text-editorial-text">One-Click Resume Tailor</h3>
            <p className="text-xs text-editorial-sub font-serif italic">
              Rewrite your resume instantly to address missing keywords and optimize ATS matching against the target job requirements.
            </p>
          </div>
        </div>

        {/* Trigger Button or Display */}
        <div className="mt-5">
          {!tailoredResult ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleTailorResume}
                disabled={isTailoring || !jobDescription}
                className="flex w-full items-center justify-center gap-2 rounded-none bg-editorial-text hover:bg-neutral-800 active:bg-neutral-900 disabled:bg-editorial-border disabled:text-editorial-sub disabled:cursor-not-allowed py-3 text-xs font-mono font-bold uppercase tracking-wider text-white transition-all shadow"
              >
                {isTailoring ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Tailoring & Injecting Keywords...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Optimize & Rewrite with AI Tailor
                  </>
                )}
              </button>
              
              {!jobDescription && (
                <p className="text-[10px] text-center font-mono text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                  ⚠️ Provide a Job Description in the left panel to unlock AI keyword tailoring
                </p>
              )}

              {tailorError && (
                <div className="rounded-none border border-rose-200 bg-[#FFF5F5] p-3 text-xs text-rose-800">
                  <p className="font-bold">Tailoring Failed</p>
                  <p className="mt-0.5">{tailorError}</p>
                </div>
              )}
            </div>
          ) : (
            /* Tailored Results Box */
            <div className="border border-editorial-border bg-white p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-editorial-border pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-none bg-emerald-600 px-2 py-0.5 text-[9px] font-mono font-bold text-white uppercase tracking-wider">
                    Tailored Successfully
                  </span>
                  <span className="text-[10px] font-mono font-bold text-editorial-text uppercase">
                    ATS Prediction Match: {tailoredResult.matchingScore}/100
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onCopyText(tailoredResult.tailoredResumeText)}
                    className="inline-flex items-center gap-1 border border-editorial-border bg-editorial-bg hover:bg-editorial-tint px-2.5 py-1 text-[9px] font-mono uppercase font-bold text-editorial-text shadow-sm"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </button>
                  <button
                    onClick={downloadTailoredFile}
                    className="inline-flex items-center gap-1 border border-editorial-border bg-editorial-bg hover:bg-editorial-tint px-2.5 py-1 text-[9px] font-mono uppercase font-bold text-editorial-text shadow-sm"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-mono font-bold text-editorial-sub uppercase tracking-widest">Adjustments Made</span>
                <ul className="mt-1.5 space-y-1 list-disc list-inside text-xs font-serif italic text-editorial-text/90">
                  {tailoredResult.changesMade.map((change, i) => (
                    <li key={i}>{change}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-editorial-sub uppercase tracking-widest">Tailored Resume Output</span>
                  <span className="text-[9px] font-mono text-emerald-700 font-semibold uppercase">✓ Best practices applied</span>
                </div>
                <textarea
                  readOnly
                  value={tailoredResult.tailoredResumeText}
                  rows={8}
                  className="mt-1.5 block w-full rounded-none border border-editorial-border bg-editorial-tint p-3 text-xs font-mono text-editorial-text focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setTailoredResult(null)}
                  className="text-[9px] font-mono uppercase tracking-widest text-editorial-sub hover:text-editorial-text hover:underline"
                >
                  ← Tailor Again with Different Parameters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
