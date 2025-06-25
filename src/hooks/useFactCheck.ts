"use client";

import { useState, useCallback } from 'react';
import type { FactCheckResult, UseFactCheckReturn, Source } from '@/types/fact-check';

type FactCheckResponse = UseFactCheckReturn & {
  content: string;
};

export function useFactCheck(): FactCheckResponse {
  const [content, setContent] = useState('');
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<Error | string | null>(null);

  const checkText = useCallback(async (text: string) => {
    setError(null);
    setContent('Analyzing text...');
    setResult(null);
    setIsChecking(true);

    try {
      const response = await fetch('/api/factcheck/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const result = await response.json();
      setResult(result);
      setContent('Analysis complete');
    } catch (err) {
      console.error('Fact check error:', err);
      setError(err instanceof Error ? err.message : 'Failed to check facts');
    } finally {
      setIsChecking(false);
    }
  }, []);

  const checkImage = useCallback(async (imageBase64: string) => {
    setError(null);
    setContent('Analyzing image...');
    setResult(null);
    setIsChecking(true);

    try {
      const response = await fetch('/api/factcheck/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64 }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const result = await response.json();
      setResult(result);
      setContent('Analysis complete');
    } catch (err) {
      console.error('Image fact check error:', err);
      setError(err instanceof Error ? err.message : 'Failed to check image');
    } finally {
      setIsChecking(false);
    }
  }, []);

  const reset = useCallback(() => {
    setContent('');
    setResult(null);
    setError(null);
    setIsChecking(false);
  }, []);

  return {
    content,
    result,
    isChecking,
    error,
    checkText: checkText as (text: string) => Promise<void>,
    checkImage: checkImage as (imageBase64: string) => Promise<void>,
    reset,
  } as const;
}
