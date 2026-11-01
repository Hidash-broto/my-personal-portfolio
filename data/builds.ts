import { AGENTVIEW_URL, SALESTRACK_URL } from "./links";

export interface Build {
    id: string;
    name: string;
    tagline: string;
    type: string;
    status?: string;
    link?: { label: string; href: string };
    whatItDoes: string[];
    underTheHood: string[];
    stack: string[];
    archived?: boolean;
}

export const BUILDS: readonly Build[] = [
    {
        id: "whatsapp-crm",
        name: "WhatsApp AI Sales CRM",
        tagline: "Every lead, tracked — from the first WhatsApp message to the closed deal.",
        type: "Multi-tenant SaaS",
        status: "In production, used by businesses across industries",
        link: { label: "Visit salestrack.in", href: SALESTRACK_URL },
        whatItDoes: [
            "One shared WhatsApp inbox for the whole sales team",
            "An AI agent that replies to and qualifies leads around the clock",
            "Leads captured straight from Meta ad campaigns",
            "Pipelines, follow-ups, reminders and team assignment",
            "Broadcasts and approved message templates at scale",
        ],
        underTheHood: [
            "WhatsApp traffic runs in its own worker process, isolated from the API",
            "A queue between API and worker absorbs spikes and isolates faults",
            "Webhook ingress verifies, de-duplicates, enqueues and answers in under 50ms",
            "Idempotent sends and a fleet-wide rate limit",
        ],
        stack: ["Next.js", "NestJS", "MongoDB", "Redis", "BullMQ"],
    },
    {
        id: "saas-suite",
        name: "Multi-Product SaaS Suite",
        tagline: "A CRM, an ERP and mobile apps that feel like one product.",
        type: "Platform",
        whatItDoes: ["Sign in once, use every product", "Ready for global customers: multi-currency, compliance, data security"],
        underTheHood: [
            "One central identity provider; each app exchanges it for its own short-lived session",
            "Authorization stays local to each app, so products evolve independently",
            "Rotating refresh tokens with reuse detection",
        ],
        stack: ["Next.js", "NestJS", "React Native", "Expo", "MongoDB", "Firebase Auth", "AWS"],
    },
    {
        id: "software-factory",
        name: "Software Factory",
        tagline: "I make the decisions. It does the building.",
        type: "Internal engineering platform",
        whatItDoes: [
            "Read-only agents map the codebase for a feature",
            "Every real decision comes to me, up front, in one session",
            "A critic red-teams the plan; holdout test scenarios are written",
            "The build runs in a Docker sandbox and is verified in Chrome against scenarios the builder never saw",
            "Pull requests open; I review and merge",
        ],
        underTheHood: [
            "Secrets live in the macOS Keychain, never in git",
            "Known failures on the base branch are recorded, so only new breakage blocks a build",
            "If the builder needs me, the run pauses and pings me on Slack",
        ],
        stack: ["TypeScript", "Node.js", "Docker", "launchd", "Claude Code", "GitHub", "Slack"],
    },
    {
        id: "agentview",
        name: "agentview",
        tagline: "Nothing tells you an agent has been waiting on you for 26 hours. This does.",
        type: "Open-source developer tool (macOS)",
        link: { label: "View on GitHub", href: AGENTVIEW_URL },
        whatItDoes: [
            "Lists every coding session waiting on you, longest wait first",
            "Shows what each one is stuck on",
            "Re-reminds at 30 minutes, 2 hours, 8 hours and one day, then goes quiet",
        ],
        underTheHood: ["Read-only. Sends nothing anywhere. No tracking."],
        stack: ["TypeScript", "Bun"],
    },
    {
        id: "ship-from-phone",
        name: "Ship-From-Phone Bot",
        tagline: "Message a Telegram bot, get a commit.",
        type: "Developer tool",
        whatItDoes: ["A Telegram message hits an Express webhook", "A coding agent runs headless in the repo", "Changes are committed and summarized back"],
        underTheHood: ["Production does not wait until you are back at your desk."],
        stack: ["Node.js", "Express", "Telegram Bot API", "Claude Code"],
    },
    {
        id: "hiverr-ai",
        name: "Hiverr AI",
        tagline: "A personal assistant that manages tasks through conversation.",
        type: "Cross-platform mobile app",
        whatItDoes: ["Ask mode and an Agent mode that acts inside the app", "Voice input", "Event-driven background workflows"],
        underTheHood: [],
        stack: ["React Native", "Expo", "Node.js", "Inngest", "Gemini", "LangChain"],
    },
    {
        id: "hiverr",
        name: "Hiverr",
        tagline: "Freelancing marketplace with payments, chat and video calls.",
        type: "Early build",
        whatItDoes: ["Job posts, Razorpay payments, real-time chat, video calls and screen sharing"],
        underTheHood: [],
        stack: ["React", "Redux", "Node.js", "Express", "MongoDB"],
        archived: true,
    },
    {
        id: "foodbia",
        name: "Foodbia",
        tagline: "Food delivery marketplace with an analytics dashboard.",
        type: "Early build",
        whatItDoes: ["Ordering, OTP verification, cart, coupons and an admin dashboard"],
        underTheHood: ["Deployed on AWS EC2 behind Nginx"],
        stack: ["Node.js", "Express", "MongoDB", "EJS"],
        archived: true,
    },
];
