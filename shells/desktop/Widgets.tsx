"use client";

import { useRef, useSyncExternalStore } from "react";
import { PROFILE } from "@/data/profile";
import { posts } from "@/data/posts";
import { os, useSpawnSurface } from "@/lib/os";
import type { DesktopActions } from "./use-desktop-actions";

const BEST_KEY = "hos_bughunt_best";
const LATEST = [...posts].sort((a, b) => b.date.localeCompare(a.date))[0];

function subscribeBest(callback: () => void) {
    window.addEventListener("storage", callback);
    window.addEventListener("focus", callback);
    // The game writes the score, then ends the round; read it right after.
    const off = os.on("game:end", () => queueMicrotask(callback));
    return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener("focus", callback);
        off();
    };
}

function readBest(): string | null {
    try {
        const raw = window.localStorage.getItem(BEST_KEY);
        return raw && /^\d{1,4}$/.test(raw) ? raw : null;
    } catch {
        return null;
    }
}

function initials(name: string) {
    return name
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

/** Top-right widget column. Faux glass (no live blur), registered as Bug Hunt spawn surfaces. */
export function Widgets({ actions }: { actions: DesktopActions }) {
    return (
        <aside className="hos-widgets" aria-label="Widgets">
            <ProfileWidget actions={actions} />
            {LATEST && <LatestNoteWidget actions={actions} />}
            <BugHuntWidget actions={actions} />
        </aside>
    );
}

function ProfileWidget({ actions }: { actions: DesktopActions }) {
    const ref = useRef<HTMLButtonElement>(null);
    useSpawnSurface("widget-profile", "widget", ref);
    return (
        <button ref={ref} type="button" className="hos-widget hos-faux-glass hos-widget-profile" aria-label={`About ${PROFILE.name}`} onClick={() => actions.launch("about")}>
            <span className="hos-avatar" aria-hidden="true">
                {initials(PROFILE.name)}
            </span>
            <span className="hos-widget-stack">
                <span className="hos-widget-name">{PROFILE.name}</span>
                <span className="hos-widget-meta">{PROFILE.role}</span>
                <span className="hos-widget-body">{PROFILE.headline}</span>
            </span>
        </button>
    );
}

function LatestNoteWidget({ actions }: { actions: DesktopActions }) {
    const ref = useRef<HTMLButtonElement>(null);
    useSpawnSurface("widget-note", "widget", ref);
    return (
        <button ref={ref} type="button" className="hos-widget hos-faux-glass hos-widget-note" onClick={() => actions.launch("notes", LATEST.slug)}>
            <span className="hos-widget-meta">Latest note</span>
            <span className="hos-widget-title">{LATEST.title}</span>
            <span className="hos-widget-link" aria-hidden="true">
                Read on Notes →
            </span>
        </button>
    );
}

function BugHuntWidget({ actions }: { actions: DesktopActions }) {
    const ref = useRef<HTMLDivElement>(null);
    const best = useSyncExternalStore(subscribeBest, readBest, () => null);
    useSpawnSurface("widget-bughunt", "widget", ref);
    return (
        <section ref={ref} className="hos-widget hos-faux-glass hos-widget-bughunt" aria-label="Bug Hunt">
            <div className="hos-widget-stack">
                <span className="hos-widget-meta">Bug Hunt · your best</span>
                <span className="hos-score" aria-label={best ? `Best score ${best}` : "No score yet"}>
                    {best ?? "–"}
                </span>
            </div>
            <button type="button" className="hos-play" onClick={() => actions.launch("bughunt", "play")}>
                Play · 60s
            </button>
        </section>
    );
}
