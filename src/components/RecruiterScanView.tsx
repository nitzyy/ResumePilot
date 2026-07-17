import React from "react";
import { CritiqueResult } from "../types";
import { Award, UserCheck, Flame, Check, AlertTriangle, TrendingUp, Layers } from "lucide-react";

interface Props {
  result: CritiqueResult;
  tone: string;
}

export const RecruiterScanView: React.FC<Props> = ({ result, tone }) => {
  const isRoast = tone === "roast";
  
  // Calculate a fake hiring probability based on the score
  const probability = Math.min(98, Math.max(15, Math.round(result.score * 1.05)));
  
  return (
    <div className="space-y-6">
      {/* 1. Recruiter Simulation Row */}
      <div className={`rounded-none border p-5 shadow-[4px_4px_0px_var(--color-editorial-border)] ${
        isRoast 
          ? "border-red-200 bg-red-50/20 dark:border-red-950/40 dark:bg-red-950/10" 
          : "border-editorial-border bg-white dark:bg-editorial-tint"
      }`}>
        <div className="flex items-start justify-between border-b border-editorial-border pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-none border ${
              isRoast ? "bg-red-100 text-red-700 border-red-200" : "bg-editorial-tint text-editorial-text border-editorial-border"
            }`}>
              {isRoast ? <Flame className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="font-serif text-base font-bold italic text-editorial-text">
                {isRoast ? "15-Sec Recruiter Brutal Roast" : "15-Sec Recruiter Fast Scan"}
              </h3>
              <p className="text-xs text-editorial-sub font-serif italic">Simulated first-impression evaluation</p>
            </div>
          </div>
          
          <div className="text-right">
            <span className="block text-[8px] font-mono uppercase tracking-widest text-editorial-sub">Verdict</span>
            <span className={`inline-block rounded-none px-2.5 py-0.5 mt-1 text-[10px] font-mono font-bold uppercase tracking-wider border ${
              result.recruiterScan?.wouldShortlist === "Yes"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-400"
                : result.recruiterScan?.wouldShortlist === "Maybe"
                ? "bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-950/30 dark:border-indigo-900/40 dark:text-indigo-400"
                : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-400"
            }`}>
              {result.recruiterScan?.wouldShortlist === "Yes" ? "🟢 WILL SHORTLIST" : result.recruiterScan?.wouldShortlist === "Maybe" ? "🟡 MAYBE / HOLD" : "🔴 NO GO / REJECT"}
            </span>
          </div>
        </div>

        {/* Reasons Checklist */}
        <div className="mt-4 space-y-2">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-editorial-sub">Recruiter Observations</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2">
            {(result.recruiterScan?.reasons ?? []).map((reason, idx) => {
              const isGood = reason.startsWith("✓");
              const cleanText = reason.replace(/^[✓❌]\s*/, "");
              return (
                <div key={idx} className={`flex items-start gap-2 p-2.5 border text-xs leading-normal ${
                  isGood 
                    ? "border-emerald-100 bg-emerald-50/10 dark:border-emerald-950/20 dark:bg-emerald-950/5 text-editorial-text" 
                    : "border-rose-100 bg-rose-50/10 dark:border-rose-950/20 dark:bg-rose-950/5 text-editorial-text"
                }`}>
                  {isGood ? (
                    <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  )}
                  <span>{cleanText}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Score Metrics & Hiring Probability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hiring Probability */}
        <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-5 shadow-[4px_4px_0px_var(--color-editorial-border)] flex flex-col justify-between">
          <div>
            <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-editorial-sub">Screening Readiness Probability</h4>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-serif text-5xl font-black italic text-editorial-text">{probability}%</span>
              <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Confidence Level</span>
            </div>
            <p className="mt-3 text-xs font-serif italic text-editorial-sub leading-relaxed">
              Based on overall score, tech alignment, and keyword matches, this estimate measures your likelihood of successfully getting through the initial automated screening filters and securing a callback.
            </p>
          </div>

          <div className="mt-5 border-t border-editorial-border pt-4">
            <div className="flex items-center gap-2 text-xs font-mono text-editorial-text uppercase">
              <TrendingUp className="h-4 w-4 text-editorial-text" />
              <span>Chance Rating: {probability >= 80 ? "Excellent Opportunity" : probability >= 60 ? "Competitive" : "Requires Attention"}</span>
            </div>
          </div>
        </div>

        {/* Visual Focus Heatmap */}
        <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-5 shadow-[4px_4px_0px_var(--color-editorial-border)] flex flex-col justify-between">
          <div>
            <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-editorial-sub">Eye-Tracking Focus Heatmap</h4>
            <p className="mt-1 text-[11px] font-serif italic text-editorial-sub">
              Where simulated HR eyes halt during the first 6-second scan:
            </p>

            <div className="mt-4 space-y-2.5">
              <div>
                <div className="flex justify-between text-[10px] font-mono text-editorial-text font-bold uppercase">
                  <span>Professional Summary</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">12% (Brief Glance)</span>
                </div>
                <div className="mt-1 h-3.5 w-full bg-editorial-tint border border-editorial-border overflow-hidden relative">
                  <div className="h-full bg-amber-500/20" style={{ width: "12%" }} />
                  <span className="absolute inset-y-0 left-2 flex items-center text-[8px] font-mono uppercase text-editorial-text/70">Weak Hook</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono text-editorial-text font-bold uppercase">
                  <span>Work Experience & Metrics</span>
                  <span className="text-red-600 dark:text-red-400 font-bold">55% (Primary Anchor)</span>
                </div>
                <div className="mt-1 h-3.5 w-full bg-editorial-tint border border-editorial-border overflow-hidden relative">
                  <div className="h-full bg-red-500/40" style={{ width: "55%" }} />
                  <span className="absolute inset-y-0 left-2 flex items-center text-[8px] font-mono uppercase text-editorial-text">Unquantified blocks noticed</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono text-editorial-text font-bold uppercase">
                  <span>Tech Skills / List</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">25% (Quick Match)</span>
                </div>
                <div className="mt-1 h-3.5 w-full bg-editorial-tint border border-editorial-border overflow-hidden relative">
                  <div className="h-full bg-emerald-500/30" style={{ width: "25%" }} />
                  <span className="absolute inset-y-0 left-2 flex items-center text-[8px] font-mono uppercase text-editorial-text/75">Keywords found</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono text-editorial-text font-bold uppercase">
                  <span>Credentials & Links</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">8% (Validation)</span>
                </div>
                <div className="mt-1 h-3.5 w-full bg-editorial-tint border border-editorial-border overflow-hidden relative">
                  <div className="h-full bg-indigo-500/20" style={{ width: "8%" }} />
                  <span className="absolute inset-y-0 left-2 flex items-center text-[8px] font-mono uppercase text-editorial-text/70">Social URL blank</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Strengths Grid Cards */}
      <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-5 shadow-[4px_4px_0px_var(--color-editorial-border)]">
        <h3 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400 border-b border-editorial-border pb-3.5 mb-4">
          <Award className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
          Aesthetic & Impact Strengths
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {result.strengths.map((str, idx) => (
            <div key={idx} className="flex items-start gap-3 border border-emerald-100 bg-[#F4FAF6] dark:border-emerald-950/20 dark:bg-emerald-950/10 p-3.5 text-xs text-editorial-text font-serif">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-none bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                {idx + 1}
              </span>
              <span>{str}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
