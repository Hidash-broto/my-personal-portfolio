"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { readGlassPref, setGlassPref, subscribeGlassPref } from "./glass-pref";

/** Small menu-bar popover. v1 holds one control: Reduce transparency. */
export function ControlCenter({ reduce, onClose }: { reduce: boolean; onClose: (returnFocus: boolean) => void }) {
    const solid = useSyncExternalStore(subscribeGlassPref, readGlassPref, () => false);
    const switchRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        switchRef.current?.focus({ preventScroll: true });
    }, []);

    return (
        <motion.div
            role="dialog"
            aria-label="Controls"
            className="hos-control hos-live-glass"
            initial={{ opacity: 0, y: reduce ? 0 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.16 } }}
            transition={{ type: "spring", visualDuration: 0.22, bounce: 0 }}
            onKeyDown={(e) => {
                if (e.key === "Escape") {
                    e.preventDefault();
                    e.stopPropagation();
                    onClose(true);
                }
            }}
        >
            <div className="hos-control-tile">
                <span className="hos-control-glyph" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="8" />
                        <path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" />
                    </svg>
                </span>
                <span className="hos-control-text">
                    <span id="hos-glass-label" className="hos-control-title">
                        Reduce transparency
                    </span>
                    <span className="hos-control-sub">Solid windows, menus and Dock</span>
                </span>
                <button
                    ref={switchRef}
                    type="button"
                    role="switch"
                    aria-checked={solid}
                    aria-labelledby="hos-glass-label"
                    className="hos-switch"
                    onClick={() => setGlassPref(!solid)}
                >
                    <span className="hos-switch-knob" />
                </button>
            </div>
        </motion.div>
    );
}
