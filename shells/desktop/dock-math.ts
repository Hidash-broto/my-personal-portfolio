/**
 * Dock magnification, transform-only. Icons are laid out at their rest size; hovering
 * computes a scale per icon (cosine falloff around the pointer) and a sideways shift so
 * scaled neighbours never overlap. The Dock background stretches by the total extra width.
 */

export interface MagnifyOptions {
    /** Rest icon size in px. */
    base: number;
    /** Peak scale right under the pointer. */
    max: number;
    /** Distance (px) at which the effect reaches zero. ~3 neighbours either side. */
    range: number;
}

export const DOCK_ICON = 56;
export const DOCK_GAP = 10;
export const DOCK_MAGNIFY: MagnifyOptions = { base: DOCK_ICON, max: 1.6, range: 3.25 * (DOCK_ICON + DOCK_GAP) };

/** Scale for one icon whose centre is `distance` px from the pointer. `intensity` fades the whole effect in/out (0..1). */
export function magnifyScale(distance: number, intensity: number, opts: MagnifyOptions = DOCK_MAGNIFY): number {
    const d = Math.abs(distance);
    if (!Number.isFinite(d) || d >= opts.range || intensity <= 0) return 1;
    const falloff = (1 + Math.cos((Math.PI * d) / opts.range)) / 2;
    return 1 + (opts.max - 1) * falloff * Math.min(1, intensity);
}

export interface DockLayout {
    scales: number[];
    /** translateX per item, so neighbours make room symmetrically. */
    offsets: number[];
    /** Total extra width the Dock gains. */
    extra: number;
}

/**
 * @param pointerX pointer x relative to the Dock's left edge (rest layout)
 * @param centers  rest centre x of every item, left to right
 * @param fixed    items that never scale (the separator), still shifted
 */
export function dockLayout(
    pointerX: number,
    intensity: number,
    centers: readonly number[],
    fixed: readonly boolean[] = [],
    opts: MagnifyOptions = DOCK_MAGNIFY,
): DockLayout {
    const scales = centers.map((c, i) => (fixed[i] ? 1 : magnifyScale(pointerX - c, intensity, opts)));
    const extras = scales.map((s) => (s - 1) * opts.base);
    const extra = extras.reduce((a, b) => a + b, 0);
    let before = 0;
    const offsets = extras.map((e) => {
        const offset = before + e / 2 - extra / 2;
        before += e;
        return offset;
    });
    return { scales, offsets, extra };
}
