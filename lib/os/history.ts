import type { WindowAppId } from "@/apps/registry";
import { parseOsUrl, serializeOsUrl, withClosed, withFocused, withOpened, type OsUrlState, type ShellKind } from "./url";

export interface HistoryPort {
    /** Current path + search, e.g. "/?app=builds". */
    current(): string;
    push(url: string): void;
    replace(url: string): void;
    back(): void;
}

export const browserHistoryPort: HistoryPort = {
    current: () => window.location.pathname + window.location.search,
    push: (url) => window.history.pushState(null, "", url),
    replace: (url) => window.history.replaceState(null, "", url),
    back: () => window.history.back(),
};

/**
 * Drives the browser history from OS intents. Rules (design doc › History):
 * - open pushes an entry;
 * - close goes back only when the previous OS-pushed entry equals the resulting state,
 *   otherwise it replaces the current entry;
 * - focus replaces (desktop), minimize never touches the URL;
 * - a deep-link landing inserts a base "/" entry so the first back stays on the site.
 */
export function createOsHistory(shell: ShellKind, port: HistoryPort = browserHistoryPort) {
    /** URLs this OS pushed, oldest first. Index 0 is the landing entry. */
    let stack: string[] = [port.current()];

    const state = (): OsUrlState => parseOsUrl(port.current().split("?")[1] ?? "");

    function go(next: OsUrlState) {
        const url = serializeOsUrl(next, shell);
        if (url === port.current()) return;
        const current = state();
        const sameSet = current.open.length === next.open.length && current.open.every((a) => next.open.includes(a));
        // Selecting an item inside an already-open, focused app (sidebar arrows) replaces, so history doesn't fill up.
        // The phone shows one app at a time: switching apps replaces too, so back always lands on home.
        if ((sameSet && current.focus === next.focus) || (shell === "phone" && current.open.length > 0)) {
            port.replace(url);
            stack[stack.length - 1] = url;
            return;
        }
        port.push(url);
        stack.push(url);
    }

    return {
        state,

        /** Call once on mount. */
        landing(): { deepLink: boolean } {
            const current = port.current();
            const deepLink = state().open.length > 0;
            if (deepLink) {
                port.replace("/");
                port.push(current);
                stack = ["/", current];
            } else {
                stack = [current];
            }
            return { deepLink };
        },

        open(app: WindowAppId, item: string | null = null) {
            go(withOpened(state(), app, shell, item));
        },

        close(app: WindowAppId) {
            const next = serializeOsUrl(withClosed(state(), app), shell);
            const previous = stack.at(-2);
            if (previous !== undefined && previous === next) {
                stack.pop();
                port.back();
            } else {
                port.replace(next);
                stack[stack.length - 1] = next;
            }
        },

        focus(app: WindowAppId) {
            const next = serializeOsUrl(withFocused(state(), app), shell);
            if (next === port.current()) return;
            port.replace(next);
            stack[stack.length - 1] = next;
        },

        /** Browser back/forward happened; keep our stack aligned with the new URL. */
        onPopState() {
            const current = port.current();
            const at = stack.lastIndexOf(current);
            stack = at >= 0 ? stack.slice(0, at + 1) : [current];
        },
    };
}

export type OsHistory = ReturnType<typeof createOsHistory>;
