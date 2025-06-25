
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
import type { User } from '@/lib/types';

const ADMIN_EMAIL = 'admin@newsguard.ai'; // Ensure this matches AuthContext

type UserRecord = Database['public']['Tables']['users']['Row'];

async function getCurrentUserEmail(request: NextRequest): Promise<string | null> {
  // For mock auth, expect client to send current user's email
  const url = new URL(request.url);
  return url.searchParams.get('currentUserEmail');
}

export async function GET(request: NextRequest) {
  const currentUserEmail = await getCurrentUserEmail(request);

  if (!currentUserEmail || currentUserEmail !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden: Access restricted to administrators.' }, { status: 403 });
  }

  try {
    const supabase = createClient();
    
    // Get admin user ID from auth.users table using RPC
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('email', ADMIN_EMAIL)
      .single();

    if (adminError || !adminUser) {
      console.error('Admin user not found:', adminError);
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    // Get all users from the users table
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Map Supabase users to the expected User type
    const formattedUsers: User[] = (users || []).map((user: UserRecord) => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      role: user.role || 'USER', // Default role if not set
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Failed to fetch users for admin:', error);
    return NextResponse.json({ error: 'Failed to retrieve users' }, { status: 500 });
  }
}
