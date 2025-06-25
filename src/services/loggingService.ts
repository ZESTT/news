'use server';

/**
 * @fileOverview A service for logging analysis events to Supabase.
 */

import type { 
  LogEntry, 
  TextAnalysisResponse, 
  ImageAnalysisResponse,
  AnalyzeTextInput,
  AnalyzeTextOutput,
  AnalyzeImageInput,
  AnalyzeImageOutput 
} from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

type ActivityLog = Database['public']['Tables']['ActivityLog']['Insert'];

export async function saveAnalysisLog(
  userId: string | undefined,
  analysisType: 'text' | 'image',
  inputData: AnalyzeTextInput | AnalyzeImageInput,
  resultData: AnalyzeTextOutput | AnalyzeImageOutput
): Promise<string | void> {
  // Skip saving if no user ID is provided
  if (!userId) {
    console.warn('Skipping analysis log save: No user ID provided');
    return;
  }
  
  let finalResultForLog: TextAnalysisResponse | ImageAnalysisResponse;
  let inputTextOrDataUri: string;
  let extractedText: string | undefined = undefined;

  if (analysisType === 'text') {
    const textOutput = resultData as AnalyzeTextOutput;
    const textInput = inputData as AnalyzeTextInput;
    inputTextOrDataUri = textInput.text;
    finalResultForLog = {
      input_type: 'text',
      label: textOutput.label,
      confidence: textOutput.confidence,
      allScores: textOutput.allScores,
      references: textOutput.references,
    };
  } else { // image
    const imageOutput = resultData as AnalyzeImageOutput;
    const imageInput = inputData as AnalyzeImageInput;
    inputTextOrDataUri = imageInput.imageDataUri;
    extractedText = imageOutput.extracted_text;
    finalResultForLog = {
      input_type: 'image',
      label: imageOutput.label,
      confidence: imageOutput.confidence,
      allScores: imageOutput.allScores,
      references: imageOutput.references,
      extracted_text: imageOutput.extracted_text,
    };
  }

  const logEntryForDb: ActivityLog = {
    id: uuidv4(),
    userId: userId,
    analysisType: analysisType,
    inputData: inputTextOrDataUri,
    resultLabel: finalResultForLog.label,
    resultConfidence: finalResultForLog.confidence,
    resultAllScores: JSON.stringify(finalResultForLog.allScores),
    resultReferences: finalResultForLog.references ? JSON.stringify(finalResultForLog.references) : null,
    extractedText: extractedText || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('ActivityLog')
      .insert(logEntryForDb);

    if (error) {
      throw error;
    }
    
    console.log(`Log entry ${logEntryForDb.id} saved to Supabase for user ${userId}.`);
    return logEntryForDb.id;
  } catch (error) {
    console.error('Error saving analysis log to Supabase:', error);
    throw error; // Re-throw to allow handling by the caller
  }
}
