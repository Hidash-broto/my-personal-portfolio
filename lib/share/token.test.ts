import { describe, expect, it } from "vitest";
import { issueShare, issueStart, keyringFromEnv, readShare, type Keyring } from "./token";

const ring: Keyring = [{ kid: "k1", secret: "a".repeat(32) }];
const T0 = 1_790_000_000_000;

async function play(score: number, activeMs: number, mask = 1, elapsed = activeMs) {
    const nonce = await issueStart(ring, T0);
    return issueShare({ nonce, score, activeMs, mask }, ring, T0 + elapsed);
}

describe("share tokens", () => {
    it("issues and reads back a plausible full round", async () => {
        const r = await play(47, 60_000, 0b101);
        expect(r.ok).toBe(true);
        const claims = await readShare((r as { token: string }).token, ring, T0 + 61_000);
        expect(claims).toMatchObject({ typ: "share", s: 47, m: 0b101 });
    });

    it("a paused round still shares, bounded by active time", async () => {
        const r = await play(40, 58_000, 1, 180_000);
        expect(r.ok).toBe(true);
    });

    it("an early-ended round shares its own score", async () => {
        expect((await play(10, 20_000)).ok).toBe(true);
    });

    it.each([
        [500, 60_000, "score-range"],
        [160, 60_000, "implausible"],
        [10, 90_000, "active-range"],
        [10.5, 60_000, "score-range"],
    ])("rejects score=%s activeMs=%s (%s)", async (score, activeMs, reason) => {
        expect(await play(score, activeMs)).toEqual({ ok: false, reason });
    });

    it("rejects active time longer than the wall clock since start", async () => {
        expect(await play(10, 60_000, 1, 30_000)).toEqual({ ok: false, reason: "active-exceeds-wall" });
    });

    it("rejects a start nonce used as a share token, and vice versa", async () => {
        const nonce = await issueStart(ring, T0);
        expect(await readShare(nonce, ring, T0)).toBeNull();
        const share = await play(5, 10_000);
        const r = await issueShare({ nonce: (share as { token: string }).token, score: 5, activeMs: 1000, mask: 1 }, ring, T0 + 20_000);
        expect(r).toEqual({ ok: false, reason: "bad-nonce" });
    });

    it("rejects tampered and foreign-key tokens", async () => {
        const r = (await play(30, 60_000)) as { token: string };
        const [body, sig] = r.token.split(".");
        const forged = JSON.parse(atob(body.replaceAll("-", "+").replaceAll("_", "/")));
        forged.s = 199;
        const forgedBody = btoa(JSON.stringify(forged)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
        expect(await readShare(`${forgedBody}.${sig}`, ring, T0 + 61_000)).toBeNull();
        expect(await readShare(r.token, [{ kid: "k1", secret: "b".repeat(32) }], T0 + 61_000)).toBeNull();
        expect(await readShare("garbage", ring)).toBeNull();
        expect(await readShare("a.b.c", ring)).toBeNull();
    });

    it("verifies tokens signed by the previous key during rotation", async () => {
        const r = (await play(30, 60_000)) as { token: string };
        const rotated: Keyring = [{ kid: "k2", secret: "c".repeat(32) }, ...ring];
        expect(await readShare(r.token, rotated, T0 + 61_000)).not.toBeNull();
    });

    it("refuses to sign with a short secret", async () => {
        await expect(issueStart([{ kid: "k1", secret: "short" }])).rejects.toThrow(/32/);
        expect(keyringFromEnv({})).toEqual([]);
    });
});
