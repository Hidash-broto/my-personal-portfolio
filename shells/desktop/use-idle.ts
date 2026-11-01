"use client";

import { useEffect } from "react";

const INPUT_EVENTS = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const;

/**
 * Calls `onIdle` once after `ms` without input, then again only after new input
 * followed by another idle period. One timer, re-armed lazily (no work per mousemove).
 */
export function useIdle(ms: number, onIdle: () => void) {
    useEffect(() => {
        let last = performance.now();
        let fired = false;
        let timer = 0;

        const check = () => {
            const quiet = performance.now() - last;
            if (quiet >= ms) {
                timer = 0;
                if (!fired) {
                    fired = true;
                    onIdle();
                }
            } else {
                timer = window.setTimeout(check, ms - quiet);
            }
        };
        const onInput = () => {
            last = performance.now();
            fired = false;
            if (!timer) timer = window.setTimeout(check, ms);
        };

        timer = window.setTimeout(check, ms);
        for (const type of INPUT_EVENTS) window.addEventListener(type, onInput, { passive: true, capture: true });
        return () => {
            window.clearTimeout(timer);
            for (const type of INPUT_EVENTS) window.removeEventListener(type, onInput, { capture: true });
        };
    }, [ms, onIdle]);
}
