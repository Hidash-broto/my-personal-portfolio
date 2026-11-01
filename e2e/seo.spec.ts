import { expect, test } from "@playwright/test";
import { posts } from "../data/posts";

// Regression contract (eng review): the SEO surface from the rebrand must not change.
test.describe("SEO regression", () => {
    test.skip(({ isMobile }) => isMobile, "server HTML is the same for every device");

    test("home HTML keeps the SSR summary and Person JSON-LD", async ({ request }) => {
        const html = await (await request.get("/")).text();
        expect(html).toContain("<h1>Muhammed Hidash — Startup builder. Tech by craft, business by curiosity.</h1>");
        expect(html).toContain('"@type":"Person"');
        for (const post of posts) expect(html).toContain(`/blog/${post.slug}`);
    });

    test("blog index and every post render on the server with BlogPosting data", async ({ request }) => {
        expect((await request.get("/blog")).status()).toBe(200);
        for (const post of posts) {
            const res = await request.get(`/blog/${post.slug}`);
            expect(res.status()).toBe(200);
            const html = await res.text();
            expect(html).toContain('"@type":"BlogPosting"');
            expect(html).toContain(`<link rel="canonical" href="https://hidash.in/blog/${post.slug}"/>`);
        }
    });

    test("sitemap lists every post and robots points to it", async ({ request }) => {
        const sitemap = await (await request.get("/sitemap.xml")).text();
        for (const post of posts) expect(sitemap).toContain(`https://hidash.in/blog/${post.slug}`);
        expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap: https://hidash.in/sitemap.xml");
    });
});
