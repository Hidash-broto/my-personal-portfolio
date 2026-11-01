import { describe, expect, it } from "vitest";
import { BUG_IDS, MAX_CATCHES_PER_SECOND, ROUND_MS, bugsFromMask } from "@/data/bugs";
import {
    KEYBOARD_FACTOR,
    MAX_FRAME_MS,
    TARGET_PX,
    catchBug,
    createRound,
    isOver,
    maxBugs,
    miss,
    nearestBug,
    remainingMs,
    resultOf,
    setKeyboard,
    setPaused,
    spawnPoint,
    tick,
    type RoundState,
    type SurfaceRect,
} from "./engine";

function rng(seed = 7) {
    let a = seed;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const DESKTOP = { w: 1440, h: 900 };
const PHONE = { w: 390, h: 844 };

function run(state: RoundState, ms: number, rects: SurfaceRect[] = [], each?: (s: RoundState) => void) {
    for (let t = 0; t < ms; t += 16) {
        tick(state, 16, () => rects);
        each?.(state);
    }
    return state;
}

describe("spawning", () => {
    it("never exceeds 10 bugs on desktop and 6 on phone", () => {
        expect(maxBugs("desktop")).toBe(10);
        expect(maxBugs("phone")).toBe(6);
        for (const [shell, viewport, cap] of [["desktop", DESKTOP, 10], ["phone", PHONE, 6]] as const) {
            const state = createRound({ shell, viewport, rng: rng(3) });
            let peak = 0;
            run(state, ROUND_MS, [], (s) => (peak = Math.max(peak, s.bugs.length)));
            expect(peak).toBe(cap);
        }
    });

    it("spawns on the edge of a registered surface, heading outward", () => {
        const rect: SurfaceRect = { x: 400, y: 300, w: 500, h: 300, kind: "window" };
        const config = createRound({ shell: "desktop", viewport: DESKTOP, rng: rng(11) }).config;
        for (let i = 0; i < 50; i++) {
            const p = spawnPoint([rect], config);
            const onX = Math.abs(p.x - rect.x) < 1 || Math.abs(p.x - (rect.x + rect.w)) < 1;
            const onY = Math.abs(p.y - rect.y) < 1 || Math.abs(p.y - (rect.y + rect.h)) < 1;
            expect(onX || onY).toBe(true);
            expect(p.x).toBeGreaterThanOrEqual(rect.x - 1);
            expect(p.x).toBeLessThanOrEqual(rect.x + rect.w + 1);
        }
    });

    it("falls back to the viewport edges without surfaces", () => {
        const config = createRound({ shell: "phone", viewport: PHONE, rng: rng(5) }).config;
        const half = TARGET_PX / 2;
        for (let i = 0; i < 40; i++) {
            const { x, y } = spawnPoint([], config);
            const onEdge = x <= half + 0.01 || x >= PHONE.w - half - 0.01 || y <= half + 0.01 || y >= PHONE.h - half - 0.01;
            expect(onEdge).toBe(true);
        }
    });

    it("ignores surfaces that are off screen", () => {
        const config = createRound({ shell: "desktop", viewport: DESKTOP, rng: rng(2) }).config;
        const off: SurfaceRect = { x: 5000, y: 5000, w: 100, h: 100, kind: "icon" };
        const p = spawnPoint([off], config);
        expect(p.x).toBeLessThanOrEqual(DESKTOP.w);
        expect(p.y).toBeLessThanOrEqual(DESKTOP.h);
    });

    it("gives every bug a type from BUGS and cycles through all types first", () => {
        const state = createRound({ shell: "desktop", viewport: DESKTOP, rng: rng(9) });
        run(state, 4000);
        const types = state.bugs.map((b) => b.type);
        expect(types.every((t) => BUG_IDS.includes(t))).toBe(true);
        expect(new Set(types.slice(0, 6)).size).toBe(Math.min(6, types.length));
    });

    it("keeps bugs inside the viewport while they crawl", () => {
        const state = createRound({ shell: "phone", viewport: PHONE, rng: rng(4) });
        run(state, 20_000, [], (s) => {
            for (const b of s.bugs) {
                expect(b.x).toBeGreaterThanOrEqual(TARGET_PX / 2 - 0.001);
                expect(b.x).toBeLessThanOrEqual(PHONE.w - TARGET_PX / 2 + 0.001);
                expect(b.y).toBeGreaterThanOrEqual(TARGET_PX / 2 - 0.001);
                expect(b.y).toBeLessThanOrEqual(PHONE.h - TARGET_PX / 2 + 0.001);
            }
        });
    });
});

describe("active time", () => {
    it("pauses while hidden and resumes", () => {
        const state = createRound({ shell: "desktop", viewport: DESKTOP, rng: rng() });
        tick(state, 50);
        setPaused(state, true);
        tick(state, 50);
        tick(state, 5000);
        expect(state.activeMs).toBe(50);
        setPaused(state, false);
        tick(state, 30);
        expect(state.activeMs).toBe(80);
    });

    it("counts at most MAX_FRAME_MS for one long frame", () => {
        const state = createRound({ shell: "desktop", viewport: DESKTOP, rng: rng() });
        tick(state, 10_000);
        expect(state.activeMs).toBe(MAX_FRAME_MS);
    });

    it("ends at ROUND_MS and stops counting", () => {
        const state = createRound({ shell: "phone", viewport: PHONE, rng: rng() });
        run(state, ROUND_MS + 2000);
        expect(isOver(state)).toBe(true);
        expect(state.activeMs).toBe(ROUND_MS);
        expect(remainingMs(state)).toBe(0);
    });
});

describe("score", () => {
    it("catches, misses and reports the result mask", () => {
        const state = createRound({ shell: "desktop", viewport: DESKTOP, rng: rng(1) });
        run(state, 1500);
        const first = state.bugs[0];
        expect(catchBug(state, first.uid)?.type).toBe(first.type);
        expect(catchBug(state, first.uid)).toBeNull();
        expect(state.bugs.find((b) => b.uid === first.uid)).toBeUndefined();
        miss(state);
        miss(state);
        const result = resultOf(state);
        expect(result.score).toBe(1);
        expect(result.misses).toBe(2);
        expect(result.caughtTypes).toEqual([first.type]);
        expect(result.counts).toEqual({ [first.type]: 1 });
        expect(bugsFromMask(result.mask).map((b) => b.id)).toEqual([first.type]);
    });

    it("no catches after time is up", () => {
        const state = createRound({ shell: "desktop", viewport: DESKTOP, rng: rng(1), roundMs: 1000 });
        run(state, 1200);
        expect(isOver(state)).toBe(true);
        const left = state.bugs[0];
        expect(left && catchBug(state, left.uid)).toBeFalsy();
    });

    it("an instant catcher always stays inside the server's plausibility bound", () => {
        const state = createRound({ shell: "desktop", viewport: DESKTOP, rng: rng(21) });
        run(state, ROUND_MS, [], (s) => {
            for (const b of [...s.bugs]) catchBug(s, b.uid);
            const { score, activeMs } = resultOf(s);
            expect(score).toBeLessThanOrEqual(Math.ceil((MAX_CATCHES_PER_SECOND * activeMs) / 1000));
        });
        expect(state.score).toBeGreaterThan(100);
    });

    it("finds the nearest bug for keyboard focus", () => {
        const state = createRound({ shell: "desktop", viewport: DESKTOP, rng: rng(8) });
        run(state, 3000);
        const [a] = state.bugs;
        expect(nearestBug(state, a.x, a.y)?.uid).toBe(a.uid);
        expect(nearestBug(state, a.x, a.y, a.uid)?.uid).not.toBe(a.uid);
    });
});

describe("motion", () => {
    it("keyboard mode slows bugs by 40%", () => {
        const make = () => {
            const s = createRound({ shell: "desktop", viewport: DESKTOP, rng: () => 0.5 });
            run(s, 500);
            const b = s.bugs[0];
            Object.assign(b, { x: 700, y: 450, angle: 0, turn: 0 });
            return s;
        };
        const normal = make();
        const slow = setKeyboard(make(), true);
        tick(normal, 50);
        tick(slow, 50);
        const dNormal = normal.bugs[0].x - 700;
        const dSlow = slow.bugs[0].x - 700;
        expect(dSlow / dNormal).toBeCloseTo(KEYBOARD_FACTOR, 5);
    });

    it("reduced motion: bugs stay put, then fade away", () => {
        const state = createRound({ shell: "phone", viewport: PHONE, rng: rng(6), reducedMotion: true });
        run(state, 600);
        const b = state.bugs[0];
        const { x, y, uid } = b;
        run(state, 1000);
        const same = state.bugs.find((x) => x.uid === uid)!;
        expect([same.x, same.y]).toEqual([x, y]);
        run(state, 3000);
        expect(state.bugs.find((x) => x.uid === uid)).toBeUndefined();
    });
});
