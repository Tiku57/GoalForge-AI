'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Play, Pause, SkipForward, RotateCcw,
  CheckCircle2, Loader2, Workflow, Target, FileText,
  ShieldCheck, BrainCircuit, Activity, Clock
} from 'lucide-react';
import WorkflowCanvas from '@/components/graph/WorkflowCanvas';
import GlobalLogo from '@/components/ui/GlobalLogo';

interface DemoModalProps {
  onClose: () => void;
}

export default function DemoModal({ onClose }: DemoModalProps) {
  const [step, setStep] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  
  const steps = [
    { id: 1, label: 'Goal Input' },
    { id: 2, label: 'AI Planning' },
    { id: 3, label: 'Graph Generation' },
    { id: 4, label: 'Agent Execution' },
    { id: 5, label: 'Inspector & Deliverables' },
    { id: 6, label: 'Analytics & Risk' },
    { id: 7, label: 'Final Summary' }
  ];

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Main Demo Sequence Loop
  useEffect(() => {
    if (isPaused) return;

    const timers: NodeJS.Timeout[] = [];
    
    // Step 1: Goal Input (lasts 3s)
    if (step === 1) {
      timers.push(setTimeout(() => setStep(2), 3500));
    }
    // Step 2: AI Planning (lasts 2.5s)
    else if (step === 2) {
      timers.push(setTimeout(() => setStep(3), 2500));
    }
    // Step 3: Graph Generation (lasts 3s)
    else if (step === 3) {
      setShowCanvas(true);
      timers.push(setTimeout(() => setStep(4), 3000));
    }
    // Step 4: Agent Execution (lasts 4s)
    else if (step === 4) {
      timers.push(setTimeout(() => setStep(5), 4500));
    }
    // Step 5: Inspector (lasts 3s)
    else if (step === 5) {
      timers.push(setTimeout(() => setStep(6), 3500));
    }
    // Step 6: Analytics (lasts 3s)
    else if (step === 6) {
      timers.push(setTimeout(() => setStep(7), 3500));
    }

    return () => timers.forEach(clearTimeout);
  }, [step, isPaused]);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 md:p-8 overflow-hidden font-sans"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-[1400px] h-[90vh] bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
        >
          {/* Top Bar */}
          <div className="h-16 border-b border-white/10 bg-neutral-900/50 flex items-center justify-between px-6 shrink-0">
            <GlobalLogo />
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 rounded-lg p-1">
                <button onClick={() => setStep(1)} className="p-1.5 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-colors" title="Restart">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={() => setIsPaused(!isPaused)} className="p-1.5 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-colors" title={isPaused ? "Play" : "Pause"}>
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                <button onClick={() => setStep(7)} className="p-1.5 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-colors" title="Skip to End">
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={onClose}
                className="flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Skip Demo <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar (Progress) */}
            <div className="w-72 border-r border-white/10 bg-neutral-950 p-6 flex flex-col">
              <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-6">Demo Progress</h2>
              
              <div className="flex flex-col gap-6 relative">
                {/* Vertical line connecting steps */}
                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-white/10 z-0" />
                
                {steps.map((s, i) => (
                  <div key={s.id} className="relative z-10 flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-500
                      ${step > s.id ? 'bg-indigo-500 text-white' : step === s.id ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500' : 'bg-neutral-900 text-neutral-600'}
                    `}>
                      {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                    </div>
                    <span className={`text-sm font-semibold transition-colors duration-500 ${step >= s.id ? 'text-white' : 'text-neutral-500'}`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress bar at bottom of sidebar */}
              <div className="mt-auto pt-6 border-t border-white/10">
                <div className="flex justify-between text-xs text-neutral-400 mb-2 font-medium">
                  <span>Step {step} of 7</span>
                  <span>{Math.round((step / 7) * 100)}%</span>
                </div>
                <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / 7) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>

            {/* Main Content Viewport */}
            <div className="flex-1 relative bg-[#0a0a0a] overflow-hidden">
              {/* Overlay content based on step */}
              <AnimatePresence mode="wait">
                
                {/* STEP 1: Goal Input */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="max-w-2xl w-full">
                      <div className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4" /> User Input
                      </div>
                      <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">What do you want to accomplish?</h1>
                      <div className="w-full bg-neutral-900/50 border border-white/10 rounded-2xl p-6 text-2xl font-medium text-white shadow-inner flex items-center">
                        <TypewriterText text="Organise a college technical fest" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: AI Planning */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center p-12">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-2">Analyzing Objective...</h2>
                    <p className="text-neutral-400">GoalForge AI is activating the intelligence pipeline.</p>
                    
                    <div className="mt-8 flex gap-4">
                      <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400 text-sm font-medium animate-pulse flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" /> Planner Agent
                      </div>
                      <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 text-sm font-medium animate-pulse delay-75 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Security Checks
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 & 4 & 5 & 6 (Canvas visible) */}
                {step >= 3 && step <= 6 && (
                  <motion.div key="step-canvas" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                    {/* Placeholder for the Graph. We simulate the demo page look here. */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-black to-black pointer-events-none z-0" />
                    
                    {/* Simulated UI over the background */}
                    <div className="relative z-10 w-full h-full p-8 flex flex-col justify-between pointer-events-none">
                      {/* Top row */}
                      <div className="flex justify-between items-start">
                        {/* Active Objective */}
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-neutral-900/80 backdrop-blur border border-white/10 rounded-xl p-4 w-72">
                          <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-2">Active Objective</div>
                          <div className="text-sm font-semibold text-white">Organise a college technical fest</div>
                        </motion.div>

                        {/* Metrics Bar */}
                        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex gap-4">
                          <div className="bg-neutral-900/80 backdrop-blur border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            <div className="flex flex-col">
                              <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Success Prob</span>
                              <span className="text-sm font-bold text-white">
                                {step === 3 ? '45%' : step === 4 ? '72%' : step === 5 ? '84%' : '96%'}
                              </span>
                            </div>
                          </div>
                          <div className="bg-neutral-900/80 backdrop-blur border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
                            <Clock className="w-4 h-4 text-amber-400" />
                            <div className="flex flex-col">
                              <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Buffer</span>
                              <span className="text-sm font-bold text-white">14 Days</span>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Middle - Simulated Nodes Graph Visual */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="relative w-full max-w-2xl h-96">
                            {/* Simple fake nodes for the cinematic modal */}
                            <SimulatedNode x={0} y={150} title="Market Research" status={step >= 4 ? "COMPLETED" : "PENDING"} />
                            <SimulatedNode x={250} y={50} title="System Architecture" status={step >= 5 ? "COMPLETED" : step >= 4 ? "RUNNING" : "PENDING"} />
                            <SimulatedNode x={250} y={250} title="Write PRD" status={step >= 5 ? "COMPLETED" : "PENDING"} />
                            <SimulatedNode x={500} y={150} title="Develop MVP" status={step >= 6 ? "COMPLETED" : "PENDING"} />
                         </div>
                      </div>

                      {/* Right panel sliding in at step 5 */}
                      <AnimatePresence>
                        {step >= 5 && (
                          <motion.div 
                            initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
                            className="absolute top-0 right-0 bottom-0 w-[450px] bg-neutral-950/90 backdrop-blur-2xl border-l border-white/10 pointer-events-auto shadow-2xl flex flex-col"
                          >
                             <div className="p-6 border-b border-white/10">
                               <h3 className="text-lg font-bold">System Architecture</h3>
                               <p className="text-sm text-neutral-400">Node Inspector</p>
                             </div>
                             <div className="p-6 flex-1 overflow-hidden">
                               <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Deliverable Output</div>
                               <div className="prose prose-invert prose-sm">
                                 <h3>🎯 Summary</h3>
                                 <p>The Architecture Agent has finalized the technical design. We are leveraging Next.js App Router, Prisma, PostgreSQL, and React Flow.</p>
                                 <h3>✅ Action Items</h3>
                                 <ul>
                                   <li>Define Database Schema</li>
                                   <li>Design Agent Pipeline</li>
                                 </ul>
                               </div>
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {/* STEP 7: Final Summary */}
                {step === 7 && (
                  <motion.div key="step7" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex flex-col items-center justify-center bg-black p-12">
                     <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-8 border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                     </div>
                     <h2 className="text-4xl font-black text-white mb-4">Master Plan Ready</h2>
                     <p className="text-xl text-neutral-400 mb-12">GoalForge AI has autonomously executed the critical path.</p>
                     
                     <div className="grid grid-cols-2 gap-4 max-w-2xl w-full">
                       <div className="bg-neutral-900 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                         <div className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg"><Workflow className="w-5 h-5"/></div>
                         <div><div className="text-xl font-bold">26</div><div className="text-xs text-neutral-500 uppercase">Tasks Planned</div></div>
                       </div>
                       <div className="bg-neutral-900 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                         <div className="bg-purple-500/20 text-purple-400 p-2 rounded-lg"><Target className="w-5 h-5"/></div>
                         <div><div className="text-xl font-bold">7</div><div className="text-xs text-neutral-500 uppercase">Critical Milestones</div></div>
                       </div>
                       <div className="bg-neutral-900 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                         <div className="bg-amber-500/20 text-amber-400 p-2 rounded-lg"><Clock className="w-5 h-5"/></div>
                         <div><div className="text-xl font-bold">14 Days</div><div className="text-xs text-neutral-500 uppercase">Est. Completion</div></div>
                       </div>
                       <div className="bg-neutral-900 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                         <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg"><Activity className="w-5 h-5"/></div>
                         <div><div className="text-xl font-bold">96%</div><div className="text-xs text-neutral-500 uppercase">Success Probability</div></div>
                       </div>
                     </div>

                     <button onClick={onClose} className="mt-12 bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-neutral-200 transition-colors">
                       Enter Workspace
                     </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Quick Typewriter component for the modal
const TypewriterText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}<motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>|</motion.span></span>;
};

// Quick Simulated Node component for the cinematic look
const SimulatedNode = ({ x, y, title, status }: { x: number, y: number, title: string, status: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute w-56 rounded-xl border p-4 backdrop-blur-md shadow-xl transition-all duration-500
        ${status === 'COMPLETED' ? 'bg-emerald-950/20 border-emerald-500/50 opacity-50' : 
          status === 'RUNNING' ? 'bg-amber-950/20 border-amber-500/80 animate-pulse' : 
          'bg-neutral-900/90 border-neutral-700'}`}
      style={{ left: x, top: y }}
    >
      <div className="flex items-center gap-2 mb-2">
        {status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        {status === 'RUNNING' && <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />}
        {status === 'PENDING' && <Workflow className="w-4 h-4 text-neutral-400" />}
        <span className="text-xs font-bold text-white truncate">{title}</span>
      </div>
      <div className="text-[9px] text-neutral-500 font-mono">ID: {title.replace(/\s+/g, '-').toLowerCase()}</div>
    </motion.div>
  );
};
