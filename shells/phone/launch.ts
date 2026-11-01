"use client";

import { useEffect, type RefObject } from "react";
import type { AppId } from "@/apps/registry";

/**
 * Where each app's icon is on the home screen, and where the last launch came from
 * (an icon or a widget). Non-reactive on purpose: read once when an app opens or closes.
 */
const icons = new Map<AppId, HTMLElement>();

export interface LaunchOrigin {
    app: AppId;
    el: HTMLElement;
    radius: number;
    kind: "icon" | "widget";
    at: number;
}

let lastOrigin: LaunchOrigin | null = null;

export function useIconTarget(app: AppId, ref: RefObject<HTMLElement | null>) {
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        icons.set(app, el);
        return () => {
            if (icons.get(app) === el) icons.delete(app);
        };
    }, [app, ref]);
}

export function getIconElement(app: AppId): HTMLElement | null {
    const el = icons.get(app);
    return el && el.isConnected ? el : null;
}

export function setLaunchOrigin(origin: Omit<LaunchOrigin, "at">) {
    lastOrigin = { ...origin, at: Date.now() };
}

/** The origin of a launch that just happened for `app` (valid for a moment, then stale). */
export function getLaunchOrigin(app: AppId): LaunchOrigin | null {
    if (!lastOrigin || lastOrigin.app !== app || Date.now() - lastOrigin.at > 1500 || !lastOrigin.el.isConnected) return null;
    return lastOrigin;
}
