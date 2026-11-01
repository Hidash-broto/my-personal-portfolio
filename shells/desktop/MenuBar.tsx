"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getApp } from "@/apps/registry";
import { useOs, useOsStore } from "@/lib/os";
import { formatClock, msToNextMinute } from "./clock";
import { ControlCenter } from "./ControlCenter";
import { readGlassPref, setGlassPref, subscribeGlassPref } from "./glass-pref";
import { MenuPopup, type MenuEntry } from "./MenuPopup";
import type { MenuId, Overlay, SetOverlay } from "./overlay";
import type { DesktopActions } from "./use-desktop-actions";

interface MenuDef {
    id: MenuId;
    label: string;
    entries: MenuEntry[];
}

const POPOVER_VARIANTS = {
    hidden: { opacity: 0 },
    shown: { opacity: 1, transition: { duration: 0.06 } },
    exit: (nextOpen: MenuId | null) => ({ opacity: 0, transition: { duration: nextOpen ? 0 : 0.18 } }),
};

const MENU_ORDER: readonly MenuId[] = ["hidash", "file", "edit", "view", "window", "help"];

const subscribeFullscreen = (cb: () => void) => {
    document.addEventListener("fullscreenchange", cb);
    return () => document.removeEventListener("fullscreenchange", cb);
};
const readFullscreen = () => Boolean(document.fullscreenElement);

function searchShortcut() {
    return typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl K";
}

function useMenus(actions: DesktopActions, openSearch: () => void): MenuDef[] {
    const { url } = useOs();
    const windows = useOsStore((s) => s.windows);
    const solid = useSyncExternalStore(subscribeGlassPref, readGlassPref, () => false);
    const fullscreen = useSyncExternalStore(subscribeFullscreen, readFullscreen, () => false);
    const focused = url.focus;
    const focusedName = focused ? getApp(focused).name : null;
    const canFullscreen = typeof document !== "undefined" && document.fullscreenEnabled;

    return [
        {
            id: "hidash",
            label: "Hidash",
            entries: [
                { kind: "item", id: "about", label: "About Hidash", onSelect: () => actions.launch("about") },
                { kind: "separator", id: "s1" },
                { kind: "item", id: "bughunt", label: "Play Bug Hunt", onSelect: () => actions.launch("bughunt", "play") },
                { kind: "separator", id: "s2" },
                { kind: "item", id: "glass", label: "Reduce Transparency", checked: solid, onSelect: () => setGlassPref(!solid) },
            ],
        },
        {
            id: "file",
            label: "File",
            entries: [
                { kind: "item", id: "builds", label: "Open Builds", onSelect: () => actions.launch("builds") },
                { kind: "item", id: "journey", label: "Open Journey", onSelect: () => actions.launch("journey") },
                { kind: "separator", id: "s1" },
                { kind: "item", id: "close", label: "Close Window", disabled: !focused, onSelect: () => focused && actions.close(focused) },
            ],
        },
        {
            id: "edit",
            label: "Edit",
            entries: [
                { kind: "item", id: "undo", label: "Undo", disabled: true, onSelect: () => {} },
                { kind: "item", id: "redo", label: "Redo", disabled: true, onSelect: () => {} },
                { kind: "separator", id: "s1" },
                {
                    kind: "item",
                    id: "copy-link",
                    label: "Copy Link",
                    disabled: typeof navigator === "undefined" || !navigator.clipboard,
                    onSelect: () => void navigator.clipboard?.writeText(window.location.href).catch(() => {}),
                },
            ],
        },
        {
            id: "view",
            label: "View",
            entries: [
                { kind: "item", id: "search", label: "Enter Search", shortcut: searchShortcut(), onSelect: openSearch },
                { kind: "separator", id: "s1" },
                {
                    kind: "item",
                    id: "fullscreen",
                    label: fullscreen ? "Exit Full Screen" : "Enter Full Screen",
                    disabled: !canFullscreen,
                    onSelect: () => {
                        const done = fullscreen ? document.exitFullscreen() : document.documentElement.requestFullscreen();
                        void done.catch(() => {});
                    },
                },
            ],
        },
        {
            id: "window",
            label: "Window",
            entries: [
                { kind: "item", id: "minimize", label: "Minimize", disabled: !focused || Boolean(focused && windows[focused]?.minimized), onSelect: () => focused && actions.minimize(focused) },
                { kind: "item", id: "zoom", label: "Zoom", disabled: !focused, onSelect: () => focused && actions.zoom(focused) },
                { kind: "item", id: "close", label: focusedName ? `Close ${focusedName}` : "Close", disabled: !focused, onSelect: () => focused && actions.close(focused) },
                ...(url.open.length > 0 ? [{ kind: "separator", id: "s1" } as MenuEntry] : []),
                ...url.open.map(
                    (id): MenuEntry => ({
                        kind: "item",
                        id: `win-${id}`,
                        label: getApp(id).name,
                        checked: id === focused,
                        detail: windows[id]?.minimized ? "Minimized" : undefined,
                        onSelect: () => actions.focus(id),
                    }),
                ),
            ],
        },
        {
            id: "help",
            label: "Help",
            entries: [
                { kind: "item", id: "notes", label: "Open Notes", onSelect: () => actions.launch("notes") },
                { kind: "item", id: "sayhi", label: "Say Hi", onSelect: () => actions.launch("sayhi") },
            ],
        },
    ];
}

function Clock() {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        let timer = 0;
        const tick = () => {
            const date = new Date();
            setNow(date);
            timer = window.setTimeout(tick, msToNextMinute(date) + 20);
        };
        timer = window.setTimeout(tick, msToNextMinute(new Date()) + 20);
        const onVisible = () => document.visibilityState === "visible" && setNow(new Date());
        document.addEventListener("visibilitychange", onVisible);
        return () => {
            window.clearTimeout(timer);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, []);
    return (
        <time className="hos-clock" dateTime={now.toISOString()}>
            {formatClock(now)}
        </time>
    );
}

interface MenuBarProps {
    overlay: Overlay;
    setOverlay: SetOverlay;
    actions: DesktopActions;
}

export function MenuBar({ overlay, setOverlay, actions }: MenuBarProps) {
    const { url } = useOs();
    const reduce = useReducedMotion() ?? false;
    const rootRef = useRef<HTMLDivElement>(null);
    const titleRefs = useRef<Partial<Record<MenuId, HTMLButtonElement | null>>>({});
    const controlRef = useRef<HTMLButtonElement>(null);
    const menus = useMenus(actions, () => setOverlay({ kind: "search" }));
    const openMenu = overlay?.kind === "menu" ? overlay.id : null;
    const appName = url.focus ? getApp(url.focus).name : "Hidash OS";

    // Click anywhere outside the menu bar closes an open menu or the controls popover.
    useEffect(() => {
        if (overlay?.kind !== "menu" && overlay?.kind !== "control") return;
        const onDown = (e: PointerEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOverlay(null);
        };
        document.addEventListener("pointerdown", onDown, true);
        return () => document.removeEventListener("pointerdown", onDown, true);
    }, [overlay, setOverlay]);

    const open = (id: MenuId, focusFirst: boolean) => setOverlay({ kind: "menu", id, focusFirst });

    const switchMenu = (from: MenuId, dir: 1 | -1, focusFirst: boolean) => {
        const i = MENU_ORDER.indexOf(from);
        const next = MENU_ORDER[(i + dir + MENU_ORDER.length) % MENU_ORDER.length];
        titleRefs.current[next]?.focus({ preventScroll: true });
        if (openMenu) open(next, focusFirst);
    };

    return (
        <div ref={rootRef} className="hos-menubar">
            <nav role="menubar" aria-label="Menu bar" className="hos-menubar-left">
                {menus.map((menu) => {
                    const isOpen = openMenu === menu.id;
                    return (
                        <div key={menu.id} className="hos-menu-anchor">
                            <button
                                ref={(el) => {
                                    titleRefs.current[menu.id] = el;
                                }}
                                type="button"
                                role="menuitem"
                                aria-haspopup="menu"
                                aria-expanded={isOpen}
                                aria-label={menu.id === "hidash" ? "Hidash menu" : undefined}
                                data-open={isOpen || undefined}
                                className={menu.id === "hidash" ? "hos-menu-title hos-monogram" : "hos-menu-title"}
                                onClick={(e) => (isOpen ? setOverlay(null) : open(menu.id, e.detail === 0))}
                                onPointerEnter={() => {
                                    if (openMenu && !isOpen) open(menu.id, false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "ArrowDown") {
                                        e.preventDefault();
                                        open(menu.id, true);
                                    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                                        e.preventDefault();
                                        switchMenu(menu.id, e.key === "ArrowRight" ? 1 : -1, true);
                                    }
                                }}
                            >
                                {menu.id === "hidash" ? "H" : menu.label}
                            </button>
                            {menu.id === "hidash" && (
                                <span className="hos-menu-appname" aria-live="polite">
                                    {appName}
                                </span>
                            )}
                            {/* Switching menus is instant; closing the last one fades like macOS. */}
                            <AnimatePresence custom={openMenu}>
                                {isOpen && (
                                    <motion.div
                                        key={menu.id}
                                        className="hos-menu-popover"
                                        variants={POPOVER_VARIANTS}
                                        initial="hidden"
                                        animate="shown"
                                        exit="exit"
                                    >
                                        <MenuPopup
                                            label={menu.label}
                                            entries={menu.entries}
                                            focusFirst={overlay?.kind === "menu" && overlay.focusFirst}
                                            onClose={(returnFocus) => {
                                                setOverlay(null);
                                                if (returnFocus) titleRefs.current[menu.id]?.focus({ preventScroll: true });
                                            }}
                                            onSwitch={(dir) => switchMenu(menu.id, dir, true)}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </nav>

            <div className="hos-menubar-right">
                <button type="button" className="hos-menubar-icon" aria-label="Search" onClick={() => setOverlay({ kind: "search" })}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                    </svg>
                </button>
                <div className="hos-menu-anchor hos-menu-anchor-right">
                    <button
                        ref={controlRef}
                        type="button"
                        className="hos-menubar-icon"
                        aria-label="Controls"
                        aria-haspopup="dialog"
                        aria-expanded={overlay?.kind === "control"}
                        data-open={overlay?.kind === "control" || undefined}
                        onClick={() => setOverlay((o) => (o?.kind === "control" ? null : { kind: "control" }))}
                    >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                            <rect x="3" y="5" width="18" height="6" rx="3" />
                            <rect x="3" y="13" width="18" height="6" rx="3" />
                            <circle cx="16" cy="8" r="1.5" fill="currentColor" />
                            <circle cx="8" cy="16" r="1.5" fill="currentColor" />
                        </svg>
                    </button>
                    <AnimatePresence>
                        {overlay?.kind === "control" && (
                            <ControlCenter
                                reduce={reduce}
                                onClose={(returnFocus) => {
                                    setOverlay(null);
                                    if (returnFocus) controlRef.current?.focus({ preventScroll: true });
                                }}
                            />
                        )}
                    </AnimatePresence>
                </div>
                <Clock />
            </div>
        </div>
    );
}
