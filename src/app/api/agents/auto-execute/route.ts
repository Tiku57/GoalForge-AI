import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { workflowId } = body;

    if (!workflowId) {
      return NextResponse.json({ success: false, error: "Workflow ID is required" }, { status: 400 });
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        nodes: true,
        edges: true,
      }
    });

    if (!workflow) {
      return NextResponse.json({ success: false, error: "Workflow not found" }, { status: 404 });
    }

    // Find the next eligible node
    // A node is eligible if its status is PENDING and all its source nodes (dependencies) are COMPLETED.
    const completedNodeIds = new Set(workflow.nodes.filter(n => n.status === 'COMPLETED').map(n => n.id));
    
    let nextNode = null;

    // We sort nodes by Priority (CRITICAL -> HIGH -> MEDIUM -> LOW) to ensure important tasks run first
    const priorityWeight: Record<string, number> = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    
    const pendingNodes = workflow.nodes
      .filter(n => n.status === 'PENDING' && n.agentType !== 'NONE')
      .sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

    for (const node of pendingNodes) {
      // Find all incoming edges for this node
      const incomingEdges = workflow.edges.filter(e => e.targetId === node.id);
      
      // Check if all sources are completed
      const allSourcesCompleted = incomingEdges.every(e => completedNodeIds.has(e.sourceId));
      
      if (allSourcesCompleted) {
        nextNode = node;
        break;
      }
    }

    if (!nextNode) {
      // Are there any pending nodes left?
      const remainingPending = workflow.nodes.filter(n => n.status === 'PENDING' && n.agentType !== 'NONE');
      if (remainingPending.length > 0) {
        return NextResponse.json({ 
          success: false, 
          message: "Waiting for dependencies to complete.",
          hasMore: true,
          nextAgent: "WAITING"
        });
      } else {
        return NextResponse.json({ 
          success: true, 
          message: "Workflow execution completed.",
          hasMore: false,
          nextAgent: "DONE"
        });
      }
    }

    // Return the node to be executed next
    return NextResponse.json({
      success: true,
      nodeId: nextNode.id,
      agentType: nextNode.agentType,
      priority: nextNode.priority,
      hasMore: true
    });

  } catch (error: any) {
    console.error("Auto Execute Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
