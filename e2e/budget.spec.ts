import { expect, test } from "@playwright/test";

// Speed budgets (eng review): phone first visit, up to "home interactive".
const JS_BUDGET = 220 * 1024;
const TRANSFER_BUDGET = 600 * 1024;

test("phone first visit stays inside the JS and transfer budgets", async ({ page, isMobile }) => {
    test.skip(!isMobile, "phone budget");
    const sizes: { url: string; type: string; bytes: number }[] = [];
    page.on("requestfinished", async (req) => {
        const s = await req.sizes().catch(() => null);
        if (s) sizes.push({ url: req.url(), type: req.resourceType(), bytes: s.responseBodySize + s.responseHeadersSize });
    });
    await page.goto("/");
    await page.getByRole("button", { name: "Builds", exact: true }).first().waitFor();
    await page.waitForLoadState("networkidle");

    const js = sizes.filter((s) => s.type === "script").reduce((n, s) => n + s.bytes, 0);
    const total = sizes.reduce((n, s) => n + s.bytes, 0);
    test.info().annotations.push({ type: "budget", description: `js=${Math.round(js / 1024)}KB total=${Math.round(total / 1024)}KB` });
    console.log(`phone first visit: js=${Math.round(js / 1024)}KB total=${Math.round(total / 1024)}KB`);
    expect(sizes.some((s) => s.url.includes("rive"))).toBe(false);
    expect(js).toBeLessThanOrEqual(JS_BUDGET);
    expect(total).toBeLessThanOrEqual(TRANSFER_BUDGET);
});
