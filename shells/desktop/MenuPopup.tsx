"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

export type MenuEntry =
    | {
          kind: "item";
          id: string;
          label: string;
          /** Only shortcuts a web page can own (never ⌘W/⌘Q/⌘M/⌘H/⌘N/⌘Tab/⌘Space). */
          shortcut?: string;
          disabled?: boolean;
          /** Present = a checkbox item. */
          checked?: boolean;
          detail?: string;
          onSelect: () => void;
      }
    | { kind: "separator"; id: string };

type Item = Extract<MenuEntry, { kind: "item" }>;

const enabled = (e: MenuEntry): e is Item => e.kind === "item" && !e.disabled;

/** Next enabled index from `from` in direction `dir`, wrapping. -1 when nothing is enabled. */
export function nextEnabled(entries: readonly MenuEntry[], from: number, dir: 1 | -1): number {
    const n = entries.length;
    for (let step = 1; step <= n; step++) {
        const i = (((from + dir * step) % n) + n) % n;
        if (enabled(entries[i])) return i;
    }
    return -1;
}

interface MenuPopupProps {
    label: string;
    entries: readonly MenuEntry[];
    focusFirst: boolean;
    /** Close the menu; `returnFocus` puts focus back on the menu title. */
    onClose: (returnFocus: boolean) => void;
    /** Move to the neighbouring menu (ArrowLeft / ArrowRight). */
    onSwitch: (dir: 1 | -1) => void;
}

/** A dropdown with macOS behaviour: hover highlights, arrows move, Enter activates, Esc closes. */
export function MenuPopup({ label, entries, focusFirst, onClose, onSwitch }: MenuPopupProps) {
    const [active, setActive] = useState(() => (focusFirst ? nextEnabled(entries, -1, 1) : -1));
    const menuRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
        if (active >= 0) itemRefs.current[active]?.focus({ preventScroll: true });
        else menuRef.current?.focus({ preventScroll: true });
    }, [active]);

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        switch (e.key) {
            case "ArrowDown":
                setActive((i) => nextEnabled(entries, i, 1));
                break;
            case "ArrowUp":
                setActive((i) => nextEnabled(entries, i < 0 ? entries.length : i, -1));
                break;
            case "Home":
                setActive(nextEnabled(entries, -1, 1));
                break;
            case "End":
                setActive(nextEnabled(entries, entries.length, -1));
                break;
            case "ArrowRight":
                onSwitch(1);
                break;
            case "ArrowLeft":
                onSwitch(-1);
                break;
            case "Escape":
            case "Tab":
                onClose(true);
                break;
            default:
                return;
        }
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div
            ref={menuRef}
            role="menu"
            aria-label={label}
            tabIndex={-1}
            className="hos-menu hos-live-glass"
            onKeyDown={onKeyDown}
            onPointerLeave={() => setActive(-1)}
        >
            {entries.map((entry, i) =>
                entry.kind === "separator" ? (
                    <div key={entry.id} role="separator" className="hos-menu-separator" />
                ) : (
                    <button
                        key={entry.id}
                        ref={(el) => {
                            itemRefs.current[i] = el;
                        }}
                        type="button"
                        role={entry.checked === undefined ? "menuitem" : "menuitemcheckbox"}
                        aria-checked={entry.checked}
                        aria-disabled={entry.disabled || undefined}
                        disabled={entry.disabled}
                        tabIndex={i === active ? 0 : -1}
                        data-active={i === active || undefined}
                        className="hos-menu-item"
                        onPointerEnter={() => setActive(entry.disabled ? -1 : i)}
                        onClick={() => {
                            if (entry.disabled) return;
                            onClose(false);
                            entry.onSelect();
                        }}
                    >
                        <span className="hos-menu-check" aria-hidden="true">
                            {entry.checked ? "✓" : ""}
                        </span>
                        <span className="hos-menu-label">{entry.label}</span>
                        {entry.detail && <span className="hos-menu-detail">{entry.detail}</span>}
                        {entry.shortcut && (
                            <kbd className="hos-menu-shortcut" aria-label={`Shortcut ${entry.shortcut}`}>
                                {entry.shortcut}
                            </kbd>
                        )}
                    </button>
                ),
            )}
        </div>
    );
}
