import { describe, expect, it } from "vitest";
import { BUILDS } from "@/data/builds";
import { JOURNEY } from "@/data/journey";
import { posts } from "@/data/posts";
import { buildSearchIndex, fuzzyScore, groupResults, searchEntries } from "./search-index";
import { formatClock } from "./clock";

const index = buildSearchIndex();

describe("fuzzyScore", () => {
    it("matches substrings and scattered subsequences, case-insensitively", () => {
        expect(fuzzyScore("crm", "WhatsApp AI Sales CRM")).not.toBeNull();
        expect(fuzzyScore("wcrm", "WhatsApp AI Sales CRM")).not.toBeNull();
        expect(fuzzyScore("xyz", "WhatsApp AI Sales CRM")).toBeNull();
    });

    it("ranks prefix > word start > mid-word > scattered", () => {
        const prefix = fuzzyScore("not", "Notes")!;
        const wordStart = fuzzyScore("not", "Open Notes")!;
        const mid = fuzzyScore("ote", "Notes")!;
        const scattered = fuzzyScore("nts", "Notes")!;
        expect(prefix).toBeGreaterThan(wordStart);
        expect(wordStart).toBeGreaterThan(mid);
        expect(mid).toBeGreaterThan(scattered);
    });
});

describe("searchEntries", () => {
    it("indexes every app, build, journey role and note", () => {
        expect(index.filter((e) => e.kind === "build")).toHaveLength(BUILDS.length);
        expect(index.filter((e) => e.kind === "journey")).toHaveLength(JOURNEY.length);
        expect(index.filter((e) => e.kind === "note")).toHaveLength(posts.length);
        expect(index.some((e) => e.kind === "app" && e.title === "Bug Hunt")).toBe(true);
    });

    it("finds an app by name and opens it without an item", () => {
        const [top] = searchEntries("bug", index);
        expect(top.title).toBe("Bug Hunt");
        expect(top.action).toEqual({ type: "open", app: "bughunt", item: null });
    });

    it("opens builds with their id", () => {
        const [top] = searchEntries("sales crm", index);
        expect(top.action).toEqual({ type: "open", app: "builds", item: "whatsapp-crm" });
    });

    it("opens journey roles by company", () => {
        const [top] = searchEntries("dentobees", index);
        expect(top.kind).toBe("journey");
        expect(top.action).toEqual({ type: "open", app: "journey", item: "dentobees" });
    });

    it("opens notes by slug from their title", () => {
        const [top] = searchEntries("velocity", index);
        expect(top.action).toEqual({ type: "open", app: "notes", item: "velocity-is-a-lie-technical-debt" });
    });

    it("matches builds by tagline too, below title hits", () => {
        const results = searchEntries("closed deal", index);
        expect(results[0]?.action).toMatchObject({ app: "builds", item: "whatsapp-crm" });
    });

    it("sends external apps to their link", () => {
        const [top] = searchEntries("linkedin", index);
        expect(top.action.type).toBe("link");
    });

    it("returns nothing for an empty query or a miss, and respects the limit", () => {
        expect(searchEntries("   ", index)).toEqual([]);
        expect(searchEntries("zzqxj", index)).toEqual([]);
        expect(searchEntries("e", index, 4)).toHaveLength(4);
    });

    it("groups as Top Hit then by kind, keeping every result once", () => {
        const results = searchEntries("a", index, 9);
        const sections = groupResults(results);
        expect(sections[0].label).toBe("Top Hit");
        expect(sections.flatMap((s) => s.entries)).toHaveLength(results.length);
    });
});

describe("formatClock", () => {
    it("matches the menu bar format", () => {
        expect(formatClock(new Date(2026, 10, 1, 14, 13))).toBe("Sun 1 Nov  2:13 PM");
        expect(formatClock(new Date(2026, 10, 2, 0, 5))).toBe("Mon 2 Nov  12:05 AM");
    });
});
