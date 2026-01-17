"use client";

import { motion } from "framer-motion";
import { Code2, Sparkles } from "lucide-react";

export default function BioWidget() {
    return (
        <motion.div
            className="fixed right-6 top-1/2 transform -translate-y-1/2 w-80 "
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
        >
            <div className="glass rounded-2xl p-6 space-y-4">
                {/* Header with icon */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 
                          flex items-center justify-center shadow-lg">
                        <Code2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Muhammed Hidash K</h2>
                        <div className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-yellow-400" />
                            <span className="text-xs text-white/60">Available for hire</span>
                        </div>
                    </div>
                </div>

                {/* Tagline */}
                <div className="flex flex-wrap gap-2">
                    {["Full-Stack Developer", "Problem Solver", "Freelancer"].map((tag) => (
                        <span
                            key={tag}
                            className="px-2.5 py-1 text-xs font-medium rounded-full 
                         bg-white/10 text-white/80 border border-white/10"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Bio */}
                <p className="text-sm text-white/70 leading-relaxed">
                    I build scalable web applications that users love. Passionate about clean code,
                    great UX, and turning complex problems into elegant solutions.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                    {[
                        { label: "Years Exp", value: "5+" },
                        { label: "Projects", value: "50+" },
                        { label: "Clients", value: "30+" },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-lg font-bold text-white">{stat.value}</div>
                            <div className="text-[10px] text-white/50 uppercase tracking-wide">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
