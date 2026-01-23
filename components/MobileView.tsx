"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, FolderGit2, User, Rocket, Mail, FileText, Images, MessageCircle } from "lucide-react";
import PDFViewer from "./PDFViewer";
import MobileCodeViewer from "./MobileCodeViewer";
import MobilePhotosViewer from "./MobilePhotosViewer";

interface AppIconProps {
    id: string;
    label: string;
    icon: typeof Briefcase;
    color: string;
    onClick: () => void;
    delay: number;
}

// List of images in the Me folder (same as Desktop.tsx)
const meImages = [
    "/Me/42c7f18f-d873-4929-8331-0b76cfd35fb7.jpg",
    "/Me/7191e0e7-c863-4746-a298-bb37772acc6c.JPG",
    "/Me/FullSizeRender.jpg",
    "/Me/IMG_0005.jpg",
    "/Me/IMG_0175.jpg",
    "/Me/IMG_0223.jpg",
    "/Me/IMG_0730.JPG",
    "/Me/IMG_1562.jpg",
    "/Me/IMG_1593.JPG",
    "/Me/IMG_2462.JPG",
    "/Me/IMG_4668.JPG",
    "/Me/IMG_5509.JPG",
    "/Me/IMG_5587.jpg",
    "/Me/IMG_6319.jpg",
    "/Me/IMG_6517.jpg",
    "/Me/WhatsApp Image 2025-05-12 at 11.55.41 AM.jpeg",
    "/Me/WhatsApp Image 2025-08-18 at 21.24.42_bf63958c.jpg",
    "/Me/WhatsApp Image 2025-11-09 at 22.52.19_dace5aa4.jpg",
    "/Me/fun.jpg",
    "/Me/generation-3583539f-eb35-433b-9c7f-91d343cc1c86.png",
    "/Me/generation-8e1f5072-9cdf-4da5-beb1-462d5c1f166c.png",
];

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
                className="w-[60px] h-[60px] rounded-[14px] flex items-center justify-center shadow-lg"
                style={{
                    background: `linear-gradient(145deg, ${color}ee, ${color}bb)`,
                    boxShadow: `0 4px 12px ${color}40`,
                }}
            >
                <Icon className="w-7 h-7 text-white" />
            </div>
            {/* App label */}
            <span className="text-[11px] text-white/90 font-medium text-center leading-tight w-[70px] truncate drop-shadow-sm">
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
            className="w-[52px] h-[52px] rounded-[12px] flex items-center justify-center"
            style={{
                background: `linear-gradient(145deg, ${color}ee, ${color}bb)`,
                boxShadow: `0 2px 8px ${color}30`,
            }}
        >
            <Icon className="w-6 h-6 text-white" />
        </motion.button>
    );
}

export default function MobileView() {
    const [activeApp, setActiveApp] = useState<string | null>(null);
    const [showPDF, setShowPDF] = useState(false);
    const [showPhotos, setShowPhotos] = useState(false);
    const [viewportHeight, setViewportHeight] = useState("100vh");

    // Fix for mobile viewport height (accounts for browser chrome)
    useEffect(() => {
        const updateHeight = () => {
            setViewportHeight(`${window.innerHeight}px`);
        };
        updateHeight();
        window.addEventListener("resize", updateHeight);
        window.addEventListener("orientationchange", updateHeight);
        return () => {
            window.removeEventListener("resize", updateHeight);
            window.removeEventListener("orientationchange", updateHeight);
        };
    }, []);

    const apps = [
        { id: "experience", label: "Experience", icon: Briefcase, color: "#3b82f6" },
        { id: "projects", label: "Projects", icon: FolderGit2, color: "#8b5cf6" },
        { id: "about", label: "About Me", icon: User, color: "#06b6d4" },
        { id: "whyHireMe", label: "Why Hire", icon: Rocket, color: "#f59e0b" },
        { id: "contact", label: "Contact", icon: Mail, color: "#10b981" },
        { id: "resume", label: "Resume", icon: FileText, color: "#ef4444" },
        { id: "photos", label: "Me", icon: Images, color: "#ec4899" },
        { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "#25D366" },
    ];

    const dockApps = [
        { id: "experience", icon: Briefcase, color: "#3b82f6" },
        { id: "projects", icon: FolderGit2, color: "#8b5cf6" },
        { id: "whatsapp", icon: MessageCircle, color: "#25D366" },
        { id: "resume", icon: FileText, color: "#ef4444" },
    ];

    const handleAppClick = (appId: string) => {
        if (appId === "resume") {
            setShowPDF(true);
        } else if (appId === "photos") {
            setShowPhotos(true);
        } else if (appId === "whatsapp") {
            window.open("https://wa.me/917736574157", "_blank");
        } else {
            setActiveApp(appId);
        }
    };

    return (
        <div
            className="w-full flex flex-col overflow-hidden relative"
            style={{
                height: viewportHeight,
            }}
        >
            {/* Background Image - Same as desktop */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/my-photo.png')" }}
            />

            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

            {/* Main content area with app grid */}
            <div className="relative flex-1 px-5 pt-6 overflow-auto flex flex-col z-10">
                {/* App Grid - 4 columns */}
                <div className="grid grid-cols-4 gap-x-2 gap-y-5 justify-items-center">
                    {apps.map((app, index) => (
                        <AppIcon
                            key={app.id}
                            {...app}
                            onClick={() => handleAppClick(app.id)}
                            delay={0.1 + index * 0.05}
                        />
                    ))}
                </div>

                {/* Page dots - pushed to center of remaining space */}
                <div className="flex-1 flex items-center justify-center">
                    <motion.div
                        className="flex gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="w-2 h-2 rounded-full bg-white" />
                        <div className="w-2 h-2 rounded-full bg-white/30" />
                        <div className="w-2 h-2 rounded-full bg-white/30" />
                    </motion.div>
                </div>
            </div>

            {/* iOS Dock */}
            <motion.div
                className="relative z-10 mx-3 mb-2 px-4 py-2.5 rounded-[20px] bg-white/15 backdrop-blur-xl border border-white/20 flex-shrink-0"
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
                className="relative z-10 flex justify-center pb-2 flex-shrink-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <div className="w-32 h-1 rounded-full bg-white/40" />
            </motion.div>

            {/* PDF Viewer */}
            <PDFViewer
                isOpen={showPDF}
                onClose={() => setShowPDF(false)}
                pdfUrl="/Muhammed Hidash Resume.pdf"
                title="Muhammed Hidash Resume"
            />

            {/* Photos Viewer */}
            <MobilePhotosViewer
                isOpen={showPhotos}
                onClose={() => setShowPhotos(false)}
                images={meImages}
                folderName="Me"
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
