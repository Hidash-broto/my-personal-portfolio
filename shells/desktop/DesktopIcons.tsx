"use client";

import { useEffect, useRef, useState } from "react";
import { AppIcon } from "@/apps/icons";
import { getApp, type WindowAppId } from "@/apps/registry";
import { useSpawnSurface } from "@/lib/os";
import type { DesktopActions } from "./use-desktop-actions";

const DESKTOP_ICONS: readonly WindowAppId[] = ["notes", "bughunt"];

/** Finder-style desktop icons: click selects, double-click (or Enter) opens. */
export function DesktopIcons({ actions }: { actions: DesktopActions }) {
    const [selected, setSelected] = useState<WindowAppId | null>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Clicking anywhere else on the desktop clears the selection.
    useEffect(() => {
        if (!selected) return;
        const onDown = (e: PointerEvent) => {
            if (!listRef.current?.contains(e.target as Node)) setSelected(null);
        };
        document.addEventListener("pointerdown", onDown, true);
        return () => document.removeEventListener("pointerdown", onDown, true);
    }, [selected]);

    return (
        <ul ref={listRef} className="hos-desktop-icons" aria-label="Desktop">
            {DESKTOP_ICONS.map((id) => (
                <DesktopIcon
                    key={id}
                    id={id}
                    selected={selected === id}
                    onSelect={() => setSelected(id)}
                    onOpen={() => {
                        setSelected(null);
                        actions.launch(id);
                    }}
                />
            ))}
        </ul>
    );
}

function DesktopIcon({ id, selected, onSelect, onOpen }: { id: WindowAppId; selected: boolean; onSelect: () => void; onOpen: () => void }) {
    const ref = useRef<HTMLButtonElement>(null);
    const app = getApp(id);
    useSpawnSurface(`desktop-${id}`, "icon", ref);
    return (
        <li>
            <button
                ref={ref}
                type="button"
                className="hos-desktop-icon"
                data-selected={selected || undefined}
                aria-label={`${app.name}. Double-click or press Enter to open.`}
                aria-pressed={selected}
                onClick={onSelect}
                onDoubleClick={onOpen}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        onOpen();
                    }
                }}
            >
                <span className="hos-desktop-icon-art">
                    <AppIcon icon={app.icon} size={56} />
                </span>
                <span className="hos-desktop-icon-label">{app.name}</span>
            </button>
        </li>
    );
}
