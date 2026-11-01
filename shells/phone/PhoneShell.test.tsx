// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { phoneDockApps, phoneGridApps } from "@/apps/registry";
import { posts } from "@/data/posts";
import { dayKey } from "@/features/bug-hunt/best";
import { os, useOsStore } from "@/lib/os";
import PhoneShell from "./PhoneShell";
import { createFakeOs } from "./test-utils";
import { latestPost } from "./Widgets";

vi.mock("@/lib/os", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/os")>();
    const { fakeUseOs } = await import("./test-utils");
    return { ...actual, useOs: fakeUseOs };
});

vi.mock("@/apps/views", async () => {
    const { WINDOW_APP_IDS } = await import("@/apps/registry");
    const views = Object.fromEntries(
        WINDOW_APP_IDS.map((id) => [
            id,
            ({ item, openApp }: { item: string | null; openApp: (app: string, item?: string | null) => void }) => (
                <>
                    <div data-testid={`view-${id}`}>
                        {id}:{item ?? "none"}
                    </div>
                    <button type="button" onClick={() => openApp("builds", "crm")}>
                        open builds
                    </button>
                </>
            ),
        ]),
    );
    return { APP_VIEWS: views };
});

afterEach(() => {
    cleanup();
    window.localStorage.clear();
});

describe("PhoneShell home screen", () => {
    beforeEach(() => {
        createFakeOs();
    });

    it("derives the grid and the dock from the registry", () => {
        render(<PhoneShell />);
        const grid = screen.getByRole("list", { name: "Apps" });
        const gridNames = within(grid).getAllByRole("button").map((b) => b.getAttribute("aria-label"));
        expect(gridNames).toEqual(phoneGridApps.map((a) => a.name));
        expect(gridNames).toMatchInlineSnapshot(`
          [
            "Journey",
            "Builds",
            "About",
            "Beliefs",
            "Bug Hunt",
          ]
        `);

        const dock = screen.getByRole("navigation", { name: "Dock" });
        const dockItems = within(dock).getAllByRole("listitem");
        expect(dockItems).toHaveLength(phoneDockApps.length);
        const dockNames = dockItems.map((li) => li.querySelector("[data-icon]")?.getAttribute("data-icon"));
        expect(dockNames).toEqual(phoneDockApps.map((a) => a.id));

        // Each grid app appears once, and never in both places.
        for (const app of phoneDockApps) expect(within(grid).queryByRole("button", { name: app.name })).toBeNull();
    });

    it("tapping an icon opens the app in the URL and emits app:open", () => {
        const fake = createFakeOs();
        const opened = vi.fn();
        const off = os.on("app:open", opened);
        render(<PhoneShell />);

        fireEvent.click(screen.getByRole("button", { name: "Journey" }));

        expect(fake.history.open).toHaveBeenCalledWith("journey", null);
        expect(opened).toHaveBeenCalledWith({ app: "journey", item: null });
        off();
    });

    it("external apps are real links that open in a new tab", () => {
        render(<PhoneShell />);
        const link = screen.getByRole("link", { name: /LinkedIn/ });
        const linkedin = phoneDockApps.find((a) => a.id === "linkedin");
        expect(linkedin?.kind).toBe("external");
        expect(link.getAttribute("href")).toBe(linkedin && "href" in linkedin ? linkedin.href : "");
        expect(link.getAttribute("target")).toBe("_blank");
        expect(link.getAttribute("rel")).toContain("noopener");
    });

    it("the Bug Hunt widget plays a round and shows the stored best", () => {
        window.localStorage.setItem("hos_bughunt_best", JSON.stringify({ day: dayKey(), score: 47 }));
        const fake = createFakeOs();
        render(<PhoneShell />);
        const widget = screen.getByRole("region", { name: "Bug Hunt" });
        expect(widget.textContent).toContain("47");

        fireEvent.click(within(widget).getByRole("button", { name: "Play Bug Hunt" }));
        expect(fake.history.open).toHaveBeenCalledWith("bughunt", "play");
    });

    it("shows an em dash before the first round (and for a best from another day)", () => {
        window.localStorage.setItem("hos_bughunt_best", JSON.stringify({ day: "2001-01-01", score: 99 }));
        render(<PhoneShell />);
        expect(screen.getByRole("region", { name: "Bug Hunt" }).textContent).toContain("—");
    });

    it("the latest-note widget opens Notes on the newest post", () => {
        const fake = createFakeOs();
        render(<PhoneShell />);
        const newest = latestPost(posts)!;
        expect(newest.date >= posts[posts.length - 1].date).toBe(true);
        fireEvent.click(screen.getByRole("button", { name: `Latest note: ${newest.title}` }));
        expect(fake.history.open).toHaveBeenCalledWith("notes", newest.slug);
    });

    it("emits idle after 30s without input; input restarts the clock", () => {
        vi.useFakeTimers();
        try {
            const idle = vi.fn();
            const off = os.on("idle", idle);
            render(<PhoneShell />);
            vi.advanceTimersByTime(29_000);
            fireEvent.pointerDown(window);
            vi.advanceTimersByTime(29_000);
            expect(idle).not.toHaveBeenCalled();
            vi.advanceTimersByTime(1_000);
            expect(idle).toHaveBeenCalledTimes(1);
            off();
        } finally {
            vi.useRealTimers();
        }
    });

    it("publishes the dock clearance for the character on :root", () => {
        const { unmount } = render(<PhoneShell />);
        expect(document.documentElement.style.getPropertyValue("--hos-phone-dock-clearance")).toMatch(/^\d+px$/);
        unmount();
        expect(document.documentElement.style.getPropertyValue("--hos-phone-dock-clearance")).toBe("");
    });

    it("registers no sheet or card while nothing is open", () => {
        const { container } = render(<PhoneShell />);
        expect(container.querySelector("[data-phone-surface]")).toBeNull();
        expect(container.querySelector("[data-phone-home]")?.hasAttribute("inert")).toBe(false);
    });
});

describe("PhoneShell open app", () => {
    it("renders the open app as a full-screen sheet; Back closes it", () => {
        const fake = createFakeOs({ open: ["builds"] });
        const closed = vi.fn();
        const off = os.on("app:close", closed);
        const { container } = render(<PhoneShell />);

        const sheet = screen.getByRole("dialog", { name: "Builds" });
        expect(sheet.getAttribute("data-phone-surface")).toBe("sheet");
        expect(within(sheet).getByRole("heading", { level: 1, name: "Builds" })).toBeTruthy();
        expect(screen.getByTestId("view-builds").textContent).toBe("builds:none");
        expect(container.querySelector("[data-phone-home]")?.hasAttribute("inert")).toBe(true);

        fireEvent.click(within(sheet).getByRole("button", { name: "Back to home screen" }));
        expect(fake.history.close).toHaveBeenCalledWith("builds");
        expect(closed).toHaveBeenCalledWith({ app: "builds" });
        off();
    });

    it("with an item open, Back returns to the app's list instead of closing", () => {
        const fake = createFakeOs({ open: ["builds"], item: "crm" });
        render(<PhoneShell />);
        const sheet = screen.getByRole("dialog", { name: "Builds" });
        expect(screen.getByTestId("view-builds").textContent).toBe("builds:crm");
        // Detail screens have no large title (the view shows its own headline).
        expect(within(sheet).queryByRole("heading", { level: 1 })).toBeNull();

        fireEvent.click(within(sheet).getByRole("button", { name: "Back to Builds" }));
        expect(fake.history.open).toHaveBeenCalledWith("builds", null);
        expect(fake.history.close).not.toHaveBeenCalled();
    });

    it("views can open another app (openApp) and that emits app:open", () => {
        const fake = createFakeOs({ open: ["notes"], item: "adapt-or-vanish" });
        const opened = vi.fn();
        const off = os.on("app:open", opened);
        render(<PhoneShell />);
        fireEvent.click(screen.getByRole("button", { name: "open builds" }));
        expect(fake.history.open).toHaveBeenCalledWith("builds", "crm");
        expect(opened).toHaveBeenCalledWith({ app: "builds", item: "crm" });
        off();
    });

    it("the home bar closes the app from the keyboard but not from a plain tap", () => {
        const fake = createFakeOs({ open: ["about"] });
        render(<PhoneShell />);
        const bar = screen.getByRole("button", { name: /go to the home screen/ });

        fireEvent.pointerDown(bar, { pointerId: 1, isPrimary: true, clientY: 800, button: 0 });
        fireEvent.pointerUp(bar, { pointerId: 1, isPrimary: true, clientY: 800, button: 0 });
        expect(fake.history.close).not.toHaveBeenCalled();

        fireEvent.keyDown(bar, { key: "Enter" });
        expect(fake.history.close).toHaveBeenCalledWith("about");
    });

    it("Bug Hunt renders as a card over the home screen, not a sheet", () => {
        const fake = createFakeOs({ open: ["bughunt"], item: "play" });
        const { container } = render(<PhoneShell />);

        const card = screen.getByRole("dialog", { name: "Bug Hunt" });
        expect(card.getAttribute("data-phone-surface")).toBe("card");
        expect(container.querySelector('[data-phone-surface="sheet"]')).toBeNull();
        expect(within(card).getByTestId("view-bughunt").textContent).toBe("bughunt:play");
        // The home screen stays rendered underneath (bugs crawl out of its icons).
        expect(screen.getByRole("list", { name: "Apps" })).toBeTruthy();

        fireEvent.click(within(card).getByRole("button", { name: "Close Bug Hunt" }));
        expect(fake.history.close).toHaveBeenCalledWith("bughunt");
    });

    it("during a round the card steps aside (still mounted) and Escape is left to the game", () => {
        const fake = createFakeOs({ open: ["bughunt"], item: "play" });
        const { container } = render(<PhoneShell />);
        act(() => useOsStore.getState().setMode("game"));
        try {
            const card = container.querySelector('[data-phone-surface="card"]');
            expect(card).not.toBeNull();
            expect(card?.getAttribute("aria-hidden")).toBe("true");
            expect(screen.getByTestId("view-bughunt")).toBeTruthy();
            fireEvent.keyDown(window, { key: "Escape" });
            expect(fake.history.close).not.toHaveBeenCalled();
        } finally {
            act(() => useOsStore.getState().setMode("normal"));
        }
    });
});
