/** Server-only helpers for the Bug Hunt API routes and the share page. */
import { BUGS, bugsFromMask, type Bug } from "@/data/bugs";
import { issueShare, issueStart, keyringFromEnv, readShare, type Keyring, type ResultInput } from "@/lib/share/token";

export const MAX_BODY_BYTES = 2048;

const NO_STORE = { "cache-control": "no-store" };

export function json(body: unknown, status = 200): Response {
    return Response.json(body, { status, headers: NO_STORE });
}

/** A keyring that can sign, or null when SHARE_SECRET is missing or too short. */
export function signingKeyring(env: Record<string, string | undefined> = process.env): Keyring | null {
    const ring = keyringFromEnv(env);
    return ring.length > 0 && ring[0].secret.length >= 32 ? ring : null;
}

/** Defensive parse of the result body: exact shape, finite numbers, bounded strings. */
export function parseResultBody(text: string): { ok: true; input: ResultInput } | { ok: false; reason: string } {
    if (text.length > MAX_BODY_BYTES) return { ok: false, reason: "too-large" };
    let data: unknown;
    try {
        data = JSON.parse(text);
    } catch {
        return { ok: false, reason: "bad-json" };
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) return { ok: false, reason: "bad-shape" };
    const { nonce, score, activeMs, mask } = data as Record<string, unknown>;
    if (typeof nonce !== "string" || nonce.length === 0 || nonce.length > 512) return { ok: false, reason: "bad-shape" };
    for (const n of [score, activeMs, mask]) {
        if (typeof n !== "number" || !Number.isFinite(n)) return { ok: false, reason: "bad-shape" };
    }
    return { ok: true, input: { nonce, score: score as number, activeMs: activeMs as number, mask: mask as number } };
}

export async function handleStart(env: Record<string, string | undefined> = process.env): Promise<Response> {
    const keyring = signingKeyring(env);
    if (!keyring) return json({ reason: "not-configured" }, 503);
    return json({ nonce: await issueStart(keyring) });
}

export async function handleResult(request: Request, env: Record<string, string | undefined> = process.env): Promise<Response> {
    const keyring = signingKeyring(env);
    if (!keyring) return json({ reason: "not-configured" }, 503);
    const declared = Number(request.headers.get("content-length") ?? 0);
    if (declared > MAX_BODY_BYTES) return json({ reason: "too-large" }, 422);
    let text: string;
    try {
        text = await request.text();
    } catch {
        return json({ reason: "bad-body" }, 422);
    }
    const parsed = parseResultBody(text);
    if (!parsed.ok) return json({ reason: parsed.reason }, 422);
    const check = await issueShare(parsed.input, keyring);
    return check.ok ? json({ token: check.token }) : json({ reason: check.reason }, 422);
}

export type ShareCard =
    | { valid: true; score: number; bugs: Bug[]; at: number }
    | { valid: false; bugs: readonly Bug[] };

/** Verify a share token for the share page and its OG image. Invalid tokens get the generic card. */
export async function loadShareCard(token: string, keyring: Keyring = keyringFromEnv(), now = Date.now()): Promise<ShareCard> {
    if (keyring.length > 0 && typeof token === "string" && token.length <= 512) {
        try {
            const claims = await readShare(token, keyring, now);
            if (claims) return { valid: true, score: claims.s, bugs: bugsFromMask(claims.m), at: claims.t };
        } catch {
            /* fall through to the generic card */
        }
    }
    return { valid: false, bugs: BUGS };
}

export function shareCopy(card: ShareCard): { title: string; description: string } {
    if (!card.valid) {
        return {
            title: "Bug Hunt — Hidash OS",
            description: "Catch the shortcuts that sink startups. A 60-second game on Muhammed Hidash's portfolio OS.",
        };
    }
    const noun = card.score === 1 ? "bug" : "bugs";
    return {
        title: `I debugged Hidash OS · ${card.score} ${noun}`,
        description: `Can you beat ${card.score}? A 60-second Bug Hunt on Muhammed Hidash's portfolio OS.`,
    };
}

export function challengeHref(score: number): string {
    return `/?app=bughunt&item=play&challenge=${score}`;
}
