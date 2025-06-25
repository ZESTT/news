import { z } from 'zod';
import { openRouterChat } from '@/lib/openai-openrouter';
import { serperService, type SerperSearchResult } from './serper.service';

// Constants
const MODEL = 'deepseek/deepseek-chat-v3-0324:free';
const DEFAULT_TEMPERATURE = 0.2;
const DEFAULT_MAX_TOKENS = 2000;

// Schema for fact-checking result
export const FactCheckResultSchema = z.object({
  claim: z.string(),
  verdict: z.enum(['true', 'false', 'misleading', 'unverifiable']),
  confidence: z.enum(['low', 'medium', 'high']),
  explanation: z.string(),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
      relevance: z.enum(['high', 'medium', 'low']).default('medium'),
    })
  ),
  additional_context: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

export type FactCheckResult = z.infer<typeof FactCheckResultSchema>;

// Schema for the response from the API
const ApiFactCheckResponseSchema = z.object({
  claim: z.string(),
  verdict: z.enum(['true', 'false', 'misleading', 'unverifiable']),
  confidence: z.enum(['low', 'medium', 'high']),
  explanation: z.string(),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
      relevance: z.enum(['high', 'medium', 'low']).default('medium'),
    })
  ),
  additional_context: z.string().optional(),
});

class FactCheckService {
  private readonly systemPrompt = `You are a fact-checking assistant. Analyze the user's input and provide a factual assessment with sources. Always respond with valid JSON in this exact format:

{
  "claim": "[original claim]",
  "verdict": "[true/false/misleading/unverifiable]",
  "confidence": "[low/medium/high]",
  "explanation": "[detailed analysis with reasoning]",
  "sources": [
    {
      "title": "[source title]",
      "url": "[source URL]",
      "relevance": "[high/medium/low]"
    }
  ],
  "additional_context": "[any relevant context]"
}

Guidelines:
1. Be objective and evidence-based
2. Use reliable, verifiable sources (prefer .gov, .edu, established news organizations)
3. Clearly explain your reasoning
4. Provide direct links to sources when available
5. Use "unverifiable" when there's insufficient evidence
6. Be concise but thorough in explanations
7. Rate the confidence of your assessment (low/medium/high)
8. Include the original claim in your response`;

  /**
   * Fact-check a piece of text using Serper search results and OpenRouter analysis
   * @param text The text to fact-check
   * @param options Additional options for the fact-check
   * @returns A promise that resolves to a FactCheckResult
   */
  async checkText(
    text: string,
    options: {
      searchQuery?: string;
      maxResults?: number;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<FactCheckResult> {
    try {
      const {
        searchQuery = text,
        maxResults = 5,
        temperature = DEFAULT_TEMPERATURE,
        maxTokens = DEFAULT_MAX_TOKENS,
      } = options;

      console.log('Starting fact-check for text:', text);
      console.log('Search query:', searchQuery);

      // Step 1: Search for relevant information using Serper
      console.log('Searching for relevant information...');
      let searchContext = 'No search results available for this query.';
      
      try {
        // First try to extract search queries from the text
        const searchQueries = await serperService.extractSearchQueries(searchQuery);
        
        if (searchQueries && searchQueries.length > 0) {
          // Search for each query and combine results
          const searchPromises = searchQueries.map(query => 
            serperService.searchNews(query, Math.ceil(maxResults / searchQueries.length))
          );
          
          const searchResults = (await Promise.all(searchPromises))
            .flat()
            .filter((result, index, self) => 
              index === self.findIndex(r => r.link === result.link)
            )
            .slice(0, maxResults);

          if (searchResults.length > 0) {
            console.log(`Found ${searchResults.length} search results`);
            searchContext = `Search Results for Context:\n${searchResults
              .map((result, index) => 
                `[${index + 1}] ${result.title || 'No title'}\n${result.link}\n${result.snippet || 'No snippet available'}\n`
              )
              .join('\n')}`;
          }
        }
      } catch (error) {
        console.error('Error performing search:', error);
        searchContext = 'Error retrieving search results. Proceeding with limited context.';
      }

      const prompt = `Please fact-check the following claim. Be objective, evidence-based, and provide sources when possible.

CLAIM TO FACT-CHECK:"""
${text}
"""

${searchContext}

IMPORTANT: Your response must be valid JSON that follows the exact format specified in the system prompt.`;

      // Step 3: Call OpenRouter API
      console.log('Calling OpenRouter API...');
      const response = await openRouterChat({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: this.systemPrompt,
          },
          {
            role: 'user',
            content: `Fact-check the following claim: ${text}\n\nContext from web search:\n${searchContext}`,
          },
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      });

      // Parse the response
      console.log('Parsing OpenRouter response...');
      if (!response) {
        throw new Error('No response received from OpenRouter');
      }

      let result: any;
      
      try {
        // Try to parse the response as JSON
        result = typeof response === 'string' ? JSON.parse(response) : response;
        console.log('Successfully parsed JSON response');
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        console.error('Response content that failed to parse:', response);
        throw new Error('Failed to parse JSON response from OpenRouter');
      }

      // Validate the response matches our schema
      console.log('Validating response against schema...');
      const apiValidation = ApiFactCheckResponseSchema.safeParse(result);

      if (!apiValidation.success) {
        console.error('API response validation failed:', apiValidation.error);
        // If the API response doesn't match our schema, use a fallback
        return {
          claim: text,
          verdict: 'unverifiable',
          confidence: 'low',
          explanation: result?.explanation || 'Could not verify the claim due to an error in the response format.',
          sources: Array.isArray(result?.sources) ? result.sources : []
        };
      }

      // Ensure the response has all required fields with proper types
      if (!apiValidation.data) {
        throw new Error('No data in API response');
      }

      // Map the API response to our FactCheckResult schema
      const factCheckResult: FactCheckResult = {
        claim: typeof apiValidation.data.claim === 'string' ? apiValidation.data.claim : text,
        verdict: ['true', 'false', 'misleading', 'unverifiable'].includes(apiValidation.data.verdict) 
          ? apiValidation.data.verdict as 'true' | 'false' | 'misleading' | 'unverifiable' 
          : 'unverifiable',
        confidence: (['low', 'medium', 'high'].includes(apiValidation.data.confidence) 
          ? apiValidation.data.confidence 
          : 'medium') as 'low' | 'medium' | 'high',
        explanation: typeof apiValidation.data.explanation === 'string' 
          ? apiValidation.data.explanation 
          : 'No explanation provided',
        sources: Array.isArray(apiValidation.data.sources) 
          ? apiValidation.data.sources.map((s: any) => ({
              title: typeof s?.title === 'string' ? s.title : 'Unknown source',
              url: typeof s?.url === 'string' ? s.url : '#',
              relevance: (typeof s?.relevance === 'string' && 
                ['high', 'medium', 'low'].includes(s.relevance))
                ? s.relevance as 'high' | 'medium' | 'low'
                : 'medium' as const
            }))
          : [],
        additional_context: typeof apiValidation.data.additional_context === 'string' 
          ? apiValidation.data.additional_context 
          : undefined,
        timestamp: new Date().toISOString()
      };

      console.log('Fact-check completed successfully');
      return factCheckResult;
    } catch (error) {
      console.error('Error in checkText:', error);
      // Return an unverifiable result if there's an error
      return {
        claim: text,
        verdict: 'unverifiable',
        confidence: 'low',
        explanation: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sources: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Analyze and fact-check an image
   * @param imageBase64 Base64 encoded image data
   * @returns A promise that resolves to a FactCheckResult
   */
  async checkImage(imageBase64: string): Promise<FactCheckResult> {
    try {
      console.log('Analyzing image with OpenRouter...');
      
      // First, extract text from the image
      const extractionResponse = await openRouterChat({
        model: 'nousresearch/bakllava',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract all text from this image. Be thorough and include any visible text, including small print.' },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.1, // Lower temperature for more accurate text extraction
        max_tokens: 2000,
        response_format: { type: 'text' }
      });

      // The response is already the extracted text
      const extractedText = extractionResponse || '';
      console.log('Extracted text from image:', extractedText);

      // Perform web search based on extracted text
      let searchContext = 'No search results available for this query.';
      if (extractedText.trim()) {
        try {
          const searchQueries = await serperService.extractSearchQueries(extractedText);
          if (searchQueries?.length) {
            const searchResults = await serperService.searchNews(searchQueries[0], 3); // Get top 3 results
            if (searchResults.length > 0) {
              searchContext = `Relevant search results for fact-checking:\n${searchResults
                .map((result, index) => 
                  `[${index + 1}] ${result.title || 'No title'}\n${result.link}\n${result.snippet || 'No snippet available'}\n`
                )
                .join('\n')}`;
            }
          }
        } catch (searchError) {
          console.error('Error performing search for image fact-checking:', searchError);
          searchContext = 'Error retrieving search results. Proceeding with limited context.';
        }
      }

      // Now perform the fact-checking with the extracted text and search results
      const userMessage = `Analyze this image and fact-check any claims it makes. Consider the following context from web search:\n\n${searchContext}\n\n`;
      
      const response = await openRouterChat({
        model: 'nousresearch/bakllava',
        messages: [
          {
            role: 'system',
            content: this.systemPrompt,
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: userMessage },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      if (!response) {
        throw new Error('No response received from OpenRouter');
      }

      let result: any;
      
      try {
        // Try to parse the response as JSON
        result = typeof response === 'string' ? JSON.parse(response) : response;
        console.log('Successfully parsed JSON response');
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        console.error('Response content that failed to parse:', response);
        throw new Error('Failed to parse JSON response from OpenRouter');
      }

      // Validate the response matches our schema
      console.log('Validating response against schema...');
      const apiValidation = ApiFactCheckResponseSchema.safeParse(result);

      if (!apiValidation.success) {
        console.error('API response validation failed:', apiValidation.error);
        // If the API response doesn't match our schema, try to extract what we can
        return {
          claim: 'Image content analysis',
          verdict: 'unverifiable',
          confidence: 'low',
          explanation: result?.explanation || 'Could not verify the image content due to an error in the response format.',
          sources: Array.isArray(result?.sources)
            ? result.sources.map((s: any) => ({
                title: typeof s.title === 'string' ? s.title : 'Unknown source',
                url: typeof s.url === 'string' ? s.url : '#',
                relevance: (typeof s.relevance === 'string' && 
                  ['high', 'medium', 'low'].includes(s.relevance))
                  ? s.relevance as 'high' | 'medium' | 'low'
                  : 'medium'
              }))
            : [],
          timestamp: new Date().toISOString()
        };
      }

      // Map the API response to our FactCheckResult schema
      const factCheckResult: FactCheckResult = {
        ...apiValidation.data,
        // Ensure confidence is one of the allowed values
        confidence: (['low', 'medium', 'high'].includes(apiValidation.data.confidence) 
          ? apiValidation.data.confidence 
          : 'medium') as 'low' | 'medium' | 'high',
        timestamp: new Date().toISOString()
      };

      console.log('Image analysis completed successfully');
      return factCheckResult;
    } catch (error) {
      console.error('Error in checkImage:', error);
      return {
        claim: 'Image content analysis',
        verdict: 'unverifiable',
        confidence: 'low',
        explanation: `An error occurred while analyzing the image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sources: [],
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export a singleton instance
export const factCheckService = new FactCheckService();
