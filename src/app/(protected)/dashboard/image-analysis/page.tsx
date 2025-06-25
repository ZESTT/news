
import { StyledFactCheck } from '@/components/FactCheck/StyledFactCheck';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Fact Check - NewsGuard AI',
  description: 'Verify the accuracy of images and text within them using AI-powered fact-checking',
};

export default function ImageAnalysisPage() {
  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Image Fact-Checking
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Upload images containing text to verify their accuracy using AI-powered analysis and web search.
        </p>
      </div>
      <StyledFactCheck mode="image" />
    </div>
  );
}
