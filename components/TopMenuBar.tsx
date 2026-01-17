"use client";

import { useState, useEffect } from "react";
import { Apple } from "lucide-react";

export default function TopMenuBar() {
    const [time, setTime] = useState<string>("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const formatted = now.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            });
            const date = now.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
            });
            setTime(`${date} ${formatted}`);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const menuItems = ["File", "Edit", "View", "Go"];

    return (
        <div className="fixed top-0 left-0 right-0 z-50 h-7 flex items-center justify-between px-4 bg-[#d3d6e5] border-b border-white/10">
            {/* Left side - Apple icon and menu items */}
            <div className="flex items-center gap-5">
                <div className="w-4 h-4">
                    <img src="/apple_731985.png" alt="" />
                </div>
                <div className="flex items-center gap-4">
                    {menuItems.map((item) => (
                        <button
                            key={item}
                            className="text-[13px] text-black/90 hover:text-white transition-colors"
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Right side - Clock */}
            <div className="text-[13px] text-black/90">
                {time}
            </div>
        </div>
    );
}
