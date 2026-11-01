"use client";

import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { PROFILE } from "@/data/profile";
import { posts } from "@/data/posts";
import { syncFauxGlass } from "@/features/wallpaper/faux-glass";
import { useSpawnSurface } from "@/lib/os";
import { readBest, subscribeBest } from "@/features/bug-hunt/best";
import type { DesktopActions } from "./use-desktop-actions";

const LATEST = [...posts].sort((a, b) => b.date.localeCompare(a.date))[0];

/** Today's best as display text ("—" handled by the caller when null). */
function readBestText(): string | null {
    const best = readBest();
    return best === null ? null : String(best);
}

/**
 * The widget's faux glass: the pre-blurred wallpaper under the glass tint, on its own layer so the
 * widget keeps its shadow (faux glass clips with clip-path). Offset mode, so a pressed (scaled)
 * widget never shifts the image.
 */
function GlassLayer() {
    const ref = useRef<HTMLSpanElement>(null);
    useLayoutEffect(() => {
        const sync = () => ref.current && syncFauxGlass(ref.current);
        sync();
        window.addEventListener("resize", sync);
        return () => window.removeEventListener("resize", sync);
    }, []);
    return <span ref={ref} className="hos-faux-glass hos-glass-layer" aria-hidden="true" />;
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
        <button ref={ref} type="button" className="hos-widget hos-widget-profile" aria-label={`About ${PROFILE.name}`} onClick={() => actions.launch("about")}>
            <GlassLayer />
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
        <button ref={ref} type="button" className="hos-widget hos-widget-note" onClick={() => actions.launch("notes", LATEST.slug)}>
            <GlassLayer />
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
    const best = useSyncExternalStore(subscribeBest, readBestText, () => null);
    useSpawnSurface("widget-bughunt", "widget", ref);
    return (
        <section ref={ref} className="hos-widget hos-widget-bughunt" aria-label="Bug Hunt">
            <GlassLayer />
            <div className="hos-widget-stack">
                <span className="hos-widget-meta">Bug Hunt · your best</span>
                <span className="hos-score" data-empty={best ? undefined : ""} aria-label={best ? `Best score ${best}` : "No score yet"}>
                    {best ?? "0"}
                </span>
            </div>
            <button type="button" className="hos-play" onClick={() => actions.launch("bughunt", "play")}>
                Play · 60s
            </button>
        </section>
    );
}
