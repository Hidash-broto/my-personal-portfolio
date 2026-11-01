/**
 * Search: one flat index over apps, builds, journey roles and notes, plus a small
 * fuzzy matcher (subsequence with bonuses). Pure: no React, no DOM.
 */
import { APPS, type IconKey, type WindowAppId } from "@/apps/registry";
import { BUILDS } from "@/data/builds";
import { JOURNEY } from "@/data/journey";
import { posts } from "@/data/posts";

export type SearchKind = "app" | "build" | "journey" | "note";

export type SearchAction =
    | { type: "open"; app: WindowAppId; item: string | null }
    | { type: "link"; href: string };

export interface SearchEntry {
    key: string;
    kind: SearchKind;
    title: string;
    subtitle: string;
    /** Extra text that can match, weighted lower than the title. */
    keywords: string;
    icon: IconKey;
    action: SearchAction;
}

export const KIND_LABEL: Record<SearchKind, string> = { app: "Apps", build: "Builds", journey: "Journey", note: "Notes" };
const KIND_ORDER: Record<SearchKind, number> = { app: 0, build: 1, journey: 2, note: 3 };

const SHORT_DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export function buildSearchIndex(): SearchEntry[] {
    const entries: SearchEntry[] = [];
    for (const app of APPS) {
        entries.push({
            key: `app:${app.id}`,
            kind: "app",
            title: app.name,
            subtitle: app.kind === "external" ? "Opens in a new tab" : "App",
            keywords: app.id,
            icon: app.icon,
            action: app.kind === "external" ? { type: "link", href: app.href } : { type: "open", app: app.id, item: null },
        });
    }
    for (const build of BUILDS) {
        entries.push({
            key: `build:${build.id}`,
            kind: "build",
            title: build.name,
            subtitle: build.tagline,
            keywords: `${build.type} ${build.stack.join(" ")}`,
            icon: "builds",
            action: { type: "open", app: "builds", item: build.id },
        });
    }
    for (const role of JOURNEY) {
        entries.push({
            key: `journey:${role.id}`,
            kind: "journey",
            title: role.company,
            subtitle: `${role.title} · ${role.period}`,
            keywords: `${role.title} ${role.location}`,
            icon: "journey",
            action: { type: "open", app: "journey", item: role.id },
        });
    }
    for (const post of posts) {
        entries.push({
            key: `note:${post.slug}`,
            kind: "note",
            title: post.title,
            subtitle: `Note · ${SHORT_DATE.format(new Date(`${post.date}T00:00:00Z`))}`,
            keywords: post.tags.join(" "),
            icon: "notes",
            action: { type: "open", app: "notes", item: post.slug },
        });
    }
    return entries;
}

const isBoundary = (text: string, i: number) => i === 0 || /[\s\-_/·:.(]/.test(text[i - 1]);

/**
 * Score how well `query` matches `text` (higher is better), or null when it doesn't.
 * Substring hits beat scattered subsequences; word starts and the very start score extra.
 */
export function fuzzyScore(query: string, text: string): number | null {
    const q = query.trim().toLowerCase();
    const t = text.toLowerCase();
    if (!q) return 0;

    const at = t.indexOf(q);
    if (at >= 0) {
        let score = 100 + q.length * 4 - at * 0.5;
        if (at === 0) score += 40;
        else if (isBoundary(t, at)) score += 25;
        if (q.length === t.length) score += 30;
        return score;
    }

    let score = 0;
    let ti = 0;
    let last = -2;
    for (const ch of q) {
        if (ch === " ") continue;
        const found = t.indexOf(ch, ti);
        if (found < 0) return null;
        score += 2;
        if (found === last + 1) score += 6;
        if (isBoundary(t, found)) score += 8;
        score -= Math.min(found - ti, 10) * 0.4;
        last = found;
        ti = found + 1;
    }
    return score;
}

/** Every whitespace-separated token must match the title or the secondary text. */
export function scoreEntry(query: string, entry: SearchEntry): number | null {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return 0;
    // Whole-query title match first: "sales crm" should rank the CRM as one phrase.
    const whole = fuzzyScore(query, entry.title);
    let total = 0;
    for (const token of tokens) {
        const title = fuzzyScore(token, entry.title);
        const rest = fuzzyScore(token, `${entry.subtitle} ${entry.keywords}`);
        const best = Math.max(title ?? -Infinity, rest === null ? -Infinity : rest * 0.45);
        if (best === -Infinity) return null;
        total += best;
    }
    return Math.max(total, whole === null ? -Infinity : whole + 20 * (tokens.length - 1));
}

export function searchEntries(query: string, entries: readonly SearchEntry[], limit = 9): SearchEntry[] {
    if (!query.trim()) return [];
    return entries
        .map((entry) => ({ entry, score: scoreEntry(query, entry) }))
        .filter((r): r is { entry: SearchEntry; score: number } => r.score !== null)
        .sort((a, b) => b.score - a.score || KIND_ORDER[a.entry.kind] - KIND_ORDER[b.entry.kind] || a.entry.title.localeCompare(b.entry.title))
        .slice(0, limit)
        .map((r) => r.entry);
}

export interface SearchSection {
    label: string;
    entries: SearchEntry[];
}

/** Spotlight-style: the best hit on its own, the rest grouped by kind. Flat order = display order. */
export function groupResults(results: readonly SearchEntry[]): SearchSection[] {
    if (results.length === 0) return [];
    const [top, ...rest] = results;
    const sections: SearchSection[] = [{ label: "Top Hit", entries: [top] }];
    for (const kind of Object.keys(KIND_ORDER) as SearchKind[]) {
        const entries = rest.filter((e) => e.kind === kind);
        if (entries.length) sections.push({ label: KIND_LABEL[kind], entries });
    }
    return sections;
}
