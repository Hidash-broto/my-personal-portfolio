"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft, FileCode, FileJson, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { portfolioContent, FileItem, getLanguageFromFilename } from "@/data/portfolioContent";

// Dynamic import for Monaco Editor
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface MobileCodeViewerProps {
    isOpen: boolean;
    onClose: () => void;
    categoryId: string;
}

const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'tsx':
        case 'ts':
        case 'jsx':
        case 'js':
            return <FileCode className="w-4 h-4 text-blue-400" />;
        case 'json':
            return <FileJson className="w-4 h-4 text-yellow-400" />;
        case 'md':
            return <FileText className="w-4 h-4 text-white/60" />;
        case 'py':
            return <FileCode className="w-4 h-4 text-green-400" />;
        default:
            return <FileCode className="w-4 h-4 text-white/40" />;
    }
};

export default function MobileCodeViewer({ isOpen, onClose, categoryId }: MobileCodeViewerProps) {
    const category = portfolioContent[categoryId];
    const [selectedFile, setSelectedFile] = useState<FileItem>(
        category?.files.find((f) => f.name === category.defaultFile) || category?.files[0]
    );
    const [showFileList, setShowFileList] = useState(false);

    const handleFileSelect = useCallback((file: FileItem) => {
        setSelectedFile(file);
        setShowFileList(false);
    }, []);

    if (!category) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 bg-[#1e1e1e] flex flex-col"
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between h-14 px-4 bg-[#323233] border-b border-white/10 flex-shrink-0 safe-area-top">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-1 text-accent hover:text-blue-400 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="text-sm font-medium">Back</span>
                        </button>

                        <span className="text-sm text-white font-semibold">{category.title}</span>

                        <div className="w-16" /> {/* Spacer */}
                    </div>

                    {/* File Selector Tab */}
                    <button
                        onClick={() => setShowFileList(!showFileList)}
                        className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-white/5"
                    >
                        <div className="flex items-center gap-2">
                            {getFileIcon(selectedFile.name)}
                            <span className="text-sm text-white/90">{selectedFile.name}</span>
                        </div>
                        {showFileList ? (
                            <ChevronUp className="w-4 h-4 text-white/60" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-white/60" />
                        )}
                    </button>

                    {/* File List Dropdown */}
                    <AnimatePresence>
                        {showFileList && (
                            <motion.div
                                className="bg-[#252526] border-b border-white/5 overflow-hidden"
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {category.files.map((file) => (
                                    <button
                                        key={file.name}
                                        onClick={() => handleFileSelect(file)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                                            ${selectedFile.name === file.name
                                                ? 'bg-accent/20 text-white'
                                                : 'text-white/70 hover:bg-white/5'
                                            }`}
                                    >
                                        {getFileIcon(file.name)}
                                        <span className="text-sm">{file.name}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Code Editor */}
                    <div className="flex-1 min-h-0">
                        <Editor
                            height="100%"
                            language={getLanguageFromFilename(selectedFile.name)}
                            value={selectedFile.content}
                            theme="vs-dark"
                            options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                fontSize: 12,
                                lineNumbers: "on",
                                scrollBeyondLastLine: false,
                                wordWrap: "on",
                                padding: { top: 12, bottom: 12 },
                                fontFamily: "'Geist Mono', 'Fira Code', 'Consolas', monospace",
                                fontLigatures: true,
                                smoothScrolling: true,
                                renderLineHighlight: "none",
                                scrollbar: {
                                    vertical: "auto",
                                    horizontal: "auto",
                                },
                                overviewRulerLanes: 0,
                                hideCursorInOverviewRuler: true,
                                overviewRulerBorder: false,
                                folding: false,
                                lineDecorationsWidth: 10,
                                lineNumbersMinChars: 3,
                            }}
                        />
                    </div>

                    {/* Status bar */}
                    <div className="h-8 bg-accent flex items-center justify-between px-4 text-[11px] text-white/90 flex-shrink-0 safe-area-bottom">
                        <div className="flex items-center gap-3">
                            <span>UTF-8</span>
                            <span>{getLanguageFromFilename(selectedFile.name).toUpperCase()}</span>
                        </div>
                        <span>{category.files.length} file{category.files.length > 1 ? 's' : ''}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
