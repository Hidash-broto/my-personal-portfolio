import { create } from "zustand";
import { getApp, type WindowAppId } from "@/apps/registry";

/** Geometry and stacking only. Which apps are open lives in the URL (see url.ts). */
export interface WindowGeometry {
    x: number;
    y: number;
    w: number;
    h: number;
    z: number;
    minimized: boolean;
    zoomed: boolean;
}

export type OsMode = "normal" | "game";

interface StoreState {
    windows: Partial<Record<WindowAppId, WindowGeometry>>;
    topZ: number;
    mode: OsMode;
    ensure: (app: WindowAppId, viewport: { w: number; h: number }) => void;
    raise: (app: WindowAppId) => void;
    move: (app: WindowAppId, x: number, y: number) => void;
    resize: (app: WindowAppId, w: number, h: number) => void;
    setMinimized: (app: WindowAppId, minimized: boolean) => void;
    toggleZoom: (app: WindowAppId) => void;
    forget: (app: WindowAppId) => void;
    setMode: (mode: OsMode) => void;
}

const CASCADE = 28;
const MIN = { w: 360, h: 260 };

export const useOsStore = create<StoreState>()((set, get) => ({
    windows: {},
    topZ: 10,
    mode: "normal",

    ensure: (app, viewport) => {
        const existing = get().windows[app];
        const topZ = get().topZ + 1;
        if (existing) {
            set({ topZ, windows: { ...get().windows, [app]: { ...existing, z: topZ, minimized: false } } });
            return;
        }
        const manifest = getApp(app);
        const size = manifest.kind === "window" ? manifest.defaultSize : { w: 640, h: 480 };
        const count = Object.keys(get().windows).length;
        const w = Math.min(size.w, viewport.w - 40);
        const h = Math.min(size.h, viewport.h - 120);
        const x = Math.max(20, Math.round((viewport.w - w) / 2) - 120 + count * CASCADE);
        const y = Math.max(40, 60 + count * CASCADE);
        set({ topZ, windows: { ...get().windows, [app]: { x, y, w, h, z: topZ, minimized: false, zoomed: false } } });
    },

    raise: (app) => {
        const g = get().windows[app];
        if (!g || g.z === get().topZ) return;
        const topZ = get().topZ + 1;
        set({ topZ, windows: { ...get().windows, [app]: { ...g, z: topZ } } });
    },

    move: (app, x, y) => {
        const g = get().windows[app];
        if (g && get().mode === "normal") set({ windows: { ...get().windows, [app]: { ...g, x, y } } });
    },

    resize: (app, w, h) => {
        const g = get().windows[app];
        if (g && get().mode === "normal") {
            set({ windows: { ...get().windows, [app]: { ...g, w: Math.max(MIN.w, w), h: Math.max(MIN.h, h) } } });
        }
    },

    setMinimized: (app, minimized) => {
        const g = get().windows[app];
        if (g) set({ windows: { ...get().windows, [app]: { ...g, minimized } } });
    },

    toggleZoom: (app) => {
        const g = get().windows[app];
        if (g && get().mode === "normal") set({ windows: { ...get().windows, [app]: { ...g, zoomed: !g.zoomed } } });
    },

    forget: (app) => {
        const windows = { ...get().windows };
        delete windows[app];
        set({ windows });
    },

    setMode: (mode) => set({ mode }),
}));
