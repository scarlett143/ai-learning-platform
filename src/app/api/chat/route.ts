import { NextRequest, NextResponse } from 'next/server';
import { LLMGateway } from '@/services/llm';
import { AgentEventBus } from '@/lib/event-bus';

export async function POST(req: NextRequest) {
  try {
    const { message, userId } = await req.json();

    if (!message || typeof message !== 'string' || message.length > 2000) {
      return NextResponse.json({ error: 'Message is required (max 2000 chars)' }, { status: 400 });
    }

    const bus = AgentEventBus.getInstance();
    bus.recordFeedEvent({
      userId: userId || 'guest-learner',
      agentName: 'AI Mentor',
      type: 'agent:mentor:thinking',
      message: `Analyzing learner query: "${message.slice(0, 40)}..."`,
    });

    const llm = LLMGateway.getInstance();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await llm.streamText(message, chunk => {
            controller.enqueue(encoder.encode(chunk));
          });
          controller.close();
        } catch (streamErr) {
          controller.error(streamErr);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: unknown) {
    console.error('[api/chat]', err);
    return NextResponse.json({ error: 'Mentor streaming failed' }, { status: 500 });
  }
}
