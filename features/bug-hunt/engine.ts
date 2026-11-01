/**
 * Bug Hunt game engine. Pure and DOM-free: the view feeds it frame deltas and spawn
 * rectangles, and reads positions back. State is mutated in place (≤10 bugs, 60fps),
 * and every function also returns what it changed so it stays easy to test.
 */
import { BUGS, BUG_IDS, MAX_CATCHES_PER_SECOND, ROUND_MS, bugMask, type BugId } from "@/data/bugs";
import type { ShellKind, SpawnKind } from "@/lib/os";

/** Every bug is a 44px tap target, centered on its position. */
export const TARGET_PX = 44;
const HALF = TARGET_PX / 2;

/** A frame longer than this (tab switch, jank) only counts this much active time. */
export const MAX_FRAME_MS = 100;
/** Minimum active time between two spawns. */
export const SPAWN_GAP_MS = 420;
/** Keyboard players get bugs that move 40% slower. */
export const KEYBOARD_FACTOR = 0.6;
/** Reduced motion: bugs fade in, sit still for this long, then fade out. */
export const STILL_LIFE_MS: Record<ShellKind, number> = { phone: 2900, desktop: 2500 };
export const FADE_MS = 260;

const MAX_BUGS: Record<ShellKind, number> = { phone: 6, desktop: 10 };
const START_BUGS: Record<ShellKind, number> = { phone: 3, desktop: 4 };
const RAMP_MS: Record<ShellKind, number> = { phone: 9000, desktop: 6500 };
/** Crawl speed in px/s for a bug with speed 1. */
const BASE_SPEED: Record<ShellKind, number> = { phone: 84, desktop: 118 };

export interface Viewport {
    w: number;
    h: number;
}

/** A spawn surface in viewport coordinates. */
export interface SurfaceRect {
    x: number;
    y: number;
    w: number;
    h: number;
    kind: SpawnKind;
}

export interface BugEntity {
    uid: number;
    type: BugId;
    x: number;
    y: number;
    /** Heading in radians, 0 = +x. */
    angle: number;
    /** Angular velocity (rad/s) for the gentle wander. */
    turn: number;
    /** px/s before the keyboard factor. */
    speed: number;
    /** Active ms since spawn. */
    age: number;
    /** Reduced motion lifetime; null while crawling. */
    life: number | null;
}

export interface RoundConfig {
    shell: ShellKind;
    viewport: Viewport;
    reducedMotion: boolean;
    /** Reserved space (HUD) bugs never crawl under. */
    insets: { top: number; bottom: number };
    rng: () => number;
    roundMs: number;
}

export interface RoundState {
    config: RoundConfig;
    bugs: BugEntity[];
    activeMs: number;
    paused: boolean;
    keyboard: boolean;
    score: number;
    misses: number;
    /** Every catch, in order. */
    caught: BugId[];
    spawned: number;
    spawnedByType: Record<BugId, number>;
    lastSpawnAt: number;
    nextUid: number;
    /** Bumps whenever the set of bugs changes, so the view knows to re-render. */
    version: number;
}

export interface RoundResult {
    score: number;
    activeMs: number;
    mask: number;
    /** Unique caught types, in BUGS order. */
    caughtTypes: BugId[];
    /** Catches per type. */
    counts: Partial<Record<BugId, number>>;
    misses: number;
}

export function maxBugs(shell: ShellKind): number {
    return MAX_BUGS[shell];
}

export function createRound(config: Partial<RoundConfig> & Pick<RoundConfig, "shell" | "viewport">): RoundState {
    const full: RoundConfig = {
        reducedMotion: false,
        insets: { top: 0, bottom: 0 },
        rng: Math.random,
        roundMs: ROUND_MS,
        ...config,
    };
    return {
        config: full,
        bugs: [],
        activeMs: 0,
        paused: false,
        keyboard: false,
        score: 0,
        misses: 0,
        caught: [],
        spawned: 0,
        spawnedByType: Object.fromEntries(BUG_IDS.map((id) => [id, 0])) as Record<BugId, number>,
        lastSpawnAt: Number.NEGATIVE_INFINITY,
        nextUid: 1,
        version: 0,
    };
}

export function remainingMs(state: RoundState): number {
    return Math.max(0, state.config.roundMs - state.activeMs);
}

export function isOver(state: RoundState): boolean {
    return state.activeMs >= state.config.roundMs;
}

/** How many bugs should be on screen now: ramps up to the shell's cap. */
export function targetCount(state: RoundState): number {
    const { shell } = state.config;
    return Math.min(MAX_BUGS[shell], START_BUGS[shell] + Math.floor(state.activeMs / RAMP_MS[shell]));
}

/**
 * Spawns never outpace the server's plausibility bound, so an honest round can always
 * be signed: total spawned ≤ ceil(MAX_CATCHES_PER_SECOND × active seconds).
 */
export function spawnAllowance(activeMs: number): number {
    return Math.ceil((MAX_CATCHES_PER_SECOND * activeMs) / 1000);
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function bounds(config: RoundConfig) {
    const { w, h } = config.viewport;
    const minY = Math.min(h / 2, HALF + config.insets.top);
    return { minX: HALF, maxX: Math.max(HALF, w - HALF), minY, maxY: Math.max(minY, h - HALF - config.insets.bottom) };
}

/** Where a new bug appears and which way it heads: out of a surface, or in from a viewport edge. */
export function spawnPoint(rects: readonly SurfaceRect[], config: RoundConfig): { x: number; y: number; angle: number } {
    const { rng, viewport } = config;
    const b = bounds(config);
    const visible = rects.filter((r) => r.w > 0 && r.h > 0 && r.x + r.w > 0 && r.y + r.h > 0 && r.x < viewport.w && r.y < viewport.h);

    let x: number;
    let y: number;
    let angle: number;
    if (visible.length > 0) {
        const r = visible[Math.floor(rng() * visible.length) % visible.length];
        // A point on the perimeter, weighted by side length; the bug heads outward.
        let t = rng() * 2 * (r.w + r.h);
        if (t < r.w) {
            [x, y, angle] = [r.x + t, r.y, -Math.PI / 2];
        } else if ((t -= r.w) < r.h) {
            [x, y, angle] = [r.x + r.w, r.y + t, 0];
        } else if ((t -= r.h) < r.w) {
            [x, y, angle] = [r.x + r.w - t, r.y + r.h, Math.PI / 2];
        } else {
            t -= r.w;
            [x, y, angle] = [r.x, r.y + r.h - t, Math.PI];
        }
    } else {
        // No surfaces: enter from a viewport edge, heading inward.
        const side = Math.floor(rng() * 4) % 4;
        const u = rng();
        if (side === 0) [x, y, angle] = [b.minX + u * (b.maxX - b.minX), b.minY, Math.PI / 2];
        else if (side === 1) [x, y, angle] = [b.maxX, b.minY + u * (b.maxY - b.minY), Math.PI];
        else if (side === 2) [x, y, angle] = [b.minX + u * (b.maxX - b.minX), b.maxY, -Math.PI / 2];
        else [x, y, angle] = [b.minX, b.minY + u * (b.maxY - b.minY), 0];
    }
    angle += (rng() - 0.5) * 1.1;
    return { x: clamp(x, b.minX, b.maxX), y: clamp(y, b.minY, b.maxY), angle };
}

/** Least-spawned type first, so a round shows every lesson before repeating. */
function pickType(state: RoundState): BugId {
    const min = Math.min(...BUG_IDS.map((id) => state.spawnedByType[id]));
    const pool = BUG_IDS.filter((id) => state.spawnedByType[id] === min);
    return pool[Math.floor(state.config.rng() * pool.length) % pool.length];
}

export function spawnBug(state: RoundState, rects: readonly SurfaceRect[]): BugEntity {
    const type = pickType(state);
    const spec = BUGS.find((b) => b.id === type)!;
    const { x, y, angle } = spawnPoint(rects, state.config);
    const bug: BugEntity = {
        uid: state.nextUid++,
        type,
        x,
        y,
        angle,
        turn: 0,
        speed: BASE_SPEED[state.config.shell] * spec.speed,
        age: 0,
        life: state.config.reducedMotion ? STILL_LIFE_MS[state.config.shell] : null,
    };
    state.bugs.push(bug);
    state.spawned += 1;
    state.spawnedByType[type] += 1;
    state.lastSpawnAt = state.activeMs;
    state.version += 1;
    return bug;
}

function crawl(state: RoundState, bug: BugEntity, ms: number) {
    const sec = ms / 1000;
    const { rng } = state.config;
    // Gentle wander: a damped random walk on the turning rate.
    bug.turn = clamp((bug.turn + (rng() - 0.5) * 9 * sec) * Math.pow(0.4, sec), -2.2, 2.2);
    bug.angle += bug.turn * sec;
    const v = bug.speed * (state.keyboard ? KEYBOARD_FACTOR : 1);
    bug.x += Math.cos(bug.angle) * v * sec;
    bug.y += Math.sin(bug.angle) * v * sec;

    const b = bounds(state.config);
    if (bug.x < b.minX || bug.x > b.maxX) {
        bug.x = clamp(bug.x, b.minX, b.maxX);
        bug.angle = Math.PI - bug.angle;
        bug.turn = -bug.turn;
    }
    if (bug.y < b.minY || bug.y > b.maxY) {
        bug.y = clamp(bug.y, b.minY, b.maxY);
        bug.angle = -bug.angle;
        bug.turn = -bug.turn;
    }
}

/**
 * Advance the round by one frame. Only unpaused time counts, and a single frame never
 * counts more than MAX_FRAME_MS. `getRects` is only called when a bug actually spawns.
 */
export function tick(state: RoundState, dtMs: number, getRects: () => readonly SurfaceRect[] = () => []): RoundState {
    if (state.paused || isOver(state) || !(dtMs > 0)) return state;
    const ms = Math.min(dtMs, MAX_FRAME_MS);
    state.activeMs = Math.min(state.config.roundMs, state.activeMs + ms);

    for (let i = state.bugs.length - 1; i >= 0; i--) {
        const bug = state.bugs[i];
        bug.age += ms;
        if (bug.life !== null) {
            if (bug.age >= bug.life) {
                state.bugs.splice(i, 1);
                state.version += 1;
            }
        } else {
            crawl(state, bug, ms);
        }
    }

    if (
        !isOver(state) &&
        state.bugs.length < targetCount(state) &&
        state.activeMs - state.lastSpawnAt >= SPAWN_GAP_MS &&
        state.spawned < spawnAllowance(state.activeMs)
    ) {
        spawnBug(state, getRects());
    }
    return state;
}

/** Catch a bug by uid. Returns the caught bug, or null if it is gone or the round is over. */
export function catchBug(state: RoundState, uid: number): BugEntity | null {
    if (isOver(state)) return null;
    const i = state.bugs.findIndex((b) => b.uid === uid);
    if (i < 0) return null;
    const [bug] = state.bugs.splice(i, 1);
    state.score += 1;
    state.caught.push(bug.type);
    state.version += 1;
    return bug;
}

/** A tap on empty space. Counted for stats only. */
export function miss(state: RoundState): number {
    if (!isOver(state)) state.misses += 1;
    return state.misses;
}

export function setPaused(state: RoundState, paused: boolean): RoundState {
    state.paused = paused;
    return state;
}

export function setKeyboard(state: RoundState, keyboard: boolean): RoundState {
    state.keyboard = keyboard;
    return state;
}

export function setViewport(state: RoundState, viewport: Viewport): RoundState {
    state.config.viewport = viewport;
    const b = bounds(state.config);
    for (const bug of state.bugs) {
        bug.x = clamp(bug.x, b.minX, b.maxX);
        bug.y = clamp(bug.y, b.minY, b.maxY);
    }
    return state;
}

/** 0..1 opacity of a still (reduced motion) bug; crawling bugs are always 1. */
export function bugOpacity(bug: BugEntity): number {
    if (bug.life === null) return 1;
    return clamp(Math.min(bug.age / FADE_MS, (bug.life - bug.age) / FADE_MS), 0, 1);
}

/** The nearest live bug to a point, optionally skipping one. */
export function nearestBug(state: RoundState, x: number, y: number, skipUid?: number): BugEntity | null {
    let best: BugEntity | null = null;
    let bestD = Infinity;
    for (const bug of state.bugs) {
        if (bug.uid === skipUid) continue;
        const d = (bug.x - x) ** 2 + (bug.y - y) ** 2;
        if (d < bestD) [best, bestD] = [bug, d];
    }
    return best;
}

export function resultOf(state: RoundState): RoundResult {
    return {
        score: state.score,
        activeMs: Math.ceil(state.activeMs),
        mask: bugMask(state.caught),
        caughtTypes: BUG_IDS.filter((id) => state.caught.includes(id)),
        counts: state.caught.reduce<Partial<Record<BugId, number>>>((acc, id) => ({ ...acc, [id]: (acc[id] ?? 0) + 1 }), {}),
        misses: state.misses,
    };
}
