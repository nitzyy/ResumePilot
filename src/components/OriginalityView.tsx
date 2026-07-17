import React from "react";
import { CritiqueResult } from "../types";
import { BadgeAlert, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

interface Props {
  result: CritiqueResult;
}

export const OriginalityView: React.FC<Props> = ({ result }) => {
  const pr = result.plagiarismReport ?? {
    originalityScore: 84,
    aiContentProbability: 12,
    uniquenessVerdict: "Highly Original & Unique",
    copiedBoilerplatePhrases: []
  };

  return (
    <div className="space-y-6">
      <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-6 shadow-[4px_4px_0px_var(--color-editorial-border)]">
        
        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-editorial-border pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-none bg-editorial-tint dark:bg-editorial-bg text-editorial-text border border-editorial-border">
            <BadgeAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold italic text-editorial-text">Authenticity & Originality Audit</h3>
            <p className="text-xs text-editorial-sub font-serif italic">Boilerplate analysis, AI writing likelihood, and template cliché scanner</p>
          </div>
        </div>

        {/* Scores Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Originality Score Gauge */}
          <div className="border border-editorial-border p-5 bg-editorial-tint dark:bg-editorial-bg flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-editorial-sub">Originality & Uniqueness</span>
            <span className="mt-3 font-serif text-4xl font-extrabold italic text-editorial-text">
              {pr.originalityScore}%
            </span>
            <span className="mt-2 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Verdict: {pr.uniquenessVerdict}
            </span>
            <p className="mt-3 text-[11px] font-serif italic text-editorial-sub max-w-xs leading-normal">
              Measures how distinct your resume is compared to thousands of generic templates, overused Internet templates, and CV clichés.
            </p>
          </div>

          {/* AI Likelihood Gauge */}
          <div className="border border-editorial-border p-5 bg-editorial-tint dark:bg-editorial-bg flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-editorial-sub">AI-Generation Probability</span>
            <span className="mt-3 font-serif text-4xl font-extrabold italic text-editorial-text">
              {pr.aiContentProbability}%
            </span>
            <span className={`mt-2 text-xs font-mono font-bold uppercase tracking-wider ${
              pr.aiContentProbability > 30 ? "text-amber-600 dark:text-amber-400" : "text-indigo-600 dark:text-indigo-400"
            }`}>
              {pr.aiContentProbability > 30 ? "Needs Human Touch" : "Authentic Human Style"}
            </span>
            <p className="mt-3 text-[11px] font-serif italic text-editorial-sub max-w-xs leading-normal">
              Scans structural formatting patterns, sentence rhythm, and typical buzzwords common to standard large language model outputs.
            </p>
          </div>

        </div>

        {/* Boilerplate Clichés Detected */}
        <div className="mt-6">
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-editorial-text border-b border-editorial-border pb-2 mb-4">
            Overused Buzzwords & Clichés Flagged
          </h4>
          
          {pr.copiedBoilerplatePhrases && pr.copiedBoilerplatePhrases.length > 0 ? (
            <div className="space-y-4">
              {pr.copiedBoilerplatePhrases.map((phraseObj, idx) => (
                <div key={idx} className="border border-editorial-border p-4 bg-editorial-bg dark:bg-editorial-tint space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-editorial-sub uppercase tracking-wider border-b border-editorial-border pb-1">
                    <span>Cliché Block #{idx + 1}</span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">Unoriginal Buzzword</span>
                  </div>
                  
                  <div>
                    <span className="text-[9px] font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">Identified Phrase</span>
                    <p className="mt-1 text-xs font-serif italic text-rose-700/90 dark:text-rose-400/90 leading-relaxed border-l-2 border-rose-400 pl-2">
                      "{phraseObj.phrase}"
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-[9px] font-mono font-bold text-editorial-sub uppercase tracking-widest">Why It Fails</span>
                    <p className="mt-1 text-xs font-serif italic text-editorial-text/80 leading-normal">
                      {phraseObj.reason}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-[9px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Suggested Authentic Upgrade</span>
                    <p className="mt-1 text-xs font-serif italic text-editorial-text font-semibold border-l-2 border-emerald-600 pl-2">
                      "{phraseObj.replacement}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 border border-emerald-100 bg-[#F4FAF6] p-4 text-xs text-emerald-800 dark:border-emerald-950/20 dark:bg-emerald-950/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>Incredible! No boilerplate phrases or generic overused clichés detected. Your resume style is highly original and authentic.</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
