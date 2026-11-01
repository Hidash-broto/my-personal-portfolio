"use client";

import { useEffect, useId, useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "./primitives";
import ui from "./ui.module.css";

export interface SidebarSection<T> {
    id: string;
    title?: string;
    items: readonly T[];
}

export interface SidebarItemState {
    selected: boolean;
    /** Position across all sections. */
    index: number;
    count: number;
}

interface SidebarProps<T> {
    /** Accessible name of the navigation landmark. */
    label: string;
    sections: readonly SidebarSection<T>[];
    selectedId: string | null;
    getId: (item: T) => string;
    /** Accessible name of one row (defaults to its text content). */
    getLabel?: (item: T) => string;
    onSelect: (id: string) => void;
    renderItem: (item: T, state: SidebarItemState) => ReactNode;
    /** "source" = macOS floating source list; "list" = Notes-style list column. */
    variant?: "source" | "list";
    width?: number;
}

const NAV_KEYS = new Set(["ArrowDown", "ArrowUp", "Home", "End"]);

/**
 * macOS sidebar. One tab stop (roving tabindex); arrow keys, Home and End move the selection,
 * like a native source list. The selected row carries aria-current.
 */
export function Sidebar<T>({
    label,
    sections,
    selectedId,
    getId,
    getLabel,
    onSelect,
    renderItem,
    variant = "source",
    width,
}: SidebarProps<T>) {
    const ref = useRef<HTMLElement>(null);
    const headingBase = useId();
    const count = sections.reduce((n, s) => n + s.items.length, 0);
    const allIds = sections.flatMap((s) => s.items.map(getId));
    const tabStop = selectedId && allIds.includes(selectedId) ? selectedId : allIds[0];

    // Keep the selection visible, for example after a deep link to an archived build.
    useEffect(() => {
        const el = ref.current?.querySelector<HTMLElement>('[aria-current="true"]');
        el?.scrollIntoView?.({ block: "nearest" });
    }, [selectedId]);

    function onKeyDown(e: KeyboardEvent<HTMLElement>) {
        if (!NAV_KEYS.has(e.key) || e.altKey || e.ctrlKey || e.metaKey) return;
        const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("[data-sidebar-id]"));
        if (buttons.length === 0) return;
        e.preventDefault();
        const focused = buttons.findIndex((b) => b === document.activeElement);
        const current = focused !== -1 ? focused : Math.max(0, buttons.findIndex((b) => b.dataset.sidebarId === tabStop));
        const next =
            e.key === "Home" ? 0
                : e.key === "End" ? buttons.length - 1
                    : e.key === "ArrowDown" ? Math.min(buttons.length - 1, current + 1)
                        : Math.max(0, current - 1);
        const target = buttons[next];
        target.focus();
        const id = target.dataset.sidebarId!;
        if (id !== selectedId) onSelect(id);
    }

    const offsets = sections.map((_, i) => sections.slice(0, i).reduce((n, s) => n + s.items.length, 0));
    const style = width ? ({ "--sidebar-w": `${width}px` } as CSSProperties) : undefined;

    return (
        <nav
            ref={ref}
            aria-label={label}
            className={cx(variant === "source" ? ui.sidebar : ui.sidebarList, ui.scroll)}
            style={style}
            onKeyDown={onKeyDown}
        >
            {sections.map((section, sectionIndex) => {
                const headingId = `${headingBase}-${section.id}`;
                return (
                    <div
                        key={section.id}
                        role="group"
                        aria-labelledby={section.title ? headingId : undefined}
                        aria-label={section.title ? undefined : label}
                        className={cx(ui.sidebarSection, variant === "list" && ui.listGroup)}
                    >
                        {section.title && (
                            <h2
                                id={headingId}
                                className={cx(ui.sidebarHeading, variant === "list" && ui.listHeading)}
                            >
                                {section.title}
                            </h2>
                        )}
                        {section.items.map((item, i) => {
                            const index = offsets[sectionIndex] + i;
                            const id = getId(item);
                            const selected = id === selectedId;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    data-sidebar-id={id}
                                    className={cx(ui.sidebarItem, variant === "list" && ui.listItem)}
                                    aria-current={selected ? "true" : undefined}
                                    aria-label={getLabel?.(item)}
                                    tabIndex={id === tabStop ? 0 : -1}
                                    onClick={() => {
                                        if (!selected) onSelect(id);
                                    }}
                                >
                                    {renderItem(item, { selected, index, count })}
                                </button>
                            );
                        })}
                    </div>
                );
            })}
        </nav>
    );
}
