# Environment Variables Setup Guide

## Overview

PennyWise uses two environment variables, both from your Supabase project.

## Step 1: Get Your Supabase Credentials

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click on your **pennywise** project
3. In the left sidebar, click **Settings** (gear icon)
4. Click **API**

You'll see two important values:

| Field                       | Where to find it         | Use it?                                   |
| --------------------------- | ------------------------ | ----------------------------------------- |
| Project URL                 | Under "Project URL"      | ✅ Yes — this is `VITE_SUPABASE_URL`      |
| `anon` `public` key         | Under "Project API keys" | ✅ Yes — this is `VITE_SUPABASE_ANON_KEY` |
| `service_role` `secret` key | Under "Project API keys" | ❌ Never — bypasses RLS                   |

## Step 2: Create Your .env File

**Windows:**

```cmd
copy .env.example .env
```

**Mac/Linux:**

```bash
cp .env.example .env
```

## Step 3: Fill In Your Values

Open `.env` and set:

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

## Step 4: For Production (Vercel)

When deploying, do NOT upload your `.env` file. Instead, add these variables in Vercel:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add `VITE_SUPABASE_URL` → paste your Project URL
4. Add `VITE_SUPABASE_ANON_KEY` → paste your anon key
5. Set scope to **Production**, **Preview**, and **Development**
6. Click **Save**
7. Re-deploy (Vercel will auto-redeploy)

## Step 5: Configure Supabase Auth Redirect URLs

For password reset and magic links to work in production, you need to whitelist your production URL in Supabase:

1. Go to Supabase → **Authentication** → **URL Configuration**
2. Set **Site URL** to your Vercel URL, e.g. `https://pennywise.vercel.app`
3. Under **Redirect URLs**, add:
   - `https://pennywise.vercel.app/**`
   - `http://localhost:5173/**` (for local dev)
4. Click **Save**

## Security Notes

- `.env` is in `.gitignore` — it is never committed to git
- The `anon` key is safe to use in browser code — it cannot bypass Row Level Security
- Never paste your `service_role` key anywhere in your codebase
- If you accidentally commit secrets, rotate your keys immediately in Supabase → Settings → API → Regenerate
