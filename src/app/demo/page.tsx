'use client';

import React, { useState, useEffect } from 'react';
import WorkflowCanvas from '@/components/graph/WorkflowCanvas';
import { Target, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import GlobalLogo from '@/components/ui/GlobalLogo';

// Massive hardcoded demo graph to guarantee it looks incredible on stage
const demoData = {
  nodes: [
    { id: 'n1', type: 'task', position: { x: 0, y: 0 }, data: { title: 'Market Research', agentType: 'RESEARCH', priority: 'HIGH', estimatedHours: 8, criticalPath: false, status: 'pending' } },
    { id: 'n2', type: 'milestone', position: { x: 0, y: 0 }, data: { title: 'System Architecture', agentType: 'EXECUTE', priority: 'CRITICAL', estimatedHours: 24, criticalPath: true, status: 'pending' } },
    { id: 'n3', type: 'task', position: { x: 0, y: 0 }, data: { title: 'Write Product Requirements', agentType: 'WRITER', priority: 'HIGH', estimatedHours: 12, criticalPath: true, status: 'pending' } },
    { id: 'n4', type: 'task', position: { x: 0, y: 0 }, data: { title: 'UI/UX Design', agentType: 'EXECUTE', priority: 'MEDIUM', estimatedHours: 16, criticalPath: false, status: 'pending' } },
    { id: 'n5', type: 'task', position: { x: 0, y: 0 }, data: { title: 'Develop Frontend MVP', agentType: 'EXECUTE', priority: 'CRITICAL', estimatedHours: 40, criticalPath: true, status: 'pending' } },
    { id: 'n6', type: 'task', position: { x: 0, y: 0 }, data: { title: 'Develop Backend API', agentType: 'EXECUTE', priority: 'CRITICAL', estimatedHours: 35, criticalPath: true, status: 'pending' } },
    { id: 'n7', type: 'task', position: { x: 0, y: 0 }, data: { title: 'Security Audit', agentType: 'REVIEW', priority: 'HIGH', estimatedHours: 8, criticalPath: false, status: 'pending' } },
    { id: 'n8', type: 'milestone', position: { x: 0, y: 0 }, data: { title: 'Launch V1 to Production', agentType: 'EXECUTE', priority: 'CRITICAL', estimatedHours: 4, criticalPath: true, status: 'pending' } },
  ],
  edges: [
    { id: 'e1-2', source: 'n1', target: 'n2', type: 'smoothstep' },
    { id: 'e1-3', source: 'n1', target: 'n3', type: 'smoothstep' },
    { id: 'e3-4', source: 'n3', target: 'n4', type: 'smoothstep' },
    { id: 'e2-6', source: 'n2', target: 'n6', type: 'smoothstep' },
    { id: 'e4-5', source: 'n4', target: 'n5', type: 'smoothstep' },
    { id: 'e6-5', source: 'n6', target: 'n5', type: 'smoothstep' },
    { id: 'e5-7', source: 'n5', target: 'n7', type: 'smoothstep' },
    { id: 'e5-8', source: 'n5', target: 'n8', type: 'smoothstep' },
    { id: 'e7-8', source: 'n7', target: 'n8', type: 'smoothstep' },
  ],
  metrics: {
    riskScore: 'Low',
    completionProb: 45,
    bufferDays: 14
  }
};

export default function DemoPage() {
  const [data, setData] = useState(demoData);
  const [probability, setProbability] = useState(45);

  useEffect(() => {
    let currentData = JSON.parse(JSON.stringify(demoData)); // deep clone
    let currentProb = 45;
    
    // Simulate auto-execution stepping through the DAG
    const executeNode = (nodeId: string, delay: number, addProb: number) => {
      setTimeout(() => {
        // Mark node as executing
        currentData = {
          ...currentData,
          nodes: currentData.nodes.map((n: any) => n.id === nodeId ? { ...n, data: { ...n.data, status: 'AI_RUNNING' } } : n)
        };
        setData(currentData);
        
        // Then complete it
        setTimeout(() => {
          currentData = {
            ...currentData,
            nodes: currentData.nodes.map((n: any) => n.id === nodeId ? { ...n, data: { ...n.data, status: 'COMPLETED' } } : n)
          };
          setData(currentData);
          currentProb += addProb;
          setProbability(currentProb);
        }, 1500);

      }, delay);
    };

    // Orchestrate the perfect sequence
    executeNode('n1', 1000, 5); // Research
    executeNode('n3', 3500, 8); // PRD
    executeNode('n2', 4000, 12); // Arch
    executeNode('n4', 6500, 6); // UI
    executeNode('n6', 7000, 10); // Backend
    executeNode('n5', 10000, 15); // Frontend
    executeNode('n7', 13000, 4); // Security
    executeNode('n8', 16000, 10); // Launch! (Hits 95%+)

  }, []);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      <aside className="w-80 border-r border-neutral-800 bg-neutral-950 p-6 flex flex-col gap-6 shadow-2xl relative z-10">
        <GlobalLogo />
        
        <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-xs mb-1">
            <ShieldCheck className="w-4 h-4" /> Live Demo Mode
          </div>
          <p className="text-sm text-indigo-200">The autonomous engine is automatically executing the graph. This requires zero human intervention.</p>
        </div>

        <div className="mt-4">
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Success Probability</div>
          <div className="text-5xl font-black text-white">{probability}%</div>
          
          <div className="w-full bg-neutral-900 h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
              style={{ width: `${probability}%` }}
            />
          </div>
        </div>

        <div className="mt-auto">
          <div className="bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs font-bold">
            All API requirements mocked for flawless offline Vibe2Ship demonstration.
          </div>
        </div>
      </aside>

      <main className="flex-1 relative bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-black to-black pointer-events-none z-0" />
        <WorkflowCanvas dynamicData={data} workflowId="demo-mode" deadline={new Date(Date.now() + 30*24*60*60*1000).toISOString()} />
      </main>
    </div>
  );
}
