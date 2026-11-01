"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useOs, useOsStore } from "@/lib/os";
import { useItemOwner } from "./item-owner";
import { useDesktopActions } from "./use-desktop-actions";
import { readViewport } from "./use-viewport";
import { DesktopWindow } from "./Window";

/**
 * Renders one window per id in the URL's open set. The URL decides what is open; the
 * store only holds geometry, created here (`ensure`) the first time an id appears.
 */
export function WindowLayer() {
    const { url, history } = useOs();
    const windows = useOsStore((s) => s.windows);
    const owner = useItemOwner((s) => s.owner);
    const actions = useDesktopActions();

    // New ids get geometry (cascaded, raised).
    useEffect(() => {
        const store = useOsStore.getState();
        for (const id of url.open) if (!store.windows[id]) store.ensure(id, readViewport());
    }, [url.open]);

    // The focused window is frontmost and on screen (focus can change from the URL: Search, back/forward).
    useEffect(() => {
        if (!url.focus) return;
        const store = useOsStore.getState();
        const g = store.windows[url.focus];
        if (!g) return;
        if (g.minimized) store.setMinimized(url.focus, false);
        store.raise(url.focus);
    }, [url.focus]);

    // Item ownership: a landing or back/forward hands the URL item to the focused window.
    useEffect(() => {
        const sync = () => useItemOwner.getState().setOwner(history.state().focus);
        if (useItemOwner.getState().owner === null) sync();
        window.addEventListener("popstate", sync);
        return () => window.removeEventListener("popstate", sync);
    }, [history]);

    return (
        <div className="hos-window-layer">
            <AnimatePresence>
                {url.open
                    .filter((id) => windows[id])
                    .map((id) => (
                        <DesktopWindow
                            key={id}
                            id={id}
                            active={url.focus === id}
                            item={owner === id ? url.item : null}
                            actions={actions}
                        />
                    ))}
            </AnimatePresence>
        </div>
    );
}
