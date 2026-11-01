"use client";

import { AnimatePresence, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import Character from "@/features/character/Character";
import Wallpaper from "@/features/wallpaper/Wallpaper";
import { os } from "@/lib/os";
import { DesktopIcons } from "./DesktopIcons";
import { Dock } from "./Dock";
import { MENU_BAR_H } from "./geometry";
import { applyGlassPref, readGlassPref } from "./glass-pref";
import { MenuBar } from "./MenuBar";
import type { Overlay } from "./overlay";
import { Search } from "./Search";
import { useDesktopActions } from "./use-desktop-actions";
import { useIdle } from "./use-idle";
import { Widgets } from "./Widgets";
import { WindowLayer } from "./WindowLayer";
import "./desktop.css";

const IDLE_MS = 30_000;

/** Hidash OS desktop: wallpaper, menu bar, widgets, icons, windows, Dock and Search. */
export default function DesktopShell() {
    const [overlay, setOverlay] = useState<Overlay>(null);
    const actions = useDesktopActions();
    const reduce = useReducedMotion() ?? false;

    // Saved "Reduce transparency" preference, and the menu bar height for other lanes (character).
    useEffect(() => {
        if (readGlassPref()) applyGlassPref(true);
        const root = document.documentElement.style;
        root.setProperty("--hos-menubar-height", `${MENU_BAR_H}px`);
        return () => {
            root.removeProperty("--hos-menubar-height");
        };
    }, []);

    // Global keys: only ⌘K / Ctrl+K (Search) and Esc (close the open surface).
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setOverlay((o) => (o?.kind === "search" ? null : { kind: "search" }));
            } else if (e.key === "Escape") {
                setOverlay((o) => (o ? null : o));
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useIdle(
        IDLE_MS,
        useCallback(() => os.emit("idle", {}), []),
    );

    return (
        <div className="hos-desktop">
            <Wallpaper shell="desktop" />
            <DesktopIcons actions={actions} />
            <Widgets actions={actions} />
            <WindowLayer />
            <Character shell="desktop" />
            <Dock actions={actions} />
            <MenuBar overlay={overlay} setOverlay={setOverlay} actions={actions} />
            <AnimatePresence>
                {overlay?.kind === "search" && <Search key="search" reduce={reduce} actions={actions} onClose={() => setOverlay(null)} />}
            </AnimatePresence>
        </div>
    );
}
