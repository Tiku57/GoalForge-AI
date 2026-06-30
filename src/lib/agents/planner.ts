import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const plannerSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    nodes: {
      type: Type.ARRAY,
      description: "List of tasks, milestones, or actions.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique identifier for the node (e.g., 'node_1')" },
          title: { type: Type.STRING, description: "Short, actionable title for the task" },
          description: { type: Type.STRING, description: "Detailed description of what needs to be done" },
          type: { 
            type: Type.STRING, 
            description: "Type of the node: 'milestone', 'task', or 'action'",
            enum: ['milestone', 'task', 'action']
          },
          agentType: {
            type: Type.STRING,
            description: "The type of agent best suited for this task: 'RESEARCH', 'EXECUTE', 'OPTIMIZE', 'REVIEW', or null if it's just a placeholder.",
            enum: ['RESEARCH', 'EXECUTE', 'OPTIMIZE', 'REVIEW', 'NONE']
          },
          priority: {
            type: Type.STRING,
            description: "Priority of the task: 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'",
            enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
          },
          dueDate: {
            type: Type.STRING,
            description: "Estimated due date for this specific node in ISO format (YYYY-MM-DD), ensuring it fits within the overall goal deadline."
          },
          estimatedHours: {
            type: Type.NUMBER,
            description: "Realistic estimate of how many hours this node will take to complete."
          },
          criticalPath: {
            type: Type.BOOLEAN,
            description: "True if this node is on the critical path (any delay in this delays the whole project)."
          }
        },
        required: ["id", "title", "description", "type", "agentType", "priority", "estimatedHours", "criticalPath"]
      }
    },
    edges: {
      type: Type.ARRAY,
      description: "Dependencies between nodes. 'source' must be completed before 'target' can begin.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique identifier for the edge (e.g., 'edge_1')" },
          source: { type: Type.STRING, description: "ID of the source node" },
          target: { type: Type.STRING, description: "ID of the target node" }
        },
        required: ["id", "source", "target"]
      }
    },
    metrics: {
      type: Type.OBJECT,
      description: "Overall goal metrics calculated based on the requested deadline and scope of tasks.",
      properties: {
        completionProbability: {
          type: Type.NUMBER,
          description: "Percentage (0-100) estimating the probability of success given the deadline."
        },
        bufferDays: {
          type: Type.NUMBER,
          description: "Estimated number of buffer days left before the deadline is breached."
        },
        riskScore: {
          type: Type.STRING,
          description: "Overall risk of failure.",
          enum: ["Low Risk", "Medium Risk", "High Risk", "Critical"]
        }
      },
      required: ["completionProbability", "bufferDays", "riskScore"]
    }
  },
  required: ["nodes", "edges", "metrics"]
};

export async function generateWorkflowPlan(goalTitle: string, goalDescription?: string, deadline?: string) {
  const startTime = Date.now();
  let panicModeStr = "";
  if (deadline) {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysRemaining <= 7 && daysRemaining > 0) {
      panicModeStr = `\n\n🚨 PANIC MODE ACTIVATED 🚨\nTHE DEADLINE IS IN ${daysRemaining} DAYS!\nDO NOT generate a long, sprawling 30-node graph. \nGenerate a hyper-compressed, high-priority emergency graph. Focus ONLY on CRITICAL and HIGH priority tasks needed to survive. Max 6-8 nodes total. Cut all fluff.`;
    } else if (daysRemaining <= 0) {
      panicModeStr = `\n\n🚨 PANIC MODE ACTIVATED 🚨\nTHE DEADLINE IS TODAY OR ALREADY PASSED!\nGenerate an absolute bare-minimum emergency response graph (max 3-4 nodes).`;
    }
  }

  const prompt = `You are an elite productivity and systems architect AI acting as the "Last-Minute Life Saver". 
The user wants to achieve the following goal:
Title: "${goalTitle}"
Description: "${goalDescription || 'No detailed description provided.'}"
Deadline: "${deadline || 'No specific deadline provided.'}"${panicModeStr}

Your task is to break this goal down into a logical dependency graph.
CRITICAL HIERARCHY RULES:
1. Limit to exactly 4-5 top-level 'milestone' nodes (unless in Panic Mode).
2. Under each milestone, create EXACTLY 2-4 'task' or 'action' nodes (unless in Panic Mode). 
3. DO NOT create deep sprawling trees. The graph must be clean, structured, and immediately actionable.
4. Assign a strict priority (CRITICAL, HIGH, MEDIUM, LOW) to every node. Ensure critical path items are marked CRITICAL.
5. If a deadline is provided, calculate logical due dates for intermediate nodes.
6. Calculate 'estimatedHours' for every task (be realistic).
7. Flag 'criticalPath' boolean as true for bottlenecks that will delay the entire project.

Create a set of nodes (tasks/milestones) and edges (dependencies).
- Use 'milestone' for major phases.
- Use 'task' for significant chunks of work.
- Use 'action' for specific, executable steps.
- For tasks that require gathering information, assign agentType 'RESEARCH'.
- For tasks that require generating a document, plan, or artifact, assign agentType 'EXECUTE'.
- For abstract milestones, agentType can be 'NONE'.

Finally, analyze the whole graph against the deadline (if provided) and compute the global 'metrics' (completionProbability, bufferDays, riskScore).
Ensure the graph flows logically. A target node cannot start until its source is complete.
Respond strictly in JSON matching the provided schema.`;

  const attempts = [
    { model: 'gemini-2.5-flash-lite', delay: 0 },
    { model: 'gemini-2.5-flash-lite', delay: 1500 },
    { model: 'gemini-2.5-flash', delay: 3000 },
    { model: 'gemini-flash-latest', delay: 5000 }
  ];

  for (let i = 0; i < attempts.length; i++) {
    const { model, delay } = attempts[i];
    
    if (delay > 0) {
      console.log(`[Planner Agent] Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      if (model !== attempts[i - 1].model) {
        console.log(`[Planner Agent] Using fallback AI model: ${model}`);
      }
    }

    try {
      console.log(`[Planner Agent] Attempt ${i + 1}/${attempts.length}: Calling model ${model}`);
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: plannerSchema,
          temperature: 0.2, // Low temperature for deterministic, structured planning
        }
      });

      console.log("MODEL:", model);
      console.log("RAW GEMINI RESPONSE:", JSON.stringify(response, null, 2));

      if (!response.text) {
        throw new Error("No response generated by Planner Agent.");
      }

      let rawText = response.text.trim();
      if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
      }

      let plan;
      try {
        plan = JSON.parse(rawText);
      } catch (parseErr) {
        console.error(`[Planner Agent] JSON Parse Error:`, parseErr);
        // Do not immediately trigger fallback if it's a parsing error and not a quota error
        throw new Error(`JSON Parsing Failed: ${parseErr}`);
      }

      console.log(`[Planner Agent] Success using ${model}`);
      return { 
        ...plan, 
        debug: { 
          model, 
          status: 'SUCCESS', 
          latency: Date.now() - startTime,
          fallbackReason: null 
        } 
      };
    } catch (error: any) {
      console.error(`[Planner Agent] Error with model ${model}:`, error.message || error);
      
      // If this was the last attempt, return a deterministic fallback plan
      if (i === attempts.length - 1) {
        console.log(`[Planner Agent] All AI attempts failed. Using intelligent offline fallback.`);
        
        // Intelligent Offline Planner Heuristics
        const textToAnalyze = `${goalTitle} ${goalDescription || ''}`.toLowerCase();
        let fallbackNodes: any[] = [];
        let fallbackEdges: any[] = [];
        
        if (textToAnalyze.includes('startup') || textToAnalyze.includes('funding') || textToAnalyze.includes('customers')) {
          fallbackNodes = [
            { id: 'node_1', title: 'Validate Startup Idea', description: 'Conduct market research and customer discovery interviews.', type: 'task', agentType: 'RESEARCH', priority: 'CRITICAL', estimatedHours: 12, criticalPath: true },
            { id: 'node_2', title: 'Build MVP', description: 'Develop the core Minimum Viable Product with essential features.', type: 'milestone', agentType: 'EXECUTE', priority: 'CRITICAL', estimatedHours: 40, criticalPath: true },
            { id: 'node_3', title: 'User Authentication', description: 'Implement secure login and session management.', type: 'task', agentType: 'EXECUTE', priority: 'HIGH', estimatedHours: 8, criticalPath: false },
            { id: 'node_4', title: 'Landing Page', description: 'Design and deploy a high-converting landing page.', type: 'task', agentType: 'EXECUTE', priority: 'HIGH', estimatedHours: 10, criticalPath: false },
            { id: 'node_5', title: 'Beta Launch', description: 'Launch to a closed group of early adopters for feedback.', type: 'milestone', agentType: 'OPTIMIZE', priority: 'HIGH', estimatedHours: 5, criticalPath: true },
            { id: 'node_6', title: 'Acquire First 100 Customers', description: 'Execute GTM strategy to onboard initial paying users.', type: 'task', agentType: 'EXECUTE', priority: 'CRITICAL', estimatedHours: 20, criticalPath: true },
            { id: 'node_7', title: 'Investor Pitch Deck', description: 'Create a compelling narrative and financial model for seed funding.', type: 'task', agentType: 'RESEARCH', priority: 'HIGH', estimatedHours: 15, criticalPath: false },
            { id: 'node_8', title: 'Seed Funding Outreach', description: 'Contact VCs and angels to secure initial capital.', type: 'milestone', agentType: 'EXECUTE', priority: 'CRITICAL', estimatedHours: 30, criticalPath: true },
          ];
          fallbackEdges = [
            { id: 'edge_1', source: 'node_1', target: 'node_2' },
            { id: 'edge_2', source: 'node_2', target: 'node_3' },
            { id: 'edge_3', source: 'node_2', target: 'node_4' },
            { id: 'edge_4', source: 'node_3', target: 'node_5' },
            { id: 'edge_5', source: 'node_4', target: 'node_5' },
            { id: 'edge_6', source: 'node_5', target: 'node_6' },
            { id: 'edge_7', source: 'node_6', target: 'node_7' },
            { id: 'edge_8', source: 'node_7', target: 'node_8' },
          ];
        } else if (textToAnalyze.includes('app') || textToAnalyze.includes('software') || textToAnalyze.includes('code')) {
          fallbackNodes = [
            { id: 'node_1', title: 'Requirements Gathering', description: 'Define the software requirements and architecture.', type: 'task', agentType: 'RESEARCH', priority: 'CRITICAL', estimatedHours: 8, criticalPath: true },
            { id: 'node_2', title: 'System Architecture', description: 'Design the database schema and system diagram.', type: 'task', agentType: 'OPTIMIZE', priority: 'HIGH', estimatedHours: 10, criticalPath: true },
            { id: 'node_3', title: 'Frontend Development', description: 'Build the UI/UX components and client-side logic.', type: 'task', agentType: 'EXECUTE', priority: 'CRITICAL', estimatedHours: 30, criticalPath: false },
            { id: 'node_4', title: 'Backend APIs', description: 'Develop robust REST/GraphQL endpoints.', type: 'task', agentType: 'EXECUTE', priority: 'CRITICAL', estimatedHours: 25, criticalPath: false },
            { id: 'node_5', title: 'Integration Testing', description: 'Ensure the frontend and backend communicate flawlessly.', type: 'task', agentType: 'REVIEW', priority: 'HIGH', estimatedHours: 12, criticalPath: true },
            { id: 'node_6', title: 'Production Deployment', description: 'Deploy the application to Vercel/AWS.', type: 'milestone', agentType: 'EXECUTE', priority: 'CRITICAL', estimatedHours: 5, criticalPath: true },
          ];
          fallbackEdges = [
            { id: 'edge_1', source: 'node_1', target: 'node_2' },
            { id: 'edge_2', source: 'node_2', target: 'node_3' },
            { id: 'edge_3', source: 'node_2', target: 'node_4' },
            { id: 'edge_4', source: 'node_3', target: 'node_5' },
            { id: 'edge_5', source: 'node_4', target: 'node_5' },
            { id: 'edge_6', source: 'node_5', target: 'node_6' },
          ];
        } else {
          fallbackNodes = [
            { id: 'node_1', title: 'Strategic Analysis', description: `Analyze context for: ${goalTitle}`, type: 'task', agentType: 'RESEARCH', priority: 'CRITICAL', estimatedHours: 4, criticalPath: true },
            { id: 'node_2', title: 'Resource Allocation', description: 'Identify required tools, team members, and budget.', type: 'task', agentType: 'OPTIMIZE', priority: 'HIGH', estimatedHours: 2, criticalPath: false },
            { id: 'node_3', title: 'Execution Phase 1', description: 'Begin initial work on the primary objective.', type: 'task', agentType: 'EXECUTE', priority: 'CRITICAL', estimatedHours: 10, criticalPath: true },
            { id: 'node_4', title: 'Mid-Point Review', description: 'Assess progress and adjust strategy if necessary.', type: 'task', agentType: 'REVIEW', priority: 'MEDIUM', estimatedHours: 2, criticalPath: false },
            { id: 'node_5', title: 'Execution Phase 2', description: 'Complete the remaining core tasks.', type: 'task', agentType: 'EXECUTE', priority: 'CRITICAL', estimatedHours: 15, criticalPath: true },
            { id: 'node_6', title: 'Final Deliverable', description: `Publish or finalize the outcome for: ${goalTitle}`, type: 'milestone', agentType: 'EXECUTE', priority: 'HIGH', estimatedHours: 4, criticalPath: true },
          ];
          fallbackEdges = [
            { id: 'edge_1', source: 'node_1', target: 'node_2' },
            { id: 'edge_2', source: 'node_1', target: 'node_3' },
            { id: 'edge_3', source: 'node_3', target: 'node_4' },
            { id: 'edge_4', source: 'node_4', target: 'node_5' },
            { id: 'edge_5', source: 'node_5', target: 'node_6' },
          ];
        }
        
        return {
          nodes: fallbackNodes,
          edges: fallbackEdges,
          metrics: {
            completionProbability: 75,
            bufferDays: 3,
            riskScore: 'Medium Risk'
          },
          debug: {
            model: 'offline-heuristic-planner',
            status: 'FALLBACK',
            latency: Date.now() - startTime,
            fallbackReason: error.message || 'Unknown API Error'
          }
        };
      }
    }
  }
}
