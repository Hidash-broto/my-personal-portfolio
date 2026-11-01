/**
 * Where bugs may spawn. Deliberately NOT React state: rectangles change every frame
 * while windows move, and the game loop reads them on demand.
 */
export type SpawnKind = "window" | "icon" | "widget";

export interface SpawnRect {
    id: string;
    kind: SpawnKind;
    rect: DOMRect;
}

const surfaces = new Map<string, { kind: SpawnKind; el: Element }>();

export function registerSpawnSurface(id: string, kind: SpawnKind, el: Element): () => void {
    surfaces.set(id, { kind, el });
    return () => {
        if (surfaces.get(id)?.el === el) surfaces.delete(id);
    };
}

/** Visible surfaces only (zero-size elements are skipped). */
export function getSpawnRects(kinds?: readonly SpawnKind[]): SpawnRect[] {
    const out: SpawnRect[] = [];
    for (const [id, { kind, el }] of surfaces) {
        if (kinds && !kinds.includes(kind)) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) out.push({ id, kind, rect });
    }
    return out;
}

export function clearSpawnSurfaces() {
    surfaces.clear();
}
