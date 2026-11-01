"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Suspense, useEffect, useRef } from "react";
import type { WindowAppId } from "@/apps/registry";
import { APP_VIEWS } from "@/apps/views";
import s from "./phone.module.css";

const CARD_SPRING = { type: "spring", stiffness: 380, damping: 32, mass: 0.9 } as const;

/**
 * Bug Hunt on the phone is not a full-screen app: the round plays over the live home
 * screen, so the game view sits in a centred glass card (the second live-blur surface).
 */
export default function BugHuntCard({
    item,
    onClose,
    openItem,
    openApp,
    hidden = false,
}: {
    item: string | null;
    onClose: () => void;
    openItem: (item: string | null) => void;
    openApp: (app: WindowAppId, item?: string | null) => void;
    /** A round is playing over the home screen: fade out, stay mounted (the view owns the round). */
    hidden?: boolean;
}) {
    const reduced = useReducedMotion() ?? false;
    const cardRef = useRef<HTMLElement>(null);
    const View = APP_VIEWS.bughunt;

    useEffect(() => {
        cardRef.current?.focus({ preventScroll: true });
    }, []);

    // Escape closes the card, except mid-round, where Escape belongs to the game (it ends the round).
    useEffect(() => {
        if (hidden) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose, hidden]);

    return (
        <>
            <motion.div
                className={s.cardScrim}
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={hidden ? { opacity: 0, transitionEnd: { visibility: "hidden" } } : { opacity: 1, visibility: "visible" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
            />
            <div className={s.cardLayer}>
                <motion.section
                    ref={cardRef}
                    tabIndex={-1}
                    className={s.card}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="phone-bughunt-title"
                    data-phone-surface="card"
                    data-app="bughunt"
                    initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.86, y: 28 }}
                    aria-hidden={hidden || undefined}
                    style={{ pointerEvents: hidden ? "none" : "auto" }}
                    animate={
                        hidden
                            ? { opacity: 0, scale: reduced ? 1 : 0.94, y: 0, transitionEnd: { visibility: "hidden" } }
                            : { opacity: 1, scale: 1, y: 0, visibility: "visible" }
                    }
                    exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 16 }}
                    transition={{ default: CARD_SPRING, opacity: { duration: 0.2 } }}
                >
                    <header className={s.cardHeader}>
                        <h2 id="phone-bughunt-title" className={s.cardTitle}>
                            <span className={s.bugDot} aria-hidden="true" />
                            Bug Hunt
                        </h2>
                        <button type="button" className={s.cardClose} onClick={onClose} aria-label="Close Bug Hunt">
                            <span className={s.cardCloseGlyph} aria-hidden="true">
                                <svg width="12" height="12" viewBox="0 0 12 12">
                                    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </span>
                        </button>
                    </header>
                    <div className={s.cardBody}>
                        <Suspense fallback={<div className={s.loading} aria-hidden="true" />}>
                            <View shell="phone" item={item} openItem={openItem} close={onClose} openApp={openApp} />
                        </Suspense>
                    </div>
                </motion.section>
            </div>
        </>
    );
}
