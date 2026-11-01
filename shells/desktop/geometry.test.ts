import { describe, expect, it } from "vitest";
import {
    DOCK_RESERVE,
    MENU_BAR_H,
    MIN_H,
    MIN_VISIBLE,
    MIN_W,
    clampPosition,
    fitRect,
    resizeRect,
    restoreUnderPointer,
    zoomRect,
} from "./geometry";

const vp = { w: 1440, h: 900 };
const size = { w: 600, h: 400 };

describe("clampPosition (drag)", () => {
    it("leaves a position inside the viewport alone", () => {
        expect(clampPosition(200, 120, size, vp)).toEqual({ x: 200, y: 120 });
    });

    it("never lets the title bar go under the menu bar", () => {
        expect(clampPosition(200, -300, size, vp).y).toBe(MENU_BAR_H);
    });

    it("keeps the title bar above the Dock line", () => {
        expect(clampPosition(200, 5000, size, vp).y).toBe(vp.h - DOCK_RESERVE);
    });

    it("keeps a strip of the window on screen at both sides", () => {
        expect(clampPosition(-5000, 100, size, vp).x).toBe(MIN_VISIBLE - size.w);
        expect(clampPosition(5000, 100, size, vp).x).toBe(vp.w - MIN_VISIBLE);
    });

    it("rounds to whole pixels (crisp text)", () => {
        expect(clampPosition(100.4, 100.6, size, vp)).toEqual({ x: 100, y: 101 });
    });
});

describe("resizeRect", () => {
    const start = { x: 300, y: 200, w: 600, h: 400 };

    it("grows from the south-east corner", () => {
        expect(resizeRect(start, "se", 50, 30, vp)).toEqual({ x: 300, y: 200, w: 650, h: 430 });
    });

    it("moves the origin when resizing from the west / north, keeping the opposite edge fixed", () => {
        const r = resizeRect(start, "nw", -40, -20, vp);
        expect(r).toEqual({ x: 260, y: 180, w: 640, h: 420 });
        expect(r.x + r.w).toBe(start.x + start.w);
        expect(r.y + r.h).toBe(start.y + start.h);
    });

    it("respects the minimum size without moving the anchored edge", () => {
        const r = resizeRect(start, "w", 1000, 0, vp);
        expect(r.w).toBe(MIN_W);
        expect(r.x + r.w).toBe(start.x + start.w);
        expect(resizeRect(start, "s", 0, -1000, vp).h).toBe(MIN_H);
    });

    it("clamps to the viewport and the menu bar", () => {
        expect(resizeRect(start, "e", 5000, 0, vp).w).toBe(vp.w - start.x);
        expect(resizeRect(start, "n", 0, -5000, vp).y).toBe(MENU_BAR_H);
    });
});

describe("zoomRect / fitRect / restoreUnderPointer", () => {
    it("zoom fills the area below the menu bar and above the Dock", () => {
        const z = zoomRect(vp);
        expect(z.y).toBeGreaterThanOrEqual(MENU_BAR_H);
        expect(z.y + z.h).toBe(vp.h - DOCK_RESERVE);
        expect(z.w).toBeGreaterThan(vp.w - 20);
    });

    it("fits stored geometry into a smaller viewport", () => {
        const r = fitRect({ x: 1200, y: 50, w: 1600, h: 1200 }, { w: 1024, h: 700 });
        expect(r.w).toBeLessThanOrEqual(1024);
        expect(r.h).toBeLessThanOrEqual(700 - MENU_BAR_H);
        expect(r.x).toBeLessThanOrEqual(1024 - MIN_VISIBLE);
    });

    it("restores a dragged zoomed window under the pointer at the same relative spot", () => {
        const z = zoomRect(vp);
        const pointer = { x: z.x + z.w / 2, y: z.y + 10 };
        const r = restoreUnderPointer(size, z, pointer, vp);
        expect(r.w).toBe(size.w);
        expect(r.x + r.w / 2).toBeCloseTo(pointer.x, 0);
        expect(r.y).toBe(pointer.y - 10);
    });
});
