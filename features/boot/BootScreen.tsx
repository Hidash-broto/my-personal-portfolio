"use client";

import { useEffect, useState } from "react";

const MIN_MS = 1200;
const MAX_MS = 2500;

/**
 * Classic full-screen Hidash OS boot (first visit only, decided in the design).
 * Ends after MIN_MS once `ready` is true, or at MAX_MS regardless.
 */
export default function BootScreen({ ready, onDone }: { ready: boolean; onDone: () => void }) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const start = performance.now();
        let raf = 0;
        const tick = () => {
            setElapsed(performance.now() - start);
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    const done = elapsed >= MAX_MS || (ready && elapsed >= MIN_MS);
    useEffect(() => {
        if (done) onDone();
    }, [done, onDone]);

    const progress = Math.min(1, ready ? elapsed / MIN_MS : elapsed / MAX_MS);

    return (
        <div
            role="status"
            aria-label="Hidash OS is starting"
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 10000,
                background: "#000",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 44,
            }}
        >
            <span
                aria-hidden="true"
                style={{
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    fontWeight: 700,
                    fontSize: 76,
                    letterSpacing: -2,
                    color: "#F5F7FF",
                    textShadow: "0 0 40px rgba(76,141,255,0.35)",
                }}
            >
                H
            </span>
            <span aria-hidden="true" style={{ width: 180, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.16)", overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", width: `${progress * 100}%`, background: "#F5F7FF", borderRadius: 2 }} />
            </span>
        </div>
    );
}
