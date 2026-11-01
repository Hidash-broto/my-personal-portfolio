import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BUGS, bugMask } from "@/data/bugs";
import { loadShareCard, shareCopy } from "@/features/bug-hunt/server";
import { issueShare, issueStart, keyringFromEnv } from "@/lib/share/token";
import SharePage, { generateMetadata } from "./page";

const SECRET = "test-secret-that-is-at-least-32-characters-long";

async function token(score: number, mask: number) {
    const ring = keyringFromEnv();
    const startedAt = Date.now() - 61_000;
    const nonce = await issueStart(ring, startedAt);
    const out = await issueShare({ nonce, score, activeMs: 60_000, mask }, ring);
    if (!out.ok) throw new Error(out.reason);
    return out.token;
}

const params = (t: string) => ({ params: Promise.resolve({ token: t }) });

describe("/bug-hunt/s/[token]", () => {
    beforeEach(() => vi.stubEnv("SHARE_SECRET", SECRET));
    afterEach(() => vi.unstubAllEnvs());

    it("valid token: verified score, caught lessons and the Beat link", async () => {
        const t = await token(47, bugMask(["todo", "secret"]));
        const card = await loadShareCard(t);
        expect(card).toMatchObject({ valid: true, score: 47 });
        expect(card.bugs.map((b) => b.id)).toEqual(["todo", "secret"]);

        const html = renderToStaticMarkup(await SharePage(params(t)));
        expect(html).toContain("I debugged Hidash OS");
        expect(html).toContain("Beat 47 — Play Bug Hunt");
        expect(html).toContain('href="/?app=bughunt&amp;item=play&amp;challenge=47"');
        expect(html).toContain(BUGS[0].lesson);

        const meta = await generateMetadata(params(t));
        expect(meta.title).toEqual({ absolute: "I debugged Hidash OS · 47 bugs" });
        expect(meta.openGraph?.title).toBe("I debugged Hidash OS · 47 bugs");
        expect(meta.robots).toMatchObject({ index: false });
    });

    it("tampered token: generic card data and page, still renders", async () => {
        const t = await token(5, 1);
        const [body, sig] = t.split(".");
        const forged = JSON.parse(Buffer.from(body, "base64url").toString());
        forged.s = 199;
        const tampered = `${Buffer.from(JSON.stringify(forged)).toString("base64url")}.${sig}`;

        const card = await loadShareCard(tampered);
        expect(card.valid).toBe(false);
        expect(shareCopy(card).title).toBe("Bug Hunt — Hidash OS");

        const html = renderToStaticMarkup(await SharePage(params(tampered)));
        expect(html).not.toContain("199");
        expect(html).toContain("Play Bug Hunt");
        expect(html).toContain('href="/?app=bughunt&amp;item=play"');
    });

    it("garbage and unconfigured secrets fall back to the generic card", async () => {
        expect((await loadShareCard("not-a-token")).valid).toBe(false);
        expect((await loadShareCard("a".repeat(600))).valid).toBe(false);
        const t = await token(3, 1);
        vi.stubEnv("SHARE_SECRET", "");
        expect((await loadShareCard(t)).valid).toBe(false);
    });
});
