import { NextResponse } from 'next/server';
import { runAgentPipeline } from '@/lib/agents/pipeline';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, error: "GEMINI_API_KEY is not set in environment variables." }, { status: 500 });
    }

    const body = await req.json();
    const { nodeId } = body;

    if (!nodeId) {
      return NextResponse.json({ success: false, error: "Node ID is required" }, { status: 400 });
    }

    const node = await prisma.node.findUnique({ where: { id: nodeId } });
    if (!node) {
      return NextResponse.json({ success: false, error: "Node not found" }, { status: 404 });
    }

    await prisma.node.update({
      where: { id: nodeId },
      data: { status: 'AI_RUNNING' }
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: any) => {
          controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
        };

        try {
          const result = await runAgentPipeline(nodeId, node.title, node.description, (update: any) => {
            sendEvent({ type: 'status', ...update });
          });

          await prisma.node.update({
            where: { id: nodeId },
            data: { status: 'COMPLETED' }
          });
          
          sendEvent({ type: 'complete', data: result });
        } catch (error: any) {
          await prisma.node.update({
            where: { id: nodeId },
            data: { status: 'PENDING' }
          });
          sendEvent({ type: 'error', error: error.message });
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error("Execute Route Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
