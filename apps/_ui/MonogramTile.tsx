"use client";

import { IconTile, type TileFinish } from "../icons";

/** A dimensional tile carrying one letter: the fallback mark for companies and products. */
export function MonogramTile({ letter, size, finish = "blue" }: { letter: string; size: number; finish?: TileFinish }) {
    const ink = finish === "porcelain" ? "#1463F3" : "#FFFFFF";
    return (
        <IconTile size={size} finish={finish}>
            {() => (
                <text
                    x="50"
                    y="66.5"
                    textAnchor="middle"
                    fontSize="47"
                    fontWeight="700"
                    fill={ink}
                    letterSpacing="-1"
                    fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
                >
                    {letter.slice(0, 1).toUpperCase()}
                </text>
            )}
        </IconTile>
    );
}
