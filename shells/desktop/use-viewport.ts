"use client";

import { useSyncExternalStore } from "react";
import type { Viewport } from "./geometry";

let cached: Viewport = { w: 1440, h: 900 };

function snapshot(): Viewport {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (cached.w !== w || cached.h !== h) cached = { w, h };
    return cached;
}

function subscribe(callback: () => void) {
    window.addEventListener("resize", callback);
    return () => window.removeEventListener("resize", callback);
}

const server = (): Viewport => cached;

/** Current viewport, for event handlers and effects. */
export function readViewport(): Viewport {
    return snapshot();
}

export function useViewport(): Viewport {
    return useSyncExternalStore(subscribe, snapshot, server);
}
