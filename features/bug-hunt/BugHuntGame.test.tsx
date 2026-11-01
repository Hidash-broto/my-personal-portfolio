// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BUGS } from "@/data/bugs";
import { os, useOsStore } from "@/lib/os";
import BugHuntGame from "./BugHuntGame";

beforeEach(() => {
    vi.stubGlobal("matchMedia", (q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }));
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ reason: "not-configured" }), { status: 503 })));
    vi.stubGlobal("requestAnimationFrame", () => 0);
    vi.stubGlobal("cancelAnimationFrame", () => {});
    window.localStorage.clear();
});

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    useOsStore.getState().setMode("normal");
    delete document.documentElement.dataset.glass;
});

describe("BugHuntGame", () => {
    it("start card: best, challenge, play and lessons", () => {
        render(<BugHuntGame shell="desktop" challenge={47} />);
        expect(screen.getByText("Bug Hunt")).toBeTruthy();
        expect(screen.getByText("Challenge: beat 47")).toBeTruthy();
        expect(screen.getByText("—")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Play · 60s" })).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Read the lessons" }));
        for (const bug of BUGS) expect(screen.getByText(bug.name)).toBeTruthy();
        expect(document.querySelectorAll('a[href="/?app=builds&item=software-factory"]').length).toBeGreaterThan(0);
    });

    it("a round locks the OS above everything and Esc during the countdown unlocks it", () => {
        const events: string[] = [];
        const offs = [os.on("game:start", () => events.push("start")), os.on("game:end", () => events.push("end"))];
        const before = vi.fn();
        render(<BugHuntGame shell="desktop" challenge={null} onBeforeRound={before} />);

        fireEvent.click(screen.getByRole("button", { name: "Play · 60s" }));
        expect(before).toHaveBeenCalledTimes(1);
        expect(useOsStore.getState().mode).toBe("game");
        expect(document.documentElement.dataset.glass).toBe("solid");
        const dialog = screen.getByRole("dialog", { name: "Bug Hunt round" });
        expect(dialog.closest("[class*=overlay]")?.parentElement).toBe(document.body);
        expect(fetch).toHaveBeenCalledWith("/api/bug-hunt/start", { method: "POST" });

        act(() => {
            fireEvent.keyDown(window, { key: "Escape" });
        });
        expect(useOsStore.getState().mode).toBe("normal");
        expect(document.documentElement.dataset.glass).toBeUndefined();
        expect(events).toEqual(["start", "end"]);
        offs.forEach((off) => off());
    });
});
