
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { LogEntry, ImageAnalysisResponse, Reference, TextAnalysisResponse } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, FileText, Image as ImageIcon, Info, Link as LinkIcon, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function ActivityLogPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to login if not authenticated (handled by middleware, but good practice to check)
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [isAuthenticated, isAuthLoading]);

  const fetchLogs = useCallback(async () => {
    if (isAuthenticated && user?.id) {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/logs?userId=${encodeURIComponent(user.id)}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch logs');
        }
        const data = await response.json();
        // Handle both response formats for backward compatibility
        const fetchedLogs = Array.isArray(data) ? data : (data.logs || []);
        setLogs(fetchedLogs);
      } catch (error) {
        console.error("Error fetching logs:", error);
        toast({
          title: "Error",
          description: (error as Error).message || "Could not load activity logs.",
          variant: "destructive",
        });
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setLogs([]);
      setIsLoading(false);
    }
  }, [user?.id, toast]);


  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getFullInputText = (log: LogEntry): string => {
    if (log.analysisType === 'image') {
      const imageResult = log.result as ImageAnalysisResponse;
      return imageResult.extracted_text?.trim() || "No text extracted from image.";
    }
    return (log.input as string) || "No input text provided.";
  };

  const getDisplayInputSummary = (log: LogEntry, maxLength = 70): string => {
    const fullText = getFullInputText(log);
    if (log.analysisType === 'image') {
        const prefix = "Extracted: ";
        const availableLength = maxLength - prefix.length - 2; 
        const displayText = fullText.length > availableLength 
            ? `${fullText.substring(0, Math.max(0, availableLength - 3))}...` 
            : fullText;
        return `${prefix}"${displayText}"`;
    }
    return fullText.length > maxLength ? `${fullText.substring(0, maxLength - 3)}...` : fullText;
  };
  
  const getResultBadge = (label: string) => {
    const upperLabel = label.toUpperCase();
    if (upperLabel === 'FAKE') {
      return <Badge variant="fake" className="text-xs"><AlertTriangle className="mr-1 h-3 w-3" />FAKE</Badge>;
    }
    if (upperLabel === 'REAL') {
      return <Badge variant="real" className="text-xs"><CheckCircle className="mr-1 h-3 w-3" />REAL</Badge>;
    }
    // Fallback for other labels, e.g., UNCERTAIN
    return <Badge variant="secondary" className="text-xs"><Info className="mr-1 h-3 w-3" />{upperLabel}</Badge>;
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8">
        <Card className="shadow-lg bg-card text-card-foreground">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <History className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl font-headline">Activity Log</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              Review your past text and image analysis activities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-10">
                <History className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No analysis activities recorded yet.</p>
                <p className="text-sm text-muted-foreground">Perform some analyses, and they will show up here.</p>
              </div>
            ) : (
              <ScrollArea className="h-[60vh] rounded-md border border-border">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10 border-b border-border">
                    <TableRow>
                      <TableHead className="w-[150px] text-muted-foreground">Date</TableHead>
                      <TableHead className="w-[100px] text-muted-foreground">Type</TableHead>
                      <TableHead className="text-muted-foreground">Input Summary</TableHead>
                      <TableHead className="w-[120px] text-center text-muted-foreground">Result</TableHead>
                      <TableHead className="w-[120px] text-right text-muted-foreground">Confidence</TableHead>
                      <TableHead className="w-[80px] text-center text-muted-foreground">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id} className="border-border">
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize border-border text-muted-foreground">
                            {log.analysisType === 'text' ? 
                              <FileText className="h-3.5 w-3.5 mr-1.5" /> : 
                              <ImageIcon className="h-3.5 w-3.5 mr-1.5" />}
                            {log.analysisType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm truncate max-w-xs md:max-w-sm lg:max-w-md text-foreground">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-default">{getDisplayInputSummary(log)}</span>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="start" className="max-w-md bg-popover text-popover-foreground p-2 rounded shadow-lg text-xs border-border">
                              <p className="whitespace-pre-wrap break-words">
                                {log.analysisType === 'image' ? (log.result as ImageAnalysisResponse).extracted_text : log.input}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-center">
                          {getResultBadge(log.result.label)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-foreground">
                          {(log.result.confidence * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-accent hover:text-accent/80 hover:bg-accent/10 transition-colors">
                                <Info className="h-4 w-4" />
                                <span className="sr-only">View Details</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg bg-card text-card-foreground border-border">
                              <DialogHeader>
                                <DialogTitle>Analysis Details</DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                  Detailed information for the analysis performed on {new Date(log.timestamp).toLocaleString()}.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                                <div>
                                  <h3 className="font-semibold text-sm mb-1 text-card-foreground">
                                    {log.analysisType === 'image' ? 'Original Image Data URI (Input):' : 'Input Text:'}
                                  </h3>
                                  <ScrollArea className="h-24 rounded-md border border-border bg-muted/50 p-3">
                                    <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                                      {log.input}
                                    </p>
                                  </ScrollArea>
                                </div>
                                {log.analysisType === 'image' && (
                                  <div>
                                    <h3 className="font-semibold text-sm mb-1 text-card-foreground">Extracted Text:</h3>
                                    <p className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap break-words text-foreground">
                                      {(log.result as ImageAnalysisResponse).extracted_text || "No text extracted."}
                                    </p>
                                  </div>
                                )}
                                
                                {log.result.references && log.result.references.length > 0 && (
                                  <div>
                                    <h3 className="font-semibold text-sm mb-2 text-card-foreground">Reasoning & References:</h3>
                                    <div className="space-y-3">
                                      {log.result.references.map((ref, index) => (
                                        <div key={index} className="p-3 bg-muted/50 rounded-md shadow-sm text-sm border border-border/50">
                                          <p className="text-foreground mb-1">{ref.reason}</p>
                                          {ref.link && (
                                            <a
                                              href={ref.link}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs text-accent hover:text-accent/80 transition-colors duration-200 inline-flex items-center group"
                                            >
                                              <LinkIcon className="h-3 w-3 mr-1 text-accent/70 group-hover:text-accent transition-colors" />
                                              <span>View Source</span>
                                            </a>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {(!log.result.references || log.result.references.length === 0) && (
                                  <p className="text-sm text-muted-foreground italic">No specific reasoning or references were provided for this analysis.</p>
                                )}
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button type="button" variant="outline" className="transition-colors">
                                    Close
                                  </Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
