"use client";

import {
    animate,
    motion,
    useMotionValue,
    usePresence,
    useReducedMotion,
    type AnimationPlaybackControls,
    type MotionValue,
    type Transition,
} from "framer-motion";
import { Suspense, useCallback, useLayoutEffect, useRef, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { getApp, type WindowAppId } from "@/apps/registry";
import { APP_VIEWS } from "@/apps/views";
import { syncFauxGlass } from "@/features/wallpaper/faux-glass";
import { useOsStore, useSpawnSurface } from "@/lib/os";
import { dockAnchorRect } from "./dock-anchors";
import { EDGE_CURSOR, EDGES, clampPosition, fitRect, resizeRect, restoreUnderPointer, zoomRect, type Edge, type Rect } from "./geometry";
import { TrafficLights } from "./TrafficLights";
import type { DesktopActions } from "./use-desktop-actions";
import { readViewport, useViewport } from "./use-viewport";
import { WindowErrorBoundary } from "./WindowErrorBoundary";

const NO_SURFACE: RefObject<Element | null> = { current: null };

const OPEN: Transition = { type: "spring", visualDuration: 0.42, bounce: 0.14 };
const RESTORE: Transition = { type: "spring", visualDuration: 0.4, bounce: 0.1 };
const ZOOM: Transition = { type: "spring", visualDuration: 0.34, bounce: 0.06 };
const FADE_IN: Transition = { duration: 0.16, ease: "easeOut" };
const CLOSE: Transition = { duration: 0.2, ease: [0.4, 0, 1, 1] };
const MINIMIZE: Transition = { duration: 0.46, ease: [0.55, 0, 0.75, 0.2] };
const MINIMIZE_FADE: Transition = { duration: 0.46, ease: [0.8, 0, 0.9, 0.4] };

type Channel = "x" | "y" | "scaleX" | "scaleY" | "opacity";
type Pose = Partial<Record<Channel, number>>;
const IDENTITY: Pose = { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1 };

type Gesture =
    | { kind: "move"; pointerId: number; start: Rect; px: number; py: number; zoomed: boolean }
    | { kind: "resize"; pointerId: number; start: Rect; px: number; py: number; edge: Edge };

function currentRect(id: WindowAppId): Rect | null {
    const g = useOsStore.getState().windows[id];
    if (!g) return null;
    const vp = readViewport();
    return g.zoomed ? zoomRect(vp) : fitRect(g, vp);
}

/** Offset + scale that put a window rect's centre on its Dock icon. */
function dockPose(id: WindowAppId, rect: Rect): Pose {
    const anchor = dockAnchorRect(id);
    const vp = readViewport();
    const cx = anchor ? anchor.left + anchor.width / 2 : vp.w / 2;
    const cy = anchor ? anchor.top + anchor.height / 2 : vp.h - 40;
    const size = anchor ? anchor.width : 56;
    const scale = Math.max(0.04, size / Math.max(rect.w, rect.h));
    return { x: cx - (rect.x + rect.w / 2), y: cy - (rect.y + rect.h / 2), scaleX: scale, scaleY: scale, opacity: 0 };
}

interface DesktopWindowProps {
    id: WindowAppId;
    active: boolean;
    item: string | null;
    actions: DesktopActions;
}

export function DesktopWindow({ id, active, item, actions }: DesktopWindowProps) {
    const g = useOsStore((s) => s.windows[id]);
    const mode = useOsStore((s) => s.mode);
    const vp = useViewport();
    const reduce = useReducedMotion() ?? false;
    const [isPresent, safeToRemove] = usePresence();
    const surfaceRef = useRef<HTMLElement>(null);
    const glassRef = useRef<HTMLDivElement>(null);
    const gesture = useRef<Gesture | null>(null);
    const suppressFlip = useRef(false);
    const lastRect = useRef<Rect | null>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const scaleX = useMotionValue(1);
    const scaleY = useMotionValue(1);
    const opacity = useMotionValue(0);
    const running = useRef<AnimationPlaybackControls[]>([]);

    const minimized = g?.minimized ?? false;
    const zoomed = g?.zoomed ?? false;

    useSpawnSurface(`win-${id}`, "window", minimized ? NO_SURFACE : surfaceRef);

    const play = useCallback(
        (pose: Pose, transition: Transition, opacityTransition: Transition = transition) => {
            for (const c of running.current) c.stop();
            const values: Record<Channel, MotionValue<number>> = { x, y, scaleX, scaleY, opacity };
            running.current = (Object.keys(pose) as Channel[]).map((key) =>
                animate(values[key], pose[key] as number, key === "opacity" ? opacityTransition : transition),
            );
            return Promise.all(running.current);
        },
        [x, y, scaleX, scaleY, opacity],
    );

    const setPose = useCallback(
        (pose: Pose) => {
            const values: Record<Channel, MotionValue<number>> = { x, y, scaleX, scaleY, opacity };
            for (const key of Object.keys(pose) as Channel[]) values[key].jump(pose[key] as number);
        },
        [x, y, scaleX, scaleY, opacity],
    );

    // Open: grow out of the Dock icon. Close (AnimatePresence exit): fade + shrink, then forget geometry.
    const opened = useRef(false);
    useLayoutEffect(() => {
        let cancelled = false;
        if (isPresent) {
            if (!opened.current) {
                opened.current = true;
                const rect = currentRect(id);
                if (reduce || !rect) setPose({ ...IDENTITY, opacity: 0 });
                else setPose(dockPose(id, rect));
                if (useOsStore.getState().windows[id]?.minimized) return;
                if (active) surfaceRef.current?.focus({ preventScroll: true });
            }
            if (useOsStore.getState().windows[id]?.minimized) return;
            void play(reduce ? { opacity: 1 } : IDENTITY, OPEN, FADE_IN);
        } else {
            const pose: Pose = reduce ? { opacity: 0 } : { opacity: 0, scaleX: scaleX.get() * 0.94, scaleY: scaleY.get() * 0.94 };
            void play(pose, CLOSE).then(() => {
                if (cancelled) return;
                useOsStore.getState().forget(id);
                safeToRemove?.();
            });
        }
        return () => {
            cancelled = true;
        };
        // `active` is read once for the first focus only.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPresent, id, reduce, play, setPose, safeToRemove, scaleX]);

    // Minimize into the Dock icon (transform only, URL untouched) and back.
    const prevMinimized = useRef(minimized);
    useLayoutEffect(() => {
        if (prevMinimized.current === minimized) return;
        prevMinimized.current = minimized;
        const rect = currentRect(id);
        if (!rect) return;
        if (minimized) {
            void play(reduce ? { opacity: 0 } : dockPose(id, rect), MINIMIZE, reduce ? CLOSE : MINIMIZE_FADE);
        } else {
            void play(reduce ? { opacity: 1 } : IDENTITY, RESTORE, FADE_IN);
        }
    }, [minimized, id, reduce, play]);

    // Zoom: FLIP from the previous frame to the new one, transform only.
    const prevZoomed = useRef(zoomed);
    useLayoutEffect(() => {
        if (prevZoomed.current === zoomed) return;
        prevZoomed.current = zoomed;
        const from = lastRect.current;
        const to = currentRect(id);
        if (suppressFlip.current || reduce || !from || !to) {
            suppressFlip.current = false;
            return;
        }
        setPose({
            scaleX: from.w / to.w,
            scaleY: from.h / to.h,
            x: from.x + from.w / 2 - (to.x + to.w / 2),
            y: from.y + from.h / 2 - (to.y + to.h / 2),
        });
        void play({ x: 0, y: 0, scaleX: 1, scaleY: 1 }, ZOOM);
    }, [zoomed, id, reduce, play, setPose]);

    // Remember the frame we drew, for the next zoom FLIP (declared after the zoom effect on purpose),
    // and keep the faux-glass wallpaper aligned while the window moves (offset mode: windows are transformed).
    useLayoutEffect(() => {
        lastRect.current = currentRect(id);
        if (glassRef.current) syncFauxGlass(glassRef.current);
    });

    if (!g) return null;

    const rect = g.zoomed ? zoomRect(vp) : fitRect(g, vp);
    const app = getApp(id);
    const View = APP_VIEWS[id];
    const canMove = mode === "normal";
    const live = active && !g.minimized && isPresent;

    const onTitlePointerDown = (e: ReactPointerEvent<HTMLElement>) => {
        if (e.button !== 0 || (e.target as Element).closest("button, a, input, [data-no-drag]")) return;
        if (!canMove) return;
        const current = useOsStore.getState().windows[id];
        if (!current) return;
        const view = readViewport();
        e.currentTarget.setPointerCapture(e.pointerId);
        gesture.current = {
            kind: "move",
            pointerId: e.pointerId,
            start: current.zoomed ? zoomRect(view) : fitRect(current, view),
            px: e.clientX,
            py: e.clientY,
            zoomed: current.zoomed,
        };
    };

    const onResizePointerDown = (edge: Edge) => (e: ReactPointerEvent<HTMLElement>) => {
        if (e.button !== 0 || !canMove) return;
        const current = useOsStore.getState().windows[id];
        if (!current) return;
        e.preventDefault();
        e.stopPropagation();
        actions.focus(id);
        const view = readViewport();
        const start = current.zoomed ? zoomRect(view) : fitRect(current, view);
        if (current.zoomed) {
            // Resizing a zoomed window un-zooms it in place first.
            const store = useOsStore.getState();
            store.move(id, start.x, start.y);
            store.resize(id, start.w, start.h);
            suppressFlip.current = true;
            store.toggleZoom(id);
        }
        e.currentTarget.setPointerCapture(e.pointerId);
        gesture.current = { kind: "resize", pointerId: e.pointerId, start, px: e.clientX, py: e.clientY, edge };
    };

    const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
        const gs = gesture.current;
        if (!gs || gs.pointerId !== e.pointerId) return;
        const store = useOsStore.getState();
        const view = readViewport();
        const dx = e.clientX - gs.px;
        const dy = e.clientY - gs.py;
        if (gs.kind === "resize") {
            const next = resizeRect(gs.start, gs.edge, dx, dy, view);
            store.move(id, next.x, next.y);
            store.resize(id, next.w, next.h);
            return;
        }
        if (gs.zoomed) {
            if (Math.hypot(dx, dy) < 4) return;
            const current = store.windows[id];
            if (!current) return;
            const restored = restoreUnderPointer(fitRect({ ...current, x: 0, y: 0 }, view), gs.start, { x: e.clientX, y: e.clientY }, view);
            store.move(id, restored.x, restored.y);
            suppressFlip.current = true;
            store.toggleZoom(id);
            gesture.current = { ...gs, start: restored, px: e.clientX, py: e.clientY, zoomed: false };
            return;
        }
        const next = clampPosition(gs.start.x + dx, gs.start.y + dy, gs.start, view);
        store.move(id, next.x, next.y);
    };

    const endGesture = (e: ReactPointerEvent<HTMLElement>) => {
        if (gesture.current?.pointerId !== e.pointerId) return;
        gesture.current = null;
        if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    };

    return (
        <div
            className="hos-window"
            data-active={live || undefined}
            data-zoomed={g.zoomed || undefined}
            data-minimized={g.minimized || undefined}
            data-game={!canMove || undefined}
            inert={g.minimized || !isPresent}
            style={{ transform: `translate3d(${rect.x}px, ${rect.y}px, 0)`, width: rect.w, height: rect.h, zIndex: g.z }}
            onPointerDownCapture={(e) => {
                if (!(e.target as Element).closest(".hos-tl-group")) actions.focus(id);
            }}
            onFocusCapture={() => {
                if (!active) actions.focus(id);
            }}
        >
            <motion.section
                ref={surfaceRef}
                role="dialog"
                aria-label={app.name}
                tabIndex={-1}
                className={`hos-window-surface ${live ? "hos-live-glass" : "hos-faux-surface"}`}
                style={{ x, y, scaleX, scaleY, opacity }}
            >
                {!live && <div ref={glassRef} className="hos-faux-glass hos-glass-layer" aria-hidden="true" />}
                <header
                    className="hos-titlebar"
                    onPointerDown={onTitlePointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endGesture}
                    onPointerCancel={endGesture}
                    onDoubleClick={(e) => {
                        if (!(e.target as Element).closest("button, a, input, [data-no-drag]")) actions.zoom(id);
                    }}
                >
                    <TrafficLights
                        name={app.name}
                        zoomed={g.zoomed}
                        canZoom={canMove}
                        onClose={() => actions.close(id)}
                        onMinimize={() => actions.minimize(id)}
                        onZoom={() => actions.zoom(id)}
                    />
                    <h2 className="hos-titlebar-title">{app.name}</h2>
                </header>
                <div className="hos-window-content">
                    <WindowErrorBoundary name={app.name}>
                        <Suspense fallback={<div className="hos-window-loading" role="status" aria-label={`Opening ${app.name}`} />}>
                            <View
                            shell="desktop"
                            item={item}
                            openItem={(next) => actions.openItem(id, next)}
                            openApp={(app, next) => actions.launch(app, next ?? null)}
                            close={() => actions.close(id)}
                            />
                        </Suspense>
                    </WindowErrorBoundary>
                </div>
            </motion.section>
            {canMove &&
                !g.minimized &&
                EDGES.map((edge) => (
                    <div
                        key={edge}
                        aria-hidden="true"
                        className="hos-resize"
                        data-edge={edge}
                        style={{ cursor: EDGE_CURSOR[edge] }}
                        onPointerDown={onResizePointerDown(edge)}
                        onPointerMove={onPointerMove}
                        onPointerUp={endGesture}
                        onPointerCancel={endGesture}
                    />
                ))}
        </div>
    );
}
