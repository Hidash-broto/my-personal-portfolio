import { describe, expect, it } from "vitest";
import {
    cardBox,
    centerBox,
    dragProgress,
    frameAt,
    radiusCss,
    releaseVelocity,
    shouldDismiss,
    unscaleBox,
    type Viewport,
} from "./geometry";

const vp: Viewport = { w: 390, h: 844 };
const icon = { x: 40, y: 300, w: 62, h: 62 };

describe("shouldDismiss (home-bar release)", () => {
    it("springs back for a short, slow drag", () => {
        expect(shouldDismiss({ dragY: -40, velocity: -0.1, viewportHeight: 844 })).toBe(false);
    });

    it("closes once dragged past ~16% of the screen height", () => {
        expect(shouldDismiss({ dragY: -0.16 * 844, velocity: 0, viewportHeight: 844 })).toBe(true);
        expect(shouldDismiss({ dragY: -300, velocity: -0.05, viewportHeight: 844 })).toBe(true);
    });

    it("closes on a quick upward flick even when the distance is short", () => {
        expect(shouldDismiss({ dragY: -30, velocity: -0.8, viewportHeight: 844 })).toBe(true);
    });

    it("ignores a flick that barely moved (a tap)", () => {
        expect(shouldDismiss({ dragY: -4, velocity: -1.2, viewportHeight: 844 })).toBe(false);
    });

    it("cancels when the finger is moving back down at release", () => {
        expect(shouldDismiss({ dragY: -400, velocity: 0.6, viewportHeight: 844 })).toBe(false);
    });

    it("never closes on a downward drag", () => {
        expect(shouldDismiss({ dragY: 50, velocity: 0, viewportHeight: 844 })).toBe(false);
    });
});

describe("releaseVelocity", () => {
    it("uses only the last ~80ms of samples", () => {
        const samples = [
            { t: 0, y: 800 },
            { t: 150, y: 795 }, // slow start, outside the window
            { t: 240, y: 760 },
            { t: 280, y: 720 },
        ];
        expect(releaseVelocity(samples)).toBeCloseTo((720 - 760) / 40, 5);
    });

    it("is 0 without movement data", () => {
        expect(releaseVelocity([])).toBe(0);
        expect(releaseVelocity([{ t: 10, y: 10 }])).toBe(0);
    });
});

describe("frameAt (icon zoom)", () => {
    it("starts exactly on the icon", () => {
        const f = frameAt(0, icon, 14, 0, vp);
        expect(f.x).toBe(icon.x);
        expect(f.y).toBe(icon.y);
        expect(f.sx * vp.w).toBeCloseTo(62);
        expect(f.sy * vp.h).toBeCloseTo(62);
        expect(f.radius).toBe(14);
        // content stays uniformly scaled: inner scaleY makes sy * innerScaleY === sx
        expect(f.sy * f.innerScaleY).toBeCloseTo(f.sx);
    });

    it("ends full screen with square corners", () => {
        const f = frameAt(1, icon, 14, 0, vp);
        expect(f).toMatchObject({ x: 0, y: 0, sx: 1, sy: 1, radius: 0, innerScaleY: 1 });
        expect(radiusCss(f)).toBe("0px");
    });

    it("expresses the on-screen radius in pre-scale units", () => {
        const f = frameAt(0, icon, 14, 0, vp);
        expect(radiusCss(f)).toBe(`${14 / f.sx}px / ${14 / f.sy}px`);
    });
});

describe("drag card", () => {
    it("shrinks and lifts but never leaves the screen", () => {
        for (const dragY of [-50, -200, -500, -2000]) {
            const card = cardBox(dragY, vp);
            expect(card.y).toBeGreaterThanOrEqual(0);
            expect(card.y + card.h).toBeLessThanOrEqual(vp.h);
            expect(card.w).toBeLessThan(vp.w);
            expect(card.w).toBeGreaterThanOrEqual(vp.w * 0.4);
        }
        expect(dragProgress(-2000, vp)).toBeLessThanOrEqual(1);
    });

    it("is the full screen at rest", () => {
        expect(cardBox(0, vp)).toEqual({ x: 0, y: 0, w: 390, h: 844 });
    });
});

describe("unscaleBox", () => {
    it("inverts a scale around the viewport centre", () => {
        const s = 0.94;
        const cx = vp.w / 2;
        const cy = vp.h / 2;
        const scaled = { x: cx + (icon.x - cx) * s, y: cy + (icon.y - cy) * s, w: icon.w * s, h: icon.h * s };
        const back = unscaleBox(scaled, s, vp);
        expect(back.x).toBeCloseTo(icon.x);
        expect(back.y).toBeCloseTo(icon.y);
        expect(back.w).toBeCloseTo(icon.w);
    });

    it("centerBox is centred", () => {
        expect(centerBox(vp)).toEqual({ x: 164, y: 391, w: 62, h: 62 });
    });
});
