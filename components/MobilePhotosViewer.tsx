"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, X, ZoomIn, Share } from "lucide-react";
import Image from "next/image";

interface MobilePhotosViewerProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    folderName: string;
}

export default function MobilePhotosViewer({ isOpen, onClose, images, folderName }: MobilePhotosViewerProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageError, setImageError] = useState<Set<string>>(new Set());

    const handleImageError = (src: string) => {
        setImageError(prev => new Set(prev).add(src));
    };

    const validImages = images.filter(img => !imageError.has(img));

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 bg-black flex flex-col"
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between h-14 px-4 bg-black/90 backdrop-blur-xl border-b border-white/10 flex-shrink-0">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-1 text-accent hover:text-blue-400 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="text-sm font-medium">Back</span>
                        </button>

                        <span className="text-base text-white font-semibold">{folderName}</span>

                        <span className="text-sm text-white/60">{validImages.length} Photos</span>
                    </div>

                    {/* Photo Grid - iOS Photos style */}
                    <div className="flex-1 overflow-auto p-0.5 bg-black">
                        <div className="grid grid-cols-3 gap-0.5">
                            {images.map((image, index) => (
                                <motion.button
                                    key={image}
                                    className="relative aspect-square overflow-hidden bg-white/5"
                                    onClick={() => setSelectedImage(image)}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.02 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {!imageError.has(image) ? (
                                        <Image
                                            src={image}
                                            alt={`Photo ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="33vw"
                                            onError={() => handleImageError(image)}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                                            <span className="text-white/30 text-xs">Error</span>
                                        </div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Tab Bar - iOS style */}
                    <div className="h-16 bg-black/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-8 flex-shrink-0">
                        <button className="flex flex-col items-center gap-1 text-accent">
                            <ZoomIn className="w-5 h-5" />
                            <span className="text-[10px]">All Photos</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 text-white/40">
                            <Share className="w-5 h-5" />
                            <span className="text-[10px]">Share</span>
                        </button>
                    </div>

                    {/* Full Screen Image Viewer */}
                    <AnimatePresence>
                        {selectedImage && (
                            <motion.div
                                className="fixed inset-0 z-60 bg-black flex flex-col"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {/* Image viewer header */}
                                <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between px-4">
                                    <button
                                        onClick={() => setSelectedImage(null)}
                                        className="p-2 text-white"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                    <span className="text-sm text-white/80">
                                        {validImages.indexOf(selectedImage) + 1} of {validImages.length}
                                    </span>
                                    <div className="w-10" />
                                </div>

                                {/* Full image */}
                                <motion.div
                                    className="flex-1 flex items-center justify-center"
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0.9 }}
                                >
                                    <Image
                                        src={selectedImage}
                                        alt="Full size photo"
                                        fill
                                        className="object-contain"
                                        sizes="100vw"
                                        priority
                                    />
                                </motion.div>

                                {/* Swipe hint */}
                                <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                                    <span className="text-white/40 text-xs">Tap X to close</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
