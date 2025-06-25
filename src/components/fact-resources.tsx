'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type SearchResult = {
  title: string;
  link: string;
  snippet?: string;
  source?: string;
  date?: string;
  type?: string;
};

export function FactResources() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);

  const search = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/fact-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to load search results. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      search();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fact-Checking Resources</CardTitle>
          <p className="text-sm text-muted-foreground">
            Search for information to verify claims and find reliable sources
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-2xl items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter a claim to fact-check..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={search} 
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Searching...
                </div>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))
        ) : results.length > 0 ? (
          results.map((result, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <a 
                  href={result.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium text-base block mb-1"
                >
                  {result.title}
                </a>
                {result.source && (
                  <p className="text-xs text-muted-foreground mb-1">
                    {result.source} {result.date && `• ${result.date}`}
                  </p>
                )}
                {result.snippet && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {result.snippet}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          !isLoading && query && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No results found. Try a different search term.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
