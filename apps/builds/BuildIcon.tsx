"use client";

import type { ReactNode } from "react";
import type { Build } from "@/data/builds";
import { IconTile, type TileFinish } from "../icons";
import { MonogramTile } from "../_ui/MonogramTile";

/** Gear outline in the 100×100 box, computed once. */
const GEAR_PATH = (() => {
    const teeth = 8;
    const cx = 50;
    const cy = 50;
    const outer = 28;
    const inner = 21.5;
    const pts: string[] = [];
    for (let i = 0; i < teeth; i++) {
        const a = (i / teeth) * Math.PI * 2;
        const step = (Math.PI * 2) / teeth;
        const angles: [number, number][] = [
            [a - step * 0.3, inner],
            [a - step * 0.17, outer],
            [a + step * 0.17, outer],
            [a + step * 0.3, inner],
        ];
        for (const [ang, r] of angles) pts.push(`${(cx + r * Math.sin(ang)).toFixed(2)} ${(cy - r * Math.cos(ang)).toFixed(2)}`);
    }
    return `M${pts.join(" L")} Z`;
})();

const GLYPHS: Record<string, { finish: TileFinish; glyph: (uid: string) => ReactNode }> = {
    "whatsapp-crm": {
        finish: "blue",
        glyph: (uid) => (
            <>
                <defs>
                    <linearGradient id={`${uid}-b`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#FFFFFF" />
                        <stop offset="1" stopColor="#DCE8FF" />
                    </linearGradient>
                </defs>
                <path
                    d="M32 23 H68 A12 12 0 0 1 80 35 V56 A12 12 0 0 1 68 68 H46 L34.5 77.5 A2 2 0 0 1 31.3 76 V68 H32 A12 12 0 0 1 20 56 V35 A12 12 0 0 1 32 23 Z"
                    fill={`url(#${uid}-b)`}
                />
                <path d="M38 46 L46.5 54 L63 38" fill="none" stroke="#1463F3" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
            </>
        ),
    },
    "saas-suite": {
        finish: "deep",
        glyph: () => (
            <>
                <rect x="22" y="22" width="25" height="25" rx="7" fill="#FFFFFF" />
                <rect x="53" y="22" width="25" height="25" rx="7" fill="#FFFFFF" fillOpacity="0.55" />
                <rect x="22" y="53" width="25" height="25" rx="7" fill="#FFFFFF" fillOpacity="0.55" />
                <rect x="53" y="53" width="25" height="25" rx="7" fill="#9CC2FF" />
            </>
        ),
    },
    "software-factory": {
        finish: "graphite",
        glyph: (uid) => (
            <>
                <defs>
                    <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#BFD8FF" />
                        <stop offset="1" stopColor="#4C8DFF" />
                    </linearGradient>
                </defs>
                <path d={GEAR_PATH} fill={`url(#${uid}-g)`} />
                <circle cx="50" cy="50" r="9" fill="#232838" />
                <circle cx="50" cy="50" r="9" fill="none" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="1.2" />
            </>
        ),
    },
    agentview: {
        finish: "porcelain",
        glyph: () => (
            <>
                <circle cx="50" cy="52" r="26" fill="#FFFFFF" stroke="#1463F3" strokeWidth="6" />
                <path d="M50 38 V52 L60 59" fill="none" stroke="#0B1E50" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M30 26 L24 32 M70 26 L76 32" stroke="#1463F3" strokeWidth="5.5" strokeLinecap="round" />
                <circle cx="50" cy="52" r="3" fill="#1463F3" />
            </>
        ),
    },
    "ship-from-phone": {
        finish: "sky",
        glyph: () => (
            <>
                <path d="M20 48 L80 24 L64 78 L50 58 Z" fill="#FFFFFF" />
                <path d="M50 58 L80 24 L47 54 Z" fill="#C9DCFF" />
                <path d="M50 58 L47 54 L44 70 Z" fill="#9CC2FF" />
            </>
        ),
    },
    "hiverr-ai": {
        finish: "graphite",
        glyph: (uid) => (
            <>
                <defs>
                    <linearGradient id={`${uid}-s`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#D6E6FF" />
                        <stop offset="1" stopColor="#4C8DFF" />
                    </linearGradient>
                </defs>
                <path d="M46 22 C48 40 56 48 74 50 C56 52 48 60 46 78 C44 60 36 52 18 50 C36 48 44 40 46 22 Z" fill={`url(#${uid}-s)`} />
                <path d="M72 20 C72.8 26 75 28.2 81 29 C75 29.8 72.8 32 72 38 C71.2 32 69 29.8 63 29 C69 28.2 71.2 26 72 20 Z" fill="#FFFFFF" />
            </>
        ),
    },
    hiverr: {
        finish: "porcelain",
        glyph: (uid) => (
            <>
                <defs>
                    <linearGradient id={`${uid}-c`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#4C8DFF" />
                        <stop offset="1" stopColor="#0B4FD6" />
                    </linearGradient>
                </defs>
                <path d="M39 36 V31 A5 5 0 0 1 44 26 H56 A5 5 0 0 1 61 31 V36" fill="none" stroke="#3D4458" strokeWidth="5" />
                <rect x="20" y="35" width="60" height="40" rx="9" fill={`url(#${uid}-c)`} />
                <rect x="20" y="50" width="60" height="3" fill="#FFFFFF" fillOpacity="0.35" />
                <rect x="45" y="46" width="10" height="11" rx="2.5" fill="#FFFFFF" />
            </>
        ),
    },
    foodbia: {
        finish: "deep",
        glyph: () => (
            <>
                <g fill="none" stroke="#FFFFFF" strokeOpacity="0.75" strokeWidth="4" strokeLinecap="round">
                    <path d="M40 40 C36 35 44 32 40 24" />
                    <path d="M50 40 C46 35 54 32 50 24" />
                    <path d="M60 40 C56 35 64 32 60 24" />
                </g>
                <path d="M20 48 H80 C80 64 67 76 50 76 C33 76 20 64 20 48 Z" fill="#FFFFFF" />
                <path d="M20 48 H80" stroke="#9CC2FF" strokeWidth="4" strokeLinecap="round" />
            </>
        ),
    },
};

/** The product mark for a build. Unknown ids get a monogram tile, so new data never breaks the view. */
export function BuildIcon({ build, size }: { build: Build; size: number }) {
    const spec = GLYPHS[build.id];
    if (!spec) return <MonogramTile letter={build.name} size={size} />;
    return (
        <IconTile size={size} finish={spec.finish}>
            {spec.glyph}
        </IconTile>
    );
}
