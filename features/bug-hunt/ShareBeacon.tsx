"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** The share page runs outside the OS (no bus): it reports its view and CTA clicks to analytics directly. */
export default function ShareBeacon({ valid, score }: { valid: boolean; score: number | null }) {
    useEffect(() => {
        track("share_page_view", { valid, score });
        const onClick = (e: MouseEvent) => {
            if ((e.target as Element | null)?.closest("[data-share-cta]")) track("share_cta_click", { valid, score });
        };
        document.addEventListener("click", onClick, true);
        return () => document.removeEventListener("click", onClick, true);
    }, [valid, score]);
    return null;
}
