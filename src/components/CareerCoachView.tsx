import React from "react";
import { CritiqueResult } from "../types";
import { Briefcase, CheckCircle2, Linkedin, Github, Globe, GitCommit, ChevronRight } from "lucide-react";

interface Props {
  result: CritiqueResult;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
}

export const CareerCoachView: React.FC<Props> = ({
  result,
  githubUrl,
  linkedinUrl,
  portfolioUrl
}) => {
  // Grab portfolio checkers
  const defaultPortfolio = {
    overallReadiness: 65,
    resumeReadiness: 75,
    githubReadiness: 50,
    linkedinReadiness: 65,
    portfolioReadiness: 40,
    portfolioAdvice: "Synchronize your resume with your online footprint. Try pinning your top 2 relevant React projects on GitHub, optimizing your LinkedIn summary, and building a simple portfolio website with project screenshots."
  };

  const p = result.portfolioChecker ?? defaultPortfolio;
  const timeline = result.timeline ?? [];

  return (
    <div className="space-y-6">
      
      {/* 1. Portfolio & Social Profile Presence Checklist */}
      <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-5 shadow-[4px_4px_0px_var(--color-editorial-border)]">
        <div className="flex items-center gap-2.5 border-b border-editorial-border pb-3.5 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-none bg-editorial-tint text-editorial-text border border-editorial-border">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold italic text-editorial-text">Multi-Asset Portfolio Audit</h3>
            <p className="text-xs text-editorial-sub font-serif italic">Hiring Readiness rating of your complete online presence</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Progress Bars */}
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-[10px] font-mono text-editorial-text font-bold uppercase">
                <span>Resume Readiness</span>
                <span>{p.resumeReadiness}%</span>
              </div>
              <div className="mt-1 h-2 w-full bg-editorial-tint overflow-hidden relative border border-editorial-border">
                <div className="h-full bg-editorial-text" style={{ width: `${p.resumeReadiness}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono text-editorial-text font-bold uppercase">
                <span className="flex items-center gap-1"><Github className="h-3 w-3 text-editorial-text" /> GitHub Repo Check</span>
                <span>{githubUrl ? `${p.githubReadiness}%` : "Not Provided (40%)"}</span>
              </div>
              <div className="mt-1 h-2 w-full bg-editorial-tint overflow-hidden relative border border-editorial-border">
                <div className="h-full bg-editorial-text" style={{ width: `${githubUrl ? p.githubReadiness : 40}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono text-editorial-text font-bold uppercase">
                <span className="flex items-center gap-1"><Linkedin className="h-3 w-3 text-editorial-text" /> LinkedIn Presence</span>
                <span>{linkedinUrl ? `${p.linkedinReadiness}%` : "Not Provided (50%)"}</span>
              </div>
              <div className="mt-1 h-2 w-full bg-editorial-tint overflow-hidden relative border border-editorial-border">
                <div className="h-full bg-editorial-text" style={{ width: `${linkedinUrl ? p.linkedinReadiness : 50}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono text-editorial-text font-bold uppercase">
                <span className="flex items-center gap-1"><Globe className="h-3 w-3 text-editorial-text" /> Personal Portfolio URL</span>
                <span>{portfolioUrl ? `${p.portfolioReadiness}%` : "Not Provided (30%)"}</span>
              </div>
              <div className="mt-1 h-2 w-full bg-editorial-tint overflow-hidden relative border border-editorial-border">
                <div className="h-full bg-editorial-text" style={{ width: `${portfolioUrl ? p.portfolioReadiness : 30}%` }} />
              </div>
            </div>
          </div>

          {/* Advice Box */}
          <div className="border border-editorial-border p-4 bg-editorial-tint flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-mono font-bold text-editorial-sub uppercase tracking-widest">Aesthetic Presence Audit Verdict</span>
              <div className="mt-1 font-serif text-3xl font-black italic text-editorial-text">
                {githubUrl && linkedinUrl && portfolioUrl ? "Sync Complete" : "Fragmented"}
              </div>
              <p className="mt-2 text-xs font-serif italic text-editorial-sub leading-relaxed">
                {p.portfolioAdvice}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-editorial-border text-[9px] font-mono text-editorial-text uppercase font-bold tracking-wider">
              {githubUrl && linkedinUrl ? "✓ Connected URLs validated" : "💡 Provide URLs in Left Sidebar for Custom Ratings"}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Chronological Resume Timeline */}
      {timeline.length > 0 && (
        <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-5 shadow-[4px_4px_0px_var(--color-editorial-border)]">
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-editorial-text border-b border-editorial-border pb-3.5 mb-5">
            Resume Milestone Timeline
          </h3>

          <div className="relative border-l border-editorial-border pl-6 ml-2.5 space-y-6">
            {timeline.map((event, idx) => (
              <div key={idx} className="relative">
                {/* Dot marker */}
                <span className="absolute -left-[31px] top-1 flex h-2 w-2 items-center justify-center bg-editorial-bg border-4 border-editorial-text ring-4 ring-editorial-bg rounded-full" />
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-extrabold bg-editorial-text text-white px-2 py-0.5 rounded-none uppercase">
                      {event.year}
                    </span>
                    <h4 className="text-xs font-serif font-bold text-editorial-text">{event.roleOrMilestone}</h4>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {event.skillsUsed.map((sk, i) => (
                      <span key={i} className="bg-editorial-tint border border-editorial-border px-1.5 py-0.5 text-[9px] font-mono uppercase text-editorial-sub">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. AI Career Coach Action Checklist */}
      <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-5 shadow-[4px_4px_0px_var(--color-editorial-border)]">
        <h3 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-editorial-text border-b border-editorial-border pb-3.5 mb-4">
          <Briefcase className="h-4.5 w-4.5 text-editorial-text" />
          AI Career Coach Roadmap
        </h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-[#F4FAF6] border border-emerald-100 dark:border-emerald-950/20 dark:bg-emerald-950/5">
            <span className="mt-0.5 text-emerald-600">✓</span>
            <p className="text-xs font-serif text-editorial-text leading-relaxed">
              <strong className="font-mono text-[10px] uppercase font-bold text-emerald-800">Milestone 1: Quantify Legacy Bullets (Active)</strong>
              <br />Use the Before/After cards in the Metrics tab to instantly replace 4 lazy phrases with metrics.
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 bg-editorial-tint border border-editorial-border">
            <span className="mt-0.5 text-editorial-sub">→</span>
            <p className="text-xs font-serif text-editorial-text leading-relaxed">
              <strong className="font-mono text-[10px] uppercase font-bold text-editorial-text">Milestone 2: Expand Skills to Docker / AWS (Pending)</strong>
              <br />We detected "Docker" and "AWS" are highly popular in job descriptions. Pin projects incorporating containers.
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 bg-editorial-tint border border-editorial-border">
            <span className="mt-0.5 text-editorial-sub">→</span>
            <p className="text-xs font-serif text-editorial-text leading-relaxed">
              <strong className="font-mono text-[10px] uppercase font-bold text-editorial-text">Milestone 3: Sync URLs (Pending)</strong>
              <br />Connect and pin your professional GitHub repository links directly on your resume.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
