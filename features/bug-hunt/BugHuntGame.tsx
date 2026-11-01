"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState, useSyncExternalStore, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { BUGS } from "@/data/bugs";
import type { ShellKind, SpawnKind } from "@/lib/os";
import Beetle from "./Beetle";
import { readBest, recordScore, subscribeBest } from "./best";
import type { RoundResult } from "./engine";
import { isTierA } from "./rain";
import Recap, { LessonList, type ShareState } from "./Recap";
import RoundLayer, { type EndReason } from "./RoundLayer";
import { fetchNonce, requestShareToken, withTimeout } from "./share";
import styles from "./bug-hunt.module.css";

export const DESKTOP_SPAWN: readonly SpawnKind[] = ["window", "icon", "widget"];
export const PHONE_SPAWN: readonly SpawnKind[] = ["icon", "widget"];

export interface BugHuntGameProps {
    shell: ShellKind;
    challenge: number | null;
    /** Start a round straight away (share-link "Beat N"). Read on first render only. */
    autoStart?: boolean;
    /** Runs as each round mounts, before the OS locks (desktop: open windows to crawl out of). */
    onBeforeRound?: () => void;
    /** Runs when the recap closes. */
    onAfterRound?: () => void;
    /** A popstate ended the round; restore whatever entry the host needs. */
    onPopDuringRound?: () => void;
    /** In-app navigation for proof links. Return true when handled (the overlay then closes). */
    navigate?: (href: string) => boolean;
    /** Standalone page: push a history entry per round so back ends the round, not the visit. */
    pushHistoryEntry?: boolean;
}

type Phase = "start" | "lessons" | "round" | "recap";

const subscribeNothing = () => () => {};
const onClient = () => true;
const onServer = () => false;
const readMotionPref = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const subscribeMotionPref = (callback: () => void) => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    query.addEventListener("change", callback);
    return () => query.removeEventListener("change", callback);
};
const readBestSnapshot = () => readBest();
const noBest = () => null;

let tierCache: boolean | null = null;
function deviceTierA(): boolean {
    if (tierCache === null) tierCache = isTierA();
    return tierCache;
}

interface Finished {
    result: RoundResult;
    best: number;
    isNewBest: boolean;
    endedEarly: boolean;
}

/** Start card, lessons, the round overlay (portal over the live OS) and the recap. */
export default function BugHuntGame({
    shell,
    challenge,
    autoStart = false,
    onBeforeRound,
    onAfterRound,
    onPopDuringRound,
    navigate,
    pushHistoryEntry = false,
}: BugHuntGameProps) {
    const [phase, setPhase] = useState<Phase>(autoStart ? "round" : "start");
    const [roundKey, setRoundKey] = useState(0);
    const [finished, setFinished] = useState<Finished | null>(null);
    const [share, setShare] = useState<ShareState>({ status: "pending" });
    const [tierA, setTierA] = useState(false);
    const nonce = useRef<Promise<string | null> | null>(null);
    const roundId = useRef(0);

    const client = useSyncExternalStore(subscribeNothing, onClient, onServer);
    const reducedMotion = useSyncExternalStore(subscribeMotionPref, readMotionPref, onServer);
    const best = useSyncExternalStore(subscribeBest, readBestSnapshot, noBest);

    const startRound = useCallback(() => {
        setTierA(deviceTierA());
        setFinished(null);
        setShare({ status: "pending" });
        setRoundKey((k) => k + 1);
        setPhase("round");
    }, []);

    const onBegin = useCallback(() => {
        roundId.current += 1;
        setTierA(deviceTierA());
        onBeforeRound?.();
        nonce.current = fetchNonce();
    }, [onBeforeRound]);

    const sign = useCallback(async (result: RoundResult) => {
        const id = roundId.current;
        setShare({ status: "pending" });
        const n = await withTimeout(nonce.current ?? Promise.resolve(null), 6000, null);
        const outcome = await requestShareToken(n, result);
        if (roundId.current === id) setShare(outcome);
    }, []);

    const onEnd = useCallback((result: RoundResult, via: EndReason) => {
        if (result.activeMs === 0 && via !== "popstate") {
            // Cancelled during the countdown: back to the start card, no recap.
            setPhase("start");
            onAfterRound?.();
            return;
        }
        const { best: newBest, isNew } = recordScore(result.score);
        setFinished({ result, best: newBest, isNewBest: isNew, endedEarly: via !== "time" });
        setPhase("recap");
        void sign(result);
    }, [onAfterRound, sign]);

    const closeRecap = useCallback(() => {
        setPhase("start");
        onAfterRound?.();
    }, [onAfterRound]);

    const onProof = useCallback((href: string, event: MouseEvent<HTMLAnchorElement>) => {
        if (navigate?.(href)) {
            event.preventDefault();
            setPhase("start");
        }
    }, [navigate]);

    const overlayOpen = phase === "round" || phase === "recap";
    const spawnKinds = shell === "phone" ? PHONE_SPAWN : DESKTOP_SPAWN;

    const overlay = (
        <AnimatePresence>
            {overlayOpen && (
                <motion.div
                    key="bughunt-overlay"
                    className={`${styles.scope} ${styles.overlay}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.28 } }}
                    transition={{ duration: 0.25 }}
                >
                    <AnimatePresence>
                        {phase === "round" && (
                            <motion.div key={`round-${roundKey}`} className={styles.roundLayer} exit={{ opacity: 0, transition: { duration: 0.25 } }}>
                                <RoundLayer
                                    shell={shell}
                                    challenge={challenge}
                                    reducedMotion={reducedMotion}
                                    tierA={tierA}
                                    spawnKinds={spawnKinds}
                                    onBegin={onBegin}
                                    onEnd={onEnd}
                                    pushHistoryEntry={pushHistoryEntry}
                                    onPopState={onPopDuringRound}
                                />
                            </motion.div>
                        )}
                        {phase === "recap" && finished && (
                            <motion.div key={`recap-${roundKey}`} className={styles.roundLayer} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className={styles.scrim} onClick={closeRecap} aria-hidden="true" />
                                <motion.div
                                    className={`${styles.sheetWrap} ${shell === "phone" ? styles.sheetPhone : ""}`}
                                    initial={reducedMotion ? { opacity: 0 } : shell === "phone" ? { y: "100%" } : { opacity: 0, y: 24, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={reducedMotion ? { opacity: 0 } : shell === "phone" ? { y: "100%" } : { opacity: 0, y: 12, scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 380, damping: 34, mass: 0.9 }}
                                >
                                    <Recap
                                        shell={shell}
                                        result={finished.result}
                                        best={finished.best}
                                        isNewBest={finished.isNewBest}
                                        challenge={challenge}
                                        endedEarly={finished.endedEarly}
                                        share={share}
                                        onRetry={() => void sign(finished.result)}
                                        onPlayAgain={startRound}
                                        onClose={closeRecap}
                                        onProof={onProof}
                                    />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );

    const verb = shell === "phone" ? "Tap" : "Click";

    return (
        <div className={styles.scope} style={{ height: "100%" }}>
            {phase === "lessons" ? (
                <div className={styles.lessonsPanel}>
                    <div className={styles.lessonsHead}>
                        <h2 className={styles.lessonsTitle}>The lessons</h2>
                        <button type="button" className={styles.textLink} onClick={() => setPhase("start")}>
                            Back
                        </button>
                    </div>
                    <p className={styles.subtitle} style={{ maxWidth: "none" }}>
                        Each bug is a shortcut that quietly sinks startups. Here is how I keep each one out of production.
                    </p>
                    <LessonList bugs={BUGS} onProof={onProof} />
                    <div className={styles.lessonsActions}>
                        <button type="button" className={styles.play} onClick={startRound}>
                            Play · 60s
                        </button>
                    </div>
                </div>
            ) : (
                <div className={styles.start}>
                    <div className={styles.hero}>
                        <div className={styles.heroBug} aria-hidden="true">
                            <Beetle mark="//" size={76} />
                        </div>
                        <h2 className={styles.title}>Bug Hunt</h2>
                        <p className={styles.subtitle}>Shortcuts are crawling out of the OS. Catch as many as you can in 60 seconds.</p>
                    </div>
                    {challenge !== null && (
                        <span className={styles.challenge}>
                            <span className={styles.challengeDot} aria-hidden="true" />
                            Challenge: beat {challenge}
                        </span>
                    )}
                    <div className={styles.bestRow}>
                        <div className={styles.bestCol}>
                            <span className={styles.label}>Today&apos;s best</span>
                            <span className={`${styles.bestNum} ${best === null ? styles.bestNone : ""}`}>{best ?? "—"}</span>
                        </div>
                        <button type="button" className={styles.play} onClick={startRound} disabled={phase !== "start"}>
                            Play · 60s
                        </button>
                    </div>
                    <div className={styles.startLinks}>
                        <button type="button" className={styles.textLink} onClick={() => setPhase("lessons")}>
                            Read the lessons
                        </button>
                        <p className={styles.hint}>
                            {verb} a bug to catch it{shell === "desktop" ? " · Tab and Enter work too · Esc ends the round" : ""}
                        </p>
                    </div>
                </div>
            )}
            {client && createPortal(overlay, document.body)}
        </div>
    );
}
