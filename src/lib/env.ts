// Environment variable validation
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'DATABASE_URL',
  'DIRECT_URL'
] as const;

/**
 * Validates that all required environment variables are set.
 * Throws an error if any required variable is missing.
 */
function validateEnv() {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
    console.error('❌ Environment validation failed:');
    console.error(errorMessage);
    console.error('Please check your .env.local file and ensure all required variables are set.');
    
    if (process.env.NODE_ENV === 'development') {
      console.error('\nFor local development, you can copy .env.example to .env.local and fill in the values.');
    }
    
    throw new Error(errorMessage);
  }

  console.log('✅ Environment variables validated successfully');
}

// Run validation when this module is imported
if (typeof window === 'undefined') {
  try {
    validateEnv();
  } catch (error) {
    // Only throw in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      throw error;
    }
  }
}

export {};
