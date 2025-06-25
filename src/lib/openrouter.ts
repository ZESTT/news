import 'server-only';

export interface FactCheckResponse {
  isAccurate: boolean;
  confidence: number;
  explanation: string;
  sources: Array<{
    title: string;
    url: string;
    relevance: 'high' | 'medium' | 'low';
  }>;
  relatedFacts?: string[];
  lastUpdated?: string;
}

type OpenRouterMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
};

type OpenRouterChatCompletionParams = {
  model: string;
  messages: OpenRouterMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: string };
};

const SYSTEM_PROMPT = `You are a fact-checking assistant. Analyze the user's input and provide a factual assessment with sources. Always respond with valid JSON in this exact format:

{
  "claim": "[original claim]",
  "verdict": "[true/false/misleading/unverifiable]",
  "confidence": "[low/medium/high]",
  "explanation": "[detailed analysis with reasoning]",
  "sources": [
    {
      "title": "[source title]",
      "url": "[source URL]",
      "relevance": "high"
    }
  ],
  "additional_context": "[any relevant context]"
}

Guidelines:
1. Be objective and evidence-based
2. Use reliable, verifiable sources
3. Clearly explain your reasoning
4. Provide direct links to sources when available
5. Use "unverifiable" when there's insufficient evidence
6. Be concise but thorough in explanations`;

export interface OpenRouterChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function openRouterChatStream(
  params: OpenRouterChatCompletionParams,
  systemPrompt: string = SYSTEM_PROMPT
): Promise<Response> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  // Ensure system prompt is included
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...params.messages
  ];

  const requestBody = {
    ...params,
    messages,
    stream: true,
    temperature: 0.2, // Lower temperature for more factual responses
    max_tokens: 1500,
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://newsguardai.vercel.app',
      'X-Title': 'NewsGuard AI',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    let errorMessage = `OpenRouter API error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage += ` - ${JSON.stringify(errorData)}`;
    } catch (e) {
      // If we can't parse the error as JSON, use the status text
    }
    throw new Error(errorMessage);
  }

  if (!response.body) {
    throw new Error('No response body from OpenRouter API');
  }

  return response;
}

export function createOpenRouterMessage(
  role: 'user' | 'assistant' | 'system',
  content: string | { text: string; imageBase64?: string; context?: string }
): OpenRouterMessage {
  if (typeof content === 'string') {
    return {
      role,
      content: content + (role === 'user' ? 
        '\n\nPlease analyze this claim and provide a detailed fact-check with sources.' : 
        ''),
    };
  }

  const messageContent = [];
  
  if (content.imageBase64) {
    messageContent.push({
      type: 'image_url' as const,
      image_url: {
        url: `data:image/jpeg;base64,${content.imageBase64}`,
      },
    });
  }

  if (content.text) {
    messageContent.push({
      type: 'text' as const,
      text: content.text,
    });
  }

  return {
    role,
    content: messageContent,
  };
}
