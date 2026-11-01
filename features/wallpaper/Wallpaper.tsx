"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import { PLACEHOLDERS } from "./placeholders";
import "./wallpaper.css";
import "./faux-glass.css";

export type WallpaperShell = "phone" | "desktop";

/** Public URL of a generated wallpaper asset (see scripts/wallpaper.mjs). */
export function wallpaperSrc(theme: "dark" | "light", shell: WallpaperShell, ext: "avif" | "webp", blur = false): string {
    return `/wallpaper/${theme}-${shell}${blur ? "-blur" : ""}.${ext}`;
}

const DARK = "(prefers-color-scheme: dark)";

/**
 * Monsoon Blue wallpaper. Fixed, full screen, decorative.
 *
 * - One <picture> whose <source>s are keyed by `prefers-color-scheme` and format, so the browser
 *   downloads exactly one file (dark or light, AVIF or WebP) with `fetchpriority="high"`.
 * - Until it decodes, the box paints the variant's average colour and a ~32px inline placeholder
 *   (both chosen in CSS by the same media query), so there's no flash and no layout shift.
 * - `onReady` fires once the full image is decoded: the boot's "wallpaper decoded" ready signal.
 *   The root also gets `data-ready` for anything that would rather query the DOM.
 */
export default function Wallpaper({ shell, onReady }: { shell: WallpaperShell; onReady?: () => void }) {
    const [ready, setReady] = useState(false);
    const fired = useRef(false);

    const markReady = useCallback(
        (img: HTMLImageElement) => {
            if (fired.current) return;
            fired.current = true;
            const done = () => {
                setReady(true);
                onReady?.();
                // Boot listens for this ("wallpaper decoded" ready signal).
                document.documentElement.dataset.wallpaperReady = "1";
                window.dispatchEvent(new Event("hos:wallpaper-ready"));
            };
            // decode() resolves once the pixels are ready to paint; fall back to load for old engines.
            if (typeof img.decode === "function") img.decode().then(done, done);
            else done();
        },
        [onReady],
    );

    // A cached image can finish before React attaches onLoad, so also check on mount.
    const imgRef = useCallback(
        (img: HTMLImageElement | null) => {
            if (img && img.complete && img.naturalWidth > 0) markReady(img);
        },
        [markReady],
    );

    const dark = PLACEHOLDERS[`dark-${shell}`];
    const light = PLACEHOLDERS[`light-${shell}`];
    const style = {
        "--hos-wp-ph-dark": `url("${dark.src}")`,
        "--hos-wp-ph-light": `url("${light.src}")`,
        "--hos-wp-color-dark": dark.color,
        "--hos-wp-color-light": light.color,
    } as CSSProperties;

    return (
        <div className="hos-wallpaper" aria-hidden="true" data-shell={shell} data-ready={ready ? "" : undefined} style={style}>
            <picture>
                <source media={DARK} type="image/avif" srcSet={wallpaperSrc("dark", shell, "avif")} />
                <source media={DARK} type="image/webp" srcSet={wallpaperSrc("dark", shell, "webp")} />
                <source type="image/avif" srcSet={wallpaperSrc("light", shell, "avif")} />
                {/* next/image can't art-direct by colour scheme; this is a plain decorative <picture>. */}
                <img
                    ref={imgRef}
                    className="hos-wallpaper__img"
                    src={wallpaperSrc("light", shell, "webp")}
                    alt=""
                    width={shell === "desktop" ? 2560 : 1290}
                    height={shell === "desktop" ? 1600 : 2796}
                    fetchPriority="high"
                    decoding="async"
                    draggable={false}
                    onLoad={(event) => markReady(event.currentTarget)}
                />
            </picture>
        </div>
    );
}
