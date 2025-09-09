# Rejected.gg - Job Application Tracker

A gamified job application tracker built with Next.js 14, Supabase, and TypeScript.

## 🚀 Quick Setup Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase

#### Step A: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project" 
3. Choose your organization
4. Enter project name: "rejected-gg" (or whatever you prefer)
5. Enter a secure database password (save this!)
6. Choose a region closest to you
7. Click "Create new project" (takes ~2 minutes)

#### Step B: Get Your API Keys
1. **Get Project URL**:
   - Go to Settings > General > Configuration
   - Copy your "Reference ID" (example: `abcdefghijklmnop`)
   - Your URL will be: `https://abcdefghijklmnop.supabase.co`

2. **Get API Keys**:
   - Go to Settings > API > Project API keys
   - Copy the **anon public** key (starts with `eyJ...`)
   - Copy the **service_role** key (starts with `eyJ...`) - KEEP THIS SECRET!

#### Step C: Configure Environment Variables
```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local with your actual values:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Set Up Database Tables

#### Install Supabase CLI
```bash
npm install -g supabase
```

#### Link to Your Project
```bash
# Link to your Supabase project (use your project's Reference ID)
supabase link --project-ref your-project-reference-id

# Create all database tables and policies
supabase db push

# Generate TypeScript types (optional but recommended)
npm run supabase:gen-types
```

### 4. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔧 Optional: Enable Google OAuth

1. **Create Google OAuth App**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing
   - Enable Google+ API
   - Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
   - Application type: Web application
   - Authorized redirect URIs: `https://your-project-id.supabase.co/auth/v1/callback`

2. **Configure in Supabase**:
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your Client ID and Client Secret

3. **For Local Development** (optional):
   - Update `supabase/config.toml`:
   ```toml
   [auth.external.google]
   enabled = true
   client_id = "your_google_client_id"
   secret = "your_google_client_secret"
   ```

## 🎯 Features

- ✅ User authentication (email/password + Google OAuth)
- ✅ Job application tracking with full CRUD
- ✅ Real-time statistics dashboard  
- ✅ Gamified leaderboard system
- ✅ CSV import/export functionality
- ✅ Dark/light theme support
- ✅ Responsive mobile design
- ✅ Email verification system

## 📊 Database Schema

The app creates these tables automatically:
- `profiles` - User profiles with usernames
- `applications` - Job applications with status tracking  
- `leaderboard_snapshots` - Computed leaderboard rankings

## 🚀 Deploy to Vercel

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 🐛 Troubleshooting

**Getting 500 errors?**
- Make sure you ran `supabase db push` to create tables
- Check that all environment variables are set correctly
- Verify your service role key is correct

**Can't sign up?**
- Check if email confirmation is enabled in Supabase
- Look for verification emails in spam folder

**Need help?**
- Check the browser console for errors
- Verify your Supabase project is active