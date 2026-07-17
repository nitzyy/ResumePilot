export interface ScoreBreakdown {
  impact: number;
  formatting: number;
  brevity: number;
  atsScore: number;
}

export interface WeaknessImprovement {
  category: string;
  problem: string;
  suggestion: string;
  before: string;
  after: string;
}

export interface AtsReport {
  verdict: 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical Redo' | string;
  issues: string[];
  recommendedKeywords: string[];
}

export interface SectionFeedback {
  sectionName: string;
  rating: 'Strong' | 'Acceptable' | 'Needs Rework' | string;
  detailedFeedback: string;
}

export interface CopiedBoilerplatePhrase {
  phrase: string;
  reason: string;
  replacement: string;
}

export interface PlagiarismReport {
  originalityScore: number;
  aiContentProbability: number;
  copiedBoilerplatePhrases: CopiedBoilerplatePhrase[];
  uniquenessVerdict: string;
}

export interface RecruiterScan {
  wouldShortlist: 'Yes' | 'Maybe' | 'No' | string;
  reasons: string[];
}

export interface JobDescriptionMatch {
  foundKeywords: string[];
  missingKeywords: string[];
}

export interface MetricsReport {
  averageBulletLength: number;
  actionVerbsCount: number;
  weakVerbs: string[];
  passiveVoiceCount: number;
  numbersUsedCount: number;
  readabilityScore: string;
}

export interface PortfolioChecker {
  overallReadiness: number;
  resumeReadiness: number;
  githubReadiness: number;
  linkedinReadiness: number;
  portfolioReadiness: number;
  portfolioAdvice: string;
}

export interface InterviewPrepQuestion {
  question: string;
  expectedTopic: string;
  suggestedAnswerOutline: string;
}

export interface TimelineEvent {
  year: string;
  roleOrMilestone: string;
  skillsUsed: string[];
}

export interface MissingNumberEvent {
  originalBullet: string;
  suggestedMetrics: string[];
  metricUpgrade: string;
}

export interface CritiqueResult {
  score: number;
  scores: ScoreBreakdown;
  summary: string;
  strengths: string[];
  weaknesses: WeaknessImprovement[];
  atsReport: AtsReport;
  sectionFeedback: SectionFeedback[];
  tailoredRoleTips: string;
  plagiarismReport?: PlagiarismReport;
  recruiterScan?: RecruiterScan;
  jobDescriptionMatch?: JobDescriptionMatch;
  metrics?: MetricsReport;
  portfolioChecker?: PortfolioChecker;
  interviewPrep?: InterviewPrepQuestion[];
  timeline?: TimelineEvent[];
  missingNumbersReport?: MissingNumberEvent[];
  extractedText?: string;
}

export interface ResumeSlot {
  id: string;
  name: string;
  isUnlocked: boolean;
  targetRole: string;
  experienceLevel: string;
  jobDescription: string;
  inputType: "file" | "text";
  resumeText: string;
  selectedFileName: string | null;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  result: CritiqueResult | null;
}

export const TARGET_ROLES = [
  "Software Engineer / Developer",
  "Full-Stack / Frontend / Backend Engineer",
  "DevOps Engineer / SRE / Cloud Architect",
  "Data Scientist / AI Engineer / ML Researcher",
  "Data Analyst / Business Intelligence (BI)",
  "Cybersecurity Analyst / Security Engineer",
  "Mobile App Developer (iOS/Android)",
  "QA Engineer / Test Automation Developer",
  "Product Manager",
  "UI/UX Designer",
  "Graphic / Art Director / Visual Designer",
  "Marketing Manager / Digital Marketer / Brand Strategist",
  "Product Marketing Manager (PMM)",
  "Financial Analyst / Investment Banker / Accountant",
  "Sales Representative / Account Executive / BDR",
  "Customer Success Manager / Support Lead",
  "Business Analyst / Management Consultant",
  "Project Manager / Scrum Master / Program Manager",
  "Human Resources / Recruiter / Talent Acquisition",
  "Operations Manager / Supply Chain Coordinator",
  "Mechanical / Civil / Electrical Engineer",
  "Executive / Director / C-Suite Leader",
  "Copywriter / Content Strategist / Technical Writer",
  "Legal Professional / Compliance Specialist / Attorney",
  "Healthcare Administrator / Nurse / Medical Professional",
  "Academic Researcher / Teacher / Educator",
  "General / General Professional"
];

export const EXPERIENCE_LEVELS = [
  "Intern / Student",
  "Entry-Level / Junior (0-2 years)",
  "Mid-Level (2-5 years)",
  "Senior (5+ years)",
  "Executive / Director"
];

export const MOCK_RESUME_EXAMPLE = `SUMMARY
Motivated Software Engineer with 2 years of experience in writing code. Good at JavaScript, React, and databases. Seeking a role to build websites.

EXPERIENCE
Software Engineer | TechCorp Inc. | 2024 - Present
- Worked on a team to build the main website and fixed several bugs.
- Wrote API endpoints and improved standard loading times.
- Assisted with deploying code to the AWS cloud.

Junior Developer | WebStarts | 2023 - 2024
- Helped with building CSS and HTML pages.
- Talked to clients and did what they asked for in terms of features.
- Attended weekly standups.

EDUCATION
B.S. in Computer Science | State University | 2023

SKILLS
React, Node, Express, MongoDB, HTML, CSS, JavaScript, Git`;
