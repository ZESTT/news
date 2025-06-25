import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { factCheckService } from '@/services/factcheck.service';
import { saveAnalysisLog } from '@/services/loggingService';
import type { AnalyzeTextInput, AnalyzeTextOutput, Reference } from '@/lib/types';

// Define the request schema
const TextFactCheckRequestSchema = z.object({
  text: z.string().min(10, 'Text must be at least 10 characters long'),
  searchQuery: z.string().optional(),
  maxResults: z.number().int().positive().max(10).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().max(4000).optional(),
});

/**
 * POST /api/factcheck/text
 * 
 * Endpoint for fact-checking text content.
 * 
 * Request body:
 * {
 *   text: string;           // The text to fact-check
 *   searchQuery?: string;   // Optional custom search query
 *   maxResults?: number;    // Max number of search results (1-10)
 *   temperature?: number;  // 0-2, lower is more focused/deterministic
 *   maxTokens?: number;    // Max tokens in the response (1-4000)
 * }
 */
export async function POST(request: Request) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validation = TextFactCheckRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request', 
          details: validation.error.format(),
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const { text, searchQuery, maxResults, temperature, maxTokens } = validation.data;
    
    // Get the current user from Supabase
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Error getting user session:', authError);
    }

    const userId = user?.id;

    // Call the fact-checking service
    const result = await factCheckService.checkText(text, {
      searchQuery,
      maxResults,
      temperature,
      maxTokens
    });

    // Log the analysis if user is authenticated
    if (userId) {
      try {
        const inputData: AnalyzeTextInput = { 
          text,
          userId
        };
        
        // Convert sources to the expected Reference[] format
        const references: Reference[] = (result.sources || []).map(source => ({
          reason: source.title || 'Source reference',
          link: source.url,
          source_title: source.title
        }));

        const resultData: AnalyzeTextOutput = {
          label: result.verdict || 'unknown',
          confidence: result.confidence === 'high' ? 0.9 : result.confidence === 'medium' ? 0.6 : 0.3,
          allScores: {
            [result.verdict || 'unknown']: result.confidence === 'high' ? 0.9 : result.confidence === 'medium' ? 0.6 : 0.3,
            ...(result.verdict === 'true' ? { false: 0.1 } : { true: 0.1 }),
            ...(result.verdict === 'misleading' ? { unverifiable: 0.1 } : { misleading: 0.1 })
          },
          references,
          input_type: 'text' as const
        };
        
        await saveAnalysisLog(
          userId,
          'text',
          inputData,
          resultData
        );
        console.log('Analysis log saved successfully');
      } catch (logError) {
        console.error('Error saving analysis log:', logError);
        // Don't fail the request if logging fails
      }
    }

    // Return the result with appropriate headers
    return NextResponse.json(result, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Fact check error:', error);
    
    // Return a structured error response
    return NextResponse.json(
      { 
        error: 'Failed to process fact check request',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }
}

// Configure the runtime environment
export const runtime = 'edge';
