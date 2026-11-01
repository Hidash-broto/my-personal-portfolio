"use client";

import {
    animate,
    motion,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
    type MotionValue,
} from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AppIcon } from "@/apps/icons";
import { desktopDockApps, isWindowAppId } from "@/apps/registry";
import { useOs, useOsStore, useSpawnSurface } from "@/lib/os";
import { registerDockAnchor } from "./dock-anchors";
import { DOCK_ICON, DOCK_MAGNIFY, dockLayout, type DockLayout } from "./dock-math";
import type { DesktopActions } from "./use-desktop-actions";

const DOCK_RADIUS = 24;
const POINTER_SPRING = { mass: 0.1, stiffness: 220, damping: 16 };
const INTENSITY_SPRING = { mass: 0.2, stiffness: 260, damping: 26 };
const REST: DockLayout = { scales: [], offsets: [], extra: 0 };

type DockAppManifest = (typeof desktopDockApps)[number];

type Slot = { key: string; kind: "app"; app: DockAppManifest } | { key: string; kind: "separator" } | { key: string; kind: "trash" };

const SLOTS: Slot[] = [
    ...desktopDockApps.map((app): Slot => ({ key: app.id, kind: "app", app })),
    { key: "separator", kind: "separator" },
    { key: "trash", kind: "trash" },
];
const FIXED = SLOTS.map((s) => s.kind === "separator");

export function Dock({ actions }: { actions: DesktopActions }) {
    const { url } = useOs();
    const minimizedIds = useOsStore((s) => Object.entries(s.windows).filter(([, g]) => g?.minimized).map(([id]) => id).join(","));
    const reduce = useReducedMotion() ?? false;
    const dockRef = useRef<HTMLDivElement>(null);
    const slotRefs = useRef<(HTMLLIElement | null)[]>([]);

    const pointer = useMotionValue(0);
    const intensity = useMotionValue(0);
    const smoothPointer = useSpring(pointer, POINTER_SPRING);
    const smoothIntensity = useSpring(intensity, INTENSITY_SPRING);
    const centers = useMotionValue<number[]>([]);
    const restWidth = useMotionValue(1);

    // Read every input up front: the function form of useTransform subscribes to what it reads on its first run.
    const layout = useTransform(() => {
        const c = centers.get();
        const x = smoothPointer.get();
        const h = smoothIntensity.get();
        return c.length === 0 ? REST : dockLayout(x, h, c, FIXED, DOCK_MAGNIFY);
    });
    const bgScaleX = useTransform(() => (restWidth.get() + layout.get().extra) / restWidth.get());
    // Keep the corners round while the background stretches (scale correction).
    const bgRadius = useTransform(bgScaleX, (s) => `${DOCK_RADIUS / s}px / ${DOCK_RADIUS}px`);

    // Rest centres, measured from layout (transforms never affect offsetLeft). The rest frame is
    // also published on :root (--hos-dock-top/left/width) for the character lane.
    useLayoutEffect(() => {
        const root = document.documentElement.style;
        const measure = () => {
            centers.set(slotRefs.current.map((el) => (el ? el.offsetLeft + el.offsetWidth / 2 : 0)));
            const dock = dockRef.current;
            if (!dock) return;
            restWidth.set(dock.offsetWidth || 1);
            const rect = dock.getBoundingClientRect();
            root.setProperty("--hos-dock-top", `${Math.round(rect.top)}px`);
            root.setProperty("--hos-dock-left", `${Math.round(rect.left)}px`);
            root.setProperty("--hos-dock-width", `${Math.round(rect.width)}px`);
        };
        measure();
        window.addEventListener("resize", measure);
        return () => {
            window.removeEventListener("resize", measure);
            for (const name of ["--hos-dock-top", "--hos-dock-left", "--hos-dock-width"]) root.removeProperty(name);
        };
    }, [centers, restWidth]);

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (reduce || e.pointerType === "touch" || !dockRef.current) return;
        const x = e.clientX - dockRef.current.getBoundingClientRect().left;
        pointer.set(x);
        // Entering from rest: jump instead of sweeping in from the last position.
        if (smoothIntensity.get() < 0.05) smoothPointer.jump(x);
        intensity.set(1);
    };
    const onPointerLeave = () => intensity.set(0);

    return (
        <nav className="hos-dock-wrap" aria-label="Dock">
            <div ref={dockRef} className="hos-dock" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
                <motion.div className="hos-dock-bg hos-live-glass" aria-hidden="true" style={{ scaleX: bgScaleX, borderRadius: bgRadius }} />
                <ul className="hos-dock-items">
                    {SLOTS.map((slot, index) => (
                        <DockSlot
                            key={slot.key}
                            index={index}
                            layout={layout}
                            slotRef={(el) => {
                                slotRefs.current[index] = el;
                            }}
                            separator={slot.kind === "separator"}
                        >
                            {(scale) =>
                                slot.kind === "app" ? (
                                    <DockApp
                                        app={slot.app}
                                        scale={scale}
                                        running={isWindowAppId(slot.app.id) && url.open.includes(slot.app.id)}
                                        minimized={minimizedIds.split(",").includes(slot.app.id)}
                                        reduce={reduce}
                                        actions={actions}
                                    />
                                ) : slot.kind === "trash" ? (
                                    <DockTrash scale={scale} />
                                ) : null
                            }
                        </DockSlot>
                    ))}
                </ul>
            </div>
        </nav>
    );
}

function DockSlot({
    index,
    layout,
    slotRef,
    separator,
    children,
}: {
    index: number;
    layout: MotionValue<DockLayout>;
    slotRef: (el: HTMLLIElement | null) => void;
    separator: boolean;
    children: (scale: MotionValue<number>) => ReactNode;
}) {
    const x = useTransform(layout, (l) => l.offsets[index] ?? 0);
    const scale = useTransform(layout, (l) => l.scales[index] ?? 1);
    return (
        <motion.li ref={slotRef} className={separator ? "hos-dock-separator" : "hos-dock-slot"} style={{ x }} aria-hidden={separator || undefined}>
            {children(scale)}
        </motion.li>
    );
}

function Tooltip({ label, scale, show }: { label: string; scale: MotionValue<number>; show: boolean }) {
    const y = useTransform(scale, (s) => -(s - 1) * DOCK_ICON);
    return (
        <motion.span className="hos-dock-tooltip" data-show={show || undefined} style={{ x: "-50%", y }} aria-hidden="true">
            {label}
        </motion.span>
    );
}

function DockApp({
    app,
    scale,
    running,
    minimized,
    reduce,
    actions,
}: {
    app: DockAppManifest;
    scale: MotionValue<number>;
    running: boolean;
    minimized: boolean;
    reduce: boolean;
    actions: DesktopActions;
}) {
    const ref = useRef<HTMLElement>(null);
    const bounce = useMotionValue(0);
    const [hover, setHover] = useState(false);
    const [focusVisible, setFocusVisible] = useState(false);
    const wasRunning = useRef(running);

    useSpawnSurface(`dock-${app.id}`, "icon", ref);
    useEffect(() => (ref.current ? registerDockAnchor(app.id, ref.current) : undefined), [app.id]);

    // Launch bounce: two hops when the app starts running (from anywhere: Dock, Search, menus).
    useEffect(() => {
        const started = running && !wasRunning.current;
        wasRunning.current = running;
        if (!started || reduce) return;
        const controls = animate(bounce, [0, -22, 0, -9, 0], {
            duration: 0.82,
            times: [0, 0.27, 0.54, 0.76, 1],
            ease: ["easeOut", "easeIn", "easeOut", "easeIn"],
        });
        return () => controls.stop();
    }, [running, reduce, bounce]);

    const label = minimized ? `${app.name} (minimized)` : running ? `${app.name} (open)` : app.name;
    const common = {
        className: "hos-dock-icon",
        "data-dock-app": app.id,
        style: { scale, y: bounce },
        "aria-label": label,
        onPointerEnter: () => setHover(true),
        onPointerLeave: () => setHover(false),
        onFocus: (e: React.FocusEvent<HTMLElement>) => setFocusVisible(e.currentTarget.matches(":focus-visible")),
        onBlur: () => setFocusVisible(false),
    };

    return (
        <>
            <Tooltip label={app.name} scale={scale} show={hover || focusVisible} />
            {app.kind === "external" ? (
                <motion.a ref={ref as React.RefObject<HTMLAnchorElement>} href={app.href} target="_blank" rel="noopener noreferrer" {...common}>
                    <AppIcon icon={app.icon} size={56} />
                </motion.a>
            ) : (
                <motion.button ref={ref as React.RefObject<HTMLButtonElement>} type="button" onClick={() => actions.launch(app.id)} {...common}>
                    <AppIcon icon={app.icon} size={56} />
                </motion.button>
            )}
            {running && <span className="hos-dock-dot" aria-hidden="true" />}
        </>
    );
}

function DockTrash({ scale }: { scale: MotionValue<number> }) {
    const [hover, setHover] = useState(false);
    return (
        <>
            <Tooltip label="Trash" scale={scale} show={hover} />
            <motion.button
                type="button"
                className="hos-dock-icon hos-dock-trash"
                aria-label="Trash"
                style={{ scale }}
                onPointerEnter={() => setHover(true)}
                onPointerLeave={() => setHover(false)}
                onFocus={() => setHover(true)}
                onBlur={() => setHover(false)}
            >
                <svg width="44" height="50" viewBox="0 0 44 50" aria-hidden="true">
                    <defs>
                        <linearGradient id="hos-trash-body" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="rgba(255,255,255,0.34)" />
                            <stop offset="1" stopColor="rgba(255,255,255,0.12)" />
                        </linearGradient>
                    </defs>
                    <path d="M8 12h28l-2.6 32.2a3.4 3.4 0 0 1-3.4 3.1H14a3.4 3.4 0 0 1-3.4-3.1Z" fill="url(#hos-trash-body)" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
                    <path d="M6 11.2h32" stroke="rgba(255,255,255,0.85)" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M16 17.5l.9 24M22 17.5v24M28 17.5l-.9 24" stroke="rgba(255,255,255,0.34)" strokeWidth="1.1" strokeLinecap="round" />
                    <path d="M10.2 14h23.6" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
                </svg>
            </motion.button>
        </>
    );
}
