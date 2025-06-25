import OpenAI from 'openai';

// Create a custom client for OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'NewsGuardAI',
  },
  dangerouslyAllowBrowser: false, // Only for server-side use
});

export const openRouterChat = async ({
  messages,
  model = 'deepseek/deepseek-chat-v3-0324:free',
  temperature = 0.2,
  max_tokens = 2000,
  response_format = { type: 'json_object' },
}: {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'text' | 'json_object' };
}) => {
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      response_format,
    });

    return completion.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenRouter API Error:', error);
    throw error;
  }
};

export default openai;
