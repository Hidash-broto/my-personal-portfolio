"use client";

import { useRef } from "react";
import { PROFILE } from "@/data/profile";
import { formatDate, posts, readingMinutes, type Post } from "@/data/posts";
import { useSpawnSurface } from "@/lib/os";
import { useBugHuntBest, useLaunch } from "./hooks";
import s from "./phone.module.css";
import HeadAvatar from "@/components/brand/HeadAvatar";

const WIDGET_RADIUS = 22;
const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(" ");

/** Newest post first, by publish date. */
export function latestPost(list: readonly Post[] = posts): Post | null {
    return [...list].sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
}

/** 2x2, live glass (one of the three live backdrop-filter surfaces). */
export function BugHuntWidget() {
    const ref = useRef<HTMLElement>(null);
    const best = useBugHuntBest();
    const launch = useLaunch();
    useSpawnSurface("phone-widget-bughunt", "widget", ref);

    return (
        <section ref={ref} aria-label="Bug Hunt" className={cx(s.widget, s.widgetSquare, s.liveGlass, s.bughunt)}>
            <span className={s.bughuntHead}>
                <span className={s.bughuntName}>
                    <span className={s.bugDot} aria-hidden="true" />
                    Bug Hunt
                </span>
                <span className={s.widgetLabel}>
                    <span className="sr-only">· </span>Today&apos;s best
                </span>
            </span>
            <span className={cx(s.score, best === null && s.scoreEmpty)}>
                <span aria-hidden="true">{best ?? "—"}</span>
                <span className="sr-only">{best === null ? "No score yet" : `Best score ${best}`}</span>
            </span>
            <button
                type="button"
                className={s.play}
                aria-label="Play Bug Hunt"
                onClick={() => launch("bughunt", "play", { el: ref.current, kind: "widget", radius: WIDGET_RADIUS })}
            >
                Play
            </button>
        </section>
    );
}

/** 2x2, tinted solid glass. Tapping opens About. */
export function ProfileWidget() {
    const ref = useRef<HTMLButtonElement>(null);
    const launch = useLaunch();
    useSpawnSurface("phone-widget-profile", "widget", ref);

    return (
        <button
            ref={ref}
            type="button"
            aria-label={`${PROFILE.name}, ${PROFILE.role}. Open About`}
            className={cx(s.widget, s.widgetSquare, s.faux, "hos-faux-glass", s.profile)}
            onClick={() => launch("about", null, { el: ref.current, kind: "widget", radius: WIDGET_RADIUS })}
        >
            <span className={s.avatar} aria-hidden="true">
                <HeadAvatar />
            </span>
            <span className={s.profileName}>{PROFILE.name}</span>
            <span className={s.profileRole}>{PROFILE.role}</span>
            <span className={s.profileHeadline}>{PROFILE.headline}</span>
        </button>
    );
}

/** Wide, tinted solid glass. Opens Notes on the newest post. */
export function LatestNoteWidget() {
    const ref = useRef<HTMLButtonElement>(null);
    const launch = useLaunch();
    useSpawnSurface("phone-widget-note", "widget", ref);
    const post = latestPost();
    if (!post) return null;

    return (
        <button
            ref={ref}
            type="button"
            aria-label={`Latest note: ${post.title}`}
            className={cx(s.widget, s.faux, "hos-faux-glass", s.note)}
            onClick={() => launch("notes", post.slug, { el: ref.current, kind: "widget", radius: WIDGET_RADIUS })}
        >
            <span className={s.noteHead}>
                <span className={s.widgetLabel}>Latest note</span>
                <svg className={s.noteChevron} width="8" height="13" viewBox="0 0 8 13" aria-hidden="true">
                    <path d="M1.5 1.5 6.5 6.5l-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </span>
            <span className={s.noteTitle}>{post.title}</span>
            <span className={s.noteMeta}>
                {formatDate(post.date)} · {readingMinutes(post)} min read
            </span>
        </button>
    );
}
