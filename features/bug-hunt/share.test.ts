import { describe, expect, it, vi } from "vitest";
import { bugMask } from "@/data/bugs";
import { dayKey, readBest, recordScore } from "./best";
import { createRound, catchBug, resultOf, tick } from "./engine";
import { linkedInShareUrl, requestShareToken, resultPayload, shareUrl } from "./share";

function reply(status: number, body: unknown) {
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("recap → result payload", () => {
    it("sends exactly nonce, score, activeMs and the caught mask", async () => {
        const state = createRound({ shell: "desktop", viewport: { w: 1200, h: 800 }, rng: () => 0.3 });
        for (let i = 0; i < 200; i++) tick(state, 16);
        const caught = state.bugs.slice(0, 2).map((b) => catchBug(state, b.uid)!.type);
        const result = resultOf(state);

        const fetchImpl = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () => reply(200, { token: "tok.sig" }));
        const outcome = await requestShareToken("nonce-1", result, fetchImpl);
        expect(outcome).toEqual({ status: "ready", token: "tok.sig" });

        const [url, init] = fetchImpl.mock.calls[0];
        expect(url).toBe("/api/bug-hunt/result");
        expect(init?.method).toBe("POST");
        const body = JSON.parse(String(init?.body));
        expect(body).toEqual({ nonce: "nonce-1", score: 2, activeMs: result.activeMs, mask: bugMask(caught) });
        expect(Object.keys(body).sort()).toEqual(["activeMs", "mask", "nonce", "score"]);
        expect(resultPayload("n", result)).toEqual({ nonce: "n", score: 2, activeMs: result.activeMs, mask: result.mask });
    });

    it("classifies failures", async () => {
        const r = { score: 3, activeMs: 9000, mask: 1 };
        expect(await requestShareToken(null, r, vi.fn())).toEqual({ status: "unavailable" });
        expect(await requestShareToken("n", r, async () => reply(503, { reason: "not-configured" }))).toEqual({ status: "unavailable" });
        expect(await requestShareToken("n", r, async () => reply(422, { reason: "implausible" }))).toEqual({ status: "rejected", reason: "implausible" });
        expect(await requestShareToken("n", r, async () => reply(500, {}))).toEqual({ status: "error" });
        expect(
            await requestShareToken("n", r, async () => {
                throw new TypeError("offline");
            }),
        ).toEqual({ status: "error" });
    });
});

describe("share URLs", () => {
    it("tags every channel and falls back to the generic page", () => {
        expect(shareUrl("https://hidash.in", "abc.def", "native-share")).toBe(
            "https://hidash.in/bug-hunt/s/abc.def?utm_source=native-share&utm_medium=share&utm_campaign=bughunt",
        );
        expect(shareUrl("https://hidash.in/", null, "copy-link")).toBe(
            "https://hidash.in/bug-hunt?utm_source=copy-link&utm_medium=share&utm_campaign=bughunt",
        );
        const li = linkedInShareUrl(shareUrl("https://hidash.in", "t", "linkedin"));
        expect(li.startsWith("https://www.linkedin.com/sharing/share-offsite/?url=")).toBe(true);
        expect(decodeURIComponent(li.split("url=")[1])).toContain("utm_source=linkedin");
    });
});

describe("today's best", () => {
    function memory() {
        const map = new Map<string, string>();
        return { getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => void map.set(k, v), map };
    }

    it("keeps the best per local day", () => {
        const store = memory();
        const day = new Date(2026, 10, 1, 10);
        expect(readBest(store, day)).toBeNull();
        expect(recordScore(12, store, day)).toEqual({ best: 12, isNew: true });
        expect(recordScore(8, store, day)).toEqual({ best: 12, isNew: false });
        expect(JSON.parse(store.map.get("hos_bughunt_best")!)).toEqual({ day: dayKey(day), score: 12 });
        expect(readBest(store, new Date(2026, 10, 2, 10))).toBeNull();
    });
});
