"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface FolderViewerProps {
    folderName: string;
    images: string[];
    onClose: () => void;
    position: { x: number; y: number };
}

export default function FolderViewer({ folderName, images, onClose, position }: FolderViewerProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <>
            <motion.div
                className="fixed bg-[#2b2b2b] rounded-xl shadow-2xl overflow-hidden z-40"
                style={{
                    left: position.x,
                    top: position.y,
                    width: "min(900px, 90vw)",
                    height: "min(650px, 85vh)",
                }}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 25 }}
                drag
                dragMomentum={false}
                dragConstraints={{
                    top: -100,
                    left: -200,
                    right: 200,
                    bottom: 100,
                }}
                dragElastic={0.1}
            >
                {/* Title Bar - Mac Style */}
                <div
                    className="bg-[#323232] h-11 flex items-center justify-between px-4 border-b border-white/5 cursor-move select-none"
                    onDoubleClick={(e) => e.stopPropagation()}
                >
                    {/* Traffic Lights */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/80 transition-colors flex items-center justify-center group"
                            aria-label="Close"
                        >
                            <X className="w-2 h-2 text-[#4d0000] opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
                        </button>
                        <button
                            className="w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#febc2e]/80 transition-colors"
                            aria-label="Minimize"
                        />
                        <button
                            className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#28c840]/80 transition-colors"
                            aria-label="Maximize"
                        />
                    </div>

                    {/* Folder Name */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 text-white/90 text-sm font-medium">
                        {folderName}
                    </div>

                    {/* Empty space for symmetry */}
                    <div className="w-[52px]"></div>
                </div>

                {/* Toolbar - Mac Finder Style */}
                <div className="bg-[#2b2b2b] h-12 flex items-center justify-between px-4 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <button className="p-1.5 hover:bg-white/5 rounded transition-colors">
                                <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button className="p-1.5 hover:bg-white/5 rounded transition-colors">
                                <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                        <div className="text-white/50 text-xs font-medium">
                            {images.length} items
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-white/5 rounded transition-colors">
                            <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </button>
                        <button className="p-1.5 bg-white/10 rounded transition-colors">
                            <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content Area - Scrollable Grid */}
                <div
                    className="h-[calc(100%-92px)] overflow-y-auto bg-[#1e1e1e] p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20"
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(255,255,255,0.1) transparent'
                    }}
                >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {images.map((image, index) => (
                            <motion.div
                                key={index}
                                className="flex flex-col items-center gap-2 cursor-pointer group"
                                whileHover={{ y: -4 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImage(image);
                                }}
                            >
                                <div className="w-full aspect-square rounded-md overflow-hidden bg-white/5 border border-white/10 group-hover:border-blue-500/60 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all">
                                    <Image
                                        src={image}
                                        alt={`Photo ${index + 1}`}
                                        width={200}
                                        height={200}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="text-white/60 text-[11px] text-center truncate w-full px-1 group-hover:text-white/90 transition-colors">
                                    {image.split('/').pop()?.replace(/\.[^/.]+$/, "")}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Image Preview Modal */}
            {selectedImage && (
                <motion.div
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-[95vw] max-h-[95vh]">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(null);
                            }}
                            className="absolute -top-14 right-0 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <Image
                                src={selectedImage}
                                alt="Preview"
                                width={1600}
                                height={1200}
                                className="max-w-full max-h-[95vh] object-contain rounded-lg shadow-2xl"
                            />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </>
    );
}
