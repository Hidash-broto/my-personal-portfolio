export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string };

export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO date the original LinkedIn post was published
  tags: string[];
  linkedinUrl: string;
  body: Block[];
}

const li = (activityId: string) =>
  `https://www.linkedin.com/feed/update/urn:li:activity:${activityId}/`;

export const posts: Post[] = [
  {
    slug: "clarity-of-vision-one-hand",
    title: "Clarity of Vision: Running a Startup's Tech With One Hand",
    description:
      "A dislocated shoulder, a month of forced rest, and what it taught me about vision, taste and being human in the AI era.",
    date: "2026-10-25",
    tags: ["Startups", "Leadership", "AI era"],
    linkedinUrl: li("7520064555612545024"),
    body: [
      { type: "p", text: "A few days ago I got a surprise on the football pitch. I ran for a ball that was going out, the ground arrived faster than I expected, and my elbow hit it first. I heard a click in my shoulder, felt it sit somewhere it shouldn't, and then the pain came." },
      { type: "p", text: "The X-ray showed an anterior shoulder dislocation. Early that morning a doctor put it back in place like he was fixing a Lego piece. It took him seconds. It took me a lot of pain to reach him. The prescription: a month of rest, a sling, and no moving that arm." },
      { type: "h2", text: "Startups don't pause" },
      { type: "p", text: "I went home to rest, but my brain wouldn't. Anyone with a major role in an early startup will understand. It feels like an F1 race: execution speed is everything, and you can't hand the car to someone else mid-lap. As CTO I kept thinking about our vision and where we were in the race. So, sling on, I opened my laptop." },
      { type: "p", text: "Then the real problem: one working hand. Typing was slow and painful. So I connected my work tools to an AI assistant and ran my work by voice for days, planning, reviewing and directing the work out loud." },
      { type: "h2", text: "Everyone can be Steve Jobs now" },
      { type: "p", text: "I remembered a line from a podcast: Steve Jobs had a clear vision and a hundred brilliant engineers to execute it; today anyone can have powerful agents to execute theirs. While I was directing work by voice, that line stayed in my head." },
      { type: "p", text: "To be honest, speaking is not the same as writing. You think differently when you type. But in a critical week, it was enough, and it made one thing very clear: execution was never the bottleneck. Clarity was." },
      { type: "h2", text: "The lesson" },
      { type: "quote", text: "We are physically weak compared to other species, but our most powerful machine is our brain. AI makes life much easier, but clarity of thought and knowing human taste are still your job — and they are the hardest things a human has." },
      { type: "p", text: "I'm getting better day by day, and I'll be back to my morning gym routine soon. The sling taught me more about leadership than a lot of books did." },
    ],
  },
  {
    slug: "demand-before-roadmap",
    title: "When Customer Demand Arrives Before Your Roadmap",
    description:
      "We built strictly for one market. Then customers from other countries started reaching out with zero marketing. Here is what that taught us about product focus.",
    date: "2026-09-12",
    tags: ["Startups", "Product", "Scaling"],
    linkedinUrl: li("7504365700493266944"),
    body: [
      { type: "p", text: "Early on, our founder told me: \"We focus only on the Indian market. Anything else dilutes our focus.\"" },
      { type: "p", text: "It made sense. Focus is the only unfair advantage an early startup has. So we built strictly around Indian workflows, Indian compliance and Indian pricing models." },
      { type: "h2", text: "Then the inbound started" },
      { type: "p", text: "Customers from outside India started reaching out. No global ads. No outbound campaigns. Zero international marketing." },
      { type: "p", text: "That forced an uncomfortable question: what if the problem we were solving was never an \"Indian\" problem at all? India was simply where we happened to start. The pain point was universal, and good solutions travel." },
      { type: "h2", text: "What going global means for engineering" },
      { type: "p", text: "My focus shifted to making the product truly global-ready, without breaking anything for the customers who were already depending on it:" },
      { type: "ul", items: [
        "Multi-currency support, from pricing to invoices",
        "Cross-border compliance and data security",
        "An architecture that scales for global load, not just local load",
      ] },
      { type: "p", text: "None of this was on the roadmap. The demand simply arrived before the roadmap did." },
      { type: "h2", text: "The takeaway" },
      { type: "p", text: "Focus is right. But when the market tells you something you didn't plan for, listen. And build your foundations so you can say yes when it happens. It's the best kind of problem a startup can have." },
    ],
  },
  {
    slug: "millers-law-for-engineers",
    title: "Miller's Law for Engineers: Why Running Five AI Agents Fried My Brain",
    description:
      "A 1956 psychology paper explained why parallel AI workflows were burning me out, and a pen-and-paper fix that actually worked.",
    date: "2026-08-20",
    tags: ["Engineering", "Productivity", "Cognitive load"],
    linkedinUrl: li("7496216872229425152"),
    body: [
      { type: "p", text: "Everyone kept saying AI had simplified software engineering. I felt more exhausted than I ever did before it." },
      { type: "p", text: "First, a note: if you outsource your critical thinking to AI agents, you are no longer an engineer, just a rubber stamp. This post is not for you." },
      { type: "h2", text: "Loop engineering, at scale" },
      { type: "p", text: "We have moved well beyond single-prompt code generation. Today's workflow is loop engineering: autonomous feedback cycles where agents plan, write code, run commands, read error logs and correct themselves until the tests pass." },
      { type: "p", text: "I started orchestrating four or five of these loops at once across separate Git worktrees. On paper, my output was through the roof. In reality, my brain was burning out." },
      { type: "h2", text: "The 1956 paper" },
      { type: "p", text: "While listening to a talk by Garry Tan, I heard a reference to George A. Miller's classic 1956 paper, \"The Magical Number Seven, Plus or Minus Two.\" I read it that night." },
      { type: "p", text: "Miller's finding: human short-term memory holds roughly five to nine items at a time. Past that limit, accuracy drops and fatigue sets in. Juggling five agents, each with its own context, goal and state, I was forcing my brain's working memory far past its hard limit." },
      { type: "h2", text: "The fix: stop using your head as a database" },
      { type: "p", text: "I didn't stop running multiple agents. I stopped using my short-term memory as a state store. My system is deliberately low-tech:" },
      { type: "ul", items: [
        "Before switching agents, I write a three-word summary of what that agent is doing and its end goal, on paper.",
        "The moment it's written down, my brain gets the signal: the pointer is saved, you can let go.",
        "Coming back to an agent means glancing at the paper, not reconstructing the context from memory.",
      ] },
      { type: "quote", text: "AI gives us near-infinite execution speed. Human cognitive bandwidth hasn't changed. Offload your context and let paper, or anything else, be your external cache." },
    ],
  },
  {
    slug: "the-dataset-is-the-real-source-code",
    title: "The Dataset Is the Real Source Code",
    description:
      "Building a computer-vision feature taught me why prompt templates aren't enough, and why with learned models, human-labelled data is the actual program.",
    date: "2026-07-17",
    tags: ["Applied AI", "Machine learning", "Engineering"],
    linkedinUrl: li("7483846365605711873"),
    body: [
      { type: "p", text: "I had built AI products before: an agentic chatbot that could run a whole app on its own, a recommender that suggested dishes based on dietary preferences. The full combo of RAG, tool calling and prompt templates. That was my mental model of \"doing AI.\"" },
      { type: "p", text: "Then we set out to build a vision feature: take a photo, find every problem in it with a confidence score, and preview what the result could look like afterwards." },
      { type: "h2", text: "My plan, and why it was wrong" },
      { type: "p", text: "My plan was to take a vision model, turn it into an expert with a good prompt, feed it the photo, and get everything back in one shot. It doesn't work like that." },
      { type: "ul", items: [
        "A vision model doesn't know where to look just because you ask nicely. You first segment the region that matters, or it wastes attention on everything else.",
        "You need a separate detection model whose only job is spotting problems, each with a confidence score. Let a general model \"find\" things on its own and it will invent problems that aren't there.",
        "The LLM's job is smaller than I assumed: explain the detector's findings, grounded strictly in them.",
        "The \"after\" preview edits only the relevant region and stitches it back, clearly marked as a preview, never a promise.",
      ] },
      { type: "h2", text: "The real lesson" },
      { type: "p", text: "In software, a function is something I write line by line. If I don't understand it, I open it and read the logic. I kept hunting for that same thing inside the model: one clean rule that decides what counts as a problem. It doesn't exist." },
      { type: "p", text: "Try writing a clean rule for \"this mango is ripe.\" Colour, softness, smell: any real mango breaks your rule. That's how your grandmother picks one, with no formula and years of practice. Instead, people label thousands of mangoes by hand, and training adjusts millions of numbers to match their judgment." },
      { type: "p", text: "That is what sat behind our detector. Nobody wrote the rule. Experts labelled real photos, and training found the pattern. So the function isn't rules(input) → output, like I'd built my whole career. It's examples labelled by humans → a function the machine finds itself." },
      { type: "quote", text: "The dataset is the real source code: human expertise, written down. The shift is from \"what's the logic?\" to \"what's the data?\"" },
      { type: "p", text: "Learning this took longer than I expected, and that surprised me more than the topic did. Once it landed, I stopped looking for a rule that never existed and started asking better questions: which examples taught this function, and are they good enough?" },
    ],
  },
  {
    slug: "adapt-or-vanish",
    title: "Adapt or Vanish: What an Asteroid Teaches Software Engineers",
    description:
      "Adaptability isn't an 'AI-era skill'. It's the oldest rule in nature, and AI is just the latest asteroid.",
    date: "2026-04-08",
    tags: ["Careers", "AI era", "Software engineering"],
    linkedinUrl: li("7447674605860806656"),
    body: [
      { type: "p", text: "People say adaptability is an \"AI-era skill.\" I don't think so." },
      { type: "p", text: "Sixty-five million years ago, a giant asteroid hit Earth. Roughly three quarters of all species died. The dinosaurs, big, powerful and ruling the planet, were gone." },
      { type: "p", text: "But some small creatures survived: insects, small mammals, organisms nobody would have bet on. From them the whole planet came back to life. Forests, oceans, animals, and eventually us." },
      { type: "quote", text: "Nature didn't save the biggest or the strongest. It saved the ones who could adapt." },
      { type: "h2", text: "The same rule runs tech" },
      { type: "p", text: "I see it constantly. Technologies that looked unbeatable are gone within five years. The engineers who stay curious, keep learning and keep evolving are the ones who shape what comes next, even if their title changes to builder or product manager along the way." },
      { type: "p", text: "AI isn't changing the rule. It's just the latest asteroid." },
      { type: "h2", text: "What adapting actually looks like" },
      { type: "p", text: "The people who thrive aren't the ones resisting it or panicking about it. They're the ones asking one question: how do I evolve with this? The universe has been showing us the answer for billions of years." },
      { type: "p", text: "Adapt or vanish." },
    ],
  },
  {
    slug: "engineering-moat-judgment-and-taste",
    title: "Why Judgment and Taste Are the New Engineering Moat",
    description:
      "When an AI agent can rebuild a year of engineering work in an hour, the value of a software engineer moves from syntax to architectural judgment, validation and taste.",
    date: "2026-01-19",
    tags: ["Software engineering", "AI era", "Architecture"],
    linkedinUrl: li("7418857312863567872"),
    body: [
      { type: "p", text: "In January, Jaana Dogan, a principal engineer at Google, shared something that set the developer community on fire. Her team had spent a year exploring how to build distributed agent orchestrators. She gave a coding agent a description of the problem, and in about an hour it produced something that mirrored what the team had built over that year." },
      { type: "p", text: "Call it a dimensionality reduction strike: a year of human exploration compressed into a lunch break. The reality is more nuanced than the headline, and as engineers we have to look past it." },
      { type: "h2", text: "What's actually true" },
      { type: "ul", items: [
        "The velocity is real. We went from single-line autocomplete in 2022 to agents that refactor whole codebases. The gap between \"idea\" and \"first version\" is collapsing.",
        "A toy is not a product. The AI didn't handle the tickets, the architecture meetings or the organisational inertia. It built a toy version, but it picked the right design choices without being told.",
        "The value is shifting. Our moat as software engineers is no longer syntax and implementation. It's moving towards architectural judgment, validation and taste.",
      ] },
      { type: "h2", text: "From builders to orchestrators" },
      { type: "p", text: "The industry is moving from traditional engineering to AI-assisted development, from people who build to people who orchestrate. Once you have the insight and the knowledge, the building itself is no longer the hard part." },
      { type: "p", text: "So the real question isn't whether AI can code. It's how we define our value when writing code is the easiest part of the job." },
      { type: "quote", text: "Architectural judgment is becoming our primary product. Fundamentals are how you earn it." },
    ],
  },
  {
    slug: "velocity-is-a-lie-technical-debt",
    title: "Velocity Is a Lie If It's Built on Technical Debt",
    description:
      "The vibe-coding hangover has arrived. Why the future isn't vibe coding but validated coding, and why companies need pilots, not passengers.",
    date: "2026-01-09",
    tags: ["Software engineering", "Technical debt", "Code quality"],
    linkedinUrl: li("7415423629167038464"),
    body: [
      { type: "p", text: "The hangover has officially arrived." },
      { type: "p", text: "Remember the layoff memos being drafted a year ago? Many are quietly being shelved. In their place, companies are writing job descriptions for senior engineers whose main job is reviewing AI-generated code." },
      { type: "p", text: "Why? Because the industry is learning that the person who \"vibes 3x faster\" is often the same person who just pushed ten critical vulnerabilities to production." },
      { type: "h2", text: "The fallout I see every day" },
      { type: "ul", items: [
        "The inhale/exhale problem. AI agents are great at inhaling (adding features) and bad at exhaling (refactoring for simplicity). We're left with bloated codebases nobody knows how to simplify.",
        "The maintenance reality. Most engineering work is maintenance, not greenfield. A system generated in five minutes that takes five days to debug is a net loss for the business.",
        "The fragmentation trap. Simple apps split into dozens of chunk files and unnecessary microservices, not because it was good architecture, but because the AI couldn't manage its own context window.",
      ] },
      { type: "h2", text: "The shift: validated coding" },
      { type: "p", text: "The future isn't vibe coding. The future is validated coding." },
      { type: "p", text: "CEOs don't need passengers screaming at the AI controls. They need pilots: engineers who can audit the logic, reject the hallucinations, and put security ahead of perceived speed." },
      { type: "quote", text: "The vibe is just a suggestion. The validation is where the real engineering happens." },
    ],
  },
  {
    slug: "quitting-9-to-5-to-build-with-founders",
    title: "Why I Left My 9-to-5 to Build With Founders",
    description:
      "Leaving a stable job to build products alongside founders changed how I think about work, growth and courage.",
    date: "2025-11-10",
    tags: ["Startups", "Careers", "Founders"],
    linkedinUrl: li("7393501159422005248"),
    body: [
      { type: "p", text: "Quitting my 9-to-5 to work independently changed my life." },
      { type: "p", text: "My working hours went from nine-to-five to all the time, and honestly, I didn't even notice it happening. I worked more than ever and earned less than before. It was still the best decision I had made." },
      { type: "h2", text: "The people" },
      { type: "p", text: "The work put me in rooms with founders and builders who had real passion and strong mindsets. Talking with them showed me how far I still had to go, and how much there was to learn." },
      { type: "p", text: "There were moments I doubted myself. Times when things didn't go as planned. But every time I solved a founder's problem or built something that helped someone, I felt deeply satisfied. It felt like work that actually mattered." },
      { type: "h2", text: "What I learned" },
      { type: "ul", items: [
        "When you constantly meet people smarter than you, it might hurt your ego. That's a blessing. Growth starts there.",
        "If your environment doesn't challenge you or expose you to new things, leave it.",
        "Don't stop building because money is tight. You don't need money to start. You need courage.",
      ] },
      { type: "p", text: "That chapter led me straight into startups, where I have stayed ever since." },
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

export const readingMinutes = (post: Post) => {
  const words = post.body
    .map((b) => (b.type === "ul" ? b.items.join(" ") : b.text))
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
};
