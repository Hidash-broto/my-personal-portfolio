/** Open Graph card for Bug Hunt (next/og). Uses only verified numbers; no remote fonts or emoji. */
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

function OgBeetle({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 40 40">
            <defs>
                <radialGradient id="s" cx="0.34" cy="0.26" r="0.86">
                    <stop offset="0" stopColor="#FFF3C4" />
                    <stop offset="0.22" stopColor="#FFD45E" />
                    <stop offset="0.55" stopColor="#F2B705" />
                    <stop offset="0.86" stopColor="#B07600" />
                    <stop offset="1" stopColor="#6E4A00" />
                </radialGradient>
            </defs>
            <g stroke="#0B0F1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <path d="M12.5 17 L8 14.5 L5.5 10.5" />
                <path d="M28 23 L33 23.5 L36 26" />
                <path d="M13 30 L8.5 32.5 L6.5 36" />
                <path d="M27.5 17 L32 14.5 L34.5 10.5" />
                <path d="M12 23 L7 23.5 L4 26" />
                <path d="M27 30 L31.5 32.5 L33.5 36" />
                <path d="M18 6.5 Q16 3 12.5 2.2" strokeWidth="1.1" />
                <path d="M22 6.5 Q24 3 27.5 2.2" strokeWidth="1.1" />
            </g>
            <ellipse cx="20" cy="8.6" rx="4.8" ry="4" fill="#0E1322" />
            <ellipse cx="20" cy="13.4" rx="7.4" ry="3.9" fill="#0E1322" />
            <ellipse cx="20" cy="24.6" rx="10.6" ry="12.6" fill="url(#s)" />
            <path d="M20 13 L20 37" stroke="#6B4700" strokeOpacity="0.7" strokeWidth="0.8" />
            <ellipse cx="15.2" cy="19.2" rx="2.4" ry="5" fill="#fff" opacity="0.5" transform="rotate(-14 15.2 19.2)" />
            <circle cx="25.6" cy="17.4" r="1.1" fill="#fff" opacity="0.55" />
        </svg>
    );
}

/** score === null renders the generic card. */
export function bugHuntImage(score: number | null): ImageResponse {
    const noun = score === 1 ? "bug" : "bugs";
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    position: "relative",
                    color: "#F5F7FF",
                    backgroundColor: "#050E26",
                    backgroundImage:
                        "radial-gradient(circle at 82% 22%, rgba(20,99,243,0.75) 0%, rgba(11,63,176,0.35) 28%, rgba(5,14,38,0) 55%), radial-gradient(circle at 12% 100%, rgba(76,141,255,0.55) 0%, rgba(5,14,38,0) 45%), linear-gradient(160deg, #030A1E 0%, #08215C 60%, #041233 100%)",
                    padding: "64px 72px",
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                        <div
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: 14,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "linear-gradient(180deg, #4C8DFF, #0B4FD6)",
                                border: "1px solid rgba(255,255,255,0.25)",
                                fontSize: 30,
                                color: "#FFFFFF",
                                WebkitTextStroke: "1.5px #FFFFFF",
                            }}
                        >
                            H
                        </div>
                        <div style={{ display: "flex", fontSize: 28, color: "rgba(235,240,255,0.8)" }}>Hidash OS · Bug Hunt</div>
                    </div>

                    {score !== null ? (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", fontSize: 40, color: "rgba(245,247,255,0.92)" }}>I debugged Hidash OS</div>
                            <div style={{ display: "flex", alignItems: "flex-end", gap: 24 }}>
                                <div
                                    style={{
                                        display: "flex",
                                        fontSize: 250,
                                        lineHeight: 1,
                                        letterSpacing: -10,
                                        color: "#F2B705",
                                        WebkitTextStroke: "6px #F2B705",
                                    }}
                                >
                                    {String(score)}
                                </div>
                                <div style={{ display: "flex", fontSize: 54, paddingBottom: 34, color: "#F5F7FF", WebkitTextStroke: "1px #F5F7FF" }}>{noun}</div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div style={{ display: "flex", fontSize: 150, lineHeight: 1, letterSpacing: -5, color: "#F2B705", WebkitTextStroke: "4px #F2B705" }}>
                                Bug Hunt
                            </div>
                            <div style={{ display: "flex", fontSize: 40, color: "rgba(245,247,255,0.9)" }}>Catch the shortcuts that sink startups.</div>
                        </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 28 }}>
                        <div style={{ display: "flex", color: "rgba(235,240,255,0.75)" }}>
                            {score !== null ? `Beat ${score} in 60 seconds` : "60 seconds on a live portfolio OS"}
                        </div>
                        <div style={{ display: "flex", color: "#9CC2FF", WebkitTextStroke: "0.8px #9CC2FF" }}>hidash.in</div>
                    </div>
                </div>
                <div style={{ position: "absolute", right: 80, top: 150, display: "flex", transform: "rotate(18deg)" }}>
                    <OgBeetle size={300} />
                </div>
            </div>
        ),
        { ...OG_SIZE },
    );
}
