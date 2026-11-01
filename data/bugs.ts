/**
 * Bug Hunt content. Each bug is an engineering shortcut Hidash guards against.
 * DRAFT lessons written by Claude, pending Hidash's approval (contract 0).
 */
export type BugId = "todo" | "skip-tests" | "secret" | "works-on-my-machine" | "copy-paste" | "unvalidated-ai";

export interface Bug {
    id: BugId;
    /** Short name shown in the toast and recap. */
    name: string;
    /** One sentence: how Hidash prevents it. */
    lesson: string;
    /** Strongest existing proof, or null for text only. */
    proof: { label: string; href: string } | null;
    /** Relative crawl speed (1 = normal). */
    speed: number;
    /** Glyph printed on the shell. */
    mark: string;
}

const FACTORY = { label: "See the Software Factory", href: "/?app=builds&item=software-factory" };
const VELOCITY = { label: "Read: Velocity Is a Lie", href: "/blog/velocity-is-a-lie-technical-debt" };

export const BUGS: readonly Bug[] = [
    { id: "todo", name: "TODO in production", lesson: "No TODO reaches main. A QA agent flags them before review.", proof: FACTORY, speed: 1, mark: "//" },
    { id: "skip-tests", name: "Skipped tests", lesson: "Every feature is checked against scenarios the builder never saw.", proof: FACTORY, speed: 1.6, mark: "✓?" },
    { id: "secret", name: "Hardcoded secret", lesson: "Secrets live in the Keychain and the environment, never in git.", proof: FACTORY, speed: 1, mark: "🔑" },
    { id: "works-on-my-machine", name: "Works on my machine", lesson: "Builds run in a clean sandbox, so my machine is everyone's machine.", proof: FACTORY, speed: 0.9, mark: "WOMM" },
    { id: "copy-paste", name: "Copy-paste code", lesson: "Code copied twice becomes one tested helper.", proof: VELOCITY, speed: 1.2, mark: "⧉" },
    { id: "unvalidated-ai", name: "Unvalidated AI output", lesson: "AI output is a draft. It ships only after it passes validation.", proof: VELOCITY, speed: 1.3, mark: "AI" },
];

export const BUG_IDS: readonly BugId[] = BUGS.map((b) => b.id);

export const ROUND_MS = 60_000;

/** Plausibility cap used by the server: no player catches more than this many bugs per second of play. */
export const MAX_CATCHES_PER_SECOND = 2.5;

export const MAX_SCORE = 200;

/** Bitmask of caught bug types, in BUG_IDS order. */
export function bugMask(caught: Iterable<BugId>): number {
    let mask = 0;
    for (const id of caught) {
        const i = BUG_IDS.indexOf(id);
        if (i >= 0) mask |= 1 << i;
    }
    return mask;
}

export function bugsFromMask(mask: number): Bug[] {
    return BUGS.filter((_, i) => (mask & (1 << i)) !== 0);
}
