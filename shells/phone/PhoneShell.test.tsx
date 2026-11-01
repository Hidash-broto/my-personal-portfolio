// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { phoneDockApps, phoneGridApps } from "@/apps/registry";
import { posts } from "@/data/posts";
import { os } from "@/lib/os";
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
            ({ item }: { item: string | null }) => (
                <div data-testid={`view-${id}`}>
                    {id}:{item ?? "none"}
                </div>
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
        window.localStorage.setItem("hos_bughunt_best", "47");
        const fake = createFakeOs();
        render(<PhoneShell />);
        const widget = screen.getByRole("region", { name: "Bug Hunt" });
        expect(widget.textContent).toContain("47");

        fireEvent.click(within(widget).getByRole("button", { name: "Play Bug Hunt" }));
        expect(fake.history.open).toHaveBeenCalledWith("bughunt", "play");
    });

    it("shows an em dash before the first round", () => {
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
    it("renders the open app as a full-screen sheet with a Back control", () => {
        const fake = createFakeOs({ open: ["builds"], item: "crm" });
        const closed = vi.fn();
        const off = os.on("app:close", closed);
        const { container } = render(<PhoneShell />);

        const sheet = screen.getByRole("dialog", { name: "Builds" });
        expect(sheet.getAttribute("data-phone-surface")).toBe("sheet");
        expect(screen.getByTestId("view-builds").textContent).toBe("builds:crm");
        expect(container.querySelector("[data-phone-home]")?.hasAttribute("inert")).toBe(true);

        fireEvent.click(within(sheet).getByRole("button", { name: "Back to home screen" }));
        expect(fake.history.close).toHaveBeenCalledWith("builds");
        expect(closed).toHaveBeenCalledWith({ app: "builds" });
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
});
