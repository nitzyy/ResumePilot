import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  BadgeAlert,
  Sparkles,
  Download,
  Copy,
  Trash2,
  Award,
  Briefcase,
  Layers,
  Search,
  Activity,
  AlertCircle,
  HelpCircle,
  Moon,
  Sun,
  Flame,
  UserCheck,
  History,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  Globe,
  Check,
  Lock,
  Unlock,
  CreditCard,
  Coins,
  Smartphone,
  LogIn,
  LogOut,
  User
} from "lucide-react";
import { TARGET_ROLES, EXPERIENCE_LEVELS, MOCK_RESUME_EXAMPLE, CritiqueResult, ResumeSlot } from "./types";
import { generateMarkdownReport } from "./utils/markdownGenerator";
import { getMockDemoResult } from "./utils/mockData";
import { RecruiterScanView } from "./components/RecruiterScanView";
import { AtsScannerView } from "./components/AtsScannerView";
import { MetricsView } from "./components/MetricsView";
import { CareerCoachView } from "./components/CareerCoachView";
import { InterviewPrepView } from "./components/InterviewPrepView";
import { OriginalityView } from "./components/OriginalityView";
import { AdminView } from "./components/AdminView";
import { LandingView } from "./components/LandingView";

export default function App() {
  // Resume Slots & Pricing state variables (First slot is free forever; additional slots are 100rs)
  const defaultSlots: ResumeSlot[] = [
    {
      id: "slot_1",
      name: "Primary Resume Slot",
      isUnlocked: true,
      targetRole: TARGET_ROLES[0],
      experienceLevel: EXPERIENCE_LEVELS[2],
      jobDescription: "",
      inputType: "file",
      resumeText: "",
      selectedFileName: null,
      linkedinUrl: "",
      githubUrl: "",
      portfolioUrl: "",
      result: null
    }
  ];

  const [slots, setSlots] = useState<ResumeSlot[]>(() => {
    try {
      const saved = localStorage.getItem("resume_pilot_slots");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to parse slots", e);
    }
    return defaultSlots;
  });

  const [activeSlotId, setActiveSlotId] = useState<string>(() => {
    try {
      const savedActive = localStorage.getItem("resume_pilot_active_slot_id");
      return savedActive || "slot_1";
    } catch {
      return "slot_1";
    }
  });

  // Local form states
  const [targetRole, setTargetRole] = useState(TARGET_ROLES[0]);
  const [experienceLevel, setExperienceLevel] = useState(EXPERIENCE_LEVELS[2]); // Mid-Level
  const [jobDescription, setJobDescription] = useState("");
  const [inputType, setInputType] = useState<"file" | "text">("file");
  const [resumeText, setResumeText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Profile URLs and Social states
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Payment Simulator panel/modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [slotToUnlock, setSlotToUnlock] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState("");

  // Tone state: Professional vs Brutal Recruiter Roast
  const [tone, setTone] = useState<"professional" | "roast">("professional");

  // Active Authenticated User & Secure Session States
  const [user, setUser] = useState<any | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return localStorage.getItem("resume_pilot_token");
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Toast confirmation states (replaces window.alert for iframe compatibility)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Result and Tab states (including new mobile packaging guide)
  const [result, setResult] = useState<CritiqueResult | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "ats" | "metrics" | "coach" | "interview" | "cliches" | "mobile" | "admin">("overview");

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);

  // Resume History (Evolution tracking)
  const [history, setHistory] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("resume_pilot_history") || "[]");
    } catch {
      return [];
    }
  });

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync effect: update local form state whenever the active slot changes
  useEffect(() => {
    const activeSlot = slots.find((s) => s.id === activeSlotId);
    if (activeSlot) {
      setTargetRole(activeSlot.targetRole);
      setExperienceLevel(activeSlot.experienceLevel);
      setJobDescription(activeSlot.jobDescription);
      setInputType(activeSlot.inputType);
      setResumeText(activeSlot.resumeText);
      setLinkedinUrl(activeSlot.linkedinUrl);
      setGithubUrl(activeSlot.githubUrl);
      setPortfolioUrl(activeSlot.portfolioUrl);
      setResult(activeSlot.result);
      if (activeSlot.selectedFileName) {
        setSelectedFile(new File([""], activeSlot.selectedFileName, { type: "text/plain" }));
      } else {
        setSelectedFile(null);
      }
    }
  }, [activeSlotId]);

  // Helper: auto-saves input updates to the current active slot & localStorage
  const updateActiveSlot = (updates: Partial<ResumeSlot>) => {
    setSlots((prevSlots) => {
      const newSlots = prevSlots.map((slot) => {
        if (slot.id === activeSlotId) {
          return { ...slot, ...updates };
        }
        return slot;
      });
      localStorage.setItem("resume_pilot_slots", JSON.stringify(newSlots));
      return newSlots;
    });
  };

  // Switch to or prompt checkout for selected slot
  const handleSelectSlot = (slotId: string) => {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) return;
    if (!slot.isUnlocked) {
      setSlotToUnlock(slotId);
      setShowPaymentModal(true);
    } else {
      setActiveSlotId(slotId);
      localStorage.setItem("resume_pilot_active_slot_id", slotId);
    }
  };

  // Create new locked slot requiring payment
  const createNewSlot = () => {
    const newSlotId = `slot_${Date.now()}`;
    const newSlotNum = slots.length + 1;
    const newSlot: ResumeSlot = {
      id: newSlotId,
      name: `Resume Slot #${newSlotNum}`,
      isUnlocked: false,
      targetRole: TARGET_ROLES[0],
      experienceLevel: EXPERIENCE_LEVELS[2],
      jobDescription: "",
      inputType: "file",
      resumeText: "",
      selectedFileName: null,
      linkedinUrl: "",
      githubUrl: "",
      portfolioUrl: "",
      result: null
    };

    setSlots((prev) => {
      const updated = [...prev, newSlot];
      localStorage.setItem("resume_pilot_slots", JSON.stringify(updated));
      return updated;
    });

    setSlotToUnlock(newSlotId);
    setShowPaymentModal(true);
  };

  // In-place rename
  const handleRenameSlot = (slotId: string, newName: string) => {
    setSlots((prevSlots) => {
      const newSlots = prevSlots.map((slot) => {
        if (slot.id === slotId) {
          return { ...slot, name: newName };
        }
        return slot;
      });
      localStorage.setItem("resume_pilot_slots", JSON.stringify(newSlots));
      return newSlots;
    });
  };

  // Delete a slot (re-routes to primary slot if active was deleted)
  const handleDeleteSlot = (slotId: string) => {
    if (slotId === "slot_1") return;

    setSlots((prevSlots) => {
      const newSlots = prevSlots.filter((slot) => slot.id !== slotId);
      localStorage.setItem("resume_pilot_slots", JSON.stringify(newSlots));
      return newSlots;
    });

    if (activeSlotId === slotId) {
      setActiveSlotId("slot_1");
      localStorage.setItem("resume_pilot_active_slot_id", "slot_1");
    }
    setToastMessage("Resume slot deleted successfully.");
  };

  // Sandbox payment processing
  const handleSimulatePayment = () => {
    if (!slotToUnlock) return;
    setIsProcessingPayment(true);
    setPaymentStep("Initiating secure UPI request for ₹100 INR...");

    setTimeout(() => {
      setPaymentStep("Awaiting mobile push authorization...");
      
      setTimeout(() => {
        setPaymentStep("Settling payment with bank server...");
        
        setTimeout(() => {
          setSlots((prevSlots) => {
            const newSlots = prevSlots.map((slot) => {
              if (slot.id === slotToUnlock) {
                return { ...slot, isUnlocked: true };
              }
              return slot;
            });
            localStorage.setItem("resume_pilot_slots", JSON.stringify(newSlots));
            return newSlots;
          });

          setActiveSlotId(slotToUnlock);
          localStorage.setItem("resume_pilot_active_slot_id", slotToUnlock);

          // If logged in, sync unlocked slot to the server database
          if (sessionToken && user) {
            fetch("/api/auth/unlock-slot", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionToken}`
              },
              body: JSON.stringify({ slotId: slotToUnlock })
            }).then(res => {
              if (res.ok) return res.json();
            }).then(data => {
              if (data && data.user) {
                setUser(data.user);
              }
            }).catch(err => {
              console.error("Failed to sync unlocked slot to server", err);
            });
          }

          setIsProcessingPayment(false);
          setShowPaymentModal(false);
          setSlotToUnlock(null);
          setToastMessage("Payment Successful! Slot unlocked for infinite edits.");
        }, 1200);
      }, 1200);
    }, 1200);
  };

  // Loader texts
  const loadingSteps = [
    "Reading and parsing your resume content...",
    "Scanning ATS structure, sections, and formatting...",
    "Evaluating bullet points, action verbs, and impact metrics...",
    "Formulating professional before/after improvement recommendations...",
    "Tailoring strategic career & keyword tips for your target role..."
  ];

  // Auto-hide toast notification
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // SECURE AUTHENTICATION AND DATABASE INTEGRATION EFFECTS
  // 1. Session check on mount/token change
  useEffect(() => {
    async function checkSession() {
      if (!sessionToken) return;
      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${sessionToken}`
          }
        });
        const data = await response.json();
        if (response.ok && data.user) {
          setUser(data.user);
        } else {
          // Token expired or invalid, wipe session
          setSessionToken(null);
          localStorage.removeItem("resume_pilot_token");
          setUser(null);
        }
      } catch (err) {
        console.error("Session recovery failed", err);
      }
    }
    checkSession();
  }, [sessionToken]);

  // 2. Synchronize unlocked slots listed on user profile in the database
  useEffect(() => {
    if (user && user.unlockedSlots) {
      setSlots((prevSlots) => {
        const updated = prevSlots.map((slot) => {
          if (user.unlockedSlots.includes(slot.id)) {
            return { ...slot, isUnlocked: true };
          }
          return slot;
        });
        localStorage.setItem("resume_pilot_slots", JSON.stringify(updated));
        return updated;
      });
    }
  }, [user]);

  // 3. Register or login user handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const url = authMode === "signup" ? "/api/auth/register" : "/api/auth/login";
      const payload = authMode === "signup"
        ? { email: authEmail, username: authUsername, password: authPassword }
        : { email: authEmail, password: authPassword };

      const response = await fetch(url, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      setSessionToken(data.token);
      localStorage.setItem("resume_pilot_token", data.token);
      setUser(data.user);
      setShowAuthModal(false);
      setToastMessage(`Welcome back, ${data.user.username}!`);
      
      // Reset input fields
      setAuthEmail("");
      setAuthUsername("");
      setAuthPassword("");
    } catch (err: any) {
      setAuthError(err.message || "An unexpected error occurred during auth.");
    } finally {
      setAuthLoading(false);
    }
  };

  // 4. Secure Google account login simulation (with real database creation/persistence)
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const email = authEmail || "gnitya2507@gmail.com"; // Default to requestor email or specified gmail
      const username = email.split("@")[0] || "GooglePilot";

      const response = await fetch("/api/auth/google", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ email, username })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Google Auth simulation failed.");
      }

      setSessionToken(data.token);
      localStorage.setItem("resume_pilot_token", data.token);
      setUser(data.user);
      setShowAuthModal(false);
      setToastMessage(`Logged in with Google Account: ${data.user.email}!`);
    } catch (err: any) {
      setAuthError(err.message || "Google sign-in error.");
    } finally {
      setAuthLoading(false);
    }
  };

  // 5. Logout session
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sessionToken}`
        }
      });
    } catch (err) {
      console.error("Logout request failed", err);
    }
    setSessionToken(null);
    localStorage.removeItem("resume_pilot_token");
    setUser(null);
    setToastMessage("Successfully logged out!");
    if (activeTab === "admin") {
      setActiveTab("overview");
    }
  };

  const handleShowCopyToast = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage("Copied to clipboard successfully!");
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ["application/pdf", "text/plain"];
    if (!validTypes.includes(file.type) && !file.name.endsWith(".txt")) {
      setError("Unsupported file format. Please upload a PDF (.pdf) or a text file (.txt).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum allowed size is 10MB.");
      return;
    }
    setSelectedFile(file);
    setResumeText(""); // Clear manual text if file is uploaded
    updateActiveSlot({
      selectedFileName: file.name,
      resumeText: "",
      inputType: "file"
    });
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    updateActiveSlot({
      selectedFileName: null
    });
  };

  const loadExampleResume = () => {
    setInputType("text");
    setResumeText(MOCK_RESUME_EXAMPLE);
    setSelectedFile(null);
    setTargetRole("Software Engineer / Developer");
    setError(null);
    updateActiveSlot({
      inputType: "text",
      resumeText: MOCK_RESUME_EXAMPLE,
      selectedFileName: null,
      targetRole: "Software Engineer / Developer"
    });
  };

  // Trigger Resume Analysis
  const triggerCritique = async (isDemo = false) => {
    // Check if slot is unlocked (safety check)
    const currentActiveSlot = slots.find(s => s.id === activeSlotId);
    if (currentActiveSlot && !currentActiveSlot.isUnlocked) {
      setSlotToUnlock(activeSlotId);
      setShowPaymentModal(true);
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

    try {
      if (isDemo) {
        setTimeout(() => {
          clearInterval(stepInterval);
          const mockResult = getMockDemoResult(targetRole, experienceLevel, tone);
          setResult(mockResult);
          updateActiveSlot({ result: mockResult });
          
          // Save successful run to local history
          const newHist = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            score: mockResult.score,
            role: targetRole,
            level: experienceLevel,
            tone: tone
          };
          const updatedHistory = [newHist, ...history].slice(0, 5);
          setHistory(updatedHistory);
          localStorage.setItem("resume_pilot_history", JSON.stringify(updatedHistory));

          setIsLoading(false);
          setToastMessage("Critique report generated via Demo Engine!");
        }, 3000);
        return;
      }

      const formData = new FormData();
      formData.append("targetRole", targetRole);
      formData.append("experienceLevel", experienceLevel);
      formData.append("jobDescription", jobDescription);
      formData.append("tone", tone);
      formData.append("githubUrl", githubUrl);
      formData.append("linkedinUrl", linkedinUrl);
      formData.append("portfolioUrl", portfolioUrl);

      if (inputType === "file") {
        if (!selectedFile) {
          throw new Error("Please select a resume file to upload or paste your resume text manually.");
        }
        formData.append("resumeFile", selectedFile);
      } else {
        if (!resumeText.trim()) {
          throw new Error("Please paste your resume text in the field below.");
        }
        formData.append("resumeText", resumeText);
      }

      const response = await fetch("/api/critique", {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to analyze resume. Please verify your unencrypted PDF file or paste your text manually.");
      }

      setResult(responseData);
      
      // Update our slot with the result (and extracted text if returned)
      updateActiveSlot({
        result: responseData,
        resumeText: responseData.extractedText || resumeText
      });

      // Save to History
      const newHist = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        score: responseData.score,
        role: targetRole,
        level: experienceLevel,
        tone: tone
      };
      const updatedHistory = [newHist, ...history].slice(0, 5);
      setHistory(updatedHistory);
      localStorage.setItem("resume_pilot_history", JSON.stringify(updatedHistory));

      setToastMessage("AI analysis completed successfully!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during critique. Ensure it is a valid, unencrypted PDF or paste manually.");
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  const copyReportToClipboard = () => {
    if (!result) return;
    const md = generateMarkdownReport(result, targetRole, experienceLevel);
    handleShowCopyToast(md);
  };

  const downloadMarkdownFile = () => {
    if (!result) return;
    const md = generateMarkdownReport(result, targetRole, experienceLevel);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ResumePilot_Critique_${targetRole.replace(/\s+/g, "_")}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage("Markdown report downloaded!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark bg-editorial-bg text-editorial-text" : "bg-editorial-bg text-editorial-text"} font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900 print:bg-white print:p-0 transition-colors duration-200 relative`}>
      
      {/* Toast Notification popups */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[100] border-2 border-editorial-text bg-white dark:bg-editorial-tint px-5 py-3.5 shadow-[4px_4px_0px_var(--color-editorial-text)] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 animate-bounce">
          <Check className="h-4.5 w-4.5 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="sticky top-0 z-50 border-b border-editorial-border bg-editorial-bg/95 backdrop-blur-md print:hidden">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-editorial-text text-editorial-bg flex items-center justify-center font-serif font-bold border border-editorial-border">P</div>
            <div>
              <h1 className="font-serif text-lg font-bold tracking-tight text-editorial-text italic">
                Resume<span className="text-indigo-600 dark:text-indigo-400 font-sans font-extrabold not-italic">Pilot</span>
              </h1>
              <p className="text-[9px] font-mono tracking-widest text-editorial-sub uppercase">Hiring & ATS Flight Controller</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="inline-flex h-8 w-8 items-center justify-center border border-editorial-border bg-editorial-tint hover:bg-editorial-bg text-editorial-text transition-all rounded-none"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              onClick={loadExampleResume}
              className="inline-flex items-center gap-1.5 border border-editorial-border bg-editorial-tint px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-editorial-text transition-all hover:bg-editorial-bg"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              Load Sample Resume
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                {user.isAdmin && (
                  <button
                    onClick={() => {
                      setActiveTab(activeTab === "admin" ? "overview" : "admin");
                    }}
                    className={`inline-flex items-center gap-1 border px-2 py-1.5 text-xs font-mono uppercase tracking-wider transition-all font-bold ${
                      activeTab === "admin"
                        ? "bg-rose-700 text-white border-rose-700"
                        : "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400"
                    }`}
                  >
                    Admin Panel
                  </button>
                )}
                <div className="hidden sm:inline-flex items-center gap-1.5 border border-editorial-border bg-editorial-tint px-3 py-1.5 text-xs font-mono text-editorial-text font-semibold">
                  <User className="h-3.5 w-3.5 text-indigo-500" />
                  {user.username}
                </div>
                <button
                  onClick={handleLogout}
                  title="Securely Logout"
                  className="inline-flex h-8 w-8 items-center justify-center border border-editorial-border bg-editorial-tint hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 text-editorial-sub transition-all rounded-none"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode("login");
                  setShowAuthModal(true);
                }}
                className="inline-flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-indigo-700 dark:text-indigo-400 transition-all hover:bg-indigo-100"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </button>
            )}

            <span className="hidden md:inline-flex items-center gap-1 border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              PWA Online
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 print:p-0">
        {!sessionToken || !user ? (
          <LandingView 
            onAuthSuccess={(token, loggedUser) => {
              setSessionToken(token);
              localStorage.setItem("resume_pilot_token", token);
              setUser(loggedUser);
              setToastMessage(`Welcome back, ${loggedUser.username}!`);
            }} 
            userEmail="gnitya2507@gmail.com"
          />
        ) : activeTab === "admin" && sessionToken ? (
          <AdminView sessionToken={sessionToken} />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 print:block">
          
          {/* Left Panel: Configuration Form */}
          <div className="lg:col-span-5 print:hidden">
            
            {/* Resume Slots & Pricing Manager */}
            <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-5 shadow-[4px_4px_0px_var(--color-editorial-border)] mb-5 space-y-4">
              <div className="flex items-center justify-between border-b border-editorial-border pb-3">
                <div>
                  <h3 className="font-serif text-sm font-bold italic text-editorial-text">Resume Portfolio Slots</h3>
                  <p className="text-[9px] font-mono uppercase text-editorial-sub tracking-wider">₹100 INR per new resume</p>
                </div>
                <span className="rounded-none bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider">
                  First Resume Free
                </span>
              </div>

              <div className="space-y-2">
                {slots.map((slot, index) => {
                  const isActive = slot.id === activeSlotId;
                  return (
                    <div
                      key={slot.id}
                      onClick={() => handleSelectSlot(slot.id)}
                      className={`group flex items-center justify-between border p-3 cursor-pointer transition-all ${
                        isActive
                          ? "border-editorial-text bg-editorial-tint/70 font-semibold"
                          : "border-editorial-border bg-white dark:bg-editorial-tint/30 hover:bg-editorial-tint/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="text-[10px] font-mono text-editorial-sub">#{index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <input
                            type="text"
                            value={slot.name}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleRenameSlot(slot.id, e.target.value)}
                            className="w-full bg-transparent border-0 p-0 text-xs text-editorial-text font-serif italic focus:outline-none focus:ring-0 leading-tight"
                            title="Click to rename"
                          />
                          <span className="block text-[8px] font-mono text-editorial-sub uppercase tracking-wider truncate mt-0.5">
                            {slot.selectedFileName ? `📄 ${slot.selectedFileName}` : "Pasted Manual Text"}
                            {slot.result ? ` (Score: ${slot.result.score}/100)` : " (Unanalyzed)"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-2">
                        {!slot.isUnlocked ? (
                          <span className="flex items-center gap-1 rounded-none bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-wide">
                            <Lock className="h-2.5 w-2.5" />
                            Locked
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded-none bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-wide">
                            <Unlock className="h-2.5 w-2.5" />
                            {index === 0 ? "Free Slot" : "Unlocked"}
                          </span>
                        )}

                        {index > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSlot(slot.id);
                            }}
                            className="text-editorial-sub hover:text-rose-600 p-1"
                            title="Delete this resume slot"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={createNewSlot}
                className="flex w-full items-center justify-center gap-1.5 rounded-none border border-dashed border-editorial-border bg-white dark:bg-editorial-tint hover:bg-editorial-tint/50 py-2.5 text-[10px] font-mono uppercase font-bold tracking-wider text-editorial-text transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                + Create New Resume Slot (₹100)
              </button>
            </div>

            <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-6 shadow-[4px_4px_0px_var(--color-editorial-border)] space-y-5">
              <h2 className="font-serif text-2xl font-bold italic tracking-tight text-editorial-text">Flight Parameters</h2>
              <p className="text-xs text-editorial-sub font-serif italic">
                Set target parameters, tone, profile URLs, and drag in your resume.
              </p>

              {/* Target Role Selector */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-editorial-sub">
                  Target Job Title
                </label>
                <div className="mt-1.5 relative">
                  <select
                    value={targetRole}
                    onChange={(e) => {
                      setTargetRole(e.target.value);
                      updateActiveSlot({ targetRole: e.target.value });
                    }}
                    className="block w-full rounded-none border border-editorial-border bg-editorial-tint dark:bg-editorial-bg px-3.5 py-2.5 text-xs font-mono tracking-wide text-editorial-text focus:outline-none"
                  >
                    {TARGET_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Experience Level Selector */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-editorial-sub">
                  Target Experience Level
                </label>
                <div className="mt-1.5">
                  <select
                    value={experienceLevel}
                    onChange={(e) => {
                      setExperienceLevel(e.target.value);
                      updateActiveSlot({ experienceLevel: e.target.value });
                    }}
                    className="block w-full rounded-none border border-editorial-border bg-editorial-tint dark:bg-editorial-bg px-3.5 py-2.5 text-xs font-mono tracking-wide text-editorial-text focus:outline-none"
                  >
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Professional Tone vs Brutal Roast */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-editorial-sub">
                  Critique Tone
                </label>
                <div className="mt-1.5 flex rounded-none border border-editorial-border bg-editorial-tint p-1">
                  <button
                    type="button"
                    onClick={() => setTone("professional")}
                    className={`flex-1 py-1.5 text-center text-[10px] uppercase tracking-wider font-mono font-bold rounded-none transition-all flex items-center justify-center gap-1.5 ${
                      tone === "professional"
                        ? "bg-editorial-text text-white"
                        : "text-editorial-sub hover:text-editorial-text"
                    }`}
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Professional
                  </button>
                  <button
                    type="button"
                    onClick={() => setTone("roast")}
                    className={`flex-1 py-1.5 text-center text-[10px] uppercase tracking-wider font-mono font-bold rounded-none transition-all flex items-center justify-center gap-1.5 ${
                      tone === "roast"
                        ? "bg-red-700 text-white"
                        : "text-editorial-sub hover:text-red-700"
                    }`}
                  >
                    <Flame className="h-3.5 w-3.5" />
                    Brutal Roast
                  </button>
                </div>
              </div>

              {/* Collapsible Advanced URLs Section */}
              <div className="border-t border-editorial-border pt-4">
                <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-editorial-sub mb-2.5">
                  Online Footprints & URLs (Optional)
                </span>
                <div className="space-y-2.5">
                  <div>
                    <input
                      type="url"
                      placeholder="LinkedIn URL (e.g. linkedin.com/in/username)"
                      value={linkedinUrl}
                      onChange={(e) => {
                        setLinkedinUrl(e.target.value);
                        updateActiveSlot({ linkedinUrl: e.target.value });
                      }}
                      className="block w-full rounded-none border border-editorial-border bg-editorial-tint dark:bg-editorial-bg px-3.5 py-2 text-xs font-mono tracking-wide text-editorial-text focus:outline-none placeholder:text-editorial-sub/60"
                    />
                  </div>
                  <div>
                    <input
                      type="url"
                      placeholder="GitHub URL (e.g. github.com/username)"
                      value={githubUrl}
                      onChange={(e) => {
                        setGithubUrl(e.target.value);
                        updateActiveSlot({ githubUrl: e.target.value });
                      }}
                      className="block w-full rounded-none border border-editorial-border bg-editorial-tint dark:bg-editorial-bg px-3.5 py-2 text-xs font-mono tracking-wide text-editorial-text focus:outline-none placeholder:text-editorial-sub/60"
                    />
                  </div>
                  <div>
                    <input
                      type="url"
                      placeholder="Portfolio URL (e.g. portfolio.com)"
                      value={portfolioUrl}
                      onChange={(e) => {
                        setPortfolioUrl(e.target.value);
                        updateActiveSlot({ portfolioUrl: e.target.value });
                      }}
                      className="block w-full rounded-none border border-editorial-border bg-editorial-tint dark:bg-editorial-bg px-3.5 py-2 text-xs font-mono tracking-wide text-editorial-text focus:outline-none placeholder:text-editorial-sub/60"
                    />
                  </div>
                </div>
              </div>

              {/* Target Job Description */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-editorial-sub">
                    Target Job Description (Optional)
                  </label>
                  <span className="text-[8px] font-mono text-emerald-700 font-bold uppercase tracking-wider">Unlocks keyword heatmap</span>
                </div>
                <div className="mt-1.5">
                  <textarea
                    placeholder="Paste the target job description requirements here to activate precision ATS keyword matching & One-Click Tailoring..."
                    value={jobDescription}
                    onChange={(e) => {
                      setJobDescription(e.target.value);
                      updateActiveSlot({ jobDescription: e.target.value });
                    }}
                    rows={2}
                    className="block w-full rounded-none border border-editorial-border bg-editorial-tint dark:bg-editorial-bg p-3 text-xs font-serif italic text-editorial-text placeholder:text-editorial-sub/60 focus:outline-none"
                  />
                </div>
              </div>

              {/* Input Type Toggles */}
              <div className="border-t border-editorial-border pt-4">
                <div className="flex rounded-none border border-editorial-border bg-editorial-tint p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setInputType("file");
                      updateActiveSlot({ inputType: "file" });
                    }}
                    className={`flex-1 py-1.5 text-center text-[10px] uppercase tracking-wider font-mono font-bold rounded-none transition-all ${
                      inputType === "file"
                        ? "bg-editorial-text text-white"
                        : "text-editorial-sub hover:text-editorial-text"
                    }`}
                  >
                    Upload Resume File
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputType("text");
                      updateActiveSlot({ inputType: "text" });
                    }}
                    className={`flex-1 py-1.5 text-center text-[10px] uppercase tracking-wider font-mono font-bold rounded-none transition-all ${
                      inputType === "text"
                        ? "bg-editorial-text text-white"
                        : "text-editorial-sub hover:text-editorial-text"
                    }`}
                  >
                    Paste Text Manually
                  </button>
                </div>
              </div>

              {/* Resume Input Area */}
              <div>
                {inputType === "file" ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`group flex flex-col items-center justify-center rounded-none border-2 border-dashed px-5 py-6 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-editorial-text bg-editorial-tint/50"
                        : "border-editorial-border-dark hover:border-editorial-text hover:bg-editorial-tint/25"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".pdf,.txt"
                      className="hidden"
                    />
                    
                    {selectedFile ? (
                      <div className="flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-none bg-editorial-tint border border-editorial-border">
                          <FileText className="h-7 w-7 text-editorial-text" />
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center bg-editorial-text text-[8px] font-mono font-bold text-white uppercase">
                            doc
                          </span>
                        </div>
                        <p className="mt-3 text-xs font-mono font-bold text-editorial-text truncate max-w-[200px]">
                          {selectedFile.name}
                        </p>
                        <p className="text-[10px] font-mono text-editorial-sub">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={removeSelectedFile}
                          className="mt-3 flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest font-bold text-rose-600 hover:underline"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex h-10 w-10 items-center justify-center rounded-none bg-editorial-tint text-editorial-sub border border-editorial-border transition-colors group-hover:bg-editorial-text group-hover:text-white">
                          <Upload className="h-4.5 w-4.5" />
                        </div>
                        <p className="mt-2 text-xs font-bold uppercase tracking-wider text-editorial-text">
                          Drag & drop resume
                        </p>
                        <p className="text-[9px] font-mono uppercase text-editorial-sub">
                          Accepts PDF (.pdf) or text (.txt)
                        </p>
                        <button
                          type="button"
                          className="mt-3.5 rounded-none border border-editorial-border bg-editorial-bg hover:bg-editorial-tint px-3 py-1 text-[9px] font-mono tracking-wider font-bold uppercase text-editorial-text"
                        >
                          Browse Files
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    <textarea
                      placeholder="Paste your full resume text here (Ctrl+V)..."
                      value={resumeText}
                      onChange={(e) => {
                        setResumeText(e.target.value);
                        updateActiveSlot({ resumeText: e.target.value });
                      }}
                      rows={6}
                      className="block w-full rounded-none border border-editorial-border bg-editorial-tint dark:bg-editorial-bg p-3.5 text-xs font-serif italic text-editorial-text placeholder:text-editorial-sub/65 focus:outline-none"
                    />
                    <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-editorial-sub uppercase tracking-wider">
                      <span>Chars: {resumeText.length}</span>
                      <span>Min: 50 chars</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => triggerCritique(false)}
                  disabled={isLoading || (inputType === "file" ? !selectedFile : !resumeText.trim())}
                  className="flex w-full items-center justify-center gap-2 rounded-none bg-editorial-text hover:bg-neutral-800 disabled:bg-editorial-border disabled:text-editorial-sub disabled:cursor-not-allowed py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-md transition-all hover:scale-[1.01]"
                >
                  <Sparkles className="h-4 w-4" />
                  Analyze with AI Pilot
                </button>

                <div className="flex items-center gap-2 text-[10px] font-mono text-editorial-sub justify-center uppercase tracking-wider">
                  <span>No API Key?</span>
                  <button
                    type="button"
                    onClick={() => triggerCritique(true)}
                    disabled={isLoading}
                    className="font-bold text-editorial-text hover:underline"
                  >
                    Run Demo Critique
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-none border border-rose-200 bg-[#FFF5F5] p-4 text-xs text-rose-800">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600 mt-0.5" />
                    <div>
                      <p className="font-bold">Parsing / Analysis Failed</p>
                      <p className="mt-1 leading-relaxed">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Resume Evolution / History Tracker widget */}
            {history.length > 0 && (
              <div className="mt-4 rounded-none border border-editorial-border bg-editorial-tint p-5">
                <h3 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-editorial-text">
                  <History className="h-4 w-4 text-editorial-text" />
                  Resume Evolution Score Log
                </h3>
                <p className="mt-1 text-[10px] text-editorial-sub font-serif italic">
                  Track and compare your scoring progression across successive updates:
                </p>
                <div className="mt-3.5 space-y-2">
                  {history.map((histItem, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs border-b border-editorial-border pb-1.5 last:border-0 last:pb-0">
                      <div className="font-serif italic text-editorial-text/90">
                        <span className="font-mono text-[10px] font-bold text-editorial-sub uppercase tracking-wider block">
                          Version {history.length - idx} • {histItem.timestamp}
                        </span>
                        {histItem.role} ({histItem.level})
                      </div>
                      <div className="text-right">
                        <span className="rounded-none bg-editorial-text text-white px-2 py-0.5 text-[10px] font-mono font-extrabold border">
                          {histItem.score}/100
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Results & Critique Dashboard */}
          <div className="lg:col-span-7 print:block print:col-span-12">
            
            {/* 1. Empty / Initial State */}
            {!isLoading && !result && (
              <div className="flex flex-col items-center justify-center rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-12 text-center shadow-[4px_4px_0px_var(--color-editorial-border)] h-full min-h-[460px]">
                <div className="flex h-16 w-16 items-center justify-center rounded-none bg-editorial-tint text-editorial-text border border-editorial-border">
                  <Layers className="h-7 w-7 animate-pulse" />
                </div>
                <h3 className="mt-6 font-serif text-2xl font-bold italic text-editorial-text">Your AI Critique Report</h3>
                <p className="mt-2 text-xs text-editorial-sub max-w-sm font-serif italic">
                  Upload your resume or paste its text content on the left to receive an immersive career evaluation immediately.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4 max-w-md text-left">
                  <div className="rounded-none border border-editorial-border p-4 bg-editorial-tint">
                    <Award className="h-5 w-5 text-editorial-text" />
                    <h4 className="mt-2 text-[10px] font-mono font-bold uppercase tracking-wider text-editorial-text">Scoring Analytics</h4>
                    <p className="mt-1 text-[11px] font-serif italic text-editorial-sub leading-normal">Simulates detailed eye-tracking heatmaps and 15-second scanning decisions.</p>
                  </div>
                  <div className="rounded-none border border-editorial-border p-4 bg-editorial-tint">
                    <Search className="h-5 w-5 text-editorial-text" />
                    <h4 className="mt-2 text-[10px] font-mono font-bold uppercase tracking-wider text-editorial-text">ATS Mapping & Tailor</h4>
                    <p className="mt-1 text-[11px] font-serif italic text-editorial-sub leading-normal">Aligns resume keywords with target descriptions and rewrites in 1-click.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-12 text-center shadow-[4px_4px_0px_var(--color-editorial-border)] min-h-[500px]">
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <div className="absolute h-16 w-16 animate-ping bg-editorial-tint"></div>
                  <div className="absolute h-12 w-12 animate-pulse bg-editorial-border"></div>
                  <div className="relative h-8 w-8 bg-editorial-text flex items-center justify-center border border-editorial-border">
                    <Activity className="h-4.5 w-4.5 text-editorial-bg animate-spin" />
                  </div>
                </div>

                <h3 className="mt-8 font-serif text-xl font-bold italic text-editorial-text">
                  Analyzing Your Career Profile...
                </h3>
                <p className="mt-1.5 text-[10px] font-mono font-bold text-editorial-sub tracking-widest uppercase">
                  Step {loadingStep + 1} of {loadingSteps.length}
                </p>
                
                <div className="mt-6 max-w-sm w-full space-y-2 bg-editorial-tint p-5 rounded-none border border-editorial-border">
                  {loadingSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 text-left text-xs transition-opacity duration-300 ${
                        idx === loadingStep
                          ? "text-editorial-text font-bold font-serif italic"
                          : idx < loadingStep
                          ? "text-emerald-700 dark:text-emerald-400 font-medium font-mono uppercase text-[9px]"
                          : "text-editorial-sub/60"
                      }`}
                    >
                      {idx < loadingStep ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : idx === loadingStep ? (
                        <span className="h-2 w-2 shrink-0 bg-editorial-text animate-ping" />
                      ) : (
                        <span className="h-1.5 w-1.5 shrink-0 bg-editorial-border-dark" />
                      )}
                      <span className="truncate">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Output Critique Report */}
            {result && (
              <div className="space-y-6 print:space-y-4">
                
                {/* Printable header info */}
                <div className="hidden print:flex items-center justify-between border-b border-editorial-border pb-4 mb-4">
                  <div>
                    <h1 className="text-2xl font-serif italic font-bold text-editorial-text">ResumePilot Critique Report</h1>
                    <p className="text-xs text-editorial-sub">Target Role: {targetRole} | Level: {experienceLevel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-editorial-text uppercase tracking-wider">ResumePilot AI Flight System</p>
                    <p className="text-[10px] text-editorial-sub">Generated: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Score Hero Section */}
                <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-6 shadow-[4px_4px_0px_var(--color-editorial-border)]">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center">
                    
                    {/* Circle Score Gauge */}
                    <div className="flex shrink-0 items-center justify-center mx-auto md:mx-0">
                      <div className="relative flex h-32 w-32 items-center justify-center">
                        <svg className="absolute top-0 left-0 h-full w-full transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="54"
                            className="stroke-editorial-border"
                            strokeWidth="9"
                            fill="transparent"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="54"
                            className={`transition-all duration-1000 ${
                              result.score >= 80
                                ? "stroke-emerald-600"
                                : result.score >= 60
                                ? "stroke-editorial-text"
                                : "stroke-rose-600"
                            }`}
                            strokeWidth="9"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 54}`}
                            strokeDashoffset={`${2 * Math.PI * 54 * (1 - result.score / 100)}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="text-center">
                          <span className="font-serif text-3.5xl font-black italic tracking-tight text-editorial-text">
                            {result.score}
                          </span>
                          <span className="block text-[9px] font-mono font-bold text-editorial-sub tracking-widest uppercase">
                            Rating
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Breakdown Scores */}
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-editorial-sub">
                            <span>Impact & Metrics</span>
                            <span className="text-editorial-text">{result.scores.impact}/100</span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full bg-editorial-tint">
                            <div
                              className="h-full bg-editorial-text transition-all duration-1000"
                              style={{ width: `${result.scores.impact}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-editorial-sub">
                            <span>Layout & Formatting</span>
                            <span className="text-editorial-text">{result.scores.formatting}/100</span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full bg-editorial-tint">
                            <div
                              className="h-full bg-editorial-text transition-all duration-1000"
                              style={{ width: `${result.scores.formatting}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-editorial-sub">
                            <span>Brevity & Verbs</span>
                            <span className="text-editorial-text">{result.scores.brevity}/100</span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full bg-editorial-tint">
                            <div
                              className="h-full bg-editorial-text transition-all duration-1000"
                              style={{ width: `${result.scores.brevity}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-editorial-sub">
                            <span>ATS Compatibility</span>
                            <span className="text-editorial-text">{result.scores.atsScore}/100</span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full bg-editorial-tint">
                            <div
                              className={`h-full transition-all duration-1000 ${
                                result.scores.atsScore >= 80 ? "bg-emerald-600" : "bg-editorial-text"
                              }`}
                              style={{ width: `${result.scores.atsScore}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Executive Summary Block */}
                  <div className="mt-6 border-t border-editorial-border pt-5">
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-editorial-sub">Executive Summary</h3>
                    <p className="mt-2 text-xs font-serif italic leading-relaxed text-editorial-text/90">{result.summary}</p>
                  </div>
                </div>

                {/* Control Action Buttons (Print, Copy, Save, Share) */}
                <div className="flex flex-wrap gap-2.5 print:hidden">
                  <button
                    onClick={copyReportToClipboard}
                    className="inline-flex items-center gap-1.5 border border-editorial-border bg-editorial-bg hover:bg-editorial-tint px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider font-bold text-editorial-text shadow-sm"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy as Markdown
                  </button>
                  <button
                    onClick={downloadMarkdownFile}
                    className="inline-flex items-center gap-1.5 border border-editorial-border bg-editorial-bg hover:bg-editorial-tint px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider font-bold text-editorial-text shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Report (.md)
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://resumepilot.app/report/${Date.now()}`);
                      setToastMessage("Mock Report Share URL copied to clipboard!");
                    }}
                    className="inline-flex items-center gap-1.5 border border-editorial-border bg-editorial-bg hover:bg-editorial-tint px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider font-bold text-editorial-text shadow-sm"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Share Report Link
                  </button>
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 bg-editorial-text hover:bg-neutral-800 dark:hover:bg-neutral-200 px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider font-bold text-editorial-bg ml-auto border border-editorial-border"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Print / Save to PDF
                  </button>
                </div>

                {/* Navigation Tabs */}
                <div className="border-b border-editorial-border print:hidden">
                  <nav className="flex flex-wrap gap-4">
                    <button
                      onClick={() => setActiveTab("overview")}
                      className={`border-b-2 py-3 text-[10px] font-mono font-bold uppercase tracking-widest ${
                        activeTab === "overview"
                          ? "border-editorial-text text-editorial-text"
                          : "border-transparent text-editorial-sub hover:text-editorial-text"
                      }`}
                    >
                      Recruiter Simulation
                    </button>
                    <button
                      onClick={() => setActiveTab("ats")}
                      className={`border-b-2 py-3 text-[10px] font-mono font-bold uppercase tracking-widest ${
                        activeTab === "ats"
                          ? "border-editorial-text text-editorial-text"
                          : "border-transparent text-editorial-sub hover:text-editorial-text"
                      }`}
                    >
                      ATS & Tailor Tool
                    </button>
                    <button
                      onClick={() => setActiveTab("metrics")}
                      className={`border-b-2 py-3 text-[10px] font-mono font-bold uppercase tracking-widest ${
                        activeTab === "metrics"
                          ? "border-editorial-text text-editorial-text"
                          : "border-transparent text-editorial-sub hover:text-editorial-text"
                      }`}
                    >
                      Metrics & comparisons
                    </button>
                    <button
                      onClick={() => setActiveTab("coach")}
                      className={`border-b-2 py-3 text-[10px] font-mono font-bold uppercase tracking-widest ${
                        activeTab === "coach"
                          ? "border-editorial-text text-editorial-text"
                          : "border-transparent text-editorial-sub hover:text-editorial-text"
                      }`}
                    >
                      Portfolio & Timeline
                    </button>
                    <button
                      onClick={() => setActiveTab("interview")}
                      className={`border-b-2 py-3 text-[10px] font-mono font-bold uppercase tracking-widest ${
                        activeTab === "interview"
                          ? "border-editorial-text text-editorial-text"
                          : "border-transparent text-editorial-sub hover:text-editorial-text"
                      }`}
                    >
                      Interview Prep
                    </button>
                    <button
                      onClick={() => setActiveTab("cliches")}
                      className={`border-b-2 py-3 text-[10px] font-mono font-bold uppercase tracking-widest ${
                        activeTab === "cliches"
                          ? "border-editorial-text text-editorial-text"
                          : "border-transparent text-editorial-sub hover:text-editorial-text"
                      }`}
                    >
                      Boilerplate & Clichés
                    </button>
                    <button
                      onClick={() => setActiveTab("mobile")}
                      className={`border-b-2 py-3 text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1 ${
                        activeTab === "mobile"
                          ? "border-editorial-text text-editorial-text"
                          : "border-transparent text-editorial-sub hover:text-indigo-500"
                      }`}
                    >
                      <Smartphone className="h-3.5 w-3.5 text-indigo-500" />
                      Google Play & App Store
                    </button>
                  </nav>
                </div>

                {/* Tab Render Content */}
                <div className="print:block space-y-8">
                  {activeTab === "overview" && <RecruiterScanView result={result} tone={tone} />}
                  {activeTab === "ats" && (
                    <AtsScannerView
                      result={result}
                      targetRole={targetRole}
                      experienceLevel={experienceLevel}
                      jobDescription={jobDescription}
                      onCopyText={handleShowCopyToast}
                    />
                  )}
                  {activeTab === "metrics" && <MetricsView result={result} onCopyText={handleShowCopyToast} />}
                  {activeTab === "coach" && (
                    <CareerCoachView
                      result={result}
                      githubUrl={githubUrl}
                      linkedinUrl={linkedinUrl}
                      portfolioUrl={portfolioUrl}
                    />
                  )}
                  {activeTab === "interview" && <InterviewPrepView result={result} />}
                  {activeTab === "cliches" && <OriginalityView result={result} />}
                  {activeTab === "mobile" && (
                    <div className="rounded-none border border-editorial-border bg-white dark:bg-editorial-tint p-6 shadow-[4px_4px_0px_var(--color-editorial-border)] space-y-6 animate-fadeIn">
                      <div className="flex items-center gap-3 border-b border-editorial-border pb-4">
                        <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 p-2 text-indigo-700 dark:text-indigo-400">
                          <Smartphone className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-serif text-xl font-bold italic text-editorial-text">Google Play & App Store Packaging</h3>
                          <p className="text-[10px] font-mono text-editorial-sub uppercase tracking-wider">How to deploy ResumePilot to Android and iOS devices</p>
                        </div>
                      </div>

                      <p className="text-xs text-editorial-text leading-relaxed font-serif italic">
                        Since ResumePilot is built as a highly responsive, modern full-stack web application, you can seamlessly compile and bundle it into native Android (APK / Google Play AAB) and iOS (Xcode Project / IPA) mobile applications using **Capacitor** (the industry-standard open-source wrapper by Ionic). Follow this interactive step-by-step developer playbook:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Step 1: Initialize Wrapper */}
                        <div className="border border-editorial-border p-4 bg-editorial-tint space-y-2">
                          <span className="font-mono text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">Step 01 • Configuration</span>
                          <h4 className="font-serif font-bold italic text-xs text-editorial-text">Initialize Mobile Core</h4>
                          <p className="text-[11px] text-editorial-sub leading-relaxed font-serif italic">Install Capacitor core and initialize it with your unique package ID (e.g., com.resumepilot.app) pointing to Vite's production output directory (`dist`).</p>
                          <div className="bg-editorial-bg border border-editorial-border p-2 font-mono text-[10px] text-editorial-text relative select-all">
                            npm i @capacitor/core @capacitor/cli<br/>
                            npx cap init ResumePilot com.resumepilot.app --web-dir=dist
                          </div>
                        </div>

                        {/* Step 2: Build App */}
                        <div className="border border-editorial-border p-4 bg-editorial-tint space-y-2">
                          <span className="font-mono text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">Step 02 • Production Compile</span>
                          <h4 className="font-serif font-bold italic text-xs text-editorial-text">Build Web Artifacts</h4>
                          <p className="text-[11px] text-editorial-sub leading-relaxed font-serif italic">Run a standard production compilation inside your web project. This bundles, optimizes, and compiles all static files into your target directory (`dist/`).</p>
                          <div className="bg-editorial-bg border border-editorial-border p-2 font-mono text-[10px] text-editorial-text relative select-all">
                            npm run build
                          </div>
                        </div>

                        {/* Step 3: Add Platforms */}
                        <div className="border border-editorial-border p-4 bg-editorial-tint space-y-2">
                          <span className="font-mono text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">Step 03 • Platform Targets</span>
                          <h4 className="font-serif font-bold italic text-xs text-editorial-text">Add Android and iOS Layers</h4>
                          <p className="text-[11px] text-editorial-sub leading-relaxed font-serif italic">Install target platform modules, then generate native directories containing real Android Studio and Apple Xcode project configurations.</p>
                          <div className="bg-editorial-bg border border-editorial-border p-2 font-mono text-[10px] text-editorial-text relative select-all">
                            npm i @capacitor/android @capacitor/ios<br/>
                            npx cap add android<br/>
                            npx cap add ios
                          </div>
                        </div>

                        {/* Step 4: Sync & Launch */}
                        <div className="border border-editorial-border p-4 bg-editorial-tint space-y-2">
                          <span className="font-mono text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">Step 04 • Native Compilation</span>
                          <h4 className="font-serif font-bold italic text-xs text-editorial-text">Synchronize & Compile</h4>
                          <p className="text-[11px] text-editorial-sub leading-relaxed font-serif italic">Synchronize latest compiled changes into mobile platforms, then launch Android Studio or Apple Xcode to generate APKs or IPAs instantly with 1-click.</p>
                          <div className="bg-editorial-bg border border-editorial-border p-2 font-mono text-[10px] text-editorial-text relative select-all">
                            npx cap sync<br/>
                            npx cap open android<br/>
                            npx cap open ios
                          </div>
                        </div>
                      </div>

                      <div className="rounded-none border border-amber-200 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900 p-4 space-y-1.5 text-xs text-editorial-text">
                        <h4 className="font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5 text-[10px]">
                          <AlertTriangle className="h-4 w-4" />
                          Flight Checklist for App Store Submissions
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed font-serif italic text-editorial-text/90">
                          <li>Configure standard API base URLs to point to your secure production backend server instead of localhost.</li>
                          <li>Ensure your PWA icon configurations include beautiful high-resolution splash screens for both Apple and Google devices.</li>
                          <li>Use Capacitor's standard offline Storage plugin to securely persist unlocked user resume slots on device flash memory.</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>)}
      </main>

      {/* Secure UPI Checkout Sandbox Payment Simulator Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-none border-2 border-editorial-text bg-white dark:bg-editorial-tint p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.15)] animate-fadeIn">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-editorial-border pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-100 dark:bg-emerald-950/50 p-1.5 border border-emerald-300 dark:border-emerald-800">
                  <Coins className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold italic text-editorial-text">Secure UPI Checkout</h3>
                  <p className="text-[9px] font-mono text-editorial-sub uppercase tracking-wider">ResumePilot Payment Gateway</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!isProcessingPayment) {
                    setShowPaymentModal(false);
                    setSlotToUnlock(null);
                  }
                }}
                disabled={isProcessingPayment}
                className="text-editorial-sub hover:text-editorial-text text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-50"
              >
                [Close]
              </button>
            </div>

            {isProcessingPayment ? (
              /* Payment processing step-loader screen */
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="relative flex h-14 w-14 items-center justify-center">
                  <div className="absolute h-10 w-10 animate-ping bg-emerald-100 dark:bg-emerald-950 rounded-none"></div>
                  <Activity className="h-6 w-6 text-emerald-600 animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-mono font-bold text-editorial-text uppercase tracking-widest">{paymentStep}</p>
                  <p className="text-[10px] text-editorial-sub font-serif italic mt-1">Please do not refresh this page or close this sandbox...</p>
                </div>
              </div>
            ) : (
              /* Payment method selector screen */
              <div className="space-y-4">
                {/* Item Details */}
                <div className="bg-editorial-tint border border-editorial-border p-4 flex justify-between items-center rounded-none">
                  <div>
                    <span className="block text-[9px] font-mono uppercase text-editorial-sub tracking-wider">Purchase Token</span>
                    <span className="font-serif font-bold italic text-editorial-text text-sm">
                      Unlock: {slots.find(s => s.id === slotToUnlock)?.name || "New Resume Slot"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] font-mono uppercase text-editorial-sub tracking-wider">Price</span>
                    <span className="font-mono text-sm font-extrabold text-editorial-text">₹100.00 INR</span>
                  </div>
                </div>

                <p className="text-xs text-editorial-sub font-serif italic leading-relaxed">
                  Select your UPI application or scan the generated sandbox QR code. Unlocking this resume slot grants you **unlimited critiques, edits, and tailoring rewrites** for this document forever with no recurring costs.
                </p>

                {/* Simulated UPI Scan/Pay Grid */}
                <div className="border border-editorial-border bg-white dark:bg-editorial-bg p-4 space-y-4 rounded-none">
                  <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase tracking-widest text-editorial-text border-b border-editorial-border pb-2">
                    <span>Scan Sandbox UPI QR</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Sandbox Active
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center space-y-2.5 py-2.5 bg-editorial-tint border border-editorial-border rounded-none">
                    <div className="p-2 bg-white border border-editorial-border shadow-sm">
                      <svg className="w-24 h-24 text-neutral-850" viewBox="0 0 100 100">
                        {/* Custom QR pattern visual */}
                        <rect x="5" y="5" width="20" height="20" fill="currentColor" />
                        <rect x="10" y="10" width="10" height="10" fill="#fff" />
                        <rect x="12" y="12" width="6" height="6" fill="currentColor" />
                        <rect x="75" y="5" width="20" height="20" fill="currentColor" />
                        <rect x="80" y="10" width="10" height="10" fill="#fff" />
                        <rect x="82" y="12" width="6" height="6" fill="currentColor" />
                        <rect x="5" y="75" width="20" height="20" fill="currentColor" />
                        <rect x="10" y="80" width="10" height="10" fill="#fff" />
                        <rect x="12" y="82" width="6" height="6" fill="currentColor" />
                        <rect x="40" y="40" width="20" height="20" fill="currentColor" />
                        <rect x="45" y="45" width="10" height="10" fill="#fff" />
                        <rect x="35" y="10" width="10" height="10" fill="currentColor" />
                        <rect x="55" y="15" width="10" height="15" fill="currentColor" />
                        <rect x="10" y="45" width="15" height="10" fill="currentColor" />
                        <rect x="45" y="75" width="15" height="15" fill="currentColor" />
                        <rect x="75" y="45" width="15" height="10" fill="currentColor" />
                      </svg>
                    </div>
                    <span className="text-[9px] font-mono text-editorial-sub uppercase tracking-widest text-center px-4 leading-normal">
                      Scan with Google Pay, PhonePe, Paytm, or any BHIM UPI Application
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[8px] font-mono uppercase text-editorial-sub tracking-widest font-bold mb-1">
                        Or specify UPI VPA Address
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. pilot@okhdfcbank"
                        className="w-full rounded-none border border-editorial-border bg-editorial-tint dark:bg-editorial-bg px-3 py-2 text-xs font-mono text-editorial-text focus:outline-none placeholder:text-editorial-sub/50"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      className="flex w-full items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 py-3 text-xs font-mono font-bold uppercase tracking-widest text-white transition-colors rounded-none shadow-sm"
                    >
                      <Check className="h-4 w-4" />
                      Simulate ₹100 payment approval
                    </button>
                  </div>
                </div>

                <div className="text-center text-[9px] font-mono text-editorial-sub uppercase tracking-wider">
                  🔒 Sandbox Merchant UPI Code • SSL Certified Encryption
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Secure Authentication Overlay Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-none border-2 border-editorial-text bg-white dark:bg-editorial-tint p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.15)] animate-fadeIn">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-editorial-border pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-50 dark:bg-indigo-950/40 p-1.5 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold italic text-editorial-text">
                    {authMode === "login" ? "Secure Account Entry" : "Establish Pilot Credentials"}
                  </h3>
                  <p className="text-[9px] font-mono text-editorial-sub uppercase tracking-wider">Uncompromised Cryptographic Safety</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthError(null);
                }}
                disabled={authLoading}
                className="text-editorial-sub hover:text-editorial-text text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-50"
              >
                [Cancel]
              </button>
            </div>

            {authError && (
              <div className="rounded-none border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 dark:border-rose-900 p-3.5 text-rose-800 dark:text-rose-400 font-serif italic text-xs mb-4">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "signup" && (
                <div>
                  <label className="block text-[8px] font-mono uppercase text-editorial-sub tracking-widest font-bold mb-1">
                    Pilot Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FlightCaptain"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
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
                  placeholder="e.g. gnitya2507@gmail.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
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
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full rounded-none border border-editorial-border bg-editorial-tint dark:bg-editorial-bg px-3 py-2 text-xs font-mono text-editorial-text focus:outline-none placeholder:text-editorial-sub/50"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="flex w-full items-center justify-center gap-1.5 bg-editorial-text hover:bg-neutral-800 dark:hover:bg-neutral-200 py-3 text-xs font-mono font-bold uppercase tracking-widest text-editorial-bg transition-colors rounded-none disabled:opacity-50"
              >
                {authLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : authMode === "login" ? (
                  "Unlock Session Deck"
                ) : (
                  "Create Secure Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-y-1/2 left-0 right-0 border-t border-editorial-border"></div>
              <span className="relative bg-white dark:bg-editorial-tint px-3 font-mono text-[8px] text-editorial-sub uppercase tracking-wider">
                Or connect instantly
              </span>
            </div>

            {/* Simulated Google Account integration */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="flex w-full items-center justify-center gap-2 border border-blue-200 dark:border-blue-900 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-900/20 py-3 text-xs font-mono font-bold uppercase tracking-widest text-blue-800 dark:text-blue-400 transition-colors rounded-none disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Sign In with Google Account
            </button>

            {/* Toggle Sign Up / Sign In footer */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-bold hover:underline"
              >
                {authMode === "login" 
                  ? "Don't have an account? Create Credentials" 
                  : "Already registered? Return to Entry Deck"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer Info */}
      <footer className="mt-20 border-t border-editorial-border bg-editorial-bg py-8 print:hidden">
        <div className="mx-auto max-w-7xl px-4 text-center text-[10px] font-mono tracking-wider uppercase text-editorial-sub sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} ResumePilot Flight Analytics. Powered securely with Google Gemini AI.</p>
          <p className="mt-1.5 font-bold text-editorial-text">100% Secure • Completely Private • Editorial Aesthetics</p>
        </div>
      </footer>

    </div>
  );
}
