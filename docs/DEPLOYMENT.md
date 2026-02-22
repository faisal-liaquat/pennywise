# Deployment Guide — Vercel

## Why Vercel?

- Zero-config deployment for Vite projects
- Free tier: unlimited personal projects
- Automatic HTTPS
- Automatic deployments on every `git push`
- Global CDN
- No cold starts (unlike some other free hosts)
- Custom domains supported on free tier

---

## Pre-deployment Checklist

Before deploying, verify:

- [ ] `npm run build` completes without errors locally
- [ ] `.env` is listed in `.gitignore` (never commit secrets)
- [ ] `.env.example` is committed (it has no real secrets)
- [ ] Supabase project is active (not paused)
- [ ] All 3 migrations have been run in Supabase

---

## Step 1: Test Your Production Build Locally

```cmd
npm run build
npm run preview
```

Open [http://localhost:4173](http://localhost:4173) and verify the app works. If there are build errors, fix them before proceeding.

Stop the preview with Ctrl+C.

---

## Step 2: Push Your Code to GitHub

Make sure your feature branch is merged and main is up to date:

```cmd
git checkout main
git pull origin main
```

Verify your latest code is on GitHub at `https://github.com/YOUR_USERNAME/pennywise`.

---

## Step 3: Sign Up / Log In to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click **Sign Up**
3. Choose **Continue with GitHub** (this links your account)
4. Authorize Vercel to access your GitHub repos

---

## Step 4: Import Your Repository

1. From the Vercel dashboard, click **Add New…** → **Project**
2. Find `pennywise` in the list of repositories
3. Click **Import**

---

## Step 5: Configure the Project

On the "Configure Project" screen:

| Setting          | Value                           |
| ---------------- | ------------------------------- |
| Framework Preset | **Vite** (auto-detected)        |
| Root Directory   | `.` (leave as default)          |
| Build Command    | `npm run build` (auto-detected) |
| Output Directory | `dist` (auto-detected)          |
| Install Command  | `npm install` (auto-detected)   |

### Add Environment Variables

Still on this screen, scroll down to **Environment Variables** and add:

| Name                     | Value                                 |
| ------------------------ | ------------------------------------- |
| `VITE_SUPABASE_URL`      | `https://YOUR_PROJECT_ID.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `your_anon_key_here`                  |

Set both to apply to **Production**, **Preview**, and **Development** environments.

---

## Step 6: Deploy

Click **Deploy**.

Vercel will:

1. Clone your repository
2. Run `npm install`
3. Run `npm run build`
4. Deploy to their CDN

This takes about 1–2 minutes. You'll see a live URL like `https://pennywise-xyz123.vercel.app`.

---

## Step 7: Configure Supabase for Production

**This is critical** — without this, password reset emails and auth redirects will fail.

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. Click **Authentication** in the left sidebar
3. Click **URL Configuration**
4. Set **Site URL** to your Vercel URL (e.g. `https://pennywise-xyz123.vercel.app`)
5. Under **Redirect URLs**, add:

```
   https://pennywise-xyz123.vercel.app/**
   http://localhost:5173/**
```

6. Click **Save**

---

## Step 8: Test Production

Visit your Vercel URL and test:

- [ ] Register a new account
- [ ] Log in
- [ ] Create a budget period
- [ ] Add transactions
- [ ] View analytics charts
- [ ] Toggle dark mode
- [ ] Log out and log back in
- [ ] Test password reset (sends email, link opens on production URL)

---

## Step 9: (Optional) Set Up a Custom Domain

1. In Vercel dashboard → your project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g. `pennywise.yourdomain.com`)
4. Follow the DNS configuration instructions
5. Update Supabase Site URL and Redirect URLs with the new domain

---

## Continuous Deployment

After initial setup, every `git push` to `main` will automatically trigger a new Vercel deployment. No manual steps needed.

For feature branches, Vercel creates a temporary preview URL (e.g. `pennywise-git-feature-xyz.vercel.app`) so you can test before merging.

---

## Troubleshooting

**Build fails on Vercel but works locally**

- Check that all env vars are added in Vercel dashboard
- Make sure you didn't accidentally commit a `.env` file
- Check the Vercel build logs for the specific error

**Auth redirects go to localhost in production**

- You forgot to update Supabase Site URL — see Step 7

**App loads but shows blank/error**

- Open browser DevTools → Console
- Usually means `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing or wrong in Vercel
- Check Vercel dashboard → Settings → Environment Variables

**Supabase project is paused**

- Free tier Supabase projects pause after 1 week of inactivity
- Go to Supabase dashboard and click "Restore project"
- Consider upgrading to paid tier if this is a real production app

---

## Free Tier Limits

| Service       | Free Limit                  | Notes                             |
| ------------- | --------------------------- | --------------------------------- |
| Vercel        | Unlimited personal projects | 100GB bandwidth/month             |
| Supabase      | 500MB database              | 2GB file storage, 50MB/day egress |
| Supabase Auth | 50,000 MAU                  | More than enough for personal use |
