import { expect, test } from "@playwright/test";
import { asReturningVisitor, collectErrors, where } from "./helpers";

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

test("a deep link skips the boot and the first back stays on the site", async ({ page }) => {
    await page.goto("/?app=builds");
    await expect(page.getByRole("status", { name: "Hidash OS is starting" })).toHaveCount(0);
    await page.goBack();
    expect(where(page)).toBe("/");
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
