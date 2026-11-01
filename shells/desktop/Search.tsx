"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AppIcon } from "@/apps/icons";
import { buildSearchIndex, groupResults, searchEntries, type SearchEntry } from "./search-index";
import type { DesktopActions } from "./use-desktop-actions";

const INDEX = buildSearchIndex();
const SUGGESTIONS = INDEX.filter((e) => e.kind === "app");

/** Centered command palette, ⌘K / Ctrl+K. Fuzzy over apps, builds, journey and notes. */
export function Search({ reduce, actions, onClose }: { reduce: boolean; actions: DesktopActions; onClose: () => void }) {
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const sections = useMemo(() => {
        const results = searchEntries(query, INDEX, 9);
        return query.trim() ? groupResults(results) : [{ label: "Apps", entries: SUGGESTIONS }];
    }, [query]);
    const flat = useMemo(() => sections.flatMap((s) => s.entries), [sections]);
    const starts = useMemo(() => sections.map((_, si) => sections.slice(0, si).reduce((n, s) => n + s.entries.length, 0)), [sections]);
    const current = Math.min(active, flat.length - 1);

    useEffect(() => {
        inputRef.current?.focus({ preventScroll: true });
    }, []);

    useEffect(() => {
        listRef.current?.querySelector<HTMLElement>(`[data-index="${current}"]`)?.scrollIntoView({ block: "nearest" });
    }, [current]);

    const run = (entry: SearchEntry) => {
        onClose();
        if (entry.action.type === "link") window.open(entry.action.href, "_blank", "noopener,noreferrer");
        else actions.launch(entry.action.app, entry.action.item);
    };

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (flat.length === 0) return;
            const dir = e.key === "ArrowDown" ? 1 : -1;
            setActive((current + dir + flat.length) % flat.length);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (flat[current]) run(flat[current]);
        } else if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            onClose();
        }
    };

    return (
        <motion.div
            className="hos-search-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.14 } }}
            transition={{ duration: 0.12 }}
            onPointerDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Search"
                className="hos-search hos-live-glass"
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", visualDuration: 0.26, bounce: 0.12 }}
            >
                <div className="hos-search-field">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        role="combobox"
                        aria-expanded={flat.length > 0}
                        aria-controls="hos-search-results"
                        aria-activedescendant={flat[current] ? `hos-search-${flat[current].key}` : undefined}
                        aria-autocomplete="list"
                        aria-label="Search"
                        placeholder="Search apps, builds, journey and notes"
                        spellCheck={false}
                        autoComplete="off"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setActive(0);
                        }}
                        onKeyDown={onKeyDown}
                    />
                </div>
                {flat.length > 0 ? (
                    <ul ref={listRef} id="hos-search-results" role="listbox" aria-label="Results" className="hos-search-results">
                        {sections.map((section, si) => (
                            <li key={section.label} role="presentation">
                                <div className="hos-search-section" role="presentation">
                                    {section.label}
                                </div>
                                <ul role="presentation">
                                    {section.entries.map((entry, j) => {
                                        const i = starts[si] + j;
                                        return (
                                            <li
                                                key={entry.key}
                                                id={`hos-search-${entry.key}`}
                                                role="option"
                                                aria-selected={i === current}
                                                data-index={i}
                                                data-active={i === current || undefined}
                                                className="hos-search-row"
                                                onPointerMove={() => i !== current && setActive(i)}
                                                onClick={() => run(entry)}
                                            >
                                                <AppIcon icon={entry.icon} size={28} />
                                                <span className="hos-search-text">
                                                    <span className="hos-search-title">{entry.title}</span>
                                                    <span className="hos-search-sub">{entry.subtitle}</span>
                                                </span>
                                                {i === current && (
                                                    <kbd className="hos-search-enter" aria-hidden="true">
                                                        ↩
                                                    </kbd>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="hos-search-empty" role="status">
                        No results for “{query.trim()}”
                    </p>
                )}
            </motion.div>
        </motion.div>
    );
}
