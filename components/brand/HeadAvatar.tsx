/**
 * Mini-Hidash's head and shoulders on a monsoon-blue disc (art: scripts/character.mjs → public/character/head.*).
 * Replaces every "H" / "MH" placeholder. Server-safe (no hooks).
 *
 * - `size` set: a self-contained disc of that size (menu bar, monograms).
 * - `size` omitted: fills its parent, which keeps its own shape, ring and shadow (widget avatars).
 */
export default function HeadAvatar({ size, label, className }: { size?: number; label?: string; className?: string }) {
    return (
        <span
            className={["hos-head", size ? "hos-head-disc" : "", className ?? ""].filter(Boolean).join(" ")}
            style={size ? { width: size, height: size } : undefined}
            role={label ? "img" : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
        >
            <picture>
                <source srcSet="/character/head.avif" type="image/avif" />
                <img src="/character/head.webp" alt="" width={256} height={256} decoding="async" draggable={false} />
            </picture>
        </span>
    );
}
