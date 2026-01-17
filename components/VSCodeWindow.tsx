"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ChevronRight, FileCode, FileJson, FileText, Folder, FolderOpen } from "lucide-react";
import Window from "./Window";
import { WindowId } from "./WindowManager";
import { portfolioContent, FileItem, getLanguageFromFilename } from "@/data/portfolioContent";

// Dynamic import for Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface VSCodeWindowProps {
    windowId: WindowId;
    defaultPosition?: { x: number; y: number };
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

export default function VSCodeWindow({ windowId, defaultPosition }: VSCodeWindowProps) {
    const category = portfolioContent[windowId];
    const [selectedFile, setSelectedFile] = useState<FileItem>(
        category.files.find((f) => f.name === category.defaultFile) || category.files[0]
    );
    const [isExplorerOpen, setIsExplorerOpen] = useState(true);

    const handleFileSelect = useCallback((file: FileItem) => {
        setSelectedFile(file);
    }, []);

    const title = `${category.title} — ${selectedFile.name}`;

    return (
        <Window
            windowId={windowId}
            title={title}
            defaultPosition={defaultPosition}
            defaultSize={{ width: 950, height: 620 }}
        >
            <div className="flex h-full">
                {/* Activity Bar */}
                <div className="w-12 bg-[#333333] flex flex-col items-center py-2 border-r border-white/5 flex-shrink-0">
                    <button
                        onClick={() => setIsExplorerOpen(!isExplorerOpen)}
                        className={`p-2.5 rounded-md transition-colors ${isExplorerOpen ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
                            }`}
                    >
                        <Folder className="w-5 h-5" />
                    </button>
                </div>

                {/* Sidebar - File Explorer */}
                {isExplorerOpen && (
                    <motion.div
                        className="w-56 bg-sidebar-bg border-r border-white/5 flex flex-col flex-shrink-0"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 224, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        {/* Sidebar header */}
                        <div className="px-4 py-2 text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                            Explorer
                        </div>

                        {/* Folder */}
                        <div className="px-2">
                            <div className="flex items-center gap-1 px-2 py-1 text-sm text-white/80">
                                <ChevronRight className="w-3 h-3 text-white/50" />
                                <FolderOpen className="w-4 h-4 text-yellow-500/80" />
                                <span className="ml-1 font-medium">{category.title}</span>
                            </div>

                            {/* Files */}
                            <div className="ml-4 mt-1 space-y-0.5">
                                {category.files.map((file) => (
                                    <button
                                        key={file.name}
                                        onClick={() => handleFileSelect(file)}
                                        className={`w-full flex items-center gap-2 px-2 py-1 rounded text-sm 
                               transition-colors text-left ${selectedFile.name === file.name
                                                ? 'bg-accent/30 text-white'
                                                : 'text-white/70 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        {getFileIcon(file.name)}
                                        <span className="truncate">{file.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Editor Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Tabs */}
                    <div className="h-9 bg-[#252526] flex items-center border-b border-white/5 flex-shrink-0">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-window-bg border-r border-white/5 
                            text-sm text-white/80">
                            {getFileIcon(selectedFile.name)}
                            <span>{selectedFile.name}</span>
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className="flex-1 min-h-0">
                        <Editor
                            height="100%"
                            language={getLanguageFromFilename(selectedFile.name)}
                            value={selectedFile.content}
                            theme="vs-dark"
                            options={{
                                readOnly: true,
                                minimap: { enabled: true },
                                fontSize: 13,
                                lineNumbers: "on",
                                scrollBeyondLastLine: false,
                                wordWrap: "on",
                                padding: { top: 16 },
                                fontFamily: "'Geist Mono', 'Fira Code', 'Consolas', monospace",
                                fontLigatures: true,
                                smoothScrolling: true,
                                cursorBlinking: "smooth",
                                renderLineHighlight: "all",
                            }}
                        />
                    </div>

                    {/* Status bar */}
                    <div className="h-6 bg-accent flex items-center justify-between px-3 text-[11px] 
                          text-white/90 flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <span>UTF-8</span>
                            <span>{getLanguageFromFilename(selectedFile.name).toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span>Ln 1, Col 1</span>
                            <span>Spaces: 2</span>
                        </div>
                    </div>
                </div>
            </div>
        </Window>
    );
}
