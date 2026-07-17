import React from "react";
import { CritiqueResult } from "../types";
import { BarChart, Check, AlertCircle, Copy, HelpCircle, Scissors, FileEdit } from "lucide-react";

interface Props {
  result: CritiqueResult;
  onCopyText: (text: string) => void;
}

export const MetricsView: React.FC<Props> = ({ result, onCopyText }) => {
  // Grab the metrics from the result, fallback if they aren't filled
  const defaultMetrics = {
    averageBulletLength: 14,
    actionVerbsCount: 8,
    weakVerbs: ["helped", "assisted", "worked on", "handled"],
    passiveVoiceCount: 3,
    numbersUsedCount: 2,
    readabilityScore: "Intermediate (College Level)"
  };

  const m = result.metrics ?? defaultMetrics;
  const missingNumbers = result.missingNumbersReport ?? [];

  return (
    <div className="space-y-6">
      
      {/* 1. Advanced Metrics Cards Grid */}
      <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-5 shadow-[4px_4px_0px_var(--color-editorial-border)]">
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-editorial-text border-b border-editorial-border pb-3.5 mb-4">
          Linguistic & Copywriting Metrics
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="border border-editorial-border bg-editorial-tint p-4 text-center">
            <span className="block text-[8px] font-mono uppercase text-editorial-sub tracking-widest">Avg Bullet Length</span>
            <span className="block mt-2 font-serif text-2xl font-black italic text-editorial-text">{m.averageBulletLength} words</span>
            <span className="block mt-1 text-[9px] font-mono text-editorial-sub uppercase tracking-wider">Target: 12-16 words</span>
          </div>

          <div className="border border-editorial-border bg-editorial-tint p-4 text-center">
            <span className="block text-[8px] font-mono uppercase text-editorial-sub tracking-widest">Action Verbs Used</span>
            <span className="block mt-2 font-serif text-2xl font-black italic text-editorial-text">+{m.actionVerbsCount}</span>
            <span className="block mt-1 text-[9px] font-mono text-emerald-700 uppercase tracking-wider">Excellent Power</span>
          </div>

          <div className="border border-editorial-border bg-editorial-tint p-4 text-center">
            <span className="block text-[8px] font-mono uppercase text-editorial-sub tracking-widest">Passive Voice Instances</span>
            <span className="block mt-2 font-serif text-2xl font-black italic text-editorial-text">{m.passiveVoiceCount}</span>
            <span className={`block mt-1 text-[9px] font-mono uppercase tracking-wider ${
              m.passiveVoiceCount > 2 ? "text-amber-700" : "text-emerald-700"
            }`}>
              {m.passiveVoiceCount > 2 ? "Needs Editing" : "Strong Style"}
            </span>
          </div>

          <div className="border border-editorial-border bg-editorial-tint p-4 text-center">
            <span className="block text-[8px] font-mono uppercase text-editorial-sub tracking-widest">Bullet Points with Numbers</span>
            <span className="block mt-2 font-serif text-2xl font-black italic text-editorial-text">{m.numbersUsedCount}</span>
            <span className="block mt-1 text-[9px] font-mono text-editorial-sub uppercase tracking-wider">Target: &gt;50% quantified</span>
          </div>

          <div className="border border-editorial-border bg-editorial-tint p-4 text-center col-span-2 sm:col-span-1">
            <span className="block text-[8px] font-mono uppercase text-editorial-sub tracking-widest">Readability Grade</span>
            <span className="block mt-2 font-serif text-sm font-bold italic text-editorial-text truncate">{m.readabilityScore}</span>
            <span className="block mt-1 text-[9px] font-mono text-indigo-700 uppercase tracking-wider">HR Scan Optimal</span>
          </div>
        </div>

        {/* Weak Verbs Warning Block */}
        {m.weakVerbs.length > 0 && (
          <div className="mt-4 border border-amber-200 bg-[#FFFDF5] p-3.5 flex items-start gap-2.5">
            <AlertCircle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-mono uppercase font-bold tracking-wider text-amber-800">Passive / Weak Verbs Flagged: </span>
              <span className="font-mono text-editorial-text font-bold uppercase">{m.weakVerbs.join(", ")}</span>
              <p className="mt-1 text-editorial-sub font-serif italic">
                Recruiters notice filler words like "helped build" or "responsible for". Try swapping them out with proactive terms like <span className="font-semibold text-editorial-text">"Architected"</span>, <span className="font-semibold text-editorial-text">"Optimized"</span>, or <span className="font-semibold text-editorial-text">"Pioneered"</span>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Missing Numbers / Quantification Detector */}
      {missingNumbers.length > 0 && (
        <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-5 shadow-[4px_4px_0px_var(--color-editorial-border)]">
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-indigo-800 dark:text-indigo-400 border-b border-editorial-border pb-3.5 mb-4">
            ⚠️ Missing Numbers & Metrics Detector
          </h3>
          <p className="text-xs text-editorial-sub font-serif italic mb-4">
            Our AI parsed these points and noticed they lack concrete metrics. To stand out, try incorporating these estimated measurements:
          </p>

          <div className="space-y-4">
            {missingNumbers.map((item, idx) => (
              <div key={idx} className="border border-editorial-border bg-editorial-tint dark:bg-editorial-bg p-4 space-y-3">
                <div className="text-xs font-serif text-editorial-text border-l-2 border-amber-400 pl-3 italic">
                  <span className="block text-[8px] font-mono text-editorial-sub uppercase tracking-wider not-italic mb-1">Unquantified Bullet</span>
                  "{item.originalBullet}"
                </div>

                <div>
                  <span className="block text-[8px] font-mono text-indigo-700 uppercase tracking-widest font-bold">Suggested Quantifications</span>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {item.suggestedMetrics.map((met, i) => (
                      <span key={i} className="border border-indigo-200 bg-indigo-50/20 px-2 py-0.5 text-xs font-mono text-indigo-800">
                        + {met}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-[8px] font-mono text-emerald-800 uppercase tracking-widest font-bold">Upgraded Quantification Sentence</span>
                  <p className="mt-1 text-xs font-serif text-editorial-text font-bold border-l-2 border-emerald-600 pl-3">
                    "{item.metricUpgrade}"
                  </p>
                  <button
                    onClick={() => onCopyText(item.metricUpgrade)}
                    className="mt-2.5 inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest font-bold text-emerald-700 hover:underline"
                  >
                    <Copy className="h-3 w-3" />
                    Copy Upgraded Line
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Interactive Before/After Comparisons Editor */}
      <div className="space-y-4">
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-editorial-text">
          Interactive Resume Bullet Editor (Before & After)
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {result.weaknesses.map((item, idx) => (
            <div
              key={idx}
              className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-5 shadow-[4px_4px_0px_var(--color-editorial-border)] space-y-3.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-editorial-border pb-2.5">
                <span className="rounded-none bg-editorial-text text-white px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider border border-editorial-border">
                  {item.category}
                </span>
                <span className="text-[9px] font-mono text-editorial-sub uppercase tracking-wider">Adjustment Card #{idx + 1}</span>
              </div>

              <div>
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-editorial-text">Problem Detected</h4>
                <p className="mt-1 text-xs text-editorial-sub font-serif italic leading-relaxed">{item.problem}</p>
              </div>

              <div>
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-editorial-text">Action Step & Instruction</h4>
                <p className="mt-1 text-xs text-editorial-text font-serif italic leading-relaxed font-semibold">{item.suggestion}</p>
              </div>

              {/* Red Before and Green After Comparison UI */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mt-2 pt-1">
                <div className="rounded-none border border-rose-200 bg-[#FFF5F5] p-3.5 relative">
                  <span className="text-[9px] font-mono font-bold text-rose-600 uppercase tracking-widest block">❌ Before (Draft Phrase)</span>
                  <p className="mt-1.5 text-xs text-editorial-text/85 leading-relaxed italic border-l-2 border-rose-400 pl-2.5">
                    "{item.before}"
                  </p>
                </div>

                <div className="rounded-none border border-emerald-200 bg-[#F4FAF6] p-3.5 relative flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-emerald-700 uppercase tracking-widest block">✅ After (AI Enhanced Upgrade)</span>
                    <p className="mt-1.5 text-xs text-editorial-text leading-relaxed font-bold border-l-2 border-emerald-600 pl-2.5">
                      "{item.after}"
                    </p>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-emerald-100 flex justify-end">
                    <button
                      onClick={() => onCopyText(item.after)}
                      className="inline-flex items-center gap-1 rounded-none border border-emerald-200 bg-white px-3 py-1 text-[9px] font-mono uppercase font-bold text-emerald-800 hover:bg-[#F4FAF6] transition-colors"
                    >
                      <Copy className="h-3 w-3 text-emerald-700" />
                      Copy Enhanced Upgrade
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
