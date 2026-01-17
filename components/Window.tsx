"use client";

import { ReactNode, useCallback } from "react";
import { Rnd } from "react-rnd";
import { motion } from "framer-motion";
import { useWindowManager, WindowId } from "./WindowManager";

interface WindowProps {
    windowId: WindowId;
    title: string;
    children: ReactNode;
    defaultPosition?: { x: number; y: number };
    defaultSize?: { width: number; height: number };
}

export default function Window({
    windowId,
    title,
    children,
    defaultPosition = { x: 100, y: 60 },
    defaultSize = { width: 900, height: 600 },
}: WindowProps) {
    const { windows, closeWindow, focusWindow } = useWindowManager();
    const windowState = windows[windowId];

    const handleClick = useCallback(() => {
        focusWindow(windowId);
    }, [focusWindow, windowId]);

    if (!windowState?.isOpen || windowState.isMinimized) {
        return null;
    }

    return (
        <Rnd
            default={{
                ...defaultPosition,
                ...defaultSize,
            }}
            minWidth={400}
            minHeight={300}
            bounds="parent"
            dragHandleClassName="window-drag-handle"
            style={{ zIndex: windowState.zIndex }}
            onMouseDown={handleClick}
        >
            <motion.div
                className="h-full w-full flex flex-col rounded-xl overflow-hidden shadow-2xl 
                   border border-white/10"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.1)",
                }}
            >
                {/* Title bar */}
                <div
                    className="window-drag-handle flex items-center justify-between h-11 px-4 
                     bg-[#323233] border-b border-white/5 select-none cursor-grab 
                     active:cursor-grabbing flex-shrink-0"
                >
                    {/* Traffic lights */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                closeWindow(windowId);
                            }}
                            className="group w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 
                         transition-all flex items-center justify-center"
                        >
                            <span className="opacity-0 group-hover:opacity-100 text-[8px] text-black/60 font-bold">
                                ✕
                            </span>
                        </button>
                        <button
                            className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:brightness-110 
                         transition-all opacity-50 cursor-not-allowed"
                        />
                        <button
                            className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-110 
                         transition-all opacity-50 cursor-not-allowed"
                        />
                    </div>

                    {/* Title */}
                    <span className="absolute left-1/2 transform -translate-x-1/2 text-sm 
                           text-white/70 font-medium">
                        {title}
                    </span>

                    {/* Spacer */}
                    <div className="w-14" />
                </div>

                {/* Window content */}
                <div className="flex-1 overflow-hidden bg-window-bg">
                    {children}
                </div>
            </motion.div>
        </Rnd>
    );
}
