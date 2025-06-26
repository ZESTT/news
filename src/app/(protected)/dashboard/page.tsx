'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ImageIcon, ArrowRight, BarChart2, PieChart } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import type { LogEntry } from '@/lib/types';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useToast } from '@/hooks/use-toast';

import { AppLogo } from '@/components/common/AppLogo';

// Define the structure for chart data
interface ChartData {
  name: string;
  count: number;
  confidence: number;
}

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
    ></path>
  </svg>
);

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  // Redirect to login if not authenticated (handled by middleware, but good practice to check)
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [isAuthenticated, isAuthLoading]); // Added isAuthenticated to dependency array
  const { toast } = useToast();
  const [textChartData, setTextChartData] = useState<ChartData[]>([{ name: 'Fake', count: 0, confidence: 0 }, { name: 'Real', count: 0, confidence: 0 }]);
  const [imageChartData, setImageChartData] = useState<ChartData[]>([{ name: 'Fake', count: 0, confidence: 0 }, { name: 'Real', count: 0, confidence: 0 }]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [fakeCount, setFakeCount] = useState(0);
  const [realCount, setRealCount] = useState(0);
  const [averageConfidence, setAverageConfidence] = useState(0);
  const [fakePercentage, setFakePercentage] = useState(0);

  // Using the new vibrant theme colors
  const FAKE_COLOR = 'hsl(var(--destructive))';
  const REAL_COLOR = 'hsl(var(--primary))';

  const fetchLogsForCharts = useCallback(async () => {
    if (!user?.id) {
      setIsLoadingLogs(false);
      return;
    }

    setIsLoadingLogs(true);
    try {
      const response = await fetch(`/api/logs?userId=${encodeURIComponent(user.id)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch logs');
      }
      const data = await response.json();
      const logs = Array.isArray(data) ? data : (data.logs || []);

      const textStats = { FAKE: { count: 0, totalConfidence: 0 }, REAL: { count: 0, totalConfidence: 0 } };
      const imageStats = { FAKE: { count: 0, totalConfidence: 0 }, REAL: { count: 0, totalConfidence: 0 } };

      logs.forEach((log: LogEntry) => {
        const label = log.result.label.toUpperCase() as 'FAKE' | 'REAL';
        const confidence = log.result.confidence;
        if (log.analysisType === 'text') {
          if (label in textStats) {
            textStats[label].count++;
            textStats[label].totalConfidence += confidence;
          }
        } else if (log.analysisType === 'image') {
          if (label in imageStats) {
            imageStats[label].count++;
            imageStats[label].totalConfidence += confidence;
          }
        }
      });

      setTextChartData([
        { name: 'Fake', count: textStats.FAKE.count, confidence: textStats.FAKE.count > 0 ? textStats.FAKE.totalConfidence / textStats.FAKE.count : 0 },
        { name: 'Real', count: textStats.REAL.count, confidence: textStats.REAL.count > 0 ? textStats.REAL.totalConfidence / textStats.REAL.count : 0 }
      ]);
      setImageChartData([
        { name: 'Fake', count: imageStats.FAKE.count, confidence: imageStats.FAKE.count > 0 ? imageStats.FAKE.totalConfidence / imageStats.FAKE.count : 0 },
        { name: 'Real', count: imageStats.REAL.count, confidence: imageStats.REAL.count > 0 ? imageStats.REAL.totalConfidence / imageStats.REAL.count : 0 }
      ]);

      const total = logs.length;
      const totalFake = textStats.FAKE.count + imageStats.FAKE.count;
      const totalReal = textStats.REAL.count + imageStats.REAL.count;
      const totalConfidenceSum = textStats.FAKE.totalConfidence + textStats.REAL.totalConfidence + imageStats.FAKE.totalConfidence + imageStats.REAL.totalConfidence;

      setTotalAnalyses(total);
      setFakeCount(totalFake);
      setRealCount(totalReal);
      setAverageConfidence(total > 0 ? (totalConfidenceSum / total) * 100 : 0);
      setFakePercentage(total > 0 ? (totalFake / total) * 100 : 0);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast({
        title: "Error Loading Stats",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingLogs(false);
    }
  }, [user?.id, toast]); // Added toast to dependency array

  useEffect(() => {
    fetchLogsForCharts();
  }, [fetchLogsForCharts]);

  const renderChart = (data: ChartData[], title: string) => (
    <Card className="glass-card shadow-wow transition-all duration-300 hover:shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-3 text-card-foreground tracking-tight">
          <BarChart2 className="h-6 w-6 text-secondary animate-pulse" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.some(d => d.count > 0) ? (
          <ResponsiveContainer width="100%" height={250}>
            <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="barGradientReal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={REAL_COLOR} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={REAL_COLOR} stopOpacity={0.4}/>
                </linearGradient>
                <linearGradient id="barGradientFake" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={FAKE_COLOR} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={FAKE_COLOR} stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--secondary) / 0.1)' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover) / 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  color: 'hsl(var(--popover-foreground))',
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                <LabelList 
                  dataKey="confidence"
                  position="top"
                  formatter={(value: number) => `${(value * 100).toFixed(0)}%`}
                  style={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 'bold' }}
                />
                {data.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.name === 'Fake' ? FAKE_COLOR : REAL_COLOR} />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex flex-col items-center justify-center text-center text-muted-foreground space-y-2">
            <PieChart className="h-12 w-12 text-secondary/50" />
            <p className="font-medium text-lg">No Data Yet</p>
            <p className="text-sm">Run an analysis to see your stats here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* Decorative Blobs in the background */}
      <Blob className="top-0 -left-1/4 w-full h-full opacity-50" />
      <Blob className="bottom-0 -right-1/4 w-full h-full opacity-50 animation-delay-3000" />

      <main className="container mx-auto p-4 md:p-8 relative z-10">
        {/* Top Navigation Bar */}
        <nav className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-30">
          <AppLogo />
        </nav>

        <header className="text-center my-16 pt-16">
          <h1 className="text-5xl md:text-7xl font-extrabold font-headline tracking-tighter text-gradient">
            NewsGuard AI Dashboard
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Welcome back, <span className="font-semibold text-foreground">{user?.name || 'User'}</span>. Let&apos;s uncover the truth, one analysis at a time.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* Text Analysis Card */}
          <Card className="glass-card shadow-wow transition-wow hover:scale-[1.025] hover:shadow-2xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-8 w-8 text-secondary animate-bounce" />
                <CardTitle className="text-2xl font-headline text-card-foreground tracking-tight">Text Analysis</CardTitle>
              </div>
              <CardDescription>
                Provide a block of text (e.g., article, post). We&apos;ll classify it for authenticity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ideal for news articles, social media posts, and other textual information.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="default" className="w-full md:w-auto transition-wow hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-accent">
                <Link href="/dashboard/text-analysis">
                  Analyze Text <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Image Analysis Card */}
          <Card className="glass-card shadow-wow transition-wow hover:scale-[1.025] hover:shadow-2xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <ImageIcon className="h-8 w-8 text-accent animate-bounce" />
                <CardTitle className="text-2xl font-headline text-card-foreground tracking-tight">Image Analysis</CardTitle>
              </div>
              <CardDescription>
                Upload an image (PNG/JPEG/WEBP). We&apos;ll extract text using OCR and then classify it for authenticity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Useful for memes, screenshots of articles, or any image containing text.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="default" className="w-full md:w-auto transition-wow hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-accent">
                <Link href="/dashboard/image-analysis">
                  Analyze Image <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <section className="my-20 py-8">
          <h2 className="text-4xl font-extrabold font-headline text-center mb-12 text-gradient drop-shadow-lg">Your Analysis Statistics</h2>
          
          {/* Key Stats Cards */}
          {!isLoadingLogs && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="glass-card hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalAnalyses}</div>
                  <p className="text-xs text-muted-foreground">Text & Image analyses combined</p>
                </CardContent>
              </Card>
              <Card className="glass-card hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fake Reports</CardTitle>
                  <BarChart2 className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{fakeCount}</div>
                  <p className="text-xs text-muted-foreground">{fakePercentage.toFixed(1)}% of total</p>
                </CardContent>
              </Card>
              <Card className="glass-card hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Real Reports</CardTitle>
                  <BarChart2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realCount}</div>
                  <p className="text-xs text-muted-foreground">{(100 - fakePercentage).toFixed(1)}% of total</p>
                </CardContent>
              </Card>
              <Card className="glass-card hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Confidence</CardTitle>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageConfidence.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Across all analyses</p>
                </CardContent>
              </Card>
            </div>
          )}

          {isLoadingLogs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="glass-card"><CardContent className="h-[300px] flex items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-secondary border-t-transparent"></div></CardContent></Card>
              <Card className="glass-card"><CardContent className="h-[300px] flex items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-secondary border-t-transparent"></div></CardContent></Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {renderChart(textChartData, "Text Analysis Stats")}
              {renderChart(imageChartData, "Image Analysis Stats")}
            </div>
          )}
        </section>

        <section className="my-20 py-8">
          <h2 className="text-4xl font-extrabold font-headline text-center mb-12 text-gradient drop-shadow-lg">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="glass-card p-6 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-secondary mb-4">
                <span className="font-bold text-3xl text-gradient">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Submit Content</h3>
              <p className="text-sm text-muted-foreground">Provide text or upload an image through our secure, modern forms.</p>
            </div>
            <div className="glass-card p-6 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-secondary mb-4">
                <span className="font-bold text-3xl text-gradient">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">Our advanced models process the content, cross-referencing with web data.</p>
            </div>
            <div className="glass-card p-6 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-secondary mb-4">
                <span className="font-bold text-3xl text-gradient">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Get Results</h3>
              <p className="text-sm text-muted-foreground">Receive a clear classification with confidence scores and sources.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}