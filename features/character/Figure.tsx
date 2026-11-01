"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { Pose } from "./machine";
import s from "./figure.module.css";

/**
 * Placeholder mini-Hidash: flat shapes, soft shading, ~4.4 heads tall.
 * Navy crew-neck over a white tee, stone chinos, white sneakers, black rectangular glasses.
 * The final art is a Rive file (see rive.ts); this SVG stays as the static / fallback pose.
 */

const C = {
    skin: "#A86B4C",
    skinShadow: "#8A5238",
    hair: "#1C1714",
    hairSheen: "#3A2D27",
    beard: "#231A16",
    lip: "#7A4433",
    mouth: "#3A1D16",
    frame: "#0E0E10",
    eye: "#1A1210",
    sweater: "#1F2A44",
    sweaterShade: "#161E35",
    sweaterEdge: "#121929",
    rib: "#2C3A5E",
    tee: "#F1F1EC",
    chino: "#B3A488",
    chinoShade: "#978A70",
    shoe: "#ECEDF0",
    sole: "#C9CCD3",
} as const;

/** Tight box around the full figure (hair top ≈ 9.4, soles ≈ 171). */
const FULL_BOX = { x: 0, y: 8, w: 100, h: 165 };
/** Head-and-shoulders crop for the 48px Bug Hunt badge. */
const BUST_BOX = { x: 24, y: 7, w: 52, h: 52 };

const pivot = (x: number, y: number): CSSProperties => ({ transformOrigin: `${x}px ${y}px` });

const SHOULDER_L = { x: 33.8, y: 58.4 };
const ELBOW_L = { x: 31.2, y: 81.5 };
const SHOULDER_R = { x: 66.2, y: 58.4 };
const ELBOW_R = { x: 68.8, y: 81.5 };

function Arm({ side }: { side: "L" | "R" }) {
    const shoulder = side === "L" ? SHOULDER_L : SHOULDER_R;
    const elbow = side === "L" ? ELBOW_L : ELBOW_R;
    const wristX = side === "L" ? 31.6 : 68.4;
    const upper = `M${shoulder.x} ${shoulder.y} L${elbow.x} ${elbow.y}`;
    const fore = `M${elbow.x} ${elbow.y} L${wristX} 101.6`;
    return (
        <g className={`${s.part} ${side === "L" ? s.armL : s.armR}`} style={pivot(shoulder.x, shoulder.y)}>
            <path d={upper} stroke={C.sweaterEdge} strokeWidth={8.6} strokeLinecap="round" />
            <path d={upper} stroke={C.sweater} strokeWidth={7.4} strokeLinecap="round" />
            <g className={`${s.part} ${side === "L" ? s.foreL : s.foreR}`} style={pivot(elbow.x, elbow.y)}>
                <path d={fore} stroke={C.sweaterEdge} strokeWidth={8} strokeLinecap="round" />
                <path d={fore} stroke={C.sweater} strokeWidth={6.8} strokeLinecap="round" />
                {/* ribbed cuff */}
                <path d={`M${wristX - 0.05} 98.6 L${wristX} 101.4`} stroke={C.sweaterShade} strokeWidth={7} strokeLinecap="round" />
                <circle cx={wristX + (side === "L" ? 0.1 : -0.1)} cy={105} r={3.3} fill={C.skin} />
                <path
                    d={side === "L" ? `M${wristX + 1.6} 103 a3.3 3.3 0 0 1 -0.2 4.6` : `M${wristX - 1.6} 103 a3.3 3.3 0 0 0 0.2 4.6`}
                    stroke={C.skinShadow}
                    strokeWidth={1}
                    fill="none"
                    opacity={0.7}
                />
            </g>
        </g>
    );
}

function Leg({ side }: { side: "L" | "R" }) {
    const left = side === "L";
    return (
        <g className={`${s.part} ${left ? s.legL : s.legR}`} style={pivot(left ? 43 : 57, 99)}>
            <path
                d={left ? "M36.4 98 L50.4 98 L49.6 118 L47.6 164.6 L38.4 164.6 L37.4 128 Z" : "M49.6 98 L63.6 98 L62.6 128 L61.6 164.6 L52.4 164.6 L50.4 118 Z"}
                fill={C.chino}
            />
            <path
                d={left ? "M46.6 100 L50.4 98 L49.6 118 L47.6 164.6 L45.8 164.6 L47.4 118 Z" : "M60.2 100 L63.6 98 L62.6 128 L61.6 164.6 L59.6 164.6 L60.8 128 Z"}
                fill={C.chinoShade}
                opacity={0.8}
            />
            <path
                d={
                    left
                        ? "M38 163.6 L47.8 163.6 Q49 163.8 48.9 165.6 L48.8 169 Q48.6 170.8 46.8 170.8 L35.6 170.8 Q33.8 170.8 34.2 169 Q35 165.4 38 163.6 Z"
                        : "M62 163.6 L52.2 163.6 Q51 163.8 51.1 165.6 L51.2 169 Q51.4 170.8 53.2 170.8 L64.4 170.8 Q66.2 170.8 65.8 169 Q65 165.4 62 163.6 Z"
                }
                fill={C.shoe}
            />
            <rect x={left ? 34.2 : 51.2} y={169.3} width={14.6} height={1.5} rx={0.7} fill={C.sole} />
        </g>
    );
}

function Eyes({ pose }: { pose: Pose }) {
    if (pose === "sleep") {
        return (
            <g stroke={C.eye} strokeWidth={0.9} fill="none" strokeLinecap="round">
                <path d="M43.6 29.4 Q44.9 30.6 46.2 29.4" />
                <path d="M53.8 29.4 Q55.1 30.6 56.4 29.4" />
            </g>
        );
    }
    if (pose === "celebrate") {
        return (
            <g stroke={C.eye} strokeWidth={0.95} fill="none" strokeLinecap="round">
                <path d="M43.6 29.9 Q44.9 28.3 46.2 29.9" />
                <path d="M53.8 29.9 Q55.1 28.3 56.4 29.9" />
            </g>
        );
    }
    const r = pose === "panic" ? 1.35 : 1.05;
    return (
        <g className={`${s.part} ${s.eyes}`} style={pivot(50, 29.3)}>
            <ellipse cx={44.9} cy={29.3} rx={r} ry={r * 1.22} fill={C.eye} />
            <ellipse cx={55.1} cy={29.3} rx={r} ry={r * 1.22} fill={C.eye} />
            <circle cx={45.3} cy={28.8} r={0.35} fill="#fff" opacity={0.85} />
            <circle cx={55.5} cy={28.8} r={0.35} fill="#fff" opacity={0.85} />
        </g>
    );
}

function Mouth({ pose }: { pose: Pose }) {
    switch (pose) {
        case "wave":
            return (
                <g>
                    <path d="M46.6 41.5 Q50 45.6 53.4 41.5 Z" fill={C.mouth} />
                    <path d="M47.4 41.7 L52.6 41.7 Q50 43 47.4 41.7 Z" fill="#F4EFEA" />
                </g>
            );
        case "celebrate":
            return (
                <g>
                    <path d="M46 41.2 Q50 47.2 54 41.2 Z" fill={C.mouth} />
                    <path d="M46.9 41.4 L53.1 41.4 Q50 43.1 46.9 41.4 Z" fill="#F4EFEA" />
                </g>
            );
        case "panic":
            return <ellipse cx={50} cy={42.7} rx={1.5} ry={1.9} fill={C.mouth} />;
        case "sleep":
            return <path d="M47.6 42.6 Q50 43.3 52.4 42.6" stroke={C.lip} strokeWidth={0.9} fill="none" strokeLinecap="round" />;
        default:
            return <path d="M47 41.9 Q50 44.2 53 41.9 Q50 42.9 47 41.9 Z" fill={C.lip} />;
    }
}

function Head({ pose }: { pose: Pose }) {
    const lens = pose === "type" ? "rgba(156,194,255,0.28)" : "rgba(255,255,255,0.07)";
    return (
        <g className={`${s.part} ${s.head}`} style={pivot(50, 47)}>
            {/* ears */}
            <ellipse cx={38.8} cy={31} rx={1.9} ry={2.9} fill={C.skinShadow} />
            <ellipse cx={61.2} cy={31} rx={1.9} ry={2.9} fill={C.skinShadow} />
            {/* face */}
            <path d="M39.2 27 C39.2 19.6 44 15.6 50 15.6 C56 15.6 60.8 19.6 60.8 27 L60.8 32.4 C60.8 39.8 56 45.8 50 45.8 C44 45.8 39.2 39.8 39.2 32.4 Z" fill={C.skin} />
            {/* soft shading: right cheek, under the fringe */}
            <path d="M57.4 18.6 C60 21 60.9 24.6 60.8 30 C60.6 37 58.2 42 54.6 44.8 C57.6 39.6 58.8 32 57.4 18.6 Z" fill={C.skinShadow} opacity={0.5} />
            <path d="M40 23.6 C43 25.2 47.6 24.8 50.6 22.6 C53.2 24.6 56.6 25 59.4 23.6 L59.6 25.2 C56.6 26.4 53.2 26 50.6 24.2 C47.6 26.2 43 26.6 40 25.2 Z" fill={C.skinShadow} opacity={0.4} />
            {/* nose */}
            <path d="M50.6 31 Q51.5 34.6 49.6 35.2" stroke={C.skinShadow} strokeWidth={0.9} fill="none" strokeLinecap="round" />
            {/* short beard + moustache */}
            <path
                d="M39.3 30.6 C39.4 38.6 43.4 46.6 50 47.2 C56.6 46.6 60.6 38.6 60.7 30.6 L59.9 30.6 C59.6 35.8 57.8 39.2 55.2 40.2 C53.6 38.6 51.8 38.1 50 38.3 C48.2 38.1 46.4 38.6 44.8 40.2 C42.2 39.2 40.4 35.8 40.1 30.6 Z"
                fill={C.beard}
            />
            <Mouth pose={pose} />
            <Eyes pose={pose} />
            {/* brows */}
            <g className={`${s.part} ${s.brows}`} stroke={C.hair} strokeWidth={1.35} fill="none" strokeLinecap="round">
                <path d="M41.6 24.9 Q44.9 23.4 48.2 24.5" />
                <path d="M51.8 24.5 Q55.1 23.4 58.4 24.9" />
            </g>
            {/* dark wavy hair, swept fringe */}
            <path
                d="M39.4 31.4 C38.2 29.6 37.4 27.2 37.3 24.4 C36.6 17.6 39.6 12.2 44.6 10.6 C46.4 9.4 48.6 9.4 50.2 9.9 C51.8 8.7 54.6 8.8 56.4 10.2 C59.8 10.8 62.6 13.6 63 18 C63.4 21.6 63.2 25.4 62.6 28.2 C62.2 29.6 61.4 30.6 60.6 31.4 L60.4 27.4 C60 24.6 59.4 22.8 58.2 21.6 C56.4 22.8 53.6 22.6 51.6 20.8 C49.6 22.6 46.2 23 43.6 21.6 C42.2 22.4 41 23.6 40.2 25.6 L39.6 31.4 Z"
                fill={C.hair}
            />
            <g stroke={C.hairSheen} strokeWidth={0.9} fill="none" strokeLinecap="round">
                <path d="M42 14.8 Q46.6 12.2 51.4 13.4" />
                <path d="M52.8 14.9 Q57.2 13.6 60.2 16.9" />
                <path d="M40.2 19.4 Q42.4 17 45.4 17.4" />
            </g>
            {/* black rectangular glasses: the defining feature */}
            <g className={`${s.part} ${s.glasses}`}>
                <rect x={40.8} y={26.4} width={8.2} height={5.2} rx={1.3} fill={lens} stroke={C.frame} strokeWidth={1.5} />
                <rect x={51} y={26.4} width={8.2} height={5.2} rx={1.3} fill={lens} stroke={C.frame} strokeWidth={1.5} />
                <path d="M49 28.2 L51 28.2" stroke={C.frame} strokeWidth={1.2} />
                <path d="M40.8 27.8 L38.9 28.6 M59.2 27.8 L61.1 28.6" stroke={C.frame} strokeWidth={1.1} strokeLinecap="round" />
                <path d="M46.6 27.5 L47.8 27.5 M56.8 27.5 L58 27.5" stroke="#fff" strokeWidth={0.6} opacity={0.35} strokeLinecap="round" />
            </g>
            {pose === "panic" && <path className={s.sweat} d="M63.4 17.6 Q66.2 22.2 63.4 24 Q60.6 22.2 63.4 17.6 Z" fill="#9CC2FF" stroke="#EAF2FF" strokeWidth={0.4} />}
        </g>
    );
}

export interface FigureProps {
    pose: Pose;
    /** Height of the drawn figure in CSS px. */
    height: number;
    walking?: boolean;
    /** Head-and-shoulders crop (Bug Hunt badge). */
    bust?: boolean;
    /** Static pose: no blink, no loops (CSS also honours prefers-reduced-motion). */
    reduced?: boolean;
}

/** Blinks at a random 4–7s cadence. */
function useBlink(enabled: boolean) {
    const [blink, setBlink] = useState(false);
    useEffect(() => {
        if (!enabled) return;
        let timer: ReturnType<typeof setTimeout>;
        const schedule = () => {
            timer = setTimeout(() => {
                setBlink(true);
                timer = setTimeout(() => {
                    setBlink(false);
                    schedule();
                }, 130);
            }, 4000 + Math.random() * 3000);
        };
        schedule();
        return () => clearTimeout(timer);
    }, [enabled]);
    return enabled && blink;
}

export default function Figure({ pose, height, walking = false, bust = false, reduced = false }: FigureProps) {
    const blink = useBlink(!reduced && pose !== "sleep" && pose !== "celebrate");
    const box = bust ? BUST_BOX : FULL_BOX;
    const width = (height * box.w) / box.h;

    return (
        <svg
            className={s.svg}
            data-state={pose}
            data-walking={walking ? "true" : undefined}
            data-blink={blink ? "true" : undefined}
            width={width}
            height={height}
            viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
            aria-hidden="true"
            focusable="false"
        >
            {!bust && <ellipse cx={50} cy={171.4} rx={17} ry={2.2} fill="#000" opacity={0.32} />}
            <g className={`${s.part} ${s.figure}`}>
                <Leg side="L" />
                <Leg side="R" />
                <g className={`${s.part} ${s.body}`}>
                    {/* neck */}
                    <rect x={46.4} y={41} width={7.2} height={12} rx={2} fill={C.skinShadow} />
                    {/* navy crew-neck sweater */}
                    <path
                        d="M38 53.6 C42 52.4 46 52 50 52 C54 52 58 52.4 62 53.6 C65.6 54.8 67.4 56.6 67.6 60 L65.8 97.2 Q65.6 99.6 63.2 99.6 L36.8 99.6 Q34.4 99.6 34.2 97.2 L32.4 60 C32.6 56.6 34.4 54.8 38 53.6 Z"
                        fill={C.sweater}
                    />
                    <path d="M60.5 54 C64.6 55.2 67.2 57 67.5 60.5 L65.7 97 Q65.5 99 63.4 99.4 L60.8 99.4 C62.2 84 62.6 68 60.5 54 Z" fill={C.sweaterShade} opacity={0.75} />
                    <rect x={34.3} y={95} width={31.4} height={4.6} rx={2} fill={C.sweaterShade} />
                    {/* white tee collar + ribbed neckline */}
                    <path d="M44.2 52.4 Q50 57.8 55.8 52.4 Q50 55 44.2 52.4 Z" fill={C.tee} />
                    <path d="M43.4 52.3 Q50 59.2 56.6 52.3" stroke={C.rib} strokeWidth={1.5} fill="none" strokeLinecap="round" />
                    {pose === "type" && (
                        <g>
                            <rect x={36.5} y={85} width={27} height={12.6} rx={1.4} fill="#C9CDD6" />
                            <rect x={36.5} y={85} width={27} height={1.2} rx={0.6} fill="#E4E7ED" />
                            <circle cx={50} cy={91.2} r={1.5} fill="#4C8DFF" opacity={0.9} />
                            <rect x={34.6} y={97.2} width={30.8} height={1.8} rx={0.9} fill="#A9AEB9" />
                        </g>
                    )}
                    <Arm side="L" />
                    <Arm side="R" />
                    <Head pose={pose} />
                </g>
            </g>
            {pose === "sleep" && (
                <g fill="#CFE0FF" fontFamily="ui-rounded, system-ui, sans-serif" fontWeight={700}>
                    <text className={s.z} x={65} y={20} fontSize={5.5}>
                        z
                    </text>
                    <text className={s.z} x={70} y={13} fontSize={7}>
                        z
                    </text>
                    <text className={s.z} x={76} y={5.5} fontSize={8.5}>
                        z
                    </text>
                </g>
            )}
        </svg>
    );
}
