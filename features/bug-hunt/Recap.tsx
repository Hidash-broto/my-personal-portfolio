"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { BUGS, type Bug, type BugId } from "@/data/bugs";
import { os, type ShellKind } from "@/lib/os";
import Beetle from "./Beetle";
import type { RoundResult } from "./engine";
import { copyText, linkedInShareUrl, shareText, shareUrl, type ShareSource, type TokenOutcome } from "./share";
import styles from "./bug-hunt.module.css";

export type ShareState = { status: "pending" } | TokenOutcome;

export type ProofHandler = (href: string, event: MouseEvent<HTMLAnchorElement>) => void;

export function LessonList({ bugs, counts, dim = false, onProof }: { bugs: readonly Bug[]; counts?: Partial<Record<BugId, number>>; dim?: boolean; onProof?: ProofHandler }) {
    return (
        <ul className={styles.lessonList}>
            {bugs.map((bug) => (
                <li key={bug.id} className={`${styles.lesson} ${dim ? styles.lessonDim : ""}`}>
                    <Beetle mark={bug.mark} size={40} />
                    <div className={styles.lessonBody}>
                        <span className={styles.lessonName}>
                            {bug.name}
                            {counts?.[bug.id] ? <span className={styles.lessonCount}>×{counts[bug.id]}</span> : null}
                        </span>
                        <span className={styles.lessonText}>{bug.lesson}</span>
                        {bug.proof && (
                            <a className={styles.proof} href={bug.proof.href} onClick={(event) => onProof?.(bug.proof!.href, event)}>
                                {bug.proof.label} →
                            </a>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
}

function ShareControls({ share, score, onRetry }: { share: ShareState; score: number; onRetry: () => void }) {
    const [copied, setCopied] = useState(false);
    const [nativeFailed, setNativeFailed] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const timer = setTimeout(() => setCopied(false), 2000);
        return () => clearTimeout(timer);
    }, [copied]);

    if (share.status === "pending") {
        return (
            <button type="button" className={styles.play} disabled>
                <span className={styles.spinner} aria-hidden="true" />
                Signing your score…
            </button>
        );
    }

    const token = share.status === "ready" ? share.token : null;
    const urlFor = (source: ShareSource) => shareUrl(window.location.origin, token, source);
    const text = shareText(score);
    const canNative = !nativeFailed && typeof navigator !== "undefined" && typeof navigator.share === "function";

    const shareNative = async () => {
        os.emit("share:click", { channel: "native" });
        try {
            await navigator.share({ title: "Bug Hunt — Hidash OS", text, url: urlFor("native-share") });
        } catch (error) {
            if ((error as { name?: string } | null)?.name !== "AbortError") setNativeFailed(true);
        }
    };

    const copy = async () => {
        os.emit("share:click", { channel: "copy" });
        setCopied(await copyText(urlFor("copy-link")));
    };

    return (
        <div className={styles.shareBox}>
            {canNative ? (
                <button type="button" className={styles.play} onClick={shareNative} data-autofocus>
                    Share score
                </button>
            ) : (
                <div className={styles.shareRow}>
                    <a
                        className={styles.play}
                        href={linkedInShareUrl(urlFor("linkedin"))}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => os.emit("share:click", { channel: "linkedin" })}
                        data-autofocus
                    >
                        Share on LinkedIn
                    </a>
                    <button type="button" className={styles.secondary} onClick={copy} aria-live="polite">
                        {copied ? "Link copied" : "Copy link"}
                    </button>
                </div>
            )}
            {share.status === "error" && (
                <p className={styles.shareNote}>
                    Couldn&apos;t sign your score, so this shares the game link.{" "}
                    <button type="button" className={styles.textLink} onClick={onRetry} style={{ minHeight: 0, padding: "0 2px" }}>
                        Retry
                    </button>
                </p>
            )}
            {(share.status === "unavailable" || share.status === "rejected") && (
                <p className={styles.shareNote}>This shares the game link. Score cards need a signed round.</p>
            )}
        </div>
    );
}

export interface RecapProps {
    shell: ShellKind;
    result: RoundResult;
    best: number;
    isNewBest: boolean;
    challenge: number | null;
    endedEarly: boolean;
    share: ShareState;
    onRetry: () => void;
    onPlayAgain: () => void;
    onClose: () => void;
    onProof?: ProofHandler;
}

/** End-of-round sheet: score, what was caught (with proof links), share, play again. */
export default function Recap({ shell, result, best, isNewBest, challenge, endedEarly, share, onRetry, onPlayAgain, onClose, onProof }: RecapProps) {
    const sheetRef = useRef<HTMLDivElement | null>(null);
    const caught = BUGS.filter((b) => result.caughtTypes.includes(b.id));
    const taps = result.score + result.misses;
    const accuracy = taps > 0 ? Math.round((result.score / taps) * 100) : null;
    const seconds = Math.round(result.activeMs / 1000);

    useEffect(() => {
        const sheet = sheetRef.current;
        if (!sheet) return;
        const first = sheet.querySelector<HTMLElement>("[data-autofocus]") ?? sheet.querySelector<HTMLElement>("button");
        first?.focus({ preventScroll: true });
    }, [share.status]);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    let challengeBadge: { text: string; accent: boolean } | null = null;
    if (challenge !== null) {
        if (result.score > challenge) challengeBadge = { text: `You beat ${challenge}`, accent: true };
        else if (result.score === challenge) challengeBadge = { text: `Tied ${challenge}`, accent: true };
        else challengeBadge = { text: `${challenge - result.score} short of ${challenge}`, accent: false };
    }

    return (
        <div ref={sheetRef} className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby="bh-recap-score">
            {shell === "phone" && <span className={styles.grabber} aria-hidden="true" />}
            <div className={styles.scoreBlock}>
                <span className={styles.eyebrow}>{endedEarly ? `Round ended · ${seconds}s played` : "Time! Round complete"}</span>
                <span id="bh-recap-score" className={styles.scoreNum} aria-label={`${result.score} ${result.score === 1 ? "bug" : "bugs"} caught`}>
                    {result.score}
                </span>
                <span className={styles.scoreLabel} aria-hidden="true">
                    {result.score === 1 ? "bug caught" : "bugs caught"}
                </span>
                <div className={styles.metaRow}>
                    {isNewBest ? (
                        <span className={`${styles.badge} ${styles.badgeAccent}`}>New best today</span>
                    ) : (
                        <span className={styles.badge}>Today&apos;s best {best}</span>
                    )}
                    {challengeBadge && <span className={`${styles.badge} ${challengeBadge.accent ? styles.badgeAccent : ""}`}>{challengeBadge.text}</span>}
                    {accuracy !== null && <span className={styles.badge}>{accuracy}% accuracy</span>}
                </div>
            </div>

            <ShareControls share={share} score={result.score} onRetry={onRetry} />

            <section className={styles.section} aria-label="Lessons">
                <h3 className={styles.sectionTitle}>{caught.length > 0 ? "What you caught" : "The bugs that got away"}</h3>
                <LessonList bugs={caught.length > 0 ? caught : BUGS} counts={result.counts} dim={caught.length === 0} onProof={onProof} />
            </section>

            <div className={styles.actions}>
                <button type="button" className={styles.secondary} onClick={onPlayAgain}>
                    Play again
                </button>
                <button type="button" className={styles.secondary} onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
}
