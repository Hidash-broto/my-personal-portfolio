"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, FolderGit2, User, Rocket, Mail, FileText, Wifi, Battery, Signal } from "lucide-react";
import PDFViewer from "./PDFViewer";
import MobileCodeViewer from "./MobileCodeViewer";

interface AppIconProps {
    id: string;
    label: string;
    icon: typeof Briefcase;
    color: string;
    onClick: () => void;
    delay: number;
}

function AppIcon({ label, icon: Icon, color, onClick, delay }: AppIconProps) {
    return (
        <motion.button
            className="flex flex-col items-center gap-1.5"
            onClick={onClick}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay, type: "spring", stiffness: 300, damping: 20 }}
            whileTap={{ scale: 0.85 }}
        >
            {/* App icon */}
            <div
                className="w-14 h-14 rounded-[14px] flex items-center justify-center shadow-lg"
                style={{
                    background: `linear-gradient(145deg, ${color}ee, ${color}bb)`,
                    boxShadow: `0 4px 12px ${color}40`,
                }}
            >
                <Icon className="w-7 h-7 text-white" />
            </div>
            {/* App label */}
            <span className="text-[11px] text-white/90 font-medium text-center leading-tight max-w-16 truncate">
                {label}
            </span>
        </motion.button>
    );
}

function DockIcon({ icon: Icon, color, onClick }: { icon: typeof Briefcase; color: string; onClick: () => void }) {
    return (
        <motion.button
            onClick={onClick}
            whileTap={{ scale: 0.85 }}
            className="w-14 h-14 rounded-[14px] flex items-center justify-center"
            style={{
                background: `linear-gradient(145deg, ${color}ee, ${color}bb)`,
                boxShadow: `0 2px 8px ${color}30`,
            }}
        >
            <Icon className="w-7 h-7 text-white" />
        </motion.button>
    );
}

function StatusBar() {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    return (
        <div className="flex items-center justify-between px-6 pt-3 pb-2">
            <span className="text-sm font-semibold text-white">{time}</span>
            <div className="flex items-center gap-1">
                <Signal className="w-4 h-4 text-white" />
                <Wifi className="w-4 h-4 text-white" />
                <Battery className="w-5 h-5 text-white" />
            </div>
        </div>
    );
}

export default function MobileView() {
    const [activeApp, setActiveApp] = useState<string | null>(null);
    const [showPDF, setShowPDF] = useState(false);

    const apps = [
        { id: "experience", label: "Experience", icon: Briefcase, color: "#3b82f6" },
        { id: "projects", label: "Projects", icon: FolderGit2, color: "#8b5cf6" },
        { id: "about", label: "About Me", icon: User, color: "#06b6d4" },
        { id: "whyHireMe", label: "Why Hire Me", icon: Rocket, color: "#f59e0b" },
        { id: "contact", label: "Contact", icon: Mail, color: "#10b981" },
        { id: "resume", label: "Resume", icon: FileText, color: "#ef4444" },
    ];

    const dockApps = [
        { id: "experience", icon: Briefcase, color: "#3b82f6" },
        { id: "projects", icon: FolderGit2, color: "#8b5cf6" },
        { id: "contact", icon: Mail, color: "#10b981" },
        { id: "resume", icon: FileText, color: "#ef4444" },
    ];

    const handleAppClick = (appId: string) => {
        if (appId === "resume") {
            setShowPDF(true);
        } else {
            setActiveApp(appId);
        }
    };

    return (
        <div
            className="min-h-screen w-full flex flex-col"
            style={{
                background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)",
            }}
        >
            {/* iOS Status Bar */}
            <StatusBar />

            {/* Main content area with app grid */}
            <div className="flex-1 px-6 pt-8 pb-4 overflow-auto">
                {/* App Grid - 4 columns */}
                <div className="grid grid-cols-4 gap-x-4 gap-y-6 max-w-sm mx-auto">
                    {apps.map((app, index) => (
                        <AppIcon
                            key={app.id}
                            {...app}
                            onClick={() => handleAppClick(app.id)}
                            delay={0.1 + index * 0.05}
                        />
                    ))}
                </div>

                {/* Page dots */}
                <motion.div
                    className="flex justify-center gap-2 mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="w-2 h-2 rounded-full bg-white" />
                    <div className="w-2 h-2 rounded-full bg-white/30" />
                    <div className="w-2 h-2 rounded-full bg-white/30" />
                </motion.div>
            </div>

            {/* iOS Dock */}
            <motion.div
                className="mx-4 mb-6 px-4 py-3 rounded-[22px] bg-white/10 backdrop-blur-xl border border-white/10"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.4 }}
            >
                <div className="flex justify-around items-center">
                    {dockApps.map((app) => (
                        <DockIcon
                            key={app.id}
                            icon={app.icon}
                            color={app.color}
                            onClick={() => handleAppClick(app.id)}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Home indicator */}
            <motion.div
                className="flex justify-center pb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <div className="w-32 h-1 rounded-full bg-white/30" />
            </motion.div>

            {/* PDF Viewer */}
            <PDFViewer
                isOpen={showPDF}
                onClose={() => setShowPDF(false)}
                pdfUrl="/Muhammed Hidash Resume.pdf"
                title="Muhammed Hidash Resume"
            />

            {/* Mobile Code Viewer */}
            <AnimatePresence>
                {activeApp && (
                    <MobileCodeViewer
                        isOpen={true}
                        onClose={() => setActiveApp(null)}
                        categoryId={activeApp}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
