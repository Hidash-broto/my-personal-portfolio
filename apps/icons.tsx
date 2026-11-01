"use client";

import { useId, type ReactNode } from "react";
import type { IconKey } from "./registry";

/**
 * Hidash OS icon family, Direction D "Monsoon Blue".
 *
 * Every icon is the same physical object: a squircle tile lit from above. Layers, back to front:
 * gradient body → top sheen → bottom shade → inner rim (bright on top, dark at the foot) → glyph
 * (with a tiny drop shadow). A soft outer shadow is applied with a CSS filter so it follows the
 * squircle exactly and never takes layout space.
 *
 * All drawing happens in a 100×100 box. Pure inline SVG, decorative (aria-hidden).
 */

/* ---------- squircle (continuous corners, radius 22.5%, 60% smoothing) ---------- */

function squirclePath(size: number, radius: number, smoothing: number): string {
    const rad = (deg: number) => (deg * Math.PI) / 180;
    const p = (1 + smoothing) * radius;
    const arcMeasure = 90 * (1 - smoothing);
    const arc = Math.sin(rad(arcMeasure / 2)) * radius * Math.SQRT2;
    const alpha = (90 - arcMeasure) / 2;
    const p3p4 = radius * Math.tan(rad(alpha / 2));
    const beta = 45 * smoothing;
    const c = p3p4 * Math.cos(rad(beta));
    const d = c * Math.tan(rad(beta));
    const b = (p - arc - c - d) / 3;
    const a = 2 * b;
    const n = (v: number) => Number(v.toFixed(3));
    const [A, AB, ABC, C, D, ARC, BC] = [a, a + b, a + b + c, c, d, arc, b + c].map(n);
    const R = n(radius);
    const s = n(size);
    const P = n(p);
    return [
        `M${n(s - P)} 0`,
        `c${A} 0 ${AB} 0 ${ABC} ${D}`,
        `a${R} ${R} 0 0 1 ${ARC} ${ARC}`,
        `c${D} ${C} ${D} ${BC} ${D} ${ABC}`,
        `L${s} ${n(s - P)}`,
        `c0 ${A} 0 ${AB} ${-D} ${ABC}`,
        `a${R} ${R} 0 0 1 ${-ARC} ${ARC}`,
        `c${-C} ${D} ${-BC} ${D} ${-ABC} ${D}`,
        `L${P} ${s}`,
        `c${-A} 0 ${-AB} 0 ${-ABC} ${-D}`,
        `a${R} ${R} 0 0 1 ${-ARC} ${-ARC}`,
        `c${-D} ${-C} ${-D} ${-BC} ${-D} ${-ABC}`,
        `L0 ${P}`,
        `c0 ${-A} 0 ${-AB} ${D} ${-ABC}`,
        `a${R} ${R} 0 0 1 ${ARC} ${-ARC}`,
        `c${C} ${-D} ${BC} ${-D} ${ABC} ${-D}`,
        "Z",
    ].join(" ");
}

/** The tile outline in a 100×100 box. */
export const SQUIRCLE_PATH = squirclePath(100, 22.5, 0.6);

/* ---------- finishes ---------- */

export type TileFinish = "sky" | "blue" | "deep" | "royal" | "graphite" | "porcelain" | "turmeric";

interface Finish {
    body: [string, string, string];
    sheen: number;
    shade: number;
    rimTop: number;
    rimFoot: string;
    glyphShadow: string;
    glyphShadowOpacity: number;
}

const FINISHES: Record<TileFinish, Finish> = {
    sky: { body: ["#8DBBFF", "#4C8DFF", "#1463F3"], sheen: 0.3, shade: 0.16, rimTop: 0.65, rimFoot: "rgba(4,30,110,0.35)", glyphShadow: "#06297A", glyphShadowOpacity: 0.35 },
    blue: { body: ["#5B9BFF", "#1F6CF5", "#0B4FD6"], sheen: 0.26, shade: 0.18, rimTop: 0.55, rimFoot: "rgba(3,22,85,0.4)", glyphShadow: "#031A5C", glyphShadowOpacity: 0.38 },
    royal: { body: ["#3D86FF", "#1463F3", "#083FB0"], sheen: 0.24, shade: 0.2, rimTop: 0.5, rimFoot: "rgba(2,16,64,0.45)", glyphShadow: "#021447", glyphShadowOpacity: 0.4 },
    deep: { body: ["#2A63D6", "#0E3C9E", "#061A4D"], sheen: 0.2, shade: 0.22, rimTop: 0.42, rimFoot: "rgba(0,6,24,0.55)", glyphShadow: "#000820", glyphShadowOpacity: 0.45 },
    graphite: { body: ["#4A5268", "#2A3040", "#171A24"], sheen: 0.16, shade: 0.24, rimTop: 0.32, rimFoot: "rgba(0,0,0,0.55)", glyphShadow: "#000000", glyphShadowOpacity: 0.5 },
    porcelain: { body: ["#FFFFFF", "#F1F5FB", "#D6E0F0"], sheen: 0.5, shade: 0.1, rimTop: 0.95, rimFoot: "rgba(30,52,100,0.22)", glyphShadow: "#0B2A70", glyphShadowOpacity: 0.18 },
    turmeric: { body: ["#FFDD7A", "#FFC933", "#E6A000"], sheen: 0.32, shade: 0.16, rimTop: 0.7, rimFoot: "rgba(110,62,0,0.4)", glyphShadow: "#5C3A00", glyphShadowOpacity: 0.3 },
};

/** Gradient/filter ids are unique per tile, so the same icon can render many times on one page. */
function useTileId(): string {
    return "hos" + useId().replace(/[^a-zA-Z0-9]/g, "");
}

export interface IconTileProps {
    size: number;
    finish: TileFinish;
    /** Glyph drawn in the 100×100 box. Receives a unique id prefix for its own gradients. */
    children: (uid: string) => ReactNode;
    className?: string;
}

/** A dimensional squircle tile. AppIcon is built on it; app views reuse it for product and company marks. */
export function IconTile({ size, finish, children, className }: IconTileProps) {
    const uid = useTileId();
    const f = FINISHES[finish];
    const id = (k: string) => `${uid}-${k}`;
    const lift = Math.max(0.5, size * 0.035);
    const blur = Math.max(1, size * 0.07);
    const contact = Math.max(0.5, size * 0.012);
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            className={className}
            width={size}
            height={size}
            viewBox="0 0 100 100"
            style={{
                display: "block",
                flex: "none",
                overflow: "visible",
                filter: `drop-shadow(0 ${contact}px ${contact}px rgba(2,10,35,0.22)) drop-shadow(0 ${lift}px ${blur}px rgba(2,12,40,0.28))`,
            }}
        >
            <defs>
                <clipPath id={id("clip")}>
                    <path d={SQUIRCLE_PATH} />
                </clipPath>
                <linearGradient id={id("body")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={f.body[0]} />
                    <stop offset="0.55" stopColor={f.body[1]} />
                    <stop offset="1" stopColor={f.body[2]} />
                </linearGradient>
                <radialGradient id={id("sheen")} cx="0.5" cy="-0.05" r="0.75" fx="0.5" fy="-0.05">
                    <stop offset="0" stopColor="#FFFFFF" stopOpacity={f.sheen} />
                    <stop offset="0.6" stopColor="#FFFFFF" stopOpacity={f.sheen * 0.25} />
                    <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                </radialGradient>
                <linearGradient id={id("shade")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0.5" stopColor="#000814" stopOpacity="0" />
                    <stop offset="1" stopColor="#000814" stopOpacity={f.shade} />
                </linearGradient>
                <linearGradient id={id("rim")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#FFFFFF" stopOpacity={f.rimTop} />
                    <stop offset="0.22" stopColor="#FFFFFF" stopOpacity="0" />
                    <stop offset="0.8" stopColor="#FFFFFF" stopOpacity="0" />
                    <stop offset="1" stopColor={f.rimFoot} />
                </linearGradient>
                <filter id={id("glyph")} x="-20%" y="-20%" width="140%" height="150%" colorInterpolationFilters="sRGB">
                    <feDropShadow dx="0" dy="1.4" stdDeviation="1.1" floodColor={f.glyphShadow} floodOpacity={f.glyphShadowOpacity} />
                </filter>
            </defs>
            <g clipPath={`url(#${id("clip")})`}>
                <rect width="100" height="100" fill={`url(#${id("body")})`} />
                <rect width="100" height="100" fill={`url(#${id("sheen")})`} />
                <g filter={`url(#${id("glyph")})`}>{children(uid)}</g>
                <rect width="100" height="100" fill={`url(#${id("shade")})`} />
                {/* Inner rim: a stroke twice as wide as the visible edge, clipped to the inside. */}
                <path d={SQUIRCLE_PATH} fill="none" stroke={`url(#${id("rim")})`} strokeWidth="3" />
            </g>
        </svg>
    );
}

/* ---------- glyphs (100×100 box) ---------- */

function JourneyGlyph(uid: string) {
    return (
        <>
            <defs>
                <linearGradient id={`${uid}-road`} x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.75" />
                    <stop offset="1" stopColor="#FFFFFF" />
                </linearGradient>
            </defs>
            <path
                d="M25 74 C 41 74 38 52 51 52 S 62 30 75 29"
                fill="none"
                stroke={`url(#${uid}-road)`}
                strokeWidth="6.5"
                strokeLinecap="round"
            />
            <circle cx="25" cy="74" r="6.5" fill="#FFFFFF" />
            <circle cx="51" cy="52" r="3.6" fill="#0B4FD6" stroke="#FFFFFF" strokeWidth="2.6" />
            <circle cx="75" cy="29" r="9" fill="#FFFFFF" />
            <circle cx="75" cy="29" r="3.8" fill="#1463F3" />
        </>
    );
}

function slab(top: number, face: [string, string], left: string, right: string, key: string) {
    const k = 6;
    return (
        <g key={key}>
            <path d={`M24 ${top + 13} L50 ${top + 26} L50 ${top + 26 + k} L24 ${top + 13 + k} Z`} fill={left} />
            <path d={`M50 ${top + 26} L76 ${top + 13} L76 ${top + 13 + k} L50 ${top + 26 + k} Z`} fill={right} />
            <path d={`M50 ${top} L76 ${top + 13} L50 ${top + 26} L24 ${top + 13} Z`} fill={face[0]} />
            <path d={`M50 ${top} L76 ${top + 13} L50 ${top + 26} L24 ${top + 13} Z`} fill={face[1]} />
        </g>
    );
}

function BuildsGlyph(uid: string) {
    return (
        <>
            <defs>
                <linearGradient id={`${uid}-top`} x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0" stopColor="#D6E6FF" />
                    <stop offset="1" stopColor="#6FA7FF" />
                </linearGradient>
                <linearGradient id={`${uid}-glint`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
                    <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
            </defs>
            {slab(48, ["#0B4FD6", "transparent"], "#062C7A", "#083A9E", "a")}
            {slab(35, ["#1463F3", "transparent"], "#0A3C99", "#0E4FC4", "b")}
            {slab(22, [`url(#${uid}-top)`, `url(#${uid}-glint)`], "#2A63C8", "#3A7BEA", "c")}
        </>
    );
}

function AboutGlyph(uid: string) {
    return (
        <>
            <defs>
                <linearGradient id={`${uid}-card`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#4C8DFF" />
                    <stop offset="1" stopColor="#0B4FD6" />
                </linearGradient>
            </defs>
            <rect x="20" y="27" width="60" height="46" rx="8" fill={`url(#${uid}-card)`} />
            <rect x="20.8" y="27.8" width="58.4" height="44.4" rx="7.4" fill="none" stroke="#FFFFFF" strokeOpacity="0.28" strokeWidth="1.2" />
            <circle cx="36" cy="45" r="6.2" fill="#FFFFFF" />
            <path d="M25.5 63 C 27 56 31 53.5 36 53.5 S 45 56 46.5 63 Z" fill="#FFFFFF" />
            <rect x="52" y="41" width="20" height="4.4" rx="2.2" fill="#FFFFFF" />
            <rect x="52" y="51" width="15" height="4.4" rx="2.2" fill="#FFFFFF" fillOpacity="0.7" />
        </>
    );
}

function BeliefsGlyph(uid: string) {
    return (
        <>
            <defs>
                <linearGradient id={`${uid}-north`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#FFFFFF" />
                    <stop offset="1" stopColor="#D6E6FF" />
                </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="27" fill="#FFFFFF" fillOpacity="0.08" stroke="#FFFFFF" strokeWidth="3.6" />
            <g stroke="#FFFFFF" strokeOpacity="0.75" strokeWidth="3" strokeLinecap="round">
                <path d="M50 27.5v5M50 67.5v5M27.5 50h5M67.5 50h5" />
            </g>
            <g transform="rotate(40 50 50)">
                <path d="M50 29 L57 50 L43 50 Z" fill={`url(#${uid}-north)`} />
                <path d="M43 50 L57 50 L50 71 Z" fill="#9CC2FF" />
            </g>
            <circle cx="50" cy="50" r="3.4" fill="#0B4FD6" stroke="#FFFFFF" strokeWidth="2" />
        </>
    );
}

function NotesGlyph(uid: string) {
    return (
        <>
            <defs>
                <linearGradient id={`${uid}-band`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#5B9BFF" />
                    <stop offset="1" stopColor="#1463F3" />
                </linearGradient>
                <linearGradient id={`${uid}-lip`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#0B2A70" stopOpacity="0.22" />
                    <stop offset="1" stopColor="#0B2A70" stopOpacity="0" />
                </linearGradient>
            </defs>
            <rect x="0" y="0" width="100" height="28" fill={`url(#${uid}-band)`} />
            <rect x="0" y="28" width="100" height="5" fill={`url(#${uid}-lip)`} />
            <g fill="#FFFFFF" fillOpacity="0.55">
                {[20, 30, 40, 50, 60, 70, 80].map((x) => (
                    <circle key={x} cx={x} cy="23" r="1.3" />
                ))}
            </g>
            <rect x="22" y="43" width="42" height="5" rx="2.5" fill="#3D4458" />
            <rect x="22" y="56" width="56" height="3.6" rx="1.8" fill="#BCC9DE" />
            <rect x="22" y="67" width="56" height="3.6" rx="1.8" fill="#BCC9DE" />
            <rect x="22" y="78" width="34" height="3.6" rx="1.8" fill="#BCC9DE" />
        </>
    );
}

const BUBBLE_PATH =
    "M32 24 H68 A12 12 0 0 1 80 36 V56 A12 12 0 0 1 68 68 H47 L35.5 77.5 A2 2 0 0 1 32.3 76 V68 H32 A12 12 0 0 1 20 56 V36 A12 12 0 0 1 32 24 Z";

function SayHiGlyph(uid: string) {
    return (
        <>
            <defs>
                <linearGradient id={`${uid}-bubble`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#FFFFFF" />
                    <stop offset="1" stopColor="#DCE8FF" />
                </linearGradient>
            </defs>
            <path d={BUBBLE_PATH} fill={`url(#${uid}-bubble)`} />
            <g fill="#1463F3">
                <circle cx="38" cy="46" r="4.4" />
                <circle cx="50" cy="46" r="4.4" fillOpacity="0.75" />
                <circle cx="62" cy="46" r="4.4" fillOpacity="0.5" />
            </g>
        </>
    );
}

function BugHuntGlyph(uid: string) {
    return (
        <>
            <defs>
                <linearGradient id={`${uid}-shell`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#4A3610" />
                    <stop offset="1" stopColor="#140D02" />
                </linearGradient>
            </defs>
            <g stroke="#1F1503" strokeWidth="3.4" strokeLinecap="round" fill="none">
                <path d="M45.5 29 C 43 23 39 20 34 18.5" />
                <path d="M54.5 29 C 57 23 61 20 66 18.5" />
                <path d="M36 47 L26 41.5" />
                <path d="M35 57 L23.5 57.5" />
                <path d="M37 67 L27 74" />
                <path d="M64 47 L74 41.5" />
                <path d="M65 57 L76.5 57.5" />
                <path d="M63 67 L73 74" />
            </g>
            <ellipse cx="50" cy="33" rx="8.5" ry="6.5" fill="#1A1203" />
            <ellipse cx="50" cy="57" rx="16.5" ry="20" fill={`url(#${uid}-shell)`} />
            <path d="M33.8 47.5 Q50 39 66.2 47.5" fill="none" stroke="#FFD15C" strokeOpacity="0.35" strokeWidth="1.6" />
            <path d="M50 46 V76.5" stroke="#FFD15C" strokeOpacity="0.35" strokeWidth="1.6" />
            <ellipse cx="42.5" cy="56" rx="3.6" ry="8" fill="#FFFFFF" fillOpacity="0.22" />
        </>
    );
}

function LinkedInGlyph(uid: string) {
    return (
        <>
            <defs>
                <linearGradient id={`${uid}-ink`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#FFFFFF" />
                    <stop offset="1" stopColor="#E3EDFF" />
                </linearGradient>
            </defs>
            <g fill={`url(#${uid}-ink)`}>
                <circle cx="31.5" cy="29.5" r="6.6" />
                <rect x="26" y="41" width="11" height="34" rx="1.8" />
                <path d="M44 41 H54.6 V45.8 C57.4 42.6 61.4 40.4 66.6 40.4 C74.6 40.4 78.4 45.8 78.4 55 V75 H67.4 V57.8 C67.4 53 65.6 50.4 61.9 50.4 C57.7 50.4 55 53.4 55 58.4 V75 H44 Z" />
            </g>
        </>
    );
}

const ICONS: Record<IconKey, { finish: TileFinish; glyph: (uid: string) => ReactNode }> = {
    journey: { finish: "sky", glyph: JourneyGlyph },
    builds: { finish: "graphite", glyph: BuildsGlyph },
    about: { finish: "porcelain", glyph: AboutGlyph },
    beliefs: { finish: "deep", glyph: BeliefsGlyph },
    notes: { finish: "porcelain", glyph: NotesGlyph },
    sayhi: { finish: "blue", glyph: SayHiGlyph },
    bughunt: { finish: "turmeric", glyph: BugHuntGlyph },
    linkedin: { finish: "royal", glyph: LinkedInGlyph },
};

/**
 * Contract: a square squircle of `size` px, no outer margin, decorative (aria-hidden).
 * The soft drop shadow paints outside the box but takes no layout space.
 */
export function AppIcon({ icon, size, className }: { icon: IconKey; size: number; className?: string }) {
    const spec = ICONS[icon];
    return (
        <IconTile size={size} finish={spec.finish} className={className}>
            {spec.glyph}
        </IconTile>
    );
}
