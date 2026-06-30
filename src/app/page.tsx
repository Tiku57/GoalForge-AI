'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  Bot, BrainCircuit, Play, CheckCircle2, ArrowRight, Zap, 
  Target, TrendingUp, Layers, Activity, Clock, ShieldCheck, 
  Workflow, ArrowUpRight, Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlobalLogo from '@/components/ui/GlobalLogo';
import DemoModal from '@/components/landing/DemoModal';

// --- Animated Counter Component ---
const AnimatedCounter = ({ value, duration = 2, suffix = "+" }: { value: number, duration?: number, suffix?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const totalSteps = 60;
      const stepTime = Math.abs(Math.floor((duration * 1000) / totalSteps));
      const increment = end / totalSteps;
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, stepTime);
      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  const displayValue = count >= 1000000 
    ? (count / 1000000).toFixed(1) + 'M'
    : count >= 1000 ? Math.floor(count / 1000) + 'K' : Math.floor(count);

  return <span ref={ref}>{displayValue}{suffix}</span>;
};

// --- Main Page ---
export default function LandingPageV2() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      
      {/* Global Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <GlobalLogo />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#statistics" className="hover:text-white transition-colors">Impact</a>
          </div>
        </div>
      </nav>

      {/* --- Background Effects --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/20 blur-[150px]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_80%,transparent_100%)]" />
      </div>

      <main className="relative z-10 pt-32 pb-20">
        {/* --- Hero Section --- */}
        <section className="px-6 max-w-7xl mx-auto flex flex-col items-center text-center mt-12 mb-32">
          {/* Hackathon Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]"
          >
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-200 tracking-wide uppercase">Built for Google x Coding Ninjas Vibe2Ship</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[1.1]"
          >
            Your Autonomous <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-purple-400">
              AI Chief of Staff.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-2xl text-neutral-400 max-w-3xl mb-12 font-medium leading-relaxed"
          >
            Stop managing tasks. Start managing outcomes. GoalForge AI breaks your objective into intelligent execution plans and helps you actually finish work before deadlines.
          </motion.p>
          
          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-lg"
          >
            <Link href="/dashboard" className="flex-1">
              <Button className="group relative h-14 w-full text-lg font-semibold bg-white text-black hover:bg-neutral-200 transition-all rounded-full overflow-hidden">
                <span className="relative z-10 flex items-center justify-center gap-2">Launch Workspace <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                <div className="absolute inset-0 bg-gradient-to-r from-white to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
            <Button 
              onClick={() => setShowDemo(true)}
              className="group h-14 flex-1 text-lg font-semibold border border-white/20 bg-black/40 backdrop-blur-md hover:bg-white/10 hover:border-white/30 text-white rounded-full transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]"
            >
              <Play className="w-5 h-5 mr-2 fill-current group-hover:text-indigo-400 transition-colors" /> Watch Live Demo
            </Button>
          </motion.div>
        </section>

        {/* --- Premium Feature Cards --- */}
        <section id="features" className="px-6 max-w-7xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">A complete operating system for goals.</h2>
            <p className="text-neutral-400 text-lg">GoalForge AI replaces traditional task managers with autonomous agents.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<BrainCircuit className="w-6 h-6 text-indigo-400" />}
              title="Autonomous AI Planning"
              description="Automatically breaks down complex, high-level goals into precise, actionable execution plans with intelligent dependencies."
            />
            <FeatureCard 
              icon={<Layers className="w-6 h-6 text-purple-400" />}
              title="Multi-Agent Pipeline"
              description="Research, Planning, Writing, Reviewing, and Validation agents work in parallel to guarantee high-quality execution."
            />
            <FeatureCard 
              icon={<Activity className="w-6 h-6 text-emerald-400" />}
              title="Live Intelligence"
              description="Real-time telemetrics on critical paths, success probabilities, and buffer days to ensure you never miss a deadline."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-amber-400" />}
              title="Panic Mode"
              description="If a deadline approaches quickly, AI instantly restructures your graph to prioritize the most critical deliverables."
            />
            <FeatureCard 
              icon={<Clock className="w-6 h-6 text-sky-400" />}
              title="Smart Integrations"
              description="Seamlessly exports actionable deliverables to Google Docs and synchronizes scheduled tasks with Google Calendar."
            />
            <FeatureCard 
              icon={<Workflow className="w-6 h-6 text-rose-400" />}
              title="Beautiful Execution"
              description="Visualize the progression of your work through our cinematic interactive DAG (Directed Acyclic Graph) UI."
            />
          </div>
        </section>

        {/* --- How It Works --- */}
        <section id="how-it-works" className="px-6 max-w-7xl mx-auto mb-32 relative">
          <div className="absolute inset-0 bg-indigo-900/5 blur-[120px] pointer-events-none" />
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How it works</h2>
            <p className="text-neutral-400 text-lg">Four steps from ambiguity to execution.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StepCard step={1} title="Enter Goal" desc="Tell the AI what you want to accomplish and set a hard deadline." />
            <StepCard step={2} title="AI Creates Plan" desc="GoalForge AI breaks your objective into a directed acyclic graph." />
            <StepCard step={3} title="Agents Execute" desc="The AI autonomously executes the critical path and drafts deliverables." />
            <StepCard step={4} title="You Finish" desc="Review the AI's work, adapt instantly, and finish before the deadline." />
          </div>
        </section>

        {/* --- Demo Statistics --- */}
        <section id="statistics" className="px-6 max-w-7xl mx-auto mb-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 border-y border-white/10 py-12 bg-neutral-950/50 backdrop-blur-md">
             <StatCard label="Plans Generated" value={50000} suffix="+" />
             <StatCard label="Tasks Completed" value={1200000} suffix="+" />
             <StatCard label="Execution Reliability" value={99.9} suffix="%" />
             <StatCard label="Hours Saved" value={250000} suffix="+" />
          </div>
        </section>

        {/* --- Testimonials --- */}
        <section className="px-6 max-w-7xl mx-auto mb-32">
           <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Loved by builders.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard 
              quote="This isn't a task manager. It's literally an AI Chief of Staff. It completely redefined how I tackle hackathons."
              author="Alex M."
              role="Software Engineer"
            />
            <TestimonialCard 
              quote="The multi-agent pipeline is incredible. I gave it a prompt to write a PRD, and it researched the market, wrote the PRD, and reviewed itself."
              author="Sarah K."
              role="Product Manager"
            />
            <TestimonialCard 
              quote="GoalForge AI's live telemetry is magic. Knowing my exact success probability and critical path at all times gives me huge peace of mind."
              author="David L."
              role="Startup Founder"
            />
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="border-t border-white/10 bg-black relative z-10 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
           <div>
             <GlobalLogo className="mb-4" />
             <p className="text-neutral-500 text-sm">Your Autonomous AI Chief of Staff. Designed to help you stop managing tasks and start managing outcomes.</p>
           </div>
           <div>
             <h4 className="font-bold mb-4 text-white">Product</h4>
             <ul className="space-y-2 text-neutral-400 text-sm">
               <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
             </ul>
           </div>
           <div>
             <h4 className="font-bold mb-4 text-white">Resources</h4>
             <ul className="space-y-2 text-neutral-400 text-sm">
               <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
               <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
             </ul>
           </div>
           <div>
             <h4 className="font-bold mb-4 text-white">Company</h4>
             <ul className="space-y-2 text-neutral-400 text-sm">
               <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
             </ul>
           </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-neutral-500 text-xs">
          <p>© 2026 GoalForge AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
             <span>Built for the Google x Coding Ninjas Vibe2Ship Hackathon</span>
             <a href="#" className="hover:text-white transition-colors"><Terminal className="w-4 h-4" /></a>
          </div>
        </div>
      </footer>

      {/* --- Demo Modal Integration --- */}
      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
    </div>
  );
}

// --- Helper Components ---

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <div className="group relative p-8 bg-neutral-900/40 hover:bg-neutral-900/80 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-3xl transition-all duration-300">
      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-neutral-400 leading-relaxed">{description}</p>
    </div>
  );
};

const StepCard = ({ step, title, desc }: { step: number, title: string, desc: string }) => {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-xl font-black text-indigo-400 mb-6 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
        {step}
      </div>
      <h4 className="text-xl font-bold mb-2">{title}</h4>
      <p className="text-neutral-400 text-sm">{desc}</p>
    </div>
  );
};

const StatCard = ({ label, value, suffix }: { label: string, value: number, suffix: string }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center">
       <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">
         <AnimatedCounter value={value} duration={2.5} suffix={suffix} />
       </div>
       <div className="text-sm font-bold text-neutral-500 uppercase tracking-widest">{label}</div>
    </div>
  );
};

const TestimonialCard = ({ quote, author, role }: { quote: string, author: string, role: string }) => {
  return (
    <div className="p-8 bg-neutral-900/40 backdrop-blur-md border border-white/10 rounded-3xl flex flex-col justify-between">
      <p className="text-lg text-neutral-300 mb-8 italic">"{quote}"</p>
      <div>
        <h4 className="font-bold text-white">{author}</h4>
        <p className="text-sm text-neutral-500">{role}</p>
      </div>
    </div>
  );
};
