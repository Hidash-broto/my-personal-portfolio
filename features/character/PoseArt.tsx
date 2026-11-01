"use client";

import { useEffect } from "react";
import type { Pose } from "./machine";
import { POSE_SIZES } from "./pose-sizes";
import s from "./pose-art.module.css";

/**
 * Mini-Hidash from the approved character art (scripts/character.mjs → public/character/*).
 * Same contract as <Figure/>. Still images per pose; the motion (breathing, wave wobble,
 * celebrate bounce, walk bob, panic shake, sleep droop) is CSS on top, dropped under reduced motion.
 *
 * The art has five drawings; sleep and panic reuse idle and type with their own motion.
 */
type Art = keyof typeof POSE_SIZES;
const ART: Record<Pose, Art> = { idle: "idle", wave: "wave", point: "point", type: "type", celebrate: "celebrate", sleep: "idle", panic: "type" };
/** Every full-body drawing shares one box (the widest), feet on the floor, so pose swaps never shift layout. */
const FULL_ASPECT = Math.max(...(["idle", "wave", "point", "type", "celebrate"] as const).map((a) => POSE_SIZES[a].w / POSE_SIZES[a].h));

const src = (art: Art, ext: "avif" | "webp") => `/character/${art}.${ext}`;

let preloaded = false;
function preloadAll() {
    if (preloaded || typeof window === "undefined") return;
    preloaded = true;
    for (const art of ["idle", "wave", "point", "type", "celebrate"] as Art[]) {
        const img = new Image();
        img.decoding = "async";
        img.src = src(art, "webp");
    }
}

export interface PoseArtProps {
    pose: Pose;
    height: number;
    walking?: boolean;
    bust?: boolean;
    reduced?: boolean;
    onError?: () => void;
}

export default function PoseArt({ pose, height, walking = false, bust = false, reduced = false, onError }: PoseArtProps) {
    useEffect(preloadAll, []);
    const art: Art = bust ? "head" : ART[pose];
    const width = bust ? height : Math.round(height * FULL_ASPECT);
    const size = POSE_SIZES[art];
    const imgW = Math.round((height * size.w) / size.h);

    return (
        <span
            className={s.box}
            style={{ width, height }}
            data-state={pose}
            data-walking={walking ? "true" : undefined}
            data-bust={bust ? "true" : undefined}
            data-reduced={reduced ? "true" : undefined}
            aria-hidden="true"
        >
            {!bust && <span className={s.shadow} />}
            <span className={s.motion}>
                <picture>
                    <source srcSet={src(art, "avif")} type="image/avif" />
                    <img
                        key={art}
                        className={s.img}
                        src={src(art, "webp")}
                        width={imgW}
                        height={height}
                        style={{ width: imgW, height }}
                        alt=""
                        draggable={false}
                        decoding="async"
                        onError={onError}
                    />
                </picture>
            </span>
            {pose === "sleep" && !bust && (
                <span className={s.zzz}>
                    <span>z</span>
                    <span>z</span>
                </span>
            )}
        </span>
    );
}
