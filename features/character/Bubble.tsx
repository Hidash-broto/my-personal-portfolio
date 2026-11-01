"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useOs } from "@/lib/os";
import { TIMINGS } from "./machine";
import s from "./bubble.module.css";

export const GREETING = "Hey! I'm Hidash. Want to see what I'm shipping?";

export interface BubbleProps {
    onDismiss: () => void;
    /**
     * Desktop "Show me": play the walk toward the dock, then call `arrive`.
     * The walker may never call `arrive` (the visitor clicked elsewhere = cancelled).
     * Without it, Builds opens immediately.
     */
    walk?: (arrive: () => void) => void;
}

/** Glass greeting bubble with the two first-visit actions. */
export default function Bubble({ onDismiss, walk }: BubbleProps) {
    const { shell, history } = useOs();
    const reduced = useReducedMotion();
    const dismissRef = useRef(onDismiss);
    useEffect(() => {
        dismissRef.current = onDismiss;
    }, [onDismiss]);

    useEffect(() => {
        const timer = setTimeout(() => dismissRef.current(), TIMINGS.bubbleAutoHide);
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") dismissRef.current();
        };
        window.addEventListener("keydown", onKey);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("keydown", onKey);
        };
    }, []);

    const showMe = () => {
        onDismiss();
        if (shell === "phone") {
            history.open("builds");
            return;
        }
        const open = () => history.open("builds", "whatsapp-crm");
        if (walk) walk(open);
        else open();
    };

    const play = () => {
        onDismiss();
        history.open("bughunt", "play");
    };

    return (
        <motion.section
            className={s.bubble}
            data-shell={shell}
            aria-label="Hidash says hi"
            aria-live="polite"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.96 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.97 }}
            transition={reduced ? { duration: 0.15 } : { type: "spring", stiffness: 420, damping: 32, mass: 0.8 }}
        >
            <p className={s.text}>
                Hey! I&apos;m <strong>Hidash</strong>. Want to see what I&apos;m shipping?
            </p>
            <button type="button" className={s.close} onClick={onDismiss} aria-label="Dismiss">
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M2.5 2.5 L9.5 9.5 M9.5 2.5 L2.5 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
            </button>
            <div className={s.actions}>
                <button type="button" className={`${s.btn} ${s.primary}`} onClick={showMe}>
                    Show me
                </button>
                <button type="button" className={`${s.btn} ${s.secondary}`} onClick={play} aria-label="Play Bug Hunt with Hidash">
                    <span className={s.dot} aria-hidden="true" />
                    Play Bug Hunt
                </button>
            </div>
        </motion.section>
    );
}
