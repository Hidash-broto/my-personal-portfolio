"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore, type RefObject } from "react";
import type { WindowAppId } from "@/apps/registry";
import { readBest, subscribeBest } from "@/features/bug-hunt/best";
import { os, useOs, useOsStore } from "@/lib/os";
import { ICON_RADIUS_RATIO, type Viewport } from "./geometry";
import { setLaunchOrigin } from "./launch";

function subscribeResize(cb: () => void) {
    window.addEventListener("resize", cb);
    window.addEventListener("orientationchange", cb);
    return () => {
        window.removeEventListener("resize", cb);
        window.removeEventListener("orientationchange", cb);
    };
}

const readViewport = () => `${window.innerWidth}x${window.innerHeight}`;

/** Layout viewport size (re-reads on resize/rotation). */
export function useViewport(): Viewport {
    const key = useSyncExternalStore(subscribeResize, readViewport, () => "390x844");
    return useMemo(() => {
        const [w, h] = key.split("x").map(Number);
        return { w: w || 390, h: h || 844 };
    }, [key]);
}

export interface LaunchFrom {
    el: HTMLElement | null;
    kind: "icon" | "widget";
    radius?: number;
}

/** Open a window app from a tap: remembers the origin for the zoom, updates the URL, tells the bus. */
export function useLaunch() {
    const { history } = useOs();
    return useCallback(
        (app: WindowAppId, item: string | null = null, from?: LaunchFrom) => {
            if (from?.el) {
                const rect = from.el.getBoundingClientRect();
                setLaunchOrigin({ app, el: from.el, kind: from.kind, radius: from.radius ?? rect.width * ICON_RADIUS_RATIO });
            }
            history.open(app, item);
            os.emit("app:open", { app, item });
        },
        [history],
    );
}

/** Close the open app from the UI (Back, home bar, card close). */
export function useCloseApp() {
    const { history } = useOs();
    return useCallback(
        (app: WindowAppId) => {
            history.close(app);
            os.emit("app:close", { app });
        },
        [history],
    );
}

const readTodaysBest = () => readBest();

/** Today's best Bug Hunt score on this device, or null (owned by features/bug-hunt/best). */
export function useBugHuntBest(): number | null {
    return useSyncExternalStore(subscribeBest, readTodaysBest, () => null);
}

/** True while a Bug Hunt round is being played (the OS is locked to the home screen). */
export function useGameActive(): boolean {
    return useOsStore((s) => s.mode) === "game";
}

export const IDLE_MS = 30_000;
const IDLE_INPUTS = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;

/** Emits `idle` on the bus after `ms` without input (once per quiet spell). */
export function useIdleEmitter(ms = IDLE_MS) {
    useEffect(() => {
        const fire = () => os.emit("idle", {});
        let timer = window.setTimeout(fire, ms);
        const reset = () => {
            window.clearTimeout(timer);
            timer = window.setTimeout(fire, ms);
        };
        for (const type of IDLE_INPUTS) window.addEventListener(type, reset, { passive: true, capture: true });
        return () => {
            window.clearTimeout(timer);
            for (const type of IDLE_INPUTS) window.removeEventListener(type, reset, { capture: true });
        };
    }, [ms]);
}

export const DOCK_CLEARANCE_VAR = "--hos-phone-dock-clearance";
/** Gap kept between the dock's top edge and whatever sits above it. */
const DOCK_GAP = 4;

/**
 * Publishes `--hos-phone-dock-clearance` on :root: the distance from the top of the bottom
 * safe area to just above the dock (the character and its bubbles sit above this line).
 */
export function useDockClearance(dock: RefObject<HTMLElement | null>, safeProbe: RefObject<HTMLElement | null>) {
    useEffect(() => {
        const root = document.documentElement;
        const update = () => {
            const el = dock.current;
            const parent = (el?.offsetParent ?? el?.parentElement) as HTMLElement | null | undefined;
            if (!el || !parent) return;
            // Layout offsets, not client rects: the home screen may be scaled behind an open app.
            const safe = safeProbe.current?.offsetHeight ?? 0;
            const clearance = Math.round(parent.clientHeight - el.offsetTop - safe + DOCK_GAP);
            if (clearance > 0) root.style.setProperty(DOCK_CLEARANCE_VAR, `${clearance}px`);
        };
        update();
        window.addEventListener("resize", update);
        window.addEventListener("orientationchange", update);
        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("orientationchange", update);
            root.style.removeProperty(DOCK_CLEARANCE_VAR);
        };
    }, [dock, safeProbe]);
}
