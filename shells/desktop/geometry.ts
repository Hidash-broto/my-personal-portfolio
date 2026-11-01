/**
 * Pure window geometry for the desktop shell. Everything here is in viewport pixels.
 * The store (lib/os) owns the numbers; these helpers decide what is allowed and what is shown.
 */

export const MENU_BAR_H = 28;
/** Space kept free under a zoomed window for the Dock (76px dock + 10px gap + breathing room). */
export const DOCK_RESERVE = 96;
/** Title bar / unified toolbar height. */
export const TITLE_BAR_H = 40;
/** Mirrors the store's minimum (lib/os/store.ts MIN). */
export const MIN_W = 360;
export const MIN_H = 260;
/** At least this much of a window stays on screen horizontally while dragging. */
export const MIN_VISIBLE = 96;
/** Gap around a zoomed window. */
export const ZOOM_INSET = 8;

export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface Viewport {
    w: number;
    h: number;
}

export type Edge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export const EDGES: readonly Edge[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

export const EDGE_CURSOR: Record<Edge, string> = {
    n: "ns-resize",
    s: "ns-resize",
    e: "ew-resize",
    w: "ew-resize",
    ne: "nesw-resize",
    sw: "nesw-resize",
    nw: "nwse-resize",
    se: "nwse-resize",
};

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), Math.max(min, max));
}

/**
 * Where a dragged window may sit. Like macOS: the title bar never goes under the menu bar,
 * never sinks below the Dock line, and a strip of the window always stays on screen sideways.
 */
export function clampPosition(x: number, y: number, size: { w: number; h: number }, vp: Viewport): { x: number; y: number } {
    const minX = Math.min(0, MIN_VISIBLE - size.w);
    const maxX = vp.w - MIN_VISIBLE;
    const minY = MENU_BAR_H;
    const maxY = vp.h - DOCK_RESERVE;
    return { x: Math.round(clamp(x, minX, maxX)), y: Math.round(clamp(y, minY, maxY)) };
}

/** The rectangle a window is drawn at: its stored geometry, fitted to the current viewport. */
export function fitRect(g: Rect, vp: Viewport): Rect {
    const w = Math.min(g.w, Math.max(MIN_W, vp.w - 2 * ZOOM_INSET));
    const h = Math.min(g.h, Math.max(MIN_H, vp.h - MENU_BAR_H - ZOOM_INSET));
    const { x, y } = clampPosition(g.x, g.y, { w, h }, vp);
    return { x, y, w, h };
}

/** Zoomed = the whole area below the menu bar and above the Dock. */
export function zoomRect(vp: Viewport): Rect {
    const y = MENU_BAR_H + ZOOM_INSET / 2;
    return {
        x: ZOOM_INSET,
        y,
        w: Math.max(MIN_W, vp.w - 2 * ZOOM_INSET),
        h: Math.max(MIN_H, vp.h - y - DOCK_RESERVE),
    };
}

/**
 * Resize from an edge or corner by a pointer delta. Opposite edges stay put, the minimum
 * size is respected, and the window never grows past the viewport or under the menu bar.
 */
export function resizeRect(start: Rect, edge: Edge, dx: number, dy: number, vp: Viewport): Rect {
    let { x, y, w, h } = start;
    const right = start.x + start.w;
    const bottom = start.y + start.h;

    if (edge.includes("e")) w = clamp(start.w + dx, MIN_W, Math.max(start.w, vp.w - start.x));
    if (edge.includes("s")) h = clamp(start.h + dy, MIN_H, Math.max(start.h, vp.h - start.y));
    if (edge.includes("w")) {
        x = clamp(start.x + dx, Math.min(0, start.x), right - MIN_W);
        w = right - x;
    }
    if (edge.includes("n")) {
        y = clamp(start.y + dy, MENU_BAR_H, bottom - MIN_H);
        h = bottom - y;
    }
    return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
}

/**
 * Dragging a zoomed window restores its normal size under the pointer, keeping the
 * pointer at the same relative spot across the title bar (macOS behaviour).
 */
export function restoreUnderPointer(size: { w: number; h: number }, zoomed: Rect, pointer: { x: number; y: number }, vp: Viewport): Rect {
    const ratio = zoomed.w > 0 ? (pointer.x - zoomed.x) / zoomed.w : 0.5;
    const x = pointer.x - ratio * size.w;
    const y = pointer.y - Math.min(pointer.y - zoomed.y, TITLE_BAR_H - 4);
    return { ...clampPosition(x, y, size, vp), w: size.w, h: size.h };
}
