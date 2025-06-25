import { NextResponse } from 'next/server';

export async function GET() {
  // Only expose non-sensitive environment variables
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    publicUrl: process.env.NEXT_PUBLIC_APP_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '***' : 'Not set',
    databaseUrl: process.env.DATABASE_URL ? '***' : 'Not set',
  });
}
