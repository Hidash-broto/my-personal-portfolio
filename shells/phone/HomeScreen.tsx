"use client";

import { useRef } from "react";
import { AppIcon } from "@/apps/icons";
import { phoneDockApps, phoneGridApps, type APPS } from "@/apps/registry";
import Character from "@/features/character/Character";
import { useSpawnSurface } from "@/lib/os";
import { useDockClearance, useLaunch } from "./hooks";
import { useIconTarget } from "./launch";
import { BugHuntWidget, LatestNoteWidget, ProfileWidget } from "./Widgets";
import s from "./phone.module.css";

export const ICON_SIZE = 62;

type PhoneApp = (typeof APPS)[number];

/** One home-screen icon. Window apps launch in the OS; external apps are real links. */
export function HomeIcon({ app, labelled }: { app: PhoneApp; labelled: boolean }) {
    const artRef = useRef<HTMLSpanElement>(null);
    const launch = useLaunch();
    useSpawnSurface(`phone-icon-${app.id}`, "icon", artRef);
    useIconTarget(app.id, artRef);

    const art = (
        <span ref={artRef} className={s.iconArt} data-icon={app.id}>
            <AppIcon icon={app.icon} size={ICON_SIZE} />
        </span>
    );
    const label = labelled ? <span className={s.iconLabel}>{app.name}</span> : null;

    if (app.kind === "external") {
        return (
            <a
                className={s.iconButton}
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${app.name} (opens in a new tab)`}
            >
                {art}
                {label}
            </a>
        );
    }

    return (
        <button
            type="button"
            className={s.iconButton}
            aria-label={app.name}
            onClick={() => launch(app.id, null, { el: artRef.current, kind: "icon" })}
        >
            {art}
            {label}
        </button>
    );
}

/** Widgets, the app grid, the latest-note widget, the dock and the character's spot. */
export default function HomeScreen() {
    const dockRef = useRef<HTMLElement>(null);
    const safeProbeRef = useRef<HTMLSpanElement>(null);
    useDockClearance(dockRef, safeProbeRef);

    return (
        <>
            <span ref={safeProbeRef} className={s.safeProbe} aria-hidden="true" />
            <div className={s.homeScroll}>
                <div className={s.homeInner}>
                    <div className={s.widgetRow}>
                        <ProfileWidget />
                        <BugHuntWidget />
                    </div>
                    <ul className={s.grid} aria-label="Apps" data-phone-list="grid">
                        {phoneGridApps.map((app) => (
                            <li key={app.id}>
                                <HomeIcon app={app} labelled />
                            </li>
                        ))}
                    </ul>
                    <LatestNoteWidget />
                </div>
            </div>
            <div className={s.characterSlot}>
                <Character shell="phone" />
            </div>
            <nav ref={dockRef} className={s.dock} aria-label="Dock">
                <ul className={s.dockList} data-phone-list="dock">
                    {phoneDockApps.map((app) => (
                        <li key={app.id}>
                            <HomeIcon app={app} labelled={false} />
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
}
