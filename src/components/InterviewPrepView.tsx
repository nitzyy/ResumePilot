import React, { useState } from "react";
import { CritiqueResult } from "../types";
import { HelpCircle, ChevronRight, ChevronDown, CheckCircle2 } from "lucide-react";

interface Props {
  result: CritiqueResult;
}

export const InterviewPrepView: React.FC<Props> = ({ result }) => {
  const [openIndexes, setOpenIndexes] = useState<Record<number, boolean>>({});

  const toggleIndex = (idx: number) => {
    setOpenIndexes((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const defaultQuestions = [
    {
      question: "You mentioned building server-side REST API endpoints in TechCorp Inc. How would you handle secure session storage and token expiration in an Express application?",
      expectedTopic: "JWT, Cookie Security, and Session Management",
      suggestedAnswerOutline: "1. Mention JSON Web Tokens (JWT) signed with a strong secret key. 2. Explain storing tokens in HTTP-only, secure, SameSite cookies to mitigate XSS and CSRF risks. 3. Describe implementing short-lived Access Tokens (e.g., 15 mins) and long-lived database-backed Refresh Tokens to handle rotation."
    },
    {
      question: "How would you optimize a slow React application that is experiencing rendering lag on complex lists?",
      expectedTopic: "React rendering optimization hooks and list virtualization",
      suggestedAnswerOutline: "1. Mention using React.memo to prevent unnecessary component re-renders. 2. Explain memoizing calculations with useMemo and callback references with useCallback. 3. Discuss virtualizing huge datasets using libraries like react-window or react-virtualized."
    }
  ];

  const questions = result.interviewPrep ?? defaultQuestions;

  return (
    <div className="space-y-6">
      
      <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-5 shadow-[4px_4px_0px_var(--color-editorial-border)]">
        <div className="flex items-center gap-2.5 border-b border-editorial-border pb-3.5 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-none bg-editorial-tint text-editorial-text border border-editorial-border">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold italic text-editorial-text">Resume-Tailored Interview Prep</h3>
            <p className="text-xs text-editorial-sub font-serif italic">AI generated technical interview questions based directly on your projects</p>
          </div>
        </div>

        <p className="text-xs text-editorial-sub font-serif italic leading-relaxed mb-5">
          Based on the technology stack and experience items on your resume, technical interview panels are highly likely to test you on these areas. Expand each card to view a high-impact, professional response strategy outline:
        </p>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const isOpen = !!openIndexes[idx];
            return (
              <div
                key={idx}
                className="rounded-none border border-editorial-border bg-editorial-tint dark:bg-editorial-bg overflow-hidden transition-all"
              >
                {/* Accordion Trigger Header */}
                <button
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className="flex w-full items-start justify-between gap-3 text-left p-4 hover:bg-white dark:hover:bg-editorial-tint transition-all focus:outline-none"
                >
                  <div className="space-y-1">
                    <span className="rounded-none bg-editorial-text text-white text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 border border-editorial-border tracking-wider">
                      Question #{idx + 1}
                    </span>
                    <h4 className="text-xs font-serif font-bold text-editorial-text leading-relaxed mt-1.5 pr-2">
                      {q.question}
                    </h4>
                  </div>

                  <span className="shrink-0 mt-1 text-editorial-sub">
                    {isOpen ? <ChevronDown className="h-4.5 w-4.5" /> : <ChevronRight className="h-4.5 w-4.5" />}
                  </span>
                </button>

                {/* Collapsible Content */}
                {isOpen && (
                  <div className="border-t border-editorial-border bg-white dark:bg-editorial-tint p-4.5 space-y-3.5 animate-fadeIn">
                    {/* Expected Topic */}
                    <div>
                      <span className="text-[9px] font-mono font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">Expected Tech Concept</span>
                      <p className="mt-0.5 text-xs text-editorial-text font-serif italic leading-relaxed">
                        {q.expectedTopic}
                      </p>
                    </div>

                    {/* Answer Strategy */}
                    <div>
                      <span className="text-[9px] font-mono font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest block mb-1">Recommended Response Outline</span>
                      <p className="text-xs font-serif italic text-editorial-text/90 leading-relaxed whitespace-pre-line bg-editorial-tint dark:bg-editorial-bg p-3.5 border border-editorial-border">
                        {q.suggestedAnswerOutline}
                      </p>
                    </div>

                    {/* Professional Tip */}
                    <div className="flex items-center gap-2 text-[9px] font-mono text-editorial-sub uppercase tracking-wider">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Always link answers back to quantified business results!</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
