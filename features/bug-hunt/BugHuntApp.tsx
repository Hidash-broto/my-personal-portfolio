"use client";

import { useCallback } from "react";
import type { AppViewProps } from "@/apps/views";
import { parseOsUrl, useOs } from "@/lib/os";
import BugHuntGame from "./BugHuntGame";

/** Bug Hunt inside Hidash OS. The round itself plays in a portal above the whole OS. */
export default function BugHuntApp({ shell, item }: AppViewProps) {
    const { history, url } = useOs();

    // Desktop: give the bugs real windows to crawl out of.
    const beforeRound = useCallback(() => {
        if (shell !== "desktop") return;
        if (history.state().open.length >= 2) return;
        if (!history.state().open.includes("builds")) history.open("builds");
        if (!history.state().open.includes("journey")) history.open("journey");
    }, [history, shell]);

    const afterRound = useCallback(() => {
        if (history.state().open.includes("bughunt")) history.focus("bughunt");
    }, [history]);

    // Back mid-round ends the round into the recap; keep Bug Hunt open so the recap has its own entry.
    const onPop = useCallback(() => {
        if (!history.state().open.includes("bughunt")) history.open("bughunt");
    }, [history]);

    const navigate = useCallback(
        (href: string) => {
            if (!href.startsWith("/?")) return false;
            const target = parseOsUrl(href.slice(1));
            const app = target.open[0];
            if (!app) return false;
            history.open(app, target.item);
            return true;
        },
        [history],
    );

    return (
        <BugHuntGame
            shell={shell}
            challenge={url.challenge}
            autoStart={item === "play"}
            onBeforeRound={beforeRound}
            onAfterRound={afterRound}
            onPopDuringRound={onPop}
            navigate={navigate}
        />
    );
}
