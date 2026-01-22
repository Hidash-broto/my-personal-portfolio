"use client";

import { motion } from "framer-motion";
import { FileText, Folder } from "lucide-react";

interface DesktopIconProps {
    name: string;
    type: "file" | "folder";
    onClick: () => void;
    position: { x: number; y: number };
}

export default function DesktopIcon({ name, type, onClick, position }: DesktopIconProps) {
    return (
        <motion.div
            className="absolute flex flex-col items-center gap-1 cursor-pointer group"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
            whileHover={{ scale: 1.05 }}
            onClick={onClick}
        >
            {/* Icon */}
            <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                {type === "folder" ? (
                    <Folder className="w-10 h-10 text-blue-400" fill="currentColor" />
                ) : (
                    <FileText className="w-10 h-10 text-red-400" />
                )}
            </div>

            {/* Label */}
            <div className="text-white text-xs text-center px-2 py-1 rounded bg-black/30 backdrop-blur-sm max-w-[100px] truncate">
                {name}
            </div>
        </motion.div>
    );
}
