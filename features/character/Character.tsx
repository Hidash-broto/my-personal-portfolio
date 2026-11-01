"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { os, useOs, type ShellKind } from "@/lib/os";
import Bubble from "./Bubble";
import Figure from "./Figure";
import { INITIAL, TIMINGS, appContext, connect, reduce, view, type CharLayout } from "./machine";
import { loadRiveCharacter, type RiveCharacter } from "./rive";
import s from "./character.module.css";

/** Figure heights per layout, in CSS px. */
const HEIGHT: Record<Exclude<CharLayout, "none">, number> = { dock: 72, home: 64, badge: 48 };
/** How far he walks when the Builds dock icon can't be found. */
const FALLBACK_WALK_PX = -160;
/** The Builds icon in the desktop dock, if the shell marks it. */
const BUILDS_DOCK_SELECTOR = '[data-dock-app="builds"]';
const RIVE_IDLE_MS = 3000;

/** Greeting plays once per page load, even if a shell remounts us. */
let greetedThisPage = false;

/**
 * Lazy Rive: start loading after the first interaction, or 3s after boot:end, whichever is first.
 * Resolves to null (keep the SVG) until the art exists, or on failure.
 */
function useRiveCharacter() {
    const [rive, setRive] = useState<RiveCharacter | null>(null);
    useEffect(() => {
        let cancelled = false;
        let started = false;
        let idleTimer: ReturnType<typeof setTimeout> | undefined;
        const events = ["pointerdown", "keydown"] as const;

        function stop() {
            clearTimeout(idleTimer);
            offBoot();
            for (const e of events) window.removeEventListener(e, start, true);
        }
        function start() {
            if (started) return;
            started = true;
            stop();
            loadRiveCharacter()
                .then((loaded) => {
                    if (!cancelled && loaded) setRive(loaded);
                })
                .catch(() => {});
        }
        function armIdle() {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(start, RIVE_IDLE_MS);
        }

        const offBoot = os.on("boot:end", armIdle);
        if (os.lifecycle().booted) armIdle();
        for (const e of events) window.addEventListener(e, start, { capture: true, passive: true });
        return () => {
            cancelled = true;
            stop();
        };
    }, []);
    return [rive, setRive] as const;
}

export default function Character({ shell }: { shell: ShellKind }) {
    const { url } = useOs();
    const [model, dispatch] = useReducer(reduce, INITIAL);
    const reduced = useReducedMotion() ?? false;
    const [rive, setRive] = useRiveCharacter();
    const walkerRef = useRef<HTMLDivElement>(null);
    const [walkDx, setWalkDx] = useState(0);
    const stopWalk = useRef<() => void>(() => {});

    // Lifecycle first, then the bus (connect does both, in that order).
    useEffect(() => connect(os, dispatch, { greeted: greetedThisPage }), []);

    useEffect(() => {
        if (model.greeted) greetedThisPage = true;
    }, [model.greeted]);

    // Timed transitions requested by the machine.
    useEffect(() => {
        const timer = model.timer;
        if (!timer) return;
        const handle = setTimeout(() => dispatch({ type: "timeout", id: timer.id }), timer.ms);
        return () => clearTimeout(handle);
    }, [model.timer]);

    // Any visitor input wakes him up.
    const asleep = model.pose === "sleep";
    useEffect(() => {
        if (!asleep) return;
        const wake = () => dispatch({ type: "activity" });
        const events = ["pointerdown", "pointermove", "keydown", "wheel"] as const;
        for (const e of events) window.addEventListener(e, wake, { passive: true });
        return () => {
            for (const e of events) window.removeEventListener(e, wake);
        };
    }, [asleep]);

    useEffect(() => () => stopWalk.current(), []);

    /** Desktop "Show me": walk toward the Builds dock icon, then open. Any click or key cancels. */
    const walk = useCallback(
        (arrive: () => void) => {
            if (reduced) {
                arrive();
                return;
            }
            const target = document.querySelector<HTMLElement>(BUILDS_DOCK_SELECTOR)?.getBoundingClientRect();
            const me = walkerRef.current?.getBoundingClientRect();
            const dx = target && me ? target.left + target.width / 2 - (me.left + me.width / 2) : FALLBACK_WALK_PX;
            setWalkDx(Math.max(-720, Math.min(720, dx)));
            dispatch({ type: "walk:start" });

            function cleanup() {
                clearTimeout(timer);
                window.removeEventListener("pointerdown", cancel, true);
                window.removeEventListener("keydown", cancel, true);
                stopWalk.current = () => {};
            }
            function cancel() {
                cleanup();
                dispatch({ type: "walk:cancel" });
            }
            const timer = setTimeout(() => {
                cleanup();
                dispatch({ type: "walk:end" });
                arrive();
            }, TIMINGS.walk);
            window.addEventListener("pointerdown", cancel, true);
            window.addEventListener("keydown", cancel, true);
            stopWalk.current = cleanup;
        },
        [reduced],
    );

    const dismiss = useCallback(() => dispatch({ type: "dismiss" }), []);

    const v = view(model, shell, appContext(url.open));
    if (v.layout === "none" || v.state === "hidden") return null;

    const pose = v.state;
    const height = HEIGHT[v.layout];
    const bust = v.layout === "badge";
    const art = rive ? (
        <rive.Component pose={pose} height={height} walking={model.walking} bust={bust} reduced={reduced} onError={() => setRive(null)} />
    ) : (
        <Figure pose={pose} height={height} walking={model.walking} bust={bust} reduced={reduced} />
    );

    return (
        <div className={s.anchor} data-layout={v.layout} data-shell={shell} data-character={pose}>
            <AnimatePresence>
                {v.bubble && <Bubble key="greeting" onDismiss={dismiss} walk={shell === "desktop" ? walk : undefined} />}
            </AnimatePresence>
            {bust ? (
                <div className={s.badge} role="img" aria-label={pose === "celebrate" ? "Mini Hidash celebrating" : "Mini Hidash, nervous about the bugs"}>
                    {art}
                </div>
            ) : (
                <motion.div
                    ref={walkerRef}
                    className={s.walker}
                    animate={{ x: model.walking ? walkDx : 0 }}
                    transition={reduced ? { duration: 0 } : { duration: model.walking ? TIMINGS.walk / 1000 : 0.6, ease: "easeInOut" }}
                >
                    <button
                        type="button"
                        className={`${s.hit} ${model.walking && walkDx > 0 ? s.flip : ""}`}
                        onClick={() => dispatch({ type: "tap" })}
                        aria-label="Mini Hidash. Tap to wave."
                    >
                        {art}
                    </button>
                </motion.div>
            )}
        </div>
    );
}
