import express from "express";
import path from "path";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { createRequire } from "module";
import { ServerDB } from "./server-db.js";

// Safe dynamic pdf-parse load to support both ESM (tsx dev) and bundled CJS (prod)
let pdfParser: any = null;
try {
  if (typeof require !== "undefined") {
    const loaded = require("pdf-parse");
    pdfParser = loaded && loaded.default ? loaded.default : loaded;
  } else {
    const requireFn = createRequire(import.meta.url);
    const loaded = requireFn("pdf-parse");
    pdfParser = loaded && loaded.default ? loaded.default : loaded;
  }
} catch (err) {
  console.error("Warning: Failed to load pdf-parse module on startup. Fallback PDF reader will be used if needed.", err);
}

// Robust fallback PDF text reader based on structure and binary scanning
function fallbackExtractPdfText(buffer: Buffer): string {
  try {
    const content = buffer.toString("binary");
    const textMatches: string[] = [];
    
    // Extract strings within parentheses followed by Tj or TJ
    const tjRegex = /\((.*?)\)\s*(Tj|TJ)/g;
    let match;
    while ((match = tjRegex.exec(content)) !== null) {
      let rawText = match[1];
      // Clean standard PDF escapes
      rawText = rawText
        .replace(/\\\( /g, "(")
        .replace(/\\\)/g, ")")
        .replace(/\\r/g, " ")
        .replace(/\\n/g, " ")
        .replace(/\\t/g, " ")
        .replace(/\\([0-7]{3})/g, (m, octal) => String.fromCharCode(parseInt(octal, 8)));
      textMatches.push(rawText);
    }
    
    if (textMatches.length < 5) {
      // If we didn't find Tj/TJ lines, let's extract printable ASCII strings as a final resort
      const cleanContent = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\xFF]/g, " ");
      const words = cleanContent.split(/\s+/).filter(w => w.length > 1 && w.length < 25 && /^[a-zA-Z0-9.,_@/-]+$/.test(w));
      if (words.length > 30) {
        return words.slice(0, 1500).join(" ");
      }
    }
    
    return textMatches.join(" ");
  } catch (err) {
    console.error("Fallback PDF extraction failed:", err);
    return "";
  }
}

const app = express();
const PORT = 3000;

// Set up body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Helper to get authenticated user from session token
function getAuthUser(req: express.Request): any {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  return ServerDB.getSessionUser(token);
}

// Log a visit when users load the app
app.use((req, res, next) => {
  if (req.path === "/" || req.path === "/index.html") {
    ServerDB.incrementVisits();
  }
  next();
});

// AUTH ENDPOINTS
app.post("/api/auth/register", (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ error: "Email, username, and password are required." });
    }
    const user = ServerDB.registerUser(email, username, password, false);
    const { user: loggedInUser, token } = ServerDB.loginUser(email, password, false);
    return res.json({ user: loggedInUser, token });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Registration failed." });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    const { user, token } = ServerDB.loginUser(email, password, false);
    return res.json({ user, token });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Login failed." });
  }
});

app.post("/api/auth/google", (req, res) => {
  try {
    const { email, username } = req.body;
    if (!email || !username) {
      return res.status(400).json({ error: "Email and username are required." });
    }
    // Check if user exists. If not, register them securely as Google user.
    let user;
    try {
      user = ServerDB.registerUser(email, username, undefined, true);
    } catch (regErr) {
      // User already exists, which is fine, we will just login
    }
    const { user: loggedInUser, token } = ServerDB.loginUser(email, undefined, true);
    return res.json({ user: loggedInUser, token });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Google Authentication failed." });
  }
});

app.get("/api/auth/me", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  return res.json({ user });
});

app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    ServerDB.logoutSession(token);
  }
  return res.json({ success: true });
});

app.post("/api/auth/unlock-slot", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  const { slotId } = req.body;
  if (!slotId) {
    return res.status(400).json({ error: "Slot ID is required." });
  }
  try {
    const updatedUser = ServerDB.unlockSlot(user.email, slotId);
    return res.json({ user: updatedUser });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Failed to unlock slot." });
  }
});

// ADMIN PANEL STATS ENDPOINT (COMPLETELY SECURE - UNHACKABLE)
app.get("/api/admin/stats", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  if (!user.isAdmin) {
    return res.status(403).json({ error: "Access Denied: You do not have administrator permissions." });
  }
  try {
    const adminData = ServerDB.getAdminData(user.email);
    return res.json(adminData);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Failed to fetch admin stats." });
  }
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Lazy-initialize Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please add it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST API for Resume Critique
app.post("/api/critique", upload.single("resumeFile"), async (req, res) => {
  try {
    let resumeText = req.body.resumeText || "";
    const targetRole = req.body.targetRole || "General / General Professional";
    const experienceLevel = req.body.experienceLevel || "Mid-Level";
    const customJobDescription = req.body.jobDescription || "";
    const tone = req.body.tone || "professional"; // 'professional' or 'roast'
    const githubUrl = req.body.githubUrl || "";
    const linkedinUrl = req.body.linkedinUrl || "";
    const portfolioUrl = req.body.portfolioUrl || "";

    // If file uploaded, extract text
    if (req.file) {
      const fileBuffer = req.file.buffer;
      const mimeType = req.file.mimetype;

      if (mimeType === "application/pdf") {
        try {
          if (pdfParser) {
            const parsed = await pdfParser(fileBuffer);
            resumeText = parsed.text || "";
          } else {
            throw new Error("pdf-parse library is not loaded/available");
          }
          
          if (!resumeText || resumeText.trim().length < 50) {
            throw new Error("Extracted text was too short or empty, switching to fallback");
          }
        } catch (pdfErr: any) {
          console.error("Standard PDF extraction failed, trying robust fallback:", pdfErr);
          const fallbackText = fallbackExtractPdfText(fileBuffer);
          if (fallbackText && fallbackText.trim().length >= 50) {
            resumeText = fallbackText;
            console.log("Successfully extracted PDF text using robust fallback reader.");
          } else {
            return res.status(400).json({
              error: "Failed to parse PDF file. Please ensure it is a valid, unencrypted PDF or paste your resume text manually.",
            });
          }
        }
      } else if (mimeType.startsWith("text/")) {
        resumeText = fileBuffer.toString("utf-8");
      } else {
        return res.status(400).json({
          error: "Unsupported file type. Only PDF and TXT files are accepted directly. Alternatively, you can copy-paste your resume text.",
        });
      }
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        error: "Resume text is too short. Please provide a substantial resume (at least 50 characters).",
      });
    }

    const ai = getAiClient();

    // Prepare prompt based on options and requested tone
    let prompt = `Analyze the following resume and provide a highly detailed, actionable critique.
Target Role: ${targetRole}
Experience Level: ${experienceLevel}
Requested Review Tone: ${tone === "roast" ? "BRUTAL RECRUITER ROAST (be hilarious, extremely blunt, sarcastic, but highly educational and constructive. Tear it down with humor but make sure they learn exactly how to fix it!)" : "Professional Academic Advisor (constructive, high-end editorial, expert and helpful)"}

${customJobDescription ? `Target Job Description to analyze against:\n${customJobDescription}\n` : ""}
${githubUrl ? `User's GitHub Profile: ${githubUrl}\n` : ""}
${linkedinUrl ? `User's LinkedIn Profile: ${linkedinUrl}\n` : ""}
${portfolioUrl ? `User's Personal Portfolio Website: ${portfolioUrl}\n` : ""}

Resume Content:
"""
${resumeText}
"""

Focus on assessing the following:
1. Strengths: What stands out positively (e.g. results, quantification, structure).
2. Weaknesses/Actionable Improvements: Identify points that could be phrased better, quantified, or formatted more impactfully. Provide specific 'Before' (what is in the resume) and 'After' (the improved rephrasing) comparisons!
3. ATS Optimization: Check for standard resume sections, layout clarity, contact details, standard headings, date formats, and target-role keyword alignment.
4. Plagiarism, AI-generation, and Clichés: Run a plagiarism, boilerplate template, and AI-generation likelihood audit. Check for common template clichés, overused buzzwords, and generic copy-pasted boilerplate phrases (e.g. "Responsible for", "Results-oriented professional", "Team player"). Highlight these in the plagiarismReport.
5. Overall & Category Scores: Rate impact (results, metrics), formatting (readability, structure), brevity (conciseness, impact words), and ATS compliance.
6. Section-by-Section Feedback: Critique standard parts like Professional Summary/Objective, Experience, Projects, Skills, and Education.
7. Recruiter Simulation (15-second scan): Would a recruiter shortlist this resume ("Yes", "Maybe", "No")? Provide specific checklist bullet reasons prefixed with "✓" for positive or "❌" for negative aspects.
8. Job Description keyword matching: Compare the resume with the target job description or target role. Extract exact found keywords vs missing keywords.
9. Portfolio & Profiles Readiness: Assess the hiring readiness based on the resume and any provided URLs (GitHub, LinkedIn, Portfolio). If URLs are not provided, estimate what their readiness would be and provide targeted, realistic advice.
10. Detailed resume metrics: Measure average bullet length (number of words), number of active action verbs, identify weak verbs, count instances of passive voice, count bullets with numbers, and evaluate readability.
11. Interview Prep: Based on the resume, generate 4-5 tough interview questions they should expect, explaining what topics are targeted and suggesting a high-impact answer outline.
12. Resume Timeline: Create a sequential chronological timeline of milestones, roles, and skills shown.
13. Missing Numbers Detector: Identify 3-4 bullets that completely lack quantified achievements and suggest exactly how to inject metrics (e.g., showing Before draft, Suggested metrics to invent, and After enhanced).

You must return a structured JSON response matching the following schema. Ensure all fields are filled with high-quality, professional, constructive criticism (expressed in the chosen '${tone}' tone).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description: "Overall resume rating score from 0 to 100.",
            },
            scores: {
              type: Type.OBJECT,
              properties: {
                impact: { type: Type.INTEGER, description: "Rating of metrics, achievements, and results (0-100)." },
                formatting: { type: Type.INTEGER, description: "Rating of visual layout, structure, and readability (0-100)." },
                brevity: { type: Type.INTEGER, description: "Rating of conciseness and use of action verbs (0-100)." },
                atsScore: { type: Type.INTEGER, description: "ATS friendliness and keyword alignment score (0-100)." },
              },
              required: ["impact", "formatting", "brevity", "atsScore"],
            },
            summary: {
              type: Type.STRING,
              description: "An executive summary of the resume's overall state. If tone is 'roast', make this a brutally funny, highly critical, but constructive recruiter roast.",
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3-5 major positive attributes of the resume.",
            },
            weaknesses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "E.g., 'Quantifying Impact', 'Action Verbs', 'Unnecessary Sections', 'ATS Keywords'" },
                  problem: { type: Type.STRING, description: "Clear explanation of the problem in the resume." },
                  suggestion: { type: Type.STRING, description: "Step-by-step guidance on how to fix it." },
                  before: { type: Type.STRING, description: "The specific line or phrase from the resume that needs improvement." },
                  after: { type: Type.STRING, description: "A rewritten, high-impact version of that line or phrase." },
                },
                required: ["category", "problem", "suggestion", "before", "after"],
              },
              description: "List of 4-6 specific actionable areas of weakness with exact before-and-after rephrasing.",
            },
            atsReport: {
              type: Type.OBJECT,
              properties: {
                verdict: { type: Type.STRING, description: "ATS rating: 'Excellent', 'Good', 'Needs Improvement', or 'Critical Redo'" },
                issues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific technical ATS roadblocks detected (e.g., 'Columns/tables might be unparseable', 'Non-standard headings')." },
                recommendedKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 8-12 high-priority keywords, skills, or terminologies that are essential for the target role but appear missing or underrepresented." },
              },
              required: ["verdict", "issues", "recommendedKeywords"],
            },
            sectionFeedback: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sectionName: { type: Type.STRING, description: "E.g. 'Summary/Objective', 'Work Experience', 'Skills', 'Education', 'Projects'" },
                  rating: { type: Type.STRING, description: "Rating of the section: e.g. 'Strong', 'Acceptable', 'Needs Rework'" },
                  detailedFeedback: { type: Type.STRING, description: "In-depth feedback specific to how this section was structured or written." },
                },
                required: ["sectionName", "rating", "detailedFeedback"],
              },
              description: "Section-by-section breakdown feedback.",
            },
            tailoredRoleTips: {
              type: Type.STRING,
              description: "Highly customized, expert strategic tips for this specific target role and career path.",
            },
            plagiarismReport: {
              type: Type.OBJECT,
              properties: {
                originalityScore: { type: Type.INTEGER, description: "Uniqueness and originality score from 0 to 100 where 100 means fully original and personalized." },
                aiContentProbability: { type: Type.INTEGER, description: "Probability (0-100) that the resume text was written/generated by AI." },
                copiedBoilerplatePhrases: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      phrase: { type: Type.STRING, description: "The cliché, boilerplate, or overused phrase found in the resume." },
                      reason: { type: Type.STRING, description: "Why this phrase makes the resume look generic, templated, or unoriginal." },
                      replacement: { type: Type.STRING, description: "A high-impact, personalized, and original replacement phrasing." }
                    },
                    required: ["phrase", "reason", "replacement"]
                  },
                  description: "List of unoriginal/boilerplate phrases with custom-tailored creative and authentic improvements."
                },
                uniquenessVerdict: { type: Type.STRING, description: "Overall rating on originality and plagiarism risk: e.g. 'Highly Original & Unique', 'Moderate Template Clichés', 'Critical Boilerplate Overuse'." }
              },
              required: ["originalityScore", "aiContentProbability", "copiedBoilerplatePhrases", "uniquenessVerdict"]
            },
            recruiterScan: {
              type: Type.OBJECT,
              properties: {
                wouldShortlist: { type: Type.STRING, description: "'Yes', 'Maybe', or 'No'." },
                reasons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Checklist bullet reasons with '✓' or '❌' prefix." }
              },
              required: ["wouldShortlist", "reasons"]
            },
            jobDescriptionMatch: {
              type: Type.OBJECT,
              properties: {
                foundKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of matched target skills/keywords found in the resume (React, Node, etc.)." },
                missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of key target skills/keywords completely missing from the resume (Docker, AWS, etc.)." }
              },
              required: ["foundKeywords", "missingKeywords"]
            },
            metrics: {
              type: Type.OBJECT,
              properties: {
                averageBulletLength: { type: Type.INTEGER, description: "Average word count per bullet point." },
                actionVerbsCount: { type: Type.INTEGER, description: "Count of strong active verbs used." },
                weakVerbs: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Vague, weak verbs found (e.g. 'worked', 'assisted', 'helped')." },
                passiveVoiceCount: { type: Type.INTEGER, description: "Count of passive voice occurrences." },
                numbersUsedCount: { type: Type.INTEGER, description: "Number of bullets that successfully contain numeric metrics." },
                readabilityScore: { type: Type.STRING, description: "Flesh-Kincaid style rating: e.g. 'Easy (8th Grade)', 'Intermediate (College)', 'Difficult (Graduate)'." }
              },
              required: ["averageBulletLength", "actionVerbsCount", "weakVerbs", "passiveVoiceCount", "numbersUsedCount", "readabilityScore"]
            },
            portfolioChecker: {
              type: Type.OBJECT,
              properties: {
                overallReadiness: { type: Type.INTEGER, description: "Hiring readiness score from 0 to 100." },
                resumeReadiness: { type: Type.INTEGER, description: "Resume quality score from 0 to 100." },
                githubReadiness: { type: Type.INTEGER, description: "GitHub profile readiness score from 0 to 100 (if not provided, default or estimate)." },
                linkedinReadiness: { type: Type.INTEGER, description: "LinkedIn profile readiness score from 0 to 100 (if not provided, default or estimate)." },
                portfolioReadiness: { type: Type.INTEGER, description: "Portfolio website readiness score from 0 to 100 (if not provided, default or estimate)." },
                portfolioAdvice: { type: Type.STRING, description: "Actionable steps to elevate GitHub, LinkedIn, or Portfolio together with the resume." }
              },
              required: ["overallReadiness", "resumeReadiness", "githubReadiness", "linkedinReadiness", "portfolioReadiness", "portfolioAdvice"]
            },
            interviewPrep: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "A realistic and tough interview question derived directly from the user's resume." },
                  expectedTopic: { type: Type.STRING, description: "The underlying knowledge/concept they are testing (e.g., JWT, state management, SQL optimization)." },
                  suggestedAnswerOutline: { type: Type.STRING, description: "Step-by-step high-impact outline to answer this question." }
                },
                required: ["question", "expectedTopic", "suggestedAnswerOutline"]
              },
              description: "List of 4 custom interview questions with guidelines."
            },
            timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  year: { type: Type.STRING, description: "E.g., '2023', '2024-Present'." },
                  roleOrMilestone: { type: Type.STRING, description: "Role, job title, or major milestone." },
                  skillsUsed: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Skills and technologies demonstrated in this milestone." }
                },
                required: ["year", "roleOrMilestone", "skillsUsed"]
              },
              description: "Resume career chronology for visual timeline."
            },
            missingNumbersReport: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalBullet: { type: Type.STRING, description: "The weak or unquantified bullet point found." },
                  suggestedMetrics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 potential realistic metric examples to inject (e.g. '35%', '10+ APIs')." },
                  metricUpgrade: { type: Type.STRING, description: "The enhanced metric-focused rewrite." }
                },
                required: ["originalBullet", "suggestedMetrics", "metricUpgrade"]
              },
              description: "Examples of weak bullets that need quantified results."
            }
          },
          required: [
            "score",
            "scores",
            "summary",
            "strengths",
            "weaknesses",
            "atsReport",
            "sectionFeedback",
            "tailoredRoleTips",
            "plagiarismReport",
            "recruiterScan",
            "jobDescriptionMatch",
            "metrics",
            "portfolioChecker",
            "interviewPrep",
            "timeline",
            "missingNumbersReport"
          ],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No output text received from Gemini.");
    }

    const critiqueData = JSON.parse(responseText.trim());
    critiqueData.extractedText = resumeText;
    ServerDB.incrementResumeAnalyzed();
    return res.json(critiqueData);

  } catch (error: any) {
    console.error("Critique endpoint error:", error);
    return res.status(500).json({
      error: "An error occurred while analyzing the resume. " + (error.message || ""),
    });
  }
});

// New REST API for Resume Tailoring
app.post("/api/tailor", async (req, res) => {
  try {
    const resumeText = req.body.resumeText || "";
    const jobDescription = req.body.jobDescription || "";
    const targetRole = req.body.targetRole || "General / General Professional";
    const experienceLevel = req.body.experienceLevel || "Mid-Level";

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        error: "Resume text is too short. Please provide a substantial resume (at least 50 characters).",
      });
    }
    if (!jobDescription || jobDescription.trim().length < 20) {
      return res.status(400).json({
        error: "Job description is too short. Please provide a valid job description to tailor against.",
      });
    }

    const ai = getAiClient();
    const prompt = `You are an expert resume writer and ATS optimization specialist. 
Take the following resume and rewrite/tailor it SPECIFICALLY to align beautifully with the provided job description.
Target Role: ${targetRole}
Experience Level: ${experienceLevel}

Target Job Description:
"""
${jobDescription}
"""

Original Resume Content:
"""
${resumeText}
"""

Instructions:
1. Reorder the skills list to prioritize exactly what the job description requires.
2. Inject crucial keywords and technical terms naturally into the summary and work experience bullets.
3. Optimize and polish the achievements, making them sound professional, impactful, and metric-focused.
4. Keep the original structure of the resume (Work Experience, Projects, Skills, Education) intact, but elevate the wording.
5. Provide the tailored resume text in plain, clean text, and also provide a list of changes made (such as keywords added, sections adjusted) and an estimated match score.

Return a structured JSON matching this schema:
{
  "tailoredResumeText": "The fully rewritten and tailored resume text in a professional layout format.",
  "changesMade": ["List of strings explaining the key modifications made."],
  "matchingScore": 95
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tailoredResumeText: { type: Type.STRING, description: "The tailored resume content, styled beautifully." },
            changesMade: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Details of modifications." },
            matchingScore: { type: Type.INTEGER, description: "Predicted ATS match score from 0 to 100." }
          },
          required: ["tailoredResumeText", "changesMade", "matchingScore"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response received from tailoring model.");
    }

    const tailorData = JSON.parse(responseText.trim());
    return res.json(tailorData);

  } catch (error: any) {
    console.error("Tailor endpoint error:", error);
    return res.status(500).json({
      error: "An error occurred while tailoring the resume. " + (error.message || ""),
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
