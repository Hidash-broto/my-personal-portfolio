"use client";

import { ReactNode } from "react";

interface DesktopProps {
    children: ReactNode;
}

export default function Desktop({ children }: DesktopProps) {
    return (
        <div className="relative bg-[#273947] h-screen w-screen overflow-hidden">
            {/* Background wallpaper */}
            <div
                className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/my-photo.png')" }}
            />

            {/* Dark tint overlay with blur */}
            {/* <div className="absolute inset-0 bg-black/50 backdrop-blur-[4px]" /> */}

            {/* Content layer */}
            <div className="relative z-10 h-full w-full">
                {children}
            </div>
        </div>
    );
}
