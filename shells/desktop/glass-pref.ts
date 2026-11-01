/**
 * "Reduce transparency" preference: sets <html data-glass="solid"> (tokens.css swaps every
 * glass surface to solid) and persists in localStorage `hos_glass`.
 */
import { os } from "@/lib/os";

const KEY = "hos_glass";
const listeners = new Set<() => void>();

export function readGlassPref(): boolean {
    try {
        return window.localStorage.getItem(KEY) === "solid";
    } catch {
        return false;
    }
}

export function applyGlassPref(solid: boolean) {
    const root = document.documentElement;
    if (solid) root.dataset.glass = "solid";
    // A Bug Hunt round forces solid glass too; leave it alone until the round ends.
    else if (!os.lifecycle().gameActive) delete root.dataset.glass;
}

export function setGlassPref(solid: boolean) {
    try {
        if (solid) window.localStorage.setItem(KEY, "solid");
        else window.localStorage.removeItem(KEY);
    } catch {
        // Storage blocked (private mode, some webviews): still apply for this session.
    }
    applyGlassPref(solid);
    for (const listener of listeners) listener();
}

export function subscribeGlassPref(listener: () => void) {
    listeners.add(listener);
    window.addEventListener("storage", listener);
    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", listener);
    };
}
