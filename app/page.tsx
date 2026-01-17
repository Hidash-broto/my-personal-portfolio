"use client";

import { useEffect, useState } from "react";
import { WindowManagerProvider } from "@/components/WindowManager";
import Desktop from "@/components/Desktop";
import TopMenuBar from "@/components/TopMenuBar";
import Dock from "@/components/Dock";
import BioWidget from "@/components/BioWidget";
import VSCodeWindow from "@/components/VSCodeWindow";
import MobileView from "@/components/MobileView";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (isMobile) {
    return <MobileView />;
  }

  return (
    <WindowManagerProvider>
      <Desktop>
        <TopMenuBar />
        <BioWidget />
        <Dock />

        {/* VS Code Windows */}
        <VSCodeWindow
          windowId="experience"
          defaultPosition={{ x: 80, y: 60 }}
        />
        <VSCodeWindow
          windowId="projects"
          defaultPosition={{ x: 140, y: 100 }}
        />
        <VSCodeWindow
          windowId="about"
          defaultPosition={{ x: 200, y: 80 }}
        />
        <VSCodeWindow
          windowId="whyHireMe"
          defaultPosition={{ x: 120, y: 120 }}
        />
        <VSCodeWindow
          windowId="contact"
          defaultPosition={{ x: 160, y: 90 }}
        />
      </Desktop>
    </WindowManagerProvider>
  );
}
