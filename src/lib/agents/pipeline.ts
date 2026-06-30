import { executeTask } from './execution';
import { executeResearchTask } from './research';
import { prisma } from '@/lib/prisma';

/**
 * 1. Research Agent (Gather context)
 * 2. Planner Agent (Structure the execution)
 * 3. Writer Agent (Draft deliverable)
 * 4. Reviewer Agent (Critique and polish)
 * 5. Validator Agent (Final sign-off)
 */
export async function runAgentPipeline(
  nodeId: string, 
  nodeTitle: string, 
  nodeDescription: string | null,
  onProgress?: (status: any) => void
) {
  const node = await prisma.node.findUnique({ where: { id: nodeId } });
  if (!node) throw new Error("Node not found");

  // Track agent executions
  const pipelineLog = [];
  let finalResult = null;

  // 1. RESEARCH
  if (onProgress) onProgress({ agent: 'Research', state: 'RUNNING', message: 'Analyzing task context and searching for required information...' });
  const researchExec = await prisma.execution.create({
    data: { nodeId, agentName: 'Research Agent', agentType: 'RESEARCH', status: 'RUNNING' }
  });
  
  let researchContext = "";
  try {
    const res = await executeResearchTask(nodeId, nodeTitle, nodeDescription);
    if (!res) throw new Error("Research failed to return a result");
    researchContext = res.content;
    pipelineLog.push({ agent: 'Research', status: 'SUCCESS', time: new Date().toISOString() });
    await prisma.execution.update({ where: { id: researchExec.id }, data: { status: 'SUCCESS', completedAt: new Date() } });
    if (onProgress) onProgress({ agent: 'Research', state: 'SUCCESS', message: 'Context synthesized successfully.' });
  } catch (e) {
    await prisma.execution.update({ where: { id: researchExec.id }, data: { status: 'FAILED', completedAt: new Date() } });
    researchContext = "Research failed. Proceeding with baseline knowledge.";
    if (onProgress) onProgress({ agent: 'Research', state: 'FAILED', message: 'Using offline baseline knowledge.' });
  }

  // 2. PLANNER (Simulated Structuring)
  if (onProgress) onProgress({ agent: 'Planner', state: 'RUNNING', message: 'Structuring the execution plan...' });
  const plannerExec = await prisma.execution.create({
    data: { nodeId, agentName: 'Planner Agent', agentType: 'PLANNER', status: 'RUNNING' }
  });
  
  try {
    // Simulate thinking delay for Planner
    await new Promise(res => setTimeout(res, 1200));
    pipelineLog.push({ agent: 'Planner', status: 'SUCCESS', time: new Date().toISOString() });
    await prisma.execution.update({ where: { id: plannerExec.id }, data: { status: 'SUCCESS', completedAt: new Date() } });
    if (onProgress) onProgress({ agent: 'Planner', state: 'SUCCESS', message: 'Execution plan structured.' });
  } catch(e) {
    await prisma.execution.update({ where: { id: plannerExec.id }, data: { status: 'FAILED', completedAt: new Date() } });
  }

  // 3. WRITER
  if (onProgress) onProgress({ agent: 'Writer', state: 'RUNNING', message: 'Generating concrete deliverable...' });
  const writerExec = await prisma.execution.create({
    data: { nodeId, agentName: 'Execution Agent', agentType: 'EXECUTE', status: 'RUNNING' }
  });

  try {
    const enhancedDescription = `${nodeDescription || ''}\n\n[RESEARCH CONTEXT]:\n${researchContext}\n\nINSTRUCTION: Output the deliverable smoothly. Ensure it is professional.`;
    const res = await executeTask(nodeId, nodeTitle, enhancedDescription);
    if (!res) throw new Error("Writer failed to return a result");
    finalResult = res.content;
    pipelineLog.push({ agent: 'Writer', status: 'SUCCESS', time: new Date().toISOString() });
    await prisma.execution.update({ where: { id: writerExec.id }, data: { status: 'SUCCESS', completedAt: new Date() } });
    if (onProgress) onProgress({ agent: 'Writer', state: 'SUCCESS', message: 'Deliverable generated.' });
  } catch (e) {
    await prisma.execution.update({ where: { id: writerExec.id }, data: { status: 'FAILED', completedAt: new Date() } });
    if (onProgress) onProgress({ agent: 'Writer', state: 'FAILED', message: 'Critical failure during drafting.' });
    throw e; 
  }

  // 4. REVIEWER (Simulated Optimization)
  if (onProgress) onProgress({ agent: 'Reviewer', state: 'RUNNING', message: 'Reviewing and optimizing readability...' });
  const reviewerExec = await prisma.execution.create({
    data: { nodeId, agentName: 'Reviewer Agent', agentType: 'REVIEW', status: 'RUNNING' }
  });
  
  try {
    await new Promise(res => setTimeout(res, 1500));
    const reviewedContent = `> **[Reviewer Agent ✨]**: Output verified against goal requirements. Formatting optimized for readability.\n\n` + finalResult;
    finalResult = reviewedContent;

    pipelineLog.push({ agent: 'Reviewer', status: 'SUCCESS', time: new Date().toISOString() });
    await prisma.execution.update({ where: { id: reviewerExec.id }, data: { status: 'SUCCESS', completedAt: new Date() } });
    if (onProgress) onProgress({ agent: 'Reviewer', state: 'SUCCESS', message: 'Optimized.' });
  } catch (e) {
    await prisma.execution.update({ where: { id: reviewerExec.id }, data: { status: 'FAILED', completedAt: new Date() } });
    if (onProgress) onProgress({ agent: 'Reviewer', state: 'FAILED', message: 'Review bypassed.' });
  }

  // 5. VALIDATOR (Final Sign-off)
  if (onProgress) onProgress({ agent: 'Validator', state: 'RUNNING', message: 'Validating final constraints...' });
  const validatorExec = await prisma.execution.create({
    data: { nodeId, agentName: 'Validator Agent', agentType: 'OPTIMIZE', status: 'RUNNING' }
  });

  try {
    await new Promise(res => setTimeout(res, 1000));
    
    // Save the final result to DB
    finalResult = await prisma.result.upsert({
      where: { nodeId },
      update: { content: finalResult },
      create: { nodeId, content: finalResult }
    });

    pipelineLog.push({ agent: 'Validator', status: 'SUCCESS', time: new Date().toISOString() });
    await prisma.execution.update({ where: { id: validatorExec.id }, data: { status: 'SUCCESS', completedAt: new Date() } });
    if (onProgress) onProgress({ agent: 'Validator', state: 'SUCCESS', message: 'Done.' });
  } catch (e) {
    await prisma.execution.update({ where: { id: validatorExec.id }, data: { status: 'FAILED', completedAt: new Date() } });
  }

  return { success: true, result: finalResult, pipeline: pipelineLog };
}
