import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AuthError } from '@supabase/supabase-js';

// User type for our application
export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: string;
}

/**
 * Get the current user from the session
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.full_name || user.user_metadata?.name || null,
    image: user.user_metadata?.avatar_url || user.user_metadata?.image || null,
    role: user.user_metadata?.role || 'USER',
  } as User;
}

/**
 * Require authentication for a route handler
 * @param request The Next.js request object
 * @returns NextResponse.redirect if not authenticated, null if authenticated
 */
export async function requireAuth(
  request: NextRequest
): Promise<NextResponse | null> {
  const user = await getCurrentUser();
  const requestUrl = new URL(request.url);

  if (!user) {
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${encodeURIComponent(requestUrl.pathname)}`, request.url)
    );
  }

  return null;
}

/**
 * Verify a password by signing in with email and password
 * @param email The user's email
 * @param password The plain text password
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function verifyPassword(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Update a user's password
 * @param newPassword The new password
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function updatePassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
