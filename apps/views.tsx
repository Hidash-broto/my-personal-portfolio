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
}

/** Lazy view per window app. Keys are checked against the registry by the compiler. */
export const APP_VIEWS: Record<WindowAppId, ComponentType<AppViewProps>> = {
    journey: dynamic(() => import("./journey/View")),
    builds: dynamic(() => import("./builds/View")),
    about: dynamic(() => import("./about/View")),
    beliefs: dynamic(() => import("./beliefs/View")),
    notes: dynamic(() => import("./notes/View")),
    sayhi: dynamic(() => import("./sayhi/View")),
    bughunt: dynamic(() => import("@/features/bug-hunt/BugHuntApp")),
};
