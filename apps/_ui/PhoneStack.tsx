"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "./primitives";
import ui from "./ui.module.css";

/**
 * iOS navigation stack for one level: a list and a pushed detail page sharing one scroll view.
 * The list's scroll position is restored on the way back; the detail always opens at the top.
 * The shell draws the navigation bar and its back button (which calls `openItem(null)`).
 */
export function PhoneStack({ detailKey, list, detail }: { detailKey: string | null; list: ReactNode; detail: ReactNode }) {
    const scroller = useRef<HTMLDivElement>(null);
    const listScroll = useRef(0);
    const reduceMotion = useReducedMotion();

    // Animate only real navigation, never the first paint (the shell animates the app opening).
    const [prevKey, setPrevKey] = useState(detailKey);
    const [navigated, setNavigated] = useState(false);
    if (prevKey !== detailKey) {
        setPrevKey(detailKey);
        setNavigated(true);
    }

    useLayoutEffect(() => {
        const el = scroller.current;
        if (!el) return;
        el.scrollTop = detailKey ? 0 : listScroll.current;
    }, [detailKey]);

    const showing = detailKey ? "detail" : "list";
    const fromX = reduceMotion ? 0 : detailKey ? 36 : -24;

    return (
        <div
            ref={scroller}
            className={cx(ui.scroll, ui.phoneScroll)}
            onScroll={(e) => {
                if (!detailKey) listScroll.current = e.currentTarget.scrollTop;
            }}
        >
            <motion.div
                key={detailKey ?? "list"}
                className={ui.push}
                data-stack-page={showing}
                initial={navigated ? { opacity: 0, x: fromX } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={reduceMotion ? { duration: 0.18 } : { type: "spring", stiffness: 420, damping: 40, mass: 0.9 }}
            >
                {detailKey ? detail : list}
            </motion.div>
        </div>
    );
}
