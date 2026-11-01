export interface FileItem {
  name: string;
  language: string;
  content: string;
}

export interface Category {
  title: string;
  icon: string;
  files: FileItem[];
  defaultFile: string;
}

export const LINKEDIN_URL = "https://www.linkedin.com/in/muhammed-hidash-74144a228/";
export const GITHUB_URL = "https://github.com/Hidash-broto";
export const INSTAGRAM_URL = "https://www.instagram.com/hidashtechtalks/";
export const EMAIL = "hidash920@gmail.com";
export const SITE_URL = "https://hidash.in";

export const portfolioContent: Record<string, Category> = {
  experience: {
    title: "Journey",
    icon: "Briefcase",
    files: [
      {
        name: "dentobees_cto.tsx",
        language: "typescript",
        content: `/**
 * Dentobees · Chief Technology Officer
 * Feb 2026 – Present · Kozhikode, India
 *
 * Leading engineering at an early-stage SaaS startup.
 */

const role = {
  company: "Dentobees",
  title: "Chief Technology Officer",
  period: "Feb 2026 – Present",

  building: [
    "A multi-product SaaS suite: a WhatsApp AI sales CRM, an ERP and mobile apps",
    "One identity layer across every product, so customers sign in once",
    "Infrastructure that scales with load, without trading away latency or uptime",
  ],

  goingGlobal: [
    "International customers found us before we marketed to them",
    "Multi-currency billing",
    "Cross-border compliance and data security",
    "Architecture ready for global load",
  ],

  closeToTheCustomer: [
    "I run product demos and onboarding for international customers",
    "I stay on the support line, because that is where the real roadmap lives",
  ],

  howWeShip: \`
    Two engineers, four paid products in six months.
    An in-house software factory takes care of execution,
    so our time goes to decisions, design and customers.
  \`,

  stack: [
    "TypeScript", "Next.js", "NestJS", "Node.js", "React Native",
    "MongoDB", "Redis", "BullMQ", "Firebase", "AWS", "Docker",
  ],
};

export default role;`
      },
      {
        name: "exthgen.tsx",
        language: "typescript",
        content: `/**
 * Exthgen · Research & Development Engineer
 * Dec 2025 – Feb 2026 · Kozhikode, India
 */

const role = {
  company: "Exthgen",
  title: "Research & Development Engineer",
  period: "Dec 2025 – Feb 2026",
  focus: "Research and development on new product directions",
};

export default role;`
      },
      {
        name: "independent.tsx",
        language: "typescript",
        content: `/**
 * Independent · Product Engineer
 * 2025 – 2026 · Remote
 *
 * Helping founders start their startups by building for them.
 */

const role = {
  title: "Independent Product Engineer",
  period: "2025 – 2026",

  whatIDid: \`
    Partnered with early-stage founders to turn their ideas
    into first products: web apps, mobile apps, browser
    extensions and the infrastructure behind them.
  \`,

  approach: [
    "Understand the business before writing code",
    "Ship a first version founders can put in front of customers",
    "Leave behind a codebase the next engineer can grow",
  ],

  stack: [
    "React", "Next.js", "TypeScript", "Node.js", "FastAPI", "Python",
    "PostgreSQL", "AWS", "Docker", "Plasmo (browser extensions)",
  ],
};

export default role;`
      },
      {
        name: "study_medic.tsx",
        language: "typescript",
        content: `/**
 * Study Medic · Full-Stack Developer
 * Dec 2023 – Jun 2025 · Thrissur, India
 */

const role = {
  company: "Study Medic",
  title: "Full-Stack Developer",
  period: "Dec 2023 – Jun 2025",

  whatIDid: [
    "Built in-house products that automated the company's operational work",
    "Owned features end to end, from requirements to production",
    "Worked with non-engineering teams to turn their workflows into software",
  ],

  stack: ["React", "Node.js", "Express", "MongoDB", "Firebase", "Vercel"],
};

export default role;`
      },
      {
        name: "brototype.tsx",
        language: "typescript",
        content: `/**
 * Brototype · Full-Stack Developer (Internship)
 * Nov 2022 – Dec 2023
 *
 * Where it started.
 */

const role = {
  company: "Brototype",
  title: "Full-Stack Developer, Internship",
  period: "Nov 2022 – Dec 2023",

  firstBuilds: [
    "Foodbia: a food delivery marketplace with an admin and analytics dashboard",
    "Hiverr: a freelancing marketplace with payments, chat and video calls",
  ],

  stack: ["Node.js", "Express", "MongoDB", "React", "Redux", "AWS EC2", "Nginx"],
};

export default role;`
      }
    ],
    defaultFile: "dentobees_cto.tsx"
  },

  projects: {
    title: "Builds",
    icon: "FolderGit2",
    files: [
      {
        name: "whatsapp_ai_sales_crm.tsx",
        language: "typescript",
        content: `/**
 * WhatsApp AI Sales CRM
 * https://salestrack.in
 *
 * Every lead, tracked — from the first WhatsApp message to the closed deal.
 */

const build = {
  name: "WhatsApp AI Sales CRM",
  link: "https://salestrack.in",
  type: "Multi-tenant SaaS",
  status: "In production, used by businesses across industries",

  whatItDoes: [
    "One shared WhatsApp inbox for the whole sales team",
    "An AI agent that replies to and qualifies leads around the clock",
    "Leads captured straight from Meta ad campaigns",
    "Pipelines, follow-ups, reminders and team assignment",
    "Broadcasts and approved message templates at scale",
    "Integrations: Google Sheets, Zoho, Razorpay, Zapier, webhooks",
  ],

  underTheHood: {
    stack: ["Next.js", "NestJS", "MongoDB", "Redis", "BullMQ"],
    decisions: [
      "WhatsApp traffic runs in its own worker process, isolated from the API",
      "The queue is the contract between API and worker: backpressure and fault isolation for spiky fan-out",
      "Webhook ingress verifies, de-duplicates, enqueues and answers in under 50ms",
      "Idempotent sends and a fleet-wide, Redis-enforced rate limit",
    ],
  },
};

export default build;`
      },
      {
        name: "saas_suite_platform.tsx",
        language: "typescript",
        content: `/**
 * Multi-Product SaaS Suite
 *
 * A CRM, an ERP and mobile apps that feel like one product.
 */

const build = {
  name: "Multi-Product SaaS Suite",
  products: ["WhatsApp AI Sales CRM", "ERP", "Customer mobile app", "Consultation app"],

  identity: {
    idea: "Sign in once, use every product",
    design: [
      "One central identity provider for the whole suite",
      "Each app exchanges that identity for its own short-lived session",
      "Authorization stays local to each app, so products evolve independently",
      "Rotating refresh tokens with reuse detection",
    ],
  },

  scale: [
    "Going global: multi-currency, cross-border compliance, data security",
    "Scaling to more customers without touching latency or uptime",
  ],

  stack: ["Next.js", "NestJS", "Node.js", "React Native", "Expo", "MongoDB", "Firebase Auth", "AWS"],
};

export default build;`
      },
      {
        name: "software_factory.tsx",
        language: "typescript",
        content: `/**
 * Software Factory
 * Runs on my Mac.
 *
 * I make the decisions. It does the building.
 */

const build = {
  name: "Software Factory",
  type: "Internal engineering platform",

  howARunFlows: [
    "1. Discovery: read-only agents map the backend and frontend for a feature",
    "2. Interview: every real decision comes to me, up front, in one session",
    "3. A critic red-teams the plan until a builder would not need to guess",
    "4. Freeze: the contract is locked and holdout test scenarios are written",
    "5. Build: backend and frontend are built inside a Docker sandbox",
    "6. Verify: the result is tested in Chrome against scenarios the builder never saw",
    "7. Ship: pull requests are opened. I review and merge.",
  ],

  safeguards: [
    "Secrets live in the macOS Keychain, never in git",
    "Known failures on the base branch are recorded, so only new breakage blocks a build",
    "If the builder needs me, the run pauses and pings me on Slack",
  ],

  stack: ["TypeScript", "Node.js", "Docker", "launchd", "Claude Code", "GitHub", "Slack"],
};

export default build;`
      },
      {
        name: "agentview.tsx",
        language: "typescript",
        content: `/**
 * agentview — open source
 * https://github.com/Hidash-broto/agent_view
 *
 * Nothing tells you an agent has been waiting on you for 26 hours. This does.
 */

const build = {
  name: "agentview",
  link: "https://github.com/Hidash-broto/agent_view",
  type: "Open-source developer tool (macOS)",

  problem: \`
    Notifiers alert you once, at the moment a coding session blocks.
    Miss that moment and nothing ever raises it again.
    One of my sessions waited 41 hours before I noticed.
  \`,

  whatItDoes: [
    "Lists every session waiting on you, longest wait first",
    "Shows what each one is stuck on: the last question and the last answer",
    "Re-reminds at 30 minutes, 2 hours, 8 hours and one day, then goes quiet",
    "Read-only. Sends nothing anywhere. No tracking.",
  ],

  stack: ["TypeScript", "Bun"],
};

export default build;`
      },
      {
        name: "ship_from_phone_bot.js",
        language: "javascript",
        content: `/**
 * Ship-From-Phone Bot
 *
 * Message a Telegram bot, get a commit.
 */

const build = {
  name: "Ship-From-Phone Bot",
  type: "Developer tool",

  flow: [
    "A Telegram message hits an Express webhook",
    "A coding agent runs headless inside the target repository",
    "Changes are committed through git",
    "A summary is sent back to the chat",
  ],

  why: "Production does not wait until you are back at your desk.",

  stack: ["Node.js", "Express", "Telegram Bot API", "Claude Code", "simple-git"],
};

module.exports = build;`
      },
      {
        name: "hiverr_ai.tsx",
        language: "typescript",
        content: `/**
 * Hiverr AI
 * Personal assistant app
 */

const build = {
  name: "Hiverr AI",
  type: "Cross-platform mobile app",

  whatItDoes: [
    "Manages tasks and events through conversation",
    "Ask mode for quick answers, Agent mode that acts inside the app",
    "Voice input for hands-free use",
    "Event-driven background workflows",
  ],

  stack: {
    mobile: ["React Native", "Expo"],
    backend: ["Node.js", "Inngest"],
    ai: ["Gemini", "Gemma", "LangChain"],
  },
};

export default build;`
      },
      {
        name: "early_builds.md",
        language: "markdown",
        content: `# Early builds

The products that taught me how software meets real users.

## Hiverr — freelancing marketplace
Job posts, Razorpay payments, real-time chat (Socket.IO), video calls and
screen sharing (Agora), JWT auth, email notifications.
*React, Redux, Node.js, Express, MongoDB*

## Hiverr Meet — video conferencing
Multi-participant video, screen sharing and group chat in the browser.
*JavaScript, WebRTC, Agora Web SDK*

## Foodbia — food delivery marketplace
Ordering, OTP verification, cart, wishlist, coupons, and an admin dashboard
with sales analytics. Deployed on AWS EC2 behind Nginx.
*Node.js, Express, MongoDB, EJS*
`
      }
    ],
    defaultFile: "whatsapp_ai_sales_crm.tsx"
  },

  about: {
    title: "About",
    icon: "User",
    files: [
      {
        name: "README.md",
        language: "markdown",
        content: `# Muhammed Hidash

**Startup builder. Tech by craft, business by curiosity.**

Engineer at heart, product builder by choice. CTO at Dentobees.

## What I do

I lead engineering at Dentobees, an early-stage SaaS startup. I design the
systems, ship the products, and sit in on the demos, onboarding calls and
support threads that tell us what to build next.

## Why startups

Small teams. Real customers. No layers between a decision and the product.
I would rather build something new than maintain something big, and I like
the whole game: the product, the customer, and how it reaches them.

## How I work

- **Fundamentals first.** World-class products need computer science and
  design depth. Tools change every month; fundamentals don't.
- **Execution is cheap now. Judgment isn't.** AI handles more of the
  building every year. Taste and a clear vision are still the job.
- **Validated, not vibed.** Speed only counts if it survives production.
- **Stay close to the customer.** The best roadmap is a support inbox.

## Outside work

Football, the gym every morning, and the occasional psychology paper that
ends up changing how I work.

## Writing

I write about building startups and software → [hidash.in/blog](https://hidash.in/blog)
`
      },
      {
        name: "skills.json",
        language: "json",
        content: `{
  "engineering": {
    "languages": ["TypeScript", "JavaScript", "Python"],
    "frontend": ["React", "Next.js", "React Native", "Expo", "Tailwind CSS"],
    "backend": ["Node.js", "NestJS", "Express", "FastAPI"],
    "data": ["MongoDB", "PostgreSQL", "Redis"],
    "queues_and_messaging": ["BullMQ", "Webhooks", "WhatsApp Business API"],
    "infrastructure": ["AWS", "Docker", "Nginx", "Vercel", "GitHub Actions"],
    "applied_ai": ["LLM integration", "Vision pipelines", "Agent workflows", "LangChain"]
  },
  "systems": [
    "Multi-tenant SaaS",
    "Identity and single sign-on",
    "Event-driven architecture",
    "Rate limiting and idempotency",
    "Scaling without downtime"
  ],
  "beyond_code": [
    "Product thinking",
    "UI/UX design",
    "Customer demos and onboarding",
    "Customer support"
  ]
}`
      }
    ],
    defaultFile: "README.md"
  },

  beliefs: {
    title: "Beliefs",
    icon: "Compass",
    files: [
      {
        name: "beliefs.md",
        language: "markdown",
        content: `# Beliefs

## 1. Fundamentals first
Beautiful products are built on computer science and design fundamentals.
AI can write the code; it cannot tell you which architecture will still
hold up a year from now.

## 2. Execution is cheap. Taste and vision aren't.
Agents take more of the execution every month. What is left for humans is
the hardest part: knowing what to build, and what good looks like.
→ hidash.in/blog/engineering-moat-judgment-and-taste

## 3. Validated, not vibed
The "vibe" is a suggestion. Validation is where the engineering happens.
A system generated in five minutes that takes five days to debug is a loss.
→ hidash.in/blog/velocity-is-a-lie-technical-debt

## 4. Adapt or vanish
Nature did not save the biggest or the strongest. It saved the ones who
could adapt. AI is just the latest asteroid.
→ hidash.in/blog/adapt-or-vanish

## 5. Anyone can build a company now
With taste and real domain knowledge, a very small team, sometimes one
person, can build what used to take a hundred.

## 6. Stay close to the customer
I do demos, onboarding and support myself. That is where the next
feature, and the next product, comes from.
→ hidash.in/blog/demand-before-roadmap
`
      }
    ],
    defaultFile: "beliefs.md"
  },

  contact: {
    title: "Say Hi",
    icon: "Mail",
    files: [
      {
        name: "say_hi.tsx",
        language: "typescript",
        content: `/**
 * Say hi
 * The best place to reach me is LinkedIn.
 */

const sayHi = {
  start: {
    channel: "LinkedIn",
    url: "${LINKEDIN_URL}",
    note: "Send a message. I read every one.",
  },

  talkToMeAbout: [
    "Startups: ideas, products and building from zero",
    "Advising early teams on tech and product decisions",
    "Speaking and podcasts",
  ],

  elsewhere: {
    email: "${EMAIL}",
    github: "${GITHUB_URL}",
    instagram: "@hidashtechtalks",
    blog: "${SITE_URL}/blog",
  },
};

export default sayHi;`
      }
    ],
    defaultFile: "say_hi.tsx"
  }
};

export const getLanguageFromFilename = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    'tsx': 'typescript',
    'ts': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'py': 'python',
    'json': 'json',
    'md': 'markdown',
  };
  return languageMap[ext || ''] || 'plaintext';
};
