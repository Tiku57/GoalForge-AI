'use client';

import { useState } from 'react';
import WorkflowCanvas from '@/components/graph/WorkflowCanvas';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Target, Flag } from 'lucide-react';
import GlobalLogo from '@/components/ui/GlobalLogo';
import PlannerDebugPanel from '@/components/layout/PlannerDebugPanel';

export default function DashboardPage() {
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [plannerDebugInfo, setPlannerDebugInfo] = useState<any>(null);

  const handlePlanGoal = async () => {
    if (!goal) return;
    setIsPlanning(true);
    
    try {
      const response = await fetch('/api/agents/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          goalTitle: goal, 
          goalDescription: "Generate a detailed execution plan.",
          deadline: deadline || null
        })
      });

      const data = await response.json();
      if (data.success) {
        setWorkflowData(data.plan);
        setWorkflowId(data.workflowId);
        if (data.plan.debug) {
          setPlannerDebugInfo(data.plan.debug);
        }
      } else {
        alert(data.error || 'Failed to generate plan');
      }
    } catch (error) {
      console.error(error);
      alert('Planning failed');
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-80 flex-shrink-0 max-h-[50vh] md:max-h-screen overflow-y-auto border-b md:border-b-0 md:border-r border-neutral-800 bg-neutral-950 p-6 flex flex-col gap-6 relative z-10 shadow-2xl">
        <div>
          <GlobalLogo />
          <p className="text-xs text-neutral-400 font-medium">Your Autonomous Chief of Staff</p>
        </div>
        
        <div className="flex flex-col gap-5 mt-4 flex-1">
          {/* Objective Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
              <Flag className="w-3.5 h-3.5 text-indigo-400" /> Active Objective
            </label>
            <textarea 
              className="w-full h-24 bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none transition-all placeholder:text-neutral-600 shadow-inner"
              placeholder="What are we building today?"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Hard Deadline
            </label>
            <input 
              type="date"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-neutral-300 shadow-inner"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handlePlanGoal} 
            disabled={!goal || isPlanning}
            className="w-full h-11 bg-white text-black hover:bg-neutral-200 font-bold tracking-wide rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
          >
            {isPlanning ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Requirements...
              </span>
            ) : (
              'Generate Master Plan'
            )}
          </Button>

          {/* AI Daily Briefing */}
          <div className="mt-4 flex-1 flex flex-col gap-3 border-t border-neutral-800 pt-5">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-indigo-400" /> AI Daily Briefing
            </h3>
            <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-4 text-sm leading-relaxed text-indigo-200 shadow-inner flex flex-col gap-3">
                {(() => {
                  if (!workflowData) {
                    return (
                      <>
                        <p>Awaiting your active objective.</p>
                        <p>I will generate a complete dependency graph, calculate success probability, and execute the required tasks autonomously.</p>
                      </>
                    );
                  }

                  const nodes = workflowData.nodes || [];
                  const edges = workflowData.edges || [];
                  const pendingTasks = nodes.filter((n: any) => n.data?.status !== 'COMPLETED').length;
                  
                  // Calculate bottleneck
                  const edgeCounts: Record<string, number> = {};
                  edges.forEach((e: any) => {
                    edgeCounts[e.source] = (edgeCounts[e.source] || 0) + 1;
                  });
                  let maxEdges = 0;
                  let bottleneckId: string | null = null;
                  Object.keys(edgeCounts).forEach(id => {
                    if (edgeCounts[id] > maxEdges) {
                      maxEdges = edgeCounts[id];
                      bottleneckId = id;
                    }
                  });
                  const bottleneckNode = nodes.find((n: any) => n.id === bottleneckId);
                  
                  // Deadline calc
                  let daysRemaining = 'N/A';
                  if (deadline) {
                    const diff = new Date(deadline).getTime() - new Date().getTime();
                    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 3600 * 24))).toString();
                  }

                  return (
                    <>
                      <p>Good morning. Your master plan for <strong>{goal}</strong> is ready.</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li><strong>{pendingTasks}</strong> unfinished tasks remaining.</li>
                        {deadline && <li><strong>{daysRemaining} days</strong> until hard deadline.</li>}
                        {bottleneckNode && <li>Largest bottleneck: <strong>{bottleneckNode.data?.title || bottleneckNode.id}</strong> (blocks {maxEdges} tasks)</li>}
                      </ul>
                      <div className="bg-indigo-900/40 px-3 py-2 rounded-lg border border-indigo-500/30 text-xs font-medium mt-2">
                        <span className="text-indigo-300 block mb-1 uppercase tracking-widest text-[9px] font-bold">Recommended Action</span>
                        Engage Auto-Execute to trigger the autonomous pipeline.
                      </div>
                    </>
                  );
                })()}
            </div>
          </div>
        </div>

        <div className="mt-auto border-t border-neutral-800 pt-6">
          <p className="text-[10px] text-neutral-500 text-center uppercase tracking-widest font-semibold">
            Vibe2Ship Hackathon Demo
          </p>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 relative bg-[#0a0a0a]">
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${workflowData?.metrics?.riskScore === 'Critical' ? 'from-red-900/20' : 'from-indigo-900/10'} via-black to-black pointer-events-none z-0 transition-colors duration-1000`} />
        {workflowData ? (
          <WorkflowCanvas dynamicData={workflowData} workflowId={workflowId} deadline={deadline} plannerDebugInfo={plannerDebugInfo} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-500 flex-col gap-4 z-10">
            {plannerDebugInfo && (
               <div className="absolute top-4 right-4 z-[100]">
                 <PlannerDebugPanel debugInfo={plannerDebugInfo} />
               </div>
            )}
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-2xl">
              <Target className="w-8 h-8 text-neutral-600" />
            </div>
            <p className="font-medium">Define your objective to start forging.</p>
          </div>
        )}
      </main>
    </div>
  );
}
