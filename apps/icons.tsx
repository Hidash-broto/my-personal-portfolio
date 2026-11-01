import type { IconKey } from "./registry";

/**
 * STUB: the apps lane replaces this with the dimensional Monsoon Blue icon family.
 * Contract: a square squircle of `size` px, no outer margin, decorative (aria-hidden).
 */
export function AppIcon({ icon, size }: { icon: IconKey; size: number }) {
    return (
        <span
            aria-hidden="true"
            style={{
                width: size,
                height: size,
                borderRadius: size * 0.23,
                background: icon === "bughunt" ? "linear-gradient(180deg,#FFD15C,#E6A000)" : "linear-gradient(180deg,#6FAAFF,#1463F3)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: size * 0.4,
            }}
        >
            {icon.slice(0, 1).toUpperCase()}
        </span>
    );
}
