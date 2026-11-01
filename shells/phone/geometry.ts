/**
 * Pure geometry for the phone shell: the app zoom (icon rect -> full screen), the
 * home-bar drag card, and the dismiss decision. No DOM, no React: unit tested.
 */

export interface Box {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface Viewport {
    w: number;
    h: number;
}

export interface Sample {
    /** ms timestamp */
    t: number;
    /** clientY in px */
    y: number;
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** The phone icon squircle radius ratio (continuous-corner approximation). */
export const ICON_RADIUS_RATIO = 0.2237;
/** Corner radius the app card takes while it is being dragged (device-like). */
export const CARD_RADIUS = 40;
/** Smallest the app card gets while dragged, as a fraction of the screen. */
export const CARD_MIN_SCALE = 0.4;
/** Soft limit for how far the card lifts, as a fraction of the screen height. */
const LIFT_LIMIT = 0.45;

export function fullBox(vp: Viewport): Box {
    return { x: 0, y: 0, w: vp.w, h: vp.h };
}

/** Fallback origin when no icon is on screen: a small square in the middle. */
export function centerBox(vp: Viewport, size = 62): Box {
    return { x: (vp.w - size) / 2, y: (vp.h - size) / 2, w: size, h: size };
}

/** Rect -> Box, from anything with left/top/width/height (DOMRect). */
export function toBox(rect: { left: number; top: number; width: number; height: number }): Box {
    return { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
}

/**
 * The home screen is scaled around the viewport centre while an app is open. Undo that
 * so the closing app lands where the icon will be once the home screen is back at 1.
 */
export function unscaleBox(box: Box, scale: number, vp: Viewport): Box {
    if (scale <= 0 || scale === 1) return box;
    const cx = vp.w / 2;
    const cy = vp.h / 2;
    return { x: cx + (box.x - cx) / scale, y: cy + (box.y - cy) / scale, w: box.w / scale, h: box.h / scale };
}

/**
 * How far the home bar has lifted the app, in px, with a soft limit so the card never
 * leaves the screen. Downward drags give a tiny rubber band.
 */
export function liftFor(dragY: number, vp: Viewport): number {
    const limit = vp.h * LIFT_LIMIT;
    if (dragY >= 0) return -Math.min(14, dragY * 0.12);
    return limit * (1 - Math.exp(dragY / limit));
}

/** 0 (resting) .. ~1 (lifted to the limit). */
export function dragProgress(dragY: number, vp: Viewport): number {
    return clamp(liftFor(dragY, vp) / (vp.h * LIFT_LIMIT), 0, 1);
}

/** The card the app becomes while the home bar is dragged: shrinks, follows the finger. */
export function cardBox(dragY: number, vp: Viewport): Box {
    const lift = liftFor(dragY, vp);
    const s = 1 - (1 - CARD_MIN_SCALE) * dragProgress(dragY, vp);
    const w = vp.w * s;
    const h = vp.h * s;
    return { x: (vp.w - w) / 2, y: vp.h - lift - h, w, h };
}

export function cardRadius(dragY: number, vp: Viewport): number {
    return Math.min(CARD_RADIUS, Math.max(0, liftFor(dragY, vp)) * 1.4);
}

export interface Frame {
    /** translate, px (transform-origin 0 0) */
    x: number;
    y: number;
    /** non-uniform scale of the full-screen sheet onto the frame box */
    sx: number;
    sy: number;
    /** corner radius on screen, px */
    radius: number;
    /** scaleY for the content layer so content stays uniformly scaled (fit width, centre crop) */
    innerScaleY: number;
}

/**
 * Where the full-screen sheet is drawn at progress `p` (0 = origin, 1 = card/full screen).
 * Transform-only: translate + scale, plus a counter-scale for the content layer.
 */
export function frameAt(p: number, origin: Box, originRadius: number, dragY: number, vp: Viewport): Frame {
    const card = cardBox(dragY, vp);
    const w = Math.max(1, lerp(origin.w, card.w, p));
    const h = Math.max(1, lerp(origin.h, card.h, p));
    const sx = w / vp.w;
    const sy = h / vp.h;
    return {
        x: lerp(origin.x, card.x, p),
        y: lerp(origin.y, card.y, p),
        sx,
        sy,
        radius: Math.max(0, lerp(originRadius, cardRadius(dragY, vp), p)),
        innerScaleY: sx / sy,
    };
}

/** CSS border-radius in the sheet's own (pre-scale) space so it reads as `radius` on screen. */
export function radiusCss(frame: Frame): string {
    if (frame.radius <= 0.01) return "0px";
    return `${frame.radius / frame.sx}px / ${frame.radius / frame.sy}px`;
}

/** Release velocity in px/ms from the last ~80ms of pointer samples (negative = upward). */
export function releaseVelocity(samples: readonly Sample[], windowMs = 80): number {
    if (samples.length < 2) return 0;
    const last = samples[samples.length - 1];
    let first = samples[samples.length - 2];
    for (let i = samples.length - 2; i >= 0; i--) {
        if (last.t - samples[i].t > windowMs) break;
        first = samples[i];
    }
    const dt = last.t - first.t;
    return dt > 0 ? (last.y - first.y) / dt : 0;
}

export const DISMISS_DISTANCE_RATIO = 0.16;
export const FLING_VELOCITY = -0.45; // px/ms upward
export const FLING_MIN_DISTANCE = 12;

/**
 * Home-bar release: close the app when dragged far enough, or flicked up quickly.
 * A downward motion at release always cancels (the user changed their mind).
 */
export function shouldDismiss({ dragY, velocity, viewportHeight }: { dragY: number; velocity: number; viewportHeight: number }): boolean {
    if (velocity > 0.25) return false;
    const distance = -dragY;
    if (distance >= viewportHeight * DISMISS_DISTANCE_RATIO) return true;
    return velocity <= FLING_VELOCITY && distance >= FLING_MIN_DISTANCE;
}
