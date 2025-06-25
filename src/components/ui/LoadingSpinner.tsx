import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export function LoadingSpinner({ className = '', size = 24 }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className="animate-spin" size={size} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner size={48} className="text-primary" />
    </div>
  );
}
