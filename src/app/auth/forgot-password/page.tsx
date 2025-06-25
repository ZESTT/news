'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/components/auth/AuthCard';
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      // If user is already authenticated, redirect to dashboard
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAuthLoading, router]);
  
  if (isAuthLoading || isAuthenticated) {
    return <PageLoadingSpinner />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Password reset email sent! Please check your inbox.');
      router.push('/auth/login');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <AuthCard
        title="Forgot Password"
        description="Enter your email to receive a password reset link"
        footerText="Remember your password?"
        footerLink="/auth/login"
        footerLinkText="Sign in"
        onSubmit={handleSubmit}
        isSubmitting={isLoading}
        submitText="Send Reset Link"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </div>
      </AuthCard>
    </div>
  );
}
