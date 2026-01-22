"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

interface PDFViewerProps {
    isOpen: boolean;
    onClose: () => void;
    pdfUrl: string;
    title?: string;
}

export default function PDFViewer({ isOpen, onClose, pdfUrl, title = "Resume" }: PDFViewerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [viewportHeight, setViewportHeight] = useState("100vh");

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            setViewportHeight(`${window.innerHeight}px`);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = title + ".pdf";
        link.click();
    };

    const handleOpenInNewTab = () => {
        window.open(pdfUrl, "_blank");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* PDF Modal - Full screen on mobile */}
                    <motion.div
                        className="fixed z-50 bg-[#1e1e1e] overflow-hidden shadow-2xl
                            border border-white/10 flex flex-col
                            inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                            md:w-[90vw] md:max-w-4xl md:h-[85vh] md:rounded-xl"
                        style={isMobile ? { height: viewportHeight } : undefined}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between h-14 md:h-12 px-4 bg-[#323233] border-b border-white/5 flex-shrink-0">
                            {/* Close button (mobile) / Traffic lights (desktop) */}
                            <div className="flex items-center gap-2">
                                {isMobile ? (
                                    <button
                                        onClick={onClose}
                                        className="p-2 -ml-2 rounded-md hover:bg-white/10 transition-colors text-white/80"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={onClose}
                                            className="group w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 
                                                transition-all flex items-center justify-center"
                                        >
                                            <span className="opacity-0 group-hover:opacity-100 text-[8px] text-black/60 font-bold">
                                                ✕
                                            </span>
                                        </button>
                                        <button className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:brightness-110 transition-all opacity-50 cursor-not-allowed" />
                                        <button className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-110 transition-all opacity-50 cursor-not-allowed" />
                                    </>
                                )}
                            </div>

                            {/* Title */}
                            <span className="text-sm text-white/70 font-medium truncate max-w-[50%]">{title}</span>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleOpenInNewTab}
                                    className="p-2 rounded-md hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                                    title="Open in new tab"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="p-2 rounded-md hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                                    title="Download"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* PDF Content */}
                        <div className="flex-1 relative bg-[#525659] overflow-hidden">
                            {/* Loading state */}
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#525659] z-10">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span className="text-white/60 text-sm">Loading PDF...</span>
                                    </div>
                                </div>
                            )}

                            {/* PDF embed - using object tag for better mobile support */}
                            <object
                                data={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                                type="application/pdf"
                                className="w-full h-full"
                                onLoad={() => setIsLoading(false)}
                            >
                                {/* Fallback for mobile browsers that don't support PDF embed */}
                                <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
                                    <p className="text-white/70 text-sm">
                                        PDF preview is not supported on this device.
                                    </p>
                                    <div className="flex flex-col gap-2 w-full max-w-xs">
                                        <button
                                            onClick={handleOpenInNewTab}
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-blue-600 
                                                text-white rounded-lg transition-colors font-medium"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Open PDF
                                        </button>
                                        <button
                                            onClick={handleDownload}
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 
                                                text-white rounded-lg transition-colors font-medium"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download PDF
                                        </button>
                                    </div>
                                </div>
                            </object>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
