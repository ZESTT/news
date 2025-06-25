
'use client';

import type { LogEntry, TextAnalysisResponse, ImageAnalysisResponse, AnalyzeTextInput, AnalyzeImageInput } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const getLocalStorageKey = (userEmail: string): string => `activityLogs_${userEmail}`;

export function saveLogToLocalStorage(
  userEmail: string,
  analysisType: 'text' | 'image',
  inputData: AnalyzeTextInput | AnalyzeImageInput,
  resultData: TextAnalysisResponse | ImageAnalysisResponse
): void {
  if (typeof window === 'undefined' || !userEmail) {
    return;
  }

  const logEntry: LogEntry = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    userEmail,
    analysisType,
    input: analysisType === 'image' 
      ? (inputData as AnalyzeImageInput).imageDataUri 
      : (inputData as AnalyzeTextInput).text,
    result: resultData,
  };

  try {
    const key = getLocalStorageKey(userEmail);
    const existingLogsRaw = localStorage.getItem(key);
    const existingLogs: LogEntry[] = existingLogsRaw ? JSON.parse(existingLogsRaw) : [];
    
    // Add new log to the beginning of the array to show newest first
    existingLogs.unshift(logEntry); 
    
    localStorage.setItem(key, JSON.stringify(existingLogs.slice(0, 50))); // Limit to 50 entries
  } catch (error) {
    console.error("Error saving log to localStorage:", error);
  }
}

export function getLogsFromLocalStorage(userEmail: string): LogEntry[] {
  if (typeof window === 'undefined' || !userEmail) {
    return [];
  }

  try {
    const key = getLocalStorageKey(userEmail);
    const logsRaw = localStorage.getItem(key);
    return logsRaw ? JSON.parse(logsRaw) : [];
  } catch (error) {
    console.error("Error retrieving logs from localStorage:", error);
    return [];
  }
}
