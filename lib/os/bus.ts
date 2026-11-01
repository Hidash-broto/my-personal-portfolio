import type { WindowAppId } from "@/apps/registry";
import type { BugId } from "@/data/bugs";

export type ShareChannel = "native" | "linkedin" | "copy";

export interface OsEvents {
    "boot:end": { skipped: boolean };
    "app:open": { app: WindowAppId; item: string | null };
    "app:close": { app: WindowAppId };
    "window:focus": { app: WindowAppId };
    idle: Record<string, never>;
    "game:start": Record<string, never>;
    "game:catch": { bug: BugId };
    "game:end": { score: number; activeMs: number };
    "share:click": { channel: ShareChannel };
    /** The share actually happened: navigator.share resolved or the link was copied. */
    "share:complete": { channel: ShareChannel };
}

/** Sticky facts a late subscriber reads on mount, so it never misses an event that already fired. */
export interface Lifecycle {
    booted: boolean;
    bootSkipped: boolean;
    firstVisit: boolean;
    gameActive: boolean;
}

type Handler<K extends keyof OsEvents> = (payload: OsEvents[K]) => void;

export function createBus(initial: Partial<Lifecycle> = {}) {
    const handlers = new Map<keyof OsEvents, Set<Handler<never>>>();
    let lifecycle: Lifecycle = { booted: false, bootSkipped: false, firstVisit: false, gameActive: false, ...initial };

    function on<K extends keyof OsEvents>(event: K, handler: Handler<K>): () => void {
        const set = handlers.get(event) ?? new Set();
        set.add(handler as Handler<never>);
        handlers.set(event, set);
        return () => set.delete(handler as Handler<never>);
    }

    function emit<K extends keyof OsEvents>(event: K, payload: OsEvents[K]) {
        if (event === "boot:end") lifecycle = { ...lifecycle, booted: true, bootSkipped: (payload as OsEvents["boot:end"]).skipped };
        if (event === "game:start") lifecycle = { ...lifecycle, gameActive: true };
        if (event === "game:end") lifecycle = { ...lifecycle, gameActive: false };
        for (const handler of handlers.get(event) ?? []) {
            try {
                (handler as Handler<K>)(payload);
            } catch (error) {
                console.error(`[hidash-os] handler for ${event} failed`, error);
            }
        }
    }

    return {
        on,
        emit,
        lifecycle: (): Lifecycle => lifecycle,
        setFirstVisit: (firstVisit: boolean) => {
            lifecycle = { ...lifecycle, firstVisit };
        },
    };
}

export type OsBus = ReturnType<typeof createBus>;

/** The one bus for the page. */
export const os = createBus();
