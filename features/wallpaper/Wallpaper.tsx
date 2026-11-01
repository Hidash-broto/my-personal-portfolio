/** STUB: the visuals lane replaces this with the Monsoon Blue wallpaper (AVIF + pre-blurred companion). */
export default function Wallpaper({ shell }: { shell: "phone" | "desktop" }) {
    return (
        <div
            aria-hidden="true"
            data-shell={shell}
            style={{
                position: "fixed",
                inset: 0,
                background: "radial-gradient(120% 80% at 70% 20%, #0B3FB0 0%, #08215C 45%, #030A1E 100%)",
            }}
        />
    );
}
