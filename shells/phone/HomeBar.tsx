"use client";

import { animate, type MotionValue } from "framer-motion";
import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { releaseVelocity, shouldDismiss, type Sample } from "./geometry";
import s from "./phone.module.css";

const SPRING_BACK = { type: "spring", stiffness: 420, damping: 34, mass: 1, restDelta: 0.5 } as const;

/**
 * The in-app home indicator. Drag it up to close the app: the app card follows the finger
 * (via `dragY`) and either flies home on release or springs back. Keyboard: Enter/Space.
 */
export default function HomeBar({
    dragY,
    viewportHeight,
    onDismiss,
    label,
}: {
    dragY: MotionValue<number>;
    viewportHeight: number;
    onDismiss: () => void;
    label: string;
}) {
    const drag = useRef<{ id: number; startY: number; samples: Sample[] } | null>(null);

    const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
        if (!e.isPrimary || (e.pointerType === "mouse" && e.button !== 0)) return;
        dragY.stop();
        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
            /* jsdom / old webviews */
        }
        drag.current = { id: e.pointerId, startY: e.clientY - dragY.get(), samples: [{ t: e.timeStamp, y: e.clientY }] };
    };

    const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        d.samples.push({ t: e.timeStamp, y: e.clientY });
        if (d.samples.length > 12) d.samples.shift();
        dragY.set(e.clientY - d.startY);
    };

    const finish = (e: PointerEvent<HTMLButtonElement>, cancelled: boolean) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        drag.current = null;
        d.samples.push({ t: e.timeStamp, y: e.clientY });
        const velocity = releaseVelocity(d.samples);
        if (!cancelled && shouldDismiss({ dragY: dragY.get(), velocity, viewportHeight })) {
            onDismiss();
        } else {
            animate(dragY, 0, SPRING_BACK);
        }
    };

    const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onDismiss();
        }
    };

    return (
        <button
            type="button"
            className={s.homeBar}
            aria-label={label}
            data-phone-homebar=""
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => finish(e, false)}
            onPointerCancel={(e) => finish(e, true)}
            onKeyDown={onKeyDown}
        >
            <span className={s.homeIndicator} />
        </button>
    );
}
