"use client";

import Link from "next/link";
import { BookOpen, Compass, IdCard, Layers, MessageCircle, Route } from "lucide-react";
import { useRef, useSyncExternalStore, type ReactNode } from "react";
import { readShell, useSpawnSurface, type ShellKind, type SpawnKind } from "@/lib/os";
import OsAnalytics from "@/components/os/OsAnalytics";
import BugHuntGame from "./BugHuntGame";
import styles from "./arena.module.css";
import HeadAvatar from "@/components/brand/HeadAvatar";

/** A piece of the arena that bugs can crawl out of. */
function Surface({ id, kind, className, children, href, label }: { id: string; kind: SpawnKind; className: string; children: ReactNode; href?: string; label?: string }) {
    const ref = useRef<HTMLElement | null>(null);
    useSpawnSurface(id, kind, ref);
    if (href) {
        return (
            <a ref={(el) => { ref.current = el; }} href={href} className={className} aria-label={label}>
                {children}
            </a>
        );
    }
    return (
        <div ref={(el) => { ref.current = el; }} className={className}>
            {children}
        </div>
    );
}

const APPS: { id: string; name: string; href: string; bg: string; fg: string; icon: ReactNode }[] = [
    { id: "journey", name: "Journey", href: "/?app=journey", bg: "linear-gradient(180deg,#6FAAFF,#1463F3)", fg: "#fff", icon: <Route size={28} strokeWidth={1.9} /> },
    { id: "builds", name: "Builds", href: "/?app=builds", bg: "linear-gradient(180deg,#3D4458,#171A24)", fg: "#7FB2FF", icon: <Layers size={28} strokeWidth={1.7} /> },
    { id: "about", name: "About", href: "/?app=about", bg: "linear-gradient(180deg,#FFFFFF,#D6E0F0)", fg: "#1463F3", icon: <IdCard size={28} strokeWidth={1.8} /> },
    { id: "beliefs", name: "Beliefs", href: "/?app=beliefs", bg: "linear-gradient(180deg,#164AAE,#061A4D)", fg: "#fff", icon: <Compass size={28} strokeWidth={1.7} /> },
    { id: "notes", name: "Notes", href: "/blog", bg: "linear-gradient(180deg,#F7F9FD,#C9D6EA)", fg: "#0B4FD6", icon: <BookOpen size={28} strokeWidth={1.8} /> },
    { id: "sayhi", name: "Say Hi", href: "/?app=sayhi", bg: "linear-gradient(180deg,#4C8DFF,#0B4FD6)", fg: "#fff", icon: <MessageCircle size={28} strokeWidth={1.8} /> },
];

const DOCK = ["journey", "builds", "notes", "sayhi"];

function AppIcon({ app, where }: { app: (typeof APPS)[number]; where: "desk" | "dock" }) {
    return (
        <Surface id={`arena-${where}-${app.id}`} kind="icon" className={styles.app} href={app.href} label={app.name}>
            <span className={styles.appIcon} style={{ background: app.bg, color: app.fg }} aria-hidden="true">
                {app.icon}
            </span>
            <span>{app.name}</span>
        </Surface>
    );
}

function Wallpaper() {
    return (
        <svg className={styles.wallpaper} viewBox="0 0 1280 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs>
                <linearGradient id="bh-wp-sky" x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0" style={{ stopColor: "var(--wp-sky-a)" }} />
                    <stop offset="0.55" style={{ stopColor: "var(--wp-sky-b)" }} />
                    <stop offset="1" style={{ stopColor: "var(--wp-sky-c)" }} />
                </linearGradient>
                <linearGradient id="bh-wp-fold" x1="0" y1="0" x2="1" y2="0.4">
                    <stop offset="0" style={{ stopColor: "var(--wp-fold-a)" }} />
                    <stop offset="0.5" style={{ stopColor: "var(--wp-glow-b)" }} />
                    <stop offset="0.78" style={{ stopColor: "var(--wp-fold-b)" }} />
                    <stop offset="1" style={{ stopColor: "var(--wp-fold-a)" }} />
                </linearGradient>
                <filter id="bh-wp-b90" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="90" />
                </filter>
                <filter id="bh-wp-b18" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="18" />
                </filter>
                <filter id="bh-wp-grain">
                    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
                    <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0" />
                </filter>
            </defs>
            <rect width="1280" height="800" fill="url(#bh-wp-sky)" />
            <g filter="url(#bh-wp-b90)">
                <ellipse cx="1000" cy="220" rx="380" ry="230" style={{ fill: "var(--wp-glow-a)" }} opacity="0.9" />
                <ellipse cx="260" cy="640" rx="520" ry="210" style={{ fill: "var(--wp-glow-b)" }} opacity="0.75" />
                <ellipse cx="760" cy="520" rx="300" ry="120" style={{ fill: "var(--wp-glow-c)" }} opacity="0.45" />
            </g>
            <path
                d="M-120 560 C 200 400 500 640 840 470 C 1030 376 1200 400 1400 330 L1400 380 C 1180 452 1010 428 820 520 C 470 690 180 440 -120 610 Z"
                fill="url(#bh-wp-fold)"
                filter="url(#bh-wp-b18)"
                opacity="0.9"
            />
            <path d="M-120 560 C 200 400 500 640 840 470 C 1030 376 1200 400 1400 330" style={{ stroke: "var(--wp-line)" }} strokeOpacity="0.5" strokeWidth="2" fill="none" />
            <rect width="1280" height="800" filter="url(#bh-wp-grain)" />
        </svg>
    );
}

const subscribeNothing = () => () => {};
const readSearch = () => window.location.search;
const noSearch = () => "";
const serverShell = (): ShellKind => "desktop";

function parseChallenge(search: string): number | null {
    const raw = new URLSearchParams(search).get("challenge");
    return raw !== null && /^\d{1,4}$/.test(raw) ? Math.min(200, Number(raw)) : null;
}

/** /bug-hunt: the game on a Hidash OS surface, working without the OS shells. */
export default function StandaloneArena() {
    const shell = useSyncExternalStore(subscribeNothing, readShell, serverShell);
    const search = useSyncExternalStore(subscribeNothing, readSearch, noSearch);
    const challenge = parseChallenge(search);
    const autoStart = new URLSearchParams(search).has("play");

    return (
        <main className={styles.arena}>
            <OsAnalytics />
            <Wallpaper />
            <header className={styles.menubar}>
                <HeadAvatar size={20} className={styles.monogram} />
                <span className={styles.menuStrong}>Hidash OS</span>
                <span className={styles.menuHideSmall}>Bug Hunt</span>
                <Link className={styles.menuLink} href="/" prefetch={false}>
                    Open Hidash OS
                </Link>
            </header>

            <div className={styles.desk}>
                <div className={styles.widgets}>
                    <Surface id="arena-profile" kind="widget" className={`${styles.glass} ${styles.widget} ${styles.profile}`}>
                        <span className={styles.avatar} aria-hidden="true">
                            <HeadAvatar />
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                            <span className={styles.widgetTitle}>Muhammed Hidash</span>
                            <span className={styles.widgetLabel}>CTO @ Dentobees</span>
                            <span className={styles.widgetBody}>Startup builder. Tech by craft, business by curiosity.</span>
                        </span>
                    </Surface>
                    <Surface id="arena-note" kind="widget" href="/blog/velocity-is-a-lie-technical-debt" className={`${styles.glass} ${styles.widget}`}>
                        <span className={styles.widgetLabel}>Latest note</span>
                        <span className={styles.widgetTitle}>Velocity Is a Lie If It&apos;s Built on Technical Debt</span>
                        <span className={styles.widgetLink}>Read →</span>
                    </Surface>
                    <Surface id="arena-factory" kind="widget" href="/?app=builds&item=software-factory" className={`${styles.glass} ${styles.widget}`}>
                        <span className={styles.widgetLabel}>Build</span>
                        <span className={styles.widgetTitle}>Software Factory</span>
                        <span className={styles.widgetLink}>See how →</span>
                    </Surface>
                </div>

                <Surface id="arena-window" kind="window" className={`${styles.glass} ${styles.window}`}>
                    <div className={styles.titlebar} aria-hidden="true">
                        <span className={styles.lights}>
                            <span />
                            <span />
                            <span />
                        </span>
                        Bug Hunt
                    </div>
                    <div className={styles.windowBody}>
                        <BugHuntGame key={autoStart ? "play" : "idle"} shell={shell} challenge={challenge} autoStart={autoStart} pushHistoryEntry />
                    </div>
                </Surface>

                <nav className={styles.icons} aria-label="Apps">
                    {APPS.map((app) => (
                        <AppIcon key={app.id} app={app} where="desk" />
                    ))}
                </nav>
            </div>

            <div className={styles.dockWrap}>
                <nav className={`${styles.glass} ${styles.dock}`} aria-label="Dock">
                    {APPS.filter((a) => DOCK.includes(a.id)).map((app) => (
                        <AppIcon key={app.id} app={app} where="dock" />
                    ))}
                </nav>
            </div>
        </main>
    );
}
