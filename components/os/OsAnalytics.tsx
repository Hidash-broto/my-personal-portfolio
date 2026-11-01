"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { startOsAnalytics } from "@/lib/analytics/os";
import { parseOsUrl } from "@/lib/os";

/** Mount once per page that runs the OS bus (home and the standalone /bug-hunt). */
export default function OsAnalytics() {
    useEffect(() => {
        // Apps opened by the landing URL (a shared or deep link) never pass through a launch action.
        if (window.location.pathname === "/") {
            const { open, focus, item } = parseOsUrl(window.location.search);
            for (const app of open) track("app_open", { app, item: app === focus ? item : null, landing: true });
        }
        return startOsAnalytics();
    }, []);
    return null;
}
