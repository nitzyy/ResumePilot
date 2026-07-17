import React, { useState } from "react";
import { 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Compass, 
  Smartphone, 
  User, 
  LogIn, 
  UserPlus, 
  Cpu, 
  AlertTriangle,
  Play,
  RotateCw,
  Search,
  CheckCircle2,
  Lock,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LandingViewProps {
  onAuthSuccess: (token: string, user: any) => void;
  userEmail?: string;
}

export function LandingView({ onAuthSuccess, userEmail }: LandingViewProps) {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Feature glimpse state
  const [activeGlimpse, setActiveGlimpse] = useState<"critique" | "ats" | "coach" | "payments">("critique");

  // Simulated Google Sign-In helper using the user's logged email or custom email
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const targetEmail = email.trim() || userEmail || "gnitya2507@gmail.com";
      const targetUsername = targetEmail.split("@")[0] || "AeroPilot";

      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, username: targetUsername })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Google Sign-In failed.");
      }

      // Store credentials and callback
      localStorage.setItem("resume_pilot_token", data.token);
      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setAuthError(err.message || "An unexpected error occurred during Google Sign-In.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const url = authMode === "signup" ? "/api/auth/register" : "/api/auth/login";
      const payload = authMode === "signup"
        ? { email, username, password }
        : { email, password };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      localStorage.setItem("resume_pilot_token", data.token);
      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  const autofillCredentials = (role: "user" | "admin") => {
    if (role === "admin") {
      setEmail("gnitya2507@gmail.com");
      setUsername("PilotAdmin");
    } else {
      setEmail("candidate@flight.com");
      setUsername("CloudNavigator");
    }
    setPassword("SecurePass123!");
  };

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      {/* Editorial Aviation Hero Intro banner */}
      <div className="relative overflow-hidden border-2 border-editorial-text bg-white dark:bg-editorial-tint p-6 sm:p-10 shadow-[8px_8px_0px_var(--color-editorial-border)]">
        {/* Subtle decorative grid lines */}
        <div className="absolute inset-0 grid grid-cols-6 pointer-events-none opacity-[0.03] dark:opacity-[0.07]">
          <div className="border-r border-editorial-text"></div>
          <div className="border-r border-editorial-text"></div>
          <div className="border-r border-editorial-text"></div>
          <div className="border-r border-editorial-text"></div>
          <div className="border-r border-editorial-text"></div>
        </div>

        <div className="relative z-10 space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 border border-editorial-border bg-editorial-tint dark:bg-editorial-bg px-3 py-1.5 rounded-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-editorial-text font-bold">
              ResumePilot Engine v2.5 • Active System State
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold italic tracking-tight text-editorial-text leading-[1.1]">
            Your resume is your flight manual. <br />
            <span className="text-indigo-600 dark:text-indigo-400">Don't fly into recruiter storms unprepared.</span>
          </h1>

          <p className="font-serif italic text-base sm:text-lg text-editorial-sub leading-relaxed max-w-2xl">
            A secure, professional-grade AI resume auditing cockpit. Analyze formatting flaws, optimize for Applicant Tracking Systems (ATS), rehearse targeted interview flights, or experience the brutal recruiter roast mode.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono uppercase tracking-wider font-bold">
            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              100% Secure Hashing
            </div>
            <div className="text-editorial-sub">•</div>
            <div className="flex items-center gap-1 text-indigo-700 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
              Gemini 2.5 Flash Verified
            </div>
            <div className="text-editorial-sub">•</div>
            <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
              <Smartphone className="h-4 w-4" />
              Full Sandbox UPI Payments
            </div>
          </div>
        </div>
      </div>

      {/* Main split: Glimpses on left, Login on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Feature glimpses (Takes up 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border-b border-editorial-border pb-2.5">
            <h3 className="font-serif text-lg font-bold italic text-editorial-text">System Glimpses</h3>
            <p className="text-[10px] font-mono text-editorial-sub uppercase tracking-wider">Live preview of what is waiting for you in the hangar</p>
          </div>

          {/* Quick Glimpse Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "critique", label: "AI Critique", icon: FileText },
              { id: "ats", label: "ATS Optimizer", icon: Cpu },
              { id: "coach", label: "Career Coach", icon: Compass },
              { id: "payments", label: "UPI Sandbox", icon: Smartphone }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveGlimpse(tab.id as any)}
                  className={`flex flex-col items-center justify-center p-3.5 border transition-all rounded-none font-mono text-[10px] uppercase tracking-wider font-bold gap-2 text-center ${
                    activeGlimpse === tab.id
                      ? "bg-editorial-text text-editorial-bg border-editorial-text shadow-[3px_3px_0px_var(--color-editorial-border)]"
                      : "bg-white hover:bg-editorial-tint border-editorial-border text-editorial-text"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Interactive Glimpse Visual Simulator */}
          <div className="rounded-none border-2 border-editorial-border bg-white dark:bg-editorial-tint p-5 min-h-[340px] flex flex-col justify-between shadow-[4px_4px_0px_var(--color-editorial-border)]">
            
            <AnimatePresence mode="wait">
              {activeGlimpse === "critique" && (
                <motion.div
                  key="critique"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-editorial-border pb-2">
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest">[Module: AI Critique Deck]</span>
                    <span className="text-[9px] font-mono bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 px-1.5 py-0.5">Dual-Tone Engine</span>
                  </div>

                  {/* Mode display switcher */}
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 text-[8px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">✓ Professional Flight Deck</span>
                    <span className="px-2 py-0.5 text-[8px] font-mono bg-rose-50 text-rose-800 border border-rose-200">⚡ Recruiter Roast Mode</span>
                  </div>

                  <p className="font-serif italic text-xs text-editorial-text leading-relaxed">
                    "Critique snippet: Under your Senior Associate role, you listed 'Responsible for maintaining systems.' This is passive aviation. Change this to 'Pioneered deployment pipelines reducing downtime by 38%.' Always lead with impact."
                  </p>

                  <div className="rounded-none bg-editorial-tint/60 dark:bg-editorial-bg p-3.5 border border-editorial-border space-y-2">
                    <div className="flex items-center gap-1.5 font-serif text-xs font-bold text-rose-700 dark:text-rose-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Brutal Roast Mode Active Example:
                    </div>
                    <p className="font-mono text-[10px] text-editorial-sub italic">
                      "Your bullet points read like a recipe book for a cake that nobody wants to buy. 'Proficient in Microsoft Word'? What is this, 1998? Remove it immediately before a hiring manager laughs you out of the room."
                    </p>
                  </div>
                </motion.div>
              )}

              {activeGlimpse === "ats" && (
                <motion.div
                  key="ats"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-editorial-border pb-2">
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest">[Module: ATS Scanner Core]</span>
                    <span className="text-[9px] font-mono bg-sky-50 dark:bg-sky-950/30 text-sky-700 px-1.5 py-0.5">Job Match Index</span>
                  </div>

                  <div className="flex items-center gap-5">
                    {/* Ring score */}
                    <div className="relative flex items-center justify-center h-16 w-16 rounded-full border-4 border-indigo-100 dark:border-indigo-950 border-t-indigo-600">
                      <span className="text-base font-mono font-black text-editorial-text">84%</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif text-xs font-extrabold italic text-editorial-text">Applicant Score: Ready for Takeoff</h4>
                      <p className="text-[9px] font-mono text-editorial-sub uppercase tracking-wider">Matched: Software Engineer Roles</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-editorial-border">
                    <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-editorial-text">Missing Critical Keywords Identified:</span>
                    <div className="flex flex-wrap gap-1.5 text-[8px] font-mono">
                      <span className="bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.5">"Continuous Integration" (Missing)</span>
                      <span className="bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.5">"Microservices" (Missing)</span>
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5">"TypeScript" (Found)</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeGlimpse === "coach" && (
                <motion.div
                  key="coach"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-editorial-border pb-2">
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest">[Module: Copilot Interviewer]</span>
                    <span className="text-[9px] font-mono bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 px-1.5 py-0.5">Targeted Rehearsal</span>
                  </div>

                  <div className="space-y-3">
                    <div className="border-l-2 border-indigo-500 pl-3">
                      <span className="text-[8px] font-mono uppercase text-editorial-sub">AI Interviewer:</span>
                      <p className="font-serif italic text-xs text-editorial-text font-bold">
                        "Your resume lists a major migration from monolith to serverless. What specific contingency plan did you implement in case of cold-start degradation during peak hours?"
                      </p>
                    </div>

                    <div className="bg-editorial-tint/50 p-2.5 border border-editorial-border">
                      <span className="text-[8px] font-mono uppercase text-editorial-sub">Sample High-Impact Answer Guidelines:</span>
                      <p className="font-mono text-[9px] text-editorial-text italic leading-relaxed mt-1">
                        - Outline standard memory allocation upgrades.<br />
                        - Emphasize proactive route warmers.<br />
                        - Support with quantitative latency savings.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeGlimpse === "payments" && (
                <motion.div
                  key="payments"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-editorial-border pb-2">
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest">[Module: Sandbox Payment Manager]</span>
                    <span className="text-[9px] font-mono bg-amber-50 dark:bg-amber-950/30 text-amber-700 px-1.5 py-0.5">UPI Simulation</span>
                  </div>

                  <div className="rounded-none border border-amber-200 bg-amber-50/40 p-4 space-y-2">
                    <h5 className="font-serif text-xs font-bold text-amber-900">Portfolio Slots Expansion</h5>
                    <p className="font-serif italic text-[11px] text-amber-800 leading-relaxed">
                      First slot is 100% free forever. Expand your flight hangar with secondary resume slots for ₹100 INR. Real server database tracking.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[9px] text-editorial-sub">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Simulated UPI deep linking sandbox included
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Prompt footer inside simulator */}
            <div className="border-t border-editorial-border pt-3.5 flex items-center justify-between mt-4">
              <span className="text-[9px] font-mono text-editorial-sub uppercase tracking-wider">🔒 Cryptographically Sealed Cockpit</span>
              <span className="text-[9px] font-mono text-indigo-500 font-bold uppercase">Sign in to unlock full access</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Login card embedded directly (Takes up 5 cols) */}
        <div id="auth-hangar-card" className="lg:col-span-5">
          <div className="rounded-none border-2 border-editorial-text bg-white dark:bg-editorial-tint p-6 shadow-[8px_8px_0px_var(--color-editorial-border)] space-y-5">
            
            <div className="flex items-center gap-2.5 border-b border-editorial-border pb-3.5">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400">
                <LogIn className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold italic text-editorial-text">
                  {authMode === "login" ? "Hangar Access Deck" : "Establish Pilot Credentials"}
                </h3>
                <p className="text-[9px] font-mono text-editorial-sub uppercase tracking-widest font-bold">Uncompromised Cryptographic Safety</p>
              </div>
            </div>

            {authError && (
              <div className="rounded-none border border-rose-200 bg-rose-50/40 dark:bg-rose-950/20 dark:border-rose-900 p-3 text-rose-800 dark:text-rose-400 font-serif italic text-xs">
                {authError}
              </div>
            )}

            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              {authMode === "signup" && (
                <div>
                  <label className="block text-[8px] font-mono uppercase text-editorial-sub tracking-widest font-bold mb-1">
                    Pilot Username / Nickname
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AviatorName"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-none border border-editorial-border bg-editorial-tint dark:bg-editorial-bg px-3 py-2 text-xs font-mono text-editorial-text focus:outline-none placeholder:text-editorial-sub/50"
                  />
                </div>
              )}

              <div>
                <label className="block text-[8px] font-mono uppercase text-editorial-sub tracking-widest font-bold mb-1">
                  Gmail / Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. candidate@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-none border border-editorial-border bg-editorial-tint dark:bg-editorial-bg px-3 py-2 text-xs font-mono text-editorial-text focus:outline-none placeholder:text-editorial-sub/50"
                />
              </div>

              <div>
                <label className="block text-[8px] font-mono uppercase text-editorial-sub tracking-widest font-bold mb-1">
                  Secure Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-none border border-editorial-border bg-editorial-tint dark:bg-editorial-bg px-3 py-2 text-xs font-mono text-editorial-text focus:outline-none placeholder:text-editorial-sub/50"
                />
              </div>

              <div className="flex gap-2 text-[9px] font-mono uppercase tracking-wide font-bold">
                <button
                  type="button"
                  onClick={() => autofillCredentials("user")}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  [Autofill Demo User]
                </button>
                <span className="text-editorial-sub">|</span>
                <button
                  type="button"
                  onClick={() => autofillCredentials("admin")}
                  className="text-rose-600 dark:text-rose-400 hover:underline"
                >
                  [Autofill Admin]
                </button>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="flex w-full items-center justify-center gap-1.5 bg-editorial-text hover:bg-neutral-800 dark:hover:bg-neutral-200 py-3.5 text-xs font-mono font-bold uppercase tracking-widest text-editorial-bg transition-colors rounded-none disabled:opacity-50"
              >
                {authLoading ? (
                  <RotateCw className="h-4 w-4 animate-spin" />
                ) : authMode === "login" ? (
                  <>
                    Unlock Cockpit <ChevronRight className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    Sign Up Now <ChevronRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick simulated google sign in */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-y-1/2 left-0 right-0 border-t border-editorial-border"></div>
              <span className="relative bg-white dark:bg-editorial-tint px-2.5 font-mono text-[8px] text-editorial-sub uppercase tracking-wider">
                Or authenticate via Gmail
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="flex w-full items-center justify-center gap-2 border border-blue-200 dark:border-blue-900 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-900/20 py-3 text-xs font-mono font-bold uppercase tracking-widest text-blue-800 dark:text-blue-400 transition-colors rounded-none disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  m="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  m="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  m="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  m="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google Account Sign-In
            </button>

            <div className="border-t border-editorial-border pt-4 text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-bold hover:underline"
              >
                {authMode === "login" 
                  ? "Don't have credentials? Establish account" 
                  : "Registered before? Return to Sign In"}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
