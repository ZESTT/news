
import { StyledFactCheck } from '@/components/FactCheck/StyledFactCheck';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fact Check - NewsGuard AI',
  description: 'Verify the accuracy of text content using AI-powered fact-checking',
};

export default function TextAnalysisPage() {
  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Text Fact-Checking
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Enter text content to verify its accuracy using AI-powered analysis and web search.
        </p>
      </div>
      <StyledFactCheck mode="text" />
    </div>
  );
}
