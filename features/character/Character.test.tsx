// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { OsBus } from "@/lib/os";
import { TIMINGS } from "./machine";
import type { RiveCharacter } from "./rive";

const h = vi.hoisted(() => ({
    bus: null as unknown as OsBus,
    shell: "desktop" as "desktop" | "phone",
    history: { open: vi.fn() },
    url: { open: [] as string[], focus: null, item: null, challenge: null },
    loadRive: vi.fn(async (): Promise<RiveCharacter | null> => null),
}));

vi.mock("@/lib/os", async () => {
    const actual = await vi.importActual<typeof import("@/lib/os")>("@/lib/os");
    return {
        ...actual,
        os: {
            on: (...args: Parameters<OsBus["on"]>) => h.bus.on(...args),
            emit: (...args: Parameters<OsBus["emit"]>) => h.bus.emit(...args),
            lifecycle: () => h.bus.lifecycle(),
        },
        useOs: () => ({ shell: h.shell, history: h.history, url: h.url }),
    };
});

vi.mock("./rive", async () => {
    const actual = await vi.importActual<typeof import("./rive")>("./rive");
    return { ...actual, loadRiveCharacter: () => h.loadRive() };
});

/** Fresh module each test: the "greeted once per page" flag is module state. */
async function mount(shell: "desktop" | "phone" = "desktop") {
    h.shell = shell;
    vi.resetModules();
    const { default: Character } = await import("./Character");
    return render(<Character shell={shell} />);
}

const anchor = (c: HTMLElement) => c.querySelector<HTMLElement>("[data-character]");

beforeEach(async () => {
    const { createBus } = await vi.importActual<typeof import("@/lib/os")>("@/lib/os");
    h.bus = createBus();
    h.url.open = [];
    h.history.open.mockReset();
    h.loadRive.mockReset().mockResolvedValue(null);
    vi.useFakeTimers();
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe("Character", () => {
    it("greets with the bubble when mounted after boot:end", async () => {
        h.bus.emit("boot:end", { skipped: false });
        const { container } = await mount();
        expect(anchor(container)?.dataset.character).toBe("wave");
        expect(anchor(container)?.dataset.layout).toBe("dock");
        expect(screen.getByLabelText("Hidash says hi")).toBeTruthy();
        act(() => vi.advanceTimersByTime(TIMINGS.greetWave));
        expect(anchor(container)?.dataset.character).toBe("idle");
    });

    it("stays quiet on a deep link", async () => {
        h.bus.emit("boot:end", { skipped: true });
        const { container } = await mount();
        expect(anchor(container)?.dataset.character).toBe("idle");
        expect(screen.queryByLabelText("Hidash says hi")).toBeNull();
    });

    it("sleeps on idle and wakes on input", async () => {
        h.bus.emit("boot:end", { skipped: true });
        const { container } = await mount();
        act(() => h.bus.emit("idle", {}));
        expect(anchor(container)?.dataset.character).toBe("sleep");
        act(() => {
            fireEvent.pointerDown(window);
        });
        expect(anchor(container)?.dataset.character).toBe("idle");
    });

    it("tap makes him wave", async () => {
        h.bus.emit("boot:end", { skipped: true });
        const { container } = await mount();
        fireEvent.click(screen.getByRole("button", { name: /Mini Hidash/ }));
        expect(anchor(container)?.dataset.character).toBe("wave");
    });

    it("becomes the corner badge during a round, then celebrates for 2s", async () => {
        h.bus.emit("boot:end", { skipped: true });
        const { container } = await mount();
        act(() => h.bus.emit("game:start", {}));
        expect(anchor(container)?.dataset).toMatchObject({ layout: "badge", character: "panic" });
        expect(screen.queryByRole("button", { name: /Mini Hidash/ })).toBeNull(); // never blocks the game
        act(() => h.bus.emit("game:end", { score: 12, activeMs: 30000 }));
        expect(anchor(container)?.dataset).toMatchObject({ layout: "dock", character: "celebrate" });
        act(() => vi.advanceTimersByTime(TIMINGS.celebrate));
        expect(anchor(container)?.dataset.character).toBe("idle");
    });

    it("phone: hidden while an app is open, shown on the home screen", async () => {
        h.bus.emit("boot:end", { skipped: false });
        h.url.open = ["journey"];
        const first = await mount("phone");
        expect(anchor(first.container)).toBeNull();
        first.unmount();

        h.url.open = [];
        const second = await mount("phone");
        expect(anchor(second.container)?.dataset.layout).toBe("home");
        expect(screen.getByLabelText("Hidash says hi").getAttribute("data-shell")).toBe("phone");
    });

    it("desktop Show me walks, then opens Builds on the WhatsApp CRM", async () => {
        h.bus.emit("boot:end", { skipped: false });
        const { container } = await mount();
        fireEvent.click(screen.getByRole("button", { name: "Show me" }));
        expect(h.history.open).not.toHaveBeenCalled();
        expect(anchor(container)?.dataset.character).toBe("point");
        act(() => vi.advanceTimersByTime(TIMINGS.walk));
        expect(h.history.open).toHaveBeenCalledWith("builds", "whatsapp-crm");
    });

    it("any click during the walk cancels it", async () => {
        h.bus.emit("boot:end", { skipped: false });
        const { container } = await mount();
        fireEvent.click(screen.getByRole("button", { name: "Show me" }));
        act(() => {
            fireEvent.pointerDown(document.body);
        });
        act(() => vi.advanceTimersByTime(TIMINGS.walk * 2));
        expect(h.history.open).not.toHaveBeenCalled();
        expect(anchor(container)?.dataset.character).toBe("idle");
    });

    it("loads Rive lazily (3s after boot) and keeps the pose art when it resolves null", async () => {
        h.bus.emit("boot:end", { skipped: true });
        const { container } = await mount();
        expect(h.loadRive).not.toHaveBeenCalled();
        await act(async () => vi.advanceTimersByTime(3000));
        expect(h.loadRive).toHaveBeenCalledOnce();
        expect(container.querySelector("img[src='/character/idle.webp']")).toBeTruthy();
    });

    it("falls back to the SVG placeholder when the pose art fails to load", async () => {
        const { container } = await mount();
        const img = container.querySelector("img[src='/character/idle.webp']")!;
        act(() => {
            fireEvent.error(img);
        });
        expect(container.querySelector("img")).toBeNull();
        expect(container.querySelector("svg")).toBeTruthy();
    });

    it("swaps in the Rive component when it loads, and back to the pose art on error", async () => {
        let fail: (() => void) | null = null;
        h.loadRive.mockResolvedValue({
            Component: ({ pose, onError }) => {
                fail = onError;
                return <canvas data-rive={pose} />;
            },
        });
        h.bus.emit("boot:end", { skipped: true });
        const { container } = await mount();
        await act(async () => {
            fireEvent.pointerDown(window);
        });
        expect(container.querySelector("canvas[data-rive='idle']")).toBeTruthy();
        act(() => fail!());
        expect(container.querySelector("canvas")).toBeNull();
        expect(container.querySelector("img[src='/character/idle.webp']")).toBeTruthy();
    });
});
