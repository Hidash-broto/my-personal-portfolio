/** Client side of the share loop: start nonce → signed result token → share URL. */
import type { RoundResult } from "./engine";

export type ShareSource = "native-share" | "linkedin" | "copy-link";

export interface ResultPayload {
    nonce: string;
    score: number;
    activeMs: number;
    mask: number;
}

export type TokenOutcome =
    | { status: "ready"; token: string }
    /** Sharing a signed score is not possible (no nonce, or the server has no secret). */
    | { status: "unavailable" }
    /** The server refused the score (implausible, expired…). Retrying will not help. */
    | { status: "rejected"; reason: string }
    /** Network or server error. Worth a retry. */
    | { status: "error" };

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export function resultPayload(nonce: string, result: Pick<RoundResult, "score" | "activeMs" | "mask">): ResultPayload {
    return { nonce, score: result.score, activeMs: result.activeMs, mask: result.mask };
}

/** `${origin}/bug-hunt/s/${token}` with UTM tags, or the generic `/bug-hunt` page without a token. */
export function shareUrl(origin: string, token: string | null, source: ShareSource): string {
    const path = token ? `/bug-hunt/s/${encodeURIComponent(token)}` : "/bug-hunt";
    const params = new URLSearchParams({ utm_source: source, utm_medium: "share", utm_campaign: "bughunt" });
    return `${origin.replace(/\/$/, "")}${path}?${params.toString()}`;
}

export function linkedInShareUrl(url: string): string {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

export function shareText(score: number): string {
    return score === 1
        ? "I caught 1 bug in Hidash OS. Can you beat it?"
        : `I caught ${score} bugs in Hidash OS. Can you beat it?`;
}

/** POST /api/bug-hunt/start. Null when the API is down or not configured; the round still plays. */
export async function fetchNonce(fetchImpl: FetchLike = fetch): Promise<string | null> {
    try {
        const res = await fetchImpl("/api/bug-hunt/start", { method: "POST" });
        if (!res.ok) return null;
        const body: unknown = await res.json();
        const nonce = (body as { nonce?: unknown } | null)?.nonce;
        return typeof nonce === "string" && nonce.length > 0 ? nonce : null;
    } catch {
        return null;
    }
}

/** POST /api/bug-hunt/result and classify the answer. */
export async function requestShareToken(
    nonce: string | null,
    result: Pick<RoundResult, "score" | "activeMs" | "mask">,
    fetchImpl: FetchLike = fetch,
): Promise<TokenOutcome> {
    if (!nonce) return { status: "unavailable" };
    let res: Response;
    try {
        res = await fetchImpl("/api/bug-hunt/result", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(resultPayload(nonce, result)),
        });
    } catch {
        return { status: "error" };
    }
    let body: unknown = null;
    try {
        body = await res.json();
    } catch {
        /* non-JSON error page */
    }
    if (res.ok) {
        const token = (body as { token?: unknown } | null)?.token;
        return typeof token === "string" && token.length > 0 ? { status: "ready", token } : { status: "error" };
    }
    const reason = (body as { reason?: unknown } | null)?.reason;
    if (res.status === 503 && reason === "not-configured") return { status: "unavailable" };
    if (res.status === 422) return { status: "rejected", reason: typeof reason === "string" ? reason : "rejected" };
    return { status: "error" };
}

/** Resolves to the promise's value, or `fallback` after `ms`. */
export function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
    return new Promise((resolve) => {
        const timer = setTimeout(() => resolve(fallback), ms);
        promise.then(
            (value) => {
                clearTimeout(timer);
                resolve(value);
            },
            () => {
                clearTimeout(timer);
                resolve(fallback);
            },
        );
    });
}

/** Clipboard with a fallback for webviews that block the async clipboard API. */
export async function copyText(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        try {
            const area = document.createElement("textarea");
            area.value = text;
            area.setAttribute("readonly", "");
            area.style.position = "fixed";
            area.style.opacity = "0";
            document.body.appendChild(area);
            area.select();
            const ok = document.execCommand("copy");
            area.remove();
            return ok;
        } catch {
            return false;
        }
    }
}
