import { expect, test } from "@playwright/test";
import { asReturningVisitor, collectErrors, recordAnalytics, where } from "./helpers";

test("first visit boots once, then never again", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/");
    const boot = page.getByRole("status", { name: "Hidash OS is starting" });
    await expect(boot).toBeVisible();
    await expect(boot).toBeHidden({ timeout: 4_000 });
    await page.reload();
    await expect(page.getByRole("status", { name: "Hidash OS is starting" })).toHaveCount(0);
    expect(errors).toEqual([]);
});

test("analytics: a shared link lands as a referred first visit", async ({ page }) => {
    const events = await recordAnalytics(page);
    await page.goto("/?app=builds&utm_source=linkedin&utm_medium=share&utm_campaign=bughunt");
    await expect.poll(async () => (await events()).map((e) => e.event)).toEqual(expect.arrayContaining(["boot_complete", "app_open"]));
    const boot = (await events()).find((e) => e.event === "boot_complete")!;
    expect(boot.properties).toMatchObject({ first_visit: true, referred: true, utm_source: "linkedin", $process_person_profile: false });
});

test("a deep link skips the boot and the first back stays on the site", async ({ page }) => {
    await page.goto("/?app=builds");
    await expect(page.getByRole("status", { name: "Hidash OS is starting" })).toHaveCount(0);
    // Wait for the shell (a lazy chunk) to mount: it inserts the base "/" entry under the deep link.
    await expect(page.getByRole("button", { name: /^(Close Builds|Back to home screen)$/ })).toBeVisible();
    await page.goBack();
    await expect.poll(() => where(page)).toBe("/");
});

test.describe("desktop", () => {
    test.skip(({ isMobile }) => isMobile, "desktop shell only");

    test("open Builds, open Notes, close Builds keeps Notes open", async ({ page, context, baseURL }) => {
        const errors = collectErrors(page);
        await asReturningVisitor(context, baseURL!);
        await page.goto("/");
        const dock = page.getByRole("navigation", { name: "Dock" });
        await dock.getByLabel("Builds", { exact: true }).click();
        await expect.poll(() => where(page)).toBe("/?w=builds&focus=builds");
        await dock.getByLabel("Notes", { exact: true }).click();
        await expect.poll(() => where(page)).toBe("/?w=builds,notes&focus=notes");
        await page.getByRole("button", { name: "Close Builds" }).click();
        await expect.poll(() => where(page)).toBe("/?w=notes&focus=notes");
        await expect(page.getByRole("button", { name: "Close Notes" })).toBeVisible();
        expect(errors).toEqual([]);
    });

    test("a first open on a slow network never blanks the desktop", async ({ page, context, baseURL }) => {
        await asReturningVisitor(context, baseURL!);
        // Hold every JS chunk so the app's code is still loading when the window opens.
        await context.route("**/_next/static/chunks/**", async (route) => {
            await new Promise((ok) => setTimeout(ok, 400));
            await route.continue();
        });
        await page.goto("/");
        const dock = page.getByRole("navigation", { name: "Dock" });
        await dock.waitFor();
        await page.waitForTimeout(1200); // settle, but open before the background preload starts
        // Count animation frames in which the dock is not visible (no retrying: a blink must fail).
        await page.evaluate(() => {
            const w = window as unknown as { __hiddenFrames: number };
            w.__hiddenFrames = 0;
            const t0 = performance.now();
            const tick = () => {
                const nav = document.querySelector("nav[aria-label='Dock']");
                if (!nav || !nav.checkVisibility()) w.__hiddenFrames++;
                if (performance.now() - t0 < 2000) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });
        await dock.getByLabel("Builds", { exact: true }).click();
        await expect(page.getByRole("button", { name: "Close Builds" })).toBeVisible();
        await page.waitForTimeout(2000);
        expect(await page.evaluate(() => (window as unknown as { __hiddenFrames: number }).__hiddenFrames)).toBe(0);
    });

    test("minimize keeps the URL", async ({ page, context, baseURL }) => {
        await asReturningVisitor(context, baseURL!);
        await page.goto("/?w=journey&focus=journey");
        await page.getByRole("button", { name: "Minimize Journey" }).click();
        await page.waitForTimeout(600);
        expect(where(page)).toBe("/?w=journey&focus=journey");
    });

    test("Search (Ctrl/Cmd+K) opens a build", async ({ page, context, baseURL }) => {
        await asReturningVisitor(context, baseURL!);
        await page.goto("/");
        await page.getByRole("navigation", { name: "Dock" }).waitFor();
        await page.keyboard.press("ControlOrMeta+k");
        await expect(page.getByRole("dialog", { name: "Search" })).toBeVisible();
        await page.keyboard.type("agentview");
        await page.keyboard.press("Enter");
        await expect.poll(() => where(page)).toContain("item=agentview");
    });
});

test.describe("phone", () => {
    test.skip(({ isMobile }) => !isMobile, "phone shell only");

    test("tap Builds, then Back returns home with no stale history", async ({ page, context, baseURL }) => {
        const errors = collectErrors(page);
        await asReturningVisitor(context, baseURL!);
        await page.goto("/");
        await page.getByRole("button", { name: "Builds", exact: true }).first().click();
        await expect.poll(() => where(page)).toBe("/?app=builds");
        await page.getByRole("button", { name: "Back to home screen" }).click();
        await expect.poll(() => where(page)).toBe("/");
        expect(errors).toEqual([]);
    });
});
