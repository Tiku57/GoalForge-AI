'use client';

import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { NodeInspector } from '@/components/layout/NodeInspector';
import CustomNode from './CustomNode';
import dagre from 'dagre';
import { Button } from '@/components/ui/button';
import { Play, Loader2, FastForward, Activity, Clock, AlertTriangle } from 'lucide-react';
import PlannerDebugPanel from '@/components/layout/PlannerDebugPanel';

const nodeTypes: NodeTypes = {
  milestone: CustomNode,
  task: CustomNode,
  action: CustomNode,
  default: CustomNode // Fallback
};

// Dagre layout configuration
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Node width and height based on our CustomNode design
  const nodeWidth = 320;
  const nodeHeight = 180; // Increased for priority badges and spacing

  dagreGraph.setGraph({ rankdir: direction, nodesep: 80, edgesep: 50, ranksep: 120 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: 'top' as any,
      sourcePosition: 'bottom' as any,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  // Calculate True Critical Path algorithmically (Longest Path in DAG)
  const adj = new Map<string, string[]>();
  const reverseAdj = new Map<string, string[]>();
  edges.forEach(e => {
    if (!adj.has(e.source)) adj.set(e.source, []);
    adj.get(e.source)!.push(e.target);
    if (!reverseAdj.has(e.target)) reverseAdj.set(e.target, []);
    reverseAdj.get(e.target)!.push(e.source);
  });

  const nodeHours = new Map<string, number>();
  nodes.forEach(n => nodeHours.set(n.id, Number(n.data.estimatedHours) || 0));

  const memo = new Map<string, { cost: number, path: string[] }>();

  function dfsLongestPath(u: string): { cost: number, path: string[] } {
    if (memo.has(u)) return memo.get(u)!;
    const neighbors = adj.get(u) || [];
    if (neighbors.length === 0) {
      const res = { cost: nodeHours.get(u) || 0, path: [u] };
      memo.set(u, res);
      return res;
    }
    
    let maxCost = 0;
    let bestPath: string[] = [];
    for (const v of neighbors) {
      const { cost, path } = dfsLongestPath(v);
      if (cost > maxCost) {
        maxCost = cost;
        bestPath = path;
      }
    }
    
    const res = { cost: (nodeHours.get(u) || 0) + maxCost, path: [u, ...bestPath] };
    memo.set(u, res);
    return res;
  }

  let globalMax = 0;
  let criticalNodeIds = new Set<string>();
  
  nodes.forEach(n => {
    // start from nodes with in-degree 0
    if (!reverseAdj.has(n.id) || reverseAdj.get(n.id)!.length === 0) {
      const res = dfsLongestPath(n.id);
      if (res.cost > globalMax) {
        globalMax = res.cost;
        criticalNodeIds = new Set(res.path);
      }
    }
  });

  // Fallback if graph is empty or has issues
  if (criticalNodeIds.size === 0) {
    nodes.forEach(n => {
      if (n.data.criticalPath) criticalNodeIds.add(n.id);
    });
  }

  const newEdges = edges.map((edge) => {
    const isCritical = criticalNodeIds.has(edge.source) && criticalNodeIds.has(edge.target);
    return {
      ...edge,
      animated: isCritical ? true : edge.animated,
      style: isCritical ? { stroke: '#ef4444', strokeWidth: 3, filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.6))' } : { stroke: '#525252', strokeWidth: 2 }
    };
  });

  return { nodes: newNodes, edges: newEdges, criticalNodeIds };
};

interface WorkflowCanvasProps {
  dynamicData?: any;
  workflowId?: string | null;
  deadline?: string;
  plannerDebugInfo?: any;
}

export default function WorkflowCanvas({ dynamicData, workflowId, deadline, plannerDebugInfo }: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isAutoExecuting, setIsAutoExecuting] = useState(false);
  const [resultsMap, setResultsMap] = useState<Record<string, string>>({});
  const [pipelineMap, setPipelineMap] = useState<Record<string, any[]>>({});
  const [criticalNodeIds, setCriticalNodeIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (dynamicData && dynamicData.nodes && dynamicData.edges) {
      const { nodes: layoutedNodes, edges: layoutedEdges, criticalNodeIds: cIds } = getLayoutedElements(
        dynamicData.nodes,
        dynamicData.edges
      );
      
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
      setCriticalNodeIds(cIds);
      setSelectedNodeId(null);
      setResultsMap({});
      setPipelineMap({});
      setIsAutoExecuting(false);
    }
  }, [dynamicData, setNodes, setEdges]);

  // Dynamically style edges based on execution state
  const styledEdges = edges.map(edge => {
    const isExecutingTarget = selectedNodeId === edge.target && isExecuting;
    const isCritical = criticalNodeIds.has(edge.source) && criticalNodeIds.has(edge.target);
    
    if (isExecutingTarget) {
      return {
        ...edge,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 3, filter: 'drop-shadow(0 0 10px rgba(99,102,241,0.8))' }
      };
    }
    
    return {
      ...edge,
      animated: isCritical ? true : false,
      style: isCritical ? { stroke: '#ef4444', strokeWidth: 3, filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.6))' } : { stroke: '#525252', strokeWidth: 2 }
    };
  });

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleExecute = async (nodeId: string) => {
    setIsExecuting(true);
    
    // Update node status visually to running
    setNodes((nds) => nds.map(n => {
      if (n.id === nodeId) {
        return { ...n, data: { ...n.data, status: 'AI_RUNNING', currentAgent: 'Initializing', agentMessage: 'Connecting to AI Pipeline...' } };
      }
      return n;
    }));

    try {
      const response = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId })
      });
      
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      let currentPipelineLog: any[] = [];
      let finalData: string = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            
            if (event.type === 'status') {
              // Append to pipeline log
              currentPipelineLog = [...currentPipelineLog, { 
                agent: event.agent, 
                status: event.state, 
                message: event.message,
                time: new Date().toISOString()
              }];
              setPipelineMap(prev => ({ ...prev, [nodeId]: currentPipelineLog }));

              // Update node visually with live status
              setNodes((nds) => nds.map(n => {
                if (n.id === nodeId) {
                  return { ...n, data: { ...n.data, currentAgent: event.agent, agentMessage: event.message } };
                }
                return n;
              }));
            } else if (event.type === 'complete') {
              finalData = event.data.result?.content || event.data.result;
            } else if (event.type === 'error') {
              throw new Error(event.error);
            }
          } catch (e) {
            console.error("Error parsing stream chunk", e);
          }
        }
      }

      // Execution finished successfully
      setResultsMap(prev => ({ ...prev, [nodeId]: finalData }));
      setNodes((nds) => nds.map(n => {
        if (n.id === nodeId) {
          return { ...n, data: { ...n.data, status: 'COMPLETED', currentAgent: undefined, agentMessage: undefined } };
        }
        return n;
      }));
      return true;
      
    } catch (error) {
      console.error(error);
      setNodes((nds) => nds.map(n => {
        if (n.id === nodeId) {
          return { ...n, data: { ...n.data, status: 'PENDING', currentAgent: undefined, agentMessage: undefined } };
        }
        return n;
      }));
      return false;
    } finally {
      setIsExecuting(false);
    }
  };

  const handleAutoExecute = async () => {
    if (!workflowId) return;
    setIsAutoExecuting(true);
    
    let keepRunning = true;

    while (keepRunning) {
      try {
        const response = await fetch('/api/agents/auto-execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workflowId })
        });
        
        const data = await response.json();
        
        if (data.success && data.nodeId) {
          // Focus the node being executed
          setSelectedNodeId(data.nodeId);
          // Execute the specific node
          const success = await handleExecute(data.nodeId);
          if (!success) {
            keepRunning = false; // Stop auto-executing on failure
            alert("Auto Execution paused due to an error.");
          }
          keepRunning = data.hasMore;
        } else {
          keepRunning = false;
          if (data.message) {
            console.log(data.message);
          }
        }
      } catch (error) {
        console.error("Auto Execute Loop Error:", error);
        keepRunning = false;
      }
    }

    setIsAutoExecuting(false);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;
  const initialMetrics = dynamicData?.metrics;

  // Calculate Dynamic Metrics based on live graph execution state
  const totalEstimatedHours = nodes.reduce((acc, node: any) => acc + (Number(node.data.estimatedHours) || 0), 0);
  const completedHours = nodes.filter((n: any) => n.data.status === 'COMPLETED').reduce((acc, node: any) => acc + (Number(node.data.estimatedHours) || 0), 0);
  
  const baseProbability = initialMetrics?.completionProbability || 50;
  const progressRatio = totalEstimatedHours > 0 ? (completedHours / totalEstimatedHours) : 0;
  const dynamicProbability = Math.min(100, Math.round(baseProbability + (progressRatio * (100 - baseProbability))));

  let bufferDays = initialMetrics?.bufferDays || 0;
  let riskScore = initialMetrics?.riskScore || "Medium Risk";

  if (deadline && totalEstimatedHours > 0) {
    const dDate = new Date(deadline);
    const today = new Date();
    const daysRemaining = Math.max(0, Math.ceil((dDate.getTime() - today.getTime()) / (1000 * 3600 * 24)));
    
    // Assume 8 hours of work per day capacity
    const hoursRemaining = totalEstimatedHours - completedHours;
    const daysNeeded = Math.ceil(hoursRemaining / 8);
    bufferDays = daysRemaining - daysNeeded;

    if (bufferDays < 0) riskScore = "Critical";
    else if (bufferDays <= 2) riskScore = "High Risk";
    else if (bufferDays <= 5) riskScore = "Medium Risk";
    else riskScore = "Low Risk";
  }

  const metrics = initialMetrics ? {
    ...initialMetrics,
    completionProbability: dynamicProbability,
    bufferDays,
    riskScore
  } : null;

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a]">
      {/* Top Action Bar */}
      <div className="h-20 border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-md flex items-center justify-between px-6 z-20">
        <div>
          <Button 
            onClick={handleAutoExecute}
            disabled={isAutoExecuting || !workflowId || isExecuting}
            className="h-11 px-6 rounded-xl font-bold tracking-wide bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all border border-indigo-500/50"
          >
            {isAutoExecuting ? (
               <span className="flex items-center gap-2">
                 <Loader2 className="w-4 h-4 animate-spin" /> Autopilot Engaged
               </span>
            ) : (
               <span className="flex items-center gap-2">
                 <FastForward className="w-4 h-4 fill-current" /> Auto Execute Workflow
               </span>
            )}
          </Button>
        </div>

        {metrics && (
          <div className="flex items-center gap-4">
            <div className="h-11 flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-4 gap-3 shadow-inner">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Success Prob</span>
                <span className="text-sm font-bold text-white">{metrics.completionProbability}%</span>
              </div>
            </div>
            
            <div className="h-11 flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-4 gap-3 shadow-inner">
              <Clock className="w-4 h-4 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Buffer</span>
                <span className="text-sm font-bold text-white">{metrics.bufferDays} Days</span>
              </div>
            </div>

            <div className={`h-11 flex items-center border rounded-xl px-4 gap-3 shadow-inner ${metrics.riskScore === 'Critical' ? 'bg-red-950/30 border-red-900' : 'bg-neutral-900 border-neutral-800'}`}>
              <AlertTriangle className={`w-4 h-4 ${metrics.riskScore === 'Critical' ? 'text-red-500' : 'text-rose-400'}`} />
              <div className="flex flex-col">
                <span className={`text-[9px] uppercase tracking-widest font-bold ${metrics.riskScore === 'Critical' ? 'text-red-400' : 'text-neutral-500'}`}>Risk Profile</span>
                <span className="text-sm font-bold text-white">{metrics.riskScore}</span>
              </div>
            </div>
            
            {plannerDebugInfo && (
              <>
                <div className="w-[1px] h-8 bg-neutral-800 mx-2" />
                <PlannerDebugPanel debugInfo={plannerDebugInfo} />
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Canvas + Sidebar Area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={styledEdges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
            colorMode="dark"
            proOptions={{ hideAttribution: true }}
          >
            <Controls className="bg-neutral-900 border-neutral-800 fill-neutral-400 mb-6 ml-6" />
            <Background gap={24} size={1.5} color="#333" />
          </ReactFlow>
        </div>

        {/* Right Panel (Node Inspector) */}
        <div className={`border-l border-neutral-800 bg-neutral-950/90 backdrop-blur-3xl flex flex-col transition-all duration-300 z-10 ${selectedNodeId ? 'w-[450px]' : 'w-0 overflow-hidden border-none'}`}>
          <div className="w-[450px] h-full">
            <NodeInspector 
              selectedNode={selectedNode} 
              onExecute={handleExecute} 
              isExecuting={isExecuting}
              resultData={selectedNodeId ? resultsMap[selectedNodeId] : null}
              pipelineLogs={selectedNodeId ? pipelineMap[selectedNodeId] : null}
              nodes={nodes}
              edges={styledEdges}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
