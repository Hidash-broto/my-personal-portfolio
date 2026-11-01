/**
 * Mini-Hidash behavior, as a pure reducer. No React, no timers, no DOM:
 * the component owns side effects (scheduling `timer`, listening to the bus)
 * and feeds events in. The Rive state machine mirrors `Pose` 1:1 (see rive.ts).
 */
import type { Lifecycle, OsBus, ShellKind } from "@/lib/os";

/** Every pose the art has. `walking` is a flag on top of `point`, not a pose. */
export const POSES = ["idle", "wave", "point", "type", "celebrate", "sleep", "panic"] as const;
export type Pose = (typeof POSES)[number];
/** What is on screen: a pose, or nothing (phone, inside a full-screen app). */
export type CharState = Pose | "hidden";
/** Where the character is drawn. */
export type CharLayout = "dock" | "home" | "badge" | "none";

export const TIMINGS = {
    /** Greeting wave after the boot, then idle. */
    greetWave: 2400,
    /** Wave after a tap. */
    tapWave: 1600,
    /** Brief point when any app opens. */
    point: 1200,
    /** Celebration when a Bug Hunt round ends. */
    celebrate: 2000,
    /** Desktop "Show me": time spent walking toward the dock before Builds opens. */
    walk: 900,
    /** The greeting bubble hides itself after this long. */
    bubbleAutoHide: 12000,
} as const;

interface Timer {
    id: number;
    ms: number;
    to: Pose;
}

export interface CharModel {
    pose: Pose;
    /** Greeting bubble requested. Whether it is drawn also depends on layout (see `view`). */
    bubble: boolean;
    /** The greeting played once this page load; never repeat it. */
    greeted: boolean;
    /** A Bug Hunt round is running. */
    game: boolean;
    /** Desktop "Show me" walk in progress. */
    walking: boolean;
    /** Pending timed transition; the component schedules it and sends `timeout` with its id. */
    timer: Timer | null;
    seq: number;
}

export type CharEvent =
    /** Mount: the sticky lifecycle, read BEFORE subscribing to the bus. */
    | { type: "sync"; lifecycle: Lifecycle; greeted?: boolean }
    | { type: "boot:end"; skipped: boolean }
    | { type: "app:open"; app: string }
    | { type: "idle" }
    /** Any visitor input while asleep. */
    | { type: "activity" }
    | { type: "game:start" }
    | { type: "game:end" }
    | { type: "tap" }
    | { type: "dismiss" }
    | { type: "walk:start" }
    | { type: "walk:end" }
    | { type: "walk:cancel" }
    | { type: "timeout"; id: number };

export const INITIAL: CharModel = {
    pose: "idle",
    bubble: false,
    greeted: false,
    game: false,
    walking: false,
    timer: null,
    seq: 0,
};

function after(m: CharModel, ms: number, to: Pose): CharModel {
    const id = m.seq + 1;
    return { ...m, seq: id, timer: { id, ms, to } };
}

function settle(m: CharModel, pose: Pose): CharModel {
    return { ...m, pose, timer: null };
}

function greet(m: CharModel): CharModel {
    return after({ ...m, pose: "wave", bubble: true, greeted: true, walking: false }, TIMINGS.greetWave, "idle");
}

export function reduce(m: CharModel, e: CharEvent): CharModel {
    switch (e.type) {
        case "sync": {
            const base: CharModel = { ...m, greeted: m.greeted || Boolean(e.greeted) };
            if (e.lifecycle.gameActive) return settle({ ...base, game: true, bubble: false, walking: false }, "panic");
            if (!e.lifecycle.booted) return base;
            if (!e.lifecycle.bootSkipped && !base.greeted) return greet(base);
            return base;
        }
        case "boot:end":
            if (m.game) return m;
            if (e.skipped) return m.greeted ? m : settle({ ...m, bubble: false }, "idle");
            return m.greeted ? m : greet(m);
        case "app:open":
            if (m.game) return m;
            return after({ ...m, pose: "point", bubble: false, walking: false }, TIMINGS.point, "idle");
        case "idle":
            if (m.game || m.walking) return m;
            return settle({ ...m, bubble: false }, "sleep");
        case "activity":
            return m.pose === "sleep" ? settle(m, "idle") : m;
        case "game:start":
            return settle({ ...m, game: true, bubble: false, walking: false }, "panic");
        case "game:end":
            return after({ ...m, game: false, pose: "celebrate", walking: false }, TIMINGS.celebrate, "idle");
        case "tap":
            if (m.game || m.walking) return m;
            return after({ ...m, pose: "wave" }, TIMINGS.tapWave, "idle");
        case "dismiss":
            return m.bubble ? { ...m, bubble: false } : m;
        case "walk:start":
            if (m.game) return m;
            return settle({ ...m, walking: true, bubble: false }, "point");
        case "walk:end":
            return m.walking ? after({ ...m, walking: false, pose: "point" }, TIMINGS.point, "idle") : m;
        case "walk:cancel":
            return m.walking ? settle({ ...m, walking: false }, "idle") : m;
        case "timeout":
            return m.timer && m.timer.id === e.id ? settle(m, m.timer.to) : m;
    }
}

/** What the URL says is open, reduced to what the character cares about. */
export type AppContext = "none" | "app" | "bughunt";

export function appContext(open: readonly string[]): AppContext {
    if (open.includes("bughunt")) return "bughunt";
    return open.length > 0 ? "app" : "none";
}

export interface CharView {
    state: CharState;
    layout: CharLayout;
    bubble: boolean;
}

/**
 * Derive what to draw. The phone shows one full-screen app at a time, so the character
 * hides inside any app except Bug Hunt, where he becomes the corner badge.
 */
export function view(m: CharModel, shell: ShellKind, app: AppContext): CharView {
    if (shell === "phone" && app === "app" && !m.game) return { state: "hidden", layout: "none", bubble: false };
    const badge = m.game || (shell === "phone" && app === "bughunt");
    const layout: CharLayout = badge ? "badge" : shell === "phone" ? "home" : "dock";
    return { state: m.pose, layout, bubble: m.bubble && !badge };
}

/**
 * Wire a dispatcher to the bus. Reads the sticky lifecycle FIRST, then subscribes,
 * so a late mount after `boot:end` still greets and a deep link never does.
 */
export function connect(
    bus: Pick<OsBus, "on" | "lifecycle">,
    dispatch: (e: CharEvent) => void,
    options: { greeted?: boolean } = {},
): () => void {
    dispatch({ type: "sync", lifecycle: bus.lifecycle(), greeted: options.greeted });
    const offs = [
        bus.on("boot:end", ({ skipped }) => dispatch({ type: "boot:end", skipped })),
        bus.on("app:open", ({ app }) => dispatch({ type: "app:open", app })),
        bus.on("idle", () => dispatch({ type: "idle" })),
        bus.on("game:start", () => dispatch({ type: "game:start" })),
        bus.on("game:end", () => dispatch({ type: "game:end" })),
    ];
    return () => {
        for (const off of offs) off();
    };
}
