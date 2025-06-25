'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AuthProvider } from '@/contexts/AuthContext';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // Determine the auth message based on the current path
  const authMessage = useMemo(() => {
    return pathname === '/auth/login' ? 'Sign in to your account' : 'Create a new account';
  }, [pathname]);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase]);

  // Show loading state while checking auth status
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">NewsGuard AI</h1>
            <p className="text-sm text-muted-foreground">
              {authMessage}
            </p>
          </div>
          {children}
        </div>
      </div>
    </AuthProvider>
  );
}
