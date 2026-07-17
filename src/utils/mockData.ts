import { CritiqueResult } from "../types";

export function getMockDemoResult(role: string, level: string, tone: string = "professional"): CritiqueResult {
  const isRoast = tone === "roast";

  const professionalSummary = `Your resume shows a strong foundation in core development skills, but suffers from "passive job-description syndrome." Many bullet points read like daily chore lists rather than quantified business outcomes. For a ${level} looking to stand out as a ${role}, you need to clearly link your technology stack with bottom-line business impacts (such as speed, server latency, users served, or cost reductions). Additionally, we found a few technical formatting risks that might trigger parsing issues in older ATS software.`;

  const roastSummary = `Alright, let's skip the corporate sugar-coating. This resume reads like a checklist of chores you did while trying not to get fired. You've got "React" and "Node" copy-pasted everywhere, but you forgot to mention if any of it actually worked. 'Helped with CSS'? Were you coding or just cheerleading? For a ${level} ${role}, you are getting lost in a sea of identical templates. We need to strip out the fluff, add actual numbers that prove you did something real, and salvage your online footprint before a recruiter dumps your application in the trash bin after 3 seconds.`;

  return {
    score: isRoast ? 54 : 72,
    scores: {
      impact: isRoast ? 48 : 65,
      formatting: isRoast ? 62 : 78,
      brevity: isRoast ? 65 : 82,
      atsScore: isRoast ? 58 : 62,
    },
    summary: isRoast ? roastSummary : professionalSummary,
    strengths: [
      "Excellent tech stack listed including React, Node.js, Express, and SQL.",
      "Clean chronological timeline of roles with clear dates.",
      "Professional layout format that is generally scannable.",
      "Clear contact section at the very top of the page."
    ],
    weaknesses: [
      {
        category: "Quantifying Impact",
        problem: "Bullet point describes actions passively without showing any results or numbers.",
        suggestion: "Use the X-Y-Z formula: 'Accomplished [X], as measured by [Y], by doing [Z]'. Highlight size of user base or team.",
        before: "Worked on a team to build the main website and fixed several bugs.",
        after: "Co-authored and launched 5+ core features on high-traffic client websites using React, resolving 40+ legacy rendering bugs to improve SEO health by 12%."
      },
      {
        category: "Stronger Action Verbs",
        problem: "Began bullet point with passive verbs like 'Worked' or 'Helped', which fail to convey leadership and expertise.",
        suggestion: "Swap passive descriptions for power verbs like 'Optimized', 'Architected', 'Spearheaded', or 'Re-engineered'.",
        before: "Helped with building CSS and HTML pages.",
        after: "Developed 20+ mobile-responsive mockups, converting static Figma layouts into pixel-perfect CSS components."
      },
      {
        category: "Quantifying API Improvements",
        problem: "Mentions improvement in performance but lacks any metric to prove it.",
        suggestion: "Cite speed percentages or round-trip milliseconds. Even an estimate shows you prioritize user latency.",
        before: "Wrote API endpoints and improved standard loading times.",
        after: "Designed 8 server-side REST API endpoints in Express, reducing data payload size to cut endpoint response times by 35%."
      },
      {
        category: "Unquantified Team Support",
        problem: "The statement 'Talked to clients' is too informal and lacks scale.",
        suggestion: "Refuse slang or dry summaries; frame it as gathering technical specifications or managing scope.",
        before: "Talked to clients and did what they asked for in terms of features.",
        after: "Gathered technical requirements directly from 4 high-value business clients, translating stakeholder requests into concrete sprints."
      }
    ],
    atsReport: {
      verdict: isRoast ? "Highly Flawed Layout" : "Needs Improvement",
      issues: [
        "Use of informal double-column layout might cause older parser versions to drop content or merge text erratically.",
        "Your contact section lacks a linked LinkedIn URL or professional portfolio address, which ATS algorithms scan for as a validation signal.",
        "No dedicated 'Certifications' or 'Project Achievements' headings are present, merging valuable portfolio items together."
      ],
      recommendedKeywords: [
        "RESTful APIs",
        "TypeScript",
        "CI/CD Pipelines",
        "Redux Toolkit",
        "AWS (S3, EC2)",
        "SQL / NoSQL",
        "Agile Methodology",
        "Unit Testing (Jest)",
        "Performance Optimization",
        "Docker / Containerization"
      ]
    },
    sectionFeedback: [
      {
        sectionName: "Summary Section",
        rating: isRoast ? "Weak Filler" : "Acceptable",
        detailedFeedback: isRoast
          ? "This is full of clichés. 'Results-oriented' and 'Passionate team player' are verbal carbon-monoxide. Focus on your actual engineering metrics instead."
          : "Your summary is clear and identifies your primary stack. To elevate it further, add your years of active experience or a core achievement (e.g. 'Software Engineer with 2+ years of experience specialized in building low-latency SPAs')."
      },
      {
        sectionName: "Experience Section",
        rating: isRoast ? "Terrible Metrics" : "Needs Rework",
        detailedFeedback: isRoast
          ? "You listed standard job duties. You sound like a manual. We need to see actual accomplishments, what technologies you ran, and the percentage improvements."
          : "This is the most critical part of your resume. Currently, it reads like a list of tasks. Recruiters want to see actions and their direct measurable consequences. Replace passive words with action verbs, and quantify at least 60% of your points with exact metrics (%, $, raw numbers)."
      },
      {
        sectionName: "Skills List",
        rating: "Strong",
        detailedFeedback: "Good keyword optimization. Grouping your skills into sub-categories (e.g., Languages, Frameworks, Tools) will make it even more readable for human reviewers."
      },
      {
        sectionName: "Education & Credentials",
        rating: "Strong",
        detailedFeedback: "Presented cleanly. No action required unless you possess extra specialized credentials or certifications."
      }
    ],
    tailoredRoleTips: isRoast
      ? `For ${role} roles:
1. STOP HIDING: Recruiters want to see links to code (GitHub) and live demos. If you don't have them, you don't exist.
2. DELETE THE JARGON: Nobody cares about 'effective synergy'. Tell us how many active users your app handles.
3. PAGE CRUNCH: Keep this to a single page. If you have less than 5 years of experience, a multi-page resume is a red flag.`
      : `For ${role} roles:
1. Prioritize System Design and Metrics: In senior and mid-level roles, companies care about scale. Mention database sizes, traffic averages, or server up-times.
2. Link Projects to Code: Always include GitHub links or live urls for featured projects. This is standard and highly expected.
3. Keep it Single-Page: Since your experience level is ${level}, aim to fit everything onto a single page to keep information density high.`,
    plagiarismReport: {
      originalityScore: isRoast ? 72 : 84,
      aiContentProbability: isRoast ? 38 : 12,
      copiedBoilerplatePhrases: [
        {
          phrase: "Responsible for writing clean code and fixing bugs.",
          reason: "Classic generic duty-based phrasing that fails to show scope or individual ownership. Appears in over 35% of generic templates.",
          replacement: "Architected modern frontend systems using React and Express, establishing linting and unit testing coverage."
        },
        {
          phrase: "Excellent team player with great communication skills.",
          reason: "An overused buzzword cliché that adds zero analytical proof of collaborative capability.",
          replacement: "Spearheaded a cross-functional squad of 5 engineers and 2 UX designers to launch client web portals."
        },
        {
          phrase: "Results-oriented professional seeking new opportunities.",
          reason: "Extremely generic statement that does not specify your technical edge or tangible results.",
          replacement: "Software developer with a track record of driving a 35% reduction in API response latency."
        }
      ],
      uniquenessVerdict: isRoast ? "Critical Boilerplate Overuse" : "Moderate Template Clichés"
    },
    recruiterScan: {
      wouldShortlist: isRoast ? "No" : "Maybe",
      reasons: [
        "✓ Tech stack covers core requirements (React, Node, SQL).",
        "✓ Formatting follows a structured timeline.",
        "❌ Bullet points are passive and missing business scale metrics.",
        "❌ Missing LinkedIn, GitHub, or Portfolio Links (Huge friction for recruiter validation)."
      ]
    },
    jobDescriptionMatch: {
      foundKeywords: ["React", "Node.js", "Express", "RESTful APIs", "SQL", "JavaScript", "HTML", "CSS"],
      missingKeywords: ["Docker", "AWS (EC2, S3)", "Kubernetes", "TypeScript", "CI/CD Pipelines", "Jest (Unit Testing)"]
    },
    metrics: {
      averageBulletLength: 14,
      actionVerbsCount: 8,
      weakVerbs: ["helped", "assisted", "worked on", "handled"],
      passiveVoiceCount: 3,
      numbersUsedCount: 2,
      readabilityScore: "Intermediate (College Level)"
    },
    portfolioChecker: {
      overallReadiness: 55,
      resumeReadiness: 65,
      githubReadiness: 45,
      linkedinReadiness: 70,
      portfolioReadiness: 30,
      portfolioAdvice: "Your LinkedIn has some good details but is missing a professional banner and targeted headline. Your GitHub consists mostly of un-documented coursework. We highly recommend pinning 2 solid personal React projects with clean READMEs, and launching a simple personal portfolio website containing your active resume and project screenshots."
    },
    interviewPrep: [
      {
        question: `For a ${role} position: "You mentioned building REST API endpoints with Express. How do you handle authentication securely, and how do you protect against common vulnerabilities like CSRF or XSS?"`,
        expectedTopic: "Security best practices in fullstack React/Express applications.",
        suggestedAnswerOutline: "1. Mention JWT (JSON Web Tokens) or session cookies. Explain that JWTs should be stored in HTTP-Only, Secure, SameSite cookies to mitigate XSS and CSRF. 2. Discuss input sanitization and utilizing Helmet.js middlewares in Express to set safe headers. 3. Mention password hashing via bcrypt."
      },
      {
        question: `Based on your experience: "How would you optimize a slow React application that is experiencing rendering lag on complex lists?"`,
        expectedTopic: "React rendering optimization hooks and list virtualization.",
        suggestedAnswerOutline: "1. Mention using React.memo to prevent unnecessary component re-renders. 2. Explain memoizing calculations with useMemo and callback references with useCallback. 3. Discuss virtualizing huge datasets using libraries like react-window or react-virtualized."
      }
    ],
    timeline: [
      {
        year: "2021",
        roleOrMilestone: "Completed B.S. in Computer Science",
        skillsUsed: ["Data Structures", "Algorithms", "Java", "SQL"]
      },
      {
        year: "2022",
        roleOrMilestone: "Joined TechCorp Inc. as Junior Developer",
        skillsUsed: ["HTML/CSS", "JavaScript", "React", "Git"]
      },
      {
        year: "2023 - Present",
        roleOrMilestone: "Promoted to Associate Software Developer",
        skillsUsed: ["React", "Node.js", "Express", "REST APIs", "SQL"]
      }
    ],
    missingNumbersReport: [
      {
        originalBullet: "Worked on frontend pages and improved loading speeds.",
        suggestedMetrics: ["Improved page speeds by 25%", "Refactored 15+ complex components", "Implemented lazy-loading"],
        metricUpgrade: "Refactored 15+ legacy React components and implemented code-splitting/lazy-loading, boosting average page rendering speeds by 25%."
      },
      {
        originalBullet: "Fixed backend bugs and maintained standard Express routing files.",
        suggestedMetrics: ["Resolved 35+ legacy routing bugs", "Wrote 12 unit tests", "Reduced latency by 15%"],
        metricUpgrade: "Resolved 35+ high-priority legacy routing bugs in Express, creating robust integrations and reducing overall API latency by 15%."
      }
    ]
  };
}
