import { useId } from "react";
import styles from "./bug-hunt.module.css";

/** Glossy turmeric beetle, head up. The shell carries the bug's mark from data/bugs.ts. */
export default function Beetle({ mark, size = 40, crawl = false }: { mark: string; size?: number; crawl?: boolean }) {
    const raw = useId();
    const id = `bh${raw.replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const glyphs = Array.from(mark).length;
    const fontSize = glyphs <= 2 ? 6.4 : glyphs <= 3 ? 5.2 : 4.4;

    return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className={styles.beetle} data-crawl={crawl ? "1" : undefined}>
            <defs>
                <radialGradient id={`${id}s`} cx="0.34" cy="0.26" r="0.86">
                    <stop offset="0" stopColor="#FFF3C4" />
                    <stop offset="0.22" stopColor="#FFD45E" />
                    <stop offset="0.55" stopColor="#F2B705" />
                    <stop offset="0.86" stopColor="#B07600" />
                    <stop offset="1" stopColor="#6E4A00" />
                </radialGradient>
                <linearGradient id={`${id}h`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#2A3146" />
                    <stop offset="1" stopColor="#05070D" />
                </linearGradient>
                <filter id={`${id}b`} x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="1.7" />
                </filter>
            </defs>
            <ellipse cx="20.5" cy="25.5" rx="11.5" ry="13" fill="#000" opacity="0.34" filter={`url(#${id}b)`} />
            <g stroke="#0B0F1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <g className={styles.legsA}>
                    <path d="M12.5 17 L8 14.5 L5.5 10.5" />
                    <path d="M28 23 L33 23.5 L36 26" />
                    <path d="M13 30 L8.5 32.5 L6.5 36" />
                </g>
                <g className={styles.legsB}>
                    <path d="M27.5 17 L32 14.5 L34.5 10.5" />
                    <path d="M12 23 L7 23.5 L4 26" />
                    <path d="M27 30 L31.5 32.5 L33.5 36" />
                </g>
                <path d="M18 6.5 Q16 3 12.5 2.2" strokeWidth="1.1" />
                <path d="M22 6.5 Q24 3 27.5 2.2" strokeWidth="1.1" />
            </g>
            <ellipse cx="20" cy="8.6" rx="4.8" ry="4" fill={`url(#${id}h)`} />
            <ellipse cx="18.6" cy="7.3" rx="1.6" ry="0.9" fill="#fff" opacity="0.35" />
            <ellipse cx="20" cy="13.4" rx="7.4" ry="3.9" fill={`url(#${id}h)`} />
            <path d="M15 12.3 Q20 10.2 25 12.3" stroke="#fff" strokeOpacity="0.22" strokeWidth="0.8" fill="none" strokeLinecap="round" />
            <ellipse cx="20" cy="24.6" rx="10.6" ry="12.6" fill={`url(#${id}s)`} stroke="#5C3D00" strokeOpacity="0.55" strokeWidth="0.6" />
            <path d="M20 13 L20 37" stroke="#6B4700" strokeOpacity="0.7" strokeWidth="0.8" />
            <ellipse cx="15.2" cy="19.2" rx="2.4" ry="5" fill="#fff" opacity="0.5" transform="rotate(-14 15.2 19.2)" />
            <circle cx="25.6" cy="17.4" r="1.1" fill="#fff" opacity="0.55" />
            <text
                x="20"
                y="28.6"
                textAnchor="middle"
                fontSize={fontSize}
                fontWeight={800}
                fill="#3A2600"
                fillOpacity="0.82"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                letterSpacing={glyphs > 3 ? -0.2 : 0}
            >
                {mark}
            </text>
        </svg>
    );
}
