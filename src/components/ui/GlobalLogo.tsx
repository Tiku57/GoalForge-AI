'use client';

import React from 'react';
import Link from 'next/link';
import { Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GlobalLogo({ className = "" }: { className?: string }) {
  return (
    <Link 
      href="/" 
      aria-label="Go to Home"
      className={`group relative z-10 flex items-center gap-2 cursor-pointer no-underline focus:outline-none ${className}`}
    >
      <motion.div
        whileHover={{ scale: 1.05, rotate: 15 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 group-hover:text-purple-400 group-hover:border-purple-500/50 group-hover:bg-purple-500/20 transition-colors duration-300 shadow-[0_0_0_rgba(168,85,247,0)] group-hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
      >
        <Target className="w-5 h-5" />
      </motion.div>
      <span className="text-xl font-bold tracking-tight text-white group-hover:text-neutral-200 transition-colors duration-300">
        GoalForge AI
      </span>
    </Link>
  );
}
