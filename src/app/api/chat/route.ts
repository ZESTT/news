import { NextResponse } from 'next/server';
import { openRouterChatStream } from '@/lib/openrouter';

// Constants
const MODEL = 'deepseek/deepseek-chat-v3-0324:free';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1000;

// This route handles chat completions using the DeepSeek model
export const runtime = 'edge';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages)) {
      return new NextResponse(
        JSON.stringify({ error: 'Messages must be an array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Add system prompt if not already present
    const hasSystemMessage = messages.some((m: Message) => m.role === 'system');
    const processedMessages = hasSystemMessage 
      ? messages 
      : [
          {
            role: 'system' as const,
            content: 'You are a helpful assistant.'
          },
          ...messages
        ];

    // Call OpenRouter with the DeepSeek model
    const response = await openRouterChatStream({
      model: MODEL,
      messages: processedMessages,
      temperature: DEFAULT_TEMPERATURE,
      max_tokens: DEFAULT_MAX_TOKENS,
    });

    if (!response.body) {
      throw new Error('No response body received from OpenRouter');
    }

    // Forward the streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'An error occurred while processing your request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
