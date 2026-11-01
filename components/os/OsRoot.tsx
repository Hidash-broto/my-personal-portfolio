"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import BootScreen from "@/features/boot/BootScreen";
import { markSeen, os, OsProvider, readShell } from "@/lib/os";

const DesktopShell = dynamic(() => import("@/shells/desktop/DesktopShell"), { ssr: false });
const PhoneShell = dynamic(() => import("@/shells/phone/PhoneShell"), { ssr: false });

const never = () => () => {};
const onWallpaper = (cb: () => void) => {
    window.addEventListener("hos:wallpaper-ready", cb);
    return () => window.removeEventListener("hos:wallpaper-ready", cb);
};
const readWallpaper = () => document.documentElement.dataset.wallpaperReady === "1";
const readBoot = () => document.documentElement.dataset.boot === "on";
const readFirstVisit = () => document.documentElement.dataset.firstVisit === "1";

/** Picks the shell chosen by the inline <head> script, plays the boot once, and provides the OS context. */
export default function OsRoot() {
    const shell = useSyncExternalStore(never, readShell, () => null);
    const bootOn = useSyncExternalStore(never, readBoot, () => false);
    const wallpaperReady = useSyncExternalStore(onWallpaper, readWallpaper, () => false);
    const [bootDone, setBootDone] = useState(false);

    useEffect(() => {
        if (!shell) return;
        os.setFirstVisit(readFirstVisit());
        if (!bootOn) os.emit("boot:end", { skipped: new URLSearchParams(window.location.search).has("app") || new URLSearchParams(window.location.search).has("w") });
    }, [shell, bootOn]);

    const finishBoot = useCallback(() => {
        markSeen();
        setBootDone(true);
        os.emit("boot:end", { skipped: false });
    }, []);

    if (!shell) return null;

    return (
        <OsProvider shell={shell}>
            {shell === "phone" ? <PhoneShell /> : <DesktopShell />}
            {bootOn && !bootDone && <BootScreen ready={wallpaperReady} onDone={finishBoot} />}
        </OsProvider>
    );
}
