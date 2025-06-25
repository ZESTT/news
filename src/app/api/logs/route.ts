
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
import type { LogEntry, Reference } from '@/lib/types';

type ActivityLog = Database['public']['Tables']['ActivityLog']['Row'];

// Helper type for safe type checking
type AnalysisType = 'text' | 'image';

function isAnalysisType(value: string): value is AnalysisType {
  return value === 'text' || value === 'image';
}

// A utility to get user ID from the request
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // Get user ID from query params (consider using session/auth in production)
  const url = new URL(request.url);
  return url.searchParams.get('userId');
}

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized or user ID missing' }, { status: 401 });
  }

  try {
    const supabase = createClient();
    
    // Query logs for the current user, ordered by most recent first
    const { data: logs, error } = await supabase
      .from('ActivityLog')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) {
      throw error;
    }

    if (!logs || logs.length === 0) {
      return NextResponse.json({ logs: [] });
    }

    // Transform the database logs to match the LogEntry type expected by the frontend
    const formattedLogs: LogEntry[] = logs.map((log) => {
      // Parse the allScores JSON string back to an object
      let allScores: Record<string, number> = {};
      try {
        allScores = JSON.parse(log.resultAllScores || '{}');
      } catch (e) {
        console.error('Error parsing allScores JSON:', e);
      }

      // Parse the references JSON string back to an array of Reference objects
      let references: Reference[] = [];
      if (log.resultReferences) {
        try {
          references = JSON.parse(log.resultReferences) as Reference[];
        } catch (e) {
          console.error('Error parsing references JSON:', e);
        }
      }

      // Create the result object based on the analysis type
      const result = isAnalysisType(log.analysisType) && log.analysisType === 'image'
        ? {
            input_type: 'image' as const,
            label: log.resultLabel,
            confidence: log.resultConfidence,
            allScores: allScores,
            references: references,
            extracted_text: log.extractedText || ''
          }
        : {
            input_type: 'text' as const,
            label: log.resultLabel,
            confidence: log.resultConfidence,
            allScores: allScores,
            references: references
          };

      return {
        id: log.id,
        userId: log.userId,
        userEmail: log.userId, // Using userId as email for backward compatibility
        analysisType: isAnalysisType(log.analysisType) ? log.analysisType : 'text',
        inputData: log.inputData,
        resultLabel: log.resultLabel,
        resultConfidence: log.resultConfidence,
        resultAllScores: allScores,
        resultReferences: references,
        extractedText: log.extractedText,
        timestamp: log.createdAt,
        input: log.inputData,
        result: result
      };
    });

    return NextResponse.json({ logs: formattedLogs });
  } catch (error) {
    console.error('Failed to fetch logs from database:', error);
    return NextResponse.json({ error: 'Failed to retrieve logs' }, { status: 500 });
  }
}
