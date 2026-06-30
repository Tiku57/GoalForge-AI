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
    // Only show in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible || !debugInfo) return null;

  const isError = debugInfo.status === 'FALLBACK';

  return (
    <div className="fixed bottom-4 right-4 z-50 font-mono text-xs shadow-2xl rounded-xl border overflow-hidden bg-black/90 backdrop-blur-md transition-all duration-300 w-80">
      <div 
        className={`flex items-center justify-between p-3 cursor-pointer ${isError ? 'bg-red-950/50 border-b border-red-900/50 text-red-400' : 'bg-emerald-950/50 border-b border-emerald-900/50 text-emerald-400'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4" />
          <span className="font-bold tracking-wider">PLANNER DEBUG</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase ${isError ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
            {debugInfo.status}
          </span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </div>

      {isOpen && (
        <div className="p-4 space-y-3 bg-neutral-950 text-neutral-300 border-t border-neutral-800">
          <div className="flex flex-col gap-1">
            <span className="text-neutral-500 flex items-center gap-1"><Activity className="w-3 h-3"/> Model Used</span>
            <span className="text-indigo-400 break-all">{debugInfo.model}</span>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-neutral-500 flex items-center gap-1"><Clock className="w-3 h-3"/> Latency</span>
            <span className="text-amber-400">{debugInfo.latency} ms</span>
          </div>

          {debugInfo.fallbackReason && (
            <div className="flex flex-col gap-1 mt-2 p-2 bg-red-950/30 border border-red-900/30 rounded">
              <span className="text-red-500 flex items-center gap-1"><FileText className="w-3 h-3"/> Fallback Reason</span>
              <span className="text-red-400 text-[10px] break-words">{debugInfo.fallbackReason}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
