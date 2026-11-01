/**
 * The single list of Hidash OS apps. The dock, phone grid, menus, Search and URL
 * parsing all derive from this list; never keep a second copy.
 */
import { LINKEDIN_URL } from "@/data/links";

export type IconKey =
    | "journey" | "builds" | "about" | "beliefs" | "notes" | "sayhi" | "bughunt" | "linkedin";

interface BaseManifest {
    id: string;
    name: string;
    icon: IconKey;
    /** Where the app sits on the phone home screen. */
    phone: "grid" | "dock";
    /** Shown in the desktop Dock. */
    desktopDock: boolean;
}

export interface WindowAppManifest extends BaseManifest {
    kind: "window";
    defaultSize: { w: number; h: number };
}

export interface ExternalAppManifest extends BaseManifest {
    kind: "external";
    href: string;
}

export type AppManifest = WindowAppManifest | ExternalAppManifest;

export const APPS = [
    { id: "journey", name: "Journey", icon: "journey", kind: "window", phone: "grid", desktopDock: true, defaultSize: { w: 760, h: 540 } },
    { id: "builds", name: "Builds", icon: "builds", kind: "window", phone: "grid", desktopDock: true, defaultSize: { w: 860, h: 580 } },
    { id: "about", name: "About", icon: "about", kind: "window", phone: "grid", desktopDock: true, defaultSize: { w: 620, h: 520 } },
    { id: "beliefs", name: "Beliefs", icon: "beliefs", kind: "window", phone: "grid", desktopDock: true, defaultSize: { w: 640, h: 560 } },
    { id: "bughunt", name: "Bug Hunt", icon: "bughunt", kind: "window", phone: "grid", desktopDock: true, defaultSize: { w: 520, h: 460 } },
    { id: "notes", name: "Notes", icon: "notes", kind: "window", phone: "dock", desktopDock: true, defaultSize: { w: 900, h: 600 } },
    { id: "sayhi", name: "Say Hi", icon: "sayhi", kind: "window", phone: "dock", desktopDock: true, defaultSize: { w: 520, h: 480 } },
    { id: "linkedin", name: "LinkedIn", icon: "linkedin", kind: "external", phone: "dock", desktopDock: true, href: LINKEDIN_URL },
] as const satisfies readonly AppManifest[];

export type AppId = (typeof APPS)[number]["id"];
export type WindowAppId = Extract<(typeof APPS)[number], { kind: "window" }>["id"];

export const APP_IDS: readonly AppId[] = APPS.map((a) => a.id);
export const WINDOW_APP_IDS: readonly WindowAppId[] = APPS.filter(
    (a): a is Extract<(typeof APPS)[number], { kind: "window" }> => a.kind === "window",
).map((a) => a.id);

export function isWindowAppId(value: unknown): value is WindowAppId {
    return typeof value === "string" && (WINDOW_APP_IDS as readonly string[]).includes(value);
}

export function getApp(id: AppId): AppManifest {
    const app = APPS.find((a) => a.id === id);
    if (!app) throw new Error(`Unknown app: ${id}`);
    return app;
}

export const desktopDockApps = APPS.filter((a) => a.desktopDock);
export const phoneGridApps = APPS.filter((a) => a.phone === "grid");
export const phoneDockApps = APPS.filter((a) => a.phone === "dock");
