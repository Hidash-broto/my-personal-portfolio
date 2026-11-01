"use client";

import Wallpaper from "@/features/wallpaper/Wallpaper";
import Character from "@/features/character/Character";
import { useOs } from "@/lib/os";

/** STUB: replaced by the desktop shell lane. Must render inside <OsProvider>. */
export default function DesktopShell() {
    const { url } = useOs();
    return (
        <>
            <Wallpaper shell="desktop" />
            <Character shell="desktop" />
            <p style={{ position: "relative", color: "#fff", padding: 24 }}>Desktop shell — open: {url.open.join(", ") || "none"}</p>
        </>
    );
}
