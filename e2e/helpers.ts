import type { BrowserContext, Page } from "@playwright/test";

/** Skip the first-visit boot (as a returning visitor). */
export async function asReturningVisitor(context: BrowserContext, baseURL: string) {
    await context.addCookies([{ name: "hos_seen", value: "1", url: baseURL }]);
}

/** The pathname + search of the page, e.g. "/?app=builds". */
export function where(page: Page) {
    const url = new URL(page.url());
    return url.pathname + url.search;
}

/** Records every analytics event ("hos:track") in window.__events, from the first script on. */
export async function recordAnalytics(page: Page) {
    await page.addInitScript(() => {
        const w = window as unknown as { __events: { event: string; properties: Record<string, unknown> }[] };
        w.__events = [];
        window.addEventListener("hos:track", (e) => w.__events.push((e as CustomEvent).detail));
    });
    return () => page.evaluate(() => (window as unknown as { __events: { event: string; properties: Record<string, unknown> }[] }).__events);
}

export function collectErrors(page: Page) {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
    });
    return errors;
}
