import { describe, expect, it, vi } from "vitest";
import { createBus } from "@/lib/os";
import { startOsAnalytics } from "./os";

describe("startOsAnalytics", () => {
    it("maps bus events to analytics events", () => {
        const bus = createBus();
        const send = vi.fn();
        startOsAnalytics(bus, send);
        bus.emit("boot:end", { skipped: false });
        bus.emit("app:open", { app: "builds", item: null });
        bus.emit("game:start", {});
        bus.emit("game:end", { score: 7, activeMs: 60000 });
        bus.emit("share:click", { channel: "copy" });
        bus.emit("share:complete", { channel: "copy" });
        expect(send.mock.calls).toEqual([
            ["boot_complete", { skipped: false }],
            ["app_open", { app: "builds", item: null }],
            ["game_start"],
            ["game_end", { score: 7, active_ms: 60000 }],
            ["share_click", { channel: "copy" }],
            ["share_complete", { channel: "copy" }],
        ]);
    });

    it("reports a boot that ended before it subscribed, exactly once", () => {
        const bus = createBus();
        bus.emit("boot:end", { skipped: true });
        const send = vi.fn();
        startOsAnalytics(bus, send);
        bus.emit("boot:end", { skipped: false });
        expect(send.mock.calls.filter(([e]) => e === "boot_complete")).toEqual([["boot_complete", { skipped: true }]]);
    });

    it("stops on cleanup", () => {
        const bus = createBus();
        const send = vi.fn();
        startOsAnalytics(bus, send)();
        bus.emit("game:start", {});
        expect(send).not.toHaveBeenCalled();
    });
});
