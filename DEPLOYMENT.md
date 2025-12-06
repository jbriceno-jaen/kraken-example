# Deployment Guide - Vercel (Free Tier)

This guide will help you deploy your Kraken Elite Fitness app to Vercel for free.

## Prerequisites

1. A GitHub account (free)
2. A Vercel account (free) - sign up at [vercel.com](https://vercel.com)
3. Your Neon database connection string
4. Your Clerk authentication keys

## Step-by-Step Deployment

### 1. Push Your Code to GitHub

If you haven't already, create a GitHub repository and push your code:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. **Configure Environment Variables** (IMPORTANT - see below)
6. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow the prompts
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? kraken-example (or your choice)
# - Directory? ./
# - Override settings? No
```

### 3. Configure Environment Variables

**CRITICAL:** You must add all environment variables in Vercel dashboard:

1. Go to your project on Vercel
2. Click "Settings" → "Environment Variables"
3. Add the following variables:

#### Required Variables:

```
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

```
CLERK_SECRET_KEY=sk_test_...
```

#### Optional Variables (if you have them):

```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

**Important:**
- Add these for **Production**, **Preview**, and **Development** environments
- After adding variables, you need to **redeploy** for them to take effect

### 4. Update Clerk Settings

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to your application
3. Go to "Domains" or "Settings"
4. Add your Vercel domain to allowed domains:
   - Production: `your-app.vercel.app`
   - Custom domain (if you add one later)

### 5. Deploy Database Schema

After deployment, you need to push your database schema:

```bash
# Option 1: Run locally (recommended for first time)
npm run db:push

# Option 2: Use Vercel CLI to run commands
vercel env pull .env.local  # Pull env vars locally
npm run db:push
```

### 6. Verify Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Test the application:
   - Sign in with Clerk
   - Create a profile
   - Make a reservation
   - Add a personal record

## Post-Deployment Checklist

- [ ] Environment variables are set in Vercel
- [ ] Database schema is pushed (`npm run db:push`)
- [ ] Clerk domain is configured
- [ ] App is accessible at Vercel URL
- [ ] Authentication works
- [ ] Database connections work
- [ ] All features are functional

## Troubleshooting

### Database Connection Issues

If you see "DATABASE_URL env var is not set":
1. Check Vercel dashboard → Settings → Environment Variables
2. Ensure `DATABASE_URL` is added for all environments
3. Redeploy after adding variables

### Clerk Authentication Issues

If sign-in doesn't work:
1. Check Clerk dashboard → Allowed domains
2. Add your Vercel domain
3. Verify environment variables are set correctly

### Build Errors

If build fails:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Check for TypeScript errors locally first

## Free Tier Limits

**Vercel Free Tier:**
- Unlimited deployments
- 100GB bandwidth/month
- Serverless functions (suitable for this app)
- Automatic HTTPS
- Custom domains

**Neon Free Tier:**
- 0.5 GB storage
- Sufficient for testing
- Auto-pause after inactivity (wakes up on first request)

## Updating Your App

After making changes:

```bash
# Commit and push to GitHub
git add .
git commit -m "Your changes"
git push

# Vercel automatically deploys on push to main branch
```

## Custom Domain (Optional)

1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Clerk allowed domains

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Neon Docs: https://neon.tech/docs
