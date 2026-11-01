"use client";

import Wallpaper from "@/features/wallpaper/Wallpaper";
import Character from "@/features/character/Character";
import { useOs } from "@/lib/os";

/** STUB: replaced by the phone shell lane. Must render inside <OsProvider>. */
export default function PhoneShell() {
    const { url } = useOs();
    return (
        <>
            <Wallpaper shell="phone" />
            <Character shell="phone" />
            <p style={{ position: "relative", color: "#fff", padding: 24 }}>Phone shell — open: {url.open.join(", ") || "none"}</p>
        </>
    );
}
