'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

type SignInCredentials = {
  email: string;
  password: string;
  redirectTo?: string;
};

type SignOutOptions = {
  redirectTo?: string;
  callbackUrl?: string;
};

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: string;
}

type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

interface AuthContextType {
  user: AuthUser | null;
  status: AuthStatus;
  update: () => Promise<Session | null>;
  token?: string;
  signIn: (credentials: SignInCredentials) => Promise<{ success: boolean; error?: Error }>;
  signOut: (options?: SignOutOptions) => Promise<void>;
  signup: (credentials: { name: string; email: string; password: string }) => Promise<{ success: boolean; error?: Error }>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to map Supabase user to our AuthUser type
const mapUserData = (user: User | null): AuthUser | null => {
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || user.email?.split('@')[0] || null,
    image: user.user_metadata?.avatar_url || null,
    role: user.user_metadata?.role || 'user',
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [token, setToken] = useState<string | undefined>();

  // Check if user has a specific role
  const hasRole = useCallback((role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  }, [user]);

  // Update auth state from Supabase session
  const updateAuthState = useCallback(async () => {
    try {
      setStatus('loading');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        setUser(mapUserData(session.user));
        setToken(session.access_token);
        setStatus('authenticated');
      } else {
        setUser(null);
        setToken(undefined);
        setStatus('unauthenticated');
      }
      
      return session;
    } catch (error) {
      console.error('Error updating auth state:', error);
      setUser(null);
      setToken(undefined);
      setStatus('unauthenticated');
      return null;
    }
  }, [supabase.auth]);

  // Sign in function
  const signIn = useCallback(async ({ email, password, redirectTo }: SignInCredentials) => {
    try {
      setStatus('loading');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      // Force a full page reload to ensure all session data is loaded
      if (redirectTo) {
        window.location.href = redirectTo;
      } else {
        window.location.href = '/';
      }
      
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      setStatus('unauthenticated');
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Failed to sign in') 
      };
    }
  }, [supabase.auth]);

  // Sign out function
  const signOut = useCallback(async (options: SignOutOptions = {}) => {
    try {
      setStatus('loading');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Reset auth state
      setUser(null);
      setToken(undefined);
      setStatus('unauthenticated');
      
      // Force a full page reload to clear all state
      if (options.redirectTo) {
        window.location.href = options.redirectTo;
      } else if (options.callbackUrl) {
        window.location.href = options.callbackUrl;
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Sign out error:', error);
      setStatus('unauthenticated');
      throw error;
    }
  }, [supabase.auth]);

  // Sign up function
  const signup = useCallback(async ({ name, email, password }: { name: string; email: string; password: string }) => {
    try {
      setStatus('loading');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'user',
          },
        },
      });

      if (error) throw error;
      
      // Update auth state
      await updateAuthState();
      
      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      setStatus('unauthenticated');
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Failed to sign up') 
      };
    }
  }, [supabase.auth, updateAuthState]);

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        const session = await updateAuthState();
        
        // Only update state if component is still mounted
        if (mounted) {
          if (session) {
            setUser(mapUserData(session.user));
            setToken(session.access_token);
            setStatus('authenticated');
          } else {
            setUser(null);
            setToken(undefined);
            setStatus('unauthenticated');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setToken(undefined);
          setStatus('unauthenticated');
        }
      }
    };
    
    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        if (session) {
          setUser(mapUserData(session.user));
          setToken(session.access_token);
          setStatus('authenticated');
          
          // If user just signed in, redirect to dashboard or callback URL
          if (event === 'SIGNED_IN' && pathname.startsWith('/auth/')) {
            const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
            router.push(callbackUrl);
          }
        } else {
          setUser(null);
          setToken(undefined);
          setStatus('unauthenticated');
        }
      }
    });
    
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [updateAuthState, pathname, router, searchParams]);

  const value = {
    user,
    status,
    token,
    update: updateAuthState,
    signIn,
    signOut,
    signup,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    isAdmin: hasRole('admin'),
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
