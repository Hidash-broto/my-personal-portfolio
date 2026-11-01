"use client";

import { motion } from "framer-motion";
import { Code2, Sparkles } from "lucide-react";

export default function BioWidget() {
    return (
        <motion.div
            className="fixed right-6 top-1/2 transform -translate-y-1/2 w-100 z-30"
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
                        <h2 className="text-lg font-semibold text-white">Muhammed Hidash</h2>
                        <div className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-yellow-400" />
                            <span className="text-xs text-white/60">CTO @ Dentobees</span>
                        </div>
                    </div>
                </div>

                {/* Headline */}
                <p className="text-base font-semibold text-white leading-snug">
                    Startup builder. Tech by craft, business by curiosity.
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                    {["Startup Builder", "Systems Architecture", "Product Engineering", "Applied AI", "Zero-to-One"].map((tag) => (
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
                    Engineer at heart, product builder by choice. I lead engineering at Dentobees, where we take products from zero to paying customers, in India and beyond. I care about fundamentals, taste and a clear vision, and I stay close to the customers we build for.
                </p>
            </div>
        </motion.div>
    );
}
