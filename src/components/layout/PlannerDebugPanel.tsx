'use client';

import { useState, useEffect } from 'react';
import { Bug, Activity, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface DebugInfo {
  model: string;
  status: string;
  latency: number;
  fallbackReason: string | null;
}

interface PlannerDebugPanelProps {
  debugInfo: DebugInfo | null;
}

export default function PlannerDebugPanel({ debugInfo }: PlannerDebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or if explicitly enabled
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG === 'true') {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible || !debugInfo) return null;

  const isError = debugInfo.status === 'FALLBACK';

  return (
    <div className="fixed top-4 right-4 z-[100] font-mono text-xs flex flex-col items-end gap-2 pointer-events-none">
      
      {/* Tiny Status Indicator (Collapsed State) */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto cursor-pointer flex items-center gap-2 h-7 px-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-neutral-300 shadow-sm transition-all hover:bg-black/80 hover:scale-105 active:scale-95 group"
      >
        <div className={`w-2 h-2 rounded-full ${isError ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
        <span className="font-semibold text-[10px] tracking-wide text-white">
          {isError ? 'OFFLINE' : 'LIVE'}
        </span>
        <div className="w-[1px] h-3 bg-white/20 mx-1" />
        <span className="text-[10px] opacity-80">{debugInfo.model.replace('models/', '').split('-').slice(0, 2).join(' ')}</span>
        <div className="w-[1px] h-3 bg-white/20 mx-1" />
        <span className="text-[10px] opacity-80 font-medium">{debugInfo.latency}ms</span>
        {isOpen ? <ChevronUp className="w-3 h-3 ml-1 opacity-50" /> : <ChevronDown className="w-3 h-3 ml-1 opacity-50" />}
      </div>

      {/* Expanded State */}
      {isOpen && (
        <div className="pointer-events-auto w-[280px] shadow-2xl rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="p-3 space-y-2 text-neutral-300">
            <div className="flex flex-col gap-0.5">
              <span className="text-neutral-500 flex items-center gap-1 text-[9px] uppercase tracking-wider"><Activity className="w-3 h-3"/> Model</span>
              <span className="text-indigo-400 break-all">{debugInfo.model}</span>
            </div>
            
            <div className="flex flex-col gap-0.5 mt-2">
              <span className="text-neutral-500 flex items-center gap-1 text-[9px] uppercase tracking-wider"><Clock className="w-3 h-3"/> Latency</span>
              <span className="text-amber-400">{debugInfo.latency} ms</span>
            </div>

            {debugInfo.fallbackReason && (
              <div className="flex flex-col gap-1 mt-3 p-2 bg-red-950/40 border border-red-900/50 rounded-lg max-h-32 overflow-y-auto">
                <span className="text-red-500 flex items-center gap-1 text-[9px] uppercase tracking-wider"><FileText className="w-3 h-3"/> Fallback Reason</span>
                <span className="text-red-400 text-[9px] leading-relaxed break-words whitespace-pre-wrap">{debugInfo.fallbackReason}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
