import { os } from "@/lib/os";
import { track } from "./index";

type Bus = Pick<typeof os, "on" | "lifecycle">;

/** Bridges the OS bus to analytics. Reads the sticky lifecycle first so a boot that already ended is not missed. */
export function startOsAnalytics(bus: Bus = os, send: typeof track = track): () => void {
    const life = bus.lifecycle();
    if (life.booted) send("boot_complete", { skipped: life.bootSkipped });
    const offs = [
        ...(life.booted ? [] : [bus.on("boot:end", ({ skipped }) => send("boot_complete", { skipped }))]),
        bus.on("app:open", ({ app, item }) => send("app_open", { app, item })),
        bus.on("game:start", () => send("game_start")),
        bus.on("game:end", ({ score, activeMs }) => send("game_end", { score, active_ms: activeMs })),
        bus.on("share:click", ({ channel }) => send("share_click", { channel })),
        bus.on("share:complete", ({ channel }) => send("share_complete", { channel })),
    ];
    return () => offs.forEach((off) => off());
}
