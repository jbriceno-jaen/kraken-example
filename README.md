# Kraken Elite Fitness

A modern CrossFit gym management platform built with Next.js, featuring class reservations, personal record tracking, and member profiles.

## Features

- 🏋️ **Class Reservations**: Book training sessions for morning (5-8 AM) or afternoon (4-7 PM) slots
- 📊 **Personal Records**: Track and manage your PRs (Personal Records) for different exercises
- 👤 **Member Profiles**: Update your information and training goals
- 🔐 **Authentication**: Secure authentication powered by Clerk
- 💾 **Database**: PostgreSQL database with Drizzle ORM
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + shadcn/ui
- **Authentication**: Clerk
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Neon account)
- Clerk account for authentication

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kraken-example
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional: Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

4. Set up the database:
```bash
# Push schema to database
npm run db:push

# Or generate migrations
npm run db:generate
npm run db:migrate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
kraken-example/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── class-slots/   # Available class slots
│   │   ├── personal-records/  # Personal records CRUD
│   │   ├── profile/       # User profile management
│   │   └── reservations/  # Class reservations
│   ├── dashboard/        # Member dashboard
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── ui/               # Reusable UI components
│   ├── hero.tsx          # Hero section
│   ├── navbar.tsx        # Navigation bar
│   ├── pricing.tsx       # Pricing plans
│   └── ...
├── src/
│   └── db/              # Database configuration
│       ├── client.ts    # Database client
│       └── schema.ts    # Database schema
└── lib/                 # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:test` - Test database connection

## API Routes

### Profile
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Create or update profile

### Reservations
- `GET /api/reservations` - Get user reservations
- `POST /api/reservations` - Create new reservation

### Personal Records
- `GET /api/personal-records` - Get all PRs
- `POST /api/personal-records` - Create new PR
- `GET /api/personal-records/[id]` - Get specific PR
- `PATCH /api/personal-records/[id]` - Update PR
- `DELETE /api/personal-records/[id]` - Delete PR

### Class Slots
- `GET /api/class-slots` - Get available class slots

## Database Schema

- **users**: User accounts
- **profiles**: Extended user profile information
- **reservations**: Class reservations
- **personal_records**: Personal record tracking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Deploy on Vercel (Free)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Quick Deployment Steps:

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure environment variables (see below)
   - Click "Deploy"

3. **Set Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add these variables:
     - `DATABASE_URL` - Your Neon database connection string
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
     - `CLERK_SECRET_KEY` - From Clerk dashboard
   - Add for Production, Preview, and Development
   - **Redeploy** after adding variables

4. **Push Database Schema**
   ```bash
   npm run db:push
   ```

5. **Configure Clerk**
   - Add your Vercel domain to Clerk allowed domains
   - Example: `your-app.vercel.app`

### Detailed Deployment Guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) for a complete step-by-step guide.

### Free Tier Benefits

- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Serverless functions
- ✅ Perfect for testing and small projects
