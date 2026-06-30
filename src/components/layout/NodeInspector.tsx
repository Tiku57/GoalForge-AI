import React, { useState, useMemo } from 'react';
import { Node, Edge } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle2, Loader2, FileText, Bot, Layers, CalendarClock, AlertCircle, FilePlus, CalendarPlus, Lightbulb, Activity } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface NodeInspectorProps {
  selectedNode: Node | null;
  onExecute: (nodeId: string) => void;
  isExecuting: boolean;
  resultData?: string | null;
  pipelineLogs?: any[] | null;
  nodes?: Node[];
  edges?: Edge[];
}

export function NodeInspector({ selectedNode, onExecute, isExecuting, resultData, pipelineLogs, nodes, edges }: NodeInspectorProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'reasoning' | 'deliverables' | 'timeline' | 'prerequisites' | 'logs' | 'metrics'>('details');

  const { incomingNodes, outgoingNodes, depth } = useMemo(() => {
    if (!selectedNode || !nodes || !edges) return { incomingNodes: [], outgoingNodes: [], depth: 1 };
    
    const incEdges = edges.filter(e => e.target === selectedNode.id);
    const outEdges = edges.filter(e => e.source === selectedNode.id);
    
    const incNodes = incEdges.map(e => nodes.find(n => n.id === e.source)).filter(Boolean) as Node[];
    const outNodes = outEdges.map(e => nodes.find(n => n.id === e.target)).filter(Boolean) as Node[];

    const calculateDepth = (nodeId: string, currentDepth: number = 1): number => {
      const incoming = edges.filter(e => e.target === nodeId);
      if (incoming.length === 0) return currentDepth;
      return Math.max(...incoming.map(e => calculateDepth(e.source, currentDepth + 1)));
    };

    return { incomingNodes: incNodes, outgoingNodes: outNodes, depth: calculateDepth(selectedNode.id) };
  }, [selectedNode, nodes, edges]);

  const handleExportPdf = async () => {
    if (!resultData || !selectedNode) return;
    
    try {
      const pdfMakeModule = (await import('pdfmake/build/pdfmake')).default;
      const pdfFontsModule = (await import('pdfmake/build/vfs_fonts')).default;
      // @ts-ignore
      const htmlToPdfmake = (await import('html-to-pdfmake')).default;
      const { marked } = await import('marked');

      (pdfMakeModule as any).vfs = pdfFontsModule;

      const data = selectedNode.data as any;
      const title = data.title || data.label || 'Task';
      const status = data.status || 'PENDING';
      const priority = data.priority || 'MEDIUM';
      const estimatedHours = data.estimatedHours || 'N/A';
      // Sanitize AI Output for PDF Rendering
      const sanitizeForPdf = (text: string) => {
        if (!text) return text;
        return text
          // Arrows
          .replace(/→/g, '->')
          .replace(/←/g, '<-')
          .replace(/↓/g, '\\n|\\nv') // Better vertical arrows
          // Bullets and Marks
          .replace(/•/g, '-')
          .replace(/✓/g, '[OK]')
          .replace(/✔/g, '[Done]')
          .replace(/✗/g, '[Failed]')
          // Common Emojis
          .replace(/🚀/g, 'Rocket')
          .replace(/📌/g, 'Note')
          .replace(/📄/g, 'Document')
          .replace(/⚠️/g, 'Warning')
          .replace(/💡/g, 'Idea')
          .replace(/🤖/g, 'AI')
          .replace(/📅/g, 'Calendar')
          // Box Drawing (ASCII Architecture)
          .replace(/[┌┐└┘]/g, '+')
          .replace(/[╭╮╰╯]/g, '+')
          .replace(/[━─]/g, '-')
          .replace(/[││]/g, '|')
          .replace(/█/g, '#')
          // Typography
          .replace(/…/g, '...')
          .replace(/[“”]/g, '"')
          .replace(/[‘’]/g, "'")
          .replace(/[—–]/g, '-')
          // Strip invisible chars (Zero-width spaces, etc)
          .replace(/[\\u200B-\\u200D\\uFEFF]/g, '');
      };

      const cleanData = sanitizeForPdf(resultData);
      
      const html = await marked.parse(cleanData);
      const contentPdf = htmlToPdfmake(html, {
        defaultStyles: {
          p: { margin: [0, 5, 0, 10] },
          h1: { fontSize: 24, bold: true, margin: [0, 10, 0, 10], color: '#4f46e5' },
          h2: { fontSize: 18, bold: true, margin: [0, 8, 0, 8] },
          h3: { fontSize: 14, bold: true, margin: [0, 6, 0, 6] },
          code: { background: '#f4f4f5', padding: 2 },
          pre: { background: '#f4f4f5', padding: 8, margin: [0, 5, 0, 10] },
          table: { margin: [0, 5, 0, 15] }
        }
      });

      const docDefinition = {
        header: function() {
          return {
            text: 'GoalForge AI - Autonomous Execution Report',
            margin: [40, 20, 40, 10],
            fontSize: 10,
            color: '#6b7280',
            alignment: 'right'
          }
        },
        footer: function(currentPage: number, pageCount: number) {
          return {
            text: `Page ${currentPage} of ${pageCount}`,
            alignment: 'center',
            fontSize: 10,
            margin: [0, 10, 0, 0]
          };
        },
        content: [
          { text: title, style: 'header' },
          { 
            table: {
              widths: ['*', '*', '*', '*'],
              body: [
                [{ text: 'Priority', bold: true, color: '#6b7280' }, { text: 'Status', bold: true, color: '#6b7280' }, { text: 'Est. Hours', bold: true, color: '#6b7280' }, { text: 'Date Generated', bold: true, color: '#6b7280' }],
                [priority, status, estimatedHours.toString(), new Date().toLocaleDateString()]
              ]
            },
            layout: 'lightHorizontalLines',
            margin: [0, 10, 0, 20]
          },
          { text: 'AI Deliverables', style: 'subheader' },
          ...contentPdf
        ],
        styles: {
          header: {
            fontSize: 28,
            bold: true,
            color: '#111827',
            margin: [0, 0, 0, 10]
          },
          subheader: {
            fontSize: 18,
            bold: true,
            color: '#4f46e5',
            margin: [0, 20, 0, 10]
          }
        },
        pageMargins: [40, 60, 40, 60]
      } as any;

      const fileName = `GoalForge_${title.toString().replace(/\s+/g, '_')}.pdf`;
      pdfMakeModule.createPdf(docDefinition).download(fileName);
      toast.success('Professional PDF generated successfully!');
    } catch (err) {
      console.error('Failed to generate PDF', err);
      toast.error('Failed to generate PDF.');
    }
  };

  const handleExportCalendar = () => {
    if (!selectedNode?.data) return;
    const title = (selectedNode.data.title || selectedNode.data.label || 'Task').toString();
    const hours = Number(selectedNode.data.estimatedHours) || 1;
    
    // Create a dummy event for "tomorrow" based on estimated hours
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(9, 0, 0, 0); // 9 AM tomorrow
    const end = new Date(start.getTime() + hours * 60 * 60 * 1000);

    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '') + 'Z';
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${title} (GoalForge AI)
DESCRIPTION:Auto-scheduled by GoalForge AI. Estimated hours: ${hours}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Added to Google Calendar (.ics file generated)');
  };

  if (!selectedNode) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center text-neutral-400">
        <Layers className="w-12 h-12 mb-4 text-neutral-600 opacity-50" />
        <h3 className="font-bold text-white mb-2">No Task Selected</h3>
        <p className="text-sm">Click on a node in the workflow to inspect its details and execute agents.</p>
      </div>
    );
  }

  const data = selectedNode.data as any;
  const status = data.status || 'PENDING';
  const agentType = data.agentType || 'NONE';
  const priority = data.priority || 'MEDIUM';
  
  const getPriorityColor = () => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'MEDIUM': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'LOW': return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
      default: return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 h-full overflow-hidden overflow-x-hidden">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-5 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-2 tracking-tight leading-snug">{data.label || selectedNode.id}</h3>
          <div className="flex gap-2 items-center flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
              status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
              status === 'AI_RUNNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-white/5 text-neutral-400 border border-white/10'
            }`}>
              {status}
            </span>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md border uppercase tracking-wider flex items-center gap-1 ${getPriorityColor()}`}>
              {priority === 'CRITICAL' && <AlertCircle className="w-3 h-3" />}
              {priority}
            </span>
            {data.dueDate && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-md border border-indigo-500/30 bg-indigo-500/20 text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <CalendarClock className="w-3 h-3" />
                DUE: {new Date(data.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 mb-4 px-1 relative overflow-x-auto whitespace-nowrap custom-scrollbar pb-1">
        {['details', 'reasoning', 'deliverables', 'timeline', 'prerequisites', 'logs', 'metrics'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors relative flex items-center gap-1.5 flex-shrink-0 ${activeTab === tab ? 'text-indigo-400' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            {tab}
            {tab === 'deliverables' && resultData && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>}
            {tab === 'logs' && pipelineLogs && pipelineLogs.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"></span>}
            {activeTab === tab && (
              <motion.div 
                layoutId="activeTabIndicator"
                className="absolute left-0 right-0 bottom-0 h-0.5 bg-indigo-500"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-6 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col gap-6"
          >
        
        {activeTab === 'details' ? (
          <>
            {/* Description Section */}
            <div>
              <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Description</h4>
              <p className="text-sm text-neutral-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                {data.description || 'No description provided.'}
              </p>
            </div>

            {/* Metadata Section */}
            <div className="flex flex-col gap-2 py-4 border-y border-white/5 bg-white/5 rounded-xl px-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Bot className="w-3 h-3" /> Assigned Agent
                  </h4>
                  <p className="text-sm font-semibold text-indigo-400">{agentType}</p>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="flex-1">
                  <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Type</h4>
                  <p className="text-sm font-semibold text-neutral-300 capitalize">{data.type || 'task'}</p>
                </div>
              </div>
              
              {(data.estimatedHours || data.criticalPath) && (
                <>
                  <div className="w-full h-px bg-white/5 my-1"></div>
                  <div className="flex items-center gap-4">
                    {data.estimatedHours && (
                      <div className="flex-1">
                        <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Est. Effort</h4>
                        <p className="text-sm font-semibold text-neutral-300">{data.estimatedHours} hours</p>
                      </div>
                    )}
                    {data.criticalPath && (
                      <div className="flex-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-widest bg-red-900/30 text-red-400 border-red-500/30 inline-block">
                          Critical Path
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Action Button */}
            {agentType !== 'NONE' && status !== 'COMPLETED' && (
              <Button 
                className="w-full h-12 font-semibold tracking-wide transition-all shadow-lg hover:shadow-indigo-500/25 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"
                disabled={isExecuting || status === 'AI_RUNNING'}
                onClick={() => onExecute(selectedNode.id)}
              >
                {isExecuting || status === 'AI_RUNNING' ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Executing {agentType} Agent...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="w-4 h-4 fill-current" /> Run {agentType} Agent
                  </span>
                )}
              </Button>
            )}

            {status === 'COMPLETED' && agentType !== 'NONE' && (
               <div className="w-full h-12 flex items-center justify-center font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-inner">
                 <CheckCircle2 className="w-5 h-5 mr-2" /> Agent Task Completed
               </div>
            )}

          </>
        ) : activeTab === 'reasoning' ? (
          <div className="flex flex-col gap-4">
            <div className="bg-neutral-900/50 p-4 rounded-xl border border-white/5">
              <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" /> Explainable AI Decision
              </h4>
              <p className="text-sm text-neutral-300 leading-relaxed">
                The <strong className="text-white">Planner Agent</strong> prioritized this task as <strong className={`${getPriorityColor()} px-1.5 py-0.5 rounded text-xs`}>{priority}</strong> because it is structurally required for downstream milestones. 
                {data.criticalPath && " It was placed on the Critical Path to ensure the overall deadline is protected."}
              </p>
              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/5 text-xs text-neutral-400">
                <strong className="text-white block mb-1">Impact of skipping:</strong>
                <ul className="list-disc list-inside space-y-1">
                  <li>Downstream agent pipelines will fail.</li>
                  <li>Success probability decreases by ~8%.</li>
                </ul>
              </div>
            </div>
          </div>
        ) : activeTab === 'deliverables' ? (
          <div className="flex flex-col gap-4">
            {resultData ? (
              <div className="bg-[#0f1115] rounded-xl p-6 border border-white/10 shadow-inner">
                <div className="prose prose-sm prose-invert max-w-none 
                  prose-p:leading-relaxed prose-p:text-neutral-300 
                  prose-a:text-indigo-400 hover:prose-a:text-indigo-300 
                  prose-headings:font-bold prose-headings:text-white 
                  prose-h1:text-xl prose-h1:border-b prose-h1:border-white/10 prose-h1:pb-2
                  prose-h2:text-lg prose-h3:text-base
                  prose-ul:my-3 prose-li:my-1 prose-li:text-neutral-300
                  prose-strong:text-white prose-strong:font-semibold
                  prose-blockquote:border-l-indigo-500 prose-blockquote:bg-indigo-500/10 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg prose-blockquote:text-neutral-300 prose-blockquote:not-italic
                  prose-hr:border-white/10 prose-code:text-indigo-300 prose-code:bg-indigo-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                  prose-pre:overflow-x-auto prose-table:block prose-table:overflow-x-auto break-words
                " style={{ overflowWrap: 'anywhere' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {resultData}
                  </ReactMarkdown>
                </div>
                {/* Mock Integrations */}
                <div className="mt-6 flex gap-3 pt-6 border-t border-white/10">
                  <button onClick={handleExportPdf} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-2.5 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-2">
                    <FilePlus className="w-4 h-4 text-blue-400" /> Export as PDF
                  </button>
                  <button onClick={handleExportCalendar} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-2.5 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-2">
                    <CalendarPlus className="w-4 h-4 text-emerald-400" /> Add to Google Calendar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-neutral-500 text-sm flex flex-col items-center justify-center">
                <FileText className="w-8 h-8 mb-3 opacity-20" />
                <p>No deliverables generated yet.</p>
                <p className="text-xs mt-1">Run the agent from the Details tab.</p>
              </div>
            )}
          </div>
        ) : activeTab === 'timeline' ? (
          <div className="flex flex-col gap-4">
            <div className="bg-neutral-900/50 p-4 rounded-xl border border-white/5">
              <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-indigo-400" /> Execution Timeline
              </h4>
              <div className="relative pl-4 border-l border-white/10 space-y-4">
                <div className="relative">
                  <div className="absolute w-2 h-2 bg-indigo-500 rounded-full -left-[21px] top-1"></div>
                  <p className="text-xs text-neutral-400 font-mono mb-1">Waiting on Dependencies</p>
                  <p className="text-sm text-neutral-300">Paused until prior critical path nodes complete.</p>
                </div>
                <div className="relative">
                  <div className="absolute w-2 h-2 bg-neutral-700 rounded-full -left-[21px] top-1"></div>
                  <p className="text-xs text-neutral-400 font-mono mb-1">Estimated Start</p>
                  <p className="text-sm text-neutral-300">ASAP upon unblocking</p>
                </div>
                <div className="relative">
                  <div className="absolute w-2 h-2 bg-neutral-700 rounded-full -left-[21px] top-1"></div>
                  <p className="text-xs text-neutral-400 font-mono mb-1">Target Completion</p>
                  <p className="text-sm text-neutral-300">{data.dueDate ? new Date(data.dueDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'prerequisites' ? (
          <div className="flex flex-col gap-6">
            <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5 shadow-xl">
              <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> Task Dependencies
              </h4>
              
              {incomingNodes.length === 0 ? (
                <div className="text-center py-6 px-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">No prerequisites.</p>
                  <p className="text-xs text-neutral-400">This task can be started immediately.</p>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  <p className="text-sm text-neutral-300 mb-4">Before this task can begin, the following tasks must be completed.</p>
                  {incomingNodes.map(n => (
                    <div key={n.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        {n.data.status === 'COMPLETED' ? (
                           <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                           <div className="w-4 h-4 rounded-[4px] border-2 border-neutral-600"></div>
                        )}
                        <span className={`text-sm ${n.data.status === 'COMPLETED' ? 'text-neutral-400 line-through' : 'text-white font-medium'}`}>{n.data.label as string}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">{n.data.status as string || 'PENDING'}</span>
                    </div>
                  ))}
                </div>
              )}

              {outgoingNodes.length > 0 && (
                <div className="pt-6 border-t border-white/5">
                  <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlocks
                  </h4>
                  <p className="text-sm text-neutral-300 mb-4">Completing this task will automatically unlock:</p>
                  <div className="space-y-2">
                    {outgoingNodes.map(n => (
                      <div key={n.id} className="flex items-center gap-2 text-sm text-neutral-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-600"></div>
                        {n.data.label as string}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Explanation Card */}
            <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-5 rounded-2xl border border-indigo-500/20">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-400" /> AI Recommendation
              </h4>
              <p className="text-sm text-neutral-300 leading-relaxed mb-3">
                {incomingNodes.length > 0 ? (
                  `This task depends on ${incomingNodes.length} previous step${incomingNodes.length > 1 ? 's' : ''} to gather required context before AI execution.`
                ) : (
                  `This task is unblocked. Executing it will unlock ${outgoingNodes.length} downstream dependencies.`
                )}
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30">
                <Activity className="w-3 h-3" /> Increases Success Probability by ~8%
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner">
                <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">Waiting For</span>
                <span className="text-lg text-white font-semibold">{incomingNodes.length} Tasks</span>
              </div>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner">
                <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">Blocks</span>
                <span className="text-lg text-white font-semibold">{outgoingNodes.length} Tasks</span>
              </div>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner">
                <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">Critical Path</span>
                <span className={`text-sm font-semibold ${data.criticalPath ? 'text-red-400' : 'text-neutral-400'}`}>{data.criticalPath ? 'Yes' : 'No'}</span>
              </div>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner">
                <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">Dependency Depth</span>
                <span className="text-sm text-indigo-400 font-semibold">Level {depth}</span>
              </div>
            </div>
          </div>
        ) : activeTab === 'metrics' ? (
          <div className="flex flex-col gap-4">
            <div className="bg-neutral-900/50 p-4 rounded-xl border border-white/5">
              <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-400" /> Performance Telemetry
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">Est. Effort</span>
                  <span className="text-lg text-white font-semibold">{data.estimatedHours || 0} hrs</span>
                </div>
                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">Compute Cost</span>
                  <span className="text-lg text-white font-semibold">~$0.04</span>
                </div>
                <div className="bg-black/40 p-3 rounded-lg border border-white/5 col-span-2">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">Optimization Potential</span>
                  <span className="text-sm text-emerald-400 font-semibold">High (Parallelizable)</span>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'logs' ? (
          <div className="flex flex-col gap-4">
            {pipelineLogs && pipelineLogs.length > 0 ? (
              pipelineLogs.map((log, index) => (
                <div key={index} className="flex gap-4 items-start p-4 bg-neutral-900/50 rounded-xl border border-white/5">
                  <div className={`mt-0.5 p-1.5 rounded-full ${log.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                      {log.agent}
                      <span className="text-[9px] text-neutral-500 font-mono tracking-wider bg-black/50 px-1.5 py-0.5 rounded">{new Date(log.time).toLocaleTimeString()}</span>
                    </h5>
                    <p className="text-xs text-neutral-400 mt-1">
                      {log.message || (log.status === 'SUCCESS' ? 'Completed successfully.' : 'Encountered an error.')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-neutral-500 text-sm">
                No logs available. Run the agent to see pipeline execution details.
              </div>
            )}
          </div>
        ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
