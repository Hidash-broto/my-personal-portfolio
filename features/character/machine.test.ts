import { describe, expect, it } from "vitest";
import { createBus, type Lifecycle } from "@/lib/os";
import { INITIAL, TIMINGS, appContext, connect, reduce, view, type CharEvent, type CharModel } from "./machine";

const LIFE: Lifecycle = { booted: false, bootSkipped: false, firstVisit: true, gameActive: false };

function run(events: CharEvent[], from: CharModel = INITIAL): CharModel {
    return events.reduce(reduce, from);
}

/** Fire the pending timer, as the component would. */
function elapse(m: CharModel): CharModel {
    if (!m.timer) throw new Error("no timer pending");
    return reduce(m, { type: "timeout", id: m.timer.id });
}

describe("character machine: boot and greeting", () => {
    it("greets when it mounts after boot:end already fired (late mount)", () => {
        const bus = createBus();
        bus.emit("boot:end", { skipped: false });
        let m = INITIAL;
        const off = connect(bus, (e) => (m = reduce(m, e)));
        expect(m.pose).toBe("wave");
        expect(m.bubble).toBe(true);
        expect(m.timer).toMatchObject({ ms: TIMINGS.greetWave, to: "idle" });
        m = elapse(m);
        expect(m.pose).toBe("idle");
        expect(m.bubble).toBe(true); // the bubble outlives the wave
        off();
    });

    it("waits when mounted before the boot, then greets once on boot:end", () => {
        const bus = createBus();
        let m = INITIAL;
        connect(bus, (e) => (m = reduce(m, e)));
        expect(m).toMatchObject({ pose: "idle", bubble: false });
        bus.emit("boot:end", { skipped: false });
        expect(m).toMatchObject({ pose: "wave", bubble: true, greeted: true });
        m = reduce(elapse(m), { type: "dismiss" });
        bus.emit("boot:end", { skipped: false });
        expect(m).toMatchObject({ pose: "idle", bubble: false });
    });

    it("does not greet on a deep link (boot skipped), whether it mounts early or late", () => {
        const late = createBus();
        late.emit("boot:end", { skipped: true });
        let m = INITIAL;
        connect(late, (e) => (m = reduce(m, e)));
        expect(m).toMatchObject({ pose: "idle", bubble: false, timer: null });

        const early = createBus();
        let n = INITIAL;
        connect(early, (e) => (n = reduce(n, e)));
        early.emit("boot:end", { skipped: true });
        expect(n).toMatchObject({ pose: "idle", bubble: false });
    });

    it("does not greet twice on a remount in the same page", () => {
        const m = reduce(INITIAL, { type: "sync", lifecycle: { ...LIFE, booted: true }, greeted: true });
        expect(m).toMatchObject({ pose: "idle", bubble: false });
    });

    it("unsubscribes cleanly", () => {
        const bus = createBus();
        let m = INITIAL;
        const off = connect(bus, (e) => (m = reduce(m, e)));
        off();
        bus.emit("game:start", {});
        expect(m.game).toBe(false);
    });
});

describe("character machine: reactions", () => {
    it("idle → sleep, and any activity wakes him", () => {
        let m = run([{ type: "idle" }]);
        expect(m.pose).toBe("sleep");
        m = reduce(m, { type: "activity" });
        expect(m.pose).toBe("idle");
    });

    it("sleeping hides the greeting bubble", () => {
        const m = run([{ type: "boot:end", skipped: false }, { type: "idle" }]);
        expect(m).toMatchObject({ pose: "sleep", bubble: false, timer: null });
    });

    it("any app:open points briefly then returns to idle", () => {
        let m = run([{ type: "boot:end", skipped: false }, { type: "app:open", app: "journey" }]);
        expect(m).toMatchObject({ pose: "point", bubble: false });
        expect(m.timer?.ms).toBe(TIMINGS.point);
        m = elapse(m);
        expect(m.pose).toBe("idle");
    });

    it("game:start → panic badge; game:end → celebrate for 2s → idle", () => {
        let m = run([{ type: "game:start" }]);
        expect(m).toMatchObject({ pose: "panic", game: true });
        expect(view(m, "desktop", "bughunt").layout).toBe("badge");
        expect(view(m, "phone", "bughunt").layout).toBe("badge");

        // Ignored while playing.
        m = run([{ type: "idle" }, { type: "tap" }, { type: "app:open", app: "builds" }], m);
        expect(m.pose).toBe("panic");

        m = reduce(m, { type: "game:end" });
        expect(m).toMatchObject({ pose: "celebrate", game: false });
        expect(m.timer).toMatchObject({ ms: 2000, to: "idle" });
        m = elapse(m);
        expect(m.pose).toBe("idle");
    });

    it("mounting mid-game goes straight to the panic badge", () => {
        const m = reduce(INITIAL, { type: "sync", lifecycle: { ...LIFE, booted: true, gameActive: true } });
        expect(m).toMatchObject({ pose: "panic", game: true, bubble: false });
    });

    it("ignores a stale timer", () => {
        let m = run([{ type: "tap" }]);
        const stale = m.timer!.id;
        m = reduce(m, { type: "game:start" });
        m = reduce(m, { type: "timeout", id: stale });
        expect(m.pose).toBe("panic");
    });

    it("tap waves and then settles", () => {
        let m = run([{ type: "idle" }, { type: "tap" }]);
        expect(m.pose).toBe("wave");
        m = elapse(m);
        expect(m.pose).toBe("idle");
    });

    it("show-me walk: point while walking, cancel returns to idle", () => {
        let m = run([{ type: "boot:end", skipped: false }, { type: "walk:start" }]);
        expect(m).toMatchObject({ pose: "point", walking: true, bubble: false, timer: null });
        expect(reduce(m, { type: "idle" }).pose).toBe("point");
        m = reduce(m, { type: "walk:cancel" });
        expect(m).toMatchObject({ pose: "idle", walking: false });
    });
});

describe("character machine: view", () => {
    const greeted = run([{ type: "boot:end", skipped: false }]);

    it("phone + an app open → hidden, no bubble", () => {
        expect(view(greeted, "phone", appContext(["journey"]))).toEqual({ state: "hidden", layout: "none", bubble: false });
    });

    it("phone home screen → visible with bubble; Bug Hunt open → badge", () => {
        expect(view(greeted, "phone", appContext([]))).toEqual({ state: "wave", layout: "home", bubble: true });
        expect(view(greeted, "phone", appContext(["bughunt"]))).toMatchObject({ layout: "badge", bubble: false });
    });

    it("desktop keeps him on the dock while windows are open", () => {
        expect(view(greeted, "desktop", appContext(["journey", "builds"]))).toEqual({ state: "wave", layout: "dock", bubble: true });
    });
});
