"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { Briefcase, FolderGit2, User, Rocket, Mail } from "lucide-react";
import { useWindowManager, WindowId } from "./WindowManager";

interface DockItem {
    id: WindowId;
    label: string;
    filename: string;
    icon: typeof Briefcase;
    color: string;
}

const dockItems: DockItem[] = [
    { id: "experience", label: "Experience", filename: "Experience.tsx", icon: Briefcase, color: "#3b82f6" },
    { id: "projects", label: "Projects", filename: "Projects.tsx", icon: FolderGit2, color: "#8b5cf6" },
    { id: "about", label: "About Me", filename: "AboutMe.tsx", icon: User, color: "#06b6d4" },
    { id: "whyHireMe", label: "Why Hire Me", filename: "WhyHireMe.tsx", icon: Rocket, color: "#f59e0b" },
    { id: "contact", label: "Contact", filename: "Contact.tsx", icon: Mail, color: "#10b981" },
];

function DockIcon({ item, mouseX }: { item: DockItem; mouseX: ReturnType<typeof useMotionValue<number>> }) {
    const ref = useRef<HTMLDivElement>(null);
    const { openWindow, windows } = useWindowManager();

    const distance = useTransform(mouseX, (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthSync = useTransform(distance, [-150, 0, 150], [48, 72, 48]);
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

    const isOpen = windows[item.id]?.isOpen;
    const Icon = item.icon;

    return (
        <motion.div
            ref={ref}
            style={{ width, height: width }}
            className="relative flex items-center justify-center cursor-pointer group"
            onClick={() => openWindow(item.id)}
            whileTap={{ scale: 0.9 }}
        >
            {/* Icon container */}
            <motion.div
                className="absolute inset-0 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                    background: `linear-gradient(135deg, ${item.color}dd, ${item.color}99)`,
                    boxShadow: `0 4px 20px ${item.color}40`,
                }}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                <Icon className="w-1/2 h-1/2 text-white" />
            </motion.div>

            {/* Tooltip */}
            <motion.div
                className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded-md 
                   bg-gray-900/90 backdrop-blur-sm text-white text-xs font-medium whitespace-nowrap
                   opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                   border border-white/10"
            >
                {item.filename}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 
                        bg-gray-900/90 rotate-45 border-r border-b border-white/10" />
            </motion.div>

            {/* Active indicator */}
            {isOpen && (
                <motion.div
                    className="absolute -bottom-2 w-1 h-1 rounded-full bg-white/80"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                />
            )}
        </motion.div>
    );
}

export default function Dock() {
    const mouseX = useMotionValue(Infinity);

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
            <motion.div
                onMouseMove={(e) => mouseX.set(e.pageX)}
                onMouseLeave={() => mouseX.set(Infinity)}
                className="flex items-end gap-2 px-3 py-2 rounded-2xl bg-dock-bg backdrop-blur-xl 
                   border border-white/10 shadow-2xl"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.5 }}
            >
                {dockItems.map((item) => (
                    <DockIcon key={item.id} item={item} mouseX={mouseX} />
                ))}
            </motion.div>
        </div>
    );
}
