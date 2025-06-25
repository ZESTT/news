import { z } from 'zod';

// Schema for Serper API response
export const SerperSearchResultSchema = z.object({
  title: z.string(),
  link: z.string().url(),
  snippet: z.string().optional(),
  source: z.string().optional(),
  date: z.string().optional(),
  author: z.string().optional(),
  type: z.enum(['news', 'organic', 'knowledge_graph']).optional(),
  position: z.number().optional(),
});

export type SerperSearchResult = z.infer<typeof SerperSearchResultSchema>;

export const SerperSearchResponseSchema = z.object({
  searchParameters: z.object({
    q: z.string(),
    type: z.string(),
    num: z.number(),
  }),
  organic: z.array(SerperSearchResultSchema).optional(),
  news: z.array(SerperSearchResultSchema).optional(),
  knowledgeGraph: z.any().optional(),
});

export type SerperSearchResponse = z.infer<typeof SerperSearchResponseSchema>;

class SerperService {
  private readonly baseUrl = 'https://google.serper.dev';
  private readonly apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Serper API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Search for news articles related to the given query
   */
  async searchNews(query: string, limit: number = 5): Promise<SerperSearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          num: limit,
          tbm: 'nws', // News search
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Serper API error: ${error}`);
      }

      const data = await response.json();
      const parsed = SerperSearchResponseSchema.safeParse(data);

      if (!parsed.success) {
        console.error('Failed to parse Serper response:', parsed.error);
        return [];
      }

      // Return news results if available, otherwise fall back to organic results
      return parsed.data.news || parsed.data.organic || [];
    } catch (error) {
      console.error('Error searching with Serper:', error);
      throw error;
    }
  }

  /**
   * Search for organic results related to the given query
   */
  async searchOrganic(query: string, limit: number = 5): Promise<SerperSearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          num: limit,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Serper API error: ${error}`);
      }

      const data = await response.json();
      const parsed = SerperSearchResponseSchema.safeParse(data);

      if (!parsed.success) {
        console.error('Failed to parse Serper response:', parsed.error);
        return [];
      }

      // Return organic results
      return parsed.data.organic || [];
    } catch (error) {
      console.error('Error searching with Serper:', error);
      throw error;
    }
  }

  /**
   * Extract key claims from text to use as search queries
   */
  async extractSearchQueries(text: string): Promise<string[]> {
    // This is a simplified version - in production, you might want to use NLP
    // to extract key entities and claims
    const sentences = text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    // Simple heuristic: use the first 3 sentences as potential search queries
    return sentences.slice(0, 3);
  }
}

// Create a singleton instance
const serperApiKey = process.env.SERPER_API_KEY || '';
if (!serperApiKey) {
  console.warn('SERPER_API_KEY is not set. Serper service will not work properly.');
}

export const serperService = new SerperService(serperApiKey);
