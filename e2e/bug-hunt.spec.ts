import { expect, test } from "@playwright/test";
import { asReturningVisitor, collectErrors } from "./helpers";

test("a round starts from a shared challenge link and Esc ends it into the recap", async ({ page, context, baseURL }) => {
    const errors = collectErrors(page);
    await asReturningVisitor(context, baseURL!);
    await page.goto("/?app=bughunt&item=play&challenge=12");
    await expect(page.getByRole("dialog", { name: "Bug Hunt round" })).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(4_000); // countdown
    await page.keyboard.press("Escape");
    await expect(page.locator("#bh-recap-score")).toBeVisible({ timeout: 5_000 });
    expect(errors).toEqual([]);
});

test.describe("share API and page", () => {
    test.skip(({ isMobile }) => isMobile, "server behavior, one device is enough");

    test("a plausible result gets a verified poster; a forged token gets the generic card", async ({ request, page }) => {
        const { nonce } = await (await request.post("/api/bug-hunt/start")).json();
        await new Promise((r) => setTimeout(r, 2_100));
        const ok = await request.post("/api/bug-hunt/result", { data: { nonce, score: 4, activeMs: 2_000, mask: 1 } });
        expect(ok.status()).toBe(200);
        const { token } = await ok.json();

        await page.goto(`/bug-hunt/s/${token}`);
        await expect(page.getByRole("article")).toContainText(/4\s*bugs caught in 60 seconds/);
        await expect(page.getByRole("link", { name: /Beat 4/ })).toBeVisible();

        const forged = token.replace(/^./, (c: string) => (c === "a" ? "b" : "a"));
        const res = await page.goto(`/bug-hunt/s/${forged}`);
        expect(res?.status()).toBe(200);
        await expect(page.getByRole("link", { name: /Beat 4/ })).toHaveCount(0);
    });

    test("an implausible score is rejected", async ({ request }) => {
        const { nonce } = await (await request.post("/api/bug-hunt/start")).json();
        const res = await request.post("/api/bug-hunt/result", { data: { nonce, score: 150, activeMs: 1_000, mask: 1 } });
        expect(res.status()).toBe(422);
    });
});
