import { Metadata } from 'next';
import { FactResources } from '@/components/fact-resources';

export const metadata: Metadata = {
  title: 'Fact-Checking Resources | NewsGuardAI',
  description: 'Search for reliable sources to verify claims and fact-check information',
};

export default function FactCheckResourcesPage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        <FactResources />
      </div>
    </div>
  );
}
