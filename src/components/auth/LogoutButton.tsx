'use client';

import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function LogoutButton({ className = '' }: { className?: string }) {
  const { signOut, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
      className={`w-full justify-start gap-2 ${className}`}
    >
      <LogOut className="h-4 w-4" />
      {isLoading ? 'Signing out...' : 'Sign out'}
    </Button>
  );
}
