import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { factCheckService } from '@/services/factcheck.service';
import { saveAnalysisLog } from '@/services/loggingService';
import type { AnalyzeImageInput, AnalyzeImageOutput, Reference } from '@/lib/types';

// Define the request schema
const ImageFactCheckRequestSchema = z.object({
  imageBase64: z.string().min(100, {
    message: 'Image data must be at least 100 characters long',
  }),
  searchQuery: z.string().optional().describe('Optional custom search query for fact-checking'),
  maxResults: z.number().int().positive().max(10).optional().describe('Maximum number of search results (1-10)'),
  temperature: z.number().min(0).max(2).optional().describe('Sampling temperature (0-2), lower is more focused'),
  maxTokens: z.number().int().positive().max(4000).optional().describe('Maximum tokens in the response (1-4000)'),
}).refine(
  (data) => data.imageBase64.startsWith('data:image/'),
  {
    message: 'Invalid image data format. Must be a data URL starting with data:image/',
    path: ['imageBase64']
  }
);

/**
 * POST /api/factcheck/image
 * 
 * Endpoint for fact-checking image content.
 * 
 * Request body:
 * {
 *   imageBase64: string;  // Base64-encoded image data (data:image/...)
 *   searchQuery?: string; // Optional custom search query
 *   maxResults?: number;  // Max number of search results (1-10)
 *   temperature?: number;// 0-2, lower is more focused/deterministic
 *   maxTokens?: number;  // Max tokens in the response (1-4000)
 * }
 */
export async function POST(request: Request) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validation = ImageFactCheckRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request', 
          details: validation.error.format(),
          timestamp: new Date().toISOString()
        },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, max-age=0',
          },
        }
      );
    }

    const { imageBase64, searchQuery, maxResults, temperature, maxTokens } = validation.data;
    
    // Get the current user from Supabase
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Error getting user session:', authError);
    }

    const userId = user?.id;

    // Call the fact-checking service
    const result = await factCheckService.checkImage(imageBase64);

    // Log the analysis if user is authenticated
    if (userId) {
      try {
        const inputData: AnalyzeImageInput = { 
          imageDataUri: imageBase64,
          userId
        };
        
        // Convert sources to the expected Reference[] format
        const references: Reference[] = (result.sources || []).map(source => ({
          reason: source.title || 'Source reference',
          link: source.url,
          source_title: source.title
        }));

        const resultData: AnalyzeImageOutput = {
          input_type: 'image',
          extracted_text: result.additional_context || '',
          label: result.verdict || 'unknown',
          confidence: result.confidence === 'high' ? 0.9 : result.confidence === 'medium' ? 0.6 : 0.3,
          allScores: {
            [result.verdict || 'unknown']: result.confidence === 'high' ? 0.9 : result.confidence === 'medium' ? 0.6 : 0.3,
            ...(result.verdict === 'true' ? { false: 0.1 } : { true: 0.1 }),
            ...(result.verdict === 'misleading' ? { unverifiable: 0.1 } : { misleading: 0.1 })
          },
          references
        };
        
        await saveAnalysisLog(
          userId,
          'image',
          inputData,
          resultData
        );
        console.log('Image analysis log saved successfully');
      } catch (logError) {
        console.error('Failed to save analysis log:', logError);
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
    console.error('Image fact check error:', error);
    
    // Return a structured error response
    return NextResponse.json(
      { 
        error: 'Failed to process image fact check',
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
