"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type WindowId = "experience" | "projects" | "about" | "whyHireMe" | "contact";

interface WindowState {
    isOpen: boolean;
    zIndex: number;
    isMinimized: boolean;
}

interface WindowManagerContextType {
    windows: Record<WindowId, WindowState>;
    openWindow: (id: WindowId) => void;
    closeWindow: (id: WindowId) => void;
    focusWindow: (id: WindowId) => void;
    minimizeWindow: (id: WindowId) => void;
}

const defaultWindowState: WindowState = {
    isOpen: false,
    zIndex: 0,
    isMinimized: false,
};

const WindowManagerContext = createContext<WindowManagerContextType | null>(null);

export function WindowManagerProvider({ children }: { children: ReactNode }) {
    const [windows, setWindows] = useState<Record<WindowId, WindowState>>({
        experience: { ...defaultWindowState },
        projects: { ...defaultWindowState },
        about: { ...defaultWindowState },
        whyHireMe: { ...defaultWindowState },
        contact: { ...defaultWindowState },
    });

    const [maxZIndex, setMaxZIndex] = useState(10);

    const openWindow = useCallback((id: WindowId) => {
        setMaxZIndex((prev) => prev + 1);
        setWindows((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                isOpen: true,
                isMinimized: false,
                zIndex: maxZIndex + 1,
            },
        }));
    }, [maxZIndex]);

    const closeWindow = useCallback((id: WindowId) => {
        setWindows((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                isOpen: false,
                isMinimized: false,
            },
        }));
    }, []);

    const focusWindow = useCallback((id: WindowId) => {
        setMaxZIndex((prev) => prev + 1);
        setWindows((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                zIndex: maxZIndex + 1,
            },
        }));
    }, [maxZIndex]);

    const minimizeWindow = useCallback((id: WindowId) => {
        setWindows((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                isMinimized: true,
            },
        }));
    }, []);

    return (
        <WindowManagerContext.Provider
            value={{ windows, openWindow, closeWindow, focusWindow, minimizeWindow }}
        >
            {children}
        </WindowManagerContext.Provider>
    );
}

export function useWindowManager() {
    const context = useContext(WindowManagerContext);
    if (!context) {
        throw new Error("useWindowManager must be used within a WindowManagerProvider");
    }
    return context;
}
