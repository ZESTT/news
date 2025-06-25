import { NextRequest, NextResponse } from 'next/server';
import { serperService } from '@/services/serper.service';

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query) {
    return NextResponse.json(
      { error: 'Query is required' }, 
      { status: 400 }
    );
  }

  try {
    // Search for news articles and organic results
    const [newsResults, organicResults] = await Promise.all([
      serperService.searchNews(query, 5).catch(() => []),
      serperService.searchOrganic(query, 5).catch(() => []),
    ]);

    // Combine and deduplicate results
    const allResults = [...newsResults, ...organicResults];
    const uniqueResults = Array.from(new Map(
      allResults.map(item => [item.link, item])
    ).values());

    return NextResponse.json({ results: uniqueResults });
  } catch (error) {
    console.error('Search failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search results' }, 
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
