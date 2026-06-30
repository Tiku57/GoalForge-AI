import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Search, Terminal, Activity, CheckCircle2, Loader2, Workflow, AlertCircle, CalendarClock, Wand2, Flag } from 'lucide-react';
import { motion } from 'framer-motion';

interface CustomNodeData {
  label: string;
  type: string;
  agentType: string;
  status: string;
  priority: string;
  dueDate?: Date | null;
  estimatedHours?: number;
  criticalPath?: boolean;
  currentAgent?: string;
  agentMessage?: string;
}

const CustomNode = ({ data }: { data: CustomNodeData }) => {
  const isCompleted = data.status === 'COMPLETED';
  const isRunning = data.status === 'AI_RUNNING';
  
  const getIcon = () => {
    if (data.agentType === 'RESEARCH') return <Search className="w-3.5 h-3.5" />;
    if (data.agentType === 'EXECUTE') return <Terminal className="w-3.5 h-3.5" />;
    if (data.agentType === 'OPTIMIZE') return <Wand2 className="w-3.5 h-3.5" />;
    return <Workflow className="w-3.5 h-3.5" />;
  };

  const getPriorityColor = () => {
    switch (data.priority) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'MEDIUM': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'LOW': return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
      default: return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
  };

  const getBorderClass = () => {
    if (isCompleted) return 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] bg-emerald-950/20';
    if (isRunning) return 'border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-amber-950/20 animate-pulse';
    
    // Default border pulls from priority if pending
    if (data.priority === 'CRITICAL') return 'border-red-500/50 bg-neutral-900/90';
    if (data.priority === 'HIGH') return 'border-orange-500/40 bg-neutral-900/90';
    return 'border-neutral-800 hover:border-neutral-700 hover:shadow-lg transition-all duration-300 bg-neutral-900/90';
  };

  return (
    <motion.div 
      layout
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`relative px-5 py-4 rounded-2xl backdrop-blur-2xl border shadow-xl ${getBorderClass()} min-w-[300px] max-w-[340px] ${isCompleted ? 'opacity-50 grayscale-[0.2]' : 'opacity-100'}`}
    >
      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 !bg-indigo-500 border-2 border-black" />
      
      <div className="flex justify-between items-start mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-neutral-800/80 text-neutral-400 border border-neutral-700/50 shadow-inner">
            {getIcon()}
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-widest flex items-center gap-1 ${getPriorityColor()}`}>
            {data.priority === 'CRITICAL' && <AlertCircle className="w-2.5 h-2.5" />}
            {data.priority || 'MEDIUM'}
          </span>
          {data.criticalPath && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-widest flex items-center gap-1 bg-red-900/30 text-red-400 border-red-500/30">
              BOTTLENECK
            </span>
          )}
        </div>
        <div>
          {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {isRunning && <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />}
          {!isCompleted && !isRunning && <Activity className="w-4 h-4 text-neutral-600" />}
        </div>
      </div>
      
      <div className="text-sm font-semibold text-white/90 leading-tight mb-3">
        {data.label}
      </div>

      {isRunning && data.agentMessage && (
        <div className="mb-3 bg-neutral-950/50 rounded-lg p-2 border border-amber-500/30 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{data.currentAgent || 'Agent'}</span>
          </div>
          <p className="text-[10px] text-neutral-400 truncate">{data.agentMessage}</p>
          {/* Animated progress bar */}
          <div className="h-0.5 w-full bg-neutral-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500/50 via-amber-400 to-amber-500/50 w-full animate-[slide_2s_ease-in-out_infinite]" />
          </div>
        </div>
      )}
      
      <div className="mt-2 text-[10px] text-neutral-500 font-medium uppercase tracking-wider flex items-center justify-between border-t border-neutral-800/50 pt-2">
        <div className="flex gap-3">
          <span className="flex items-center gap-1">
            <Flag className="w-3 h-3 text-neutral-600" />
            {data.type}
          </span>
          {data.estimatedHours && (
            <span className="flex items-center gap-1 text-neutral-400">
              <Activity className="w-3 h-3 text-indigo-500/70" />
              {data.estimatedHours}h
            </span>
          )}
        </div>
        
        {data.dueDate && (
          <span className="flex items-center gap-1 text-indigo-400/80 bg-indigo-500/10 px-1.5 py-0.5 rounded">
            <CalendarClock className="w-3 h-3" />
            {new Date(data.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 !bg-indigo-500 border-2 border-black" />
    </motion.div>
  );
};

export default memo(CustomNode);
