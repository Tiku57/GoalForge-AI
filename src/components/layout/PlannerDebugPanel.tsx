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
    <div className="fixed bottom-6 left-[340px] z-[100] font-mono text-xs flex flex-col items-start gap-2">
      {isOpen && (
        <div className="w-[340px] shadow-2xl rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="p-4 space-y-3 text-neutral-300">
            <div className="flex flex-col gap-1">
              <span className="text-neutral-500 flex items-center gap-1"><Activity className="w-3 h-3"/> Model Used</span>
              <span className="text-indigo-400 break-all">{debugInfo.model}</span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-neutral-500 flex items-center gap-1"><Clock className="w-3 h-3"/> Latency</span>
              <span className="text-amber-400">{debugInfo.latency} ms</span>
            </div>

            {debugInfo.fallbackReason && (
              <div className="flex flex-col gap-1 mt-2 p-2 bg-red-950/40 border border-red-900/50 rounded-lg max-h-40 overflow-y-auto">
                <span className="text-red-500 flex items-center gap-1"><FileText className="w-3 h-3"/> Fallback Reason</span>
                <span className="text-red-400 text-[10px] break-words whitespace-pre-wrap">{debugInfo.fallbackReason}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border backdrop-blur-md transition-all hover:scale-105 active:scale-95 ${
          isError 
            ? 'bg-red-950/80 border-red-900/50 text-red-400 hover:bg-red-900/80' 
            : 'bg-emerald-950/80 border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/80'
        }`}
      >
        <Bug className="w-4 h-4" />
        <span className="font-bold tracking-wider text-[10px]">DEBUG</span>
        <span className={`px-1.5 py-0.5 rounded-full text-[9px] uppercase ${isError ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
          {debugInfo.status}
        </span>
        {isOpen ? <ChevronDown className="w-3 h-3 opacity-50" /> : <ChevronUp className="w-3 h-3 opacity-50" />}
      </button>
    </div>
  );
}
