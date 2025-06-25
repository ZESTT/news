export type Relevance = 'high' | 'medium' | 'low' | number;

export interface Source {
  title: string;
  url: string;
  relevance: Relevance;
  snippet?: string;
}

export interface FactCheckResult {
  isAccurate: boolean;
  confidence?: number;
  explanation?: string;
  sources?: Source[];
  relatedFacts?: string[];
}

export interface UseFactCheckReturn {
  result: FactCheckResult | null;
  isChecking: boolean;
  error: Error | string | null;
  checkText: (text: string) => Promise<void>;
  checkImage: (imageBase64: string) => Promise<void>;
  reset: () => void;
}

export interface FactCheckProps {
  initialImage?: string | null;
  onImageChange?: (image: string | null) => void;
  mode?: 'text' | 'image';
}
