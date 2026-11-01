import Link from "next/link";
import { LINKEDIN_URL } from "@/data/links";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return (
        // html/body are overflow:hidden for the desktop UI, so the blog scrolls inside its own container
        <div className="h-full overflow-y-auto bg-[#0a0a0a] text-white/85">
            <header className="border-b border-white/10">
                <nav className="mx-auto max-w-2xl px-4 sm:px-6 h-14 flex items-center justify-between text-sm">
                    <Link href="/" className="font-semibold text-white hover:text-white/80 transition-colors">
                        Muhammed Hidash
                    </Link>
                    <div className="flex items-center gap-5 text-white/60">
                        <Link href="/blog" className="hover:text-white transition-colors">Notes</Link>
                        <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                            LinkedIn
                        </a>
                    </div>
                </nav>
            </header>

            <main className="mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16">{children}</main>

            <footer className="border-t border-white/10">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 text-sm text-white/50 space-y-2">
                    <p className="text-white/80 font-medium">Startup builder. Tech by craft, business by curiosity.</p>
                    <p>
                        Engineer at heart, product builder by choice. CTO at Dentobees.{" "}
                        <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300">
                            Say hi on LinkedIn →
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
