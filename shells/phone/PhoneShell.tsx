"use client";

import { AnimatePresence, motion, MotionConfig, useMotionValue, useTransform } from "framer-motion";
import { useCallback } from "react";
import type { WindowAppId } from "@/apps/registry";
import Wallpaper from "@/features/wallpaper/Wallpaper";
import { useOs } from "@/lib/os";
import AppSheet from "./AppSheet";
import BugHuntCard from "./BugHuntCard";
import { useCloseApp, useIdleEmitter } from "./hooks";
import HomeScreen from "./HomeScreen";
import s from "./phone.module.css";

/** How far the home screen recedes behind an open app. */
const HOME_RECEDE = 0.06;

/**
 * The Hidash OS phone shell: wallpaper, home screen (widgets, grid, dock, character),
 * full-screen app sheets that zoom from their icon, and Bug Hunt as a card over home.
 * The open app is `url.open[0]`; the URL owns it. Must render inside <OsProvider>.
 */
export default function PhoneShell() {
    const { url, history } = useOs();
    const closeApp = useCloseApp();
    useIdleEmitter();

    const current = url.open[0] ?? null;
    const sheetApp: WindowAppId | null = current && current !== "bughunt" ? current : null;
    const cardOpen = current === "bughunt";

    const coverage = useMotionValue(0);
    const homeScale = useTransform(coverage, [0, 1], [1, 1 - HOME_RECEDE]);
    const dim = useTransform(coverage, [0, 1], [0, 0.32]);

    const openItem = useCallback((app: WindowAppId, item: string | null) => history.open(app, item), [history]);
    const closeBugHunt = useCallback(() => closeApp("bughunt"), [closeApp]);
    const openBugHuntItem = useCallback((item: string | null) => history.open("bughunt", item), [history]);

    return (
        <MotionConfig reducedMotion="user">
            <div className={s.root} data-phone-shell="" data-app-open={current ?? undefined}>
                <Wallpaper shell="phone" />
                <motion.div className={s.home} style={{ scale: homeScale }} inert={current !== null} data-phone-home="">
                    <HomeScreen />
                </motion.div>
                <motion.div className={s.dim} style={{ opacity: dim }} aria-hidden="true" />

                <AnimatePresence>
                    {cardOpen && <BugHuntCard key="bughunt" item={url.item} onClose={closeBugHunt} openItem={openBugHuntItem} />}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {sheetApp && (
                        <AppSheet
                            key={sheetApp}
                            app={sheetApp}
                            item={url.item}
                            coverage={coverage}
                            homeScale={homeScale}
                            onClose={closeApp}
                            openItem={openItem}
                        />
                    )}
                </AnimatePresence>
            </div>
        </MotionConfig>
    );
}
