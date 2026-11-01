"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { ShellKind } from "@/lib/os";
import type { WindowAppId } from "./registry";

/** Every app view gets the same props on both shells; it adapts layout to `shell`. */
export interface AppViewProps {
    shell: ShellKind;
    /** Selected item id from the URL (a Build, a Note slug, a Journey role). */
    item: string | null;
    /** Select an item (updates the URL). */
    openItem: (item: string | null) => void;
    /** Close this app. */
    close: () => void;
    /** Open another app (optionally at an item) without leaving the OS. */
    openApp: (app: WindowAppId, item?: string | null) => void;
}

type Loader = () => Promise<{ default: ComponentType<AppViewProps> }>;

const LOADERS: Record<WindowAppId, Loader> = {
    journey: () => import("./journey/View"),
    builds: () => import("./builds/View"),
    about: () => import("./about/View"),
    beliefs: () => import("./beliefs/View"),
    notes: () => import("./notes/View"),
    sayhi: () => import("./sayhi/View"),
    bughunt: () => import("@/features/bug-hunt/BugHuntApp"),
};

/**
 * Lazy view per window app. Keys are checked against the registry by the compiler.
 * Render each inside its own <Suspense>: without one, a first open suspends the whole shell
 * and React hides it (the "page goes black" bug).
 */
export const APP_VIEWS = Object.fromEntries(
    Object.entries(LOADERS).map(([id, load]) => [id, dynamic(load)]),
) as Record<WindowAppId, ComponentType<AppViewProps>>;

let preloaded = false;
/** Fetch every app view's code in the background, so the first open is instant. Idempotent. */
export function preloadAppViews() {
    if (preloaded) return;
    preloaded = true;
    for (const load of Object.values(LOADERS)) load().catch(() => {});
}
