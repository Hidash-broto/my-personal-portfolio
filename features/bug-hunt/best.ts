/**
 * Today's best score, kept in localStorage under `hos_bughunt_best` as
 * `{"day":"YYYY-MM-DD","score":N}` (local day). Widgets elsewhere in the OS can read it
 * with `readBest()` and listen with `subscribeBest()`.
 */
export const BEST_KEY = "hos_bughunt_best";
const CHANGE_EVENT = "hos:bughunt-best";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function storage(): StorageLike | null {
    try {
        return typeof window === "undefined" ? null : window.localStorage;
    } catch {
        return null;
    }
}

export function dayKey(now: Date = new Date()): string {
    const p = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

/** Today's best, or null if none (or if the stored best is from another day). */
export function readBest(store: StorageLike | null = storage(), now: Date = new Date()): number | null {
    try {
        const raw = store?.getItem(BEST_KEY);
        if (!raw) return null;
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return null;
        const { day, score } = parsed as { day?: unknown; score?: unknown };
        if (day !== dayKey(now) || typeof score !== "number" || !Number.isInteger(score) || score < 0) return null;
        return score;
    } catch {
        return null;
    }
}

/** Store a finished round's score; returns today's best and whether this round set it. */
export function recordScore(score: number, store: StorageLike | null = storage(), now: Date = new Date()): { best: number; isNew: boolean } {
    const previous = readBest(store, now);
    if (previous !== null && previous >= score) return { best: previous, isNew: false };
    try {
        store?.setItem(BEST_KEY, JSON.stringify({ day: dayKey(now), score }));
        if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch {
        /* storage full or blocked: the round still counts on screen */
    }
    return { best: score, isNew: score > 0 };
}

export function subscribeBest(callback: () => void): () => void {
    window.addEventListener(CHANGE_EVENT, callback);
    window.addEventListener("storage", callback);
    return () => {
        window.removeEventListener(CHANGE_EVENT, callback);
        window.removeEventListener("storage", callback);
    };
}
