
export interface User {
  id: string;
  name?: string;
  email: string;
  created_at: string; // ISO 8601 timestamp
}

export interface Reference {
  reason: string;
  link?: string | null; 
  source_title?: string | null; // Allow string, null, or undefined
}

export interface AnalysisResultBase {
  label: string;
  confidence: number;
  allScores: Record<string, number>;
  references?: Reference[];
}

export interface TextAnalysisResponse extends AnalysisResultBase {
  input_type: "text";
}

export interface ImageAnalysisResponse extends AnalysisResultBase {
  input_type: "image";
  extracted_text: string;
}

// This type represents the structure stored in SQLite for activity_logs
// and also the structure returned by the /api/logs endpoint
export interface LogEntry {
  id: string; 
  timestamp: string; 
  userEmail: string; 
  analysisType: 'text' | 'image';
  input: string; // The raw text, or the image data URI
  result: TextAnalysisResponse | ImageAnalysisResponse; 
}

// Represents a user entry as stored in the 'users' table in SQLite
// and returned by the admin users API.
export interface RegisteredUser {
    id: string;
    email: string;
    created_at: string; // ISO 8601 timestamp
}

export interface AnalyzeTextInput {
  text: string;
  userId?: string;
}

export interface AnalyzeImageInput {
  imageDataUri: string;
  userId?: string; // Made optional to match usage in the codebase
}

export interface AnalyzeTextOutput {
  label: string;
  confidence: number;
  allScores: Record<string, number>;
  references: Reference[];
  input_type?: 'text';
}

export interface AnalyzeImageOutput {
  input_type: 'image';
  extracted_text: string;
  label: string;
  confidence: number;
  allScores: Record<string, number>;
  references?: Reference[];
}
