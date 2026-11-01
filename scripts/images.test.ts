// @vitest-environment jsdom
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const PUBLIC = path.resolve(__dirname, "../public");
const SOURCES = readdirSync(path.join(PUBLIC, "Me")).filter((f) => /\.(jpe?g|png)$/i.test(f));

interface Photo {
    slug: string;
    width: number;
    height: number;
    alt: string;
}

describe("photo manifest (public/photos/manifest.json)", () => {
    const manifest = JSON.parse(readFileSync(path.join(PUBLIC, "photos/manifest.json"), "utf8")) as Photo[];

    it("lists every source photo exactly once", () => {
        expect(SOURCES).toHaveLength(21);
        expect(manifest).toHaveLength(SOURCES.length);
        expect(new Set(manifest.map((p) => p.slug)).size).toBe(manifest.length);
    });

    it("has URL-safe slugs, real dimensions and an alt field", () => {
        for (const photo of manifest) {
            expect(photo.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
            expect(photo.width).toBeGreaterThan(0);
            expect(photo.width).toBeLessThanOrEqual(1200);
            expect(photo.height).toBeGreaterThan(0);
            expect(typeof photo.alt).toBe("string");
        }
    });

    it("has 400 and 1200 AVIF + WebP files for each photo", () => {
        for (const { slug } of manifest) {
            for (const size of [400, 1200]) {
                for (const ext of ["avif", "webp"]) {
                    expect(existsSync(path.join(PUBLIC, "photos", `${slug}-${size}.${ext}`)), `${slug}-${size}.${ext}`).toBe(true);
                }
            }
        }
    });
});
