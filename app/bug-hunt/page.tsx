import type { Metadata } from "next";
import StandaloneArena from "@/features/bug-hunt/StandaloneArena";

const description = "Catch the shortcuts that sink startups. A 60-second game on Muhammed Hidash's portfolio OS.";

export const metadata: Metadata = {
    title: { absolute: "Bug Hunt — Hidash OS" },
    description,
    alternates: { canonical: "/bug-hunt" },
    openGraph: { title: "Bug Hunt — Hidash OS", description, url: "/bug-hunt", siteName: "Muhammed Hidash", type: "website" },
    twitter: { card: "summary_large_image", title: "Bug Hunt — Hidash OS", description },
};

export default function BugHuntPage() {
    return <StandaloneArena />;
}
