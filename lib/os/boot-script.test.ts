// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { BOOT_SCRIPT } from "./boot-script";

function run({ coarse, w, h, url = "/", cookie = "" }: { coarse: boolean; w: number; h: number; url?: string; cookie?: string }) {
    window.history.replaceState(null, "", url);
    vi.stubGlobal("matchMedia", (q: string) => ({ matches: q.includes("coarse") ? coarse : false }));
    Object.defineProperty(window, "innerWidth", { configurable: true, value: w });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: h });
    document.cookie.split(";").forEach((c) => (document.cookie = `${c.split("=")[0].trim()}=; Max-Age=0; Path=/`));
    if (cookie) document.cookie = cookie;
    window.localStorage.clear();
    new Function(BOOT_SCRIPT)();
    return { ...document.documentElement.dataset };
}

afterEach(() => vi.unstubAllGlobals());

describe("BOOT_SCRIPT", () => {
    it("phone first visit boots", () => {
        expect(run({ coarse: true, w: 390, h: 844 })).toMatchObject({ shell: "phone", boot: "on", firstVisit: "1" });
    });

    it("tablet (coarse, short side 820) gets the desktop shell", () => {
        expect(run({ coarse: true, w: 820, h: 1180 })).toMatchObject({ shell: "desktop" });
    });

    it("return visit skips the boot", () => {
        expect(run({ coarse: false, w: 1440, h: 900, cookie: "hos_seen=1" })).toMatchObject({ shell: "desktop", boot: "off", firstVisit: "0" });
    });

    it("deep link never boots, even on a first visit", () => {
        expect(run({ coarse: true, w: 390, h: 844, url: "/?app=builds" })).toMatchObject({ boot: "off", firstVisit: "1" });
    });

    it("preloads only the chosen shell's wallpaper, gated by color scheme", () => {
        document.head.querySelectorAll('link[rel="preload"]').forEach((l) => l.remove());
        run({ coarse: true, w: 390, h: 844 });
        const links = [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="image"]')];
        expect(links.map((l) => [l.getAttribute("href"), l.media])).toEqual([
            ["/wallpaper/dark-phone.avif", "(prefers-color-scheme: dark)"],
            ["/wallpaper/light-phone.avif", "(prefers-color-scheme: light)"],
        ]);
    });

    it("non-home paths never boot", () => {
        expect(run({ coarse: true, w: 390, h: 844, url: "/bug-hunt" })).toMatchObject({ boot: "off" });
    });
});
