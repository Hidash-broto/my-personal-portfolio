"use client";

import { ReactNode, useState } from "react";
import DesktopIcon from "./DesktopIcon";
import FolderViewer from "./FolderViewer";
import PDFViewer from "./PDFViewer";

interface DesktopProps {
    children: ReactNode;
}

// List of images in the Me folder
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

export default function Desktop({ children }: DesktopProps) {
    const [showMeFolder, setShowMeFolder] = useState(false);
    const [showPDFViewer, setShowPDFViewer] = useState(false);

    const handleResumeClick = () => {
        setShowPDFViewer(true);
    };

    const handleMeFolderClick = () => {
        setShowMeFolder(true);
    };

    return (
        <div className="relative bg-[#273947] h-screen w-screen overflow-hidden">
            {/* Background wallpaper */}
            <div
                className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/my-photo.png')" }}
            />

            {/* Dark tint overlay with blur */}
            {/* <div className="absolute inset-0 bg-black/50 backdrop-blur-[4px]" /> */}

            {/* Desktop Icons */}
            <div className="absolute top-16 left-10 z-20">
                <DesktopIcon
                    name="Resume.pdf"
                    type="file"
                    onClick={handleResumeClick}
                    position={{ x: 0, y: 0 }}
                />
                <DesktopIcon
                    name="Me"
                    type="folder"
                    onClick={handleMeFolderClick}
                    position={{ x: 0, y: 100 }}
                />
            </div>

            {/* Folder Viewer */}
            {showMeFolder && (
                <FolderViewer
                    folderName="Me"
                    images={meImages}
                    onClose={() => setShowMeFolder(false)}
                    position={{ x: 100, y: 80 }}
                />
            )}

            {/* PDF Viewer */}
            <PDFViewer
                isOpen={showPDFViewer}
                onClose={() => setShowPDFViewer(false)}
                pdfUrl="/Muhammed Hidash Resume.pdf"
                title="Muhammed Hidash Resume"
            />

            {/* Content layer */}
            <div className="relative z-10 h-full w-full">
                {children}
            </div>
        </div>
    );
}

