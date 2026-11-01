/**
 * Analytics client: anonymous PostHog capture over plain fetch (no SDK, nothing on the phone budget).
 *
 * - Off unless NEXT_PUBLIC_POSTHOG_KEY is set. Every event is still dispatched as a "hos:track"
 *   window event, so E2E tests can assert events fire without a key.
 * - Anonymous: a random id per browser session, `$process_person_profile: false`, no cookies.
 * - Every event carries the session facts the metrics need: first_visit, referred (share UTM on landing), shell.
 */

export type AnalyticsEvent =
    | "boot_complete"
    | "app_open"
    | "game_start"
    | "game_end"
    | "share_click"
    | "share_complete"
    | "share_page_view"
    | "share_cta_click";

export type Props = Record<string, string | number | boolean | null>;

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = (process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com").replace(/\/$/, "");
const SESSION_KEY = "hos_analytics";

interface Session {
    id: string;
    first_visit: boolean;
    referred: boolean;
    utm_source: string | null;
    utm_campaign: string | null;
}

let memory: Session | null = null;

function randomId() {
    return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** The session is fixed at landing: first_visit and the share UTM are read once and kept for the whole visit. */
export function session(): Session {
    if (memory) return memory;
    try {
        const saved = sessionStorage.getItem(SESSION_KEY);
        if (saved) return (memory = JSON.parse(saved) as Session);
    } catch {
        // storage blocked: fall through to an in-memory session
    }
    const params = new URLSearchParams(window.location.search);
    memory = {
        id: randomId(),
        first_visit: document.documentElement.dataset.firstVisit === "1",
        referred: params.get("utm_medium") === "share" && params.get("utm_campaign") === "bughunt",
        utm_source: params.get("utm_source"),
        utm_campaign: params.get("utm_campaign"),
    };
    try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(memory));
    } catch {
        // ignore
    }
    return memory;
}

export function track(event: AnalyticsEvent, props: Props = {}) {
    if (typeof window === "undefined") return;
    const s = session();
    const properties = {
        ...props,
        first_visit: s.first_visit,
        referred: s.referred,
        utm_source: s.utm_source,
        utm_campaign: s.utm_campaign,
        shell: document.documentElement.dataset.shell ?? null,
        $current_url: window.location.origin + window.location.pathname,
        $pathname: window.location.pathname,
        $process_person_profile: false,
    };
    window.dispatchEvent(new CustomEvent("hos:track", { detail: { event, properties } }));
    if (!KEY) return;
    fetch(`${HOST}/i/v0/e/`, {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: KEY, event, distinct_id: s.id, properties }),
    }).catch(() => {});
}

/** Test seam. */
export function resetAnalyticsSession() {
    memory = null;
}
