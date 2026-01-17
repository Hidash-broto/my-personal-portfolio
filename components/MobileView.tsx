"use client";

import { motion } from "framer-motion";
import { Briefcase, FolderGit2, User, Rocket, Mail, Code2, Sparkles, ExternalLink } from "lucide-react";

interface AppCardProps {
    title: string;
    icon: typeof Briefcase;
    color: string;
    description: string;
    delay: number;
}

function AppCard({ title, icon: Icon, color, description, delay }: AppCardProps) {
    return (
        <motion.div
            className="glass rounded-2xl p-4 space-y-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay, type: "spring", stiffness: 100 }}
        >
            <div className="flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                        background: `linear-gradient(135deg, ${color}dd, ${color}99)`,
                    }}
                >
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                </div>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">{description}</p>
            <button className="flex items-center gap-1 text-xs text-accent hover:text-blue-400 transition-colors">
                <span>View Details</span>
                <ExternalLink className="w-3 h-3" />
            </button>
        </motion.div>
    );
}

export default function MobileView() {
    const apps = [
        {
            title: "Experience",
            icon: Briefcase,
            color: "#3b82f6",
            description: "5+ years of professional experience building web applications.",
        },
        {
            title: "Projects",
            icon: FolderGit2,
            color: "#8b5cf6",
            description: "50+ projects delivered across e-commerce, SaaS, and more.",
        },
        {
            title: "About Me",
            icon: User,
            color: "#06b6d4",
            description: "Full-stack developer passionate about clean code and UX.",
        },
        {
            title: "Why Hire Me",
            icon: Rocket,
            color: "#f59e0b",
            description: "I ship fast, communicate well, and care about quality.",
        },
        {
            title: "Contact",
            icon: Mail,
            color: "#10b981",
            description: "Let's connect! Open to full-time, contract, and freelance.",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-8 pb-24">
            {/* Header */}
            <motion.div
                className="text-center mb-8"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
            >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl 
                        bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg">
                    <Code2 className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Developer Portfolio</h1>
                <div className="flex items-center justify-center gap-2 text-sm text-white/60">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span>Available for hire</span>
                </div>
            </motion.div>

            {/* Tagline Pills */}
            <motion.div
                className="flex flex-wrap justify-center gap-2 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {["Full-Stack Developer", "Problem Solver", "Freelancer"].map((tag) => (
                    <span
                        key={tag}
                        className="px-3 py-1 text-xs font-medium rounded-full 
                       bg-white/10 text-white/80 border border-white/10"
                    >
                        {tag}
                    </span>
                ))}
            </motion.div>

            {/* Bio */}
            <motion.p
                className="text-center text-sm text-white/70 mb-8 max-w-sm mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                I build scalable web applications that users love. Tap on any section below to learn more.
            </motion.p>

            {/* App Cards Grid */}
            <div className="space-y-3 max-w-md mx-auto">
                {apps.map((app, index) => (
                    <AppCard key={app.title} {...app} delay={0.4 + index * 0.1} />
                ))}
            </div>

            {/* Bottom indicator */}
            <motion.div
                className="fixed bottom-6 left-1/2 transform -translate-x-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <div className="w-32 h-1 rounded-full bg-white/20" />
            </motion.div>
        </div>
    );
}
