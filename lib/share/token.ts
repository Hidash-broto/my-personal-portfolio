/**
 * Signed Bug Hunt tokens (HMAC-SHA256, Web Crypto; works in Node and edge runtimes).
 * A start nonce and a share token use different `typ`, so one can never pass as the other.
 * The plausibility check is a bound, not proof of fair play.
 */
import { BUG_IDS, MAX_CATCHES_PER_SECOND, MAX_SCORE } from "@/data/bugs";

export interface StartClaims { typ: "start"; k: string; startedAt: number }
export interface ShareClaims { typ: "share"; k: string; s: number; t: number; m: number }
type Claims = StartClaims | ShareClaims;

/** Secrets by key id. The first entry signs; all entries verify (rotation). */
export type Keyring = readonly { kid: string; secret: string }[];

const enc = new TextEncoder();
const MAX_MASK = (1 << BUG_IDS.length) - 1;
const ACTIVE_MAX_MS = 65_000;
const CLOCK_SKEW_MS = 2_000;
const START_TTL_MS = 30 * 60_000;

function b64url(bytes: Uint8Array): string {
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromB64url(text: string): Uint8Array | null {
    if (!/^[A-Za-z0-9_-]*$/.test(text)) return null;
    try {
        const bin = atob(text.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((text.length + 3) % 4));
        return Uint8Array.from(bin, (c) => c.charCodeAt(0));
    } catch {
        return null;
    }
}

async function hmacKey(secret: string) {
    return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function sign(claims: Claims, keyring: Keyring): Promise<string> {
    const signer = keyring[0];
    if (!signer || signer.secret.length < 32) throw new Error("SHARE_SECRET must be at least 32 characters");
    const body = b64url(enc.encode(JSON.stringify({ ...claims, k: signer.kid })));
    const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(signer.secret), enc.encode(body)));
    return `${body}.${b64url(sig)}`;
}

async function verify(token: string, keyring: Keyring): Promise<Claims | null> {
    if (typeof token !== "string" || token.length > 512) return null;
    const [body, sigText, extra] = token.split(".");
    if (!body || !sigText || extra !== undefined) return null;
    const json = fromB64url(body);
    const sig = fromB64url(sigText);
    if (!json || !sig) return null;
    let claims: Claims;
    try {
        claims = JSON.parse(new TextDecoder().decode(json));
    } catch {
        return null;
    }
    const key = keyring.find((k) => k.kid === claims?.k);
    if (!key) return null;
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(key.secret), sig as BufferSource, enc.encode(body));
    return ok ? claims : null;
}

export async function issueStart(keyring: Keyring, now = Date.now()): Promise<string> {
    return sign({ typ: "start", k: "", startedAt: now }, keyring);
}

export interface ResultInput {
    nonce: string;
    score: number;
    activeMs: number;
    mask: number;
}

export type ResultCheck = { ok: true; token: string } | { ok: false; reason: string };

export async function issueShare(input: ResultInput, keyring: Keyring, now = Date.now()): Promise<ResultCheck> {
    const start = await verify(input.nonce, keyring);
    if (!start || start.typ !== "start") return { ok: false, reason: "bad-nonce" };
    if (now - start.startedAt > START_TTL_MS) return { ok: false, reason: "expired" };
    const { score, activeMs, mask } = input;
    if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE) return { ok: false, reason: "score-range" };
    if (!Number.isInteger(mask) || mask < 0 || mask > MAX_MASK) return { ok: false, reason: "mask-range" };
    if (!Number.isFinite(activeMs) || activeMs < 0 || activeMs > ACTIVE_MAX_MS) return { ok: false, reason: "active-range" };
    if (activeMs > now - start.startedAt + CLOCK_SKEW_MS) return { ok: false, reason: "active-exceeds-wall" };
    if (score > Math.ceil((MAX_CATCHES_PER_SECOND * activeMs) / 1000)) return { ok: false, reason: "implausible" };
    if (score === 0 && mask !== 0) return { ok: false, reason: "mask-without-score" };
    const token = await sign({ typ: "share", k: "", s: score, t: now, m: mask }, keyring);
    return { ok: true, token };
}

export async function readShare(token: string, keyring: Keyring, now = Date.now()): Promise<ShareClaims | null> {
    const claims = await verify(token, keyring);
    if (!claims || claims.typ !== "share") return null;
    const { s, t, m } = claims;
    if (!Number.isInteger(s) || s < 0 || s > MAX_SCORE) return null;
    if (!Number.isInteger(m) || m < 0 || m > MAX_MASK) return null;
    if (!Number.isFinite(t) || t > now + CLOCK_SKEW_MS) return null;
    return claims;
}

/** Keyring from env: SHARE_SECRET (current) and optional SHARE_SECRET_PREV (rotation). */
export function keyringFromEnv(env: Record<string, string | undefined> = process.env): Keyring {
    const ring: { kid: string; secret: string }[] = [];
    if (env.SHARE_SECRET) ring.push({ kid: env.SHARE_KID ?? "k1", secret: env.SHARE_SECRET });
    if (env.SHARE_SECRET_PREV) ring.push({ kid: env.SHARE_KID_PREV ?? "k0", secret: env.SHARE_SECRET_PREV });
    return ring;
}
