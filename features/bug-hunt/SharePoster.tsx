import Link from "next/link";
import Beetle from "./Beetle";
import ShareBeacon from "./ShareBeacon";
import { challengeHref, type ShareCard } from "./server";
import styles from "./share-page.module.css";

/** The share page body. Valid token: the verified score and caught lessons. Invalid: the generic card. */
export default function SharePoster({ card }: { card: ShareCard }) {
    const lessons = card.valid ? card.bugs : card.bugs.slice(0, 3);
    return (
        <main className={styles.page}>
            <ShareBeacon valid={card.valid} score={card.valid ? card.score : null} />
            <article className={styles.poster}>
                <div className={styles.brand}>
                    <span className={styles.mono} aria-hidden="true">H</span>
                    Hidash OS · Bug Hunt
                </div>

                <div className={styles.hero}>
                    <span className={styles.heroBug} aria-hidden="true">
                        <Beetle mark="//" size={72} />
                    </span>
                    {card.valid ? (
                        <>
                            <h1 className={styles.headline}>I debugged Hidash OS</h1>
                            <span className={styles.score}>{card.score}</span>
                            <span className={styles.scoreLabel}>{card.score === 1 ? "bug caught in 60 seconds" : "bugs caught in 60 seconds"}</span>
                        </>
                    ) : (
                        <>
                            <h1 className={styles.headline}>Bug Hunt</h1>
                            <p className={styles.sub}>Shortcuts are crawling out of a portfolio OS. Catch as many as you can in 60 seconds.</p>
                        </>
                    )}
                </div>

                {lessons.length > 0 && (
                    <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <h2 className={styles.sectionTitle}>{card.valid ? "Lessons caught" : "What you will catch"}</h2>
                        <ul className={styles.list}>
                            {lessons.map((bug) => (
                                <li key={bug.id} className={styles.item}>
                                    <Beetle mark={bug.mark} size={36} />
                                    <span>
                                        <span className={styles.itemName}>{bug.name}</span>
                                        <span className={styles.itemLesson}>{bug.lesson}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <Link className={styles.cta} href={card.valid ? challengeHref(card.score) : "/?app=bughunt&item=play"} prefetch={false} data-share-cta>
                    {card.valid ? `Beat ${card.score} — Play Bug Hunt` : "Play Bug Hunt"}
                </Link>
            </article>
            <p className={styles.foot}>
                A portfolio OS by <Link href="/" prefetch={false}>Muhammed Hidash</Link> · hidash.in
            </p>
        </main>
    );
}
