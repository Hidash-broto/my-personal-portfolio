// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Bubble from "./Bubble";
import { TIMINGS } from "./machine";

const fake = vi.hoisted(() => ({
    shell: "desktop" as "desktop" | "phone",
    history: { open: vi.fn() },
    url: { open: [] as string[], focus: null, item: null, challenge: null },
}));

vi.mock("@/lib/os", () => ({ useOs: () => fake }));

beforeEach(() => {
    fake.shell = "desktop";
    fake.history.open.mockReset();
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe("Bubble", () => {
    it("shows the greeting", () => {
        render(<Bubble onDismiss={() => {}} />);
        expect(screen.getByLabelText("Hidash says hi").textContent).toContain("Hey! I'm Hidash. Want to see what I'm shipping?");
    });

    it("desktop Show me opens Builds on the WhatsApp CRM", () => {
        const onDismiss = vi.fn();
        render(<Bubble onDismiss={onDismiss} />);
        fireEvent.click(screen.getByRole("button", { name: "Show me" }));
        expect(fake.history.open).toHaveBeenCalledWith("builds", "whatsapp-crm");
        expect(onDismiss).toHaveBeenCalled();
    });

    it("desktop Show me waits for the walk to arrive (and not at all if cancelled)", () => {
        let arrive: (() => void) | null = null;
        const walk = vi.fn((done: () => void) => {
            arrive = done;
        });
        render(<Bubble onDismiss={() => {}} walk={walk} />);
        fireEvent.click(screen.getByRole("button", { name: "Show me" }));
        expect(walk).toHaveBeenCalledOnce();
        expect(fake.history.open).not.toHaveBeenCalled();
        arrive!();
        expect(fake.history.open).toHaveBeenCalledWith("builds", "whatsapp-crm");
    });

    it("phone Show me opens Builds directly, never walks", () => {
        fake.shell = "phone";
        const walk = vi.fn();
        render(<Bubble onDismiss={() => {}} walk={walk} />);
        fireEvent.click(screen.getByRole("button", { name: "Show me" }));
        expect(fake.history.open).toHaveBeenCalledWith("builds");
        expect(walk).not.toHaveBeenCalled();
    });

    it.each(["desktop", "phone"] as const)("%s Play Bug Hunt opens bughunt/play", (shell) => {
        fake.shell = shell;
        const onDismiss = vi.fn();
        render(<Bubble onDismiss={onDismiss} />);
        fireEvent.click(screen.getByRole("button", { name: "Play Bug Hunt with Hidash" }));
        expect(fake.history.open).toHaveBeenCalledWith("bughunt", "play");
        expect(onDismiss).toHaveBeenCalled();
    });

    it("× and Escape dismiss without opening anything", () => {
        const onDismiss = vi.fn();
        render(<Bubble onDismiss={onDismiss} />);
        fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
        fireEvent.keyDown(window, { key: "Escape" });
        expect(onDismiss).toHaveBeenCalledTimes(2);
        expect(fake.history.open).not.toHaveBeenCalled();
    });

    it("auto-hides after 12s", () => {
        vi.useFakeTimers();
        const onDismiss = vi.fn();
        render(<Bubble onDismiss={onDismiss} />);
        act(() => vi.advanceTimersByTime(TIMINGS.bubbleAutoHide - 1));
        expect(onDismiss).not.toHaveBeenCalled();
        act(() => vi.advanceTimersByTime(1));
        expect(onDismiss).toHaveBeenCalledOnce();
    });

    it("phone bubble is the compact card variant", () => {
        fake.shell = "phone";
        render(<Bubble onDismiss={() => {}} />);
        expect(screen.getByLabelText("Hidash says hi").getAttribute("data-shell")).toBe("phone");
    });
});
