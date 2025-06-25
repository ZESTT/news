"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { useFactCheck } from '@/hooks/useFactCheck';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, X, ExternalLink, AlertCircle } from 'lucide-react';
import type { FactCheckProps, FactCheckResult, Source, UseFactCheckReturn } from '@/types/fact-check';

const DEFAULT_QUESTION = 'Is this information accurate?';

const AccuracyBadge: React.FC<{ isAccurate: boolean }> = ({ isAccurate }) => (
  <Badge variant={isAccurate ? 'success' : 'destructive'}>
    {isAccurate ? 'Accurate' : 'Inaccurate'}
  </Badge>
);

const SourceBadge: React.FC<{ source: Source }> = ({ source }) => (
  <a
    href={source.url}
    target="_blank"
    rel="noopener noreferrer"
    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
  >
    <ExternalLink className="h-3 w-3" />
    {source.title}
  </a>
);

export const FactCheck: React.FC<FactCheckProps> = ({ 
  initialImage, 
  onImageChange, 
  mode = 'image' 
}) => {
  // State for image handling
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [question, setQuestion] = useState(DEFAULT_QUESTION);
  const [context, setContext] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'image'>(mode);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fact check hook
  const { 
    result, 
    isChecking, 
    error, 
    checkText, 
    checkImage, 
    reset: resetFactCheck 
  } = useFactCheck() as UseFactCheckReturn;

  // Handle image upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const base64Data = result.split(',')[1];
      setImage(base64Data);
      onImageChange?.(base64Data);
    };
    reader.readAsDataURL(file);
  }, [onImageChange]);

  // Handle form submission for image fact check
  const handleImageSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;
    checkImage(image);
  }, [image, checkImage]);

  // Handle form submission for text fact check
  const handleTextSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!context.trim()) return;
    checkText(context);
  }, [context, checkText]);

  // Reset the form and state
  const handleReset = useCallback(() => {
    setImage(null);
    onImageChange?.(null);
    setImageUrl(null);
    setQuestion(DEFAULT_QUESTION);
    setContext('');
    resetFactCheck();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImageChange, resetFactCheck]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  // Update active tab when mode prop changes
  useEffect(() => {
    setActiveTab(mode);
  }, [mode]);

  // Clean up object URL when image changes
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Fact Check</CardTitle>
        <CardDescription>
          Verify the accuracy of text or images using AI-powered fact-checking
        </CardDescription>
        <div className="flex border-b">
          <button
            type="button"
            className={`px-4 py-2 font-medium ${
              activeTab === 'text' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground'
            }`}
            onClick={() => setActiveTab('text')}
          >
            Text
          </button>
          <button
            type="button"
            className={`px-4 py-2 font-medium ${
              activeTab === 'image' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground'
            }`}
            onClick={() => setActiveTab('image')}
          >
            Image
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        {activeTab === 'text' ? (
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="context">Text to Fact-Check</Label>
              <textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Paste the text you want to fact-check here..."
                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={8}
                required
                disabled={isChecking}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isChecking || !context.trim()}>
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check Facts'
                )}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleImageSubmit} className="space-y-4">
            {!image ? (
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <Label
                  htmlFor="file-upload"
                  className="cursor-pointer text-primary hover:text-primary/90 font-medium"
                >
                  <span>Upload an image</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    disabled={isChecking}
                  />
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={`data:image/jpeg;base64,${image}`}
                  alt="Preview"
                  className="rounded-lg w-full max-h-64 object-contain"
                />
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background"
                  disabled={isChecking}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="question">Question (Optional)</Label>
              <Input
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What would you like to verify about this image?"
                disabled={isChecking}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-context">Additional Context (Optional)</Label>
              <textarea
                id="image-context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Provide any additional context about the image"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isChecking}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isChecking}
              >
                Reset
              </Button>
              <Button 
                type="submit" 
                disabled={!image || isChecking}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Check Fact'
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>

      {(isChecking || error || result) && (
        <div className="border-t">
          <CardContent className="space-y-4">
            {isChecking && !result && (
              <div className="space-y-2">
                <Progress value={50} className="h-2 animate-pulse" />
                <p className="text-sm text-muted-foreground">
                  Analyzing {activeTab === 'image' ? 'image' : 'text'}...
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {typeof error === 'string' ? error : error?.message || 'An unknown error occurred'}
                </AlertDescription>
              </Alert>
            )}

            {result && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Fact Check Results</h3>
                  <AccuracyBadge isAccurate={result.isAccurate} />
                </div>

                {result.confidence !== undefined && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium">
                        {Math.round(result.confidence * 100)}%
                      </span>
                    </div>
                    <Progress value={result.confidence * 100} className="h-2" />
                  </div>
                )}

                {result.explanation && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      {result.explanation}
                    </p>
                  </div>
                )}

                {result.sources && result.sources.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Sources</h4>
                    <div className="space-y-2">
                      {result.sources.map((source, index) => (
                        <div key={index} className="text-sm">
                          <SourceBadge source={source} />
                          {source.snippet && (
                            <p className="text-muted-foreground mt-1">
                              {source.snippet}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.relatedFacts && result.relatedFacts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Related Facts</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                      {result.relatedFacts.map((fact, index) => (
                        <li key={index}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </div>
      )}
    </Card>
  );
};

export default FactCheck;
