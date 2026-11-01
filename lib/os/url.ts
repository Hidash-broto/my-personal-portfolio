import { isWindowAppId, type WindowAppId } from "@/apps/registry";

export type ShellKind = "phone" | "desktop";

/** What is open, described entirely by the URL. The URL is the single owner of this. */
export interface OsUrlState {
    open: WindowAppId[];
    focus: WindowAppId | null;
    item: string | null;
    /** Score to beat, from a shared Bug Hunt link. On-screen target only. */
    challenge: number | null;
}

export const EMPTY_STATE: OsUrlState = { open: [], focus: null, item: null, challenge: null };

const ITEM_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;

function parseChallenge(raw: string | null): number | null {
    if (raw === null || !/^\d{1,4}$/.test(raw)) return null;
    return Math.min(200, Number(raw));
}

export function parseOsUrl(search: string): OsUrlState {
    const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    const ids = [...(params.get("w")?.split(",") ?? []), ...(params.get("app") ? [params.get("app") as string] : [])];
    const open: WindowAppId[] = [];
    for (const id of ids) if (isWindowAppId(id) && !open.includes(id)) open.push(id);

    const focusRaw = params.get("focus");
    const focus = isWindowAppId(focusRaw) && open.includes(focusRaw) ? focusRaw : (open.at(-1) ?? null);
    const itemRaw = params.get("item");
    const item = itemRaw && ITEM_RE.test(itemRaw) && open.length > 0 ? itemRaw : null;

    return { open, focus, item, challenge: open.includes("bughunt") ? parseChallenge(params.get("challenge")) : null };
}

/** Phone shows one app at a time (?app=); desktop keeps a window set (?w=&focus=). */
export function serializeOsUrl(state: OsUrlState, shell: ShellKind): string {
    if (state.open.length === 0) return "/";
    const params = new URLSearchParams();
    if (shell === "phone") {
        params.set("app", state.focus ?? state.open.at(-1)!);
    } else {
        params.set("w", state.open.join(","));
        if (state.focus) params.set("focus", state.focus);
    }
    if (state.item) params.set("item", state.item);
    if (state.challenge !== null) params.set("challenge", String(state.challenge));
    return `/?${params.toString().replaceAll("%2C", ",")}`;
}

export function withOpened(state: OsUrlState, app: WindowAppId, shell: ShellKind, item: string | null = null): OsUrlState {
    const open = shell === "phone" ? [app] : [...state.open.filter((a) => a !== app), app];
    return { open, focus: app, item, challenge: app === "bughunt" ? state.challenge : null };
}

export function withClosed(state: OsUrlState, app: WindowAppId): OsUrlState {
    const open = state.open.filter((a) => a !== app);
    const focus = state.focus === app ? (open.at(-1) ?? null) : state.focus;
    return { open, focus, item: state.focus === app ? null : state.item, challenge: open.includes("bughunt") ? state.challenge : null };
}

export function withFocused(state: OsUrlState, app: WindowAppId): OsUrlState {
    return state.open.includes(app) ? { ...state, focus: app } : state;
}
