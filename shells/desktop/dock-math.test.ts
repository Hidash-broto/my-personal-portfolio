import { describe, expect, it } from "vitest";
import { DOCK_MAGNIFY, dockLayout, magnifyScale } from "./dock-math";

const opts = { base: 56, max: 1.6, range: 200 };

describe("magnifyScale", () => {
    it("peaks at max right under the pointer", () => {
        expect(magnifyScale(0, 1, opts)).toBeCloseTo(1.6);
    });

    it("falls off smoothly (cosine) and is symmetric", () => {
        const half = magnifyScale(100, 1, opts);
        expect(half).toBeCloseTo(1.3); // cos(pi/2) = 0 -> falloff 0.5
        expect(magnifyScale(-100, 1, opts)).toBeCloseTo(half);
        expect(magnifyScale(50, 1, opts)).toBeGreaterThan(half);
        expect(magnifyScale(150, 1, opts)).toBeLessThan(half);
    });

    it("is exactly 1 at and beyond the range, and when not hovering", () => {
        expect(magnifyScale(200, 1, opts)).toBe(1);
        expect(magnifyScale(500, 1, opts)).toBe(1);
        expect(magnifyScale(0, 0, opts)).toBe(1);
        expect(magnifyScale(Number.POSITIVE_INFINITY, 1, opts)).toBe(1);
    });

    it("scales the whole effect with intensity", () => {
        expect(magnifyScale(0, 0.5, opts)).toBeCloseTo(1.3);
    });

    it("reaches about three neighbours with the default dock options", () => {
        const slot = 66;
        expect(magnifyScale(slot * 3, 1)).toBeGreaterThan(1);
        expect(magnifyScale(slot * 3.3, 1)).toBe(1);
        expect(DOCK_MAGNIFY.max).toBeCloseTo(1.6);
    });
});

describe("dockLayout", () => {
    const centers = [28, 94, 160, 226, 292];

    it("is the identity at rest", () => {
        const layout = dockLayout(160, 0, centers, [], opts);
        expect(layout.scales).toEqual([1, 1, 1, 1, 1]);
        expect(layout.offsets.every((o) => o === 0)).toBe(true);
        expect(layout.extra).toBe(0);
    });

    it("pushes neighbours apart symmetrically so scaled icons never overlap", () => {
        const { scales, offsets, extra } = dockLayout(160, 1, centers, [], opts);
        expect(scales[2]).toBeCloseTo(1.6);
        expect(offsets[2]).toBeCloseTo(0); // the hovered middle icon stays put
        expect(offsets[0]).toBeCloseTo(-offsets[4]);
        expect(extra).toBeGreaterThan(0);
        for (let i = 1; i < centers.length; i++) {
            const rightEdgePrev = centers[i - 1] + offsets[i - 1] + (opts.base * scales[i - 1]) / 2;
            const leftEdge = centers[i] + offsets[i] - (opts.base * scales[i]) / 2;
            expect(leftEdge - rightEdgePrev).toBeCloseTo(66 - 56); // the 10px gap is preserved
        }
    });

    it("grows the dock by exactly the extra width", () => {
        const { offsets, scales, extra } = dockLayout(94, 1, centers, [], opts);
        const left = centers[0] + offsets[0] - (opts.base * scales[0]) / 2;
        const right = centers[4] + offsets[4] + (opts.base * scales[4]) / 2;
        expect(right - left).toBeCloseTo(centers[4] - centers[0] + opts.base + extra);
    });

    it("never scales fixed items (the separator) but still shifts them", () => {
        const { scales, offsets } = dockLayout(160, 1, centers, [false, false, true, false, false], opts);
        expect(scales[2]).toBe(1);
        expect(scales[1]).toBeGreaterThan(1);
        expect(offsets[2]).toBeCloseTo(0);
        expect(offsets[3]).toBeGreaterThan(0);
    });
});
