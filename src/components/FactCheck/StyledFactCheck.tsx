'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useFactCheck } from '@/hooks/useFactCheck';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, ExternalLink, AlertCircle, BarChart2, Check, X as XIcon, HelpCircle, FileText } from 'lucide-react';
import type { FactCheckProps, FactCheckResult, Source, UseFactCheckReturn } from '@/types/fact-check';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DEFAULT_QUESTION = 'Is this information accurate?';

const AccuracyBadge: React.FC<{ isAccurate: boolean }> = ({ isAccurate }) => (
  <Badge variant={isAccurate ? 'success' : 'destructive'} className="text-sm py-1 px-3 rounded-full">
    {isAccurate ? (
      <Check className="h-3.5 w-3.5 mr-1.5" />
    ) : (
      <XIcon className="h-3.5 w-3.5 mr-1.5" />
    )}
    {isAccurate ? 'Accurate' : 'Inaccurate'}
  </Badge>
);

const SourceBadge: React.FC<{ source: Source }> = ({ source }) => (
  <a
    href={source.url}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
  >
    <ExternalLink className="h-3.5 w-3.5" />
    {source.title || 'View Source'}
  </a>
);

// A decorative SVG blob component for the background
const Blob = ({ className }: { className?: string }) => (
  <svg
    className={`absolute -z-10 animate-float pointer-events-none ${className}`}
    viewBox="0 0 1000 1000"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="blobGradient" gradientTransform="rotate(90)">
        <stop offset="0%" stopColor="hsl(var(--primary) / 0.5)" />
        <stop offset="100%" stopColor="hsl(var(--secondary) / 0.5)" />
      </linearGradient>
    </defs>
    <path
      fill="url(#blobGradient)"
      d="M815.5,618Q749,736,624.5,799.5Q500,863,388,791Q276,719,192,624Q108,529,155.5,414Q203,299,326.5,230.5Q450,162,569,141.5Q688,121,788,210.5Q888,300,868.5,400Q849,500,815.5,618Z"
    />
  </svg>
);

export const StyledFactCheck: React.FC<FactCheckProps> = ({ 
  initialImage, 
  onImageChange, 
  mode = 'image' 
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<'text' | 'image'>(mode);
  const [inputText, setInputText] = useState('');
  const [image, setImage] = useState<string | undefined>(initialImage || undefined);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Update image preview when initialImage changes
  useEffect(() => {
    if (initialImage) {
      setImage(initialImage);
      setImagePreview(`data:image/jpeg;base64,${initialImage}`);
      // Alias for compatibility
      const imageUrl = `data:image/jpeg;base64,${initialImage}`;
      // @ts-expect-error - For compatibility with existing code
      window.imageUrl = imageUrl;
    }
  }, [initialImage]);
  
  // Fact check hook
  const { 
    result, 
    isChecking, 
    checkText, 
    checkImage, 
    reset: resetFactCheck 
  } = useFactCheck() as UseFactCheckReturn;

  // Handle file upload
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Check file size (5MB max)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const result = event.target.result as string;
        setImagePreview(result);
        setImage(result.split(',')[1]); // Store base64 data
        onImageChange?.(result.split(',')[1]);
      }
    };
    reader.onerror = () => {
      setError('Failed to load image');
    };
    reader.readAsDataURL(file);
    
    setError(null);
  }, [onImageChange]);

  // Handle drag over for image upload
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);
  
  // Handle file drop for image upload
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Check file size (5MB max)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const result = event.target.result as string;
        setImagePreview(result);
        setImage(result.split(',')[1]);
        onImageChange?.(result.split(',')[1]);
      }
    };
    reader.onerror = () => {
      setError('Failed to load image');
    };
    reader.readAsDataURL(file);
  }, [onImageChange]);

  // Handle image upload from file input
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Check file size (5MB max)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const result = event.target.result as string;
        setImagePreview(result);
        const base64Data = result.split(',')[1];
        setImage(base64Data);
        onImageChange?.(base64Data);
      }
    };
    reader.onerror = () => {
      setError('Failed to load image');
    };
    reader.readAsDataURL(file);
    
    setError(null);
  }, [onImageChange]);
  
  // Handle text input change
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setInputText(e.target.value);
  }, []);
  
  // Alias for compatibility with existing code
  const setContext = setInputText;

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (activeTab === 'text' && !inputText.trim()) {
      setError('Please enter some text to analyze');
      return;
    }
    
    if (activeTab === 'image' && !imagePreview) {
      setError('Please upload an image to analyze');
      return;
    }
    
    setError(null);
    
    try {
      if (activeTab === 'text') {
        await checkText(inputText);
      } else if (image) {
        await checkImage(image);
      }
    } catch (err) {
      setError('An error occurred while processing your request. Please try again.');
      console.error('Fact check error:', err);
    }
  }, [activeTab, inputText, imagePreview, image, checkText, checkImage]);
  
  // Alias for compatibility with existing code
  const handleTextSubmit = handleSubmit;
  const handleImageSubmit = handleSubmit;
  const context = inputText; // Alias for compatibility

  // Reset the form and state
  const handleReset = useCallback(() => {
    resetFactCheck();
    setImage(undefined);
    setImagePreview(null);
    setInputText('');
    setError(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageChange?.('');
  }, [onImageChange, resetFactCheck]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Update active tab when mode prop changes
  useEffect(() => {
    setActiveTab(mode);
  }, [mode]);

  // Chart data for the result
  const chartData = result && result.confidence !== undefined ? [
    { 
      name: 'Confidence', 
      value: result.confidence,
      fill: result.confidence >= 75 ? 'hsl(var(--success))' : 
            result.confidence >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'
    },
    { 
      name: 'Remaining', 
      value: 100 - result.confidence,
      fill: '#f0f0f0',
    },
  ] : [];

  // Render the fact check result
  const renderResult = () => {
    if (isChecking) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Analyzing content...</p>
          <Progress value={0} className="mt-4 w-full max-w-md" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {typeof error === 'string' ? error : 'An error occurred while processing your request.'}
          </AlertDescription>
        </Alert>
      );
    }

    if (!result) return null;

    return (
      <div className="mt-8 space-y-8">
        {/* Result Summary */}
        <Card className="glass-card shadow-wow">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-headline">Analysis Result</CardTitle>
                <CardDescription className="mt-1">
                  {result.explanation}
                </CardDescription>
              </div>
              <AccuracyBadge isAccurate={result.isAccurate} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                  <XAxis 
                    type="number" 
                    domain={[0, 100]} 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={90}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Confidence']}
                    cursor={{ fill: 'hsl(var(--secondary) / 0.1)' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover) / 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      color: 'hsl(var(--popover-foreground))',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sources */}
        {(result.sources && result.sources.length > 0) && (
          <Card className="glass-card shadow-wow">
            <CardHeader>
              <CardTitle className="text-xl font-headline">References</CardTitle>
              <CardDescription>Sources used for this analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.sources.map((source, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground line-clamp-1">
                        {source.title || 'Source ' + (index + 1)}
                      </h4>
                      <SourceBadge source={source} />
                    </div>
                    {source.snippet && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {source.snippet}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Related Facts */}
        {(result.relatedFacts && result.relatedFacts.length > 0) && (
          <Card className="glass-card shadow-wow">
            <CardHeader>
              <CardTitle className="text-xl font-headline">Related Facts</CardTitle>
              <CardDescription>Additional information that might be relevant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2">
                {result.relatedFacts.map((fact, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{fact}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Decorative Blobs in the background */}
      <Blob className="top-0 -left-1/4 w-full h-full opacity-30" />
      <Blob className="bottom-0 -right-1/4 w-full h-full opacity-30 animation-delay-3000" />

      <div className="relative z-10">
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'text' | 'image')}
          className="w-full space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Text Analysis
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Image Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-6">
            <Card className="glass-card shadow-wow">
              <CardHeader>
                <CardTitle className="text-2xl font-headline">Text Analysis</CardTitle>
                <CardDescription>
                  Enter the text you want to fact-check
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleTextSubmit}>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="text-input">Text to analyze</Label>
                      <textarea
                        id="text-input"
                        className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Paste the text you want to fact-check here..."
                        disabled={isChecking}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t border-border/40 bg-muted/20 px-6 py-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleReset}
                    disabled={isChecking || (!context && !result)}
                  >
                    <XIcon className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!inputText.trim() || isChecking}
                    className="transition-wow hover:scale-105"
                  >
                    {isChecking ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart2 className="h-4 w-4 mr-2" />
                        Analyze Text
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {renderResult()}
          </TabsContent>

          <TabsContent value="image" className="space-y-6">
            <Card className="glass-card shadow-wow">
              <CardHeader>
                <CardTitle className="text-2xl font-headline">Image Analysis</CardTitle>
                <CardDescription>
                  Upload an image containing text to fact-check
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleImageSubmit}>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="image-upload">Image to analyze</Label>
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="image-upload"
                          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                            <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG, or WEBP (MAX. 5MB)
                            </p>
                          </div>
                          <input
                            id="image-upload"
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleImageUpload}
                            disabled={isChecking}
                          />
                        </label>
                      </div>
                    </div>
                    {imagePreview && (
                      <div className="mt-4 rounded-lg overflow-hidden border border-border">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-auto max-h-64 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t border-border/40 bg-muted/20 px-6 py-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleReset}
                    disabled={isChecking || (!imagePreview && !result)}
                  >
                    <XIcon className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!imagePreview || isChecking}
                    className="transition-wow hover:scale-105"
                  >
                    {isChecking ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart2 className="h-4 w-4 mr-2" />
                        Analyze Image
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {renderResult()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StyledFactCheck;
