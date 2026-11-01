"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { BUGS, type BugId } from "@/data/bugs";
import { getSpawnRects, os, useOsStore, type ShellKind, type SpawnKind } from "@/lib/os";
import Beetle from "./Beetle";
import {
    TARGET_PX,
    bugOpacity,
    catchBug,
    createRound,
    isOver,
    miss,
    nearestBug,
    remainingMs,
    resultOf,
    setKeyboard,
    setPaused,
    setViewport,
    tick,
    type RoundResult,
    type RoundState,
    type SurfaceRect,
} from "./engine";
import { createRain, type RainController } from "./rain";
import styles from "./bug-hunt.module.css";

export type EndReason = "time" | "esc" | "button" | "popstate";

interface RoundLayerProps {
    shell: ShellKind;
    challenge: number | null;
    reducedMotion: boolean;
    tierA: boolean;
    spawnKinds: readonly SpawnKind[];
    /** Runs once as the round mounts, before the OS is locked (open windows, fetch the nonce). */
    onBegin: () => void;
    onEnd: (result: RoundResult, via: EndReason) => void;
    /** Standalone page: push a same-URL entry so back ends the round instead of leaving. */
    pushHistoryEntry: boolean;
    /** Called after a popstate ended the round (the OS restores its own entry). */
    onPopState?: () => void;
}

type Stage = "countdown" | "playing" | "ending";
type RainMode = "none" | "webgl" | "css";

interface Ghost {
    uid: number;
    type: BugId;
    x: number;
    y: number;
    angle: number;
}

const HALF = TARGET_PX / 2;
const RING_R = 17;
const RING_C = 2 * Math.PI * RING_R;
const FINALE_MS = 10_000;
const BUG_BY_ID = new Map(BUGS.map((b) => [b.id, b]));
const SPRING = { type: "spring", stiffness: 520, damping: 34, mass: 0.8 } as const;

function placeBug(el: HTMLElement, x: number, y: number, angle: number) {
    el.style.transform = `translate3d(${(x - HALF).toFixed(1)}px, ${(y - HALF).toFixed(1)}px, 0) rotate(${(angle + Math.PI / 2).toFixed(3)}rad)`;
}

function viewport() {
    return { w: window.innerWidth, h: window.innerHeight };
}

/** The live round: countdown, crawling bugs, HUD, toasts, finale. Rendered inside the overlay portal. */
export default function RoundLayer(props: RoundLayerProps) {
    const { shell, challenge, reducedMotion } = props;
    const propsRef = useRef(props);
    useEffect(() => {
        propsRef.current = props;
    });

    const engine = useRef<RoundState | null>(null);
    const bugEls = useRef(new Map<number, HTMLButtonElement>());
    const ringRef = useRef<SVGCircleElement | null>(null);
    const endRef = useRef<HTMLButtonElement | null>(null);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const rain = useRef<RainController | null>(null);
    const ended = useRef(false);
    const lastFrame = useRef(0);
    const secondsShown = useRef(60);
    const rippleId = useRef(0);
    const finaleStarted = useRef(false);

    const [stage, setStage] = useState<Stage>("countdown");
    const [count, setCount] = useState(3);
    const [bugs, setBugs] = useState<{ uid: number; type: BugId }[]>([]);
    const [ghosts, setGhosts] = useState<Ghost[]>([]);
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
    const [score, setScore] = useState(0);
    const [seconds, setSeconds] = useState(60);
    const [toast, setToast] = useState<{ key: number; type: BugId } | null>(null);
    const [rainMode, setRainMode] = useState<RainMode>("none");
    const [announcement, setAnnouncement] = useState("");

    const getEngine = useCallback((): RoundState => {
        if (!engine.current) {
            engine.current = createRound({
                shell: propsRef.current.shell,
                viewport: viewport(),
                reducedMotion: propsRef.current.reducedMotion,
                insets: { top: 76, bottom: 0 },
            });
        }
        return engine.current;
    }, []);

    /** End once: unlock the OS, restore glass, tell the bus, and (unless unmounting) report. */
    const finish = useCallback((via: EndReason | null) => {
        if (ended.current) return;
        ended.current = true;
        const state = getEngine();
        const result = resultOf(state);
        useOsStore.getState().setMode("normal");
        const root = document.documentElement;
        const previous = root.dataset.bhPrevGlass;
        if (previous === undefined || previous === "") delete root.dataset.glass;
        else root.dataset.glass = previous;
        delete root.dataset.bhPrevGlass;
        os.emit("game:end", { score: result.score, activeMs: result.activeMs });
        if (via) propsRef.current.onEnd(result, via);
    }, [getEngine]);

    // Lock the OS for the round; always unlock on unmount.
    useEffect(() => {
        ended.current = false;
        getEngine();
        propsRef.current.onBegin();
        const root = document.documentElement;
        if (root.dataset.bhPrevGlass === undefined) root.dataset.bhPrevGlass = root.dataset.glass ?? "";
        root.dataset.glass = "solid";
        useOsStore.getState().setMode("game");
        os.emit("game:start", {});
        if (propsRef.current.pushHistoryEntry) window.history.pushState({ bughunt: "round" }, "", window.location.href);
        return () => finish(null);
    }, [finish, getEngine]);

    // 3 · 2 · 1
    useEffect(() => {
        if (stage !== "countdown") return;
        const step = 620;
        const timers = [
            setTimeout(() => setCount(2), step),
            setTimeout(() => setCount(1), step * 2),
            setTimeout(() => setStage("playing"), step * 3),
        ];
        return () => timers.forEach(clearTimeout);
    }, [stage]);

    const announce = useCallback((text: string) => setAnnouncement(text), []);

    // The frame loop: engine tick, imperative transforms, 1Hz React updates.
    useEffect(() => {
        if (stage !== "playing") return;
        const state = getEngine();
        const kinds = propsRef.current.spawnKinds;
        const getRects = (): SurfaceRect[] =>
            getSpawnRects(kinds).map(({ kind, rect }) => ({ kind, x: rect.left, y: rect.top, w: rect.width, h: rect.height }));
        let raf = 0;
        lastFrame.current = performance.now();

        const frame = (now: number) => {
            const dt = now - lastFrame.current;
            lastFrame.current = now;
            const version = state.version;
            tick(state, dt, getRects);
            if (state.version !== version) setBugs(state.bugs.map((b) => ({ uid: b.uid, type: b.type })));

            for (const bug of state.bugs) {
                const el = bugEls.current.get(bug.uid);
                if (!el) continue;
                placeBug(el, bug.x, bug.y, bug.angle);
                if (bug.life !== null) el.style.opacity = bugOpacity(bug).toFixed(3);
            }

            const left = remainingMs(state);
            if (ringRef.current) ringRef.current.style.strokeDashoffset = String(RING_C * (1 - left / state.config.roundMs));
            const sec = Math.ceil(left / 1000);
            if (sec !== secondsShown.current) {
                secondsShown.current = sec;
                setSeconds(sec);
                if (sec > 0 && sec % 10 === 0) announce(`${sec} seconds left.`);
            }
            if (left <= FINALE_MS) {
                rain.current?.setAmount(1 - left / FINALE_MS);
                if (!finaleStarted.current) {
                    finaleStarted.current = true;
                    if (!propsRef.current.reducedMotion) setRainMode(propsRef.current.tierA ? "webgl" : "css");
                }
            }
            if (isOver(state)) {
                setStage("ending");
                return;
            }
            raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);

        const onVisibility = () => {
            setPaused(state, document.hidden);
            lastFrame.current = performance.now();
        };
        const onResize = () => setViewport(state, viewport());
        document.addEventListener("visibilitychange", onVisibility);
        window.addEventListener("resize", onResize);
        return () => {
            cancelAnimationFrame(raf);
            document.removeEventListener("visibilitychange", onVisibility);
            window.removeEventListener("resize", onResize);
        };
    }, [stage, getEngine, announce]);

    // Time is up: wipe the glass (tier A), or fade, then hand over to the recap.
    useEffect(() => {
        if (stage !== "ending") return;
        let cancelled = false;
        const done = () => {
            if (!cancelled) finish("time");
        };
        let timer: ReturnType<typeof setTimeout> | undefined;
        if (rain.current && !reducedMotion) {
            rain.current.wipe(950).then(() => {
                timer = setTimeout(done, 180);
            });
        } else {
            timer = setTimeout(done, reducedMotion ? 120 : 560);
        }
        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
        };
    }, [stage, reducedMotion, finish]);

    // Esc ends the round; back (popstate) ends it into the recap and never leaves the site.
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                finish("esc");
            }
        };
        const onPop = () => {
            if (ended.current) return;
            finish("popstate");
            propsRef.current.onPopState?.();
        };
        window.addEventListener("keydown", onKey);
        window.addEventListener("popstate", onPop, { capture: true });
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("popstate", onPop, { capture: true });
        };
    }, [finish]);

    // Toasts never block and never pause the timer.
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 2500);
        return () => clearTimeout(timer);
    }, [toast]);

    const focusNearest = useCallback((x: number, y: number, skip?: number) => {
        const state = getEngine();
        const next = nearestBug(state, x, y, skip);
        const el = next ? bugEls.current.get(next.uid) : null;
        if (el) el.focus({ preventScroll: true });
        else endRef.current?.focus({ preventScroll: true });
    }, [getEngine]);

    const catchOne = useCallback((uid: number, viaKeyboard: boolean) => {
        const state = getEngine();
        if (ended.current) return;
        const bug = catchBug(state, uid);
        if (!bug) return;
        const spec = BUG_BY_ID.get(bug.type)!;
        setBugs(state.bugs.map((b) => ({ uid: b.uid, type: b.type })));
        setGhosts((list) => [...list, { uid: bug.uid, type: bug.type, x: bug.x, y: bug.y, angle: bug.angle }]);
        setTimeout(() => setGhosts((list) => list.filter((g) => g.uid !== bug.uid)), 650);
        setScore(state.score);
        setToast({ key: bug.uid, type: bug.type });
        announce(`Caught: ${spec.name}. ${state.score} ${state.score === 1 ? "bug" : "bugs"}.`);
        os.emit("game:catch", { bug: bug.type });
        try {
            navigator.vibrate?.(12);
        } catch {
            /* not supported */
        }
        if (viaKeyboard) {
            setKeyboard(state, true);
            requestAnimationFrame(() => focusNearest(bug.x, bug.y));
        }
    }, [getEngine, announce, focusNearest]);

    const registerBug = useCallback((uid: number) => (el: HTMLButtonElement | null) => {
        if (!el) {
            bugEls.current.delete(uid);
            return;
        }
        bugEls.current.set(uid, el);
        const bug = engine.current?.bugs.find((b) => b.uid === uid);
        if (bug) {
            placeBug(el, bug.x, bug.y, bug.angle);
            if (bug.life !== null) el.style.opacity = bugOpacity(bug).toFixed(3);
        }
    }, []);

    const rainCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
        if (!canvas) {
            rain.current?.destroy();
            rain.current = null;
            return;
        }
        const controller = createRain(canvas, {
            onContextLost: () => {
                rain.current = null;
                setRainMode("css");
            },
        });
        if (!controller) {
            setRainMode("css");
            return;
        }
        rain.current = controller;
    }, []);

    const onFieldPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (stage !== "playing" || ended.current) return;
        if (event.target !== event.currentTarget) return;
        miss(getEngine());
        const id = ++rippleId.current;
        setRipples((list) => [...list.slice(-4), { id, x: event.clientX, y: event.clientY }]);
        setTimeout(() => setRipples((list) => list.filter((r) => r.id !== id)), 480);
    };

    const onRootKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (event.key !== "Tab") return;
        event.preventDefault();
        const state = getEngine();
        setKeyboard(state, true);
        if (event.shiftKey) {
            endRef.current?.focus({ preventScroll: true });
            return;
        }
        const active = document.activeElement;
        let origin = { x: state.config.viewport.w / 2, y: state.config.viewport.h / 2 };
        let skip: number | undefined;
        for (const [uid, el] of bugEls.current) {
            if (el === active) {
                const bug = state.bugs.find((b) => b.uid === uid);
                if (bug) [origin, skip] = [{ x: bug.x, y: bug.y }, uid];
            }
        }
        focusNearest(origin.x, origin.y, skip);
    };

    const toastBug = toast ? BUG_BY_ID.get(toast.type) : undefined;
    const urgent = stage !== "countdown" && seconds <= 10;
    const verb = shell === "phone" ? "Tap" : "Click";

    return (
        <div ref={rootRef} className={styles.roundLayer} onKeyDown={onRootKeyDown} role="dialog" aria-modal="true" aria-label="Bug Hunt round">
            <div className={`${styles.vignette} ${stage === "countdown" ? styles.vignetteCountdown : ""}`} />

            <div
                className={`${styles.field} ${stage === "ending" ? styles.fieldEnding : ""}`}
                onPointerDown={onFieldPointerDown}
            >
                {bugs.map(({ uid, type }) => {
                    const spec = BUG_BY_ID.get(type)!;
                    return (
                        <button
                            key={uid}
                            ref={registerBug(uid)}
                            type="button"
                            className={styles.bug}
                            aria-label={`Bug: ${spec.name}`}
                            onPointerDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                catchOne(uid, false);
                            }}
                            onClick={(event) => {
                                // Keyboard and assistive tech activate with a click of detail 0.
                                if (event.detail === 0) catchOne(uid, true);
                            }}
                        >
                            <span className={styles.bugInner}>
                                <Beetle mark={spec.mark} size={shell === "phone" ? 38 : 40} crawl={!reducedMotion} />
                            </span>
                        </button>
                    );
                })}
                {ghosts.map((g) => (
                    <div
                        key={`g${g.uid}`}
                        className={styles.ghost}
                        style={{ transform: `translate3d(${g.x - HALF}px, ${g.y - HALF}px, 0)` }}
                        aria-hidden="true"
                    >
                        <span className={styles.burst} />
                        <span className={styles.ghostBug} style={{ rotate: `${g.angle + Math.PI / 2}rad` }}>
                            <Beetle mark={BUG_BY_ID.get(g.type)!.mark} size={shell === "phone" ? 38 : 40} />
                        </span>
                        <span className={styles.plusOne}>+1</span>
                    </div>
                ))}
                {ripples.map((r) => (
                    <span key={r.id} className={styles.ripple} style={{ transform: `translate3d(${r.x}px, ${r.y}px, 0)` }} aria-hidden="true" />
                ))}
            </div>

            <AnimatePresence>
                {rainMode === "webgl" && (
                    <motion.canvas
                        key="rain"
                        ref={rainCanvas}
                        className={styles.rainCanvas}
                        aria-hidden="true"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 1.4, ease: [0.25, 0.8, 0.25, 1] } }}
                        exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    />
                )}
                {rainMode === "css" && (
                    <motion.div
                        key="rain-css"
                        className={styles.rainStatic}
                        aria-hidden="true"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: stage === "ending" ? 0 : 0.9, transition: { duration: stage === "ending" ? 0.5 : 1.6 } }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </AnimatePresence>

            <div className={styles.hudBar}>
                <motion.div
                    className={styles.hud}
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={SPRING}
                >
                    <div className={`${styles.timer} ${urgent ? styles.timerUrgent : ""}`} role="timer" aria-label={`${seconds} seconds left`}>
                        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
                            <circle className={styles.ringTrack} cx="20" cy="20" r={RING_R} fill="none" strokeWidth="3" />
                            <circle
                                ref={ringRef}
                                className={styles.ringFill}
                                cx="20"
                                cy="20"
                                r={RING_R}
                                fill="none"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={RING_C}
                                strokeDashoffset={0}
                            />
                        </svg>
                        <span className={styles.timerNum} aria-hidden="true">
                            {seconds}
                        </span>
                    </div>
                    <div className={styles.hudScore}>
                        <motion.span
                            key={score}
                            className={styles.hudScoreNum}
                            initial={reducedMotion || score === 0 ? false : { scale: 1.35, y: -2 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 700, damping: 22 }}
                        >
                            {score}
                        </motion.span>
                        <span className={styles.hudLabel}>{score === 1 ? "bug" : "bugs"}</span>
                    </div>
                    {challenge !== null && <span className={styles.hudChallenge}>Beat {challenge}</span>}
                    <button ref={endRef} type="button" className={styles.hudEnd} onClick={() => finish("button")}>
                        End
                    </button>
                </motion.div>
            </div>

            <div className={styles.toastWrap} aria-hidden="true">
                <AnimatePresence mode="popLayout">
                    {toast && toastBug && (
                        <motion.div
                            key={toast.key}
                            className={styles.toast}
                            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.94 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.18 } }}
                            transition={SPRING}
                        >
                            <span className={styles.toastIcon}>
                                <Beetle mark={toastBug.mark} size={30} />
                            </span>
                            <span className={styles.toastText}>
                                <span className={styles.toastName}>{toastBug.name}</span>
                                <span className={styles.toastLesson}>{toastBug.lesson}</span>
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {stage === "countdown" && (
                    <motion.div
                        key="countdown"
                        className={styles.countdown}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    >
                        <div className={styles.countSlot} aria-hidden="true">
                            <AnimatePresence initial={false}>
                                <motion.span
                                    key={count}
                                    className={styles.countNum}
                                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.6 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, transition: { duration: 0.18 } }}
                                    transition={{ type: "spring", stiffness: 420, damping: 26 }}
                                >
                                    {count}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                        <span className={styles.countCaption}>
                            {verb} the bugs before they ship{challenge !== null ? ` · beat ${challenge}` : ""}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">
                {stage === "countdown" ? `Round starts in ${count}.` : announcement}
            </div>
        </div>
    );
}
