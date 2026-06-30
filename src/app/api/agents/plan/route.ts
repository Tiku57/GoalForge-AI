import { NextResponse } from 'next/server';
import { generateWorkflowPlan } from '@/lib/agents/planner';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, error: "GEMINI_API_KEY is not set in environment variables." }, { status: 500 });
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: "Invalid JSON request body" }, { status: 400 });
    }

    const { goalTitle, goalDescription, deadline, userId } = body;

    if (!goalTitle) {
      return NextResponse.json({ success: false, error: "Goal title is required" }, { status: 400 });
    }

    // Generate the plan using Gemini
    const plan = await generateWorkflowPlan(goalTitle, goalDescription, deadline);

    // Ensure a dummy user exists for the MVP
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({ data: { email: "demo@goalforge.ai", name: "Demo User" } });
    }

    const goal = await prisma.goal.create({
      data: {
        title: goalTitle,
        description: goalDescription,
        deadline: deadline ? new Date(deadline) : null,
        riskScore: plan.metrics?.riskScore || "Low Risk",
        completionProb: plan.metrics?.completionProbability || 100,
        bufferDays: plan.metrics?.bufferDays || 0,
        userId: user.id,
      }
    });

    const workflow = await prisma.workflow.create({
      data: {
        goalId: goal.id,
      }
    });

      const idMap = new Map<string, string>();
      
      const dbNodes = [];
      for (const node of plan.nodes) {
        const dbNode = await prisma.node.create({
          data: {
            workflowId: workflow.id,
            title: node.title,
            description: node.description,
            type: node.type,
            agentType: node.agentType,
            priority: node.priority || 'MEDIUM',
            dueDate: node.dueDate ? new Date(node.dueDate) : null,
            estimatedHours: node.estimatedHours || 1.0,
            criticalPath: node.criticalPath || false,
            positionX: Math.random() * 500, // Initial random placement
            positionY: Math.random() * 500,
          }
        });
        idMap.set(node.id, dbNode.id);
        dbNodes.push({
          id: dbNode.id, // Replace with DB ID
          data: {
            label: dbNode.title,
            description: dbNode.description,
            type: dbNode.type,
            agentType: dbNode.agentType,
            priority: dbNode.priority,
            status: dbNode.status,
            estimatedHours: dbNode.estimatedHours,
            criticalPath: dbNode.criticalPath
          },
          position: { x: dbNode.positionX, y: dbNode.positionY }
        });
      }

      const dbEdges = [];
      for (const edge of plan.edges) {
        const sourceDbId = idMap.get(edge.source);
        const targetDbId = idMap.get(edge.target);

        if (sourceDbId && targetDbId) {
          const dbEdge = await prisma.edge.create({
            data: {
              workflowId: workflow.id,
              sourceId: sourceDbId,
              targetId: targetDbId,
            }
          });
          dbEdges.push({
            id: dbEdge.id,
            source: sourceDbId,
            target: targetDbId,
            animated: true
          });
        }
      }

      return NextResponse.json({ 
        success: true, 
        goalId: goal.id, 
        workflowId: workflow.id, 
        plan: { nodes: dbNodes, edges: dbEdges, metrics: plan.metrics, debug: plan.debug } 
      });
  } catch (error: any) {
    console.error("API /agents/plan error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to generate workflow" 
    }, { status: 500 });
  }
}
