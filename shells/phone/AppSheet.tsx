"use client";

import {
    animate,
    motion,
    useMotionValue,
    useMotionValueEvent,
    usePresence,
    useReducedMotion,
    useTransform,
    type MotionValue,
} from "framer-motion";
import { Suspense, useEffect, useRef, useState, type UIEvent } from "react";
import { AppIcon } from "@/apps/icons";
import { getApp, type WindowAppId } from "@/apps/registry";
import { APP_VIEWS } from "@/apps/views";
import {
    centerBox,
    clamp,
    dragProgress,
    frameAt,
    fullBox,
    ICON_RADIUS_RATIO,
    radiusCss,
    toBox,
    unscaleBox,
    type Box,
    type Viewport,
} from "./geometry";
import HomeBar from "./HomeBar";
import { useViewport } from "./hooks";
import { getIconElement, getLaunchOrigin } from "./launch";
import s from "./phone.module.css";

/** iOS-like springs: near critical damping, ~0.45s response. */
const OPEN_SPRING = { type: "spring", stiffness: 240, damping: 29, mass: 1, restDelta: 0.0005, restSpeed: 0.002 } as const;
const CLOSE_SPRING = { type: "spring", stiffness: 290, damping: 32, mass: 1, restDelta: 0.0005, restSpeed: 0.002 } as const;
const FADE = { duration: 0.22, ease: [0.2, 0, 0, 1] } as const;
const COLLAPSE_AT = 30;

interface Origin {
    box: Box;
    radius: number;
    /** Show the app icon over the content while the frame is small (icon launches). */
    icon: boolean;
}

function onScreen(box: Box, vp: Viewport) {
    return box.w > 0 && box.h > 0 && box.x + box.w > 0 && box.y + box.h > 0 && box.x < vp.w && box.y < vp.h;
}

function fallbackOrigin(vp: Viewport): Origin {
    return { box: centerBox(vp), radius: 62 * ICON_RADIUS_RATIO, icon: true };
}

/** Where the app grows from: the tapped widget or icon, else its icon, else the centre. */
function openOrigin(app: WindowAppId, vp: Viewport): Origin {
    const launch = getLaunchOrigin(app);
    if (launch) {
        const box = toBox(launch.el.getBoundingClientRect());
        if (onScreen(box, vp)) return { box, radius: launch.radius, icon: launch.kind === "icon" };
    }
    const el = getIconElement(app);
    if (el) {
        const box = toBox(el.getBoundingClientRect());
        if (onScreen(box, vp)) return { box, radius: box.w * ICON_RADIUS_RATIO, icon: true };
    }
    return fallbackOrigin(vp);
}

/** Where the app shrinks back to: its icon, measured as if the home screen were at rest. */
function closeOrigin(app: WindowAppId, vp: Viewport, homeScale: number): Origin {
    const el = getIconElement(app);
    if (!el) return fallbackOrigin(vp);
    const box = unscaleBox(toBox(el.getBoundingClientRect()), homeScale, vp);
    return onScreen(box, vp) ? { box, radius: box.w * ICON_RADIUS_RATIO, icon: true } : fallbackOrigin(vp);
}

export interface AppSheetProps {
    app: WindowAppId;
    item: string | null;
    /** 0 = home fully visible, 1 = an app covers it. Written by the sheet, read by the home screen. */
    coverage: MotionValue<number>;
    /** The home screen's current scale (to measure icons at rest). */
    homeScale: MotionValue<number>;
    onClose: (app: WindowAppId) => void;
    openItem: (app: WindowAppId, item: string | null) => void;
}

/**
 * A full-screen app. Zooms out of its icon (transform-only: translate + scale, with a
 * counter-scaled content layer and a corner radius that goes to 0), collapses its large
 * title on scroll, and closes back into the icon from Back, Escape or the home bar.
 */
export default function AppSheet({ app, item, coverage, homeScale, onClose, openItem }: AppSheetProps) {
    const [isPresent, safeToRemove] = usePresence();
    const reduced = useReducedMotion() ?? false;
    const vp = useViewport();
    const manifest = getApp(app);
    const View = APP_VIEWS[app];

    const sheetRef = useRef<HTMLDivElement>(null);
    const backRef = useRef<HTMLButtonElement>(null);
    const scrollerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [collapsed, setCollapsed] = useState(false);

    const [initialOrigin] = useState(() => openOrigin(app, vp));
    const origin = useMotionValue<Origin>(initialOrigin);
    const p = useMotionValue(0);
    const dragY = useMotionValue(0);

    const frame = useTransform(() =>
        reduced
            ? frameAt(1, fullBox(vp), 0, dragY.get(), vp)
            : frameAt(p.get(), origin.get().box, origin.get().radius, dragY.get(), vp),
    );
    const x = useTransform(() => frame.get().x);
    const y = useTransform(() => frame.get().y);
    const scaleX = useTransform(() => frame.get().sx);
    const scaleY = useTransform(() => frame.get().sy);
    const innerScaleY = useTransform(() => frame.get().innerScaleY);
    const borderRadius = useTransform(() => radiusCss(frame.get()));
    const opacity = useTransform(() => {
        const progress = clamp(p.get(), 0, 1);
        if (reduced) return progress;
        return origin.get().icon ? 1 : clamp(progress / 0.22, 0, 1);
    });
    // The icon covers the whole frame even when the frame is not square (e.g. closing from the drag card).
    const iconScale = useTransform(() => {
        const f = frame.get();
        return Math.max(1, (vp.h * f.sy) / f.sx / vp.w);
    });
    const iconOpacity = useTransform(() => (reduced || !origin.get().icon ? 0 : 1 - clamp((p.get() - 0.04) / 0.2, 0, 1)));
    const localCoverage = useTransform(() => clamp(p.get(), 0, 1) * (1 - clamp(dragProgress(dragY.get(), vp) * 1.6, 0, 1)));

    useMotionValueEvent(localCoverage, "change", (v) => coverage.set(v));
    useEffect(() => () => coverage.set(0), [coverage]);

    // Open on mount; on removal, fly back into the icon and then let AnimatePresence unmount us.
    useEffect(() => {
        if (isPresent) {
            const controls = animate(p, 1, reduced ? FADE : OPEN_SPRING);
            return () => controls.stop();
        }
        let cancelled = false;
        if (!reduced) origin.set(closeOrigin(app, vp, homeScale.get()));
        const hadFocus = !!sheetRef.current?.contains(document.activeElement);
        const controls = animate(p, 0, reduced ? FADE : CLOSE_SPRING);
        controls.then(() => {
            if (cancelled) return;
            if (hadFocus) getIconElement(app)?.closest<HTMLElement>("button, a")?.focus({ preventScroll: true });
            safeToRemove?.();
        });
        return () => {
            cancelled = true;
            controls.stop();
        };
    }, [isPresent, reduced, app, vp, origin, p, homeScale, safeToRemove]);

    // Move focus into the app as it opens (VoiceOver/keyboard land on Back).
    useEffect(() => {
        backRef.current?.focus({ preventScroll: true });
    }, []);

    // Escape closes, like Back.
    useEffect(() => {
        if (!isPresent) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose(app);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isPresent, onClose, app]);

    // A new item starts at the top, like a pushed screen.
    useEffect(() => {
        if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
    }, [item]);

    const onScroll = (e: UIEvent<HTMLDivElement>) => {
        const top = e.currentTarget.scrollTop;
        setCollapsed(top > COLLAPSE_AT);
        const title = titleRef.current;
        // Rubber-band pull: the large title grows a touch, as on iOS.
        if (title) title.style.transform = top < 0 ? `scale(${1 + Math.min(-top / 600, 0.1)})` : "";
    };

    const close = () => onClose(app);
    const titleId = `phone-sheet-title-${app}`;

    return (
        <motion.div
            ref={sheetRef}
            className={s.sheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-phone-surface="sheet"
            data-app={app}
            style={{ x, y, scaleX, scaleY, originX: 0, originY: 0, borderRadius, opacity, pointerEvents: isPresent ? "auto" : "none" }}
        >
            <motion.div className={s.sheetInner} style={{ scaleY: innerScaleY }}>
                <motion.div
                    className={s.launchIcon}
                    aria-hidden="true"
                    style={{ opacity: iconOpacity, scale: iconScale, top: (vp.h - vp.w) / 2, width: vp.w, height: vp.w }}
                >
                    <AppIcon icon={manifest.icon} size={vp.w} />
                </motion.div>

                <div className={s.navBar} data-collapsed={collapsed}>
                    <div className={s.navBg} aria-hidden="true" />
                    <button ref={backRef} type="button" className={s.back} onClick={close} aria-label="Back to home screen">
                        <svg width="13" height="21" viewBox="0 0 13 21" aria-hidden="true">
                            <path d="M11 2 2.5 10.5 11 19" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Back</span>
                    </button>
                    <p className={s.inlineTitle} aria-hidden="true">
                        {manifest.name}
                    </p>
                    <span />
                </div>

                <div ref={scrollerRef} className={s.scroller} onScroll={onScroll}>
                    <h1 ref={titleRef} id={titleId} className={s.largeTitle}>
                        {manifest.name}
                    </h1>
                    <div className={s.content}>
                        {/* Own boundary: a lazy view must never suspend the whole shell. */}
                        <Suspense fallback={<div className={s.loading} aria-hidden="true" />}>
                            <View shell="phone" item={item} openItem={(next) => openItem(app, next)} close={close} />
                        </Suspense>
                    </div>
                </div>

                <HomeBar dragY={dragY} viewportHeight={vp.h} onDismiss={close} label={`Close ${manifest.name} and go to the home screen`} />
            </motion.div>
        </motion.div>
    );
}
