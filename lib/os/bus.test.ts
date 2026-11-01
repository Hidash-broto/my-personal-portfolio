import { describe, expect, it, vi } from "vitest";
import { createBus } from "./bus";

describe("bus lifecycle", () => {
    it("a late subscriber can read that boot already ended (outside voice #6)", () => {
        const bus = createBus();
        bus.emit("boot:end", { skipped: false });
        const late = vi.fn();
        bus.on("boot:end", late);
        expect(late).not.toHaveBeenCalled();
        expect(bus.lifecycle()).toMatchObject({ booted: true, bootSkipped: false });
    });

    it("tracks game activity and isolates a throwing handler", () => {
        const bus = createBus();
        const errors = vi.spyOn(console, "error").mockImplementation(() => {});
        const after = vi.fn();
        bus.on("game:start", () => {
            throw new Error("boom");
        });
        bus.on("game:start", after);
        bus.emit("game:start", {});
        expect(after).toHaveBeenCalled();
        expect(bus.lifecycle().gameActive).toBe(true);
        bus.emit("game:end", { score: 3, activeMs: 1000 });
        expect(bus.lifecycle().gameActive).toBe(false);
        errors.mockRestore();
    });

    it("unsubscribe stops delivery", () => {
        const bus = createBus();
        const h = vi.fn();
        const off = bus.on("idle", h);
        off();
        bus.emit("idle", {});
        expect(h).not.toHaveBeenCalled();
    });
});
