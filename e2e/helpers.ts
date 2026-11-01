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

export function collectErrors(page: Page) {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
    });
    return errors;
}
