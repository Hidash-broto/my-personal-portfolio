export const PROFILE = {
    name: "Muhammed Hidash",
    role: "CTO @ Dentobees",
    headline: "Startup builder. Tech by craft, business by curiosity.",
    subline: "Engineer at heart, product builder by choice.",
    about: [
        "I lead engineering at Dentobees, an early-stage SaaS startup. I design the systems, ship the products, and sit in on the demos, onboarding calls and support threads that tell us what to build next.",
        "Small teams. Real customers. No layers between a decision and the product. I would rather build something new than maintain something big.",
    ],
    outsideWork: "Football, the gym every morning, and the occasional psychology paper that ends up changing how I work.",
    sayHiTopics: [
        "Startups: ideas, products and building from zero",
        "Advising early teams on tech and product decisions",
        "Speaking and podcasts",
    ],
} as const;

export interface Belief {
    id: string;
    title: string;
    body: string;
    link?: { label: string; href: string };
}

export const BELIEFS: readonly Belief[] = [
    { id: "fundamentals", title: "Fundamentals first", body: "Beautiful products are built on computer science and design fundamentals. AI can write the code; it cannot tell you which architecture will still hold up a year from now." },
    { id: "taste", title: "Execution is cheap. Taste and vision aren't.", body: "Agents take more of the execution every month. What is left for humans is the hardest part: knowing what to build, and what good looks like.", link: { label: "Read the note", href: "/blog/engineering-moat-judgment-and-taste" } },
    { id: "validated", title: "Validated, not vibed", body: "The vibe is a suggestion. Validation is where the engineering happens.", link: { label: "Read the note", href: "/blog/velocity-is-a-lie-technical-debt" } },
    { id: "adapt", title: "Adapt or vanish", body: "Nature did not save the biggest or the strongest. It saved the ones who could adapt. AI is just the latest asteroid.", link: { label: "Read the note", href: "/blog/adapt-or-vanish" } },
    { id: "anyone", title: "Anyone can build a company now", body: "With taste and real domain knowledge, a very small team can build what used to take a hundred." },
    { id: "customer", title: "Stay close to the customer", body: "I do demos, onboarding and support myself. That is where the next feature, and the next product, comes from.", link: { label: "Read the note", href: "/blog/demand-before-roadmap" } },
];
