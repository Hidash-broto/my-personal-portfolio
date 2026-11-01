/**
 * Runs inline in <head> before first paint. Decides which shell renders and whether the
 * boot plays, by setting data attributes on <html>. Must stay self-contained: it is
 * serialized with Function.prototype.toString.
 */
export function bootScript() {
    try {
        const root = document.documentElement;
        const coarse = window.matchMedia("(pointer: coarse)").matches;
        const shortSide = Math.min(window.innerWidth, window.innerHeight);
        root.dataset.shell = coarse && shortSide < 768 ? "phone" : "desktop";

        const params = new URLSearchParams(window.location.search);
        const deepLink = params.has("app") || params.has("w");
        let seen = /(?:^|;\s*)hos_seen=1/.test(document.cookie);
        try {
            seen = seen || window.localStorage.getItem("hos_seen") === "1";
        } catch {
            /* storage blocked: treat as unseen */
        }
        root.dataset.firstVisit = seen ? "0" : "1";
        root.dataset.boot = !seen && !deepLink && window.location.pathname === "/" ? "on" : "off";
    } catch {
        document.documentElement.dataset.shell = "desktop";
        document.documentElement.dataset.boot = "off";
    }
}

export const BOOT_SCRIPT = `(${bootScript.toString()})();`;

/** Remember the visit after the boot ends (cookie for the inline script, storage as a fallback). */
export function markSeen() {
    document.cookie = "hos_seen=1; Max-Age=31536000; Path=/; SameSite=Lax";
    try {
        window.localStorage.setItem("hos_seen", "1");
    } catch {
        /* ignore */
    }
}

export function readShell(): "phone" | "desktop" {
    return document.documentElement.dataset.shell === "phone" ? "phone" : "desktop";
}
