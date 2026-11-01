export interface Role {
    id: string;
    company: string;
    title: string;
    period: string;
    location: string;
    summary: string;
    highlights: string[];
    stack: string[];
}

export const JOURNEY: readonly Role[] = [
    {
        id: "dentobees",
        company: "Dentobees",
        title: "Chief Technology Officer",
        period: "Feb 2026 – Present",
        location: "Kozhikode, India",
        summary: "Leading engineering at an early-stage SaaS startup.",
        highlights: [
            "A multi-product SaaS suite: a WhatsApp AI sales CRM, an ERP and mobile apps",
            "One identity layer across every product, so customers sign in once",
            "Getting ready for international customers: multi-currency, cross-border compliance, data security",
            "I run product demos and onboarding for international customers, and stay on the support line",
            "Two engineers, four paid products in six months, with an in-house software factory doing the execution",
        ],
        stack: ["TypeScript", "Next.js", "NestJS", "Node.js", "React Native", "MongoDB", "Redis", "BullMQ", "Firebase", "AWS", "Docker"],
    },
    {
        id: "exthgen",
        company: "Exthgen",
        title: "Research & Development Engineer",
        period: "Dec 2025 – Feb 2026",
        location: "Kozhikode, India",
        summary: "Research and development on new product directions.",
        highlights: [],
        stack: [],
    },
    {
        id: "independent",
        company: "Independent",
        title: "Product Engineer",
        period: "2025 – 2026",
        location: "Remote",
        summary: "Helping founders start their startups by building their first products.",
        highlights: [
            "Turned founders' ideas into first products: web apps, mobile apps, browser extensions",
            "Understood the business before writing code",
            "Left behind codebases the next engineer could grow",
        ],
        stack: ["React", "Next.js", "TypeScript", "Node.js", "FastAPI", "Python", "PostgreSQL", "AWS", "Docker", "Plasmo"],
    },
    {
        id: "study-medic",
        company: "Study Medic",
        title: "Full-Stack Developer",
        period: "Dec 2023 – Jun 2025",
        location: "Thrissur, India",
        summary: "Built in-house products that automated the company's operational work.",
        highlights: [
            "Owned features end to end, from requirements to production",
            "Turned non-engineering teams' workflows into software",
        ],
        stack: ["React", "Node.js", "Express", "MongoDB", "Firebase", "Vercel"],
    },
    {
        id: "brototype",
        company: "Brototype",
        title: "Full-Stack Developer, Internship",
        period: "Nov 2022 – Dec 2023",
        location: "India",
        summary: "Where it started.",
        highlights: ["Foodbia: a food delivery marketplace with an analytics dashboard", "Hiverr: a freelancing marketplace with payments, chat and video calls"],
        stack: ["Node.js", "Express", "MongoDB", "React", "Redux", "AWS EC2", "Nginx"],
    },
];
