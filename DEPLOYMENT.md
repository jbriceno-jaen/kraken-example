# Deployment Guide - Vercel (Free Tier)

This guide will help you deploy your Kraken Elite Fitness app to Vercel for free.

## Prerequisites

1. A GitHub account (free)
2. A Vercel account (free) - sign up at [vercel.com](https://vercel.com)
3. Your Neon database connection string
4. A secure NEXTAUTH_SECRET

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
NEXTAUTH_SECRET=your-generated-secret-key-here
```

```
NEXTAUTH_URL=https://your-app.vercel.app
```

**Important:**
- Add these for **Production**, **Preview**, and **Development** environments
- After adding variables, you need to **redeploy** for them to take effect
- Generate `NEXTAUTH_SECRET` using: `openssl rand -base64 32`

### 4. Deploy Database Schema

After deployment, you need to push your database schema:

```bash
# Option 1: Run locally (recommended for first time)
# Make sure you have DATABASE_URL in your local .env.local
npm run db:push

# Option 2: Use Vercel CLI to run commands
vercel env pull .env.local  # Pull env vars locally
npm run db:push
```

### 5. Create Manager User

After deploying, create a manager user in your database. See [README-DATABASE.md](./README-DATABASE.md) for instructions.

**Important:** When creating a manager user directly in the database, make sure to set `approved: true` in the SQL INSERT statement.

### 6. Verify Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Test the application:
   - Register a new user
   - Sign in
   - Create a profile
   - Make a reservation
   - Add a personal record
   - Test manager features (if you created a manager account)

## Post-Deployment Checklist

- [ ] Environment variables are set in Vercel
- [ ] Database schema is pushed (`npm run db:push`)
- [ ] Manager user is created in database
- [ ] App is accessible at Vercel URL
- [ ] Authentication works (register/login)
- [ ] Database connections work
- [ ] All features are functional

## Troubleshooting

### Database Connection Issues

If you see "DATABASE_URL env var is not set":
1. Check Vercel dashboard → Settings → Environment Variables
2. Ensure `DATABASE_URL` is added for all environments
3. Redeploy after adding variables

### NextAuth Issues

If sign-in doesn't work:
1. Check that `NEXTAUTH_SECRET` is set and is a secure random string
2. Verify `NEXTAUTH_URL` matches your Vercel domain
3. Ensure environment variables are set correctly
4. Check browser console for errors

### Build Errors

If build fails:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Check for TypeScript errors locally first: `npm run build`

### Database Schema Issues

If database operations fail:
1. Verify `DATABASE_URL` is correct
2. Check Neon database is active (not paused)
3. Run `npm run db:push` locally to ensure schema is up to date
4. Check Neon dashboard for connection issues

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
4. Update `NEXTAUTH_URL` environment variable to your custom domain

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Neon Docs: https://neon.tech/docs
- NextAuth.js Docs: https://next-auth.js.org

