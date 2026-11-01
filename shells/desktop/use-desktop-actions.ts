"use client";

import { useMemo } from "react";
import { getApp, isWindowAppId, type AppId, type WindowAppId } from "@/apps/registry";
import { os, useOs, useOsStore } from "@/lib/os";
import { useItemOwner } from "./item-owner";

export interface DesktopActions {
    /** Open (or bring forward) an app. External apps open in a new tab. */
    launch: (app: AppId, item?: string | null) => void;
    /** Select an item inside an open app (updates the URL). */
    openItem: (app: WindowAppId, item: string | null) => void;
    focus: (app: WindowAppId) => void;
    close: (app: WindowAppId) => void;
    minimize: (app: WindowAppId) => void;
    zoom: (app: WindowAppId) => void;
}

/** Every desktop intent goes through here, so URL, geometry and bus never disagree. */
export function useDesktopActions(): DesktopActions {
    const { history, url } = useOs();
    const setOwner = useItemOwner((s) => s.setOwner);

    return useMemo(() => {
        const focus = (app: WindowAppId) => {
            const store = useOsStore.getState();
            if (store.windows[app]?.minimized) store.setMinimized(app, false);
            store.raise(app);
            if (url.focus !== app) {
                history.focus(app);
                os.emit("window:focus", { app });
            }
        };

        const launch = (app: AppId, item: string | null = null) => {
            const manifest = getApp(app);
            if (manifest.kind === "external") {
                window.open(manifest.href, "_blank", "noopener,noreferrer");
                return;
            }
            if (!isWindowAppId(app)) return;
            if (url.open.includes(app) && item === null) {
                focus(app);
                return;
            }
            setOwner(app);
            history.open(app, item);
            os.emit("app:open", { app, item });
        };

        const openItem = (app: WindowAppId, item: string | null) => {
            setOwner(app);
            history.open(app, item);
        };

        const close = (app: WindowAppId) => {
            history.close(app);
            os.emit("app:close", { app });
        };

        const minimize = (app: WindowAppId) => {
            const store = useOsStore.getState();
            store.setMinimized(app, true);
            if (url.focus !== app) return;
            // Hand focus to the frontmost window that is still on screen (URL replace, no new entry).
            const next = url.open
                .filter((a) => a !== app && store.windows[a] && !store.windows[a]?.minimized)
                .sort((a, b) => (store.windows[b]?.z ?? 0) - (store.windows[a]?.z ?? 0))[0];
            if (next) {
                history.focus(next);
                os.emit("window:focus", { app: next });
            }
        };

        const zoom = (app: WindowAppId) => useOsStore.getState().toggleZoom(app);

        return { launch, openItem, focus, close, minimize, zoom };
    }, [history, url, setOwner]);
}
