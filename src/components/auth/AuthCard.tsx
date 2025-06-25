import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

type AuthCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footerText: string;
  footerLink: string;
  footerLinkText: string;
  onSubmit?: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  submitText?: string;
};

export function AuthCard({
  title,
  description,
  children,
  footerText,
  footerLink,
  footerLinkText,
  onSubmit,
  isSubmitting = false,
  submitText = 'Continue',
}: AuthCardProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {children}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Loading...' : submitText}
          </Button>
        </CardContent>
      </form>
      <CardFooter className="text-sm text-muted-foreground justify-center">
        {footerText}{' '}
        <Link href={footerLink} className="text-primary font-medium hover:underline ml-1">
          {footerLinkText}
        </Link>
      </CardFooter>
    </Card>
  );
}
