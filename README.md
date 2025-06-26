# NewsGuard AI

NewsGuard AI is a fact-checking platform that helps verify the authenticity of text and images using AI-powered analysis.

## 🎯 Quick Start

1. **Install Dependencies**: `npm install`
2. **Setup Environment**: Copy `.env.example` to `.env.local` and fill in your API keys
3. **Database Setup**: Follow the [Supabase Setup](#-supabase-database-setup) section below
4. **Run the App**: `npm run dev`
5. **Open in Browser**: Visit `http://localhost:3000`

## Features

- 📝 Text fact-checking
- 🖼️ Image analysis
- 🔍 Web search integration
- 🔒 User authentication
- 📊 Dashboard with analysis history

## Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- Git
- Supabase account (for database)
- OpenRouter API key (for AI models)
- Serper API key (for web search)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/NewsGuardAi.git
cd NewsGuardAi
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update the `.env.local` file with your API keys and configuration:

   #### Supabase Configuration
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`:
     1. Go to [Supabase](https://supabase.com/) and sign in
     2. Create a new project or select an existing one
     3. Go to Project Settings > API
     4. Copy the `URL` and `anon` public key
     5. Paste them into your `.env.local` file

   #### OpenRouter API Key
   - `OPENROUTER_API_KEY`:
     1. Go to [OpenRouter](https://openrouter.ai/keys)
     2. Sign up or log in
     3. Go to "Keys" in the sidebar
     4. Click "Create new key"
     5. Copy the generated key

   #### Serper API Key (for web search)
   - `SERPER_API_KEY`:
     1. Go to [Serper](https://serper.dev/)
     2. Sign up for a free account
     3. Go to API Keys in the dashboard
     4. Copy your API key

   #### NextAuth Secret
   - `NEXTAUTH_SECRET`:
     Generate a secure random string using one of these methods:
     - On Linux/macOS: `openssl rand -base64 32`
     - Or use [this online generator](https://generate-secret.vercel.app/32)
     - Minimum 32 characters long

## 🗄️ Supabase Database Setup

### Step 1: Create a Supabase Project
1. Go to [Supabase](https://app.supabase.com/) and sign in (create an account if needed)
2. Click "New Project"
3. Fill in your project details:
   - Name: `NewsGuardAI` (or your preferred name)
   - Database Password: Save this in a secure password manager
   - Region: Choose one closest to your users
4. Click "Create new project"
5. Wait for the project to be ready (takes 1-2 minutes)

### Step 2: Set Up Database Tables
1. In your Supabase dashboard, click on the SQL Editor icon in the left sidebar
2. Click "New Query"
3. Copy and paste the following SQL code, then click "Run" or press Cmd+Enter (Mac) / Ctrl+Enter (Windows):

```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp" with schema extensions;

-- Create users table (managed by Supabase Auth)
-- This table is automatically created by Supabase Auth

-- Create ActivityLog table
create table if not exists "public"."ActivityLog" (
  "id" uuid not null default extensions.uuid_generate_v4(),
  "userId" uuid not null,
  "analysisType" text not null check ("analysisType" in ('text', 'image')),
  "inputData" text not null,
  "resultLabel" text not null,
  "resultConfidence" double precision not null,
  "resultAllScores" text not null,
  "resultReferences" text,
  "extractedText" text,
  "createdAt" timestamp with time zone not null default timezone('utc'::text, now()),
  "updatedAt" timestamp with time zone not null default timezone('utc'::text, now()),
  constraint ActivityLog_pkey primary key (id)
);

-- Add comments for documentation
comment on table "public"."ActivityLog" is 'Stores user activity logs for text and image analysis';
comment on column "public"."ActivityLog"."userId" is 'References auth.users.id';
comment on column "public"."ActivityLog"."analysisType" is 'Type of analysis: text or image';
comment on column "public"."ActivityLog"."inputData" is 'The raw input data (text or image data URI)';
comment on column "public"."ActivityLog"."resultLabel" is 'The result label (e.g., true, false, misleading)';
comment on column "public"."ActivityLog"."resultConfidence" is 'Confidence score from 0 to 1';
comment on column "public"."ActivityLog"."resultAllScores" is 'JSON string of all confidence scores';
comment on column "public"."ActivityLog"."resultReferences" is 'JSON array of reference objects';
comment on column "public"."ActivityLog"."extractedText" is 'For image analysis, the extracted text';

-- Create indexes for better query performance
create index if not exists "ActivityLog_userId_idx" on "public"."ActivityLog" ("userId");
create index if not exists "ActivityLog_createdAt_idx" on "public"."ActivityLog" ("createdAt" desc);

-- Enable Row Level Security (RLS)
alter table "public"."ActivityLog" enable row level security;

-- Create RLS policies
-- Allow users to see only their own logs
create policy "Users can view their own activity logs"
on "public"."ActivityLog" for select
to authenticated
using (auth.uid() = "userId");

-- Allow users to insert their own logs
create policy "Users can insert their own activity logs"
on "public"."ActivityLog" for insert
to authenticated
with check (auth.uid() = "userId");

-- Create a function to automatically set the updatedAt timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$ language 'plpgsql';

-- Create a trigger to update the updatedAt column
create trigger update_activitylog_updated_at
before update on "public"."ActivityLog"
for each row
execute function update_updated_at_column();
```

4. After running the SQL, you should see a success message

### Step 3: Set Up Authentication
1. In the Supabase dashboard, click on the "Authentication" icon in the left sidebar
2. Click on "Providers"
3. Enable "Email" under Email Provider
4. (Optional) Enable other providers like Google, GitHub, etc. if desired
5. Click "Save"

### Step 4: Configure Site URL
1. In the Supabase dashboard, go to Authentication > URL Configuration
2. Add your development URL (usually `http://localhost:3000`)
3. Add your production URL if you have one
4. Click "Save"

### Step 5: Get Your API Keys
1. In the Supabase dashboard, go to Project Settings (gear icon) > API
2. Note down these values for your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL` - The Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - The `anon` public key

### Step 6: Test Your Setup
1. Start your development server:
   ```bash
   npm run dev
   ```
2. Open your browser to `http://localhost:3000`
3. Try signing up for a new account
4. After signing in, try submitting a text or image for analysis
5. Go back to Supabase > Table Editor > ActivityLog to see your activity logs

## 🔒 Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key

# Serper (for web search)
SERPER_API_KEY=your_serper_api_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### How to Get API Keys

#### OpenRouter API Key
1. Go to [OpenRouter](https://openrouter.ai/keys)
2. Sign up or log in
3. Click on "Keys" in the sidebar
4. Click "Create new key"
5. Copy the generated key and add it to your `.env.local`

#### Serper API Key
1. Go to [Serper](https://serper.dev/)
2. Sign up for a free account
3. Go to API Keys in the dashboard
4. Copy your API key and add it to your `.env.local`

#### NextAuth Secret
Generate a secure random string using one of these methods:
- On Linux/macOS: `openssl rand -base64 32`
- Or use [this online generator](https://generate-secret.vercel.app/32)
- Minimum 32 characters long

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Check TypeScript types

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Issues
- **Error: Database connection failed**
  - Verify your Supabase URL and anon key in `.env.local`
  - Make sure you've copied the correct values from Supabase > Project Settings > API
  - Check if your IP is whitelisted in Supabase > Authentication > Policies
  - Ensure the database is running in Supabase (check the dashboard)
  - Try disconnecting and reconnecting to the database in Supabase

#### API Key Issues
- **Error: Invalid API key**
  - Double-check each API key in `.env.local`
  - Ensure there are no extra spaces, quotes, or special characters
  - Verify the services are active in their respective dashboards
  - For Supabase, ensure you're using the correct project's keys

#### Authentication Issues
- **Error: Invalid login credentials**
  - Make sure email/password authentication is enabled in Supabase > Authentication > Providers
  - Check if the user exists in Supabase > Authentication > Users
  - Try resetting the user's password if needed

#### RLS Policy Issues
- **Error: New row violates row-level security policy**
  - Verify the RLS policies are correctly set up
  - Make sure the user is properly authenticated
  - Check if the user ID matches the one in the JWT token

### How to Check Logs
1. In Supabase dashboard, go to the "Logs" section
2. Filter by "Database" or "Auth" to see relevant logs
3. Check the browser's developer console (F12 > Console) for client-side errors
4. Look at the terminal where you're running `npm run dev` for server-side errors

### Resetting the Database
If you need to start over:
1. In Supabase, go to Table Editor
2. Click on the three dots next to the `ActivityLog` table
3. Select "Delete Table" and confirm
4. Run the SQL script again to recreate the table

### Getting Help
If you're still having issues:
1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Search the [Supabase GitHub Issues](https://github.com/supabase/supabase/issues)
3. Ask for help in the [Supabase Discord](https://discord.supabase.com/)
4. Open an issue in the [NewsGuardAI GitHub repository](https://github.com/your-username/NewsGuardAi/issues)

### Getting Help
If you encounter any issues:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review the [Supabase documentation](https://supabase.com/docs)
3. Search for your issue in the [GitHub issues](https://github.com/your-username/NewsGuardAi/issues)
4. If you can't find a solution, open a new issue with details about the problem

## 📁 Project Structure

```
src/
├── app/                  # App router pages
│   ├── (protected)/      # Protected routes (require auth)
│   ├── api/              # API routes
│   └── auth/             # Authentication pages
├── components/           # Reusable components
├── lib/                  # Utility functions
├── public/               # Static files
└── styles/               # Global styles
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



## 🙏 Acknowledgments

- Next.js for the awesome framework
- Supabase for the backend services
- OpenRouter for AI model access
- Serper for web search capabilities
# news
# newsu
