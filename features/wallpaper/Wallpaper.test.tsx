// @vitest-environment jsdom
import { existsSync } from "node:fs";
import path from "node:path";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Wallpaper, { wallpaperSrc } from "./Wallpaper";
import { PLACEHOLDERS } from "./placeholders";
import { FAUX_GLASS_CLASS, syncFauxGlass } from "./faux-glass";

afterEach(cleanup);

const PUBLIC = path.resolve(__dirname, "../../public");

describe.each(["phone", "desktop"] as const)("Wallpaper (%s)", (shell) => {
    it("is a fixed, decorative <picture> with dark/light AVIF + WebP sources", () => {
        const { container } = render(<Wallpaper shell={shell} />);
        const root = container.firstElementChild as HTMLElement;
        expect(root.getAttribute("aria-hidden")).toBe("true");
        expect(root.className).toBe("hos-wallpaper");
        expect(root.dataset.shell).toBe(shell);

        const sources = [...root.querySelectorAll("picture > source")].map((s) => ({
            media: s.getAttribute("media"),
            type: s.getAttribute("type"),
            srcset: s.getAttribute("srcset"),
        }));
        expect(sources).toEqual([
            { media: "(prefers-color-scheme: dark)", type: "image/avif", srcset: `/wallpaper/dark-${shell}.avif` },
            { media: "(prefers-color-scheme: dark)", type: "image/webp", srcset: `/wallpaper/dark-${shell}.webp` },
            { media: null, type: "image/avif", srcset: `/wallpaper/light-${shell}.avif` },
        ]);

        const imgs = root.querySelectorAll("img");
        expect(imgs).toHaveLength(1); // one <img>: the browser downloads exactly one variant
        const img = imgs[0];
        expect(img.getAttribute("src")).toBe(`/wallpaper/light-${shell}.webp`);
        expect(img.getAttribute("alt")).toBe("");
        expect(img.getAttribute("fetchpriority")).toBe("high");
    });

    it("paints the tiny placeholders and average colours until the image decodes", () => {
        const { container } = render(<Wallpaper shell={shell} />);
        const root = container.firstElementChild as HTMLElement;
        expect(root.style.getPropertyValue("--hos-wp-ph-dark")).toBe(`url("${PLACEHOLDERS[`dark-${shell}`].src}")`);
        expect(root.style.getPropertyValue("--hos-wp-ph-light")).toBe(`url("${PLACEHOLDERS[`light-${shell}`].src}")`);
        expect(root.style.getPropertyValue("--hos-wp-color-dark")).toBe(PLACEHOLDERS[`dark-${shell}`].color);
        expect(root.hasAttribute("data-ready")).toBe(false);
    });

    it("fires onReady once after the image loads and decodes", async () => {
        const onReady = vi.fn();
        const { container } = render(<Wallpaper shell={shell} onReady={onReady} />);
        const img = container.querySelector("img")!;
        img.decode = () => Promise.resolve();
        fireEvent.load(img);
        fireEvent.load(img);
        await vi.waitFor(() => expect(onReady).toHaveBeenCalledTimes(1));
        await vi.waitFor(() => expect(container.firstElementChild!.hasAttribute("data-ready")).toBe(true));
    });

    it("references generated assets that exist", () => {
        for (const theme of ["dark", "light"] as const) {
            for (const ext of ["avif", "webp"] as const) {
                expect(existsSync(path.join(PUBLIC, wallpaperSrc(theme, shell, ext)))).toBe(true);
                expect(existsSync(path.join(PUBLIC, wallpaperSrc(theme, shell, ext, true)))).toBe(true);
            }
        }
    });
});

describe("placeholders", () => {
    it("are tiny inline WebP data URIs", () => {
        for (const { src, color } of Object.values(PLACEHOLDERS)) {
            expect(src).toMatch(/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/);
            expect(src.length).toBeLessThan(600);
            expect(color).toMatch(/^#[0-9a-f]{6}$/);
        }
    });
});

describe("faux glass", () => {
    it("syncFauxGlass switches to offset mode and writes the viewport offset", () => {
        const el = document.createElement("div");
        el.className = FAUX_GLASS_CLASS;
        el.getBoundingClientRect = () => ({ left: 120, top: 48 }) as DOMRect;
        syncFauxGlass(el);
        expect(el.dataset.faux).toBe("offset");
        expect(el.style.getPropertyValue("--hos-faux-x")).toBe("120px");
        expect(el.style.getPropertyValue("--hos-faux-y")).toBe("48px");
    });
});
