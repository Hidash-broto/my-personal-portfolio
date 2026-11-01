import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as start } from "../start/route";
import { POST as result } from "./route";

const SECRET = "test-secret-that-is-at-least-32-characters-long";

function post(body: unknown, raw = false) {
    return new Request("http://localhost/api/bug-hunt/result", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: raw ? String(body) : JSON.stringify(body),
    });
}

async function nonce(): Promise<string> {
    const res = await start();
    expect(res.status).toBe(200);
    const { nonce } = await res.json();
    expect(typeof nonce).toBe("string");
    return nonce;
}

describe("bug hunt API", () => {
    beforeEach(() => {
        vi.stubEnv("SHARE_SECRET", SECRET);
    });
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("start → result → token", async () => {
        const res = await result(post({ nonce: await nonce(), score: 2, activeMs: 1000, mask: 3 }));
        expect(res.status).toBe(200);
        expect(res.headers.get("cache-control")).toBe("no-store");
        const { token } = await res.json();
        expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    });

    it("422 when the score is implausible for the active time", async () => {
        const res = await result(post({ nonce: await nonce(), score: 40, activeMs: 1000, mask: 1 }));
        expect(res.status).toBe(422);
        expect(await res.json()).toEqual({ reason: "implausible" });
    });

    it("422 for a forged nonce", async () => {
        const res = await result(post({ nonce: "abc.def", score: 1, activeMs: 1000, mask: 1 }));
        expect(res.status).toBe(422);
        expect(await res.json()).toEqual({ reason: "bad-nonce" });
    });

    it("422 for malformed bodies", async () => {
        const n = await nonce();
        const cases: [unknown, boolean, string][] = [
            ["{not json", true, "bad-json"],
            [[1, 2, 3], false, "bad-shape"],
            [null, false, "bad-shape"],
            [{ nonce: n, score: "5", activeMs: 1000, mask: 1 }, false, "bad-shape"],
            [{ nonce: n, score: 1, activeMs: 1000 }, false, "bad-shape"],
            [{ nonce: 42, score: 1, activeMs: 1000, mask: 1 }, false, "bad-shape"],
            [{ nonce: n, score: 1.5, activeMs: 1000, mask: 1 }, false, "score-range"],
            [{ nonce: n, score: 1, activeMs: 1000, mask: 1, pad: "x".repeat(3000) }, false, "too-large"],
        ];
        for (const [body, raw, reason] of cases) {
            const res = await result(post(body, raw));
            expect(res.status).toBe(422);
            expect((await res.json()).reason).toBe(reason);
        }
    });

    it("503 not-configured without SHARE_SECRET", async () => {
        vi.stubEnv("SHARE_SECRET", "");
        const s = await start();
        expect(s.status).toBe(503);
        expect(await s.json()).toEqual({ reason: "not-configured" });
        const r = await result(post({ nonce: "a.b", score: 0, activeMs: 0, mask: 0 }));
        expect(r.status).toBe(503);
        expect(await r.json()).toEqual({ reason: "not-configured" });
    });

    it("503 when the secret is too short to sign", async () => {
        vi.stubEnv("SHARE_SECRET", "short");
        expect((await start()).status).toBe(503);
    });
});
