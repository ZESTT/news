
import { ShieldCheckIcon } from 'lucide-react';
import Link from 'next/link';

type AppLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
};

export function AppLogo({ size = 'md', href }: AppLogoProps) {
  const content = (
    <>
      <ShieldCheckIcon
        className="text-accent group-hover:text-primary transition-colors duration-200"
        size={size === 'lg' ? 36 : size === 'md' ? 28 : 24}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <h1 
        className={`font-headline font-semibold text-foreground group-hover:text-primary transition-colors duration-200 ${
          size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-xl'
        } group-data-[collapsible=icon]:hidden`}
      >
        NewsGuard AI
      </h1>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center gap-2 group relative z-30">
        {content}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2 group relative z-30">
      {content}
    </div>
  );
}
